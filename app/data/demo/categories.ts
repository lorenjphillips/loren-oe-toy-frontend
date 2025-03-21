// Medical categories for demo questions
import { DemoScenario } from '../../services/demo/demoConfig';

export interface DemoCategory {
  id: string;
  name: string;
  description: string;
  iconName?: string; // Material-UI icon name
  color?: string;
  scenarios: DemoScenario[];
  subcategories?: string[];
  relatedCategories?: string[];
}

export const demoCategories: DemoCategory[] = [
  {
    id: 'diabetes',
    name: 'Diabetes',
    description: 'Questions related to diabetes management, treatments, and complications',
    iconName: 'Whatshot',
    color: '#E57373',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Type 1', 'Type 2', 'Gestational', 'Complications'],
    relatedCategories: ['endocrinology', 'cardiovascular']
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    description: 'Topics covering heart disease, hypertension, and vascular disorders',
    iconName: 'Favorite',
    color: '#F06292',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Hypertension', 'Heart Failure', 'Arrhythmias', 'Prevention'],
    relatedCategories: ['internal medicine', 'emergency medicine']
  },
  {
    id: 'neurology',
    name: 'Neurology',
    description: 'Disorders of the brain, spinal cord, and nervous system',
    iconName: 'Psychology',
    color: '#BA68C8',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Migraine', 'Epilepsy', 'Neurodegenerative', 'Stroke'],
    relatedCategories: ['psychiatry', 'pain management']
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry',
    description: 'Mental health disorders, treatments, and medications',
    iconName: 'Spa',
    color: '#9575CD',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Depression', 'Anxiety', 'ADHD', 'Bipolar Disorder'],
    relatedCategories: ['neurology', 'psychology']
  },
  {
    id: 'infectious-disease',
    name: 'Infectious Disease',
    description: 'Bacterial, viral, fungal infections and their treatments',
    iconName: 'Coronavirus',
    color: '#7986CB',
    scenarios: [DemoScenario.BASIC, DemoScenario.COMPREHENSIVE],
    subcategories: ['Bacterial', 'Viral', 'Fungal', 'Vaccines'],
    relatedCategories: ['public health', 'emergency medicine']
  },
  {
    id: 'dermatology',
    name: 'Dermatology',
    description: 'Skin disorders, conditions, and treatments',
    iconName: 'Healing',
    color: '#64B5F6',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Psoriasis', 'Eczema', 'Acne', 'Skin Cancer'],
    relatedCategories: ['allergy', 'immunology']
  },
  {
    id: 'rheumatology',
    name: 'Rheumatology',
    description: 'Autoimmune and inflammatory conditions affecting joints and connective tissue',
    iconName: 'FitnessCenter',
    color: '#4FC3F7',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Rheumatoid Arthritis', 'Lupus', 'Osteoarthritis', 'Gout'],
    relatedCategories: ['immunology', 'orthopedics']
  },
  {
    id: 'oncology',
    name: 'Oncology',
    description: 'Cancer diagnosis, treatment, and management',
    iconName: 'Science',
    color: '#4DD0E1',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    subcategories: ['Lung Cancer', 'Breast Cancer', 'Colorectal Cancer', 'Leukemia'],
    relatedCategories: ['hematology', 'radiology']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Data-driven insights on medical treatments and outcomes',
    iconName: 'Assessment',
    color: '#4DB6AC',
    scenarios: [DemoScenario.ANALYTICS, DemoScenario.COMPREHENSIVE],
    subcategories: ['Efficacy Trends', 'Comparative Studies', 'Outcome Measures', 'Population Health'],
    relatedCategories: ['research', 'epidemiology']
  }
];

// Helper function to get categories for a specific scenario
export function getCategoriesForScenario(scenario: DemoScenario): DemoCategory[] {
  return demoCategories.filter(c => c.scenarios.includes(scenario));
}

// Helper function to get a specific category by ID
export function getCategoryById(categoryId: string): DemoCategory | undefined {
  return demoCategories.find(c => c.id === categoryId);
}

// Helper function to get related categories
export function getRelatedCategories(categoryId: string): DemoCategory[] {
  const category = getCategoryById(categoryId);
  if (!category || !category.relatedCategories || category.relatedCategories.length === 0) {
    return [];
  }
  
  return demoCategories.filter(c => 
    category.relatedCategories?.includes(c.id));
} 