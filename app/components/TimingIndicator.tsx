import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  LinearProgress, 
  Typography, 
  Fade, 
  CircularProgress,
  useTheme
} from '@mui/material';
import { styled, keyframes } from '@mui/system';
import { 
  ContentProgressState, 
  contentTimingService 
} from '../services/contentTiming';
import { timeEstimator } from '../services/timeEstimation';

// Props interface
interface TimingIndicatorProps {
  question: string;
  isGenerating: boolean;
  isVisible?: boolean;
  onComplete?: () => void;
  variant?: 'linear' | 'circular' | 'minimal';
  showStages?: boolean;
  className?: string;
}

// Stage info interface
interface StageInfo {
  label: string;
  color: string;
  description: string;
}

// Pulse animation for the active stage
const pulse = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

// Styled components
const ProgressContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  marginBottom: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: '600px',
  position: 'relative',
}));

const StageIndicator = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive' && prop !== 'isCompleted' && prop !== 'color'
})<{ isActive: boolean, isCompleted: boolean, color: string }>(({ theme, isActive, isCompleted, color }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: isCompleted ? color : (isActive ? 'rgba(150, 150, 150, 0.7)' : 'rgba(200, 200, 200, 0.3)'),
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.3s ease',
  animation: isActive ? `${pulse} 2s infinite ease-in-out` : 'none',
  position: 'relative',
  zIndex: 2,
}));

const StageConnector = styled(Box)<{ isActive: boolean }>(({ theme, isActive }) => ({
  height: '2px',
  flex: 1,
  backgroundColor: isActive ? 'rgba(150, 150, 150, 0.5)' : 'rgba(200, 200, 200, 0.3)',
  transition: 'all 0.3s ease',
}));

const StagesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
}));

const TimeRemainingText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: 'rgba(0, 0, 0, 0.6)',
  marginLeft: theme.spacing(1),
  whiteSpace: 'nowrap',
}));

const StageLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: 'rgba(0, 0, 0, 0.7)',
  position: 'absolute',
  bottom: '-20px',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  width: '70px',
  left: '-28px',
}));

const CustomLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  width: '100%',
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
  },
}));

const CustomCircularProgress = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

/**
 * Component for displaying answer generation progress and estimated time
 */
