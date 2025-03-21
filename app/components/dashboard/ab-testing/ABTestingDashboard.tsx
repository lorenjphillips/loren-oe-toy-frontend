import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Button,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { TestCreator } from './TestCreator';
import { ActiveTestsList } from './ActiveTestsList';
import { TestResultsComponent } from './TestResults';
import { RecommendationEngine } from './RecommendationEngine';

export const ABTestingDashboard: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [showTestCreator, setShowTestCreator] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setShowTestCreator(false);
    setSelectedTestId(null);
  };
  
  // Show test creator
  const handleShowTestCreator = () => {
    setShowTestCreator(true);
    setSelectedTestId(null);
  };
  
  // Handle test creation
  const handleTestCreated = () => {
    setShowTestCreator(false);
    setActiveTab(0); // Switch to active tests tab
  };
  
  // View test results
  const handleViewResults = (testId: string) => {
    setSelectedTestId(testId);
    setActiveTab(1); // Switch to results tab
  };
  
  // Go back to tests list
  const handleBackToTests = () => {
    setSelectedTestId(null);
  };
  
  // Render content based on active tab
  const renderContent = () => {
    if (showTestCreator) {
      return <TestCreator onTestCreated={handleTestCreated} />;
    }
    
    switch (activeTab) {
      case 0: // Tests
        return <ActiveTestsList onViewResults={handleViewResults} />;
      case 1: // Results
        return selectedTestId ? 
          <TestResultsComponent testId={selectedTestId} onBack={handleBackToTests} /> : 
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <Typography variant="body1" color="textSecondary">
              Select a test from the Active Tests tab to view results
            </Typography>
          </Box>;
      case 2: // Recommendations
        return <RecommendationEngine />;
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item>
            <Typography variant="h4" component="h1" gutterBottom>
              A/B Testing Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Create, manage, and analyze A/B tests for your pharmaceutical ads
            </Typography>
          </Grid>
          <Grid item>
            {!showTestCreator && activeTab === 0 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleShowTestCreator}
              >
                Create New Test
              </Button>
            )}
            {selectedTestId && activeTab === 1 && (
              <Button
                variant="outlined"
                onClick={handleBackToTests}
              >
                Back to Tests
              </Button>
            )}
          </Grid>
        </Grid>
        
        {!showTestCreator && (
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="A/B Testing tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab 
              icon={<BarChartIcon />} 
              iconPosition="start" 
              label="Active Tests" 
            />
            <Tab 
              icon={<CheckCircleIcon />} 
              iconPosition="start" 
              label="Test Results" 
            />
            <Tab 
              icon={<LightbulbIcon />} 
              iconPosition="start" 
              label="Recommendations" 
            />
          </Tabs>
        )}
        
        {renderContent()}
      </Paper>
    </Container>
  );
}; 