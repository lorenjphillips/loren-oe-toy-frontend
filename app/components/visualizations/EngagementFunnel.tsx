/**
 * EngagementFunnel Component
 * 
 * Visualizes progression through different interaction stages in a funnel chart,
 * showing conversion rates between steps and dropoff points.
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

// Funnel data point interface
export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  color?: string;
  description?: string;
}

// Funnel chart props interface
export interface EngagementFunnelProps {
  data: FunnelStage[];
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  showPercentages?: boolean;
  showLabels?: boolean;
  theme?: DashboardTheme;
  horizontalAlignment?: 'left' | 'center' | 'right';
  onStageClick?: (stage: FunnelStage) => void;
  className?: string;
}

const EngagementFunnel: React.FC<EngagementFunnelProps> = ({
  data,
  title = 'Engagement Funnel',
  subtitle,
  width = 600,
  height = 400,
  showPercentages = true,
  showLabels = true,
  theme = getTheme('light', 'pharma-blue'),
  horizontalAlignment = 'center',
  onStageClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data.length) return;
    
    // Clear previous visualization
    d3.select(containerRef.current).selectAll('*').remove();
    
    // Prepare dimensions
    const margin = { top: 60, right: 30, bottom: 50, left: 30 };
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
    
    // Calculate total value (for percentages)
    const totalValue = data[0]?.value || 0;
    
    // Calculate dimensions for each funnel segment
    const stageHeight = innerHeight / data.length;
    
    // Calculate widths based on values
    const maxWidth = innerWidth * 0.8; // Max width is 80% of inner width
    const scale = d3.scaleLinear()
      .domain([0, totalValue])
      .range([0, maxWidth]);
    
    // Calculate segment widths
    const segmentWidths = data.map(d => scale(d.value));
    
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
    
    // Create funnel segments group
    const funnelGroup = chartGroup.append('g')
      .attr('class', 'funnel-group');
      
    // Helper to calculate x-position based on alignment
    const getXPosition = (width: number): number => {
      switch (horizontalAlignment) {
        case 'left': return 0;
        case 'right': return innerWidth - width;
        case 'center':
        default: return (innerWidth - width) / 2;
      }
    };
    
    // Create trapezoid path generator
    const createTrapezoidPath = (
      topWidth: number, 
      bottomWidth: number, 
      height: number, 
      topX: number, 
      topY: number
    ): string => {
      const bottomX = horizontalAlignment === 'left' 
        ? topX 
        : horizontalAlignment === 'right' 
          ? topX - (bottomWidth - topWidth)
          : topX + (topWidth - bottomWidth) / 2;
      
      return `
        M ${topX} ${topY}
        L ${topX + topWidth} ${topY}
        L ${bottomX + bottomWidth} ${topY + height}
        L ${bottomX} ${topY + height}
        Z
      `;
    };
    
    // Draw funnel segments
    data.forEach((stage, i) => {
      const topWidth = i === 0 ? segmentWidths[i] : segmentWidths[i - 1];
      const bottomWidth = segmentWidths[i];
      const topY = i * stageHeight;
      const topX = getXPosition(topWidth);
      
      const color = stage.color || theme.visualizations.primary[i % theme.visualizations.primary.length];
      
      // Create segment path
      const segmentPath = funnelGroup.append('path')
        .attr('d', createTrapezoidPath(
          topWidth,
          bottomWidth,
          stageHeight,
          topX,
          topY
        ))
        .attr('fill', color)
        .attr('opacity', selectedStage === null || selectedStage === stage.id ? 1 : 0.4)
        .attr('stroke', theme.colors.background)
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', (event) => {
          // Highlight on hover
          segmentPath.attr('opacity', 0.8);
          
          // Show tooltip
          const percentage = ((stage.value / totalValue) * 100).toFixed(1);
          const prevValue = i > 0 ? data[i - 1].value : stage.value;
          const conversionRate = prevValue ? ((stage.value / prevValue) * 100).toFixed(1) : '100.0';
          
          const tooltipContent = `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${stage.label}</div>
              <div style="margin-bottom: 2px;">Count: ${formatLargeNumber(stage.value)}</div>
              <div style="margin-bottom: 2px;">Overall: ${percentage}%</div>
              ${i > 0 ? `<div>Conversion from previous: ${conversionRate}%</div>` : ''}
              ${stage.description ? `<div style="margin-top: 8px; font-style: italic;">${stage.description}</div>` : ''}
            </div>
          `;
          
          showTooltip(tooltip, tooltipContent, event);
        })
        .on('mouseout', () => {
          // Restore opacity
          segmentPath.attr('opacity', selectedStage === null || selectedStage === stage.id ? 1 : 0.4);
          
          // Hide tooltip
          hideTooltip(tooltip);
        })
        .on('click', () => {
          if (onStageClick) {
            onStageClick(stage);
          }
          
          // Toggle selection
          if (selectedStage === stage.id) {
            setSelectedStage(null);
          } else {
            setSelectedStage(stage.id);
          }
        });
      
      // Add percentage labels if enabled
      if (showPercentages) {
        const percentage = ((stage.value / totalValue) * 100).toFixed(1);
        const prevValue = i > 0 ? data[i - 1].value : stage.value;
        const conversionRate = prevValue ? ((stage.value / prevValue) * 100).toFixed(1) : '100.0';
        
        const labelX = horizontalAlignment === 'left' 
          ? topX + bottomWidth + 10
          : horizontalAlignment === 'right'
            ? topX - 10
            : innerWidth / 2;
            
        const textAnchor = horizontalAlignment === 'left'
          ? 'start'
          : horizontalAlignment === 'right'
            ? 'end'
            : 'middle';
        
        // Percentage of total
        funnelGroup.append('text')
          .attr('class', 'percentage-label')
          .attr('x', labelX)
          .attr('y', topY + stageHeight / 2)
          .attr('text-anchor', textAnchor)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '0.8em')
          .style('font-weight', 'bold')
          .style('fill', theme.colors.text.primary)
          .text(`${percentage}%`);
        
        // Conversion rate (for all except first stage)
        if (i > 0) {
          funnelGroup.append('text')
            .attr('class', 'conversion-label')
            .attr('x', labelX)
            .attr('y', topY + stageHeight / 2 + 15)
            .attr('text-anchor', textAnchor)
            .attr('dominant-baseline', 'middle')
            .style('font-size', '0.7em')
            .style('fill', theme.colors.text.secondary)
            .text(`↓ ${conversionRate}%`);
        }
      }
      
      // Add stage labels if enabled
      if (showLabels) {
        const labelX = horizontalAlignment === 'left' 
          ? topX + 10
          : horizontalAlignment === 'right'
            ? topX + bottomWidth - 10
            : (topX + bottomWidth / 2);
            
        const textAnchor = horizontalAlignment === 'left'
          ? 'start'
          : horizontalAlignment === 'right'
            ? 'end'
            : 'middle';
        
        funnelGroup.append('text')
          .attr('class', 'stage-label')
          .attr('x', labelX)
          .attr('y', topY + stageHeight / 2)
          .attr('text-anchor', textAnchor)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '0.9em')
          .style('font-weight', 'bold')
          .style('fill', theme.colors.text.inverse)
          .style('pointer-events', 'none')
          .text(stage.label);
          
        // Add value count below the label
        funnelGroup.append('text')
          .attr('class', 'value-label')
          .attr('x', labelX)
          .attr('y', topY + stageHeight / 2 + 15)
          .attr('text-anchor', textAnchor)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '0.8em')
          .style('fill', theme.colors.text.inverse)
          .style('pointer-events', 'none')
          .text(formatLargeNumber(stage.value));
      }
    });
    
    // Add filter controls
    const filterGroup = chartGroup.append('g')
      .attr('class', 'filter-controls')
      .attr('transform', `translate(0, ${innerHeight + 20})`);
      
    filterGroup.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', '0.8em')
      .style('fill', theme.colors.text.secondary)
      .text('Click on stages to filter:');
      
    const resetButton = filterGroup.append('g')
      .attr('class', 'reset-button')
      .attr('transform', `translate(${innerWidth - 60}, -5)`)
      .style('cursor', 'pointer')
      .on('click', () => {
        setSelectedStage(null);
        
        // Reset all segments
        funnelGroup.selectAll('path')
          .attr('opacity', 1);
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
    showPercentages, 
    showLabels, 
    theme, 
    horizontalAlignment, 
    onStageClick, 
    selectedStage
  ]);
  
  // Generate unique ID for the container
  const containerId = `engagement-funnel-${Math.random().toString(36).substring(2, 11)}`;
  
  return (
    <div 
      id={containerId}
      ref={containerRef} 
      className={`engagement-funnel-container ${className}`}
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

export default EngagementFunnel; 