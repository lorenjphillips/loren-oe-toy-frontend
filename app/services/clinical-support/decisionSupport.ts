/**
 * Clinical Decision Support Service
 * 
 * A lightweight framework that identifies clinical decision support
 * opportunities based on medical questions and provides appropriate
 * clinical evidence and recommendations.
 */

import { 
  ClinicalEvidence, 
  ClinicalGuideline, 
  DecisionSupportContext,
  ClinicalDecisionSupportResponse,
  EvidenceLevel,
  RecommendationStrength,
  EvidenceQuality
} from '../../models/phase4';
import { 
  EvidenceSearchOptions, 
  EnhancedDecisionSupportResponse,
  EvidenceMatchResult 
} from '../../models/clinical-support';
import { mapQuestionToCompanies } from '../adMapping';
import { classifyMedicalQuestion } from '../classification';
import { getAdContentFromMapping } from '../adContentService';

// Evidence type definitions for lightweight implementation
export enum EvidenceType {
  STUDY = 'STUDY',
  GUIDELINE = 'GUIDELINE',
  REFERENCE = 'REFERENCE',
  CLINICAL_PATHWAY = 'CLINICAL_PATHWAY'
}

/**
 * Main entrypoint for the clinical decision support service
 * Takes a medical question and optional category context
 * Returns structured decision support with evidence and recommendations
 * 
 * @param question The medical question to analyze
 * @param category Optional medical category for context
 * @returns Decision support response with evidence and recommendations
 */
export async function getDecisionSupport(
  question: string,
  category?: string
): Promise<EnhancedDecisionSupportResponse> {
  // Step 1: Analyze the question to identify key clinical concepts
  const classification = category 
    ? { primaryCategory: { name: category } } 
    : await classifyMedicalQuestion(question);
  
  // Step 2: Create context from classification and question
  const context: DecisionSupportContext = {
    question,
    medicalCategory: classification.primaryCategory.name,
    subcategory: classification.subcategory?.name,
  };
  
  // Step 3: Identify the decision support opportunities
  const supportOpportunities = identifyDecisionSupportOpportunities(context);
  
  // Step 4: Determine relevant evidence types
  const relevantEvidenceTypes = determineEvidenceTypes(context, supportOpportunities);
  
  // Step 5: Retrieve matching evidence based on context
  const matchedEvidence = await findRelevantEvidence(context, relevantEvidenceTypes);
  
  // Step 6: Retrieve applicable clinical guidelines
  const guidelines = await findApplicableGuidelines(context);
  
  // Step 7: Map to appropriate content
  const mappingResult = mapQuestionToCompanies(classification);
  const adResponse = await getAdContentFromMapping(mappingResult);
  
  // Step 8: Generate recommended actions/next steps
  const nextSteps = generateRecommendedNextSteps(context, matchedEvidence, guidelines);
  
  // Step 9: Calculate contextual factors that influence the decision
  const contextualFactors = analyzeContextualFactors(context);
  
  // Step 10: Prepare final response with confidence scoring
  return {
    relevantEvidence: matchedEvidence.map(match => match.evidence),
    applicableGuidelines: guidelines,
    suggestedContent: adResponse.content,
    explanations: generateExplanations(context, matchedEvidence, guidelines),
    confidenceScore: calculateConfidenceScore(matchedEvidence, guidelines),
    contextualFactors,
    differentialOptions: adResponse.content,
    nextSteps
  };
}

/**
 * Identifies specific decision support opportunities in the clinical context
 * 
 * @param context The decision support context with question and categories
 * @returns Array of identified support opportunities
 */
function identifyDecisionSupportOpportunities(
  context: DecisionSupportContext
): string[] {
  const { question } = context;
  const opportunities: string[] = [];
  
  // Simple keyword-based identification of opportunities
  // In a production system, this would use NLP for better accuracy
  if (/treatment|therapy|approach|option|regimen|protocol/i.test(question)) {
    opportunities.push('TREATMENT_SELECTION');
  }
  
  if (/guideline|recommendation|consensus|standard of care/i.test(question)) {
    opportunities.push('GUIDELINE_APPLICATION');
  }
  
  if (/evidence|study|trial|research|data|outcome/i.test(question)) {
    opportunities.push('EVIDENCE_EVALUATION');
  }
  
  if (/diagnosis|differential|distinguish|differentiate|identify/i.test(question)) {
    opportunities.push('DIAGNOSTIC_ASSISTANCE');
  }
  
  if (/dosage|dose|administration|schedule|timing/i.test(question)) {
    opportunities.push('DOSING_GUIDANCE');
  }
  
  // Default to treatment selection if no specific opportunities identified
  if (opportunities.length === 0) {
    opportunities.push('TREATMENT_SELECTION');
  }
  
  return opportunities;
}

