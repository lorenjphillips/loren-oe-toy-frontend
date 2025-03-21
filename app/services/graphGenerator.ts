/**
 * Knowledge Graph Generator Service
 * 
 * Takes classified medical questions and builds contextually relevant
 * knowledge subgraphs focused on the question domain.
 */

import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { 
  MedicalClassification 
} from './classification';
import { 
  KnowledgeGraph, 
  Node, 
  NodeType, 
  MedicalConceptNode,
  TreatmentNode,
  Relationship,
  RelationshipType,
  EvidenceStrength,
  KnowledgeGraphFilters
} from '../models/knowledgeGraph';
import * as MedicalConceptService from './medicalConcepts';

/**
 * Options for knowledge graph generation
 */
export interface GraphGenerationOptions {
  maxNodes?: number;
  relevanceThreshold?: number;
  includeRelatedConcepts?: boolean;
  includeTreatments?: boolean;
  includePharmaInfo?: boolean;
  maxDepth?: number;
  minEvidenceStrength?: EvidenceStrength;
  highlightedPharmaCompanies?: string[];
  questionContext?: string;
}

/**
 * Default graph generation options
 */
const DEFAULT_OPTIONS: GraphGenerationOptions = {
  maxNodes: 20,
  relevanceThreshold: 40,
  includeRelatedConcepts: true,
  includeTreatments: true,
  includePharmaInfo: true,
  maxDepth: 2,
  minEvidenceStrength: EvidenceStrength.MODERATE
};

/**
 * Generate a knowledge graph based on a classified medical question
 */
