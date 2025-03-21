/**
 * Context Processor
 * 
 * Extracts and normalizes medical context from questions and content.
 * Maintains HIPAA compliance by removing any PII/PHI and focusing only
 * on medical terminology and concepts.
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  AnalyticsEvent, 
  AnalyticsEventCategory, 
  createAnalyticsEvent 
} from '../../../models/analytics/AnalyticsEvent';
import {
  MedicalSpecialty,
  QuestionIntent,
  QuestionComplexity,
  QuestionContextData,
  QuestionContextEvent,
  AdQuestionRelevanceMetrics
} from '../../../models/analytics/QuestionContextMetrics';
import * as DataStore from '../dataStore';
import { AdContent } from '../../../models/adTypes';

// Simple medical term normalization lookup
const MEDICAL_TERM_NORMALIZATION: Record<string, string> = {
  'heart attack': 'myocardial infarction',
  'heart failure': 'cardiac insufficiency',
  'high blood pressure': 'hypertension',
  'stroke': 'cerebrovascular accident',
  'diabetes': 'diabetes mellitus',
  'sugar': 'glucose',
  'cancer': 'malignant neoplasm',
  'kidney failure': 'renal insufficiency',
  'liver disease': 'hepatic disorder',
  'stomach pain': 'abdominal pain',
  'headache': 'cephalgia',
  'skin rash': 'dermatitis',
  'breathing problems': 'respiratory difficulty',
  'depression': 'major depressive disorder',
  'anxiety': 'anxiety disorder'
};

/**
 * Extract and analyze medical context from a question
 */
export function analyzeQuestionContext(
  questionId: string,
  questionText: string,
  additionalContext?: Record<string, any>
): string {
  // Create a sanitized version of the question text
  const sanitizedQuestion = sanitizeText(questionText);
  
  // Extract medical categories
  const medicalCategories = extractMedicalCategories(sanitizedQuestion);
  
  // Extract disease states
  const diseaseStates = extractDiseaseStates(sanitizedQuestion);
  
  // Extract treatment types
  const treatmentTypes = extractTreatmentTypes(sanitizedQuestion);
  
  // Extract medications
  const medications = extractMedications(sanitizedQuestion);
  
  // Determine medical specialty
  const specialty = determineMedicalSpecialty(
    sanitizedQuestion, 
    medicalCategories, 
    diseaseStates
  );
  
  // Determine question intent
  const intent = determineQuestionIntent(sanitizedQuestion);
  
  // Determine question complexity
  const complexity = determineQuestionComplexity(
    sanitizedQuestion,
    medicalCategories,
    diseaseStates,
    medications
  );
  
  // Check if question contains patient context
  const containsPatientContext = checkForPatientContext(sanitizedQuestion);
  
  // Extract patient context (safely anonymized)
  const patientContext = containsPatientContext ? 
    extractPatientContext(sanitizedQuestion) : 
    undefined;
  
  // Create question context data
  const contextData: QuestionContextData = {
    questionId,
    timestamp: Date.now(),
    specialty,
    intent,
    complexity,
    medicalCategories,
    diseaseStates,
    treatmentTypes,
    medications,
    wordCount: countWords(sanitizedQuestion),
    containsPatientContext,
    patientContext,
    keywordDensity: calculateKeywordDensity(sanitizedQuestion)
  };
  
  // Create context event
  const event: QuestionContextEvent = createAnalyticsEvent(
    'question_context_analyzed',
    AnalyticsEventCategory.CONTEXT,
    {
      page: 'question',
      component: 'question_analyzer'
    },
    contextData
  ) as QuestionContextEvent;
  
  // Store the event
  DataStore.storeEvent(event);
  
  // Update aggregates
  updateContextAggregates(contextData);
  
  return questionId;
}

/**
 * Analyze ad relevance to a specific question context
 */
