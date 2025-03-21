/**
 * Visualization Service
 * Provides D3.js powered visualization capabilities for knowledge graphs
 */

import * as d3 from 'd3';
import { 
  KnowledgeGraph, 
  Node, 
  Relationship, 
  NodeType, 
  KnowledgeGraphFilters,
  RelationshipType,
  EvidenceStrength
} from '../models/knowledgeGraph';

// D3 force simulation types
export interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  type: NodeType;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
  color?: string;
  image?: string;
  nodeData: Node;
}

export interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: D3Node | string;
  target: D3Node | string;
  type: RelationshipType;
  strength: EvidenceStrength;
  relationshipData: Relationship;
}

export interface D3Graph {
  nodes: D3Node[];
  links: D3Link[];
}

export interface SimulationOptions {
  width: number;
  height: number;
  chargeStrength?: number;
  linkDistance?: number;
  gravity?: number;
  decay?: number;
}

// Visualization service class
export class VisualizationService {
  private simulation: d3.Simulation<D3Node, D3Link> | null = null;
  private graph: D3Graph = { nodes: [], links: [] };
  private options: SimulationOptions;
  
  constructor(options: SimulationOptions) {
    this.options = {
      ...options,
      chargeStrength: options.chargeStrength || -300,
      linkDistance: options.linkDistance || 100,
      gravity: options.gravity || 0.1,
      decay: options.decay || 0.03
    };
  }

  /**
   * Creates a D3 graph from a knowledge graph
   */
  public createGraphFromData(knowledgeGraph: KnowledgeGraph, filters?: KnowledgeGraphFilters): D3Graph {
    // Apply filters if provided
    let filteredNodes = knowledgeGraph.nodes;
    let filteredRelationships = knowledgeGraph.relationships;
    
    if (filters) {
      // Filter nodes
      if (filters.nodeTypes && filters.nodeTypes.length > 0) {
        filteredNodes = filteredNodes.filter(node => 
          filters.nodeTypes!.includes(node.type));
      }
      
      if (filters.minRelevanceScore !== undefined) {
        filteredNodes = filteredNodes.filter(node => 
          (node.relevanceScore || 0) >= filters.minRelevanceScore!);
      }
      
      // Filter relationships
      if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
        filteredRelationships = filteredRelationships.filter(rel => 
          filters.relationshipTypes!.includes(rel.type));
      }
      
      if (filters.evidenceStrengths && filters.evidenceStrengths.length > 0) {
        filteredRelationships = filteredRelationships.filter(rel => 
          filters.evidenceStrengths!.includes(rel.evidenceStrength));
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
            filteredRelationships
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
        
        // Filter nodes and relationships based on BFS results
        filteredNodes = filteredNodes.filter(node => nodeMap.has(node.id));
        filteredRelationships = filteredRelationships.filter(rel => 
          nodeMap.has(rel.source) && nodeMap.has(rel.target));
      }
      
      // Limit the number of nodes if specified
      if (filters.maxNodes && filteredNodes.length > filters.maxNodes) {
        // Sort by relevance score first
        filteredNodes.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        filteredNodes = filteredNodes.slice(0, filters.maxNodes);
        
        // Adjust relationships accordingly
        const nodeIds = new Set(filteredNodes.map(n => n.id));
        filteredRelationships = filteredRelationships.filter(rel => 
          nodeIds.has(rel.source) && nodeIds.has(rel.target));
      }
    }
    
