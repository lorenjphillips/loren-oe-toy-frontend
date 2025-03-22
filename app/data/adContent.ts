/**
 * Mock data store for pharmaceutical ad content
 */

import { 
  AdType,
  AdCompany, 
  AdContent, 
  AdDisplaySettings, 
  TreatmentCategory 
} from '../models/adTypes';

/**
 * Mock pharma companies for ad content
 */
export const PHARMA_COMPANIES: AdCompany[] = [
  {
    id: 'pfizer',
    name: 'Pfizer',
    logoUrl: '/assets/logos/pfizer.png',
    primaryColor: '#0093d0',
    secondaryColor: '#e11b22',
    website: 'https://www.pfizer.com',
    defaultDisplaySettings: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'Roboto, sans-serif',
      border: true,
      borderColor: '#0093d0',
      cornerRadius: 8,
      padding: 16,
      logoPosition: 'top',
      animationEnabled: false,
      contentLayout: 'standard'
    },
    legalDisclaimer: 'Pfizer Inc. All rights reserved. The product information provided here is intended only for residents of the United States.'
  },
  {
    id: 'genentech',
    name: 'Genentech',
    logoUrl: '/assets/logos/genentech.png',
    primaryColor: '#0057b8',
    secondaryColor: '#6dc5e1',
    website: 'https://www.gene.com',
    defaultDisplaySettings: {
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      fontFamily: 'Arial, sans-serif',
      border: true,
      borderColor: '#0057b8',
      cornerRadius: 4,
      padding: 20,
      logoPosition: 'top',
      animationEnabled: true,
      contentLayout: 'standard'
    },
    legalDisclaimer: 'Genentech, Inc. All rights reserved. This information is intended for US healthcare professionals only.'
  },
  {
    id: 'gsk',
    name: 'GSK',
    logoUrl: '/assets/logos/gsk.png',
    primaryColor: '#f36633',
    secondaryColor: '#502b85',
    website: 'https://www.gsk.com',
    defaultDisplaySettings: {
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontFamily: 'Lato, sans-serif',
      border: false,
      cornerRadius: 0,
      padding: 24,
      logoPosition: 'left',
      animationEnabled: false,
      contentLayout: 'compact'
    },
    legalDisclaimer: 'GSK plc. All rights reserved. Information provided is for educational purposes only.'
  },
  {
    id: 'eli_lilly',
    name: 'Eli Lilly',
    logoUrl: '/assets/logos/lilly.png',
    primaryColor: '#e11931',
    secondaryColor: '#002677',
    website: 'https://www.lilly.com',
    defaultDisplaySettings: {
      backgroundColor: '#f5f5f5',
      textColor: '#333333',
      fontFamily: 'Open Sans, sans-serif',
      border: true,
      borderColor: '#e11931',
      cornerRadius: 12,
      padding: 16,
      logoPosition: 'right',
      animationEnabled: false,
      contentLayout: 'expanded'
    },
    legalDisclaimer: 'Eli Lilly and Company. All rights reserved. This information is intended for US healthcare professionals.'
  }
];

/**
 * Mock treatment categories
 */
