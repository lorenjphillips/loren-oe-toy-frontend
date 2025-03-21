/**
 * Clinical Evidence Service
 * 
 * Provides access to structured clinical evidence data including studies,
 * guidelines, and properly formatted citations for use in clinical decision support.
 */

import { 
  ClinicalEvidence, 
  ClinicalGuideline,
  EvidenceLevel,
  RecommendationStrength,
  EvidenceQuality
} from '../../models/phase4';
import { studies } from '../../data/clinicalEvidence/studies';
import { guidelines } from '../../data/clinicalEvidence/guidelines';
import { citations } from '../../data/clinicalEvidence/citations';
import { EvidenceSearchOptions, EvidenceMatchResult } from '../../models/clinical-support';

// Evidence categories that can be searched
export enum EvidenceCategory {
  CARDIOVASCULAR = 'cardiovascular',
  ONCOLOGY = 'oncology',
  NEUROLOGY = 'neurology',
  ENDOCRINOLOGY = 'endocrinology',
  INFECTIOUS_DISEASE = 'infectious_disease',
  RESPIRATORY = 'respiratory',
  GASTROENTEROLOGY = 'gastroenterology',
  RHEUMATOLOGY = 'rheumatology',
  PSYCHIATRY = 'psychiatry',
  GENERAL = 'general'
}

// Treatment types for mapping evidence
export enum TreatmentType {
  PHARMACOLOGICAL = 'pharmacological',
  SURGICAL = 'surgical',
  BEHAVIORAL = 'behavioral',
  PREVENTIVE = 'preventive',
  DIAGNOSTIC = 'diagnostic',
  SUPPORTIVE = 'supportive'
}

// Citation formats supported by the service
export enum CitationFormat {
  AMA = 'ama',         // American Medical Association
  APA = 'apa',         // American Psychological Association
  VANCOUVER = 'vancouver', // Vancouver (ICMJE)
  HARVARD = 'harvard',
  PLAIN = 'plain'
}

/**
 * Interface for evidence with citation information
 */
export interface EvidenceWithCitation {
  evidence: ClinicalEvidence;
  citation: string;
  relevanceScore?: number;
}

/**
 * Interface for guideline with citation information
 */
export interface GuidelineWithCitation {
  guideline: ClinicalGuideline;
  citation: string;
  relevanceScore?: number;
}

/**
 * Find relevant studies based on search criteria
 * 
 * @param options Search options including query, category, and filters
 * @returns Array of matching evidence with relevance scores
 */