export async function generateKnowledgeGraph(
  question: string,
  classification: MedicalClassification,
  options: Partial<GraphGenerationOptions> = {}
): Promise<KnowledgeGraph> {
  // Merge with default options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Extract key concepts from the classification
  const primaryCategory = classification.primaryCategory;
  const subcategory = classification.subcategory;
  const keywords = classification.keywords || [];
  const medications = classification.relevantMedications || [];
  
  // Search for medical concepts related to the classification and keywords
  const mainConcepts = MedicalConceptService.searchMedicalConcepts({
    query: subcategory.name,
    nodeTypes: [NodeType.CONDITION, NodeType.SYMPTOM, NodeType.MEDICAL_CONCEPT],
    includeRelationships: true,
    limit: 5
  });
  
  // Search for additional concepts based on keywords
  const keywordConcepts = keywords.length > 0 
    ? MedicalConceptService.searchMedicalConcepts({
        query: keywords.join(' '),
        nodeTypes: [NodeType.CONDITION, NodeType.SYMPTOM, NodeType.MEDICAL_CONCEPT, NodeType.BIOMARKER],
        includeRelationships: true,
        limit: 5
      })
    : { concepts: [], relationships: [] };
  
  // Search for medications/treatments mentioned in the question
  const medicationConcepts = medications.length > 0
    ? MedicalConceptService.searchMedicalConcepts({
        query: medications.join(' '),
        nodeTypes: [NodeType.DRUG, NodeType.TREATMENT],
        includeRelationships: true,
        limit: 5
      })
    : { concepts: [], relationships: [] };
  
  // Combine all concepts and relationships
  let allConcepts = [
    ...mainConcepts.concepts,
    ...keywordConcepts.concepts,
    ...medicationConcepts.concepts
  ];
  
  let allRelationships = [
    ...(mainConcepts.relationships || []),
    ...(keywordConcepts.relationships || []),
    ...(medicationConcepts.relationships || [])
  ];
  
  // Add treatments for relevant concepts if requested
  if (mergedOptions.includeTreatments) {
    for (const concept of allConcepts) {
      if (concept.type === NodeType.CONDITION || concept.type === NodeType.SYMPTOM) {
        const treatments = MedicalConceptService.getTreatmentsForConcept(
          concept.id,
          mergedOptions.minEvidenceStrength
        );
        
        if (treatments.treatments.length > 0) {
          // Add treatments and relationships
          allConcepts = [...allConcepts, ...treatments.treatments];
          allRelationships = [...allRelationships, ...treatments.relationships];
        }
      }
    }
  }
  
  // Highlight treatments from specific pharma companies if requested
  if (mergedOptions.highlightedPharmaCompanies && mergedOptions.highlightedPharmaCompanies.length > 0) {
    // Find treatments from highlighted pharma companies
    const highlightedTreatments = allConcepts.filter(node => {
      if ('pharmaAffiliations' in node) {
        return node.pharmaAffiliations.some(
          aff => mergedOptions.highlightedPharmaCompanies!.includes(aff.companyId)
        );
      }
      return false;
    });
    
    // Boost relevance scores for highlighted treatments
    highlightedTreatments.forEach(treatment => {
      if (treatment.relevanceScore !== undefined) {
        treatment.relevanceScore = Math.min(100, treatment.relevanceScore + 20);
      }
    });
    
    // Add custom highlighting color
    highlightedTreatments.forEach(treatment => {
      treatment.color = '#FFC107'; // Amber highlight color
    });
  }
  
  // Remove duplicates
  const uniqueConceptsMap = new Map<string, MedicalConceptNode | TreatmentNode>();
  allConcepts.forEach(concept => {
    uniqueConceptsMap.set(concept.id, concept);
  });
  
  const uniqueRelationshipsMap = new Map<string, Relationship>();
  allRelationships.forEach(rel => {
    uniqueRelationshipsMap.set(rel.id, rel);
  });
  
  // Filter out concepts below the relevance threshold
  let filteredConcepts = Array.from(uniqueConceptsMap.values())
    .filter(node => (node.relevanceScore || 0) >= mergedOptions.relevanceThreshold!);
  
  // Limit to max nodes (prioritize by relevance score)
  if (filteredConcepts.length > mergedOptions.maxNodes!) {
    filteredConcepts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    filteredConcepts = filteredConcepts.slice(0, mergedOptions.maxNodes!);
  }
  
  // Get concept IDs for filtering relationships
  const conceptIds = new Set(filteredConcepts.map(c => c.id));
  
  // Filter relationships to only those between included concepts
  const filteredRelationships = Array.from(uniqueRelationshipsMap.values())
    .filter(rel => conceptIds.has(rel.source) && conceptIds.has(rel.target));
  
  // Get pharma companies involved
  const pharmaCompanies = new Set<string>();
  filteredConcepts.forEach(node => {
    if ('pharmaAffiliations' in node) {
      node.pharmaAffiliations.forEach(aff => {
        pharmaCompanies.add(aff.companyId);
      });
    }
  });
  
  // Clean up the concept if it came from a subcategory ID
  const cleanSubcategory = subcategory.name.replace(/[-_]/g, ' ');
  
  // Create the knowledge graph
  const now = new Date().toISOString();
  const graph: KnowledgeGraph = {
    id: uuidv4(),
    name: `Knowledge Graph for ${cleanSubcategory}`,
    description: `Knowledge graph focused on ${primaryCategory.name} - ${cleanSubcategory}, generated from the question: "${question}"`,
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
    nodes: filteredConcepts,
    relationships: filteredRelationships,
    focusAreas: [primaryCategory.name, subcategory.name],
    pharmaCompanies: Array.from(pharmaCompanies),
    metadata: {
      originalQuestion: question,
      classification: {
        primaryCategory: primaryCategory.name,
        subcategory: subcategory.name,
        confidence: subcategory.confidence,
        keywords
      },
      nodeCount: filteredConcepts.length,
      relationshipCount: filteredRelationships.length,
      highlightedPharmaCompanies: mergedOptions.highlightedPharmaCompanies
    }
  };
  
  return graph;
}

/**
 * Extract key medical entities from a question text using OpenAI
 */
