import React, { useState } from 'react';
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
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import ArticleIcon from '@mui/icons-material/Article';
import { styled } from '@mui/material/styles';
import { 
  ClinicalGuideline, 
  ClinicalRecommendation, 
  RecommendationStrength, 
  EvidenceQuality 
} from '../../../models/phase4';
import { trackEvidenceEngagement } from '../../../services/clinical-support/evidenceService';

// Styled components
const GuidelineCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
    transform: 'translateY(-1px)'
  }
}));

const RecommendationBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  borderLeft: '4px solid #3f51b5'
}));

const CitationBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontStyle: 'italic'
}));

// Color mapping based on recommendation strength
const strengthColorMap: Record<string, string> = {
  'STRONG': '#4caf50',
  'MODERATE': '#cddc39',
  'WEAK': '#ff9800',
  'CONDITIONAL': '#ff9800'
};

// Color mapping based on evidence quality
const qualityColorMap: Record<string, string> = {
  'HIGH': '#4caf50',
  'MODERATE': '#ffeb3b',
  'LOW': '#ff9800',
  'VERY_LOW': '#f44336'
};

interface GuidelineReferenceProps {
  guideline: ClinicalGuideline;
  citation: string;
  anonymizedUserId?: string;
}

const GuidelineReference: React.FC<GuidelineReferenceProps> = ({
  guideline,
  citation,
  anonymizedUserId
}) => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
    
    // Track engagement when expanded
    if (isExpanded) {
      trackEvidenceEngagement(
        guideline.id,
        'view',
        anonymizedUserId
      );
    }
  };
  
  // Format date to readable string
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle external link click
  const handleLinkClick = () => {
    trackEvidenceEngagement(
      guideline.id,
      'click',
      anonymizedUserId
    );
  };
  
  // Handle save action
  const handleSaveClick = () => {
    trackEvidenceEngagement(
      guideline.id,
      'save',
      anonymizedUserId
    );
  };
  
  // Handle share action
  const handleShareClick = () => {
    trackEvidenceEngagement(
      guideline.id,
      'share',
      anonymizedUserId
    );
  };
  
  // Format recommendation strength for display
  const formatStrength = (strength: RecommendationStrength): string => {
    return strength.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format evidence quality for display
  const formatQuality = (quality: EvidenceQuality): string => {
    return quality.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <GuidelineCard>
      <CardContent>
        <Box display="flex" alignItems="flex-start" mb={1}>
          <LocalHospitalIcon 
            fontSize="small" 
            color="primary" 
            sx={{ mr: 1, mt: 0.5 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {guideline.title}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {guideline.organization} • Last updated: {formatDate(guideline.lastUpdated)}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" paragraph>
          {guideline.summary}
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Typography variant="subtitle2" gutterBottom>
          Key Recommendations:
        </Typography>
        
        {guideline.recommendations.map((rec: ClinicalRecommendation, index: number) => (
          <Accordion 
            key={rec.id || index}
            expanded={expanded === `panel-${index}`}
            onChange={handleChange(`panel-${index}`)}
            elevation={0}
            sx={{ 
              border: '1px solid #e0e0e0', 
              mb: 1, 
              '&:before': { display: 'none' } 
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ backgroundColor: '#f9f9f9' }}
            >
              <Typography variant="body2" fontWeight="medium">
                Recommendation {index + 1}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RecommendationBox>
                <Typography variant="body2" paragraph>
                  {rec.text}
                </Typography>
                <Box display="flex" flexWrap="wrap">
                  <Chip 
                    label={`Strength: ${formatStrength(rec.strengthOfRecommendation)}`} 
                    size="small"
                    sx={{ 
                      mr: 1, 
                      mb: 0.5, 
                      bgcolor: strengthColorMap[rec.strengthOfRecommendation],
                      color: '#fff' 
                    }}
                  />
                  <Chip 
                    label={`Evidence: ${formatQuality(rec.evidenceQuality)}`} 
                    size="small"
                    sx={{ 
                      mb: 0.5, 
                      bgcolor: qualityColorMap[rec.evidenceQuality],
                      color: '#fff' 
                    }}
                  />
                </Box>
              </RecommendationBox>
            </AccordionDetails>
          </Accordion>
        ))}
        
        <CitationBox>
          <Typography variant="caption" color="textSecondary" gutterBottom display="block">
            Cite as:
          </Typography>
          {citation}
        </CitationBox>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box>
            <Tooltip title="Save guideline">
              <IconButton size="small" onClick={handleSaveClick}>
                <BookmarkBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share guideline">
              <IconButton size="small" onClick={handleShareClick}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Link 
            href={guideline.url} 
            target="_blank" 
            rel="noopener"
            onClick={handleLinkClick}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ArticleIcon fontSize="small" sx={{ mr: 0.5 }} />
            View Full Guidelines
          </Link>
        </Box>
      </CardContent>
    </GuidelineCard>
  );
};

export default GuidelineReference; 