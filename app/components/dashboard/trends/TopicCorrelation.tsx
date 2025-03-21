/**
 * TopicCorrelation Component
 * 
 * Visualizes relationships between trending medical topics
 * based on correlation analysis. Shows strength of relationships 
 * and statistical significance.
 */
import React, { useContext, useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Divider
} from '@mui/material';
import {
  Hub as HubIcon,
  Info as InfoIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { DashboardContext } from '../DashboardContext';
import { TopicCorrelation as TopicCorrelationType } from '../../../services/analytics/trends';
import { trendAnalysisService } from '../../../services/analytics/trends';
import { QuestionContext } from '../../../types/analytics';
import * as d3 from 'd3';

interface TopicCorrelationProps {
  maxCorrelations?: number;
  minCorrelationStrength?: number;
  viewMode?: 'graph' | 'table' | 'matrix';
  height?: number;
}

// Define node and link types for the force graph
interface Node {
  id: string;
  name: string;
  group: number;
  value: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
  isNovel: boolean;
}

export default function TopicCorrelation({
  maxCorrelations = 20,
  minCorrelationStrength = 0.3,
  viewMode = 'graph',
  height = 400
}: TopicCorrelationProps) {
  const dashboardContext = useContext(DashboardContext);
  const [loading, setLoading] = useState(true);
  const [correlations, setCorrelations] = useState<TopicCorrelationType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<'graph' | 'table' | 'matrix'>(viewMode);
  
  // Ref for D3 visualization
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch historical question data
        // For this demo, we'll use mock data
        const mockQuestions: QuestionContext[] = Array(100).fill(null).map((_, index) => {
          // Create mock question with random date in the past 6 months
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 180));
          
          return {
            id: `q${index}`,
            timestamp: date,
            medicalConcepts: [
              { 
                term: `Concept ${index % 15}`, 
                category: index % 5 === 0 ? 'disease' : 
                          index % 5 === 1 ? 'symptom' : 
                          index % 5 === 2 ? 'treatment' : 
                          index % 5 === 3 ? 'drug' : 'procedure',
                confidence: 0.8 + Math.random() * 0.2
              },
              // Add a second concept to create correlations
              { 
                term: `Concept ${(index % 15) + (index % 3)}`, 
                category: (index+1) % 5 === 0 ? 'disease' : 
                          (index+1) % 5 === 1 ? 'symptom' : 
                          (index+1) % 5 === 2 ? 'treatment' : 
                          (index+1) % 5 === 3 ? 'drug' : 'procedure',
                confidence: 0.7 + Math.random() * 0.3
              }
            ],
            clinicalIntent: index % 6 === 0 ? 'diagnosis' :
                            index % 6 === 1 ? 'treatment' :
                            index % 6 === 2 ? 'mechanism' :
                            index % 6 === 3 ? 'monitoring' :
                            index % 6 === 4 ? 'prevention' : 'prognosis',
            treatmentIndications: []
          };
        });
        
        // Run correlation analysis
        const topicCorrelations = await trendAnalysisService.analyzeCorrelations(mockQuestions);
        
        // Filter and sort by correlation strength
        setCorrelations(
          topicCorrelations
            .filter(corr => Math.abs(corr.correlationCoefficient) >= minCorrelationStrength)
            .sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient))
            .slice(0, maxCorrelations)
        );
      } catch (err) {
        console.error('Error fetching topic correlations:', err);
        setError('Failed to load topic correlation data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, maxCorrelations, minCorrelationStrength]);
  
  // Create force-directed graph when data is loaded and view mode is 'graph'
  useEffect(() => {
    if (loading || error || !correlations.length || selectedViewMode !== 'graph' || !svgRef.current) {
      return;
    }
    
    // Clear existing visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create data structure for d3 force layout
    const nodes: Node[] = [];
    const nodeMap = new Map<string, boolean>();
    const links: Link[] = [];
    
    // Add nodes and links
    correlations.forEach(correlation => {
      // Add source node if not already added
      if (!nodeMap.has(correlation.sourceTopicId)) {
        nodes.push({
          id: correlation.sourceTopicId,
          name: correlation.sourceName,
          group: 1, // Group assignment can be done more intelligently
          value: 1  // Size can be based on frequency
        });
        nodeMap.set(correlation.sourceTopicId, true);
      }
      
      // Add target node if not already added
      if (!nodeMap.has(correlation.targetTopicId)) {
        nodes.push({
          id: correlation.targetTopicId,
          name: correlation.targetName,
          group: 2, // Different group for targets
          value: 1
        });
        nodeMap.set(correlation.targetTopicId, true);
      }
      
      // Add link
      links.push({
        source: correlation.sourceTopicId,
        target: correlation.targetTopicId,
        value: Math.abs(correlation.correlationCoefficient),
        isNovel: correlation.isNovel
      });
    });
    
    // Set up SVG with dimensions
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const graphHeight = height - 20; // Account for padding
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("font-size", "12px");
    
    // Create force simulation
    const simulation = d3.forceSimulation<Node, Link>(nodes)
      .force("link", d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(d => 150 - (d.value * 100)) // Stronger correlations have shorter distances
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, graphHeight / 2))
      .force("collide", d3.forceCollide().radius(30));
    
    // Create links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
        .attr("stroke-width", d => d.value * 5)
        .attr("stroke", d => d.isNovel ? "#FFA726" : "#90CAF9") // Orange for novel, blue for established
        .attr("stroke-opacity", 0.8)
        .attr("stroke-dasharray", d => d.isNovel ? "5,5" : "");
    
    // Create nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
        .attr("r", 10)
        .attr("fill", d => d.group === 1 ? "#42A5F5" : "#66BB6A")
        .call(d3.drag<SVGCircleElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
    
    // Add text labels to nodes
    const text = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(d => d.name)
        .style("font-size", "10px")
        .style("pointer-events", "none");
    
    // Mouse events for nodes
    node.on("mouseover", function(event, d) {
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${d.name}</strong><br/>Topic ID: ${d.id}`);
        
        // Highlight connections
        link.style("stroke-opacity", l => 
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);
        
        d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
        link.style("stroke-opacity", 0.8);
        d3.select(this).attr("stroke", null);
      });
    
    // Mouse events for links
    link.on("mouseover", function(event, d) {
        tooltip
          .style("visibility", "visible")
          .html(`<strong>Correlation:</strong> ${d.value.toFixed(2)}<br/>
                 <strong>Source:</strong> ${(d.source as Node).name}<br/>
                 <strong>Target:</strong> ${(d.target as Node).name}<br/>
                 ${d.isNovel ? '<strong>Newly Identified Relationship</strong>' : ''}`);
        
        d3.select(this)
          .attr("stroke-width", d.value * 8)
          .attr("stroke-opacity", 1);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(event, d) {
        tooltip.style("visibility", "hidden");
        d3.select(this)
          .attr("stroke-width", d.value * 5)
          .attr("stroke-opacity", 0.8);
      });
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => Math.max(10, Math.min(width - 10, (d.source as Node).x!)))
        .attr("y1", d => Math.max(10, Math.min(graphHeight - 10, (d.source as Node).y!)))
        .attr("x2", d => Math.max(10, Math.min(width - 10, (d.target as Node).x!)))
        .attr("y2", d => Math.max(10, Math.min(graphHeight - 10, (d.target as Node).y!)));
      
      node
        .attr("cx", d => Math.max(10, Math.min(width - 10, d.x!)))
        .attr("cy", d => Math.max(10, Math.min(graphHeight - 10, d.y!)));
      
      text
        .attr("x", d => Math.max(10, Math.min(width - 10, d.x!)))
        .attr("y", d => Math.max(10, Math.min(graphHeight - 10, d.y!)));
    });
    
    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, [loading, error, correlations, selectedViewMode, height]);
  
  // Helper to format correlation value
  const formatCorrelation = (value: number): string => {
    return value.toFixed(2);
  };
  
  // Helper to determine color based on correlation strength
  const getCorrelationColor = (coefficient: number): string => {
    const strength = Math.abs(coefficient);
    if (strength >= 0.7) return coefficient > 0 ? 'success.main' : 'error.main';
    if (strength >= 0.5) return coefficient > 0 ? 'success.light' : 'error.light';
    if (strength >= 0.3) return coefficient > 0 ? 'info.main' : 'warning.main';
    return coefficient > 0 ? 'info.light' : 'warning.light';
  };
  
  // Render correlation table view
  const renderTableView = () => {
    return (
      <Box sx={{ maxHeight: height, overflow: 'auto', mt: 1 }}>
        <Stack spacing={1}>
          {correlations.map((correlation, index) => (
            <Box 
              key={`${correlation.sourceTopicId}-${correlation.targetTopicId}`}
              sx={{ 
                display: 'flex', 
                p: 1.5, 
                borderRadius: 1,
                backgroundColor: index % 2 === 0 ? 'background.default' : 'background.paper',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight="medium">
                    {correlation.sourceName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {correlation.correlationCoefficient > 0 ? 'positively correlated with' : 'negatively correlated with'}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {correlation.targetName}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={2} mt={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Strength: {formatCorrelation(Math.abs(correlation.correlationCoefficient))}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Co-occurrence: {(correlation.cooccurrenceFrequency * 100).toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    p-value: {correlation.pValue.toFixed(3)}
                  </Typography>
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  label={correlation.correlationCoefficient > 0 ? 'Positive' : 'Negative'} 
                  size="small"
                  sx={{ 
                    backgroundColor: getCorrelationColor(correlation.correlationCoefficient),
                    color: 'white',
                    mr: 1
                  }}
                />
                {correlation.isNovel && (
                  <Chip 
                    label="New" 
                    size="small"
                    sx={{ 
                      backgroundColor: 'warning.light',
                      color: 'white'
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  };
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <HubIcon sx={{ mr: 1 }} color="primary" />
            Topic Correlations
          </Typography>
          <Box>
            <FormControl size="small" variant="outlined" sx={{ width: 120, mr: 1 }}>
              <InputLabel id="view-mode-label">View Mode</InputLabel>
              <Select
                labelId="view-mode-label"
                value={selectedViewMode}
                onChange={(e) => setSelectedViewMode(e.target.value as 'graph' | 'table' | 'matrix')}
                label="View Mode"
              >
                <MenuItem value="graph">Graph</MenuItem>
                <MenuItem value="table">Table</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Visualizes relationships between medical topics based on co-occurrence in physician questions">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', my: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : correlations.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', my: 2 }}>
            <Typography>No significant correlations found for the selected time period.</Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0 }}>
                  {correlations.filter(c => c.isNovel).length} newly identified correlations found
                </Alert>
                <Chip
                  size="small"
                  icon={<StarIcon sx={{ fontSize: '0.875rem !important' }} />}
                  label={`Top correlation: ${Math.abs(correlations[0].correlationCoefficient).toFixed(2)}`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            {selectedViewMode === 'graph' ? (
              <Box sx={{ position: 'relative', width: '100%', height: height }}>
                <div ref={tooltipRef}></div>
                <svg ref={svgRef} width="100%" height={height}></svg>
              </Box>
            ) : (
              renderTableView()
            )}
          </Box>
        )}
        
        {!loading && correlations.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Based on physician question analysis for {dashboardContext.dateRange[0].toLocaleDateString()} - {dashboardContext.dateRange[1].toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 