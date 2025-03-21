/**
 * QualityDistribution Component
 * 
 * Visualizes impression quality metrics distribution with histogram or violin plots,
 * showing the distribution of quality scores across different categories.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  createResponsiveSvg, 
  createTooltip, 
  showTooltip, 
  hideTooltip, 
  applyTransition,
  createLegend,
  formatLargeNumber
} from '../../services/d3Integration';
import { DashboardTheme, getTheme } from '../../styles/dashboardTheme';

// Quality metric data point interface
export interface QualityMetric {
  id: string;
  label: string;
  values: number[];
  color?: string;
}

// Quality distribution chart props interface
export interface QualityDistributionProps {
  data: QualityMetric[];
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  domainMin?: number;
  domainMax?: number;
  chartType?: 'histogram' | 'violin' | 'box';
  showMean?: boolean;
  showMedian?: boolean;
  showTooltips?: boolean;
  bins?: number;
  theme?: DashboardTheme;
  onCategoryClick?: (category: QualityMetric) => void;
  xAxisLabel?: string;
  yAxisLabel?: string;
  className?: string;
}

const QualityDistribution: React.FC<QualityDistributionProps> = ({
  data,
  title = 'Quality Distribution',
  subtitle,
  width = 700,
  height = 400,
  domainMin = 0,
  domainMax = 100,
  chartType = 'violin',
  showMean = true,
  showMedian = true,
  showTooltips = true,
  bins = 20,
  theme = getTheme('light', 'pharma-blue'),
  onCategoryClick,
  xAxisLabel = 'Categories',
  yAxisLabel = 'Quality Score',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data.length) return;
    
    // Clear previous visualization
    d3.select(containerRef.current).selectAll('*').remove();
    
    // Prepare dimensions
    const margin = { top: 60, right: 30, bottom: 60, left: 60 };
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
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([0, innerWidth])
      .padding(0.1);
      
    const yScale = d3.scaleLinear()
      .domain([domainMin, domainMax])
      .range([innerHeight, 0]);
      
    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
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
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.primary);
      
    // Add y-axis
    chartGroup.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.primary);
      
    // Add axis labels
    // X-axis label
    chartGroup.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
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
    
    // Create main chart group
    const distributionGroup = chartGroup.append('g')
      .attr('class', 'distribution-group');
    
    // Helper function for calculating statistics
    const calculateStats = (values: number[]) => {
      const sortedValues = [...values].sort((a, b) => a - b);
      const min = d3.min(values) || 0;
      const max = d3.max(values) || 0;
      const q1 = d3.quantile(sortedValues, 0.25) || 0;
      const median = d3.quantile(sortedValues, 0.5) || 0;
      const q3 = d3.quantile(sortedValues, 0.75) || 0;
      const mean = d3.mean(values) || 0;
      const std = Math.sqrt(d3.variance(values) || 0);
      
      return { min, max, q1, median, q3, mean, std };
    };
    
    // Draw based on chart type
    if (chartType === 'histogram') {
      // Histogram implementation
      data.forEach((metric, i) => {
        const color = metric.color || theme.visualizations.primary[i % theme.visualizations.primary.length];
        const histogramGenerator = d3.histogram<number, number>()
          .domain([domainMin, domainMax])
          .thresholds(bins);
          
        const bins = histogramGenerator(metric.values);
        const maxBinCount = d3.max(bins, d => d.length) || 0;
        
        // Calculate scaled bin width
        const binWidth = xScale.bandwidth() * 0.8;
        const binX = xScale(metric.label)! + xScale.bandwidth() * 0.1;
        
        // Draw histogram bars
        const histGroup = distributionGroup.append('g')
          .attr('class', `histogram-${metric.id}`)
          .attr('transform', `translate(${binX}, 0)`);
          
        const opacity = selectedCategory === null || selectedCategory === metric.id ? 1 : 0.4;
        
        bins.forEach((bin, j) => {
          const barHeight = (bin.length / maxBinCount) * innerHeight * 0.8;
          const barY = yScale(bin.x0!);
          
          histGroup.append('rect')
            .attr('x', 0)
            .attr('y', barY - barHeight)
            .attr('width', binWidth)
            .attr('height', barHeight)
            .attr('fill', color)
            .attr('opacity', opacity)
            .attr('stroke', theme.colors.background)
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', (event) => {
              // Show tooltip
              const tooltipContent = `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${metric.label}</div>
                  <div>Range: ${bin.x0?.toFixed(1)} - ${bin.x1?.toFixed(1)}</div>
                  <div>Count: ${bin.length}</div>
                  <div>Percentage: ${((bin.length / metric.values.length) * 100).toFixed(1)}%</div>
                </div>
              `;
              
              if (showTooltips) {
                showTooltip(tooltip, tooltipContent, event);
              }
            })
            .on('mouseout', () => {
              if (showTooltips) {
                hideTooltip(tooltip);
              }
            })
            .on('click', () => {
              if (onCategoryClick) {
                onCategoryClick(metric);
              }
              
              // Toggle selection
              if (selectedCategory === metric.id) {
                setSelectedCategory(null);
              } else {
                setSelectedCategory(metric.id);
              }
            });
        });
        
        // Add statistics lines
        const stats = calculateStats(metric.values);
        
        if (showMean) {
          histGroup.append('line')
            .attr('x1', 0)
            .attr('y1', yScale(stats.mean))
            .attr('x2', binWidth)
            .attr('y2', yScale(stats.mean))
            .attr('stroke', theme.colors.error)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,3');
            
          histGroup.append('text')
            .attr('x', binWidth + 5)
            .attr('y', yScale(stats.mean))
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '0.7em')
            .style('fill', theme.colors.error)
            .text(`Mean: ${stats.mean.toFixed(1)}`);
        }
        
        if (showMedian) {
          histGroup.append('line')
            .attr('x1', 0)
            .attr('y1', yScale(stats.median))
            .attr('x2', binWidth)
            .attr('y2', yScale(stats.median))
            .attr('stroke', theme.colors.success)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '3,2');
            
          histGroup.append('text')
            .attr('x', binWidth + 5)
            .attr('y', yScale(stats.median))
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '0.7em')
            .style('fill', theme.colors.success)
            .text(`Median: ${stats.median.toFixed(1)}`);
        }
      });
    } else if (chartType === 'violin') {
      // Violin plot implementation
      data.forEach((metric, i) => {
        const color = metric.color || theme.visualizations.primary[i % theme.visualizations.primary.length];
        const violinWidth = xScale.bandwidth() * 0.8;
        const violinX = xScale(metric.label)! + xScale.bandwidth() * 0.1;
        
        const opacity = selectedCategory === null || selectedCategory === metric.id ? 0.8 : 0.3;
        
        // Compute kernel density estimation
        const kde = kernelDensityEstimator(kernelEpanechnikov(7), 
          yScale.ticks(100));
        
        const density = kde(metric.values);
        
        // Scale density to fit within bandwidth
        const densityMax = d3.max(density, d => d[1]) || 1;
        const xDensityScale = d3.scaleLinear()
          .domain([0, densityMax])
          .range([0, violinWidth / 2]);
        
        // Create area generator
        const areaGenerator = d3.area<[number, number]>()
          .x0(d => violinWidth / 2 - xDensityScale(d[1]))
          .x1(d => violinWidth / 2 + xDensityScale(d[1]))
          .y(d => yScale(d[0]))
          .curve(d3.curveCatmullRom);
          
        // Draw violin
        const violinGroup = distributionGroup.append('g')
          .attr('class', `violin-${metric.id}`)
          .attr('transform', `translate(${violinX}, 0)`);
          
        violinGroup.append('path')
          .datum(density)
          .attr('class', 'violin-path')
          .attr('d', areaGenerator)
          .attr('fill', color)
          .attr('opacity', opacity)
          .attr('stroke', theme.colors.background)
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            if (showTooltips) {
              const stats = calculateStats(metric.values);
              const tooltipContent = `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${metric.label}</div>
                  <div>Mean: ${stats.mean.toFixed(1)}</div>
                  <div>Median: ${stats.median.toFixed(1)}</div>
                  <div>Min: ${stats.min.toFixed(1)}</div>
                  <div>Max: ${stats.max.toFixed(1)}</div>
                  <div>Standard Deviation: ${stats.std.toFixed(1)}</div>
                  <div>Number of points: ${metric.values.length}</div>
                </div>
              `;
              
              showTooltip(tooltip, tooltipContent, event);
            }
          })
          .on('mouseout', () => {
            if (showTooltips) {
              hideTooltip(tooltip);
            }
          })
          .on('click', () => {
            if (onCategoryClick) {
              onCategoryClick(metric);
            }
            
            // Toggle selection
            if (selectedCategory === metric.id) {
              setSelectedCategory(null);
            } else {
              setSelectedCategory(metric.id);
            }
          });
          
        // Add statistics lines/markers
        const stats = calculateStats(metric.values);
        
        // Box plot inside violin
        violinGroup.append('rect')
          .attr('x', violinWidth / 2 - violinWidth * 0.1)
          .attr('y', yScale(stats.q3))
          .attr('width', violinWidth * 0.2)
          .attr('height', yScale(stats.q1) - yScale(stats.q3))
          .attr('fill', 'none')
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1);
          
        // Median line
        violinGroup.append('line')
          .attr('x1', violinWidth / 2 - violinWidth * 0.1)
          .attr('y1', yScale(stats.median))
          .attr('x2', violinWidth / 2 + violinWidth * 0.1)
          .attr('y2', yScale(stats.median))
          .attr('stroke', theme.colors.success)
          .attr('stroke-width', 2);
          
        if (showMean) {
          // Mean marker (diamond)
          violinGroup.append('circle')
            .attr('cx', violinWidth / 2)
            .attr('cy', yScale(stats.mean))
            .attr('r', 4)
            .attr('fill', theme.colors.error)
            .attr('stroke', theme.colors.background)
            .attr('stroke-width', 1);
        }
        
        // Min/Max whiskers
        violinGroup.append('line')
          .attr('x1', violinWidth / 2)
          .attr('y1', yScale(stats.q1))
          .attr('x2', violinWidth / 2)
          .attr('y2', yScale(stats.min))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
          
        violinGroup.append('line')
          .attr('x1', violinWidth / 2 - violinWidth * 0.05)
          .attr('y1', yScale(stats.min))
          .attr('x2', violinWidth / 2 + violinWidth * 0.05)
          .attr('y2', yScale(stats.min))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1);
          
        violinGroup.append('line')
          .attr('x1', violinWidth / 2)
          .attr('y1', yScale(stats.q3))
          .attr('x2', violinWidth / 2)
          .attr('y2', yScale(stats.max))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
          
        violinGroup.append('line')
          .attr('x1', violinWidth / 2 - violinWidth * 0.05)
          .attr('y1', yScale(stats.max))
          .attr('x2', violinWidth / 2 + violinWidth * 0.05)
          .attr('y2', yScale(stats.max))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1);
      });
    } else if (chartType === 'box') {
      // Box plot implementation
      data.forEach((metric, i) => {
        const color = metric.color || theme.visualizations.primary[i % theme.visualizations.primary.length];
        const boxWidth = xScale.bandwidth() * 0.7;
        const boxX = xScale(metric.label)! + xScale.bandwidth() * 0.15;
        
        const opacity = selectedCategory === null || selectedCategory === metric.id ? 0.8 : 0.3;
        
        // Calculate statistics
        const stats = calculateStats(metric.values);
        
        // Draw box plot
        const boxGroup = distributionGroup.append('g')
          .attr('class', `box-${metric.id}`)
          .attr('transform', `translate(${boxX}, 0)`);
          
        // IQR box
        boxGroup.append('rect')
          .attr('x', 0)
          .attr('y', yScale(stats.q3))
          .attr('width', boxWidth)
          .attr('height', yScale(stats.q1) - yScale(stats.q3))
          .attr('fill', color)
          .attr('opacity', opacity)
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseover', (event) => {
            if (showTooltips) {
              const tooltipContent = `
                <div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 4px;">${metric.label}</div>
                  <div>Q1: ${stats.q1.toFixed(1)}</div>
                  <div>Median: ${stats.median.toFixed(1)}</div>
                  <div>Q3: ${stats.q3.toFixed(1)}</div>
                  <div>IQR: ${(stats.q3 - stats.q1).toFixed(1)}</div>
                  <div>Min: ${stats.min.toFixed(1)}</div>
                  <div>Max: ${stats.max.toFixed(1)}</div>
                  <div>Mean: ${stats.mean.toFixed(1)}</div>
                  <div>Count: ${metric.values.length}</div>
                </div>
              `;
              
              showTooltip(tooltip, tooltipContent, event);
            }
          })
          .on('mouseout', () => {
            if (showTooltips) {
              hideTooltip(tooltip);
            }
          })
          .on('click', () => {
            if (onCategoryClick) {
              onCategoryClick(metric);
            }
            
            // Toggle selection
            if (selectedCategory === metric.id) {
              setSelectedCategory(null);
            } else {
              setSelectedCategory(metric.id);
            }
          });
          
        // Median line
        boxGroup.append('line')
          .attr('x1', 0)
          .attr('y1', yScale(stats.median))
          .attr('x2', boxWidth)
          .attr('y2', yScale(stats.median))
          .attr('stroke', theme.colors.success)
          .attr('stroke-width', 2);
          
        // Whiskers
        boxGroup.append('line')
          .attr('x1', boxWidth / 2)
          .attr('y1', yScale(stats.q1))
          .attr('x2', boxWidth / 2)
          .attr('y2', yScale(stats.min))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
          
        boxGroup.append('line')
          .attr('x1', boxWidth / 4)
          .attr('y1', yScale(stats.min))
          .attr('x2', boxWidth * 3/4)
          .attr('y2', yScale(stats.min))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1);
          
        boxGroup.append('line')
          .attr('x1', boxWidth / 2)
          .attr('y1', yScale(stats.q3))
          .attr('x2', boxWidth / 2)
          .attr('y2', yScale(stats.max))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
          
        boxGroup.append('line')
          .attr('x1', boxWidth / 4)
          .attr('y1', yScale(stats.max))
          .attr('x2', boxWidth * 3/4)
          .attr('y2', yScale(stats.max))
          .attr('stroke', theme.colors.text.primary)
          .attr('stroke-width', 1);
          
        // Add mean point if requested
        if (showMean) {
          boxGroup.append('circle')
            .attr('cx', boxWidth / 2)
            .attr('cy', yScale(stats.mean))
            .attr('r', 4)
            .attr('fill', theme.colors.error)
            .attr('stroke', theme.colors.background)
            .attr('stroke-width', 1);
            
          boxGroup.append('text')
            .attr('x', boxWidth + 5)
            .attr('y', yScale(stats.mean))
            .attr('text-anchor', 'start')
            .attr('dominant-baseline', 'middle')
            .style('font-size', '0.7em')
            .style('fill', theme.colors.error)
            .text(`μ=${stats.mean.toFixed(1)}`);
        }
      });
    }
    
    // Add legend for statistics
    if (showMean || showMedian) {
      const legendItems = [];
      
      if (showMean) {
        legendItems.push({
          label: 'Mean',
          color: theme.colors.error
        });
      }
      
      if (showMedian) {
        legendItems.push({
          label: 'Median',
          color: theme.colors.success
        });
      }
      
      createLegend(svg, legendItems, {
        show: true,
        position: 'bottom',
        offsetY: 10
      });
    }
    
    // Add filter reset button
    const resetButton = chartGroup.append('g')
      .attr('class', 'reset-button')
      .attr('transform', `translate(${innerWidth - 60}, -20)`)
      .style('cursor', 'pointer')
      .on('click', () => {
        setSelectedCategory(null);
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
      .attr('y', 14)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '0.7em')
      .style('fill', theme.colors.text.primary)
      .text('Reset');
  }, [
    data, 
    width, 
    height, 
    domainMin, 
    domainMax, 
    chartType, 
    showMean, 
    showMedian, 
    showTooltips,
    bins,
    theme, 
    onCategoryClick, 
    xAxisLabel, 
    yAxisLabel,
    selectedCategory
  ]);
  
  // Kernel density estimation function
  function kernelDensityEstimator(kernel: (v: number) => number, thresholds: number[]) {
    return function(sample: number[]) {
      return thresholds.map(t => [t, d3.mean(sample, s => kernel(t - s)) || 0]);
    };
  }
  
  // Epanechnikov kernel
  function kernelEpanechnikov(bandwidth: number) {
    return (v: number) => {
      return Math.abs(v /= bandwidth) <= 1 ? 0.75 * (1 - v * v) / bandwidth : 0;
    };
  }
  
  // Generate unique ID for the container
  const containerId = `quality-dist-${Math.random().toString(36).substring(2, 11)}`;
  
  return (
    <div 
      id={containerId}
      ref={containerRef} 
      className={`quality-distribution-container ${className}`}
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

export default QualityDistribution; 