export function analyzeAdQuestionRelevance(
  adContent: AdContent,
  questionId: string,
  questionContextData: QuestionContextData
): AdQuestionRelevanceMetrics {
  const treatmentCategory = adContent.treatmentCategory;
  const medicalCategory = treatmentCategory.medicalCategory;
  
  // Calculate component relevance scores
  const medicalCategoryRelevance = calculateCategoryRelevance(
    medicalCategory,
    questionContextData.medicalCategories
  );
  
  const treatmentTypeRelevance = calculateTreatmentRelevance(
    treatmentCategory.id,
    treatmentCategory.name,
    questionContextData.treatmentTypes
  );
  
  const diseaseStateRelevance = calculateDiseaseStateRelevance(
    adContent.targetConditions || [],
    questionContextData.diseaseStates
  );
  
  const specialtyRelevance = calculateSpecialtyRelevance(
    treatmentCategory.relevantSpecialties || [],
    questionContextData.specialty
  );
  
  // Calculate semantic similarity (simplified version)
  const semanticSimilarity = calculateSemanticSimilarity(
    adContent.keywords || [],
    questionContextData
  );
  
  // Count keyword matches
  const keywordMatchCount = countKeywordMatches(
    adContent.keywords || [],
    questionContextData
  );
  
  // Count entity matches
  const entityMatchCount = countEntityMatches(
    adContent.entityMappings || [],
    questionContextData
  );
  
  // Calculate overall relevance score
  const overallRelevanceScore = calculateOverallRelevance([
    { score: medicalCategoryRelevance, weight: 0.25 },
    { score: treatmentTypeRelevance, weight: 0.25 },
    { score: diseaseStateRelevance, weight: 0.2 },
    { score: specialtyRelevance, weight: 0.1 },
    { score: semanticSimilarity, weight: 0.2 }
  ]);
  
  // Create relevance metrics
  const relevanceMetrics: AdQuestionRelevanceMetrics = {
    adId: adContent.id,
    questionId: questionContextData.questionId,
    overallRelevanceScore,
    medicalCategoryRelevance,
    treatmentTypeRelevance,
    diseaseStateRelevance,
    specialtyRelevance,
    semanticSimilarity,
    contextualFit: overallRelevanceScore, // Simplified, could be more complex
    keywordMatchCount,
    entityMatchCount,
    algorithmConfidence: calculateConfidence(overallRelevanceScore, keywordMatchCount, entityMatchCount)
  };
  
  // Create context relevance event
  const event = createAnalyticsEvent(
    'ad_question_relevance_analyzed',
    AnalyticsEventCategory.CONTEXT,
    {
      component: 'relevance_analyzer'
    },
    relevanceMetrics
  );
  
  // Store the event
  DataStore.storeEvent(event);
  
  return relevanceMetrics;
}

/**
 * Sanitize text by removing PII/PHI indicators
 * This is a simplified implementation - a real version would be more comprehensive
 */
function sanitizeText(text: string): string {
  let sanitized = text;
  
  // Replace patterns that might contain PHI
  sanitized = sanitized.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]'); // Phone numbers
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]'); // Emails
  sanitized = sanitized.replace(/\b(Dr\.?|Doctor)\s+[A-Z][a-z]+\b/g, '[DOCTOR]'); // Doctor names
  sanitized = sanitized.replace(/\b\d{1,3}(?:\s+\w+){1,3}(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|court|ct|lane|ln|way)\b/i, '[ADDRESS]'); // Addresses
  sanitized = sanitized.replace(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i, '[DATE]'); // Dates
  
  // Replace ages with age ranges
  const ageMatch = sanitized.match(/\b(\d{1,3})(?:\s+years?\s+old|\s+yo|\s+year-old|\s+month-old)\b/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1], 10);
    let ageRange = '[AGE_UNKNOWN]';
    
    if (age <= 2) ageRange = '[INFANT]';
    else if (age <= 12) ageRange = '[CHILD]';
    else if (age <= 17) ageRange = '[ADOLESCENT]';
    else if (age <= 39) ageRange = '[YOUNG_ADULT]';
    else if (age <= 64) ageRange = '[MIDDLE_AGED]';
    else ageRange = '[ELDERLY]';
    
    sanitized = sanitized.replace(ageMatch[0], ageRange);
  }
  
  return sanitized;
}

