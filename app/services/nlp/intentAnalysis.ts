import { ClinicalIntent, IntentType } from '../../models/intent/ClinicalIntent';
import { DecisionPoint, DecisionType } from '../../models/intent/DecisionPoint';
import { InformationGap, GapType } from '../../models/intent/InformationGap';
import { ClinicalWorkflow, WorkflowStage } from '../../models/intent/ClinicalWorkflow';

export class IntentAnalysisService {
  // NLP patterns for different intent types (simplified - in production would use more sophisticated NLP)
  private static readonly DECISION_PATTERNS = [
    { regex: /\b(?:should|recommend|advise|choose|select|prefer)\b/i, type: DecisionType.TREATMENT_SELECTION },
    { regex: /\b(?:dosage|dose|frequency|regimen|schedule)\b/i, type: DecisionType.DOSING },
    { regex: /\b(?:diagnose|diagnosis|diagnostic|differentiate|identify)\b/i, type: DecisionType.DIAGNOSTIC },
    { regex: /\b(?:monitor|follow-up|track|observe|surveillance)\b/i, type: DecisionType.MONITORING },
    { regex: /\b(?:refer|specialist|consult|send)\b/i, type: DecisionType.REFERRAL },
    { regex: /\b(?:risk|benefit|harm|adverse|safety)\b/i, type: DecisionType.RISK_ASSESSMENT }
  ];

  private static readonly INFORMATION_SEEKING_PATTERNS = [
    { regex: /\b(?:efficacy|effectiveness|work|outcome|result)\b/i, type: IntentType.EFFICACY_INFO },
    { regex: /\b(?:safety|side effect|adverse|reaction|contraindication|warning)\b/i, type: IntentType.SAFETY_INFO },
    { regex: /\b(?:mechanism|how does it work|pathway|process)\b/i, type: IntentType.MECHANISM_INFO },
    { regex: /\b(?:alternative|other option|different|instead)\b/i, type: IntentType.ALTERNATIVES_INFO },
    { regex: /\b(?:cost|price|expense|insurance|coverage|reimbursement)\b/i, type: IntentType.COST_INFO },
    { regex: /\b(?:guideline|recommendation|consensus|standard|protocol)\b/i, type: IntentType.GUIDELINE_INFO }
  ];

