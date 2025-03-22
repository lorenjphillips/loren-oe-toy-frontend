/**
 * Medical Concepts Data Service
 * 
 * Provides structured medical concept data including relationships
 * between concepts, treatments, and outcomes along with evidence strength
 * and pharmaceutical company affiliations.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  KnowledgeGraph, 
  Node, 
  MedicalConceptNode, 
  TreatmentNode, 
  NodeType, 
  Relationship, 
  RelationshipType, 
  EvidenceStrength,
  PharmaAffiliation,
  Citation,
  PharmaCompany
} from '../models/knowledgeGraph';

/**
 * Interface for medical concept search options
 */
export interface MedicalConceptSearchOptions {
  query?: string;
  nodeTypes?: NodeType[];
  categories?: string[];
  limit?: number;
  includeRelationships?: boolean;
  pharmaCompanies?: string[];
  minEvidenceStrength?: EvidenceStrength;
}

// Mock database of pharma companies
const PHARMA_COMPANIES: PharmaCompany[] = [
  {
    id: 'pfizer',
    name: 'Pfizer',
    website: 'https://www.pfizer.com',
    logoUrl: '/images/pharma/pfizer-logo.png'
  },
  {
    id: 'roche',
    name: 'Roche',
    website: 'https://www.roche.com',
    logoUrl: '/images/pharma/roche-logo.png'
  },
  {
    id: 'novartis',
    name: 'Novartis',
    website: 'https://www.novartis.com',
    logoUrl: '/images/pharma/novartis-logo.png'
  },
  {
    id: 'merck',
    name: 'Merck',
    website: 'https://www.merck.com',
    logoUrl: '/images/pharma/merck-logo.png'
  },
  {
    id: 'jnj',
    name: 'Johnson & Johnson',
    website: 'https://www.jnj.com',
    logoUrl: '/images/pharma/jnj-logo.png'
  },
  {
    id: 'astrazeneca',
    name: 'AstraZeneca',
    website: 'https://www.astrazeneca.com',
    logoUrl: '/images/pharma/astrazeneca-logo.png'
  }
];

// Sample citations for evidence
const SAMPLE_CITATIONS: Citation[] = [
  {
    sourceId: 'pmid_12345678',
    title: 'Efficacy of Treatment X for Condition Y: A Randomized Controlled Trial',
    authors: ['Smith J', 'Johnson A', 'Williams B'],
    publicationDate: '2021-03-15',
    journal: 'New England Journal of Medicine',
    doi: '10.1056/NEJMoa123456',
    url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa123456',
    credibilityScore: 92,
    peerReviewed: true
  },
  {
    sourceId: 'pmid_23456789',
    title: 'Meta-analysis of Biomarker Z in Cardiovascular Disease',
    authors: ['Brown K', 'Davis L', 'Miller R'],
    publicationDate: '2020-07-22',
    journal: 'JAMA',
    doi: '10.1001/jama.2020.12345',
    url: 'https://jamanetwork.com/journals/jama/fullarticle/2767246',
    credibilityScore: 88,
    peerReviewed: true
  },
  {
    sourceId: 'pmid_34567890',
    title: 'Long-term Outcomes of Drug A in Rheumatoid Arthritis Treatment',
    authors: ['Lee S', 'Garcia M', 'Thompson P'],
    publicationDate: '2022-01-10',
    journal: 'The Lancet',
    doi: '10.1016/S0140-6736(22)12345-6',
    url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)12345-6',
    credibilityScore: 95,
    peerReviewed: true
  }
];

