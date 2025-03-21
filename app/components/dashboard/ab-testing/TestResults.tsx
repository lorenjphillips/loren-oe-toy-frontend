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
        
        // Generate report data manually since generateDetailedReport is not available
        const reportData = {
          overallConversionRate: resultsData.summaryMetrics.overallConversionRate,
          controlConversionRate: resultsData.variantResults.find(v => v.isControl)?.metrics.conversionRate || 0,
          variantsAnalysis: resultsData.variantResults.map(variant => {
            // Determine confidence level based on p-value
            let confidenceLevel = null;
            if (variant.pValue && variant.pValue < 0.01) {
              confidenceLevel = 'high';
            } else if (variant.pValue && variant.pValue < 0.05) {
              confidenceLevel = 'medium';
            } else if (variant.pValue && variant.pValue < 0.1) {
              confidenceLevel = 'low';
            }
            
            return {
              ...variant,
              confidenceLevel,
              relativeImprovement: variant.isControl ? 0 : variant.improvement
            };
          }),
          sampleSizeAdequate: resultsData.sampleSize >= 1000,
          testPower: 0.8,
          insights: resultsData.winningVariantId 
            ? [{ 
                type: 'positive', 
                message: `The winning variant showed a ${(resultsData.summaryMetrics.improvementOverControl).toFixed(2)}% improvement over the control.` 
              }]
            : [{ 
                type: 'neutral', 
                message: 'No statistically significant winner was identified in this test.' 
              }],
          recommendations: resultsData.winningVariantId 
            ? ['Implement the winning variant across all traffic', 'Consider follow-up tests to further optimize']
            : ['Redesign test variants to create more significant differences', 'Increase sample size by running the test longer'],
          dateGenerated: new Date()
        };
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
                  {results.totalExposure.toLocaleString()}
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
                  {results.summaryMetrics.totalConversions.toLocaleString()}
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
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} lg={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Variants
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell align="right">Traffic %</TableCell>
                              <TableCell align="right">Conversions</TableCell>
                              <TableCell align="right">Conv. Rate</TableCell>
                              <TableCell align="right">Improvement</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {results.variantResults.map((variant: VariantResult) => (
                              <TableRow key={variant.variantId}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {variant.name}
                                    {variant.isControl && (
                                      <Chip size="small" label="Control" sx={{ ml: 1 }} />
                                    )}
                                    {results.winningVariantId === variant.variantId && (
                                      <Chip 
                                        size="small" 
                                        label="Winner" 
                                        color="success"
                                        icon={<CheckCircleIcon />}
                                        sx={{ ml: 1 }} 
                                      />
                                    )}
                                  </Box>
                                </TableCell>
                                <TableCell align="right">
                                  {((variant.metrics.impressions / results.totalExposure) * 100).toFixed(1)}%
                                </TableCell>
                                <TableCell align="right">
                                  {variant.metrics.conversions.toLocaleString()}
                                </TableCell>
                                <TableCell align="right">
                                  {formatPercentage(variant.metrics.conversionRate)}
                                </TableCell>
                                <TableCell align="right">
                                  {variant.isControl ? (
                                    '-'
                                  ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                      {getTrendIcon(variant.improvement || 0)}
                                      <Typography variant="body2">
                                        {formatImprovement(variant.improvement || 0)}
                                      </Typography>
                                    </Box>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
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