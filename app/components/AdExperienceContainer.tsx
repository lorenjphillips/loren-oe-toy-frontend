'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Fade, 
  Grow
} from '@mui/material';
import { styled } from '@mui/system';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';

// Import services
import experienceManager, { 
  AdExperienceType,
  ExperienceContext,
  ExperienceConfig
} from '../services/experienceManager';
import { classifyMedicalQuestion, MedicalClassification } from '../services/classification';
import { contentTimingService } from '../services/contentTiming';
import analyticsService from '../services/analytics';

// Import types
import { Ad } from '../types/ad';

// Lazily load experience components to reduce initial bundle size
const MicrosimulationExperience = dynamic(
  () => import('./microsimulations/MicrosimulationEngine'),
  { 
    loading: () => <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>,
    ssr: false 
  }
);

const KnowledgeGraphExperience = dynamic(
  () => import('./knowledge-graph/KnowledgeGraphDemo'),
  { 
    loading: () => <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>,
    ssr: false 
  }
);

const EvidenceCardExperience = dynamic(
  () => import('./education/EvidencePanel'),
  { 
    loading: () => <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={24} /></Box>,
    ssr: false 
  }
);

// Import controllers when needed
const loadController = async (type: AdExperienceType) => {
  switch (type) {
    case AdExperienceType.MICROSIMULATION:
      return (await import('../controllers/MicrosimulationController')).default;
    case AdExperienceType.KNOWLEDGE_GRAPH:
      return (await import('../controllers/KnowledgeGraphController')).default;
    case AdExperienceType.EVIDENCE_CARD:
      return (await import('../controllers/EvidenceCardController')).default;
    default:
      return null;
  }
};

// Styled components
const StyledContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #e0e0e0',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  minHeight: '200px',
  '&:hover': {
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const TransitionContainer = styled(Box)(({ theme }) => ({
  transition: 'all 0.5s ease-in-out',
}));

const SponsoredBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 5,
  right: 5,
  padding: '2px 8px',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 12,
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  zIndex: 10,
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 5,
}));

// Interface for props
interface AdExperienceContainerProps {
  question: string;
  isLoading: boolean;
  advertiserId?: string;
  estimatedWaitTimeMs?: number;
  adData?: Ad;
  onAdImpression?: (data: any) => void;
  onAdClick?: (data: any) => void;
  className?: string;
  testVariant?: string; // For A/B testing
}

/**
 * AdExperienceContainer Component
 * 
 * A unified container for all ad experience types that dynamically
 * loads the appropriate experience based on question context and
 * estimated wait time.
 */
