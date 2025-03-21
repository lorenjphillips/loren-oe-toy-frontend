/**
 * Decision Tree Service for Clinical Microsimulations
 *
 * This service defines a flexible decision tree data structure for clinical scenarios,
 * supporting multiple paths and outcomes with weighted probabilities for realistic
 * clinical decision-making simulations.
 */

import { TreatmentCategory } from '../models/adTypes';

/**
 * Represents a node in the decision tree
 */
export interface DecisionTreeNode {
  id: string;                      // Unique identifier for the node
  type: 'scenario' | 'decision' | 'outcome' | 'educational'; // Node type
  title: string;                   // Title/heading for the node
  content: string;                 // Descriptive content for the node
  image?: string;                  // Optional image URL for visual context
  children?: DecisionTreeBranch[]; // Child branches (if any)
  metadata?: Record<string, any>;  // Additional node-specific metadata
}

/**
 * Represents a scenario node with patient information
 */
export interface ScenarioNode extends DecisionTreeNode {
  type: 'scenario';
  patientInfo: {
    age: number;
    gender: 'male' | 'female' | 'other';
    chiefComplaint: string;
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      respiratoryRate?: number;
      temperature?: number;
      oxygenSaturation?: number;
    };
    medicalHistory?: string[];
    medications?: string[];
    allergies?: string[];
    labResults?: Array<{
      name: string;
      value: string;
      unit: string;
      referenceRange?: string;
      isAbnormal?: boolean;
    }>;
  };
}

/**
 * Represents a decision node with multiple options
 */
export interface DecisionNode extends DecisionTreeNode {
  type: 'decision';
  question: string;               // The decision question
  options: Array<{
    id: string;                   // Option identifier
    text: string;                 // Option text
    isCorrect?: boolean;          // Whether this is the correct choice
    explanation?: string;         // Explanation for this option
  }>;
  timeConstraint?: number;        // Optional time limit in seconds
  metadata?: {
    decisionType?: 'diagnostic' | 'treatment' | 'follow_up'; // Type of medical decision
    difficulty?: 'basic' | 'intermediate' | 'advanced';      // Difficulty level
  };
}

/**
 * Represents an outcome node showing results of decisions
 */
export interface OutcomeNode extends DecisionTreeNode {
  type: 'outcome';
  outcomeType: 'positive' | 'negative' | 'neutral'; // Type of outcome
  patientStatus: 'improved' | 'worsened' | 'unchanged' | 'complicated'; // Patient status
  explanation: string;            // Medical explanation of the outcome
  followUp?: string;              // Recommended follow-up
}

/**
 * Represents an educational node providing medical information
 */
export interface EducationalNode extends DecisionTreeNode {
  type: 'educational';
  treatmentInfo?: {
    name: string;               // Treatment name
    mechanism: string;          // Mechanism of action
    indications: string[];      // When to use
    contraindications: string[]; // When not to use
    sideEffects: string[];      // Possible side effects
    evidenceLevel?: 'high' | 'moderate' | 'low'; // Level of evidence
  };
  references?: Array<{
    citation: string;           // Citation text
    url?: string;               // Link to source
  }>;
  isSponsoredContent?: boolean; // Whether this is sponsored content
}

/**
 * Represents a branch in the decision tree with probability weighting
 */
export interface DecisionTreeBranch {
  targetId: string;            // ID of the target node
  condition?: string;          // Optional condition for taking this branch
  probability?: number;        // Probability weight (0-1) for randomized selection
  metadata?: {
    treatmentId?: string;      // Associated treatment if applicable
    reasonForTransition?: string; // Medical reasoning for this transition
  };
}

/**
 * Complete decision tree with metadata
 */
export interface DecisionTree {
  id: string;                   // Unique tree identifier
  title: string;                // Title of the scenario
  description: string;          // Description of the scenario
  rootNodeId: string;           // ID of the starting node
  nodes: DecisionTreeNode[];    // All nodes in the tree
  metadata: {
    medicalCategory: string;    // Medical specialty category
    treatmentFocus?: string;    // Treatment focus area
    difficulty: 'basic' | 'intermediate' | 'advanced'; // Overall difficulty
    estimatedDuration: number;  // Estimated completion time in seconds
    createdBy?: string;         // Creator information
    createdAt: Date;            // Creation date
    updatedAt: Date;            // Last update date
    associatedTreatments?: string[]; // Associated treatment types
  };
}

/**
 * Decision Tree Service
 * 
 * Provides functionality for working with clinical decision trees
 */
export class DecisionTreeService {
  private trees: Map<string, DecisionTree> = new Map();
  
  /**
   * Load a decision tree into the service
   */
  public loadTree(tree: DecisionTree): void {
    this.trees.set(tree.id, tree);
  }
  
  /**
   * Get a decision tree by ID
   */
  public getTree(treeId: string): DecisionTree | undefined {
    return this.trees.get(treeId);
  }
  
  /**
   * Get all available decision trees
   */
  public getAllTrees(): DecisionTree[] {
    return Array.from(this.trees.values());
  }
  
  /**
   * Find trees that match a medical category and/or treatment focus
   */
  public findTrees(category?: string, treatmentFocus?: string): DecisionTree[] {
    return Array.from(this.trees.values()).filter(tree => {
      const categoryMatch = !category || tree.metadata.medicalCategory === category;
      const focusMatch = !treatmentFocus || tree.metadata.treatmentFocus === treatmentFocus;
      return categoryMatch && focusMatch;
    });
  }
  
