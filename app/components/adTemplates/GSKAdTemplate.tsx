import React from 'react';
import { 
  Box,
  Typography,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/system';
import BaseAdTemplate, { BaseAdTemplateProps } from './BaseAdTemplate';
import { AdContent } from '../../models/adTypes';

// GSK brand colors
const GSK_COLORS = {
  primary: '#F36633', // GSK orange
  secondary: '#1E1E1E', // Dark grey
  accent: '#AAD4ED', // Light blue
  respiratory: '#62CFF4', // Respiratory blue
  immunology: '#A2CD3A', // Immunology green
  vaccines: '#F47B20', // Vaccines orange
  textLight: '#ffffff',
  textDark: '#333333',
  backgroundGrey: '#F5F5F5',
};

// Styled components specific to GSK's brand guidelines
const GSKContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: `linear-gradient(90deg, ${GSK_COLORS.primary} 0%, ${GSK_COLORS.primary} 33%, ${GSK_COLORS.accent} 33%, ${GSK_COLORS.accent} 66%, ${GSK_COLORS.secondary} 66%, ${GSK_COLORS.secondary} 100%)`,
  }
}));

const GSKHeader = styled(Box)<{ categoryId: string }>(({ theme, categoryId }) => {
  // Select color based on treatment area
  let headerColor = GSK_COLORS.primary;
  if (categoryId.includes('respiratory')) {
    headerColor = GSK_COLORS.respiratory;
  } else if (categoryId.includes('immunology')) {
    headerColor = GSK_COLORS.immunology;
  } else if (categoryId.includes('vaccines')) {
    headerColor = GSK_COLORS.vaccines;
  }
  
  return {
    backgroundColor: headerColor,
    color: GSK_COLORS.textLight,
    padding: theme.spacing(1, 2),
    borderRadius: '0px',
    fontWeight: 600,
  };
});

// Bullet point for evidence list
const EvidenceBullet = styled(Box)<{ categoryId: string }>(({ theme, categoryId }) => {
  // Select color based on treatment area
  let bulletColor = GSK_COLORS.primary;
  if (categoryId.includes('respiratory')) {
    bulletColor = GSK_COLORS.respiratory;
  } else if (categoryId.includes('immunology')) {
    bulletColor = GSK_COLORS.immunology;
  } else if (categoryId.includes('vaccines')) {
    bulletColor = GSK_COLORS.vaccines;
  }
  
  return {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: bulletColor,
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(0.6),
  };
});

// Evidence panel with key info
const EvidencePanel = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: GSK_COLORS.backgroundGrey,
  borderLeft: `3px solid ${GSK_COLORS.primary}`,
  borderRadius: '0 4px 4px 0',
}));

interface ExtendedTreatmentCategory {
  id: string;
  name: string;
  medicalCategoryName?: string;
}

interface ExtendedAdContent extends Omit<AdContent, 'treatmentCategory'> {
  treatmentCategory: ExtendedTreatmentCategory;
}

export interface GSKAdTemplateProps extends Omit<BaseAdTemplateProps, 'adContent'> {
  adContent: AdContent;
  showEvidencePanel?: boolean;
  evidencePoints?: string[];
  showBadge?: boolean;
  activeIndicator?: string;
  studyStats?: string;
}

/**
 * GSKAdTemplate component
 * 
 * Customized ad template for GSK with their brand styling
 * and specialized layouts for different treatment categories.
 * Features evidence-based bullet points for clinical information.
 */
const GSKAdTemplate: React.FC<GSKAdTemplateProps> = ({
  adContent,
  showEvidencePanel = true,
  evidencePoints,
  showBadge = true,
  activeIndicator,
  studyStats,
  ...baseProps
}) => {
  const theme = useTheme();
  // Cast to extended type
  const extendedAdContent = adContent as unknown as ExtendedAdContent;
  const { company, creative, treatmentCategory } = extendedAdContent;
  
  // Apply GSK-specific display customizations
  const customizedAdContent: AdContent = {
    ...adContent,
    company: {
      ...adContent.company,
      primaryColor: GSK_COLORS.primary,
      secondaryColor: GSK_COLORS.secondary,
      defaultDisplaySettings: {
        ...adContent.company.defaultDisplaySettings,
        backgroundColor: '#ffffff',
        textColor: GSK_COLORS.textDark,
        cornerRadius: 0, // GSK uses sharp corners in their design
        border: true,
        borderColor: '#e0e0e0',
        logoPosition: 'top',
      }
    }
  };
  
  // Generate evidence points based on treatment area if not provided
  const getDefaultEvidencePoints = () => {
    if (treatmentCategory.id.includes('respiratory')) {
      return [
        'Clinically significant improvement in lung function (FEV1)',
        'Reduced risk of exacerbations by up to 36%',
        'Improved quality of life measures in 74% of patients'
      ];
    } else if (treatmentCategory.id.includes('immunology')) {
      return [
        'Sustained symptom reduction in SLE patients',
        'Significant improvement in SELENA-SLEDAI scores',
        'Reduced need for oral corticosteroids'
      ];
    } else if (treatmentCategory.id.includes('vaccines')) {
      return [
        'Over 90% efficacy in preventing disease',
        'Robust immune response across age groups',
        'Demonstrated safety profile in clinical trials'
      ];
    }
    
    return [
      'Clinically proven efficacy in controlled studies',
      'Favorable safety profile in long-term follow-up',
      'Improved patient-reported outcomes'
    ];
  };
  
  const finalEvidencePoints = evidencePoints || getDefaultEvidencePoints();
  
  // Customize layout based on treatment category
  const renderCustomContent = () => {
    return (
      <GSKContainer>
        {/* Category-specific header */}
        <GSKHeader categoryId={treatmentCategory.id}>
          <Typography variant="subtitle2">
            {treatmentCategory.medicalCategoryName || 'Medical Category'} | {treatmentCategory.name}
          </Typography>
        </GSKHeader>
        
        {/* Evidence-based information panel */}
        {showEvidencePanel && finalEvidencePoints.length > 0 && (
          <EvidencePanel>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600, 
                color: GSK_COLORS.secondary,
                mb: 1 
              }}
            >
              Research Highlights
            </Typography>
            
            <List dense disablePadding>
              {finalEvidencePoints.map((point, index) => (
                <ListItem 
                  key={index}
                  alignItems="flex-start" 
                  sx={{ padding: 0, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <EvidenceBullet categoryId={treatmentCategory.id} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        {point}
                      </Typography>
                    }
                    sx={{ margin: 0 }}
                  />
                </ListItem>
              ))}
            </List>
            
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                fontStyle: 'italic',
                mt: 1,
                color: GSK_COLORS.secondary
              }}
            >
              Based on Phase III clinical data
            </Typography>
          </EvidencePanel>
        )}
        
        <Divider sx={{ my: 1.5 }} />
      </GSKContainer>
    );
  };
  
  // Pass the customized content to the base template
  return (
    <BaseAdTemplate
      adContent={customizedAdContent}
      {...baseProps}
    >
      {renderCustomContent()}
    </BaseAdTemplate>
  );
};

export default GSKAdTemplate; 