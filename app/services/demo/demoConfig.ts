// Demo configuration service for OpenEvidence ad platform
// Provides functionality to manage demo mode settings and scenarios

import { useState, useEffect } from 'react';

// Demo mode storage key in localStorage
const DEMO_MODE_STORAGE_KEY = 'openevidence-demo-mode';
const DEMO_SCENARIO_STORAGE_KEY = 'openevidence-demo-scenario';
const DEMO_SETTINGS_STORAGE_KEY = 'openevidence-demo-settings';

// Available demo scenarios
export enum DemoScenario {
  BASIC = 'basic',               // Simple demo with basic features
  CLINICAL_DECISION = 'clinical', // Specialized clinical decision support
  ANALYTICS = 'analytics',       // Focused on analytics visualization
  COMPREHENSIVE = 'comprehensive' // Full featured demo with all capabilities
}

// Demo configuration interface
export interface DemoConfig {
  enabled: boolean;
  scenario: DemoScenario;
  simulateNetworkDelay: boolean;
  simulationSpeed: 'slow' | 'normal' | 'fast';
  guidedTourEnabled: boolean;
  showDebugInfo: boolean;
}

// Default demo configuration
export const DEFAULT_DEMO_CONFIG: DemoConfig = {
  enabled: false,
  scenario: DemoScenario.BASIC,
  simulateNetworkDelay: true,
  simulationSpeed: 'normal',
  guidedTourEnabled: true,
  showDebugInfo: false
};

// Helper function to check if we're in demo mode
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedValue = localStorage.getItem(DEMO_MODE_STORAGE_KEY);
  return storedValue === 'true';
}

// Helper function to get current demo scenario
export function getDemoScenario(): DemoScenario {
  if (typeof window === 'undefined') return DemoScenario.BASIC;
  
  const storedValue = localStorage.getItem(DEMO_SCENARIO_STORAGE_KEY);
  return (storedValue as DemoScenario) || DemoScenario.BASIC;
}

// Helper function to get full demo configuration
export function getDemoConfig(): DemoConfig {
  if (typeof window === 'undefined') return DEFAULT_DEMO_CONFIG;
  
  try {
    const storedConfig = localStorage.getItem(DEMO_SETTINGS_STORAGE_KEY);
    if (!storedConfig) return DEFAULT_DEMO_CONFIG;
    
    return JSON.parse(storedConfig) as DemoConfig;
  } catch (error) {
    console.error('Error parsing demo config:', error);
    return DEFAULT_DEMO_CONFIG;
  }
}

// Helper to save demo configuration
export function saveDemoConfig(config: DemoConfig): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(DEMO_MODE_STORAGE_KEY, config.enabled.toString());
  localStorage.setItem(DEMO_SCENARIO_STORAGE_KEY, config.scenario);
  localStorage.setItem(DEMO_SETTINGS_STORAGE_KEY, JSON.stringify(config));
}

// Toggle demo mode on/off
export function toggleDemoMode(enabled?: boolean): boolean {
  if (typeof window === 'undefined') return false;
  
  const currentConfig = getDemoConfig();
  const newState = enabled !== undefined ? enabled : !currentConfig.enabled;
  
  const updatedConfig = {
    ...currentConfig,
    enabled: newState
  };
  
  saveDemoConfig(updatedConfig);
  return newState;
}

// Change demo scenario
export function setDemoScenario(scenario: DemoScenario): void {
  const currentConfig = getDemoConfig();
  
  const updatedConfig = {
    ...currentConfig,
    scenario
  };
  
  saveDemoConfig(updatedConfig);
}

// Update demo settings
export function updateDemoSettings(settings: Partial<DemoConfig>): DemoConfig {
  const currentConfig = getDemoConfig();
  
  const updatedConfig = {
    ...currentConfig,
    ...settings
  };
  
  saveDemoConfig(updatedConfig);
  return updatedConfig;
}

// React hook for demo configuration
export function useDemoConfig() {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  
  useEffect(() => {
    // Initialize from localStorage on client-side
    if (typeof window !== 'undefined') {
      setConfig(getDemoConfig());
      
      // Add event listener for changes from other tabs/components
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === DEMO_SETTINGS_STORAGE_KEY && event.newValue) {
          try {
            setConfig(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Error parsing demo config from storage event:', error);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);
  
  // Function to update config and persist changes
  const updateConfig = (newConfig: Partial<DemoConfig>) => {
    const updatedConfig = updateDemoSettings(newConfig);
    setConfig(updatedConfig);
    return updatedConfig;
  };
  
  return {
    config,
    updateConfig,
    isEnabled: config.enabled,
    currentScenario: config.scenario,
    toggleDemo: (enabled?: boolean) => {
      const newState = toggleDemoMode(enabled);
      setConfig(prev => ({ ...prev, enabled: newState }));
      return newState;
    },
    setScenario: (scenario: DemoScenario) => {
      setDemoScenario(scenario);
      setConfig(prev => ({ ...prev, scenario }));
    }
  };
} 