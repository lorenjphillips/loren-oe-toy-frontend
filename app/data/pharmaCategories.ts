/**
 * Pharmaceutical Company and Category Data
 * 
 * Provides data structures for pharmaceutical companies and medical treatment categories.
 */

// Pharma company interface
export interface PharmaCompany {
  id: string;
  name: string;
  logo_url: string;
  primaryColor: string;
  secondaryColor: string;
  priorityCategories: string[];
  description: string;
  treatment_areas: Array<{
    id: string;
    category: string;
    priority: number;
    subcategories: string[];
    flagship_medications: string[];
  }>;
}

// Medical category interface
export interface MedicalCategory {
  id: string;
  displayName: string;
  description: string;
  subcategories: string[];
  relatedTerms: string[];
}

// Map of treatment categories
export const MEDICAL_CATEGORY_MAP: Record<string, MedicalCategory> = {
  oncology: {
    id: 'oncology',
    displayName: 'Oncology',
    description: 'Cancer treatments and related therapeutics',
    subcategories: [
      'Lung Cancer',
      'Breast Cancer',
      'Prostate Cancer',
      'Leukemia',
      'Immunotherapy',
      'Targeted Therapy'
    ],
    relatedTerms: [
      'cancer', 'tumor', 'chemotherapy', 'radiation', 'oncologist'
    ]
  },
  immunology: {
    id: 'immunology',
    displayName: 'Immunology',
    description: 'Treatments for autoimmune diseases and immune system disorders',
    subcategories: [
      'Rheumatoid Arthritis',
      'Psoriasis',
      'Inflammatory Bowel Disease',
      'Lupus',
      'Multiple Sclerosis'
    ],
    relatedTerms: [
      'immune', 'autoimmune', 'inflammation', 'biologics', 'antibodies'
    ]
  },
  cardiology: {
    id: 'cardiology',
    displayName: 'Cardiology',
    description: 'Treatments for heart disease and cardiovascular conditions',
    subcategories: [
      'Hypertension',
      'Heart Failure',
      'Anticoagulation',
      'Lipid Management',
      'Arrhythmia'
    ],
    relatedTerms: [
      'heart', 'cardiovascular', 'cholesterol', 'blood pressure', 'stroke'
    ]
  },
  neurology: {
    id: 'neurology',
    displayName: 'Neurology',
    description: 'Treatments for neurological disorders and conditions',
    subcategories: [
      'Alzheimer\'s Disease',
      'Parkinson\'s Disease',
      'Epilepsy',
      'Migraine',
      'Multiple Sclerosis'
    ],
    relatedTerms: [
      'brain', 'nervous system', 'cognitive', 'neural', 'dementia'
    ]
  },
  infectious_disease: {
    id: 'infectious_disease',
    displayName: 'Infectious Disease',
    description: 'Treatments for bacterial, viral, and fungal infections',
    subcategories: [
      'Antibiotics',
      'Antivirals',
      'Vaccines',
      'HIV/AIDS',
      'Hepatitis'
    ],
    relatedTerms: [
      'infection', 'bacteria', 'virus', 'antimicrobial', 'pathogen'
    ]
  },
  endocrinology: {
    id: 'endocrinology',
    displayName: 'Endocrinology',
    description: 'Treatments for hormone-related conditions and metabolic disorders',
    subcategories: [
      'Diabetes',
      'Thyroid Disorders',
      'Growth Hormone',
      'Adrenal Disorders',
      'Metabolic Syndrome'
    ],
    relatedTerms: [
      'hormone', 'insulin', 'thyroid', 'metabolism', 'glucose'
    ]
  },
  respiratory: {
    id: 'respiratory',
    displayName: 'Respiratory',
    description: 'Treatments for respiratory and pulmonary conditions',
    subcategories: [
      'Asthma',
      'COPD',
      'Pulmonary Fibrosis',
      'Cystic Fibrosis',
      'Respiratory Infections'
    ],
    relatedTerms: [
      'lung', 'breathing', 'pulmonary', 'inhaler', 'bronchodilator'
    ]
  },
  rare_disease: {
    id: 'rare_disease',
    displayName: 'Rare Disease',
    description: 'Treatments for rare genetic and orphan diseases',
    subcategories: [
      'Genetic Disorders',
      'Lysosomal Storage Disorders',
      'Orphan Diseases',
      'Enzyme Replacement',
      'Gene Therapy'
    ],
    relatedTerms: [
      'orphan', 'genetic', 'hereditary', 'mutation', 'congenital'
    ]
  }
};

