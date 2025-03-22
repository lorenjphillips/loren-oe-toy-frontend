import { Ad } from '../types/ad';
import { MedicalClassification } from '../services/classification';

// Define these interfaces based on how they're used in this file
export interface SimulationNode {
  id: string;
  type: string;
  title?: string;
  label?: string;
  description?: string;
  data?: any;
  position?: { x: number; y: number };
  options?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
}

export interface SimulationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  data?: any;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  type?: string;
  keywords?: string[];
  complexity?: string;
  patientProfile?: {
    age: number;
    gender: string;
    condition: string;
    history?: string[];
  };
  outcomes?: {
    id: string;
    description: string;
    probability: number;
  }[];
  treatmentOptions?: {
    id: string;
    name: string;
    description: string;
    effectiveness: number;
  }[];
}

// Extend the Ad interface to include categories property
export interface ExtendedAd extends Omit<Ad, 'categories'> {
  categories?: string[];
}

// Extend MedicalClassification with additional properties
export interface ExtendedMedicalClassification extends MedicalClassification {
  medicalCategoryName?: string;
}

// Create an extended version of the analytics service
export interface AnalyticsService {
  trackEvent: (data: any) => any;
  // Add other methods from the actual service here if needed
}

// Create an extended version of the MicrosimulationConfigService
export interface ExtendedMicrosimulationConfigService {
  getScenarios: (
    simulationType: string,
    concepts: string[],
    categories: string[]
  ) => Promise<SimulationScenario[]>;
}

import { MicrosimulationConfigService } from '../services/microsimulationConfig';
import analyticsService from '../services/analytics';

// Cast the services to the extended types
const extendedAnalyticsService = analyticsService as unknown as AnalyticsService;
const extendedConfigService = new MicrosimulationConfigService() as unknown as ExtendedMicrosimulationConfigService;

/**
 * Configuration for the microsimulation experience
 */
export interface MicrosimulationConfig {
  interactive: boolean;
  showDecisionTree: boolean;
  simulationSpeed?: 'slow' | 'normal' | 'fast';
  focusAreas?: string[];
  maxDepth?: number;
  simulationId?: string;
}

/**
 * Response from the microsimulation controller
 */
export interface MicrosimulationResponse {
  scenario: SimulationScenario;
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  startNodeId: string;
  config: MicrosimulationConfig;
  treatments: {
    id: string;
    name: string;
    description: string;
    effectiveness: number;
  }[];
  isError?: boolean;
  errorMessage?: string;
}

/**
 * Controller for handling microsimulation ad experiences
 */
