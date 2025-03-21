/**
 * MetricsOverview Component
 * 
 * Displays a high-level summary of key performance indicators
 * for the pharma insights dashboard.
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Skeleton, 
  Typography, 
  Chip,
  Tooltip,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  Visibility as VisibilityIcon,
  TouchApp as TouchAppIcon,
  TrendingUp as TrendingUpIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { DashboardContext, DashboardContextType } from './DashboardLayout';
import { getDashboardMetrics } from '../../services/dashboardData';
import { AggregateImpressionMetrics } from '../../models/analytics/ImpressionMetrics';
import { AggregateEngagementMetrics } from '../../models/analytics/EngagementMetrics';

export interface MetricsOverviewProps {
  companyId?: string;
  category?: string;
}

// KPI Card component
interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  changePercentage?: number;
  tooltip?: string;
  loading?: boolean;
  color?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ 
  title, 
  value, 
  icon, 
  changePercentage, 
  tooltip,
  loading = false,
  color = 'primary.main'
}) => {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Box sx={{ color }}>
            {icon}
          </Box>
        </Box>
        
        {loading ? (
          <Skeleton variant="rectangular" width="80%" height={40} />
        ) : (
          <Tooltip title={tooltip || ''}>
            <Typography variant="h4" sx={{ fontWeight: 'medium', mb: 1 }}>
              {value}
            </Typography>
          </Tooltip>
        )}
        
        {changePercentage !== undefined && !loading && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              size="small" 
              icon={<TrendingUpIcon />} 
              label={`${changePercentage > 0 ? '+' : ''}${changePercentage}%`} 
              color={changePercentage >= 0 ? 'success' : 'error'}
              sx={{ height: 24 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default function MetricsOverview({ companyId, category }: MetricsOverviewProps) {
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    impressions: AggregateImpressionMetrics | null;
    engagements: AggregateEngagementMetrics | null;
  }>({
    impressions: null,
    engagements: null
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { dateRange, filters } = dashboardContext;
        const data = await getDashboardMetrics({
          dateRange,
          companyId: companyId || dashboardContext.selectedCompany,
          category,
          ...filters
        });
        
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, dashboardContext.selectedCompany, companyId, category, dashboardContext.filters]);
  
  // Format large numbers with abbreviations
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };
  
  // Format time durations
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
  };
  
  // Aggregated metrics for display
  const impressionCount = metrics.impressions?.totalImpressions || 0;
  const engagementCount = metrics.engagements?.totalEngagements || 0;
  const engagementRate = metrics.impressions ? 
    (engagementCount / impressionCount) * 100 : 0;
  const averageEngagementTime = metrics.engagements?.averageEngagementTimeMs || 0;
  const viewabilityRate = metrics.impressions?.viewabilityRate || 0;
  const conversionRate = metrics.engagements?.conversionRate || 0;
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Performance Summary
      </Typography>
      
      {/* Top-level KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Impressions" 
            value={formatNumber(impressionCount)} 
            icon={<VisibilityIcon />}
            changePercentage={5.2}
            tooltip={`Total ad impressions: ${impressionCount.toLocaleString()}`} 
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Engagement Rate" 
            value={`${engagementRate.toFixed(1)}%`} 
            icon={<TouchAppIcon />}
            changePercentage={3.8}
            tooltip="Percentage of impressions that resulted in engagement" 
            loading={loading}
            color="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Avg Engagement Time" 
            value={formatDuration(averageEngagementTime)} 
            icon={<TimerIcon />}
            changePercentage={-1.4}
            tooltip="Average time users spend engaging with content" 
            loading={loading}
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Conversion Rate" 
            value={`${conversionRate.toFixed(2)}%`} 
            icon={<BarChartIcon />}
            changePercentage={7.5}
            tooltip="Percentage of engagements resulting in conversions" 
            loading={loading}
            color="success.main"
          />
        </Grid>
      </Grid>
      
      {/* Secondary metrics */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Quality Metrics
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Viewability Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="h6">
                      {loading ? 
                        <Skeleton width={60} /> : 
                        `${(viewabilityRate * 100).toFixed(1)}%`
                      }
                    </Typography>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      {loading ? (
                        <Skeleton variant="rectangular" height={10} />
                      ) : (
                        <LinearProgress 
                          variant="determinate" 
                          value={viewabilityRate * 100} 
                          color="success"
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Impression Quality Distribution
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" height={50} sx={{ mt: 1 }} />
                  ) : (
                    <Stack 
                      direction="row" 
                      spacing={1} 
                      sx={{ mt: 1 }}
                    >
                      <Tooltip title="Premium quality impressions">
                        <Chip 
                          size="small" 
                          label={`Premium: ${metrics.impressions?.qualityDistribution.premium || 0}%`} 
                          color="success"
                        />
                      </Tooltip>
                      <Tooltip title="Standard quality impressions">
                        <Chip 
                          size="small" 
                          label={`Standard: ${metrics.impressions?.qualityDistribution.standard || 0}%`} 
                          color="info"
                        />
                      </Tooltip>
                      <Tooltip title="Minimal quality impressions">
                        <Chip 
                          size="small" 
                          label={`Minimal: ${metrics.impressions?.qualityDistribution.minimal || 0}%`} 
                          color="warning"
                        />
                      </Tooltip>
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Engagement Completion Rates
                  </Typography>
                  {loading ? (
                    <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ width: 120 }}>
                          Microsimulation
                        </Typography>
                        <Box sx={{ flexGrow: 1, ml: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={metrics.engagements?.completionRates.microsimulation ?? 0 * 100} 
                            color="primary"
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ ml: 2, width: 40 }}>
                          {metrics.engagements ? 
                            `${(metrics.engagements.completionRates.microsimulation * 100).toFixed(0)}%` : '0%'
                          }
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ width: 120 }}>
                          Knowledge Graph
                        </Typography>
                        <Box sx={{ flexGrow: 1, ml: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={metrics.engagements?.completionRates.knowledgeGraph ?? 0 * 100} 
                            color="secondary"
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ ml: 2, width: 40 }}>
                          {metrics.engagements ? 
                            `${(metrics.engagements.completionRates.knowledgeGraph * 100).toFixed(0)}%` : '0%'
                          }
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ width: 120 }}>
                          Video
                        </Typography>
                        <Box sx={{ flexGrow: 1, ml: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={metrics.engagements?.completionRates.video ?? 0 * 100} 
                            color="info"
                            sx={{ height: 8, borderRadius: 5 }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ ml: 2, width: 40 }}>
                          {metrics.engagements ? 
                            `${(metrics.engagements.completionRates.video * 100).toFixed(0)}%` : '0%'
                          }
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 