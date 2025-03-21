/**
 * D3 Integration Service
 * 
 * Provides reusable D3.js chart configurations, transitions, and responsive behavior
 * for advanced visualization components used in the pharma dashboard.
 */
import * as d3 from 'd3';

// Basic dimensions and margins for charts
export interface ChartDimensions {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Base configuration for responsive charts
export interface ResponsiveChartConfig extends ChartDimensions {
  container: string; // CSS selector for the container
  transitionDuration: number;
  aspectRatio?: number; // Width/height aspect ratio for responsive sizing
}

// Base class for chart transitions
export interface TransitionConfig {
  duration: number;
  delay?: number;
  ease?: (t: number) => number; // D3 easing function type
}

// Color theme interface
export interface ColorTheme {
  primary: string[];
  secondary: string[];
  diverging: string[];
  sequential: string[];
  qualitative: string[];
  background: string;
  text: string;
}

// Chart legend configuration
export interface LegendConfig {
  show: boolean;
  position: 'top' | 'right' | 'bottom' | 'left';
  offsetX?: number;
  offsetY?: number;
}

// Base chart configuration
export interface BaseChartConfig {
  dimensions: ChartDimensions;
  theme: ColorTheme;
  transition: TransitionConfig;
  legend?: LegendConfig;
  tooltip?: boolean;
  responsive?: boolean;
}

// Funnel chart specific configuration
export interface FunnelChartConfig extends BaseChartConfig {
  showPercentages: boolean;
  showLabels: boolean;
  horizontalAlignment?: 'left' | 'center' | 'right';
}

// Heatmap specific configuration
export interface HeatmapConfig extends BaseChartConfig {
  colorScale: [string, string, string]; // Start, middle, end colors
  showValues: boolean;
  roundValues: boolean;
  cellRadius?: number;
}

// Line chart specific configuration
export interface LineChartConfig extends BaseChartConfig {
  showPoints: boolean;
  lineWidth: number;
  smoothing?: number; // 0 = no smoothing, 1 = max smoothing
  areaOpacity?: number; // 0 = no area, 1 = solid area
}

// Bar chart specific configuration
export interface BarChartConfig extends BaseChartConfig {
  barPadding: number;
  isHorizontal?: boolean;
  isStacked?: boolean;
  isGrouped?: boolean;
  showValues?: boolean;
}

// Default chart theme
export const defaultColorTheme: ColorTheme = {
  primary: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'],
  secondary: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
  diverging: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850'],
  sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
  qualitative: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd'],
  background: '#ffffff',
  text: '#333333'
};

// Default transition configuration
export const defaultTransition: TransitionConfig = {
  duration: 750,
  delay: 0,
  ease: d3.easeCubicInOut
};

/**
 * Create a responsive SVG container that adjusts to window size
 */
export function createResponsiveSvg(config: ResponsiveChartConfig): d3.Selection<SVGSVGElement, unknown, HTMLElement, any> {
  // Clear any existing SVG
  d3.select(config.container).selectAll('svg').remove();
  
  // Create new SVG element
  const svg = d3.select(config.container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${config.width} ${config.height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
    
  // Add transform group for margins
  svg.append('g')
    .attr('transform', `translate(${config.margin.left},${config.margin.top})`)
    .classed('chart-area', true);
    
  // Set up resize handler if aspect ratio is provided
  if (config.aspectRatio) {
    const resizeChart = () => {
      const containerWidth = parseInt(d3.select(config.container).style('width'), 10);
      const containerHeight = containerWidth / config.aspectRatio!;
      d3.select(`${config.container} svg`)
        .attr('height', containerHeight);
    };
    
    // Initial sizing
    resizeChart();
    
    // Add event listener
    window.addEventListener('resize', resizeChart);
  }
  
  return svg;
}

/**
 * Apply smooth transition to D3 selection
 */
export function applyTransition<T extends d3.BaseType, U, P extends d3.BaseType, S>(
  selection: d3.Selection<T, U, P, S>,
  config: TransitionConfig = defaultTransition
): d3.Transition<T, U, P, S> {
  return selection
    .transition()
    .duration(config.duration)
    .delay(config.delay || 0)
    .ease(config.ease || d3.easeCubicInOut);
}

/**
 * Create tooltip div if it doesn't exist yet
 */
export function createTooltip(): d3.Selection<HTMLDivElement, unknown, HTMLElement, any> {
  // Remove any existing tooltip
  d3.selectAll('.d3-tooltip').remove();
  
  // Create tooltip
  return d3.select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background-color', 'rgba(255, 255, 255, 0.95)')
    .style('border', '1px solid #ddd')
    .style('border-radius', '4px')
    .style('padding', '8px')
    .style('box-shadow', '0 2px 10px rgba(0, 0, 0, 0.1)')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('transition', 'opacity 0.2s ease-out');
}

/**
 * Show tooltip with content at the specified position
 */
export function showTooltip(
  tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  content: string,
  event: MouseEvent
): void {
  const padding = 10;
  
  tooltip
    .html(content)
    .style('visibility', 'visible')
    .style('opacity', '1');
    
  // Position tooltip
  const tooltipNode = tooltip.node();
  if (tooltipNode) {
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;
    
    // Make sure tooltip doesn't go outside viewport
    let left = event.pageX + padding;
    let top = event.pageY + padding;
    
    if (left + tooltipWidth > window.innerWidth) {
      left = event.pageX - tooltipWidth - padding;
    }
    
    if (top + tooltipHeight > window.innerHeight) {
      top = event.pageY - tooltipHeight - padding;
    }
    
    tooltip
      .style('left', `${left}px`)
      .style('top', `${top}px`);
  }
}

/**
 * Hide tooltip
 */
export function hideTooltip(tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>): void {
  tooltip
    .style('opacity', '0')
    .style('visibility', 'hidden');
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  } else if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Create a legend for the chart
 */
export function createLegend(
  svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>,
  items: { label: string; color: string }[],
  config: LegendConfig
): d3.Selection<SVGGElement, unknown, HTMLElement, any> {
  const legendG = svg.append('g')
    .attr('class', 'legend');
    
  const itemHeight = 20;
  const itemWidth = 150;
  const boxSize = 12;
  const xOffset = config.offsetX || 0;
  const yOffset = config.offsetY || 0;
  
  // Position the legend based on config
  let xPos = 0;
  let yPos = 0;
  
  const chartArea = svg.select('.chart-area').node();
  if (chartArea) {
    const chartBox = (chartArea as SVGGraphicsElement).getBBox();
    
    switch (config.position) {
      case 'top':
        xPos = chartBox.width / 2 - (items.length * itemWidth) / 2;
        yPos = -30;
        break;
      case 'right':
        xPos = chartBox.width + 20;
        yPos = 0;
        break;
      case 'bottom':
        xPos = chartBox.width / 2 - (items.length * itemWidth) / 2;
        yPos = chartBox.height + 30;
        break;
      case 'left':
        xPos = -150;
        yPos = 0;
        break;
    }
  }
  
  legendG.attr('transform', `translate(${xPos + xOffset}, ${yPos + yOffset})`);
  
  // Add legend items
  const legendItems = legendG.selectAll('.legend-item')
    .data(items)
    .enter()
    .append('g')
    .attr('class', 'legend-item');
    
  // For horizontal legends (top/bottom)
  if (config.position === 'top' || config.position === 'bottom') {
    legendItems.attr('transform', (d, i) => `translate(${i * itemWidth}, 0)`);
  } else {
    // For vertical legends (left/right)
    legendItems.attr('transform', (d, i) => `translate(0, ${i * itemHeight})`);
  }
  
  // Add color boxes
  legendItems.append('rect')
    .attr('width', boxSize)
    .attr('height', boxSize)
    .attr('fill', d => d.color);
    
  // Add text labels
  legendItems.append('text')
    .attr('x', boxSize + 5)
    .attr('y', boxSize)
    .text(d => d.label)
    .style('font-size', '12px')
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'middle');
    
  return legendG;
}

/**
 * Create a responsive wrapper around a chart rendering function
 */
export function createResponsiveChart<T>(
  renderFn: (container: Element, data: T, width: number, height: number) => void,
  aspectRatio: number = 16/9
): (container: Element, data: T) => void {
  return (container: Element, data: T) => {
    // Get container dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = containerWidth / aspectRatio;
    
    // Render chart with calculated dimensions
    renderFn(container, data, containerWidth, containerHeight);
    
    // Set up resize listener
    const resizeHandler = () => {
      const newWidth = container.clientWidth;
      const newHeight = newWidth / aspectRatio;
      
      // Clear container
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      // Re-render chart
      renderFn(container, data, newWidth, newHeight);
    };
    
    // Add resize listener
    window.addEventListener('resize', resizeHandler);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  };
}

/**
 * Optimize D3 performance for large datasets
 */
export function optimizeForLargeDataset<T>(
  data: T[],
  threshold: number = 1000
): T[] {
  if (data.length <= threshold) {
    return data;
  }
  
  // Simple downsampling strategy for large datasets
  const sampleFactor = Math.ceil(data.length / threshold);
  return data.filter((_, i) => i % sampleFactor === 0);
}

/**
 * Compute a nice min/max range for chart values
 */
export function getValueRange(
  data: number[],
  includeZero: boolean = true
): [number, number] {
  const min = d3.min(data) || 0;
  const max = d3.max(data) || 0;
  
  let rangeMin = includeZero ? Math.min(0, min) : min;
  let rangeMax = max;
  
  // Add padding to the range
  const padding = (rangeMax - rangeMin) * 0.1;
  
  return [
    rangeMin - (includeZero && rangeMin === 0 ? 0 : padding),
    rangeMax + padding
  ];
} 