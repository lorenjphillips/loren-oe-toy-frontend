'use client';

import React from 'react';
import { Container, Typography, Box, Grid, Paper, Button } from '@mui/material';
import { styled } from '@mui/system';
import Link from 'next/link';
import FeatureShowcase from '../components/review/FeatureShowcase';
import DemoOptions from '../components/review/DemoOptions';
import TechStack from '../components/review/TechStack';
import NavigationCard from '../components/review/NavigationCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  marginBottom: '2rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderRadius: '8px',
}));

const HeroBanner = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(120deg, #0a2463 0%, #3e92cc 100%)',
  color: '#fff',
  padding: '4rem 2rem',
  borderRadius: '8px',
  marginBottom: '2rem',
  textAlign: 'center',
}));

export default function ReviewPage() {
  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <HeroBanner>
        <Typography variant="h2" component="h1" gutterBottom>
          OpenEvidence Review Portal
        </Typography>
        <Typography variant="h5" gutterBottom>
          Transparent, Ethical Medical Advertising Platform
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: '800px', margin: '0 auto', marginTop: '1rem' }}>
          This portal provides a comprehensive overview of our platform, designed for pharmaceutical ad review teams, healthcare compliance officers, and platform evaluators.
        </Typography>
      </HeroBanner>

      <StyledPaper>
        <Typography variant="h4" component="h2" gutterBottom>
          Project Overview
        </Typography>
        <Typography variant="body1" paragraph>
          OpenEvidence is a next-generation platform that intelligently matches medical questions with relevant, compliant pharmaceutical advertising. Our technology ensures that healthcare providers receive contextually appropriate information while maintaining the highest ethical standards and regulatory compliance.
        </Typography>
        <Typography variant="body1" paragraph>
          The platform uses advanced AI to analyze medical queries, understand their intent and clinical context, and serves relevant pharmaceutical information that adds value to the healthcare decision-making process.
        </Typography>
      </StyledPaper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h2" gutterBottom>
            Platform Experience
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <NavigationCard 
            title="Main Application" 
            description="Experience the core platform as an end user would, with the medical query interface and ad display system."
            linkHref="/"
            iconType="app"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <NavigationCard 
            title="Pharmaceutical Company View" 
            description="Review the platform from a pharmaceutical advertiser's perspective. See metrics, targeting options, and compliance tools."
            linkHref="/review/pharma"
            iconType="business"
          />
        </Grid>
      </Grid>

      <Box sx={{ marginTop: '3rem' }}>
        <FeatureShowcase />
      </Box>

      <Box sx={{ marginTop: '3rem' }}>
        <StyledPaper>
          <Typography variant="h4" component="h2" gutterBottom>
            Demo Instructions
          </Typography>
          <Typography variant="body1" paragraph>
            This review portal allows you to experience OpenEvidence from multiple perspectives:
          </Typography>
          <Typography variant="body1" component="div">
            <ul>
              <li><strong>Try the core platform</strong> - Enter medical questions in the main application to see how our AI serves contextually relevant pharmaceutical information</li>
              <li><strong>Explore company views</strong> - Access the pharma company dashboards to understand how advertisers interact with the platform</li>
              <li><strong>Review technical details</strong> - Examine our ethical AI guardrails, confidence scoring systems, and classification technologies</li>
            </ul>
          </Typography>
          <Box sx={{ marginTop: '2rem' }}>
            <DemoOptions />
          </Box>
        </StyledPaper>
      </Box>

      <Box sx={{ marginTop: '3rem' }}>
        <TechStack />
      </Box>

      <Box sx={{ marginTop: '3rem', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Have questions or feedback?
        </Typography>
        <Typography variant="body1" paragraph>
          Contact our team at reviewers@openevidence.ai or schedule a demo call for a guided walkthrough.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          component={Link} 
          href="/"
          sx={{ marginRight: '1rem' }}
        >
          Return to Main Application
        </Button>
      </Box>
    </Container>
  );
} 