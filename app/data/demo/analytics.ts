// Pre-populated analytics data for demo mode
import { DemoScenario } from '../../services/demo/demoConfig';

// Define types for our analytics data
export interface DemoDrugPerformance {
  drugName: string;
  genericName: string;
  manufacturer: string;
  category: string;
  efficacyScore: number; // 0-100
  safetyScore: number; // 0-100
  costEffectivenessScore: number; // 0-100
  patientSatisfactionScore: number; // 0-100
  overallScore: number; // 0-100
  monthlyTrendData: Array<{
    month: string;
    prescriptions: number;
    marketShare: number;
    adverseEvents: number;
  }>;
}

export interface DemoConditionInsight {
  conditionName: string;
  topDrugs: Array<{
    drugName: string;
    efficacyScore: number;
    marketShare: number;
  }>;
  patientDemographics: Array<{
    ageGroup: string;
    percentage: number;
  }>;
  treatmentTrends: Array<{
    year: number;
    firstLineTherapy: string;
    percentageUse: number;
  }>;
}

export interface DemoComparativeAnalysis {
  drugClass: string;
  drugs: Array<{
    name: string;
    efficacy: number;
    safety: number;
    adherence: number;
    cost: number;
  }>;
  conditions: string[];
  evidenceLevel: 'high' | 'moderate' | 'low';
  lastUpdated: string;
}

// Sample drug performance data
export const demoDrugPerformanceData: DemoDrugPerformance[] = [
  {
    drugName: 'Ozempic',
    genericName: 'semaglutide',
    manufacturer: 'Novo Nordisk',
    category: 'GLP-1 receptor agonist',
    efficacyScore: 92,
    safetyScore: 87,
    costEffectivenessScore: 78,
    patientSatisfactionScore: 90,
    overallScore: 88,
    monthlyTrendData: [
      { month: '2023-01', prescriptions: 156000, marketShare: 12.3, adverseEvents: 245 },
      { month: '2023-02', prescriptions: 168000, marketShare: 13.1, adverseEvents: 258 },
      { month: '2023-03', prescriptions: 182000, marketShare: 14.0, adverseEvents: 262 },
      { month: '2023-04', prescriptions: 198000, marketShare: 15.2, adverseEvents: 270 },
      { month: '2023-05', prescriptions: 215000, marketShare: 16.5, adverseEvents: 285 },
      { month: '2023-06', prescriptions: 235000, marketShare: 18.1, adverseEvents: 290 }
    ]
  },
  {
    drugName: 'Jardiance',
    genericName: 'empagliflozin',
    manufacturer: 'Boehringer Ingelheim',
    category: 'SGLT2 inhibitor',
    efficacyScore: 88,
    safetyScore: 85,
    costEffectivenessScore: 82,
    patientSatisfactionScore: 86,
    overallScore: 86,
    monthlyTrendData: [
      { month: '2023-01', prescriptions: 142000, marketShare: 11.2, adverseEvents: 198 },
      { month: '2023-02', prescriptions: 148000, marketShare: 11.5, adverseEvents: 205 },
      { month: '2023-03', prescriptions: 155000, marketShare: 11.9, adverseEvents: 210 },
      { month: '2023-04', prescriptions: 163000, marketShare: 12.5, adverseEvents: 215 },
      { month: '2023-05', prescriptions: 172000, marketShare: 13.2, adverseEvents: 218 },
      { month: '2023-06', prescriptions: 181000, marketShare: 13.9, adverseEvents: 225 }
    ]
  },
  {
    drugName: 'Trulicity',
    genericName: 'dulaglutide',
    manufacturer: 'Eli Lilly',
    category: 'GLP-1 receptor agonist',
    efficacyScore: 85,
    safetyScore: 86,
    costEffectivenessScore: 80,
    patientSatisfactionScore: 84,
    overallScore: 84,
    monthlyTrendData: [
      { month: '2023-01', prescriptions: 125000, marketShare: 9.8, adverseEvents: 175 },
      { month: '2023-02', prescriptions: 122000, marketShare: 9.5, adverseEvents: 170 },
      { month: '2023-03', prescriptions: 118000, marketShare: 9.1, adverseEvents: 165 },
      { month: '2023-04', prescriptions: 115000, marketShare: 8.8, adverseEvents: 160 },
      { month: '2023-05', prescriptions: 112000, marketShare: 8.6, adverseEvents: 155 },
      { month: '2023-06', prescriptions: 110000, marketShare: 8.5, adverseEvents: 152 }
    ]
  },
  {
    drugName: 'Rybelsus',
    genericName: 'semaglutide (oral)',
    manufacturer: 'Novo Nordisk',
    category: 'GLP-1 receptor agonist',
    efficacyScore: 84,
    safetyScore: 82,
    costEffectivenessScore: 76,
    patientSatisfactionScore: 88,
    overallScore: 83,
    monthlyTrendData: [
      { month: '2023-01', prescriptions: 95000, marketShare: 7.5, adverseEvents: 145 },
      { month: '2023-02', prescriptions: 105000, marketShare: 8.2, adverseEvents: 150 },
      { month: '2023-03', prescriptions: 115000, marketShare: 8.8, adverseEvents: 155 },
      { month: '2023-04', prescriptions: 128000, marketShare: 9.8, adverseEvents: 165 },
      { month: '2023-05', prescriptions: 140000, marketShare: 10.7, adverseEvents: 180 },
      { month: '2023-06', prescriptions: 155000, marketShare: 11.9, adverseEvents: 195 }
    ]
  },
  {
    drugName: 'Aimovig',
    genericName: 'erenumab',
    manufacturer: 'Amgen/Novartis',
    category: 'Anti-CGRP monoclonal antibody',
    efficacyScore: 89,
    safetyScore: 92,
    costEffectivenessScore: 75,
    patientSatisfactionScore: 88,
    overallScore: 86,
    monthlyTrendData: [
      { month: '2023-01', prescriptions: 78000, marketShare: 35.5, adverseEvents: 95 },
      { month: '2023-02', prescriptions: 82000, marketShare: 36.1, adverseEvents: 98 },
      { month: '2023-03', prescriptions: 85000, marketShare: 36.8, adverseEvents: 96 },
      { month: '2023-04', prescriptions: 88000, marketShare: 37.3, adverseEvents: 97 },
      { month: '2023-05', prescriptions: 91000, marketShare: 37.9, adverseEvents: 100 },
      { month: '2023-06', prescriptions: 93000, marketShare: 38.2, adverseEvents: 102 }
    ]
  }
];

