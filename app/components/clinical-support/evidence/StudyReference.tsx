import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  Collapse,
  Link,
  Tooltip,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArticleIcon from '@mui/icons-material/Article';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import { styled } from '@mui/material/styles';
import { ClinicalEvidence, EvidenceLevel } from '../../../models/phase4';
import { trackEvidenceEngagement } from '../../../services/clinical-support/evidenceService';

// Styled components
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

const CitationBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontStyle: 'italic'
}));

interface StudyReferenceProps {
  evidence: ClinicalEvidence;
  citation: string;
  relevanceScore?: number;
  showRelevance?: boolean;
  anonymizedUserId?: string;
}

const StudyReference: React.FC<StudyReferenceProps> = ({
  evidence,
  citation,
  relevanceScore,
  showRelevance = false,
  anonymizedUserId
}) => {
  const [expanded, setExpanded] = useState(false);
  
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
  
  // Handle expand/collapse
  const handleExpandClick = () => {
    setExpanded(!expanded);
    
    // Track engagement when expanded
    if (!expanded) {
      trackEvidenceEngagement(
        evidence.id,
        'view',
        anonymizedUserId
      );
    }
  };
  
  // Handle external link click
  const handleLinkClick = () => {
    trackEvidenceEngagement(
      evidence.id,
      'click',
      anonymizedUserId
    );
  };
  
  // Handle save action
  const handleSaveClick = () => {
    trackEvidenceEngagement(
      evidence.id,
      'save',
      anonymizedUserId
    );
  };
  
  // Handle share action
  const handleShareClick = () => {
    trackEvidenceEngagement(
      evidence.id,
      'share',
      anonymizedUserId
    );
  };
  
  return (
    <EvidenceCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mr: 1 }}>
              {evidence.title}
            </Typography>
            <EvidenceChip 
              label={getEvidenceLevelText(evidence.evidenceLevel)} 
              size="small"
              evidencelevel={evidence.evidenceLevel}
            />
          </Box>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
          >
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {evidence.source} • {formatDate(evidence.publicationDate)}
        </Typography>
        
        {showRelevance && relevanceScore !== undefined && (
          <Box display="flex" alignItems="center" mt={1} mb={1}>
            <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
              Relevance:
            </Typography>
            <Box
              sx={{
                width: 100,
                height: 6,
                borderRadius: 3,
                bgcolor: '#e0e0e0',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: 3,
                  width: `${relevanceScore * 100}%`,
                  bgcolor: relevanceScore > 0.7 ? '#4caf50' : relevanceScore > 0.4 ? '#ff9800' : '#f44336',
                }}
              />
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              {(relevanceScore * 100).toFixed(0)}%
            </Typography>
          </Box>
        )}
        
        <Typography variant="body2" paragraph>
          {evidence.summary}
        </Typography>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ mb: 2 }} />
          
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Study Classification:
            </Typography>
            <Box display="flex" flexWrap="wrap" mt={1}>
              {evidence.tags.map((tag, i) => (
                <Chip 
                  key={i} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                  sx={{ mr: 0.5, mb: 0.5 }}
                />
              ))}
            </Box>
          </Box>
          
          <CitationBox>
            <Typography variant="caption" color="textSecondary" gutterBottom display="block">
              Cite as:
            </Typography>
            {citation}
          </CitationBox>
        </Collapse>
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box>
            <Tooltip title="Save reference">
              <IconButton size="small" onClick={handleSaveClick}>
                <BookmarkBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share reference">
              <IconButton size="small" onClick={handleShareClick}>
                <ShareIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Link 
            href={evidence.url} 
            target="_blank" 
            rel="noopener"
            onClick={handleLinkClick}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ArticleIcon fontSize="small" sx={{ mr: 0.5 }} />
            View Source
          </Link>
        </Box>
      </CardContent>
    </EvidenceCard>
  );
};

export default StudyReference; 