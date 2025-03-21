/**
 * OutcomeNode Component
 * 
 * Shows the results of physician decisions
 * Provides clinical outcomes and patient status updates
 */

'use client';

import React from 'react';
import { OutcomeNode as OutcomeNodeType } from '../../../services/decisionTreeService';

// Component props
interface OutcomeNodeProps {
  node: OutcomeNodeType;
  onContinue: () => void;
}

/**
 * OutcomeNode component
 */
const OutcomeNode: React.FC<OutcomeNodeProps> = ({ node, onContinue }) => {
  // Get styling based on outcome type
  const getOutcomeStyling = () => {
    switch (node.outcomeType) {
      case 'positive':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-500',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: '✓',
          title: 'Positive Outcome',
          textColor: 'text-green-700'
        };
      case 'negative':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-500',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: '✗',
          title: 'Negative Outcome',
          textColor: 'text-red-700'
        };
      case 'neutral':
      default:
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-500',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          icon: 'i',
          title: 'Neutral Outcome',
          textColor: 'text-blue-700'
        };
    }
  };
  
  // Get styling based on patient status
  const getPatientStatusStyling = () => {
    switch (node.patientStatus) {
      case 'improved':
        return {
          icon: '📈',
          label: 'Improved',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      case 'worsened':
        return {
          icon: '📉',
          label: 'Worsened',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        };
      case 'complicated':
        return {
          icon: '⚠️',
          label: 'Complicated',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        };
      case 'unchanged':
      default:
        return {
          icon: '➡️',
          label: 'Unchanged',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        };
    }
  };
  
  const outcomeStyling = getOutcomeStyling();
  const patientStatusStyling = getPatientStatusStyling();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Outcome header */}
      <div className={`${outcomeStyling.bgColor} p-4 rounded-t-lg border-l-4 ${outcomeStyling.borderColor} mb-6`}>
        <div className="flex items-center">
          <div className={`${outcomeStyling.iconBg} h-8 w-8 rounded-full flex items-center justify-center ${outcomeStyling.iconColor} font-bold mr-3`}>
            {outcomeStyling.icon}
          </div>
          <h2 className={`text-xl font-bold ${outcomeStyling.textColor}`}>{outcomeStyling.title}</h2>
        </div>
      </div>
      
      {/* Outcome content */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{node.title}</h3>
        <p className="text-gray-700 mb-4">{node.content}</p>
        
        {/* Patient status badge */}
        <div className="flex items-center mb-4">
          <span className="text-gray-700 mr-2">Patient Status:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${patientStatusStyling.bgColor} ${patientStatusStyling.color}`}>
            {patientStatusStyling.icon} {patientStatusStyling.label}
          </span>
        </div>
        
        {/* Detailed explanation */}
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Clinical Explanation</h4>
          <p className="text-gray-700">{node.explanation}</p>
        </div>
        
        {/* Follow-up recommendations if available */}
        {node.followUp && (
          <div className="bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-400">
            <h4 className="font-medium text-yellow-800 mb-2">Follow-up Recommendations</h4>
            <p className="text-yellow-700">{node.followUp}</p>
          </div>
        )}
      </div>
      
      {/* Image if available */}
      {node.image && (
        <div className="mb-6">
          <img 
            src={node.image} 
            alt={`Image for ${node.title}`} 
            className="rounded-lg shadow-md max-h-80 mx-auto"
          />
        </div>
      )}
      
      {/* Continue button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={onContinue}
          className={`px-6 py-2 rounded-md shadow transition-colors text-white ${
            node.outcomeType === 'positive' 
              ? 'bg-green-600 hover:bg-green-700'
              : node.outcomeType === 'negative'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default OutcomeNode; 