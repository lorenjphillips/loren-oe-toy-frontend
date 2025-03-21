/**
 * Clinical Support Styling
 * 
 * Defines styling for the Clinical Decision Support components
 * with a professional medical aesthetic
 */

import { Theme } from '@mui/material/styles';

export const clinicalSupportColors = {
  // Primary brand colors
  primary: '#2c5282', // Deep blue for medical context
  secondary: '#3182ce', // Lighter blue for accents
  
  // Clinical evidence colors
  evidenceHigh: '#38a169', // Green for high evidence
  evidenceMedium: '#d69e2e', // Yellow for medium evidence 
  evidenceLow: '#e53e3e', // Red for low evidence
  
  // Semantic colors
  success: '#38a169', // Green for positive/success
  warning: '#dd6b20', // Orange for warnings
  error: '#e53e3e', // Red for errors
  info: '#3182ce', // Blue for information
  
  // Background and container colors
  pageBg: '#f7fafc',
  containerBg: '#ffffff',
  contentBg: '#f8fafc',
  highlightBg: '#ebf8ff',
  
  // Text colors
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textLight: '#a0aec0'
};

export const clinicalSupportTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  }
};

export const clinicalSupportSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '2.5rem'
};

export const clinicalSupportShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
};

export const clinicalSupportBorders = {
  radius: {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px'
  }
};

/**
 * Styles for the decision support container
 */
export const containerStyles = (theme: Theme) => ({
  container: {
    backgroundColor: clinicalSupportColors.containerBg,
    borderRadius: clinicalSupportBorders.radius.lg,
    boxShadow: clinicalSupportShadows.md,
    padding: theme.spacing(3),
    margin: theme.spacing(2, 0),
    border: `${clinicalSupportBorders.width.thin} solid #e2e8f0`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      boxShadow: clinicalSupportShadows.lg
    }
  },
  header: {
    borderBottom: `${clinicalSupportBorders.width.thin} solid #e2e8f0`,
    paddingBottom: theme.spacing(1.5),
    marginBottom: theme.spacing(2)
  },
  clinicalLabel: {
    backgroundColor: clinicalSupportColors.primary,
    color: '#ffffff',
    padding: theme.spacing(0.5, 1),
    borderRadius: clinicalSupportBorders.radius.md,
    fontSize: clinicalSupportTypography.sizes.xs,
    fontWeight: clinicalSupportTypography.fontWeights.bold,
    letterSpacing: '0.05em',
    display: 'inline-block',
    marginRight: theme.spacing(1)
  },
  contentSection: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  disclaimer: {
    backgroundColor: clinicalSupportColors.highlightBg,
    border: `${clinicalSupportBorders.width.thin} solid #bee3f8`,
    borderRadius: clinicalSupportBorders.radius.md,
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(3),
    fontSize: clinicalSupportTypography.sizes.sm,
    color: clinicalSupportColors.textSecondary
  }
});

/**
 * Styles for evidence items
 */
export const evidenceStyles = (theme: Theme) => ({
  evidenceCard: {
    marginBottom: theme.spacing(2),
    borderRadius: clinicalSupportBorders.radius.md,
    overflow: 'hidden',
    border: `${clinicalSupportBorders.width.thin} solid #e2e8f0`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: clinicalSupportShadows.md
    }
  },
  evidenceHeader: {
    padding: theme.spacing(1.5, 2),
    backgroundColor: clinicalSupportColors.contentBg,
    borderBottom: `${clinicalSupportBorders.width.thin} solid #e2e8f0`
  },
  evidenceContent: {
    padding: theme.spacing(2)
  },
  evidenceFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    backgroundColor: clinicalSupportColors.contentBg,
    borderTop: `${clinicalSupportBorders.width.thin} solid #e2e8f0`
  },
  evidenceLevelChip: {
    fontWeight: clinicalSupportTypography.fontWeights.medium,
    fontSize: clinicalSupportTypography.sizes.xs,
    borderRadius: clinicalSupportBorders.radius.full
  }
});

/**
 * Styles for the recommendation panel
 */
export const recommendationStyles = (theme: Theme) => ({
  recommendationPanel: {
    backgroundColor: '#f0f9ff',
    borderRadius: clinicalSupportBorders.radius.md,
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `${clinicalSupportBorders.width.thin} solid #bae6fd`
  },
  recommendationItem: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderRadius: clinicalSupportBorders.radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)'
    }
  },
  recommendationIcon: {
    color: clinicalSupportColors.success,
    marginRight: theme.spacing(1)
  }
});

/**
 * Styles for the opt-in toggle
 */
export const optInStyles = (theme: Theme) => ({
  toggle: {
    margin: 0
  },
  toggleTrack: {
    borderRadius: clinicalSupportBorders.radius.full,
    backgroundColor: '#cbd5e0',
    opacity: 0.7
  },
  toggleTrackChecked: {
    backgroundColor: clinicalSupportColors.success,
    opacity: 1
  },
  toggleLabel: {
    fontFamily: clinicalSupportTypography.fontFamily,
    fontSize: clinicalSupportTypography.sizes.sm,
    fontWeight: clinicalSupportTypography.fontWeights.medium,
    color: clinicalSupportColors.textSecondary
  }
}); 