/**
 * Determines appropriate evidence types based on the context and support opportunities
 * 
 * @param context The decision support context
 * @param opportunities Identified support opportunities
 * @returns Array of evidence types most appropriate for the situation
 */
function determineEvidenceTypes(
  context: DecisionSupportContext,
  opportunities: string[]
): EvidenceType[] {
  const evidenceTypes: EvidenceType[] = [];
  
  // Map opportunities to evidence types
  if (opportunities.includes('TREATMENT_SELECTION')) {
    evidenceTypes.push(EvidenceType.STUDY, EvidenceType.GUIDELINE);
  }
  
  if (opportunities.includes('GUIDELINE_APPLICATION')) {
    evidenceTypes.push(EvidenceType.GUIDELINE, EvidenceType.CLINICAL_PATHWAY);
  }
  
  if (opportunities.includes('EVIDENCE_EVALUATION')) {
    evidenceTypes.push(EvidenceType.STUDY, EvidenceType.REFERENCE);
  }
  
  if (opportunities.includes('DIAGNOSTIC_ASSISTANCE')) {
    evidenceTypes.push(EvidenceType.CLINICAL_PATHWAY, EvidenceType.REFERENCE);
  }
  
  if (opportunities.includes('DOSING_GUIDANCE')) {
    evidenceTypes.push(EvidenceType.REFERENCE, EvidenceType.GUIDELINE);
  }
  
  // Ensure we have at least one evidence type
  if (evidenceTypes.length === 0) {
    evidenceTypes.push(EvidenceType.STUDY, EvidenceType.GUIDELINE);
  }
  
  return [...new Set(evidenceTypes)]; // Remove duplicates
}

/**
 * Finds relevant clinical evidence based on the context and evidence types
 * 
 * @param context The decision support context
 * @param evidenceTypes Types of evidence to prioritize
 * @returns Array of evidence matches with relevance scores
 */
async function findRelevantEvidence(
  context: DecisionSupportContext,
  evidenceTypes: EvidenceType[]
): Promise<EvidenceMatchResult[]> {
  // For this lightweight implementation, we'll use a simple mock approach
  // In a real implementation, this would call an evidence database or service API
  
  const { question, medicalCategory } = context;
  
  // Mock search options based on context
  const searchOptions: EvidenceSearchOptions = {
    query: question,
    medicalCategory,
    maxResults: 5,
    sortBy: 'relevance'
  };
  
  // Return mock evidence data
  return [
    {
      evidence: {
        id: 'ev-001',
        title: `Latest evidence on ${medicalCategory} treatments`,
        source: 'Journal of Medical Science',
        publicationDate: new Date('2023-10-15'),
        evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
        url: 'https://example.com/evidence/ev-001',
        summary: `Key findings related to ${medicalCategory} based on recent clinical trials.`,
        tags: [medicalCategory, 'treatment', 'clinical trial']
      },
      relevanceScore: 0.89,
      matchedKeywords: [medicalCategory, 'treatment']
    },
    {
      evidence: {
        id: 'ev-002',
        title: `Comparative effectiveness in ${medicalCategory}`,
        source: 'Medical Reviews International',
        publicationDate: new Date('2023-08-22'),
        evidenceLevel: EvidenceLevel.META_ANALYSIS,
        url: 'https://example.com/evidence/ev-002',
        summary: `This meta-analysis compares effectiveness of leading treatments for ${medicalCategory} conditions.`,
        tags: [medicalCategory, 'meta-analysis', 'comparative effectiveness']
      },
      relevanceScore: 0.76,
      matchedKeywords: [medicalCategory, 'effectiveness']
    }
  ];
}

/**
 * Finds applicable clinical guidelines for the given context
 * 
 * @param context The decision support context
 * @returns Array of applicable guidelines
 */
