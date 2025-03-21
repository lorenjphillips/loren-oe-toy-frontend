/**
 * Dashboard Theme System
 * 
 * Provides consistent styling across visualizations with company-specific
 * color schemes, ensures accessibility, and supports light/dark mode.
 */
import { ColorTheme } from '../services/d3Integration';

// Theme mode type
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme variant
export type ThemeVariant = 'default' | 'pharma-blue' | 'pharma-green' | 'high-contrast';

// Color palette interface
export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: string;
  divider: string;
}

// Full dashboard theme interface
export interface DashboardTheme {
  mode: ThemeMode;
  variant: ThemeVariant;
  colors: ColorPalette;
  visualizations: ColorTheme;
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      small: string;
      large: string;
      heading: {
        h1: string;
        h2: string;
        h3: string;
        h4: string;
      };
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    unit: number;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shape: {
    borderRadius: {
      small: string;
      medium: string;
      large: string;
    };
  };
  shadows: {
    none: string;
    low: string;
    medium: string;
    high: string;
  };
  transitions: {
    short: string;
    medium: string;
    long: string;
  };
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// Default light theme palette
const lightPalette: ColorPalette = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  tertiary: '#0891b2',
  quaternary: '#7c3aed',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0ea5e9',
  background: '#ffffff',
  surface: '#f8fafc',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
    inverse: '#ffffff'
  },
  border: '#e2e8f0',
  divider: '#cbd5e1'
};

// Default dark theme palette
const darkPalette: ColorPalette = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  tertiary: '#06b6d4',
  quaternary: '#8b5cf6',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#38bdf8',
  background: '#0f172a',
  surface: '#1e293b',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    disabled: '#64748b',
    inverse: '#0f172a'
  },
  border: '#334155',
  divider: '#475569'
};

// Pharma blue light theme
const pharmaBlueLightPalette: ColorPalette = {
  primary: '#0062b1',
  secondary: '#2c7fb8',
  tertiary: '#00517d',
  quaternary: '#4d96c9',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0ea5e9',
  background: '#ffffff',
  surface: '#f5f9fc',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
    inverse: '#ffffff'
  },
  border: '#e2e8f0',
  divider: '#cbd5e1'
};

// Pharma blue dark theme
const pharmaBlueDarkPalette: ColorPalette = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  tertiary: '#00517d',
  quaternary: '#4d96c9',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#38bdf8',
  background: '#0c1d2c',
  surface: '#1a3247',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    disabled: '#64748b',
    inverse: '#0c1d2c'
  },
  border: '#2a4f6d',
  divider: '#375a76'
};

// Pharma green light theme
const pharmaGreenLightPalette: ColorPalette = {
  primary: '#00875a',
  secondary: '#20a17b',
  tertiary: '#006c48',
  quaternary: '#48b792',
  success: '#16a34a',
  warning: '#ca8a04',
  error: '#dc2626',
  info: '#0ea5e9',
  background: '#ffffff',
  surface: '#f5fcfa',
  text: {
    primary: '#0f172a',
    secondary: '#475569',
    disabled: '#94a3b8',
    inverse: '#ffffff'
  },
  border: '#e2e8f0',
  divider: '#cbd5e1'
};

// Pharma green dark theme
const pharmaGreenDarkPalette: ColorPalette = {
  primary: '#10b981',
  secondary: '#34d399',
  tertiary: '#0d9668',
  quaternary: '#5eead4',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#38bdf8',
  background: '#0c2c1f',
  surface: '#1a3b2c',
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    disabled: '#64748b',
    inverse: '#0c2c1f'
  },
  border: '#2a6d4d',
  divider: '#377658'
};

// High contrast light theme
const highContrastLightPalette: ColorPalette = {
  primary: '#000000',
  secondary: '#2563eb',
  tertiary: '#9333ea',
  quaternary: '#dc2626',
  success: '#166534',
  warning: '#854d0e',
  error: '#991b1b',
  info: '#0369a1',
  background: '#ffffff',
  surface: '#f8fafc',
  text: {
    primary: '#000000',
    secondary: '#18181b',
    disabled: '#52525b',
    inverse: '#ffffff'
  },
  border: '#18181b',
  divider: '#27272a'
};

// High contrast dark theme
const highContrastDarkPalette: ColorPalette = {
  primary: '#ffffff',
  secondary: '#60a5fa',
  tertiary: '#c084fc',
  quaternary: '#f87171',
  success: '#4ade80',
  warning: '#facc15',
  error: '#fb7185',
  info: '#38bdf8',
  background: '#000000',
  surface: '#18181b',
  text: {
    primary: '#ffffff',
    secondary: '#f4f4f5',
    disabled: '#a1a1aa',
    inverse: '#000000'
  },
  border: '#e4e4e7',
  divider: '#d4d4d8'
};

