/**
 * CompetitivePosition Component
 * 
 * Displays anonymized competitive benchmarking data for pharma executives.
 * Visualizes competitive landscape while maintaining confidentiality.
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Tab,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CompareArrows as CompareArrowsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DashboardContext, DashboardContextType } from '../DashboardLayout';
import executiveInsightsService, { 
  CompetitivePosition as CompetitivePositionData,
  ExecutiveSummary
} from '../../../services/insights/executiveInsights';

export interface CompetitivePositionProps {
  companyId?: string;
}

// Competitive Position Card
interface CompetitiveCardProps {
  competitor: CompetitivePositionData;
  loading?: boolean;
}

const CompetitiveCard: React.FC<CompetitiveCardProps> = ({
  competitor,
  loading = false
}) => {
  const getTrendIcon = () => {
    switch (competitor.marketShareTrend) {
      case 'growing':
        return <ArrowUpwardIcon color="success" fontSize="small" />;
      case 'declining':
        return <ArrowDownwardIcon color="error" fontSize="small" />;
      case 'stable':
        return <RemoveIcon color="info" fontSize="small" />;
      default:
        return null;
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 3, height: '100%' }}>
      <CardHeader
        title={
          loading ? 
            <Skeleton width="80%" height={28} /> : 
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6">
                {competitor.anonymizedCompetitor}
              </Typography>
              <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                {getTrendIcon()}
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  {competitor.marketShareTrend}
                </Typography>
              </Box>
            </Box>
        }
        subheader={
          loading ? 
            <Skeleton width="40%" height={20} /> : 
            <Typography variant="subtitle2" color="text.secondary">
              {competitor.category}
            </Typography>
        }
      />
      <CardContent>
        {loading ? (
          <>
            <Skeleton width="100%" height={25} />
            <Skeleton width="100%" height={60} sx={{ my: 2 }} />
            <Skeleton width="100%" height={120} />
          </>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Relative Strength: {(competitor.relativeStrength * 100).toFixed(0)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={competitor.relativeStrength * 100}
                sx={{ 
                  height: 8, 
                  borderRadius: 5,
                  backgroundColor: 'grey.200'
                }}
              />
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Engagement Comparison
            </Typography>
            <Box sx={{ display: 'flex', mb: 3 }}>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Us
                </Typography>
                <Box sx={{ 
                  height: 24, 
                  bgcolor: 'primary.main', 
                  width: `${(competitor.engagementComparison.us / Math.max(
                    competitor.engagementComparison.us,
                    competitor.engagementComparison.competitor,
                    competitor.engagementComparison.industryAverage
                  )) * 100}%`,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="caption" color="white" sx={{ fontSize: '0.65rem' }}>
                    {competitor.engagementComparison.us.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, px: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Competitor
                </Typography>
                <Box sx={{ 
                  height: 24, 
                  bgcolor: 'warning.main', 
                  width: `${(competitor.engagementComparison.competitor / Math.max(
                    competitor.engagementComparison.us,
                    competitor.engagementComparison.competitor,
                    competitor.engagementComparison.industryAverage
                  )) * 100}%`,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="caption" color="white" sx={{ fontSize: '0.65rem' }}>
                    {competitor.engagementComparison.competitor.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: 1, pl: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Industry Avg
                </Typography>
                <Box sx={{ 
                  height: 24, 
                  bgcolor: 'info.main', 
                  width: `${(competitor.engagementComparison.industryAverage / Math.max(
                    competitor.engagementComparison.us,
                    competitor.engagementComparison.competitor,
                    competitor.engagementComparison.industryAverage
                  )) * 100}%`,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="caption" color="white" sx={{ fontSize: '0.65rem' }}>
                    {competitor.engagementComparison.industryAverage.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
                  Key Differentiators
                </Typography>
                <List dense disablePadding>
                  {competitor.keyDifferentiators.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
                  Vulnerabilities
                </Typography>
                <List dense disablePadding>
                  {competitor.vulnerabilities.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <ErrorIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
                  Recommended Actions
                </Typography>
                <List dense disablePadding>
                  {competitor.recommendedActions.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <InfoIcon color="info" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item} 
                        primaryTypographyProps={{ variant: 'body2' }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Summary Metrics
interface SummaryMetricProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const SummaryMetric: React.FC<SummaryMetricProps> = ({
  title,
  value,
  icon,
  loading = false
}) => {
  return (
    <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 2, color: 'primary.main' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={80} height={24} />
        ) : (
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default function CompetitivePosition({ companyId }: CompetitivePositionProps) {
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [loading, setLoading] = useState(true);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { dateRange, filters } = dashboardContext;
        const summary = await executiveInsightsService.generateExecutiveInsights(
          companyId || dashboardContext.selectedCompany,
          dateRange,
          filters
        );
        
        setExecutiveSummary(summary);
        
        // Set first category as default if available
        if (summary.competitivePosition.length > 0) {
          setActiveCategory(summary.competitivePosition[0].category);
        }
      } catch (error) {
        console.error('Error fetching competitive data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, dashboardContext.selectedCompany, companyId, dashboardContext.filters]);
  
  // Get unique categories
  const categories = executiveSummary
    ? Array.from(new Set(executiveSummary.competitivePosition.map(cp => cp.category)))
    : [];
  
  // Filter competitors by selected category
  const filteredCompetitors = executiveSummary
    ? activeCategory === 'all'
      ? executiveSummary.competitivePosition
      : executiveSummary.competitivePosition.filter(cp => cp.category === activeCategory)
    : [];
  
  const handleCategoryChange = (event: React.SyntheticEvent, newCategory: string) => {
    if (newCategory) {
      setActiveCategory(newCategory);
    }
  };
  
  // Calculate competitive summary
  const getCompetitiveSummary = () => {
    if (!executiveSummary || !executiveSummary.competitivePosition.length) {
      return {
        totalCompetitors: 0,
        leadingCategories: 0,
        averageStrength: 0,
        riskCategories: 0
      };
    }
    
    const competitors = executiveSummary.competitivePosition;
    
    // Group by category to find where we're leading
    const categorySummary = categories.map(category => {
      const categoryCompetitors = competitors.filter(cp => cp.category === category);
      
      // Calculate our position
      const ourPosition = categoryCompetitors.reduce((position, comp) => {
        if (comp.engagementComparison.us > comp.engagementComparison.competitor) {
          position.leadingCount++;
        } else {
          position.trailingCount++;
        }
        return position;
      }, { leadingCount: 0, trailingCount: 0 });
      
      // Determine if we're leading in this category
      return {
        category,
        isLeading: ourPosition.leadingCount > ourPosition.trailingCount,
        isRisk: ourPosition.trailingCount > ourPosition.leadingCount
      };
    });
    
    return {
      totalCompetitors: competitors.length,
      leadingCategories: categorySummary.filter(cs => cs.isLeading).length,
      averageStrength: competitors.reduce((sum, comp) => sum + comp.relativeStrength, 0) / competitors.length,
      riskCategories: categorySummary.filter(cs => cs.isRisk).length
    };
  };
  
  const competitiveSummary = getCompetitiveSummary();
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Competitive Position Analysis
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <SummaryMetric 
                title="Competitors Analyzed"
                value={loading ? "—" : competitiveSummary.totalCompetitors.toString()}
                icon={<CompareArrowsIcon />}
                loading={loading}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <SummaryMetric 
                title="Leading Categories"
                value={loading ? "—" : competitiveSummary.leadingCategories.toString()}
                icon={<CheckCircleIcon color="success" />}
                loading={loading}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <SummaryMetric 
                title="Avg. Relative Strength"
                value={loading ? "—" : `${(competitiveSummary.averageStrength * 100).toFixed(0)}%`}
                icon={<InfoIcon color="info" />}
                loading={loading}
              />
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <SummaryMetric 
                title="At-Risk Categories"
                value={loading ? "—" : competitiveSummary.riskCategories.toString()}
                icon={<WarningIcon color="warning" />}
                loading={loading}
              />
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Categories" value="all" />
            {categories.map(category => (
              <Tab label={category} value={category} key={category} />
            ))}
          </Tabs>
        </Box>
        
        <Grid container spacing={3}>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <Grid item xs={12} key={index}>
                <CompetitiveCard 
                  competitor={{
                    id: `loading-${index}`,
                    anonymizedCompetitor: '',
                    category: '',
                    relativeStrength: 0,
                    keyDifferentiators: [],
                    vulnerabilities: [],
                    recommendedActions: [],
                    marketShareTrend: 'stable',
                    engagementComparison: {
                      us: 0,
                      competitor: 0,
                      industryAverage: 0
                    }
                  }}
                  loading={true} 
                />
              </Grid>
            ))
          ) : (
            filteredCompetitors.length > 0 ? (
              filteredCompetitors.map(competitor => (
                <Grid item xs={12} key={competitor.id}>
                  <CompetitiveCard competitor={competitor} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No competitive data available for the selected category.
                </Typography>
              </Grid>
            )
          )}
        </Grid>
      </Paper>
      
      <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
        * Competitor identities have been anonymized for compliance with competitive intelligence guidelines.
        All data is presented for strategic planning purposes only.
      </Typography>
    </Box>
  );
} 