/**
 * Extract medical categories from text
 */
function extractMedicalCategories(text: string): string[] {
  const categories = new Set<string>();
  
  // This is a simplified implementation - a real version would use NLP
  const categoryPatterns = [
    { regex: /\b(?:heart|cardiac|cardio|coronary|arrhythmia|infarction)\b/i, category: 'cardiology' },
    { regex: /\b(?:cancer|tumor|oncology|malignant|metastasis|carcinoma)\b/i, category: 'oncology' },
    { regex: /\b(?:brain|neuro|nerve|seizure|alzheimer|parkinson|dementia)\b/i, category: 'neurology' },
    { regex: /\b(?:diabetes|insulin|glucose|thyroid|hormone|endocrine)\b/i, category: 'endocrinology' },
    { regex: /\b(?:stomach|intestine|bowel|colon|rectum|hepatic|liver|gallbladder|pancreas)\b/i, category: 'gastroenterology' },
    { regex: /\b(?:immune|allergy|autoimmune|rheumatoid|lupus|arthritis)\b/i, category: 'immunology' },
    { regex: /\b(?:skin|dermatitis|rash|psoriasis|eczema|acne)\b/i, category: 'dermatology' },
    { regex: /\b(?:child|pediatric|infant|adolescent|newborn|toddler)\b/i, category: 'pediatrics' },
    { regex: /\b(?:mental|depression|anxiety|bipolar|schizophrenia|psychiatric)\b/i, category: 'psychiatry' },
    { regex: /\b(?:lung|respiratory|asthma|copd|pneumonia|bronchitis)\b/i, category: 'pulmonology' },
    { regex: /\b(?:joint|rheumatoid|gout|tendon|muscle|bone|orthopedic)\b/i, category: 'rheumatology' },
    { regex: /\b(?:infection|bacterial|viral|fungal|parasite|antibiotic|antiviral)\b/i, category: 'infectious_disease' }
  ];
  
  // Check each pattern
  for (const pattern of categoryPatterns) {
    if (pattern.regex.test(text)) {
      categories.add(pattern.category);
    }
  }
  
  return Array.from(categories);
}

/**
 * Extract disease states from text
 */
function extractDiseaseStates(text: string): string[] {
  const diseases = new Set<string>();
  const lowercaseText = text.toLowerCase();
  
  // This is a simplified implementation - a real version would use NLP and medical ontologies
  const diseasePatterns = [
    { term: 'diabetes', normalized: 'diabetes_mellitus' },
    { term: 'high blood pressure', normalized: 'hypertension' },
    { term: 'hypertension', normalized: 'hypertension' },
    { term: 'heart attack', normalized: 'myocardial_infarction' },
    { term: 'heart failure', normalized: 'heart_failure' },
    { term: 'stroke', normalized: 'cerebrovascular_accident' },
    { term: 'copd', normalized: 'chronic_obstructive_pulmonary_disease' },
    { term: 'asthma', normalized: 'asthma' },
    { term: 'cancer', normalized: 'cancer' },
    { term: 'depression', normalized: 'major_depressive_disorder' },
    { term: 'anxiety', normalized: 'anxiety_disorder' },
    { term: 'alzheimer', normalized: 'alzheimers_disease' },
    { term: 'arthritis', normalized: 'arthritis' },
    { term: 'migraine', normalized: 'migraine' }
  ];
  
  // Check for each disease term
  for (const pattern of diseasePatterns) {
    if (lowercaseText.includes(pattern.term)) {
      diseases.add(pattern.normalized);
    }
  }
  
  return Array.from(diseases);
}

