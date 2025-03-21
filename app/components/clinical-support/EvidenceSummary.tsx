import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Link,
  LinearProgress,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import { ClinicalEvidence, ClinicalGuideline, EvidenceLevel } from '../../models/phase4';

const EvidenceCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
    transform: 'translateY(-2px)'
  }
}));

const EvidenceChip = styled(Chip)<{ evidencelevel: string }>(({ theme, evidencelevel }) => {
  // Color mapping based on evidence level
  const colorMap: Record<string, string> = {
    'META_ANALYSIS': '#4caf50', // Green for highest level
    'SYSTEMATIC_REVIEW': '#8bc34a',
    'RANDOMIZED_CONTROLLED_TRIAL': '#cddc39',
    'COHORT_STUDY': '#ffeb3b',
    'CASE_CONTROL': '#ffc107',
    'CASE_SERIES': '#ff9800',
    'EXPERT_OPINION': '#ff5722' // Orange for lowest level
  };
  
  return {
    backgroundColor: colorMap[evidencelevel] || '#e0e0e0',
    color: '#fff',
    fontWeight: 'bold',
    marginRight: theme.spacing(1)
  };
});

const ConfidenceIndicator = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1)
}));

interface EvidenceSummaryProps {
  evidence: ClinicalEvidence[];
  guidelines: ClinicalGuideline[];
  confidence: number;
}

const EvidenceSummary: React.FC<EvidenceSummaryProps> = ({
  evidence,
  guidelines,
  confidence
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent, 
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Get human-readable evidence level
  const getEvidenceLevelText = (level: EvidenceLevel): string => {
    return level.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate confidence text and color
  const getConfidenceInfo = (score: number): { text: string; color: string } => {
    if (score >= 0.8) return { text: 'High Confidence', color: '#4caf50' };
    if (score >= 0.6) return { text: 'Moderate Confidence', color: '#cddc39' };
    if (score >= 0.4) return { text: 'Fair Confidence', color: '#ffc107' };
    return { text: 'Low Confidence', color: '#ff5722' };
  };

  const confidenceInfo = getConfidenceInfo(confidence);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Clinical Evidence
      </Typography>
      
      <ConfidenceIndicator>
        <Box display="flex" alignItems="center" mb={1}>
          <Typography variant="body2" mr={1}>Confidence:</Typography>
          <Typography 
            variant="body2" 
            fontWeight="bold" 
            style={{ color: confidenceInfo.color }}
          >
            {confidenceInfo.text}
          </Typography>
        </Box>
        <Tooltip title={`${Math.round(confidence * 100)}% confidence score`}>
          <LinearProgress 
            variant="determinate" 
            value={confidence * 100} 
            sx={{ 
              height: 8, 
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: confidenceInfo.color
              }
            }} 
          />
        </Tooltip>
      </ConfidenceIndicator>
      
      {/* Clinical Evidence Section */}
      {evidence.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            <SchoolIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Research Evidence ({evidence.length})
          </Typography>
          
          {evidence.map((item, index) => (
            <EvidenceCard key={item.id || index}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="subtitle1" fontWeight="medium">
                    {item.title}
                  </Typography>
                  <EvidenceChip 
                    label={getEvidenceLevelText(item.evidenceLevel)} 
                    size="small"
                    evidencelevel={item.evidenceLevel}
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {item.source} • {formatDate(item.publicationDate)}
                </Typography>
                
                <Typography variant="body2" paragraph>
                  {item.summary}
                </Typography>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    {item.tags.map((tag, i) => (
                      <Chip 
                        key={i} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Link href={item.url} target="_blank" rel="noopener">
                    View Source
                  </Link>
                </Box>
              </CardContent>
            </EvidenceCard>
          ))}
        </Box>
      )}
      
      {/* Clinical Guidelines Section */}
      {guidelines.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            <LocalHospitalIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
            Clinical Guidelines ({guidelines.length})
          </Typography>
          
          {guidelines.map((guideline, index) => (
            <Accordion 
              key={guideline.id || index}
              expanded={expanded === `panel-${index}`}
              onChange={handleAccordionChange(`panel-${index}`)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box>
                  <Typography variant="subtitle2">
                    {guideline.title}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {guideline.organization} • Last updated: {formatDate(guideline.lastUpdated)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {guideline.summary}
                </Typography>
                
                {guideline.recommendations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Recommendations:
                    </Typography>
                    {guideline.recommendations.map((rec, i) => (
                      <Box key={rec.id || i} mb={1} p={1} bgcolor="#f5f5f5" borderRadius={1}>
                        <Typography variant="body2">
                          {rec.text}
                        </Typography>
                        <Box display="flex" mt={1}>
                          <Chip 
                            label={`Strength: ${rec.strengthOfRecommendation}`} 
                            size="small"
                            sx={{ mr: 1, bgcolor: '#e3f2fd' }}
                          />
                          <Chip 
                            label={`Evidence: ${rec.evidenceQuality}`} 
                            size="small"
                            sx={{ bgcolor: '#fff3e0' }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
                
                <Box mt={2} display="flex" justifyContent="flex-end">
                  <Link href={guideline.url} target="_blank" rel="noopener">
                    View Full Guidelines
                  </Link>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EvidenceSummary; 