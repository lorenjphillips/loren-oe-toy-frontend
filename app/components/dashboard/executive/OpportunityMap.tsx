/**
 * OpportunityMap Component
 * 
 * Visualization of growth opportunities for pharma company decision makers.
 * Provides a visual mapping of opportunity areas by category, value, and effort.
 */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { DashboardContext, DashboardContextType } from '../DashboardLayout';
import executiveInsightsService, {
  CategoryOpportunityIndex,
  MarketOpportunity
} from '../../../services/insights/executiveInsights';

// D3 visualization imports
import * as d3 from 'd3';

export interface OpportunityMapProps {
  companyId?: string;
}

// Bubble chart data point
interface BubbleDataPoint {
  id: string;
  name: string;
  value: number;
  group: string;
  x: number;
  y: number;
  color: string;
  radius: number;
  description: string;
}

// View types
type ViewType = 'category' | 'audience' | 'roi';

export default function OpportunityMap({ companyId }: OpportunityMapProps) {
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const [loading, setLoading] = useState(true);
  const [categoryOpportunities, setCategoryOpportunities] = useState<CategoryOpportunityIndex[]>([]);
  const [marketOpportunities, setMarketOpportunities] = useState<MarketOpportunity[]>([]);
  const [viewType, setViewType] = useState<ViewType>('category');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const bubbleChartRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { dateRange } = dashboardContext;
        
        // Fetch category opportunity indices
        const categoryData = await executiveInsightsService.calculateCategoryOpportunityIndices(
          companyId || dashboardContext.selectedCompany,
          dateRange
        );
        setCategoryOpportunities(categoryData);
        
        // Fetch executive summary for market opportunities
        const summary = await executiveInsightsService.generateExecutiveInsights(
          companyId || dashboardContext.selectedCompany,
          dateRange,
          {}
        );
        setMarketOpportunities(summary.opportunities);
      } catch (error) {
        console.error('Error fetching opportunity data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, dashboardContext.selectedCompany, companyId]);
  
  useEffect(() => {
    if (!loading && bubbleChartRef.current && tooltipRef.current) {
      renderBubbleChart();
    }
  }, [loading, viewType, filterCategory, categoryOpportunities, marketOpportunities]);
  
  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: ViewType | null
  ) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };
  
  const handleCategoryFilterChange = (event: any) => {
    setFilterCategory(event.target.value);
  };
  
  // Helper to generate colors
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Cardiology': '#FF5722',
      'Oncology': '#4CAF50',
      'Neurology': '#2196F3',
      'Immunology': '#9C27B0',
      'Endocrinology': '#FFC107',
      'Infectious Disease': '#795548',
      'Pulmonology': '#00BCD4',
      'Gastroenterology': '#E91E63',
      // Default for other categories
      'default': '#607D8B'
    };
    
    return colorMap[category] || colorMap.default;
  };
  
  // Generate bubble chart data based on selected view
  const generateBubbleData = (): BubbleDataPoint[] => {
    switch (viewType) {
      case 'category':
        return categoryOpportunities
          .filter(item => filterCategory === 'all' || item.category === filterCategory)
          .map(item => ({
            id: item.category,
            name: item.category,
            value: item.opportunityScore * 100,
            group: 'category',
            x: Math.random(), // Will be replaced by force simulation
            y: Math.random(), // Will be replaced by force simulation
            color: getCategoryColor(item.category),
            radius: 20 + (item.opportunityScore * 50), // Size based on opportunity score
            description: `Growth: ${item.growthRate.toFixed(1)}% | ROI: ${item.potentialROI.toFixed(1)}x`
          }));
      
      case 'audience':
        // Group opportunities by target audience
        const audienceMap = new Map<string, { count: number, totalROI: number, opportunities: string[] }>();
        
        marketOpportunities
          .filter(opp => filterCategory === 'all' || opp.medicalCategory === filterCategory)
          .forEach(opp => {
            opp.targetAudience.forEach(audience => {
              if (!audienceMap.has(audience)) {
                audienceMap.set(audience, { count: 0, totalROI: 0, opportunities: [] });
              }
              const current = audienceMap.get(audience)!;
              current.count += 1;
              current.totalROI += opp.estimatedROI.expected;
              current.opportunities.push(opp.title);
              audienceMap.set(audience, current);
            });
          });
        
        return Array.from(audienceMap.entries()).map(([audience, data]) => ({
          id: audience,
          name: audience,
          value: data.totalROI / data.count, // Average ROI
          group: 'audience',
          x: Math.random(),
          y: Math.random(),
          color: '#3F51B5',
          radius: 20 + (data.count * 10), // Size based on opportunity count
          description: `${data.count} opportunities | Avg ROI: ${(data.totalROI / data.count).toFixed(1)}x`
        }));
      
      case 'roi':
        return marketOpportunities
          .filter(opp => filterCategory === 'all' || opp.medicalCategory === filterCategory)
          .map(opp => ({
            id: opp.id,
            name: opp.title.length > 25 ? opp.title.substring(0, 22) + '...' : opp.title,
            value: opp.estimatedROI.expected,
            group: opp.medicalCategory,
            x: Math.random(),
            y: Math.random(),
            color: getCategoryColor(opp.medicalCategory),
            radius: 15 + (opp.estimatedROI.expected * 5), // Size based on ROI
            description: `Category: ${opp.medicalCategory} | ROI: ${opp.estimatedROI.expected.toFixed(1)}x | Time: ${opp.timeToMarket} weeks`
          }));
      
      default:
        return [];
    }
  };
  
  // Render D3 bubble chart
  const renderBubbleChart = () => {
    const bubbleData = generateBubbleData();
    if (!bubbleData.length) return;
    
    const svg = d3.select(bubbleChartRef.current);
    const tooltip = d3.select(tooltipRef.current);
    
    // Clear previous chart
    svg.selectAll('*').remove();
    
    // Get dimensions
    const width = bubbleChartRef.current!.clientWidth;
    const height = bubbleChartRef.current!.clientHeight || 500;
    
    // Create a force simulation
    const simulation = d3.forceSimulation(bubbleData as any)
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 2).iterations(2))
      .force('charge', d3.forceManyBody().strength(-50));
    
    // Create circles for each data point
    const circles = svg.selectAll('.bubble')
      .data(bubbleData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('r', d => d.radius)
      .attr('fill', d => d.color)
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', '#000')
          .attr('stroke-width', 2)
          .attr('opacity', 1);
        
        tooltip
          .style('opacity', 1)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px')
          .html(`
            <strong>${d.name}</strong><br/>
            Value: ${d.value.toFixed(1)}<br/>
            ${d.description}
          `);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .attr('opacity', 0.8);
        
        tooltip.style('opacity', 0);
      });
    
    // Add labels for larger bubbles
    const labels = svg.selectAll('.label')
      .data(bubbleData.filter(d => d.radius > 30))
      .enter()
      .append('text')
      .attr('class', 'label')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fff')
      .attr('font-size', d => Math.min(d.radius / 3, 12) + 'px')
      .attr('pointer-events', 'none')
      .attr('dy', '0.35em');
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      circles
        .attr('cx', (d: any) => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr('cy', (d: any) => Math.max(d.radius, Math.min(height - d.radius, d.y)));
      
      labels
        .attr('x', (d: any) => Math.max(d.radius, Math.min(width - d.radius, d.x)))
        .attr('y', (d: any) => Math.max(d.radius, Math.min(height - d.radius, d.y)));
    });
  };
  
  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Opportunity Map
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categoryOpportunities.map(cat => (
                  <MenuItem key={cat.category} value={cat.category}>{cat.category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewTypeChange}
              size="small"
            >
              <ToggleButton value="category">
                By Category
              </ToggleButton>
              <ToggleButton value="audience">
                By Audience
              </ToggleButton>
              <ToggleButton value="roi">
                By ROI
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        
        <Box sx={{ position: 'relative', height: 500, width: '100%' }}>
          {loading ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Skeleton variant="rectangular" width="100%" height="100%" />
            </Box>
          ) : (
            <svg 
              ref={bubbleChartRef} 
              width="100%" 
              height="100%"
              style={{ overflow: 'visible' }}
            />
          )}
          
          <Box
            ref={tooltipRef}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              padding: 1,
              pointerEvents: 'none',
              opacity: 0,
              zIndex: 10,
              boxShadow: 2,
              fontSize: '0.8rem',
              maxWidth: 200
            }}
          />
        </Box>
      </Paper>
      
      <Typography variant="h5" sx={{ mb: 3 }}>
        Category Opportunity Metrics
      </Typography>
      
      <Grid container spacing={3}>
        {loading ? (
          Array(8).fill(0).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Skeleton width="70%" height={28} />
                  <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
                  <Skeleton width="100%" height={60} sx={{ mt: 2 }} />
                  <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          categoryOpportunities.map(category => (
            <Grid item xs={12} sm={6} md={3} key={category.category}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {category.category}
                  </Typography>
                  
                  <Chip 
                    label={`${(category.opportunityScore * 100).toFixed(0)}% opportunity`}
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Growth Rate
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {category.growthRate > 0 ? '+' : ''}{category.growthRate.toFixed(1)}%
                        </Typography>
                        <Box 
                          sx={{ 
                            ml: 1, 
                            height: 8, 
                            width: '100%', 
                            bgcolor: 'background.default',
                            borderRadius: 5,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              width: `${Math.min(100, Math.max(0, (category.growthRate + 5) * 3))}%`,
                              bgcolor: category.growthRate >= 0 ? 'success.main' : 'error.main',
                              borderRadius: 5
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Competitive Gap
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="medium">
                          {(category.competitiveGap * 100).toFixed(0)}%
                        </Typography>
                        <Box 
                          sx={{ 
                            ml: 1, 
                            height: 8, 
                            width: '100%', 
                            bgcolor: 'background.default',
                            borderRadius: 5,
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              width: `${Math.min(100, category.competitiveGap * 200)}%`,
                              bgcolor: 'info.main',
                              borderRadius: 5
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Potential ROI
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {category.potentialROI.toFixed(1)}x
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
} 