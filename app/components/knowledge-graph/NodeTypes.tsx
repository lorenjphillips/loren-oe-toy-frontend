'use client';

import React from 'react';
import { NodeType } from '../../models/knowledgeGraph';

interface NodeTypeIconProps {
  type: NodeType;
  size?: number;
  color?: string;
  className?: string;
}

/**
 * NodeTypeIcon component - Renders an appropriate icon for a node type
 */
export function NodeTypeIcon({ type, size = 24, color, className = '' }: NodeTypeIconProps) {
  const getIcon = () => {
    switch (type) {
      case NodeType.MEDICAL_CONCEPT:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" 
              fill={color || "#4285F4"} />
          </svg>
        );
      case NodeType.TREATMENT:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"
              fill={color || "#34A853"} />
          </svg>
        );
      case NodeType.DRUG:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 3h12v2H6V3zm11 3H7c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 9h-2.5v2.5h-3V15H8v-3h2.5V9.5h3V12H16v3z" 
              fill={color || "#FBBC05"} />
          </svg>
        );
      case NodeType.SYMPTOM:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" 
              fill={color || "#EA4335"} />
          </svg>
        );
      case NodeType.CONDITION:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 9c0-4.97-4.03-9-9-9S3 4.03 3 9c0 4.632 3.501 8.443 8 8.941V19H7v2h10v-2h-4v-1.059c4.499-.498 8-4.309 8-8.941zm-9 7c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" 
              fill={color || "#8F00FF"} />
          </svg>
        );
      case NodeType.BIOMARKER:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.8 18.4L14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.39-.81H9.04c-.42 0-.65.48-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6z" 
              fill={color || "#00CED1"} />
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z" 
              fill={color || "#9E9E9E"} />
          </svg>
        );
    }
  };

  return (
    <div className={`node-type-icon ${className}`}>
      {getIcon()}
    </div>
  );
}

interface NodeTypeBadgeProps {
  type: NodeType;
  size?: 'small' | 'medium' | 'large';
  withLabel?: boolean;
  className?: string;
}

/**
 * NodeTypeBadge component - Renders a badge with icon and optional label for a node type
 */
export function NodeTypeBadge({ type, size = 'medium', withLabel = true, className = '' }: NodeTypeBadgeProps) {
  const getNodeTypeLabel = (type: NodeType): string => {
    switch (type) {
      case NodeType.MEDICAL_CONCEPT:
        return 'Medical Concept';
      case NodeType.TREATMENT:
        return 'Treatment';
      case NodeType.DRUG:
        return 'Drug';
      case NodeType.SYMPTOM:
        return 'Symptom';
      case NodeType.CONDITION:
        return 'Condition';
      case NodeType.BIOMARKER:
        return 'Biomarker';
      default:
        return 'Unknown';
    }
  };

  const getNodeTypeColor = (type: NodeType): string => {
    switch (type) {
      case NodeType.MEDICAL_CONCEPT:
        return '#4285F4'; // Google Blue
      case NodeType.TREATMENT:
        return '#34A853'; // Google Green
      case NodeType.DRUG:
        return '#FBBC05'; // Google Yellow
      case NodeType.SYMPTOM:
        return '#EA4335'; // Google Red
      case NodeType.CONDITION:
        return '#8F00FF'; // Violet
      case NodeType.BIOMARKER:
        return '#00CED1'; // Turquoise
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const badgeStyle = {
    backgroundColor: `${getNodeTypeColor(type)}20`, // 20 is hex for 12% opacity
    color: getNodeTypeColor(type),
    border: `1px solid ${getNodeTypeColor(type)}40`, // 40 is hex for 25% opacity
    borderRadius: '16px',
    padding: size === 'small' ? '2px 8px' : size === 'medium' ? '4px 12px' : '6px 16px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: size === 'small' ? '12px' : size === 'medium' ? '14px' : '16px',
    fontWeight: 500,
  };

  return (
    <div className={`node-type-badge ${className}`} style={badgeStyle}>
      <NodeTypeIcon type={type} size={iconSize} color={getNodeTypeColor(type)} />
      {withLabel && <span>{getNodeTypeLabel(type)}</span>}
    </div>
  );
}

interface NodeTypeLegendProps {
  types?: NodeType[];
  className?: string;
}

/**
 * NodeTypeLegend component - Renders a legend showing all node types
 */
export function NodeTypeLegend({ types, className = '' }: NodeTypeLegendProps) {
  const displayTypes = types || Object.values(NodeType);
  
  return (
    <div className={`node-type-legend ${className}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {displayTypes.map(type => (
        <NodeTypeBadge key={type} type={type} size="small" />
      ))}
    </div>
  );
}

export default {
  NodeTypeIcon,
  NodeTypeBadge,
  NodeTypeLegend
}; 