  private static readonly UNCERTAINTY_INDICATORS = [
    { regex: /\b(?:unclear|uncertain|not sure|don't know|unsure|confusing)\b/i, type: GapType.CONCEPTUAL },
    { regex: /\b(?:recent|new|latest|update|change)\b/i, type: GapType.TEMPORAL },
    { regex: /\b(?:conflicting|contradictory|inconsistent|differing|varied)\b/i, type: GapType.CONFLICTING },
    { regex: /\b(?:rare|unusual|atypical|edge case|special)\b/i, type: GapType.RARE_CASE },
    { regex: /\b(?:evidence|data|study|research|trial)\b/i, type: GapType.EVIDENCE_BASED }
  ];

  private static readonly WORKFLOW_PATTERNS = [
    { regex: /\b(?:screening|prevention|prophylaxis|preventive)\b/i, stage: WorkflowStage.PREVENTION },
    { regex: /\b(?:diagnose|diagnosis|diagnostic|identify|detection|test)\b/i, stage: WorkflowStage.DIAGNOSIS },
    { regex: /\b(?:treatment|therapy|therapeutic|intervention|manage)\b/i, stage: WorkflowStage.TREATMENT },
    { regex: /\b(?:follow-up|monitoring|response|progression|track)\b/i, stage: WorkflowStage.MONITORING },
    { regex: /\b(?:recurrence|relapse|return|recurring)\b/i, stage: WorkflowStage.RELAPSE },
    { regex: /\b(?:palliative|hospice|end-of-life|comfort care)\b/i, stage: WorkflowStage.PALLIATIVE }
  ];

  /**
   * Analyze physician question to identify clinical intent
   * @param text The physician's question or comment
   * @returns Analysis of clinical intent
   */
  public analyzeIntent(text: string): ClinicalIntent {
    const intentTypes: IntentType[] = [];
    
    // Identify information seeking patterns
    IntentAnalysisService.INFORMATION_SEEKING_PATTERNS.forEach((pattern: { regex: RegExp, type: IntentType }) => {
      if (pattern.regex.test(text)) {
        intentTypes.push(pattern.type);
      }
    });

    return {
      primaryType: intentTypes.length > 0 ? intentTypes[0] : IntentType.GENERAL_INFO,
      secondaryTypes: intentTypes.slice(1),
      confidence: this.calculateConfidence(text, intentTypes),
      questionText: text
    };
  }

  /**
   * Identify clinical decision points in physician questions
   * @param text The physician's question or comment
   * @returns Analysis of decision points
   */
  public identifyDecisionPoints(text: string): DecisionPoint {
    const decisionTypes: DecisionType[] = [];
    
    // Identify decision patterns
    IntentAnalysisService.DECISION_PATTERNS.forEach((pattern: { regex: RegExp, type: DecisionType }) => {
      if (pattern.regex.test(text)) {
        decisionTypes.push(pattern.type);
      }
    });

    return {
      primaryType: decisionTypes.length > 0 ? decisionTypes[0] : DecisionType.OTHER,
      secondaryTypes: decisionTypes.slice(1),
      confidence: this.calculateConfidence(text, decisionTypes),
      context: this.extractRelevantContext(text),
      urgency: this.determineUrgency(text)
    };
  }

  /**
   * Identify information gaps in physician questions
   * @param text The physician's question or comment
   * @returns Analysis of information gaps
   */
  public identifyInformationGaps(text: string): InformationGap {
    const gapTypes: GapType[] = [];
    
    // Identify uncertainty indicators
    IntentAnalysisService.UNCERTAINTY_INDICATORS.forEach((pattern: { regex: RegExp, type: GapType }) => {
      if (pattern.regex.test(text)) {
        gapTypes.push(pattern.type);
      }
    });

    return {
      primaryType: gapTypes.length > 0 ? gapTypes[0] : GapType.GENERAL,
      secondaryTypes: gapTypes.slice(1),
      confidence: this.calculateConfidence(text, gapTypes),
      topicArea: this.identifyTopicArea(text),
      severity: this.determineGapSeverity(text, gapTypes)
    };
  }

  /**
   * Map physician questions to clinical workflow stages
   * @param text The physician's question or comment
   * @returns Mapping to clinical workflow
   */
  public mapToWorkflow(text: string): ClinicalWorkflow {
    const stages: WorkflowStage[] = [];
    
    // Identify workflow stage patterns
    IntentAnalysisService.WORKFLOW_PATTERNS.forEach((pattern: { regex: RegExp, stage: WorkflowStage }) => {
      if (pattern.regex.test(text)) {
        stages.push(pattern.stage);
      }
    });

    return {
      primaryStage: stages.length > 0 ? stages[0] : WorkflowStage.UNSPECIFIED,
      secondaryStages: stages.slice(1),
      confidence: this.calculateConfidence(text, stages),
      patientContext: this.extractPatientContext(text)
    };
  }

  /**
   * Comprehensive analysis of physician intent
   * @param text The physician's question or comment
   * @returns Complete intent analysis
   */
  public analyzeComprehensive(text: string) {
    return {
      intent: this.analyzeIntent(text),
      decisionPoint: this.identifyDecisionPoints(text),
      informationGap: this.identifyInformationGaps(text),
      workflow: this.mapToWorkflow(text),
      timestamp: new Date(),
      textLength: text.length,
      anonymizedText: this.anonymizeText(text)
    };
  }

  /**
   * Analyze batch of physician questions
   * @param texts Array of physician questions or comments
   * @returns Array of comprehensive analyses
   */
  public analyzeBatch(texts: string[]) {
    return texts.map(text => this.analyzeComprehensive(text));
  }

  /**
   * Calculate confidence score for pattern matching
   * Private helper method
   */
  private calculateConfidence(text: string, matches: any[]): number {
    // In a real implementation, this would use more sophisticated NLP methods
    // This is a simplified version for demonstration
    if (matches.length === 0) return 0.3;
    
    // More matches = higher confidence, up to a point
    const baseConfidence = Math.min(0.5 + matches.length * 0.1, 0.9);
    
    // Longer text might have more context = slightly higher confidence
    const lengthFactor = Math.min(text.length / 100, 0.1);
    
    return Math.min(baseConfidence + lengthFactor, 0.95);
  }

  /**
   * Extract relevant clinical context from text
   * Private helper method
   */
  private extractRelevantContext(text: string): string {
    // In a real implementation, this would use NLP to extract key clinical context
    // Simplified for demonstration
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  }

  /**
   * Determine urgency level of a clinical question
   * Private helper method
   */
  private determineUrgency(text: string): 'high' | 'medium' | 'low' {
    const urgentTerms = /\b(?:urgent|emergency|immediate|critical|acute|severe|life-threatening)\b/i;
    const moderateTerms = /\b(?:important|significant|concerning|worrying|notable)\b/i;
    
    if (urgentTerms.test(text)) return 'high';
    if (moderateTerms.test(text)) return 'medium';
    return 'low';
  }

  /**
   * Identify the clinical topic area from text
   * Private helper method
   */
  private identifyTopicArea(text: string): string {
    // In a real implementation, this would use medical entity recognition and topic modeling
    // Simplified for demonstration
    const specialties = [
      'cardiology', 'neurology', 'oncology', 'endocrinology', 
      'infectious disease', 'psychiatry', 'pediatrics', 'geriatrics'
    ];
    
    for (const specialty of specialties) {
      if (text.toLowerCase().includes(specialty)) {
        return specialty;
      }
    }
    
    return 'general medicine';
  }

  /**
   * Determine the severity of an information gap
   * Private helper method
   */
  private determineGapSeverity(text: string, gapTypes: GapType[]): 'critical' | 'moderate' | 'minor' {
    // Critical gaps relate to patient safety or urgent care decisions
    const criticalTerms = /\b(?:safety|danger|risk|harm|life|death|critical|urgent)\b/i;
    
    // More gap types or certain critical gap types indicate higher severity
    if (criticalTerms.test(text) || gapTypes.length > 2) return 'critical';
    if (gapTypes.length > 1) return 'moderate';
    return 'minor';
  }

  /**
   * Extract patient context from physician question
   * Private helper method
   */
  private extractPatientContext(text: string): string {
    // In a real implementation, this would use NLP to extract key patient demographics
    // while maintaining privacy
    // Simplified for demonstration
    const demographicPatterns = [
      /\b(?:elderly|older|geriatric|senior)\b/i,
      /\b(?:pediatric|child|infant|adolescent|teen)\b/i,
      /\b(?:pregnant|pregnancy)\b/i,
      /\b(?:male|female|man|woman)\b/i,
      /\b(?:comorbid|comorbidity|multiple conditions)\b/i
    ];
    
    const matches = demographicPatterns
      .filter(pattern => pattern.test(text))
      .map(pattern => {
        const match = text.match(pattern);
        return match ? match[0] : null;
      })
      .filter(match => match !== null);
    
    return matches.length > 0 ? matches.join(', ') : 'unspecified';
  }

  /**
   * Anonymize text to protect PHI/PII
   * Private helper method
   */
  private anonymizeText(text: string): string {
    // In a real implementation, this would use sophisticated de-identification
    // Simplified for demonstration
    let anonymized = text;
    
    // Replace potential patient identifiers with placeholders
    anonymized = anonymized.replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[PATIENT NAME]');
    anonymized = anonymized.replace(/\b\d{1,3}(?:\s|-)\d{2}(?:\s|-)\d{4}\b/g, '[PHONE]');
    anonymized = anonymized.replace(/\b\d{3}(?:\s|-)\d{2}(?:\s|-)\d{4}\b/g, '[SSN]');
    anonymized = anonymized.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '[DATE]');
    
    return anonymized;
  }
} 