// Sample condition insights data
export const demoConditionInsights: DemoConditionInsight[] = [
  {
    conditionName: 'Type 2 Diabetes',
    topDrugs: [
      { drugName: 'Ozempic', efficacyScore: 92, marketShare: 18.1 },
      { drugName: 'Jardiance', efficacyScore: 88, marketShare: 13.9 },
      { drugName: 'Rybelsus', efficacyScore: 84, marketShare: 11.9 },
      { drugName: 'Trulicity', efficacyScore: 85, marketShare: 8.5 },
      { drugName: 'Metformin', efficacyScore: 76, marketShare: 32.5 }
    ],
    patientDemographics: [
      { ageGroup: '18-34', percentage: 8 },
      { ageGroup: '35-49', percentage: 22 },
      { ageGroup: '50-64', percentage: 38 },
      { ageGroup: '65+', percentage: 32 }
    ],
    treatmentTrends: [
      { year: 2019, firstLineTherapy: 'Metformin', percentageUse: 85 },
      { year: 2020, firstLineTherapy: 'Metformin', percentageUse: 83 },
      { year: 2021, firstLineTherapy: 'Metformin', percentageUse: 79 },
      { year: 2022, firstLineTherapy: 'Metformin', percentageUse: 72 },
      { year: 2023, firstLineTherapy: 'Metformin', percentageUse: 65 }
    ]
  },
  {
    conditionName: 'Hypertension',
    topDrugs: [
      { drugName: 'Lisinopril', efficacyScore: 86, marketShare: 22.5 },
      { drugName: 'Amlodipine', efficacyScore: 85, marketShare: 19.2 },
      { drugName: 'Losartan', efficacyScore: 84, marketShare: 15.8 },
      { drugName: 'Hydrochlorothiazide', efficacyScore: 80, marketShare: 14.3 },
      { drugName: 'Metoprolol', efficacyScore: 81, marketShare: 8.7 }
    ],
    patientDemographics: [
      { ageGroup: '18-34', percentage: 5 },
      { ageGroup: '35-49', percentage: 18 },
      { ageGroup: '50-64', percentage: 35 },
      { ageGroup: '65+', percentage: 42 }
    ],
    treatmentTrends: [
      { year: 2019, firstLineTherapy: 'ACE Inhibitors', percentageUse: 32 },
      { year: 2020, firstLineTherapy: 'ACE Inhibitors', percentageUse: 31 },
      { year: 2021, firstLineTherapy: 'ACE Inhibitors', percentageUse: 30 },
      { year: 2022, firstLineTherapy: 'ACE Inhibitors', percentageUse: 29 },
      { year: 2023, firstLineTherapy: 'ACE Inhibitors', percentageUse: 28 }
    ]
  },
  {
    conditionName: 'Migraine',
    topDrugs: [
      { drugName: 'Aimovig', efficacyScore: 89, marketShare: 38.2 },
      { drugName: 'Emgality', efficacyScore: 88, marketShare: 31.5 },
      { drugName: 'Ajovy', efficacyScore: 87, marketShare: 24.8 },
      { drugName: 'Topiramate', efficacyScore: 82, marketShare: 45.2 },
      { drugName: 'Propranolol', efficacyScore: 79, marketShare: 36.7 }
    ],
    patientDemographics: [
      { ageGroup: '18-34', percentage: 28 },
      { ageGroup: '35-49', percentage: 42 },
      { ageGroup: '50-64', percentage: 24 },
      { ageGroup: '65+', percentage: 6 }
    ],
    treatmentTrends: [
      { year: 2019, firstLineTherapy: 'Topiramate', percentageUse: 34 },
      { year: 2020, firstLineTherapy: 'Topiramate', percentageUse: 32 },
      { year: 2021, firstLineTherapy: 'Anti-CGRP mAbs', percentageUse: 38 },
      { year: 2022, firstLineTherapy: 'Anti-CGRP mAbs', percentageUse: 45 },
      { year: 2023, firstLineTherapy: 'Anti-CGRP mAbs', percentageUse: 52 }
    ]
  }
];