    // Create D3 nodes
    const d3Nodes: D3Node[] = filteredNodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.label,
      radius: this.calculateNodeRadius(node),
      color: node.color || this.getDefaultNodeColor(node.type),
      image: node.imageUrl,
      nodeData: node
    }));
    
    // Create D3 links
    const d3Links: D3Link[] = filteredRelationships.map(rel => ({
      id: rel.id,
      source: rel.source,
      target: rel.target,
      type: rel.type,
      strength: rel.evidenceStrength,
      relationshipData: rel
    }));
    
    this.graph = { nodes: d3Nodes, links: d3Links };
    return this.graph;
  }
  
  /**
   * Initialize the force simulation
   */
  public initializeSimulation(): d3.Simulation<D3Node, D3Link> {
    const linkDistance = this.options.linkDistance || 100;
    const chargeStrength = this.options.chargeStrength || -300;
    const decay = this.options.decay || 0.03;
    
    this.simulation = d3.forceSimulation<D3Node, D3Link>(this.graph.nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(this.graph.links)
        .id(d => d.id)
        .distance(linkDistance)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
      .force('collide', d3.forceCollide<D3Node>(d => (d.radius || 10) + 2))
      .velocityDecay(decay);
    
    return this.simulation;
  }
  
  /**
   * Update the simulation with new data or options
   */
  public updateSimulation(graph?: D3Graph, options?: Partial<SimulationOptions>): void {
    if (graph) {
      this.graph = graph;
    }
    
    if (options) {
      this.options = { ...this.options, ...options };
    }
    
    if (!this.simulation) {
      this.initializeSimulation();
      return;
    }
    
    // Update nodes and links
    this.simulation.nodes(this.graph.nodes);
    
    const linkForce = this.simulation.force('link') as d3.ForceLink<D3Node, D3Link>;
    if (linkForce) {
      linkForce.links(this.graph.links);
    }
    
    // Get safe values for force parameters
    const chargeStrength = this.options.chargeStrength || -300;
    const decay = this.options.decay || 0.03;
    
    // Update forces
    this.simulation
      .force('center', d3.forceCenter(this.options.width / 2, this.options.height / 2))
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('collide', d3.forceCollide<D3Node>(d => (d.radius || 10) + 2))
      .velocityDecay(decay);
    
    // Restart the simulation
    this.simulation.alpha(0.3).restart();
  }
  
  /**
   * Stop the simulation
   */
  public stopSimulation(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
  }
  
  /**
   * Resume the simulation
   */
  public resumeSimulation(): void {
    if (this.simulation) {
      this.simulation.restart();
    }
  }
  
  /**
   * Calculate the radius for a node based on its type and relevance
   */
  private calculateNodeRadius(node: Node): number {
    const baseRadius = 10;
    const relevanceFactor = node.relevanceScore ? node.relevanceScore / 100 : 0.5;
    
    let typeMultiplier = 1;
    switch (node.type) {
      case NodeType.MEDICAL_CONCEPT:
        typeMultiplier = 1.2;
        break;
      case NodeType.TREATMENT:
        typeMultiplier = 1.3;
        break;
      case NodeType.DRUG:
        typeMultiplier = 1.25;
        break;
      case NodeType.CONDITION:
        typeMultiplier = 1.15;
        break;
      default:
        typeMultiplier = 1;
    }
    
    return baseRadius * (0.8 + relevanceFactor * 0.4) * typeMultiplier;
  }
  
  /**
   * Get default color for node based on its type
   */
  private getDefaultNodeColor(nodeType: NodeType): string {
    switch (nodeType) {
      case NodeType.MEDICAL_CONCEPT:
        return '#4285F4'; // Google Blue
      case NodeType.TREATMENT:
        return '#34A853'; // Google Green
      case NodeType.DRUG:
        return '#FBBC05'; // Google Yellow
      case NodeType.SYMPTOM:
        return '#EA4335'; // Google Red
      case NodeType.CONDITION:
        return '#8F00FF'; // Violet
      case NodeType.BIOMARKER:
        return '#00CED1'; // Turquoise
      default:
        return '#9E9E9E'; // Grey
    }
  }
  
  /**
   * Get the color for a relationship based on its type and evidence strength
   */
  public getRelationshipColor(relationship: Relationship): string {
    // Base colors for relationship types
    const typeColors: Record<RelationshipType, string> = {
      [RelationshipType.TREATS]: '#34A853', // Green
      [RelationshipType.CAUSES]: '#EA4335', // Red
      [RelationshipType.PREVENTS]: '#4285F4', // Blue
      [RelationshipType.INDICATES]: '#FBBC05', // Yellow
      [RelationshipType.INTERACTS_WITH]: '#9C27B0', // Purple
      [RelationshipType.CONTRADICTS]: '#FF6D00', // Orange
      [RelationshipType.AUGMENTS]: '#00BCD4', // Cyan
      [RelationshipType.RELATED_TO]: '#9E9E9E', // Grey
    };
    
    // Opacity based on evidence strength
    const opacities: Record<EvidenceStrength, number> = {
      [EvidenceStrength.STRONG]: 1,
      [EvidenceStrength.MODERATE]: 0.8,
      [EvidenceStrength.LIMITED]: 0.6,
      [EvidenceStrength.ANECDOTAL]: 0.4,
      [EvidenceStrength.THEORETICAL]: 0.3,
    };
    
    const baseColor = typeColors[relationship.type] || '#9E9E9E';
    const opacity = opacities[relationship.evidenceStrength] || 0.5;
    
    // Convert hex to rgba
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  /**
   * Get the stroke-dasharray pattern for a relationship based on its evidence strength
   */
  public getRelationshipDashPattern(relationship: Relationship): string {
    switch (relationship.evidenceStrength) {
      case EvidenceStrength.STRONG:
        return ''; // Solid line
      case EvidenceStrength.MODERATE:
        return '5,1'; // Tight dash
      case EvidenceStrength.LIMITED:
        return '4,2'; // Medium dash
      case EvidenceStrength.ANECDOTAL:
        return '2,2'; // Short dash
      case EvidenceStrength.THEORETICAL:
        return '1,3'; // Dotted
      default:
        return '3,3'; // Default dash
    }
  }
  
  /**
   * Get the line width for a relationship based on its weight
   */
  public getRelationshipWidth(relationship: Relationship): number {
    const baseWidth = 1.5;
    const weightMultiplier = relationship.weight ? relationship.weight / 100 : 0.5;
    return baseWidth * (0.7 + weightMultiplier * 0.6);
  }
} 