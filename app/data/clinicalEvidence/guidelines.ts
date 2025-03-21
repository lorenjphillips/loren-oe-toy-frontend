/**
 * Sample Clinical Guidelines Data
 * 
 * Contains sample clinical practice guidelines organized by medical specialty
 * for use in clinical decision support.
 */

import { 
  ClinicalGuideline, 
  ClinicalRecommendation, 
  RecommendationStrength, 
  EvidenceQuality
} from '../../models/phase4';

/**
 * Sample clinical practice guidelines from various organizations
 */
export const guidelines: ClinicalGuideline[] = [
  // Cardiovascular Guidelines
  {
    id: 'cv-guide-001',
    title: 'Guidelines for Management of Hypertension in Adults',
    organization: 'American Heart Association',
    publicationDate: new Date('2023-01-15'),
    lastUpdated: new Date('2023-01-15'),
    url: 'https://example.org/guidelines/cv-001',
    summary: 'These guidelines provide evidence-based recommendations for the diagnosis, evaluation, and management of high blood pressure in adults, including thresholds for pharmacologic treatment, target blood pressure goals, and optimal therapeutic strategies.',
    recommendations: [
      {
        id: 'cv-guide-001-rec1',
        text: 'Initiate antihypertensive medication therapy at a BP of 130/80 mm Hg or higher for patients with established cardiovascular disease, diabetes mellitus, or chronic kidney disease.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'cv-guide-001-rec2',
        text: 'First-line therapy for stage 1 hypertension should include thiazide diuretics, calcium channel blockers, ACE inhibitors, or ARBs.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'cv-guide-001-rec3',
        text: 'Lifestyle modifications including weight reduction, healthy diet, sodium restriction, physical activity, and moderation of alcohol consumption are recommended for all patients with hypertension.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  },
  {
    id: 'cv-guide-002',
    title: 'Guidelines for Atrial Fibrillation Management',
    organization: 'European Society of Cardiology',
    publicationDate: new Date('2022-08-10'),
    lastUpdated: new Date('2022-12-05'),
    url: 'https://example.org/guidelines/cv-002',
    summary: 'These guidelines provide recommendations for the diagnosis and management of atrial fibrillation, including strategies for rhythm and rate control, prevention of thromboembolism, and management of complications.',
    recommendations: [
      {
        id: 'cv-guide-002-rec1',
        text: 'Oral anticoagulation is recommended in all male AF patients with a CHA2DS2-VASc score ≥2 and in all female AF patients with a score ≥3.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'cv-guide-002-rec2',
        text: 'Direct oral anticoagulants are recommended in preference to vitamin K antagonists in eligible patients with non-valvular AF.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'cv-guide-002-rec3',
        text: 'Beta-blockers, diltiazem, or verapamil are recommended as first-line therapy for rate control in AF patients with LVEF ≥40%.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  },
  
  // Oncology Guidelines
  {
    id: 'onc-guide-001',
    title: 'Guidelines for Breast Cancer Screening and Diagnosis',
    organization: 'National Comprehensive Cancer Network',
    publicationDate: new Date('2023-03-10'),
    lastUpdated: new Date('2023-03-10'),
    url: 'https://example.org/guidelines/onc-001',
    summary: 'These guidelines provide recommendations for breast cancer screening, diagnostic evaluation, and follow-up for women at average and increased risk of developing breast cancer.',
    recommendations: [
      {
        id: 'onc-guide-001-rec1',
        text: 'Annual screening mammography is recommended for average-risk women ages 40 years and older.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'onc-guide-001-rec2',
        text: 'Consider annual breast MRI in addition to mammography for women with a lifetime risk of breast cancer >20% based on risk assessment models.',
        strengthOfRecommendation: RecommendationStrength.MODERATE,
        evidenceQuality: EvidenceQuality.MODERATE
      },
      {
        id: 'onc-guide-001-rec3',
        text: 'Clinical breast examination every 1-3 years is recommended for women ages 25-39 and annually for women ≥40 years.',
        strengthOfRecommendation: RecommendationStrength.MODERATE,
        evidenceQuality: EvidenceQuality.LOW
      }
    ]
  },
  {
    id: 'onc-guide-002',
    title: 'Guidelines for Management of Non-Small Cell Lung Cancer',
    organization: 'American Society of Clinical Oncology',
    publicationDate: new Date('2022-11-15'),
    lastUpdated: new Date('2023-02-28'),
    url: 'https://example.org/guidelines/onc-002',
    summary: 'These guidelines provide evidence-based recommendations for the management of patients with non-small cell lung cancer, including staging, treatment options, and surveillance strategies.',
    recommendations: [
      {
        id: 'onc-guide-002-rec1',
        text: 'Molecular testing for EGFR, ALK, ROS1, BRAF, NTRK, MET, and RET mutations and PD-L1 expression is recommended for all patients with advanced or metastatic non-squamous NSCLC.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'onc-guide-002-rec2',
        text: 'For patients with stage I NSCLC, surgical resection with lobectomy is the preferred treatment when possible.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'onc-guide-002-rec3',
        text: 'For patients with stage IV NSCLC and high PD-L1 expression (≥50%) without actionable mutations, single-agent pembrolizumab is recommended as first-line therapy.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      }
    ]
  },
  
  // Neurology Guidelines
  {
    id: 'neuro-guide-001',
    title: 'Guidelines for Management of Acute Ischemic Stroke',
    organization: 'American Stroke Association',
    publicationDate: new Date('2022-09-20'),
    lastUpdated: new Date('2023-01-15'),
    url: 'https://example.org/guidelines/neuro-001',
    summary: 'These guidelines provide evidence-based recommendations for the early management of patients with acute ischemic stroke, including pre-hospital care, in-hospital management, and secondary prevention strategies.',
    recommendations: [
      {
        id: 'neuro-guide-001-rec1',
        text: 'Eligible patients with acute ischemic stroke should receive intravenous alteplase within 4.5 hours of symptom onset.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'neuro-guide-001-rec2',
        text: 'Mechanical thrombectomy is recommended for patients with acute ischemic stroke due to large vessel occlusion in the anterior circulation within 24 hours of symptom onset.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'neuro-guide-001-rec3',
        text: 'After acute ischemic stroke, patients should receive antithrombotic therapy (aspirin, clopidogrel, or anticoagulation if indicated) to reduce the risk of recurrent stroke.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  },
  
  // Endocrinology Guidelines
  {
    id: 'endo-guide-001',
    title: 'Guidelines for Management of Type 2 Diabetes',
    organization: 'American Diabetes Association',
    publicationDate: new Date('2023-01-01'),
    lastUpdated: new Date('2023-01-01'),
    url: 'https://example.org/guidelines/endo-001',
    summary: 'These guidelines provide evidence-based recommendations for the diagnosis, treatment, and management of type 2 diabetes, including glycemic targets, pharmacologic therapy, and prevention of complications.',
    recommendations: [
      {
        id: 'endo-guide-001-rec1',
        text: 'Metformin remains the preferred initial pharmacologic agent for the treatment of type 2 diabetes in the absence of specific contraindications.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'endo-guide-001-rec2',
        text: 'In patients with type 2 diabetes and established atherosclerotic cardiovascular disease, SGLT2 inhibitors or GLP-1 receptor agonists with proven cardiovascular benefit are recommended as part of the glucose-lowering regimen.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'endo-guide-001-rec3',
        text: 'An A1C goal of <7% is recommended for many nonpregnant adults with type 2 diabetes without significant hypoglycemia or other adverse effects of treatment.',
        strengthOfRecommendation: RecommendationStrength.MODERATE,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  },
  
  // Infectious Disease Guidelines
  {
    id: 'inf-guide-001',
    title: 'Guidelines for Management of Community-Acquired Pneumonia',
    organization: 'Infectious Diseases Society of America',
    publicationDate: new Date('2022-07-15'),
    lastUpdated: new Date('2023-02-10'),
    url: 'https://example.org/guidelines/inf-001',
    summary: 'These guidelines provide evidence-based recommendations for the diagnosis, treatment, and management of community-acquired pneumonia in adults, including antibiotic selection, duration of therapy, and criteria for hospitalization.',
    recommendations: [
      {
        id: 'inf-guide-001-rec1',
        text: 'Empiric antibiotic therapy for community-acquired pneumonia in outpatients without comorbidities should include a macrolide or doxycycline.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      },
      {
        id: 'inf-guide-001-rec2',
        text: 'In hospitalized patients with CAP, antibiotic therapy should be initiated as soon as possible after diagnosis, ideally within 1 hour.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      },
      {
        id: 'inf-guide-001-rec3',
        text: 'Standard therapy for hospitalized patients with CAP without risk factors for MRSA or P. aeruginosa should include a beta-lactam plus a macrolide, or a respiratory fluoroquinolone.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      }
    ]
  },
  
  // Respiratory Guidelines
  {
    id: 'resp-guide-001',
    title: 'Guidelines for Management of COPD',
    organization: 'Global Initiative for Chronic Obstructive Lung Disease',
    publicationDate: new Date('2023-01-20'),
    lastUpdated: new Date('2023-01-20'),
    url: 'https://example.org/guidelines/resp-001',
    summary: 'These guidelines provide evidence-based recommendations for the diagnosis, management, and prevention of chronic obstructive pulmonary disease, including pharmacologic and non-pharmacologic therapies.',
    recommendations: [
      {
        id: 'resp-guide-001-rec1',
        text: 'Inhaled bronchodilators are recommended as the cornerstone of symptomatic management for COPD.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'resp-guide-001-rec2',
        text: 'In patients with persistent dyspnea on long-acting bronchodilator monotherapy, treatment escalation to LABA/LAMA combination therapy is recommended.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'resp-guide-001-rec3',
        text: 'Pulmonary rehabilitation is recommended for patients with COPD who have exertional dyspnea or other respiratory symptoms, reduced exercise tolerance, or activity limitation due to COPD.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      }
    ]
  },
  
  // Gastroenterology Guidelines
  {
    id: 'gastro-guide-001',
    title: 'Guidelines for Management of Inflammatory Bowel Disease',
    organization: 'American College of Gastroenterology',
    publicationDate: new Date('2022-10-05'),
    lastUpdated: new Date('2023-03-15'),
    url: 'https://example.org/guidelines/gastro-001',
    summary: 'These guidelines provide evidence-based recommendations for the diagnosis, treatment, and management of inflammatory bowel disease, including pharmacologic therapy, surgical management, and monitoring strategies.',
    recommendations: [
      {
        id: 'gastro-guide-001-rec1',
        text: 'Monoclonal antibodies against TNF-α are effective for induction and maintenance of remission in patients with moderate to severe Crohn\'s disease.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'gastro-guide-001-rec2',
        text: 'Patients with ulcerative colitis should be assessed for extent and severity of disease at diagnosis to guide therapy.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      },
      {
        id: 'gastro-guide-001-rec3',
        text: 'Patients with IBD should be screened for latent tuberculosis, hepatitis B, and other opportunistic infections before initiating immunosuppressive therapy.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  },
  
  // Rheumatology Guidelines
  {
    id: 'rheum-guide-001',
    title: 'Guidelines for Management of Rheumatoid Arthritis',
    organization: 'American College of Rheumatology',
    publicationDate: new Date('2022-11-10'),
    lastUpdated: new Date('2023-04-05'),
    url: 'https://example.org/guidelines/rheum-001',
    summary: 'These guidelines provide evidence-based recommendations for the treatment of rheumatoid arthritis, including pharmacologic therapy, monitoring, and management of comorbidities.',
    recommendations: [
      {
        id: 'rheum-guide-001-rec1',
        text: 'In patients with newly diagnosed RA, a treat-to-target strategy is recommended over a non-targeted approach.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'rheum-guide-001-rec2',
        text: 'For patients with moderate to high disease activity despite DMARD monotherapy, addition of another conventional synthetic DMARD or a biologic DMARD or a targeted synthetic DMARD is recommended over continuing DMARD monotherapy.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'rheum-guide-001-rec3',
        text: 'In patients with RA, low-dose glucocorticoids (≤10 mg/day prednisone equivalent) should be used for the shortest duration possible.',
        strengthOfRecommendation: RecommendationStrength.MODERATE,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  },
  
  // Psychiatry Guidelines
  {
    id: 'psych-guide-001',
    title: 'Guidelines for Treatment of Major Depressive Disorder',
    organization: 'American Psychiatric Association',
    publicationDate: new Date('2022-12-20'),
    lastUpdated: new Date('2023-01-30'),
    url: 'https://example.org/guidelines/psych-001',
    summary: 'These guidelines provide evidence-based recommendations for the assessment and treatment of patients with major depressive disorder, including pharmacotherapy, psychotherapy, and other somatic treatments.',
    recommendations: [
      {
        id: 'psych-guide-001-rec1',
        text: 'Patients with MDD should be assessed for suicide risk and the presence of psychotic features, substance use disorders, and other psychiatric comorbidities.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.MODERATE
      },
      {
        id: 'psych-guide-001-rec2',
        text: 'First-line treatment for patients with mild to moderate MDD includes monotherapy with an antidepressant medication, evidence-based psychotherapy, or the combination.',
        strengthOfRecommendation: RecommendationStrength.STRONG,
        evidenceQuality: EvidenceQuality.HIGH
      },
      {
        id: 'psych-guide-001-rec3',
        text: 'For patients who have not responded to an adequate trial of first-line therapy, switching to another antidepressant medication, augmentation with another agent, or switching to or adding psychotherapy is recommended.',
        strengthOfRecommendation: RecommendationStrength.MODERATE,
        evidenceQuality: EvidenceQuality.MODERATE
      }
    ]
  }
]; 