'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Chip,
  Badge,
  IconButton,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  CircularProgress,
  TextField,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import BloodtestIcon from '@mui/icons-material/Biotech';
import ImagingIcon from '@mui/icons-material/PhotoCamera';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { LabResult, ImagingResult } from '../../../models/microsimulation';
import { clinicalColors, shadows, animationDurations } from '../../../styles/microsimulation';

// Types for diagnostic tests
interface DiagnosticTest {
  id: string;
  name: string;
  category: 'lab' | 'imaging';
  description: string;
  timeToResult: number; // in seconds
  cost: number;         // cost units
  interpretation?: string;
}

interface TestResult {
  testId: string;
  result: LabResult | ImagingResult;
  timeOrdered: number;
  timeCompleted?: number;
  status: 'pending' | 'completed' | 'error';
}

interface DiagnosticToolProps {
  availableTests: DiagnosticTest[];
  patientId: string;
  onTestOrdered?: (testId: string, category: string) => void;
  onTestResultViewed?: (testId: string, category: string) => void;
  onCostIncurred?: (cost: number) => void;
  simulatedTimeScale?: number; // Time acceleration factor (1 = real time)
  maxTests?: number;
  preloadedResults?: TestResult[];
}

/**
 * Component for ordering and viewing diagnostic tests in clinical scenarios
 * Simulates the process of ordering tests and waiting for results
 */
