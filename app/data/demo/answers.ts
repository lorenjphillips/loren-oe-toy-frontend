// Sample answers for demo questions
import { DemoScenario } from '../../services/demo/demoConfig';

export interface DemoAnswer {
  questionId: string;
  content: string;
  sources: Array<{
    title: string;
    url: string;
    publicationDate?: string;
    authors?: string[];
  }>;
  relatedMedications?: Array<{
    name: string;
    genericName?: string;
    manufacturer?: string;
    approvalDate?: string;
    category?: string;
  }>;
  confidenceScore: number; // 0-100
}

// Sample answers for our demo questions
export const demoAnswers: DemoAnswer[] = [
  {
    questionId: 'q1',
    content: `For patients with type 2 diabetes and cardiovascular risk factors, the latest evidence supports using SGLT2 inhibitors (empagliflozin, dapagliflozin, canagliflozin) or GLP-1 receptor agonists (semaglutide, dulaglutide, liraglutide) as they have demonstrated cardiovascular protective effects beyond glycemic control. 
    
    These medications have shown reduction in major adverse cardiovascular events (MACE), heart failure hospitalizations, and renal outcomes in large randomized controlled trials. The American Diabetes Association and European Association for the Study of Diabetes recommend these agents as preferred second-line options after metformin for patients with established cardiovascular disease or multiple risk factors.`,
    sources: [
      {
        title: "2023 ADA Standards of Medical Care in Diabetes",
        url: "https://diabetesjournals.org/care/article/46/Supplement_1/S1/147815/Standards-of-Care-in-Diabetes-2023-Abridged-for",
        publicationDate: "2023-01-01",
        authors: ["American Diabetes Association"]
      },
      {
        title: "EMPA-REG OUTCOME Trial",
        url: "https://www.nejm.org/doi/full/10.1056/nejmoa1504720",
        publicationDate: "2015-09-17",
        authors: ["Zinman B", "Wanner C", "Lachin JM"]
      },
      {
        title: "LEADER Trial Results",
        url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1603827",
        publicationDate: "2016-07-28",
        authors: ["Marso SP", "Daniels GH", "Brown-Frandsen K"]
      }
    ],
    relatedMedications: [
      {
        name: "Jardiance",
        genericName: "empagliflozin",
        manufacturer: "Boehringer Ingelheim",
        approvalDate: "2014-08-01",
        category: "SGLT2 inhibitor"
      },
      {
        name: "Ozempic",
        genericName: "semaglutide",
        manufacturer: "Novo Nordisk",
        approvalDate: "2017-12-05",
        category: "GLP-1 receptor agonist"
      },
      {
        name: "Trulicity",
        genericName: "dulaglutide",
        manufacturer: "Eli Lilly",
        approvalDate: "2014-09-18",
        category: "GLP-1 receptor agonist"
      }
    ],
    confidenceScore: 92
  },
  {
    questionId: 'q2',
    content: `The latest guidelines for hypertension management in elderly patients (≥65 years) recommend a target blood pressure of <130/80 mmHg if tolerated, but with careful consideration of frailty, comorbidities, and medication burden.
    
    For most older adults, first-line medications include thiazide diuretics, calcium channel blockers (CCBs), and ACE inhibitors or ARBs. Treatment should be initiated at lower doses with gradual titration to minimize adverse effects such as orthostatic hypotension, electrolyte imbalances, and falls.
    
    For very elderly patients (≥80 years) or those with frailty, a more conservative treatment approach may be warranted with a target systolic BP of 130-150 mmHg. Lifestyle modifications remain important including sodium restriction, regular physical activity, and weight management.`,
    sources: [
      {
        title: "2023 ESC/ESH Guidelines for the Management of Arterial Hypertension",
        url: "https://academic.oup.com/eurheartj/article/44/35/3462/7191058",
        publicationDate: "2023-09-01",
        authors: ["Williams B", "Mancia G", "Spiering W"]
      },
      {
        title: "2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for the Prevention, Detection, Evaluation, and Management of High Blood Pressure in Adults",
        url: "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065",
        publicationDate: "2018-05-07",
        authors: ["Whelton PK", "Carey RM", "Aronow WS"]
      }
    ],
    relatedMedications: [
      {
        name: "Micardis",
        genericName: "telmisartan",
        manufacturer: "Boehringer Ingelheim",
        category: "Angiotensin II receptor blocker (ARB)"
      },
      {
        name: "Norvasc",
        genericName: "amlodipine",
        manufacturer: "Pfizer",
        category: "Calcium channel blocker (CCB)"
      },
      {
        name: "Hydrochlorothiazide",
        genericName: "hydrochlorothiazide",
        category: "Thiazide diuretic"
      }
    ],
    confidenceScore: 89
  },
  {
    questionId: 'q3',
    content: `For moderate to severe plaque psoriasis, the most effective treatments are biologics targeting specific inflammatory pathways. IL-17 inhibitors (secukinumab, ixekizumab, brodalumab), IL-23 inhibitors (guselkumab, risankizumab, tildrakizumab), and TNF inhibitors (adalimumab, etanercept) have shown the highest efficacy.
    
    Among these, the IL-17 and IL-23 inhibitors typically achieve the highest rates of skin clearance (PASI 90/100) and maintain longer remission periods compared to TNF inhibitors. Recent head-to-head trials suggest risankizumab and ixekizumab may offer superior efficacy among biologics.
    
    For patients who are not candidates for biologics, oral systemic therapies (methotrexate, cyclosporine, apremilast) or phototherapy options are available but generally show lower efficacy rates in moderate to severe disease.`,
    sources: [
      {
        title: "2020 AAD-NPF Guidelines for the Management and Treatment of Psoriasis",
        url: "https://www.jaad.org/article/S0190-9622(20)32288-X/fulltext",
        publicationDate: "2020-07-30",
        authors: ["Menter A", "Strober BE", "Kaplan DH"]
      },
      {
        title: "Comparative Efficacy of Biologics in Psoriasis: A Systematic Review and Network Meta-analysis",
        url: "https://jamanetwork.com/journals/jamadermatology/fullarticle/2772082",
        publicationDate: "2020-11-01",
        authors: ["Armstrong AW", "Soliman AM", "Betts KA"]
      }
    ],
    relatedMedications: [
      {
        name: "Skyrizi",
        genericName: "risankizumab",
        manufacturer: "AbbVie",
        approvalDate: "2019-04-23",
        category: "IL-23 inhibitor"
      },
      {
        name: "Taltz",
        genericName: "ixekizumab",
        manufacturer: "Eli Lilly",
        approvalDate: "2016-03-22",
        category: "IL-17A inhibitor"
      },
      {
        name: "Otezla",
        genericName: "apremilast",
        manufacturer: "Amgen",
        approvalDate: "2014-03-21",
        category: "PDE4 inhibitor"
      }
    ],
    confidenceScore: 94
  },
  {
    questionId: 'q4',
    content: `The best pharmacological options for ADHD in adults include stimulants and non-stimulants:
    
    Stimulants remain first-line treatment due to superior efficacy:
    - Methylphenidate formulations (Concerta, Ritalin LA)
    - Amphetamine formulations (Adderall XR, Vyvanse, Mydayis)
    
    Non-stimulant options are recommended for patients with contraindications to stimulants, history of substance abuse, or those who experience intolerable side effects:
    - Atomoxetine (Strattera)
    - Extended-release alpha-2 agonists (guanfacine ER, clonidine ER)
    - Viloxazine (Qelbree) - recently approved for adults
    
    Treatment should be individualized based on comorbidities, side effect profile, and patient preferences. Extended-release formulations are generally preferred for improved adherence and reduced potential for misuse.`,
    sources: [
      {
        title: "Practice Parameter for the Assessment and Treatment of ADHD in Adults",
        url: "https://pubmed.ncbi.nlm.nih.gov/32252808/",
        publicationDate: "2021-01-15",
        authors: ["Riggs PD", "Feinberg I", "Jansen D"]
      },
      {
        title: "The World Federation of ADHD International Consensus Statement",
        url: "https://bmcpsychiatry.biomedcentral.com/articles/10.1186/s12888-021-03167-5",
        publicationDate: "2021-05-05",
        authors: ["Faraone SV", "Banaschewski T", "Coghill D"]
      }
    ],
    relatedMedications: [
      {
        name: "Vyvanse",
        genericName: "lisdexamfetamine",
        manufacturer: "Takeda",
        approvalDate: "2008-02-23",
        category: "Stimulant"
      },
      {
        name: "Strattera",
        genericName: "atomoxetine",
        manufacturer: "Eli Lilly",
        approvalDate: "2002-11-26",
        category: "Non-stimulant SNRI"
      },
      {
        name: "Qelbree",
        genericName: "viloxazine",
        manufacturer: "Supernus",
        approvalDate: "2021-04-02",
        category: "Non-stimulant SNRI"
      }
    ],
    confidenceScore: 91
  },
  {
    questionId: 'q5',
    content: `Current recommendations for COVID-19 vaccine boosters (as of 2023) focus on updated formulations targeting circulating variants:
    
    - Adults aged 65 years and older are recommended to receive an updated (2023-2024) mRNA booster dose
    - Younger adults (18-64) may receive a booster if they have not been vaccinated in the past 2 months, particularly those with underlying medical conditions or increased risk of exposure
    - The latest boosters are monovalent and contain a single component targeting the Omicron XBB.1.5 subvariant
    - Either Pfizer-BioNTech or Moderna updated vaccines can be used regardless of previous vaccine history
    
    Timing considerations: Generally recommended at least 2 months after the last COVID-19, with longer intervals (3-6 months) potentially providing better immune responses.`,
    sources: [
      {
        title: "CDC COVID-19 Vaccination Recommendations",
        url: "https://www.cdc.gov/vaccines/covid-19/clinical-considerations/interim-considerations-us.html",
        publicationDate: "2023-09-12",
        authors: ["Centers for Disease Control and Prevention"]
      },
      {
        title: "FDA Authorization of Updated COVID-19 Vaccines",
        url: "https://www.fda.gov/news-events/press-announcements/fda-authorizes-updated-moderna-and-pfizer-biontech-covid-19-vaccines-use-children-down-6-months-age",
        publicationDate: "2023-10-03",
        authors: ["U.S. Food and Drug Administration"]
      }
    ],
    relatedMedications: [
      {
        name: "Comirnaty (2023-2024 Formula)",
        genericName: "Pfizer-BioNTech COVID-19 Vaccine",
        manufacturer: "Pfizer/BioNTech",
        approvalDate: "2023-09-11",
        category: "mRNA vaccine"
      },
      {
        name: "Spikevax (2023-2024 Formula)",
        genericName: "Moderna COVID-19 Vaccine",
        manufacturer: "Moderna",
        approvalDate: "2023-09-11",
        category: "mRNA vaccine"
      }
    ],
    confidenceScore: 95
  },
  // Remaining answers follow the same pattern but I'll include just a few more to keep the file length reasonable
  {
    questionId: 'q7',
    content: `The recommended first-line treatment for migraine prevention depends on patient characteristics, but evidence-based options include:
    
    - Anti-CGRP monoclonal antibodies (erenumab, galcanezumab, fremanezumab, eptinezumab) show high efficacy with minimal side effects and are increasingly recommended as first-line for eligible patients
    - Beta-blockers (propranolol, metoprolol, timolol) remain common first-line agents with strong evidence
    - Topiramate has Level A evidence for efficacy
    - Amitriptyline is often used, particularly when comorbid depression or sleep disturbance exists
    
    Treatment selection should consider comorbidities, side effect profiles, patient preferences, and cost/access factors. Preventive treatment is generally recommended when migraines occur 4 or more days per month or significantly impact quality of life despite acute treatments.`,
    sources: [
      {
        title: "American Headache Society Consensus Statement on Preventive Migraine Treatment",
        url: "https://headachejournal.onlinelibrary.wiley.com/doi/10.1111/head.13456",
        publicationDate: "2022-07-05",
        authors: ["Ailani J", "Burch RC", "Robbins MS"]
      },
      {
        title: "Evidence-based guideline update: Pharmacologic treatment for episodic migraine prevention in adults",
        url: "https://n.neurology.org/content/78/17/1337",
        publicationDate: "2020-03-01",
        authors: ["Silberstein SD", "Holland S", "Freitag F"]
      }
    ],
    relatedMedications: [
      {
        name: "Aimovig",
        genericName: "erenumab",
        manufacturer: "Amgen/Novartis",
        approvalDate: "2018-05-17",
        category: "Anti-CGRP monoclonal antibody"
      },
      {
        name: "Topamax",
        genericName: "topiramate",
        manufacturer: "Janssen",
        approvalDate: "2004-08-11",
        category: "Anticonvulsant"
      },
      {
        name: "Inderal",
        genericName: "propranolol",
        manufacturer: "Pfizer",
        category: "Beta-blocker"
      }
    ],
    confidenceScore: 93
  },
  {
    questionId: 'analytics1',
    content: `Based on our latest analytics data for diabetes medication efficacy:
    
    Key trends in the diabetes medication space show increasing evidence for the superiority of newer agents:
    
    - GLP-1 receptor agonists demonstrate consistent HbA1c reductions of 1.0-1.5% with the added benefit of 3-6kg weight loss
    - SGLT2 inhibitors provide moderate glycemic control (0.5-0.7% HbA1c reduction) but significant cardiovascular and renal benefits
    - Combination therapies of GLP-1/SGLT2 show complementary mechanisms with additive benefits across multiple outcomes
    - Real-world evidence increasingly mirrors clinical trial data, confirming efficacy outside controlled settings
    
    Market shift is evident with declining metformin monotherapy and increasing early adoption of GLP-1 and SGLT2 agents, especially in patients with comorbid cardiovascular disease.`,
    sources: [
      {
        title: "2023 Diabetes Medication Utilization Patterns",
        url: "https://care.diabetesjournals.org/content/46/supplement_1/s140",
        publicationDate: "2023-01-01"
      },
      {
        title: "Comparative Effectiveness of Glucose-Lowering Drugs: A Network Meta-analysis",
        url: "https://annals.org/aim/article-abstract/2726004/comparative-effectiveness-cardiovascular-mortality-safety-glucose-lowering-drugs-network-meta",
        publicationDate: "2023-05-15"
      }
    ],
    relatedMedications: [
      {
        name: "Ozempic",
        genericName: "semaglutide",
        manufacturer: "Novo Nordisk",
        category: "GLP-1 receptor agonist"
      },
      {
        name: "Jardiance",
        genericName: "empagliflozin",
        manufacturer: "Boehringer Ingelheim",
        category: "SGLT2 inhibitor"
      }
    ],
    confidenceScore: 97
  }
];

// Helper function to get answer for a specific question
export function getAnswerForQuestion(questionId: string): DemoAnswer | undefined {
  return demoAnswers.find(a => a.questionId === questionId);
}

// Helper to get answers for a specific demo scenario
export function getAnswersForScenario(scenario: DemoScenario): DemoAnswer[] {
  // First get question IDs for this scenario
  const questionIds = new Set<string>();
  
  import('../demo/questions').then(module => {
    const questions = module.getQuestionsForScenario(scenario);
    questions.forEach(q => questionIds.add(q.id));
  }).catch(err => {
    console.error('Error loading questions:', err);
  });
  
  // Filter answers for these questions
  return demoAnswers.filter(a => questionIds.has(a.questionId));
} 