/**
 * Extract treatment types from text
 */
function extractTreatmentTypes(text: string): string[] {
  const treatments = new Set<string>();
  const lowercaseText = text.toLowerCase();
  
  // This is a simplified implementation - a real version would use NLP and medical ontologies
  const treatmentPatterns = [
    { term: 'surgery', normalized: 'surgical_intervention' },
    { term: 'medication', normalized: 'pharmacotherapy' },
    { term: 'drug', normalized: 'pharmacotherapy' },
    { term: 'therapy', normalized: 'therapy' },
    { term: 'physical therapy', normalized: 'physical_therapy' },
    { term: 'rehabilitation', normalized: 'rehabilitation' },
    { term: 'exercise', normalized: 'exercise_therapy' },
    { term: 'diet', normalized: 'dietary_intervention' },
    { term: 'vaccine', normalized: 'immunization' },
    { term: 'radiation', normalized: 'radiation_therapy' },
    { term: 'chemotherapy', normalized: 'chemotherapy' },
    { term: 'transplant', normalized: 'organ_transplantation' },
    { term: 'dialysis', normalized: 'renal_replacement_therapy' }
  ];
  
  // Check for each treatment term
  for (const pattern of treatmentPatterns) {
    if (lowercaseText.includes(pattern.term)) {
      treatments.add(pattern.normalized);
    }
  }
  
  return Array.from(treatments);
}

/**
 * Extract medications from text - completely anonymized
 */
function extractMedications(text: string): string[] {
  const medications = new Set<string>();
  const lowercaseText = text.toLowerCase();
  
  // List of common medication classes to detect - not specific drug names
  const medicationClasses = [
    { term: 'statin', normalized: 'lipid_lowering_agent' },
    { term: 'blood pressure', normalized: 'antihypertensive' },
    { term: 'antibiotic', normalized: 'antibiotic' },
    { term: 'antidepressant', normalized: 'antidepressant' },
    { term: 'pain', normalized: 'analgesic' },
    { term: 'anti-inflammatory', normalized: 'anti_inflammatory' },
    { term: 'nsaid', normalized: 'nsaid' },
    { term: 'steroid', normalized: 'corticosteroid' },
    { term: 'insulin', normalized: 'antidiabetic' },
    { term: 'blood thinner', normalized: 'anticoagulant' },
    { term: 'inhaler', normalized: 'bronchodilator' },
    { term: 'antihistamine', normalized: 'antihistamine' }
  ];
  
  // Check for each medication class
  for (const med of medicationClasses) {
    if (lowercaseText.includes(med.term)) {
      medications.add(med.normalized);
    }
  }
  
  return Array.from(medications);
}

/**
 * Determine the medical specialty most relevant to the question
 */
function determineMedicalSpecialty(
  text: string,
  categories: string[],
  diseases: string[]
): MedicalSpecialty {
  if (categories.length === 0) {
    return MedicalSpecialty.UNKNOWN;
  }
  
  // Map categories to specialties (in this simplified version they match directly)
  for (const category of categories) {
    if (Object.values(MedicalSpecialty).includes(category as MedicalSpecialty)) {
      return category as MedicalSpecialty;
    }
  }
  
  // If no direct match, infer from diseases
  if (diseases.includes('diabetes_mellitus')) return MedicalSpecialty.ENDOCRINOLOGY;
  if (diseases.includes('hypertension')) return MedicalSpecialty.CARDIOLOGY;
  if (diseases.includes('asthma')) return MedicalSpecialty.PULMONOLOGY;
  
  return MedicalSpecialty.OTHER;
}

/**
 * Determine the intent of the question
 */
