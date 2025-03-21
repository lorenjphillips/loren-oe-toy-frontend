// Demo mode indicator component
'use client';

import React from 'react';
import { useDemoConfig, DemoScenario } from '../../services/demo/demoConfig';

interface DemoIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
}

const DemoIndicator: React.FC<DemoIndicatorProps> = ({
  position = 'top-right',
  showDetails = true
}) => {
  const { config, toggleDemo } = useDemoConfig();
  
  if (!config.enabled) return null;
  
  // Helper to get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  };
  
  // Helper to get scenario display name
  const getScenarioName = (scenario: DemoScenario) => {
    switch (scenario) {
      case DemoScenario.BASIC:
        return 'Basic Demo';
      case DemoScenario.CLINICAL_DECISION:
        return 'Clinical Decision Support';
      case DemoScenario.ANALYTICS:
        return 'Analytics Dashboard';
      case DemoScenario.COMPREHENSIVE:
        return 'Comprehensive Demo';
      default:
        return 'Demo Mode';
    }
  };
  
  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div className="bg-purple-700 text-white px-4 py-2 rounded-md shadow-md flex items-center">
        <div className="mr-2 h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
        <div className="flex flex-col">
          <span className="font-bold">DEMO MODE</span>
          {showDetails && (
            <span className="text-xs opacity-80">
              {getScenarioName(config.scenario)}
            </span>
          )}
        </div>
        <button 
          onClick={() => toggleDemo(false)}
          className="ml-3 bg-purple-800 hover:bg-purple-900 text-xs rounded px-2 py-1"
          aria-label="Exit Demo Mode"
        >
          Exit
        </button>
      </div>
    </div>
  );
};

export default DemoIndicator; 