export const DiagnosticTool: React.FC<DiagnosticToolProps> = ({
  availableTests,
  patientId,
  onTestOrdered,
  onTestResultViewed,
  onCostIncurred,
  simulatedTimeScale = 1,
  maxTests,
  preloadedResults = [],
}) => {
  // State
  const [tabValue, setTabValue] = useState(0);
  const [orderedTests, setOrderedTests] = useState<TestResult[]>(preloadedResults);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'lab' | 'imaging'>('lab');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingResultId, setViewingResultId] = useState<string | null>(null);
  
  // Calculate pending and completed test counts
  const pendingCount = orderedTests.filter(test => test.status === 'pending').length;
  const labsCount = orderedTests.filter(test => {
    const testInfo = availableTests.find(t => t.id === test.testId);
    return testInfo?.category === 'lab';
  }).length;
  const imagingCount = orderedTests.filter(test => {
    const testInfo = availableTests.find(t => t.id === test.testId);
    return testInfo?.category === 'imaging';
  }).length;
  
  // Filter tests by category and search query
  const filteredTests = availableTests.filter(test => {
    const matchesCategory = test.category === selectedCategory;
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          test.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle test selection in order dialog
  const handleTestSelect = (testId: string) => {
    setSelectedTest(testId);
  };
  
  // Open the test order dialog
  const handleOpenOrderDialog = (category: 'lab' | 'imaging') => {
    setSelectedCategory(category);
    setSearchQuery('');
    setSelectedTest(null);
    setDialogOpen(true);
  };
  
  // Close the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTest(null);
  };
  
  // Order a new test
  const handleOrderTest = useCallback(() => {
    if (!selectedTest) return;
    
    const testInfo = availableTests.find(test => test.id === selectedTest);
    if (!testInfo) return;
    
    // Calculate how long until the result is ready (in ms)
    const timeToResult = (testInfo.timeToResult / simulatedTimeScale) * 1000;
    const now = Date.now();
    
    // Create a placeholder result based on the test category
    let placeholderResult: LabResult | ImagingResult;
    
    if (testInfo.category === 'lab') {
      placeholderResult = {
        name: testInfo.name,
        value: "Pending...",
        collectedAt: new Date()
      };
    } else {
      placeholderResult = {
        type: testInfo.name,
        region: "As ordered",
        finding: "Pending...",
        performedAt: new Date()
      };
    }
    
    // Create the new test order
    const newTest: TestResult = {
      testId: selectedTest,
      result: placeholderResult,
      timeOrdered: now,
      status: 'pending'
    };
    
    // Add to ordered tests
    setOrderedTests(prev => [...prev, newTest]);
    
    // Inform parent components
    if (onTestOrdered) {
      onTestOrdered(selectedTest, testInfo.category);
    }
    
    if (onCostIncurred) {
      onCostIncurred(testInfo.cost);
    }
    
    // Close the dialog
    setDialogOpen(false);
    setSelectedTest(null);
    
    // Set a timeout to complete the test
    setTimeout(() => {
      setOrderedTests(prev => 
        prev.map(test => 
          test.testId === selectedTest 
            ? { 
                ...test, 
                status: 'completed', 
                timeCompleted: now + timeToResult,
                // In a real implementation, this would fetch the actual result from a backend
                // For this implementation, we reuse the placeholder with a status update
                result: {
                  ...test.result,
                  ...(testInfo.category === 'lab' 
                    ? { value: `Result for ${testInfo.name}` } 
                    : { finding: `Findings for ${testInfo.name}` })
                }
              } 
            : test
        )
      );
    }, timeToResult);
    
  }, [selectedTest, availableTests, simulatedTimeScale, onTestOrdered, onCostIncurred]);
  
  // View a test result
  const handleViewResult = (testId: string) => {
    setViewingResultId(viewingResultId === testId ? null : testId);
    
    // Get the test information
    const testResult = orderedTests.find(test => test.testId === testId);
    const testInfo = availableTests.find(test => test.id === testId);
    
    if (testResult?.status === 'completed' && testInfo && onTestResultViewed) {
      onTestResultViewed(testId, testInfo.category);
    }
  };
  
  // Calculate time elapsed or remaining
  const getTimeDisplay = (test: TestResult) => {
    const testInfo = availableTests.find(t => t.id === test.testId);
    if (!testInfo) return '';
    
    if (test.status === 'completed' && test.timeCompleted) {
      const elapsedSeconds = Math.round((test.timeCompleted - test.timeOrdered) / 1000);
      return `Completed in ${elapsedSeconds}s`;
    } else if (test.status === 'pending') {
      const elapsedMs = Date.now() - test.timeOrdered;
      const totalMs = (testInfo.timeToResult / simulatedTimeScale) * 1000;
      const remainingMs = Math.max(0, totalMs - elapsedMs);
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      
      if (remainingSeconds === 0) {
        return 'Processing...';
      }
      return `Ready in ${remainingSeconds}s`;
    }
    
    return '';
  };
  
  // Calculate progress percentage for pending tests
  const getProgressPercentage = (test: TestResult) => {
    if (test.status === 'completed') return 100;
    
    const testInfo = availableTests.find(t => t.id === test.testId);
    if (!testInfo) return 0;
    
    const elapsedMs = Date.now() - test.timeOrdered;
    const totalMs = (testInfo.timeToResult / simulatedTimeScale) * 1000;
    return Math.min(100, Math.round((elapsedMs / totalMs) * 100));
  };
  
  // Render the test ordering dialog
  const renderOrderDialog = () => (
    <Dialog 
      open={dialogOpen} 
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: shadows.high
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: clinicalColors.background.highlight, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          Order {selectedCategory === 'lab' ? 'Laboratory Test' : 'Imaging Study'}
        </Typography>
        <IconButton onClick={handleCloseDialog} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${clinicalColors.border.light}` }}>
        <Autocomplete
          fullWidth
          options={filteredTests}
          getOptionLabel={(option) => option.name}
          onChange={(_event, value) => value && handleTestSelect(value.id)}
          renderInput={(params) => (
            <TextField 
              {...params}
              label="Search tests"
              variant="outlined"
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          )}
        />
      </Box>
      
      <DialogContent sx={{ px: 1, py: 0 }}>
        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredTests.map((test) => (
            <ListItem 
              key={test.id}
              button
              selected={selectedTest === test.id}
              onClick={() => handleTestSelect(test.id)}
              sx={{
                borderRadius: 1,
                my: 0.5,
                mx: 1,
                '&.Mui-selected': {
                  backgroundColor: alpha(clinicalColors.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(clinicalColors.primary.main, 0.15),
                  }
                }
              }}
            >
              <ListItemIcon>
                {test.category === 'lab' ? <BloodtestIcon color="primary" /> : <ImagingIcon color="primary" />}
              </ListItemIcon>
              <ListItemText 
                primary={test.name} 
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    <Typography variant="body2" component="span">
                      {test.description}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${test.timeToResult}s`}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                    <Chip 
                      size="small" 
                      label={`Cost: ${test.cost}`}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                primaryTypographyProps={{
                  fontWeight: selectedTest === test.id ? 600 : 400,
                }}
              />
            </ListItem>
          ))}
          {filteredTests.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No tests match your search criteria
              </Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${clinicalColors.border.light}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            Patient ID: {patientId}
          </Typography>
          <Box>
            <Button onClick={handleCloseDialog} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOrderTest}
              disabled={!selectedTest || (maxTests !== undefined && orderedTests.length >= maxTests)}
              startIcon={<AddIcon />}
            >
              Order Test
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
  
  // Render an individual test result
  const renderTestResult = (test: TestResult) => {
    const testInfo = availableTests.find(t => t.id === test.testId);
    if (!testInfo) return null;
    
    const isCompleted = test.status === 'completed';
    const isViewing = viewingResultId === test.testId;
    const progressPercent = getProgressPercentage(test);
    
    return (
      <Card 
        key={test.testId}
        variant="outlined"
        sx={{ 
          mb: 2,
          borderColor: isViewing ? clinicalColors.primary.main : clinicalColors.border.main,
          transition: 'all 0.2s ease',
          backgroundColor: isViewing ? alpha(clinicalColors.primary.main, 0.05) : 'transparent',
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {testInfo.category === 'lab' ? 
                <BloodtestIcon sx={{ mr: 1.5, color: clinicalColors.primary.main }} /> : 
                <ImagingIcon sx={{ mr: 1.5, color: clinicalColors.primary.main }} />
              }
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {testInfo.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip 
                    size="small"
                    label={testInfo.category === 'lab' ? 'Laboratory' : 'Imaging'}
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      mr: 1,
                      backgroundColor: testInfo.category === 'lab' 
                        ? alpha(clinicalColors.primary.main, 0.1)
                        : alpha(clinicalColors.secondary.main, 0.1),
                      color: testInfo.category === 'lab'
                        ? clinicalColors.primary.main
                        : clinicalColors.secondary.main
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {getTimeDisplay(test)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box>
              {!isCompleted ? (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress 
                    variant="determinate" 
                    value={progressPercent}
                    size={32}
                    sx={{ color: clinicalColors.primary.main }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {`${Math.round(progressPercent)}%`}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Button
                  variant={isViewing ? "contained" : "outlined"}
                  size="small"
                  onClick={() => handleViewResult(test.testId)}
                  color={isViewing ? "primary" : "inherit"}
                >
                  {isViewing ? "Hide" : "View"}
                </Button>
              )}
            </Box>
          </Box>
          
          <Collapse in={isViewing && isCompleted} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${clinicalColors.border.light}` }}>
              {testInfo.category === 'lab' && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                      Result
                    </Typography>
                    <Typography variant="body2">
                      {(test.result as LabResult).value} {(test.result as LabResult).unit}
                    </Typography>
                    {(test.result as LabResult).referenceRange && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Reference: {(test.result as LabResult).referenceRange}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    {(test.result as LabResult).interpretation || testInfo.interpretation ? (
                      <>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                          Interpretation
                        </Typography>
                        <Typography variant="body2">
                          {(test.result as LabResult).interpretation || testInfo.interpretation}
                        </Typography>
                      </>
                    ) : null}
                  </Grid>
                </Grid>
              )}
              
              {testInfo.category === 'imaging' && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Finding
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {(test.result as ImagingResult).finding}
                  </Typography>
                  
                  {(test.result as ImagingResult).impression && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        Impression
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {(test.result as ImagingResult).impression}
                      </Typography>
                    </>
                  )}
                  
                  {(test.result as ImagingResult).imageUrl && (
                    <Box 
                      component="img"
                      src={(test.result as ImagingResult).imageUrl}
                      alt={`${testInfo.name} result`}
                      sx={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: 240,
                        borderRadius: 1,
                        border: `1px solid ${clinicalColors.border.light}`,
                      }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Card sx={{ 
      mb: 3, 
      boxShadow: shadows.medium,
      overflow: 'visible' 
    }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="diagnostic tools tabs"
          variant="fullWidth"
          sx={{
            backgroundColor: clinicalColors.background.highlight,
            '& .MuiTab-root': {
              py: 2,
            }
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={pendingCount} color="error" sx={{ mr: 1 }}>
                  <HistoryIcon />
                </Badge>
                <Typography component="span">Recent</Typography>
              </Box>
            } 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={labsCount} color="primary" sx={{ mr: 1 }}>
                  <BloodtestIcon />
                </Badge>
                <Typography component="span">Labs</Typography>
              </Box>
            }
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={imagingCount} color="primary" sx={{ mr: 1 }}>
                  <ImagingIcon />
                </Badge>
                <Typography component="span">Imaging</Typography>
              </Box>
            }
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
      </Box>
      
      <Box
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
        sx={{ p: 2 }}
      >
        {tabValue === 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Recent Diagnostics
              </Typography>
              <Box>
                <Tooltip title="Order new lab test">
                  <Button 
                    startIcon={<BloodtestIcon />}
                    size="small"
                    onClick={() => handleOpenOrderDialog('lab')}
                    variant="outlined"
                    sx={{ mr: 1 }}
                    disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                  >
                    Lab
                  </Button>
                </Tooltip>
                <Tooltip title="Order new imaging study">
                  <Button 
                    startIcon={<ImagingIcon />}
                    size="small"
                    onClick={() => handleOpenOrderDialog('imaging')}
                    variant="outlined"
                    disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                  >
                    Imaging
                  </Button>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {orderedTests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" paragraph>
                  No diagnostic tests ordered yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleOpenOrderDialog('lab')}
                  startIcon={<AddIcon />}
                  disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                >
                  Order Test
                </Button>
              </Box>
            ) : (
              <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
                {/* Sort by ordered time, most recent first */}
                {[...orderedTests]
                  .sort((a, b) => b.timeOrdered - a.timeOrdered)
                  .map(test => renderTestResult(test))
                }
              </Box>
            )}
          </Box>
        )}
      </Box>
      
      <Box
        role="tabpanel"
        hidden={tabValue !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
        sx={{ p: 2 }}
      >
        {tabValue === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Laboratory Tests
              </Typography>
              <Tooltip title="Order new lab test">
                <Button 
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleOpenOrderDialog('lab')}
                  disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                >
                  Order Lab Test
                </Button>
              </Tooltip>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
              {orderedTests
                .filter(test => {
                  const testInfo = availableTests.find(t => t.id === test.testId);
                  return testInfo?.category === 'lab';
                })
                .sort((a, b) => b.timeOrdered - a.timeOrdered)
                .map(test => renderTestResult(test))
              }
              
              {!orderedTests.some(test => {
                const testInfo = availableTests.find(t => t.id === test.testId);
                return testInfo?.category === 'lab';
              }) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" paragraph>
                    No laboratory tests ordered yet
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleOpenOrderDialog('lab')}
                    startIcon={<AddIcon />}
                    disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                  >
                    Order Lab Test
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
      
      <Box
        role="tabpanel"
        hidden={tabValue !== 2}
        id="tabpanel-2"
        aria-labelledby="tab-2"
        sx={{ p: 2 }}
      >
        {tabValue === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Imaging Studies
              </Typography>
              <Tooltip title="Order new imaging study">
                <Button 
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => handleOpenOrderDialog('imaging')}
                  disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                >
                  Order Imaging
                </Button>
              </Tooltip>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
              {orderedTests
                .filter(test => {
                  const testInfo = availableTests.find(t => t.id === test.testId);
                  return testInfo?.category === 'imaging';
                })
                .sort((a, b) => b.timeOrdered - a.timeOrdered)
                .map(test => renderTestResult(test))
              }
              
              {!orderedTests.some(test => {
                const testInfo = availableTests.find(t => t.id === test.testId);
                return testInfo?.category === 'imaging';
              }) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" paragraph>
                    No imaging studies ordered yet
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleOpenOrderDialog('imaging')}
                    startIcon={<AddIcon />}
                    disabled={maxTests !== undefined && orderedTests.length >= maxTests}
                  >
                    Order Imaging
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
      
      {/* Test ordering dialog */}
      {renderOrderDialog()}
    </Card>
  );
};

export default DiagnosticTool; 