/**
 * Mock Clinical Decision Support Service
 * 
 * Provides mock clinical information for development purposes
 */

import { EnhancedDecisionSupportResponse } from '../../models/clinical-support';
import { AdContent } from '../../models/adTypes';

/**
 * Get mock decision support data
 */
export async function getDecisionSupport(
  question: string,
  medicalCategory?: string
): Promise<EnhancedDecisionSupportResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock response based on question and medical category
  const currentDate = new Date().toISOString();
  
  return {
    recommendations: [
      {
        text: `Based on your question about ${question.substring(0, 15)}...`,
        strengthOfRecommendation: 'Strong',
        qualityOfEvidence: 'High',
        source: 'Clinical Practice Guidelines'
      },
      {
        text: 'Consider relevant patient factors when making treatment decisions.',
        strengthOfRecommendation: 'Moderate',
        qualityOfEvidence: 'Moderate',
        source: 'Expert Consensus'
      }
    ],
    evidence: [
      {
        title: `Recent evidence on ${medicalCategory || 'general healthcare'}`,
        summary: 'Clinical trials have shown improved outcomes with newer treatment approaches.',
        publicationDate: currentDate,
        authors: ['Smith, J.', 'Johnson, M.'],
        journal: 'Journal of Clinical Medicine',
        evidenceLevel: 'Level 1',
        url: 'https://example.com/evidence1'
      },
      {
        title: 'Meta-analysis of treatment outcomes',
        summary: 'Systematic review of interventions shows variable results depending on patient factors.',
        publicationDate: currentDate,
        authors: ['Brown, A.', 'Davis, R.'],
        journal: 'Medical Research Review',
        evidenceLevel: 'Level 2',
        url: 'https://example.com/evidence2'
      }
    ],
    guidelines: [
      {
        title: `${medicalCategory || 'Medical'} Treatment Guidelines`,
        organization: 'National Medical Association',
        publicationDate: currentDate,
        summary: 'Evidence-based recommendations for clinical practice.',
        recommendationStrength: 'Strong',
        evidenceQuality: 'High',
        url: 'https://example.com/guideline1'
      }
    ],
    decisionalContext: {
      patientFactors: ['Consider patient preferences', 'Assess comorbidities'],
      clinicalFactors: ['Evaluate disease severity', 'Consider treatment history'],
      systemicFactors: ['Resource availability', 'Access to specialists']
    },
    confidenceScore: 0.85,
    contextualFactors: [
      { factor: 'Patient Age', impact: 'May influence treatment tolerance' },
      { factor: 'Comorbidities', impact: 'May require treatment adjustments' }
    ],
    differentialOptions: [] as AdContent[],
    nextSteps: [
      'Discuss options with the patient',
      'Consider specialist consultation if needed',
      'Schedule follow-up to assess treatment response'
    ]
  };
} 