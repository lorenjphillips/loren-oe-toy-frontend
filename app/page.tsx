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
import TimingIndicator from './components/TimingIndicator';
import { timeEstimator, TimeEstimationResult } from './services/timeEstimation';
import { contentTimingService } from './services/contentTiming';
import Link from 'next/link';

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
  
  // Add new state for streaming and timing
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [streamingData, setStreamingData] = useState<{ content: string, complete: boolean }>({ 
    content: '', 
    complete: false 
  });
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimationResult | null>(null);
  const [canShowAnswer, setCanShowAnswer] = useState<boolean>(false);
  
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
    setStreamingData({ content: '', complete: false });
    setCanShowAnswer(false);

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

      // Use streaming API if enabled
      if (isStreaming) {
        // Start SSE connection
        const eventSource = new EventSource(`/api/ask?question=${encodeURIComponent(question)}`);
        
        eventSource.addEventListener('classification', (event) => {
          const classification = JSON.parse(event.data);
          // Update classification in ad context if needed
        });
        
        eventSource.addEventListener('timeEstimate', (event) => {
          const estimate = JSON.parse(event.data);
          setTimeEstimate(estimate);
          
          // Initialize content timing service
          contentTimingService.initializeContentTiming(question, undefined, estimate);
        });
        
        eventSource.addEventListener('progress', (event) => {
          // Progress updates are handled by the TimingIndicator component
          // since timeEstimator already has the progress listener
        });
        
        eventSource.addEventListener('chunk', (event) => {
          const data = JSON.parse(event.data);
          setStreamingData(prev => ({ 
            content: data.responseText, 
            complete: false 
          }));
        });
        
        eventSource.addEventListener('complete', (event) => {
          const data = JSON.parse(event.data);
          setStreamingData({ 
            content: data.responseText, 
            complete: true 
          });
          setHistory([
            ...history, 
            { role: 'user', content: question }, 
            { role: 'assistant', content: data.responseText }
          ]);
          setQuestion('');
          setLoading(false);
          eventSource.close();
        });
        
        eventSource.addEventListener('error', (event) => {
          console.error('EventSource error:', event);
          setLoading(false);
          eventSource.close();
        });
      } else {
        // Use the non-streaming approach with POST
        const response = await axios.post('/api/ask', { question, history });
        setTimeEstimate(response.data.timeEstimate);
        setHistory([...history, { role: 'user', content: question }, { role: 'assistant', content: response.data.answer }]);
        setAnswer(response.data.answer);
        setQuestion('');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching the answer:', error);
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setHistory([]);
    setAnswer('');
    setQuestion('');
    setQuestionId('');
    setStreamingData({ content: '', complete: false });
    setTimeEstimate(null);
    contentTimingService.reset();
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

  // Toggle streaming mode
  const handleStreamingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsStreaming(event.target.checked);
  };
  
  // Handle completion notification from TimingIndicator
  const handleTimingComplete = () => {
    setCanShowAnswer(true);
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
            <Link href="/knowledge-graph" passHref style={{ textDecoration: 'none', color: 'inherit', marginRight: '10px' }}>
              <Button color="inherit">Knowledge Graph</Button>
            </Link>
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
            <Box display="flex" alignItems="center" gap={2}>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={isStreaming}
                    onChange={handleStreamingToggle}
                    color="primary"
                  />
                }
                label="Enable Streaming"
              />
            </Box>
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

        {/* Conversation History */}
        {history.length > 0 && (
          <StyledPaper>
            <List>
              {history.map((item, index) => (
                <Box key={index} marginBottom={2}>
                  <Typography variant="subtitle1" fontWeight="bold" color={item.role === 'user' ? 'primary' : 'secondary'}>
                    {item.role === 'user' ? 'You' : 'Assistant'}:
                  </Typography>
                  <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                    {item.content}
                  </Typography>
                </Box>
              ))}
            </List>
          </StyledPaper>
        )}

        {/* Current Question/Answer */}
        <StyledPaper>
          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Ask a medical question..."
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={loading}
              />
              <Box display="flex" justifyContent="flex-end">
                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!question.trim() || loading}
                >
                  {loading ? 'Processing...' : 'Ask'}
                </StyledButton>
              </Box>
            </Box>
          </form>

          {/* Progress and timing indicator */}
          {loading && (
            <TimingIndicator 
              question={question}
              isGenerating={loading}
              onComplete={handleTimingComplete}
              variant="linear"
              showStages={true}
            />
          )}

          {/* Streaming answer display */}
          {loading && isStreaming && streamingData.content && canShowAnswer && (
            <Box marginTop={2}>
              <Typography variant="subtitle1" fontWeight="bold" color="secondary">
                Assistant:
              </Typography>
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {streamingData.content}
              </Typography>
            </Box>
          )}
        </StyledPaper>

        {/* Smart ad display - integrate with content timing */}
        <ErrorBoundary>
          {isAdSystemEnabled && questionId && (
            <SmartAdDisplay 
              question={question} 
              isLoading={loading}
              onAdImpression={handleAdImpression}
              transitionSettings={transitionSettings}
            />
          )}
        </ErrorBoundary>
      </Container>
    </>
  );
}
