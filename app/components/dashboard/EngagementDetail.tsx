/**
 * EngagementDetail Component
 * 
 * Provides detailed analysis of user engagement with interactive
 * visualizations showing engagement flows, depth, and quality.
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  TouchApp as TouchAppIcon,
  AccessTime as AccessTimeIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import * as d3 from 'd3';
import { DashboardContext, DashboardContextType } from './DashboardLayout';
import { getEngagementDetailData } from '../../services/dashboardData';
import { EngagementType } from '../../models/analytics/EngagementMetrics';

export interface EngagementDetailProps {
  companyId?: string;
  category?: string;
}

// Engagement flow node interface
interface EngagementNode {
  id: string;
  name: string;
  value: number;
  type: string;
}

// Engagement flow link interface
interface EngagementLink {
  source: string;
  target: string;
  value: number;
}

// Engagement flow data interface
interface EngagementFlowData {
  nodes: EngagementNode[];
  links: EngagementLink[];
}

// Engagement metric data interface
interface EngagementMetric {
  type: EngagementType;
  displayName: string;
  count: number;
  percentage: number;
  avgDuration: number;
  completionRate: number;
  conversionRate: number;
}

// Engagement heat map data interface
interface HeatMapDataPoint {
  hour: number;
  day: number;
  value: number;
}

// Main data interface
interface EngagementDetailData {
  totalEngagements: number;
  uniqueUsers: number;
  avgEngagementTime: number;
  mostEngagingComponent: string;
  engagementByType: EngagementMetric[];
  flowData: EngagementFlowData;
  heatMapData: HeatMapDataPoint[];
  topHeatMapValue: number;
}

export default function EngagementDetail({ 
  companyId, 
  category 
}: EngagementDetailProps) {
  const theme = useTheme();
  const dashboardContext = useContext(DashboardContext) as DashboardContextType;
  const sankeyRef = useRef<HTMLDivElement>(null);
  const heatmapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EngagementDetailData | null>(null);
  const [engagementFilter, setEngagementFilter] = useState<string>('all');
  const [visualizationType, setVisualizationType] = useState<string>('flow');
  
  // Handle engagement filter change
  const handleEngagementFilterChange = (event: any) => {
    setEngagementFilter(event.target.value);
  };
  
  // Handle visualization type change
  const handleVisualizationChange = (_: React.MouseEvent<HTMLElement>, newValue: string) => {
    if (newValue !== null) {
      setVisualizationType(newValue);
    }
  };
  
  // Fetch engagement data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { dateRange, filters } = dashboardContext;
        const result = await getEngagementDetailData({
          dateRange,
          engagementType: engagementFilter === 'all' ? undefined : engagementFilter,
          companyId: companyId || dashboardContext.selectedCompany,
          category,
          ...filters
        });
        
        setData(result);
      } catch (error) {
        console.error('Error fetching engagement detail data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, engagementFilter, companyId, category, dashboardContext.selectedCompany, dashboardContext.filters]);
  
  // Render Sankey diagram for engagement flow
  useEffect(() => {
    if (loading || !sankeyRef.current || !data || visualizationType !== 'flow') return;
    
    // Clear previous chart
    d3.select(sankeyRef.current).selectAll('*').remove();
    
    const { flowData } = data;
    
    // Dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = sankeyRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(sankeyRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create Sankey generator
    const sankey = d3.sankey()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[0, 0], [width, height]]);
    
    // Format data for Sankey
    const graph = {
      nodes: flowData.nodes.map(d => Object.assign({}, d)),
      links: flowData.links.map(d => Object.assign({}, d))
    };
    
    // Generate Sankey layout
    const sankeyData = sankey(graph);
    const nodes = sankeyData.nodes;
    const links = sankeyData.links;
    
    // Add links
    const link = svg.append('g')
      .selectAll('.link')
      .data(links)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.sankeyLinkHorizontal())
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('stroke', '#ccc')
      .attr('stroke-opacity', 0.3)
      .attr('fill', 'none')
      .style('cursor', 'pointer');
    
    // Add link hover effect
    link.on('mouseover', function() {
      d3.select(this)
        .attr('stroke', theme.palette.primary.main)
        .attr('stroke-opacity', 0.7);
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('stroke', '#ccc')
        .attr('stroke-opacity', 0.3);
    });
    
    // Add link tooltips
    link.append('title')
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value} engagements`);
    
    // Add nodes
    const node = svg.append('g')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer');
    
    // Node rectangles
    node.append('rect')
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => {
        // Different colors based on node type
        switch (d.type) {
          case 'start':
            return theme.palette.success.light;
          case 'interaction':
            return theme.palette.primary.main;
          case 'completion':
            return theme.palette.success.main;
          case 'abandonment':
            return theme.palette.error.light;
          default:
            return theme.palette.info.main;
        }
      })
      .attr('stroke', 'none')
      .attr('rx', 3)
      .attr('ry', 3);
    
    // Node labels
    node.append('text')
      .attr('x', d => d.x0 < width / 2 ? 6 + (d.x1 - d.x0) : -6)
      .attr('y', d => (d.y1 - d.y0) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.x0 < width / 2 ? 'start' : 'end')
      .attr('fill', theme.palette.text.primary)
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .text(d => `${d.name} (${d.value})`);
      
  }, [loading, data, visualizationType, theme]);
  
  // Render heat map for engagement patterns
  useEffect(() => {
    if (loading || !heatmapRef.current || !data || visualizationType !== 'heatmap') return;
    
    // Clear previous chart
    d3.select(heatmapRef.current).selectAll('*').remove();
    
    const { heatMapData, topHeatMapValue } = data;
    
    // Dimensions
    const margin = { top: 30, right: 30, bottom: 50, left: 50 };
    const width = heatmapRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(heatmapRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Days and hours
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    // X scale for hours
    const x = d3.scaleBand()
      .domain(hours.map(h => h.toString()))
      .range([0, width])
      .padding(0.05);
    
    // Y scale for days
    const y = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.05);
    
    // Color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([0, topHeatMapValue / 3, topHeatMapValue])
      .range([theme.palette.info.light, theme.palette.primary.main, theme.palette.success.dark]);
    
    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(h => `${h}:00`))
      .selectAll('text')
      .style('font-size', '8px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');
    
    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y));
    
    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Engagement Activity by Day & Hour');
    
    // Add heat map cells
    svg.selectAll('rect')
      .data(heatMapData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.hour.toString()) || 0)
      .attr('y', d => y(days[d.day]) || 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('stroke', 'none')
      .style('cursor', 'pointer')
      .append('title')
      .text(d => `${days[d.day]} at ${d.hour}:00\n${d.value} engagements`);
      
  }, [loading, data, visualizationType, theme]);
  
  // Format durations
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
  
  return (
    <Box sx={{ mb: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Engagement Analysis
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : data ? (
            <>
              {/* Summary metrics */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'primary.main' }}>
                      <TouchAppIcon fontSize="large" />
                    </ListItemIcon>
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Engagements
                      </Typography>
                      <Typography variant="h5">
                        {data.totalEngagements.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'secondary.main' }}>
                      <AccessTimeIcon fontSize="large" />
                    </ListItemIcon>
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Avg Engagement Time
                      </Typography>
                      <Typography variant="h5">
                        {formatDuration(data.avgEngagementTime)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'info.main' }}>
                      <ArrowForwardIcon fontSize="large" />
                    </ListItemIcon>
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Most Engaging Component
                      </Typography>
                      <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                        {data.mostEngagingComponent}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper
                    variant="outlined"
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      height: '100%'
                    }}
                  >
                    <ListItemIcon sx={{ color: 'success.main' }}>
                      <SpeedIcon fontSize="large" />
                    </ListItemIcon>
                    <Box sx={{ ml: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Unique Users
                      </Typography>
                      <Typography variant="h5">
                        {data.uniqueUsers.toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Filters and controls */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="engagement-filter-label">Engagement Type</InputLabel>
                    <Select
                      labelId="engagement-filter-label"
                      id="engagement-filter"
                      value={engagementFilter}
                      label="Engagement Type"
                      onChange={handleEngagementFilterChange}
                    >
                      <MenuItem value="all">All Engagement Types</MenuItem>
                      <MenuItem value="microsim">Microsimulations</MenuItem>
                      <MenuItem value="knowledge_graph">Knowledge Graphs</MenuItem>
                      <MenuItem value="content">Content Interactions</MenuItem>
                      <MenuItem value="cta">Call to Action</MenuItem>
                      <MenuItem value="media">Media Engagements</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ToggleButtonGroup
                    value={visualizationType}
                    exclusive
                    onChange={handleVisualizationChange}
                    aria-label="visualization type"
                    size="small"
                    fullWidth
                  >
                    <ToggleButton value="flow" aria-label="flow">
                      User Flow
                    </ToggleButton>
                    <ToggleButton value="heatmap" aria-label="heatmap">
                      Activity Heatmap
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
              
              {/* Visualization area */}
              <Box sx={{ mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {visualizationType === 'flow' ? 'Engagement Flow Analysis' : 'Engagement Activity Pattern'}
                  </Typography>
                  
                  <Box sx={{ height: 400 }}>
                    {visualizationType === 'flow' ? (
                      <div ref={sankeyRef} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <div ref={heatmapRef} style={{ width: '100%', height: '100%' }} />
                    )}
                  </Box>
                </Paper>
              </Box>
              
              {/* Engagement metrics table */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Engagement Metrics by Type
                </Typography>
                
                <List>
                  {data.engagementByType.map((metric, index) => (
                    <React.Fragment key={metric.type}>
                      <ListItem alignItems="flex-start">
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} md={3}>
                            <ListItemText
                              primary={metric.displayName}
                              secondary={`${metric.count.toLocaleString()} engagements (${metric.percentage.toFixed(1)}%)`}
                            />
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Tooltip title="Avg. engagement duration">
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Duration
                                </Typography>
                                <Typography variant="body2">
                                  {formatDuration(metric.avgDuration)}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Tooltip title="Completion rate">
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Completion: {(metric.completionRate * 100).toFixed(1)}%
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={metric.completionRate * 100}
                                  color="primary"
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            </Tooltip>
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Tooltip title="Conversion rate">
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Conversion: {(metric.conversionRate * 100).toFixed(1)}%
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={metric.conversionRate * 100}
                                  color="success"
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Box>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </ListItem>
                      {index < data.engagementByType.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </>
          ) : (
            <Typography color="text.secondary">
              No engagement data available. Try selecting a different date range or company.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 