/**
 * Ethical Guardrails Service
 * 
 * Provides ethical checks for ad content to ensure it meets ethical standards
 * and is appropriate for the user's context.
 */

import { MedicalClassification } from '../classification';

// Basic interface for ad content
interface AdContent {
  id: string;
  name: string;
  title: string;
  description: string;
  company: {
    id: string;
    name: string;
  };
  treatmentCategory: {
    id: string;
    name: string;
  };
  tags?: string[];
  contentWarnings?: string[];
  creative?: {
    headline: string;
    bodyText: string;
  };
}

interface EthicalCheckResult {
  passed: boolean;
  warnings: string[];
  score?: number;
}

/**
 * Sensitive topics that require special handling
 */
const SENSITIVE_TOPICS = [
  'mental_health',
  'addiction',
  'terminal_illness',
  'reproductive_health',
  'genetic_disorders',
  'rare_diseases',
  'pediatric_conditions'
];

/**
 * Prohibited content categories
 */
const PROHIBITED_CONTENT = [
  'unproven_claims',
  'misleading_statistics',
  'false_testimonials',
  'fear_exploitation',
  'inappropriate_targeting'
];

/**
 * Run an ethical check on ad content to ensure it's appropriate
 * for the given question and medical classification
 */
export async function runEthicalCheck(
  adContent: AdContent,
  question: string,
  classification: MedicalClassification
): Promise<EthicalCheckResult> {
  const warnings: string[] = [];
  let score = 100; // Start with perfect score
  
  // Check for sensitive topics in classification
  const categories = (classification as any).categories || [];
  const isSensitiveTopic = SENSITIVE_TOPICS.some(topic => 
    categories.some((cat: any) => 
      cat.id && cat.id.includes(topic)
    )
  );
  
  // Check if ad content has explicit warnings
  if (adContent.contentWarnings && adContent.contentWarnings.length > 0) {
    warnings.push(...adContent.contentWarnings.map(warning => 
      `Content warning: ${warning}`
    ));
    score -= 10 * adContent.contentWarnings.length;
  }
  
  // Check for inappropriate targeting in sensitive topics
  if (isSensitiveTopic) {
    warnings.push('Ad appears in context of a sensitive medical topic');
    score -= 15;
    
    // Additional check for sensitive + commercial intent
    const intent = (classification as any).intent;
    if (intent === 'commercial' || intent === 'purchase') {
      warnings.push('Commercial intent detected in sensitive topic context');
      score -= 25;
    }
  }
  
  // Check age-appropriateness if age is mentioned in question
  if (question.toLowerCase().includes('child') || 
      question.toLowerCase().includes('teen') || 
      question.toLowerCase().includes('kid')) {
    
    if (!adContent.tags?.includes('pediatric_approved')) {
      warnings.push('Ad may not be appropriate for pediatric context');
      score -= 30;
    }
  }
  
  // Check for prohibited content tags
  const hasProhibitedContent = adContent.tags?.some(tag => 
    PROHIBITED_CONTENT.includes(tag)
  );
  
  if (hasProhibitedContent) {
    warnings.push('Ad contains potentially prohibited content');
    score -= 50;
  }
  
  // Determine if the ad passes the ethical check
  const passed = score >= 70 && !hasProhibitedContent;
  
  return {
    passed,
    warnings,
    score
  };
}

/**
 * Utility function to detect potential ethical issues in a question
 */
export function detectEthicalIssuesInQuestion(
  question: string
): string[] {
  const issues: string[] = [];
  const lowerQuestion = question.toLowerCase();
  
  // Check for potential sensitive topics
  if (lowerQuestion.includes('suicide') || lowerQuestion.includes('self harm')) {
    issues.push('Crisis/mental health emergency detected');
  }
  
  if (lowerQuestion.includes('abuse') || lowerQuestion.includes('violence')) {
    issues.push('Potential abuse situation detected');
  }
  
  if (lowerQuestion.includes('illegal') || lowerQuestion.includes('illicit drug')) {
    issues.push('Question may involve illegal activities');
  }
  
  // Add more pattern matching as needed
  
  return issues;
} 