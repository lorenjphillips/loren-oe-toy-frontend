/**
 * Sample Clinical Study Data
 * 
 * Contains sample studies organized by treatment category
 * for use in clinical decision support.
 */

import { ClinicalEvidence, EvidenceLevel } from '../../models/phase4';

/**
 * Sample clinical studies for various medical categories
 */
export const studies: ClinicalEvidence[] = [
  // Cardiovascular Studies
  {
    id: 'cv-study-001',
    title: 'Comparative Effectiveness of Oral Anticoagulants in Atrial Fibrillation',
    source: 'Journal of the American College of Cardiology',
    publicationDate: new Date('2023-06-15'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/cv-001',
    summary: 'This systematic review compared the effectiveness and safety of direct oral anticoagulants versus warfarin in patients with atrial fibrillation. Results showed reduced risk of stroke and systemic embolism with similar or reduced bleeding risk.',
    tags: ['cardiovascular', 'atrial fibrillation', 'anticoagulant', 'pharmacological']
  },
  {
    id: 'cv-study-002',
    title: 'Long-term Outcomes of Statin Therapy in Primary Prevention',
    source: 'New England Journal of Medicine',
    publicationDate: new Date('2023-03-22'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/cv-002',
    summary: 'This 10-year follow-up study assessed long-term outcomes of statin therapy for primary prevention of cardiovascular events. Results demonstrated sustained risk reduction for major cardiovascular events with minimal long-term adverse effects.',
    tags: ['cardiovascular', 'statins', 'primary prevention', 'pharmacological']
  },
  
  // Oncology Studies
  {
    id: 'onc-study-001',
    title: 'Immunotherapy plus Chemotherapy in Advanced Non-Small-Cell Lung Cancer',
    source: 'The Lancet Oncology',
    publicationDate: new Date('2023-05-10'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/onc-001',
    summary: 'This phase 3 randomized trial evaluated combination immunotherapy plus chemotherapy versus chemotherapy alone in previously untreated metastatic non-small-cell lung cancer. The combination improved overall survival and progression-free survival.',
    tags: ['oncology', 'lung cancer', 'immunotherapy', 'chemotherapy', 'pharmacological']
  },
  {
    id: 'onc-study-002',
    title: 'Surgical Margins in Breast-Conserving Surgery: Meta-analysis',
    source: 'Journal of Clinical Oncology',
    publicationDate: new Date('2022-11-18'),
    evidenceLevel: EvidenceLevel.META_ANALYSIS,
    url: 'https://example.org/studies/onc-002',
    summary: 'This meta-analysis evaluated the association between surgical margin width and local recurrence in breast-conserving surgery. No significant differences in recurrence rates were found with margins wider than 2mm.',
    tags: ['oncology', 'breast cancer', 'surgery', 'surgical']
  },
  
  // Neurology Studies
  {
    id: 'neuro-study-001',
    title: 'Novel Disease-Modifying Therapies for Alzheimer\'s Disease',
    source: 'JAMA Neurology',
    publicationDate: new Date('2023-07-05'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/neuro-001',
    summary: 'This trial evaluated the efficacy of a monoclonal antibody targeting amyloid plaques in patients with early Alzheimer\'s disease. Treatment resulted in significant reduction in cognitive decline over 18 months.',
    tags: ['neurology', 'alzheimer\'s', 'pharmacological']
  },
  {
    id: 'neuro-study-002',
    title: 'Cognitive Behavioral Therapy for Chronic Migraine Prevention',
    source: 'Headache',
    publicationDate: new Date('2023-01-30'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/neuro-002',
    summary: 'This systematic review analyzed the effectiveness of cognitive behavioral therapy for migraine prevention. Results showed significant reduction in frequency and severity of migraine attacks compared to usual care.',
    tags: ['neurology', 'migraine', 'behavioral', 'preventive']
  },
  
  // Endocrinology Studies
  {
    id: 'endo-study-001',
    title: 'Continuous Glucose Monitoring in Type 1 Diabetes Management',
    source: 'Diabetes Care',
    publicationDate: new Date('2023-04-12'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/endo-001',
    summary: 'This multicenter randomized trial evaluated the impact of continuous glucose monitoring on glycemic control in patients with type 1 diabetes. Use of CGM was associated with improved HbA1c levels and reduced hypoglycemic episodes.',
    tags: ['endocrinology', 'diabetes', 'diagnostic', 'supportive']
  },
  {
    id: 'endo-study-002',
    title: 'Comparison of GLP-1 Receptor Agonists for Weight Management',
    source: 'The Journal of Clinical Endocrinology & Metabolism',
    publicationDate: new Date('2023-02-15'),
    evidenceLevel: EvidenceLevel.META_ANALYSIS,
    url: 'https://example.org/studies/endo-002',
    summary: 'This meta-analysis compared the efficacy and safety of various GLP-1 receptor agonists for weight management in patients with obesity. Results indicated significant weight reduction with acceptable safety profiles.',
    tags: ['endocrinology', 'obesity', 'weight management', 'pharmacological']
  },
  
  // Infectious Disease Studies
  {
    id: 'inf-study-001',
    title: 'Antibiotic Stewardship Programs in Hospital Settings',
    source: 'Clinical Infectious Diseases',
    publicationDate: new Date('2023-03-08'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/inf-001',
    summary: 'This systematic review evaluated the impact of antibiotic stewardship programs on antibiotic use and resistance in hospital settings. Implementation was associated with reduced inappropriate prescribing and antibiotic resistance.',
    tags: ['infectious_disease', 'antibiotic stewardship', 'preventive']
  },
  {
    id: 'inf-study-002',
    title: 'Comparative Effectiveness of Antiviral Treatments for Influenza',
    source: 'Antiviral Therapy',
    publicationDate: new Date('2022-12-10'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/inf-002',
    summary: 'This randomized controlled trial compared the effectiveness of different neuraminidase inhibitors for influenza treatment. Early treatment was associated with reduced symptom duration and complication rates.',
    tags: ['infectious_disease', 'influenza', 'antiviral', 'pharmacological']
  },
  
  // Respiratory Studies
  {
    id: 'resp-study-001',
    title: 'Inhaled Corticosteroid Therapy in Asthma Management',
    source: 'European Respiratory Journal',
    publicationDate: new Date('2023-05-20'),
    evidenceLevel: EvidenceLevel.META_ANALYSIS,
    url: 'https://example.org/studies/resp-001',
    summary: 'This meta-analysis assessed the efficacy and safety of inhaled corticosteroids as monotherapy versus combination therapy in persistent asthma. Combination therapy showed superior symptom control and reduced exacerbations.',
    tags: ['respiratory', 'asthma', 'corticosteroids', 'pharmacological']
  },
  {
    id: 'resp-study-002',
    title: 'Pulmonary Rehabilitation in COPD Management',
    source: 'American Journal of Respiratory and Critical Care Medicine',
    publicationDate: new Date('2023-01-15'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/resp-002',
    summary: 'This systematic review evaluated the effectiveness of pulmonary rehabilitation programs for patients with COPD. Programs were associated with improved exercise capacity, quality of life, and reduced hospitalizations.',
    tags: ['respiratory', 'COPD', 'rehabilitation', 'behavioral', 'supportive']
  },
  
  // Gastroenterology Studies
  {
    id: 'gastro-study-001',
    title: 'Biologics for Inflammatory Bowel Disease: Comparative Efficacy',
    source: 'Gastroenterology',
    publicationDate: new Date('2023-06-08'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/gastro-001',
    summary: 'This systematic review and network meta-analysis compared the efficacy of different biologics for induction and maintenance of remission in Crohn\'s disease and ulcerative colitis. Anti-integrin therapies showed favorable safety profiles.',
    tags: ['gastroenterology', 'inflammatory bowel disease', 'biologics', 'pharmacological']
  },
  {
    id: 'gastro-study-002',
    title: 'Screening Colonoscopy and Colorectal Cancer Mortality',
    source: 'New England Journal of Medicine',
    publicationDate: new Date('2023-04-05'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/gastro-002',
    summary: 'This randomized trial evaluated the effect of screening colonoscopy on colorectal cancer incidence and mortality. Results showed significant reduction in colorectal cancer mortality in the screening group.',
    tags: ['gastroenterology', 'colorectal cancer', 'screening', 'diagnostic', 'preventive']
  },
  
  // Rheumatology Studies
  {
    id: 'rheum-study-001',
    title: 'JAK Inhibitors versus TNF Inhibitors for Rheumatoid Arthritis',
    source: 'Annals of the Rheumatic Diseases',
    publicationDate: new Date('2023-02-28'),
    evidenceLevel: EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL,
    url: 'https://example.org/studies/rheum-001',
    summary: 'This head-to-head trial compared the efficacy and safety of JAK inhibitors versus TNF inhibitors in patients with rheumatoid arthritis who failed methotrexate therapy. JAK inhibitors showed non-inferior efficacy with distinct safety profiles.',
    tags: ['rheumatology', 'rheumatoid arthritis', 'JAK inhibitors', 'pharmacological']
  },
  {
    id: 'rheum-study-002',
    title: 'Exercise Therapy for Osteoarthritis of the Knee',
    source: 'British Journal of Sports Medicine',
    publicationDate: new Date('2022-10-20'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/rheum-002',
    summary: 'This systematic review assessed the effectiveness of different exercise therapy modalities for knee osteoarthritis. Structured exercise programs showed significant improvements in pain, function, and quality of life.',
    tags: ['rheumatology', 'osteoarthritis', 'exercise therapy', 'behavioral', 'supportive']
  },
  
  // Psychiatry Studies
  {
    id: 'psych-study-001',
    title: 'Cognitive Behavioral Therapy versus Pharmacotherapy for Major Depression',
    source: 'JAMA Psychiatry',
    publicationDate: new Date('2023-05-15'),
    evidenceLevel: EvidenceLevel.META_ANALYSIS,
    url: 'https://example.org/studies/psych-001',
    summary: 'This meta-analysis compared the efficacy of cognitive behavioral therapy versus antidepressant medication for major depressive disorder. Both treatments showed similar efficacy for moderate depression, while combination therapy was superior for severe depression.',
    tags: ['psychiatry', 'depression', 'CBT', 'antidepressants', 'behavioral', 'pharmacological']
  },
  {
    id: 'psych-study-002',
    title: 'ADHD Treatment Modalities in Children and Adolescents',
    source: 'Journal of the American Academy of Child & Adolescent Psychiatry',
    publicationDate: new Date('2023-01-10'),
    evidenceLevel: EvidenceLevel.SYSTEMATIC_REVIEW,
    url: 'https://example.org/studies/psych-002',
    summary: 'This systematic review evaluated the effectiveness of pharmacological, behavioral, and combined interventions for ADHD in children and adolescents. Multimodal treatment approaches showed superior outcomes to single modality approaches.',
    tags: ['psychiatry', 'ADHD', 'stimulants', 'behavioral therapy', 'pharmacological', 'behavioral']
  }
]; 