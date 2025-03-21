/**
 * CategoryHeatmap Component
 * 
 * Visualizes performance metrics across medical subcategories in a heatmap format,
 * allowing for identification of high and low performing categories.
 */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  createResponsiveSvg, 
  createTooltip, 
  showTooltip, 
  hideTooltip,
  formatLargeNumber
} from '../../services/d3Integration';
import { DashboardTheme, getTheme } from '../../styles/dashboardTheme';

// Category data point interface
export interface CategoryDataPoint {
  id: string;
  row: string; // Row category (e.g., medical specialty)
  column: string; // Column category (e.g., product or time period)
  value: number; // Primary value for the cell
  secondaryValue?: number; // Optional secondary value for comparison
  percentChange?: number; // Optional percent change
  label?: string; // Optional label for the cell
  metadata?: Record<string, any>; // Additional metadata
}

// Category heatmap props interface
export interface CategoryHeatmapProps {
  data: CategoryDataPoint[];
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  rowTitle?: string;
  columnTitle?: string;
  cellSize?: number | { width: number, height: number };
  colorRange?: [string, string] | string[];
  neutralColor?: string;
  showLegend?: boolean;
  showTooltips?: boolean;
  showBorders?: boolean;
  showLabels?: boolean;
  theme?: DashboardTheme;
  valueFormat?: (value: number) => string;
  onCellClick?: (cell: CategoryDataPoint) => void;
  onRowClick?: (row: string) => void;
  onColumnClick?: (column: string) => void;
  sortRows?: (a: string, b: string) => number;
  sortColumns?: (a: string, b: string) => number;
  highlightCondition?: (cell: CategoryDataPoint) => boolean;
  className?: string;
  emptyColor?: string;
  maxCellsBeforeScroll?: number;
}

