'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { VisualizationService, D3Node, D3Link, D3Graph } from '../../services/visualizationService';
import { KnowledgeGraph, KnowledgeGraphFilters, NodeType, RelationshipType } from '../../models/knowledgeGraph';
import { NodeTypeIcon, NodeTypeBadge, NodeTypeLegend } from './NodeTypes';
import { EdgeLine, EdgeTypeBadge, EdgeLegend } from './EdgeTypes';
import InteractionControls from './InteractionControls';

interface GraphEngineProps {
  knowledgeGraph: KnowledgeGraph;
  filters?: KnowledgeGraphFilters;
  onFiltersChange?: (filters: KnowledgeGraphFilters) => void;
  onResetFilters?: () => void;
  initialFilters?: KnowledgeGraphFilters;
  width?: number;
  height?: number;
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
  className?: string;
}

export default function GraphEngine({
  knowledgeGraph,
  filters = {},
  onFiltersChange,
  onResetFilters,
  initialFilters,
  width = 900,
  height = 600,
  onNodeSelect,
  onEdgeSelect,
  className = '',
}: GraphEngineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [vizService] = useState<VisualizationService>(() => 
    new VisualizationService({ width, height }));
  const [graph, setGraph] = useState<D3Graph>({ nodes: [], links: [] });
  const [localFilters, setLocalFilters] = useState<KnowledgeGraphFilters>(filters || initialFilters || {});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Initialize the graph with data and filters
  useEffect(() => {
    const graphData = vizService.createGraphFromData(knowledgeGraph, localFilters);
    setGraph(graphData);
  }, [knowledgeGraph, localFilters, vizService]);

  // Set up D3 simulation when graph changes
  useEffect(() => {
    if (!svgRef.current || graph.nodes.length === 0) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    // Get main container group
    const svg = d3.select(svgRef.current);
    const g = svg.append('g').attr('class', 'graph-container');

    // Apply zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
        setTransform(event.transform);
      });

    svg.call(zoom);

    // Initialize simulation
    const simulation = vizService.initializeSimulation();

    // Create the marker definitions for arrows
    const defs = svg.append('defs');
    
    // Define arrow markers for each relationship type
    Object.values(RelationshipType).forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('class', `arrow arrow-${type}`);
    });

    // Create edges
    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(graph.links)
      .enter()
      .append('path')
      .attr('class', d => `link link-${d.type}`)
      .attr('id', d => `link-${d.id}`)
      .attr('marker-end', d => `url(#arrow-${d.type})`)
      .style('stroke', d => vizService.getRelationshipColor(d.relationshipData))
      .style('stroke-width', d => vizService.getRelationshipWidth(d.relationshipData))
      .style('stroke-dasharray', d => vizService.getRelationshipDashPattern(d.relationshipData))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedEdge(d.id);
        onEdgeSelect?.(d.id);
      })
      .on('mouseover', (event, d) => {
        setHoveredEdge(d.id);
        d3.select(event.currentTarget)
          .style('stroke-width', vizService.getRelationshipWidth(d.relationshipData) * 1.5);
      })
      .on('mouseout', (event, d) => {
        setHoveredEdge(null);
        d3.select(event.currentTarget)
          .style('stroke-width', vizService.getRelationshipWidth(d.relationshipData));
      });

    // Create nodes
    const nodes = g.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(graph.nodes)
      .enter()
      .append('g')
      .attr('class', d => `node node-${d.type}`)
      .attr('id', d => `node-${d.id}`)
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id);
        onNodeSelect?.(d.id);
      })
      .on('mouseover', (event, d) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', function() { 
            const node = d3.select(this).datum() as D3Node;
            return (node.radius || 10) * 1.2;
          });
      })
      .on('mouseout', (event, d) => {
        setHoveredNode(null);
        d3.select(event.currentTarget)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', function() { 
            const node = d3.select(this).datum() as D3Node;
            return node.radius || 10;
          });
      });

    // Add circles to nodes
    nodes.append('circle')
      .attr('r', d => d.radius || 10)
      .attr('fill', d => d.color || '#ccc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);

    // Add images to nodes if available
    nodes.filter(d => !!d.image)
      .append('image')
      .attr('xlink:href', d => d.image || '')
      .attr('x', d => -(d.radius || 10) * 0.7)
      .attr('y', d => -(d.radius || 10) * 0.7)
      .attr('width', d => (d.radius || 10) * 1.4)
      .attr('height', d => (d.radius || 10) * 1.4)
      .attr('clip-path', d => `circle(${d.radius || 10}px)`);

    // Add labels to nodes
    nodes.append('text')
      .attr('dy', d => (d.radius || 10) + 14)
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('class', 'node-label')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('fill', '#333')
      .style('font-weight', '600')
      .style('text-shadow', '0 0 3px white, 0 0 2px white, 0 0 1px white');

    // Add type icons to nodes
    nodes.append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-icon')
      .style('font-family', 'Material Icons')
      .style('font-size', d => `${(d.radius || 10) * 0.8}px`)
      .style('pointer-events', 'none')
      .style('fill', '#fff')
      .text(d => getNodeIcon(d.type));

    // Add relationship labels
    const linkLabels = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(graph.links)
      .enter()
      .append('text')
      .attr('dy', -5)
      .attr('text-anchor', 'middle')
      .attr('class', 'link-label')
      .style('font-size', '10px')
      .style('fill', '#666')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 0 3px white, 0 0 2px white, 0 0 1px white')
      .text(d => getRelationshipLabel(d.type));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      // Update link paths
      links.attr('d', d => {
        const sourceNode = typeof d.source === 'string' 
          ? graph.nodes.find(n => n.id === d.source) 
          : d.source as D3Node;
        
        const targetNode = typeof d.target === 'string' 
          ? graph.nodes.find(n => n.id === d.target) 
          : d.target as D3Node;
        
        if (!sourceNode || !targetNode) return '';
        
        const sourceX = sourceNode.x || 0;
        const sourceY = sourceNode.y || 0;
        const targetX = targetNode.x || 0;
        const targetY = targetNode.y || 0;
        
        // Calculate the direction vector
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        // Adjust source and target points to be on the circle perimeter
        const sourceRadius = sourceNode.radius || 10;
        const targetRadius = targetNode.radius || 10;
        
        // Normalized direction vector
        const dirX = dx / len;
        const dirY = dy / len;
        
        // Adjusted source and target points
        const adjustedSourceX = sourceX + dirX * sourceRadius;
        const adjustedSourceY = sourceY + dirY * sourceRadius;
        const adjustedTargetX = targetX - dirX * (targetRadius + 5); // +5 for arrow offset
        const adjustedTargetY = targetY - dirY * (targetRadius + 5);
        
        return `M${adjustedSourceX},${adjustedSourceY}L${adjustedTargetX},${adjustedTargetY}`;
      });
      
      // Update link labels
      linkLabels.attr('transform', d => {
        const sourceNode = typeof d.source === 'string' 
          ? graph.nodes.find(n => n.id === d.source) 
          : d.source as D3Node;
        
        const targetNode = typeof d.target === 'string' 
          ? graph.nodes.find(n => n.id === d.target) 
          : d.target as D3Node;
        
        if (!sourceNode || !targetNode) return '';
        
        const sourceX = sourceNode.x || 0;
        const sourceY = sourceNode.y || 0;
        const targetX = targetNode.x || 0;
        const targetY = targetNode.y || 0;
        
        // Position label at midpoint of the link
        const x = (sourceX + targetX) / 2;
        const y = (sourceY + targetY) / 2;
        
        return `translate(${x},${y})`;
      });
      
      // Update nodes
      nodes.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Set up click handler on svg background to deselect
    svg.on('click', () => {
      setSelectedNode(null);
      setSelectedEdge(null);
    });

    // Drag functions
    function dragStarted(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, D3Node, D3Node>, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      // Keep the node fixed if it was dragged
      // d.fx = null;
      // d.fy = null;
    }

    // Cleanup function
    return () => {
      vizService.stopSimulation();
    };
  }, [graph, svgRef, vizService, onNodeSelect, onEdgeSelect]);

  // Helper function to get node icon based on type
  const getNodeIcon = (type: NodeType): string => {
    switch (type) {
      case NodeType.MEDICAL_CONCEPT:
        return 'medical_information';
      case NodeType.TREATMENT:
        return 'medical_services';
      case NodeType.DRUG:
        return 'medication';
      case NodeType.SYMPTOM:
        return 'error';
      case NodeType.CONDITION:
        return 'sick';
      case NodeType.BIOMARKER:
        return 'science';
      default:
        return 'help';
    }
  };

  // Helper function to get relationship label
  const getRelationshipLabel = (type: RelationshipType): string => {
    switch (type) {
      case RelationshipType.TREATS:
        return 'treats';
      case RelationshipType.CAUSES:
        return 'causes';
      case RelationshipType.PREVENTS:
        return 'prevents';
      case RelationshipType.INDICATES:
        return 'indicates';
      case RelationshipType.INTERACTS_WITH:
        return 'interacts with';
      case RelationshipType.CONTRADICTS:
        return 'contradicts';
      case RelationshipType.AUGMENTS:
        return 'augments';
      case RelationshipType.RELATED_TO:
        return 'related to';
      default:
        return '';
    }
  };

  // Handle filter changes
  const updateFilters = (newFilters: Partial<KnowledgeGraphFilters>) => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    onFiltersChange?.(localFilters);
  };

  // Helper functions to find nodes and links by ID with proper type safety
  const findNodeById = (id: string | null): D3Node | null => {
    if (!id) return null;
    return graph.nodes.find(n => n.id === id) || null;
  };

  const findLinkById = (id: string | null): D3Link | null => {
    if (!id) return null;
    return graph.links.find(l => l.id === id) || null;
  };

  return (
    <div className={`knowledge-graph-engine ${className}`} style={{ width, height, position: 'relative' }}>
      <svg 
        ref={svgRef} 
        width={width} 
        height={height}
        className="knowledge-graph-svg"
        style={{ 
          background: 'linear-gradient(to bottom, #f5f7fa, #fafcff)',
          borderRadius: '8px'
        }}
      />
      
      <InteractionControls 
        onZoomIn={() => {
          const svg = d3.select(svgRef.current!);
          const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', null);
          svg.transition().call(zoom.scaleBy, 1.3);
        }}
        onZoomOut={() => {
          const svg = d3.select(svgRef.current!);
          const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', null);
          svg.transition().call(zoom.scaleBy, 0.7);
        }}
        onReset={() => {
          const svg = d3.select(svgRef.current!);
          const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', null);
          svg.transition().call(zoom.transform, d3.zoomIdentity);
          setTransform(d3.zoomIdentity);
          onResetFilters?.();
        }}
        onFilter={updateFilters}
        filters={localFilters}
        hoveredNode={findNodeById(hoveredNode)}
        hoveredEdge={findLinkById(hoveredEdge)}
        selectedNode={findNodeById(selectedNode)}
        selectedEdge={findLinkById(selectedEdge)}
        transform={transform}
      />
    </div>
  );
} 