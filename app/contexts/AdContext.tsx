import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AdContent, 
  AdContentResponse 
} from '../models/adTypes';
import { 
  MedicalClassification 
} from '../services/classification';
import { 
  EnhancedMappingResult 
} from '../services/confidenceScoring';
import { 
  PharmaMappingResult 
} from '../services/adMapping';
import { 
  classifyMedicalQuestion 
} from '../services/classification';
import { 
  mapQuestionToCompanies 
} from '../services/adMapping';
import { 
  enhanceMappingConfidence 
} from '../services/confidenceScoring';
import { 
  getAdContentFromMapping 
} from '../services/adContentService';
import analyticsService from '../services/analytics';

// Define the shape of our context
interface AdContextType {
  // Ad state
  adContent: AdContent | null;
  isLoading: boolean;
  isClassifying: boolean;
  error: string | null;
  
  // Classification results
  classification: MedicalClassification | null;
  mappingResult: EnhancedMappingResult | null;
  confidenceScore: number | null;
  
  // Analytics
  impressionId: string | null;
  viewStartTime: number | null;
  
  // Admin toggle for testing
  isAdSystemEnabled: boolean;
  setIsAdSystemEnabled: (enabled: boolean) => void;
  
  // Functions
  classifyQuestion: (question: string) => Promise<MedicalClassification | null>;
  getAdsForQuestion: (question: string) => Promise<AdContent | null>;
  trackAdImpression: (adInfo: {
    adId: string,
    companyId: string,
    categoryId: string,
    viewTimeMs: number
  }) => void;
  resetAdState: () => void;
}

// Create context with default values
const AdContext = createContext<AdContextType>({
  adContent: null,
  isLoading: false,
  isClassifying: false,
  error: null,
  classification: null,
  mappingResult: null,
  confidenceScore: null,
  impressionId: null,
  viewStartTime: null,
  isAdSystemEnabled: true,
  setIsAdSystemEnabled: () => {},
  classifyQuestion: async () => null,
  getAdsForQuestion: async () => null,
  trackAdImpression: () => {},
  resetAdState: () => {}
});

// Props for the provider component
interface AdProviderProps {
  children: ReactNode;
}

// Provider component that wraps the application
export const AdProvider: React.FC<AdProviderProps> = ({ children }) => {
  // Ad state
  const [adContent, setAdContent] = useState<AdContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Classification results
  const [classification, setClassification] = useState<MedicalClassification | null>(null);
  const [mappingResult, setMappingResult] = useState<EnhancedMappingResult | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  
  // Analytics
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  
  // Admin toggle for testing different ad scenarios
  const [isAdSystemEnabled, setIsAdSystemEnabled] = useState<boolean>(true);
  
  // Function to classify a question
  const classifyQuestion = async (questionText: string): Promise<MedicalClassification | null> => {
    if (!questionText || questionText.trim() === '' || !isAdSystemEnabled) {
      return null;
    }
    
    setIsClassifying(true);
    setError(null);
    
    try {
      // Classify the question
      const questionClassification = await classifyMedicalQuestion(questionText);
      setClassification(questionClassification);
      return questionClassification;
    } catch (error) {
      setError('Failed to classify question');
      console.error('Error classifying question:', error);
      return null;
    } finally {
      setIsClassifying(false);
    }
  };
  
  // Function to get ads for a classified question
  const getAdsForQuestion = async (questionText: string): Promise<AdContent | null> => {
    if (!questionText || questionText.trim() === '' || !isAdSystemEnabled) {
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Step 1: Classify the question
      const questionClassification = await classifyMedicalQuestion(questionText);
      setClassification(questionClassification);
      
      // Step 2: Map to pharma companies
      const pharmaMapping = await mapQuestionToCompanies(questionClassification);
      
      // Step 3: Enhance with confidence scoring
      const enhancedMapping = await enhanceMappingConfidence(pharmaMapping, questionText);
      setMappingResult(enhancedMapping);
      setConfidenceScore(enhancedMapping.overallConfidence);
      
      // Step 4: Get ad content based on the mapping
      const adResponse = await getAdContentFromMapping(enhancedMapping);
      
      if (adResponse.content.length > 0) {
        const newAdContent = adResponse.content[0];
        setAdContent(newAdContent);
        
        // Create impression ID for tracking
        const newImpressionId = uuidv4();
        setImpressionId(newImpressionId);
        
        // Track impression start time and send analytics event
        const startTime = Date.now();
        setViewStartTime(startTime);
        
        // Track impression via analytics service
        analyticsService.trackImpressionStart(
          newAdContent,
          enhancedMapping.overallConfidence
        );
        
        return newAdContent;
      } else {
        setAdContent(null);
        return null;
      }
    } catch (error) {
      setError('Failed to fetch ad content');
      console.error('Error fetching ad content:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to track ad impressions
  const trackAdImpression = (adInfo: {
    adId: string,
    companyId: string,
    categoryId: string,
    viewTimeMs: number
  }) => {
    if (adContent && impressionId) {
      // Track via analytics service
      analyticsService.trackClick(
        adInfo.adId,
        'ad_content',
        'impression',
        undefined
      );
      
      // Could also send to backend here
    }
  };
  
  // Function to reset ad state
  const resetAdState = () => {
    setAdContent(null);
    setClassification(null);
    setMappingResult(null);
    setConfidenceScore(null);
    setImpressionId(null);
    setViewStartTime(null);
    setError(null);
  };
  
  // Create the context value object
  const contextValue: AdContextType = {
    adContent,
    isLoading,
    isClassifying,
    error,
    classification,
    mappingResult,
    confidenceScore,
    impressionId,
    viewStartTime,
    isAdSystemEnabled,
    setIsAdSystemEnabled,
    classifyQuestion,
    getAdsForQuestion,
    trackAdImpression,
    resetAdState
  };
  
  return (
    <AdContext.Provider value={contextValue}>
      {children}
    </AdContext.Provider>
  );
};

// Custom hook to use the ad context
export const useAds = () => useContext(AdContext);

export default AdContext; 