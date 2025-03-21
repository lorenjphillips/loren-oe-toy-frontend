/**
 * Configuration service for clinical microsimulations
 * Dynamically generates scenarios based on physician's question, company, and treatment
 */

import { 
  ClinicalScenario, 
  MicrosimulationConfig,
  PatientInfo,
  DecisionPoint,
  ScenarioState,
  ScenarioOutcome,
  EducationalContent
} from '../models/microsimulation';
import { TreatmentCategory, AdCompany } from '../models/adTypes';

/**
 * Core service for configuring and generating microsimulations
 */
export class MicrosimulationConfigService {
  private scenarioTemplates: Map<string, ClinicalScenario> = new Map();
  private educationalContentLibrary: Map<string, EducationalContent> = new Map();
  private companySponsoredContent: Map<string, EducationalContent[]> = new Map();

  constructor() {
    // Initialize with some default templates
    this.loadDefaultTemplates();
  }

  /**
   * Generate a microsimulation configuration based on physician question and context
   * @param physicianQuestion The physician's original question
   * @param company The relevant pharma company if applicable
   * @param treatmentCategory The treatment category
   * @param waitingTime Expected waiting time in seconds
   * @returns A configuration for the microsimulation
   */
  public generateConfiguration(
    physicianQuestion: string,
    company?: AdCompany,
    treatmentCategory?: TreatmentCategory,
    waitingTime: number = 60
  ): MicrosimulationConfig {
    // Determine the most relevant scenario based on the question and treatment category
    const scenarioId = this.findRelevantScenario(physicianQuestion, treatmentCategory);
    
    // Adjust scenario parameters based on waiting time
    const timeAdjustedConfig = this.adjustForWaitingTime(scenarioId, waitingTime);
    
    // Add sponsored content if a company is provided
    const withSponsoredContent = company 
      ? this.addSponsoredContent(timeAdjustedConfig, company, treatmentCategory)
      : timeAdjustedConfig;
    
    // Final configuration
    return {
      ...withSponsoredContent,
      analyticsEnabled: true,
      feedbackRequired: false,
      displaySettings: {
        theme: 'professional',
        showTimer: waitingTime > 30, // Only show timer for longer simulations
        showFeedback: true
      }
    };
  }