export function findRelevantStudies(options: EvidenceSearchOptions): EvidenceMatchResult[] {
  const { 
    query, 
    medicalCategory, 
    treatmentIds, 
    evidenceLevels, 
    maxResults = 5,
    sortBy = 'relevance'
  } = options;

  // Start with all studies
  let matchingStudies = [...studies];

  // Filter by medical category if provided
  if (medicalCategory) {
    matchingStudies = matchingStudies.filter(study => 
      study.tags.some(tag => tag.toLowerCase() === medicalCategory.toLowerCase())
    );
  }

  // Filter by treatment IDs if provided
  if (treatmentIds && treatmentIds.length > 0) {
    matchingStudies = matchingStudies.filter(study =>
      study.tags.some(tag => treatmentIds.includes(tag))
    );
  }

  // Filter by evidence levels if provided
  if (evidenceLevels && evidenceLevels.length > 0) {
    matchingStudies = matchingStudies.filter(study =>
      evidenceLevels.includes(study.evidenceLevel)
    );
  }

  // Calculate relevance score based on query keywords
  const keywordMatches = matchingStudies.map(study => {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);
    const matchedKeywords = keywords.filter(keyword => 
      study.title.toLowerCase().includes(keyword) || 
      study.summary.toLowerCase().includes(keyword) ||
      study.tags.some(tag => tag.toLowerCase().includes(keyword))
    );
    
    const titleMatches = keywords.filter(k => study.title.toLowerCase().includes(k)).length;
    const summaryMatches = keywords.filter(k => study.summary.toLowerCase().includes(k)).length;
    const tagMatches = study.tags.filter(tag => 
      keywords.some(k => tag.toLowerCase().includes(k))
    ).length;
    
    // Weight title matches higher than summary matches
    const relevanceScore = (titleMatches * 3 + summaryMatches + tagMatches * 2) / 
      (keywords.length * 6) * 
      (keywords.length > 0 ? 1 : 0.5);  // Penalize if no keywords found

    return {
      evidence: study,
      relevanceScore: Math.min(0.99, Math.max(0.1, relevanceScore)),
      matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : []
    };
  });

  // Sort by relevance or date
  if (sortBy === 'relevance') {
    keywordMatches.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else if (sortBy === 'date') {
    keywordMatches.sort((a, b) => 
      new Date(b.evidence.publicationDate).getTime() - 
      new Date(a.evidence.publicationDate).getTime()
    );
  } else if (sortBy === 'evidence_level') {
    // Sort by evidence level (META_ANALYSIS is highest)
    const levelOrder: Record<string, number> = {
      'META_ANALYSIS': 7,
      'SYSTEMATIC_REVIEW': 6,
      'RANDOMIZED_CONTROLLED_TRIAL': 5,
      'COHORT_STUDY': 4,
      'CASE_CONTROL': 3,
      'CASE_SERIES': 2,
      'EXPERT_OPINION': 1
    };
    
    keywordMatches.sort((a, b) => 
      levelOrder[b.evidence.evidenceLevel] - levelOrder[a.evidence.evidenceLevel]
    );
  }

  // Limit results
  return keywordMatches.slice(0, maxResults);
}

/**
 * Find applicable guidelines based on the medical category and query
 * 
 * @param options Search options for guidelines
 * @returns Array of matching guidelines
 */
export function findApplicableGuidelines(options: EvidenceSearchOptions): ClinicalGuideline[] {
  const { 
    query, 
    medicalCategory, 
    maxResults = 3,
    sortBy = 'relevance'
  } = options;

  // Start with all guidelines
  let matchingGuidelines = [...guidelines];

  // Filter by medical category if provided
  if (medicalCategory) {
    matchingGuidelines = matchingGuidelines.filter(guideline => 
      guideline.title.toLowerCase().includes(medicalCategory.toLowerCase()) ||
      guideline.recommendations.some(rec => 
        rec.text.toLowerCase().includes(medicalCategory.toLowerCase())
      )
    );
  }

  // Calculate relevance based on query
  const scoredGuidelines = matchingGuidelines.map(guideline => {
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 3);
    const titleMatches = keywords.filter(k => guideline.title.toLowerCase().includes(k)).length;
    const summaryMatches = keywords.filter(k => guideline.summary.toLowerCase().includes(k)).length;
    const recMatches = guideline.recommendations.filter(rec => 
      keywords.some(k => rec.text.toLowerCase().includes(k))
    ).length;
    
    const relevanceScore = (titleMatches * 3 + summaryMatches * 2 + recMatches) / 
      (keywords.length * 6) * 
      (keywords.length > 0 ? 1 : 0.5);

    return {
      guideline,
      relevanceScore: Math.min(0.99, Math.max(0.1, relevanceScore))
    };
  });

  // Sort by relevance or date
  if (sortBy === 'relevance') {
    scoredGuidelines.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } else if (sortBy === 'date') {
    scoredGuidelines.sort((a, b) => 
      new Date(b.guideline.lastUpdated).getTime() - 
      new Date(a.guideline.lastUpdated).getTime()
    );
  }

  // Return just the guidelines
  return scoredGuidelines.slice(0, maxResults).map(item => item.guideline);
}

/**
 * Get evidence with properly formatted citation
 * 
 * @param evidenceId ID of the evidence to retrieve
 * @param format Citation format to use
 * @returns Evidence with formatted citation or undefined if not found
 */
