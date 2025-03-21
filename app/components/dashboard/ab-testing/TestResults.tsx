import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  LinearProgress,
  Tabs,
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { Test, TestResults, VariantResult } from '../../../models/ab-testing';
import { TestManager, TestReporting } from '../../../services/ab-testing';

interface TestResultsProps {
  testId: string;
  onBack: () => void;
}

export const TestResultsComponent: React.FC<TestResultsProps> = ({ testId, onBack }) => {
  const [test, setTest] = useState<Test | null>(null);
  const [results, setResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [report, setReport] = useState<any | null>(null);
  
  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch test details
        const testData = await TestManager.getTest(testId);
        if (!testData) {
          setError(`Test with ID ${testId} not found`);
          setLoading(false);
          return;
        }
        
        setTest(testData);
        
        // Fetch test results
        const resultsData = await TestReporting.getTestResults(testId);
        if (!resultsData) {
          setError(`No results available for test ${testData.name}`);
          setLoading(false);
          return;
        }
        
        setResults(resultsData);
        
        // Generate report from results
        const reportData = await TestReporting.generateDetailedReport(resultsData);
        setReport(reportData);
      } catch (error) {
        console.error('Error fetching test results:', error);
        setError('Failed to load test results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTestResults();
  }, [testId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(2)}%`;
  };
  
  // Format improvement
  const formatImprovement = (value: number): string => {
    if (value > 0) {
      return `+${(value * 100).toFixed(2)}%`;
    } else if (value < 0) {
      return `${(value * 100).toFixed(2)}%`;
    } else {
      return '0%';
    }
  };
  
  // Get trend icon
  const getTrendIcon = (value: number) => {
    if (value > 0.05) {
      return <TrendingUpIcon color="success" />;
    } else if (value < -0.05) {
      return <TrendingDownIcon color="error" />;
    } else {
      return <TrendingFlatIcon color="action" />;
    }
  };
  
  // Get confidence color
  const getConfidenceColor = (level: string | null): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (level) {
      case 'high':
        return 'success';
      case 'medium':
        return 'primary';
      case 'low':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  const handleDownloadCsv = () => {
    if (!results) return;
    
    const csv = TestReporting.exportResultsToCsv(results);
    
    // Create and download file
    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `test-results-${testId}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading test results...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          variant="outlined" 
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Tests
        </Button>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }
  
  if (!test || !results) {
    return (
      <Box sx={{ p: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          variant="outlined" 
          onClick={onBack}
          sx={{ mb: 2 }}
        >
          Back to Tests
        </Button>
        <Alert severity="error">Failed to load test results</Alert>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {test.name} Results
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {test.description}
            </Typography>
          </Box>
          {onBack && (
            <Button variant="outlined" onClick={onBack}>
              Back to Tests
            </Button>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Impressions
                </Typography>
                <Typography variant="h4">
                  {results.totalImpressions.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Total Conversions
                </Typography>
                <Typography variant="h4">
                  {results.totalConversions.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Overall Conversion Rate
                </Typography>
                <Typography variant="h4">
                  {formatPercentage(report.overallConversionRate)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Test Duration
                </Typography>
                <Typography variant="h4">
                  {report.duration} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Recommendation */}
        {report.recommendation && (
          <Box sx={{ mb: 4 }}>
            <Alert 
              severity={
                report.recommendation.action === 'ADOPT_VARIANT' ? 'success' :
                report.recommendation.action === 'CONSIDER_ADOPTION' ? 'info' :
                report.recommendation.action === 'CONCLUDE_NEUTRAL' ? 'warning' :
                'info'
              }
              icon={report.recommendation.action === 'ADOPT_VARIANT' ? <CheckCircleIcon /> : undefined}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Recommendation: {
                  report.recommendation.action === 'ADOPT_VARIANT' ? 'Adopt Variant' :
                  report.recommendation.action === 'CONSIDER_ADOPTION' ? 'Consider Adoption' :
                  report.recommendation.action === 'CONCLUDE_NEUTRAL' ? 'No Clear Winner' :
                  'Continue Testing'
                }
              </Typography>
              <Typography variant="body2">
                {report.recommendation.message}
              </Typography>
            </Alert>
          </Box>
        )}
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Variant Results" />
            <Tab label="Statistical Analysis" />
            <Tab label="Segment Analysis" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box sx={{ py: 2 }}>
          {/* Variant Results Tab */}
          {tabValue === 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Variant Performance
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Variant</TableCell>
                      <TableCell>Impressions</TableCell>
                      <TableCell>Conversions</TableCell>
                      <TableCell>Conversion Rate</TableCell>
                      <TableCell>Improvement</TableCell>
                      <TableCell>Confidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.variants.map((variant) => (
                      <TableRow key={variant.variantId} sx={variant.isControl ? {} : { backgroundColor: variant.improvement > 0 ? 'rgba(76, 175, 80, 0.08)' : variant.improvement < 0 ? 'rgba(244, 67, 54, 0.08)' : 'transparent' }}>
                        <TableCell>
                          <Typography variant="body1">
                            {variant.name} {variant.isControl && '(Control)'}
                          </Typography>
                        </TableCell>
                        <TableCell>{variant.metrics.impressions.toLocaleString()}</TableCell>
                        <TableCell>{variant.metrics.conversions.toLocaleString()}</TableCell>
                        <TableCell>{formatPercentage(variant.metrics.conversions / variant.metrics.impressions)}</TableCell>
                        <TableCell>
                          {variant.isControl ? (
                            <Typography variant="body2" color="textSecondary">Baseline</Typography>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getTrendIcon(variant.improvement)}
                              <Typography 
                                variant="body2" 
                                color={variant.improvement > 0 ? 'success.main' : variant.improvement < 0 ? 'error.main' : 'text.secondary'}
                                sx={{ ml: 1 }}
                              >
                                {formatImprovement(variant.improvement)}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          {variant.isControl ? (
                            <Typography variant="body2" color="textSecondary">N/A</Typography>
                          ) : (
                            <Chip 
                              size="small" 
                              label={variant.significanceLevel || 'None'} 
                              color={getConfidenceColor(variant.significanceLevel)}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Insights */}
              <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                Variant Insights
              </Typography>
              
              <Grid container spacing={3}>
                {report.variantInsights.map((insight: any) => (
                  <Grid item xs={12} md={6} key={insight.variantId}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {insight.name}
                        </Typography>
                        <Typography variant="body2">
                          {insight.insight}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {/* Statistical Analysis Tab */}
          {tabValue === 1 && (
            <>
              <Typography variant="h6" gutterBottom>
                Statistical Analysis
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Variant</TableCell>
                      <TableCell>p-value</TableCell>
                      <TableCell>Confidence Interval</TableCell>
                      <TableCell>Z-Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.statisticalDetails.map((detail: any) => (
                      <TableRow key={detail.variantId}>
                        <TableCell>{detail.name}</TableCell>
                        <TableCell>{detail.pValue?.toFixed(4) || 'N/A'}</TableCell>
                        <TableCell>
                          {detail.confidenceInterval ? 
                            `[${(detail.confidenceInterval[0] * 100).toFixed(2)}%, ${(detail.confidenceInterval[1] * 100).toFixed(2)}%]` : 
                            'N/A'
                          }
                        </TableCell>
                        <TableCell>{detail.zScore?.toFixed(2) || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Typography variant="subtitle2" sx={{ mt: 3 }}>
                Statistical Methodology
              </Typography>
              <Typography variant="body2">
                This A/B test uses a z-test for proportions to determine statistical significance. 
                The results include p-values, which indicate the probability that the observed difference 
                between variants occurred by chance. Lower p-values indicate higher confidence 
                that the observed difference is real.
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Confidence intervals show the range within which the true difference between variants 
                is likely to fall with 95% confidence. Z-scores represent the number of standard 
                deviations from the mean of the control group.
              </Typography>
            </>
          )}
          
          {/* Segment Analysis Tab */}
          {tabValue === 2 && (
            <>
              <Typography variant="h6" gutterBottom>
                Segment Analysis
              </Typography>
              
              {report.segmentAnalysis.map((segment: any) => (
                <Box key={segment.segmentName} sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {segment.segmentName}
                  </Typography>
                  
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Segment</TableCell>
                          <TableCell>Control Rate</TableCell>
                          {Object.keys(segment.segments[0].variantConversionRates).map((variantId) => (
                            <TableCell key={variantId}>Variant {variantId}</TableCell>
                          ))}
                          <TableCell>Significant Difference</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {segment.segments.map((segmentData: any) => (
                          <TableRow key={segmentData.name}>
                            <TableCell>{segmentData.name}</TableCell>
                            <TableCell>{formatPercentage(segmentData.controlConversionRate)}</TableCell>
                            {Object.entries(segmentData.variantConversionRates).map(([variantId, rate]) => (
                              <TableCell key={variantId}>
                                {formatPercentage(rate as number)}
                                <Typography variant="body2" color={
                                  (rate as number) > segmentData.controlConversionRate ? 'success.main' : 
                                  (rate as number) < segmentData.controlConversionRate ? 'error.main' : 
                                  'text.secondary'
                                }>
                                  {formatImprovement(((rate as number) - segmentData.controlConversionRate) / segmentData.controlConversionRate)}
                                </Typography>
                              </TableCell>
                            ))}
                            <TableCell>
                              {segmentData.significantDifferences ? 
                                <Chip size="small" label="Yes" color="success" /> : 
                                <Chip size="small" label="No" color="default" />
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Segment analysis helps identify if certain variants perform better with specific user segments. 
                  This information can be used to target optimized ad experiences to different audience segments.
                </Typography>
              </Alert>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}; 