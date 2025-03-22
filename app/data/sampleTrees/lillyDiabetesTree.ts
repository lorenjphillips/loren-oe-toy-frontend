/**
 * Sample Decision Tree for Eli Lilly Endocrinology
 * 
 * Clinical scenario for type 2 diabetes management
 * Featuring realistic decision points with educational content
 * Focusing on GLP-1 receptor agonists (Trulicity/dulaglutide)
 */

import { DecisionTree, ScenarioNode, DecisionNode, OutcomeNode, EducationalNode } from '../../services/decisionTreeService';

// Node IDs
const NODE_IDS = {
  ROOT: 'lilly_diabetes_001',
  DECISION_1: 'lilly_diabetes_002',
  EDUCATION_1: 'lilly_diabetes_003',
  DECISION_2: 'lilly_diabetes_004',
  EDUCATION_2: 'lilly_diabetes_005',
  OUTCOME_POSITIVE: 'lilly_diabetes_006',
  OUTCOME_SUBOPTIMAL: 'lilly_diabetes_007',
  OUTCOME_NEGATIVE: 'lilly_diabetes_008'
};

// Scenario node (root)
const scenarioNode: ScenarioNode = {
  id: NODE_IDS.ROOT,
  type: 'scenario',
  title: 'Uncontrolled Type 2 Diabetes Case',
  content: 'A 52-year-old female with a 7-year history of type 2 diabetes presents for routine follow-up. Her current regimen includes metformin 1000mg twice daily and glimepiride 4mg daily, but her glycemic control has worsened over the past 6 months.',
  patientInfo: {
    age: 52,
    gender: 'female',
    chiefComplaint: 'Routine follow-up for type 2 diabetes with worsening control',
    vitalSigns: {
      bloodPressure: '138/84',
      heartRate: 76,
      respiratoryRate: 16,
      temperature: 36.7,
      oxygenSaturation: 98
    },
    medicalHistory: [
      'Type 2 diabetes (7 years)',
      'Hypertension (5 years)',
      'Obesity (BMI 32.6)',
      'Dyslipidemia',
      'Non-alcoholic fatty liver disease'
    ],
    medications: [
      'Metformin 1000mg BID',
      'Glimepiride 4mg daily',
      'Lisinopril 10mg daily',
      'Atorvastatin 20mg daily'
    ],
    allergies: ['Penicillin'],
    labResults: [
      {
        name: 'HbA1c',
        value: '8.6',
        unit: '%',
        referenceRange: '4.0-5.6',
        isAbnormal: true
      },
      {
        name: 'Fasting Plasma Glucose',
        value: '168',
        unit: 'mg/dL',
        referenceRange: '70-99',
        isAbnormal: true
      },
      {
        name: 'Creatinine',
        value: '0.9',
        unit: 'mg/dL',
        referenceRange: '0.5-1.1',
        isAbnormal: false
      },
      {
        name: 'eGFR',
        value: '76',
        unit: 'mL/min/1.73m²',
        referenceRange: '>60',
        isAbnormal: false
      },
      {
        name: 'ALT',
        value: '45',
        unit: 'U/L',
        referenceRange: '7-35',
        isAbnormal: true
      },
      {
        name: 'Total Cholesterol',
        value: '185',
        unit: 'mg/dL',
        referenceRange: '<200',
        isAbnormal: false
      },
      {
        name: 'LDL',
        value: '105',
        unit: 'mg/dL',
        referenceRange: '<100',
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
  title: 'Treatment Intensification for Uncontrolled Type 2 Diabetes',
  content: 'The patient reports adequate medication adherence but admits to inconsistent dietary habits. She has experienced one episode of mild hypoglycemia in the past month. She is concerned about her worsening glycemic control and expresses willingness to improve her diabetes management.',
  question: 'What would be the most appropriate next step in managing this patient&apos;s diabetes?',
  options: [
    {
      id: 'increase_sulfonylurea',
      text: 'Increase glimepiride to 6mg daily',
      isCorrect: false,
      explanation: 'Increasing the sulfonylurea dose may temporarily improve glycemic control but carries increased risk of hypoglycemia. The patient is already on a moderately high dose, and further intensification of sulfonylurea therapy is unlikely to provide sustainable glycemic control. Additionally, the patient has already experienced hypoglycemia on the current dose.'
    },
    {
      id: 'add_glp1',
      text: 'Add a once-weekly GLP-1 receptor agonist (e.g., dulaglutide)',
      isCorrect: true,
      explanation: 'Adding a GLP-1 receptor agonist is an appropriate step for treatment intensification in this patient with inadequate control on metformin and a sulfonylurea. GLP-1 receptor agonists offer several advantages including significant HbA1c reduction, weight loss, low hypoglycemia risk, and potential cardiovascular benefits. A once-weekly formulation may improve adherence.'
    },
    {
      id: 'add_sglt2',
      text: 'Add an SGLT-2 inhibitor (e.g., empagliflozin)',
      isCorrect: false,
      explanation: 'While SGLT-2 inhibitors are an excellent option for many patients with type 2 diabetes, GLP-1 receptor agonists may be preferred in this patient with significantly elevated HbA1c (8.6%) due to their generally greater glucose-lowering efficacy. However, this would still be a reasonable alternative approach.'
    },
    {
      id: 'add_basal_insulin',
      text: 'Add basal insulin (e.g., insulin glargine)',
      isCorrect: false,
      explanation: 'While basal insulin is effective for glucose lowering, it is generally not preferred as the first injectable therapy in most patients unless there are specific indications such as very elevated HbA1c (>10%) or symptoms of significant hyperglycemia. Basal insulin carries higher risk of hypoglycemia and weight gain compared to GLP-1 receptor agonists.'
    }
  ],
  metadata: {
    decisionType: 'treatment',
    difficulty: 'intermediate'
  },
  children: [
    {
      targetId: NODE_IDS.EDUCATION_1,
      condition: 'add_glp1'
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'add_sglt2',
      probability: 0.6
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'increase_sulfonylurea',
      probability: 0.8
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'add_basal_insulin',
      probability: 0.7
    }
  ]
};

// First educational node about GLP-1 receptor agonists
const firstEducationalNode: EducationalNode = {
  id: NODE_IDS.EDUCATION_1,
  type: 'educational',
  title: 'GLP-1 Receptor Agonists in Type 2 Diabetes Management',
  content: 'GLP-1 receptor agonists have emerged as a cornerstone therapy for type 2 diabetes, offering multiple benefits beyond glycemic control.',
  treatmentInfo: {
    name: 'Dulaglutide (Trulicity)',
    mechanism: 'Dulaglutide is a long-acting glucagon-like peptide-1 (GLP-1) receptor agonist that binds to and activates the GLP-1 receptor. This action increases glucose-dependent insulin secretion, decreases glucagon secretion, slows gastric emptying, and promotes satiety, resulting in improved glycemic control and weight reduction.',
    indications: [
      'Adjunct to diet and exercise to improve glycemic control in adults with type 2 diabetes',
      'To reduce the risk of major adverse cardiovascular events in adults with type 2 diabetes and established cardiovascular disease or multiple cardiovascular risk factors'
    ],
    contraindications: [
      'Personal or family history of medullary thyroid carcinoma',
      'Multiple Endocrine Neoplasia syndrome type 2',
      'Prior serious hypersensitivity reaction to dulaglutide or product components'
    ],
    sideEffects: [
      'Gastrointestinal effects (nausea, vomiting, diarrhea) - most common, typically transient',
      'Injection site reactions',
      'Hypoglycemia (primarily when used with insulin or insulin secretagogues)',
      'Increased heart rate',
      'Acute pancreatitis (rare)',
      'Acute gallbladder disease (rare)'
    ],
    evidenceLevel: 'high'
  },
  references: [
    {
      citation: 'Gerstein HC, et al. Lancet. 2019;394(10193):121-130. REWIND Trial: Dulaglutide and cardiovascular outcomes in type 2 diabetes.',
      url: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)31149-3/fulltext'
    },
    {
      citation: 'American Diabetes Association. Diabetes Care. 2023;46(Supplement_1):S140-S157. Pharmacologic Approaches to Glycemic Treatment: Standards of Care in Diabetes.',
      url: 'https://diabetesjournals.org/care/article/46/Supplement_1/S140/148040/9-Pharmacologic-Approaches-to-Glycemic-Treatment'
    },
    {
      citation: 'Trulicity [package insert]. Indianapolis, IN: Eli Lilly and Company; 2022.',
      url: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/125469s045lbl.pdf'
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
  title: 'Management of Sulfonylurea Therapy After GLP-1 RA Initiation',
  content: 'You decide to add dulaglutide 0.75mg subcutaneously once weekly to the patient&apos;s regimen. The patient asks about continuing her glimepiride while starting the new medication.',
  question: 'What is the most appropriate approach to the patient&apos;s sulfonylurea therapy when initiating dulaglutide?',
  options: [
    {
      id: 'continue_same_dose',
      text: 'Continue glimepiride at the current dose of 4mg daily',
      isCorrect: false,
      explanation: 'Maintaining the full dose of sulfonylurea when adding a GLP-1 receptor agonist significantly increases the risk of hypoglycemia, particularly during the initial weeks of therapy. This patient has already experienced hypoglycemia on her current regimen, making this approach potentially unsafe.'
    },
    {
      id: 'reduce_dose',
      text: 'Reduce glimepiride to 2mg daily when initiating dulaglutide',
      isCorrect: true,
      explanation: 'Reducing the sulfonylurea dose by approximately 50% when adding a GLP-1 receptor agonist is a prudent approach that balances the risk of hypoglycemia with the need for glycemic control. This is particularly appropriate in a patient who has experienced previous hypoglycemia and has an HbA1c that is moderately elevated but not severely high.'
    },
    {
      id: 'discontinue_su',
      text: 'Discontinue glimepiride completely when starting dulaglutide',
      isCorrect: false,
      explanation: 'Complete discontinuation of sulfonylurea therapy would be overly cautious in this patient with an HbA1c of 8.6%. While it would minimize hypoglycemia risk, it might result in temporarily worse glycemic control during the initial titration of dulaglutide. This approach would be more appropriate for patients with only mild hyperglycemia or at very high risk of hypoglycemia.'
    },
    {
      id: 'delay_glp1',
      text: 'Delay initiation of dulaglutide until glimepiride can be gradually tapered',
      isCorrect: false,
      explanation: 'Delaying the initiation of more effective therapy unnecessarily prolongs the patient&apos;s exposure to poor glycemic control. A concurrent reduction in sulfonylurea dose is generally preferred over sequential therapy changes for treatment intensification in this scenario.'
    }
  ],
  metadata: {
    decisionType: 'treatment',
    difficulty: 'intermediate'
  },
  children: [
    {
      targetId: NODE_IDS.EDUCATION_2,
      condition: 'reduce_dose'
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'continue_same_dose',
      probability: 0.9
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'discontinue_su',
      probability: 0.6
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'delay_glp1',
      probability: 0.8
    }
  ]
};

// Second educational node about combination therapy
const secondEducationalNode: EducationalNode = {
  id: NODE_IDS.EDUCATION_2,
  type: 'educational',
  title: 'Optimizing Combination Therapy in Type 2 Diabetes',
  content: 'Combination therapy is often necessary to achieve glycemic targets in type 2 diabetes, but careful medication adjustment is required to balance efficacy and safety.',
  treatmentInfo: {
    name: 'GLP-1 RA and Sulfonylurea Combination',
    mechanism: 'GLP-1 receptor agonists and sulfonylureas both enhance insulin secretion but through different and complementary mechanisms. GLP-1 RAs stimulate glucose-dependent insulin secretion (reducing hypoglycemia risk), while sulfonylureas stimulate insulin secretion regardless of glucose levels (increasing hypoglycemia risk).',
    indications: [
      'Inadequate glycemic control on metformin plus sulfonylurea therapy',
      'Need for significant HbA1c reduction without initiating insulin therapy',
      'Patients who may benefit from the weight loss and cardiovascular benefits of GLP-1 RAs'
    ],
    contraindications: [
      'History of severe or frequent hypoglycemia',
      'Significant renal impairment (eGFR <45 mL/min for most sulfonylureas)',
      'Conditions that predispose to severe hypoglycemia (elderly, irregular meals, alcohol use)'
    ],
    sideEffects: [
      'Increased risk of hypoglycemia (primarily from sulfonylurea component)',
      'Gastrointestinal side effects (primarily from GLP-1 RA component)',
      'Weight effects: GLP-1 RAs promote weight loss while sulfonylureas may cause weight gain',
      'Potential for QTc prolongation with some sulfonylureas'
    ],
    evidenceLevel: 'moderate'
  },
  references: [
    {
      citation: 'Nauck MA, et al. Diabetes Care. 2016;39(10):1693-1701. Incretin-based therapies and the risk of pancreatic adverse events in the LEADER, SUSTAIN-6, and REWIND cardiovascular outcomes trials.',
      url: 'https://care.diabetesjournals.org/content/39/10/1693'
    },
    {
      citation: 'Garber AJ, et al. Endocr Pract. 2020;26(1):107-139. AACE/ACE comprehensive type 2 diabetes management algorithm.',
      url: 'https://www.endocrinepractice.org/article/S1530-891X(19)30268-5/fulltext'
    }
  ],
  isSponsoredContent: true,
  children: [
    {
      targetId: NODE_IDS.OUTCOME_POSITIVE
    }
  ]
};

// Positive outcome node
const positiveOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_POSITIVE,
  type: 'outcome',
  outcomeType: 'positive',
  title: 'Optimal Treatment Outcome',
  content: 'At 3-month follow-up, the patient reports good adherence to once-weekly dulaglutide injections and reduced-dose glimepiride. She notes decreased appetite and a 4-kg weight loss. Her HbA1c has improved to 7.1%, and she has experienced no episodes of hypoglycemia.',
  patientStatus: 'improved',
  explanation: 'The addition of a GLP-1 receptor agonist with appropriate adjustment of sulfonylurea dosing represents guideline-concordant, evidence-based care for this patient. The significant improvement in glycemic control, weight reduction, and absence of hypoglycemia demonstrates successful treatment intensification. Studies such as the AWARD series of clinical trials have demonstrated the efficacy of dulaglutide in lowering HbA1c when added to existing oral antihyperglycemic medications.',
  followUp: 'Continue the current regimen with monitoring of HbA1c every 3-6 months. Consider further reduction or discontinuation of sulfonylurea if HbA1c continues to improve. Reinforce lifestyle modifications and provide education on signs/symptoms of hypoglycemia. Consider future addition of SGLT-2 inhibitor if additional glycemic control or cardiorenal benefits are desired.'
};

// Suboptimal outcome node
const suboptimalOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_SUBOPTIMAL,
  type: 'outcome',
  outcomeType: 'neutral',
  title: 'Suboptimal Treatment Outcome',
  content: 'At 3-month follow-up, the patient&apos;s HbA1c has improved modestly to 7.9%, but remains above target. She has experienced mild gastrointestinal side effects from therapy and has lost only 1 kg of weight.',
  patientStatus: 'unchanged',
  explanation: 'The chosen treatment approach provided some benefit but failed to achieve optimal glycemic control. Suboptimal responses to GLP-1 receptor agonist therapy may result from inadequate dosing, poor adherence due to side effects, or the need for additional antihyperglycemic agents. The moderate improvement in HbA1c suggests some efficacy but indicates the need for treatment adjustment.',
  followUp: 'Consider uptitration of dulaglutide to 1.5mg weekly if tolerated. Evaluate adherence to medication and lifestyle modifications. Add an SGLT-2 inhibitor if no contraindications exist. Provide strategies for managing GI side effects. If glycemic control remains inadequate after these adjustments, consider transitioning to basal insulin therapy.'
};

// Negative outcome node
const negativeOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_NEGATIVE,
  type: 'outcome',
  outcomeType: 'negative',
  title: 'Negative Treatment Outcome',
  content: 'The patient experiences several episodes of symptomatic hypoglycemia requiring assistance. She becomes fearful of taking her medications and reduces doses on her own, resulting in worsening glycemic control with HbA1c rising to 9.2%.',
  patientStatus: 'worsened',
  explanation: 'Failure to appropriately adjust sulfonylurea dosing when adding a GLP-1 receptor agonist significantly increases hypoglycemia risk. This adverse outcome demonstrates the importance of medication adjustment during treatment intensification. The resulting fear of hypoglycemia has led to nonadherence and worsened glycemic control, illustrating how safety concerns can undermine therapeutic efficacy.',
  followUp: 'Discontinue glimepiride and restart dulaglutide at 0.75mg weekly. Consider adding an SGLT-2 inhibitor after stabilization if additional glycemic control is needed. Provide comprehensive education on hypoglycemia prevention, recognition, and management. Schedule close follow-up to rebuild treatment confidence and adjust therapy as needed.'
};

// Complete tree
const lillyDiabetesTree: DecisionTree = {
  id: 'lilly_diabetes_type2_management',
  title: 'Type 2 Diabetes Management with GLP-1 RA',
  description: 'Clinical decision tree for managing uncontrolled type 2 diabetes with GLP-1 receptor agonist therapy',
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
    medicalCategory: 'endocrinology',
    treatmentFocus: 'diabetes',
    difficulty: 'intermediate',
    estimatedDuration: 570, // 9.5 minutes
    createdAt: new Date('2023-09-05'),
    updatedAt: new Date('2023-11-15'),
    associatedTreatments: ['GLP-1 receptor agonists', 'dulaglutide', 'sulfonylureas', 'metformin']
  }
};

export default lillyDiabetesTree; 