'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Button,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsightsIcon from '@mui/icons-material/Insights';
import MedicationIcon from '@mui/icons-material/Medication';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import { ScenarioOutcome, PatientInfo } from '../../../models/microsimulation';
import { clinicalColors, getStatusColor, shadows, animationDurations } from '../../../styles/microsimulation';

interface OutcomeVisualizerProps {
  outcome: ScenarioOutcome;
  patientInfo: PatientInfo;
  decisionHistory?: Array<{
    decisionId: string;
    decisionTitle: string;
    selectedOptionId: string;
    selectedOptionText: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
  diagnosticHistory?: Array<{
    testId: string;
    testName: string;
    category: string;
    wasViewed: boolean;
  }>;
  showEducationalContent?: boolean;
  onEducationalContentViewed?: (contentId: string) => void;
  onTreatmentRecommendationSelected?: (treatmentId: string) => void;
}

/**
 * Component to visualize patient outcomes based on clinical decisions
 * Shows the result of the simulation and provides educational content
 */
export const OutcomeVisualizer: React.FC<OutcomeVisualizerProps> = ({
  outcome,
  patientInfo,
  decisionHistory = [],
  diagnosticHistory = [],
  showEducationalContent = true,
  onEducationalContentViewed,
  onTreatmentRecommendationSelected,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'decisions' | 'diagnostics' | 'vital-signs'>('decisions');
  
  // Calculate outcome stats
  const correctDecisions = decisionHistory.filter(d => d.isCorrect).length;
  const totalDecisions = decisionHistory.length;
  const correctPercentage = totalDecisions > 0 ? Math.round((correctDecisions / totalDecisions) * 100) : 0;
  
  const viewedDiagnostics = diagnosticHistory.filter(d => d.wasViewed).length;
  const totalDiagnostics = diagnosticHistory.length;
  const diagnosticPercentage = totalDiagnostics > 0 ? Math.round((viewedDiagnostics / totalDiagnostics) * 100) : 0;
  
  // Determine outcome type color
  const getOutcomeColor = () => {
    switch (outcome.type) {
      case 'positive':
        return clinicalColors.status.stable;
      case 'negative':
        return clinicalColors.status.critical;
      case 'neutral':
      default:
        return clinicalColors.status.caution;
    }
  };
  
  // Toggle details visibility
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };
  
  // Handle tab selection
  const handleTabChange = (tab: 'decisions' | 'diagnostics' | 'vital-signs') => {
    setSelectedTab(tab);
  };
  
  // Handle recommendation selection
  const handleRecommendationSelect = (treatmentId: string) => {
    if (onTreatmentRecommendationSelected) {
      onTreatmentRecommendationSelected(treatmentId);
    }
  };
  
  // Handle viewing educational content
  const handleContentView = (contentId: string) => {
    if (onEducationalContentViewed) {
      onEducationalContentViewed(contentId);
    }
  };
  
  // Render decision history table
  const renderDecisionHistory = () => (
    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Decision</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Your Choice</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Outcome</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">Time (s)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {decisionHistory.map((decision, index) => (
            <TableRow key={index} sx={{ 
              '&:nth-of-type(odd)': { backgroundColor: alpha(clinicalColors.background.highlight, 0.5) }
            }}>
              <TableCell sx={{ fontWeight: 500 }}>{decision.decisionTitle}</TableCell>
              <TableCell>{decision.selectedOptionText}</TableCell>
              <TableCell align="center">
                {decision.isCorrect ? (
                  <CheckCircleIcon sx={{ color: clinicalColors.status.stable, fontSize: '1.25rem' }} />
                ) : (
                  <ErrorIcon sx={{ color: clinicalColors.status.critical, fontSize: '1.25rem' }} />
                )}
              </TableCell>
              <TableCell align="right">{decision.timeSpent}</TableCell>
            </TableRow>
          ))}
          
          {decisionHistory.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">No decisions recorded</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Render diagnostic history table
  const renderDiagnosticHistory = () => (
    <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 300 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Diagnostic Test</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="center">Viewed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {diagnosticHistory.map((test, index) => (
            <TableRow key={index} sx={{ 
              '&:nth-of-type(odd)': { backgroundColor: alpha(clinicalColors.background.highlight, 0.5) }
            }}>
              <TableCell sx={{ fontWeight: 500 }}>{test.testName}</TableCell>
              <TableCell>
                <Chip 
                  size="small" 
                  label={test.category} 
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    backgroundColor: alpha(
                      test.category.toLowerCase() === 'lab' 
                        ? clinicalColors.primary.main 
                        : clinicalColors.secondary.main, 
                      0.1
                    ),
                    color: test.category.toLowerCase() === 'lab' 
                      ? clinicalColors.primary.main 
                      : clinicalColors.secondary.main
                  }} 
                />
              </TableCell>
              <TableCell align="center">
                {test.wasViewed ? (
                  <CheckCircleIcon sx={{ color: clinicalColors.status.stable, fontSize: '1.25rem' }} />
                ) : (
                  <ErrorIcon sx={{ color: clinicalColors.status.caution, fontSize: '1.25rem' }} />
                )}
              </TableCell>
            </TableRow>
          ))}
          
          {diagnosticHistory.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                <Typography color="text.secondary">No diagnostics ordered</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  // Render vital signs comparison
  const renderVitalSignsComparison = () => (
    <Grid container spacing={2} sx={{ mt: 0.5 }}>
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Patient Vital Signs Comparison
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper elevation={0} sx={{ p: 2, backgroundColor: alpha(clinicalColors.background.highlight, 0.5) }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: clinicalColors.primary.main }}>
            Initial
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {patientInfo.vitalSigns?.bloodPressure && (
              <Box>
                <Typography variant="caption" color="text.secondary">BP</Typography>
                <Typography variant="body2">{patientInfo.vitalSigns.bloodPressure}</Typography>
              </Box>
            )}
            {patientInfo.vitalSigns?.heartRate && (
              <Box>
                <Typography variant="caption" color="text.secondary">HR</Typography>
                <Typography variant="body2">{patientInfo.vitalSigns.heartRate} bpm</Typography>
              </Box>
            )}
            {patientInfo.vitalSigns?.respiratoryRate && (
              <Box>
                <Typography variant="caption" color="text.secondary">RR</Typography>
                <Typography variant="body2">{patientInfo.vitalSigns.respiratoryRate} /min</Typography>
              </Box>
            )}
            {patientInfo.vitalSigns?.temperature && (
              <Box>
                <Typography variant="caption" color="text.secondary">Temp</Typography>
                <Typography variant="body2">{patientInfo.vitalSigns.temperature} °C</Typography>
              </Box>
            )}
            {patientInfo.vitalSigns?.oxygenSaturation && (
              <Box>
                <Typography variant="caption" color="text.secondary">O₂ Sat</Typography>
                <Typography variant="body2">{patientInfo.vitalSigns.oxygenSaturation}%</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          backgroundColor: alpha(getOutcomeColor(), 0.05),
          borderLeft: `3px solid ${getOutcomeColor()}`
        }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: getOutcomeColor() }}>
            Final
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {outcome.patientStatus?.bloodPressure && (
              <Box>
                <Typography variant="caption" color="text.secondary">BP</Typography>
                <Typography variant="body2">{outcome.patientStatus.bloodPressure}</Typography>
              </Box>
            )}
            {outcome.patientStatus?.heartRate && (
              <Box>
                <Typography variant="caption" color="text.secondary">HR</Typography>
                <Typography variant="body2">{outcome.patientStatus.heartRate} bpm</Typography>
              </Box>
            )}
            {outcome.patientStatus?.respiratoryRate && (
              <Box>
                <Typography variant="caption" color="text.secondary">RR</Typography>
                <Typography variant="body2">{outcome.patientStatus.respiratoryRate} /min</Typography>
              </Box>
            )}
            {outcome.patientStatus?.temperature && (
              <Box>
                <Typography variant="caption" color="text.secondary">Temp</Typography>
                <Typography variant="body2">{outcome.patientStatus.temperature} °C</Typography>
              </Box>
            )}
            {outcome.patientStatus?.oxygenSaturation && (
              <Box>
                <Typography variant="caption" color="text.secondary">O₂ Sat</Typography>
                <Typography variant="body2">{outcome.patientStatus.oxygenSaturation}%</Typography>
              </Box>
            )}
            <Box sx={{ width: '100%', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">Condition</Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {outcome.patientStatus.condition}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 3,
        boxShadow: shadows.medium,
        borderColor: alpha(getOutcomeColor(), 0.3),
        overflow: 'visible',
      }}
    >
      <CardContent>
        {/* Outcome Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(getOutcomeColor(), 0.1),
            color: getOutcomeColor(),
            mr: 2,
          }}>
            <MonitorHeartIcon />
          </Box>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 500, m: 0 }}>
              {outcome.title}
            </Typography>
            <Chip 
              label={`Outcome: ${outcome.type.charAt(0).toUpperCase() + outcome.type.slice(1)}`}
              size="small"
              sx={{
                backgroundColor: alpha(getOutcomeColor(), 0.1),
                color: getOutcomeColor(),
                fontWeight: 500,
              }}
            />
          </Box>
          <IconButton 
            onClick={handleToggleDetails}
            sx={{ 
              ml: 'auto',
              transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body1" paragraph>
          {outcome.description}
        </Typography>
        
        {/* Performance Overview */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: clinicalColors.background.highlight,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <InsightsIcon sx={{ mr: 1.5, color: clinicalColors.primary.main }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Clinical Decisions
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Correct: {correctDecisions}/{totalDecisions}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {correctPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={correctPercentage} 
                      sx={{ 
                        mt: 1, 
                        height: 8, 
                        borderRadius: 1,
                        backgroundColor: alpha(clinicalColors.status.neutral, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 
                            correctPercentage >= 80 ? clinicalColors.status.stable :
                            correctPercentage >= 50 ? clinicalColors.status.caution :
                            clinicalColors.status.critical
                        }
                      }} 
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: clinicalColors.background.highlight,
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <BloodtestIcon sx={{ mr: 1.5, color: clinicalColors.primary.main }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    Diagnostic Tests
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Viewed: {viewedDiagnostics}/{totalDiagnostics}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {diagnosticPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={diagnosticPercentage} 
                      sx={{ 
                        mt: 1, 
                        height: 8, 
                        borderRadius: 1,
                        backgroundColor: alpha(clinicalColors.status.neutral, 0.2),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 
                            diagnosticPercentage >= 80 ? clinicalColors.status.stable :
                            diagnosticPercentage >= 50 ? clinicalColors.status.caution :
                            clinicalColors.status.neutral
                        }
                      }} 
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Treatment Recommendations */}
        {outcome.treatmentRecommendations && outcome.treatmentRecommendations.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
              <MedicationIcon sx={{ mr: 1, fontSize: '1.25rem' }} />
              Treatment Recommendations
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {outcome.treatmentRecommendations.map((treatment, index) => (
                <Chip
                  key={index}
                  label={treatment}
                  onClick={() => handleRecommendationSelect(treatment)}
                  clickable
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderWidth: 1.5,
                    '&:hover': {
                      backgroundColor: alpha(clinicalColors.primary.main, 0.1),
                    }
                  }}
                />
              ))}
            </Box>
            
            {outcome.sponsoredTreatmentId && (
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  backgroundColor: alpha(clinicalColors.secondary.main, 0.1),
                  color: clinicalColors.secondary.dark,
                  '& .MuiAlert-icon': {
                    color: clinicalColors.secondary.main,
                  }
                }}
              >
                <Typography variant="body2">
                  Sponsored treatment option: {outcome.sponsoredTreatmentId}
                </Typography>
              </Alert>
            )}
          </Box>
        )}
        
        {/* Detailed Content - toggleable */}
        <Collapse in={showDetails} timeout={{
          enter: animationDurations.medium,
          exit: animationDurations.short,
        }}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            
            {/* Tabs for different detail sections */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', borderBottom: 1, borderColor: 'divider' }}>
                <Button 
                  onClick={() => handleTabChange('decisions')}
                  sx={{ 
                    px: 3,
                    py: 1,
                    borderBottom: 2,
                    borderColor: selectedTab === 'decisions' ? clinicalColors.primary.main : 'transparent',
                    color: selectedTab === 'decisions' ? clinicalColors.primary.main : 'text.secondary',
                    fontWeight: selectedTab === 'decisions' ? 600 : 400,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    borderRadius: 0,
                  }}
                >
                  Decisions
                </Button>
                <Button 
                  onClick={() => handleTabChange('diagnostics')}
                  sx={{ 
                    px: 3,
                    py: 1,
                    borderBottom: 2,
                    borderColor: selectedTab === 'diagnostics' ? clinicalColors.primary.main : 'transparent',
                    color: selectedTab === 'diagnostics' ? clinicalColors.primary.main : 'text.secondary',
                    fontWeight: selectedTab === 'diagnostics' ? 600 : 400,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    borderRadius: 0,
                  }}
                >
                  Diagnostics
                </Button>
                <Button 
                  onClick={() => handleTabChange('vital-signs')}
                  sx={{ 
                    px: 3,
                    py: 1,
                    borderBottom: 2,
                    borderColor: selectedTab === 'vital-signs' ? clinicalColors.primary.main : 'transparent',
                    color: selectedTab === 'vital-signs' ? clinicalColors.primary.main : 'text.secondary',
                    fontWeight: selectedTab === 'vital-signs' ? 600 : 400,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    borderRadius: 0,
                  }}
                >
                  Vital Signs
                </Button>
              </Box>
            </Box>
            
            {/* Tab content */}
            <Box sx={{ mb: 3 }}>
              {selectedTab === 'decisions' && renderDecisionHistory()}
              {selectedTab === 'diagnostics' && renderDiagnosticHistory()}
              {selectedTab === 'vital-signs' && renderVitalSignsComparison()}
            </Box>
            
            {/* Clinical Feedback */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1, fontSize: '1.25rem' }} />
                Clinical Feedback
              </Typography>
              <Alert 
                severity={
                  outcome.type === 'positive' ? 'success' : 
                  outcome.type === 'negative' ? 'error' : 
                  'warning'
                }
                sx={{ mb: 2 }}
              >
                {outcome.feedback}
              </Alert>
            </Box>
            
            {/* Educational Content */}
            {showEducationalContent && outcome.educationalContentIds && outcome.educationalContentIds.length > 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Educational Resources
                </Typography>
                <Grid container spacing={2}>
                  {outcome.educationalContentIds.map((contentId, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          border: `1px solid ${clinicalColors.border.main}`,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          '&:hover': {
                            borderColor: clinicalColors.primary.main,
                            backgroundColor: alpha(clinicalColors.primary.main, 0.04),
                          },
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                          {contentId}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2, flex: 1, color: 'text.secondary' }}>
                          Resource description would appear here. Click to view more details.
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={() => handleContentView(contentId)}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          View Resource
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default OutcomeVisualizer; 