// Database of medical concepts (conditions, symptoms, etc.)
const MEDICAL_CONCEPTS: MedicalConceptNode[] = [
  {
    id: 'diabetes_t2',
    type: NodeType.CONDITION,
    label: 'Type 2 Diabetes',
    description: 'A chronic condition affecting how the body processes blood sugar (glucose).',
    aliases: ['T2DM', 'Adult-onset diabetes', 'Non-insulin-dependent diabetes mellitus'],
    taxonomyIds: { 'ICD10': 'E11', 'SNOMED': '44054006' },
    relevanceScore: 95,
    prevalence: 8.5,
    severity: 75
  },
  {
    id: 'hypertension',
    type: NodeType.CONDITION,
    label: 'Hypertension',
    description: 'High blood pressure, a common condition where blood flows through blood vessels with greater force than normal.',
    aliases: ['High blood pressure', 'HTN'],
    taxonomyIds: { 'ICD10': 'I10', 'SNOMED': '38341003' },
    relevanceScore: 92,
    prevalence: 29,
    severity: 70
  },
  {
    id: 'asthma',
    type: NodeType.CONDITION,
    label: 'Asthma',
    description: 'A condition in which airways narrow and swell and may produce extra mucus.',
    aliases: ['Bronchial asthma'],
    taxonomyIds: { 'ICD10': 'J45', 'SNOMED': '195967001' },
    relevanceScore: 88,
    prevalence: 8,
    severity: 65
  },
  {
    id: 'hyperlipidemia',
    type: NodeType.CONDITION,
    label: 'Hyperlipidemia',
    description: 'Elevated levels of lipids (fats) in the blood, including cholesterol and triglycerides.',
    aliases: ['High cholesterol', 'Dyslipidemia'],
    taxonomyIds: { 'ICD10': 'E78.5', 'SNOMED': '55822004' },
    relevanceScore: 85,
    prevalence: 36,
    severity: 60
  },
  {
    id: 'hemoglobin_a1c',
    type: NodeType.BIOMARKER,
    label: 'Hemoglobin A1c',
    description: 'A blood test that measures average blood glucose levels over the past 2-3 months.',
    aliases: ['HbA1c', 'Glycated hemoglobin', 'A1C'],
    taxonomyIds: { 'LOINC': '4548-4' },
    relevanceScore: 90
  },
  {
    id: 'blood_pressure',
    type: NodeType.BIOMARKER,
    label: 'Blood Pressure',
    description: 'The pressure of circulating blood against the walls of blood vessels.',
    aliases: ['BP'],
    taxonomyIds: { 'LOINC': '85354-9' },
    relevanceScore: 88
  }
];

