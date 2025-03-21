'use client';

import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Avatar, 
  IconButton, 
  Box, 
  Chip, 
  Divider, 
  Collapse, 
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { PatientInfo, LabResult, ImagingResult } from '../../../models/microsimulation';
import { clinicalColors, getStatusColor } from '../../../styles/microsimulation';

interface ClinicalScenarioCardProps {
  patientInfo: PatientInfo;
  scenarioTitle: string;
  scenarioDescription: string;
  patientStatus: string;
  onInfoViewed?: (section: string) => void;
}

/**
 * Component to display patient information and scenario context
 * Used as the primary information display in clinical microsimulations
 */
export const ClinicalScenarioCard: React.FC<ClinicalScenarioCardProps> = ({
  patientInfo,
  scenarioTitle,
  scenarioDescription,
  patientStatus,
  onInfoViewed,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Format patient vitals for display
  const formatVitals = () => {
    const vitals = patientInfo.vitalSigns;
    if (!vitals) return [];
    
    const formattedVitals = [];
    if (vitals.bloodPressure) formattedVitals.push({ name: 'BP', value: vitals.bloodPressure });
    if (vitals.heartRate) formattedVitals.push({ name: 'HR', value: `${vitals.heartRate} bpm` });
    if (vitals.respiratoryRate) formattedVitals.push({ name: 'RR', value: `${vitals.respiratoryRate} /min` });
    if (vitals.temperature) formattedVitals.push({ name: 'Temp', value: `${vitals.temperature} °C` });
    if (vitals.oxygenSaturation) formattedVitals.push({ name: 'O₂ Sat', value: `${vitals.oxygenSaturation}%` });
    
    return formattedVitals;
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
    if (!expanded && onInfoViewed) {
      onInfoViewed('patient_details');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (onInfoViewed) {
      const sections = ['overview', 'labs', 'imaging', 'history'];
      onInfoViewed(`patient_${sections[newValue]}`);
    }
  };

  // Render lab results in a table
  const renderLabResults = () => {
    if (!patientInfo.labResults || patientInfo.labResults.length === 0) {
      return <Typography variant="body2">No laboratory results available.</Typography>;
    }
    
    return (
      <TableContainer component={Paper} elevation={0} 
        sx={{ backgroundColor: 'transparent', maxHeight: 240 }}>
        <Table size="small" stickyHeader>
          <TableBody>
            {patientInfo.labResults.map((lab: LabResult, index: number) => (
              <TableRow key={index} sx={{ 
                '&:nth-of-type(odd)': { backgroundColor: clinicalColors.background.highlight } 
              }}>
                <TableCell sx={{ fontWeight: 500 }}>{lab.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: lab.isAbnormal ? 'error.main' : 'text.primary',
                        fontWeight: lab.isAbnormal ? 600 : 400,
                      }}
                    >
                      {lab.value} {lab.unit && `${lab.unit}`}
                    </Typography>
                    {lab.isAbnormal && (
                      <Box component="span" sx={{ 
                        fontSize: '16px', 
                        ml: 1, 
                        color: 'error.main',
                        lineHeight: 1 
                      }}>
                        {typeof lab.value === 'number' && lab.referenceRange && 
                          (lab.value > Number(lab.referenceRange.split('-')[1]) ? '↑' : '↓')}
                      </Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                  {lab.referenceRange}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render imaging results
  const renderImagingResults = () => {
    if (!patientInfo.imagingResults || patientInfo.imagingResults.length === 0) {
      return <Typography variant="body2">No imaging results available.</Typography>;
    }
    
    return (
      <Box sx={{ maxHeight: 240, overflow: 'auto' }}>
        {patientInfo.imagingResults.map((image: ImagingResult, index: number) => (
          <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < patientInfo.imagingResults!.length - 1 ? `1px solid ${clinicalColors.border.light}` : 'none' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {image.type} - {image.region}
              {image.performedAt && (
                <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  ({new Date(image.performedAt).toLocaleDateString()})
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {image.finding}
            </Typography>
            {image.impression && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Impression: {image.impression}
              </Typography>
            )}
            {image.imageUrl && (
              <Box 
                component="img" 
                sx={{ 
                  width: '100%', 
                  maxWidth: 240, 
                  mt: 1, 
                  border: `1px solid ${clinicalColors.border.light}`,
                  borderRadius: 1
                }} 
                src={image.imageUrl} 
                alt={`${image.type} of ${image.region}`} 
              />
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Render patient history
  const renderHistory = () => {
    return (
      <Box sx={{ maxHeight: 240, overflow: 'auto' }}>
        {patientInfo.historyOfPresentIllness && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              History of Present Illness
            </Typography>
            <Typography variant="body2" paragraph>
              {patientInfo.historyOfPresentIllness}
            </Typography>
          </Box>
        )}
        
        {patientInfo.medicalHistory && patientInfo.medicalHistory.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Medical History
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {patientInfo.medicalHistory.map((item, index) => (
                <Chip 
                  key={index} 
                  label={item} 
                  size="small" 
                  sx={{ 
                    backgroundColor: clinicalColors.background.highlight,
                    color: clinicalColors.text.primary,
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}
        
        {patientInfo.medications && patientInfo.medications.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Current Medications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {patientInfo.medications.map((med, index) => (
                <Typography key={index} variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block', 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      backgroundColor: clinicalColors.primary.main, 
                      mr: 1 
                    }} 
                  />
                  {med}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
        
        {patientInfo.allergies && patientInfo.allergies.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: 'error.main' }}>
              Allergies
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {patientInfo.allergies.map((allergy, index) => (
                <Chip 
                  key={index} 
                  label={allergy} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'error.light',
                    color: 'error.contrastText',
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: clinicalColors.primary.light }}>
            <PersonIcon />
          </Avatar>
        }
        action={
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMoreIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }} 
            />
          </IconButton>
        }
        title={scenarioTitle}
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
            <Chip 
              size="small" 
              icon={<MedicalServicesIcon sx={{ fontSize: '0.875rem !important' }} />}
              label={`Patient: ${patientInfo.age} y.o. ${patientInfo.gender}`} 
              sx={{ 
                height: 24, 
                backgroundColor: clinicalColors.background.highlight,
                color: clinicalColors.text.primary,
              }} 
            />
            <Chip 
              size="small" 
              label={`Status: ${patientStatus}`} 
              sx={{ 
                height: 24, 
                backgroundColor: alpha(getStatusColor(patientStatus), 0.1),
                color: getStatusColor(patientStatus),
                fontWeight: 500,
              }} 
            />
          </Box>
        }
        sx={{ 
          pb: 0.5, 
          '.MuiCardHeader-content': { 
            overflow: 'hidden',
          },
          '.MuiCardHeader-title': {
            fontSize: '1.2rem',
            fontWeight: 500,
          },
          '.MuiCardHeader-subheader': {
            whiteSpace: 'normal',
          },
        }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {scenarioDescription}
        </Typography>
        
        <Box 
          sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1.5, 
            mt: 1,
            p: 1,
            backgroundColor: clinicalColors.background.highlight,
            borderRadius: 1,
          }}
        >
          {formatVitals().map((vital, index) => (
            <Box key={index} sx={{ minWidth: '70px' }}>
              <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                {vital.name}
              </Typography>
              <Typography variant="body2" component="div" sx={{ fontWeight: 500 }}>
                {vital.value}
              </Typography>
            </Box>
          ))}
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Divider />
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="patient information tabs"
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2,
                mt: 2,
                '& .MuiTab-root': { 
                  minWidth: 0,
                  py: 1,
                },
              }}
            >
              <Tab label="Overview" id="patient-tab-0" aria-controls="patient-tabpanel-0" />
              <Tab label="Labs" id="patient-tab-1" aria-controls="patient-tabpanel-1" />
              <Tab label="Imaging" id="patient-tab-2" aria-controls="patient-tabpanel-2" />
              <Tab label="History" id="patient-tab-3" aria-controls="patient-tabpanel-3" />
            </Tabs>
            
            <Box
              role="tabpanel"
              hidden={tabValue !== 0}
              id="patient-tabpanel-0"
              aria-labelledby="patient-tab-0"
            >
              {tabValue === 0 && (
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    Chief Complaint: {patientInfo.chiefComplaint}
                  </Typography>
                  
                  {patientInfo.historyOfPresentIllness && (
                    <Typography variant="body2" paragraph>
                      {patientInfo.historyOfPresentIllness}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    {/* Left column */}
                    <Box sx={{ flex: 1, minWidth: '180px' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Demographics
                      </Typography>
                      <Typography variant="body2">
                        Age: {patientInfo.age} years
                      </Typography>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        Gender: {patientInfo.gender}
                      </Typography>
                      {patientInfo.height && patientInfo.weight && (
                        <>
                          <Typography variant="body2">
                            Height: {patientInfo.height} cm
                          </Typography>
                          <Typography variant="body2">
                            Weight: {patientInfo.weight} kg
                          </Typography>
                          <Typography variant="body2">
                            BMI: {Math.round((patientInfo.weight / Math.pow(patientInfo.height/100, 2)) * 10) / 10}
                          </Typography>
                        </>
                      )}
                    </Box>
                    
                    {/* Right column */}
                    <Box sx={{ flex: 1, minWidth: '180px' }}>
                      {patientInfo.medications && patientInfo.medications.length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Medications
                          </Typography>
                          {patientInfo.medications.slice(0, 3).map((med, index) => (
                            <Typography key={index} variant="body2">
                              • {med}
                            </Typography>
                          ))}
                          {patientInfo.medications.length > 3 && (
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              + {patientInfo.medications.length - 3} more
                            </Typography>
                          )}
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
            
            <Box
              role="tabpanel"
              hidden={tabValue !== 1}
              id="patient-tabpanel-1"
              aria-labelledby="patient-tab-1"
            >
              {tabValue === 1 && renderLabResults()}
            </Box>
            
            <Box
              role="tabpanel"
              hidden={tabValue !== 2}
              id="patient-tabpanel-2"
              aria-labelledby="patient-tab-2"
            >
              {tabValue === 2 && renderImagingResults()}
            </Box>
            
            <Box
              role="tabpanel"
              hidden={tabValue !== 3}
              id="patient-tabpanel-3"
              aria-labelledby="patient-tab-3"
            >
              {tabValue === 3 && renderHistory()}
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ClinicalScenarioCard; 