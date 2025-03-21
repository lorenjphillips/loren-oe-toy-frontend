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
    boxShadow: theme.shadows[4],
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
 */
export default function SmartAdDisplay({ 
  question, 
  isLoading,
  onAdImpression,
  transitionSettings: customSettings = {} 
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
  
  // Reference to track component mounted state
  const isMounted = useRef(true);
  const theme = useTheme();

  // Function to classify the question and find appropriate ads
  const classifyAndGetAds = async (questionText: string) => {
    if (!questionText || questionText.trim() === '') return;
    
    setIsClassifying(true);
    setError(null);
    
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
      
      // Step 4: Get ad content based on the mapping
      const adResponse = await getAdContentFromMapping(enhancedMapping);
      if (!isMounted.current) return;
      
      if (adResponse.content.length > 0) {
        // Trigger transition before setting content
        setTransitionIn(false);
        
        // Use a slight delay to ensure transition out completes
        setTimeout(() => {
          if (!isMounted.current) return;
          
          setAdContent(adResponse.content[0]);
        
          // Create impression ID for tracking
          const newImpressionId = uuidv4();
          setImpressionId(newImpressionId);
        
          // Track impression start time
          setViewStartTime(Date.now());
          
          // Trigger transition in
          setTransitionIn(true);
        
          // Call server to record impression
          axios.post('/api/ads/impression', {
            adContentId: adResponse.content[0].id,
            questionText: questionText,
            confidenceScore: enhancedMapping.overallConfidence,
            impressionId: newImpressionId
          });
        }, settings.durationShort);
      } else {
        // No suitable ads found
        setAdContent(null);
      }
    } catch (err) {
      console.error('Error in ad processing:', err);
      if (isMounted.current) {
        setError('Failed to load relevant content');
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
      
      // Call the callback if provided
      if (onAdImpression) {
        onAdImpression({
          adId: adContent.id,
          companyId: adContent.company.id,
          categoryId: adContent.treatmentCategory.id,
          viewTimeMs
        });
      }
      
      // Send view time to server
      axios.post('/api/ads/viewTime', {
        impressionId,
        viewTimeMs,
        adContentId: adContent.id
      }).catch(err => {
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
    };
  }, []);

  // Effect to classify question when it changes
  useEffect(() => {
    // Don't process if the question is empty
    if (!question || question.trim() === '') return;
    
    // Track view time if we're changing questions
    if (adContent) {
      trackViewTime();
    }
    
    // Reset view tracking
    setViewStartTime(null);
    setImpressionId(null);
    
    // Classify the new question
    classifyAndGetAds(question);
  }, [question]);

  // Don't render anything if not loading and no ad content
  if (!isLoading && !adContent) return null;

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
  const displaySettings = adContent.creative.displaySettings || adContent.company.defaultDisplaySettings;
  
  // Apply company branding colors
  const backgroundColor = displaySettings.backgroundColor || adContent.company.primaryColor || '#f9f9f9';
  const textColor = displaySettings.textColor || '#333333';
  const accentColor = adContent.company.secondaryColor || theme.palette.primary.main;
  const borderColor = displaySettings.borderColor || accentColor;

  return (
    <Fade 
      in={transitionIn && settings.enableFadeTransitions} 
      timeout={settings.fadeInDuration}
      mountOnEnter
      unmountOnExit
    >
      <StyledPaper 
        elevation={2} 
        sx={{ 
          backgroundColor,
          borderColor: displaySettings.border ? borderColor : 'transparent',
          borderWidth: displaySettings.border ? 1 : 0,
          borderStyle: 'solid',
          borderRadius: displaySettings.cornerRadius || theme.shape.borderRadius,
          maxWidth: displaySettings.maxWidth || '100%',
          padding: displaySettings.padding || theme.spacing(2),
        }}
      >
        <SponsoredBadge>Sponsored</SponsoredBadge>
        
        {isClassifying && (
          <LoadingOverlay>
            {settings.enablePulse ? (
              <PulseContainer>
                <CircularProgress size={24} />
              </PulseContainer>
            ) : (
              <CircularProgress size={24} />
            )}
          </LoadingOverlay>
        )}

        <Box>
          {/* Company logo and branding */}
          <AnimatedContent delay={settings.enableStaggered ? 0 : 0}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              {adContent.company.logoUrl && (
                <Zoom in={true} style={{ transitionDelay: settings.enableStaggered ? '100ms' : '0ms' }}>
                  <Box 
                    component="img"
                    src={adContent.company.logoUrl}
                    alt={adContent.company.name}
                    sx={{ 
                      height: 40, 
                      mr: 1.5,
                      borderRadius: '4px'
                    }}
                  />
                </Zoom>
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: textColor }}>
                  {adContent.creative.headline}
                </Typography>
                {adContent.creative.subheadline && (
                  <Typography variant="body2" sx={{ color: textColor }}>
                    {adContent.creative.subheadline}
                  </Typography>
                )}
              </Box>
            </Box>
          </AnimatedContent>

          {/* Main content */}
          <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay : 0}>
            <Typography variant="body2" sx={{ my: 1.5, color: textColor }}>
              {adContent.creative.bodyText}
            </Typography>
          </AnimatedContent>
          
          {/* Ad image if available */}
          {adContent.creative.imageUrl && (
            <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay * 1.5 : 0}>
              <Box 
                component="img"
                src={adContent.creative.imageUrl}
                alt={adContent.creative.headline}
                sx={{ 
                  width: '100%', 
                  maxHeight: 200, 
                  objectFit: 'contain',
                  my: 1.5,
                  borderRadius: 1 
                }}
              />
            </AnimatedContent>
          )}
          
          {/* Treatment categories/tags */}
          <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay * 2 : 0}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              <Grow in={true} style={{ transformOrigin: '0 0 0', transitionDelay: settings.enableStaggered ? '300ms' : '0ms' }}>
                <Chip 
                  label={adContent.treatmentCategory.name} 
                  size="small" 
                  sx={{ 
                    backgroundColor: `${accentColor}22`,  // Using hex opacity
                    color: accentColor,
                    fontWeight: 500
                  }} 
                />
              </Grow>
              {mappingResult?.keywordsUsed.slice(0, 2).map((keyword, index) => (
                <Grow 
                  key={index} 
                  in={true} 
                  style={{ 
                    transformOrigin: '0 0 0', 
                    transitionDelay: settings.enableStaggered ? `${350 + index * 50}ms` : '0ms'
                  }}
                >
                  <Chip 
                    label={keyword} 
                    size="small"
                    sx={{ 
                      backgroundColor: theme.palette.grey[100],
                      color: theme.palette.text.secondary
                    }} 
                  />
                </Grow>
              ))}
            </Box>
          </AnimatedContent>
          
          {/* Call to action */}
          <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay * 2.5 : 0}>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => {
                // Track the click
                axios.post('/api/ads/click', {
                  adContentId: adContent.id,
                  impressionId
                }).catch(console.error);
                
                // Open the company website or target URL
                window.open(adContent.company.website || '#', '_blank');
              }}
              sx={{ 
                mt: 1,
                backgroundColor: accentColor,
                transition: getTransitionString(['background-color', 'transform']),
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'light' 
                    ? theme.palette.darken(accentColor, 0.1)
                    : theme.palette.lighten(accentColor, 0.1),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {adContent.creative.callToAction}
            </Button>
          </AnimatedContent>
          
          {/* Legal disclaimer in small text */}
          {adContent.company.legalDisclaimer && (
            <AnimatedContent delay={settings.enableStaggered ? settings.staggerDelay * 3 : 0}>
              <Typography variant="caption" display="block" sx={{ mt: 1, color: theme.palette.text.secondary, fontSize: '0.6rem' }}>
                {adContent.company.legalDisclaimer}
              </Typography>
            </AnimatedContent>
          )}
        </Box>
      </StyledPaper>
    </Fade>
  );
} 