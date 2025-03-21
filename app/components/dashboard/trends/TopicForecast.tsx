/**
 * TopicForecast Component
 * 
 * Visualizes predicted future trends in medical topics,
 * showing projected growth/decline over the next weeks to months.
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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';
import { DashboardContext } from '../DashboardContext';
import { trendAnalysisService } from '../../../services/analytics/trends';
import { TopicForecast as TopicForecastType } from '../../../services/analytics/trends';
import { QuestionContext } from '../../../types/analytics';
import * as d3 from 'd3';

interface TopicForecastProps {
  forecastPeriod?: '1m' | '3m' | '6m' | '12m';
  maxTopics?: number;
  significanceThreshold?: number;
  height?: number;
}

export default function TopicForecast({
  forecastPeriod = '3m',
  maxTopics = 10,
  significanceThreshold = 0.6,
  height = 400
}: TopicForecastProps) {
  const dashboardContext = useContext(DashboardContext);
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState<TopicForecastType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(forecastPeriod);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  
  // Ref for D3 visualization
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // In a real implementation, we would fetch historical question data
        // For this demo, we'll use mock data
        const mockQuestions: QuestionContext[] = Array(800).fill(null).map((_, index) => {
          // Create mock question with date spread across 2 years
          const date = new Date();
          date.setDate(date.getDate() - Math.floor(Math.random() * 730));
          
          return {
            id: `q${index}`,
            timestamp: date,
            medicalConcepts: [
              { 
                term: `Topic ${index % 30}`, 
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
        
        // Add some trending topics to the mock data
        const trendingTopics = [
          { term: 'AI in Diagnostics', category: 'technology', growth: 0.85 },
          { term: 'Precision Medicine', category: 'treatment', growth: 0.65 },
          { term: 'Gut Microbiome', category: 'research', growth: 0.55 },
          { term: 'Telehealth', category: 'care delivery', growth: 0.5 },
          { term: 'mRNA Therapeutics', category: 'drug', growth: 0.75 },
          { term: 'Mental Health', category: 'condition', growth: 0.45 },
          { term: 'Long COVID', category: 'condition', growth: -0.2 },
          { term: 'Remote Patient Monitoring', category: 'technology', growth: 0.6 }
        ];
        
        // Add trending topics with increasing frequency over time
        mockQuestions.forEach(question => {
          const daysDiff = Math.floor((new Date().getTime() - question.timestamp.getTime()) / (1000 * 3600 * 24));
          
          trendingTopics.forEach(topic => {
            // More recent questions have higher chance of containing trending topics
            const recentBoost = Math.max(0, 1 - (daysDiff / 365));
            const probability = (topic.growth > 0 ? 
                                topic.growth * recentBoost : 
                                Math.abs(topic.growth) * (1 - recentBoost)) * 0.5;
            
            if (Math.random() < probability) {
              question.medicalConcepts.push({
                term: topic.term,
                category: topic.category,
                confidence: 0.85 + Math.random() * 0.15
              });
            }
          });
        });
        
        // Run forecast analysis for the selected period
        const periodDays = selectedPeriod === '1m' ? 30 : 
                          selectedPeriod === '3m' ? 90 : 
                          selectedPeriod === '6m' ? 180 : 365;
        
        const forecasts = await trendAnalysisService.forecastTopicTrends(mockQuestions, {
          timeframe: periodDays,
          significanceThreshold,
          maxTopics
        });
        
        setForecasts(forecasts);
      } catch (err) {
        console.error('Error fetching forecast data:', err);
        setError('Failed to load forecast data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dashboardContext.dateRange, selectedPeriod, significanceThreshold, maxTopics]);
  
  // Create the chart visualization when data is loaded
  useEffect(() => {
    if (
      loading || 
      error || 
      !forecasts.length || 
      viewMode !== 'chart' || 
      !chartRef.current
    ) {
      return;
    }
    
    // Clear existing visualization
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Create forecast chart
    const margin = { top: 20, right: 120, bottom: 60, left: 180 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom - 40;
    
    // Set up the SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", chartHeight + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Sort forecasts by projected growth
    const sortedForecasts = [...forecasts]
      .sort((a, b) => a.projectedGrowth - b.projectedGrowth);
    
    // Create X and Y scales
    const x = d3.scaleLinear()
      .domain([
        Math.min(-10, d3.min(sortedForecasts, d => d.projectedGrowth * 100) as number - 5),
        Math.max(10, d3.max(sortedForecasts, d => d.projectedGrowth * 100) as number + 5)
      ])
      .range([0, width]);
    
    const y = d3.scaleBand()
      .domain(sortedForecasts.map(d => d.topicName))
      .range([0, chartHeight])
      .padding(0.2);
    
    // Create X and Y axes
    svg.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => `${d}%`))
      .selectAll("text")
        .style("font-size", "10px");
    
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "10px")
        .style("font-weight", d => {
          const forecast = sortedForecasts.find(f => f.topicName === d);
          return forecast && Math.abs(forecast.projectedGrowth) > 0.3 ? "bold" : "normal";
        });
    
    // Add title to x-axis
    svg.append("text")
      .attr("transform", `translate(${width/2}, ${chartHeight + 40})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text(`Projected Growth % (next ${selectedPeriod})`);
    
    // Add zero line
    svg.append("line")
      .attr("x1", x(0))
      .attr("y1", 0)
      .attr("x2", x(0))
      .attr("y2", chartHeight)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4");
    
    // Add bars
    svg.selectAll(".bar")
      .data(sortedForecasts)
      .enter()
      .append("rect")
        .attr("class", "bar")
        .attr("x", d => d.projectedGrowth > 0 ? x(0) : x(d.projectedGrowth * 100))
        .attr("y", d => y(d.topicName) || 0)
        .attr("width", d => Math.abs(x(d.projectedGrowth * 100) - x(0)))
        .attr("height", y.bandwidth())
        .attr("fill", d => d.projectedGrowth > 0.15 ? "#4CAF50" : 
                          d.projectedGrowth < -0.15 ? "#F44336" : "#FFC107")
        .attr("opacity", d => Math.min(1, 0.6 + Math.abs(d.projectedGrowth)))
        .attr("rx", 2)
        .attr("ry", 2);
    
    // Add growth value labels
    svg.selectAll(".label")
      .data(sortedForecasts)
      .enter()
      .append("text")
        .attr("class", "label")
        .attr("x", d => d.projectedGrowth > 0 ? 
             x(d.projectedGrowth * 100) + 5 : 
             x(d.projectedGrowth * 100) - 5)
        .attr("y", d => (y(d.topicName) || 0) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", d => d.projectedGrowth > 0 ? "start" : "end")
        .style("font-size", "10px")
        .style("font-weight", d => Math.abs(d.projectedGrowth) > 0.3 ? "bold" : "normal")
        .text(d => `${(d.projectedGrowth * 100).toFixed(1)}%`);
    
    // Add confidence indicators
    svg.selectAll(".confidence")
      .data(sortedForecasts)
      .enter()
      .append("text")
        .attr("class", "confidence")
        .attr("x", d => d.projectedGrowth > 0 ? 
              x(d.projectedGrowth * 100) + 50 : 
              x(d.projectedGrowth * 100) - 50)
        .attr("y", d => (y(d.topicName) || 0) + y.bandwidth() / 2 + 4)
        .attr("text-anchor", "middle")
        .style("font-size", "9px")
        .style("fill", "#666")
        .text(d => `± ${(d.projectedGrowth * (1 - d.confidence) * 100).toFixed(1)}%`);
    
    // Add confidence meter
    svg.selectAll(".confidence-meter")
      .data(sortedForecasts)
      .enter()
      .append("line")
        .attr("class", "confidence-meter")
        .attr("x1", d => d.projectedGrowth > 0 ? 
              x(d.projectedGrowth * 100) + 30 : 
              x(d.projectedGrowth * 100) - 30)
        .attr("y1", d => (y(d.topicName) || 0) + y.bandwidth() / 2)
        .attr("x2", d => d.projectedGrowth > 0 ? 
              x(d.projectedGrowth * 100) + 30 + 40 * d.confidence : 
              x(d.projectedGrowth * 100) - 30 - 40 * d.confidence)
        .attr("y2", d => (y(d.topicName) || 0) + y.bandwidth() / 2)
        .attr("stroke", d => d.confidence > 0.8 ? "#4CAF50" : 
                            d.confidence > 0.6 ? "#FFC107" : "#F44336")
        .attr("stroke-width", 2);
  }, [loading, error, forecasts, viewMode, selectedPeriod, height]);
  
  // Helper to get trend icon
  const getTrendIcon = (growth: number) => {
    if (growth > 0.15) return <TrendingUpIcon fontSize="small" color="success" />;
    if (growth < -0.15) return <TrendingDownIcon fontSize="small" color="error" />;
    return <TrendingFlatIcon fontSize="small" color="warning" />;
  };
  
  // Helper to get trend text
  const getTrendText = (growth: number): string => {
    if (growth > 0.30) return 'Strong Growth';
    if (growth > 0.15) return 'Growth';
    if (growth < -0.30) return 'Strong Decline';
    if (growth < -0.15) return 'Decline';
    return 'Stable';
  };
  
  // Helper to get trend color
  const getTrendColor = (growth: number): string => {
    if (growth > 0.15) return 'success';
    if (growth < -0.15) return 'error';
    return 'warning';
  };
  
  // Helper to get confidence text
  const getConfidenceText = (confidence: number): string => {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.6) return 'Medium';
    return 'Low';
  };
  
  // Helper to get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence > 0.8) return 'success';
    if (confidence > 0.6) return 'warning';
    return 'error';
  };
  
  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedPeriod(event.target.value as string);
  };
  
  const handleViewModeChange = (_: React.SyntheticEvent, newValue: 'chart' | 'table') => {
    setViewMode(newValue);
  };
  
  // Render table view
  const renderTable = () => {
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: height - 140 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Topic</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="center">Projected Growth</TableCell>
              <TableCell align="center">Direction</TableCell>
              <TableCell align="center">Confidence</TableCell>
              <TableCell>Drivers</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {forecasts
              .sort((a, b) => Math.abs(b.projectedGrowth) - Math.abs(a.projectedGrowth))
              .map((forecast) => (
                <TableRow key={forecast.topicId}>
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ fontWeight: Math.abs(forecast.projectedGrowth) > 0.3 ? 'bold' : 'normal' }}
                  >
                    {forecast.topicName}
                  </TableCell>
                  <TableCell>{forecast.category}</TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: getTrendColor(forecast.projectedGrowth) + '.main'
                      }}
                    >
                      {(forecast.projectedGrowth * 100).toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={getTrendText(forecast.projectedGrowth)}
                      color={getTrendColor(forecast.projectedGrowth) as "success" | "error" | "warning"}
                      icon={getTrendIcon(forecast.projectedGrowth)}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={getConfidenceText(forecast.confidence)}
                      color={getConfidenceColor(forecast.confidence) as "success" | "error" | "warning"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'block' }}>
                      {forecast.growthDrivers.slice(0, 2).join(', ')}
                      {forecast.growthDrivers.length > 2 && '...'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };
  
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1 }} color="primary" />
            Topic Forecast
          </Typography>
          <Tooltip title="Predicts future trends in medical topics based on historical patterns">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="forecast-period-label">Period</InputLabel>
            <Select
              labelId="forecast-period-label"
              value={selectedPeriod}
              label="Period"
              onChange={handlePeriodChange}
            >
              <MenuItem value="1m">1 Month</MenuItem>
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="12m">12 Months</MenuItem>
            </Select>
          </FormControl>
          
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 0 }}
          >
            <Tab 
              value="chart" 
              icon={<BarChartIcon fontSize="small" />} 
              iconPosition="start"
              label="Chart" 
              sx={{ minHeight: 0, py: 1 }} 
            />
            <Tab 
              value="table" 
              icon={<TableChartIcon fontSize="small" />} 
              iconPosition="start"
              label="Table" 
              sx={{ minHeight: 0, py: 1 }} 
            />
          </Tabs>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height - 140 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', color: 'error.main', my: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : forecasts.length === 0 ? (
          <Box sx={{ textAlign: 'center', color: 'text.secondary', my: 2 }}>
            <Typography>No significant forecast data available.</Typography>
          </Box>
        ) : (
          <Box>
            {viewMode === 'chart' ? (
              <Box ref={chartRef} sx={{ height: height - 140 }} />
            ) : (
              renderTable()
            )}
          </Box>
        )}
        
        {!loading && forecasts.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Based on historical patterns from {dashboardContext.dateRange[0].getFullYear()}-{dashboardContext.dateRange[1].getFullYear()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
} 