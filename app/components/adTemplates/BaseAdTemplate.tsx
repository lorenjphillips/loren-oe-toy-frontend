import React, { ReactNode } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Chip, 
  useTheme, 
  SxProps
} from '@mui/material';
import { styled } from '@mui/system';
import { AdContent, AdDisplaySettings } from '../../models/adTypes';
import { fadeIn, fadeInUp } from '../../styles/transitions';
import Image from 'next/image';

// Extended interfaces for our component
interface ExtendedCompany {
  id: string;
  name: string;
  primaryColor?: string;
  secondaryColor?: string;
  defaultDisplaySettings?: Record<string, any>;
  logoUrl?: string;
  legalDisclaimer?: string;
}

interface ExtendedCreative {
  headline?: string;
  subheadline?: string;
  bodyText?: string;
  callToAction?: string;
  displaySettings?: Record<string, any>;
}

interface ExtendedAdContent extends Omit<AdContent, 'company' | 'creative'> {
  company: ExtendedCompany;
  creative?: ExtendedCreative;
}

// Styled components for the base template
const AdContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'customSettings'
})<{ customSettings?: AdDisplaySettings }>(({ theme, customSettings }) => ({
  padding: customSettings?.padding || theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: customSettings?.cornerRadius !== undefined 
    ? `${customSettings.cornerRadius}px` 
    : theme.shape.borderRadius,
  border: customSettings?.border ? `1px solid ${customSettings.borderColor || '#e0e0e0'}` : 'none',
  backgroundColor: customSettings?.backgroundColor || '#ffffff',
  color: customSettings?.textColor || theme.palette.text.primary,
  fontFamily: customSettings?.fontFamily || 'inherit',
  maxWidth: customSettings?.maxWidth || '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: Array.isArray(theme.shadows) && theme.shadows.length > 3 
      ? theme.shadows[3] 
      : '0 4px 8px rgba(0,0,0,0.1)'
  }
}));

const SponsoredBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 5,
  right: 5,
  padding: '2px 8px',
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  borderRadius: 12,
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  zIndex: 1,
  animation: `${fadeIn} 0.8s ease-in forwards`,
}));

// Use regular Box component with sx prop instead of styled component to avoid type issues
const ContentContainer = styled(Box)(({ theme }) => ({
  animation: `${fadeInUp} 0.7s ease-in-out forwards`,
}));

const AdCategory = styled(Chip)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  fontSize: '0.75rem',
}));

// Base ad template props interface
export interface BaseAdTemplateProps {
  adContent: AdContent;
  onCTAClick?: (adId: string) => void;
  onImpression?: (adId: string) => void;
  className?: string;
  sx?: SxProps;
  children?: ReactNode;
}

/**
 * BaseAdTemplate component
 * 
 * This is the foundation for all pharma ad templates.
 * Provides common layout structure and functionality that can be
 * extended by company-specific templates.
 */
const BaseAdTemplate: React.FC<BaseAdTemplateProps> = ({
  adContent,
  onCTAClick,
  onImpression,
  className,
  sx,
  children,
}) => {
  const theme = useTheme();
  // Cast to our extended type to handle additional properties
  const extendedAdContent = adContent as unknown as ExtendedAdContent;
  const { company, creative, treatmentCategory } = extendedAdContent;
  
  // Merge display settings with precedence: creative > company > default
  const displaySettings = {
    ...company?.defaultDisplaySettings || {},
    ...creative?.displaySettings || {},
  };
  
  // Handle call-to-action click
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick(adContent.id);
    }
  };
  
  // Report impression once component mounts
  React.useEffect(() => {
    if (onImpression) {
      const timer = setTimeout(() => {
        onImpression(adContent.id);
      }, 1000); // Wait 1 second before counting impression
      
      return () => clearTimeout(timer);
    }
  }, [adContent.id, onImpression]);
  
  // Layout based on logo position
  const logoPosition = displaySettings.logoPosition || 'top';
  const isHorizontalLogo = logoPosition === 'left' || logoPosition === 'right';
  
  // Define logo container style based on position
  const getLogoContainerStyle = (position: string) => {
    const baseStyle = {
      animation: `${fadeIn} 0.5s ease-in forwards`,
    };
    
    switch(position) {
      case 'top':
        return {
          ...baseStyle,
          width: '100%',
          textAlign: 'left',
          marginBottom: theme.spacing(1.5)
        };
      case 'bottom':
        return {
          ...baseStyle,
          width: '100%',
          textAlign: 'left',
          marginTop: theme.spacing(1.5)
        };
      case 'left':
        return {
          ...baseStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginRight: theme.spacing(2),
          maxWidth: '80px'
        };
      case 'right':
        return {
          ...baseStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginLeft: theme.spacing(2),
          maxWidth: '80px'
        };
      default:
        return baseStyle;
    }
  };
  
  return (
    <AdContainer 
      customSettings={displaySettings}
      className={className}
      sx={sx}
      elevation={2}
    >
      <SponsoredBadge>Sponsored</SponsoredBadge>
      
      {/* Render custom content from children if provided */}
      {children}
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isHorizontalLogo ? 'row' : 'column'
      }}>
        {/* Logo placement (conditional based on position) */}
        {(logoPosition === 'top' || logoPosition === 'left') && (
          <Box sx={getLogoContainerStyle(logoPosition)}>
            <Image 
              src={company.logoUrl || `https://via.placeholder.com/120x40?text=${encodeURIComponent(company.name || 'Company')}`}
              alt={`${company.name || 'Company'} logo`}
              width={isHorizontalLogo ? 80 : 120}
              height={40}
              style={{ 
                maxWidth: isHorizontalLogo ? '80px' : '120px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
        
        {/* Main content */}
        <ContentContainer sx={{ flex: 1 }}>
          {treatmentCategory?.name && (
            <AdCategory label={treatmentCategory.name} size="small" />
          )}
          
          <Typography variant="h6" component="h3" gutterBottom>
            {creative?.headline || 'Advertisement'}
          </Typography>
          
          {creative?.subheadline && (
            <Typography 
              variant="subtitle1" 
              gutterBottom 
              sx={{ 
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              {creative.subheadline}
            </Typography>
          )}
          
          <Typography 
            variant="body2" 
            color="textSecondary" 
            sx={{ marginBottom: 2 }}
          >
            {creative?.bodyText || ''}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCTAClick}
            sx={{
              backgroundColor: company.primaryColor || theme.palette.primary.main,
              '&:hover': {
                backgroundColor: company.secondaryColor || theme.palette.primary.dark,
              }
            }}
          >
            {creative?.callToAction || 'Learn More'}
          </Button>
        </ContentContainer>
        
        {/* Logo placement (conditional based on position) */}
        {(logoPosition === 'bottom' || logoPosition === 'right') && (
          <Box sx={getLogoContainerStyle(logoPosition)}>
            <Image 
              src={company.logoUrl || `https://via.placeholder.com/120x40?text=${encodeURIComponent(company.name || 'Company')}`}
              alt={`${company.name || 'Company'} logo`}
              width={isHorizontalLogo ? 80 : 120}
              height={40}
              style={{ 
                maxWidth: isHorizontalLogo ? '80px' : '120px',
                height: 'auto',
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
      </Box>
      
      {/* Legal disclaimer */}
      {company.legalDisclaimer && (
        <Typography 
          variant="caption" 
          display="block" 
          sx={{ 
            marginTop: 2, 
            fontSize: '0.7rem', 
            color: 'text.secondary',
            lineHeight: 1.2
          }}
        >
          {company.legalDisclaimer}
        </Typography>
      )}
    </AdContainer>
  );
};

export default BaseAdTemplate; 