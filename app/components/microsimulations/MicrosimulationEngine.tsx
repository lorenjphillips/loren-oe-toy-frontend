/**
 * MicrosimulationEngine
 * 
 * Core component for interactive clinical microsimulations in the OpenEvidence platform.
 * Manages the simulation state, progression, physician interactions, and timing.
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ClinicalScenario, 
  DecisionPoint, 
  DecisionOption, 
  ScenarioState, 
  PatientInfo, 
  EducationalContent,
  MicrosimulationConfig,
  MicrosimulationAnalytics,
  ScenarioOutcome
} from '../../models/microsimulation';
import { TreatmentCategory, AdCompany } from '../../models/adTypes';
import { MicrosimulationConfigService } from '../../services/microsimulationConfig';
import { educationalContentService } from '../../services/educationalContent';

// Import our new educational components
import TreatmentCard from '../education/TreatmentCard';
import EvidencePanel from '../education/EvidencePanel';
import MechanismVisualizer from '../education/MechanismVisualizer';
import ComparisonTable from '../education/ComparisonTable';

// Instead of importing the components which don't exist yet, we'll define them
// at the bottom of this file (see below)

// Simulation status enum
enum SimulationStatus {
  LOADING = 'loading',
  READY = 'ready',
  RUNNING = 'running',
  DECISION_POINT = 'decision_point',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Props interface for the MicrosimulationEngine
interface MicrosimulationEngineProps {
  physicianQuestion: string;
  medicalCategory?: string;
  treatment?: string;
  company?: AdCompany;
  waitingTime?: number; // Time in seconds that the physician is expected to wait
  onComplete?: (analytics: MicrosimulationAnalytics) => void;
  onEducationalContentViewed?: (contentId: string, viewDuration: number) => void;
  onDecisionMade?: (decisionId: string, optionId: string, isCorrect: boolean) => void;
}

/**
 * MicrosimulationEngine component
 * 
 * Manages the state and flow of an interactive clinical microsimulation
 */
