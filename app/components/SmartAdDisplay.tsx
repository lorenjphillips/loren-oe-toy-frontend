import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress, 
  Chip, 
  Fade, 
  LinearProgress,
  useTheme,
  Zoom,
  Grow
} from '@mui/material';
import { styled } from '@mui/system';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// Import services
import { classifyMedicalQuestion, MedicalClassification } from '../services/classification';
import { mapQuestionToCompanies, PharmaMappingResult } from '../services/adMapping';
import { enhanceMappingConfidence, EnhancedMappingResult } from '../services/confidenceScoring';
import { getAdContentFromMapping } from '../services/adContentService';
import { AdContent, AdContentResponse } from '../models/adTypes';
import { 
  selectAdTemplate, 
  AdTemplateType, 
  getSpecializedTemplateSettings 
} from '../services/adTemplateSelector';

// Import analytics services
import analyticsService, { 
  AnalyticsEventType, 
  VisibilityState,
  createVisibilityTracker,
  initAdPerformanceMeasurement,
  measureAdPerformance
} from '../services/analytics';
import analyticsStore from '../store/analyticsStore';
import { contentTimingService, ContentProgressState } from '../services/contentTiming';

// Import transition utilities
import { 
  pulse, 
  fadeIn, 
  fadeInUp,
  getStaggeredStyles,
  defaultTransitionSettings, 
  TransitionSettings,
  getTransitionString,
  getOptimizedStyles
} from '../styles/transitions';

// Import ad templates
import BaseAdTemplate from './adTemplates/BaseAdTemplate';
import PfizerAdTemplate from './adTemplates/PfizerAdTemplate';
import GenentechAdTemplate from './adTemplates/GenentechAdTemplate';
import GSKAdTemplate from './adTemplates/GSKAdTemplate';
import EliLillyAdTemplate from './adTemplates/EliLillyAdTemplate';

// Import Phase 4 components
import { FeedbackButton } from './feedback/FeedbackButton';

// Import ethical-ai services
import { runEthicalCheck } from '../services/ethical-ai/ethicalGuardrails';
import { getClinicalDecisionSupport } from '../services/clinical-support/decisionSupport';

// Define props interface for SmartAdDisplay
interface SmartAdDisplayProps {
  question: string;
  isLoading: boolean;
  onAdImpression?: (adInfo: {
    adId: string,
    companyId: string,
    categoryId: string,
    viewTimeMs: number
  }) => void;
  transitionSettings?: Partial<TransitionSettings>;
  sessionId?: string;
  enableFeedback?: boolean;
  enableEthicalGuardrails?: boolean;
  enableDecisionSupport?: boolean;
}

// Styled components with enhanced transitions
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #e0e0e0',
  transition: getTransitionString(['transform', 'box-shadow', 'opacity']),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
  },
  ...getOptimizedStyles(['transform', 'opacity']),
}));

const PulseContainer = styled(Box)(({ theme }) => ({
  animation: `${pulse} 1.5s infinite`,
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
  zIndex: 1,
  animation: `${fadeIn} 0.8s ${defaultTransitionSettings.easingIn} forwards`,
}));

const AnimatedContent = styled(Box)<{ delay?: number }>(({ theme, delay = 0 }) => ({
  animation: `${fadeInUp} 0.7s ${defaultTransitionSettings.easingInOut} forwards`,
  animationDelay: `${delay}ms`,
  opacity: 0,
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
  zIndex: 2,
  animation: `${fadeIn} 0.3s ${defaultTransitionSettings.easingIn} forwards`,
}));

/**
 * SmartAdDisplay Component
 * 
 * Displays targeted pharmaceutical ads based on the user's medical question.
 * Features:
 * - Automatically classifies medical questions
 * - Determines appropriate pharma company targeting
 * - Displays relevant ad content during loading
 * - Tracks view time and impressions
 * - Handles transitions between states
 * - Provides professional animations for a polished user experience
 * - Comprehensive analytics tracking
 * - Ethical AI Guardrails
 * - Clinical Decision Support
 * - Feedback mechanisms for inappropriate ads
 */
