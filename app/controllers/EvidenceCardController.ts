import { Ad } from '../types/ad';
import { MedicalClassification } from '../services/classification';
import analyticsService from '../services/analytics';
import { enhanceMappingConfidence, EnhancedMappingResult } from '../services/confidenceScoring';

// Custom analytics service wrapper
const analytics = {
  trackEvent: (type: string, data: any) => {
    // Check if the analyticsService has createEvent function
    if (typeof analyticsService.createEvent === 'function') {
      const event = analyticsService.createEvent(type as any, data);
      analyticsService.dispatchAnalyticsEvent(event);
    } else {
      // Fallback - use console log in development
      console.log('Analytics event:', { type, data });
    }
  }
};

/**
 * Evidence source types
 */
export enum EvidenceSourceType {
  CLINICAL_TRIAL = 'clinical_trial',
  META_ANALYSIS = 'meta_analysis',
  SYSTEMATIC_REVIEW = 'systematic_review',
  OBSERVATIONAL_STUDY = 'observational_study',
  GUIDELINES = 'guidelines',
  EXPERT_OPINION = 'expert_opinion',
}

/**
 * Evidence quality levels
 */
export enum EvidenceQualityLevel {
  HIGH = 'high',
  MODERATE = 'moderate',
  LOW = 'low',
  VERY_LOW = 'very_low',
}

/**
 * Clinical evidence structure
 */
export interface ClinicalEvidence {
  id: string;
  studyName: string;
  sampleSize: number;
  design: string;
  sourceType: EvidenceSourceType;
  qualityLevel: EvidenceQualityLevel;
  primaryOutcome: string;
  results: string;
  pValue?: string;
  confidenceInterval?: string;
  year?: number;
  citation: string;
  referenceLink?: string;
  limitations?: string;
  relevanceScore?: number; // How relevant this evidence is to the question
}

/**
 * Evidence card configuration
 */
export interface EvidenceCardConfig {
  showFilterOptions: boolean;
  showFullDetails: boolean;
  compact: boolean;
  prioritizeHighQuality: boolean;
  maxEvidenceItems?: number;
  includeEducationalContent?: boolean;
}

/**
 * Educational content to accompany evidence
 */
export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  source?: string;
  relevance?: number;
}

/**
 * Response from the evidence card controller
 */
export interface EvidenceCardResponse {
  title: string;
  treatmentName?: string;
  evidence: ClinicalEvidence[];
  educationalContent?: EducationalContent;
  config: EvidenceCardConfig;
  isError?: boolean;
  errorMessage?: string;
}

/**
 * Controller for handling evidence card ad experiences
 */
