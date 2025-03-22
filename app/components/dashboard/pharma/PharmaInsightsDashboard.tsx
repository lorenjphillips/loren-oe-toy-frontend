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
  useMediaQuery,
  Paper,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  Business as BusinessIcon, 
  TrendingUp as TrendingUpIcon, 
  Search as SearchIcon, 
  CompareArrows as CompareArrowsIcon,
  DateRange as DateRangeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/x-date-pickers-pro';
import type { DateRange } from '@mui/x-date-pickers-pro';
import { Helmet } from 'react-helmet';
import DashboardLayout from '../DashboardLayout';
import { DashboardContext } from '../DashboardContext';
import { getPriorityCategories, PHARMA_COMPANIES, getAllCategories, getCompanyById } from '../../../data/pharmaCategories';
import type { PharmaCompany } from '../../../data/pharmaCategories';

interface PharmaInsightsDashboardProps {
  companyId: string;
  onBackClick?: () => void;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  onBackClick?: () => void;
}

export default function PharmaInsightsDashboard({ companyId, onBackClick }: PharmaInsightsDashboardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareCompanies, setCompareCompanies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    new Date(new Date().setMonth(new Date().getMonth() - 1)),
    new Date()
  ]);
  const [company, setCompany] = useState<PharmaCompany | null>(null);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setIsCompareMode(false);
  };
  
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
  
  const handleDateRangeChange = (newValue: DateRange<Date>) => {
    if (newValue[0] && newValue[1]) {
      setDateRange([newValue[0], newValue[1]]);
    }
  };
  
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const companyData = getCompanyById(companyId);
        if (companyData) {
          setCompany(companyData);
        }
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    };
    
    loadCompany();
  }, [companyId]);
  
  const filteredCompanies = PHARMA_COMPANIES.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !selectedCategory || 
      company.priorityCategories.includes(selectedCategory);
      
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>{company?.name || 'Company'} Insights Dashboard</title>
      </Helmet>
      
      <DashboardLayout title={`${company?.name || 'Company'} Insights`}>
        <Box sx={{ p: 3 }}>
          {/* Back button */}
          {onBackClick && (
            <IconButton 
              onClick={onBackClick}
              sx={{ mb: 2 }}
              aria-label="Back"
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          {/* Company header */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                {company?.logo_url ? (
                  <Avatar 
                    src={company.logo_url} 
                    alt={company.name}
                    sx={{ width: 64, height: 64 }}
                  />
                ) : (
                  <Avatar sx={{ width: 64, height: 64, bgcolor: theme.palette.primary.main }}>
                    {company?.name?.substring(0, 1)}
                  </Avatar>
                )}
              </Grid>
              <Grid item xs>
                <Typography variant="h4" component="h1" gutterBottom>
                  {company?.name || 'Company'} Insights
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Comprehensive analytics and insights for {company?.name || 'your company'}
                </Typography>
              </Grid>
              <Grid item>
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  localeText={{ start: 'Start Date', end: 'End Date' }}
                />
              </Grid>
            </Grid>
          </Paper>
          
          {/* Rest of the dashboard content */}
        </Box>
      </DashboardLayout>
    </>
  );
} 