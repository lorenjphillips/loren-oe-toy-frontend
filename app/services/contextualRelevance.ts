import OpenAI from 'openai';
import { MedicalClassification } from './classification';

/**
 * Question intent types
 */
export enum QuestionIntent {
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  MECHANISM = 'mechanism',
  RESEARCH = 'research',
  GUIDELINE = 'guideline', 
  DIFFERENTIAL = 'differential',
  MANAGEMENT = 'management',
  PREVENTION = 'prevention',
  PROGNOSIS = 'prognosis',
  TESTING = 'testing'
}

/**
 * Clinical context types
 */
export enum ClinicalContext {
  EMERGENCY = 'emergency',
  ACUTE = 'acute',
  CHRONIC = 'chronic',
  PREVENTATIVE = 'preventative',
  FOLLOW_UP = 'follow_up',
  RESEARCH = 'research',
  EDUCATION = 'education'
}

/**
 * Complexity levels for questions
 */
export enum ComplexityLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

/**
 * Content formats best suited for different scenarios
 */
export enum ContentFormat {
  TEXT = 'text',
  VIDEO = 'video',
  INTERACTIVE = 'interactive',
  MICROSIMULATION = 'microsimulation',
  CLINICAL_TRIAL = 'clinical_trial', 
  DECISION_TREE = 'decision_tree',
  CASE_STUDY = 'case_study',
  INFOGRAPHIC = 'infographic'
}

/**
 * Interface for relevance scores for different content types
 */
export interface ContentRelevanceScores {
  [ContentFormat.TEXT]: number;
  [ContentFormat.VIDEO]: number;
  [ContentFormat.INTERACTIVE]: number;
  [ContentFormat.MICROSIMULATION]: number;
  [ContentFormat.CLINICAL_TRIAL]: number;
  [ContentFormat.DECISION_TREE]: number;
  [ContentFormat.CASE_STUDY]: number;
  [ContentFormat.INFOGRAPHIC]: number;
}

/**
 * Result of contextual relevance analysis
 */
export interface ContextualRelevanceResult {
  questionIntent: QuestionIntent;
  clinicalContext: ClinicalContext;
  complexityLevel: ComplexityLevel;
  specificity: number; // 0-100 scale
  practicalityScore: number; // 0-100 scale
  urgencyScore: number; // 0-100 scale
  contentRelevanceScores: ContentRelevanceScores;
  estimatedResponseTime: number; // In seconds
  keyContextualFactors: string[];
  targetSpecialties: string[];
  detectedPatientDemographics?: {
    age?: string;
    gender?: string;
    riskFactors?: string[];
  };
}

/**
 * Options for contextual relevance analysis
 */
export interface ContextualRelevanceOptions {
  model?: string;
  temperature?: number;
  includeRawResponse?: boolean;
}

/**
 * Service for analyzing contextual relevance of medical questions
 */
export class ContextualRelevanceAnalyzer {
  private openai: OpenAI;
  private defaultOptions: ContextualRelevanceOptions;