export default function SmartAdDisplay({ 
  question, 
  isLoading,
  onAdImpression,
  transitionSettings: customSettings = {},
  sessionId = uuidv4(),
  enableFeedback = true,
  enableEthicalGuardrails = true,
  enableDecisionSupport = true
}: SmartAdDisplayProps) {
  // Merge custom transition settings with defaults
  const settings: TransitionSettings = {
    ...defaultTransitionSettings,
    ...customSettings
  };

  // State for classification and ad content
  const [classification, setClassification] = useState<MedicalClassification | null>(null);
  const [mappingResult, setMappingResult] = useState<EnhancedMappingResult | null>(null);
  const [adContent, setAdContent] = useState<AdContent | null>(null);
  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [transitionIn, setTransitionIn] = useState<boolean>(false);
  const [adReady, setAdReady] = useState<boolean>(false);
  
  // Phase 4 states
  const [ethicalCheckResult, setEthicalCheckResult] = useState<{passed: boolean; warnings: string[]}>({ passed: true, warnings: [] });
  const [clinicalSupportInfo, setClinicalSupportInfo] = useState<any>(null);
  const [showClinicalInfo, setShowClinicalInfo] = useState<boolean>(false);
  
  // Reference to track component mounted state
  const isMounted = useRef(true);
  const adRef = useRef<HTMLDivElement>(null);
  const visibilityObserver = useRef<IntersectionObserver | null>(null);
  const theme = useTheme();
  const renderStartTime = useRef<number | null>(null);

  // Add state to track selected template and settings
  const [templateType, setTemplateType] = useState<AdTemplateType>(AdTemplateType.DEFAULT);
  const [templateSettings, setTemplateSettings] = useState<Record<string, any>>({});

  // Add new state for content timing
  const [contentProgress, setContentProgress] = useState<ContentProgressState | null>(null);

  // Initialize analytics store on mount
  useEffect(() => {
    analyticsStore.initStore();
    
    return () => {
      analyticsStore.cleanupStore();
    };
  }, []);

  // Function to classify the question and find appropriate ads
  const classifyAndGetAds = async (questionText: string) => {
    if (!questionText || questionText.trim() === '') return;
    
    setIsClassifying(true);
    setError(null);

    // Performance measurement
    renderStartTime.current = initAdPerformanceMeasurement('classification');
    
    try {
      // Step 1: Classify the question
      const questionClassification = await classifyMedicalQuestion(questionText);
      if (!isMounted.current) return;
      setClassification(questionClassification);
      
      // Step 2: Map to pharma companies
      const pharmaMapping = await mapQuestionToCompanies(questionClassification);
      if (!isMounted.current) return;
      
      // Step 3: Enhance with confidence scoring
      const enhancedMapping = await enhanceMappingConfidence(pharmaMapping, questionText);
      if (!isMounted.current) return;
      setMappingResult(enhancedMapping);

      // Step 4: Get clinical decision support if enabled
      if (enableDecisionSupport) {
        const clinicalSupport = await getClinicalDecisionSupport(
          questionText,
          questionClassification,
          enhancedMapping
        );
        if (!isMounted.current) return;
        setClinicalSupportInfo(clinicalSupport);
      }
      
      // Step 5: Get ad content based on the mapping
      const adResponse = await getAdContentFromMapping(enhancedMapping);
      if (!isMounted.current) return;
      
      if (adResponse.content.length > 0) {
        // Step 6: Run ethical check if enabled
        if (enableEthicalGuardrails) {
          const ethicalResult = await runEthicalCheck(
            adResponse.content[0],
            questionText,
            questionClassification
          );
          if (!isMounted.current) return;
          setEthicalCheckResult(ethicalResult);
          
          // If ethical check fails, don't show the ad
          if (!ethicalResult.passed) {
            setAdContent(null);
            setError('This ad was blocked by ethical guardrails');
            analyticsService.createEvent(AnalyticsEventType.ETHICAL_BLOCK, {
              metadata: {
                adId: adResponse.content[0].id,
                warnings: ethicalResult.warnings
              }
            });
            setIsClassifying(false);
            return;
          }
        }
        
        // Trigger transition before setting content
        setTransitionIn(false);
        
        // Use a slight delay to ensure transition out completes
        setTimeout(() => {
          if (!isMounted.current) return;
          
          setAdContent(adResponse.content[0]);
        
          // Create impression ID for tracking
          const newImpressionId = uuidv4();
          setImpressionId(newImpressionId);
        
          // Track impression start time and send analytics event
          setViewStartTime(Date.now());
          
          // Track impression via analytics service
          analyticsService.trackImpressionStart(
            adResponse.content[0],
            enhancedMapping.overallConfidence
          );
          
          // Trigger transition in
          setTransitionIn(true);
        
          // Call server to record impression
          axios.post('/api/ads/impression', {
            adContentId: adResponse.content[0].id,
            questionText: questionText,
            confidenceScore: enhancedMapping.overallConfidence,
            impressionId: newImpressionId
          }).catch((err: Error) => {
            console.error('Failed to record impression:', err);
          });

          // Track render performance if we started timing
          if (renderStartTime.current) {
            measureAdPerformance('ad_display', renderStartTime.current);
            renderStartTime.current = null;
          }
        }, settings.durationShort);
      } else {
        // No suitable ads found
        setAdContent(null);
      }

      // Get microsimulation config adapted for the estimated wait time
      if (enhancedMapping && enhancedMapping.topMatch) {
        const microsimConfig = contentTimingService.getMicrosimulationConfig(
          questionText,
          enhancedMapping.topMatch.company,
          enhancedMapping.topMatch.treatmentArea
        );
      }
    } catch (err) {
      console.error('Error in ad processing:', err);
      if (isMounted.current) {
        setError('Failed to load relevant content');
        
        // Track error event
        analyticsService.createEvent(AnalyticsEventType.AD_ERROR, {
          metadata: {
            error: err instanceof Error ? err.message : 'Unknown error',
            question
          }
        });
      }
    } finally {
      if (isMounted.current) {
        setIsClassifying(false);
      }
    }
  };

  // Track ad view time when component unmounts or ad changes
  const trackViewTime = () => {
    if (viewStartTime && adContent && impressionId) {
      const viewTimeMs = Date.now() - viewStartTime;
      
      // Track impression end via analytics service
      analyticsService.trackImpressionEnd(impressionId, adContent.id, viewTimeMs);
      
      // Call the callback if provided
      if (onAdImpression) {
        onAdImpression({
          adId: adContent.id,
          companyId: (adContent as any).company?.id || 'unknown',
          categoryId: (adContent as any).treatmentCategory?.id || 'unknown',
          viewTimeMs
        });
      }
      
      // Send view time to server
      axios.post('/api/ads/viewTime', {
        impressionId,
        viewTimeMs,
        adContentId: adContent.id
      }).catch((err: Error) => {
        console.error('Failed to record view time:', err);
      });
    }
  };

  // Effect to trigger entrance animation on mount
  useEffect(() => {
    setTransitionIn(true);
    return () => {
      setTransitionIn(false);
    };
  }, []);

  // Effect to clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      trackViewTime();
      
      // Cleanup visibility observer
      if (visibilityObserver.current) {
        visibilityObserver.current.disconnect();
        visibilityObserver.current = null;
      }
    };
  }, []);

  // Effect to classify question when it changes
  useEffect(() => {
    if (question.trim()) {
      setAdReady(false);
      classifyAndGetAds(question);
    }
  }, [question]);

  // Add effect to connect to content timing service
  useEffect(() => {
    const handleProgressUpdate = (progress: ContentProgressState) => {
      setContentProgress(progress);
      
      // Adjust the component visibility based on content progress
      if (progress.contentProgress > 30) {
        setAdReady(true);
      }
    };
    
    // Add progress listener
    contentTimingService.addProgressListener(handleProgressUpdate);
    
    // Cleanup
    return () => {
      contentTimingService.removeProgressListener(handleProgressUpdate);
    };
  }, []);

  // Update the effect that processes ad content to also select the template
  useEffect(() => {
    if (adContent && mappingResult) {
      // Select appropriate template based on content and mapping
      const templateSelection = selectAdTemplate(adContent, mappingResult);
      setTemplateType(templateSelection.templateType);
      
      // Get specialized settings for this template and treatment category
      const settings = getSpecializedTemplateSettings(
        templateSelection.templateType,
        (adContent as any).treatmentCategory?.id || 'default'
      );
      setTemplateSettings(settings);
    }
  }, [adContent, mappingResult]);

  // Setup intersection observer to track ad visibility
  useEffect(() => {
    // Only set up visibility tracking if we have content and a reference
    if (adContent && adRef.current) {
      // Cleanup previous observer
      if (visibilityObserver.current) {
        visibilityObserver.current.disconnect();
      }
      
      // Create new visibility tracker
      visibilityObserver.current = createVisibilityTracker(
        adRef.current,
        adContent.id,
        (visible, percentage) => {
          // Custom handling for visibility changes can be added here if needed
        }
      );
    }
    
    return () => {
      // Cleanup on dependency changes
      if (visibilityObserver.current) {
        visibilityObserver.current.disconnect();
        visibilityObserver.current = null;
      }
    };
  }, [adContent]);

  // Toggle clinical info display
  const toggleClinicalInfo = () => {
    setShowClinicalInfo(!showClinicalInfo);
    
    // Track usage of clinical information
    if (adContent) {
      analyticsService.createEvent(AnalyticsEventType.CLINICAL_INFO_TOGGLE, {
        metadata: {
          adId: adContent.id,
          show: !showClinicalInfo
        }
      });
    }
  };

  // When rendering templates, integrate with content timing
  const renderAdTemplate = () => {
    if (!adContent) return null;
    
    const commonProps = {
      adContent,
      onCTAClick: (adId: string) => {
        // Handle CTA click
        console.log(`Ad CTA clicked: ${adId}`);
        
        // Track CTA click via analytics service
        analyticsService.trackCTAClick(adId, (adContent as any).company?.id || 'unknown', impressionId || '');
        
        // Send tracking data to server
        axios.post('/api/ads/click', {
          adContentId: adId,
          impressionId
        }).catch((err: Error) => {
          console.error('Failed to record click:', err);
        });
      },
      transitionSettings: settings,
      analytics: analyticsStore,
      visibilityTracker: visibilityObserver.current,
      onImpressionTracked: trackViewTime,
      contentProgress: contentProgress,
      clinicalSupportInfo: showClinicalInfo ? clinicalSupportInfo : null,
      ethicalWarnings: ethicalCheckResult.warnings,
      onToggleClinicalInfo: clinicalSupportInfo ? toggleClinicalInfo : undefined
    };
    
    // Render the appropriate template based on type
    switch (templateType) {
      case AdTemplateType.PFIZER:
        return (
          <PfizerAdTemplate
            {...commonProps}
            showEvidenceBox={templateSettings.showEvidenceBox}
            evidenceText={templateSettings.evidenceText}
          />
        );
        
      case AdTemplateType.GENENTECH:
        return (
          <GenentechAdTemplate
            {...commonProps}
            showStats={templateSettings.showStats}
            clinicalStats={templateSettings.clinicalStats}
          />
        );
        
      case AdTemplateType.GSK:
        return (
          <GSKAdTemplate
            {...commonProps}
            showEvidencePanel={templateSettings.showEvidencePanel}
            evidencePoints={templateSettings.evidencePoints}
          />
        );
        
      case AdTemplateType.ELI_LILLY:
        return (
          <EliLillyAdTemplate
            {...commonProps}
            showDataMetrics={templateSettings.showDataMetrics}
            customMetrics={templateSettings.customMetrics}
          />
        );
        
      default:
        return <BaseAdTemplate {...commonProps} />;
    }
  };

  // Only render if we have ad content or we're loading AND question is available
  // Also check for adReady, which is controlled by content progress
  if ((!adContent && !isLoading) || !question || (isLoading && !adReady)) {
    return null;
  }

  // If we don't have ad content yet but are loading, show placeholder with transition
  if (!adContent) {
    return (
      <Fade in={true} timeout={settings.fadeInDuration}>
        <StyledPaper elevation={2}>
          <SponsoredBadge>Sponsored</SponsoredBadge>
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              sx={{ 
                height: 2, 
                mb: 2, 
                borderRadius: 1,
                backgroundColor: theme.palette.grey[100],
                '& .MuiLinearProgress-bar': {
                  transition: 'transform 0.8s ease-in-out'
                }
              }} 
            />
            <AnimatedContent delay={settings.enableStaggered ? 0 : 0}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box 
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    backgroundColor: theme.palette.grey[200], 
                    borderRadius: '50%',
                    mr: 1 
                  }} 
                />
                <Box>
                  <Typography variant="body1" sx={{ bgcolor: theme.palette.grey[200], width: 150, height: 20, borderRadius: 1 }}></Typography>
                  <Typography variant="body2" sx={{ bgcolor: theme.palette.grey[100], width: 100, height: 16, mt: 0.5, borderRadius: 1 }}></Typography>
                </Box>
              </Box>
            </AnimatedContent>
            
            <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay : 0}>
              <Typography variant="body2" sx={{ bgcolor: theme.palette.grey[100], width: '100%', height: 16, mt: 1, borderRadius: 1 }}></Typography>
              <Typography variant="body2" sx={{ bgcolor: theme.palette.grey[100], width: '90%', height: 16, mt: 0.5, borderRadius: 1 }}></Typography>
              <Typography variant="body2" sx={{ bgcolor: theme.palette.grey[100], width: '95%', height: 16, mt: 0.5, borderRadius: 1 }}></Typography>
            </AnimatedContent>
            
            <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay * 2 : 0}>
              <Button 
                variant="contained" 
                disabled
                sx={{ 
                  mt: 2, 
                  opacity: 0.5,
                  minWidth: 120
                }}
              >
                Learn More
              </Button>
            </AnimatedContent>
          </Box>
        </StyledPaper>
      </Fade>
    );
  }

  // Get the display settings from the ad content
  const displaySettings = (adContent as any).creative?.displaySettings || (adContent as any).company?.defaultDisplaySettings || {};
  
  // Apply company branding colors
  const backgroundColor = displaySettings.backgroundColor || (adContent as any).company?.primaryColor || '#f9f9f9';
  const textColor = displaySettings.textColor || '#333333';
  const accentColor = (adContent as any).company?.secondaryColor || theme.palette.primary.main;
  const borderColor = displaySettings.borderColor || accentColor;

  // Track hover events
  const handleMouseEnter = () => {
    if (adContent) {
      analyticsService.trackHover(adContent.id, 'ad_container');
    }
  };

  // Track click events
  const handleAdClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (adContent) {
      const target = event.currentTarget.getAttribute('data-target') || 'ad_container';
      const rect = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      analyticsService.trackClick(adContent.id, target, 'click', position);
    }
  };

  return (
    <Fade in={transitionIn} timeout={settings.durationShort}>
      <Box 
        sx={{ position: 'relative' }}
        ref={adRef}
        onMouseEnter={handleMouseEnter}
        onClick={handleAdClick}
        data-target="ad_container"
      >
        {isClassifying && (
          <LoadingOverlay>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CircularProgress size={40} color="primary" />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Finding relevant information...
              </Typography>
            </Box>
          </LoadingOverlay>
        )}
        
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            {renderAdTemplate()}
            
            {/* Feedback button */}
            {enableFeedback && adContent && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 4, 
                  right: 4,
                  zIndex: 10
                }}
              >
                <FeedbackButton 
                  adId={adContent.id}
                  sessionId={sessionId}
                  variant="icon"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Fade>
  );
} 