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
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { SankeyLink, SankeyNode } from 'd3-sankey';
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

interface SankeyNodeExtra {
  name: string;
  value: number;
  type?: string;
}

interface SankeyLinkExtra {
  source: string | SankeyNodeExtra;
  target: string | SankeyNodeExtra;
  value: number;
}

type MySankeyNode = SankeyNode<SankeyNodeExtra, SankeyLinkExtra>;
type MySankeyLink = SankeyLink<SankeyNodeExtra, SankeyLinkExtra>;

interface SankeyData {
  nodes: SankeyNodeExtra[];
  links: SankeyLinkExtra[];
}

interface SankeyNodeWithPosition extends MySankeyNode {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  name: string;
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
    
    // Format data for Sankey
    const graph: SankeyData = {
      nodes: flowData.nodes.map((d: any) => ({ name: d.name, value: d.value, type: d.type })),
      links: flowData.links.map((d: any) => ({ source: d.source, target: d.target, value: d.value }))
    };
    
    // Create Sankey generator
    const sankeyGenerator = sankey<SankeyNodeExtra, SankeyLinkExtra>()
      .nodeWidth(20)
      .nodePadding(10)
      .extent([[0, 0], [width, height]]);
    
    // Generate Sankey layout
    const sankeyData = sankeyGenerator(graph);
    const nodes = sankeyData.nodes;
    const links = sankeyData.links;
    
    // Create color scales
    const nodeColorScale = d3.scaleOrdinal<string>()
      .domain(nodes.map(n => n.name))
      .range(d3.schemeCategory10);

    const heatmapColorScale = d3.scaleLinear<string>()
      .domain([0, data.topHeatMapValue / 2, data.topHeatMapValue])
      .range(['#f7fbff', '#6baed6', '#08519c']);
    
    // Ensure nodes have all required properties
    const typedNodes = nodes.map(node => {
      return {
        ...node,
        x0: node.x0 || 0,
        x1: node.x1 || 0,
        y0: node.y0 || 0,
        y1: node.y1 || 0,
        name: node.name || ''
      } as SankeyNodeWithPosition;
    });

    // Draw links
    svg.append('g')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d: MySankeyLink) => {
        const source = d.source as MySankeyNode;
        return nodeColorScale(source.name || '');
      })
      .attr('stroke-width', (d: MySankeyLink) => {
        return Math.max(1, d.width || 0);
      })
      .attr('fill', 'none')
      .attr('opacity', 0.5);
    
    // Draw nodes
    const nodesGroup = svg.append('g')
      .selectAll('rect')
      .data(typedNodes)
      .enter()
      .append('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', d => nodeColorScale(d.name))
      .attr('opacity', 0.8);
    
    // Node labels
    nodesGroup.append('text')
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
      .range([0, width])
      .domain(Array.from({ length: 24 }, (_, i) => i.toString()));
    
    // Y scale for days
    const y = d3.scaleBand()
      .range([0, height])
      .domain(days);
    
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
    
    // Create scales for heatmap
    const colorScale = d3.scaleLinear<string>()
      .domain([0, data.topHeatMapValue / 2, data.topHeatMapValue])
      .range(['#f7fbff', '#6baed6', '#08519c']);

    // Update heatmap cell colors
    svg.selectAll('.heatmap-cell')
      .data(heatMapData)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => x(d.hour.toString()) || 0)
      .attr('y', d => y(days[d.day]) || 0)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('rx', 2)
      .attr('ry', 2);
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