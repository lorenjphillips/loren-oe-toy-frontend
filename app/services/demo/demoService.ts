// Demo service to intercept actual service calls when in demo mode
import { DemoScenario, isDemoMode, getDemoConfig } from './demoConfig';
import { getAnswerForQuestion, DemoAnswer } from '../../data/demo/answers';
import { getQuestionsForScenario, DemoQuestion, getRandomQuestions as demoGetRandomQuestions } from '../../data/demo/questions';
import { getCategoriesForScenario, DemoCategory } from '../../data/demo/categories';
import {
  demoDrugPerformanceData,
  demoConditionInsights,
  demoComparativeAnalyses,
  demoAnalyticsDashboard
} from '../../data/demo/analytics';

// Type for a delay function that simulates network/processing delay
type DelayFunction = (min: number, max: number) => Promise<void>;

// Create a consistent but realistic delay
export const simulateDelay: DelayFunction = async (min: number, max: number) => {
  if (!isDemoMode()) return;
  
  const config = getDemoConfig();
  if (!config.simulateNetworkDelay) return;
  
  // Adjust delay based on configuration
  let multiplier = 1;
  if (config.simulationSpeed === 'fast') multiplier = 0.5;
  if (config.simulationSpeed === 'slow') multiplier = 1.5;
  
  const adjustedMin = min * multiplier;
  const adjustedMax = max * multiplier;
  
  // Generate a random delay between min and max
  const delay = Math.floor(Math.random() * (adjustedMax - adjustedMin + 1)) + adjustedMin;
  
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Mock implementation of the classification service
export async function mockClassification(query: string): Promise<any> {
  await simulateDelay(300, 800);
  
  // Try to match query to one of our demo questions
  const allQuestions = getQuestionsForScenario(getDemoConfig().scenario);
  
  // Find best matching question through basic string similarity
  const similarityScores = allQuestions.map(q => {
    const queryLower = query.toLowerCase();
    const textLower = q.text.toLowerCase();
    
    // Simple similarity metric
    let score = 0;
    const queryWords = queryLower.split(/\s+/);
    const textWords = textLower.split(/\s+/);
    
    // Count matching words
    for (const word of queryWords) {
      if (textWords.includes(word) && word.length > 3) score += 1;
    }
    
    // Bonus for exact matches of longer phrases
    if (textLower.includes(queryLower) || queryLower.includes(textLower)) {
      score += 5;
    }
    
    return { question: q, score };
  });
  
  // Sort by score and get best match
  similarityScores.sort((a, b) => b.score - a.score);
  const bestMatch = similarityScores[0];
  
  // If we have a reasonable match, use it
  if (bestMatch && bestMatch.score > 2) {
    const question = bestMatch.question;
    const categories = getCategoriesForScenario(getDemoConfig().scenario);
    const category = categories.find(c => c.id === question.category);
    
    return {
      id: question.id,
      query,
      category: category?.name || question.category,
      categoryId: question.category,
      confidence: Math.min(85 + bestMatch.score * 2, 98),
      tags: question.tags,
      intent: 'information_seeking',
      sentiment: 'neutral',
      suggestedQuestions: getRelatedQuestions(question.id, 3)
    };
  }
  
  // If no good match, return a generic classification
  return {
    id: 'generic-' + Date.now(),
    query,
    category: 'General Medical',
    categoryId: 'general',
    confidence: 65,
    tags: ['general', 'information', 'medical'],
    intent: 'information_seeking',
    sentiment: 'neutral',
    suggestedQuestions: getRandomQuestions(3)
  };
}

// Mock implementation of the answer generation service
export async function mockAnswerGeneration(questionId: string, query: string): Promise<any> {
  // Add an artificial delay to simulate processing time
  await simulateDelay(1000, 2500);
  
  // Try to find a pre-defined answer for this question
  const answer = getAnswerForQuestion(questionId);
  
  if (answer) {
    return {
      questionId,
      query,
      answer: answer.content,
      sources: answer.sources,
      relatedMedications: answer.relatedMedications,
      confidence: answer.confidenceScore,
      processingTime: Math.floor(Math.random() * 1000) + 500
    };
  }
  
  // If no pre-defined answer, generate a generic one
  return {
    questionId,
    query,
    answer: `Based on current medical evidence, this question requires a nuanced approach. 
    
    Multiple treatment options may be appropriate, and the optimal choice depends on patient-specific factors including comorbidities, preferences, and circumstances. 
    
    Recent guidelines suggest considering multiple factors including efficacy, safety profile, cost, and convenience when making clinical decisions in this area.`,
    sources: [
      {
        title: "Evidence-Based Clinical Practice Guidelines",
        url: "https://example.com/guidelines",
        publicationDate: "2023-01-15"
      }
    ],
    confidence: 70,
    processingTime: Math.floor(Math.random() * 1000) + 500
  };
}

// Mock implementation for ad selection service
export async function mockAdSelection(category: string, query: string): Promise<any> {
  await simulateDelay(200, 600);
  
  // Get ads appropriate for the category
  const categoryLower = category.toLowerCase();
  
  // Find relevant medications from our demo data
  let relevantMedications = [];
  
  // Map categories to relevant drug categories
  const categoryToDrugMap: Record<string, string[]> = {
    'diabetes': ['GLP-1 receptor agonist', 'SGLT2 inhibitor'],
    'cardiovascular': ['ACE inhibitor', 'ARB', 'Beta blocker'],
    'neurology': ['Anti-CGRP monoclonal antibody', 'Anticonvulsant'],
    'psychiatry': ['SNRI', 'SSRI', 'Stimulant'],
    'infectious-disease': ['Antiviral', 'mRNA vaccine'],
    'dermatology': ['IL-17A inhibitor', 'IL-23 inhibitor', 'PDE4 inhibitor'],
    'rheumatology': ['JAK inhibitor', 'TNF inhibitor'],
    'oncology': ['Checkpoint inhibitor', 'Tyrosine kinase inhibitor']
  };
  
  // Find drugs that might match the category
  for (const [cat, drugCategories] of Object.entries(categoryToDrugMap)) {
    if (categoryLower.includes(cat) || cat.includes(categoryLower)) {
      const matchingDrugs = demoDrugPerformanceData.filter(drug => 
        drugCategories.some(dc => drug.category.toLowerCase().includes(dc.toLowerCase()))
      );
      
      relevantMedications.push(...matchingDrugs);
    }
  }
  
  // If no specific matches, include some of the top-performing drugs
  if (relevantMedications.length === 0) {
    relevantMedications = demoDrugPerformanceData
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 3);
  }
  
  // Pick 1-2 medications to show
  const selectedMedications = relevantMedications
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.min(2, relevantMedications.length));
  
  return selectedMedications.map(med => ({
    id: `ad-${med.drugName.toLowerCase().replace(/\s+/g, '-')}`,
    medicationName: med.drugName,
    genericName: med.genericName,
    manufacturer: med.manufacturer,
    category: med.category,
    description: `${med.drugName} (${med.genericName}) is a leading ${med.category} with proven efficacy for appropriate patients.`,
    relevanceScore: med.efficacyScore,
    evidenceLevel: med.overallScore > 85 ? 'high' : 'moderate',
    adUrl: `https://example.com/medications/${med.drugName.toLowerCase().replace(/\s+/g, '-')}`,
    imageUrl: `https://example.com/images/${med.drugName.toLowerCase().replace(/\s+/g, '-')}.jpg`
  }));
}

