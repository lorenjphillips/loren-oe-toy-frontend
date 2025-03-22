/**
 * Sample Decision Tree for Genentech Ophthalmology
 * 
 * Clinical scenario for age-related macular degeneration treatment
 * Featuring realistic decision points with educational content
 * Focusing on anti-VEGF therapy (Lucentis/ranibizumab)
 */

import { DecisionTree, ScenarioNode, DecisionNode, OutcomeNode, EducationalNode } from '../../services/decisionTreeService';

// Node IDs
const NODE_IDS = {
  ROOT: 'genentech_ophth_001',
  DECISION_1: 'genentech_ophth_002',
  EDUCATION_1: 'genentech_ophth_003',
  DECISION_2: 'genentech_ophth_004',
  EDUCATION_2: 'genentech_ophth_005',
  OUTCOME_POSITIVE: 'genentech_ophth_006',
  OUTCOME_SUBOPTIMAL: 'genentech_ophth_007',
  OUTCOME_NEGATIVE: 'genentech_ophth_008'
};

// Scenario node (root)
const scenarioNode: ScenarioNode = {
  id: NODE_IDS.ROOT,
  type: 'scenario',
  title: 'Wet Age-Related Macular Degeneration Case',
  content: 'A 78-year-old male patient presents with sudden onset of central vision distortion in the right eye over the past week. He has a history of dry AMD in both eyes for 5 years.',
  patientInfo: {
    age: 78,
    gender: 'male',
    chiefComplaint: 'Central vision distortion in right eye, onset 1 week ago',
    vitalSigns: {
      bloodPressure: '142/85',
      heartRate: 72,
      respiratoryRate: 15,
      temperature: 36.6,
      oxygenSaturation: 97
    },
    medicalHistory: [
      'Dry AMD in both eyes (5 years)',
      'Hypertension (15 years)',
      'Hyperlipidemia',
      'Coronary artery disease with stent placement (6 years ago)',
      'Cataract surgery in both eyes (3 years ago)'
    ],
    medications: [
      'Atorvastatin 20mg daily',
      'Lisinopril 10mg daily',
      'Aspirin 81mg daily',
      'Clopidogrel 75mg daily',
      'AREDS2 eye vitamin supplement daily'
    ],
    allergies: ['Sulfa drugs'],
    labResults: []
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
  title: 'Diagnostic Approach for Suspected Wet AMD',
  content: 'The patient has visual acuity of 20/80 in the right eye and 20/40 in the left eye. Fundus examination of the right eye reveals a grayish elevation in the macula with surrounding small hemorrhages. OCT shows subretinal fluid and macular thickening.',
  question: 'What is the most appropriate next step in management?',
  options: [
    {
      id: 'continue_observation',
      text: 'Continue observation with AREDS2 supplements and reevaluate in 3 months',
      isCorrect: false,
      explanation: 'Observation alone is inappropriate for suspected wet AMD with active subretinal fluid. Prompt treatment is necessary to prevent permanent vision loss.'
    },
    {
      id: 'fluorescein_angiography',
      text: 'Perform fluorescein angiography (FA) to confirm the diagnosis of wet AMD',
      isCorrect: true,
      explanation: 'Fluorescein angiography remains an important diagnostic tool to confirm the presence and pattern of choroidal neovascularization in wet AMD, which will guide treatment decisions.'
    },
    {
      id: 'immediate_anti_vegf',
      text: 'Proceed directly to anti-VEGF injection without additional testing',
      isCorrect: false,
      explanation: 'While OCT findings are suggestive of wet AMD, fluorescein angiography is recommended to confirm the diagnosis and characterize the lesion before initiating treatment, especially for the first presentation.'
    },
    {
      id: 'laser_photocoagulation',
      text: 'Consider laser photocoagulation therapy',
      isCorrect: false,
      explanation: 'Thermal laser photocoagulation is rarely used in modern management of wet AMD due to collateral damage to the retina and has been largely replaced by anti-VEGF therapy, especially for subfoveal lesions.'
    }
  ],
  metadata: {
    decisionType: 'diagnostic',
    difficulty: 'intermediate'
  },
  children: [
    {
      targetId: NODE_IDS.EDUCATION_1,
      condition: 'fluorescein_angiography'
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'continue_observation',
      probability: 0.9
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'immediate_anti_vegf',
      probability: 0.7
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'laser_photocoagulation',
      probability: 0.9
    }
  ]
};

// First educational node about AMD diagnosis
const firstEducationalNode: EducationalNode = {
  id: NODE_IDS.EDUCATION_1,
  type: 'educational',
  title: 'Diagnostic Approaches in Wet AMD',
  content: 'Multimodal imaging is essential for accurate diagnosis and treatment planning in neovascular (wet) AMD.',
  treatmentInfo: {
    name: 'Fluorescein Angiography',
    mechanism: 'Intravenous fluorescein dye is injected and sequential photographs document the pattern of dye filling and leakage in retinal and choroidal vessels, revealing the presence and characteristics of choroidal neovascularization (CNV).',
    indications: [
      'Initial diagnosis of suspected wet AMD',
      'Characterization of CNV lesion type (classic, occult, mixed)',
      'Assessment of disease activity when clinical examination and OCT findings are inconclusive',
      'Evaluation of treatment response in select cases'
    ],
    contraindications: [
      'Allergy to fluorescein dye',
      'Severe renal impairment',
      'Pregnancy (relative contraindication)'
    ],
    sideEffects: [
      'Temporary yellowish discoloration of skin and urine',
      'Nausea (10% of patients)',
      'Vomiting (1-2% of patients)',
      'Allergic reactions (rare)',
      'Anaphylaxis (extremely rare, ~1:200,000)'
    ],
    evidenceLevel: 'high'
  },
  references: [
    {
      citation: 'Holz FG, et al. Ophthalmology. 2018;125(4):522-528. The Evolution of Imaging and Diagnostic Testing in Age-Related Macular Degeneration.',
      url: 'https://www.aaojournal.org/article/S0161-6420(17)32261-5/fulltext'
    },
    {
      citation: 'American Academy of Ophthalmology. Preferred Practice Pattern Guidelines: Age-Related Macular Degeneration. 2019.',
      url: 'https://www.aao.org/preferred-practice-pattern/age-related-macular-degeneration-ppp'
    }
  ],
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
  title: 'Treatment Selection for Wet AMD',
  content: 'Fluorescein angiography confirms predominantly classic choroidal neovascularization in the right eye. The patient is eager to start treatment to preserve his vision.',
  question: 'Which anti-VEGF treatment regimen would be most appropriate for this patient?',
  options: [
    {
      id: 'ranibizumab_monthly',
      text: 'Ranibizumab (Lucentis) 0.5 mg monthly for 3 months, then PRN based on disease activity',
      isCorrect: true,
      explanation: 'Ranibizumab is FDA-approved for wet AMD and has demonstrated efficacy in multiple clinical trials. A loading phase of 3 monthly injections followed by PRN dosing based on disease activity is a well-established treatment protocol that balances efficacy and treatment burden.'
    },
    {
      id: 'bevacizumab_monthly',
      text: 'Bevacizumab (Avastin) 1.25 mg monthly for 3 months, then PRN based on disease activity',
      isCorrect: false,
      explanation: 'While bevacizumab is commonly used off-label for wet AMD with similar efficacy to ranibizumab and lower cost, it is not FDA-approved for ocular use and has a slightly different safety profile. It is a reasonable alternative but not necessarily the first choice, especially in patients with cardiovascular risk factors.'
    },
    {
      id: 'aflibercept_bimonthly',
      text: 'Aflibercept (Eylea) 2.0 mg monthly for 3 months, then every 2 months',
      isCorrect: false,
      explanation: 'Aflibercept is FDA-approved for wet AMD with a potential advantage of less frequent dosing after the loading phase. However, bimonthly fixed dosing may not be optimal for all patients, and some may require more frequent monitoring.'
    },
    {
      id: 'pdt_anti_vegf',
      text: 'Combination therapy with photodynamic therapy (PDT) and ranibizumab',
      isCorrect: false,
      explanation: 'Combination therapy with PDT and anti-VEGF has not demonstrated clear superior efficacy compared to anti-VEGF monotherapy in most patients with wet AMD, and it adds treatment complexity, cost, and potential adverse events.'
    }
  ],
  metadata: {
    decisionType: 'treatment',
    difficulty: 'intermediate'
  },
  children: [
    {
      targetId: NODE_IDS.EDUCATION_2,
      condition: 'ranibizumab_monthly'
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'bevacizumab_monthly',
      probability: 0.6
    },
    {
      targetId: NODE_IDS.OUTCOME_SUBOPTIMAL,
      condition: 'aflibercept_bimonthly',
      probability: 0.5
    },
    {
      targetId: NODE_IDS.OUTCOME_NEGATIVE,
      condition: 'pdt_anti_vegf',
      probability: 0.7
    }
  ]
};

// Second educational node about anti-VEGF therapy
const secondEducationalNode: EducationalNode = {
  id: NODE_IDS.EDUCATION_2,
  type: 'educational',
  title: 'Anti-VEGF Therapy for Wet AMD',
  content: 'Anti-VEGF therapy has revolutionized the treatment of neovascular (wet) AMD and is now the standard of care.',
  treatmentInfo: {
    name: 'Ranibizumab (Lucentis)',
    mechanism: 'Ranibizumab is a recombinant humanized monoclonal antibody fragment (Fab) that neutralizes all active forms of vascular endothelial growth factor A (VEGF-A), preventing binding to VEGF receptors and thereby inhibiting neovascularization and vascular leakage.',
    indications: [
      'Neovascular (wet) age-related macular degeneration',
      'Macular edema following retinal vein occlusion',
      'Diabetic macular edema',
      'Diabetic retinopathy',
      'Myopic choroidal neovascularization'
    ],
    contraindications: [
      'Ocular or periocular infection',
      'Active intraocular inflammation',
      'Hypersensitivity to ranibizumab or any component of the formulation'
    ],
    sideEffects: [
      'Intravitreal injection-related adverse events (eye pain, vitreous floaters, conjunctival hemorrhage)',
      'Intraocular inflammation',
      'Increased intraocular pressure',
      'Endophthalmitis (rare)',
      'Retinal detachment (rare)',
      'Arterial thromboembolic events (theoretical risk, but not clearly associated in clinical trials)'
    ],
    evidenceLevel: 'high'
  },
  references: [
    {
      citation: 'Rosenfeld PJ, et al. N Engl J Med. 2006;355(14):1419-1431. MARINA Trial: Ranibizumab for neovascular age-related macular degeneration.',
      url: 'https://www.nejm.org/doi/full/10.1056/nejmoa054481'
    },
    {
      citation: 'Brown DM, et al. N Engl J Med. 2006;355(14):1432-1444. ANCHOR Trial: Ranibizumab versus verteporfin for neovascular age-related macular degeneration.',
      url: 'https://www.nejm.org/doi/full/10.1056/nejmoa062655'
    },
    {
      citation: 'Lucentis [package insert]. South San Francisco, CA: Genentech, Inc.; 2022.',
      url: 'https://www.gene.com/download/pdf/lucentis_prescribing.pdf'
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
  content: 'After three monthly ranibizumab injections, the patient reports substantial improvement in visual distortion. Visual acuity improves to 20/40 in the right eye, and OCT shows resolution of subretinal fluid.',
  patientStatus: 'improved',
  explanation: 'Prompt diagnosis with appropriate imaging followed by timely initiation of anti-VEGF therapy resulted in successful control of choroidal neovascularization and preservation of vision. The MARINA and ANCHOR trials demonstrated that ranibizumab not only prevents vision loss but can improve visual acuity in patients with wet AMD when administered appropriately.',
  followUp: 'Continue monitoring with monthly OCT scans and visual acuity assessment. Administer additional ranibizumab injections as needed based on disease activity (PRN regimen). Maintain AREDS2 supplementation for dry AMD in the fellow eye and counsel on home monitoring with Amsler grid.'
};

// Suboptimal outcome node
const suboptimalOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_SUBOPTIMAL,
  type: 'outcome',
  outcomeType: 'neutral',
  title: 'Suboptimal Treatment Outcome',
  content: 'After treatment, the patient experiences partial improvement in symptoms. Visual acuity stabilizes at 20/60 in the right eye, but OCT shows persistent subretinal fluid. The patient requires frequent injections to maintain this status.',
  patientStatus: 'unchanged',
  explanation: 'While the chosen treatment partially controlled the neovascular lesion and prevented further vision loss, the incomplete response suggests that the treatment regimen may not be optimal for this patient. Factors such as delayed treatment initiation, suboptimal agent selection, or inadequate treatment frequency can contribute to suboptimal outcomes in wet AMD.',
  followUp: 'Consider switching to an alternative anti-VEGF agent (e.g., aflibercept) with potentially longer duration of action. Reevaluate with fluorescein angiography to assess for lesion characteristics that may explain incomplete response. Maintain monthly monitoring and injections until disease stability is achieved.'
};

// Negative outcome node
const negativeOutcomeNode: OutcomeNode = {
  id: NODE_IDS.OUTCOME_NEGATIVE,
  type: 'outcome',
  outcomeType: 'negative',
  title: 'Negative Treatment Outcome',
  content: 'The patient experiences progressive vision loss despite treatment attempts. Visual acuity deteriorates to 20/200 in the right eye, and OCT shows development of a disciform scar.',
  patientStatus: 'worsened',
  explanation: 'Delayed diagnosis or inappropriate management of wet AMD allows for continued growth of choroidal neovascularization and irreversible damage to the retina. Once a disciform scar forms, vision loss becomes permanent and cannot be reversed with anti-VEGF therapy. This underscores the importance of early diagnosis and prompt, appropriate treatment.',
  followUp: 'Refer for low vision rehabilitation services. Continue AREDS2 supplementation to reduce risk of progression in the fellow eye. Emphasize importance of regular monitoring and home Amsler grid testing for the left eye to detect any early signs of conversion to wet AMD.'
};

// Complete tree
const genentechOphthalmologyTree: DecisionTree = {
  id: 'genentech_ophthalmology_wet_amd',
  title: 'Wet Age-Related Macular Degeneration Management',
  description: 'Clinical decision tree for diagnosing and managing neovascular (wet) age-related macular degeneration with anti-VEGF therapy',
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
    medicalCategory: 'ophthalmology',
    treatmentFocus: 'macular_degeneration',
    difficulty: 'intermediate',
    estimatedDuration: 540, // 9 minutes
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2023-11-05'),
    associatedTreatments: ['anti-VEGF therapy', 'ranibizumab', 'diagnostic imaging']
  }
};

export default genentechOphthalmologyTree; 