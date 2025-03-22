import React from 'react';
import { 
  Box,
  Typography,
  useTheme,
  Grid,
  Divider
} from '@mui/material';
import { styled } from '@mui/system';
import BaseAdTemplate, { BaseAdTemplateProps } from './BaseAdTemplate';
import { AdContent } from '../../models/adTypes';

// Genentech brand colors
const GENENTECH_COLORS = {
  primary: '#0057b8', // Genentech blue
  secondary: '#00a3e0', // Lighter blue
  accent: '#71c5e8', // Accent blue
  oncology: '#a5225d', // Purple for oncology
  ophthalmology: '#41b6e6', // Light blue for ophthalmology
  neurology: '#5c068c', // Deep purple for neurology
  textLight: '#ffffff',
  textDark: '#1a1a1a',
};

// Styled components specific to Genentech's brand guidelines
const GenentechContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderTop: `2px solid ${GENENTECH_COLORS.primary}`,
  borderBottom: `2px solid ${GENENTECH_COLORS.primary}`,
  padding: theme.spacing(2, 0),
  margin: theme.spacing(1, 0, 2),
}));

const CategoryHeader = styled(Box)<{ categoryId: string }>(({ theme, categoryId }) => {
  // Select color based on treatment area
  let headerColor = GENENTECH_COLORS.primary;
  if (categoryId.includes('oncology')) {
    headerColor = GENENTECH_COLORS.oncology;
  } else if (categoryId.includes('ophthalmology')) {
    headerColor = GENENTECH_COLORS.ophthalmology;
  } else if (categoryId.includes('neurology')) {
    headerColor = GENENTECH_COLORS.neurology;
  }
  
  return {
    backgroundColor: headerColor,
    color: GENENTECH_COLORS.textLight,
    padding: theme.spacing(1, 2),
    borderRadius: '4px 4px 0 0',
    fontWeight: 500,
  };
});

// Evidence badge for clinical data
const EvidenceBadge = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: '#f7f7f7',
  padding: theme.spacing(1),
  borderRadius: '4px',
}));

// Clinical stat box
const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1),
  backgroundColor: '#f0f7fc',
  borderRadius: '4px',
  height: '100%',
}));

interface ExtendedTreatmentCategory {
  id: string;
  name: string;
  medicalCategoryName?: string;
}

interface ExtendedAdContent extends Omit<AdContent, 'treatmentCategory'> {
  treatmentCategory: ExtendedTreatmentCategory;
}

export interface GenentechAdTemplateProps extends Omit<BaseAdTemplateProps, 'adContent'> {
  adContent: AdContent;
  showStats?: boolean;
  clinicalStats?: {
    title: string;
    value: string;
    description: string;
  }[];
}

/**
 * GenentechAdTemplate component
 * 
 * Customized ad template for Genentech with their brand styling
 * and specialized layouts for different treatment categories.
 * Includes visualization of clinical data for evidence-based presentation.
 */
const GenentechAdTemplate: React.FC<GenentechAdTemplateProps> = ({
  adContent,
  showStats = true,
  clinicalStats,
  ...baseProps
}) => {
  const theme = useTheme();
  const { company, creative, treatmentCategory } = adContent as ExtendedAdContent;
  
  // Apply Genentech-specific display customizations
  const customizedAdContent: ExtendedAdContent = {
    ...adContent,
    company: {
      ...company,
      primaryColor: GENENTECH_COLORS.primary,
      secondaryColor: GENENTECH_COLORS.secondary,
      defaultDisplaySettings: {
        ...company.defaultDisplaySettings,
        backgroundColor: '#ffffff',
        textColor: GENENTECH_COLORS.textDark,
        cornerRadius: 4,
        border: true,
        borderColor: '#e0e0e0',
        logoPosition: 'right',
      }
    }
  };
  
  // Default clinical stats based on treatment area
  const getDefaultStats = () => {
    if (treatmentCategory.id.includes('oncology')) {
      return [
        { title: 'Survival Rate', value: '62%', description: 'Increased overall survival' },
        { title: 'Response Rate', value: '87%', description: 'Objective response rate' },
      ];
    } else if (treatmentCategory.id.includes('ophthalmology')) {
      return [
        { title: 'Vision Gain', value: '+8.7', description: 'Letters gained at 12 months' },
        { title: 'Treatment Need', value: '-45%', description: 'Reduced injection frequency' },
      ];
    } else if (treatmentCategory.id.includes('neurology')) {
      return [
        { title: 'Disease Activity', value: '-94%', description: 'Reduction in MRI lesions' },
        { title: 'Mobility', value: '+28%', description: 'Improvement in mobility scores' },
      ];
    }
    
    return [
      { title: 'Efficacy', value: '87%', description: 'Primary endpoint achievement' },
      { title: 'Safety', value: '96%', description: 'Patients completing treatment' },
    ];
  };
  
  const finalStats = clinicalStats || getDefaultStats();
  
  // Customize layout based on treatment category
  const renderCustomContent = () => {
    return (
      <GenentechContainer>
        {/* Category-specific header */}
        <CategoryHeader categoryId={treatmentCategory.id}>
          <Typography variant="subtitle2">
            {treatmentCategory.medicalCategoryName || 'Medical Category'}: {treatmentCategory.name}
          </Typography>
        </CategoryHeader>
        
        {/* Clinical statistics display */}
        {showStats && finalStats && finalStats.length > 0 && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ mb: 1, fontWeight: 600, color: GENENTECH_COLORS.primary }}
            >
              Clinical Evidence
            </Typography>
            
            <Grid container spacing={2}>
              {finalStats.map((stat, index) => (
                <Grid item xs={6} key={index}>
                  <StatBox>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {stat.title}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: GENENTECH_COLORS.primary,
                        fontWeight: 700,
                        my: 0.5
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="caption">
                      {stat.description}
                    </Typography>
                  </StatBox>
                </Grid>
              ))}
            </Grid>
            
            <EvidenceBadge>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  backgroundColor: GENENTECH_COLORS.primary 
                }} 
              />
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                Data based on clinical trials of {treatmentCategory.name.toLowerCase()} treatments
              </Typography>
            </EvidenceBadge>
          </Box>
        )}
        
        <Divider sx={{ my: 1 }} />
      </GenentechContainer>
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

export default GenentechAdTemplate; 