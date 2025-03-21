'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  Typography,
  LinearProgress,
  Paper,
  Tooltip,
  Chip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { clinicalColors, shadows, animationDurations } from '../../../styles/microsimulation';

interface TimelinePhase {
  id: string;
  title: string;
  description: string;
  estimatedDuration?: number; // in seconds
  isActive?: boolean;
  isCompleted?: boolean;
  status?: 'pending' | 'active' | 'completed' | 'error';
}

interface TimelineProgressProps {
  phases: TimelinePhase[];
  currentPhaseIndex: number;
  totalDuration?: number; // Total scenario duration in seconds
  elapsedTime?: number; // Time elapsed in seconds
  waitingPeriod?: number; // Current waiting period in seconds (if applicable)
  waitingElapsed?: number; // Time elapsed in current waiting period
  onWaitingComplete?: () => void;
  onPhaseTransition?: (fromPhase: string, toPhase: string) => void;
}

// Custom styled connector for the stepper
const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${clinicalColors.primary.light} 0%, ${clinicalColors.primary.main} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${clinicalColors.primary.light} 0%, ${clinicalColors.primary.main} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: clinicalColors.border.main,
    borderRadius: 1,
  },
}));

// Custom styled icon for the stepper
const CustomStepIconRoot = styled('div')<{
  ownerState: { active?: boolean; completed?: boolean; error?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: clinicalColors.border.main,
  zIndex: 1,
  color: '#fff',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage: `linear-gradient(136deg, ${clinicalColors.primary.light} 0%, ${clinicalColors.primary.main} 100%)`,
    boxShadow: `0 4px 10px 0 ${alpha(clinicalColors.primary.main, 0.25)}`,
  }),
  ...(ownerState.completed && {
    backgroundImage: `linear-gradient(136deg, ${clinicalColors.primary.light} 0%, ${clinicalColors.primary.main} 100%)`,
  }),
  ...(ownerState.error && {
    backgroundImage: `linear-gradient(136deg, ${clinicalColors.status.critical} 0%, ${clinicalColors.status.deteriorating} 100%)`,
    boxShadow: `0 4px 10px 0 ${alpha(clinicalColors.status.critical, 0.25)}`,
  }),
}));

/**
 * Component to display the timeline progression of a clinical microsimulation
 * Shows phases, progress, and waiting periods
 */
export const TimelineProgress: React.FC<TimelineProgressProps> = ({
  phases,
  currentPhaseIndex,
  totalDuration = 0,
  elapsedTime = 0,
  waitingPeriod = 0,
  waitingElapsed = 0,
  onWaitingComplete,
  onPhaseTransition,
}) => {
  const theme = useTheme();
  const [waitingTime, setWaitingTime] = useState(waitingPeriod);
  const [waitingProgress, setWaitingProgress] = useState(waitingElapsed);
  const [isWaiting, setIsWaiting] = useState(waitingPeriod > 0);

  // Effect to handle waiting period countdown
  useEffect(() => {
    setWaitingTime(waitingPeriod);
    setWaitingProgress(waitingElapsed);
    setIsWaiting(waitingPeriod > 0);
  }, [waitingPeriod, waitingElapsed]);

  // Effect to handle the waiting period timer
  useEffect(() => {
    if (!isWaiting || waitingTime <= 0) return;

    const timer = setInterval(() => {
      setWaitingProgress(prev => {
        const newProgress = prev + 1;
        
        // Check if waiting period is complete
        if (newProgress >= waitingTime) {
          clearInterval(timer);
          setIsWaiting(false);
          
          if (onWaitingComplete) {
            onWaitingComplete();
          }
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaiting, waitingTime, onWaitingComplete]);

  // Format time display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate overall progress percentage
  const overallProgress = totalDuration > 0 ? Math.min(100, (elapsedTime / totalDuration) * 100) : 0;

  // Get current phase display info
  const currentPhase = phases[currentPhaseIndex] || { title: 'Unknown', description: '' };

  // Custom step icon component
  const CustomStepIcon = (props: { active?: boolean; completed?: boolean; error?: boolean; icon: React.ReactNode }) => {
    return (
      <CustomStepIconRoot ownerState={{ active: props.active, completed: props.completed, error: props.error }}>
        {props.completed ? (
          <CheckCircleIcon />
        ) : props.error ? (
          <ErrorIcon />
        ) : props.active ? (
          <ScheduleIcon />
        ) : (
          props.icon
        )}
      </CustomStepIconRoot>
    );
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        border: `1px solid ${clinicalColors.border.light}`,
        boxShadow: shadows.low,
      }}
    >
      {/* Overall progress */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Scenario Progress
          </Typography>
          {totalDuration > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {formatTime(elapsedTime)} / {formatTime(totalDuration)}
              </Typography>
            </Box>
          )}
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={overallProgress} 
          sx={{ 
            height: 8, 
            borderRadius: 1,
            backgroundColor: alpha(clinicalColors.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              backgroundColor: clinicalColors.primary.main,
            }
          }} 
        />
      </Box>

      {/* Phase Stepper */}
      <Stepper 
        alternativeLabel 
        activeStep={currentPhaseIndex} 
        connector={<CustomConnector />}
      >
        {phases.map((phase, index) => {
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          const hasError = phase.status === 'error';
          
          return (
            <Step key={phase.id}>
              <StepLabel 
                StepIconComponent={(iconProps) => 
                  <CustomStepIcon 
                    {...iconProps} 
                    active={isActive} 
                    completed={isCompleted} 
                    error={hasError} 
                  />
                }
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? clinicalColors.primary.main : 'text.primary',
                  }}
                >
                  {phase.title}
                </Typography>
                {phase.estimatedDuration && !isCompleted && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {formatTime(phase.estimatedDuration)}
                  </Typography>
                )}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Current phase details */}
      <Box sx={{ mt: 3, mb: isWaiting ? 2 : 0 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
          Current Phase: {currentPhase.title}
        </Typography>
        {currentPhase.description && (
          <Typography variant="body2" color="text.secondary">
            {currentPhase.description}
          </Typography>
        )}
      </Box>

      {/* Waiting period indicator */}
      {isWaiting && (
        <Box 
          sx={{ 
            mt: 2,
            p: 2,
            backgroundColor: alpha(clinicalColors.primary.main, 0.05),
            borderRadius: 1,
            border: `1px dashed ${alpha(clinicalColors.primary.main, 0.3)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <HourglassTopIcon sx={{ color: clinicalColors.primary.main, mr: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              Waiting Period
            </Typography>
            <Chip 
              size="small" 
              label={`${formatTime(waitingTime - waitingProgress)} remaining`}
              sx={{ 
                ml: 'auto',
                backgroundColor: alpha(clinicalColors.primary.main, 0.1),
                color: clinicalColors.primary.main,
                fontWeight: 500,
                height: 24,
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={(waitingProgress / waitingTime) * 100} 
                sx={{ 
                  height: 6, 
                  borderRadius: 1,
                  backgroundColor: alpha(clinicalColors.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: clinicalColors.primary.main,
                  }
                }} 
              />
            </Box>
            <Box sx={{ minWidth: 35 }}>
              <Typography variant="body2" color="text.secondary">
                {Math.round((waitingProgress / waitingTime) * 100)}%
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait as the scenario progresses to the next phase...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TimelineProgress; 