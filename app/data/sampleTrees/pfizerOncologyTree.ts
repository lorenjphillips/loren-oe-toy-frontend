/**
 * Sample Decision Tree for Pfizer Oncology
 * 
 * Clinical scenario for breast cancer treatment
 * Featuring realistic decision points with educational content
 * Focusing on CDK4/6 inhibitor therapy (Ibrance/palbociclib)
 */

import { DecisionTree, ScenarioNode, DecisionNode, OutcomeNode, EducationalNode } from '../../services/decisionTreeService';

// Node IDs
const NODE_IDS = {
  ROOT: 'pfizer_onc_001',
  DECISION_1: 'pfizer_onc_002',
  EDUCATION_1: 'pfizer_onc_003',
  DECISION_2: 'pfizer_onc_004',
  EDUCATION_2: 'pfizer_onc_005',
  OUTCOME_POSITIVE: 'pfizer_onc_006',
  OUTCOME_SUBOPTIMAL: 'pfizer_onc_007',
  OUTCOME_NEGATIVE: 'pfizer_onc_008'
};

// Scenario node (root)
const scenarioNode: ScenarioNode = {
  id: NODE_IDS.ROOT,
  type: 'scenario',
  title: 'HR+/HER2- Metastatic Breast Cancer Case',
  content: 'A 58-year-old female patient with recently diagnosed hormone receptor-positive, HER2-negative metastatic breast cancer presents to your clinic for treatment planning.',
  patientInfo: {
    age: 58,
    gender: 'female',
    chiefComplaint: 'Newly diagnosed metastatic breast cancer, seeking treatment plan',
    vitalSigns: {
      bloodPressure: '132/78',
      heartRate: 74,
      respiratoryRate: 16,
      temperature: 36.8,
      oxygenSaturation: 98
    },
    medicalHistory: [
      'HR+/HER2- breast cancer initially diagnosed 4 years ago',
      'Completed adjuvant chemotherapy and radiation',
      'Was on adjuvant tamoxifen for 3 years',
      'Recently discovered bone metastases',
      'Hypertension',
      'Type 2 diabetes (well-controlled)'
    ],
    medications: [
      'Metformin 1000mg BID',
      'Lisinopril 10mg daily',
      'Calcium + Vitamin D supplements'
    ],
    allergies: ['Penicillin'],
    labResults: [
      {
        name: 'WBC',
        value: '5.6',
        unit: 'x10^9/L',
        referenceRange: '4.0-11.0',
        isAbnormal: false
      },
      {
        name: 'Hemoglobin',
        value: '11.8',
        unit: 'g/dL',
        referenceRange: '12.0-15.5',
        isAbnormal: true
      },
      {
        name: 'Platelets',
        value: '210',
        unit: 'x10^9/L',
        referenceRange: '150-400',
        isAbnormal: false
      },
      {
        name: 'ALT',
        value: '28',
        unit: 'U/L',
        referenceRange: '7-56',
        isAbnormal: false
      },
      {
        name: 'Creatinine',
        value: '0.9',
        unit: 'mg/dL',
        referenceRange: '0.5-1.1',
        isAbnormal: false
      },
      {
        name: 'Alkaline Phosphatase',
        value: '142',
        unit: 'U/L',
        referenceRange: '40-130',
        isAbnormal: true
      }
    ]
  },
  children: [
    {
      targetId: NODE_IDS.DECISION_1,
      condition: 'initial_assessment'
    }
  ]
};

