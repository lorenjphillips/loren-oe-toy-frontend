/**
 * TemporalPatterns Component
 * 
 * Visualizes metrics over time with trend analysis capabilities,
 * allowing users to identify patterns, seasonality, and anomalies.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  createResponsiveSvg,
  createTooltip,
  showTooltip,
  hideTooltip,
  applyTransition,
  formatLargeNumber
} from '../../services/d3Integration';
import { DashboardTheme, getTheme } from '../../styles/dashboardTheme';

// Time series data point interface
export interface TimeSeriesPoint {
  date: Date;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

// Time series data interface
export interface TimeSeriesData {
  id: string;
  name: string;
  color?: string;
  data: TimeSeriesPoint[];
  trendline?: boolean;
  area?: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  showPoints?: boolean;
}

// Time range type for filtering
export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL' | 'CUSTOM';

// Temporal patterns props interface
export interface TemporalPatternsProps {
  data: TimeSeriesData[];
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
  theme?: DashboardTheme;
  dateFormat?: string;
  valueFormat?: (value: number) => string;
  onSeriesClick?: (series: TimeSeriesData) => void;
  onPointClick?: (point: TimeSeriesPoint, series: TimeSeriesData) => void;
  timeRanges?: TimeRange[];
  initialTimeRange?: TimeRange;
  yAxisMin?: number;
  yAxisMax?: number;
  showControls?: boolean;
  annotations?: Array<{
    date: Date;
    label: string;
    color?: string;
    position?: 'top' | 'bottom';
  }>;
  className?: string;
  lineThickness?: number;
  pointRadius?: number;
  highlightPoints?: boolean;
  enableZoom?: boolean;
  showBrush?: boolean;
  showRangeSelector?: boolean;
  anomalyDetection?: boolean;
  anomalyThreshold?: number;
}

const TemporalPatterns: React.FC<TemporalPatternsProps> = ({
  data,
  title = 'Temporal Patterns',
  subtitle,
  width = 800,
  height = 500,
  xAxisLabel = 'Time',
  yAxisLabel = 'Value',
  showLegend = true,
  showGrid = true,
  showTooltips = true,
  theme = getTheme('light', 'pharma-blue'),
  dateFormat = '%b %d, %Y',
  valueFormat = (value: number) => formatLargeNumber(value),
  onSeriesClick,
  onPointClick,
  timeRanges = ['1M', '3M', '6M', '1Y', 'ALL'],
  initialTimeRange = '3M',
  yAxisMin,
  yAxisMax,
  showControls = true,
  annotations = [],
  className = '',
  lineThickness = 2,
  pointRadius = 4,
  highlightPoints = true,
  enableZoom = true,
  showBrush = false,
  showRangeSelector = true,
  anomalyDetection = false,
  anomalyThreshold = 2.5
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [currentTimeRange, setCurrentTimeRange] = useState<TimeRange>(initialTimeRange);
  const [brushExtent, setBrushExtent] = useState<[Date, Date] | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ seriesId: string, point: TimeSeriesPoint } | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data.length) return;
    
    // Preprocess data - calculate min/max dates across all series
    const allPoints = data.flatMap(series => series.data);
    const dateExtent = d3.extent(allPoints, d => d.date) as [Date, Date];
    
    // Apply time range filter
    const filteredData = applyTimeRange(data, currentTimeRange, dateExtent);
    
    // Calculate min/max values after filtering
    const valueMin = yAxisMin !== undefined ? yAxisMin : 
      d3.min(filteredData, series => d3.min(series.data, d => d.value)) || 0;
    const valueMax = yAxisMax !== undefined ? yAxisMax :
      d3.max(filteredData, series => d3.max(series.data, d => d.value)) || 100;
      
    // Calculate filtered date extent
    const filteredDateExtent = brushExtent || 
      d3.extent(filteredData.flatMap(series => series.data), d => d.date) as [Date, Date];
    
    // Clear previous visualization
    d3.select(containerRef.current).selectAll('*').remove();
    
    // Prepare dimensions
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
    if (showLegend) {
      margin.bottom += 40;
    }
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = createResponsiveSvg({
      container: `#${containerRef.current.id}`,
      width,
      height,
      margin,
      transitionDuration: 750
    });
    
    // Get chart group
    const chartGroup = svg.select('.chart-area');
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create scales
    const xScale = d3.scaleTime()
      .domain(filteredDateExtent)
      .range([0, innerWidth]);
      
    const yScale = d3.scaleLinear()
      .domain([
        valueMin - (valueMax - valueMin) * 0.05, // Add 5% padding to the range
        valueMax + (valueMax - valueMin) * 0.05
      ])
      .range([innerHeight, 0]);
      
    // Create axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(width > 600 ? 10 : 5)
      .tickFormat(d => d3.timeFormat(dateFormat)(d as Date));
      
    const yAxis = d3.axisLeft(yScale)
      .ticks(height > 300 ? 10 : 5)
      .tickFormat(d => typeof d === 'number' ? valueFormat(d) : '');
    
    // Add grid lines if enabled
    if (showGrid) {
      // Add horizontal grid lines
      chartGroup.append('g')
        .attr('class', 'grid-lines y-grid')
        .selectAll('line')
        .data(yScale.ticks(10))
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d))
        .attr('stroke', theme.colors.border)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '2,2');
        
      // Add vertical grid lines
      chartGroup.append('g')
        .attr('class', 'grid-lines x-grid')
        .selectAll('line')
        .data(xScale.ticks(10))
        .enter()
        .append('line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', theme.colors.border)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '2,2');
    }
    
    // Add title
    chartGroup.append('text')
      .attr('class', 'chart-title')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '1.2em')
      .style('font-weight', 'bold')
      .style('fill', theme.colors.text.primary)
      .text(title);
      
    // Add subtitle if provided
    if (subtitle) {
      chartGroup.append('text')
        .attr('class', 'chart-subtitle')
        .attr('x', innerWidth / 2)
        .attr('y', -margin.top / 2 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.9em')
        .style('fill', theme.colors.text.secondary)
        .text(subtitle);
    }
    
    // Add x-axis
    chartGroup.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis as any)
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.primary);
      
    // Add y-axis
    chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis as any)
      .selectAll('text')
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.primary);
      
    // Add axis labels
    // X-axis label
    chartGroup.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.9em')
      .style('fill', theme.colors.text.primary)
      .text(xAxisLabel);
      
    // Y-axis label
    chartGroup.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.9em')
      .style('fill', theme.colors.text.primary)
      .text(yAxisLabel);
    
    // Create clip path for the chart area
    const clipId = `clip-${containerRef.current.id}`;
    
    svg.append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('x', 0)
      .attr('y', 0);
      
    // Create main chart group with clipping
    const seriesGroup = chartGroup.append('g')
      .attr('class', 'series-group')
      .attr('clip-path', `url(#${clipId})`);
      
    // Create line generator
    const lineGenerator = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
      
    // Create area generator for filled areas
    const areaGenerator = d3.area<TimeSeriesPoint>()
      .x(d => xScale(d.date))
      .y0(innerHeight)
      .y1(d => yScale(d.value))
      .curve(d3.curveMonotoneX);
      
    // Create overlay for mouse events
    const overlay = chartGroup.append('rect')
      .attr('class', 'overlay')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');
      
    // Function to calculate trendline using linear regression
    const calculateTrendline = (points: TimeSeriesPoint[]): [TimeSeriesPoint, TimeSeriesPoint] => {
      // Convert dates to numeric values (milliseconds since epoch)
      const xValues = points.map(d => d.date.getTime());
      const yValues = points.map(d => d.value);
      
      // Calculate means
      const xMean = d3.mean(xValues) || 0;
      const yMean = d3.mean(yValues) || 0;
      
      // Calculate linear regression coefficients
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < points.length; i++) {
        numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
        denominator += Math.pow(xValues[i] - xMean, 2);
      }
      
      const slope = denominator !== 0 ? numerator / denominator : 0;
      const intercept = yMean - slope * xMean;
      
      // Create start and end points for the trendline
      const startDate = points[0].date;
      const endDate = points[points.length - 1].date;
      
      const startValue = slope * startDate.getTime() + intercept;
      const endValue = slope * endDate.getTime() + intercept;
      
      return [
        { date: startDate, value: startValue },
        { date: endDate, value: endValue }
      ];
    };
    
    // Function to detect anomalies using Z-score
    const detectAnomalies = (points: TimeSeriesPoint[], threshold: number): TimeSeriesPoint[] => {
      const values = points.map(d => d.value);
      const mean = d3.mean(values) || 0;
      const stdDev = Math.sqrt(d3.variance(values) || 0);
      
      if (stdDev === 0) return [];
      
      return points.filter(point => {
        const zScore = Math.abs((point.value - mean) / stdDev);
        return zScore > threshold;
      });
    };
    
    // Get visualization colors from theme or use defaults
    const visualizationColors = theme.visualizations?.primary || 
      ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'];
    
    // Draw each series
    filteredData.forEach((series, i) => {
      const seriesColor = series.color || visualizationColors[i % visualizationColors.length];
      const opacity = selectedSeries.length === 0 || selectedSeries.includes(series.id) ? 1 : 0.3;
      const isHighlighted = selectedSeries.includes(series.id) || selectedSeries.length === 0;
      
      const lineGroup = seriesGroup.append('g')
        .attr('class', `series-${series.id}`)
        .style('cursor', 'pointer');
        
      // Draw area if enabled
      if (series.area) {
        lineGroup.append('path')
          .datum(series.data)
          .attr('class', `area-${series.id}`)
          .attr('d', areaGenerator as any)
          .attr('fill', seriesColor)
          .attr('fill-opacity', opacity * 0.2)
          .attr('stroke', 'none');
      }
      
      // Set line style based on configuration
      let dashArray = '0';
      if (series.lineStyle === 'dashed') {
        dashArray = '6,3';
      } else if (series.lineStyle === 'dotted') {
        dashArray = '2,2';
      }
      
      // Draw the line
      lineGroup.append('path')
        .datum(series.data)
        .attr('class', `line-${series.id}`)
        .attr('d', lineGenerator as any)
        .attr('fill', 'none')
        .attr('stroke', seriesColor)
        .attr('stroke-width', lineThickness)
        .attr('stroke-opacity', opacity)
        .attr('stroke-dasharray', dashArray)
        .on('mouseover', () => {
          if (selectedSeries.length === 0 || selectedSeries.includes(series.id)) {
            d3.select(`.line-${series.id}`)
              .attr('stroke-width', lineThickness * 1.5);
          }
        })
        .on('mouseout', () => {
          d3.select(`.line-${series.id}`)
            .attr('stroke-width', lineThickness);
        })
        .on('click', () => {
          if (onSeriesClick) {
            onSeriesClick(series);
          }
          
          // Toggle series selection
          if (selectedSeries.includes(series.id)) {
            setSelectedSeries(selectedSeries.filter(id => id !== series.id));
          } else {
            setSelectedSeries([...selectedSeries, series.id]);
          }
        });
      
      // Draw trendline if enabled
      if (series.trendline && series.data.length > 1) {
        const trendPoints = calculateTrendline(series.data);
        
        lineGroup.append('path')
          .datum(trendPoints)
          .attr('class', `trendline-${series.id}`)
          .attr('d', lineGenerator as any)
          .attr('fill', 'none')
          .attr('stroke', seriesColor)
          .attr('stroke-width', 1.5)
          .attr('stroke-opacity', opacity * 0.7)
          .attr('stroke-dasharray', '5,3');
      }
      
      // Draw points if enabled
      if (series.showPoints || highlightPoints) {
        const pointsGroup = lineGroup.append('g')
          .attr('class', `points-${series.id}`);
          
        // Find anomalies if anomaly detection is enabled
        const anomalies = anomalyDetection ? detectAnomalies(series.data, anomalyThreshold) : [];
        const anomalyIds = new Set(anomalies.map(a => a.date.getTime()));
        
        // Draw data points
        series.data.forEach(point => {
          const isAnomaly = anomalyIds.has(point.date.getTime());
          
          const pointElement = pointsGroup.append('circle')
            .attr('class', `point-${series.id}-${point.date.getTime()}`)
            .attr('cx', xScale(point.date))
            .attr('cy', yScale(point.value))
            .attr('r', isAnomaly ? pointRadius * 1.5 : pointRadius)
            .attr('fill', isAnomaly ? theme.colors.error : seriesColor)
            .attr('stroke', theme.colors.background)
            .attr('stroke-width', 1)
            .attr('opacity', series.showPoints ? opacity : 0) // Initially hide if showPoints is false
            .style('cursor', 'pointer')
            .on('mouseover', (event) => {
              // Show point on hover if not always showing points
              pointElement
                .attr('opacity', 1)
                .attr('r', isAnomaly ? pointRadius * 2 : pointRadius * 1.5);
                
              if (showTooltips) {
                let tooltipContent = `
                  <div style="padding: 8px;">
                    <div style="font-weight: bold; margin-bottom: 4px;">${series.name}</div>
                    <div>Date: ${d3.timeFormat(dateFormat)(point.date)}</div>
                    <div>Value: ${valueFormat(point.value)}</div>
                `;
                
                if (point.label) {
                  tooltipContent += `<div>${point.label}</div>`;
                }
                
                if (isAnomaly) {
                  tooltipContent += `<div style="color: ${theme.colors.error}; font-weight: bold;">Anomaly Detected</div>`;
                }
                
                if (point.metadata) {
                  Object.entries(point.metadata).forEach(([key, value]) => {
                    tooltipContent += `<div>${key}: ${value}</div>`;
                  });
                }
                
                tooltipContent += '</div>';
                
                showTooltip(tooltip, tooltipContent, event);
              }
              
              setHoveredPoint({ seriesId: series.id, point });
            })
            .on('mouseout', () => {
              // Hide point if not set to always show points
              pointElement
                .attr('opacity', series.showPoints ? opacity : 0)
                .attr('r', isAnomaly ? pointRadius * 1.5 : pointRadius);
                
              if (showTooltips) {
                hideTooltip(tooltip);
              }
              
              setHoveredPoint(null);
            })
            .on('click', (event) => {
              if (onPointClick) {
                onPointClick(point, series);
              }
              
              // Prevent event bubbling
              event.stopPropagation();
            });
        });
      }
    });
    
    // Add annotations if any
    if (annotations.length > 0) {
      const annotationsGroup = chartGroup.append('g')
        .attr('class', 'annotations-group');
        
      annotations.forEach(annotation => {
        const x = xScale(annotation.date);
        if (x < 0 || x > innerWidth) return; // Skip off-chart annotations
        
        const color = annotation.color || theme.colors.warning;
        const position = annotation.position || 'top';
        const y = position === 'top' ? 0 : innerHeight;
        const textY = position === 'top' ? -5 : innerHeight + 15;
        
        // Add vertical line
        annotationsGroup.append('line')
          .attr('class', 'annotation-line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', innerHeight)
          .attr('stroke', color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '5,3');
          
        // Add annotation label
        annotationsGroup.append('text')
          .attr('class', 'annotation-label')
          .attr('x', x)
          .attr('y', textY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', position === 'top' ? 'auto' : 'hanging')
          .style('font-size', '0.8em')
          .style('font-weight', 'bold')
          .style('fill', color)
          .text(annotation.label);
      });
    }
    
    // Add time range selector if enabled
    if (showRangeSelector && timeRanges.length > 0) {
      const timeRangeGroup = chartGroup.append('g')
        .attr('class', 'time-range-group')
        .attr('transform', `translate(0, ${-margin.top / 2 + 30})`);
        
      const buttonWidth = 40;
      const buttonHeight = 22;
      const buttonSpacing = 5;
      
      timeRangeGroup.append('text')
        .attr('x', 0)
        .attr('y', -5)
        .style('font-size', '0.8em')
        .style('fill', theme.colors.text.secondary)
        .text('Time Range:');
        
      // Add time range buttons
      timeRanges.forEach((range, i) => {
        const buttonX = i * (buttonWidth + buttonSpacing) + 80;
        
        const buttonGroup = timeRangeGroup.append('g')
          .attr('class', `range-button button-${range}`)
          .attr('transform', `translate(${buttonX}, 0)`)
          .style('cursor', 'pointer')
          .on('click', () => {
            setCurrentTimeRange(range);
            // Reset brush extent when changing time range
            setBrushExtent(null);
          });
          
        // Button background
        buttonGroup.append('rect')
          .attr('width', buttonWidth)
          .attr('height', buttonHeight)
          .attr('rx', 4)
          .attr('fill', currentTimeRange === range ? theme.colors.primary : theme.colors.surface)
          .attr('stroke', theme.colors.border)
          .attr('stroke-width', 1);
          
        // Button text
        buttonGroup.append('text')
          .attr('x', buttonWidth / 2)
          .attr('y', buttonHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '0.7em')
          .style('fill', currentTimeRange === range ? '#ffffff' : theme.colors.text.primary)
          .text(range);
      });
    }
    
    // Add brush if enabled
    if (showBrush) {
      const brushGroup = chartGroup.append('g')
        .attr('class', 'brush-group');
        
      const brush = d3.brushX()
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on('end', (event) => {
          if (!event.selection) {
            // Reset brush
            setBrushExtent(null);
            return;
          }
          
          // Convert brush selection from pixels to dates
          const [x0, x1] = event.selection as [number, number];
          const newExtent: [Date, Date] = [xScale.invert(x0), xScale.invert(x1)];
          setBrushExtent(newExtent);
        });
        
      brushGroup.call(brush as any);
      
      // Add reset button
      const resetButton = chartGroup.append('g')
        .attr('class', 'reset-button')
        .attr('transform', `translate(${innerWidth - 60}, -20)`)
        .style('cursor', 'pointer')
        .style('display', brushExtent ? 'block' : 'none')
        .on('click', () => {
          setBrushExtent(null);
          // TypeScript workaround - brushGroup.call(brush.clear) needs proper typing
          (brush as any).clear(brushGroup as any);
        });
        
      resetButton.append('rect')
        .attr('width', 60)
        .attr('height', 22)
        .attr('rx', 4)
        .attr('fill', theme.colors.surface)
        .attr('stroke', theme.colors.border)
        .attr('stroke-width', 1);
        
      resetButton.append('text')
        .attr('x', 30)
        .attr('y', 12)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '0.7em')
        .style('fill', theme.colors.text.primary)
        .text('Reset Zoom');
    }
    
    // Add legend if enabled
    if (showLegend && filteredData.length > 0) {
      const legendGroup = chartGroup.append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(0, ${innerHeight + 40})`);
        
      const legendItemWidth = 130;
      const legendItemHeight = 20;
      const legendColumns = Math.min(Math.floor(innerWidth / legendItemWidth), filteredData.length);
      const legendRows = Math.ceil(filteredData.length / legendColumns);
      
      filteredData.forEach((series, i) => {
        const row = Math.floor(i / legendColumns);
        const column = i % legendColumns;
        const x = column * legendItemWidth;
        const y = row * legendItemHeight;
        
        const seriesColor = series.color || visualizationColors[i % visualizationColors.length];
        const opacity = selectedSeries.length === 0 || selectedSeries.includes(series.id) ? 1 : 0.3;
        
        const legendItem = legendGroup.append('g')
          .attr('class', `legend-item-${series.id}`)
          .attr('transform', `translate(${x}, ${y})`)
          .style('cursor', 'pointer')
          .on('click', () => {
            // Toggle series selection
            if (selectedSeries.includes(series.id)) {
              setSelectedSeries(selectedSeries.filter(id => id !== series.id));
            } else {
              setSelectedSeries([...selectedSeries, series.id]);
            }
          });
          
        // Legend item color box
        legendItem.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('rx', 2)
          .attr('fill', seriesColor)
          .attr('opacity', opacity);
          
        // Show line style if set
        if (series.lineStyle) {
          let dashArray = '0';
          if (series.lineStyle === 'dashed') {
            dashArray = '6,3';
          } else if (series.lineStyle === 'dotted') {
            dashArray = '2,2';
          }
          
          legendItem.append('line')
            .attr('x1', 0)
            .attr('y1', 6)
            .attr('x2', 12)
            .attr('y2', 6)
            .attr('stroke', seriesColor)
            .attr('stroke-width', 2)
            .attr('opacity', opacity)
            .attr('stroke-dasharray', dashArray);
        }
          
        // Legend item text
        legendItem.append('text')
          .attr('x', 20)
          .attr('y', 10)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '0.8em')
          .style('fill', theme.colors.text.primary)
          .style('opacity', opacity)
          .text(series.name);
      });
    }
    
    // Set up zoom behavior if enabled
    if (enableZoom) {
      const zoom = d3.zoom()
        .scaleExtent([1, 10])
        .extent([[0, 0], [innerWidth, innerHeight]])
        .translateExtent([[0, 0], [innerWidth, innerHeight]])
        .on('zoom', (event) => {
          // Apply zoom transform to chart elements
          const transform = event.transform;
          
          // Update x-scale and redraw elements
          const zoomedXScale = transform.rescaleX(xScale);
          
          // Update axes
          chartGroup.select('.x-axis').call(xAxis.scale(zoomedXScale) as any);
          
          // Update grid lines
          if (showGrid) {
            chartGroup.selectAll('.x-grid line')
              .attr('x1', d => zoomedXScale(d))
              .attr('x2', d => zoomedXScale(d));
          }
          
          // Update lines, areas, and points for each series
          filteredData.forEach(series => {
            // Update line
            seriesGroup.select(`.line-${series.id}`)
              .attr('d', lineGenerator.x(d => zoomedXScale(d.date)) as any);
              
            // Update area if present
            if (series.area) {
              seriesGroup.select(`.area-${series.id}`)
                .attr('d', areaGenerator.x(d => zoomedXScale(d.date)) as any);
            }
            
            // Update trendline if present
            if (series.trendline) {
              seriesGroup.select(`.trendline-${series.id}`)
                .attr('d', lineGenerator.x(d => zoomedXScale(d.date)) as any);
            }
            
            // Update points
            if (series.showPoints || highlightPoints) {
              series.data.forEach(point => {
                seriesGroup.select(`.point-${series.id}-${point.date.getTime()}`)
                  .attr('cx', zoomedXScale(point.date));
              });
            }
          });
          
          // Update annotations
          annotations.forEach((annotation, i) => {
            const x = zoomedXScale(annotation.date);
            // Get DOM nodes with proper type assertion
            const lines = chartGroup.selectAll('.annotation-line').nodes();
            const labels = chartGroup.selectAll('.annotation-label').nodes();
            
            // Only modify elements if they exist
            if (lines[i] && lines[i] instanceof SVGElement) {
              (lines[i] as SVGElement).setAttribute('x1', String(x));
              (lines[i] as SVGElement).setAttribute('x2', String(x));
            }
            
            if (labels[i] && labels[i] instanceof SVGElement) {
              (labels[i] as SVGElement).setAttribute('x', String(x));
            }
          });
        });
        
      // Apply zoom behavior to overlay with type assertion
      (overlay.node() as Element).addEventListener('mousedown', () => {
        // Workaround for d3 zoom type issues
      });
      overlay.call(zoom as any);
    }
  }, [
    data,
    width,
    height,
    xAxisLabel,
    yAxisLabel,
    showLegend,
    showGrid,
    showTooltips,
    theme,
    dateFormat,
    valueFormat,
    onSeriesClick,
    onPointClick,
    timeRanges,
    currentTimeRange,
    brushExtent,
    yAxisMin,
    yAxisMax,
    showControls,
    annotations,
    lineThickness,
    pointRadius,
    highlightPoints,
    enableZoom,
    showBrush,
    showRangeSelector,
    anomalyDetection,
    anomalyThreshold,
    selectedSeries,
    hoveredPoint
  ]);
  
  // Helper function to apply time range filter
  const applyTimeRange = (seriesData: TimeSeriesData[], range: TimeRange, fullDateExtent: [Date, Date]): TimeSeriesData[] => {
    const [minDate, maxDate] = fullDateExtent;
    
    if (range === 'ALL' || range === 'CUSTOM') {
      return seriesData;
    }
    
    const now = new Date();
    let filterDate: Date;
    
    switch (range) {
      case '1W':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '3M':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        filterDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1Y':
        filterDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'YTD':
        filterDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return seriesData;
    }
    
    return seriesData.map(series => ({
      ...series,
      data: series.data.filter(point => point.date >= filterDate)
    }));
  };
  
  // Generate unique ID for the container
  const containerId = `temporal-patterns-${Math.random().toString(36).substring(2, 11)}`;
  
  return (
    <div
      id={containerId}
      ref={containerRef}
      className={`temporal-patterns-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: `${height}px`,
        backgroundColor: theme.colors.background,
        borderRadius: theme.shape.borderRadius.medium,
        boxShadow: theme.shadows.low,
        padding: theme.spacing.md
      }}
    />
  );
};

export default TemporalPatterns; 