  /**
   * Find the most relevant scenario for the physician's question
   * @param question The physician's question
   * @param treatmentCategory Optional treatment category
   * @returns ID of the most relevant scenario
   */
  private findRelevantScenario(
    question: string,
    treatmentCategory?: TreatmentCategory
  ): string {
    // If we have a specific treatment category, prioritize scenarios matching it
    if (treatmentCategory) {
      // Find scenarios matching the treatment category
      const matchingScenarios = Array.from(this.scenarioTemplates.values())
        .filter(scenario => 
          scenario.category === treatmentCategory.medicalCategory &&
          (!scenario.treatmentFocus || 
           scenario.treatmentFocus === treatmentCategory.id)
        );
      
      if (matchingScenarios.length > 0) {
        // Basic keyword matching from the question to find most relevant scenario
        const keywordMatchScores = matchingScenarios.map(scenario => {
          const questionLower = question.toLowerCase();
          const keywordMatches = treatmentCategory.keywords.filter(
            keyword => questionLower.includes(keyword.toLowerCase())
          ).length;
          
          return {
            scenarioId: scenario.id,
            score: keywordMatches
          };
        });
        
        // Return the scenario with the highest score or the first matching one
        const bestMatch = keywordMatchScores.sort((a, b) => b.score - a.score)[0];
        if (bestMatch && bestMatch.score > 0) {
          return bestMatch.scenarioId;
        }
        
        // If no keyword matches but category matches, return the first one
        return matchingScenarios[0].id;
      }
    }
    
    // Fallback to generic scenario selection based on the question
    // Simplified implementation - in a real system, this would use NLP or ML
    // to match the question to the most relevant scenario
    const questionLower = question.toLowerCase();
    let highestScore = 0;
    let bestScenarioId = '';
    
    this.scenarioTemplates.forEach((scenario, id) => {
      let score = 0;
      
      // Check for category keywords in the question
      if (questionLower.includes(scenario.category.toLowerCase())) {
        score += 5;
      }
      
      // Check for treatment focus keywords
      if (scenario.treatmentFocus && questionLower.includes(scenario.treatmentFocus.toLowerCase())) {
        score += 10;
      }
      
      // Check for words in the title and description
      scenario.title.toLowerCase().split(' ').forEach((word: string) => {
        if (word.length > 3 && questionLower.includes(word.toLowerCase())) {
          score += 2;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestScenarioId = id;
      }
    });
    
    // If no good match, return the first (default) scenario
    return bestScenarioId || Array.from(this.scenarioTemplates.keys())[0];
  }

  /**
   * Adjust the scenario configuration based on waiting time
   * @param scenarioId The base scenario ID
   * @param waitingTime Expected waiting time in seconds
   * @returns Adjusted configuration
   */
  private adjustForWaitingTime(
    scenarioId: string,
    waitingTime: number
  ): MicrosimulationConfig {
    const baseConfig: MicrosimulationConfig = {
      scenarioId,
      timeScale: 1.0
    };
    
    // For very short waiting times (< 30 seconds), simplify the scenario
    if (waitingTime < 30) {
      // Create a simplified version with fewer decision points
      const scenario = this.scenarioTemplates.get(scenarioId);
      if (scenario && scenario.decisionPoints.length > 1) {
        // Only include the most important decision point
        const criticalDecisionPoint = scenario.decisionPoints
          .find(dp => dp.type === 'treatment') || scenario.decisionPoints[0];
        
        return {
          ...baseConfig,
          availableDecisionPoints: [criticalDecisionPoint.id],
          maxDuration: waitingTime - 5, // Give a buffer for user interaction
          timeScale: 0.8 // Speed up time slightly
        };
      }
    }
    
    // For medium waiting times (30-90 seconds), use the full scenario but adjust pacing
    if (waitingTime >= 30 && waitingTime <= 90) {
      return {
        ...baseConfig,
        maxDuration: waitingTime - 10,
        timeScale: 1.0
      };
    }
    
    // For long waiting times (> 90 seconds), expand the scenario with more educational content
    return {
      ...baseConfig,
      maxDuration: waitingTime - 15,
      timeScale: 1.2, // Slow down time slightly for a more thorough experience
      educationalPriorities: this.getExpandedEducationalContent(scenarioId)
    };
  }

  /**
   * Add company-sponsored content to the configuration
   * @param config The base configuration
   * @param company The sponsoring company
   * @param treatmentCategory The treatment category
   * @returns Enhanced configuration with sponsored content
   */
  private addSponsoredContent(
    config: MicrosimulationConfig,
    company: AdCompany,
    treatmentCategory?: TreatmentCategory
  ): MicrosimulationConfig {
    // Get company-specific educational content
    const sponsoredContent = this.companySponsoredContent.get(company.id) || [];
    
    // Filter for content relevant to this treatment category if provided
    const relevantContent = treatmentCategory
      ? sponsoredContent.filter(content => 
          content.associatedTreatmentIds?.some(id => id === treatmentCategory.id)
        )
      : sponsoredContent;
    
    // If no sponsored content is available, return the original config
    if (relevantContent.length === 0) {
      return config;
    }
    
    // Add sponsored treatments highlighting the company's products
    return {
      ...config,
      sponsoredTreatments: [
        {
          treatmentId: treatmentCategory?.id || 'generic_treatment',
          company,
          priority: 8 // High priority for sponsored content
        }
      ],
      // Add educational content IDs to priorities list
      educationalPriorities: [
        ...(config.educationalPriorities || []),
        ...relevantContent.map(content => content.id)
      ]
    };
  }

  /**
   * Get expanded educational content for longer simulations
   * @param scenarioId The base scenario ID
   * @returns Array of educational content IDs
   */
  private getExpandedEducationalContent(scenarioId: string): string[] {
    const scenario = this.scenarioTemplates.get(scenarioId);
    if (!scenario) {
      return [];
    }
    
    // Get the educational content directly associated with this scenario
    const directContent = scenario.educationalContent.map(content => content.id);
    
    // Find additional related content from the library
    const relatedContent = Array.from(this.educationalContentLibrary.values())
      .filter(content => 
        content.associatedTreatmentIds?.some(id => id === scenario.treatmentFocus) ||
        content.displayTiming === 'post' // Additional post-simulation content is good for longer waits
      )
      .map(content => content.id);
    
    return [...directContent, ...relatedContent];
  }

  /**
   * Add a new scenario template
   * @param scenario The clinical scenario template to add
   */
  public addScenarioTemplate(scenario: ClinicalScenario): void {
    this.scenarioTemplates.set(scenario.id, scenario);
  }

  /**
   * Add educational content to the library
   * @param content The educational content to add
   */
  public addEducationalContent(content: EducationalContent): void {
    this.educationalContentLibrary.set(content.id, content);
    
    // If this content is sponsored by a company, add it to that company's collection
    if (content.companyId) {
      const companyContent = this.companySponsoredContent.get(content.companyId) || [];
      companyContent.push(content);
      this.companySponsoredContent.set(content.companyId, companyContent);
    }
  }

  /**
   * Load default templates (would be replaced with database or API calls in production)
   */
  private loadDefaultTemplates(): void {
    // Basic cardiology scenario
    const cardiologyScenario: ClinicalScenario = {
      id: 'cardio_hypertension_001',
      title: 'Hypertension Management in a 55-year-old Patient',
      description: 'Evaluate and manage a 55-year-old patient with poorly controlled hypertension',
      category: 'cardiology',
      treatmentFocus: 'hypertension',
      difficulty: 'intermediate',
      estimatedDuration: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
      patientInfo: {
        age: 55,
        gender: 'male',
        height: 175,
        weight: 88,
        chiefComplaint: 'Persistent high blood pressure despite medication',
        medicalHistory: ['Hypertension (10 years)', 'Hyperlipidemia', 'Type 2 Diabetes (5 years)'],
        medications: ['Lisinopril 10mg daily', 'Metformin 1000mg twice daily', 'Atorvastatin 20mg daily'],
        vitalSigns: {
          bloodPressure: '162/95',
          heartRate: 78,
          respiratoryRate: 16,
          temperature: 37.0,
          oxygenSaturation: 98
        }
      },
      initialState: {
        currentPhase: 'initial_assessment',
        timeElapsed: 0,
        patientStatus: 'stable',
        completedActions: [],
        availableActions: ['review_vitals', 'review_history', 'physical_exam'],
        displayedInformation: []
      },
      decisionPoints: [
        {
          id: 'initial_assessment_dp',
          title: 'Initial Assessment',
          description: 'What would you like to do first?',
          type: 'investigation',
          options: [
            {
              id: 'review_history_option',
              text: 'Review patient history in detail',
              isCorrect: true,
              reasoning: 'Understanding the patient\'s history is essential for proper hypertension management',
              nextState: {
                completedActions: ['review_history'],
                availableActions: ['physical_exam', 'order_labs', 'medication_review']
              }
            },
            {
              id: 'immediate_medication_change',
              text: 'Immediately adjust medications without further assessment',
              isCorrect: false,
              reasoning: 'Changing medications without full assessment may miss underlying causes',
              consequence: 'Limited understanding of the patient\'s condition'
            }
          ]
        },
        {
          id: 'treatment_decision_dp',
          title: 'Treatment Adjustment',
          description: 'How would you adjust this patient\'s antihypertensive regimen?',
          type: 'treatment',
          requiredPriorActions: ['review_history', 'physical_exam'],
          options: [
            {
              id: 'increase_ace_inhibitor',
              text: 'Increase Lisinopril to 20mg daily',
              isCorrect: false,
              reasoning: 'ACE inhibitor monotherapy is unlikely to achieve target BP in this patient with diabetes',
              consequence: 'Blood pressure remains elevated at 152/90'
            },
            {
              id: 'add_calcium_channel_blocker',
              text: 'Add Amlodipine 5mg daily',
              isCorrect: true,
              reasoning: 'Adding a calcium channel blocker provides complementary mechanism and is recommended for diabetic patients',
              consequence: 'Blood pressure improves to 138/85',
              educationalContentIds: ['ccb_diabetes_education']
            },
            {
              id: 'add_thiazide_diuretic',
              text: 'Add Hydrochlorothiazide 25mg daily',
              isCorrect: true,
              reasoning: 'Thiazide diuretics are effective add-on therapy, though monitor for metabolic effects',
              consequence: 'Blood pressure improves to 142/87, but glucose control worsens slightly',
              educationalContentIds: ['thiazide_diabetes_caution']
            }
          ]
        }
      ],
      outcomes: [
        {
          id: 'optimal_outcome',
          title: 'Optimal Blood Pressure Control',
          description: 'Patient achieves target blood pressure with minimal side effects',
          type: 'positive',
          patientStatus: {
            bloodPressure: '132/82',
            heartRate: 76,
            condition: 'Well-controlled hypertension'
          },
          triggerConditions: {
            requiredDecisions: ['add_calcium_channel_blocker']
          },
          feedback: 'Excellent management. Adding a calcium channel blocker to an ACE inhibitor provides complementary mechanisms of action and is particularly beneficial in patients with diabetes.',
          educationalContentIds: ['hypertension_combo_therapy', 'ccb_diabetes_education']
        },
        {
          id: 'suboptimal_outcome',
          title: 'Partial Blood Pressure Control',
          description: 'Patient\'s blood pressure improves but remains above target',
          type: 'neutral',
          patientStatus: {
            bloodPressure: '145/88',
            heartRate: 74,
            condition: 'Partially controlled hypertension'
          },
          triggerConditions: {
            requiredActions: ['review_history', 'physical_exam'],
            forbiddenActions: ['lifestyle_counseling']
          },
          feedback: 'The medication adjustment has improved blood pressure, but target levels have not been achieved. Consider lifestyle modifications and possibly a multi-drug regimen.',
          educationalContentIds: ['hypertension_lifestyle_impact']
        }
      ],
      educationalContent: [
        {
          id: 'hypertension_combo_therapy',
          title: 'Combination Therapy in Hypertension Management',
          type: 'text',
          content: 'Research shows that combination therapy with complementary mechanisms is more effective than high-dose monotherapy in most patients with stage 2 hypertension.',
          source: 'Journal of Hypertension, 2023',
          relevance: 'Directly applicable to treatment decisions in this case',
          displayTiming: 'feedback'
        },
        {
          id: 'ccb_diabetes_education',
          title: 'Calcium Channel Blockers in Diabetic Patients',
          type: 'text',
          content: 'Calcium channel blockers have neutral metabolic effects and can be particularly useful in patients with diabetes.',
          source: 'American Diabetes Association Guidelines',
          relevance: 'Addresses the specific patient comorbidity',
          displayTiming: 'feedback',
          associatedTreatmentIds: ['calcium_channel_blockers']
        }
      ]
    };
    
    this.addScenarioTemplate(cardiologyScenario);
    
    // Add default educational content
    this.addEducationalContent({
      id: 'hypertension_lifestyle_impact',
      title: 'Impact of Lifestyle Modifications on Hypertension',
      type: 'text',
      content: 'Lifestyle modifications can reduce systolic BP by 4-11 mmHg and should be included in all hypertension management plans.',
      source: 'American Heart Association',
      relevance: 'Essential adjunct to pharmacological therapy',
      displayTiming: 'post',
      associatedTreatmentIds: ['hypertension_management']
    });
    
    this.addEducationalContent({
      id: 'thiazide_diabetes_caution',
      title: 'Thiazide Diuretics in Diabetes',
      type: 'text',
      content: 'While effective for hypertension, thiazide diuretics may worsen glucose control in diabetic patients and should be used with caution.',
      source: 'European Society of Cardiology',
      relevance: 'Important consideration for this patient with diabetes',
      displayTiming: 'feedback',
      associatedTreatmentIds: ['thiazide_diuretics', 'hypertension_management']
    });
  }
} 