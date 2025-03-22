// Guided tour component for demo mode
'use client';

import React, { useState, useEffect, CSSProperties } from 'react';
import { useDemoConfig, DemoScenario } from '../../services/demo/demoConfig';

interface TourStep {
  title: string;
  content: string;
  elementSelector?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface GuidedTourProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  onComplete,
  autoStart = true
}) => {
  const { config } = useDemoConfig();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  
  // Define tour steps based on the current scenario
  const getTourSteps = (): TourStep[] => {
    const commonSteps: TourStep[] = [
      {
        title: 'Welcome to the Demo',
        content: 'This guided tour will help you understand the key features of the OpenEvidence platform.'
      },
      {
        title: 'Main Question Input',
        content: 'Enter your medical questions here to get evidence-based answers and relevant medication information.',
        elementSelector: '.question-input'
      }
    ];
    
    const scenarioSpecificSteps: Record<DemoScenario, TourStep[]> = {
      [DemoScenario.BASIC]: [
        {
          title: 'Sample Questions',
          content: 'Click on any of these sample questions to quickly explore the platform capabilities.',
          elementSelector: '.sample-questions'
        },
        {
          title: 'Answers Panel',
          content: 'The platform presents evidence-based answers with sources and relevant medications.',
          elementSelector: '.answers-panel'
        }
      ],
      [DemoScenario.CLINICAL_DECISION]: [
        {
          title: 'Clinical Decision Support',
          content: 'This demo focuses on providing detailed clinical evidence for medical decisions.',
          elementSelector: '.clinical-support-panel'
        },
        {
          title: 'Evidence Grading',
          content: 'Notice the evidence ratings that indicate the strength of recommendations.',
          elementSelector: '.evidence-grading'
        },
        {
          title: 'Medication Comparisons',
          content: 'Compare treatment options based on efficacy, safety, and other factors.',
          elementSelector: '.medication-comparison'
        }
      ],
      [DemoScenario.ANALYTICS]: [
        {
          title: 'Analytics Dashboard',
          content: 'This demo showcases the powerful analytics capabilities.',
          elementSelector: '.analytics-dashboard'
        },
        {
          title: 'Performance Metrics',
          content: 'Review key metrics for drug performance and advertising effectiveness.',
          elementSelector: '.performance-metrics'
        },
        {
          title: 'Engagement Data',
          content: 'Analyze user engagement patterns across specialties and demographics.',
          elementSelector: '.engagement-data'
        }
      ],
      [DemoScenario.COMPREHENSIVE]: [
        {
          title: 'Comprehensive Features',
          content: 'This demo includes all platform capabilities including clinical support, analytics, and more.',
          elementSelector: '.feature-overview'
        },
        {
          title: 'Customization Options',
          content: 'Explore the various customization options available for tailoring the experience.',
          elementSelector: '.customization-panel'
        },
        {
          title: 'Administrative Controls',
          content: 'Review the administrative controls for managing the platform.',
          elementSelector: '.admin-controls'
        }
      ]
    };
    
    return [...commonSteps, ...scenarioSpecificSteps[config.scenario]];
  };
  
  const tourSteps = getTourSteps();
  
  useEffect(() => {
    // Only show guided tour if it&apos;s enabled in the demo config
    if (config.enabled && config.guidedTourEnabled && autoStart) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [config.enabled, config.guidedTourEnabled, autoStart]);
  
  useEffect(() => {
    // Find the target element for the current step
    if (isVisible && tourSteps[currentStep]?.elementSelector) {
      const element = document.querySelector(tourSteps[currentStep].elementSelector as string);
      setTargetElement(element);
    } else {
      setTargetElement(null);
    }
  }, [currentStep, isVisible, tourSteps]);
  
  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // End of tour
      setIsVisible(false);
      if (onComplete) onComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const closeTour = () => {
    setIsVisible(false);
    if (onComplete) onComplete();
  };
  
  if (!isVisible || !config.enabled || !config.guidedTourEnabled) return null;
  
  // Calculate position for the tooltip
  const getTooltipPosition = (): CSSProperties => {
    if (!targetElement) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }
    
    const rect = targetElement.getBoundingClientRect();
    const position = tourSteps[currentStep].position || 'bottom';
    
    switch (position) {
      case 'top':
        return {
          position: 'absolute',
          bottom: `${window.innerHeight - rect.top + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'right':
        return {
          position: 'absolute',
          left: `${rect.right + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)'
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          position: 'absolute',
          right: `${window.innerWidth - rect.left + 10}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)'
        };
      default:
        return {
          position: 'absolute',
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
    }
  };
  
  const tooltipStyle = getTooltipPosition();
  
  return (
    <>
      {/* Highlight overlay for the target element */}
      {targetElement && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none"
          style={{
            clipPath: targetElement
              ? `polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
                ${targetElement.getBoundingClientRect().left}px ${targetElement.getBoundingClientRect().top}px,
                ${targetElement.getBoundingClientRect().left}px ${targetElement.getBoundingClientRect().bottom}px,
                ${targetElement.getBoundingClientRect().right}px ${targetElement.getBoundingClientRect().bottom}px,
                ${targetElement.getBoundingClientRect().right}px ${targetElement.getBoundingClientRect().top}px,
                ${targetElement.getBoundingClientRect().left}px ${targetElement.getBoundingClientRect().top}px)`
              : 'none'
          }}
        />
      )}
      
      {/* Tour tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-lg p-4 w-80"
        style={tooltipStyle}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-purple-700">{tourSteps[currentStep].title}</h3>
          <button 
            onClick={closeTour}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close tour"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 mb-4">{tourSteps[currentStep].content}</p>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <div className="flex space-x-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
              >
                Previous
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidedTour; 