export async function extractMedicalEntities(question: string): Promise<{
  conditions: string[],
  treatments: string[],
  biomarkers: string[],
  symptoms: string[]
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  
  const prompt = `
Extract medical entities from the following medical question:

QUESTION: "${question}"

Please identify and categorize all medical entities in the following JSON format:
{
  "conditions": ["condition1", "condition2"],
  "treatments": ["treatment1", "treatment2"],
  "biomarkers": ["biomarker1", "biomarker2"],
  "symptoms": ["symptom1", "symptom2"]
}

Instructions:
1. Identify all mentioned medical conditions/diseases
2. Identify all mentioned treatments, medications, or procedures
3. Identify all mentioned biomarkers or lab tests
4. Identify all mentioned symptoms or clinical signs
5. Return empty arrays if a category has no entities
6. Use standard medical terminology
7. Do not include general terms like "patient" or "doctor"

Your response must be valid JSON with the exact structure shown above.
`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.1,
      max_tokens: 800,
      messages: [
        { role: 'system', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const entities = JSON.parse(content);
    return {
      conditions: entities.conditions || [],
      treatments: entities.treatments || [],
      biomarkers: entities.biomarkers || [],
      symptoms: entities.symptoms || []
    };
  } catch (error) {
    console.error('Error extracting medical entities:', error);
    return {
      conditions: [],
      treatments: [],
      biomarkers: [],
      symptoms: []
    };
  }
}

/**
 * Enhance a knowledge graph with additional context based on the question
 */
export async function enhanceGraphWithQuestionContext(
  graph: KnowledgeGraph, 
  question: string
): Promise<KnowledgeGraph> {
  try {
    // Extract medical entities from the question
    const entities = await extractMedicalEntities(question);
    
    // Find additional concepts based on extracted entities
    const conditionConcepts = entities.conditions.length > 0
      ? MedicalConceptService.searchMedicalConcepts({
          query: entities.conditions.join(' '),
          nodeTypes: [NodeType.CONDITION],
          limit: 3
        }).concepts
      : [];
    
    const treatmentConcepts = entities.treatments.length > 0
      ? MedicalConceptService.searchMedicalConcepts({
          query: entities.treatments.join(' '),
          nodeTypes: [NodeType.TREATMENT, NodeType.DRUG],
          limit: 3
        }).concepts
      : [];
    
    const biomarkerConcepts = entities.biomarkers.length > 0
      ? MedicalConceptService.searchMedicalConcepts({
          query: entities.biomarkers.join(' '),
          nodeTypes: [NodeType.BIOMARKER],
          limit: 2
        }).concepts
      : [];
    
    const symptomConcepts = entities.symptoms.length > 0
      ? MedicalConceptService.searchMedicalConcepts({
          query: entities.symptoms.join(' '),
          nodeTypes: [NodeType.SYMPTOM],
          limit: 3
        }).concepts
      : [];
    
    // Add new concepts to the graph
    const newConcepts = [
      ...conditionConcepts,
      ...treatmentConcepts,
      ...biomarkerConcepts,
      ...symptomConcepts
    ];
    
    // Create a map of existing nodes
    const existingNodesMap = new Map<string, Node>();
    graph.nodes.forEach(node => {
      existingNodesMap.set(node.id, node);
    });
    
    // Add only new nodes
    const addedNodes: (MedicalConceptNode | TreatmentNode)[] = [];
    newConcepts.forEach(concept => {
      if (!existingNodesMap.has(concept.id)) {
        addedNodes.push(concept);
      }
    });
    
    // Find relationships for new nodes
    let newRelationships: Relationship[] = [];
    if (addedNodes.length > 0) {
      const allNodeIds = new Set([
        ...graph.nodes.map(n => n.id),
        ...addedNodes.map(n => n.id)
      ]);
      
      // Get all relationships
      const allRelationships = MedicalConceptService.getAllRelationships();
      
      // Filter relationships to only those connecting our nodes
      newRelationships = allRelationships.filter(rel => 
        allNodeIds.has(rel.source) && allNodeIds.has(rel.target) &&
        !graph.relationships.some(existingRel => existingRel.id === rel.id)
      );
    }
    
    // Create the enhanced graph
    const enhancedGraph: KnowledgeGraph = {
      ...graph,
      nodes: [...graph.nodes, ...addedNodes],
      relationships: [...graph.relationships, ...newRelationships],
      metadata: {
        ...graph.metadata,
        extractedEntities: entities,
        nodeCount: graph.nodes.length + addedNodes.length,
        relationshipCount: graph.relationships.length + newRelationships.length,
        enhanced: true
      }
    };
    
    return enhancedGraph;
  } catch (error) {
    console.error('Error enhancing graph with question context:', error);
    return graph; // Return original graph if enhancement fails
  }
}

/**
 * Generate a knowledge graph for displaying during ad wait time
 */
export async function generateAdWaitKnowledgeGraph(
  question: string,
  classification: MedicalClassification,
  advertisingCompanyId?: string
): Promise<KnowledgeGraph> {
  // Options for ad wait knowledge graph
  const options: GraphGenerationOptions = {
    maxNodes: 15,
    relevanceThreshold: 50,
    includeRelatedConcepts: true,
    includeTreatments: true,
    includePharmaInfo: true,
    maxDepth: 2,
    minEvidenceStrength: EvidenceStrength.MODERATE,
    highlightedPharmaCompanies: advertisingCompanyId ? [advertisingCompanyId] : undefined
  };
  
  // Generate the base knowledge graph
  const baseGraph = await generateKnowledgeGraph(question, classification, options);
  
  // Enhance with question context
  const enhancedGraph = await enhanceGraphWithQuestionContext(baseGraph, question);
  
  // Add any additional ad-specific metadata
  enhancedGraph.metadata = {
    ...enhancedGraph.metadata,
    isAdWaitGraph: true,
    advertisingCompanyId,
    waitTimeRecommended: true
  };
  
  return enhancedGraph;
}

/**
 * Apply filters to an existing knowledge graph
 */
export function filterKnowledgeGraph(
  graph: KnowledgeGraph,
  filters: KnowledgeGraphFilters
): KnowledgeGraph {
  // Filter nodes
  let filteredNodes = [...graph.nodes];
  
  if (filters.nodeTypes && filters.nodeTypes.length > 0) {
    filteredNodes = filteredNodes.filter(node => 
      filters.nodeTypes!.includes(node.type));
  }
  
  if (filters.minRelevanceScore !== undefined) {
    filteredNodes = filteredNodes.filter(node => 
      (node.relevanceScore || 0) >= filters.minRelevanceScore!);
  }
  
  if (filters.pharmaCompanies && filters.pharmaCompanies.length > 0) {
    filteredNodes = filteredNodes.filter(node => {
      if ('pharmaAffiliations' in node) {
        return node.pharmaAffiliations.some(
          aff => filters.pharmaCompanies!.includes(aff.companyId)
        );
      }
      return true; // Keep non-treatment nodes
    });
  }
  
  // Focus on specific node with depth limit
  if (filters.focusNodeId && filters.depthLimit) {
    const nodeMap = new Map<string, number>();
    nodeMap.set(filters.focusNodeId, 0);
    
    // BFS to find nodes within depth limit
    const queue = [{ id: filters.focusNodeId, depth: 0 }];
    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      
      if (depth < filters.depthLimit) {
        // Find all relationships involving this node
        graph.relationships
          .filter(rel => rel.source === id || rel.target === id)
          .forEach(rel => {
            const neighborId = rel.source === id ? rel.target : rel.source;
            if (!nodeMap.has(neighborId)) {
              nodeMap.set(neighborId, depth + 1);
              queue.push({ id: neighborId, depth: depth + 1 });
            }
          });
      }
    }
    
    // Filter nodes based on BFS results
    filteredNodes = filteredNodes.filter(node => nodeMap.has(node.id));
  }
  
  // Get node IDs for relationship filtering
  const nodeIds = new Set(filteredNodes.map(n => n.id));
  
  // Filter relationships
  let filteredRelationships = graph.relationships.filter(rel => 
    nodeIds.has(rel.source) && nodeIds.has(rel.target));
  
  if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
    filteredRelationships = filteredRelationships.filter(rel => 
      filters.relationshipTypes!.includes(rel.type));
  }
  
  if (filters.evidenceStrengths && filters.evidenceStrengths.length > 0) {
    filteredRelationships = filteredRelationships.filter(rel => 
      filters.evidenceStrengths!.includes(rel.evidenceStrength));
  }
  
  // Limit the number of nodes if specified
  if (filters.maxNodes && filteredNodes.length > filters.maxNodes) {
    // Sort by relevance score first
    filteredNodes.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    filteredNodes = filteredNodes.slice(0, filters.maxNodes);
    
    // Adjust relationships accordingly
    const finalNodeIds = new Set(filteredNodes.map(n => n.id));
    filteredRelationships = filteredRelationships.filter(rel => 
      finalNodeIds.has(rel.source) && finalNodeIds.has(rel.target));
  }
  
  // Create a new filtered graph
  const filteredGraph: KnowledgeGraph = {
    ...graph,
    nodes: filteredNodes,
    relationships: filteredRelationships,
    metadata: {
      ...graph.metadata,
      nodeCount: filteredNodes.length,
      relationshipCount: filteredRelationships.length,
      filtered: true,
      appliedFilters: filters
    }
  };
  
  return filteredGraph;
} 