// Default visualization color theme
const defaultVisualizationTheme: ColorTheme = {
  primary: ['#2563eb', '#4f46e5', '#0891b2', '#7c3aed', '#16a34a', '#ca8a04', '#dc2626', '#0ea5e9', '#8b5cf6', '#ec4899'],
  secondary: ['#3b82f6', '#6366f1', '#06b6d4', '#8b5cf6', '#22c55e', '#eab308', '#ef4444', '#38bdf8', '#a855f7', '#f472b6'],
  diverging: ['#dc2626', '#f97316', '#facc15', '#d9f99d', '#a3e635', '#4ade80', '#22d3ee', '#0ea5e9', '#2563eb'],
  sequential: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
  qualitative: ['#eff6ff', '#f0f9ff', '#ecfdf5', '#f0fdf4', '#fffbeb', '#fef2f2', '#faf5ff', '#fdf2f8', '#f8fafc', '#f5f5f4'],
  background: '#ffffff',
  text: '#0f172a'
};

// Pharma blue visualization theme
const pharmaBlueVisualizationTheme: ColorTheme = {
  primary: ['#0062b1', '#2c7fb8', '#4d96c9', '#89c0dd', '#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#cffafe'],
  secondary: ['#00517d', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'],
  diverging: ['#00517d', '#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#f0f9ff'],
  sequential: ['#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'],
  qualitative: ['#eff6ff', '#f0f9ff', '#ecfeff', '#f0fdfa', '#f0fdf4', '#fefce8', '#fff7ed', '#fef2f2', '#fffbf5', '#f8fafc'],
  background: '#ffffff',
  text: '#0f172a'
};

// Pharma green visualization theme
const pharmaGreenVisualizationTheme: ColorTheme = {
  primary: ['#00875a', '#20a17b', '#34d399', '#6ee7b7', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
  secondary: ['#006c48', '#047857', '#059669', '#10b981', '#34d399', '#36b161', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
  diverging: ['#006c48', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
  sequential: ['#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
  qualitative: ['#ecfdf5', '#f0fdfa', '#f0fdf4', '#effff8', '#f7fee7', '#fefce8', '#fff7ed', '#fef2f2', '#fffbf5', '#f8fafc'],
  background: '#ffffff',
  text: '#0f172a'
};

// High contrast visualization theme
const highContrastVisualizationTheme: ColorTheme = {
  primary: ['#000000', '#2563eb', '#9333ea', '#dc2626', '#166534', '#854d0e', '#991b1b', '#0369a1', '#0c4a6e', '#713f12'],
  secondary: ['#ffffff', '#60a5fa', '#c084fc', '#f87171', '#4ade80', '#facc15', '#fb7185', '#38bdf8', '#a855f7', '#f472b6'],
  diverging: ['#000000', '#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5', '#ffffff'],
  sequential: ['#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#404040', '#262626', '#171717', '#000000'],
  qualitative: ['#000000', '#18181b', '#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7', '#f4f4f5'],
  background: '#ffffff',
  text: '#000000'
};

// Create full theme with the given mode and variant
function createTheme(mode: ThemeMode, variant: ThemeVariant): DashboardTheme {
  let colors: ColorPalette;
  let visualizations: ColorTheme;
  
  // Select palette based on mode and variant
  switch (variant) {
    case 'pharma-blue':
      colors = mode === 'dark' ? pharmaBlueDarkPalette : pharmaBlueLightPalette;
      visualizations = pharmaBlueVisualizationTheme;
      break;
    case 'pharma-green':
      colors = mode === 'dark' ? pharmaGreenDarkPalette : pharmaGreenLightPalette;
      visualizations = pharmaGreenVisualizationTheme;
      break;
    case 'high-contrast':
      colors = mode === 'dark' ? highContrastDarkPalette : highContrastLightPalette;
      visualizations = highContrastVisualizationTheme;
      break;
    default:
      colors = mode === 'dark' ? darkPalette : lightPalette;
      visualizations = defaultVisualizationTheme;
  }
  
  // Update visualization colors based on mode
  if (mode === 'dark') {
    visualizations = {
      ...visualizations,
      background: colors.background,
      text: colors.text.primary
    };
  }
  
  // Create full theme
  return {
    mode,
    variant,
    colors,
    visualizations,
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      fontSize: {
        base: '16px',
        small: '14px',
        large: '18px',
        heading: {
          h1: '2rem',
          h2: '1.5rem',
          h3: '1.25rem',
          h4: '1rem'
        }
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700
      }
    },
    spacing: {
      unit: 8,
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    shape: {
      borderRadius: {
        small: '0.25rem',
        medium: '0.5rem',
        large: '1rem'
      }
    },
    shadows: {
      none: 'none',
      low: '0 2px 4px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
      high: '0 8px 16px rgba(0, 0, 0, 0.15)'
    },
    transitions: {
      short: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
      medium: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
      long: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
    },
    breakpoints: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920
    }
  };
}

// Detect system preference for dark mode
function detectSystemPreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light'; // Default to light if detection not available
}

// Default theme instances
export const lightTheme = createTheme('light', 'default');
export const darkTheme = createTheme('dark', 'default');
export const pharmaBlueLightTheme = createTheme('light', 'pharma-blue');
export const pharmaBlueDarkTheme = createTheme('dark', 'pharma-blue');
export const pharmaGreenLightTheme = createTheme('light', 'pharma-green');
export const pharmaGreenDarkTheme = createTheme('dark', 'pharma-green');
export const highContrastLightTheme = createTheme('light', 'high-contrast');
export const highContrastDarkTheme = createTheme('dark', 'high-contrast');

// Get theme based on preferences
export function getTheme(mode: ThemeMode = 'light', variant: ThemeVariant = 'default'): DashboardTheme {
  // Handle system preference
  const actualMode = mode === 'system' ? detectSystemPreference() : mode;
  
  return createTheme(actualMode as 'light' | 'dark', variant);
}

// CSS utility functions for integrating theme into components
export function createCssVariables(theme: DashboardTheme): string {
  return `
    --color-primary: ${theme.colors.primary};
    --color-secondary: ${theme.colors.secondary};
    --color-tertiary: ${theme.colors.tertiary};
    --color-quaternary: ${theme.colors.quaternary};
    --color-success: ${theme.colors.success};
    --color-warning: ${theme.colors.warning};
    --color-error: ${theme.colors.error};
    --color-info: ${theme.colors.info};
    --color-background: ${theme.colors.background};
    --color-surface: ${theme.colors.surface};
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-text-disabled: ${theme.colors.text.disabled};
    --color-text-inverse: ${theme.colors.text.inverse};
    --color-border: ${theme.colors.border};
    --color-divider: ${theme.colors.divider};
    
    --font-family: ${theme.typography.fontFamily};
    --font-size-base: ${theme.typography.fontSize.base};
    --font-size-small: ${theme.typography.fontSize.small};
    --font-size-large: ${theme.typography.fontSize.large};
    --font-size-h1: ${theme.typography.fontSize.heading.h1};
    --font-size-h2: ${theme.typography.fontSize.heading.h2};
    --font-size-h3: ${theme.typography.fontSize.heading.h3};
    --font-size-h4: ${theme.typography.fontSize.heading.h4};
    
    --font-weight-normal: ${theme.typography.fontWeight.normal};
    --font-weight-medium: ${theme.typography.fontWeight.medium};
    --font-weight-bold: ${theme.typography.fontWeight.bold};
    
    --spacing-unit: ${theme.spacing.unit}px;
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    
    --border-radius-small: ${theme.shape.borderRadius.small};
    --border-radius-medium: ${theme.shape.borderRadius.medium};
    --border-radius-large: ${theme.shape.borderRadius.large};
    
    --shadow-none: ${theme.shadows.none};
    --shadow-low: ${theme.shadows.low};
    --shadow-medium: ${theme.shadows.medium};
    --shadow-high: ${theme.shadows.high};
    
    --transition-short: ${theme.transitions.short};
    --transition-medium: ${theme.transitions.medium};
    --transition-long: ${theme.transitions.long};
  `;
}

// Helper for checking color contrast
export function hasGoodContrast(foreground: string, background: string): boolean {
  // Convert hex to RGB
  const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ]
      : [0, 0, 0];
  };
  
  // Calculate relative luminance
  const luminance = (rgb: number[]): number => {
    const a = rgb.map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };
  
  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  
  // Compute contrast ratio
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  // WCAG 2.0 guidelines: 4.5:1 for normal text, 3:1 for large text
  return ratio >= 4.5;
}

// Get an accessible color based on background
export function getAccessibleColor(bgColor: string, preferredColor: string): string {
  // If preferred color has good contrast, use it
  if (hasGoodContrast(preferredColor, bgColor)) {
    return preferredColor;
  }
  
  // Otherwise default to black or white based on background
  const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(bgColor);
  if (!rgb) return '#000000';
  
  const brightness = (
    parseInt(rgb[1], 16) * 0.299 +
    parseInt(rgb[2], 16) * 0.587 +
    parseInt(rgb[3], 16) * 0.114
  );
  
  return brightness > 150 ? '#000000' : '#ffffff';
}

// Get visualization color palette based on theme
export function getVisualizationPalette(theme: DashboardTheme, type: 'primary' | 'secondary' | 'diverging' | 'sequential' | 'qualitative' = 'primary'): string[] {
  return theme.visualizations[type];
} 