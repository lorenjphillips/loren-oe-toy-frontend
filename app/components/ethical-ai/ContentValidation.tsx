import React from 'react';
import { AdContent } from '../../models/adTypes';

interface ContentValidationProps {
  adContent: AdContent;
  showDetails?: boolean;
}

/**
 * Content Validation component
 * 
 * Displays validation results for clinical accuracy and compliance with
 * medical advertising standards. Can show detailed issues or just a summary.
 */
const ContentValidation: React.FC<ContentValidationProps> = ({ 
  adContent, 
  showDetails = false 
}) => {
  if (!adContent.guardrails) {
    return null;
  }
  
  const { clinicalAccuracy, compliance } = adContent.guardrails;
  const hasIssues = !clinicalAccuracy.isValid || !compliance.isCompliant;
  
  return (
    <div className={`content-validation ${hasIssues ? 'has-issues' : 'valid'}`}>
      <div className="validation-summary">
        <div className="validation-indicator">
          <span className={`indicator ${clinicalAccuracy.isValid ? 'valid' : 'invalid'}`} />
          <span>Clinical Accuracy</span>
        </div>
        
        <div className="validation-indicator">
          <span className={`indicator ${compliance.isCompliant ? 'valid' : 'invalid'}`} />
          <span>Compliance</span>
        </div>
      </div>
      
      {showDetails && hasIssues && (
        <div className="validation-details">
          {!clinicalAccuracy.isValid && (
            <div className="validation-issues">
              <h5>Clinical Accuracy Issues:</h5>
              <ul>
                {clinicalAccuracy.issues.map((issue, index) => (
                  <li key={`clinical-${index}`}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {!compliance.isCompliant && (
            <div className="validation-issues">
              <h5>Compliance Issues:</h5>
              <ul>
                {compliance.issues.map((issue, index) => (
                  <li key={`compliance-${index}`}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentValidation; 