// Database of treatments (drugs, therapies, etc.)
const TREATMENTS: TreatmentNode[] = [
  {
    id: 'metformin',
    type: NodeType.DRUG,
    label: 'Metformin',
    description: 'First-line medication for the treatment of type 2 diabetes, particularly in people who are overweight.',
    taxonomyIds: { 'RxNorm': '6809', 'ATC': 'A10BA02' },
    relevanceScore: 93,
    pharmaAffiliations: [
      {
        companyId: 'merck',
        companyName: 'Merck',
        relationshipType: 'MANUFACTURER',
        productName: 'Glucophage'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1995-03-03',
    mechanism: 'Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity',
    averageCost: 10,
    patientEligibility: ['Adult patients with type 2 diabetes', 'Some prediabetic patients']
  },
  {
    id: 'lisinopril',
    type: NodeType.DRUG,
    label: 'Lisinopril',
    description: 'ACE inhibitor used to treat high blood pressure and heart failure.',
    taxonomyIds: { 'RxNorm': '29046', 'ATC': 'C09AA03' },
    relevanceScore: 89,
    pharmaAffiliations: [
      {
        companyId: 'astrazeneca',
        companyName: 'AstraZeneca',
        relationshipType: 'MANUFACTURER',
        productName: 'Zestril'
      },
      {
        companyId: 'merck',
        companyName: 'Merck',
        relationshipType: 'MANUFACTURER',
        productName: 'Prinivil'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1987-12-29',
    mechanism: 'Inhibits ACE, leading to decreased formation of angiotensin II and decreased breakdown of bradykinin',
    averageCost: 15,
    patientEligibility: ['Adult patients with hypertension', 'Patients with heart failure', 'Some post-MI patients']
  },
  {
    id: 'albuterol',
    type: NodeType.DRUG,
    label: 'Albuterol',
    description: 'A bronchodilator that relaxes muscles in the airways and increases air flow to the lungs.',
    taxonomyIds: { 'RxNorm': '435', 'ATC': 'R03AC02' },
    relevanceScore: 87,
    pharmaAffiliations: [
      {
        companyId: 'gsk',
        companyName: 'GlaxoSmithKline',
        relationshipType: 'MANUFACTURER',
        productName: 'Ventolin'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1981-05-01',
    mechanism: 'Selective beta2-adrenergic agonist causing bronchodilation',
    averageCost: 25,
    patientEligibility: ['Patients with asthma', 'Patients with COPD']
  },
  {
    id: 'atorvastatin',
    type: NodeType.DRUG,
    label: 'Atorvastatin',
    description: 'Statin medication used to prevent cardiovascular disease and treat abnormal lipid levels.',
    taxonomyIds: { 'RxNorm': '83367', 'ATC': 'C10AA05' },
    relevanceScore: 91,
    pharmaAffiliations: [
      {
        companyId: 'pfizer',
        companyName: 'Pfizer',
        relationshipType: 'MANUFACTURER',
        productName: 'Lipitor'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1996-12-17',
    mechanism: 'HMG-CoA reductase inhibitor that lowers production of cholesterol in the liver',
    averageCost: 20,
    patientEligibility: ['Adult patients with hyperlipidemia', 'Patients at risk of cardiovascular disease']
  },
  {
    id: 'lifestyle_modification',
    type: NodeType.TREATMENT,
    label: 'Lifestyle Modification',
    description: 'Non-pharmacological interventions including diet, exercise, and behavioral changes.',
    relevanceScore: 85,
    pharmaAffiliations: [],
    approvalStatus: 'FDA_APPROVED',
    patientEligibility: ['All patients']
  }
];

// Database of relationships between concepts and treatments
const RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel_metformin_diabetes',
    source: 'metformin',
    target: 'diabetes_t2',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Metformin is first-line therapy for type 2 diabetes.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[0]],
    weight: 95
  },
  {
    id: 'rel_metformin_a1c',
    source: 'metformin',
    target: 'hemoglobin_a1c',
    type: RelationshipType.INDICATES,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Hemoglobin A1c is used to monitor effectiveness of metformin therapy.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[0], SAMPLE_CITATIONS[1]],
    weight: 90
  },
  {
    id: 'rel_lisinopril_hypertension',
    source: 'lisinopril',
    target: 'hypertension',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Lisinopril effectively reduces blood pressure in hypertensive patients.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[2]],
    weight: 92
  },
  {
    id: 'rel_lisinopril_blood_pressure',
    source: 'lisinopril',
    target: 'blood_pressure',
    type: RelationshipType.INDICATES,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Blood pressure measurements are used to monitor effectiveness of lisinopril therapy.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[1]],
    weight: 90
  },
  {
    id: 'rel_albuterol_asthma',
    source: 'albuterol',
    target: 'asthma',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Albuterol is used as a rescue medication for acute asthma symptoms.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[2]],
    weight: 88
  },
  {
    id: 'rel_atorvastatin_hyperlipidemia',
    source: 'atorvastatin',
    target: 'hyperlipidemia',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Atorvastatin effectively reduces cholesterol levels in patients with hyperlipidemia.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[1]],
    weight: 93
  },
  {
    id: 'rel_lifestyle_diabetes',
    source: 'lifestyle_modification',
    target: 'diabetes_t2',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'Lifestyle modifications including diet and exercise can help manage type 2 diabetes.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[0]],
    weight: 80
  },
  {
    id: 'rel_lifestyle_hypertension',
    source: 'lifestyle_modification',
    target: 'hypertension',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'Lifestyle modifications including diet, exercise, and sodium restriction can help manage hypertension.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[2]],
    weight: 78
  },
  {
    id: 'rel_lifestyle_hyperlipidemia',
    source: 'lifestyle_modification',
    target: 'hyperlipidemia',
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'Lifestyle modifications including diet and exercise can help manage hyperlipidemia.',
    bidirectional: false,
    citations: [SAMPLE_CITATIONS[1]],
    weight: 75
  },
  {
    id: 'rel_diabetes_hypertension',
    source: 'diabetes_t2',
    target: 'hypertension',
    type: RelationshipType.RELATED_TO,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Diabetes and hypertension frequently co-occur and share risk factors.',
    bidirectional: true,
    citations: [SAMPLE_CITATIONS[0], SAMPLE_CITATIONS[1]],
    weight: 85
  }
];

