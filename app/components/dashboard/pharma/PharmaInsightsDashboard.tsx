/**
 * Pharma Insights Dashboard Index
 *
 * Main container component for the pharma insights dashboard.
 * This serves as the entry point and provides company selection, 
 * comparison tools, and the dashboard context provider.
 */
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Divider, 
  Box, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Business as BusinessIcon, 
  TrendingUp as TrendingUpIcon, 
  Search as SearchIcon, 
  CompareArrows as CompareArrowsIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DateRangePicker, DateRange } from '@mui/lab';
import { Helmet } from 'react-helmet';

import { DashboardProvider } from '../DashboardContext';
import DashboardLayout from '../DashboardLayout';
import PharmaCompanyDashboard from './PharmaCompanyDashboard';
import { getPriorityCategories, PHARMA_COMPANIES, getAllCategories } from '../../../data/pharmaCategories';

// Function to get date range for "Last 30 days"
const getLast30Days = (): [Date, Date] => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return [start, end];
};

// Function to get date range for "Last quarter"
const getLastQuarter = (): [Date, Date] => {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - 3);
  return [start, end];
};

// Date range options
const DATE_RANGE_OPTIONS = [
  { id: 'last_30_days', name: 'Last 30 Days', range: getLast30Days() },
  { id: 'last_quarter', name: 'Last Quarter', range: getLastQuarter() },
  { id: 'ytd', name: 'Year to Date', range: [new Date(new Date().getFullYear(), 0, 1), new Date()] },
  { id: 'custom', name: 'Custom Range', range: getLast30Days() }
];

/**
 * Main pharma insights dashboard component
 */
const PharmaInsightsDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for active company
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareCompanies, setCompareCompanies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for date range
  const [dateRangeOption, setDateRangeOption] = useState<string>('last_30_days');
  const [customDateRange, setCustomDateRange] = useState<DateRange<Date>>([
    null,
    null
  ]);
  const [effectiveDateRange, setEffectiveDateRange] = useState<[Date, Date]>(getLast30Days());
  
  // State for category filter
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Function to handle company selection
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsCompareMode(false);
  };
  
  // Function to toggle company for comparison
  const handleToggleCompare = (companyId: string) => {
    setCompareCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else if (prev.length < 4) {
        return [...prev, companyId];
      }
      return prev;
    });
  };
  
  // Function to handle date range option change
  const handleDateRangeChange = (option: string) => {
    setDateRangeOption(option);
    
    if (option !== 'custom') {
      const selectedOption = DATE_RANGE_OPTIONS.find(o => o.id === option);
      if (selectedOption) {
        setEffectiveDateRange(selectedOption.range);
      }
    } else {
      if (customDateRange[0] && customDateRange[1]) {
        setEffectiveDateRange([customDateRange[0], customDateRange[1]]);
      }
    }
  };
  
  // Handle custom date range changes
  useEffect(() => {
    if (dateRangeOption === 'custom' && customDateRange[0] && customDateRange[1]) {
      setEffectiveDateRange([customDateRange[0], customDateRange[1]]);
    }
  }, [customDateRange, dateRangeOption]);
  
  // Filter companies based on search
  const filteredCompanies = PHARMA_COMPANIES.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !selectedCategory || 
      company.priorityCategories.includes(selectedCategory);
      
    return matchesSearch && matchesCategory;
  });
  
  // Render dashboard or company selection
  return (
    <DashboardProvider dateRange={effectiveDateRange} selectedCompanyId={selectedCompanyId} companyIds={compareCompanies}>
      <Helmet>
        <title>{selectedCompanyId ? `${PHARMA_COMPANIES.find(c => c.id === selectedCompanyId)?.name} Insights` : 'Pharma Insights Dashboard'}</title>
      </Helmet>
      
      <DashboardLayout 
        title="Pharma Insights Dashboard" 
        onBackClick={selectedCompanyId ? () => setSelectedCompanyId(null) : undefined}
      >
        {selectedCompanyId ? (
          <PharmaCompanyDashboard companyId={selectedCompanyId} />
        ) : isCompareMode ? (
          <Box>
            <Typography variant="h5" sx={{ mb: 3 }}>Compare Companies</Typography>
            
            {/* Company comparison section will go here */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>Selected Companies:</Typography>
                {compareCompanies.length === 0 ? (
                  <Typography color="text.secondary">Select up to 4 companies to compare</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {compareCompanies.map(id => {
                      const company = PHARMA_COMPANIES.find(c => c.id === id);
                      return company ? (
                        <Chip 
                          key={id}
                          label={company.name}
                          onDelete={() => handleToggleCompare(id)}
                          sx={{ 
                            bgcolor: company.primaryColor,
                            color: '#fff',
                            fontWeight: 500
                          }}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              </Box>
              
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={() => setIsCompareMode(false)}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              
              <Button 
                variant="contained" 
                color="primary"
                disabled={compareCompanies.length < 2}
                onClick={() => {/* TODO: Navigate to comparison view */}}
              >
                Compare Selected Companies
              </Button>
            </Box>
            
            {/* Companies grid for selection */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {filteredCompanies.map(company => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <Card 
                    sx={{ 
                      border: compareCompanies.includes(company.id) ? `2px solid ${company.primaryColor}` : 'none',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          component="img"
                          src={company.logo || '/assets/logos/default.svg'}
                          alt={company.name}
                          sx={{ 
                            height: 40, 
                            width: 'auto',
                            maxWidth: 140,
                            mr: 2
                          }}
                        />
                      </Box>
                      
                      <Typography variant="subtitle1" color="text.secondary">
                        Priority Categories:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {getPriorityCategories(company.id).map(category => (
                          <Chip 
                            key={category.id}
                            label={category.displayName}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {company.description}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant={compareCompanies.includes(company.id) ? "contained" : "outlined"}
                        color="primary"
                        fullWidth
                        onClick={() => handleToggleCompare(company.id)}
                      >
                        {compareCompanies.includes(company.id) ? "Selected" : "Select for Comparison"}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box>
            {/* Dashboard header */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom={isMobile}>
                Pharmaceutical Company Insights
              </Typography>
              
              <Box sx={{ display: 'flex', mt: isMobile ? 2 : 0 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<CompareArrowsIcon />}
                  onClick={() => setIsCompareMode(true)}
                  sx={{ mr: 2 }}
                >
                  Compare
                </Button>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel id="date-range-select-label">Date Range</InputLabel>
                  <Select
                    labelId="date-range-select-label"
                    value={dateRangeOption}
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                    label="Date Range"
                  >
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            {/* Custom date picker that shows when custom is selected */}
            {dateRangeOption === 'custom' && (
              <Box sx={{ mb: 3 }}>
                <DateRangePicker
                  startText="Start Date"
                  endText="End Date"
                  value={customDateRange}
                  onChange={(newValue) => setCustomDateRange(newValue)}
                  renderInput={(startProps, endProps) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField {...startProps} size="small" />
                      <Box sx={{ mx: 2 }}>to</Box>
                      <TextField {...endProps} size="small" />
                    </Box>
                  )}
                />
              </Box>
            )}
            
            {/* Filters */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
              <TextField
                label="Search Companies"
                variant="outlined"
                size="small"
                fullWidth={isMobile}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1 }}
              />
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="category-select-label">Filter by Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value === '' ? null : e.target.value)}
                  label="Filter by Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {getAllCategories().map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            {/* Company cards grid */}
            <Typography variant="h6" sx={{ mb: 3 }}>
              Select a company to view detailed performance insights
            </Typography>
            
            <Grid container spacing={3}>
              {filteredCompanies.map(company => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 6
                      }
                    }}
                    onClick={() => handleCompanySelect(company.id)}
                  >
                    <Box 
                      sx={{ 
                        height: 8, 
                        bgcolor: company.primaryColor 
                      }} 
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box 
                          component="img"
                          src={company.logo || '/assets/logos/default.svg'}
                          alt={company.name}
                          sx={{ 
                            height: 40, 
                            width: 'auto',
                            maxWidth: 140,
                            mr: 2
                          }}
                        />
                        <Typography variant="h6" component="h2">
                          {company.name}
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="subtitle2" color="text.secondary">
                        Focus Areas:
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {getPriorityCategories(company.id).map(category => (
                          <Chip 
                            key={category.id}
                            label={category.displayName}
                            size="small"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {company.description}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        variant="contained" 
                        color="primary"
                        fullWidth
                        startIcon={<TrendingUpIcon />}
                      >
                        View Insights
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DashboardLayout>
    </DashboardProvider>
  );
};

export default PharmaInsightsDashboard; 