function determineQuestionIntent(text: string): QuestionIntent {
  const lowercaseText = text.toLowerCase();
  
  // Check for treatment selection patterns
  if (/\b(?:best|better|recommend|treatment|option|therapy|alternative)\b.*\b(?:for|to treat)\b/i.test(text)) {
    return QuestionIntent.TREATMENT_SELECTION;
  }
  
  // Check for diagnostic patterns
  if (/\b(?:diagnose|diagnosis|diagnostic|test|symptom|sign|indicate|identify)\b/i.test(text)) {
    return QuestionIntent.DIAGNOSTIC;
  }
  
  // Check for mechanism of action patterns
  if (/\b(?:how|mechanism|work|action|effect|affect|influence)\b.*\b(?:body|system|cell|receptor)\b/i.test(text)) {
    return QuestionIntent.MECHANISM_OF_ACTION;
  }
  
  // Check for side effect patterns
  if (/\b(?:side effect|adverse|safety|risk|problem|complication|danger)\b/i.test(text)) {
    return QuestionIntent.SIDE_EFFECT;
  }
  
  // Check for dosing patterns
  if (/\b(?:dose|dosage|how much|how many|frequency|timing|schedule|administration)\b/i.test(text)) {
    return QuestionIntent.DOSING;
  }
  
  // Check for efficacy patterns
  if (/\b(?:efficacy|effective|success|outcome|result|evidence|work|benefit)\b/i.test(text)) {
    return QuestionIntent.EFFICACY;
  }
  
  // Check for patient education patterns
  if (/\b(?:explain|tell|patient|understand|education|resource|material)\b/i.test(text)) {
    return QuestionIntent.PATIENT_EDUCATION;
  }
  
  // Check for research patterns
  if (/\b(?:research|study|trial|investigation|publication|literature|evidence|data)\b/i.test(text)) {
    return QuestionIntent.RESEARCH;
  }
  
  // Default to general information
  return QuestionIntent.GENERAL_INFORMATION;
}

/**
 * Determine the complexity of the question
 */
function determineQuestionComplexity(
  text: string,
  categories: string[],
  diseases: string[],
  medications: string[]
): QuestionComplexity {
  // Count complexity indicators
  let complexityScore = 0;
  
  // Length-based complexity
  const wordCount = countWords(text);
  if (wordCount > 50) complexityScore += 3;
  else if (wordCount > 30) complexityScore += 2;
  else if (wordCount > 15) complexityScore += 1;
  
  // Multiple conditions/categories indicate higher complexity
  complexityScore += Math.min(3, categories.length);
  complexityScore += Math.min(3, diseases.length);
  complexityScore += Math.min(2, medications.length);
  
  // Check for complex terminology
  if (/\b(?:pathophysiology|pharmacokinetics|pharmacodynamics|mechanism|pathogenesis|etiology)\b/i.test(text)) {
    complexityScore += 2;
  }
  
  // Check for research-oriented language
  if (/\b(?:clinical trial|evidence-based|meta-analysis|randomized|literature review|statistically significant|efficacy|cohort|prevalence|incidence)\b/i.test(text)) {
    complexityScore += 2;
  }
  
  // Check for comparison language
  if (/\b(?:compare|versus|compared to|difference between|relative|efficacy of|better than)\b/i.test(text)) {
    complexityScore += 1;
  }
  
  // Determine complexity level
  if (complexityScore >= 8) return QuestionComplexity.ADVANCED;
  if (complexityScore >= 5) return QuestionComplexity.COMPLEX;
  if (complexityScore >= 2) return QuestionComplexity.INTERMEDIATE;
  return QuestionComplexity.BASIC;
}

/**
 * Check if the question contains patient context
 */
function checkForPatientContext(text: string): boolean {
  return /\b(?:patient|year[-\s]old|yo|male|female|man|woman|child|infant|elderly|senior|pregnant|comorbid|history of)\b/i.test(text);
}

/**
 * Extract anonymized patient context
 */