export default function TimingIndicator({
  question,
  isGenerating,
  isVisible = true,
  onComplete,
  variant = 'linear',
  showStages = true,
  className
}: TimingIndicatorProps) {
  const theme = useTheme();
  const [progressState, setProgressState] = useState<ContentProgressState>({
    answerProgress: 0,
    contentProgress: 0,
    timeRemaining: 0,
    educationalPointsCompleted: 0,
    educationalPointsTotal: 5,
    canShowAnswer: false,
    recommendedContentComponents: []
  });
  const [fadeIn, setFadeIn] = useState(false);
  const completedRef = useRef(false);

  // Define stages with colors and labels
  const stages: Record<string, StageInfo> = {
    analyzing: {
      label: 'Analyzing',
      color: theme.palette.info.main,
      description: 'Analyzing query...'
    },
    generating: {
      label: 'Generating',
      color: theme.palette.primary.main,
      description: 'Generating answer...'
    },
    refining: {
      label: 'Refining',
      color: theme.palette.success.main,
      description: 'Refining content...'
    }
  };

  // Effect to handle progress updates from the content timing service
  useEffect(() => {
    const handleProgressUpdate = (state: ContentProgressState) => {
      setProgressState(state);
      
      // Check if we should notify about completion
      if (state.canShowAnswer && !completedRef.current && onComplete) {
        completedRef.current = true;
        onComplete();
      }
    };
    
    // Add progress listener
    contentTimingService.addProgressListener(handleProgressUpdate);
    
    // Short delay before fading in
    setTimeout(() => setFadeIn(true), 300);
    
    // Cleanup
    return () => {
      contentTimingService.removeProgressListener(handleProgressUpdate);
    };
  }, [onComplete]);

  // Effect to initialize timing when question changes or generation starts
  useEffect(() => {
    if (isGenerating && question) {
      // Reset completion flag
      completedRef.current = false;
      
      // Set initial configuration
      contentTimingService.initializeContentTiming(question);
      
      // Fade in the indicator
      setFadeIn(true);
    } else if (!isGenerating) {
      // Reset progress when not generating
      setFadeIn(false);
      
      // Short delay before resetting state
      setTimeout(() => {
        setProgressState({
          answerProgress: 0,
          contentProgress: 0,
          timeRemaining: 0,
          educationalPointsCompleted: 0,
          educationalPointsTotal: 5,
          canShowAnswer: false,
          recommendedContentComponents: []
        });
      }, 300);
    }
  }, [isGenerating, question]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Complete';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Determine current stage
  const getCurrentStage = (): string => {
    const progress = progressState.answerProgress;
    if (progress < 15) return 'analyzing';
    if (progress < 85) return 'generating';
    return 'refining';
  };

  // Get label for current stage
  const getCurrentStageLabel = (): string => {
    const currentStage = getCurrentStage();
    return stages[currentStage]?.description || 'Processing...';
  };

  // Check if we should hide the component
  if (!isVisible || (!isGenerating && progressState.answerProgress === 0)) {
    return null;
  }

  // Render different variants
  const renderProgress = () => {
    switch (variant) {
      case 'circular':
        return (
          <Box display="flex" alignItems="center">
            <CustomCircularProgress 
              size={24} 
              variant="determinate" 
              value={progressState.answerProgress} 
            />
            <TimeRemainingText variant="caption">
              {formatTimeRemaining(progressState.timeRemaining)}
            </TimeRemainingText>
          </Box>
        );
        
      case 'minimal':
        return (
          <Box display="flex" alignItems="center" width="100%">
            <CustomLinearProgress 
              variant="determinate" 
              value={progressState.answerProgress} 
              sx={{ 
                height: 2, 
                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: stages[getCurrentStage()]?.color || theme.palette.primary.main,
                }
              }} 
            />
          </Box>
        );
        
      case 'linear':
      default:
        return (
          <>
            <Box display="flex" alignItems="center" width="100%" mb={1}>
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                {getCurrentStageLabel()}
              </Typography>
              <Box flexGrow={1} />
              <TimeRemainingText variant="caption">
                {formatTimeRemaining(progressState.timeRemaining)}
              </TimeRemainingText>
            </Box>
            
            <CustomLinearProgress 
              variant="determinate" 
              value={progressState.answerProgress} 
              sx={{ 
                backgroundColor: 'rgba(200, 200, 200, 0.3)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: stages[getCurrentStage()]?.color || theme.palette.primary.main,
                }
              }} 
            />
            
            {showStages && (
              <StagesContainer>
                {Object.entries(stages).map(([stage, info], index, array) => {
                  const currentStage = getCurrentStage();
                  const isActive = stage === currentStage;
                  const isCompleted = 
                    (stage === 'analyzing' && progressState.answerProgress >= 15) ||
                    (stage === 'generating' && progressState.answerProgress >= 85) ||
                    (stage === 'refining' && progressState.answerProgress >= 100);
                  
                  return (
                    <React.Fragment key={stage}>
                      <Box position="relative">
                        <StageIndicator 
                          isActive={isActive} 
                          isCompleted={isCompleted}
                          color={info.color}
                        />
                        <StageLabel>{info.label}</StageLabel>
                      </Box>
                      
                      {index < array.length - 1 && (
                        <StageConnector isActive={isCompleted} />
                      )}
                    </React.Fragment>
                  );
                })}
              </StagesContainer>
            )}
          </>
        );
    }
  };

  return (
    <Fade in={fadeIn} timeout={300}>
      <ProgressContainer className={className}>
        {renderProgress()}
      </ProgressContainer>
    </Fade>
  );
} 