/**
 * Get all medical concepts
 */
export function getAllMedicalConcepts(): MedicalConceptNode[] {
  return [...MEDICAL_CONCEPTS];
}

/**
 * Get all treatments
 */
export function getAllTreatments(): TreatmentNode[] {
  return [...TREATMENTS];
}

/**
 * Get all relationships
 */
export function getAllRelationships(): Relationship[] {
  return [...RELATIONSHIPS];
}

/**
 * Search for medical concepts by various criteria
 */
export function searchMedicalConcepts(options: MedicalConceptSearchOptions = {}): {
  concepts: (MedicalConceptNode | TreatmentNode)[],
  relationships?: Relationship[]
} {
  let filteredConcepts: (MedicalConceptNode | TreatmentNode)[] = [
    ...MEDICAL_CONCEPTS,
    ...(options.nodeTypes?.includes(NodeType.TREATMENT) || 
       options.nodeTypes?.includes(NodeType.DRUG) || 
       !options.nodeTypes ? TREATMENTS : [])
  ];
  
  // Filter by node types if specified
  if (options.nodeTypes && options.nodeTypes.length > 0) {
    filteredConcepts = filteredConcepts.filter(concept => 
      options.nodeTypes!.includes(concept.type)
    );
  }
  
  // Filter by search query if specified
  if (options.query) {
    const queryLower = options.query.toLowerCase();
    filteredConcepts = filteredConcepts.filter(concept => 
      concept.label.toLowerCase().includes(queryLower) ||
      concept.description.toLowerCase().includes(queryLower) ||
      concept.aliases?.some(alias => alias.toLowerCase().includes(queryLower))
    );
  }
  
  // Filter by pharma companies if specified
  if (options.pharmaCompanies && options.pharmaCompanies.length > 0) {
    filteredConcepts = filteredConcepts.filter(concept => {
      if ('pharmaAffiliations' in concept) {
        return concept.pharmaAffiliations.some(
          affiliation => options.pharmaCompanies!.includes(affiliation.companyId)
        );
      }
      return false;
    });
  }
  
  // Sort by relevance score (highest first)
  filteredConcepts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  
  // Limit results if specified
  if (options.limit && options.limit > 0) {
    filteredConcepts = filteredConcepts.slice(0, options.limit);
  }
  
  // Include relationships if requested
  if (options.includeRelationships) {
    const conceptIds = new Set(filteredConcepts.map(c => c.id));
    
    let filteredRelationships = RELATIONSHIPS.filter(rel =>
      conceptIds.has(rel.source) || conceptIds.has(rel.target)
    );
    
    // Filter relationships by evidence strength if specified
    if (options.minEvidenceStrength) {
      const strengthOrder = Object.values(EvidenceStrength);
      const minIndex = strengthOrder.indexOf(options.minEvidenceStrength);
      
      filteredRelationships = filteredRelationships.filter(rel =>
        strengthOrder.indexOf(rel.evidenceStrength) <= minIndex
      );
    }
    
    return {
      concepts: filteredConcepts,
      relationships: filteredRelationships
    };
  }
  
  return { concepts: filteredConcepts };
}

/**
 * Get treatments for a specific medical concept
 */
