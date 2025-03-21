import OpenAI from 'openai';
import { env } from '../lib/env';

/**
 * TypeScript interface for medical question classification response
 */
export interface MedicalClassification {
  primaryCategory: {
    id: string;
    name: string;
    confidence: number;
  };
  subcategory: {
    id: string;
    name: string;
    confidence: number;
  };
  keywords: string[];
  relevantMedications?: string[];
  demographicRelevance?: {
    ageGroups?: string[];
    gender?: string;
  };
  possibleIntents?: string[];
}

/**
 * Configuration options for the classification service
 */
export interface ClassificationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  includeRawResponse?: boolean;
}

/**
 * Default medical categories with their subcategories
 */
const MEDICAL_CATEGORIES = {
  cardiology: {
    name: "Cardiology",
    subcategories: [
      { id: "hypertension", name: "Hypertension" },
      { id: "arrhythmia", name: "Arrhythmia" },
      { id: "heart_failure", name: "Heart Failure" },
      { id: "coronary_artery_disease", name: "Coronary Artery Disease" },
      { id: "valvular_disease", name: "Valvular Heart Disease" }
    ]
  },
  dermatology: {
    name: "Dermatology",
    subcategories: [
      { id: "acne", name: "Acne" },
      { id: "psoriasis", name: "Psoriasis" },
      { id: "eczema", name: "Eczema" },
      { id: "melanoma", name: "Melanoma" },
      { id: "rosacea", name: "Rosacea" }
    ]
  },
  endocrinology: {
    name: "Endocrinology",
    subcategories: [
      { id: "diabetes", name: "Diabetes" },
      { id: "thyroid_disorders", name: "Thyroid Disorders" },
      { id: "adrenal_disorders", name: "Adrenal Disorders" },
      { id: "osteoporosis", name: "Osteoporosis" },
      { id: "pituitary_disorders", name: "Pituitary Disorders" }
    ]
  },
  gastroenterology: {
    name: "Gastroenterology",
    subcategories: [
      { id: "ibs", name: "Irritable Bowel Syndrome" },
      { id: "gerd", name: "Gastroesophageal Reflux Disease" },
      { id: "inflammatory_bowel_disease", name: "Inflammatory Bowel Disease" },
      { id: "hepatitis", name: "Hepatitis" },
      { id: "pancreatitis", name: "Pancreatitis" }
    ]
  },
  neurology: {
    name: "Neurology",
    subcategories: [
      { id: "migraine", name: "Migraine" },
      { id: "epilepsy", name: "Epilepsy" },
      { id: "multiple_sclerosis", name: "Multiple Sclerosis" },
      { id: "parkinsons", name: "Parkinson's Disease" },
      { id: "stroke", name: "Stroke" }
    ]
  },
  oncology: {
    name: "Oncology",
    subcategories: [
      { id: "breast_cancer", name: "Breast Cancer" },
      { id: "lung_cancer", name: "Lung Cancer" },
      { id: "prostate_cancer", name: "Prostate Cancer" },
      { id: "colorectal_cancer", name: "Colorectal Cancer" },
      { id: "pancreatic_cancer", name: "Pancreatic Cancer" }
    ]
  },
  pulmonology: {
    name: "Pulmonology",
    subcategories: [
      { id: "asthma", name: "Asthma" },
      { id: "copd", name: "COPD" },
      { id: "pneumonia", name: "Pneumonia" },
      { id: "pulmonary_fibrosis", name: "Pulmonary Fibrosis" },
      { id: "sleep_apnea", name: "Sleep Apnea" }
    ]
  },
  rheumatology: {
    name: "Rheumatology",
    subcategories: [
      { id: "rheumatoid_arthritis", name: "Rheumatoid Arthritis" },
      { id: "osteoarthritis", name: "Osteoarthritis" },
      { id: "lupus", name: "Lupus" },
      { id: "gout", name: "Gout" },
      { id: "fibromyalgia", name: "Fibromyalgia" }
    ]
  },
  psychiatry: {
    name: "Psychiatry",
    subcategories: [
      { id: "depression", name: "Depression" },
      { id: "anxiety", name: "Anxiety" },
      { id: "bipolar", name: "Bipolar Disorder" },
      { id: "schizophrenia", name: "Schizophrenia" },
      { id: "adhd", name: "ADHD" }
    ]
  },
  infectious_diseases: {
    name: "Infectious Diseases",
    subcategories: [
      { id: "covid19", name: "COVID-19" },
      { id: "hiv", name: "HIV/AIDS" },
      { id: "tuberculosis", name: "Tuberculosis" },
      { id: "lyme_disease", name: "Lyme Disease" },
      { id: "hepatitis_c", name: "Hepatitis C" }
    ]
  }
};

