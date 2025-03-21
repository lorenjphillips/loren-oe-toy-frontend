import React from 'react';
import { 
  Box,
  Typography,
  useTheme,
  Chip
} from '@mui/material';
import { styled } from '@mui/system';
import BaseAdTemplate, { BaseAdTemplateProps } from './BaseAdTemplate';
import { AdContent } from '../../models/adTypes';

// Pfizer brand colors
const PFIZER_COLORS = {
  primary: '#0093d0', // Pfizer blue
  secondary: '#00629b', // Darker blue for hover states
  accent: '#eef7fc', // Light blue for backgrounds
  oncology: '#c41230', // Red for oncology
  immunology: '#7ab800', // Green for immunology
  vaccines: '#00a3e0', // Light blue for vaccines
  textLight: '#ffffff',
  textDark: '#333333',
};

// Styled components specific to Pfizer's brand guidelines
const PfizerContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: PFIZER_COLORS.primary,
  }
}));

const TreatmentCategoryChip = styled(Chip)<{ categoryId: string }>(({ theme, categoryId }) => {
  // Select color based on treatment area
  let chipColor = PFIZER_COLORS.primary;
  if (categoryId.includes('oncology')) {
    chipColor = PFIZER_COLORS.oncology;
  } else if (categoryId.includes('immunology')) {
    chipColor = PFIZER_COLORS.immunology;
  } else if (categoryId.includes('vaccines')) {
    chipColor = PFIZER_COLORS.vaccines;
  }
  
  return {
    backgroundColor: chipColor,
    color: PFIZER_COLORS.textLight,
    fontWeight: 500,
    fontSize: '0.75rem',
  };
});

// Evidence box for clinical data
const EvidenceBox = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  backgroundColor: PFIZER_COLORS.accent,
  borderLeft: `4px solid ${PFIZER_COLORS.primary}`,
  borderRadius: '0 4px 4px 0',
}));

export interface PfizerAdTemplateProps extends Omit<BaseAdTemplateProps, 'adContent'> {
  adContent: AdContent;
  showEvidenceBox?: boolean;
  evidenceText?: string;
}

/**
 * PfizerAdTemplate component
 * 
 * Customized ad template for Pfizer with their brand styling
 * and specialized layouts for different treatment categories.
 */
const PfizerAdTemplate: React.FC<PfizerAdTemplateProps> = ({
  adContent,
  showEvidenceBox = true,
  evidenceText,
  ...baseProps
}) => {
  const theme = useTheme();
  const { treatmentCategory } = adContent;
  
  // Apply Pfizer-specific display customizations
  const customizedAdContent: AdContent = {
    ...adContent,
    company: {
      ...adContent.company,
      primaryColor: PFIZER_COLORS.primary,
      secondaryColor: PFIZER_COLORS.secondary,
      defaultDisplaySettings: {
        ...adContent.company.defaultDisplaySettings,
        backgroundColor: '#ffffff',
        textColor: PFIZER_COLORS.textDark,
        cornerRadius: 4,
        border: true,
        borderColor: '#e8e8e8',
        logoPosition: 'top',
      }
    }
  };
  
  // Generate evidence text if not provided
  const defaultEvidenceText = `In clinical studies, ${treatmentCategory.name} treatments showed significant improvement in patient outcomes compared to standard of care.`;
  const finalEvidenceText = evidenceText || defaultEvidenceText;
  
  // Customize layout based on treatment category
  const renderCustomContent = () => {
    return (
      <PfizerContainer>
        {/* Replace the default category chip with our custom one */}
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <TreatmentCategoryChip 
            label={treatmentCategory.name} 
            size="small" 
            categoryId={treatmentCategory.id}
          />
          {treatmentCategory.id.includes('oncology') && (
            <Typography 
              variant="caption" 
              sx={{ ml: 1, fontStyle: 'italic' }}
            >
              Specialized cancer care
            </Typography>
          )}
        </Box>
        
        {/* Evidence-based presentation for clinical credibility */}
        {showEvidenceBox && (
          <EvidenceBox>
            <Typography 
              variant="body2" 
              sx={{ fontWeight: 500, color: PFIZER_COLORS.textDark }}
            >
              <span style={{ fontWeight: 700 }}>Clinical Evidence:</span> {finalEvidenceText}
            </Typography>
          </EvidenceBox>
        )}
      </PfizerContainer>
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

export default PfizerAdTemplate; 