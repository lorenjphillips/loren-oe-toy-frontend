'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';
import { styled } from '@mui/system';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const CardContentWrapper = styled(CardContent)({
  flexGrow: 1,
});

const ChipContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '0.5rem',
  flexWrap: 'wrap',
  marginTop: '1rem',
  marginBottom: '1rem',
}));

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  path: string;
  tags: string[];
  sampleQuestions: string[];
}

export default function DemoOptions() {
  const [open, setOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);

  const handleOpen = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const demoScenarios: DemoScenario[] = [
    {
      id: 'oncology',
      title: 'Oncology Specialist',
      description: 'Explore how the platform delivers relevant treatment information for cancer specialists researching new therapies.',
      path: '/',
      tags: ['Cancer', 'Treatments', 'Clinical Trials'],
      sampleQuestions: [
        'What are the latest treatment options for HER2+ metastatic breast cancer?',
        'Are there new immunotherapy approaches for advanced melanoma?',
        'What clinical trials are available for EGFR-mutated lung cancer?'
      ]
    },
    {
      id: 'cardiology',
      title: 'Cardiology Practice',
      description: 'See how cardiologists receive information about new medications and devices for cardiovascular conditions.',
      path: '/',
      tags: ['Heart Disease', 'Medications', 'Devices'],
      sampleQuestions: [
        'What are the new guidelines for PCSK9 inhibitors in hypercholesterolemia?',
        'Are there new anticoagulants with reduced bleeding risk?',
        'What devices are approved for minimally invasive valve replacement?'
      ]
    },
    {
      id: 'pharma-review',
      title: 'Pharmaceutical Company View',
      description: 'Review the platform from a pharmaceutical advertiser perspective, with metrics and campaign management.',
      path: '/review/pharma',
      tags: ['Analytics', 'Campaigns', 'Compliance'],
      sampleQuestions: []
    }
  ];

  return (
    <>
      <Typography variant="h5" component="h3" gutterBottom>
        Demo Scenarios
      </Typography>
      <Grid container spacing={3}>
        {demoScenarios.map((scenario) => (
          <Grid item xs={12} md={4} key={scenario.id}>
            <StyledCard>
              <CardContentWrapper>
                <Typography variant="h6" component="h4" gutterBottom>
                  {scenario.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {scenario.description}
                </Typography>
                <ChipContainer>
                  {scenario.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
                  ))}
                </ChipContainer>
              </CardContentWrapper>
              <CardActions sx={{ justifyContent: 'space-between', padding: '1rem' }}>
                {scenario.sampleQuestions.length > 0 ? (
                  <Button size="small" onClick={() => handleOpen(scenario)}>
                    Sample Questions
                  </Button>
                ) : (
                  <Box></Box>
                )}
                <Button 
                  size="small" 
                  component={Link} 
                  href={scenario.path}
                  endIcon={<ArrowForwardIcon />}
                  variant="contained"
                  color="primary"
                >
                  Try This Demo
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      {/* Sample Questions Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Sample Questions for {selectedScenario?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Try asking these questions to see how our platform provides relevant pharmaceutical information:
          </DialogContentText>
          <List>
            {selectedScenario?.sampleQuestions.map((question, index) => (
              <ListItem key={index}>
                <ListItemText primary={question} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
          <Button 
            component={Link} 
            href={selectedScenario?.path || '/'} 
            color="primary" 
            variant="contained"
          >
            Try Demo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 