import { 
  QuestionContext, 
  ClinicalIntent, 
  MedicalConcept, 
  PatientDemographics, 
  ClinicalSetting 
} from '../../types/analytics';

class QuestionAnalyzer {
  private readonly intentKeywords = {
    diagnosis: ['diagnose', 'identify', 'what is', 'could this be', 'differential'],
    treatment: ['treat', 'therapy', 'medication', 'prescribe', 'manage'],
    mechanism: ['how does', 'why does', 'mechanism', 'pathway', 'cause'],
    monitoring: ['monitor', 'follow-up', 'track', 'progress', 'response'],
    prevention: ['prevent', 'avoid', 'reduce risk', 'prophylaxis'],
    prognosis: ['outcome', 'prognosis', 'survival', 'long-term', 'risk']
  };

  private readonly settingIndicators = {
    primary_care: ['office', 'clinic', 'primary care', 'general practice'],
    specialist: ['specialist', 'referral', 'consultation'],
    emergency: ['emergency', 'acute', 'urgent', 'ER'],
    inpatient: ['hospital', 'admitted', 'ward', 'inpatient'],
    outpatient: ['outpatient', 'follow-up', 'clinic visit']
  };

  public async analyzeQuestion(questionText: string): Promise<QuestionContext> {
    const medicalConcepts = await this.extractMedicalConcepts(questionText);
    const clinicalIntent = this.determineClinicalIntent(questionText);
    const demographics = this.extractDemographics(questionText);
    const clinicalSetting = this.identifyClinicalSetting(questionText);
    const treatmentIndications = await this.mapTreatmentIndications(medicalConcepts);

    return {
      id: this.generateQuestionId(),
      timestamp: new Date(),
      medicalConcepts,
      clinicalIntent,
      demographics,
      clinicalSetting,
      treatmentIndications
    };
  }

  private async extractMedicalConcepts(text: string): Promise<MedicalConcept[]> {
    // TODO: Integrate with medical NLP service or terminology API
    // Placeholder implementation
    const concepts: MedicalConcept[] = [];
    // Add logic to extract medical concepts using NLP
    return concepts;
  }

  private determineClinicalIntent(text: string): ClinicalIntent {
    const normalizedText = text.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        return intent as ClinicalIntent;
      }
    }
    
    return 'treatment'; // Default intent if none detected
  }

  private extractDemographics(text: string): PatientDemographics | undefined {
    // TODO: Implement demographic extraction logic
    // This should use NLP to identify age, gender, and other demographic information
    return undefined;
  }

  private identifyClinicalSetting(text: string): ClinicalSetting | undefined {
    const normalizedText = text.toLowerCase();
    
    for (const [setting, indicators] of Object.entries(this.settingIndicators)) {
      if (indicators.some(indicator => normalizedText.includes(indicator))) {
        return setting as ClinicalSetting;
      }
    }
    
    return undefined;
  }

  private async mapTreatmentIndications(concepts: MedicalConcept[]): Promise<string[]> {
    // TODO: Implement mapping to treatment indications
    // This should use a medical knowledge base to map concepts to approved indications
    return [];
  }

  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const questionAnalyzer = new QuestionAnalyzer(); 