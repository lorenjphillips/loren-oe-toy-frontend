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

// Interface for MicrosimulationConfigService
interface ConfigService {
  generateConfiguration: (
    physicianQuestion: string,
    company?: AdCompany,
    treatmentCategory?: TreatmentCategory,
    waitingTime?: number
  ) => MicrosimulationConfig;
  scenarioTemplates?: Map<string, ClinicalScenario>;
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
  const configService = useRef<ConfigService>(new MicrosimulationConfigService() as unknown as ConfigService);
  
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
        // Fix treatment category object
        const treatmentCategory = treatment ? {
          id: treatment,
          name: treatment,
          medicalCategory: medicalCategory || 'general',
          description: treatment,
          relevantSpecialties: []
        } as TreatmentCategory : undefined;
        
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
        const scenarioTemplates = configService.current.scenarioTemplates;
        
        if (!scenarioTemplates || scenarioTemplates.size === 0) {
          throw new Error('No scenario templates available');
        }
        
        // Fix type issues by asserting the type
        const availableScenarios = Array.from(scenarioTemplates.values());
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
   * Handle simulation completion
   */
  const handleSimulationComplete = useCallback(() => {
    // Clean up timers
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Set completion status
    setStatus(SimulationStatus.COMPLETED);
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      endTime: new Date(),
      totalDuration: prev.startTime 
        ? Math.floor((new Date().getTime() - prev.startTime.getTime()) / 1000) 
        : 0,
      completionStatus: 'completed'
    }));
    
    // Call completion callback
    if (onComplete) {
      onComplete(analytics);
    }
  }, [analytics, onComplete]);
  
  /**
   * Fix the getEducationalContentById issue by providing custom implementation
   */
  const getEducationalContent = (id: string) => {
    // This is a mock implementation that would be replaced with real service call
    return {
      id,
      title: `Educational Content for ${id}`,
      type: 'text',
      content: 'Placeholder educational content.',
      relevance: 'Relevant to the current decision point',
      displayTiming: 'feedback'
    } as EducationalContent;
  };
  
  /**
   * Handle decision made by the physician
   */
  const handleMakeDecision = (optionId: string) => {
    if (!activeDecisionPoint) return;

    const correctOption = activeDecisionPoint.options.find(o => o.isCorrect);
    const isCorrect = optionId === correctOption?.id;
    const timeToDecide = (Date.now() - (decisionStartTime.current || Date.now())) / 1000;

    // Record the decision in analytics
    setAnalytics(prev => ({
      ...prev,
      decisions: [
        ...prev.decisions,
        {
          decisionId: activeDecisionPoint.id,
          optionId: optionId,
          timestamp: new Date(),
          timeToDecide,
          wasCorrect: isCorrect
        }
      ]
    }));

    // Call the onDecisionMade callback if provided
    if (onDecisionMade) {
      onDecisionMade(activeDecisionPoint.id, optionId, isCorrect);
    }
    
    // If educational content is available for this decision, show it
    if (correctOption?.educationalContentIds && correctOption.educationalContentIds.length > 0) {
      // Fetch educational content
      const content = correctOption.educationalContentIds.map(id => 
        getEducationalContent(id)
      ).filter(Boolean) as EducationalContent[];
      
      setActiveEducationalContent(content);
    } else {
      // No educational content, move to next decision point
      findNextDecisionPoint();
    }
  };
  
  /**
   * Find the next decision point in the scenario
   */
  const findNextDecisionPoint = useCallback(() => {
    if (!scenario || !currentState) return;
    
    // Clear current decision point
    setActiveDecisionPoint(null);
    
    // Clear educational content
    setActiveEducationalContent([]);
    
    // Find next decision point based on elapsed time
    const nextPoint = scenario.decisionPoints.find(dp => 
      // Check if the decision point has a time-based trigger
      ((dp as any).triggerTimeSeconds !== undefined ? 
        (dp as any).triggerTimeSeconds > (currentState.timeElapsed || 0) : 
        dp.triggerCondition?.type === 'time' && 
        Number(dp.triggerCondition.value) > (currentState.timeElapsed || 0)) &&
      !analytics.decisions.some(d => d.decisionId === dp.id)
    );
    
    if (nextPoint) {
      // Set next decision point
      setActiveDecisionPoint(nextPoint);
      
      // Set decision start time for timing
      decisionStartTime.current = Date.now();
    } else {
      // No more decision points, complete the simulation
      completeSimulation();
    }
  }, [scenario, currentState, analytics.decisions]);
  
  /**
   * Complete the simulation and calculate outcome
   */
  const completeSimulation = useCallback(() => {
    if (!scenario) return;
    
    // Calculate outcome
    const decisions = analytics.decisions;
    const correctDecisions = decisions.filter(d => d.wasCorrect).length;
    const totalDecisions = decisions.length;
    const correctRate = totalDecisions > 0 ? correctDecisions / totalDecisions : 0;
    
    // Generate outcome
    let outcome: ScenarioOutcome;
    
    if (correctRate >= 0.8) {
      outcome = {
        id: 'excellent_outcome',
        title: 'Excellent Outcome',
        description: 'The patient has responded extremely well to your management.',
        type: 'positive',
        patientStatus: {
          condition: 'Excellent recovery with minimal complications',
          bloodPressure: '120/80',
          heartRate: 72,
          respiratoryRate: 16,
          temperature: 98.6,
          oxygenSaturation: 98
        },
        triggerConditions: {}, // Required property
        feedback: 'Excellent clinical decision-making led to optimal patient outcomes',
        educationalContentIds: []  // Required property
      };
    } else if (correctRate >= 0.6) {
      outcome = {
        id: 'good_outcome',
        title: 'Good Outcome',
        description: 'The patient has responded well to your management with some complications.',
        type: 'neutral',
        patientStatus: {
          condition: 'Good recovery with some manageable complications',
          bloodPressure: '130/85',
          heartRate: 80,
          respiratoryRate: 18,
          temperature: 99.1,
          oxygenSaturation: 95
        },
        triggerConditions: {}, // Required property
        feedback: 'Good clinical decision-making led to positive patient outcomes',
        educationalContentIds: []  // Required property
      };
    } else {
      outcome = {
        id: 'poor_outcome',
        title: 'Poor Outcome',
        description: 'The patient has experienced significant complications.',
        type: 'negative',
        patientStatus: {
          condition: 'Recovery with significant complications',
          bloodPressure: '150/95',
          heartRate: 95,
          respiratoryRate: 24,
          temperature: 100.2,
          oxygenSaturation: 91
        },
        triggerConditions: {}, // Required property
        feedback: 'Clinical decision-making could be improved for better outcomes',
        educationalContentIds: []  // Required property
      };
    }
    
    // Set outcome and complete simulation
    setOutcome(outcome);
    handleSimulationComplete();
  }, [scenario, analytics.decisions, handleSimulationComplete]);

  return (
    <div>
      {/* MicrosimulationEngine implementation */}
      {status === SimulationStatus.LOADING && <div>Loading simulation...</div>}
      {status === SimulationStatus.ERROR && <div>Error: {error}</div>}
      {status === SimulationStatus.COMPLETED && outcome && (
        <OutcomeView outcome={outcome} scenario={scenario!} />
      )}
      {/* Other rendering conditions */}
    </div>
  );
};

// Placeholder component implementations
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