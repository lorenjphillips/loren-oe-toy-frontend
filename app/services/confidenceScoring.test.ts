import { enhanceMappingConfidence, shouldShowAd } from './confidenceScoring';
import { mapQuestionToCompanies } from './adMapping';
import { MedicalClassification } from './classification';

/**
 * Test cases for the confidence scoring system
 */
describe('Confidence Scoring System', () => {
  // Test classification for a highly specific cardiology question
  const specificCardioQuestion = "What is the latest evidence on sacubitril/valsartan in patients with HFrEF who are already on optimal medical therapy?";
  const specificCardioClassification: MedicalClassification = {
    primaryCategory: {
      id: 'cardiology',
      name: 'Cardiology',
      confidence: 0.92
    },
    subcategory: {
      id: 'heart_failure',
      name: 'Heart Failure',
      confidence: 0.88
    },
    keywords: ['heart failure', 'reduced ejection fraction', 'ACE inhibitors'],
    relevantMedications: ['lisinopril', 'metoprolol', 'furosemide'],
    categories: ['cardiology', 'heart_failure', 'medication']
  };
  
  // Test classification for a general non-specific pulmonology question
  const generalQuestion = "What are the basics of asthma management?";
  const generalClassification: MedicalClassification = {
    primaryCategory: {
      id: 'cardiology',
      name: 'Cardiology',
      confidence: 0.75
    },
    subcategory: {
      id: 'general',
      name: 'General Cardiology',
      confidence: 0.65
    },
    keywords: ['heart', 'cardiology', 'chest pain'],
    relevantMedications: [],
    categories: ['cardiology', 'general']
  };
  
  // Test classification for an ambiguous question
  const ambiguousQuestion = "What are the common side effects?";
  const ambiguousClassification: MedicalClassification = {
    primaryCategory: {
      id: 'multiple',
      name: 'Multiple Specialties',
      confidence: 0.45
    },
    subcategory: {
      id: 'unclear',
      name: 'Unclear Subcategory',
      confidence: 0.35
    },
    keywords: ['fatigue', 'pain', 'headache', 'general'],
    relevantMedications: [],
    categories: ['general', 'multiple']
  };

  test('Should give high confidence to specific questions with medication matches', async () => {
    // Map the classification to companies
    const mappingResult = mapQuestionToCompanies(specificCardioClassification);
    
    // Enhance with confidence scoring
    const enhancedResult = await enhanceMappingConfidence(
      mappingResult,
      specificCardioQuestion,
      { semanticAnalysis: false } // Disable semantic analysis for test speed
    );
    
    // Check that we got enhanced results
    expect(enhancedResult.matches.length).toBeGreaterThan(0);
    expect(enhancedResult.overallConfidence).toBeGreaterThan(0.75);
    expect(enhancedResult.adRecommended).toBe(true);
    
    // Verify confidence factors for top match
    const topMatch = enhancedResult.topMatch!;
    expect(topMatch.confidenceScore).toBeGreaterThan(0.75);
    expect(topMatch.shouldShowAd).toBe(true);
    expect(topMatch.confidenceFactors.categoryMatchScore).toBeGreaterThan(0.8);
    expect(topMatch.confidenceFactors.medicationMatchScore).toBeGreaterThan(0.5);
    
    // Verify the shouldShowAd utility function
    expect(shouldShowAd(enhancedResult)).toBe(true);
  });
  
  test('Should give moderate confidence to general questions without specific medications', async () => {
    // Map the classification to companies
    const mappingResult = mapQuestionToCompanies(generalClassification);
    
    // Enhance with confidence scoring
    const enhancedResult = await enhanceMappingConfidence(
      mappingResult,
      generalQuestion,
      { semanticAnalysis: false } // Disable semantic analysis for test speed
    );
    
    // Verify confidence is in the medium range
    expect(enhancedResult.overallConfidence).toBeLessThan(0.75);
    expect(enhancedResult.overallConfidence).toBeGreaterThan(0.4);
    
    // Verify the shouldShowAd function with different thresholds
    expect(shouldShowAd(enhancedResult, 0.4)).toBe(true);
    expect(shouldShowAd(enhancedResult, 0.8)).toBe(false);
  });
  
  test('Should give low confidence to ambiguous questions', async () => {
    // Map the classification to companies
    const mappingResult = mapQuestionToCompanies(ambiguousClassification);
    
    // Enhance with confidence scoring
    const enhancedResult = await enhanceMappingConfidence(
      mappingResult, 
      ambiguousQuestion,
      { semanticAnalysis: false } // Disable semantic analysis for test speed
    );
    
    // Verify confidence is low
    expect(enhancedResult.overallConfidence).toBeLessThan(0.4);
    expect(enhancedResult.adRecommended).toBe(false);
    
    // No ads should be shown
    expect(shouldShowAd(enhancedResult)).toBe(false);
  });
  
  test('Question specificity analyzer should detect specific vs general questions', async () => {
    // Create an instance of the confidence scorer to access private methods (only for testing)
    const { confidenceScorer } = require('./confidenceScoring');
    
    // Test the specific question
    const specificResult = confidenceScorer.analyzeQuestionContext(
      specificCardioQuestion,
      specificCardioClassification
    );
    expect(specificResult.specificityScore).toBeGreaterThan(0.7);
    
    // Test the general question
    const generalResult = confidenceScorer.analyzeQuestionContext(
      generalQuestion,
      generalClassification
    );
    expect(generalResult.specificityScore).toBeLessThan(0.6);
    
    // Test the ambiguous question
    const ambiguousResult = confidenceScorer.analyzeQuestionContext(
      ambiguousQuestion,
      ambiguousClassification
    );
    expect(ambiguousResult.specificityScore).toBeLessThan(0.4);
  });
  
  test('Clinical context analyzer should identify treatment-related questions', async () => {
    // Create an instance of the confidence scorer to access private methods (only for testing)
    const { confidenceScorer } = require('./confidenceScoring');
    
    // Test a treatment-focused question
    const treatmentQuestion = "What is the appropriate dose of lisinopril for a patient with stage 2 hypertension?";
    const treatmentClassification: MedicalClassification = {
      primaryCategory: {
        id: 'oncology',
        name: 'Oncology',
        confidence: 0.95
      },
      subcategory: {
        id: 'breast_cancer',
        name: 'Breast Cancer',
        confidence: 0.92
      },
      keywords: ['HER2+', 'breast cancer', 'metastatic', 'treatment options'],
      relevantMedications: ['trastuzumab', 'pertuzumab', 'TDM-1'],
      categories: ['oncology', 'breast_cancer', 'treatment']
    };
    
    const contextResult = confidenceScorer.analyzeQuestionContext(
      treatmentQuestion,
      treatmentClassification
    );
    
    // Should have high clinical context score due to treatment focus and medication
    expect(contextResult.clinicalContextScore).toBeGreaterThan(0.7);
  });
}); 