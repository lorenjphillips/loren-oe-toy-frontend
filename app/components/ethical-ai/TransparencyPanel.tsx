import React, { useState } from 'react';
import { GuardrailedAdContent } from '../../models/ethicalAITypes';

interface TransparencyPanelProps {
  adContent: GuardrailedAdContent;
  confidenceScore?: number;
}

/**
 * Transparency Panel component
 * 
 * Shows why a particular ad was displayed to the user, including selection criteria,
 * confidence scores, and transparency disclosures.
 */
const TransparencyPanel: React.FC<TransparencyPanelProps> = ({ 
  adContent, 
  confidenceScore 
}) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!adContent.guardrails?.transparencyInfo) {
    return null;
  }
  
  const {
    selectionCriteria,
    disclaimers,
    citations,
    dataUsage,
    aboutAds
  } = adContent.guardrails.transparencyInfo;
  
  return (
    <div className="transparency-panel">
      <button 
        className="transparency-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {expanded ? 'Hide' : 'Why am I seeing this?'}
      </button>
      
      {expanded && (
        <div className="transparency-content">
          <h4>About this content</h4>
          
          <div className="transparency-section">
            <h5>Selection criteria</h5>
            <ul>
              <li>
                <strong>Relevance score:</strong> {selectionCriteria.relevanceFactor}
              </li>
              <li>
                <strong>Matched medical topic:</strong> {selectionCriteria.matchedMedicalCategory}
              </li>
              <li>
                <strong>Content provider:</strong> {selectionCriteria.company}
              </li>
              <li>
                <strong>Sponsored:</strong> {selectionCriteria.isSponsored ? 'Yes' : 'No'}
              </li>
            </ul>
          </div>
          
          {disclaimers && disclaimers.length > 0 && (
            <div className="transparency-section">
              <h5>Disclaimers</h5>
              <ul>
                {disclaimers.map((disclaimer: string, index: number) => (
                  <li key={`disclaimer-${index}`}>{disclaimer}</li>
                ))}
              </ul>
            </div>
          )}
          
          {citations && citations.length > 0 && (
            <div className="transparency-section">
              <h5>Clinical citations</h5>
              <ul>
                {citations.map((citation: string, index: number) => (
                  <li key={`citation-${index}`}>{citation}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="transparency-section">
            <h5>About data usage</h5>
            <p>{dataUsage}</p>
          </div>
          
          <div className="transparency-section">
            <h5>About sponsored content</h5>
            <p>{aboutAds}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransparencyPanel; 