// List of pharmaceutical companies
export const PHARMA_COMPANIES: PharmaCompany[] = [
  {
    id: 'pfizer',
    name: 'Pfizer',
    logo_url: '/assets/logos/pfizer.svg',
    primaryColor: '#0093d0',
    secondaryColor: '#f26649',
    priorityCategories: ['oncology', 'infectious_disease', 'immunology'],
    description: 'A global pharmaceutical company focused on developing innovative medicines and vaccines across multiple therapeutic areas.',
    treatment_areas: []
  },
  {
    id: 'genentech',
    name: 'Genentech',
    logo_url: '/assets/logos/genentech.svg',
    primaryColor: '#0046ad',
    secondaryColor: '#d62228',
    priorityCategories: ['oncology', 'immunology', 'neurology'],
    description: 'A biotechnology company discovering and developing medicines for people with serious and life-threatening diseases.',
    treatment_areas: []
  },
  {
    id: 'gsk',
    name: 'GSK',
    logo_url: '/assets/logos/gsk.svg',
    primaryColor: '#f36633',
    secondaryColor: '#151f6d',
    priorityCategories: ['respiratory', 'infectious_disease', 'oncology'],
    description: 'A global healthcare company developing innovative medicines, vaccines, and consumer health products.',
    treatment_areas: []
  },
  {
    id: 'lilly',
    name: 'Eli Lilly',
    logo_url: '/assets/logos/lilly.svg',
    primaryColor: '#e1261c',
    secondaryColor: '#0033a0',
    priorityCategories: ['endocrinology', 'oncology', 'neurology'],
    description: 'A pharmaceutical company developing innovative medicines across multiple therapeutic areas with a focus on diabetes, oncology, and neuroscience.',
    treatment_areas: []
  },
  {
    id: 'amgen',
    name: 'Amgen',
    logo_url: '/assets/logos/amgen.svg',
    primaryColor: '#0063c3',
    secondaryColor: '#f7b11e',
    priorityCategories: ['oncology', 'immunology', 'cardiology'],
    description: 'A biotechnology company committed to unlocking the potential of biology for patients suffering from serious illnesses.',
    treatment_areas: []
  },
  {
    id: 'novartis',
    name: 'Novartis',
    logo_url: '/assets/logos/novartis.svg',
    primaryColor: '#0460a9',
    secondaryColor: '#8ebfed',
    priorityCategories: ['cardiology', 'immunology', 'neurology'],
    description: 'A global healthcare company reimagining medicine to improve and extend people\'s lives.',
    treatment_areas: []
  },
  {
    id: 'roche',
    name: 'Roche',
    logo_url: '/assets/logos/roche.svg',
    primaryColor: '#0a0635',
    secondaryColor: '#e41e26',
    priorityCategories: ['oncology', 'neurology', 'rare_disease'],
    description: 'A leader in research-focused healthcare with combined strengths in pharmaceuticals and diagnostics.',
    treatment_areas: []
  },
  {
    id: 'merck',
    name: 'Merck',
    logo_url: '/assets/logos/merck.svg',
    primaryColor: '#00857c',
    secondaryColor: '#e2231a',
    priorityCategories: ['oncology', 'infectious_disease', 'cardiology'],
    description: 'A global healthcare company working to help the world be well through its prescription medicines, vaccines, and biologic therapies.',
    treatment_areas: []
  }
];

/**
 * Get a pharmaceutical company by ID
 */
export function getCompanyById(id: string): PharmaCompany | undefined {
  return PHARMA_COMPANIES.find(company => company.id === id);
}

/**
 * Get a medical category by ID
 */
export function getCategoryById(id: string): MedicalCategory | undefined {
  return MEDICAL_CATEGORY_MAP[id];
}

/**
 * Get companies sorted by priority for a specific treatment category
 */
export function getCompaniesByCategory(categoryId: string): PharmaCompany[] {
  return PHARMA_COMPANIES
    .filter(company => company.priorityCategories.includes(categoryId))
    .sort((a, b) => {
      // Companies with the category as first priority come first
      const aPriority = a.priorityCategories.indexOf(categoryId);
      const bPriority = b.priorityCategories.indexOf(categoryId);
      return aPriority - bPriority;
    });
}

/**
 * Get all treatment categories
 */
export function getAllCategories(): MedicalCategory[] {
  return Object.values(MEDICAL_CATEGORY_MAP);
}

/**
 * Get priority categories for a company
 */
export function getPriorityCategories(companyId: string): MedicalCategory[] {
  const company = getCompanyById(companyId);
  if (!company) return [];
  
  return company.priorityCategories
    .map(id => MEDICAL_CATEGORY_MAP[id])
    .filter(Boolean);
} 