export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    id: 'cardiology_hypertension',
    name: 'Hypertension',
    medicalCategory: 'cardiology',
    relevantSpecialties: ['cardiology', 'primary care', 'internal medicine'],
    description: 'Treatments for managing hypertension (high blood pressure)'
  },
  {
    id: 'cardiology_heart_failure',
    name: 'Heart Failure',
    medicalCategory: 'cardiology',
    relevantSpecialties: ['cardiology', 'internal medicine'],
    description: 'Treatments for managing heart failure conditions'
  },
  {
    id: 'oncology_breast_cancer',
    name: 'Breast Cancer',
    medicalCategory: 'oncology',
    relevantSpecialties: ['oncology', 'surgery'],
    description: 'Treatments for breast cancer across various stages and types'
  },
  {
    id: 'oncology_lung_cancer',
    name: 'Lung Cancer',
    medicalCategory: 'oncology',
    relevantSpecialties: ['oncology', 'pulmonology'],
    description: 'Treatments for lung cancer, including targeted and immunotherapy options'
  },
  {
    id: 'immunology_rheumatoid_arthritis',
    name: 'Rheumatoid Arthritis',
    medicalCategory: 'immunology',
    relevantSpecialties: ['rheumatology', 'immunology'],
    description: 'Treatments for rheumatoid arthritis including biologics and DMARDs'
  },
  {
    id: 'pulmonology_asthma',
    name: 'Asthma',
    medicalCategory: 'pulmonology',
    relevantSpecialties: ['pulmonology', 'allergy', 'primary care'],
    description: 'Treatments for asthma management and prevention'
  },
  {
    id: 'neurology_multiple_sclerosis',
    name: 'Multiple Sclerosis',
    medicalCategory: 'neurology',
    relevantSpecialties: ['neurology'],
    description: 'Treatments for multiple sclerosis across various disease types'
  },
  {
    id: 'endocrinology_diabetes',
    name: 'Diabetes',
    medicalCategory: 'endocrinology',
    relevantSpecialties: ['endocrinology', 'primary care'],
    description: 'Treatments for diabetes management and complications'
  }
];

/**
 * Generate a unique ID
 */
