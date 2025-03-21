export type ClinicalIntent = 'diagnosis' | 'treatment' | 'mechanism' | 'monitoring' | 'prevention' | 'prognosis';

export type PatientDemographics = {
  ageGroup?: string;
  gender?: string;
  comorbidities?: string[];
  riskFactors?: string[];
};

export type ClinicalSetting = 'primary_care' | 'specialist' | 'emergency' | 'inpatient' | 'outpatient';

export type MedicalConcept = {
  term: string;
  category: 'disease' | 'symptom' | 'treatment' | 'drug' | 'procedure';
  confidence: number;
};

export type QuestionContext = {
  id: string;
  timestamp: Date;
  medicalConcepts: MedicalConcept[];
  clinicalIntent: ClinicalIntent;
  demographics?: PatientDemographics;
  clinicalSetting?: ClinicalSetting;
  treatmentIndications: string[];
};

export type TopicDistribution = {
  category: string;
  count: number;
  percentage: number;
  subTopics: { term: string; count: number }[];
};

export type IntentBreakdown = {
  intent: ClinicalIntent;
  count: number;
  percentage: number;
  commonConcepts: string[];
};

export type DemographicSummary = {
  ageGroups: { [key: string]: number };
  genderDistribution: { [key: string]: number };
  commonComorbidities: { condition: string; count: number }[];
  riskFactors: { factor: string; count: number }[];
};

export type TreatmentJourneyStage = {
  stage: string;
  questionCount: number;
  commonConcepts: string[];
  averageTiming: number; // days from diagnosis
};

export type AnalyticsTrend = {
  period: string;
  metrics: {
    totalQuestions: number;
    topIntents: { intent: ClinicalIntent; count: number }[];
    topConcepts: { concept: string; count: number }[];
  };
}; 