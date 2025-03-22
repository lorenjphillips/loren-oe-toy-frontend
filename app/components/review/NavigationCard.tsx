'use client';

import React from 'react';
import { Paper, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import { styled } from '@mui/system';
import AppsIcon from '@mui/icons-material/Apps';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ScienceIcon from '@mui/icons-material/Science';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: '1.5rem',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  marginBottom: '1rem',
  '& svg': {
    fontSize: '2.5rem',
    color: '#3e92cc',
  },
}));

interface NavigationCardProps {
  title: string;
  description: string;
  linkHref: string;
  iconType: 'app' | 'business' | 'analytics' | 'health' | 'science';
}

export default function NavigationCard({ 
  title, 
  description, 
  linkHref, 
  iconType 
}: NavigationCardProps) {
  
  const renderIcon = () => {
    switch (iconType) {
      case 'app':
        return <AppsIcon />;
      case 'business':
        return <BusinessIcon />;
      case 'analytics':
        return <AnalyticsIcon />;
      case 'health':
        return <HealthAndSafetyIcon />;
      case 'science':
        return <ScienceIcon />;
      default:
        return <AppsIcon />;
    }
  };
  
  return (
    <StyledCard>
      <IconWrapper>
        {renderIcon()}
      </IconWrapper>
      <Typography variant="h5" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ flexGrow: 1, mb: 2 }}>
        {description}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        component={Link} 
        href={linkHref}
        fullWidth
      >
        Explore
      </Button>
    </StyledCard>
  );
} 