const MicrosimulationEngine: React.FC<MicrosimulationEngineProps> = ({
  physicianQuestion,
  medicalCategory,
  treatment,
  company,
  waitingTime = 60,
  onComplete,
  onEducationalContentViewed,
  onDecisionMade
}) => {
  // Configuration service
  const configService = useRef(new MicrosimulationConfigService());
  
  // Simulation state
  const [status, setStatus] = useState<SimulationStatus>(SimulationStatus.LOADING);
  const [error, setError] = useState<string | null>(null);
  const [scenario, setScenario] = useState<ClinicalScenario | null>(null);
  const [currentState, setCurrentState] = useState<ScenarioState | null>(null);
  const [activeDecisionPoint, setActiveDecisionPoint] = useState<DecisionPoint | null>(null);
  const [activeEducationalContent, setActiveEducationalContent] = useState<EducationalContent[]>([]);
  const [outcome, setOutcome] = useState<ScenarioOutcome | null>(null);
  
  // Analytics tracking
  const [analytics, setAnalytics] = useState<MicrosimulationAnalytics>({
    sessionId: `session_${Date.now()}`,
    scenarioId: '',
    startTime: new Date(),
    completionStatus: 'completed',
    decisions: [],
    educationalContentViewed: []
  });
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(waitingTime);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  
  // Timing scale factor - allows speeding up or slowing down the simulation
  const [timeScale, setTimeScale] = useState<number>(1.0);
  
  // Tracking timers
  const simulationTimerRef = useRef<number | null>(null);
  const decisionTimerRef = useRef<number | null>(null);
  const decisionStartTime = useRef<number>(0);
  
  /**
   * Initialize the simulation
   */
  useEffect(() => {
    const initializeSimulation = async () => {
      try {
        // Create treatment category mock-up based on inputs
        // In a real implementation, this would come from a proper data source
        const treatmentCategory: TreatmentCategory | undefined = treatment && medicalCategory 
          ? {
              id: treatment,
              name: treatment.charAt(0).toUpperCase() + treatment.slice(1),
              medicalCategory: medicalCategory,
              medicalCategoryName: medicalCategory.charAt(0).toUpperCase() + medicalCategory.slice(1),
              keywords: [treatment],
              description: `${treatment} treatments for ${medicalCategory} conditions`
            } 
          : undefined;
        
        // Get configuration from service
        const config = configService.current.generateConfiguration(
          physicianQuestion,
          company,
          treatmentCategory,
          waitingTime
        );
        
        // Set time scale from config
        if (config.timeScale) {
          setTimeScale(config.timeScale);
        }
        
        // Get scenario from service based on configuration
        // For this implementation, we're directly using the hard-coded scenario in the service
        // In a real implementation, this would fetch from an API or database
        const availableScenarios = Array.from((configService.current as any).scenarioTemplates.values());
        
        // Fix type issues by asserting the type
        const typedScenarios = availableScenarios as ClinicalScenario[];
        const selectedScenario = typedScenarios.find(s => s.id === config.scenarioId) || typedScenarios[0];
        
        if (!selectedScenario) {
          throw new Error('No suitable scenario found');
        }
        
        // Initialize analytics
        setAnalytics(prev => ({
          ...prev,
          scenarioId: selectedScenario.id,
          startTime: new Date()
        }));
        
        // Set scenario
        setScenario(selectedScenario);
        
        // Set initial state
        setCurrentState(selectedScenario.initialState);
        
        // First decision point
        // In a full implementation, this would respect the config.initialDecisionPointId
        const availablePoints = config.availableDecisionPoints ?? [];
        const firstDecisionPoint = availablePoints.length > 0
          ? selectedScenario.decisionPoints.find(dp => availablePoints.includes(dp.id))
          : selectedScenario.decisionPoints[0];
        
        if (firstDecisionPoint) {
          setActiveDecisionPoint(firstDecisionPoint);
        }
        
        // Set status to ready
        setStatus(SimulationStatus.READY);
      } catch (err) {
        console.error('Failed to initialize simulation:', err);
        setError('Failed to initialize simulation');
        setStatus(SimulationStatus.ERROR);
      }
    };
    
    initializeSimulation();
    
    // Start timer
    startTimer();
    
    // Cleanup function
    return () => {
      // Stop timer
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      
      // Record end analytics
      setAnalytics(prev => ({
        ...prev,
        endTime: new Date(),
        totalDuration: prev.startTime 
          ? Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000) 
          : 0,
        completionStatus: 'abandoned'
      }));
    };
  }, [physicianQuestion, medicalCategory, treatment, company, waitingTime]);
  
  /**
   * Start the countdown timer
   */
  const startTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    
    // Set up the timer
    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 0) {
          // Time's up - handle completion
          handleSimulationComplete();
          return 0;
        }
        return isPaused ? prevTime : prevTime - 1;
      });
      
      // Update the scenario state time
      if (!isPaused && currentState) {
        setCurrentState(prevState => ({
          ...prevState!,
          timeElapsed: prevState!.timeElapsed + (1 * timeScale)
        }));
      }
    }, 1000); // Run every second
    
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isPaused, timeScale, currentState]);
  
  /**
   * Handle decision made by the physician
   */
  const handleDecision = (optionId: string) => {
    if (!activeDecisionPoint) return;
    
    // Find the selected option
    const selectedOption = activeDecisionPoint.options.find(option => option.id === optionId);
    if (!selectedOption) return;
    
    // Record the decision for analytics
    const decisionTime = Math.floor((new Date().getTime() - decisionStartTime.current) / 1000);
    setAnalytics(prev => ({
      ...prev,
      decisions: [
        ...prev.decisions,
        {
          decisionId: activeDecisionPoint.id,
          optionId: selectedOption.id,
          timestamp: new Date(),
          timeToDecide: decisionTime,
          wasCorrect: selectedOption.isCorrect,
        }
      ]
    }));
    
    // Call the callback if provided
    if (onDecisionMade) {
      onDecisionMade(activeDecisionPoint.id, optionId, selectedOption.isCorrect);
    }

    // Check for educational content to display
    let educationalContent: EducationalContent[] = [];
    
    // Add decision-specific educational content if available
    if (selectedOption.educationalContentIds && selectedOption.educationalContentIds.length > 0) {
      // In a real implementation, fetch content from a service based on IDs
      // For this implementation, we'll fetch using our educational content service
      const decisionEduContent = selectedOption.educationalContentIds.map(id => {
        // Try to find specific content ID in the scenario's educational content
        const contentFromScenario = scenario?.educationalContent?.find(content => content.id === id);
        
        if (contentFromScenario) {
          return contentFromScenario;
        } else {
          // Fallback to generating content based on treatment if the ID is not found
          if (selectedOption.recommendedTreatmentId) {
            const treatmentContent = educationalContentService.getContentForTreatment(
              selectedOption.recommendedTreatmentId,
              company
            );
            return treatmentContent.length > 0 ? treatmentContent[0] : null;
          }
          return null;
        }
      }).filter(content => content !== null) as EducationalContent[];
      
      educationalContent = [...educationalContent, ...decisionEduContent];
    }
    
    // Add treatment-specific educational content if a treatment is recommended
    if (selectedOption.recommendedTreatmentId) {
      const treatmentContent = educationalContentService.getContentForTreatment(
        selectedOption.recommendedTreatmentId,
        company
      );
      
      // If we have sponsored treatment, also add comparison content
      if (selectedOption.sponsoredTreatmentId && 
          selectedOption.sponsoredTreatmentId !== selectedOption.recommendedTreatmentId) {
        // Add comparison content between recommended and sponsored treatments
        const comparisonContent = educationalContentService.getComparisonContent([
          selectedOption.recommendedTreatmentId,
          selectedOption.sponsoredTreatmentId
        ]);
        
        // If no comparison content exists, generate contextual content for the sponsored treatment
        if (comparisonContent.length === 0 && company) {
          const sponsoredContent = educationalContentService.getContentForTreatment(
            selectedOption.sponsoredTreatmentId,
            company
          );
          educationalContent = [...educationalContent, ...sponsoredContent];
        } else {
          educationalContent = [...educationalContent, ...comparisonContent];
        }
      }
      
      educationalContent = [...educationalContent, ...treatmentContent];
    }

    // Only show unique content (remove duplicates)
    const uniqueEducationalContent = Array.from(
      new Map(educationalContent.map(item => [item.id, item])).values()
    );
    
    // Display educational content if available
    if (uniqueEducationalContent.length > 0) {
      setActiveEducationalContent(uniqueEducationalContent);
      setStatus(SimulationStatus.PAUSED);
      return;
    }
    
    // Process scenario outcome if triggered
    if (selectedOption.triggerOutcomeId) {
      const outcome = scenario?.outcomes.find(o => o.id === selectedOption.triggerOutcomeId);
      if (outcome) {
        handleOutcome(outcome);
        return;
      }
    }
    
    // Update the scenario state
    if (selectedOption.nextState && currentState) {
      // In a real implementation, we'd merge the next state with the current state
      const updatedState: ScenarioState = {
        ...currentState,
        ...selectedOption.nextState,
        // Ensure we keep the required properties from ScenarioState
        currentPhase: selectedOption.nextState.currentPhase || currentState.currentPhase,
        timeElapsed: selectedOption.nextState.timeElapsed || currentState.timeElapsed,
        patientStatus: selectedOption.nextState.patientStatus || currentState.patientStatus,
        completedActions: [
          ...currentState.completedActions,
          activeDecisionPoint.id
        ],
        availableActions: selectedOption.nextState.availableActions || currentState.availableActions,
        displayedInformation: selectedOption.nextState.displayedInformation || currentState.displayedInformation
      };
      
      setCurrentState(updatedState);
    }
    
    // Reset the active decision point
    setActiveDecisionPoint(null);
    
    // Resume the simulation or find the next decision point
    if (currentState?.availableActions && currentState.availableActions.length > 0) {
      // Find the next decision point
      findNextDecisionPoint();
    } else {
      // No more actions, complete the simulation
      completeSimulation();
    }
  };
  
  /**
   * Find the next decision point based on current state
   */
  const findNextDecisionPoint = () => {
    if (!scenario || !currentState) return;
    
    const availableDecisionPoints = scenario.decisionPoints.filter(dp => 
      !dp.requiredPriorActions ||
      dp.requiredPriorActions.every(action => 
        currentState.completedActions.includes(action)
      )
    );
    
    const nextDecisionPoint = availableDecisionPoints.find(dp => 
      !currentState.completedActions.includes(dp.id)
    );
    
    if (nextDecisionPoint) {
      setActiveDecisionPoint(nextDecisionPoint);
      setStatus(SimulationStatus.DECISION_POINT);
      // Start the decision timer
      decisionStartTime.current = new Date().getTime();
    } else {
      setStatus(SimulationStatus.RUNNING);
    }
  };
  
  /**
   * Complete the simulation
   */
  const completeSimulation = () => {
    setStatus(SimulationStatus.COMPLETED);
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      endTime: new Date(),
      totalDuration: currentState ? currentState.timeElapsed : 0,
      completionStatus: 'completed'
    }));
    
    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete(analytics);
    }
  };
  
  /**
   * Handle displaying an outcome
   */
  const handleOutcome = useCallback((outcome: ScenarioOutcome) => {
    setOutcome(outcome);
    setStatus(SimulationStatus.COMPLETED);
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      outcomeId: outcome.id,
      endTime: new Date(),
      totalDuration: prev.startTime 
        ? Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000) 
        : 0,
      completionStatus: 'completed'
    }));
    
    // Display associated educational content
    if (outcome.educationalContentIds && outcome.educationalContentIds.length > 0 && scenario) {
      const contentToShow = outcome.educationalContentIds
        .map(contentId => 
          scenario.educationalContent.find(content => content.id === contentId)
        )
        .filter((content): content is EducationalContent => content !== undefined);
      
      if (contentToShow.length > 0) {
        setActiveEducationalContent(contentToShow);
      }
    }
    
    // Call the onComplete callback
    if (onComplete) {
      onComplete(analytics);
    }
  }, [scenario, onComplete, analytics]);
  
  /**
   * Handle when the simulation completes due to time running out
   */
  const handleSimulationComplete = useCallback(() => {
    // Clear timer
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // If we already have an outcome, nothing to do
    if (outcome) return;
    
    // Try to determine outcome based on current state
    determineOutcome();
    
    // If we still have no outcome, use default "timed out" logic
    if (!outcome && scenario && scenario.outcomes.length > 0) {
      // Find a neutral outcome, or use the first one
      const timedOutOutcome = scenario.outcomes.find(o => o.type === 'neutral') || 
                              scenario.outcomes[0];
                              
      handleOutcome(timedOutOutcome);
    }
  }, [outcome, scenario, determineOutcome, handleOutcome]);
  
  /**
   * Handle when educational content has been viewed
   */
  const handleEducationalContentViewed = useCallback((contentId: string, viewDuration: number, completed: boolean) => {
    // Record in analytics
    setAnalytics(prev => ({
      ...prev,
      educationalContentViewed: [
        ...prev.educationalContentViewed,
        {
          contentId,
          viewDuration,
          completed
        }
      ]
    }));
    
    // Call the callback if provided
    if (onEducationalContentViewed) {
      onEducationalContentViewed(contentId, viewDuration);
    }
    
    // Clear the active educational content
    setActiveEducationalContent([]);
    
    // Resume simulation if paused
    if (isPaused) {
      setIsPaused(false);
      setStatus(SimulationStatus.RUNNING);
    }
  }, [isPaused, onEducationalContentViewed]);
  
  /**
   * Pause or resume the simulation
   */
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    if (isPaused) {
      setStatus(SimulationStatus.RUNNING);
    } else {
      setStatus(SimulationStatus.PAUSED);
    }
  }, [isPaused]);
  
  // Render different views based on the current status
  const renderContent = () => {
    switch (status) {
      case SimulationStatus.LOADING:
        return <div className="loading">Loading simulation...</div>;
        
      case SimulationStatus.ERROR:
        return <div className="error">Error: {error}</div>;
        
      case SimulationStatus.READY:
      case SimulationStatus.RUNNING:
      case SimulationStatus.DECISION_POINT:
        return (
          <div className="simulation-content">
            {/* Patient information display */}
            {scenario && currentState && (
              <PatientView 
                patientInfo={scenario.patientInfo} 
                currentState={currentState} 
              />
            )}
            
            {/* Active decision point */}
            {activeDecisionPoint && (
              <DecisionPointView 
                decisionPoint={activeDecisionPoint}
                onDecision={(optionId) => handleDecision(optionId)}
                timeRemaining={activeDecisionPoint.timeLimit}
              />
            )}
          </div>
        );
        
      case SimulationStatus.PAUSED:
        return (
          <div className="simulation-paused">
            <div className="pause-overlay">
              <h3>Simulation Paused</h3>
              <button onClick={togglePause}>Resume</button>
            </div>
            
            {/* Show the underlying simulation content in a dimmed state */}
            <div className="dimmed-content">
              {scenario && currentState && (
                <PatientView 
                  patientInfo={scenario.patientInfo} 
                  currentState={currentState} 
                />
              )}
            </div>
          </div>
        );
        
      case SimulationStatus.COMPLETED:
        return (
          <div className="simulation-completed">
            {/* Outcome display */}
            {outcome && scenario && (
              <OutcomeView 
                outcome={outcome}
                scenario={scenario}
              />
            )}
          </div>
        );
        
      default:
        return <div>Unknown status</div>;
    }
  };
  
  /**
   * Render educational content
   */
  const renderEducationalContent = () => {
    if (!activeEducationalContent || activeEducationalContent.length === 0) {
      return null;
    }

    const handleContentViewed = (contentId: string, viewDuration: number, completed: boolean = true) => {
      // Track analytics for viewed content
      setAnalytics(prev => ({
        ...prev,
        educationalContentViewed: [
          ...prev.educationalContentViewed,
          { contentId, viewDuration, completed }
        ]
      }));
      
      // Call the callback if provided
      if (onEducationalContentViewed) {
        onEducationalContentViewed(contentId, viewDuration);
      }
    };

    // Categorize content by type for appropriate display
    const treatmentInfoContent = activeEducationalContent.filter(
      content => content.type === 'text' && !content.content.includes('trial')
    );
    
    const evidenceContent = activeEducationalContent.filter(
      content => content.type === 'text' && 
      (content.content.includes('trial') || 
      content.content.includes('study') || 
      content.content.includes('evidence'))
    );
    
    const mechanismContent = activeEducationalContent.filter(
      content => content.type === 'image' || content.type === 'video'
    );
    
    const comparisonContent = activeEducationalContent.filter(
      content => content.associatedTreatmentIds && content.associatedTreatmentIds.length > 1
    );

    return (
      <div className="p-4 space-y-6">
        <h3 className="text-xl font-semibold mb-4">Educational Resources</h3>
        
        {/* Treatment information cards */}
        {treatmentInfoContent.map(content => (
          <div key={content.id} className="mb-6">
            <TreatmentCard
              title={content.title}
              content={content.content}
              treatmentName={content.associatedTreatmentIds?.[0]}
              source={content.source}
              contentType="text"
              onExpand={() => handleContentViewed(content.id, 5)}
            />
          </div>
        ))}
        
        {/* Evidence panels */}
        {evidenceContent.map(content => {
          // Simple parsing of content to extract study details
          // In a real implementation, this would come structured from the backend
          const parsedContent = {
            studyName: content.title.includes(':') ? content.title.split(':')[1].trim() : content.title,
            sampleSize: parseStudySampleSize(content.content),
            design: parseStudyDesign(content.content),
            primaryOutcome: "Clinical outcomes as described in study",
            results: content.content,
            pValue: parsePValue(content.content),
            citation: content.source || 'Reference information unavailable',
          };
          
          return (
            <div key={content.id} className="mb-6">
              <EvidencePanel
                title="Clinical Evidence"
                treatmentName={content.associatedTreatmentIds?.[0]}
                evidence={parsedContent}
                onCitationClick={() => handleContentViewed(content.id, 10)}
              />
            </div>
          );
        })}
        
        {/* Mechanism visualizers */}
        {mechanismContent.map(content => {
          // For simplicity, create a basic mechanism steps array
          // In a real implementation, this would be more sophisticated
          const mockSteps = [
            { 
              id: 1, 
              title: 'Mechanism of Action', 
              description: 'The primary mechanism involves specific biochemical pathways that lead to the therapeutic effect.',
              imageUrl: typeof content.content === 'string' ? content.content : undefined
            }
          ];
          
          return (
            <div key={content.id} className="mb-6">
              <MechanismVisualizer
                title="Treatment Mechanism"
                treatmentName={content.associatedTreatmentIds?.[0] || 'Treatment'}
                steps={mockSteps}
                educationalContent={content}
                onStepChange={() => handleContentViewed(content.id, 8)}
              />
            </div>
          );
        })}
        
        {/* Comparison tables */}
        {comparisonContent.map(content => {
          // Mock categories and metrics for comparison
          // In a real implementation, this would come structured from the backend
          const mockCategories = [
            { id: 'efficacy', name: 'Efficacy', importance: 'high' as const },
            { id: 'safety', name: 'Safety Profile', importance: 'high' as const },
            { id: 'convenience', name: 'Convenience & Compliance', importance: 'medium' as const }
          ];
          
          const mockMetrics = [
            { categoryId: 'efficacy', label: 'Response Rate', type: 'numeric' as const, unit: '%' },
            { categoryId: 'safety', label: 'Serious Adverse Events', type: 'numeric' as const, unit: '%' },
            { categoryId: 'convenience', label: 'Dosing Frequency', type: 'text' as const }
          ];
          
          // Create comparison data for each treatment
          const mockTreatments = content.associatedTreatmentIds?.map(treatmentId => ({
            treatmentId,
            treatmentName: treatmentId.charAt(0).toUpperCase() + treatmentId.slice(1),
            companyName: getCompanyForTreatment(treatmentId),
            metrics: {
              'Response Rate': { value: Math.floor(Math.random() * 30) + 50, highlight: Math.random() > 0.5, citation: '1' },
              'Serious Adverse Events': { value: Math.floor(Math.random() * 8) + 2, highlight: Math.random() > 0.7, citation: '2' },
              'Dosing Frequency': { value: ['Once daily', 'Twice daily', 'Weekly'][Math.floor(Math.random() * 3)], citation: '3' }
            }
          })) || [];
          
          return (
            <div key={content.id} className="mb-6">
              <ComparisonTable
                title="Treatment Comparison"
                description="Comparative analysis of treatment options based on clinical data"
                categories={mockCategories}
                metrics={mockMetrics}
                treatments={mockTreatments}
                educationalContent={content}
                showCitations={true}
                onCitationClick={() => handleContentViewed(content.id, 15)}
              />
            </div>
          );
        })}
      </div>
    );
  };

  // Helper functions for parsing content
  const parseStudySampleSize = (content: string): number => {
    const match = content.match(/N=(\d+,?\d*)/);
    if (match) {
      return parseInt(match[1].replace(',', ''));
    }
    return Math.floor(Math.random() * 5000) + 1000; // Fallback to random number
  };
  
  const parseStudyDesign = (content: string): string => {
    if (content.toLowerCase().includes('randomized')) return 'Randomized Controlled Trial';
    if (content.toLowerCase().includes('meta-analysis')) return 'Meta-analysis';
    if (content.toLowerCase().includes('cohort')) return 'Cohort Study';
    return 'Clinical Trial';
  };
  
  const parsePValue = (content: string): string => {
    const match = content.match(/p\s*[<>=]\s*(0\.\d+|<\s*0\.\d+)/);
    return match ? match[0] : 'N/A';
  };
  
  const getCompanyForTreatment = (treatmentId: string): string => {
    // This would use the actual mapping in a real implementation
    const companyNames = ['PharmEx', 'MediCore', 'NovaBio', 'GenTech'];
    return companyNames[Math.floor(Math.random() * companyNames.length)];
  };
  
  return (
    <div className="microsimulation-engine">
      <div className="simulation-header">
        <h2>{scenario?.title || 'Clinical Scenario'}</h2>
        
        <div className="simulation-controls">
          <div className="timer">
            Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          
          <button onClick={togglePause}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
      
      {renderContent()}
      {renderEducationalContent()}
    </div>
  );
};

// For now, export placeholder components for the imports at the top
// In a full implementation, these would be in separate files
export const PatientView: React.FC<{
  patientInfo: PatientInfo;
  currentState: ScenarioState;
}> = () => <div>PatientView Placeholder</div>;

export const DecisionPointView: React.FC<{
  decisionPoint: DecisionPoint;
  onDecision: (optionId: string) => void;
  timeRemaining?: number;
}> = () => <div>DecisionPointView Placeholder</div>;

export const EducationalContentView: React.FC<{
  content: EducationalContent[];
  onComplete: (contentId: string, viewDuration: number, completed: boolean) => void;
}> = () => <div>EducationalContentView Placeholder</div>;

export const OutcomeView: React.FC<{
  outcome: ScenarioOutcome;
  scenario: ClinicalScenario;
}> = () => <div>OutcomeView Placeholder</div>;

export default MicrosimulationEngine; 