async function findApplicableGuidelines(
  context: DecisionSupportContext
): Promise<ClinicalGuideline[]> {
  // For this lightweight implementation, we'll use a simple mock approach
  // In a real implementation, this would call a guidelines database or service API
  
  const { medicalCategory } = context;
  
  // Return mock guideline data
  return [
    {
      id: 'gl-001',
      title: `Clinical Practice Guidelines for ${medicalCategory}`,
      organization: 'American Medical Association',
      publicationDate: new Date('2022-06-10'),
      lastUpdated: new Date('2023-01-15'),
      url: 'https://example.com/guidelines/gl-001',
      summary: `Comprehensive guidelines for the diagnosis and management of ${medicalCategory} conditions.`,
      recommendations: [
        {
          id: 'rec-001',
          text: `First-line treatment for ${medicalCategory} should include assessment of comorbidities and risk factors.`,
          strengthOfRecommendation: RecommendationStrength.STRONG,
          evidenceQuality: EvidenceQuality.HIGH
        },
        {
          id: 'rec-002',
          text: `Regular monitoring is recommended for patients with ${medicalCategory} receiving treatment.`,
          strengthOfRecommendation: RecommendationStrength.MODERATE,
          evidenceQuality: EvidenceQuality.MODERATE
        }
      ]
    }
  ];
}

/**
 * Generates recommendations for next steps based on evidence and guidelines
 * 
 * @param context The decision support context
 * @param evidence Matched evidence results
 * @param guidelines Applicable clinical guidelines
 * @returns Array of recommended next steps
 */
function generateRecommendedNextSteps(
  context: DecisionSupportContext,
  evidence: EvidenceMatchResult[],
  guidelines: ClinicalGuideline[]
): string[] {
  // Extract recommendations from guidelines
  const guidelineRecommendations = guidelines
    .flatMap(g => g.recommendations)
    .filter(r => r.strengthOfRecommendation === RecommendationStrength.STRONG || 
                r.strengthOfRecommendation === RecommendationStrength.MODERATE);
  
  // Generate next steps based on available data
  const nextSteps: string[] = [];
  
  if (guidelineRecommendations.length > 0) {
    nextSteps.push('Review the clinical practice guidelines for specific recommendations');
  }
  
  if (evidence.length > 0) {
    nextSteps.push('Consider the latest clinical evidence when making treatment decisions');
  }
  
  // Add general next steps
  nextSteps.push('Evaluate potential treatment options based on patient-specific factors');
  nextSteps.push('Document clinical reasoning in the medical record');
  
  return nextSteps;
}

/**
 * Analyzes contextual factors that might influence clinical decisions
 * 
 * @param context The decision support context
 * @returns Array of contextual factors with their impact
 */
function analyzeContextualFactors(
  context: DecisionSupportContext
): Array<{factor: string, impact: string}> {
  const { patientFactors } = context;
  const factors: Array<{factor: string, impact: string}> = [];
  
  // Add medical category as a factor
  factors.push({
    factor: `Medical category: ${context.medicalCategory}`,
    impact: 'Determines relevant clinical guidelines and evidence'
  });
  
  // Add patient-specific factors if available
  if (patientFactors && patientFactors.length > 0) {
    patientFactors.forEach(pf => {
      factors.push({
        factor: `${pf.factor}: ${pf.value}`,
        impact: 'May influence treatment selection and dosing'
      });
    });
  }
  
  return factors;
}

/**
 * Generates explanations based on the evidence and guidelines
 * 
 * @param context The decision support context
 * @param evidence Matched evidence results
 * @param guidelines Applicable clinical guidelines
 * @returns Array of explanation strings
 */
function generateExplanations(
  context: DecisionSupportContext,
  evidence: EvidenceMatchResult[],
  guidelines: ClinicalGuideline[]
): string[] {
  const explanations: string[] = [];
  
  // Add evidence-based explanations
  if (evidence.length > 0) {
    explanations.push(
      `The decision support is based on ${evidence.length} relevant clinical studies, ` +
      `with the highest evidence level being ${evidence[0].evidence.evidenceLevel}.`
    );
  }
  
  // Add guideline-based explanations
  if (guidelines.length > 0) {
    explanations.push(
      `${guidelines.length} clinical practice guidelines from ${guidelines.map(g => g.organization).join(', ')} ` +
      `were considered in generating these recommendations.`
    );
  }
  
  return explanations;
}

/**
 * Calculates a confidence score for the decision support response
 * 
 * @param evidence Matched evidence results
 * @param guidelines Applicable clinical guidelines
 * @returns A confidence score between 0 and 1
 */
function calculateConfidenceScore(
  evidence: EvidenceMatchResult[],
  guidelines: ClinicalGuideline[]
): number {
  // Evidence contributes 60% to the confidence score
  const evidenceScore = evidence.length > 0
    ? evidence.reduce((sum, e) => sum + e.relevanceScore, 0) / evidence.length * 0.6
    : 0;
  
  // Guidelines contribute 40% to the confidence score
  const guidelineScore = guidelines.length > 0
    ? (guidelines.length > 2 ? 1 : guidelines.length / 2) * 0.4
    : 0;
  
  return Math.min(1, evidenceScore + guidelineScore);
} 