export function getTreatmentsForConcept(
  conceptId: string,
  minEvidenceStrength?: EvidenceStrength
): {
  concept: MedicalConceptNode | null,
  treatments: TreatmentNode[],
  relationships: Relationship[]
} {
  const concept = MEDICAL_CONCEPTS.find(c => c.id === conceptId) || null;
  
  if (!concept) {
    return { concept: null, treatments: [], relationships: [] };
  }
  
  let relevantRelationships = RELATIONSHIPS.filter(rel => 
    rel.target === conceptId && 
    rel.type === RelationshipType.TREATS
  );
  
  // Filter by evidence strength if specified
  if (minEvidenceStrength) {
    const strengthOrder = Object.values(EvidenceStrength);
    const minIndex = strengthOrder.indexOf(minEvidenceStrength);
    
    relevantRelationships = relevantRelationships.filter(rel =>
      strengthOrder.indexOf(rel.evidenceStrength) <= minIndex
    );
  }
  
  // Get treatment IDs from the relationships
  const treatmentIds = new Set(relevantRelationships.map(rel => rel.source));
  
  // Get the actual treatment nodes
  const treatments = TREATMENTS.filter(treatment => 
    treatmentIds.has(treatment.id)
  );
  
  return {
    concept,
    treatments,
    relationships: relevantRelationships
  };
}

/**
 * Build a complete knowledge graph
 */
export function buildCompleteKnowledgeGraph(): KnowledgeGraph {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    name: 'Complete Medical Knowledge Graph',
    description: 'Comprehensive graph of medical concepts, treatments, and relationships',
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
    nodes: [...MEDICAL_CONCEPTS, ...TREATMENTS],
    relationships: RELATIONSHIPS,
    focusAreas: ['Cardiology', 'Endocrinology', 'Pulmonology'],
    pharmaCompanies: PHARMA_COMPANIES.map(company => company.id),
    metadata: {
      nodeCount: MEDICAL_CONCEPTS.length + TREATMENTS.length,
      relationshipCount: RELATIONSHIPS.length
    }
  };
}

/**
 * Get a knowledge graph related to a specific concept
 */
export function getConceptKnowledgeGraph(
  conceptId: string,
  options: {
    includeRelatedConcepts?: boolean,
    maxDepth?: number,
    minEvidenceStrength?: EvidenceStrength
  } = {}
): KnowledgeGraph | null {
  // Set defaults
  const maxDepth = options.maxDepth || 2;
  
  // Find the central concept
  const centralConcept = [...MEDICAL_CONCEPTS, ...TREATMENTS].find(n => n.id === conceptId);
  
  if (!centralConcept) {
    return null;
  }
  
  // Collect nodes and relationships starting from the central concept
  const nodeIds = new Set<string>([conceptId]);
  const nodeDepths = new Map<string, number>();
  nodeDepths.set(conceptId, 0);
  
  const includedRelationships: Relationship[] = [];
  
  // BFS to find related nodes within depth limit
  let currentDepth = 0;
  let currentDepthNodes = [conceptId];
  
  while (currentDepth < maxDepth && currentDepthNodes.length > 0) {
    const nextDepthNodes: string[] = [];
    
    for (const nodeId of currentDepthNodes) {
      // Find all relationships involving this node
      const nodeRelationships = RELATIONSHIPS.filter(rel => 
        rel.source === nodeId || rel.target === nodeId
      );
      
      // Filter by evidence strength if specified
      let filteredRelationships = nodeRelationships;
      if (options.minEvidenceStrength) {
        const strengthOrder = Object.values(EvidenceStrength);
        const minIndex = strengthOrder.indexOf(options.minEvidenceStrength);
        
        filteredRelationships = filteredRelationships.filter(rel =>
          strengthOrder.indexOf(rel.evidenceStrength) <= minIndex
        );
      }
      
      for (const rel of filteredRelationships) {
        // Skip concept-to-concept relationships if not requested
        if (!options.includeRelatedConcepts) {
          const source = [...MEDICAL_CONCEPTS, ...TREATMENTS].find(n => n.id === rel.source);
          const target = [...MEDICAL_CONCEPTS, ...TREATMENTS].find(n => n.id === rel.target);
          
          if (source && target && 
              source.type !== NodeType.TREATMENT && source.type !== NodeType.DRUG &&
              target.type !== NodeType.TREATMENT && target.type !== NodeType.DRUG) {
            continue;
          }
        }
        
        includedRelationships.push(rel);
        
        // Add the other node in the relationship
        const otherNodeId = rel.source === nodeId ? rel.target : rel.source;
        
        if (!nodeIds.has(otherNodeId)) {
          nodeIds.add(otherNodeId);
          nodeDepths.set(otherNodeId, currentDepth + 1);
          nextDepthNodes.push(otherNodeId);
        }
      }
    }
    
    currentDepthNodes = nextDepthNodes;
    currentDepth++;
  }
  
  // Get the actual nodes
  const includedNodes = [...MEDICAL_CONCEPTS, ...TREATMENTS].filter(node => 
    nodeIds.has(node.id)
  );
  
  // Get pharma companies involved
  const pharmaCompanies = new Set<string>();
  includedNodes.forEach(node => {
    if ('pharmaAffiliations' in node) {
      node.pharmaAffiliations.forEach(aff => {
        pharmaCompanies.add(aff.companyId);
      });
    }
  });
  
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    name: `Knowledge Graph for ${centralConcept.label}`,
    description: `Knowledge graph centered on ${centralConcept.label} with depth ${maxDepth}`,
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
    nodes: includedNodes,
    relationships: includedRelationships,
    focusAreas: [centralConcept.type === NodeType.CONDITION ? centralConcept.label : ''],
    pharmaCompanies: Array.from(pharmaCompanies),
    metadata: {
      centralConceptId: conceptId,
      maxDepth: maxDepth,
      nodeCount: includedNodes.length,
      relationshipCount: includedRelationships.length
    }
  };
}

