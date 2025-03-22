'use client';

import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Divider,
  CardMedia,
  Paper
} from '@mui/material';
import { styled } from '@mui/system';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  marginBottom: '2rem',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  borderRadius: '8px',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  },
}));

const CardContentWrapper = styled(CardContent)({
  flexGrow: 1,
});

const PlaceholderLogo = styled(Box)(({ theme, bgcolor }) => ({
  height: '160px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: bgcolor || '#f5f5f5',
  color: '#fff',
  fontSize: '1.5rem',
  fontWeight: 'bold',
}));

interface PharmaceuticalCompany {
  id: string;
  name: string;
  description: string;
  color: string;
  logo?: string;
  categories: string[];
}

export default function PharmaReviewPage() {
  const companies: PharmaceuticalCompany[] = [
    {
      id: 'pfizer',
      name: 'Pfizer',
      description: 'Review Pfizer campaigns focused on oncology, vaccines, and immunology treatments.',
      color: '#0093d0',
      categories: ['Oncology', 'Vaccines', 'Immunology']
    },
    {
      id: 'novartis',
      name: 'Novartis',
      description: 'Explore Novartis campaigns for cardiovascular, ophthalmology, and neuroscience therapies.',
      color: '#0460a9',
      categories: ['Cardiovascular', 'Ophthalmology', 'Neuroscience']
    },
    {
      id: 'merck',
      name: 'Merck',
      description: 'Analyze Merck campaigns targeting oncology, vaccines, and infectious diseases.',
      color: '#00857c',
      categories: ['Oncology', 'Vaccines', 'Infectious Disease']
    },
    {
      id: 'roche',
      name: 'Roche',
      description: 'View Roche campaigns for oncology, immunology, and infectious diseases.',
      color: '#e31937',
      categories: ['Oncology', 'Hematology', 'Neuroscience']
    },
    {
      id: 'gsk',
      name: 'GSK',
      description: 'Review GSK campaigns targeting respiratory, HIV, and vaccines.',
      color: '#F36633',
      categories: ['Respiratory', 'Vaccines', 'HIV']
    },
    {
      id: 'custom',
      name: 'Custom Demo',
      description: 'Build a custom pharmaceutical company demo with configurable settings and product categories.',
      color: '#5e35b1',
      categories: ['Customizable', 'All Categories']
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          component={Link} 
          href="/review" 
          variant="outlined" 
          sx={{ mb: 2 }}
        >
          Back to Review Portal
        </Button>
        <Typography variant="h3" component="h1" gutterBottom>
          Pharmaceutical Company View
        </Typography>
        <Typography variant="h6" gutterBottom>
          Explore OpenEvidence from a pharmaceutical advertiser's perspective
        </Typography>
      </Box>

      <StyledPaper>
        <Typography variant="body1" paragraph>
          Select a pharmaceutical company below to explore their dashboard, campaign management tools, 
          and analytics. Each company view showcases different therapeutic areas and campaign examples.
        </Typography>
        <Typography variant="body1">
          The company dashboards demonstrate how pharmaceutical advertisers can:
        </Typography>
        <ul>
          <li>Monitor campaign performance and ROI metrics</li>
          <li>Manage ad content across different clinical categories</li>
          <li>Ensure regulatory compliance and ethical standards</li>
          <li>Analyze engagement data for healthcare providers</li>
          <li>Configure targeting parameters for medical specialties</li>
        </ul>
      </StyledPaper>

      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} md={6} lg={4} key={company.id}>
            <StyledCard>
              {company.logo ? (
                <CardMedia
                  component="img"
                  height="160"
                  image={company.logo}
                  alt={`${company.name} logo`}
                />
              ) : (
                <PlaceholderLogo bgcolor={company.color}>
                  {company.name}
                </PlaceholderLogo>
              )}
              <CardContentWrapper>
                <Typography variant="h5" component="h2" gutterBottom>
                  {company.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {company.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Featured Categories:
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {company.categories.join(', ')}
                </Typography>
              </CardContentWrapper>
              <Divider />
              <CardActions>
                <Button 
                  fullWidth 
                  component={Link} 
                  href={`/review/pharma/${company.id}`}
                  variant="contained" 
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    backgroundColor: company.color,
                    '&:hover': {
                      backgroundColor: company.color,
                      opacity: 0.9
                    }
                  }}
                >
                  View Dashboard
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 