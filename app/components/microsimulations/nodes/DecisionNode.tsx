/**
 * DecisionNode Component
 * 
 * Presents a clinical decision point to the physician with multiple options
 * Handles selection of treatment or diagnostic choices
 */

'use client';

import React, { useState, useEffect } from 'react';
import { DecisionNode as DecisionNodeType } from '../../../services/decisionTreeService';

// Component props
interface DecisionNodeProps {
  node: DecisionNodeType;
  onDecision: (optionId: string) => void;
  timeConstraint?: number; // Optional time constraint in seconds
}

/**
 * DecisionNode component
 */
const DecisionNode: React.FC<DecisionNodeProps> = ({ 
  node, 
  onDecision,
  timeConstraint 
}) => {
  // State for selected option
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer state if time constraint is provided
  const [timeRemaining, setTimeRemaining] = useState(timeConstraint || 0);
  const [isTimerActive, setIsTimerActive] = useState(!!timeConstraint);
  
  // Handle timer countdown if time constraint is provided
  useEffect(() => {
    if (!timeConstraint || !isTimerActive) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsTimerActive(false);
          // Auto-submit when time runs out if an option is selected
          if (selectedOption) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeConstraint, isTimerActive, selectedOption]);
  
  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };
  
  // Handle submission of decision
  const handleSubmit = () => {
    if (selectedOption && !isSubmitting) {
      setIsSubmitting(true);
      onDecision(selectedOption);
    }
  };
  
  // Determine the decision type icon/title
  const getDecisionTypeInfo = () => {
    const decisionType = node.metadata?.decisionType || 'diagnostic';
    
    switch(decisionType) {
      case 'diagnostic':
        return {
          icon: '🔍',
          title: 'Diagnostic Decision',
          color: 'text-indigo-700'
        };
      case 'treatment':
        return {
          icon: '💊',
          title: 'Treatment Decision',
          color: 'text-green-700'
        };
      case 'follow_up':
        return {
          icon: '📅',
          title: 'Follow-Up Decision',
          color: 'text-orange-700'
        };
      default:
        return {
          icon: '❓',
          title: 'Clinical Decision',
          color: 'text-blue-700'
        };
    }
  };
  
  const { icon, title, color } = getDecisionTypeInfo();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header with timer if applicable */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{icon}</span>
          <h2 className={`text-xl font-bold ${color}`}>{title}</h2>
        </div>
        
        {timeConstraint && (
          <div className={`px-3 py-1 rounded-full ${
            timeRemaining < 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
          }`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      
      {/* Decision title and question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{node.title}</h3>
        <p className="text-gray-700">{node.content}</p>
        <div className="mt-4 bg-blue-50 p-4 rounded-md border-l-4 border-blue-500">
          <p className="font-medium text-blue-900">{node.question}</p>
        </div>
      </div>
      
      {/* Decision options */}
      <div className="space-y-3 mb-6">
        {node.options.map((option) => (
          <div 
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`p-4 rounded-md cursor-pointer transition-all ${
              selectedOption === option.id 
                ? 'bg-blue-100 border-2 border-blue-500 shadow-md' 
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-5 h-5 rounded-full border ${
                  selectedOption === option.id 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-400'
                } flex items-center justify-center`}>
                  {selectedOption === option.id && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <span className={`font-medium ${
                  selectedOption === option.id ? 'text-blue-700' : 'text-gray-800'
                }`}>
                  {option.text}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Submit button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className={`px-6 py-2 rounded-md shadow transition-colors ${
            !selectedOption || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Decision'}
        </button>
      </div>
    </div>
  );
};

export default DecisionNode; 