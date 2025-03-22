'use client';

import React from 'react';
import { Typography, Box, Paper, Grid, Divider } from '@mui/material';
import { styled } from '@mui/system';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import SecurityIcon from '@mui/icons-material/Security';
import ApiIcon from '@mui/icons-material/Api';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DevicesIcon from '@mui/icons-material/Devices';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '2rem',
  height: '100%',
}));

const TechCategory = styled(Box)(({ theme }) => ({
  marginBottom: '1.5rem',
}));

const TechItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '0.5rem',
  '& svg': {
    marginRight: '0.5rem',
    color: '#3e92cc',
  },
}));

interface TechnologySection {
  title: string;
  icon: React.ReactNode;
  items: string[];
}

export default function TechStack() {
  const technologies: TechnologySection[] = [
    {
      title: "Frontend Technologies",
      icon: <DevicesIcon />,
      items: [
        "React with Next.js",
        "TypeScript for type safety",
        "Material-UI component library",
        "Responsive design for all devices",
        "Client-side state management"
      ]
    },
    {
      title: "Backend & APIs",
      icon: <ApiIcon />,
      items: [
        "Node.js with Express",
        "GraphQL API for flexible queries",
        "RESTful API endpoints",
        "Serverless functions",
        "Microservices architecture"
      ]
    },
    {
      title: "AI & Machine Learning",
      icon: <CodeIcon />,
      items: [
        "NLP for medical question classification",
        "Entity recognition for medical terms",
        "Contextual relevance scoring",
        "Ethical AI guardrails",
        "ML-based recommendation engine"
      ]
    },
    {
      title: "Data & Analytics",
      icon: <AnalyticsIcon />,
      items: [
        "Real-time ad performance metrics",
        "User engagement analytics",
        "A/B testing framework",
        "Anonymized usage tracking",
        "ROI & conversion analytics"
      ]
    },
    {
      title: "Infrastructure",
      icon: <StorageIcon />,
      items: [
        "Cloud-native architecture",
        "Containerized applications",
        "Automated CI/CD pipelines",
        "Scalable database solutions",
        "High-availability deployment"
      ]
    },
    {
      title: "Security & Compliance",
      icon: <SecurityIcon />,
      items: [
        "HIPAA-compliant data handling",
        "End-to-end encryption",
        "Regulatory compliance checks",
        "Access control and authentication",
        "Data privacy protection"
      ]
    }
  ];

  return (
    <StyledPaper>
      <Typography variant="h4" component="h2" gutterBottom>
        Technology Stack
      </Typography>
      <Typography variant="body1" paragraph>
        OpenEvidence is built on a modern technology stack designed for performance, security, and scalability.
      </Typography>
      
      <Divider sx={{ marginBottom: '2rem' }} />
      
      <Grid container spacing={3}>
        {technologies.map((tech, index) => (
          <Grid item xs={12} md={6} key={index}>
            <TechCategory>
              <Typography variant="h6" component="h3" sx={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                {tech.icon}
                <Box component="span" sx={{ ml: 1 }}>{tech.title}</Box>
              </Typography>
              {tech.items.map((item, itemIndex) => (
                <TechItem key={itemIndex}>
                  <Typography variant="body2">
                    • {item}
                  </Typography>
                </TechItem>
              ))}
            </TechCategory>
          </Grid>
        ))}
      </Grid>
    </StyledPaper>
  );
} 