// First decision node
const firstDecisionNode: DecisionNode = {
  id: NODE_IDS.DECISION_1,
  type: 'decision',
  title: 'First-Line Treatment Selection',
  content: 'The patient has HR+/HER2- metastatic breast cancer with bone metastases. Her disease recurred while on adjuvant endocrine therapy (tamoxifen). She has good performance status (ECOG 1) and normal organ function.',
  question: 'What would be the most appropriate first-line treatment regimen for this patient?',
  options: [
    {
      id: 'aromatase_inhibitor_only',
      text: 'Aromatase inhibitor monotherapy (letrozole, anastrozole, or exemestane)',
      isCorrect: false,
      explanation: 'While aromatase inhibitors are active in metastatic HR+ breast cancer, this patient progressed on prior endocrine therapy (tamoxifen), suggesting some degree of endocrine resistance. Current guidelines recommend combination therapy with a targeted agent for these patients.'
    },
    {
      id: 'ai_cdk_inhibitor',
      text: 'Aromatase inhibitor plus CDK4/6 inhibitor (e.g., letrozole + palbociclib)',
      isCorrect: true,
      explanation: 'This combination has demonstrated superior progression-free survival compared to endocrine therapy alone in first-line treatment of HR+/HER2- metastatic breast cancer, including in patients with prior endocrine therapy exposure.'
    },
    {
      id: 'chemotherapy',
      text: 'Chemotherapy (e.g., paclitaxel or capecitabine)',
      isCorrect: false,
      explanation: 'Chemotherapy is generally reserved for patients with visceral crisis, endocrine resistance, or after progression on targeted therapies. This patient has bone-only disease and has not exhausted endocrine-based options.'
    },
    {
      id: 'fulvestrant_monotherapy',
      text: 'Fulvestrant monotherapy',
      isCorrect: false,
      explanation: 'While fulvestrant is an option after progression on an aromatase inhibitor, current guidelines recommend combination therapy with a targeted agent in the first-line metastatic setting, especially after recurrence on adjuvant endocrine therapy.'
    }
  ],
  metadata: {
    decisionType: 'treatment',
    difficulty: 'intermediate'
  },
  children: [
    {
      targetId: NODE_IDS.EDUCATION_1,
      condition: 'ai_cdk_inhibitor'
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'chemotherapy',
      probability: 0.9
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'aromatase_inhibitor_only',
      probability: 0.8
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'fulvestrant_monotherapy',
      probability: 0.7
    }
  ]
};

// Educational node about CDK4/6 inhibitors
const firstEducationalNode: EducationalNode = {
  id: NODE_IDS.EDUCATION_1,
  type: 'educational',
  title: 'CDK4/6 Inhibitors in HR+/HER2- Metastatic Breast Cancer',
  content: 'CDK4/6 inhibitors have revolutionized the treatment of HR+/HER2- metastatic breast cancer by targeting cell cycle regulation.',
  treatmentInfo: {
    name: 'Palbociclib (Ibrance)',
    mechanism: 'Selectively inhibits cyclin-dependent kinases 4 and 6, which prevents phosphorylation of the retinoblastoma protein, leading to G1 phase cell cycle arrest and blocking cancer cell proliferation.',
    indications: [
      'First-line treatment of HR+/HER2- advanced or metastatic breast cancer in combination with an aromatase inhibitor',
      'Treatment of HR+/HER2- advanced or metastatic breast cancer in combination with fulvestrant after progression on endocrine therapy'
    ],
    contraindications: [
      'Severe hepatic impairment',
      'Concomitant use of strong CYP3A inhibitors or inducers',
      'Pregnancy or breastfeeding'
    ],
    sideEffects: [
      'Neutropenia (most common, requires monitoring)',
      'Leukopenia',
      'Fatigue',
      'Nausea',
      'Stomatitis',
      'Alopecia (less severe than with chemotherapy)',
      'Anemia',
      'Thrombocytopenia',
      'Increased risk of infections'
    ],
    evidenceLevel: 'high'
  },
  references: [
    {
      citation: 'Finn RS, et al. N Engl J Med. 2016;375(20):1925-1936. PALOMA-2: Palbociclib with letrozole in women with advanced breast cancer.',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1607303'
    },
    {
      citation: 'Turner NC, et al. N Engl J Med. 2018;379(20):1926-1936. PALOMA-3: Overall survival with palbociclib and fulvestrant.',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1810527'
    },
    {
      citation: 'NCCN Clinical Practice Guidelines in Oncology: Breast Cancer. Version 2.2022.',
      url: 'https://www.nccn.org/professionals/physician_gls/pdf/breast.pdf'
    }
  ],
  isSponsoredContent: true,
  children: [
    {
      targetId: NODE_IDS.DECISION_2
    }
  ]
};