/**
 * Class for medical question classification
 */
export class MedicalQuestionClassifier {
  private openai: OpenAI;
  private defaultOptions: ClassificationOptions;

  /**
   * Creates a new MedicalQuestionClassifier
   */
  constructor() {
    try {
      const apiKey = env.get('OPENAI_API_KEY');
      
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
      
      this.defaultOptions = {
        model: env.get('OPENAI_MODEL'),
        temperature: 0.1,
        maxTokens: 800,
        includeRawResponse: false
      };
    } catch (error) {
      console.error('Error initializing MedicalQuestionClassifier:', error);
      throw new Error(`Failed to initialize MedicalQuestionClassifier: ${(error as Error).message}`);
    }
  }

  /**
   * Classifies a medical question using OpenAI
   * @param question The medical question to classify
   * @param history Optional conversation history for context
   * @param options Optional configuration options
   * @returns Structured classification of the medical question
   */
  async classifyQuestion(
    question: string,
    history: { role: string; content: string }[] = [],
    options: ClassificationOptions = {}
  ): Promise<MedicalClassification> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Create structured medical categories for the prompt
      const categoryListForPrompt = Object.entries(MEDICAL_CATEGORIES)
        .map(([id, category]) => {
          const subcategoryList = category.subcategories
            .map(sub => `    - ${sub.name} (${sub.id})`)
            .join('\n');
          
          return `- ${category.name} (${id})\n  Subcategories:\n${subcategoryList}`;
        })
        .join('\n');
      
      // Construct the prompt for OpenAI
      const prompt = `
As a medical question classifier for a physician-focused platform, analyze the following medical question.

QUESTION: "${question}"

Provide a detailed classification in JSON format with the following structure:
{
  "primaryCategory": {
    "id": "category_id",
    "name": "Category Name",
    "confidence": 0.95 // A number between 0-1 representing your confidence
  },
  "subcategory": {
    "id": "subcategory_id",
    "name": "Subcategory Name",
    "confidence": 0.85 // A number between 0-1 representing your confidence
  },
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "relevantMedications": ["medication1", "medication2"] // optional
}

Available medical categories with subcategories:
${categoryListForPrompt}

Instructions:
1. Choose the most relevant primary category and specific subcategory
2. If the question doesn't clearly match a category, select the most probable one with lower confidence
3. Extract 3-5 relevant medical keywords from the question
4. If medications are mentioned or implied, include them in relevantMedications
5. Ensure confidence scores reflect your certainty (0.9+ for very certain, 0.6-0.8 for moderately certain, below 0.6 for uncertain)

Your response must be valid JSON with the exact structure shown above.
`;

      // Call OpenAI API
      const chatCompletion = await this.openai.chat.completions.create({
        model: mergedOptions.model!,
        temperature: mergedOptions.temperature!,
        max_tokens: mergedOptions.maxTokens,
        messages: [
          ...history,
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
      const classification = JSON.parse(content) as MedicalClassification;
      
      // Include raw response if requested
      if (mergedOptions.includeRawResponse) {
        (classification as any).rawResponse = chatCompletion;
      }
      
      return classification;
    } catch (error) {
      console.error('Error classifying medical question:', error);
      
      // Return a fallback classification with error information
      return {
        primaryCategory: {
          id: 'unknown',
          name: 'Unknown',
          confidence: 0,
        },
        subcategory: {
          id: 'unknown',
          name: 'Unknown',
          confidence: 0,
        },
        keywords: [],
        possibleIntents: ['error_in_classification'],
      };
    }
  }
  
  /**
   * Test the classifier with a sample question
   * @returns The classification result for a test question
   */
  async testClassifier(): Promise<{question: string; classification: MedicalClassification}> {
    const testQuestion = "What are the latest treatment options for a 67-year-old male with stage 3 pancreatic cancer who has not responded to gemcitabine?";
    
    const classification = await this.classifyQuestion(testQuestion);
    
    return {
      question: testQuestion,
      classification
    };
  }
}

// Export a singleton instance of the classifier
export const medicalClassifier = new MedicalQuestionClassifier();

/**
 * Factory function to create a classifier and classify a medical question
 */
export async function classifyMedicalQuestion(
  question: string,
  history: { role: string; content: string }[] = [],
  options: ClassificationOptions = {}
): Promise<MedicalClassification> {
  try {
    const classifier = new MedicalQuestionClassifier();
    return await classifier.classifyQuestion(question, history, options);
  } catch (error) {
    console.error('Error classifying medical question:', error);
    throw new Error(`Failed to classify medical question: ${(error as Error).message}`);
  }
} 