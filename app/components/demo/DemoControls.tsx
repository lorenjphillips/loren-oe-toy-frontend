// Demo controls component for adjusting demo mode settings
'use client';

import React, { useState } from 'react';
import { useDemoConfig, DemoScenario } from '../../services/demo/demoConfig';

interface DemoControlsProps {
  className?: string;
}

const DemoControls: React.FC<DemoControlsProps> = ({ className = '' }) => {
  const { config, updateConfig, toggleDemo, setScenario } = useDemoConfig();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
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
  
  // Helper to get scenario description
  const getScenarioDescription = (scenario: DemoScenario) => {
    switch (scenario) {
      case DemoScenario.BASIC:
        return 'Basic features with simplified workflows for quick overview.';
      case DemoScenario.CLINICAL_DECISION:
        return 'Focused on medical decision support with detailed clinical content.';
      case DemoScenario.ANALYTICS:
        return 'Detailed analytics dashboard with performance metrics.';
      case DemoScenario.COMPREHENSIVE:
        return 'Full-featured demo with all capabilities enabled.';
      default:
        return 'Select a demo scenario.';
    }
  };
  
  if (!config.enabled && !isExpanded) {
    return (
      <div className={`${className} p-4`}>
        <button
          onClick={() => toggleDemo(true)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md shadow transition-colors"
        >
          Enter Demo Mode
        </button>
      </div>
    );
  }
  
  return (
    <div className={`${className} bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden`}>
      <div 
        className="bg-purple-600 text-white p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <h3 className="font-bold text-lg">Demo Mode Controls</h3>
        <div className="flex items-center">
          <div className={`mr-2 h-3 w-3 rounded-full ${config.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{config.enabled ? 'Active' : 'Inactive'}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`ml-2 h-5 w-5 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="demo-toggle" className="font-medium">Demo Mode</label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  id="demo-toggle" 
                  type="checkbox" 
                  checked={config.enabled}
                  onChange={() => toggleDemo()}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${config.enabled ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-0 top-0 w-6 h-6 bg-white rounded-full transition transform ${config.enabled ? 'translate-x-4' : 'translate-x-0'} border-2 ${config.enabled ? 'border-purple-600' : 'border-gray-300'}`}></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {config.enabled ? 'Demo mode is currently active' : 'Enable demo mode to explore features without real data'}
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demo Scenario
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.values(DemoScenario).map((scenario) => (
                <div
                  key={scenario}
                  className={`border rounded-md p-3 cursor-pointer transition-colors ${
                    config.scenario === scenario
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setScenario(scenario)}
                >
                  <div className="font-medium">{getScenarioName(scenario)}</div>
                  <div className="text-sm text-gray-500">{getScenarioDescription(scenario)}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Simulation Options
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="simulate-network"
                  checked={config.simulateNetworkDelay}
                  onChange={() => updateConfig({ simulateNetworkDelay: !config.simulateNetworkDelay })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="simulate-network" className="ml-2 block text-sm text-gray-700">
                  Simulate Network Delays
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="guided-tour"
                  checked={config.guidedTourEnabled}
                  onChange={() => updateConfig({ guidedTourEnabled: !config.guidedTourEnabled })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="guided-tour" className="ml-2 block text-sm text-gray-700">
                  Enable Guided Tour
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-debug"
                  checked={config.showDebugInfo}
                  onChange={() => updateConfig({ showDebugInfo: !config.showDebugInfo })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="show-debug" className="ml-2 block text-sm text-gray-700">
                  Show Debug Information
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Simulation Speed
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="speed-slow"
                  name="speed"
                  checked={config.simulationSpeed === 'slow'}
                  onChange={() => updateConfig({ simulationSpeed: 'slow' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <label htmlFor="speed-slow" className="ml-2 block text-sm text-gray-700">
                  Slow (for presentation)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="speed-normal"
                  name="speed"
                  checked={config.simulationSpeed === 'normal'}
                  onChange={() => updateConfig({ simulationSpeed: 'normal' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <label htmlFor="speed-normal" className="ml-2 block text-sm text-gray-700">
                  Normal (realistic)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="speed-fast"
                  name="speed"
                  checked={config.simulationSpeed === 'fast'}
                  onChange={() => updateConfig({ simulationSpeed: 'fast' })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <label htmlFor="speed-fast" className="ml-2 block text-sm text-gray-700">
                  Fast (quick testing)
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoControls; 