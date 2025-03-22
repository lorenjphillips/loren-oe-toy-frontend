import { Ad } from '../types/ad';
import { MedicalClassification } from '../services/classification';
import * as graphGenerator from '../services/graphGenerator';
import { configureAnalytics, createEvent } from '../services/analytics';
import { AnalyticsEventType } from '../services/analytics';
import * as medicalConceptsService from '../services/medicalConcepts';
import { 
  KnowledgeGraph, 
  Node, 
  NodeType as ModelNodeType, 
  Relationship,
  MedicalConceptNode,
  TreatmentNode
} from '../models/knowledgeGraph';
import { AnalyticsEventCategory } from '../models/analytics/AnalyticsEvent';
import { v4 as uuidv4 } from 'uuid';

// Initialize analytics
configureAnalytics({ debugMode: true });

/**
 * Graph node types
 */
export enum GraphNodeType {
  CONDITION = 'condition',
  TREATMENT = 'treatment',
  MECHANISM = 'mechanism',
  SYMPTOM = 'symptom',
  DRUG = 'drug',
  OUTCOME = 'outcome',
  COMPANY = 'company',
}

/**
 * Graph edge types
 */
export enum GraphEdgeType {
  TREATS = 'treats',
  CAUSES = 'causes',
  INDICATES = 'indicates',
  PRODUCES = 'produces',
  INTERACTS = 'interacts',
  BELONGS_TO = 'belongs_to',
}

/**
 * Graph node structure
 */
export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  description?: string;
  properties?: Record<string, any>;
  size?: number;
  color?: string;
  highlighted?: boolean;
  advertisementTarget?: boolean;
}

/**
 * Graph edge structure
 */
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  label: string;
  properties?: Record<string, any>;
  thickness?: number;
  highlighted?: boolean;
}

/**
 * Knowledge graph configuration
 */
export interface KnowledgeGraphConfig {
  interactive: boolean;
  focusOnRelationships: boolean;
  highlightedNodeTypes?: GraphNodeType[];
  includeSecondaryConnections?: boolean;
  layoutType?: 'force' | 'radial' | 'hierarchical';
  showLabels?: boolean;
  maxNodes?: number;
}

/**
 * Response from the knowledge graph controller
 */
export interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centralNodeId: string;
  config: KnowledgeGraphConfig;
  focusAreas?: string[];
  isError?: boolean;
  errorMessage?: string;
}

