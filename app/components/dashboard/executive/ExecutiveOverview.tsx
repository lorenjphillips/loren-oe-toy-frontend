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
  Typography
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

// Strategic KPI Card component
interface StrategicKpiCardProps {
  kpi: StrategicKPI;
  loading?: boolean;
}

const StrategicKpiCard: React.FC<StrategicKpiCardProps> = ({ 
  kpi, 
  loading = false
}) => {
  // Format the value based on its format type
  const formattedValue = () => {
    if (loading) return <Skeleton width={60} height={40} />;
    
    switch (kpi.format) {
      case 'percentage':
        return `${kpi.value.toFixed(1)}%`;
      case 'currency':
        return `$${kpi.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
      case 'time':
        // Format time in hours:minutes
        const hours = Math.floor(kpi.value / 60);
        const minutes = Math.floor(kpi.value % 60);
        return `${hours}h ${minutes}m`;
      default:
        return kpi.value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    }
  };
  
  // Significance indicator
  const significanceIcon = () => {
    if (loading) return <Skeleton variant="circular" width={24} height={24} />;
    
    switch (kpi.significance) {
      case 'critical':
        return <PriorityHighIcon color="error" />;
      case 'important':
        return <WarningIcon color="warning" />;
      case 'monitor':
        return <CheckCircleIcon color="success" />;
      default:
        return null;
    }
  };
  
  // Trend indicator
  const trendIcon = () => {
    if (loading) return <Skeleton variant="circular" width={24} height={24} />;
    
    switch (kpi.trend) {
      case 'up':
        return <TrendingUpIcon color={kpi.percentChange > 0 ? "success" : "error"} />;
      case 'down':
        return <TrendingDownIcon color={kpi.percentChange < 0 ? "error" : "success"} />;
      case 'stable':
        return <TrendingFlatIcon color="info" />;
      default:
        return null;
    }
  };
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            {significanceIcon()}
            <Box component="span" sx={{ ml: 0.5 }}>{kpi.name}</Box>
          </Typography>
        </Box>
        
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'medium' }}>
          {formattedValue()}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Chip 
            size="small" 
            icon={trendIcon()} 
            label={`${kpi.percentChange > 0 ? '+' : ''}${kpi.percentChange.toFixed(1)}%`}
            color={kpi.percentChange >= 0 ? 'success' : 'error'}
            sx={{ height: 24 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            vs previous period
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Benchmark Comparison
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="body2">
              {loading ? 
                <Skeleton width={30} /> : 
                `${kpi.benchmarkComparison > 0 ? '+' : ''}${kpi.benchmarkComparison.toFixed(1)}%`
              }
            </Typography>
            <Box sx={{ ml: 1, flexGrow: 1 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={8} />
              ) : (
                <LinearProgress 
                  variant="determinate" 
                  value={50 + (kpi.benchmarkComparison * 2)} 
                  color={kpi.benchmarkComparison >= 0 ? "success" : "error"}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              )}
            </Box>
          </Box>
        </Box>
        
        <Tooltip title={kpi.description} arrow>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, cursor: 'help' }}>
            {kpi.description.substring(0, 60)}...
          </Typography>
        </Tooltip>
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
      } catch (error) {
        console.error('Error fetching executive insights:', error);
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
        Strategic Performance Indicators
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading ? (
          Array(6).fill(0).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StrategicKpiCard 
                kpi={{
                  id: `loading-${index}`,
                  name: '',
                  value: 0,
                  format: 'number',
                  trend: 'stable',
                  percentChange: 0,
                  benchmarkComparison: 0,
                  significance: 'monitor',
                  description: ''
                }} 
                loading={true} 
              />
            </Grid>
          ))
        ) : (
          executiveSummary?.strategicKPIs.map(kpi => (
            <Grid item xs={12} sm={6} md={4} key={kpi.id}>
              <StrategicKpiCard kpi={kpi} />
            </Grid>
          ))
        )}
      </Grid>
      
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