export default function AdExperienceContainer({
  question,
  isLoading,
  advertiserId,
  estimatedWaitTimeMs,
  adData,
  onAdImpression,
  onAdClick,
  className = '',
  testVariant,
}: AdExperienceContainerProps) {
  // State for experience type and configuration
  const [experienceType, setExperienceType] = useState<AdExperienceType>(AdExperienceType.STANDARD);
  const [experienceConfig, setExperienceConfig] = useState<ExperienceConfig | null>(null);
  const [classification, setClassification] = useState<MedicalClassification | null>(null);
  
  // State for transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [previousType, setPreviousType] = useState<AdExperienceType | null>(null);
  
  // State for controller
  const [controller, setController] = useState<any>(null);
  
  // Tracking state
  const impressionId = useRef(uuidv4());
  const containerRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef(Date.now());
  
  // Select the appropriate experience when question or loading state changes
  useEffect(() => {
    const selectAppropriateExperience = async () => {
      if (!question) return;
      
      try {
        // First, classify the question
        const questionClassification = await classifyMedicalQuestion(question);
        setClassification(questionClassification);
        
        // Create experience context
        const context: ExperienceContext = {
          question,
          classification: questionClassification,
          estimatedWaitTimeMs,
          userPreferences: {
            // Could be loaded from user settings
            preferInteractive: true,
            preferVisual: true,
          },
          deviceCapabilities: {
            isHighPerformance: true, // This should be determined dynamically
            isMobile: false, // This should be determined dynamically
          }
        };
        
        // If we're A/B testing, override the selection logic
        if (testVariant) {
          handleTestVariant(testVariant, context);
          return;
        }
        
        // Get experience selection from manager
        const selection = await experienceManager.selectExperience(context);
        
        // If we're changing experience types, handle the transition
        if (experienceType !== selection.selectedType) {
          handleExperienceTransition(experienceType, selection.selectedType, context);
        } else {
          // Just update the config
          setExperienceConfig(selection.config);
        }
        
        // Log the selection for analytics
        analyticsService.trackEvent({
          type: 'ad_experience_selected',
          data: {
            experienceType: selection.selectedType,
            question,
            reasoning: selection.reasoning,
            config: selection.config,
          }
        });
        
        // Load the appropriate controller
        const experienceController = await loadController(selection.selectedType);
        setController(experienceController);
        
      } catch (error) {
        console.error('Error selecting experience:', error);
        // Fall back to standard experience
        setExperienceType(AdExperienceType.STANDARD);
      }
    };
    
    selectAppropriateExperience();
    
    // Track impression
    return () => {
      if (onAdImpression) {
        const viewTime = Date.now() - viewStartTime.current;
        onAdImpression({
          impressionId: impressionId.current,
          experienceType,
          viewTimeMs: viewTime,
          adId: adData?.id,
        });
      }
    };
  }, [question, isLoading, estimatedWaitTimeMs, testVariant]);
  
  // Handle experience transitions
  const handleExperienceTransition = async (
    currentType: AdExperienceType, 
    newType: AdExperienceType,
    context: ExperienceContext
  ) => {
    // Only transition if the types are different
    if (currentType === newType) return;
    
    // Set transitioning state
    setIsTransitioning(true);
    setPreviousType(currentType);
    
    // After a short delay, change the experience type
    setTimeout(() => {
      setExperienceType(newType);
      setIsTransitioning(false);
      
      // Get the configuration for the new experience
      experienceManager.transitionToExperience(currentType, newType, context)
        .then(config => setExperienceConfig(config));
    }, 300); // Transition duration
  };
  
  // Handle A/B test variants
  const handleTestVariant = (variant: string, context: ExperienceContext) => {
    const options = {
      'microsim': AdExperienceType.MICROSIMULATION,
      'knowledge': AdExperienceType.KNOWLEDGE_GRAPH,
      'evidence': AdExperienceType.EVIDENCE_CARD,
      'standard': AdExperienceType.STANDARD,
    };
    
    const selectedType = options[variant as keyof typeof options] || AdExperienceType.STANDARD;
    
    // Log the test variant
    analyticsService.trackEvent({
      type: 'ab_test_impression',
      data: {
        test: 'ad_experience_type',
        variant,
        selectedType,
      }
    });
    
    if (experienceType !== selectedType) {
      handleExperienceTransition(experienceType, selectedType, context);
    }
  };
  
  // Handle ad click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (onAdClick) {
      onAdClick({
        impressionId: impressionId.current,
        experienceType,
        adId: adData?.id,
        advertiserId,
        timestamp: new Date(),
      });
    }
    
    // Track the click in analytics
    analyticsService.trackEvent({
      type: 'ad_experience_click',
      data: {
        experienceType,
        adId: adData?.id,
        advertiserId,
      }
    });
  };
  
  // Render the appropriate experience component
  const renderExperienceComponent = () => {
    const commonProps = {
      adData,
      question,
      advertiserId,
      config: experienceConfig?.settings,
    };
    
    if (isTransitioning) {
      return <CircularProgress size={24} />;
    }
    
    switch (experienceType) {
      case AdExperienceType.MICROSIMULATION:
        return <MicrosimulationExperience {...commonProps} />;
        
      case AdExperienceType.KNOWLEDGE_GRAPH:
        return <KnowledgeGraphExperience {...commonProps} />;
        
      case AdExperienceType.EVIDENCE_CARD:
        return <EvidenceCardExperience 
          title={adData?.title || 'Evidence'}
          evidence={{
            studyName: adData?.title || 'Clinical Study',
            sampleSize: 0,
            design: 'Study design information',
            primaryOutcome: adData?.body || '',
            results: adData?.body || '',
            citation: adData?.advertiser || '',
          }}
          showFullDetails
        />;
        
      case AdExperienceType.STANDARD:
      default:
        return (
          <Box sx={{ p: 2 }}>
            {adData ? (
              <>
                <Typography variant="h6" component="h2" gutterBottom>
                  {adData.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {adData.body}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {adData.advertiser}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Related information will appear here while you wait.
              </Typography>
            )}
          </Box>
        );
    }
  };
  
  return (
    <StyledContainer 
      ref={containerRef}
      className={className}
      onClick={handleClick}
    >
      <SponsoredBadge>Sponsored</SponsoredBadge>
      
      <Fade in={!isTransitioning} timeout={300}>
        <TransitionContainer>
          {renderExperienceComponent()}
        </TransitionContainer>
      </Fade>
      
      {isLoading && (
        <Grow in={isLoading}>
          <LoadingOverlay>
            <CircularProgress size={24} />
          </LoadingOverlay>
        </Grow>
      )}
    </StyledContainer>
  );
} 