class MicrosimulationController {
  /**
   * Generate a microsimulation experience based on the question and ad data
   */
  async generateSimulation(
    question: string,
    classification: ExtendedMedicalClassification,
    adData?: ExtendedAd,
    config?: Partial<MicrosimulationConfig>
  ): Promise<MicrosimulationResponse> {
    try {
      // 1. Extract relevant medical concepts from the question
      const medicalConcepts = await this.extractMedicalConcepts(question, classification);
      
      // 2. Determine what type of simulation would be most relevant
      const simulationType = this.determineSimulationType(medicalConcepts, classification);
      
      // 3. Get or generate a simulation scenario
      const scenario = await this.getSimulationScenario(
        simulationType, 
        medicalConcepts, 
        adData
      );
      
      // 4. Get the associated treatment options, including the advertised one
      const treatments = await this.getTreatmentOptions(scenario, adData);
      
      // 5. Generate the simulation nodes and edges
      const { nodes, edges, startNodeId } = await this.generateSimulationGraph(
        scenario,
        treatments,
        config
      );
      
      // 6. Prepare the final configuration
      const finalConfig: MicrosimulationConfig = {
        interactive: config?.interactive ?? true,
        showDecisionTree: config?.showDecisionTree ?? true,
        simulationSpeed: config?.simulationSpeed ?? 'normal',
        focusAreas: config?.focusAreas ?? [],
        maxDepth: config?.maxDepth ?? 5,
        simulationId: scenario.id,
      };
      
      // 7. Log this generation for analytics
      extendedAnalyticsService.trackEvent({
        type: 'microsimulation_generated',
        data: {
          scenarioId: scenario.id,
          question,
          adId: adData?.id,
          nodeCount: nodes.length,
          edgeCount: edges.length,
          simulationType,
        }
      });
      
      // 8. Return the complete response
      return {
        scenario,
        nodes,
        edges,
        startNodeId,
        treatments,
        config: finalConfig
      };
      
    } catch (error) {
      console.error('Error generating microsimulation:', error);
      return {
        scenario: { id: 'error', title: 'Error', description: 'Failed to generate simulation' },
        nodes: [],
        edges: [],
        startNodeId: '',
        treatments: [],
        config: {
          interactive: false,
          showDecisionTree: false,
        },
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Extract medical concepts from the question
   */
  private async extractMedicalConcepts(
    question: string,
    classification: ExtendedMedicalClassification
  ): Promise<string[]> {
    // In a real implementation, this would call a medical NLP service
    // For this example, we'll simulate the extraction
    
    // Extract basic keywords from the question
    const keywords = question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3);
      
    // Add the classification categories
    const concepts = new Set([
      ...keywords,
      ...(classification.categories || []),
    ]);
    
    return Array.from(concepts);
  }
  
  /**
   * Determine the most relevant simulation type
   */
  private determineSimulationType(
    concepts: string[],
    classification: MedicalClassification
  ): string {
    // Different simulation types could include:
    // - treatment_comparison
    // - disease_progression
    // - medication_effects
    // - diagnostic_process
    
    const typeMapping: Record<string, string[]> = {
      'treatment_comparison': ['treatment', 'therapy', 'medication', 'drug', 'procedure'],
      'disease_progression': ['prognosis', 'symptoms', 'stages', 'progression'],
      'medication_effects': ['side', 'effects', 'reaction', 'efficacy'],
      'diagnostic_process': ['diagnosis', 'diagnostic', 'test', 'testing'],
    };
    
    // Score each type based on concept matches
    const scores: Record<string, number> = {};
    
    for (const [type, indicators] of Object.entries(typeMapping)) {
      scores[type] = indicators.reduce((score, indicator) => {
        return score + (concepts.some(c => c.includes(indicator)) ? 1 : 0);
      }, 0);
    }
    
    // Find the type with the highest score
    let highestScore = 0;
    let bestType = 'treatment_comparison'; // Default
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        bestType = type;
      }
    }
    
    return bestType;
  }
  
  /**
   * Get or generate a simulation scenario
   */
  private async getSimulationScenario(
    simulationType: string,
    concepts: string[],
    adData?: ExtendedAd
  ): Promise<SimulationScenario> {
    // In a real implementation, this would fetch from a database
    // or generate using an LLM
    
    // Try to fetch a pre-defined scenario from the microsimulation service
    try {
      const scenarios = await extendedConfigService.getScenarios(
        simulationType,
        concepts,
        adData?.categories || []
      );
      
      if (scenarios && scenarios.length > 0) {
        // Return the most relevant scenario
        return scenarios[0];
      }
    } catch (error) {
      console.warn('Failed to fetch scenarios, generating fallback');
    }
    
    // Fallback - generate a simple scenario
    return {
      id: `sim_${Date.now()}`,
      title: adData?.title || 'Treatment Comparison',
      description: adData?.body || 'Compare different treatment options for the condition',
      type: simulationType,
      keywords: concepts,
      complexity: 'medium',
    };
  }
  
  /**
   * Get treatment options for the simulation
   */
  private async getTreatmentOptions(
    scenario: SimulationScenario,
    adData?: ExtendedAd
  ): Promise<{
    id: string;
    name: string;
    description: string;
    effectiveness: number;
  }[]> {
    // In a real implementation, this would include the advertised treatment
    // plus alternative treatments
    
    // Always include the advertised treatment if available
    const treatments = [];
    
    if (adData) {
      treatments.push({
        id: `treatment_${adData.id}`,
        name: adData.title,
        description: adData.body,
        effectiveness: 0.85, // Make the advertised treatment highly effective
      });
    }
    
    // Add generic alternatives
    treatments.push(
      {
        id: 'treatment_standard',
        name: 'Standard Treatment',
        description: 'The current standard of care for this condition',
        effectiveness: 0.75,
      },
      {
        id: 'treatment_alternative',
        name: 'Alternative Approach',
        description: 'An alternative treatment option with different mechanisms',
        effectiveness: 0.65,
      }
    );
    
    return treatments;
  }
  
