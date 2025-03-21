'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Card, 
  CardContent, 
  Button,
  Paper,
  Collapse,
  Divider,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MedicationIcon from '@mui/icons-material/Medication';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { DecisionOption } from '../../../models/microsimulation';
import { clinicalColors, shadows, animationDurations } from '../../../styles/microsimulation';

interface TreatmentSelectorProps {
  title: string;
  description: string;
  options: DecisionOption[];
  timeLimit?: number;
  onSelection: (optionId: string) => void;
  onSelectionAnalytics?: (optionId: string, timeToDecide: number, wasCorrect: boolean) => void;
  showCorrectAnswer?: boolean;
  initialSelectedId?: string;
}

/**
 * Component for selecting between treatment options in clinical scenarios
 * Includes options and feedback for clinical decision-making
 */
export const TreatmentSelector: React.FC<TreatmentSelectorProps> = ({
  title,
  description,
  options,
  timeLimit,
  onSelection,
  onSelectionAnalytics,
  showCorrectAnswer = false,
  initialSelectedId,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(initialSelectedId || null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(!!initialSelectedId);
  const [startTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit || null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  
  // Handle time limit countdown
  useEffect(() => {
    if (!timeLimit || isSubmitted) return;
    
    const timer = setInterval(() => {
      const remaining = Math.max(0, timeLimit - Math.floor((Date.now() - startTime) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
        handleSubmit(); // Auto-submit when time is up
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLimit, isSubmitted, startTime]);
  
  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isSubmitted) return;
    setSelectedOptionId(event.target.value);
  };
  
  const handleSubmit = () => {
    if (!selectedOptionId || isSubmitted) return;
    
    const timeToDecide = Math.floor((Date.now() - startTime) / 1000);
    const selectedOption = options.find(option => option.id === selectedOptionId);
    const wasCorrect = selectedOption?.isCorrect || false;
    
    setIsSubmitted(true);
    setShowFeedback(true);
    
    // Call callbacks
    onSelection(selectedOptionId);
    if (onSelectionAnalytics) {
      onSelectionAnalytics(selectedOptionId, timeToDecide, wasCorrect);
    }
  };
  
  // Find the correct option for displaying feedback
  const correctOption = options.find(option => option.isCorrect);
  
  // Format time remaining display
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card sx={{ 
      mb: 3,
      boxShadow: shadows.medium,
      border: `1px solid ${clinicalColors.border.light}`,
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MedicationIcon sx={{ color: clinicalColors.primary.main, mr: 1.5 }} />
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, m: 0 }}>
            {title}
          </Typography>
          {timeLimit && timeRemaining !== null && !isSubmitted && (
            <Chip 
              label={`Time: ${formatTimeRemaining(timeRemaining)}`}
              size="small"
              color={timeRemaining < 30 ? "error" : "default"}
              sx={{ 
                ml: 'auto',
                fontFamily: 'monospace',
                fontWeight: timeRemaining < 30 ? 600 : 400,
                ...(timeRemaining < 30 && { 
                  animation: `pulse ${animationDurations.medium}ms infinite alternate`,
                  '@keyframes pulse': {
                    '0%': { opacity: 0.7 },
                    '100%': { opacity: 1 }
                  }
                })
              }}
            />
          )}
        </Box>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3, 
            color: clinicalColors.text.primary,
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
        
        <Paper elevation={0} sx={{ 
          backgroundColor: alpha(clinicalColors.primary.main, 0.04),
          p: 2,
          mb: 3,
          borderRadius: 1,
        }}>
          <RadioGroup 
            value={selectedOptionId || ''} 
            onChange={handleOptionChange}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              const isCorrect = option.isCorrect;
              const showCorrectHighlight = isSubmitted && showCorrectAnswer && isCorrect;
              const showIncorrectHighlight = isSubmitted && showCorrectAnswer && isSelected && !isCorrect;
              
              return (
                <Paper 
                  key={option.id}
                  elevation={0}
                  sx={{ 
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: isSelected 
                      ? clinicalColors.primary.main 
                      : clinicalColors.border.main,
                    backgroundColor: showCorrectHighlight
                      ? alpha(clinicalColors.status.stable, 0.1)
                      : showIncorrectHighlight
                        ? alpha(clinicalColors.status.critical, 0.1)
                        : isSelected
                          ? alpha(clinicalColors.primary.main, 0.08)
                          : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&:hover': {
                      borderColor: isSubmitted 
                        ? (showCorrectHighlight ? clinicalColors.status.stable : (showIncorrectHighlight ? clinicalColors.status.critical : clinicalColors.primary.main))
                        : clinicalColors.primary.main,
                      backgroundColor: isSubmitted 
                        ? (showCorrectHighlight ? alpha(clinicalColors.status.stable, 0.12) : (showIncorrectHighlight ? alpha(clinicalColors.status.critical, 0.12) : alpha(clinicalColors.primary.main, 0.1)))
                        : alpha(clinicalColors.primary.main, 0.1),
                    },
                  }}
                >
                  <FormControlLabel
                    value={option.id}
                    control={
                      <Radio 
                        sx={{ 
                          color: isSubmitted 
                            ? (showCorrectHighlight ? clinicalColors.status.stable : (showIncorrectHighlight ? clinicalColors.status.critical : clinicalColors.primary.main))
                            : clinicalColors.primary.main,
                        }} 
                      />
                    }
                    label={
                      <Box sx={{ ml: 0.5 }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: isSelected ? 500 : 400,
                            color: isSubmitted 
                              ? (showCorrectHighlight ? clinicalColors.status.stable : (showIncorrectHighlight ? clinicalColors.status.critical : clinicalColors.text.primary))
                              : clinicalColors.text.primary,
                          }}
                        >
                          {option.text}
                        </Typography>
                      </Box>
                    }
                    sx={{ 
                      alignItems: 'flex-start',
                      margin: 0,
                      width: '100%',
                    }}
                    disabled={isSubmitted}
                  />
                  
                  {showCorrectHighlight && (
                    <CheckCircleOutlineIcon
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        color: clinicalColors.status.stable,
                      }}
                    />
                  )}
                </Paper>
              );
            })}
          </RadioGroup>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Select the most appropriate option
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!selectedOptionId || isSubmitted}
            sx={{
              minWidth: 120,
              fontWeight: 500,
            }}
          >
            Submit Decision
          </Button>
        </Box>
        
        <Collapse in={showFeedback && isSubmitted} timeout={{
          enter: animationDurations.medium,
          exit: animationDurations.short,
        }}>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            {selectedOptionId && (
              <>
                <Typography variant="h6" gutterBottom>
                  Feedback
                </Typography>
                
                {/* Selected option feedback */}
                {options.find(o => o.id === selectedOptionId)?.feedback && (
                  <Alert 
                    severity={options.find(o => o.id === selectedOptionId)?.isCorrect ? "success" : "error"}
                    sx={{ mb: 2 }}
                  >
                    {options.find(o => o.id === selectedOptionId)?.feedback}
                  </Alert>
                )}
                
                {/* Clinical reasoning */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>
                  Clinical Reasoning
                </Typography>
                
                <Typography variant="body2" paragraph>
                  {options.find(o => o.id === selectedOptionId)?.reasoning || 
                    'No clinical reasoning available for this option.'}
                </Typography>
                
                {/* Show correct answer if option was incorrect */}
                {showCorrectAnswer && !options.find(o => o.id === selectedOptionId)?.isCorrect && correctOption && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, color: clinicalColors.status.stable }}>
                      Correct Approach
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {correctOption.text}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {correctOption.reasoning}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default TreatmentSelector; 