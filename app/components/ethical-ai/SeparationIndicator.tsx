import React from 'react';
import { GuardrailedAdContent } from '../../models/ethicalAITypes';

interface SeparationIndicatorProps {
  adContent: GuardrailedAdContent;
  position?: 'top' | 'bottom' | 'inline';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Separation Indicator component
 * 
 * Clearly distinguishes promotional content from educational content
 * with appropriate visual indicators and text labels.
 */
const SeparationIndicator: React.FC<SeparationIndicatorProps> = ({ 
  adContent, 
  position = 'top',
  size = 'medium'
}) => {
  if (!adContent.guardrails?.separationIndicator) {
    return null;
  }
  
  const indicatorText = adContent.guardrails.separationIndicator;
  
  return (
    <div className={`separation-indicator position-${position} size-${size}`}>
      <div className="indicator-badge">
        {indicatorText}
      </div>
      
      {/* Visual separator line */}
      <div className="separator-line" />
    </div>
  );
};

export default SeparationIndicator; 