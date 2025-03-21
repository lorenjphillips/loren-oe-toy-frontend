/**
 * Medical Trends Dashboard
 * 
 * Displays a comprehensive dashboard of medical topic trends
 * with emerging topics, correlations, seasonal patterns, and forecasts.
 */
import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Tabs, 
  Tab,
  Button,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  FormControl,
  InputLabel, 
  Select,
  TextField
} from '@mui/material';
import { 
  DatePicker 
} from '@mui/x-date-pickers';
import {
  FileDownload as FileDownloadIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Insights as InsightsIcon,
  Dashboard as DashboardIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  EmergingTopics, 
  TopicCorrelation, 
  SeasonalAnalysis, 
  TopicForecast 
} from '../components/dashboard/trends';
import { DashboardContext } from '../components/dashboard/DashboardContext';
import { trendInsightsService } from '../services/insights/trendInsights';

// Dashboard sections
enum DashboardSection {
  OVERVIEW = 'overview',
  HISTORICAL = 'historical',
  CORRELATIONS = 'correlations',
  SEASONAL = 'seasonal',
  FORECAST = 'forecast',
  INSIGHTS = 'insights'
}

export default function TrendsDashboard() {
  // State for dashboard context
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().getFullYear() - 2, 0, 1),
    new Date()
  ]);
  
  // Dashboard UI state
  const [activeSection, setActiveSection] = useState<DashboardSection>(DashboardSection.OVERVIEW);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    minConfidence: 0.6,
    specialties: [] as string[]
  });
  
  // Handle section change
  const handleSectionChange = (_: React.SyntheticEvent, newValue: DashboardSection) => {
    setActiveSection(newValue);
  };
  
  // Handle filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFilterMenuAnchor(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterMenuAnchor(null);
  };
  
  // Handle action menu
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setActionMenuAnchor(event.currentTarget);
  };
  
  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };
  
  // Handle date range change
  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setDateRange([date, dateRange[1]]);
    }
  };
  
  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setDateRange([dateRange[0], date]);
    }
  };
  
  // Handle filters
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilters({
      ...filters,
      category: event.target.value as string
    });
  };
  
  const handleConfidenceChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilters({
      ...filters,
      minConfidence: event.target.value as number
    });
  };
  
  // Export dashboard report
  const handleExportReport = () => {
    console.log('Exporting report...');
    handleActionMenuClose();
    // In a real implementation, this would generate a PDF or Excel report
  };
  
  // Helper to render dashboard filters
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">
            <FilterListIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Filters
          </Typography>
          <IconButton size="small" onClick={() => setShowFilters(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filters.category}
                label="Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="disease">Diseases</MenuItem>
                <MenuItem value="symptom">Symptoms</MenuItem>
                <MenuItem value="treatment">Treatments</MenuItem>
                <MenuItem value="drug">Medications</MenuItem>
                <MenuItem value="procedure">Procedures</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="confidence-filter-label">Min. Confidence</InputLabel>
              <Select
                labelId="confidence-filter-label"
                value={filters.minConfidence}
                label="Min. Confidence"
                onChange={handleConfidenceChange}
              >
                <MenuItem value={0.5}>50%</MenuItem>
                <MenuItem value={0.6}>60%</MenuItem>
                <MenuItem value={0.7}>70%</MenuItem>
                <MenuItem value={0.8}>80%</MenuItem>
                <MenuItem value={0.9}>90%</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="specialty-filter-label">Specialty</InputLabel>
              <Select
                labelId="specialty-filter-label"
                value="all"
                label="Specialty"
                disabled
              >
                <MenuItem value="all">All Specialties</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  return (
    <DashboardContext.Provider value={{ dateRange }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
              <InsightsIcon sx={{ mr: 1, color: 'primary.main' }} />
              Medical Trends Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Analysis of emerging clinical topics based on physician questions
            </Typography>
          </Grid>
          
          <Grid item>
            <Stack direction="row" spacing={1}>
              <DatePicker 
                label="From"
                value={dateRange[0]}
                onChange={handleStartDateChange}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker 
                label="To"
                value={dateRange[1]}
                onChange={handleEndDateChange}
                slotProps={{ textField: { size: 'small' } }}
              />
              
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              
              <Button 
                variant="contained" 
                startIcon={<FileDownloadIcon />}
                size="small"
                onClick={handleActionMenuOpen}
              >
                Export
              </Button>
              
              <IconButton size="small" onClick={handleActionMenuOpen}>
                <MoreVertIcon />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
        
        {/* Filter section */}
        {renderFilters()}
        
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeSection} 
            onChange={handleSectionChange}
            scrollButtons="auto"
            variant="scrollable"
          >
            <Tab 
              label="Overview" 
              value={DashboardSection.OVERVIEW}
              icon={<DashboardIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab 
              label="Emerging Topics" 
              value={DashboardSection.HISTORICAL}
            />
            <Tab 
              label="Topic Correlations" 
              value={DashboardSection.CORRELATIONS}
            />
            <Tab 
              label="Seasonal Patterns" 
              value={DashboardSection.SEASONAL}
            />
            <Tab 
              label="Forecast" 
              value={DashboardSection.FORECAST}
            />
            <Tab 
              label="Strategic Insights" 
              value={DashboardSection.INSIGHTS}
            />
          </Tabs>
        </Box>
        
        {/* Overview section */}
        {activeSection === DashboardSection.OVERVIEW && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <EmergingTopics maxTopics={5} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TopicCorrelation maxCorrelations={5} viewMode="graph" />
            </Grid>
            <Grid item xs={12} md={6}>
              <SeasonalAnalysis maxTopics={4} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TopicForecast maxTopics={4} />
            </Grid>
          </Grid>
        )}
        
        {/* Emerging Topics section */}
        {activeSection === DashboardSection.HISTORICAL && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <EmergingTopics maxTopics={15} showRelatedTopics={true} />
            </Grid>
          </Grid>
        )}
        
        {/* Topic Correlations section */}
        {activeSection === DashboardSection.CORRELATIONS && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TopicCorrelation 
                maxCorrelations={20} 
                minCorrelationStrength={0.4}
                height={700}
              />
            </Grid>
          </Grid>
        )}
        
        {/* Seasonal Patterns section */}
        {activeSection === DashboardSection.SEASONAL && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <SeasonalAnalysis 
                maxTopics={8}
                seasonalityThreshold={0.3}
                height={700}
              />
            </Grid>
          </Grid>
        )}
        
        {/* Forecast section */}
        {activeSection === DashboardSection.FORECAST && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TopicForecast 
                maxTopics={15}
                height={700}
              />
            </Grid>
          </Grid>
        )}
        
        {/* Insights section */}
        {activeSection === DashboardSection.INSIGHTS && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Strategic Insights
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Automated insights and recommendations based on medical trend analysis
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Key Opportunities
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {Array(3).fill(null).map((_, i) => (
                    <Grid item xs={12} md={4} key={i}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {['Content Gap in Precision Medicine', 
                            'Rising Interest in Gut Microbiome', 
                            'AI in Diagnostics Educational Need'][i]}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {['Physicians seeking detailed information about specific applications of precision medicine techniques',
                            'Significant growth in questions about microbiome impacts on various conditions',
                            'Growing demand for practical guidance on implementing AI diagnostic tools'][i]}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={['High Priority', 'Medium Priority', 'High Priority'][i]}
                          color={i === 1 ? 'warning' : 'success'}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Emerging Content Needs
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {Array(3).fill(null).map((_, i) => (
                    <Grid item xs={12} key={i}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container>
                          <Grid item xs>
                            <Typography variant="subtitle2">
                              {['New Guidance on mRNA Therapeutic Applications',
                                'Mental Health Integration in Primary Care',
                                'Remote Monitoring Technology Implementation'][i]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Based on {['rising correlation between mRNA and chronic conditions',
                                'seasonal patterns in mental health questions',
                                'strong growth forecast in telehealth trends'][i]}
                            </Typography>
                          </Grid>
                          <Grid item>
                            <Chip 
                              size="small" 
                              label={['Content', 'Education', 'Implementation'][i]}
                              variant="outlined"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Recommended Actions
                </Typography>
                
                <ol>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Develop dedicated content hub for Precision Medicine</strong> - 
                      Focus on practical clinical applications across specialties, with special emphasis
                      on oncology applications where question frequency shows highest growth.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Create educational series on Microbiome Research</strong> - 
                      Target content for Spring/Summer months when interest peaks based on seasonal analysis.
                      Partner with gastroenterology specialists to develop comprehensive resources.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" paragraph>
                      <strong>Expand technology implementation resources</strong> - 
                      Based on projected growth trends, develop practical guides for AI integration 
                      and remote monitoring technologies in clinical practice.
                    </Typography>
                  </li>
                </ol>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Action Menus */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={handleExportReport}>
            <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export to PDF
          </MenuItem>
          <MenuItem onClick={handleActionMenuClose}>
            <FileDownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export to Excel
          </MenuItem>
          <MenuItem onClick={handleActionMenuClose}>
            <ShareIcon fontSize="small" sx={{ mr: 1 }} />
            Share Dashboard
          </MenuItem>
          <MenuItem onClick={handleActionMenuClose}>
            <PrintIcon fontSize="small" sx={{ mr: 1 }} />
            Print Report
          </MenuItem>
        </Menu>
      </Container>
    </DashboardContext.Provider>
  );
} 