import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Grid,
  Divider,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Snackbar
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BarChartIcon from '@mui/icons-material/BarChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { TestReporting } from '../../../services/ab-testing';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  source: 'test' | 'benchmark';
  category: string;
  actionable: boolean;
  sourceTestId?: string;
  sourceTestName?: string;
}

export const RecommendationEngine: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const fetchTestBasedRecommendations = async (): Promise<Recommendation[]> => {
    // Get recommendations from completed tests
    const testRecommendations = await TestReporting.getRecommendationsFromTests();
    
    // Convert to our recommendation format
    return testRecommendations.map((rec, index) => ({
      id: `test-${index}-${rec.sourceTestId}`,
      title: rec.recommendation,
      description: `Based on results from test "${rec.sourceTestName}"`,
      impact: rec.impact,
      source: 'test',
      category: rec.category,
      actionable: true,
      sourceTestId: rec.sourceTestId,
      sourceTestName: rec.sourceTestName
    }));
  };
  
  const generateBenchmarkRecommendations = (): Recommendation[] => {
    // In a real app, these would be generated based on industry benchmarks,
    // user behavior data, and best practices
    return [
      {
        id: 'benchmark-1',
        title: 'Optimize call-to-action button contrast',
        description: 'Pharmaceutical ads with higher contrast CTAs show 12% better click-through rates on average.',
        impact: 'medium',
        source: 'benchmark',
        category: 'Design',
        actionable: true
      },
      {
        id: 'benchmark-2',
        title: 'Include efficacy statistics in headlines',
        description: 'Ads that include specific efficacy statistics in headlines see 18% higher engagement from healthcare professionals.',
        impact: 'high',
        source: 'benchmark',
        category: 'Content',
        actionable: true
      },
      {
        id: 'benchmark-3',
        title: 'Add patient testimonials to landing pages',
        description: 'Landing pages with patient testimonials show 22% higher time-on-page and 8% better conversion rates.',
        impact: 'medium',
        source: 'benchmark',
        category: 'Content',
        actionable: true
      },
      {
        id: 'benchmark-4',
        title: 'Optimize mobile ad experiences',
        description: '67% of healthcare professionals access medical content via mobile devices. Mobile-optimized ads show 30% better performance.',
        impact: 'high',
        source: 'benchmark',
        category: 'Technical',
        actionable: true
      },
      {
        id: 'benchmark-5',
        title: 'Use medical imagery carefully',
        description: 'Excessive medical imagery can reduce engagement. Balanced ads with both scientific and lifestyle imagery perform 15% better.',
        impact: 'medium',
        source: 'benchmark',
        category: 'Design',
        actionable: true
      }
    ];
  };
  
  const loadRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would fetch recommendations from an API
      // Here we'll generate them based on completed tests and industry benchmarks
      const testBasedRecommendations = await fetchTestBasedRecommendations();
      const benchmarkRecommendations = generateBenchmarkRecommendations();
      
      setRecommendations([...testBasedRecommendations, ...benchmarkRecommendations]);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);
  
  const handleApplyRecommendation = (id: string) => {
    // In a real app, this would trigger an action to apply the recommendation
    // For this demo, we'll just mark it as applied
    setAppliedRecommendations(prev => [...prev, id]);
    
    // Show confirmation
    setSnackbarMessage('Recommendation applied successfully');
    setSnackbarOpen(true);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  const handleRefresh = () => {
    loadRecommendations();
  };
  
  // Filter out applied recommendations
  const activeRecommendations = recommendations.filter(
    rec => !appliedRecommendations.includes(rec.id)
  );
  
  // Split recommendations by impact
  const highImpactRecs = activeRecommendations.filter(rec => rec.impact === 'high');
  const otherRecs = activeRecommendations.filter(rec => rec.impact !== 'high');
  
  const getImpactColor = (impact: string): 'success' | 'warning' | 'default' => {
    switch (impact) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing test results and generating recommendations...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Optimization Recommendations
        </Typography>
        <Button 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          variant="outlined"
        >
          Refresh Recommendations
        </Button>
      </Box>
      
      {activeRecommendations.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body1">
            No active recommendations available. Check back after running more tests.
          </Typography>
        </Alert>
      ) : (
        <>
          {/* High impact recommendations */}
          {highImpactRecs.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  High-Impact Recommendations
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                {highImpactRecs.map(recommendation => (
                  <Grid item xs={12} md={6} key={recommendation.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`${recommendation.impact} impact`} 
                              color={getImpactColor(recommendation.impact)}
                              size="small"
                            />
                            <Chip 
                              label={recommendation.category} 
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                          <Chip 
                            label={recommendation.source === 'test' ? 'Test Result' : 'Industry Benchmark'} 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="h6" gutterBottom>
                          {recommendation.title}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {recommendation.description}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={() => handleApplyRecommendation(recommendation.id)}
                        >
                          Apply Recommendation
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Other recommendations */}
          {otherRecs.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LightbulbIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Additional Recommendations
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                {otherRecs.map(recommendation => (
                  <Grid item xs={12} md={6} lg={4} key={recommendation.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Chip 
                            label={`${recommendation.impact} impact`} 
                            color={getImpactColor(recommendation.impact)}
                            size="small"
                          />
                          <Chip 
                            label={recommendation.category} 
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="subtitle1" gutterBottom>
                          {recommendation.title}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          {recommendation.description}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          onClick={() => handleApplyRecommendation(recommendation.id)}
                        >
                          Apply
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Applied recommendations */}
          {appliedRecommendations.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Applied Recommendations
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {recommendations
                  .filter(rec => appliedRecommendations.includes(rec.id))
                  .map(recommendation => (
                    <ListItem key={recommendation.id}>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={recommendation.title}
                        secondary={recommendation.description}
                      />
                    </ListItem>
                  ))
                }
              </List>
            </Paper>
          )}
        </>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
}; 