class EvidenceCardController {
  /**
   * Generate an evidence card experience based on the question and ad data
   */
  async generateEvidenceCard(
    question: string,
    classification: MedicalClassification,
    adData?: Ad,
    config?: Partial<EvidenceCardConfig>
  ): Promise<EvidenceCardResponse> {
    try {
      // 1. Determine the relevant condition and treatment from the question
      const { condition, treatment } = await this.extractConditionAndTreatment(
        question, 
        classification,
        adData
      );
      
      // 2. Find relevant clinical evidence
      const evidenceItems = await this.findRelevantEvidence(
        condition, 
        treatment, 
        config?.maxEvidenceItems || 3
      );
      
      // 3. Prepare educational content if needed
      const educationalContent = config?.includeEducationalContent !== false
        ? await this.getEducationalContent(condition, treatment)
        : undefined;
      
      // 4. Track this generation for analytics
      analytics.trackEvent('evidence_card_generated', {
        questionId: question.slice(0, 20).replace(/\s+/g, '_'),
        condition,
        treatment,
        evidenceCount: evidenceItems.length,
        hasEducationalContent: !!educationalContent,
      });
      
      // 5. Prepare the final configuration
      const finalConfig: EvidenceCardConfig = {
        showFilterOptions: config?.showFilterOptions ?? true,
        showFullDetails: config?.showFullDetails ?? false,
        compact: config?.compact ?? false,
        prioritizeHighQuality: config?.prioritizeHighQuality ?? true,
        maxEvidenceItems: config?.maxEvidenceItems ?? 3,
        includeEducationalContent: config?.includeEducationalContent ?? true,
      };
      
      // 6. Return the complete response
      return {
        title: adData?.title || `Evidence for ${treatment} in ${condition}`,
        treatmentName: treatment,
        evidence: evidenceItems,
        educationalContent,
        config: finalConfig,
      };
      
    } catch (error) {
      console.error('Error generating evidence card:', error);
      return {
        title: 'Evidence Summary',
        evidence: [],
        config: {
          showFilterOptions: false,
          showFullDetails: false,
          compact: true,
          prioritizeHighQuality: true,
        },
        isError: true,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  /**
   * Extract condition and treatment information from the question
   */
  private async extractConditionAndTreatment(
    question: string,
    classification: MedicalClassification,
    adData?: Ad
  ): Promise<{ condition: string; treatment: string }> {
    // In a real implementation, this would use NLP to extract medical entities
    // For this implementation, we'll use simple heuristics and the ad data
    
    // Default values
    let condition = 'the condition';
    let treatment = adData?.title || 'treatment';
    
    // Try to use enhanced confidence scoring to map to condition/treatment
    try {
      if (question) {
        // This service helps map questions to pharmaceutical products and conditions
        const enhancedMapping: EnhancedMappingResult = await enhanceMappingConfidence({
          matches: [],
          topMatch: undefined,
          classificationInput: classification,
          totalMatches: 0,
          primaryCategory: classification.primaryCategory.name,
          subcategory: classification.subcategory?.name || '',
          keywordsUsed: [],
          medicationsUsed: [],
          timestamp: new Date()
        }, question);
        
        if (enhancedMapping.originalQuestionText) {
          condition = enhancedMapping.originalQuestionText;
        }
        
        if (enhancedMapping.matches && enhancedMapping.matches.length > 0) {
          treatment = enhancedMapping.matches[0].treatmentArea.id;
        }
      }
    } catch (error) {
      console.warn('Failed to extract condition/treatment, using defaults');
    }
    
    return { condition, treatment };
  }
  
  /**
   * Find relevant clinical evidence for the condition and treatment
   */
  private async findRelevantEvidence(
    condition: string,
    treatment: string,
    maxItems: number
  ): Promise<ClinicalEvidence[]> {
    // In a real implementation, this would query a medical evidence database
    // For this example, we'll generate mock evidence
    
    // Creating sample evidence items
    const evidenceItems: ClinicalEvidence[] = [
      {
        id: `evidence_${Date.now()}_1`,
        studyName: `${treatment} Efficacy Trial`,
        sampleSize: 458,
        design: 'Randomized Controlled Trial',
        sourceType: EvidenceSourceType.CLINICAL_TRIAL,
        qualityLevel: EvidenceQualityLevel.HIGH,
        primaryOutcome: `Reduction in ${condition} symptoms over 12 weeks`,
        results: `${treatment} showed significant improvement compared to placebo with 37% reduction in symptoms.`,
        pValue: '0.003',
        confidenceInterval: '0.23-0.51',
        year: 2022,
        citation: `Johnson et al. (2022). ${treatment} efficacy for ${condition}: a randomized clinical trial. Journal of Medicine, 45(2), 112-124.`,
        relevanceScore: 0.95,
      },
      {
        id: `evidence_${Date.now()}_2`,
        studyName: `Meta-analysis of treatments for ${condition}`,
        sampleSize: 1245,
        design: 'Meta-analysis of 5 randomized trials',
        sourceType: EvidenceSourceType.META_ANALYSIS,
        qualityLevel: EvidenceQualityLevel.MODERATE,
        primaryOutcome: `Efficacy of various treatments for ${condition}`,
        results: `Among treatments studied, ${treatment} showed an effect size of 0.42 (moderate effect).`,
        pValue: '0.01',
        confidenceInterval: '0.31-0.53',
        year: 2021,
        citation: `Smith et al. (2021). Comparative efficacy of treatments for ${condition}: a systematic review and meta-analysis. Clinical Therapeutics, 33(4), 355-368.`,
        relevanceScore: 0.85,
      },
      {
        id: `evidence_${Date.now()}_3`,
        studyName: `Long-term safety of ${treatment}`,
        sampleSize: 732,
        design: 'Prospective cohort study',
        sourceType: EvidenceSourceType.OBSERVATIONAL_STUDY,
        qualityLevel: EvidenceQualityLevel.MODERATE,
        primaryOutcome: `Adverse events over 3 years of ${treatment} use`,
        results: `Long-term use of ${treatment} was associated with a favorable safety profile, with mild side effects occurring in less than 8% of patients.`,
        pValue: '0.08',
        confidenceInterval: '0.04-0.12',
        year: 2023,
        citation: `Wilson et al. (2023). Long-term safety profile of ${treatment} in patients with ${condition}. Journal of Clinical Safety, 18(3), 201-215.`,
        limitations: 'Observational design limits causal inference. Potential for selection bias in patient follow-up.',
        relevanceScore: 0.75,
      }
    ];
    
    // Sort by relevance and limit to requested number
    return evidenceItems
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, maxItems);
  }
  
  /**
   * Get educational content to accompany the evidence
   */
  private async getEducationalContent(
    condition: string,
    treatment: string
  ): Promise<EducationalContent> {
    // In a real implementation, this would fetch or generate content
    return {
      id: `education_${Date.now()}`,
      title: `Understanding ${treatment} for ${condition}`,
      content: `${treatment} works by targeting specific pathways involved in ${condition}. Clinical evidence suggests it's most effective when used as directed by your healthcare provider. It's important to discuss potential side effects and benefits to make an informed treatment decision.`,
      source: 'Medical Information Database',
      relevance: 0.9,
    };
  }
  
  /**
   * Handle user interaction with the evidence card
   */
  async handleInteraction(
    interactionType: string,
    evidenceId?: string,
    data?: any
  ): Promise<any> {
    // Track the interaction for analytics
    analytics.trackEvent('evidence_card_interaction', {
      interactionType,
      evidenceId,
      data,
      timestamp: new Date().toISOString(),
    });
    
    // Handle different interaction types
    switch (interactionType) {
      case 'evidence_expand':
        if (evidenceId) {
          return { 
            acknowledged: true,
            fullDetails: await this.getFullEvidenceDetails(evidenceId)
          };
        }
        return { acknowledged: false, reason: 'No evidence ID provided' };
        
      case 'filter_change':
        if (data?.filterType) {
          return {
            acknowledged: true,
            filteredEvidence: await this.applyEvidenceFilter(
              data.filterType, 
              data.filterValue
            )
          };
        }
        return { acknowledged: false, reason: 'No filter criteria provided' };
        
      case 'citation_click':
        if (evidenceId) {
          return {
            acknowledged: true,
            citationDetails: await this.getCitationDetails(evidenceId)
          };
        }
        return { acknowledged: false, reason: 'No evidence ID provided' };
        
      default:
        return { acknowledged: false, reason: 'Unknown interaction type' };
    }
  }
  
  /**
   * Get complete details for a specific evidence item
   */
  private async getFullEvidenceDetails(evidenceId: string): Promise<Record<string, any>> {
    // In a real implementation, this would fetch complete study details
    return {
      id: evidenceId,
      fullText: 'Complete study details would be provided here...',
      methods: 'Detailed methodology section...',
      results: 'Comprehensive results...',
      discussion: 'Author interpretation and context...',
      references: [
        { id: 1, citation: 'Reference 1' },
        { id: 2, citation: 'Reference 2' },
      ]
    };
  }
  
  /**
   * Apply a filter to the evidence items
   */
  private async applyEvidenceFilter(
    filterType: string,
    filterValue: any
  ): Promise<ClinicalEvidence[]> {
    // In a real implementation, this would apply filters to a database query
    // For this example, we'll return a mock filtered set
    
    const mockFilteredEvidence: ClinicalEvidence[] = [
      {
        id: `filtered_evidence_${Date.now()}`,
        studyName: 'Filtered Study Example',
        sampleSize: 320,
        design: 'Randomized Controlled Trial',
        sourceType: EvidenceSourceType.CLINICAL_TRIAL,
        qualityLevel: EvidenceQualityLevel.HIGH,
        primaryOutcome: 'Primary outcome matching filter criteria',
        results: 'Results matching the applied filter',
        year: 2023,
        citation: 'Citation for filtered evidence',
        relevanceScore: 0.9,
      }
    ];
    
    return mockFilteredEvidence;
  }
  
  /**
   * Get citation details for a specific evidence item
   */
  private async getCitationDetails(evidenceId: string): Promise<Record<string, any>> {
    // In a real implementation, this would fetch publication details
    return {
      id: evidenceId,
      fullCitation: 'Complete citation in AMA format...',
      doi: '10.xxxx/xxxxx',
      pubmedId: '1234567',
      publishedDate: '2023-03-15',
      journal: {
        name: 'Journal of Evidence-Based Medicine',
        impactFactor: 4.2,
      },
    };
  }
}

// Export singleton instance
const evidenceCardController = new EvidenceCardController();
export default evidenceCardController; 