import React from 'react';
import { 
  Box, 
  Link,
  Typography,
  Tooltip,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  SvgIconProps
} from '@mui/material';
import { styled } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ArticleIcon from '@mui/icons-material/Article';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { trackEvidenceEngagement } from '../../../services/clinical-support/evidenceService';

// Source type enum for appropriate icons
export enum EvidenceSourceType {
  STUDY = 'study',
  GUIDELINE = 'guideline',
  REFERENCE = 'reference',
  EDUCATIONAL = 'educational'
}

// Styled components
const EvidenceLinkCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  borderRadius: '4px',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
    transform: 'translateY(-1px)'
  }
}));

const SourceTypeChip = styled(Chip)<{ sourcetype: string }>(({ theme, sourcetype }) => {
  // Color mapping based on source type
  const colorMap: Record<string, string> = {
    'study': '#3f51b5',      // Indigo for studies
    'guideline': '#009688',  // Teal for guidelines
    'reference': '#607d8b',  // Blue-grey for references
    'educational': '#ff9800' // Orange for educational
  };
  
  return {
    backgroundColor: colorMap[sourcetype] || '#757575',
    color: '#fff',
    fontSize: '0.7rem',
    height: 20
  };
});

interface EvidenceLinkProps {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceType: EvidenceSourceType;
  description?: string;
  year?: number;
  anonymizedUserId?: string;
}

const EvidenceLink: React.FC<EvidenceLinkProps> = ({
  id,
  title,
  url,
  source,
  sourceType,
  description,
  year,
  anonymizedUserId
}) => {
  // Handle click tracking
  const handleClick = () => {
    trackEvidenceEngagement(
      id,
      'click',
      anonymizedUserId
    );
  };
  
  // Get icon based on source type
  const getSourceIcon = (): React.ReactElement<SvgIconProps> => {
    switch (sourceType) {
      case EvidenceSourceType.STUDY:
        return <SchoolIcon fontSize="small" />;
      case EvidenceSourceType.GUIDELINE:
        return <LocalHospitalIcon fontSize="small" />;
      case EvidenceSourceType.REFERENCE:
        return <LibraryBooksIcon fontSize="small" />;
      default:
        return <ArticleIcon fontSize="small" />;
    }
  };
  
  // Get human-readable source type
  const getSourceTypeText = (): string => {
    switch (sourceType) {
      case EvidenceSourceType.STUDY:
        return 'Clinical Study';
      case EvidenceSourceType.GUIDELINE:
        return 'Clinical Guideline';
      case EvidenceSourceType.REFERENCE:
        return 'Reference';
      case EvidenceSourceType.EDUCATIONAL:
        return 'Educational Content';
      default:
        return 'Source';
    }
  };
  
  return (
    <EvidenceLinkCard>
      <CardActionArea component="a" href={url} target="_blank" rel="noopener" onClick={handleClick}>
        <CardContent sx={{ p: 1.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              {getSourceIcon()}
              <Typography variant="subtitle2" sx={{ ml: 1, fontWeight: 'medium' }}>
                {title}
              </Typography>
            </Box>
            <OpenInNewIcon fontSize="small" color="action" />
          </Box>
          
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary">
              {source} {year && `(${year})`}
            </Typography>
            <SourceTypeChip 
              label={getSourceTypeText()}
              size="small"
              sourcetype={sourceType}
              sx={{ ml: 1 }}
            />
          </Box>
          
          {description && (
            <Tooltip title={description} arrow placement="top">
              <Typography 
                variant="body2" 
                color="textSecondary" 
                sx={{ 
                  mt: 1, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {description}
              </Typography>
            </Tooltip>
          )}
        </CardContent>
      </CardActionArea>
    </EvidenceLinkCard>
  );
};

export default EvidenceLink; 