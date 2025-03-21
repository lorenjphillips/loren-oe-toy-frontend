'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, Typography, Paper, List, Box, AppBar, Toolbar, Switch, FormControlLabel, Collapse, Alert } from '@mui/material';
import { styled } from '@mui/system';
import { v4 as uuidv4 } from 'uuid';
import SmartAdDisplay from './components/SmartAdDisplay';
import { TransitionSettings, defaultTransitionSettings } from './styles/transitions';
import { useAds } from './contexts/AdContext';
import ErrorBoundary from './components/ErrorBoundary';

interface HistoryItem {
  role: string;
  content: string;
}

const StyledPaper = styled(Paper)({
  padding: '1rem',
  marginTop: '1rem',
  marginBottom: '1rem',
  fontFamily: 'Open Sans, sans-serif',
});

const StyledButton = styled(Button)({
  height: '56px', // to match TextField height
});

const FixedAppBar = styled(AppBar)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
});

const AdminPanel = styled(Paper)({
  padding: '1rem',
  marginBottom: '1rem',
  backgroundColor: '#f8f9fa',
  borderLeft: '4px solid #3f51b5',
});

export default function Home() {
  // Get ad context
  const { 
    classifyQuestion, 
    getAdsForQuestion, 
    trackAdImpression, 
    classification, 
    adContent, 
    confidenceScore,
    isAdSystemEnabled,
    setIsAdSystemEnabled
  } = useAds();

  const [question, setQuestion] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userId] = useState<string>(() => {
    // Generate a unique user ID for this session
    return uuidv4();
  });
  const [questionId, setQuestionId] = useState<string>('');
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  
  // User's preference for transition settings - could be loaded from profile/cookies
  const [transitionSettings, setTransitionSettings] = useState<Partial<TransitionSettings>>({
    // Default to clinical professional settings
    durationBase: 400, // Slightly faster than default
    enablePulse: true,
    enableStaggered: true,
    staggerDelay: 80, // Slightly quicker staggering
  });

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    // Generate a new question ID for tracking purposes
    const newQuestionId = uuidv4();
    setQuestionId(newQuestionId);

    try {
      // Classify the question for ad targeting
      if (isAdSystemEnabled) {
        // This runs in parallel with the main question processing
        getAdsForQuestion(question).catch(error => {
          console.error('Error getting ads:', error);
          // Continue with main flow even if ad targeting fails
        });
      }

      scrollToBottom();

      // Process the question to get an answer
      const response = await axios.post('/api/ask', { question, history });

      setHistory([...history, { role: 'user', content: question }, { role: 'assistant', content: response.data.answer }]);
      setAnswer(response.data.answer);
      setQuestion('');
    } catch (error) {
      console.error('Error fetching the answer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setAnswer('');
    setQuestion('');
    setQuestionId('');
    scrollToBottom();
  };

  const handleAdImpression = (adInfo: { adId: string, companyId: string, categoryId: string, viewTimeMs: number }) => {
    // Use our context to track ad impressions
    trackAdImpression(adInfo);
  };
  
  // Handle transition settings change - could be triggered by user preferences
  const updateTransitionSettings = (newSettings: Partial<TransitionSettings>) => {
    setTransitionSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Toggle admin panel
  const toggleAdminPanel = () => {
    setShowAdmin(!showAdmin);
  };

  // Toggle ad system
  const handleAdSystemToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAdSystemEnabled(event.target.checked);
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading, history]);

  // Press Ctrl+Shift+A to toggle admin panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        toggleAdminPanel();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAdmin]);

  return (
    <>
      <FixedAppBar position="static">
        <Container maxWidth="md">
          <Toolbar disableGutters>
            <Typography variant="h6" style={{ flexGrow: 1, fontFamily: 'Roboto, sans-serif' }}>
              Simple Ask
            </Typography>
            <Button color="inherit" onClick={toggleAdminPanel} style={{ marginRight: '10px' }}>
              {showAdmin ? 'Hide Admin' : 'Admin'}
            </Button>
            <Button color="inherit" onClick={handleNewConversation}>New Conversation</Button>
          </Toolbar>
        </Container>
      </FixedAppBar>

      <Container maxWidth="md" style={{ marginTop: '120px', fontFamily: 'Roboto, sans-serif', marginBottom: '250px' }}>
        {/* Admin Panel */}
        <Collapse in={showAdmin}>
          <AdminPanel elevation={2}>
            <Typography variant="h6" gutterBottom>Admin Controls</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isAdSystemEnabled}
                  onChange={handleAdSystemToggle}
                  color="primary"
                />
              }
              label="Enable Ad System"
            />
            {classification && classification.primaryCategory && (
              <Box mt={2}>
                <Typography variant="subtitle2">Question Classification</Typography>
                <Typography variant="body2">Primary Category: {classification.primaryCategory.name}</Typography>
                <Typography variant="body2">Confidence: {confidenceScore ? `${(confidenceScore * 100).toFixed(1)}%` : 'Unknown'}</Typography>
              </Box>
            )}
            {adContent && (
              <Box mt={2}>
                <Typography variant="subtitle2">Selected Ad</Typography>
                <Typography variant="body2">Company: {adContent.company.name}</Typography>
                <Typography variant="body2">Treatment: {adContent.treatmentCategory.name}</Typography>
              </Box>
            )}
          </AdminPanel>
        </Collapse>

        {/* Display the SmartAdDisplay component when loading */}
        <ErrorBoundary>
          {loading && (
            <SmartAdDisplay 
              question={question}
              isLoading={loading}
              onAdImpression={handleAdImpression}
              transitionSettings={transitionSettings}
            />
          )}
        </ErrorBoundary>

        {history.length > 0 && (
          <List>
            {history.map((item, index) => (
              <StyledPaper elevation={3} key={index}>
                <Typography variant="body1" component="div">
                  <strong>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}:</strong>
                </Typography>
                <Box component="div" dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br />') }} />
              </StyledPaper>
            ))}
          </List>
        )}
        <StyledPaper elevation={3}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <TextField
              label="Ask a question"
              variant="outlined"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}  // Disable input while loading
            />
            <StyledButton type="submit" variant="contained" color="primary" disabled={loading}>
              Ask
            </StyledButton>
          </form>
        </StyledPaper>
      </Container>
    </>
  );
}
