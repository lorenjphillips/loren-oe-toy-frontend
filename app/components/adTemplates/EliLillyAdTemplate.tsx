import React from 'react';
import { 
  Box,
  Typography,
  useTheme,
  Grid,
  Divider,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/system';
import BaseAdTemplate, { BaseAdTemplateProps } from './BaseAdTemplate';
import { AdContent } from '../../models/adTypes';

// Eli Lilly brand colors
const LILLY_COLORS = {
  primary: '#e11d39', // Lilly red
  secondary: '#002677', // Lilly blue
  accent: '#77bc1f', // Lilly green
  endocrinology: '#0077c8', // Blue for diabetes/endocrinology
  neurology: '#8651a3', // Purple for neurology
  immunology: '#00a651', // Green for immunology
  textLight: '#ffffff',
  textDark: '#333333',
  lightGrey: '#f7f7f7',
};

// Styled components specific to Lilly's brand guidelines
const LillyContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderBottom: `2px solid ${LILLY_COLORS.primary}`,
  padding: theme.spacing(0, 0, 1, 0),
  margin: theme.spacing(0, 0, 2),
}));

const LillyHeader = styled(Box)<{ categoryId: string }>(({ theme, categoryId }) => {
  // Select color based on treatment area
  let headerColor = LILLY_COLORS.primary;
  if (categoryId.includes('endocrinology')) {
    headerColor = LILLY_COLORS.endocrinology;
  } else if (categoryId.includes('neurology')) {
    headerColor = LILLY_COLORS.neurology;
  } else if (categoryId.includes('immunology')) {
    headerColor = LILLY_COLORS.immunology;
  }
  
  return {
    backgroundColor: headerColor,
    color: LILLY_COLORS.textLight,
    padding: theme.spacing(1, 2),
    borderRadius: '4px 4px 0 0',
    fontWeight: 500,
  };
});

// Clinical outcome metric box
const MetricBox = styled(Box)<{ highlighted?: boolean }>(({ theme, highlighted }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(1),
  backgroundColor: highlighted ? LILLY_COLORS.lightGrey : 'transparent',
  borderRadius: '4px',
  border: highlighted ? `1px solid #e0e0e0` : 'none',
  height: '100%',
  textAlign: 'center',
}));

// Citation badge with tooltip
const CitationBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 16,
  height: 16,
  borderRadius: '50%',
  backgroundColor: LILLY_COLORS.secondary,
  color: LILLY_COLORS.textLight,
  fontSize: '10px',
  fontWeight: 'bold',
  cursor: 'help',
  marginLeft: theme.spacing(0.5),
}));

// Data metric with citation
const DataMetric = ({ 
  value, 
  label, 
  citation,
  highlighted = false 
}: { 
  value: string; 
  label: string; 
  citation: string;
  highlighted?: boolean;
}) => {
  return (
    <MetricBox highlighted={highlighted}>
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          color: LILLY_COLORS.primary, 
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center' 
        }}
      >
        {value}
        <Tooltip title={citation} arrow placement="top">
          <CitationBadge>i</CitationBadge>
        </Tooltip>
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </MetricBox>
  );
};

interface ExtendedTreatmentCategory {
  id: string;
  name: string;
  medicalCategoryName?: string;
}

interface ExtendedAdContent extends Omit<AdContent, 'treatmentCategory'> {
  treatmentCategory: ExtendedTreatmentCategory;
  company: {
    id: string;
    name: string;
    primaryColor?: string;
    secondaryColor?: string;
    defaultDisplaySettings?: Record<string, any>;
    logoUrl?: string;
    legalDisclaimer?: string;
  };
  creative?: {
    headline?: string;
    subheadline?: string;
    bodyText?: string;
    callToAction?: string;
    displaySettings?: Record<string, any>;
  };
}

export interface EliLillyAdTemplateProps extends Omit<BaseAdTemplateProps, 'adContent'> {
  adContent: AdContent;
  showDataMetrics?: boolean;
  customMetrics?: Array<{
    value: string;
    label: string;
    citation: string;
    highlighted?: boolean;
  }>;
}

/**
 * EliLillyAdTemplate component
 * 
 * Customized ad template for Eli Lilly with their brand styling
 * and specialized layouts for different treatment categories.
 * Features interactive data metrics with tooltips for citations.
 */