const CategoryHeatmap: React.FC<CategoryHeatmapProps> = ({
  data,
  title = 'Category Performance',
  subtitle,
  width = 800,
  height = 500,
  rowTitle = 'Categories',
  columnTitle = 'Metrics',
  cellSize,
  colorRange,
  neutralColor,
  showLegend = true,
  showTooltips = true,
  showBorders = true,
  showLabels = true,
  theme = getTheme('light', 'pharma-blue'),
  valueFormat = (value: number) => formatLargeNumber(value),
  onCellClick,
  onRowClick,
  onColumnClick,
  sortRows,
  sortColumns,
  highlightCondition,
  className = '',
  emptyColor,
  maxCellsBeforeScroll = 100
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data.length) return;
    
    // Process data
    // Get unique rows and columns
    const rows = Array.from(new Set(data.map(d => d.row)));
    const columns = Array.from(new Set(data.map(d => d.column)));
    
    // Apply sorting if provided
    if (sortRows) {
      rows.sort(sortRows);
    }
    
    if (sortColumns) {
      columns.sort(sortColumns);
    }
    
    // Get min and max values to establish the domain for the color scale
    const values = data.map(d => d.value);
    let minValue = d3.min(values) || 0;
    let maxValue = d3.max(values) || 100;
    
    // Adjust for a centered domain if values include both positive and negative
    if (minValue < 0 && maxValue > 0) {
      const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
      minValue = -absMax;
      maxValue = absMax;
    }
    
    // Clear previous visualization
    d3.select(containerRef.current).selectAll('*').remove();
    
    // Calculate cell dimensions if not provided
    const calculatedCellSize = typeof cellSize === 'object' 
      ? cellSize
      : { 
          width: cellSize || Math.min(Math.floor((width - 150) / columns.length), 80),
          height: cellSize || Math.min(Math.floor((height - 150) / rows.length), 40)
        };
        
    // Adjust dimensions based on cell size if needed
    // But keep original width and height as maximums
    const gridWidth = columns.length * calculatedCellSize.width;
    const gridHeight = rows.length * calculatedCellSize.height;
    
    // Determine if we need scrolling
    const needsScrolling = rows.length * columns.length > maxCellsBeforeScroll;
    
    // Prepare margins and sizes
    const margin = { 
      top: 70, 
      right: showLegend ? 100 : 20, 
      bottom: 100, 
      left: 120 
    };
    
    // Create SVG
    const svg = createResponsiveSvg({
      container: `#${containerRef.current.id}`,
      width: Math.min(width, gridWidth + margin.left + margin.right),
      height: Math.min(height, gridHeight + margin.top + margin.bottom),
      margin,
      transitionDuration: 500
    });
    
    // Get chart group
    const chartGroup = svg.select('.chart-area');
    
    // Adjust chart group for scrolling if needed
    if (needsScrolling) {
      // Set the chart container to be scrollable
      d3.select(containerRef.current)
        .style('overflow', 'auto')
        .style('max-width', `${width}px`)
        .style('max-height', `${height}px`);
    }
    
    // Create tooltip
    const tooltip = createTooltip();
    
    // Create scales
    // X scale for columns
    const xScale = d3.scaleBand()
      .domain(columns)
      .range([0, columns.length * calculatedCellSize.width])
      .padding(0.05);
      
    // Y scale for rows
    const yScale = d3.scaleBand()
      .domain(rows)
      .range([0, rows.length * calculatedCellSize.height])
      .padding(0.05);
    
    // Create color scale
    // Use theme colors if not provided
    let defaultColors: string[] = [];
    
    if (minValue < 0 && maxValue > 0) {
      // Diverging scale for positive/negative values
      defaultColors = [
        theme.colors.error, 
        neutralColor || theme.colors.background, 
        theme.colors.success
      ];
    } else {
      // Sequential scale
      defaultColors = colorRange || [
        theme.colors.background, 
        theme.colors.primary
      ];
    }
    
    // Create color scale
    const colorScale = Array.isArray(colorRange) && colorRange.length > 2
      ? d3.scaleQuantile<string>()
          .domain([minValue, maxValue])
          .range(colorRange)
      : d3.scaleLinear<string>()
          .domain(minValue < 0 && maxValue > 0 
            ? [minValue, 0, maxValue] 
            : [minValue, maxValue])
          .range(defaultColors as string[])
          .interpolate(d3.interpolateHcl);
    
    // Add title
    chartGroup.append('text')
      .attr('class', 'chart-title')
      .attr('x', (columns.length * calculatedCellSize.width) / 2)
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
        .attr('x', (columns.length * calculatedCellSize.width) / 2)
        .attr('y', -margin.top / 2 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '0.9em')
        .style('fill', theme.colors.text.secondary)
        .text(subtitle);
    }
    
    // Add row title
    chartGroup.append('text')
      .attr('class', 'row-title')
      .attr('x', -80)
      .attr('y', (rows.length * calculatedCellSize.height) / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, -80, ${(rows.length * calculatedCellSize.height) / 2})`)
      .style('font-size', '1em')
      .style('font-weight', 'bold')
      .style('fill', theme.colors.text.primary)
      .text(rowTitle);
      
    // Add column title
    chartGroup.append('text')
      .attr('class', 'column-title')
      .attr('x', (columns.length * calculatedCellSize.width) / 2)
      .attr('y', rows.length * calculatedCellSize.height + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '1em')
      .style('font-weight', 'bold')
      .style('fill', theme.colors.text.primary)
      .text(columnTitle);
    
    // Create row labels
    const rowLabels = chartGroup.selectAll('.row-label')
      .data(rows)
      .enter()
      .append('text')
      .attr('class', 'row-label')
      .attr('x', -10)
      .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.primary)
      .style('cursor', onRowClick ? 'pointer' : 'default')
      .text(d => d)
      .on('mouseover', (event, d) => {
        if (onRowClick) {
          d3.select(event.currentTarget).style('font-weight', 'bold');
        }
        setHighlightedRow(d);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).style('font-weight', 'normal');
        setHighlightedRow(null);
      })
      .on('click', (event, d) => {
        if (onRowClick) {
          onRowClick(d);
        }
      });
      
    // Create column labels
    const columnLabels = chartGroup.selectAll('.column-label')
      .data(columns)
      .enter()
      .append('text')
      .attr('class', 'column-label')
      .attr('x', d => (xScale(d) || 0) + xScale.bandwidth() / 2)
      .attr('y', rows.length * calculatedCellSize.height + 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.primary)
      .style('cursor', onColumnClick ? 'pointer' : 'default')
      .text(d => d)
      .attr('transform', (d, i) => {
        const x = (xScale(d) || 0) + xScale.bandwidth() / 2;
        const y = rows.length * calculatedCellSize.height + 10;
        return `rotate(-45, ${x}, ${y})`;
      })
      .on('mouseover', (event, d) => {
        if (onColumnClick) {
          d3.select(event.currentTarget).style('font-weight', 'bold');
        }
        setHighlightedColumn(d);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget).style('font-weight', 'normal');
        setHighlightedColumn(null);
      })
      .on('click', (event, d) => {
        if (onColumnClick) {
          onColumnClick(d);
        }
      });
    
    // Create heatmap cells
    const cells = chartGroup.selectAll('.cell')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', d => `cell cell-${d.id}`)
      .attr('x', d => xScale(d.column) || 0)
      .attr('y', d => yScale(d.row) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        // Check if value exists
        if (d.value === undefined || d.value === null) {
          return emptyColor || theme.colors.background;
        }
        return colorScale(d.value);
      })
      .attr('stroke', showBorders ? theme.colors.border : 'none')
      .attr('stroke-width', showBorders ? 1 : 0)
      .style('cursor', onCellClick ? 'pointer' : 'default')
      .on('mouseover', (event, d) => {
        // Highlight the cell
        d3.select(event.currentTarget)
          .attr('stroke', theme.colors.primary)
          .attr('stroke-width', 2);
          
        if (showTooltips) {
          // Show tooltip with cell information
          let tooltipContent = `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${d.row} - ${d.column}</div>
              <div>Value: ${valueFormat(d.value)}</div>
          `;
          
          if (d.secondaryValue !== undefined) {
            tooltipContent += `<div>Secondary: ${valueFormat(d.secondaryValue)}</div>`;
          }
          
          if (d.percentChange !== undefined) {
            const changeColor = d.percentChange >= 0 ? theme.colors.success : theme.colors.error;
            tooltipContent += `
              <div style="color: ${changeColor}">
                Change: ${d.percentChange >= 0 ? '+' : ''}${d.percentChange.toFixed(1)}%
              </div>
            `;
          }
          
          if (d.label) {
            tooltipContent += `<div>${d.label}</div>`;
          }
          
          if (d.metadata) {
            Object.entries(d.metadata).forEach(([key, value]) => {
              tooltipContent += `<div>${key}: ${value}</div>`;
            });
          }
          
          tooltipContent += '</div>';
          
          showTooltip(tooltip, tooltipContent, event);
        }
      })
      .on('mouseout', (event) => {
        // Restore cell appearance
        d3.select(event.currentTarget)
          .attr('stroke', showBorders ? theme.colors.border : 'none')
          .attr('stroke-width', showBorders ? 1 : 0);
          
        if (showTooltips) {
          hideTooltip(tooltip);
        }
      })
      .on('click', (event, d) => {
        if (onCellClick) {
          // Toggle selected state
          if (selectedCell === d.id) {
            setSelectedCell(null);
          } else {
            setSelectedCell(d.id);
          }
          
          onCellClick(d);
        }
      });
      
    // Apply highlighting for rows and columns
    function updateHighlights() {
      cells.attr('opacity', d => {
        if (highlightedRow === null && highlightedColumn === null && selectedCell === null) {
          return 1;
        }
        
        if (selectedCell === d.id) {
          return 1;
        }
        
        if (highlightedRow === d.row || highlightedColumn === d.column) {
          return 1;
        }
        
        return 0.3;
      });
      
      // Update stroke for selected cell
      cells.attr('stroke-width', d => {
        if (selectedCell === d.id) {
          return 3;
        }
        return showBorders ? 1 : 0;
      });
      
      // Update stroke color for selected cell
      cells.attr('stroke', d => {
        if (selectedCell === d.id) {
          return theme.colors.primary;
        }
        return showBorders ? theme.colors.border : 'none';
      });
    }
    
    // Apply initial highlights if condition provided
    if (highlightCondition) {
      cells.each(function(d) {
        if (highlightCondition(d)) {
          d3.select(this)
            .attr('stroke', theme.colors.primary)
            .attr('stroke-width', 3);
        }
      });
    }
    
    // Add cell labels if enabled
    if (showLabels) {
      chartGroup.selectAll('.cell-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', d => `cell-label cell-label-${d.id}`)
        .attr('x', d => (xScale(d.column) || 0) + xScale.bandwidth() / 2)
        .attr('y', d => (yScale(d.row) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-size', '0.8em')
        .style('pointer-events', 'none')
        .style('fill', d => {
          // Determine text color based on background color for contrast
          const backgroundColor = colorScale(d.value);
          return getContrastTextColor(backgroundColor);
        })
        .text(d => valueFormat(d.value));
    }
    
    // Add color legend if enabled
    if (showLegend) {
      const legendGroup = chartGroup.append('g')
        .attr('class', 'legend-group')
        .attr('transform', `translate(${columns.length * calculatedCellSize.width + 20}, 0)`);
        
      // Add legend title
      legendGroup.append('text')
        .attr('class', 'legend-title')
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', '0.9em')
        .style('font-weight', 'bold')
        .style('fill', theme.colors.text.primary)
        .text('Legend');
        
      // For sequential or diverging scales
      if (minValue < 0 && maxValue > 0) {
        // Create diverging legend
        const legendHeight = 200;
        const legendWidth = 20;
        
        // Create gradient
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
          .attr('id', `heatmap-gradient-${containerRef.current.id}`)
          .attr('x1', '0%')
          .attr('x2', '0%')
          .attr('y1', '0%')
          .attr('y2', '100%');
          
        // Calculate intermediate stops for the gradient
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
          const offset = i / numStops;
          const value = minValue + (maxValue - minValue) * offset;
          gradient.append('stop')
            .attr('offset', `${offset * 100}%`)
            .attr('stop-color', colorScale(value));
        }
        
        // Add gradient rect
        legendGroup.append('rect')
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .attr('x', 0)
          .attr('y', 20)
          .style('fill', `url(#heatmap-gradient-${containerRef.current.id})`);
          
        // Add scale ticks
        const legendScale = d3.scaleLinear()
          .domain([maxValue, minValue])
          .range([20, 20 + legendHeight]);
          
        const legendAxis = d3.axisRight(legendScale)
          .ticks(5)
          .tickFormat(d => valueFormat(d as number));
          
        legendGroup.append('g')
          .attr('class', 'legend-axis')
          .attr('transform', `translate(${legendWidth}, 0)`)
          .call(legendAxis as any);
      } else {
        // Create sequential legend
        const legendHeight = 200;
        const legendWidth = 20;
        
        // Create gradient
        const defs = svg.append('defs');
        const gradient = defs.append('linearGradient')
          .attr('id', `heatmap-gradient-${containerRef.current.id}`)
          .attr('x1', '0%')
          .attr('x2', '0%')
          .attr('y1', '0%')
          .attr('y2', '100%');
          
        // Calculate intermediate stops for the gradient
        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
          const offset = i / numStops;
          const value = minValue + (maxValue - minValue) * offset;
          gradient.append('stop')
            .attr('offset', `${offset * 100}%`)
            .attr('stop-color', colorScale(value));
        }
        
        // Add gradient rect
        legendGroup.append('rect')
          .attr('width', legendWidth)
          .attr('height', legendHeight)
          .attr('x', 0)
          .attr('y', 20)
          .style('fill', `url(#heatmap-gradient-${containerRef.current.id})`);
          
        // Add scale ticks
        const legendScale = d3.scaleLinear()
          .domain([maxValue, minValue])
          .range([20, 20 + legendHeight]);
          
        const legendAxis = d3.axisRight(legendScale)
          .ticks(5)
          .tickFormat(d => valueFormat(d as number));
          
        legendGroup.append('g')
          .attr('class', 'legend-axis')
          .attr('transform', `translate(${legendWidth}, 0)`)
          .call(legendAxis as any);
      }
    }
    
    // Add reset button if cell selection is enabled
    if (onCellClick) {
      const resetButton = chartGroup.append('g')
        .attr('class', 'reset-button')
        .attr('transform', `translate(${columns.length * calculatedCellSize.width - 60}, -20)`)
        .style('cursor', 'pointer')
        .style('display', selectedCell ? 'block' : 'none')
        .on('click', () => {
          setSelectedCell(null);
          setHighlightedRow(null);
          setHighlightedColumn(null);
          updateHighlights();
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
        .text('Reset');
    }
    
    // Helper functions for updates
    function updateResetButton() {
      if (!onCellClick) return;
      
      chartGroup.select('.reset-button')
        .style('display', selectedCell ? 'block' : 'none');
    }
    
    // Apply initial highlighting and update when states change
    updateHighlights();
    updateResetButton();
    
  }, [
    data,
    width,
    height,
    rowTitle,
    columnTitle,
    cellSize,
    colorRange,
    neutralColor,
    showLegend,
    showTooltips,
    showBorders,
    showLabels,
    theme,
    valueFormat,
    onCellClick,
    onRowClick,
    onColumnClick,
    sortRows,
    sortColumns,
    highlightCondition,
    selectedCell,
    highlightedRow,
    highlightedColumn,
    emptyColor,
    maxCellsBeforeScroll,
    title,
    subtitle
  ]);
  
  // Helper function to get contrasting text color for better readability
  const getContrastTextColor = (backgroundColor: string): string => {
    // Simple function to determine if text should be white or black based on background
    try {
      // For hex colors
      if (backgroundColor.startsWith('#')) {
        const r = parseInt(backgroundColor.slice(1, 3), 16);
        const g = parseInt(backgroundColor.slice(3, 5), 16);
        const b = parseInt(backgroundColor.slice(5, 7), 16);
        
        // Use relative luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
      } 
      
      // For rgb colors
      if (backgroundColor.startsWith('rgb')) {
        const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
        if (rgbMatch) {
          const r = parseInt(rgbMatch[1], 10);
          const g = parseInt(rgbMatch[2], 10);
          const b = parseInt(rgbMatch[3], 10);
          
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance > 0.5 ? '#000000' : '#ffffff';
        }
      }
      
      // For named colors, default to white as safer option
      return '#ffffff';
    } catch (e) {
      // If any error occurs, return white as default
      return '#ffffff';
    }
  };
  
  // Generate unique ID for the container
  const containerId = `category-heatmap-${Math.random().toString(36).substring(2, 11)}`;
  
  return (
    <div
      id={containerId}
      ref={containerRef}
      className={`category-heatmap-container ${className}`}
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

export default CategoryHeatmap; 