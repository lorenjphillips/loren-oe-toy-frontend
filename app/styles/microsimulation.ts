import { Theme, createTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Color scheme for clinical microsimulations
// Using softer blues and greens that are standard in medical settings
// Avoiding harsh reds except for alerts/errors
export const clinicalColors = {
  // Primary colors
  primary: {
    main: '#2C6E9B', // Medical blue - softer than standard blue
    light: '#4D8CBF',
    dark: '#1A5277',
    contrastText: '#FFFFFF',
  },
  // Secondary colors
  secondary: {
    main: '#41A3A3', // Teal green - commonly used in medical interfaces
    light: '#68BCB8',
    dark: '#2A7A7A',
    contrastText: '#FFFFFF',
  },
  // Medical status colors
  status: {
    stable: '#4CAF50', // Green for stable condition
    caution: '#FF9800', // Orange for caution
    critical: '#F44336', // Red for critical/emergency
    improving: '#8BC34A', // Light green for improving condition
    deteriorating: '#FF5722', // Deep orange for deteriorating
    neutral: '#9E9E9E', // Grey for neutral information
  },
  // Background colors
  background: {
    default: '#F5F7F9', // Light grey-blue background
    paper: '#FFFFFF',
    card: '#FFFFFF',
    highlight: '#F0F7FF',
  },
  // Text colors
  text: {
    primary: '#333F48', // Dark blue-grey - easier on eyes than pure black
    secondary: '#5A6772',
    disabled: '#9AA5B1',
    hint: '#78909C',
  },
  // Border colors
  border: {
    light: '#E0E4E8',
    main: '#CFD8DC',
    dark: '#B0BEC5',
  },
};

// Typography settings for clinical information
export const clinicalTypography = {
  fontFamily: '"Inter", "Roboto", "Helvetica Neue", sans-serif',
  h1: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    color: clinicalColors.text.primary,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
    color: clinicalColors.text.primary,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 500,
    lineHeight: 1.3,
    color: clinicalColors.text.primary,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: clinicalColors.text.primary,
  },
  h5: {
    fontSize: '1.1rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: clinicalColors.text.primary,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: clinicalColors.text.primary,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
    color: clinicalColors.text.primary,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    color: clinicalColors.text.secondary,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: clinicalColors.text.secondary,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    color: clinicalColors.text.secondary,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    color: clinicalColors.text.secondary,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none' as const, // More professional to not have all caps
  },
};

// Create a theme for clinical microsimulations
export const clinicalTheme = createTheme({
  palette: {
    primary: clinicalColors.primary,
    secondary: clinicalColors.secondary,
    background: {
      default: clinicalColors.background.default,
      paper: clinicalColors.background.paper,
    },
    text: {
      primary: clinicalColors.text.primary,
      secondary: clinicalColors.text.secondary,
    },
    error: {
      main: '#D32F2F',
      light: '#EF5350',
      dark: '#C62828',
    },
    warning: {
      main: '#F57C00',
      light: '#FFB74D',
      dark: '#E65100',
    },
    success: {
      main: clinicalColors.status.stable,
      light: '#81C784',
      dark: '#388E3C',
    },
    info: {
      main: '#0288D1',
      light: '#4FC3F7',
      dark: '#01579B',
    },
  },
  typography: clinicalTypography,
  shape: {
    borderRadius: 8, // Slightly rounded corners for professional appearance
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: clinicalColors.primary.dark,
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: clinicalColors.secondary.dark,
          },
        },
        outlinedPrimary: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        outlinedSecondary: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${clinicalColors.border.light}`,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
        },
        title: {
          fontSize: '1.125rem',
          fontWeight: 500,
        },
        subheader: {
          fontSize: '0.875rem',
          color: clinicalColors.text.secondary,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: clinicalColors.border.main,
            },
            '&:hover fieldset': {
              borderColor: clinicalColors.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          height: '28px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9375rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: alpha(clinicalColors.status.stable, 0.12),
          color: clinicalColors.status.stable,
        },
        standardWarning: {
          backgroundColor: alpha(clinicalColors.status.caution, 0.12),
          color: clinicalColors.status.caution,
        },
        standardError: {
          backgroundColor: alpha(clinicalColors.status.critical, 0.12),
          color: clinicalColors.status.critical,
        },
      },
    },
  },
});

// Animation durations for transitions
export const animationDurations = {
  short: 150,
  medium: 300,
  long: 500,
};

// Spacing constants for consistent UI
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Media query breakpoints
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

// Export helper functions
export const getStatusColor = (status: string, theme: Theme = clinicalTheme): string => {
  switch (status.toLowerCase()) {
    case 'stable':
      return clinicalColors.status.stable;
    case 'caution':
    case 'unstable':
      return clinicalColors.status.caution;
    case 'critical':
      return clinicalColors.status.critical;
    case 'improving':
      return clinicalColors.status.improving;
    case 'deteriorating':
      return clinicalColors.status.deteriorating;
    default:
      return clinicalColors.status.neutral;
  }
};

// Box shadows for different elevation levels
export const shadows = {
  low: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  medium: '0px 4px 8px rgba(0, 0, 0, 0.1)',
  high: '0px 8px 16px rgba(0, 0, 0, 0.1)',
}; 