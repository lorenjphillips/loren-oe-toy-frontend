/**
 * ExecutiveOverview Component
 * 
 * Provides a high-level strategic performance summary for pharma company executives.
 * Focuses on key strategic metrics and trends that influence decision making.
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  PriorityHigh as PriorityHighIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { DashboardContext, DashboardContextType } from '../DashboardLayout';
import executiveInsightsService, { 
  ExecutiveSummary, 
  StrategicKPI, 
  ExecutiveInsight
} from '../../../services/insights/executiveInsights';

export interface ExecutiveOverviewProps {
  companyId?: string;
}

interface KPI {
  label: string;
  value: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
}

interface KPICardProps {
  kpi: KPI;
  loading?: boolean;
}

const StrategicKPICard: React.FC<KPICardProps> = ({ kpi, loading = false }) => {
  const theme = useTheme();

  const trendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      default: return <TrendingFlatIcon color="info" />;
    }
  };

  const getChipColor = (trend: 'up' | 'down' | 'stable'): 'success' | 'error' | 'default' => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  const formatPercentChange = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={60} />
          <Skeleton variant="rectangular" width={80} height={24} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {kpi.label}
        </Typography>
        <Typography variant="h4" component="div" gutterBottom>
          {kpi.value.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            size="small" 
            icon={trendIcon(kpi.trend)} 
            label={formatPercentChange(kpi.percentChange)}
            color={getChipColor(kpi.trend)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            vs previous period
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Priority Insight Card
interface PriorityInsightCardProps {
  insight: ExecutiveInsight;
  loading?: boolean;
}

const PriorityInsightCard: React.FC<PriorityInsightCardProps> = ({
  insight,
  loading = false
}) => {
  // Impact indicator color
  const getImpactColor = () => {
    switch (insight.businessImpact) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardHeader
        title={
          loading ? 
            <Skeleton width="80%" height={25} /> : 
            <Typography variant="h6">{insight.title}</Typography>
        }
        subheader={
          loading ? 
            <Skeleton width="40%" height={20} /> : 
            <Chip 
              size="small" 
              label={`${insight.businessImpact} impact`} 
              color={getImpactColor() as any}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
        }
      />
      <CardContent>
        {loading ? (
          <>
            <Skeleton width="100%" height={20} />
            <Skeleton width="90%" height={20} />
            <Skeleton width="95%" height={20} />
          </>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary" paragraph>
              {insight.summary}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Potential Value: <Box component="span" sx={{ fontWeight: 'bold' }}>{insight.potentialValue}</Box>
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
              Recommended Actions:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {insight.recommendations.slice(0, 2).map((rec, index) => (
                <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5 }}>
                  {rec}
                </Typography>
              ))}
              {insight.recommendations.length > 2 && (
                <Typography variant="body2" color="primary">
                  +{insight.recommendations.length - 2} more actions...
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function ExecutiveOverview({ companyId }: ExecutiveOverviewProps) {
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [loading, setLoading] = useState(true);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { dateRange, filters } = dashboardContext;
        const effectiveCompanyId = companyId ?? dashboardContext.selectedCompany;
        
        if (!effectiveCompanyId) {
          setError('No company selected');
          return;
        }

        const summary = await executiveInsightsService.generateExecutiveInsights(
          effectiveCompanyId,
          dateRange,
          filters
        );
        
        setExecutiveSummary(summary);
      } catch (error) {
        console.error('Error fetching executive insights:', error);
        setError('Failed to fetch executive insights');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, dashboardContext.selectedCompany, companyId, dashboardContext.filters]);
  
  // Filter insights to show only high and critical impact
  const priorityInsights = executiveSummary?.insights.filter(
    insight => ['critical', 'high'].includes(insight.businessImpact)
  ) || [];
  
  // Map the strategic KPIs to our KPI interface
  const mappedKpis = executiveSummary?.strategicKPIs.map(kpi => ({
    label: kpi.name || 'Unnamed KPI',
    value: kpi.value,
    percentChange: kpi.percentChange,
    trend: kpi.trend
  })) || [];

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Executive Summary
        </Typography>
        
        {loading ? (
          <>
            <Skeleton width="90%" height={22} />
            <Skeleton width="95%" height={22} />
            <Skeleton width="85%" height={22} />
            <Skeleton width="92%" height={22} />
          </>
        ) : (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {executiveSummary?.executiveBrief}
          </Typography>
        )}
      </Paper>
      
      <Typography variant="h5" sx={{ mb: 3 }}>
        Strategic Performance
      </Typography>
      
      {error ? (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {loading ? (
            // Loading state
            Array(6).fill(0).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={`loading-${index}`}>
                <StrategicKPICard 
                  kpi={{
                    label: '',
                    value: 0,
                    percentChange: 0,
                    trend: 'stable'
                  }} 
                  loading={true} 
                />
              </Grid>
            ))
          ) : executiveSummary ? (
            // Mapped KPIs
            executiveSummary.strategicKPIs.map((kpi, index) => (
              <Grid item xs={12} sm={6} md={4} key={`kpi-${index}`}>
                <StrategicKPICard 
                  kpi={{
                    label: kpi.name || 'Unnamed KPI',
                    value: kpi.value,
                    percentChange: kpi.percentChange,
                    trend: kpi.trend
                  }}
                  loading={false}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography color="text.secondary">
                No data available
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
      
      <Typography variant="h5" sx={{ mb: 3 }}>
        Priority Insights
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          {loading ? (
            Array(2).fill(0).map((_, index) => (
              <PriorityInsightCard 
                key={index}
                insight={{
                  id: `loading-${index}`,
                  title: '',
                  summary: '',
                  detailedAnalysis: '',
                  businessImpact: 'high',
                  category: 'market_opportunity',
                  relatedMetrics: [],
                  timestamp: new Date(),
                  recommendations: [],
                  potentialValue: '',
                  timeToImplement: 'short_term',
                  confidenceScore: 0
                }} 
                loading={true} 
              />
            ))
          ) : (
            priorityInsights.map(insight => (
              <PriorityInsightCard key={insight.id} insight={insight} />
            ))
          )}
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardHeader title="Recommended Strategic Priorities" />
            <CardContent>
              {loading ? (
                Array(5).fill(0).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ mr: 1, width: 20 }}>
                      {index + 1}.
                    </Typography>
                    <Skeleton width="90%" height={24} />
                  </Box>
                ))
              ) : (
                executiveSummary?.recommendedPriorities.map((priority, index) => (
                  <Box key={index} sx={{ display: 'flex', mb: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ mr: 1, width: 20 }}>
                      {index + 1}.
                    </Typography>
                    <Typography variant="body1">{priority}</Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 