function extractPatientContext(text: string): {
  ageRange?: string;
  pediatric?: boolean;
  geriatric?: boolean;
  gender?: string;
  comorbidities?: string[];
  pregnancyRelevant?: boolean;
  renalImpairment?: boolean;
  hepaticImpairment?: boolean;
} {
  const context: any = {};
  
  // Extract age range (already anonymized in sanitizeText)
  if (text.includes('[INFANT]')) {
    context.ageRange = 'infant';
    context.pediatric = true;
  } else if (text.includes('[CHILD]')) {
    context.ageRange = 'child';
    context.pediatric = true;
  } else if (text.includes('[ADOLESCENT]')) {
    context.ageRange = 'adolescent';
    context.pediatric = true;
  } else if (text.includes('[YOUNG_ADULT]')) {
    context.ageRange = 'young_adult';
  } else if (text.includes('[MIDDLE_AGED]')) {
    context.ageRange = 'middle_aged';
  } else if (text.includes('[ELDERLY]')) {
    context.ageRange = 'elderly';
    context.geriatric = true;
  }
  
  // Extract gender - only use binary for medical relevance, not identification
  if (/\b(?:male|man|boy|gentleman|he|his|him)\b/i.test(text)) {
    context.gender = 'male';
  } else if (/\b(?:female|woman|girl|lady|she|her|hers)\b/i.test(text)) {
    context.gender = 'female';
  }
  
  // Check for pregnancy
  if (/\b(?:pregnant|pregnancy|gestation|trimester)\b/i.test(text)) {
    context.pregnancyRelevant = true;
  }
  
  // Check for renal impairment
  if (/\b(?:kidney|renal|creatinine|gfr|dialysis|ckd)\b/i.test(text)) {
    context.renalImpairment = true;
  }
  
  // Check for hepatic impairment
  if (/\b(?:liver|hepatic|cirrhosis|hepatitis|transaminase|alt|ast|bilirubin)\b/i.test(text)) {
    context.hepaticImpairment = true;
  }
  
  // Extract comorbidities (medical conditions only, anonymized)
  context.comorbidities = extractDiseaseStates(text);
  
  return context;
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate keyword density in the text
 */
function calculateKeywordDensity(text: string): Record<string, number> {
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const totalWords = words.length;
  const density: Record<string, number> = {};
  
  // Count occurrences
  for (const word of words) {
    density[word] = (density[word] || 0) + 1;
  }
  
  // Convert to percentages and filter out low-frequency words
  const result: Record<string, number> = {};
  for (const [word, count] of Object.entries(density)) {
    if (count > 1) { // Only include words that appear more than once
      result[word] = count / totalWords;
    }
  }
  
  return result;
}

/**
 * Calculate relevance between a medical category and a list of categories
 */
function calculateCategoryRelevance(
  category: string,
  questionCategories: string[]
): number {
  if (questionCategories.includes(category)) {
    return 1.0; // Direct match
  }
  
  // Define related categories for partial matching
  const relatedCategories: Record<string, string[]> = {
    'cardiology': ['pulmonology', 'endocrinology'],
    'pulmonology': ['cardiology', 'infectious_disease'],
    'gastroenterology': ['endocrinology', 'infectious_disease'],
    'neurology': ['psychiatry'],
    // Add more relations as needed
  };
  
  // Check for related categories
  if (relatedCategories[category]) {
    for (const related of relatedCategories[category]) {
      if (questionCategories.includes(related)) {
        return 0.5; // Related match
      }
    }
  }
  
  return 0.0; // No match
}

/**
 * Calculate relevance between a treatment and a list of treatments
 */
function calculateTreatmentRelevance(
  treatmentId: string,
  treatmentName: string,
  questionTreatments: string[]
): number {
  // Direct match
  for (const treatment of questionTreatments) {
    if (treatmentName.toLowerCase().includes(treatment.toLowerCase()) ||
        treatment.toLowerCase().includes(treatmentName.toLowerCase())) {
      return 1.0;
    }
  }
  
  // For partial matches, we would use a more sophisticated approach
  // This is a simplified implementation
  return 0.0;
}

/**
 * Calculate relevance between disease states
 */
function calculateDiseaseStateRelevance(
  adDiseases: string[],
  questionDiseases: string[]
): number {
  if (adDiseases.length === 0 || questionDiseases.length === 0) {
    return 0.0;
  }
  
  let matchCount = 0;
  for (const adDisease of adDiseases) {
    for (const questionDisease of questionDiseases) {
      if (adDisease.toLowerCase().includes(questionDisease.toLowerCase()) ||
          questionDisease.toLowerCase().includes(adDisease.toLowerCase())) {
        matchCount++;
        break;
      }
    }
  }
  
  return matchCount / adDiseases.length;
}

/**
 * Calculate specialty relevance
 */
function calculateSpecialtyRelevance(
  adSpecialties: string[],
  questionSpecialty: MedicalSpecialty
): number {
  if (adSpecialties.includes(questionSpecialty)) {
    return 1.0;
  }
  
  // Define related specialties for partial matching
  const relatedSpecialties: Record<string, string[]> = {
    'cardiology': ['pulmonology', 'endocrinology'],
    'oncology': ['hematology', 'radiology'],
    // Add more relations as needed
  };
  
  // Check for related specialties
  if (relatedSpecialties[questionSpecialty]) {
    for (const related of relatedSpecialties[questionSpecialty]) {
      if (adSpecialties.includes(related)) {
        return 0.7; // Related match
      }
    }
  }
  
  return 0.0; // No match
}

/**
 * Calculate semantic similarity between ad keywords and question
 */
function calculateSemanticSimilarity(
  adKeywords: string[],
  questionContext: QuestionContextData
): number {
  if (adKeywords.length === 0) {
    return 0.0;
  }
  
  // This would typically use embeddings or NLP
  // Simplified implementation uses keyword matching
  const allQuestionTerms = [
    ...questionContext.medicalCategories,
    ...questionContext.diseaseStates,
    ...questionContext.treatmentTypes,
    ...questionContext.medications,
    ...Object.keys(questionContext.keywordDensity || {})
  ];
  
  let matchCount = 0;
  for (const keyword of adKeywords) {
    for (const term of allQuestionTerms) {
      if (keyword.toLowerCase().includes(term.toLowerCase()) ||
          term.toLowerCase().includes(keyword.toLowerCase())) {
        matchCount++;
        break;
      }
    }
  }
  
  return matchCount / adKeywords.length;
}

/**
 * Count keyword matches
 */
function countKeywordMatches(
  adKeywords: string[],
  questionContext: QuestionContextData
): number {
  if (adKeywords.length === 0) {
    return 0;
  }
  
  const allQuestionTerms = [
    ...questionContext.medicalCategories,
    ...questionContext.diseaseStates,
    ...questionContext.treatmentTypes,
    ...questionContext.medications,
    ...Object.keys(questionContext.keywordDensity || {})
  ];
  
  let matchCount = 0;
  for (const keyword of adKeywords) {
    for (const term of allQuestionTerms) {
      if (keyword.toLowerCase().includes(term.toLowerCase()) ||
          term.toLowerCase().includes(keyword.toLowerCase())) {
        matchCount++;
        break;
      }
    }
  }
  
  return matchCount;
}

/**
 * Count entity matches
 */
function countEntityMatches(
  adEntities: any[],
  questionContext: QuestionContextData
): number {
  // This would typically use medical entity recognition
  // Simplified implementation
  return 0;
}

/**
 * Calculate overall relevance from weighted scores
 */
function calculateOverallRelevance(
  scores: Array<{ score: number; weight: number }>
): number {
  let totalScore = 0;
  let totalWeight = 0;
  
  for (const { score, weight } of scores) {
    totalScore += score * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calculate confidence in the relevance assessment
 */
function calculateConfidence(
  relevanceScore: number,
  keywordMatchCount: number,
  entityMatchCount: number
): number {
  // Higher matches and relevance score lead to higher confidence
  const baseConfidence = relevanceScore * 0.7;
  const matchBonus = Math.min(0.3, (keywordMatchCount + entityMatchCount) * 0.05);
  
  return Math.min(1.0, baseConfidence + matchBonus);
}

/**
 * Update aggregate context metrics
 */
function updateContextAggregates(contextData: QuestionContextData): void {
  // Aggregate ID based on day
  const today = new Date().toISOString().split('T')[0];
  const aggregateId = `context_metrics_${today}`;
  
  // Update the aggregate data
  DataStore.updateAggregateData(
    aggregateId,
    'context_metrics',
    (currentData: any) => {
      // Initialize if not exists
      if (!currentData) {
        // Initialize counters for enums
        const specialtyDistribution: Record<string, number> = {};
        const intentDistribution: Record<string, number> = {};
        const complexityDistribution: Record<string, number> = {};
        
        // Initialize each possible value to 0
        Object.values(MedicalSpecialty).forEach(specialty => {
          specialtyDistribution[specialty] = 0;
        });
        
        Object.values(QuestionIntent).forEach(intent => {
          intentDistribution[intent] = 0;
        });
        
        Object.values(QuestionComplexity).forEach(complexity => {
          complexityDistribution[complexity] = 0;
        });
        
        return {
          date: today,
          questionsAnalyzed: 1,
          specialtyDistribution,
          intentDistribution,
          complexityDistribution,
          medicalCategoriesCounts: {},
          diseaseStatesCounts: {},
          treatmentTypesCounts: {},
          containsPatientContextCount: contextData.containsPatientContext ? 1 : 0,
          relevanceScoresSum: 0,
          relevanceScoresCount: 0
        };
      }
      
      // Update existing data
      const data = { ...currentData };
      data.questionsAnalyzed = (data.questionsAnalyzed || 0) + 1;
      
      // Update specialty distribution
      if (!data.specialtyDistribution) {
        data.specialtyDistribution = {};
      }
      data.specialtyDistribution[contextData.specialty] = 
        (data.specialtyDistribution[contextData.specialty] || 0) + 1;
      
      // Update intent distribution
      if (!data.intentDistribution) {
        data.intentDistribution = {};
      }
      data.intentDistribution[contextData.intent] = 
        (data.intentDistribution[contextData.intent] || 0) + 1;
      
      // Update complexity distribution
      if (!data.complexityDistribution) {
        data.complexityDistribution = {};
      }
      data.complexityDistribution[contextData.complexity] = 
        (data.complexityDistribution[contextData.complexity] || 0) + 1;
      
      // Update medical categories
      if (!data.medicalCategoriesCounts) {
        data.medicalCategoriesCounts = {};
      }
      for (const category of contextData.medicalCategories) {
        data.medicalCategoriesCounts[category] = 
          (data.medicalCategoriesCounts[category] || 0) + 1;
      }
      
      // Update disease states
      if (!data.diseaseStatesCounts) {
        data.diseaseStatesCounts = {};
      }
      for (const disease of contextData.diseaseStates) {
        data.diseaseStatesCounts[disease] = 
          (data.diseaseStatesCounts[disease] || 0) + 1;
      }
      
      // Update treatment types
      if (!data.treatmentTypesCounts) {
        data.treatmentTypesCounts = {};
      }
      for (const treatment of contextData.treatmentTypes) {
        data.treatmentTypesCounts[treatment] = 
          (data.treatmentTypesCounts[treatment] || 0) + 1;
      }
      
      // Update patient context count
      if (contextData.containsPatientContext) {
        data.containsPatientContextCount = 
          (data.containsPatientContextCount || 0) + 1;
      }
      
      return data;
    }
  );
} 