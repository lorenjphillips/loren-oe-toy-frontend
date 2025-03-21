/**
 * Educational Content Service
 * 
 * Provides contextually relevant treatment information for microsimulations,
 * balancing promotional content with clinical evidence.
 */

import { EducationalContent } from '../models/microsimulation';
import { AdCompany } from '../models/adTypes';
import { educationalContentData } from '../data/educationalContent';

export interface EducationalContentFilter {
  treatmentIds?: string[];
  companyIds?: string[];
  decisionIds?: string[];
  contentTypes?: Array<EducationalContent['type']>;
  displayTiming?: EducationalContent['displayTiming'];
  maxItems?: number;
}

export class EducationalContentService {
  private contentDatabase: EducationalContent[];

  constructor() {
    this.contentDatabase = educationalContentData;
  }

  /**
   * Get educational content based on filter criteria
   */
  public getContent(filter: EducationalContentFilter): EducationalContent[] {
    let filteredContent = [...this.contentDatabase];

    // Filter by treatment IDs
    if (filter.treatmentIds && filter.treatmentIds.length > 0) {
      filteredContent = filteredContent.filter(content => 
        content.associatedTreatmentIds?.some(id => 
          filter.treatmentIds?.includes(id)
        )
      );
    }

    // Filter by company IDs
    if (filter.companyIds && filter.companyIds.length > 0) {
      filteredContent = filteredContent.filter(content => 
        filter.companyIds?.includes(content.companyId || '')
      );
    }

    // Filter by decision IDs
    if (filter.decisionIds && filter.decisionIds.length > 0) {
      filteredContent = filteredContent.filter(content => 
        content.associatedDecisionIds?.some(id => 
          filter.decisionIds?.includes(id)
        )
      );
    }

    // Filter by content types
    if (filter.contentTypes && filter.contentTypes.length > 0) {
      filteredContent = filteredContent.filter(content => 
        filter.contentTypes?.includes(content.type)
      );
    }

    // Filter by display timing
    if (filter.displayTiming) {
      filteredContent = filteredContent.filter(content => 
        content.displayTiming === filter.displayTiming
      );
    }

    // Limit the number of items if specified
    if (filter.maxItems && filter.maxItems > 0) {
      filteredContent = filteredContent.slice(0, filter.maxItems);
    }

    return filteredContent;
  }

  /**
   * Get educational content for a specific treatment or company
   */
  public getContentForTreatment(treatmentId: string, company?: AdCompany): EducationalContent[] {
    return this.getContent({
      treatmentIds: [treatmentId],
      companyIds: company ? [company.id] : undefined
    });
  }

  /**
   * Get content related to a specific decision point
   */
  public getContentForDecision(decisionId: string): EducationalContent[] {
    return this.getContent({
      decisionIds: [decisionId]
    });
  }

  /**
   * Get content for displaying at a specific timing 
   * (pre-simulation, during, post-simulation, or as feedback)
   */
  public getContentByTiming(timing: EducationalContent['displayTiming']): EducationalContent[] {
    return this.getContent({
      displayTiming: timing
    });
  }

  /**
   * Get treatment comparison content for multiple treatments
   */
  public getComparisonContent(treatmentIds: string[]): EducationalContent[] {
    return this.contentDatabase.filter(content => 
      content.type === 'text' &&
      treatmentIds.every(id => content.associatedTreatmentIds?.includes(id))
    );
  }

  /**
   * Generate contextually relevant content based on clinical scenario
   */
  public generateContextualContent(
    treatmentId: string,
    clinicalContext: string,
    company?: AdCompany
  ): EducationalContent {
    // In a real implementation, this might call an AI service to generate
    // contextually relevant content. For now, we'll just return a placeholder
    // based on existing content

    const treatmentContent = this.getContentForTreatment(treatmentId, company);
    
    if (treatmentContent.length === 0) {
      // Create a fallback content item if none exists
      return {
        id: `generated_${Date.now()}`,
        title: `Information about ${treatmentId}`,
        type: 'text',
        content: `This treatment may be relevant to ${clinicalContext}. Please consult official prescribing information.`,
        relevance: `Related to ${clinicalContext}`,
        displayTiming: 'during',
        associatedTreatmentIds: [treatmentId],
        companyId: company?.id
      };
    }
    
    return treatmentContent[0];
  }
}

// Export a singleton instance
export const educationalContentService = new EducationalContentService(); 