// Sample comparative analysis data
export const demoComparativeAnalyses: DemoComparativeAnalysis[] = [
  {
    drugClass: 'GLP-1 Receptor Agonists',
    drugs: [
      { name: 'Semaglutide (Ozempic)', efficacy: 92, safety: 87, adherence: 85, cost: 65 },
      { name: 'Dulaglutide (Trulicity)', efficacy: 85, safety: 86, adherence: 83, cost: 68 },
      { name: 'Liraglutide (Victoza)', efficacy: 83, safety: 85, adherence: 80, cost: 70 },
      { name: 'Oral Semaglutide (Rybelsus)', efficacy: 84, safety: 82, adherence: 88, cost: 62 }
    ],
    conditions: ['Type 2 Diabetes', 'Obesity', 'Metabolic Syndrome'],
    evidenceLevel: 'high',
    lastUpdated: '2023-06-15'
  },
  {
    drugClass: 'SGLT2 Inhibitors',
    drugs: [
      { name: 'Empagliflozin (Jardiance)', efficacy: 88, safety: 85, adherence: 84, cost: 67 },
      { name: 'Dapagliflozin (Farxiga)', efficacy: 86, safety: 84, adherence: 82, cost: 69 },
      { name: 'Canagliflozin (Invokana)', efficacy: 85, safety: 80, adherence: 81, cost: 71 },
      { name: 'Ertugliflozin (Steglatro)', efficacy: 82, safety: 83, adherence: 80, cost: 73 }
    ],
    conditions: ['Type 2 Diabetes', 'Heart Failure', 'Chronic Kidney Disease'],
    evidenceLevel: 'high',
    lastUpdated: '2023-06-10'
  },
  {
    drugClass: 'Anti-CGRP Monoclonal Antibodies',
    drugs: [
      { name: 'Erenumab (Aimovig)', efficacy: 89, safety: 92, adherence: 88, cost: 55 },
      { name: 'Galcanezumab (Emgality)', efficacy: 88, safety: 90, adherence: 87, cost: 57 },
      { name: 'Fremanezumab (Ajovy)', efficacy: 87, safety: 91, adherence: 86, cost: 56 },
      { name: 'Eptinezumab (Vyepti)', efficacy: 90, safety: 89, adherence: 82, cost: 52 }
    ],
    conditions: ['Migraine', 'Chronic Headache'],
    evidenceLevel: 'moderate',
    lastUpdated: '2023-05-22'
  },
  {
    drugClass: 'JAK Inhibitors for Rheumatoid Arthritis',
    drugs: [
      { name: 'Upadacitinib (Rinvoq)', efficacy: 91, safety: 78, adherence: 86, cost: 48 },
      { name: 'Tofacitinib (Xeljanz)', efficacy: 87, safety: 76, adherence: 85, cost: 52 },
      { name: 'Baricitinib (Olumiant)', efficacy: 88, safety: 77, adherence: 84, cost: 50 },
      { name: 'Filgotinib (Jyseleca)', efficacy: 86, safety: 79, adherence: 83, cost: 51 }
    ],
    conditions: ['Rheumatoid Arthritis', 'Psoriatic Arthritis'],
    evidenceLevel: 'moderate',
    lastUpdated: '2023-05-05'
  }
];

