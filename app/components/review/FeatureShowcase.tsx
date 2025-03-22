'use client';

import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';
import { styled } from '@mui/system';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  margin: '0 auto 1.5rem',
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #3e92cc 0%, #0a2463 100%)',
  color: '#fff',
  '& svg': {
    fontSize: '2rem',
  },
}));

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard = ({ title, description, icon }: FeatureCardProps) => (
  <StyledPaper elevation={2}>
    <FeatureIcon>{icon}</FeatureIcon>
    <Typography variant="h6" component="h3" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2">
      {description}
    </Typography>
  </StyledPaper>
);

export default function FeatureShowcase() {
  const features = [
    {
      title: "Advanced AI Classification",
      description: "Our platform precisely categorizes medical questions to understand their intent, condition context, and treatment relevance.",
      icon: <PsychologyIcon />,
    },
    {
      title: "Ethical Guardrails",
      description: "Built-in ethical oversight ensures all content meets regulatory requirements and maintains the highest medical standards.",
      icon: <HealthAndSafetyIcon />,
    },
    {
      title: "Contextual Relevance",
      description: "Ads are served only when they provide genuine value to the healthcare provider's information needs.",
      icon: <SettingsSuggestIcon />,
    },
    {
      title: "Analytics Dashboard",
      description: "Comprehensive data visualization tools for understanding ad performance and user engagement patterns.",
      icon: <AnalyticsIcon />,
    },
    {
      title: "Regulatory Compliance",
      description: "All content is reviewed and tracked to ensure compliance with healthcare advertising regulations.",
      icon: <AccountBalanceIcon />,
    },
    {
      title: "Confidence Scoring",
      description: "Proprietary algorithms determine the relevance and appropriateness of advertising content for each context.",
      icon: <AutoGraphIcon />,
    },
  ];

  return (
    <>
      <Typography variant="h4" component="h2" gutterBottom>
        Key Features
      </Typography>
      <Grid container spacing={3}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <FeatureCard 
              title={feature.title} 
              description={feature.description} 
              icon={feature.icon} 
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
} 