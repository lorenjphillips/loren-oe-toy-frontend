'use client';

import React from 'react';
import { RelationshipType, EvidenceStrength, Relationship } from '../../models/knowledgeGraph';

interface EdgeLineProps {
  type: RelationshipType;
  evidenceStrength?: EvidenceStrength;
  width?: number;
  length?: number; 
  animate?: boolean;
  className?: string;
}

/**
 * EdgeLine component - Renders a line visualization for a relationship type
 */
export function EdgeLine({ 
  type, 
  evidenceStrength = EvidenceStrength.MODERATE,
  width = 2,
  length = 100,
  animate = false, 
  className = ''
}: EdgeLineProps) {
  const getTypeColor = (type: RelationshipType): string => {
    switch (type) {
      case RelationshipType.TREATS:
        return '#34A853'; // Green
      case RelationshipType.CAUSES:
        return '#EA4335'; // Red
      case RelationshipType.PREVENTS:
        return '#4285F4'; // Blue
      case RelationshipType.INDICATES:
        return '#FBBC05'; // Yellow
      case RelationshipType.INTERACTS_WITH:
        return '#9C27B0'; // Purple
      case RelationshipType.CONTRADICTS:
        return '#FF6D00'; // Orange
      case RelationshipType.AUGMENTS:
        return '#00BCD4'; // Cyan
      case RelationshipType.RELATED_TO:
        return '#9E9E9E'; // Grey
      default:
        return '#9E9E9E';
    }
  };

  const getDashArray = (strength: EvidenceStrength): string => {
    switch (strength) {
      case EvidenceStrength.STRONG:
        return ''; // Solid line
      case EvidenceStrength.MODERATE:
        return '5,1'; // Tight dash
      case EvidenceStrength.LIMITED:
        return '4,2'; // Medium dash
      case EvidenceStrength.ANECDOTAL:
        return '2,2'; // Short dash
      case EvidenceStrength.THEORETICAL:
        return '1,3'; // Dotted
      default:
        return '3,3';
    }
  };

  // Calculate opacity based on evidence strength
  const getOpacity = (strength: EvidenceStrength): number => {
    switch (strength) {
      case EvidenceStrength.STRONG:
        return 1;
      case EvidenceStrength.MODERATE:
        return 0.8;
      case EvidenceStrength.LIMITED:
        return 0.6;
      case EvidenceStrength.ANECDOTAL:
        return 0.4;
      case EvidenceStrength.THEORETICAL:
        return 0.3;
      default:
        return 0.5;
    }
  };

  const baseColor = getTypeColor(type);
  const opacity = getOpacity(evidenceStrength);
  const dashArray = getDashArray(evidenceStrength);
  
  // Calculate rgba color with opacity
  const hexToRgba = (hex: string, opacity: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const color = hexToRgba(baseColor, opacity);

  const lineStyle: React.CSSProperties = {
    height: `${width}px`,
    width: `${length}px`,
    backgroundColor: color,
    borderRadius: `${width}px`,
    position: 'relative',
  };

  if (dashArray) {
    // If we have a dash pattern, use a gradient background
    const gradientStyle: React.CSSProperties = {
      backgroundImage: `repeating-linear-gradient(
        to right,
        ${color} 0,
        ${color} ${dashArray.split(',')[0]}px,
        transparent ${dashArray.split(',')[0]}px,
        transparent ${parseInt(dashArray.split(',')[0]) + parseInt(dashArray.split(',')[1])}px
      )`,
      height: `${width}px`,
      width: `${length}px`,
      borderRadius: `${width}px`,
    };
    
    lineStyle.backgroundImage = gradientStyle.backgroundImage;
  }

  if (animate) {
    lineStyle.animation = 'edge-flow 1.5s linear infinite';
  }

  return (
    <div className={`edge-line edge-line-${type.toLowerCase()} ${className}`} style={lineStyle}>
      {/* Arrow at the end of the line */}
      <div style={{
        position: 'absolute',
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: `${width + 2}px solid transparent`,
        borderBottom: `${width + 2}px solid transparent`,
        borderLeft: `${width + 4}px solid ${color}`,
      }} />
    </div>
  );
}

interface EdgeTypeBadgeProps {
  type: RelationshipType;
  evidenceStrength?: EvidenceStrength;
  size?: 'small' | 'medium' | 'large';
  withLabel?: boolean;
  className?: string;
}

/**
 * EdgeTypeBadge component - Renders a badge for a relationship type
 */
export function EdgeTypeBadge({ 
  type, 
  evidenceStrength = EvidenceStrength.MODERATE,
  size = 'medium', 
  withLabel = true, 
  className = '' 
}: EdgeTypeBadgeProps) {
  const getTypeLabel = (type: RelationshipType): string => {
    switch (type) {
      case RelationshipType.TREATS:
        return 'Treats';
      case RelationshipType.CAUSES:
        return 'Causes';
      case RelationshipType.PREVENTS:
        return 'Prevents';
      case RelationshipType.INDICATES:
        return 'Indicates';
      case RelationshipType.INTERACTS_WITH:
        return 'Interacts With';
      case RelationshipType.CONTRADICTS:
        return 'Contradicts';
      case RelationshipType.AUGMENTS:
        return 'Augments';
      case RelationshipType.RELATED_TO:
        return 'Related To';
      default:
        return 'Unknown';
    }
  };

  const getEvidenceLabel = (strength: EvidenceStrength): string => {
    switch (strength) {
      case EvidenceStrength.STRONG:
        return 'Strong';
      case EvidenceStrength.MODERATE:
        return 'Moderate';
      case EvidenceStrength.LIMITED:
        return 'Limited';
      case EvidenceStrength.ANECDOTAL:
        return 'Anecdotal';
      case EvidenceStrength.THEORETICAL:
        return 'Theoretical';
      default:
        return 'Unknown';
    }
  };

  const getTypeColor = (type: RelationshipType): string => {
    switch (type) {
      case RelationshipType.TREATS:
        return '#34A853'; // Green
      case RelationshipType.CAUSES:
        return '#EA4335'; // Red
      case RelationshipType.PREVENTS:
        return '#4285F4'; // Blue
      case RelationshipType.INDICATES:
        return '#FBBC05'; // Yellow
      case RelationshipType.INTERACTS_WITH:
        return '#9C27B0'; // Purple
      case RelationshipType.CONTRADICTS:
        return '#FF6D00'; // Orange
      case RelationshipType.AUGMENTS:
        return '#00BCD4'; // Cyan
      case RelationshipType.RELATED_TO:
        return '#9E9E9E'; // Grey
      default:
        return '#9E9E9E';
    }
  };

  // Calculate sizes based on the size prop
  const lineWidth = size === 'small' ? 2 : size === 'medium' ? 3 : 4;
  const lineLength = size === 'small' ? 20 : size === 'medium' ? 30 : 40;
  const fontSize = size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px';
  const padding = size === 'small' ? '2px 8px' : size === 'medium' ? '4px 12px' : '6px 16px';
  
  // Style for the badge
  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: `${getTypeColor(type)}10`, // 10% opacity
    color: getTypeColor(type),
    borderRadius: '16px',
    padding,
    fontSize,
    fontWeight: 500,
    border: `1px solid ${getTypeColor(type)}30`, // 30% opacity
  };

  return (
    <div className={`edge-type-badge ${className}`} style={badgeStyle}>
      <EdgeLine 
        type={type} 
        evidenceStrength={evidenceStrength}
        width={lineWidth} 
        length={lineLength} 
      />
      {withLabel && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span>{getTypeLabel(type)}</span>
          <span style={{ 
            fontSize: parseInt(fontSize) - 2 + 'px', 
            opacity: 0.7 
          }}>
            {getEvidenceLabel(evidenceStrength)}
          </span>
        </div>
      )}
    </div>
  );
}

interface EdgeLegendProps {
  types?: RelationshipType[];
  strengths?: EvidenceStrength[];
  className?: string;
}

/**
 * EdgeLegend component - Renders a legend for relationship types and evidence strengths
 */
export function EdgeLegend({ types, strengths, className = '' }: EdgeLegendProps) {
  const displayTypes = types || Object.values(RelationshipType);
  const displayStrengths = strengths || [
    EvidenceStrength.STRONG,
    EvidenceStrength.MODERATE,
    EvidenceStrength.LIMITED
  ];
  
  return (
    <div className={`edge-legend ${className}`}>
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Relationship Types</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {displayTypes.map(type => (
            <EdgeTypeBadge 
              key={type} 
              type={type} 
              size="small" 
              evidenceStrength={EvidenceStrength.STRONG} 
            />
          ))}
        </div>
      </div>
      
      <div>
        <h4 style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Evidence Strength</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {displayStrengths.map(strength => (
            <EdgeTypeBadge 
              key={strength} 
              type={RelationshipType.TREATS} 
              evidenceStrength={strength} 
              size="small" 
              withLabel={false} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default {
  EdgeLine,
  EdgeTypeBadge,
  EdgeLegend
}; 