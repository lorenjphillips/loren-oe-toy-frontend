/**
 * Educational Content Database
 * 
 * Contains mock data for educational content in microsimulations.
 * This includes treatment descriptions, clinical trial results,
 * prescribing information, and mechanism of action descriptions.
 */

import { EducationalContent } from '../models/microsimulation';
import { AdCompany } from '../models/adTypes';

// Mock companies (simplified)
const COMPANIES = {
  PHARMEX: {
    id: 'pharmex',
    name: 'PharmEx Laboratories',
    category: 'pharmaceutical'
  },
  MEDICORE: {
    id: 'medicore',
    name: 'MediCore Sciences',
    category: 'pharmaceutical'
  },
  NOVABIO: {
    id: 'novabio',
    name: 'NovaBio Therapeutics',
    category: 'pharmaceutical'
  },
  GENTECH: {
    id: 'gentech',
    name: 'GenTech Pharmaceuticals',
    category: 'pharmaceutical'
  }
} as const;

// Mock treatment IDs (simplified)
const TREATMENTS = {
  // Cardiovascular
  CARDIOSTAT: 'cardiostat',
  VASOREGUL: 'vasoregul',
  THROMBEND: 'thrombend',
  LIPIDCLEAR: 'lipidclear',
  
  // Neurology
  NEUROTIDE: 'neurotide',
  SEIZECALM: 'seizecalm',
  MIGRARELIEF: 'migrarelief',
  
  // Endocrinology
  GLUCOBALANCE: 'glucobalance',
  INSULEGEN: 'insulegen',
  THYRONORM: 'thyronorm',
  
  // Respiratory
  BRONCHODIL: 'bronchodil',
  ASTHMAVENT: 'asthmavent',
  PULMOFIX: 'pulmofix'
} as const;

