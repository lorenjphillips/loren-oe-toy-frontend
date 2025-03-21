// Sample medical questions for demo mode
import { DemoScenario } from '../../services/demo/demoConfig';

export interface DemoQuestion {
  id: string;
  text: string;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  scenarios: DemoScenario[];
  tags: string[];
}

// Sample questions for demo mode
export const demoQuestions: DemoQuestion[] = [
  {
    id: 'q1',
    text: 'What medications are most effective for treating type 2 diabetes with cardiovascular risk factors?',
    category: 'diabetes',
    difficulty: 'intermediate',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['diabetes', 'cardiovascular', 'treatment']
  },
  {
    id: 'q2',
    text: 'What are the latest guidelines for hypertension management in elderly patients?',
    category: 'cardiovascular',
    difficulty: 'intermediate',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['hypertension', 'elderly', 'guidelines']
  },
  {
    id: 'q3',
    text: 'What is the most effective treatment for moderate to severe plaque psoriasis?',
    category: 'dermatology',
    difficulty: 'intermediate', 
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['psoriasis', 'treatment', 'dermatology']
  },
  {
    id: 'q4',
    text: 'What are the best pharmacological options for ADHD in adults?',
    category: 'psychiatry',
    difficulty: 'intermediate',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['ADHD', 'psychiatry', 'adults']
  },
  {
    id: 'q5',
    text: 'What are the current recommendations for COVID-19 vaccine boosters?',
    category: 'infectious disease',
    difficulty: 'basic',
    scenarios: [DemoScenario.BASIC, DemoScenario.COMPREHENSIVE],
    tags: ['COVID-19', 'vaccines', 'infectious disease']
  },
  {
    id: 'q6',
    text: 'What medications show the most promise for slowing progression of Alzheimer\'s disease?',
    category: 'neurology',
    difficulty: 'advanced',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['alzheimer\'s', 'neurology', 'disease progression']
  },
  {
    id: 'q7',
    text: 'What is the recommended first-line treatment for migraine prevention?',
    category: 'neurology',
    difficulty: 'basic',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['migraine', 'prevention', 'neurology']
  },
  {
    id: 'q8',
    text: 'What are the most effective treatments for moderate to severe rheumatoid arthritis?',
    category: 'rheumatology',
    difficulty: 'intermediate',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['rheumatoid arthritis', 'treatment', 'rheumatology']
  },
  {
    id: 'q9',
    text: 'What are the latest advances in targeted therapies for lung cancer?',
    category: 'oncology',
    difficulty: 'advanced',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['lung cancer', 'targeted therapy', 'oncology']
  },
  {
    id: 'q10',
    text: 'What medications are most effective for treatment-resistant depression?',
    category: 'psychiatry',
    difficulty: 'advanced',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['depression', 'treatment-resistant', 'psychiatry']
  },
  {
    id: 'q11',
    text: 'What are the current guidelines for statin use in primary prevention of cardiovascular disease?',
    category: 'cardiovascular',
    difficulty: 'intermediate',
    scenarios: [DemoScenario.BASIC, DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['statins', 'cardiovascular', 'prevention']
  },
  {
    id: 'q12',
    text: 'How effective are SGLT2 inhibitors for heart failure with preserved ejection fraction?',
    category: 'cardiovascular',
    difficulty: 'advanced',
    scenarios: [DemoScenario.CLINICAL_DECISION, DemoScenario.COMPREHENSIVE],
    tags: ['SGLT2 inhibitors', 'heart failure', 'cardiovascular']
  },
  {
    id: 'analytics1',
    text: 'Show me the latest analytics on diabetes medication efficacy trends',
    category: 'analytics',
    difficulty: 'basic',
    scenarios: [DemoScenario.ANALYTICS, DemoScenario.COMPREHENSIVE],
    tags: ['analytics', 'diabetes', 'trends']
  },
  {
    id: 'analytics2',
    text: 'What are the comparative metrics between JAK inhibitors for rheumatoid arthritis?',
    category: 'analytics',
    difficulty: 'intermediate',
    scenarios: [DemoScenario.ANALYTICS, DemoScenario.COMPREHENSIVE],
    tags: ['analytics', 'JAK inhibitors', 'comparative']
  },
  {
    id: 'analytics3',
    text: 'Show performance data on antihypertensive medications in African American patients',
    category: 'analytics',
    difficulty: 'advanced',
    scenarios: [DemoScenario.ANALYTICS, DemoScenario.COMPREHENSIVE],
    tags: ['analytics', 'hypertension', 'demographics']
  }
];

// Helper function to get questions for a specific scenario
export function getQuestionsForScenario(scenario: DemoScenario): DemoQuestion[] {
  return demoQuestions.filter(q => q.scenarios.includes(scenario));
}

// Helper function to get questions by category
export function getQuestionsByCategory(category: string): DemoQuestion[] {
  return demoQuestions.filter(q => q.category === category);
}

// Helper function to get random questions
export function getRandomQuestions(count: number = 3, scenario?: DemoScenario): DemoQuestion[] {
  const questionsPool = scenario ? getQuestionsForScenario(scenario) : demoQuestions;
  const shuffled = [...questionsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
} 