interface GraphGenerationResult {
  id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Controller for handling knowledge graph ad experiences
 */
class KnowledgeGraphController {
  /**
   * Generate a knowledge graph experience based on the question and ad data
   */
  async generateGraph(
    question: string,
    classification: MedicalClassification,
    adData?: Ad,
    config?: Partial<KnowledgeGraphConfig>
  ): Promise<KnowledgeGraphResponse> {
    const startTime = Date.now();
    
    try {
      // 1. Extract medical concepts from the question
      const concepts = await this.extractRelevantConcepts(question, classification);
      
      // 2. Determine focus areas/types of nodes to highlight
      const focusAreas = this.determineFocusAreas(concepts, classification);
      
      // 3. Generate the initial graph
      const { nodes, edges, centralNode } = await this.buildInitialGraph(
        concepts, 
        focusAreas,
        adData,
        config
      );
      
      // 4. Enhance the graph with advertiser information if available
      const enhancedGraph = adData 
        ? await this.enhanceGraphWithAdvertiserData(nodes, edges, adData, centralNode)
        : { nodes, edges, id: uuidv4() }; // Add an id to the graph
      
      // 5. Prepare final configuration
      const finalConfig: KnowledgeGraphConfig = {
        interactive: config?.interactive ?? true,
        focusOnRelationships: config?.focusOnRelationships ?? true,
        highlightedNodeTypes: config?.highlightedNodeTypes ?? this.getDefaultHighlightedTypes(focusAreas),
        includeSecondaryConnections: config?.includeSecondaryConnections ?? true,
        layoutType: config?.layoutType ?? 'force',
        showLabels: config?.showLabels ?? true,
        maxNodes: config?.maxNodes ?? 20,
      };
      
      // 6. Log for analytics
      const analyticsEvent = createEvent(
        AnalyticsEventType.KNOWLEDGE_NODE_EXPLORE,
        {
          metadata: {
            graphId: enhancedGraph.id,
            conceptCount: concepts.length,
            nodeCount: enhancedGraph.nodes.length,
            edgeCount: enhancedGraph.edges.length,
            generationTimeMs: Date.now() - startTime
          }
        }
      );
      
      // 7. Return the complete response
      return {
        nodes: enhancedGraph.nodes,
        edges: enhancedGraph.edges,
        centralNodeId: centralNode.id,
        config: finalConfig,
        focusAreas,
      };
      
    } catch (error) {
      console.error('Error generating knowledge graph:', error);
      return {
        nodes: [],
        edges: [],
        centralNodeId: '',
        config: {
          interactive: false,
          focusOnRelationships: false,
        },
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Extract relevant medical concepts from the question
   */
  private async extractRelevantConcepts(
    question: string,
    classification: MedicalClassification
  ): Promise<string[]> {
    try {
      // Use medicalConcepts service to extract structured concepts
      const extractedConcepts = await medicalConceptsService.searchMedicalConcepts({
        query: question,
        limit: 10
      });
      
      // Combine with classification data
      const allConcepts = new Set([
        ...extractedConcepts.concepts.map((c: MedicalConceptNode | TreatmentNode) => c.label),
        ...(classification.categories || []),
      ]);
      
      return Array.from(allConcepts);
    } catch (error) {
      console.warn('Failed to extract medical concepts, using fallback extraction');
      
      // Fallback to simple keyword extraction
      const simpleKeywords = question.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(word => word.length > 3);
        
      return Array.from(new Set(simpleKeywords));
    }
  }
  
  /**
   * Determine focus areas based on concepts and classification
   */
  private determineFocusAreas(
    concepts: string[],
    classification: MedicalClassification
  ): string[] {
    // Common focus areas in knowledge graphs
    const possibleFocusAreas = [
      'mechanism',
      'relationship',
      'interaction',
      'effect',
      'cause',
      'treatment',
      'diagnosis'
    ];
    
    // Look for focus areas in concepts and classification
    const matchedAreas = possibleFocusAreas.filter(area => 
      concepts.some(c => c.includes(area)) || 
      (classification.categories || []).some(c => c.includes(area))
    );
    
    // If we found specific areas, use them. Otherwise default to relationships
    return matchedAreas.length > 0 
      ? matchedAreas 
      : ['relationship', 'mechanism'];
  }
  
  /**
   * Get default node types to highlight based on focus areas
   */
  private getDefaultHighlightedTypes(focusAreas: string[]): GraphNodeType[] {
    const mapping: Record<string, GraphNodeType[]> = {
      'mechanism': [GraphNodeType.MECHANISM, GraphNodeType.DRUG],
      'relationship': [GraphNodeType.CONDITION, GraphNodeType.TREATMENT],
      'interaction': [GraphNodeType.DRUG, GraphNodeType.OUTCOME],
      'effect': [GraphNodeType.TREATMENT, GraphNodeType.OUTCOME],
      'cause': [GraphNodeType.CONDITION, GraphNodeType.SYMPTOM],
      'treatment': [GraphNodeType.TREATMENT, GraphNodeType.DRUG],
      'diagnosis': [GraphNodeType.SYMPTOM, GraphNodeType.CONDITION],
    };
    
    // Combine all relevant highlighted types
    const highlightedTypes = new Set<GraphNodeType>();
    
    for (const area of focusAreas) {
      const types = mapping[area] || [];
      types.forEach(type => highlightedTypes.add(type));
    }
    
    return Array.from(highlightedTypes);
  }
  
  /**
   * Build the initial knowledge graph
   */
  private async buildInitialGraph(
    concepts: string[],
    focusAreas: string[],
    adData?: Ad,
    config?: Partial<KnowledgeGraphConfig>,
  ): Promise<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    centralNode: GraphNode;
  }> {
    // Create a mock classification object if needed for graph generator
    const mockClassification: MedicalClassification = {
      primaryCategory: { id: "general", name: "General Medical", confidence: 0.9 },
      subcategory: { id: "general_inquiry", name: "General Medical Inquiry", confidence: 0.8 },
      categories: concepts,
      keywords: concepts
    };
    
    // Use the graph generator service to create the initial graph
    const graphData = await graphGenerator.generateKnowledgeGraph(
      concepts.join(" "),
      mockClassification,
      {
        maxNodes: 20,
        includeRelatedConcepts: true
      }
    );
    
    // Convert the knowledge graph model to our GraphNode/GraphEdge format
    const nodes: GraphNode[] = graphData.nodes.map(node => ({
      id: node.id,
      type: this.mapNodeType(node.type),
      label: node.label,
      description: node.description,
      properties: {
        relevanceScore: node.relevanceScore,
        ...('pharmaAffiliations' in node ? { pharmaAffiliations: node.pharmaAffiliations } : {})
      }
    }));
    
    // Create edges from relationships
    const edges: GraphEdge[] = graphData.relationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: this.mapRelationshipType(rel.type),
      label: rel.type.toLowerCase().replace('_', ' '),
      properties: {
        description: rel.description,
        evidenceStrength: rel.evidenceStrength,
        weight: rel.weight
      }
    }));
    
