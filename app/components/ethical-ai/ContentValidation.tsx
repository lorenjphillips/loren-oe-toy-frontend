import React from 'react';
import { GuardrailedAdContent } from '../../models/ethicalAITypes';

interface ContentValidationProps {
  adContent: GuardrailedAdContent;
  showDetails?: boolean;
}

/**
 * ContentValidation component
 * 
 * Shows validation results for clinical accuracy and regulatory compliance
 * with optional detailed issues reporting.
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
    <div className="content-validation">
      <div className={`validation-status ${hasIssues ? 'has-issues' : 'no-issues'}`}>
        <h4>Content Validation</h4>
        <div className="validation-summary">
          <div className={`validation-indicator ${clinicalAccuracy.isValid ? 'valid' : 'invalid'}`}>
            Clinical Accuracy: {clinicalAccuracy.isValid ? 'Validated' : 'Issues Found'}
          </div>
          <div className={`validation-indicator ${compliance.isCompliant ? 'valid' : 'invalid'}`}>
            Regulatory Compliance: {compliance.isCompliant ? 'Compliant' : 'Issues Found'}
          </div>
        </div>
      </div>
      
      {showDetails && hasIssues && (
        <div className="validation-details">
          {!clinicalAccuracy.isValid && (
            <div className="validation-issues">
              <h5>Clinical Accuracy Issues:</h5>
              <ul>
                {clinicalAccuracy.issues.map((issue: string, index: number) => (
                  <li key={`clinical-${index}`}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {!compliance.isCompliant && (
            <div className="validation-issues">
              <h5>Compliance Issues:</h5>
              <ul>
                {compliance.issues.map((issue: string, index: number) => (
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