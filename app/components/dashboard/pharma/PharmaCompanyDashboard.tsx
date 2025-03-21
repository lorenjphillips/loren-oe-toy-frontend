/**
 * PharmaCompanyDashboard Component
 * 
 * A specialized dashboard view for pharmaceutical companies that highlights
 * their specific treatment areas and performance metrics.
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, 
  Tab, 
  Tabs, 
  Typography, 
  Paper, 
  Divider,
  Chip,
  Avatar,
  Grid,
  CircularProgress,
  Button,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DashboardContext, DashboardContextType } from '../DashboardLayout';
import MetricsOverview from '../MetricsOverview';
import TimeseriesVisualizer from '../TimeseriesVisualizer';
import CategoryBreakdown from '../CategoryBreakdown';
import EngagementDetail from '../EngagementDetail';
import { PharmaCompany, PharmaTreatmentArea, getCompanyById } from '../../../data/pharmaCategories';

// Tabs panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-tabpanel-${index}`}
      aria-labelledby={`company-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export interface PharmaCompanyDashboardProps {
  companyId: string;
}

export default function PharmaCompanyDashboard({ companyId }: PharmaCompanyDashboardProps) {
  const theme = useTheme();
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [activeTab, setActiveTab] = useState(0);
  const [company, setCompany] = useState<PharmaCompany | null>(null);
  const [loading, setLoading] = useState(true);
  const [treatmentArea, setTreatmentArea] = useState<string | null>(null);
  
  // Load company data
  useEffect(() => {
    const loadCompany = async () => {
      setLoading(true);
      try {
        const companyData = getCompanyById(companyId);
        
        if (companyData) {
          setCompany(companyData);
          // Update the selected company in the dashboard context
          dashboardContext.setSelectedCompany(companyId);
          
          // If no treatment area is selected, select the highest priority one
          if (!treatmentArea && companyData.treatment_areas.length > 0) {
            const sortedAreas = [...companyData.treatment_areas].sort((a, b) => b.priority - a.priority);
            setTreatmentArea(sortedAreas[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCompany();
  }, [companyId, dashboardContext, treatmentArea]);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle treatment area change
  const handleTreatmentAreaChange = (areaId: string) => {
    setTreatmentArea(areaId);
  };
  
  const handleExportData = () => {
    console.log('Export data for:', companyId);
    // Implementation would generate a report or export data
  };
  
  const handleShareDashboard = () => {
    console.log('Share dashboard for:', companyId);
    // Implementation would generate a shareable link
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!company) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Company not found: {companyId}</Typography>
      </Box>
    );
  }
  
  // Find the current treatment area
  const currentArea = company.treatment_areas.find(area => area.id === treatmentArea) || company.treatment_areas[0];
  
  return (
    <Box>
      {/* Company header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          borderLeft: `6px solid ${theme.palette.primary.main}`,
          background: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {company.logo_url ? (
              <Avatar 
                src={company.logo_url} 
                alt={company.name}
                sx={{ width: 64, height: 64 }}
              />
            ) : (
              <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main }}>
                {company.name.substring(0, 1)}
              </Avatar>
            )}
          </Grid>
          <Grid item xs>
            <Typography variant="h4" component="h1" gutterBottom>
              {company.name} Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Performance insights and analytics for {company.name}'s pharmaceutical advertising campaigns
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              startIcon={<DownloadIcon />} 
              variant="outlined" 
              onClick={handleExportData}
              sx={{ mr: 1 }}
            >
              Export
            </Button>
            <Button 
              startIcon={<ShareIcon />} 
              variant="contained" 
              onClick={handleShareDashboard}
            >
              Share
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Treatment areas filter */}
      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle2" sx={{ mr: 2, my: 1 }}>
          Treatment Areas:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="All Areas"
            onClick={() => handleTreatmentAreaChange('all')}
            color={treatmentArea === 'all' ? 'primary' : 'default'}
            variant={treatmentArea === 'all' ? 'filled' : 'outlined'}
          />
          {company.treatment_areas.map((area) => (
            <Chip
              key={area.id}
              label={area.category.replace('_', ' ')}
              onClick={() => handleTreatmentAreaChange(area.id)}
              color={treatmentArea === area.id ? 'primary' : 'default'}
              variant={treatmentArea === area.id ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>
      
      {/* Current treatment area summary */}
      {currentArea && treatmentArea !== 'all' && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            {currentArea.category.replace('_', ' ')} Overview
          </Typography>
          <Typography variant="body2" paragraph>
            This treatment area includes {currentArea.subcategories.length} subcategories 
            with flagship medications such as {currentArea.flagship_medications.join(', ')}.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {currentArea.subcategories.map((subcategory) => (
              <Chip
                key={subcategory}
                size="small"
                label={subcategory.replace('_', ' ')}
                color="info"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      )}
      
      {/* Main metrics overview */}
      <MetricsOverview 
        companyId={companyId} 
        category={treatmentArea === 'all' ? undefined : currentArea?.category}
      />
      
      {/* Tab navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="company dashboard tabs"
        >
          <Tab label="Performance Trends" />
          <Tab label="Category Analysis" />
          <Tab label="Engagement Insights" />
        </Tabs>
      </Box>
      
      {/* Tab content */}
      <TabPanel value={activeTab} index={0}>
        <TimeseriesVisualizer 
          companyId={companyId}
          category={treatmentArea === 'all' ? undefined : currentArea?.category}
        />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <CategoryBreakdown 
          companyId={companyId}
        />
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <EngagementDetail 
          companyId={companyId}
          category={treatmentArea === 'all' ? undefined : currentArea?.category}
        />
      </TabPanel>
      
      {/* Key insights footer */}
      <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Key Insights
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Primary Growth Area:</strong> {company.treatment_areas[0]?.category.replace('_', ' ')} 
                showing {Math.floor(Math.random() * 30) + 10}% increase in engagement
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Top Performing Content:</strong> Knowledge graphs and microsimulations 
                drive 3x higher engagement than standard ads
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <strong>Optimization Opportunity:</strong> Increasing {company.treatment_areas[1]?.category.replace('_', ' ')} 
                content could yield 25% higher conversion
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
} 