    // Set the central node (main topic of the graph)
    const centralNode = nodes[0];
    if (centralNode) {
      centralNode.size = 1.5; // Make it bigger
    }
    
    return {
      nodes,
      edges,
      centralNode,
    };
  }
  
  /**
   * Map model node types to graph node types
   */
  private mapNodeType(modelType: ModelNodeType): GraphNodeType {
    const mapping: Record<ModelNodeType, GraphNodeType> = {
      [ModelNodeType.MEDICAL_CONCEPT]: GraphNodeType.MECHANISM,
      [ModelNodeType.TREATMENT]: GraphNodeType.TREATMENT,
      [ModelNodeType.SYMPTOM]: GraphNodeType.SYMPTOM,
      [ModelNodeType.CONDITION]: GraphNodeType.CONDITION,
      [ModelNodeType.DRUG]: GraphNodeType.DRUG,
      [ModelNodeType.BIOMARKER]: GraphNodeType.OUTCOME
    };
    
    return mapping[modelType] || GraphNodeType.MECHANISM;
  }
  
  /**
   * Map relationship types to edge types
   */
  private mapRelationshipType(relType: string): GraphEdgeType {
    switch(relType) {
      case 'TREATS': return GraphEdgeType.TREATS;
      case 'CAUSES': return GraphEdgeType.CAUSES;
      case 'INDICATES': return GraphEdgeType.INDICATES;
      case 'INTERACTS_WITH': return GraphEdgeType.INTERACTS;
      case 'BELONGS_TO': return GraphEdgeType.BELONGS_TO;
      default: return GraphEdgeType.INDICATES;
    }
  }
  