// Analytics dashboard data for demo
export interface DemoAnalyticsDashboard {
  topCategoriesWithAds: Array<{
    category: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  adEngagementTrends: Array<{
    date: string;
    impressions: number;
    clicks: number;
  }>;
  drugPerformanceRankings: Array<{
    drugName: string;
    score: number;
    change: number;
  }>;
  demographicEngagement: {
    ageGroups: Array<{
      group: string;
      engagement: number;
    }>;
    specialties: Array<{
      specialty: string;
      engagement: number;
    }>;
  };
}

// Sample analytics dashboard data
export const demoAnalyticsDashboard: DemoAnalyticsDashboard = {
  topCategoriesWithAds: [
    { category: 'Diabetes', impressions: 245000, clicks: 18375, ctr: 7.5 },
    { category: 'Cardiovascular', impressions: 210000, clicks: 14700, ctr: 7.0 },
    { category: 'Rheumatology', impressions: 185000, clicks: 12395, ctr: 6.7 },
    { category: 'Neurology', impressions: 162000, clicks: 12960, ctr: 8.0 },
    { category: 'Oncology', impressions: 148000, clicks: 10360, ctr: 7.0 }
  ],
  adEngagementTrends: [
    { date: '2023-01', impressions: 850000, clicks: 59500 },
    { date: '2023-02', impressions: 875000, clicks: 61250 },
    { date: '2023-03', impressions: 910000, clicks: 63700 },
    { date: '2023-04', impressions: 945000, clicks: 66150 },
    { date: '2023-05', impressions: 985000, clicks: 69850 },
    { date: '2023-06', impressions: 1025000, clicks: 74825 }
  ],
  drugPerformanceRankings: [
    { drugName: 'Ozempic', score: 88, change: 2.5 },
    { drugName: 'Aimovig', score: 86, change: 1.8 },
    { drugName: 'Jardiance', score: 86, change: 1.2 },
    { drugName: 'Rinvoq', score: 85, change: 3.5 },
    { drugName: 'Trulicity', score: 84, change: -0.5 },
    { drugName: 'Rybelsus', score: 83, change: 4.2 },
    { drugName: 'Skyrizi', score: 83, change: 2.8 }
  ],
  demographicEngagement: {
    ageGroups: [
      { group: '25-34', engagement: 12 },
      { group: '35-44', engagement: 23 },
      { group: '45-54', engagement: 32 },
      { group: '55-64', engagement: 21 },
      { group: '65+', engagement: 12 }
    ],
    specialties: [
      { specialty: 'Primary Care', engagement: 35 },
      { specialty: 'Endocrinology', engagement: 18 },
      { specialty: 'Cardiology', engagement: 15 },
      { specialty: 'Neurology', engagement: 12 },
      { specialty: 'Rheumatology', engagement: 10 },
      { specialty: 'Oncology', engagement: 8 },
      { specialty: 'Other', engagement: 2 }
    ]
  }
};

// Helper function to get drug performance data by category
export function getDrugPerformanceByCategory(category: string): DemoDrugPerformance[] {
  return demoDrugPerformanceData.filter(drug => drug.category === category);
}

// Helper function to get condition insights by name
export function getConditionInsightByName(name: string): DemoConditionInsight | undefined {
  return demoConditionInsights.find(condition => condition.conditionName === name);
}

// Helper function to get comparative analyses by drug class
export function getComparativeAnalysisByClass(drugClass: string): DemoComparativeAnalysis | undefined {
  return demoComparativeAnalyses.find(analysis => analysis.drugClass === drugClass);
} 