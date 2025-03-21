/**
 * TimeseriesVisualizer Component
 * 
 * Displays performance trends over time using D3.js line charts
 * with interactive features for zoom, tooltips, and metric selection.
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  ToggleButtonGroup, 
  ToggleButton, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  useTheme
} from '@mui/material';
import * as d3 from 'd3';
import { DashboardContext, DashboardContextType } from './DashboardLayout';
import { getTimeseriesData } from '../../services/dashboardData';

export interface TimeseriesVisualizerProps {
  companyId?: string;
  category?: string;
  height?: number;
}

// Timeseries data interface
interface TimeseriesPoint {
  date: Date;
  value: number;
}

interface TimeseriesDataset {
  id: string;
  name: string;
  color: string;
  data: TimeseriesPoint[];
}

export default function TimeseriesVisualizer({ 
  companyId, 
  category,
  height = 400 
}: TimeseriesVisualizerProps) {
  const theme = useTheme();
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<string>('impressions');
  const [granularity, setGranularity] = useState<string>('day');
  const [datasets, setDatasets] = useState<TimeseriesDataset[]>([]);
  
  // Handle metric change
  const handleMetricChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMetric: string,
  ) => {
    if (newMetric !== null) {
      setMetric(newMetric);
    }
  };

  // Handle granularity change
  const handleGranularityChange = (event: any) => {
    setGranularity(event.target.value);
  };
  
  // Fetch timeseries data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { dateRange, filters } = dashboardContext;
        const data = await getTimeseriesData({
          dateRange,
          metric,
          granularity,
          companyId: companyId || dashboardContext.selectedCompany,
          category,
          ...filters
        });
        
        setDatasets(data);
      } catch (error) {
        console.error('Error fetching timeseries data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, metric, granularity, companyId, category, dashboardContext.selectedCompany, dashboardContext.filters]);
  
  // Render chart using D3
  useEffect(() => {
    if (loading || !chartRef.current || datasets.length === 0) return;
    
    // Clear previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    // Chart dimensions
    const margin = { top: 20, right: 80, bottom: 50, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', chartHeight + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Find date range from all datasets
    const allDates = datasets.flatMap(d => d.data.map(p => p.date));
    const minDate = d3.min(allDates) || new Date();
    const maxDate = d3.max(allDates) || new Date();
    
    // Find value range from all datasets
    const allValues = datasets.flatMap(d => d.data.map(p => p.value));
    const maxValue = d3.max(allValues) || 0;
    
    // X scale
    const x = d3.scaleTime()
      .domain([minDate, maxDate])
      .range([0, width]);
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, maxValue * 1.1]) // Add 10% padding
      .range([chartHeight, 0]);
    
    // Line generator
    const line = d3.line<TimeseriesPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (chartHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', theme.palette.text.primary)
      .text(getAxisLabel(metric));
    
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
      .style('stroke-opacity', 0.7)
      .style('shape-rendering', 'crispEdges');
    
    svg.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(
        d3.axisBottom(x)
          .tickSize(-chartHeight)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .style('stroke', theme.palette.divider)
      .style('stroke-opacity', 0.7)
      .style('shape-rendering', 'crispEdges');
    
    // Add lines for each dataset
    datasets.forEach(dataset => {
      svg.append('path')
        .datum(dataset.data)
        .attr('fill', 'none')
        .attr('stroke', dataset.color)
        .attr('stroke-width', 2.5)
        .attr('d', line);
      
      // Add dots for each data point
      svg.selectAll(`dot-${dataset.id}`)
        .data(dataset.data)
        .enter()
        .append('circle')
        .attr('r', 4)
        .attr('cx', d => x(d.date))
        .attr('cy', d => y(d.value))
        .attr('fill', dataset.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5);
    });
    
    // Add tooltip
    const tooltip = d3.select(chartRef.current)
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', theme.palette.background.paper)
      .style('border', `1px solid ${theme.palette.divider}`)
      .style('border-radius', '4px')
      .style('padding', '12px')
      .style('box-shadow', '0 2px 10px rgba(0,0,0,0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '100');
    
    // Create an overlay for mouse events
    const bisect = d3.bisector<TimeseriesPoint, Date>(d => d.date).left;
    
    svg.append('rect')
      .attr('width', width)
      .attr('height', chartHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => tooltip.style('visibility', 'visible'))
      .on('mouseout', () => tooltip.style('visibility', 'hidden'))
      .on('mousemove', function(event) {
        const mouseX = d3.pointer(event, this)[0];
        const x0 = x.invert(mouseX);
        
        let tooltipContent = `<div style="font-weight: bold;">${formatDate(x0)}</div>`;
        
        datasets.forEach(dataset => {
          const i = bisect(dataset.data, x0, 1);
          if (i >= dataset.data.length) return;
          
          const d0 = dataset.data[i - 1];
          const d1 = dataset.data[i];
          
          if (!d0 || !d1) return;
          
          // Use the closest point
          const d = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
          
          tooltipContent += `
            <div style="display: flex; align-items: center; margin-top: 8px;">
              <div style="width: 12px; height: 12px; background-color: ${dataset.color}; margin-right: 8px; border-radius: 50%;"></div>
              <span style="font-weight: 500;">${dataset.name}:</span>
              <span style="margin-left: 8px;">${formatValue(d.value, metric)}</span>
            </div>
          `;
        });
        
        tooltip
          .html(tooltipContent)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 30}px`);
      });
    
    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(0,${chartHeight + 40})`);
    
    datasets.forEach((dataset, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * 150}, 0)`);
      
      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', dataset.color)
        .attr('rx', 6)
        .attr('ry', 6);
      
      legendItem.append('text')
        .attr('x', 20)
        .attr('y', 10)
        .text(dataset.name)
        .style('font-size', '12px')
        .style('fill', theme.palette.text.primary);
    });
    
  }, [loading, datasets, height, metric, theme]);
  
  // Helper function to get axis label
  const getAxisLabel = (metricType: string): string => {
    switch (metricType) {
      case 'impressions':
        return 'Impressions';
      case 'engagements':
        return 'Engagements';
      case 'engagement_rate':
        return 'Engagement Rate (%)';
      case 'conversion_rate':
        return 'Conversion Rate (%)';
      case 'avg_engagement_time':
        return 'Avg. Engagement Time (sec)';
      case 'viewability_rate':
        return 'Viewability Rate (%)';
      default:
        return 'Value';
    }
  };
  
  // Format date for tooltip
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Format value for tooltip
  const formatValue = (value: number, metricType: string): string => {
    switch (metricType) {
      case 'impressions':
      case 'engagements':
        return value.toLocaleString();
      case 'engagement_rate':
      case 'conversion_rate':
      case 'viewability_rate':
        return `${value.toFixed(2)}%`;
      case 'avg_engagement_time':
        return `${value.toFixed(1)} sec`;
      default:
        return value.toString();
    }
  };
  
  return (
    <Box sx={{ mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Performance Trends
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item>
              <ToggleButtonGroup
                value={metric}
                exclusive
                onChange={handleMetricChange}
                aria-label="metric selection"
                size="small"
              >
                <ToggleButton value="impressions" aria-label="impressions">
                  Impressions
                </ToggleButton>
                <ToggleButton value="engagements" aria-label="engagements">
                  Engagements
                </ToggleButton>
                <ToggleButton value="engagement_rate" aria-label="engagement rate">
                  Eng. Rate
                </ToggleButton>
                <ToggleButton value="conversion_rate" aria-label="conversion rate">
                  Conv. Rate
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="granularity-select-label">Granularity</InputLabel>
                <Select
                  labelId="granularity-select-label"
                  id="granularity-select"
                  value={granularity}
                  label="Granularity"
                  onChange={handleGranularityChange}
                >
                  <MenuItem value="hour">Hourly</MenuItem>
                  <MenuItem value="day">Daily</MenuItem>
                  <MenuItem value="week">Weekly</MenuItem>
                  <MenuItem value="month">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ position: 'relative', width: '100%', height: `${height}px` }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%' 
              }}>
                <CircularProgress />
              </Box>
            ) : (
              <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 