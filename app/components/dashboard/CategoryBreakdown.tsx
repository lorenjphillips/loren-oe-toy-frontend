/**
 * CategoryBreakdown Component
 * 
 * Visualizes performance metrics broken down by medical categories
 * using interactive bar charts and comparative analysis.
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tab, 
  Tabs, 
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  Grid
} from '@mui/material';
import * as d3 from 'd3';
import { DashboardContext, DashboardContextType } from './DashboardLayout';
import { getCategoryBreakdownData } from '../../services/dashboardData';
import { MEDICAL_CATEGORY_MAP } from '../../data/pharmaCategories';

export interface CategoryBreakdownProps {
  companyId?: string;
  maxCategories?: number;
}

// Category data interfaces
interface CategoryMetric {
  category: string;
  displayName: string;
  impressions: number;
  engagements: number;
  engagementRate: number;
  conversionRate: number;
  viewabilityRate: number;
  qualityScore: number;
  change: number; // Percent change vs previous period
}

interface CategoryBreakdownData {
  metrics: CategoryMetric[];
  topPerforming: string;
  mostImproved: string;
  totalImpressions: number;
  totalEngagements: number;
}

export default function CategoryBreakdown({ 
  companyId, 
  maxCategories = 8
}: CategoryBreakdownProps) {
  const theme = useTheme();
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [metricType, setMetricType] = useState<string>('impressions');
  const [data, setData] = useState<CategoryBreakdownData | null>(null);
  
  // Handle metric type change
  const handleMetricTypeChange = (_: React.SyntheticEvent, newValue: string) => {
    setMetricType(newValue);
  };
  
  // Fetch category breakdown data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { dateRange, filters } = dashboardContext;
        const result = await getCategoryBreakdownData({
          dateRange,
          companyId: companyId || dashboardContext.selectedCompany,
          ...filters
        });
        
        setData(result);
      } catch (error) {
        console.error('Error fetching category breakdown data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, companyId, dashboardContext.selectedCompany, dashboardContext.filters]);
  
  // Render bar chart using D3
  useEffect(() => {
    if (loading || !chartRef.current || !data) return;
    
    // Sort and limit categories
    const sortedMetrics = [...data.metrics].sort((a, b) => {
      if (metricType === 'impressions') return b.impressions - a.impressions;
      if (metricType === 'engagements') return b.engagements - a.engagements;
      if (metricType === 'engagementRate') return b.engagementRate - a.engagementRate;
      if (metricType === 'conversionRate') return b.conversionRate - a.conversionRate;
      return 0;
    }).slice(0, maxCategories);
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Chart dimensions
    const margin = { top: 20, right: 30, bottom: 80, left: 80 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale and axis
    const x = d3.scaleBand()
      .domain(sortedMetrics.map(d => d.displayName))
      .range([0, width])
      .padding(0.3);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');
    
    // Determine the value accessor and maximum value based on selected metric
    let valueAccessor: (d: CategoryMetric) => number;
    let yLabel: string;
    
    switch (metricType) {
      case 'impressions':
        valueAccessor = d => d.impressions;
        yLabel = 'Impressions';
        break;
      case 'engagements':
        valueAccessor = d => d.engagements;
        yLabel = 'Engagements';
        break;
      case 'engagementRate':
        valueAccessor = d => d.engagementRate;
        yLabel = 'Engagement Rate (%)';
        break;
      case 'conversionRate':
        valueAccessor = d => d.conversionRate;
        yLabel = 'Conversion Rate (%)';
        break;
      default:
        valueAccessor = d => d.impressions;
        yLabel = 'Value';
    }
    
    // Y scale and axis
    const maxValue = d3.max(sortedMetrics, valueAccessor) || 0;
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add padding
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -(height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(yLabel);
    
    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', theme.palette.divider)
      .style('stroke-opacity', 0.7);
    
    // Color scale based on performance
    const colorScale = d3.scaleLinear<string>()
      .domain([0, maxValue / 2, maxValue])
      .range([theme.palette.info.light, theme.palette.primary.main, theme.palette.success.main]);
    
    // Add bars
    svg.selectAll('.bar')
      .data(sortedMetrics)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.displayName) || 0)
      .attr('width', x.bandwidth())
      .attr('y', d => y(valueAccessor(d)))
      .attr('height', d => height - y(valueAccessor(d)))
      .attr('fill', d => colorScale(valueAccessor(d)))
      .attr('rx', 4) // Rounded corners
      .attr('ry', 4);
    
    // Add value labels on top of bars
    svg.selectAll('.label')
      .data(sortedMetrics)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (x(d.displayName) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(valueAccessor(d)) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('fill', theme.palette.text.primary)
      .text(d => {
        if (metricType === 'impressions' || metricType === 'engagements') {
          return valueAccessor(d) >= 1000 
            ? `${(valueAccessor(d) / 1000).toFixed(1)}K` 
            : valueAccessor(d).toString();
        } else {
          return `${valueAccessor(d).toFixed(1)}%`;
        }
      });
    
    // Add data change indicators
    svg.selectAll('.change-indicator')
      .data(sortedMetrics)
      .enter()
      .append('g')
      .attr('class', 'change-indicator')
      .attr('transform', d => `translate(${(x(d.displayName) || 0) + x.bandwidth() / 2}, ${height + 40})`)
      .append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', d => d.change >= 0 ? theme.palette.success.main : theme.palette.error.main)
      .text(d => `${d.change >= 0 ? '+' : ''}${d.change.toFixed(1)}%`);
    
  }, [loading, data, metricType, theme, maxCategories]);
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Medical Category Breakdown
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <>
              {/* Summary cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Top Performing Category
                    </Typography>
                    <Typography variant="h6" component="div">
                      {data.topPerforming}
                    </Typography>
                    <Chip 
                      size="small" 
                      color="success" 
                      label="Best Results" 
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Most Improved
                    </Typography>
                    <Typography variant="h6" component="div">
                      {data.mostImproved}
                    </Typography>
                    <Chip 
                      size="small" 
                      color="info"
                      label="Highest Growth" 
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Impressions
                    </Typography>
                    <Typography variant="h6" component="div">
                      {formatNumber(data.totalImpressions)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across all categories
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Engagements
                    </Typography>
                    <Typography variant="h6" component="div">
                      {formatNumber(data.totalEngagements)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Across all categories
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Metric selector tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                  value={metricType}
                  onChange={handleMetricTypeChange}
                  aria-label="category metric tabs"
                >
                  <Tab label="Impressions" value="impressions" />
                  <Tab label="Engagements" value="engagements" />
                  <Tab label="Engagement Rate" value="engagementRate" />
                  <Tab label="Conversion Rate" value="conversionRate" />
                </Tabs>
              </Box>
              
              {/* Bar chart */}
              <Box sx={{ mb: 4, height: 400 }} ref={chartRef} />
              
              {/* Data table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell align="right"><strong>Impressions</strong></TableCell>
                      <TableCell align="right"><strong>Engagements</strong></TableCell>
                      <TableCell align="right"><strong>Eng. Rate</strong></TableCell>
                      <TableCell align="right"><strong>Conv. Rate</strong></TableCell>
                      <TableCell align="right"><strong>Change</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.metrics.map((row) => (
                      <TableRow key={row.category}>
                        <TableCell component="th" scope="row">
                          {row.displayName}
                        </TableCell>
                        <TableCell align="right">{formatNumber(row.impressions)}</TableCell>
                        <TableCell align="right">{formatNumber(row.engagements)}</TableCell>
                        <TableCell align="right">{row.engagementRate.toFixed(1)}%</TableCell>
                        <TableCell align="right">{row.conversionRate.toFixed(2)}%</TableCell>
                        <TableCell align="right">
                          <Box sx={{ 
                            color: row.change >= 0 ? 'success.main' : 'error.main',
                            display: 'inline-block' 
                          }}>
                            {row.change >= 0 ? '+' : ''}{row.change.toFixed(1)}%
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Typography color="text.secondary">
              No category data available. Try selecting a different date range or company.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 