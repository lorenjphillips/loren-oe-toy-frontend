/**
 * MechanismVisualizer Component
 * 
 * Visualizes the mechanism of action for treatments using
 * interactive diagrams and explanatory text.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { EducationalContent } from '../../models/microsimulation';

interface MechanismStep {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  highlightElements?: string[];
}

interface MechanismVisualizerProps {
  title: string;
  treatmentName: string;
  steps: MechanismStep[];
  overview?: string;
  interactiveMode?: boolean;
  educationalContent?: EducationalContent;
  svgContent?: string;
  className?: string;
  onStepChange?: (stepIndex: number) => void;
  onComplete?: () => void;
}

const MechanismVisualizer: React.FC<MechanismVisualizerProps> = ({
  title,
  treatmentName,
  steps,
  overview,
  interactiveMode = true,
  educationalContent,
  svgContent,
  className = '',
  onStepChange,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Function to handle SVG element highlighting based on current step
  useEffect(() => {
    if (svgRef.current && steps[currentStep]?.highlightElements) {
      const svg = svgRef.current.querySelector('svg');
      if (!svg) return;
      
      // Reset all highlights
      svg.querySelectorAll('[data-highlight]').forEach(el => {
        el.removeAttribute('data-active');
      });
      
      // Apply highlights for current step
      steps[currentStep].highlightElements?.forEach(id => {
        const element = svg.querySelector(`[data-highlight="${id}"]`);
        if (element) {
          element.setAttribute('data-active', 'true');
        }
      });
    }
    
    // Call the onStepChange callback if provided
    if (onStepChange) {
      onStepChange(currentStep);
    }
  }, [currentStep, steps, onStepChange]);
  
  // Handle autoplay functionality
  useEffect(() => {
    if (autoplayEnabled && currentStep < steps.length - 1) {
      // Clear any existing timer
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
      
      // Set timer for next step
      autoplayTimerRef.current = setTimeout(() => {
        setAnimating(true);
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setAnimating(false);
        }, 500);
      }, 3000); // 3 second delay between steps
    } else if (autoplayEnabled && currentStep === steps.length - 1) {
      // End of steps
      setAutoplayEnabled(false);
      if (onComplete) {
        onComplete();
      }
    }
    
    // Cleanup timer on unmount or when autoplay is disabled
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [autoplayEnabled, currentStep, steps.length, onComplete]);
  
  const goToStep = (stepIndex: number) => {
    // Stop autoplay if manually navigating
    if (autoplayEnabled) {
      setAutoplayEnabled(false);
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    }
    
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setAnimating(false);
    }, 300);
  };
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };
  
  const toggleAutoplay = () => {
    setAutoplayEnabled(!autoplayEnabled);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {title}
          <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 rounded-full px-3 py-1">
            {treatmentName}
          </span>
          
          {interactiveMode && (
            <div className="ml-auto">
              <button
                onClick={toggleAutoplay}
                className={`text-sm px-3 py-1 rounded ${
                  autoplayEnabled 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {autoplayEnabled ? 'Pause' : 'Autoplay'}
              </button>
            </div>
          )}
        </h3>
        
        {overview && (
          <p className="mt-2 text-gray-600">{overview}</p>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Visual area */}
        <div 
          className={`p-6 w-full md:w-3/5 flex items-center justify-center transition-opacity duration-300 ${
            animating ? 'opacity-50' : 'opacity-100'
          }`}
          ref={svgRef}
        >
          {svgContent ? (
            <div dangerouslySetInnerHTML={{ __html: svgContent }} />
          ) : steps[currentStep]?.imageUrl ? (
            <Image
              src={steps[currentStep].imageUrl}
              alt={`${treatmentName} mechanism - ${steps[currentStep].title}`}
              width={500}
              height={400}
              className="object-contain max-h-80"
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">
              Visualization not available
            </div>
          )}
        </div>
        
        {/* Description area */}
        <div className="w-full md:w-2/5 bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-200">
          <div className={`transition-opacity duration-300 ${animating ? 'opacity-50' : 'opacity-100'}`}>
            <h4 className="font-medium text-lg text-gray-800">
              {currentStep + 1}. {steps[currentStep].title}
            </h4>
            <p className="mt-2 text-gray-700 leading-relaxed">
              {steps[currentStep].description}
            </p>
            
            {educationalContent && currentStep === steps.length - 1 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-700">
                  {educationalContent.content}
                </p>
                {educationalContent.source && (
                  <p className="mt-2 text-xs text-gray-500 italic">
                    Source: {educationalContent.source}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Navigation */}
          {interactiveMode && (
            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  currentStep === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 hover:text-indigo-800'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-2.5 h-2.5 rounded-full ${
                      currentStep === index 
                        ? 'bg-indigo-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
              
              <button 
                onClick={nextStep}
                disabled={currentStep === steps.length - 1 && !onComplete}
                className={`px-3 py-1 rounded-md text-sm flex items-center ${
                  currentStep === steps.length - 1 && !onComplete
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 hover:text-indigo-800'
                }`}
              >
                {currentStep === steps.length - 1 && onComplete ? 'Finish' : 'Next'}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MechanismVisualizer; 