  /**
   * Generate the simulation graph of nodes and edges
   */
  private async generateSimulationGraph(
    scenario: SimulationScenario,
    treatments: {
      id: string;
      name: string;
      description: string;
      effectiveness: number;
    }[],
    config?: Partial<MicrosimulationConfig>
  ): Promise<{
    nodes: SimulationNode[];
    edges: SimulationEdge[];
    startNodeId: string;
  }> {
    // Get the max depth from config or use default
    const maxDepth = config?.maxDepth || 5;
    
    // Start with scenario node
    const startNodeId = `node_start_${Date.now()}`;
    const nodes: SimulationNode[] = [
      {
        id: startNodeId,
        type: 'scenario',
        title: scenario.title,
        description: scenario.description,
        position: { x: 0, y: 0 },
      }
    ];
    
    const edges: SimulationEdge[] = [];
    
    // Add decision node for treatment selection
    const decisionNodeId = `node_decision_${Date.now()}`;
    nodes.push({
      id: decisionNodeId,
      type: 'decision',
      title: 'Select Treatment',
      description: 'Choose a treatment approach for the patient',
      position: { x: 0, y: 100 },
      options: treatments.map(t => ({
        id: t.id,
        label: t.name,
        description: t.description,
      })),
    });
    
    // Connect start to decision
    edges.push({
      id: `edge_start_decision_${Date.now()}`,
      source: startNodeId,
      target: decisionNodeId,
      type: 'standard',
    });
    
    // Generate outcome nodes for each treatment
    treatments.forEach((treatment, index) => {
      // Create an outcome node
      const outcomeNodeId = `node_outcome_${treatment.id}_${Date.now()}`;
      nodes.push({
        id: outcomeNodeId,
        type: 'outcome',
        title: `${treatment.name} Outcome`,
        description: this.generateOutcomeDescription(treatment.effectiveness),
        position: { x: (index - 1) * 200, y: 200 },
        data: {
          effectiveness: treatment.effectiveness,
          treatmentId: treatment.id,
        },
      });
      
      // Connect decision to outcome
      edges.push({
        id: `edge_decision_outcome_${treatment.id}_${Date.now()}`,
        source: decisionNodeId,
        target: outcomeNodeId,
        type: 'decision',
        label: treatment.name,
        data: {
          treatmentId: treatment.id,
        },
      });
      
      // Add more detail nodes if we haven't reached max depth
      if (maxDepth > 2) {
        // Add explanation node for the treatment
        const explanationNodeId = `node_explanation_${treatment.id}_${Date.now()}`;
        nodes.push({
          id: explanationNodeId,
          type: 'information',
          title: `About ${treatment.name}`,
          description: treatment.description,
          position: { x: (index - 1) * 200, y: 300 },
          data: {
            treatmentId: treatment.id,
          },
        });
        
        // Connect outcome to explanation
        edges.push({
          id: `edge_outcome_explanation_${treatment.id}_${Date.now()}`,
          source: outcomeNodeId,
          target: explanationNodeId,
          type: 'standard',
        });
      }
    });
    
    return { nodes, edges, startNodeId };
  }
  
  /**
   * Generate a description of the treatment outcome based on effectiveness
   */
  private generateOutcomeDescription(effectiveness: number): string {
    if (effectiveness > 0.8) {
      return 'The treatment shows excellent results with significant improvement in symptoms and underlying condition. Patients report high satisfaction and quality of life improvements.';
    } else if (effectiveness > 0.6) {
      return 'The treatment shows good results with noticeable improvement in symptoms. Most patients respond well to this approach.';
    } else {
      return 'The treatment shows moderate results with some improvement in symptoms. Patient response varies significantly.';
    }
  }
  
  /**
   * Handle user interaction with the simulation
   */
  async handleInteraction(
    interactionType: string,
    nodeId: string,
    data: any
  ): Promise<any> {
    // Track the interaction for analytics
    extendedAnalyticsService.trackEvent({
      type: 'microsimulation_interaction',
      data: {
        interactionType,
        nodeId,
        data,
      }
    });
    
    // Handle different interaction types
    switch (interactionType) {
      case 'node_click':
        return { acknowledged: true };
        
      case 'edge_follow':
        return { acknowledged: true, newNodeId: data.targetNodeId };
        
      case 'option_select':
        return { acknowledged: true, selectedOptionId: data.optionId };
        
      default:
        return { acknowledged: false };
    }
  }
}

// Export singleton instance
const microsimulationController = new MicrosimulationController();
export default microsimulationController; 