// Mock analytics service
export async function mockAnalytics(): Promise<any> {
  await simulateDelay(400, 800);
  
  // Return the appropriate dashboard data based on scenario
  const scenario = getDemoConfig().scenario;
  
  if (scenario === DemoScenario.ANALYTICS) {
    // Provide enhanced analytics for the analytics-focused scenario
    return {
      ...demoAnalyticsDashboard,
      detailedMetrics: {
        adPerformanceByFormat: [
          { format: 'Text', impressions: 450000, clicks: 31500, ctr: 7.0 },
          { format: 'Image', impressions: 325000, clicks: 24375, ctr: 7.5 },
          { format: 'Interactive', impressions: 250000, clicks: 18750, ctr: 7.5 }
        ],
        timeOfDayPerformance: [
          { hour: '8am-12pm', impressions: 320000, clicks: 25600, ctr: 8.0 },
          { hour: '12pm-4pm', impressions: 380000, clicks: 26600, ctr: 7.0 },
          { hour: '4pm-8pm', impressions: 210000, clicks: 14700, ctr: 7.0 },
          { hour: '8pm-12am', impressions: 115000, clicks: 7475, ctr: 6.5 }
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 58 },
          { device: 'Mobile', percentage: 27 },
          { device: 'Tablet', percentage: 15 }
        ]
      }
    };
  }
  
  // Standard analytics for other scenarios
  return demoAnalyticsDashboard;
}

// Helper functions
function getRelatedQuestions(questionId: string, count: number = 3): DemoQuestion[] {
  const questions = getQuestionsForScenario(getDemoConfig().scenario);
  const currentQuestion = questions.find(q => q.id === questionId);
  
  if (!currentQuestion) {
    return getRandomQuestions(count);
  }
  
  // Find questions with similar tags or categories
  const relatedQuestions = questions
    .filter(q => q.id !== questionId) // Exclude current question
    .map(q => {
      let score = 0;
      
      // Score based on same category
      if (q.category === currentQuestion.category) score += 5;
      
      // Score based on shared tags
      const sharedTags = q.tags.filter(tag => currentQuestion.tags.includes(tag));
      score += sharedTags.length * 2;
      
      return { question: q, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.question);
  
  // If we don't have enough related questions, add some random ones
  if (relatedQuestions.length < count) {
    const randomQuestions = demoGetRandomQuestions(count - relatedQuestions.length);
    return [...relatedQuestions, ...randomQuestions];
  }
  
  return relatedQuestions;
}

function getRandomQuestions(count: number): DemoQuestion[] {
  const questions = getQuestionsForScenario(getDemoConfig().scenario);
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Export a service factory that decides whether to use the real service or the mock
export function createDemoServiceProxy<T>(realService: T, mockImplementation: Partial<T>): T {
  return new Proxy({} as unknown as T, {
    get(_target, prop, _receiver) {
      // If we're in demo mode and the mock implements this method, use it
      if (isDemoMode() && prop in mockImplementation) {
        return (mockImplementation as any)[prop];
      }
      
      // Otherwise fall back to the real service
      return (realService as any)[prop];
    }
  });
} 