// Educational content database
export const educationalContentData: EducationalContent[] = [
  // Cardiovascular treatments - Cardiostat (ACE inhibitor)
  {
    id: 'cardiostat_overview',
    title: 'Cardiostat: Clinical Overview',
    type: 'text',
    content: `Cardiostat is an angiotensin-converting enzyme (ACE) inhibitor indicated for the treatment of hypertension, heart failure, 
    and post-myocardial infarction left ventricular dysfunction. By inhibiting the conversion of angiotensin I to angiotensin II, 
    Cardiostat reduces vasoconstriction and sodium retention, leading to decreased blood pressure and reduced cardiac workload.`,
    source: 'PharmEx Prescribing Information',
    relevance: 'Essential background for cardiovascular treatment decisions',
    displayTiming: 'pre',
    associatedTreatmentIds: [TREATMENTS.CARDIOSTAT],
    companyId: COMPANIES.PHARMEX.id
  },
  {
    id: 'cardiostat_moa',
    title: 'Mechanism of Action: Cardiostat',
    type: 'image',
    content: '/images/education/cardiostat_moa.svg',
    source: 'PharmEx Medical Affairs',
    relevance: 'Visual explanation of pharmacological mechanism',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.CARDIOSTAT],
    companyId: COMPANIES.PHARMEX.id
  },
  {
    id: 'cardiostat_trials',
    title: 'Cardiostat: Clinical Evidence Summary',
    type: 'text',
    content: `The HEART-PROTECT trial (N=10,429) demonstrated a 21% relative risk reduction in cardiovascular mortality (HR 0.79, 95% CI 0.71-0.89, p<0.001) 
    and a 17% reduction in hospitalization for heart failure (p<0.01) compared to placebo over 4.5 years. 
    The PRESSURE-CONTROL study (N=2,084) showed an average systolic BP reduction of 12.3 mmHg (±3.2) and diastolic reduction of 8.1 mmHg (±2.4) 
    at 12 weeks compared to 7.2/4.9 mmHg with standard therapy (p<0.001 for both comparisons).`,
    source: 'New England Journal of Medicine, 2019;381:1442-52',
    relevance: 'Evidence-based outcomes for clinical decision making',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.CARDIOSTAT],
    companyId: COMPANIES.PHARMEX.id
  },
  {
    id: 'cardiostat_prescribing',
    title: 'Cardiostat: Prescribing Information',
    type: 'text',
    content: `Initial Dosing: 10mg once daily. Titrate at 2-week intervals to target dose of 40mg daily.
    Contraindications: Pregnancy, history of angioedema, concomitant aliskiren in diabetic patients.
    Common Adverse Events: Cough (11%), dizziness (7%), hypotension in volume-depleted patients (4%).
    Monitoring: Baseline and periodic monitoring of renal function and potassium levels recommended.`,
    source: 'PharmEx Laboratories, revised 01/2023',
    relevance: 'Critical information for safe prescribing',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.CARDIOSTAT],
    companyId: COMPANIES.PHARMEX.id
  },

  // Vasoregul (Calcium Channel Blocker)
  {
    id: 'vasoregul_overview',
    title: 'Vasoregul: Clinical Overview',
    type: 'text',
    content: `Vasoregul is a dihydropyridine calcium channel blocker (CCB) that selectively blocks L-type calcium channels in vascular smooth muscle, 
    causing vasodilation. It is indicated for hypertension, chronic stable angina, and vasospastic angina. Vasoregul demonstrates high vascular 
    selectivity with minimal negative inotropic effects on cardiac muscle.`,
    source: 'MediCore Sciences, Medical Information',
    relevance: 'Foundation for understanding CCB treatment approach',
    displayTiming: 'pre',
    associatedTreatmentIds: [TREATMENTS.VASOREGUL],
    companyId: COMPANIES.MEDICORE.id
  },
  {
    id: 'vasoregul_moa',
    title: 'Mechanism of Action: Vasoregul',
    type: 'video',
    content: '/videos/education/vasoregul_moa.mp4',
    source: 'MediCore Medical Education',
    relevance: 'Dynamic visualization of vasodilation mechanism',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.VASOREGUL],
    companyId: COMPANIES.MEDICORE.id
  },
  {
    id: 'vasoregul_trials',
    title: 'Vasoregul: Evidence from Clinical Trials',
    type: 'text',
    content: `The VESSEL trial (N=4,782) demonstrated non-inferiority to ACE inhibitors for blood pressure control with mean reductions of 
    15.2/9.1 mmHg versus 14.8/8.9 mmHg at 24 weeks (p<0.001 for non-inferiority). The ANGIO-PREVENT study (N=1,876) showed a 24% 
    reduction in angina episodes (p<0.01) and 33% improvement in exercise tolerance compared to baseline (p<0.001). Safety analysis showed 
    lower incidence of cough (1.2% vs 8.4%) but higher rates of peripheral edema (9.1% vs 2.3%) compared to ACE inhibitors.`,
    source: 'Hypertension. 2021;76:542-51; Am J Cardiol. 2020;125:1210-18',
    relevance: 'Comparative evidence for treatment selection',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.VASOREGUL, TREATMENTS.CARDIOSTAT],
    companyId: COMPANIES.MEDICORE.id
  },

  // Glucobalance (SGLT2 Inhibitor)
  {
    id: 'glucobalance_overview',
    title: 'Glucobalance: Clinical Overview',
    type: 'text',
    content: `Glucobalance is a sodium-glucose cotransporter-2 (SGLT2) inhibitor that reduces renal glucose reabsorption, 
    increasing urinary glucose excretion. It is indicated for improving glycemic control in adults with type 2 diabetes 
    and has demonstrated cardiovascular and renal benefits independent of glycemic effects.`,
    source: 'NovaBio Therapeutics, Product Monograph',
    relevance: 'Essential background for diabetic treatment decisions',
    displayTiming: 'pre',
    associatedTreatmentIds: [TREATMENTS.GLUCOBALANCE],
    companyId: COMPANIES.NOVABIO.id
  },
  {
    id: 'glucobalance_moa',
    title: 'Mechanism of Action: Glucobalance',
    type: 'image',
    content: '/images/education/glucobalance_moa.svg',
    source: 'NovaBio Scientific Affairs',
    relevance: 'Visual explanation of renal glucose handling',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.GLUCOBALANCE],
    companyId: COMPANIES.NOVABIO.id
  },
  {
    id: 'glucobalance_trials',
    title: 'Glucobalance: Clinical Evidence',
    type: 'text',
    content: `The GLUCO-OUTCOMES trial (N=8,246) demonstrated a 32% relative risk reduction in composite renal outcomes (HR 0.68, 95% CI 0.59-0.78, p<0.001) 
    and a 14% reduction in major adverse cardiovascular events (p=0.023) independent of glycemic control. Mean HbA1c reduction was 0.76% at 52 weeks 
    compared to 0.31% with placebo (p<0.001). Weight reduction averaged 2.7kg vs 0.3kg with placebo (p<0.001).`,
    source: 'JAMA. 2022;327(24):2385-2397',
    relevance: 'Evidence for cardiorenal protective effects',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.GLUCOBALANCE],
    companyId: COMPANIES.NOVABIO.id
  },

  // Treatment comparisons
  {
    id: 'hypertension_comparison',
    title: 'Comparative Efficacy in Hypertension Management',
    type: 'text',
    content: `Comparative Analysis:
    - ACE Inhibitors (Cardiostat): Average SBP/DBP reduction 12-14/8-10 mmHg; beneficial in heart failure, post-MI, diabetic nephropathy
    - Calcium Channel Blockers (Vasoregul): Average SBP/DBP reduction 13-15/8-10 mmHg; beneficial in isolated systolic hypertension, angina
    
    Safety Considerations:
    - ACE Inhibitors: Cough (5-20%), hyperkalemia, angioedema (rare)
    - CCBs: Peripheral edema (5-10%), flushing, constipation
    
    Cost Considerations:
    - ACE Inhibitors: Most available as generics, lower overall cost
    - CCBs: Recent generic availability, moderate cost`,
    source: 'JNC 8 Guidelines; Comparative Analysis, Cardiology Today 2023',
    relevance: 'Direct comparison for clinical decision making',
    displayTiming: 'during',
    associatedTreatmentIds: [TREATMENTS.CARDIOSTAT, TREATMENTS.VASOREGUL],
    associatedDecisionIds: ['decision_htn_treatment_selection']
  },

  // General educational content
  {
    id: 'cv_risk_stratification',
    title: 'Cardiovascular Risk Stratification: Best Practices',
    type: 'text',
    content: `Current cardiovascular risk stratification approaches incorporate traditional risk factors (age, gender, smoking, cholesterol, blood pressure, diabetes) 
    with newer markers (hsCRP, coronary calcium score, family history of premature ASCVD). The 2023 ACC/AHA Risk Assessment Guidelines recommend:
    1. ASCVD Pooled Cohort Equations for initial assessment in asymptomatic adults
    2. Consider risk enhancers in borderline/intermediate risk patients
    3. Coronary artery calcium scoring for further risk stratification in selected cases`,
    source: 'ACC/AHA Guidelines, J Am Coll Cardiol. 2023;81:e21-e43',
    relevance: 'Foundation for preventive cardiovascular decisions',
    displayTiming: 'pre',
    associatedDecisionIds: ['decision_cv_risk_assessment']
  },
  
  {
    id: 'diabetes_treatment_algorithm',
    title: 'Type 2 Diabetes Management: Current Algorithm',
    type: 'pdf',
    content: '/pdfs/education/t2dm_algorithm_2023.pdf',
    source: 'American Diabetes Association, Standards of Care in Diabetes—2023',
    relevance: 'Evidence-based treatment pathway',
    displayTiming: 'pre',
    associatedDecisionIds: ['decision_diabetes_treatment'],
    associatedTreatmentIds: [TREATMENTS.GLUCOBALANCE, TREATMENTS.INSULEGEN]
  },

  // Company-specific content
  {
    id: 'pharmex_pipeline',
    title: 'PharmEx Cardiovascular Pipeline',
    type: 'link',
    content: 'https://www.pharmex.com/pipeline',
    source: 'PharmEx Corporate Information',
    relevance: 'Information on emerging treatment options',
    displayTiming: 'post',
    companyId: COMPANIES.PHARMEX.id
  },
  {
    id: 'medicore_support',
    title: 'MediCore Patient Support Programs',
    type: 'link',
    content: 'https://www.medicore.com/support',
    source: 'MediCore Healthcare Provider Resources',
    relevance: 'Resources for patient assistance',
    displayTiming: 'post',
    companyId: COMPANIES.MEDICORE.id
  }
];

// Export treatment and company constants for use elsewhere
export const EDUCATIONAL_TREATMENTS = TREATMENTS;
export const EDUCATIONAL_COMPANIES = COMPANIES; 