  /**
   * Get the next node in a tree based on the current node and a decision
   */
  public getNextNode(treeId: string, currentNodeId: string, decisionOptionId?: string): DecisionTreeNode | null {
    const tree = this.trees.get(treeId);
    if (!tree) return null;
    
    const currentNode = tree.nodes.find(node => node.id === currentNodeId);
    if (!currentNode || !currentNode.children || currentNode.children.length === 0) {
      return null;
    }
    
    // Handle decision nodes with specific option choices
    if (currentNode.type === 'decision' && decisionOptionId) {
      const branch = currentNode.children.find(branch => 
        branch.metadata?.treatmentId === decisionOptionId || branch.condition === decisionOptionId
      );
      
      if (branch) {
        return tree.nodes.find(node => node.id === branch.targetId) || null;
      }
    }
    
    // For non-decision nodes or when no specific decision was made,
    // select based on probability or take the first available path
    
    // If we have probabilities defined, use weighted random selection
    const branchesWithProbability = currentNode.children.filter(branch => 
      typeof branch.probability === 'number' && branch.probability > 0
    );
    
    if (branchesWithProbability.length > 0) {
      return this.selectNodeByProbability(tree, branchesWithProbability);
    }
    
    // Otherwise, just take the first branch
    const defaultBranch = currentNode.children[0];
    return tree.nodes.find(node => node.id === defaultBranch.targetId) || null;
  }
  
  /**
   * Select a node based on weighted probability
   * @private
   */
  private selectNodeByProbability(tree: DecisionTree, branches: DecisionTreeBranch[]): DecisionTreeNode | null {
    // Normalize probabilities if they don't sum to 1
    const totalProbability = branches.reduce((sum, branch) => sum + (branch.probability || 0), 0);
    const normalizedBranches = branches.map(branch => ({
      ...branch,
      probability: (branch.probability || 0) / totalProbability
    }));
    
    // Random selection based on cumulative probability
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const branch of normalizedBranches) {
      cumulativeProbability += branch.probability || 0;
      if (random <= cumulativeProbability) {
        return tree.nodes.find(node => node.id === branch.targetId) || null;
      }
    }
    
    // Fallback to the last branch if something went wrong with the probabilities
    const lastBranch = normalizedBranches[normalizedBranches.length - 1];
    return tree.nodes.find(node => node.id === lastBranch.targetId) || null;
  }
  
  /**
   * Validate a decision tree for completeness and correctness
   */
  public validateTree(tree: DecisionTree): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    // Check for root node existence
    const rootNode = tree.nodes.find(node => node.id === tree.rootNodeId);
    if (!rootNode) {
      errors.push(`Root node with ID ${tree.rootNodeId} not found`);
    }
    
    // Check for orphaned nodes
    const reachableNodes = new Set<string>();
    this.traverseTree(tree, tree.rootNodeId, reachableNodes);
    
    const orphanedNodes = tree.nodes.filter(node => !reachableNodes.has(node.id));
    if (orphanedNodes.length > 0) {
      errors.push(`Found ${orphanedNodes.length} orphaned nodes that cannot be reached`);
    }
    
    // Check for dangling references (references to non-existent nodes)
    const nodeIds = new Set(tree.nodes.map(node => node.id));
    
    for (const node of tree.nodes) {
      if (node.children) {
        for (const branch of node.children) {
          if (!nodeIds.has(branch.targetId)) {
            errors.push(`Node ${node.id} references non-existent target ${branch.targetId}`);
          }
        }
      }
    }
    
    // Check for proper node typing
    for (const node of tree.nodes) {
      switch (node.type) {
        case 'scenario':
          if (!this.isScenarioNode(node)) {
            errors.push(`Node ${node.id} is marked as scenario but missing required scenario properties`);
          }
          break;
        case 'decision':
          if (!this.isDecisionNode(node)) {
            errors.push(`Node ${node.id} is marked as decision but missing required decision properties`);
          }
          break;
        case 'outcome':
          if (!this.isOutcomeNode(node)) {
            errors.push(`Node ${node.id} is marked as outcome but missing required outcome properties`);
          }
          break;
        case 'educational':
          if (!this.isEducationalNode(node)) {
            errors.push(`Node ${node.id} is marked as educational but missing required educational properties`);
          }
          break;
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Traverse the tree to collect reachable nodes
   * @private
   */
  private traverseTree(tree: DecisionTree, nodeId: string, reachableNodes: Set<string>): void {
    if (reachableNodes.has(nodeId)) return;
    
    reachableNodes.add(nodeId);
    const node = tree.nodes.find(n => n.id === nodeId);
    
    if (node && node.children) {
      for (const branch of node.children) {
        this.traverseTree(tree, branch.targetId, reachableNodes);
      }
    }
  }
  
  /**
   * Type guards for node types
   * @private
   */
  private isScenarioNode(node: DecisionTreeNode): node is ScenarioNode {
    return node.type === 'scenario' && 'patientInfo' in node;
  }
  
  private isDecisionNode(node: DecisionTreeNode): node is DecisionNode {
    return node.type === 'decision' && 'options' in node;
  }
  
  private isOutcomeNode(node: DecisionTreeNode): node is OutcomeNode {
    return node.type === 'outcome' && 'outcomeType' in node;
  }
  
  private isEducationalNode(node: DecisionTreeNode): node is EducationalNode {
    return node.type === 'educational';
  }
}

export default new DecisionTreeService(); 