// Second decision node
const secondDecisionNode: DecisionNode = {
  id: NODE_IDS.DECISION_2,
  type: 'decision',
  title: 'Management of Treatment-Related Adverse Events',
  content: 'The patient has been on palbociclib (125 mg daily, 3 weeks on/1 week off) plus letrozole (2.5 mg daily) for 4 weeks. She returns for follow-up with complaints of fatigue and recent lab results showing neutropenia (ANC: 0.8 × 10^9/L) without fever.',
  question: 'What is the most appropriate management for this patient?',
  options: [
    {
      id: 'continue_same_dose',
      text: 'Continue treatment at the same doses and recheck labs in 1 week',
      isCorrect: false,
      explanation: 'With Grade 3 neutropenia (ANC < 1.0 × 10^9/L), continuing at the same dose is not recommended and may lead to more severe toxicity or complications.'
    },
    {
      id: 'discontinue_permanently',
      text: 'Discontinue palbociclib permanently and continue letrozole monotherapy',
      isCorrect: false,
      explanation: 'Neutropenia is manageable with dose reduction, and permanent discontinuation is not necessary for uncomplicated Grade 3 neutropenia. This would deprive the patient of potential significant clinical benefit.'
    },
    {
      id: 'dose_reduction',
      text: 'Interrupt palbociclib, then resume at reduced dose (100 mg) when ANC recovers to ≥1.0 × 10^9/L',
      isCorrect: true,
      explanation: 'For Grade 3 neutropenia, the recommended management is to hold palbociclib until recovery to ANC ≥1.0 × 10^9/L, then resume at reduced dose. This balances efficacy and safety.'
    },
    {
      id: 'add_gcsf',
      text: 'Continue current doses and add G-CSF support',
      isCorrect: false,
      explanation: 'Prophylactic G-CSF is not routinely recommended for palbociclib-induced neutropenia. The preferred approach is dose modification according to established guidelines.'
    }
  ],
  metadata: {
    decisionType: 'treatment',
    difficulty: 'intermediate'
  },
  children: [
    {
      targetId: NODE_IDS.EDUCATION_2,
      condition: 'dose_reduction'
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'continue_same_dose',
      probability: 0.9
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'discontinue_permanently',
      probability: 0.8
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'add_gcsf',
      probability: 0.6
    }
  ]
};

// Second educational node about managing CDK4/6 inhibitor adverse events
const secondEducationalNode: EducationalNode = {
  id: NODE_IDS.EDUCATION_2,
  type: 'educational',
  title: 'Managing Adverse Events with CDK4/6 Inhibitors',
  content: 'Proper management of adverse events is crucial for maintaining patients on CDK4/6 inhibitor therapy and achieving optimal outcomes.',
  treatmentInfo: {
    name: 'Palbociclib Dose Modification Guidelines',
    mechanism: 'Dose modifications allow patients to continue benefiting from therapy while managing adverse events. Neutropenia with CDK4/6 inhibitors is generally cyclical, non-cumulative, and reversible.',
    indications: [
      'Grade 3 neutropenia (ANC < 1.0 × 10^9/L)',
      'Grade 3 neutropenia with fever or infection',
      'Grade 4 neutropenia (ANC < 0.5 × 10^9/L)',
      'Other Grade 3-4 non-hematologic toxicities'
    ],
    contraindications: [
      'Do not use G-CSF prophylactically with first episode of uncomplicated neutropenia',
      'Do not accelerate the dosing schedule to make up for missed doses'
    ],
    sideEffects: [
      'Dose reductions may slightly reduce efficacy but allow patients to continue treatment',
      'Most patients maintain clinical benefit even with dose reductions',
      'Interruption without dose reduction leads to higher rates of recurrent neutropenia'
    ],
    evidenceLevel: 'moderate'
  },
  references: [
    {
      citation: 'Diéras V, et al. Breast Cancer Res Treat. 2019;174(1):123-134. Long-term pooled safety analysis of palbociclib in combination with endocrine therapy.',
      url: 'https://link.springer.com/article/10.1007/s10549-018-5083-5'
    },
    {
      citation: 'Ibrance (palbociclib) [prescribing information]. New York, NY: Pfizer Inc; 2019.',
      url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/207103s008lbl.pdf'
    }
  ],
  isSponsoredContent: true,
  children: [
    {
      targetId: NODE_IDS.OUTCOME_POSITIVE
    }
  ]
};