const EliLillyAdTemplate: React.FC<EliLillyAdTemplateProps> = ({
  adContent,
  showDataMetrics = true,
  customMetrics,
  ...baseProps
}) => {
  const theme = useTheme();
  // Cast to extended type
  const extendedAdContent = adContent as unknown as ExtendedAdContent;
  const { company, creative, treatmentCategory } = extendedAdContent;
  
  // Apply Eli Lilly specific display customizations
  const customizedAdContent = {
    ...adContent,
    company: {
      ...company,
      primaryColor: LILLY_COLORS.primary,
      secondaryColor: LILLY_COLORS.secondary,
      defaultDisplaySettings: {
        ...company.defaultDisplaySettings,
        backgroundColor: '#ffffff',
        textColor: LILLY_COLORS.textDark,
        cornerRadius: 8,
        border: true,
        borderColor: '#ecf0f1',
      }
    }
  };
  
  // Default metrics based on treatment area if not provided
  const getDefaultMetrics = () => {
    if (treatmentCategory.id.includes('endocrinology')) {
      return [
        {
          value: '-1.8%', 
          label: 'A1C Reduction', 
          citation: 'Mean reduction in A1C at week 26 compared to baseline in the AWARD-7 clinical trial',
          highlighted: true
        },
        {
          value: '-5.1kg', 
          label: 'Weight Loss', 
          citation: 'Mean weight reduction at week 26 compared to baseline in adults with type 2 diabetes',
          highlighted: false
        },
      ];
    } else if (treatmentCategory.id.includes('neurology')) {
      return [
        {
          value: '47%', 
          label: 'Reduction in Monthly Migraine Days', 
          citation: 'Mean reduction compared to placebo in patients with episodic migraine in the EVOLVE-1 study',
          highlighted: true
        },
        {
          value: '58%', 
          label: 'Response Rate', 
          citation: 'Percentage of patients with ≥50% reduction in monthly migraine headache days over months 1-6',
          highlighted: false
        },
      ];
    } else if (treatmentCategory.id.includes('immunology')) {
      return [
        {
          value: '80%', 
          label: 'PASI 75 Response', 
          citation: 'Proportion of patients achieving PASI 75 at week 12 in moderate-to-severe plaque psoriasis',
          highlighted: true
        },
        {
          value: '49%', 
          label: 'ACR20 Response', 
          citation: 'Proportion of patients achieving ACR20 at week 24 in adults with active PsA',
          highlighted: false
        },
      ];
    }
    
    return [
      {
        value: '87%', 
        label: 'Primary Endpoint', 
        citation: 'Percentage of patients meeting the primary endpoint in the pivotal clinical trial',
        highlighted: true
      },
      {
        value: '2.3x', 
        label: 'Improvement vs Standard', 
        citation: 'Relative improvement compared to standard of care in the phase 3 clinical program',
        highlighted: false
      },
    ];
  };
  
  const finalMetrics = customMetrics || getDefaultMetrics();
  
  // Customize layout based on treatment category
  const renderCustomContent = () => {
    return (
      <LillyContainer>
        {/* Category-specific header */}
        <LillyHeader categoryId={treatmentCategory.id}>
          <Typography variant="subtitle2">
            {treatmentCategory.name} Treatment Options
          </Typography>
        </LillyHeader>
        
        {/* Clinical data metrics */}
        {showDataMetrics && finalMetrics.length > 0 && (
          <Box sx={{ mt: 2, mb: 1.5 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600, 
                color: LILLY_COLORS.secondary,
                borderBottom: `1px solid ${LILLY_COLORS.lightGrey}`,
                paddingBottom: 0.5
              }}
            >
              Clinical Outcomes
            </Typography>
            
            <Grid container spacing={1.5}>
              {finalMetrics.map((metric, index) => (
                <Grid item xs={6} key={index}>
                  <DataMetric 
                    value={metric.value}
                    label={metric.label}
                    citation={metric.citation}
                    highlighted={metric.highlighted}
                  />
                </Grid>
              ))}
            </Grid>
            
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                mt: 1,
                fontStyle: 'italic',
                color: 'text.secondary'
              }}
            >
              Hover over values for source information
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ mt: 1, mb: 0 }} />
      </LillyContainer>
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

export default EliLillyAdTemplate; 