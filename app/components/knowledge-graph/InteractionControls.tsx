'use client';

import React, { useState } from 'react';
import { ZoomTransform } from 'd3';
import { NodeType, RelationshipType, EvidenceStrength, KnowledgeGraphFilters } from '../../models/knowledgeGraph';
import { D3Node, D3Link } from '../../services/visualizationService';
import { NodeTypeBadge } from './NodeTypes';
import { EdgeTypeBadge } from './EdgeTypes';

interface InteractionControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFilter: (filters: Partial<KnowledgeGraphFilters>) => void;
  filters: KnowledgeGraphFilters;
  hoveredNode: D3Node | null;
  hoveredEdge: D3Link | null;
  selectedNode: D3Node | null;
  selectedEdge: D3Link | null;
  transform: ZoomTransform;
  className?: string;
}

export default function InteractionControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFilter,
  filters,
  hoveredNode,
  hoveredEdge,
  selectedNode,
  selectedEdge,
  transform,
  className = '',
}: InteractionControlsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Style for control buttons
  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: '0 4px',
    color: '#555',
  };

  // Style for control panel
  const controlPanelStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(4px)',
    zIndex: 10,
  };

  // Style for info panel
  const infoPanelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '280px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(4px)',
    zIndex: 10,
    display: showInfo ? 'block' : 'none',
  };

  // Style for filter panel
  const filterPanelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    width: '280px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(4px)',
    zIndex: 10,
    display: showFilters ? 'block' : 'none',
  };

  // Return formatted info about selected or hovered elements
  const getElementInfo = () => {
    if (selectedNode) {
      return (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Selected Node</h3>
          <NodeTypeBadge type={selectedNode.type} size="small" />
          <h4 style={{ margin: '12px 0 4px 0', fontSize: '14px' }}>{selectedNode.label}</h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>
            {selectedNode.nodeData.description}
          </p>
          {selectedNode.nodeData.type === NodeType.TREATMENT && (
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Pharma Affiliations:</div>
              <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                {(selectedNode.nodeData as any).pharmaAffiliations?.map((affiliation: any, index: number) => (
                  <li key={index}>
                    {affiliation.companyName} ({affiliation.relationshipType})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } else if (selectedEdge) {
      return (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Selected Relationship</h3>
          <EdgeTypeBadge 
            type={selectedEdge.type} 
            evidenceStrength={selectedEdge.strength} 
            size="small" 
          />
          <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>
            {selectedEdge.relationshipData.description || 'No description available.'}
          </p>
          {selectedEdge.relationshipData.citations.length > 0 && (
            <div style={{ fontSize: '13px', marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Citations:</div>
              <ul style={{ margin: '0 0 0 16px', padding: 0 }}>
                {selectedEdge.relationshipData.citations.slice(0, 2).map((citation, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    {citation.title} ({citation.publicationDate?.split('-')[0]})
                    {citation.peerReviewed && <span style={{ color: 'green', marginLeft: '4px' }}>✓ Peer-reviewed</span>}
                  </li>
                ))}
                {selectedEdge.relationshipData.citations.length > 2 && (
                  <li>+{selectedEdge.relationshipData.citations.length - 2} more citations</li>
                )}
              </ul>
            </div>
          )}
        </div>
      );
    } else if (hoveredNode) {
      return (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Node: {hoveredNode.label}</h3>
          <NodeTypeBadge type={hoveredNode.type} size="small" />
        </div>
      );
    } else if (hoveredEdge) {
      return (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Relationship</h3>
          <EdgeTypeBadge 
            type={hoveredEdge.type} 
            evidenceStrength={hoveredEdge.strength} 
            size="small" 
          />
        </div>
      );
    } else {
      return (
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Knowledge Graph</h3>
          <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
            Hover over nodes or edges to see details. Click to select and view more information.
          </p>
          <div style={{ fontSize: '13px', marginTop: '12px' }}>
            <div>Zoom: {transform.k.toFixed(1)}x</div>
            <div>Position: [{transform.x.toFixed(0)}, {transform.y.toFixed(0)}]</div>
          </div>
        </div>
      );
    }
  };

  // Render filter controls
  const renderFilters = () => {
    return (
      <div>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Filters</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Node Types</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.values(NodeType).map(type => (
              <div 
                key={type}
                onClick={() => {
                  const nodeTypes = filters.nodeTypes || [];
                  const newNodeTypes = nodeTypes.includes(type)
                    ? nodeTypes.filter(t => t !== type)
                    : [...nodeTypes, type];
                  onFilter({ nodeTypes: newNodeTypes.length ? newNodeTypes : undefined });
                }}
                style={{
                  opacity: filters.nodeTypes ? (filters.nodeTypes.includes(type) ? 1 : 0.5) : 1,
                  cursor: 'pointer',
                }}
              >
                <NodeTypeBadge type={type} size="small" />
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Relationship Types</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.values(RelationshipType).map(type => (
              <div 
                key={type}
                onClick={() => {
                  const relationshipTypes = filters.relationshipTypes || [];
                  const newRelationshipTypes = relationshipTypes.includes(type)
                    ? relationshipTypes.filter(t => t !== type)
                    : [...relationshipTypes, type];
                  onFilter({ relationshipTypes: newRelationshipTypes.length ? newRelationshipTypes : undefined });
                }}
                style={{
                  opacity: filters.relationshipTypes ? (filters.relationshipTypes.includes(type) ? 1 : 0.5) : 1,
                  cursor: 'pointer',
                }}
              >
                <EdgeTypeBadge type={type} size="small" />
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Evidence Strength</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.values(EvidenceStrength).map(strength => (
              <div 
                key={strength}
                onClick={() => {
                  const evidenceStrengths = filters.evidenceStrengths || [];
                  const newEvidenceStrengths = evidenceStrengths.includes(strength)
                    ? evidenceStrengths.filter(s => s !== strength)
                    : [...evidenceStrengths, strength];
                  onFilter({ evidenceStrengths: newEvidenceStrengths.length ? newEvidenceStrengths : undefined });
                }}
                style={{
                  opacity: filters.evidenceStrengths ? (filters.evidenceStrengths.includes(strength) ? 1 : 0.5) : 1,
                  cursor: 'pointer',
                }}
              >
                <EdgeTypeBadge 
                  type={RelationshipType.TREATS} 
                  evidenceStrength={strength} 
                  size="small" 
                />
              </div>
            ))}
          </div>
        </div>
        
        {(filters.nodeTypes || filters.relationshipTypes || filters.evidenceStrengths) && (
          <button
            onClick={() => onFilter({
              nodeTypes: undefined,
              relationshipTypes: undefined,
              evidenceStrengths: undefined
            })}
            style={{
              padding: '8px 12px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={`knowledge-graph-controls ${className}`}>
      {/* Zoom and view controls */}
      <div style={controlPanelStyle}>
        <button 
          onClick={onZoomIn} 
          style={buttonStyle}
          title="Zoom In"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </button>
        <button 
          onClick={onZoomOut} 
          style={buttonStyle}
          title="Zoom Out"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 13H5v-2h14v2z" fill="currentColor" />
          </svg>
        </button>
        <button 
          onClick={onReset} 
          style={buttonStyle}
          title="Reset View"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" fill="currentColor" />
          </svg>
        </button>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          style={{
            ...buttonStyle,
            backgroundColor: showFilters ? '#e3f2fd' : 'white',
          }}
          title="Toggle Filters"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" fill="currentColor" />
          </svg>
        </button>
        <button 
          onClick={() => setShowInfo(!showInfo)} 
          style={{
            ...buttonStyle,
            backgroundColor: showInfo ? '#e3f2fd' : 'white',
          }}
          title="Toggle Info Panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Information panel */}
      <div style={infoPanelStyle}>
        {getElementInfo()}
      </div>

      {/* Filter panel */}
      <div style={filterPanelStyle}>
        {renderFilters()}
      </div>
    </div>
  );
} 