/**
 * Find medical concepts related to a specific treatment
 */
export function getMedicalConceptsForTreatment(
  treatmentId: string,
  minEvidenceStrength?: EvidenceStrength
): {
  treatment: TreatmentNode | null,
  concepts: MedicalConceptNode[],
  relationships: Relationship[]
} {
  const treatment = TREATMENTS.find(t => t.id === treatmentId) || null;
  
  if (!treatment) {
    return { treatment: null, concepts: [], relationships: [] };
  }
  
  let relevantRelationships = RELATIONSHIPS.filter(rel => 
    rel.source === treatmentId && 
    rel.type === RelationshipType.TREATS
  );
  
  // Filter by evidence strength if specified
  if (minEvidenceStrength) {
    const strengthOrder = Object.values(EvidenceStrength);
    const minIndex = strengthOrder.indexOf(minEvidenceStrength);
    
    relevantRelationships = relevantRelationships.filter(rel =>
      strengthOrder.indexOf(rel.evidenceStrength) <= minIndex
    );
  }
  
  // Get concept IDs from the relationships
  const conceptIds = new Set(relevantRelationships.map(rel => rel.target));
  
  // Get the actual concept nodes
  const concepts = MEDICAL_CONCEPTS.filter(concept => 
    conceptIds.has(concept.id)
  );
  
  return {
    treatment,
    concepts,
    relationships: relevantRelationships
  };
}

/**
 * Get treatments by pharmaceutical company
 */
export function getTreatmentsByPharmaCompany(companyId: string): TreatmentNode[] {
  return TREATMENTS.filter(treatment => 
    treatment.pharmaAffiliations.some(aff => aff.companyId === companyId)
  );
}

/**
 * Get pharma company by ID
 */
export function getPharmaCompany(companyId: string): PharmaCompany | undefined {
  return PHARMA_COMPANIES.find(company => company.id === companyId);
}

/**
 * Get all pharma companies
 */
export function getAllPharmaCompanies(): PharmaCompany[] {
  return [...PHARMA_COMPANIES];
} 