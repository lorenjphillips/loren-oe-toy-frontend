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
   * Handle a physician's decision
   */
  const handleDecision = useCallback((decisionPointId: string, optionId: string) => {
    if (!activeDecisionPoint || !scenario) return;
    
    // Find the selected option
    const selectedOption = activeDecisionPoint.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;
    
    // Record the decision in analytics
    const decisionTime = new Date();
    setAnalytics(prev => ({
      ...prev,
      decisions: [
        ...prev.decisions,
        {
          decisionId: decisionPointId,
          optionId: optionId,
          timestamp: decisionTime,
          timeToDecide: activeDecisionPoint.timeLimit || 0, // This would need to be calculated properly
          wasCorrect: selectedOption.isCorrect
        }
      ]
    }));
    
    // Call the onDecisionMade callback if provided
    if (onDecisionMade) {
      onDecisionMade(decisionPointId, optionId, selectedOption.isCorrect);
    }
    
    // Update the simulation state based on the decision
    if (selectedOption.nextState) {
      setCurrentState(prevState => ({
        ...prevState!,
        ...selectedOption.nextState
      }));
    }
    
    // Handle educational content if any
    if (selectedOption.educationalContentIds && selectedOption.educationalContentIds.length > 0) {
      const contentToShow = selectedOption.educationalContentIds
        .map(contentId => 
          scenario.educationalContent.find(content => content.id === contentId)
        )
        .filter((content): content is EducationalContent => content !== undefined);
      
      if (contentToShow.length > 0) {
        setActiveEducationalContent(contentToShow);
        setStatus(SimulationStatus.PAUSED);
        setIsPaused(true);
        return;
      }
    }
    
    // Check if this triggers an outcome
    if (selectedOption.triggerOutcomeId) {
      const triggerOutcome = scenario.outcomes.find(
        outcome => outcome.id === selectedOption.triggerOutcomeId
      );
      
      if (triggerOutcome) {
        handleOutcome(triggerOutcome);
        return;
      }
    }
    
    // Find the next decision point based on available actions
    const nextActions = currentState?.availableActions || [];
    const availableDecisionPoints = scenario.decisionPoints.filter(dp => 
      !dp.requiredPriorActions ||
      dp.requiredPriorActions.every(action => 
        currentState?.completedActions.includes(action)
      )
    );
    
    const nextDecisionPoint = availableDecisionPoints.length > 0 
      ? availableDecisionPoints[0] 
      : null;
    
    if (nextDecisionPoint) {
      setActiveDecisionPoint(nextDecisionPoint);
      setStatus(SimulationStatus.DECISION_POINT);
    } else {
      // No more decision points, try to determine outcome
      determineOutcome();
    }
  }, [activeDecisionPoint, currentState, scenario, onDecisionMade]);
  
  /**
   * Determine the outcome based on the current state
   */
  const determineOutcome = useCallback(() => {
    if (!scenario || !currentState) return;
    
    // Find matching outcomes based on trigger conditions
    const matchingOutcomes = scenario.outcomes.filter(outcome => {
      const conditions = outcome.triggerConditions;
      
      // Check required actions
      if (conditions.requiredActions && 
          !conditions.requiredActions.every(action => 
            currentState.completedActions.includes(action)
          )) {
        return false;
      }
      
      // Check forbidden actions
      if (conditions.forbiddenActions && 
          conditions.forbiddenActions.some(action => 
            currentState.completedActions.includes(action)
          )) {
        return false;
      }
      
      // Check required decisions
      if (conditions.requiredDecisions) {
        const madeDecisions = analytics.decisions.map(d => d.optionId);
        if (!conditions.requiredDecisions.every(decision => 
          madeDecisions.includes(decision)
        )) {
          return false;
        }
      }
      
      // Check time threshold
      if (conditions.timeThreshold !== undefined && 
          currentState.timeElapsed > conditions.timeThreshold) {
        return false;
      }
      
      return true;
    });
    
    // If there are matching outcomes, use the first one
    // In a more sophisticated implementation, we would prioritize based on specificity
    if (matchingOutcomes.length > 0) {
      handleOutcome(matchingOutcomes[0]);
    } else {
      // Default to the first outcome if none match
      handleOutcome(scenario.outcomes[0]);
    }
  }, [scenario, currentState, analytics]);
  
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
                onDecision={(optionId) => handleDecision(activeDecisionPoint.id, optionId)}
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
  
  // Render educational content overlay if active
  const renderEducationalContent = () => {
    if (activeEducationalContent.length === 0) return null;
    
    return (
      <div className="educational-content-overlay">
        <EducationalContentView 
          content={activeEducationalContent}
          onComplete={handleEducationalContentViewed}
        />
      </div>
    );
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