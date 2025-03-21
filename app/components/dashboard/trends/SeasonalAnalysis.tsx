/**
 * SeasonalAnalysis Component
 * 
 * Displays cyclical patterns in medical topic frequencies,
 * highlighting seasonal trends and patterns in physician
 * question data.
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
  Chip,
  Stack,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import {
  Calendar as CalendarIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { DashboardContext } from '../DashboardContext';
import { SeasonalPattern } from '../../../services/analytics/trends';
import { trendAnalysisService } from '../../../services/analytics/trends';
import { QuestionContext } from '../../../types/analytics';
import * as d3 from 'd3';

interface SeasonalAnalysisProps {
  maxTopics?: number;
  seasonalityThreshold?: number;
  height?: number;
}

export default function SeasonalAnalysis({
  maxTopics = 5,
  seasonalityThreshold = 0.4,
  height = 400
}: SeasonalAnalysisProps) {
  const dashboardContext = useContext(DashboardContext);
  const [loading, setLoading] = useState(true);
  const [seasonalPatterns, setSeasonalPatterns] = useState<SeasonalPattern[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  
  // Ref for D3 visualization
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch historical question data
        // For this demo, we'll use mock data
        const mockQuestions: QuestionContext[] = Array(500).fill(null).map((_, index) => {
          // Create mock question with date spread across 2 years
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 730));
          
          return {
            id: `q${index}`,
            timestamp: date,
            medicalConcepts: [
              { 
                term: `Concept ${index % 25}`, 
                category: index % 5 === 0 ? 'disease' : 
                          index % 5 === 1 ? 'symptom' : 
                          index % 5 === 2 ? 'treatment' : 
                          index % 5 === 3 ? 'drug' : 'procedure',
                confidence: 0.8 + Math.random() * 0.2
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
        
        // Add some seasonal patterns to the mock data
        // For flu-like and respiratory conditions in winter
        mockQuestions.forEach(question => {
          const month = question.timestamp.getMonth();
          if ((month >= 10 || month <= 1) && Math.random() < 0.7) { // Winter months (Nov-Feb)
            question.medicalConcepts.push({ 
              term: 'Influenza', 
              category: 'disease',
              confidence: 0.9
            });
          }
          if ((month >= 3 && month <= 5) && Math.random() < 0.6) { // Spring months (Apr-Jun)
            question.medicalConcepts.push({ 
              term: 'Allergic Rhinitis', 
              category: 'disease',
              confidence: 0.85
            });
          }
          if ((month >= 5 && month <= 8) && Math.random() < 0.5) { // Summer months (Jun-Sep)
            question.medicalConcepts.push({ 
              term: 'Heat Exhaustion', 
              category: 'disease',
              confidence: 0.82
            });
          }
        });
        
        // Run seasonal analysis
        const patterns = await trendAnalysisService.analyzeSeasonality(mockQuestions, {
          timeframe: 'monthly',
          baselinePeriod: 24
        });
        
        // Filter and sort by seasonality strength
        const filteredPatterns = patterns
          .filter(pattern => pattern.seasonalityStrength >= seasonalityThreshold)
          .sort((a, b) => b.seasonalityStrength - a.seasonalityStrength)
          .slice(0, maxTopics);
        
        setSeasonalPatterns(filteredPatterns);
        
        // Set the first pattern as selected
        if (filteredPatterns.length > 0) {
          setSelectedPattern(filteredPatterns[0].topicId);
        }
      } catch (err) {
        console.error('Error fetching seasonal patterns:', err);
        setError('Failed to load seasonal pattern data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, maxTopics, seasonalityThreshold]);
  
  // Create the chart visualization when data is loaded
  useEffect(() => {
    if (
      loading || 
      error || 
      !seasonalPatterns.length || 
      !selectedPattern || 
      !chartRef.current
    ) {
      return;
    }
    
    // Get the selected pattern
    const pattern = seasonalPatterns.find(p => p.topicId === selectedPattern);
    if (!pattern) return;
    
    // Clear existing visualization
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Create a seasonal chart visualization
    const margin = { top: 20, right: 30, bottom: 50, left: 40 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = 300 - margin.top - margin.bottom;
    
    // Set up the SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create sample data for a full year cycle
    // In a real implementation, this would come from actual data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create synthetic seasonal data based on the pattern
    const seasonalData = months.map((month, i) => {
      let value: number;
      
      // Add peak values around peak periods
      if (pattern.seasonalityType === 'annual') {
        const peakMonths = pattern.peakPeriods.map(p => months.indexOf(p.substring(0, 3)));
        const troughMonths = pattern.troughPeriods.map(p => months.indexOf(p.substring(0, 3)));
        
        // Calculate distance to closest peak/trough
        const distToPeak = Math.min(...peakMonths.map(p => Math.min(Math.abs(i - p), Math.abs(i - p + 12), Math.abs(i - p - 12))));
        const distToTrough = Math.min(...troughMonths.map(p => Math.min(Math.abs(i - p), Math.abs(i - p + 12), Math.abs(i - p - 12))));
        
        if (distToPeak < distToTrough) {
          // Closer to peak
          value = 0.5 + 0.5 * (1 - distToPeak / 6);
        } else {
          // Closer to trough
          value = 0.5 - 0.4 * (1 - distToTrough / 6);
        }
      } else {
        // Default pattern if not annual
        value = 0.5 + 0.3 * Math.sin((i / 12) * Math.PI * 2);
      }
      
      return {
        month,
        value,
        isPeak: pattern.peakPeriods.some(p => p.includes(month)),
        isTrough: pattern.troughPeriods.some(p => p.includes(month)),
        isNow: getCurrentMonth() === i
      };
    });
    
    // Create X and Y scales
    const x = d3.scaleBand()
      .domain(months)
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(seasonalData, d => d.value) as number * 1.1])
      .range([chartHeight, 0]);
    
    // Create X and Y axes
    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("font-size", "10px");
    
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${(d as number * 100).toFixed(0)}%`))
      .selectAll("text")
        .style("font-size", "10px");
    
    // Create a line generator
    const line = d3.line<{month: string, value: number}>()
      .x(d => (x(d.month) || 0) + x.bandwidth() / 2)
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);
    
    // Add the line
    svg.append("path")
      .datum(seasonalData)
      .attr("fill", "none")
      .attr("stroke", "#2196F3")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // Add circles for each data point
    svg.selectAll(".dot")
      .data(seasonalData)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => (x(d.month) || 0) + x.bandwidth() / 2)
        .attr("cy", d => y(d.value))
        .attr("r", d => d.isPeak || d.isTrough || d.isNow ? 6 : 4)
        .attr("fill", d => d.isPeak ? "#4CAF50" : d.isTrough ? "#F44336" : "#2196F3")
        .attr("stroke", d => d.isNow ? "#000" : "none")
        .attr("stroke-width", d => d.isNow ? 2 : 0);
    
    // Add tooltips for each point
    svg.selectAll(".dot-label")
      .data(seasonalData)
      .enter().append("title")
        .text(d => `${d.month}: ${(d.value * 100).toFixed(1)}%${d.isPeak ? ' (Peak)' : d.isTrough ? ' (Trough)' : ''}${d.isNow ? ' (Current)' : ''}`);
    
    // Add peak markers
    svg.selectAll(".peak-marker")
      .data(seasonalData.filter(d => d.isPeak))
      .enter().append("text")
        .attr("class", "peak-marker")
        .attr("x", d => (x(d.month) || 0) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("▲");
    
    // Add trough markers
    svg.selectAll(".trough-marker")
      .data(seasonalData.filter(d => d.isTrough))
      .enter().append("text")
        .attr("class", "trough-marker")
        .attr("x", d => (x(d.month) || 0) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("▼");
    
    // Add a vertical line for current month
    const nowData = seasonalData.find(d => d.isNow);
    if (nowData) {
      svg.append("line")
        .attr("x1", (x(nowData.month) || 0) + x.bandwidth() / 2)
        .attr("y1", 0)
        .attr("x2", (x(nowData.month) || 0) + x.bandwidth() / 2)
        .attr("y2", chartHeight)
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5");
      
      svg.append("text")
        .attr("x", (x(nowData.month) || 0) + x.bandwidth() / 2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("font-weight", "bold")
        .text("Current");
    }
    
    // Add chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(`${pattern.name} - Annual Cyclical Pattern`);
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 100}, ${chartHeight - 70})`);
    
    // Peak
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#4CAF50");
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 4)
      .style("font-size", "10px")
      .text("Peak Period");
    
    // Trough
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 20)
      .attr("r", 5)
      .attr("fill", "#F44336");
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 24)
      .style("font-size", "10px")
      .text("Trough Period");
    
    // Current
    legend.append("circle")
      .attr("cx", 0)
      .attr("cy", 40)
      .attr("r", 5)
      .attr("fill", "#2196F3")
      .attr("stroke", "#000")
      .attr("stroke-width", 2);
    
    legend.append("text")
      .attr("x", 10)
      .attr("y", 44)
      .style("font-size", "10px")
      .text("Current Month");
  }, [loading, error, seasonalPatterns, selectedPattern]);
  
  // Helper to get current month index (0-11)
  const getCurrentMonth = (): number => {
    return new Date().getMonth();
  };
  
  // Helper to get position icon
  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'rising':
        return <TrendingUpIcon fontSize="small" color="success" />;
      case 'falling':
        return <TrendingDownIcon fontSize="small" color="error" />;
      case 'peak':
        return <ArrowUpwardIcon fontSize="small" color="success" />;
      case 'trough':
        return <ArrowDownwardIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };
  
  // Helper to get position text
  const getPositionText = (position: string): string => {
    switch (position) {
      case 'rising':
        return 'Increasing';
      case 'falling':
        return 'Decreasing';
      case 'peak':
        return 'At Peak';
      case 'trough':
        return 'At Trough';
      default:
        return 'Stable';
    }
  };
  
  // Helper to get position color
  const getPositionColor = (position: string): string => {
    switch (position) {
      case 'rising':
      case 'peak':
        return 'success';
      case 'falling':
      case 'trough':
        return 'error';
      default:
        return 'info';
    }
  };
  
  // Render seasonal pattern cards
  const renderPatternCards = () => {
    return (
      <Grid container spacing={2}>
        {seasonalPatterns.map((pattern) => (
          <Grid item xs={12} sm={6} md={4} key={pattern.topicId}>
            <Card 
              variant="outlined" 
              sx={{ 
                cursor: 'pointer',
                borderColor: selectedPattern === pattern.topicId ? 'primary.main' : 'divider',
                boxShadow: selectedPattern === pattern.topicId ? '0 0 0 2px rgba(25, 118, 210, 0.2)' : 'none'
              }}
              onClick={() => setSelectedPattern(pattern.topicId)}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" noWrap>
                  {pattern.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Chip 
                    size="small"
                    label={getPositionText(pattern.currentPosition)}
                    color={getPositionColor(pattern.currentPosition) as "success" | "error" | "info"}
                    icon={getPositionIcon(pattern.currentPosition)}
                  />
                  <Chip 
                    size="small"
                    label={`${(pattern.seasonalityStrength * 100).toFixed(0)}% seasonal`}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Peaks: {pattern.peakPeriods.join(', ')}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Troughs: {pattern.troughPeriods.join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };
  
  // Find the currently selected pattern
  const selectedPatternObj = seasonalPatterns.find(p => p.topicId === selectedPattern);
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarIcon sx={{ mr: 1 }} color="primary" />
            Seasonal Analysis
          </Typography>
          <Tooltip title="Identifies cyclical patterns in physician question frequency">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', my: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : seasonalPatterns.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', my: 2 }}>
            <Typography>No significant seasonal patterns found.</Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3 }}>
              {renderPatternCards()}
            </Box>
            
            {selectedPatternObj && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedPatternObj.name} - Seasonal Pattern
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Pattern Type: {selectedPatternObj.seasonalityType.charAt(0).toUpperCase() + selectedPatternObj.seasonalityType.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Phase: {getPositionText(selectedPatternObj.currentPosition)}
                    </Typography>
                  </Stack>
                </Box>
                
                <Box sx={{ height: 320 }} ref={chartRef}></Box>
                
                {selectedPatternObj.nextPredictedChange && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2">
                      Next Predicted Change
                    </Typography>
                    <Typography variant="body2">
                      {selectedPatternObj.name} is expected to {selectedPatternObj.nextPredictedChange.direction === 'up' ? 'increase' : 'decrease'} in {selectedPatternObj.nextPredictedChange.estimatedTimeframe} (confidence: {(selectedPatternObj.nextPredictedChange.confidence * 100).toFixed(0)}%)
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
        
        {!loading && seasonalPatterns.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Based on {dashboardContext.dateRange[0].getFullYear()}-{dashboardContext.dateRange[1].getFullYear()} physician question data
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 