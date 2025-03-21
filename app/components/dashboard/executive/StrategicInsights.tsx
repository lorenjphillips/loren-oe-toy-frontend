/**
 * StrategicInsights Component
 * 
 * Provides key business intelligence findings for pharma decision makers.
 * Focuses on actionable insights derived from data analysis.
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
  IconButton,
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
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  ShowChart as ShowChartIcon,
  CompareArrows as CompareArrowsIcon,
  BarChart as BarChartIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { DashboardContext, DashboardContextType } from '../DashboardLayout';
import executiveInsightsService, { 
  ExecutiveInsight,
  ExecutiveSummary,
  MarketOpportunity
} from '../../../services/insights/executiveInsights';

export interface StrategicInsightsProps {
  companyId?: string;
}

// Category tab panel
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`insight-tabpanel-${index}`}
      aria-labelledby={`insight-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Insight Detail Card
interface InsightDetailCardProps {
  insight: ExecutiveInsight;
  loading?: boolean;
}

const InsightDetailCard: React.FC<InsightDetailCardProps> = ({
  insight,
  loading = false
}) => {
  const getCategoryIcon = () => {
    switch (insight.category) {
      case 'market_opportunity':
        return <TrendingUpIcon color="success" />;
      case 'competitive_intelligence':
        return <CompareArrowsIcon color="info" />;
      case 'performance_anomaly':
        return <ShowChartIcon color="error" />;
      case 'strategic_recommendation':
        return <LightbulbIcon color="warning" />;
      default:
        return <InfoIcon />;
    }
  };
  
  const getImpactColor = () => {
    switch (insight.businessImpact) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  
  const getTimeToImplementColor = () => {
    switch (insight.timeToImplement) {
      case 'immediate': return 'error';
      case 'short_term': return 'warning';
      case 'mid_term': return 'info';
      case 'long_term': return 'success';
      default: return 'default';
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader 
        title={
          loading ? 
            <Skeleton width="80%" height={28} /> : 
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getCategoryIcon()}
              <Typography variant="h6" sx={{ ml: 1 }}>
                {insight.title}
              </Typography>
            </Box>
        }
        subheader={
          loading ? 
            <Skeleton width="40%" height={20} /> : 
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                size="small" 
                label={`${insight.businessImpact} impact`} 
                color={getImpactColor() as any}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
              <Chip 
                size="small" 
                label={`${insight.timeToImplement}`} 
                color={getTimeToImplementColor() as any}
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
              <Chip 
                size="small" 
                label={`${(insight.confidenceScore * 100).toFixed(0)}% confidence`} 
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            </Box>
        }
      />
      <CardContent>
        {loading ? (
          <>
            <Skeleton width="100%" height={60} />
            <Skeleton width="95%" height={20} sx={{ mt: 2 }} />
            <Skeleton width="90%" height={20} />
            <Skeleton width="80%" height={20} />
          </>
        ) : (
          <>
            <Typography variant="body2" paragraph>
              {insight.summary}
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              {insight.detailedAnalysis}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Potential Value:</strong> {insight.potentialValue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Related Metrics:</strong> {insight.relatedMetrics.join(', ')}
              </Typography>
            </Box>
            
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Recommended Actions:
            </Typography>
            <List dense disablePadding>
              {insight.recommendations.map((rec, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <InfoIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Market Opportunity Card
interface OpportunityCardProps {
  opportunity: MarketOpportunity;
  loading?: boolean;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  loading = false
}) => {
  const getROIGradient = (min: number, expected: number, max: number) => {
    return `linear-gradient(90deg, 
      rgba(255,152,0,0.2) ${min * 10}%, 
      rgba(255,152,0,0.5) ${expected * 10}%, 
      rgba(255,152,0,0.2) ${max * 10}%)`;
  };
  
  const getComplexityColor = () => {
    switch (opportunity.implementationComplexity) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };
  
  const getAdvantageColor = () => {
    switch (opportunity.competitiveAdvantage) {
      case 'strong': return 'success';
      case 'moderate': return 'info';
      case 'limited': return 'warning';
      default: return 'default';
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardHeader
        title={
          loading ? 
            <Skeleton width="80%" height={28} /> : 
            <Typography variant="h6">{opportunity.title}</Typography>
        }
        subheader={
          loading ? 
            <Skeleton width="40%" height={20} /> : 
            <Typography variant="subtitle2" color="text.secondary">
              {opportunity.medicalCategory}
            </Typography>
        }
        action={
          <IconButton>
            <LaunchIcon />
          </IconButton>
        }
      />
      <CardContent>
        {loading ? (
          <>
            <Skeleton width="100%" height={60} />
            <Skeleton width="100%" height={40} sx={{ mt: 2 }} />
            <Skeleton width="100%" height={40} />
          </>
        ) : (
          <>
            <Typography variant="body2" paragraph>
              {opportunity.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                Estimated ROI: {opportunity.estimatedROI.expected.toFixed(1)}x
              </Typography>
              <Box
                sx={{
                  height: 8,
                  width: '100%',
                  borderRadius: 5,
                  background: getROIGradient(
                    opportunity.estimatedROI.min,
                    opportunity.estimatedROI.expected,
                    opportunity.estimatedROI.max
                  ),
                  mt: 1,
                  position: 'relative'
                }}
              >
                <Tooltip title={`Expected: ${opportunity.estimatedROI.expected.toFixed(1)}x`}>
                  <Box
                    sx={{
                      position: 'absolute',
                      height: 16,
                      width: 16,
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                      border: '2px solid white',
                      top: -4,
                      left: `${opportunity.estimatedROI.expected * 10}%`,
                      transform: 'translateX(-50%)',
                      zIndex: 1
                    }}
                  />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">
                  Min: {opportunity.estimatedROI.min.toFixed(1)}x
                </Typography>
                <Typography variant="caption">
                  Max: {opportunity.estimatedROI.max.toFixed(1)}x
                </Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Complexity
                </Typography>
                <Chip 
                  size="small" 
                  label={opportunity.implementationComplexity} 
                  color={getComplexityColor() as any}
                  sx={{ display: 'block', mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Time to Market
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'medium', mt: 0.5 }}>
                  {opportunity.timeToMarket} weeks
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Competitive Advantage
                </Typography>
                <Chip 
                  size="small" 
                  label={opportunity.competitiveAdvantage} 
                  color={getAdvantageColor() as any}
                  sx={{ display: 'block', mt: 0.5 }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Target Audience
                </Typography>
                <List dense disablePadding>
                  {opportunity.targetAudience.map((audience, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <Typography variant="body2">{audience}</Typography>
                    </ListItem>
                  ))}
                </List>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Required Resources
                </Typography>
                <List dense disablePadding>
                  {opportunity.requiredResources.slice(0, 3).map((resource, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <Typography variant="body2">{resource}</Typography>
                    </ListItem>
                  ))}
                  {opportunity.requiredResources.length > 3 && (
                    <ListItem sx={{ py: 0 }}>
                      <Typography variant="body2" color="primary">
                        +{opportunity.requiredResources.length - 3} more...
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default function StrategicInsights({ companyId }: StrategicInsightsProps) {
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [loading, setLoading] = useState(true);
  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
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
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Group insights by category
  const marketOpportunities = executiveSummary?.insights.filter(
    insight => insight.category === 'market_opportunity'
  ) || [];
  
  const competitiveInsights = executiveSummary?.insights.filter(
    insight => insight.category === 'competitive_intelligence'
  ) || [];
  
  const performanceAnomalies = executiveSummary?.insights.filter(
    insight => insight.category === 'performance_anomaly'
  ) || [];
  
  const strategicRecommendations = executiveSummary?.insights.filter(
    insight => insight.category === 'strategic_recommendation'
  ) || [];
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Strategic Insights
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Market Opportunities" 
            icon={<TrendingUpIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Competitive Intelligence" 
            icon={<CompareArrowsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Performance Anomalies" 
            icon={<ShowChartIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Strategic Recommendations" 
            icon={<LightbulbIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Growth Opportunities" 
            icon={<BarChartIcon />} 
            iconPosition="start" 
          />
        </Tabs>
        
        {/* Market Opportunities Tab */}
        <TabPanel value={activeTab} index={0}>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <InsightDetailCard 
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
            marketOpportunities.length > 0 ? (
              marketOpportunities.map(insight => (
                <InsightDetailCard key={insight.id} insight={insight} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No market opportunity insights available for the selected time period.
              </Typography>
            )
          )}
        </TabPanel>
        
        {/* Competitive Intelligence Tab */}
        <TabPanel value={activeTab} index={1}>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <InsightDetailCard 
                key={index}
                insight={{
                  id: `loading-${index}`,
                  title: '',
                  summary: '',
                  detailedAnalysis: '',
                  businessImpact: 'high',
                  category: 'competitive_intelligence',
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
            competitiveInsights.length > 0 ? (
              competitiveInsights.map(insight => (
                <InsightDetailCard key={insight.id} insight={insight} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No competitive intelligence insights available for the selected time period.
              </Typography>
            )
          )}
        </TabPanel>
        
        {/* Performance Anomalies Tab */}
        <TabPanel value={activeTab} index={2}>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <InsightDetailCard 
                key={index}
                insight={{
                  id: `loading-${index}`,
                  title: '',
                  summary: '',
                  detailedAnalysis: '',
                  businessImpact: 'high',
                  category: 'performance_anomaly',
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
            performanceAnomalies.length > 0 ? (
              performanceAnomalies.map(insight => (
                <InsightDetailCard key={insight.id} insight={insight} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No performance anomalies detected for the selected time period.
              </Typography>
            )
          )}
        </TabPanel>
        
        {/* Strategic Recommendations Tab */}
        <TabPanel value={activeTab} index={3}>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <InsightDetailCard 
                key={index}
                insight={{
                  id: `loading-${index}`,
                  title: '',
                  summary: '',
                  detailedAnalysis: '',
                  businessImpact: 'high',
                  category: 'strategic_recommendation',
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
            strategicRecommendations.length > 0 ? (
              strategicRecommendations.map(insight => (
                <InsightDetailCard key={insight.id} insight={insight} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No strategic recommendations available for the selected time period.
              </Typography>
            )
          )}
        </TabPanel>
        
        {/* Growth Opportunities Tab */}
        <TabPanel value={activeTab} index={4}>
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <OpportunityCard 
                key={index}
                opportunity={{
                  id: `loading-${index}`,
                  title: '',
                  description: '',
                  medicalCategory: '',
                  targetAudience: [],
                  estimatedROI: { min: 0, expected: 0, max: 0 },
                  implementationComplexity: 'medium',
                  timeToMarket: 0,
                  competitiveAdvantage: 'moderate',
                  requiredResources: [],
                  supportingData: []
                }} 
                loading={true} 
              />
            ))
          ) : (
            executiveSummary?.opportunities && executiveSummary.opportunities.length > 0 ? (
              executiveSummary.opportunities.map(opportunity => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No growth opportunities available for the selected time period.
              </Typography>
            )
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
} 