const generateId = (base: string): string => {
  return `${base}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Mock ad content database
 */
export const AD_CONTENT: AdContent[] = [
  // Pfizer Hypertension Ads
  {
    id: generateId('pfizer_hypertension'),
    title: 'Pfizer Hypertension Treatment Overview',
    description: 'Comprehensive portfolio of antihypertensive medications',
    campaignId: 'PFIZER-HTN-2023',
    adType: AdType.ENHANCED,
    company: PHARMA_COMPANIES.find(c => c.id === 'pfizer')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'cardiology_hypertension')!,
    treatmentCategoryId: 'cardiology_hypertension',
    targetConditions: ['hypertension', 'high blood pressure'],
    creative: {
      displaySettings: {
        backgroundColor: '#f8f9fa',
        contentLayout: 'standard'
      }
    },
    metadata: {
      campaignId: 'PFIZER-HTN-2023',
      targetAudience: ['cardiologists', 'primary_care', 'nephrologists'],
      keywords: ['hypertension', 'blood pressure', 'cardiovascular risk'],
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-12-31'),
      priority: 8,
      maxImpressions: 10000,
      frequencyCap: {
        count: 3,
        timeWindowHours: 24
      }
    },
    keywords: ['hypertension', 'blood pressure', 'cardiovascular'],
    entityMappings: [
      {
        entity: 'hypertension',
        type: 'condition',
        confidence: 0.95
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeTo: Date.now() + 90 * 24 * 60 * 60 * 1000,
    isActive: true,
    regulatoryApproved: true,
    disclaimers: [],
    references: []
  },
  
  // Genentech Breast Cancer Ad
  {
    id: generateId('genentech_breast_cancer'),
    title: 'Genentech HER2+ Breast Cancer Treatment',
    description: 'Targeted treatment options for HER2+ breast cancer',
    campaignId: 'GENENTECH-BC-2023',
    adType: AdType.INTERACTIVE,
    company: PHARMA_COMPANIES.find(c => c.id === 'genentech')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'oncology_breast_cancer')!,
    treatmentCategoryId: 'oncology_breast_cancer',
    targetConditions: ['breast cancer', 'HER2+ breast cancer'],
    creative: {
      displaySettings: {
        backgroundColor: '#f0f7fc',
        contentLayout: 'expanded'
      }
    },
    metadata: {
      campaignId: 'GENENTECH-BC-2023',
      targetAudience: ['oncologists', 'breast_surgeons'],
      keywords: ['HER2+', 'breast cancer', 'targeted therapy', 'monoclonal antibody'],
      startDate: new Date('2023-02-15'),
      priority: 9,
      maxImpressionsByUser: 5,
      abTestGroup: 'detailed_content'
    },
    keywords: ['HER2+', 'breast cancer', 'targeted therapy'],
    entityMappings: [
      {
        entity: 'breast cancer',
        type: 'condition',
        confidence: 0.98
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeTo: Date.now() + 120 * 24 * 60 * 60 * 1000,
    isActive: true,
    regulatoryApproved: true,
    disclaimers: [],
    references: []
  },
  
  // GSK Asthma Ad
  {
    id: generateId('gsk_asthma'),
    name: 'GSK Asthma Management Solutions',
    company: PHARMA_COMPANIES.find(c => c.id === 'gsk')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'pulmonology_asthma')!,
    type: AdType.TEXT,
    creative: {
      id: generateId('creative'),
      headline: 'Comprehensive Asthma Control',
      bodyText: 'GSK offers a range of treatment options for asthma management, focusing on reducing exacerbations and improving quality of life for patients with persistent symptoms.',
      callToAction: 'View Treatment Guidelines',
      displaySettings: {
        padding: 12,
        cornerRadius: 4
      }
    },
    metadata: {
      campaignId: 'GSK-ASTHMA-2023',
      targetAudience: ['pulmonologists', 'allergists', 'primary_care'],
      keywords: ['asthma', 'inhaler', 'ICS', 'exacerbation', 'maintenance'],
      priority: 7,
      frequencyCap: {
        count: 2,
        timeWindowHours: 48
      }
    },
    isActive: true
  },
  
  // Eli Lilly Diabetes Ad
  {
    id: generateId('eli_lilly_diabetes'),
    title: 'Eli Lilly Diabetes Portfolio',
    description: 'Advanced treatments for diabetes management',
    campaignId: 'LILLY-DIAB-2023',
    adType: AdType.STANDARD,
    company: PHARMA_COMPANIES.find(c => c.id === 'eli_lilly')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'endocrinology_diabetes')!,
    treatmentCategoryId: 'endocrinology_diabetes',
    targetConditions: ['diabetes', 'type 2 diabetes'],
    creative: {
      displaySettings: {
        backgroundColor: '#f5f9ff',
        contentLayout: 'standard'
      }
    },
    keywords: ['diabetes', 'insulin', 'blood glucose'],
    entityMappings: [
      {
        entity: 'diabetes',
        type: 'condition',
        confidence: 0.95
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeTo: Date.now() + 180 * 24 * 60 * 60 * 1000,
    isActive: true,
    regulatoryApproved: true,
    disclaimers: [],
    references: []
  },
  
  // Pfizer Rheumatoid Arthritis Ad
  {
    id: generateId('pfizer_rheumatoid_arthritis'),
    title: 'Pfizer Rheumatoid Arthritis Treatment',
    description: 'Innovative treatments for rheumatoid arthritis',
    campaignId: 'PFIZER-RA-2023',
    adType: AdType.STANDARD,
    company: PHARMA_COMPANIES.find(c => c.id === 'pfizer')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'immunology_rheumatoid_arthritis')!,
    treatmentCategoryId: 'immunology_rheumatoid_arthritis',
    targetConditions: ['rheumatoid arthritis', 'autoimmune'],
    creative: {
      displaySettings: {
        backgroundColor: '#f5f9ff',
        contentLayout: 'standard'
      }
    },
    keywords: ['rheumatoid arthritis', 'RA', 'autoimmune'],
    entityMappings: [
      {
        entity: 'rheumatoid arthritis',
        type: 'condition',
        confidence: 0.95
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeTo: Date.now() + 180 * 24 * 60 * 60 * 1000,
    isActive: true,
    regulatoryApproved: true,
    disclaimers: [],
    references: []
  },
  
  // Genentech Lung Cancer Ad
  {
    id: generateId('genentech_lung_cancer'),
    name: 'Genentech Lung Cancer Precision Medicine',
    company: PHARMA_COMPANIES.find(c => c.id === 'genentech')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'oncology_lung_cancer')!,
    type: AdType.SIDEBAR,
    creative: {
      displaySettings: {
        headline: 'Precision Medicine in Lung Cancer',
        subheadline: 'Targeted therapies based on molecular profiling',
        bodyText: 'Genentech\'s approach to lung cancer treatment focuses on molecular profiling to match patients with targeted therapies that address specific driver mutations and immune mechanisms.',
        callToAction: 'Learn About Biomarker Testing',
        imageUrl: '/assets/images/lung-cancer-precision.jpg'
      }
    },
    metadata: {
      campaignId: 'GENENTECH-LC-2023',
      targetAudience: ['oncologists', 'pulmonologists', 'pathologists'],
      keywords: ['lung cancer', 'NSCLC', 'biomarker', 'targeted therapy', 'molecular profiling'],
      priority: 9,
      maxImpressionsByUser: 4
    },
    isActive: true
  },
  
  // GSK Multiple Sclerosis Ad
  {
    id: generateId('gsk_ms'),
    name: 'GSK Multiple Sclerosis Research',
    company: PHARMA_COMPANIES.find(c => c.id === 'gsk')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'neurology_multiple_sclerosis')!,
    type: AdType.BANNER,
    creative: {
      displaySettings: {
        headline: 'Advancing MS Treatment Research',
        subheadline: 'Focusing on disease modification and symptom management',
        bodyText: 'GSK is committed to improving outcomes for patients with multiple sclerosis through ongoing research into novel mechanisms and treatment approaches that address both inflammation and neurodegeneration.',
        callToAction: 'Explore Our Research Pipeline',
        imageUrl: '/assets/images/ms-research.jpg'
      }
    },
    metadata: {
      campaignId: 'GSK-MS-2023',
      targetAudience: ['neurologists', 'neuroimmunologists'],
      keywords: ['multiple sclerosis', 'neurodegeneration', 'B-cell therapy'],
      startDate: new Date('2023-04-01'),
      priority: 7,
      abTestGroup: 'research_focused'
    },
    isActive: true
  },
  
  // Eli Lilly Heart Failure Ad
  {
    id: generateId('lilly_heart_failure'),
    name: 'Eli Lilly Heart Failure Management',
    company: PHARMA_COMPANIES.find(c => c.id === 'eli_lilly')!,
    treatmentCategory: TREATMENT_CATEGORIES.find(t => t.id === 'cardiology_heart_failure')!,
    type: AdType.TEXT,
    creative: {
      displaySettings: {
        headline: 'Optimizing Heart Failure Outcomes',
        bodyText: 'Eli Lilly offers evidence-based approaches to heart failure management, with therapies designed to reduce hospitalizations, improve functional capacity, and extend survival in patients with HFrEF and HFpEF.',
        callToAction: 'Review Treatment Guidelines',
        contentLayout: 'compact'
      }
    },
    metadata: {
      campaignId: 'LILLY-HF-2023',
      targetAudience: ['cardiologists', 'heart_failure_specialists', 'internists'],
      keywords: ['heart failure', 'HFrEF', 'HFpEF', 'GDMT', 'hospitalization'],
      priority: 8,
      frequencyCap: {
        count: 3,
        timeWindowHours: 72
      }
    },
    isActive: true
  }
];

/**
 * Get companies by ID
 */
export function getCompanyById(id: string): AdCompany | undefined {
  return PHARMA_COMPANIES.find(company => company.id === id);
}

/**
 * Get treatment category by ID
 */
export function getTreatmentCategoryById(id: string): TreatmentCategory | undefined {
  return TREATMENT_CATEGORIES.find(category => category.id === id);
}

/**
 * Get treatment categories by medical category
 */
export function getTreatmentCategoriesByMedicalCategory(medicalCategoryId: string): TreatmentCategory[] {
  return TREATMENT_CATEGORIES.filter(category => category.medicalCategory === medicalCategoryId);
}

/**
 * Get ad content by ID
 */
export function getAdContentById(id: string): AdContent | undefined {
  return AD_CONTENT.find(content => content.id === id);
}

/**
 * Get all active ad content
 */
export function getAllActiveAdContent(): AdContent[] {
  return AD_CONTENT.filter(content => content.isActive);
}

/**
 * In a real implementation, these functions would interact with a database.
 * For this mock implementation, we're using in-memory arrays.
 */ 