  /**
   * Enhance graph with advertiser data
   */
  private async enhanceGraphWithAdvertiserData(
    nodes: GraphNode[],
    edges: GraphEdge[],
    adData: Ad,
    centralNode: GraphNode
  ): Promise<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    id: string; // Add id to the result
  }> {
    // Create a node for the advertised treatment
    const adNodeId = `ad_${adData.id}`;
    const adNode: GraphNode = {
      id: adNodeId,
      type: GraphNodeType.TREATMENT,
      label: adData.title,
      description: adData.body,
      highlighted: true,
      advertisementTarget: true,
      color: '#1976d2', // Highlight color
      size: 1.2, // Slightly larger
    };
    
    // Create a company node for the advertiser
    const companyNodeId = `company_${adData.advertiser.replace(/\s+/g, '_')}`;
    const companyNode: GraphNode = {
      id: companyNodeId,
      type: GraphNodeType.COMPANY,
      label: adData.advertiser,
      description: `Developer of ${adData.title}`,
      color: '#e0e0e0',
    };
    
    // Create edges
    const treatsEdge: GraphEdge = {
      id: `edge_treats_${Date.now()}`,
      source: adNodeId,
      target: centralNode.id,
      type: GraphEdgeType.TREATS,
      label: 'treats',
      highlighted: true,
      thickness: 2,
    };
    
    const belongsToEdge: GraphEdge = {
      id: `edge_belongs_${Date.now()}`,
      source: adNodeId,
      target: companyNodeId,
      type: GraphEdgeType.BELONGS_TO,
      label: 'developed by',
      thickness: 1,
    };
    
    // Combine everything with a generated id
    return {
      nodes: [...nodes, adNode, companyNode],
      edges: [...edges, treatsEdge, belongsToEdge],
      id: uuidv4(), // Generate an ID for the graph
    };
  }
  
  /**
   * Handle user interaction with the graph
   */
  async handleInteraction(
    interactionType: string,
    nodeId?: string,
    edgeId?: string,
    data?: any
  ): Promise<any> {
    try {
      // Track the interaction
      trackGraphInteraction(nodeId || null, edgeId || null, interactionType);
      
      // Handle different interaction types
      switch (interactionType) {
        case 'node_click':
          if (nodeId) {
            // Could load additional information about the clicked node
            return { 
              acknowledged: true,
              nodeDetails: await this.getNodeDetails(nodeId)
            };
          }
          return { acknowledged: true };
          
        case 'edge_click':
          if (edgeId) {
            // Could load additional information about the relationship
            return { 
              acknowledged: true,
              relationshipDetails: await this.getEdgeDetails(edgeId)
            };
          }
          return { acknowledged: true };
          
        case 'graph_expand':
          if (nodeId) {
            // Could expand the graph around this node
            const expansion = await this.expandGraphAroundNode(nodeId);
            return {
              acknowledged: true,
              newNodes: expansion.nodes,
              newEdges: expansion.edges,
            };
          }
          return { acknowledged: false, reason: 'No node specified' };
          
        default:
          return { acknowledged: false };
      }
    } catch (error) {
      console.error('Error handling graph interaction:', error);
      return { 
        acknowledged: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get detailed information about a node
   */
  private async getNodeDetails(nodeId: string): Promise<Record<string, any>> {
    // In a real implementation, this would fetch details from a medical knowledge base
    return {
      id: nodeId,
      detail: 'Additional information would be loaded here',
      references: [
        { source: 'Medical Literature Database', citation: 'Example citation (2023)' }
      ]
    };
  }
  
  /**
   * Get detailed information about an edge/relationship
   */
  private async getEdgeDetails(edgeId: string): Promise<Record<string, any>> {
    // In a real implementation, this would fetch relationship details
    return {
      id: edgeId,
      detail: 'Information about this relationship would be loaded here',
      confidence: 0.87,
      references: [
        { source: 'Clinical Research Database', citation: 'Example citation (2023)' }
      ]
    };
  }
  
  /**
   * Expand the graph around a specific node
   */
  private async expandGraphAroundNode(nodeId: string): Promise<{
    nodes: GraphNode[];
    edges: GraphEdge[];
  }> {
    // This would typically call the graph generator to expand the graph
    // For this example, we'll return mock data
    const newNode: GraphNode = {
      id: `expanded_${Date.now()}`,
      type: GraphNodeType.MECHANISM,
      label: 'Related Mechanism',
      description: 'A mechanism related to the selected node',
    };
    
    const newEdge: GraphEdge = {
      id: `new_edge_${Date.now()}`,
      source: nodeId,
      target: newNode.id,
      type: GraphEdgeType.CAUSES,
      label: 'related to',
    };
    
    return {
      nodes: [newNode],
      edges: [newEdge]
    };
  }
}

// Export singleton instance
const knowledgeGraphController = new KnowledgeGraphController();
export default knowledgeGraphController;

/**
 * Track user interactions with the knowledge graph
 */
function trackGraphInteraction(nodeId: string | null, edgeId: string | null, interactionType: string): void {
  try {
    const event = createEvent(
      AnalyticsEventType.KNOWLEDGE_NODE_EXPLORE,
      {
        metadata: {
          nodeId,
          edgeId,
          interactionType,
          timestamp: Date.now()
        }
      }
    );
    
    // In a real implementation, dispatch event to analytics service
    console.log('Graph interaction tracked:', event);
  } catch (error) {
    console.error('Error tracking graph interaction:', error);
  }
} 