  /**
   * Creates a new ContextualRelevanceAnalyzer
   */
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    
    this.defaultOptions = {
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: 0.1,
      includeRawResponse: false
    };
  }

  /**
   * Analyzes a medical question for contextual relevance factors
   * 
   * @param question The medical question to analyze
   * @param classification Optional pre-generated classification
   * @param options Analysis options
   * @returns Detailed contextual relevance analysis
   */
  async analyzeContextualRelevance(
    question: string,
    classification?: MedicalClassification,
    options: ContextualRelevanceOptions = {}
  ): Promise<ContextualRelevanceResult> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Construct the prompt for OpenAI
      const prompt = `
As a medical contextual analysis system for a physician-focused educational platform, analyze the following medical question:

QUESTION: "${question}"

${classification ? `
PREVIOUS CLASSIFICATION DATA:
Primary Category: ${classification.primaryCategory.name} (${classification.primaryCategory.id})
Subcategory: ${classification.subcategory.name} (${classification.subcategory.id})
Keywords: ${classification.keywords.join(', ')}
${classification.relevantMedications ? `Relevant Medications: ${classification.relevantMedications.join(', ')}` : ''}
` : ''}

Provide a detailed contextual analysis in JSON format with the following structure:
{
  "questionIntent": "diagnosis", // One of: diagnosis, treatment, mechanism, research, guideline, differential, management, prevention, prognosis, testing
  "clinicalContext": "acute", // One of: emergency, acute, chronic, preventative, follow_up, research, education
  "complexityLevel": "intermediate", // One of: basic, intermediate, advanced, expert
  "specificity": 85, // 0-100 scale where 100 is highly specific
  "practicalityScore": 90, // 0-100 scale where 100 is directly applicable to clinical practice
  "urgencyScore": 70, // 0-100 scale where 100 is extremely urgent
  "contentRelevanceScores": {
    "text": 85, // 0-100 relevance for text-based content
    "video": 60, // 0-100 relevance for video content
    "interactive": 70, // 0-100 relevance for interactive tools
    "microsimulation": 80, // 0-100 relevance for clinical microsimulations
    "clinical_trial": 50, // 0-100 relevance for clinical trial information
    "decision_tree": 75, // 0-100 relevance for decision tree algorithms
    "case_study": 65, // 0-100 relevance for case studies
    "infographic": 55 // 0-100 relevance for infographics
  },
  "estimatedResponseTime": 120, // Estimated seconds needed to properly answer this question
  "keyContextualFactors": ["factor1", "factor2", "factor3"], // 3-5 key factors that affect the contextual relevance
  "targetSpecialties": ["specialty1", "specialty2"], // 1-3 medical specialties most relevant to this question
  "detectedPatientDemographics": { // Optional, only if present in the question
    "age": "65+",
    "gender": "female",
    "riskFactors": ["hypertension", "diabetes"]
  }
}

Instructions:
1. Carefully analyze the question's intent, clinical context, and complexity level
2. Assess how specific vs. general the question is
3. Evaluate which content formats would be most effective for this type of question
4. Estimate how urgent/time-sensitive this question might be in clinical practice
5. Consider which medical specialties would find this question most relevant
6. Extract any patient demographic information if present in the question
7. Provide relevance scores that can guide content adaptation

Your response must be valid JSON with the exact structure shown above.
`;

      // Call OpenAI API
      const chatCompletion = await this.openai.chat.completions.create({
        model: mergedOptions.model!,
        temperature: mergedOptions.temperature!,
        messages: [
          { role: 'system', content: prompt },
        ],
        response_format: { type: 'json_object' },
      });

      // Extract the content from the response
      const content = chatCompletion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      // Parse the JSON response
      const responseData = JSON.parse(content);
      
      // Return the parsed response
      return {
        questionIntent: responseData.questionIntent,
        clinicalContext: responseData.clinicalContext,
        complexityLevel: responseData.complexityLevel,
        specificity: responseData.specificity,
        practicalityScore: responseData.practicalityScore,
        urgencyScore: responseData.urgencyScore,
        contentRelevanceScores: responseData.contentRelevanceScores,
        estimatedResponseTime: responseData.estimatedResponseTime,
        keyContextualFactors: responseData.keyContextualFactors,
        targetSpecialties: responseData.targetSpecialties,
        detectedPatientDemographics: responseData.detectedPatientDemographics
      };
    } catch (error) {
      console.error('[ContextualRelevanceAnalyzer] Error analyzing question:', error);
      throw error;
    }
  }

  /**
   * Calculates a weighted relevance score for a question's match to specific ad content
   * 
   * @param relevanceResult Result from contextual relevance analysis
   * @param categories Ad categories to match against
   * @param contentType Type of content in the ad
   * @returns Weighted relevance score (0-100)
   */
  calculateContentRelevance(
    relevanceResult: ContextualRelevanceResult,
    categories: string[],
    contentType: ContentFormat
  ): number {
    // Base score from content format relevance
    const baseScore = relevanceResult.contentRelevanceScores[contentType] || 0;
    
    // Adjust based on practicality for clinical use
    const practicalityFactor = relevanceResult.practicalityScore / 100;
    
    // Calculate final score
    let finalScore = baseScore * practicalityFactor;
    
    // Adjust based on question intent
    switch (relevanceResult.questionIntent) {
      case QuestionIntent.TREATMENT:
        if (contentType === ContentFormat.CLINICAL_TRIAL || 
            contentType === ContentFormat.DECISION_TREE) {
          finalScore *= 1.2; // Boost for treatment-related content
        }
        break;
      case QuestionIntent.DIAGNOSIS:
        if (contentType === ContentFormat.DECISION_TREE || 
            contentType === ContentFormat.CASE_STUDY) {
          finalScore *= 1.15; // Boost for diagnostic content
        }
        break;
      case QuestionIntent.MECHANISM:
        if (contentType === ContentFormat.VIDEO || 
            contentType === ContentFormat.INFOGRAPHIC) {
          finalScore *= 1.1; // Boost for explanatory content
        }
        break;
      case QuestionIntent.RESEARCH:
        if (contentType === ContentFormat.CLINICAL_TRIAL) {
          finalScore *= 1.3; // Significant boost for research questions
        }
        break;
    }
    
    // Adjust based on complexity level
    switch (relevanceResult.complexityLevel) {
      case ComplexityLevel.BASIC:
        if (contentType === ContentFormat.INFOGRAPHIC || 
            contentType === ContentFormat.TEXT) {
          finalScore *= 1.1; // Boost for simpler content formats
        }
        break;
      case ComplexityLevel.ADVANCED:
      case ComplexityLevel.EXPERT:
        if (contentType === ContentFormat.MICROSIMULATION || 
            contentType === ContentFormat.CLINICAL_TRIAL) {
          finalScore *= 1.2; // Boost for advanced content formats
        }
        break;
    }
    
    // Cap at 100
    return Math.min(Math.round(finalScore), 100);
  }
}

/**
 * Convenience function to analyze contextual relevance
 * 
 * @param question The medical question to analyze
 * @param classification Optional pre-generated classification
 * @param options Analysis options
 * @returns Detailed contextual relevance analysis
 */
export async function analyzeQuestionContext(
  question: string,
  classification?: MedicalClassification,
  options: ContextualRelevanceOptions = {}
): Promise<ContextualRelevanceResult> {
  const analyzer = new ContextualRelevanceAnalyzer();
  return analyzer.analyzeContextualRelevance(question, classification, options);
} 