// Outcome nodes
const positiveOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_POSITIVE,
  type: 'outcome',
  outcomeType: 'positive',
  title: 'Optimal Treatment Outcome',
  content: 'The patient's neutropenia resolves after temporary interruption. She resumes palbociclib at 100 mg daily with continued letrozole. At 6-month follow-up, imaging shows stable disease with no new metastases and improved bone pain.',
  patientStatus: 'improved',
  explanation: 'By appropriately managing the neutropenia through dose modification rather than discontinuation, the patient could continue to benefit from CDK4/6 inhibitor therapy. Clinical trials have shown that dose reductions for toxicity management do not significantly impact efficacy outcomes. The combination of CDK4/6 inhibitor plus endocrine therapy provides superior progression-free survival compared to endocrine therapy alone in HR+/HER2- metastatic breast cancer.',
  followUp: 'Continue current regimen with regular monitoring of CBC every 2 weeks for 2 cycles, then monthly. Perform imaging assessments every 3-4 months or as clinically indicated. Consider bone-targeted therapy (e.g., zoledronic acid or denosumab) if not already initiated.'
};

// Suboptimal outcome node
const suboptimalOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_SUBOPTIMAL,
  type: 'neutral',
  title: 'Suboptimal Treatment Outcome',
  content: 'The patient initially responds to treatment but experiences disease progression after 8 months of therapy, with new liver metastases identified on follow-up imaging.',
  patientStatus: 'worsened',
  explanation: 'While endocrine monotherapy or improper management of adverse events can provide some clinical benefit in HR+/HER2- metastatic breast cancer, the duration of response is typically shorter than what would be expected with optimal treatment strategies that include targeted therapies. The median progression-free survival with aromatase inhibitor monotherapy is approximately 14-16 months, compared to 24-27 months when combined with a CDK4/6 inhibitor.',
  followUp: 'Consider second-line options including fulvestrant plus a different CDK4/6 inhibitor, everolimus plus exemestane, or single-agent chemotherapy depending on disease burden and patient preferences.'
};

// Negative outcome node
const negativeOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_NEGATIVE,
  type: 'negative',
  title: 'Negative Treatment Outcome',
  content: 'The patient develops febrile neutropenia requiring hospitalization. Treatment must be discontinued due to recurrent severe toxicity, limiting future treatment options.',
  patientStatus: 'complicated',
  explanation: 'Failure to properly manage CDK4/6 inhibitor-associated neutropenia can lead to serious complications including febrile neutropenia, which carries significant morbidity and mortality risk. Additionally, premature discontinuation of effective therapy due to toxicity deprives the patient of potential clinical benefit and may lead to earlier disease progression.',
  followUp: 'After recovery, consider alternative treatment approaches such as fulvestrant plus everolimus, or single-agent chemotherapy. Close monitoring for infection and neutropenia recovery is essential.'
};

// Complete tree
const pfizerOncologyTree: DecisionTree = {
  id: 'pfizer_oncology_breast_cancer',
  title: 'HR+/HER2- Metastatic Breast Cancer Management',
  description: 'Clinical decision tree for managing hormone receptor-positive, HER2-negative metastatic breast cancer with CDK4/6 inhibitor therapy',
  rootNodeId: NODE_IDS.ROOT,
  nodes: [
    scenarioNode,
    firstDecisionNode,
    firstEducationalNode,
    secondDecisionNode,
    secondEducationalNode,
    positiveOutcomeNode,
    suboptimalOutcomeNode,
    negativeOutcomeNode
  ],
  metadata: {
    medicalCategory: 'oncology',
    treatmentFocus: 'breast_cancer',
    difficulty: 'intermediate',
    estimatedDuration: 600, // 10 minutes
    createdAt: new Date('2023-07-15'),
    updatedAt: new Date('2023-10-22'),
    associatedTreatments: ['CDK4/6 inhibitors', 'aromatase inhibitors', 'endocrine therapy']
  }
};

export default pfizerOncologyTree; 