export function getEvidenceWithCitation(
  evidenceId: string, 
  format: CitationFormat = CitationFormat.AMA
): EvidenceWithCitation | undefined {
  const evidence = studies.find(study => study.id === evidenceId);
  
  if (!evidence) {
    return undefined;
  }
  
  // Find matching citation or generate one
  const citation = citations.find(cit => cit.sourceId === evidenceId && cit.format === format);
  
  if (citation) {
    return {
      evidence,
      citation: citation.formattedCitation
    };
  }
  
  // Generate basic citation if not found
  return {
    evidence,
    citation: generateBasicCitation(evidence, format)
  };
}

/**
 * Get guideline with properly formatted citation
 * 
 * @param guidelineId ID of the guideline to retrieve
 * @param format Citation format to use
 * @returns Guideline with formatted citation or undefined if not found
 */
export function getGuidelineWithCitation(
  guidelineId: string,
  format: CitationFormat = CitationFormat.AMA
): GuidelineWithCitation | undefined {
  const guideline = guidelines.find(g => g.id === guidelineId);
  
  if (!guideline) {
    return undefined;
  }
  
  // Find matching citation or generate one
  const citation = citations.find(cit => cit.sourceId === guidelineId && cit.format === format);
  
  if (citation) {
    return {
      guideline,
      citation: citation.formattedCitation
    };
  }
  
  // Generate basic citation if not found
  return {
    guideline,
    citation: generateBasicCitation(guideline, format)
  };
}

/**
 * Map treatment categories to relevant evidence
 * 
 * @param treatmentType Type of treatment
 * @param category Medical category
 * @returns Array of relevant evidence for the treatment and category
 */
export function mapTreatmentToEvidence(
  treatmentType: TreatmentType,
  category: EvidenceCategory
): EvidenceWithCitation[] {
  // Find studies relevant to this treatment type and category
  const relevantStudies = studies.filter(study => 
    study.tags.some(tag => tag.toLowerCase() === category) &&
    study.tags.some(tag => tag.toLowerCase() === treatmentType)
  );
  
  // Return with basic citations
  return relevantStudies.map(evidence => ({
    evidence,
    citation: generateBasicCitation(evidence, CitationFormat.AMA)
  }));
}

/**
 * Generate a basic citation in the specified format
 * 
 * @param source Evidence or guideline to cite
 * @param format Citation format
 * @returns Formatted citation string
 */
function generateBasicCitation(
  source: ClinicalEvidence | ClinicalGuideline,
  format: CitationFormat
): string {
  // Extract source information
  const title = source.title;
  const sourcePublication = 'source' in source ? source.source : source.organization;
  const date = 'publicationDate' in source 
    ? new Date(source.publicationDate) 
    : new Date(source.lastUpdated);
  const year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  
  // Format citation based on style
  switch (format) {
    case CitationFormat.AMA:
      return `${sourcePublication}. ${title}. Published ${month} ${day}, ${year}.`;
      
    case CitationFormat.APA:
      return `${sourcePublication}. (${year}, ${month} ${day}). ${title}.`;
      
    case CitationFormat.VANCOUVER:
      return `${sourcePublication}. ${title}. ${year} ${month} ${day}.`;
      
    case CitationFormat.HARVARD:
      return `${sourcePublication} (${year}) ${title}, ${day} ${month}.`;
      
    case CitationFormat.PLAIN:
    default:
      return `${title} - ${sourcePublication}, ${month} ${day}, ${year}`;
  }
}

/**
 * Track engagement with evidence materials
 * 
 * @param evidenceId ID of evidence engaged with
 * @param interactionType Type of interaction
 * @param anonymizedUser Anonymized user identifier
 */
export function trackEvidenceEngagement(
  evidenceId: string,
  interactionType: 'view' | 'click' | 'save' | 'share',
  anonymizedUser?: string
): void {
  // In a real implementation, this would send analytics data
  console.log(`Evidence engagement: ${interactionType} on ${evidenceId} by ${anonymizedUser || 'anonymous'}`);
  
  // For now, just track in memory
  const timestamp = new Date();
  const engagementRecord = {
    evidenceId,
    interactionType,
    timestamp,
    anonymizedUser: anonymizedUser || 'anonymous'
  };
  
  // This would typically be sent to an analytics service
} 