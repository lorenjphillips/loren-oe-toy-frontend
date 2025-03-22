/**
 * InteractionFlow Component
 * 
 * Visualizes user journeys through pharmaceutical content as a Sankey diagram,
 * showcasing paths, transitions, and drop-off points with interactive controls.
 * 
 * Note: This component requires the 'd3-sankey' package to be installed:
 * npm install d3-sankey @types/d3-sankey
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
import { DashboardTheme, ColorPalette, getTheme } from '../../styles/dashboardTheme';

// Temporary type definitions for d3-sankey until the package is installed
// Remove these definitions after installing the actual package
interface SankeyNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  index?: number;
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
  value?: number;
  depth?: number;
  height?: number;
  layer?: number;
  sourceLinks?: SankeyLink[];
  targetLinks?: SankeyLink[];
}

interface SankeyLink {
  source: SankeyNode | number;
  target: SankeyNode | number;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
  index?: number;
}

interface SankeyLayout {
  nodes: (nodes: SankeyNode[]) => SankeyLayout;
  links: (links: SankeyLink[]) => SankeyLayout;
  nodeWidth: (width: number) => SankeyLayout;
  nodePadding: (padding: number) => SankeyLayout;
  size: (size: [number, number]) => SankeyLayout;
  nodeId: (id: (node: SankeyNode) => string) => SankeyLayout;
  nodeAlign: (align: any) => SankeyLayout;
  iterations: (iterations: number) => SankeyLayout;
}

// Temporary sankey function - replace with actual d3-sankey after installation
const sankeyTemp = () => {
  const sankey: SankeyLayout = {
    nodes: (nodes: SankeyNode[]) => sankey,
    links: (links: SankeyLink[]) => sankey,
    nodeWidth: (width: number) => sankey,
    nodePadding: (padding: number) => sankey,
    size: (size: [number, number]) => sankey,
    nodeId: (id: (node: SankeyNode) => string) => sankey,
    nodeAlign: (align: any) => sankey,
    iterations: (iterations: number) => sankey
  };
  
  return sankey;
};

// Temporary alignment functions - replace with actual d3-sankey functionality
const sankeyJustify = () => {};
const sankeyLeft = () => {};
const sankeyRight = () => {};
const sankeyCenter = () => {};

// FlowNode interface represents a node in the Sankey diagram
export interface FlowNode {
  id: string;
  name: string;
  group?: string;
  color?: string;
  value?: number;
  metadata?: Record<string, any>;
}

// FlowLink interface represents a connection between nodes
export interface FlowLink {
  source: string; // ID of source node
  target: string; // ID of target node
  value: number;
  color?: string;
  label?: string;
  metadata?: Record<string, any>;
}

// FlowData interface defines the structure of the flow data
export interface FlowData {
  nodes: FlowNode[];
  links: FlowLink[];
}

// Define types for d3 flow data
interface FlowLinkDatum {
  source: number | { index?: number };
  target: number | { index?: number };
  width?: number;
  index?: number;
}

interface FlowNodeDatum {
  index?: number;
  id: string;
}

// InteractionFlowProps interface for component props
export interface InteractionFlowProps {
  data: FlowData;
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  nodeWidth?: number;
  nodePadding?: number;
  nodeAlignment?: 'justify' | 'left' | 'right' | 'center';
  showValues?: boolean;
  valueFormat?: (value: number) => string;
  nodeSort?: (a: FlowNode, b: FlowNode) => number;
  linkSort?: (a: FlowLink, b: FlowLink) => number;
  theme?: DashboardTheme;
  onNodeClick?: (node: FlowNode) => void;
  onLinkClick?: (link: FlowLink) => void;
  onReset?: () => void;
  showControls?: boolean;
  className?: string;
}

const InteractionFlow: React.FC<InteractionFlowProps> = ({
  data,
  title = 'Interaction Flow',
  subtitle,
  width = 800,
  height = 500,
  nodeWidth = 20,
  nodePadding = 10,
  nodeAlignment = 'justify',
  showValues = true,
  valueFormat = (value: number) => formatLargeNumber(value),
  nodeSort,
  linkSort,
  theme = getTheme('light', 'pharma-blue'),
  onNodeClick,
  onLinkClick,
  onReset,
  showControls = true,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<{source: string, target: string} | null>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data.nodes.length) return;
    
    // Preprocess data - create a new copy to avoid mutating the original
    const processedNodes = data.nodes.map((node, index) => ({
      ...node,
      index,
      name: node.name || node.id
    }));
      
    const processedLinks = [...data.links]
      .map(link => ({ ...link }));
    
    // Apply sorting if provided
    if (nodeSort) {
      processedNodes.sort(nodeSort);
    }
    
    if (linkSort) {
      processedLinks.sort(linkSort);
    }
    
    // Clear previous visualization
    d3.select(containerRef.current).selectAll('*').remove();
    
    // Prepare dimensions
    const margin = { top: 60, right: 30, bottom: 40, left: 30 };
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
    
    // Prepare the data for d3-sankey
    // Create nodes array for d3-sankey with numeric ids
    const sankeyNodes: SankeyNode[] = processedNodes.map((node, i) => ({
      ...node,
      name: node.name,
      index: i
    }));
    
    // Create a map of node IDs to indices for link conversion
    const nodeIndices: Record<string, number> = {};
    processedNodes.forEach((node, i) => {
      nodeIndices[node.id] = i;
    });
    
    // Create links array for d3-sankey with numeric source/target
    const sankeyLinks: SankeyLink[] = processedLinks.map((link, i) => ({
      source: nodeIndices[link.source],
      target: nodeIndices[link.target],
      value: link.value,
      index: i
    }));
    
    // Create the sankey generator
    // Replace with actual d3-sankey import after installation
    const sankey = sankeyTemp()
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .size([innerWidth, innerHeight]);
      
    // Set node alignment
    let alignmentFunction: any;
    switch (nodeAlignment) {
      case 'left':
        alignmentFunction = sankeyLeft;
        break;
      case 'right':
        alignmentFunction = sankeyRight;
        break;
      case 'center':
        alignmentFunction = sankeyCenter;
        break;
      case 'justify':
      default:
        alignmentFunction = sankeyJustify;
        break;
    }
    
    // Apply alignment if available
    if (alignmentFunction) {
      sankey.nodeAlign(alignmentFunction);
    }
    
    // Set custom node ID function
    const idFunction = (node: SankeyNode) => `${node.name || ''}:${node.index || 0}`;
    sankey.nodeId(idFunction);
    
    // Compute the layout - simulate sankey computation for example purposes
    // This would be replaced by actual sankey computation when package is installed
    // sankey({ nodes: sankeyNodes, links: sankeyLinks });
    
    // For demonstration, manually assign positions
    // This is a placeholder - replace with actual sankey computation
    const layers = calculateLayers(sankeyNodes, sankeyLinks);
    let maxLayerSize = 0;
    layers.forEach(layer => {
      maxLayerSize = Math.max(maxLayerSize, layer.length);
    });
    
    // Assign x positions based on layer
    layers.forEach((layer, layerIndex) => {
      const layerWidth = innerWidth / (layers.length - 1);
      layer.forEach((nodeIndex, i) => {
        const node = sankeyNodes[nodeIndex];
        const layerHeight = (layer.length) * (nodePadding + nodeWidth) - nodePadding;
        const startY = (innerHeight - layerHeight) / 2;
        
        if (node) {
          node.x0 = layerIndex * layerWidth;
          node.x1 = node.x0 + nodeWidth;
          node.y0 = startY + i * (nodeWidth + nodePadding);
          node.y1 = node.y0 + nodeWidth;
          node.value = calculateNodeValue(nodeIndex, sankeyLinks);
        }
      });
    });
    
    // Compute link positions - simplified for demonstration
    // This should be replaced with actual sankey logic
    sankeyLinks.forEach(link => {
      const sourceNode = typeof link.source === 'number' ? 
        sankeyNodes[link.source] : link.source;
      const targetNode = typeof link.target === 'number' ? 
        sankeyNodes[link.target] : link.target;
        
      if (sourceNode && sourceNode.x1 !== undefined && sourceNode.y0 !== undefined && 
          targetNode && targetNode.x0 !== undefined && targetNode.y0 !== undefined) {
        link.width = Math.max(1, link.value / 20); // Simplified width calculation
        link.y0 = sourceNode.y0 + nodeWidth / 2;
        link.y1 = targetNode.y0 + nodeWidth / 2;
      }
    });
    
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
    
    // Draw the links
    const linkGroup = chartGroup.append('g')
      .attr('class', 'links-group')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.4);
      
    const links = linkGroup.selectAll('.link')
      .data(sankeyLinks)
      .enter()
      .append('path')
      .attr('class', (d, i) => {
        const sourceIdx = typeof d.source === 'number' ? d.source : d.source.index || 0;
        const targetIdx = typeof d.target === 'number' ? d.target : d.target.index || 0;
        return `link link-${sourceIdx}-${targetIdx}`;
      })
      .attr('d', (d) => {
        // Simplified path for demonstration - would be replaced with d3.sankeyLinkHorizontal()
        const sourceNode = typeof d.source === 'number' ? 
          sankeyNodes[d.source] : d.source;
        const targetNode = typeof d.target === 'number' ? 
          sankeyNodes[d.target] : d.target;
          
        if (sourceNode && sourceNode.x1 !== undefined && sourceNode.y0 !== undefined && 
            targetNode && targetNode.x0 !== undefined && targetNode.y0 !== undefined) {
          // Simple curved path
          const x0 = sourceNode.x1;
          const y0 = sourceNode.y0 + nodeWidth / 2;
          const x1 = targetNode.x0;
          const y1 = targetNode.y0 + nodeWidth / 2;
          
          return `M${x0},${y0}
                  C${x0 + (x1 - x0) / 3},${y0}
                   ${x0 + 2 * (x1 - x0) / 3},${y1}
                   ${x1},${y1}`;
        }
        return '';
      })
      .attr('stroke', (d, i) => {
        // Use link color from data if available, otherwise use theme color
        const originalLink = processedLinks[i];
        return originalLink.color || theme.colors.primary;
      })
      .attr('stroke-width', d => Math.max(1, d.width || 1))
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const linkIndex = d.index || 0;
        const originalLink = processedLinks[linkIndex];
        
        // Highlight the link
        d3.select(event.currentTarget)
          .attr('stroke-opacity', 0.8)
          .attr('stroke-width', (d.width || 1) * 1.2);
          
        if (showValues) {
          // Show tooltip with link information
          const sourceIdx = typeof d.source === 'number' ? d.source : d.source.index || 0;
          const targetIdx = typeof d.target === 'number' ? d.target : d.target.index || 0;
          const sourceNode = processedNodes[sourceIdx];
          const targetNode = processedNodes[targetIdx];
          
          let tooltipContent = `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${sourceNode.name} → ${targetNode.name}</div>
              <div>Value: ${valueFormat(originalLink.value)}</div>
          `;
          
          if (originalLink.label) {
            tooltipContent += `<div>${originalLink.label}</div>`;
          }
          
          if (originalLink.metadata) {
            Object.entries(originalLink.metadata).forEach(([key, value]) => {
              tooltipContent += `<div>${key}: ${value}</div>`;
            });
          }
          
          tooltipContent += '</div>';
          
          showTooltip(tooltip, tooltipContent, event);
        }
      })
      .on('mouseout', (event) => {
        // Restore link appearance
        d3.select(event.currentTarget)
          .attr('stroke-opacity', selectedLink ? 0.2 : 0.4)
          .attr('stroke-width', function(this: SVGPathElement, d: any) {
            const typedD = d as FlowLinkDatum;
            const sourceIdx = typeof typedD.source === 'number' ? typedD.source : typedD.source.index || 0;
            const targetIdx = typeof typedD.target === 'number' ? typedD.target : typedD.target.index || 0;
            
            return selectedLink && 
                  (processedNodes[sourceIdx].id === selectedLink.source) && 
                  (processedNodes[targetIdx].id === selectedLink.target) 
                  ? (typedD.width || 1) * 1.5 : (typedD.width || 1);
          });
          
        if (showValues) {
          hideTooltip(tooltip);
        }
      })
      .on('click', (event, d: FlowLinkDatum) => {
        const linkIndex = d.index || 0;
        const originalLink = processedLinks[linkIndex];
        const sourceIdx = typeof d.source === 'number' ? d.source : d.source.index || 0;
        const targetIdx = typeof d.target === 'number' ? d.target : d.target.index || 0;
        
        // Update selected link state
        if (selectedLink && 
            selectedLink.source === processedNodes[sourceIdx].id && 
            selectedLink.target === processedNodes[targetIdx].id) {
          setSelectedLink(null);
        } else {
          setSelectedLink({
            source: processedNodes[sourceIdx].id,
            target: processedNodes[targetIdx].id
          });
        }
        
        // Reset selected node
        setSelectedNode(null);
        
        // Call the link click handler if provided
        if (onLinkClick) {
          onLinkClick(originalLink);
        }
        
        // Update link appearance
        links.attr('stroke-opacity', link => {
          const sourceLinkIdx = typeof link.source === 'number' ? link.source : link.source.index || 0;
          const targetLinkIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
          
          if (!selectedLink) return 0.4;
          
          return (processedNodes[sourceLinkIdx].id === selectedLink.source && 
                 processedNodes[targetLinkIdx].id === selectedLink.target) ? 0.8 : 0.2;
        });
        
        // Prevent event bubbling
        event.stopPropagation();
      });
    
    // Draw the nodes
    const nodeGroup = chartGroup.append('g')
      .attr('class', 'nodes-group');
      
    const nodeGroups = nodeGroup.selectAll('.node')
      .data(sankeyNodes)
      .enter()
      .append('g')
      .attr('class', (d, i) => `node node-${i}`)
      .attr('transform', d => `translate(${d.x0 || 0},${d.y0 || 0})`)
      .style('cursor', 'pointer');
      
    // Add node rectangles
    nodeGroups.append('rect')
      .attr('width', d => (d.x1 || 0) - (d.x0 || 0))
      .attr('height', d => (d.y1 || 0) - (d.y0 || 0))
      .attr('fill', (d, i) => {
        // Use node color from data if available
        const originalNode = processedNodes[i];
        
        // Use node color or generate from theme based on group
        if (originalNode.color) {
          return originalNode.color;
        }
        
        // Update theme default colors
        const defaultColors = [
          '#3366CC', '#DC3912', '#FF9900', '#109618', 
          '#990099', '#0099C6', '#DD4477', '#66AA00'
        ];
        
        // Determine color based on group if available, or use index
        if (originalNode.group) {
          const hashCode = (str: string) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
              hash = ((hash << 5) - hash) + str.charCodeAt(i);
              hash = hash & hash;
            }
            return Math.abs(hash);
          };
          
          const groupHash = hashCode(originalNode.group);
          return defaultColors[groupHash % defaultColors.length];
        }
        
        // Fallback to index-based coloring
        return defaultColors[i % defaultColors.length];
      })
      .attr('stroke', theme.colors.border)
      .attr('opacity', (d: unknown) => {
        const node = d as SankeyNode;
        const originalNodeItem = processedNodes.find(n => n.index === node.index) || processedNodes[0];
        return selectedNode === null || selectedNode === originalNodeItem.id ? 1 : 0.3;
      })
      .on('mouseover', (event, d: any) => {
        const nodeIndex = (d as FlowNodeDatum).index || 0;
        const originalNode = processedNodes[nodeIndex];
        
        // Highlight the node
        d3.select(event.currentTarget)
          .attr('stroke', theme.colors.primary)
          .attr('stroke-width', 2);
          
        // Find all connected links
        const highlightLinks = sankeyLinks.filter(link => {
          const sourceIdx = typeof link.source === 'number' ? link.source : link.source.index;
          const targetIdx = typeof link.target === 'number' ? link.target : link.target.index;
          return sourceIdx === nodeIndex || targetIdx === nodeIndex;
        });
        
        // Highlight connected links
        highlightLinks.forEach(link => {
          const sourceIdx = typeof link.source === 'number' ? link.source : link.source.index || 0;
          const targetIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
          
          d3.select(`.link-${sourceIdx}-${targetIdx}`)
            .attr('stroke-opacity', 0.7)
            .attr('stroke-width', (link.width || 1) * 1.2);
        });
        
        if (showValues) {
          // Show tooltip with node information
          let tooltipContent = `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${originalNode.name}</div>
              <div>Value: ${valueFormat(d.value || 0)}</div>
          `;
          
          if (originalNode.group) {
            tooltipContent += `<div>Group: ${originalNode.group}</div>`;
          }
          
          if (originalNode.metadata) {
            Object.entries(originalNode.metadata).forEach(([key, value]) => {
              tooltipContent += `<div>${key}: ${value}</div>`;
            });
          }
          
          tooltipContent += '</div>';
          
          showTooltip(tooltip, tooltipContent, event);
        }
      })
      .on('mouseout', (event, d: any) => {
        // Restore node appearance
        d3.select(event.currentTarget)
          .attr('stroke', theme.colors.border)
          .attr('stroke-width', 1);
          
        // Restore link appearance
        const nodeIndex = (d as FlowNodeDatum).index || 0;
        sankeyLinks.forEach(link => {
          const sourceIdx = typeof link.source === 'number' ? link.source : link.source.index || 0;
          const targetIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
          
          if (sourceIdx === nodeIndex || targetIdx === nodeIndex) {
            d3.select(`.link-${sourceIdx}-${targetIdx}`)
              .attr('stroke-opacity', selectedLink ? 0.2 : 0.4)
              .attr('stroke-width', link.width || 1);
          }
        });
        
        if (showValues) {
          hideTooltip(tooltip);
        }
      })
      .on('click', (event, d: any) => {
        const nodeIndex = (d as FlowNodeDatum).index || 0;
        const originalNode = processedNodes[nodeIndex];
        
        // Update selected node state
        if (selectedNode === originalNode.id) {
          setSelectedNode(null);
        } else {
          setSelectedNode(originalNode.id);
        }
        
        // Reset selected link
        setSelectedLink(null);
        
        // Call the node click handler if provided
        if (onNodeClick) {
          onNodeClick(originalNode);
        }
        
        // Update node appearance
        nodeGroups.selectAll('rect')
          .attr('opacity', (d: unknown) => {
            const node = d as SankeyNode;
            const originalNodeItem = processedNodes.find(n => n.index === node.index) || processedNodes[0];
            return selectedNode === null || selectedNode === originalNodeItem.id ? 1 : 0.3;
          });
          
        // Update link appearance based on connected nodes
        links.attr('stroke-opacity', link => {
          const sourceIdx = typeof link.source === 'number' ? link.source : link.source.index || 0;
          const targetIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
          
          if (selectedNode === null) return 0.4;
          
          return processedNodes[sourceIdx].id === selectedNode || 
                 processedNodes[targetIdx].id === selectedNode ? 0.7 : 0.1;
        });
        
        // Prevent event bubbling
        event.stopPropagation();
      });
      
    // Add node labels
    nodeGroups.append('text')
      .attr('x', d => ((d.x1 || 0) - (d.x0 || 0)) / 2)
      .attr('y', d => ((d.y1 || 0) - (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '0.8em')
      .style('pointer-events', 'none')
      .style('fill', (d, i) => {
        const originalNode = processedNodes[i];
        // Get text color for contrast
        return getContrastTextColor(originalNode.color || theme.colors.primary);
      })
      .text((d, i) => {
        const originalNode = processedNodes[i];
        const nodeWidth = (d.x1 || 0) - (d.x0 || 0);
        // Truncate text if node is small
        return nodeWidth < 30 ? 
          truncateText(originalNode.name, 3) : 
          truncateText(originalNode.name, Math.floor(nodeWidth / 8));
      });
      
    // Add node values if enabled
    if (showValues) {
      nodeGroups.append('text')
        .attr('x', d => ((d.x1 || 0) - (d.x0 || 0)) / 2)
        .attr('y', d => ((d.y1 || 0) - (d.y0 || 0)) / 2 + 12) // Position below the label
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '0.7em')
        .style('pointer-events', 'none')
        .style('fill', (d, i) => {
          const originalNode = processedNodes[i];
          // Get text color for contrast
          return getContrastTextColor(originalNode.color || theme.colors.primary);
        })
        .text(d => {
          const nodeWidth = (d.x1 || 0) - (d.x0 || 0);
          // Only show value if node is wide enough
          return nodeWidth >= 40 ? valueFormat(d.value || 0) : '';
        });
    }
    
    // Add reset button if controls are enabled
    if (showControls && (onReset || selectedNode !== null || selectedLink !== null)) {
      const resetButton = chartGroup.append('g')
        .attr('class', 'reset-button')
        .attr('transform', `translate(${innerWidth - 60}, -20)`)
        .style('cursor', 'pointer')
        .on('click', () => {
          // Reset selections
          setSelectedNode(null);
          setSelectedLink(null);
          
          // Call reset handler if provided
          if (onReset) {
            onReset();
          }
          
          // Reset node appearance
          nodeGroups.selectAll('rect')
            .attr('opacity', 1);
            
          // Reset link appearance
          links.attr('stroke-opacity', 0.4);
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
    
    // Set up click away handler on background
    svg.on('click', () => {
      if (selectedNode !== null || selectedLink !== null) {
        setSelectedNode(null);
        setSelectedLink(null);
        
        // Reset node appearance
        nodeGroups.selectAll('rect')
          .attr('opacity', 1);
          
        // Reset link appearance
        links.attr('stroke-opacity', 0.4);
      }
    });
  }, [
    data,
    width,
    height,
    nodeWidth,
    nodePadding,
    nodeAlignment,
    showValues,
    valueFormat,
    nodeSort,
    linkSort,
    theme,
    onNodeClick,
    onLinkClick,
    onReset,
    showControls,
    selectedNode,
    selectedLink
  ]);
  
  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  // Helper function to get contrasting text color
  const getContrastTextColor = (backgroundColor: string): string => {
    // Simple contrast check - ideally would use proper color contrast algorithm
    // If background is a light color, return dark text, and vice versa
    if (backgroundColor.match(/^#[0-9A-F]{6}$/i)) {
      const r = parseInt(backgroundColor.slice(1, 3), 16);
      const g = parseInt(backgroundColor.slice(3, 5), 16);
      const b = parseInt(backgroundColor.slice(5, 7), 16);
      
      // Calculate perceived brightness (YIQ formula)
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
    }
    
    // Default to white text if not a hex color
    return '#ffffff';
  };
  
  // Helper function to calculate node layers - simplified algorithm
  const calculateLayers = (nodes: SankeyNode[], links: SankeyLink[]): number[][] => {
    const layers: number[][] = [];
    const visited = new Set<number>();
    const nodeIndegree: Record<number, number> = {};
    
    // Calculate in-degree for each node
    nodes.forEach((_, i) => {
      nodeIndegree[i] = 0;
    });
    
    links.forEach(link => {
      const targetIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
      nodeIndegree[targetIdx] = (nodeIndegree[targetIdx] || 0) + 1;
    });
    
    // First layer: nodes with no incoming links
    const firstLayer = nodes
      .map((_, i) => i)
      .filter(i => nodeIndegree[i] === 0);
      
    layers.push(firstLayer);
    firstLayer.forEach(i => visited.add(i));
    
    // Keep processing until all nodes are visited
    while (visited.size < nodes.length) {
      const prevLayer = layers[layers.length - 1];
      const nextLayer: number[] = [];
      
      // Find all nodes that have incoming links only from visited nodes
      const outgoingLinks: Record<number, number[]> = {};
      
      links.forEach(link => {
        const sourceIdx = typeof link.source === 'number' ? link.source : link.source.index || 0;
        const targetIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
        
        if (!outgoingLinks[sourceIdx]) {
          outgoingLinks[sourceIdx] = [];
        }
        
        outgoingLinks[sourceIdx].push(targetIdx);
      });
      
      // For each node in the previous layer, add its outgoing targets to the next layer
      prevLayer.forEach(nodeIdx => {
        const targets = outgoingLinks[nodeIdx] || [];
        targets.forEach(targetIdx => {
          if (!visited.has(targetIdx)) {
            nextLayer.push(targetIdx);
            visited.add(targetIdx);
          }
        });
      });
      
      // If no nodes were added but we still have unvisited nodes, 
      // find nodes with no outgoing connections
      if (nextLayer.length === 0) {
        nodes.forEach((_, i) => {
          if (!visited.has(i) && (!outgoingLinks[i] || outgoingLinks[i].length === 0)) {
            nextLayer.push(i);
            visited.add(i);
          }
        });
      }
      
      // If still no nodes were added but we have unvisited nodes,
      // just add an unvisited node to break cycles
      if (nextLayer.length === 0) {
        for (let i = 0; i < nodes.length; i++) {
          if (!visited.has(i)) {
            nextLayer.push(i);
            visited.add(i);
            break;
          }
        }
      }
      
      if (nextLayer.length > 0) {
        layers.push(nextLayer);
      } else {
        // If we can&apos;t add any more nodes, break to avoid infinite loop
        break;
      }
    }
    
    return layers;
  };
  
  // Helper function to calculate node value from links
  const calculateNodeValue = (nodeIndex: number, links: SankeyLink[]): number => {
    // For each node, sum the values of incoming and outgoing links
    const incoming = links
      .filter(link => {
        const targetIdx = typeof link.target === 'number' ? link.target : link.target.index || 0;
        return targetIdx === nodeIndex;
      })
      .reduce((sum, link) => sum + link.value, 0);
      
    const outgoing = links
      .filter(link => {
        const sourceIdx = typeof link.source === 'number' ? link.source : link.source.index || 0;
        return sourceIdx === nodeIndex;
      })
      .reduce((sum, link) => sum + link.value, 0);
      
    // Use the larger of incoming or outgoing values
    return Math.max(incoming, outgoing);
  };
  
  // Generate unique ID for the container
  const containerId = `interaction-flow-${Math.random().toString(36).substring(2, 11)}`;
  
  return (
    <div
      id={containerId}
      ref={containerRef}
      className={`interaction-flow-container ${className}`}
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

export default InteractionFlow; 