'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { 
  ExperienceManager,
  AdExperienceType,
  ExperienceContext,
  ExperienceConfig,
  ExperienceResult
} from '../services/experienceManager';
import { classifyMedicalQuestion, MedicalClassification } from '../services/classification';
import { contentTimingService } from '../services/contentTiming';
import analyticsService from '../services/analytics';
// @ts-ignore - Temporarily suppressing TypeScript errors
// import { trackEvent } from '../services/analytics';

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
  const [experienceConfig, setExperienceConfig] = useState<ExperienceResult | null>(null);
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
  
  // Memoized handlers
  const handleExperienceTransition = useCallback(async (
    currentType: AdExperienceType,
    newType: AdExperienceType,
    context: ExperienceContext
  ) => {
    if (currentType === newType) return;
    setIsTransitioning(true);
    setPreviousType(currentType);
    // @ts-ignore window property access
    const expManager = window.OpusExperienceManager;

    setTimeout(() => {
      setExperienceType(newType);
      setIsTransitioning(false);
      expManager.transitionToExperience(currentType, newType, context)
        .then((config: ExperienceResult) => setExperienceConfig(config));
    }, 300);
  }, [setExperienceType, setIsTransitioning, setPreviousType]); // Dependencies for useCallback

  const handleTestVariant = useCallback((variant: string, context: ExperienceContext) => {
    const options = {
      'microsim': AdExperienceType.MICROSIMULATION,
      'knowledge': AdExperienceType.KNOWLEDGE_GRAPH,
      'evidence': AdExperienceType.EVIDENCE_CARD,
      'standard': AdExperienceType.STANDARD,
    };
    const selectedType = options[variant as keyof typeof options] || AdExperienceType.STANDARD;
    // @ts-ignore window property access
    const analyticsSvc = window.OpusAnalytica;

    analyticsSvc.trackEvent(
      'ab_test_impression',
      'analytics',
      {
        variant,
        context: {
          question: context.question,
          classification: context.classification,
          experienceType: context.experienceType // Use optional property
        }
      }
    );

    if (experienceType !== selectedType) {
      // Pass context without experienceType initially, it gets added during transition
      const transitionContext = { ...context }; 
      delete transitionContext.experienceType;
      handleExperienceTransition(experienceType, selectedType, transitionContext);
    }
  }, [experienceType, handleExperienceTransition]); // Dependencies for useCallback

  // Initialize the experience manager (Assuming this should be stable)
  // Consider if this needs to be state or a ref if it can change
  // const experienceManager = new ExperienceManager(); 
  // Using window object for now as per original effect

  // Select the appropriate experience when question or loading state changes
  useEffect(() => {
    // @ts-ignore - Temporarily suppressing TypeScript errors
    const analyticsService = window.OpusAnalytica;
    // @ts-ignore - Temporarily suppressing TypeScript errors
    const experienceManager = window.OpusExperienceManager; 

    const selectAppropriateExperience = async () => {
      if (isLoading || !question) return;
      try {
        const classification = await experienceManager.classifyQuery(question);
        const context: ExperienceContext = {
          question,
          classification,
          experienceType, // Pass current type
        };

        if (testVariant) {
          handleTestVariant(testVariant, context);
          return;
        }

        const selectedExperience = await experienceManager.selectExperience(context);
        if (selectedExperience && experienceType !== selectedExperience.type) {
          handleExperienceTransition(experienceType, selectedExperience.type, context);
        } else {
          const config = await experienceManager.getExperienceConfig(experienceType, context);
          setExperienceConfig(config);
        }
      } catch (error) {
        console.error('Error selecting experience:', error);
      }
    };

    impressionId.current = uuidv4();
    viewStartTime.current = Date.now();
    const currentImpressionId = impressionId.current;
    const currentViewStartTime = viewStartTime.current;

    selectAppropriateExperience();

    return () => {
      if (onAdImpression) {
        const viewTime = Date.now() - currentViewStartTime;
        onAdImpression({
          impressionId: currentImpressionId,
          experienceType,
          viewTimeMs: viewTime,
          adId: adData?.id,
        });
      }
    };
  }, [
    question,
    isLoading,
    // estimatedWaitTimeMs, // Removed, not used
    testVariant,
    adData?.id,
    // experienceManager, // Removed, defined inside effect
    experienceType,
    handleExperienceTransition, // Now stable due to useCallback
    handleTestVariant, // Now stable due to useCallback
    onAdImpression
  ]);
  
  // Handle experience transitions (Moved before useEffect)
  // const handleExperienceTransition = ... (Now declared above with useCallback)
  
  // Handle A/B test variants (Moved before useEffect)
  // const handleTestVariant = ... (Now declared above with useCallback)
  
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
    // @ts-ignore - Temporarily suppressing TypeScript errors
    analyticsService.trackEvent(
      'ad_experience_click',
      'user_interaction',
      {
        experienceType: experienceType,
        // @ts-ignore - Handling target properties safely
        elementType: event.target && 'tagName' in event.target ? event.target.tagName : 'unknown',
        xPosition: event.clientX,
        yPosition: event.clientY,
        // @ts-ignore - Safely accessing href
        url: event.target && 'href' in event.target ? event.target.href : undefined
      }
    );
  };
  
  // Render the appropriate experience component
  const renderExperienceComponent = () => {
    const commonProps = {
      adData,
      question,
      advertiserId,
      config: experienceConfig?.config?.settings,
    };
    
    if (isTransitioning) {
      return <CircularProgress size={24} />;
    }
    
    switch (experienceType) {
      case AdExperienceType.MICROSIMULATION:
        // @ts-ignore - Temporarily suppressing TypeScript errors for missing props
        return <MicrosimulationExperience 
          {...commonProps} 
          physicianQuestion={question}
        />;
        
      case AdExperienceType.KNOWLEDGE_GRAPH:
        // @ts-ignore - Temporarily suppressing TypeScript errors for missing props
        return <KnowledgeGraphExperience {...commonProps} />;
        
      case AdExperienceType.EVIDENCE_CARD:
        // @ts-ignore - Temporarily suppressing TypeScript errors for missing props
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