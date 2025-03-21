/**
 * Sample Oncology Knowledge Graph
 * Contains relationships between oncology treatments, conditions, and medical concepts
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  KnowledgeGraph, 
  NodeType, 
  RelationshipType, 
  EvidenceStrength,
  MedicalConceptNode,
  TreatmentNode, 
  Relationship
} from '../../models/knowledgeGraph';

// Medical concept nodes
const medicalConcepts: MedicalConceptNode[] = [
  {
    id: 'mc-1',
    type: NodeType.CONDITION,
    label: 'Breast Cancer',
    description: 'A type of cancer that forms in the cells of the breasts. It can occur in both men and women, but it\'s far more common in women.',
    aliases: ['Mammary Carcinoma', 'Malignant Neoplasm of Breast'],
    taxonomyIds: { 'ICD10': 'C50', 'SNOMED': '254837009' },
    relevanceScore: 95,
    prevalence: 12.9,
    severity: 80
  },
  {
    id: 'mc-2',
    type: NodeType.CONDITION,
    label: 'HER2-Positive Breast Cancer',
    description: 'A breast cancer that tests positive for a protein called human epidermal growth factor receptor 2 (HER2), which promotes the growth of cancer cells.',
    aliases: ['HER2+ Breast Cancer', 'ERBB2-Positive Breast Cancer'],
    taxonomyIds: { 'ICD10': 'C50', 'SNOMED': '427685000' },
    relevanceScore: 90,
    prevalence: 3.8,
    severity: 85
  },
  {
    id: 'mc-3',
    type: NodeType.CONDITION,
    label: 'Triple-Negative Breast Cancer',
    description: 'A type of breast cancer that lacks the three most common types of receptors that fuel most breast cancer growth: estrogen, progesterone, and the HER2 protein.',
    aliases: ['TNBC', 'ER-/PR-/HER2- Breast Cancer'],
    taxonomyIds: { 'ICD10': 'C50', 'SNOMED': '702937003' },
    relevanceScore: 90,
    prevalence: 2.5,
    severity: 90
  },
  {
    id: 'mc-4',
    type: NodeType.BIOMARKER,
    label: 'HER2 Overexpression',
    description: 'Overexpression of the human epidermal growth factor receptor 2 protein, often associated with more aggressive breast cancer.',
    taxonomyIds: { 'SNOMED': '415565001' },
    relevanceScore: 85
  },
  {
    id: 'mc-5',
    type: NodeType.BIOMARKER,
    label: 'BRCA1 Mutation',
    description: 'A mutation in the BRCA1 gene, which significantly increases the risk of breast and ovarian cancer.',
    taxonomyIds: { 'SNOMED': '445120002' },
    relevanceScore: 80
  },
  {
    id: 'mc-6',
    type: NodeType.BIOMARKER,
    label: 'BRCA2 Mutation',
    description: 'A mutation in the BRCA2 gene, which increases the risk of breast, ovarian, and certain other cancers.',
    taxonomyIds: { 'SNOMED': '432253004' },
    relevanceScore: 78
  },
  {
    id: 'mc-7',
    type: NodeType.MEDICAL_CONCEPT,
    label: 'Cancer Cell Proliferation',
    description: 'The process by which cancer cells multiply and spread throughout the body.',
    relevanceScore: 87
  },
  {
    id: 'mc-8',
    type: NodeType.SYMPTOM,
    label: 'Breast Lump',
    description: 'A localized swelling, knot, bump, bulge or mass in the breast.',
    taxonomyIds: { 'ICD10': 'N63', 'SNOMED': '274751001' },
    relevanceScore: 70,
    severity: 55
  },
  {
    id: 'mc-9',
    type: NodeType.SYMPTOM,
    label: 'Lymphedema',
    description: 'Swelling in an arm or leg caused by a lymphatic system blockage, often a side effect of breast cancer treatment.',
    taxonomyIds: { 'ICD10': 'I89.0', 'SNOMED': '302870006' },
    relevanceScore: 60,
    severity: 65
  },
  {
    id: 'mc-10',
    type: NodeType.MEDICAL_CONCEPT,
    label: 'Tumor Metastasis',
    description: 'The spread of cancer cells from the place where they first formed to another part of the body.',
    taxonomyIds: { 'SNOMED': '128462008' },
    relevanceScore: 90
  }
];

// Treatment nodes
const treatments: TreatmentNode[] = [
  {
    id: 'tr-1',
    type: NodeType.TREATMENT,
    label: 'Mastectomy',
    description: 'Surgical removal of the entire breast to treat or prevent breast cancer.',
    aliases: ['Breast Removal Surgery'],
    taxonomyIds: { 'SNOMED': '65801008' },
    relevanceScore: 85,
    pharmaAffiliations: [],
    approvalStatus: 'FDA_APPROVED',
    mechanism: 'Surgical removal of cancerous breast tissue'
  },
  {
    id: 'tr-2',
    type: NodeType.DRUG,
    label: 'Trastuzumab',
    description: 'A monoclonal antibody used to treat HER2-positive breast cancer by targeting HER2 receptors.',
    aliases: ['Herceptin'],
    taxonomyIds: { 'RxNorm': '121191' },
    relevanceScore: 88,
    pharmaAffiliations: [
      {
        companyId: 'roche',
        companyName: 'Roche',
        relationshipType: 'MANUFACTURER',
        productName: 'Herceptin'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1998-09-25',
    mechanism: 'HER2 receptor antagonist',
    patientEligibility: ['HER2-positive breast cancer']
  },
  {
    id: 'tr-3',
    type: NodeType.DRUG,
    label: 'Pertuzumab',
    description: 'A monoclonal antibody used in combination with trastuzumab and chemotherapy for HER2-positive breast cancer.',
    aliases: ['Perjeta'],
    taxonomyIds: { 'RxNorm': '1357339' },
    relevanceScore: 85,
    pharmaAffiliations: [
      {
        companyId: 'roche',
        companyName: 'Roche',
        relationshipType: 'MANUFACTURER',
        productName: 'Perjeta'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '2012-06-08',
    mechanism: 'HER2 dimerization inhibitor',
    patientEligibility: ['HER2-positive breast cancer']
  },
  {
    id: 'tr-4',
    type: NodeType.DRUG,
    label: 'Paclitaxel',
    description: 'A chemotherapy medication used to treat several types of cancer including breast cancer.',
    aliases: ['Taxol'],
    taxonomyIds: { 'RxNorm': '56946' },
    relevanceScore: 82,
    pharmaAffiliations: [
      {
        companyId: 'bms',
        companyName: 'Bristol-Myers Squibb',
        relationshipType: 'MANUFACTURER',
        productName: 'Taxol'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1992-12-29',
    mechanism: 'Microtubule stabilizing agent',
    patientEligibility: ['Various cancer types']
  },
  {
    id: 'tr-5',
    type: NodeType.DRUG,
    label: 'Tamoxifen',
    description: 'A medication that blocks the effects of estrogen in breast tissue, used to treat hormone receptor-positive breast cancer.',
    aliases: ['Nolvadex'],
    taxonomyIds: { 'RxNorm': '10324' },
    relevanceScore: 80,
    pharmaAffiliations: [
      {
        companyId: 'astrazeneca',
        companyName: 'AstraZeneca',
        relationshipType: 'MANUFACTURER',
        productName: 'Nolvadex'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '1977-12-30',
    mechanism: 'Selective estrogen receptor modulator (SERM)',
    patientEligibility: ['Hormone receptor-positive breast cancer']
  },
  {
    id: 'tr-6',
    type: NodeType.TREATMENT,
    label: 'Radiation Therapy',
    description: 'The use of high-energy radiation to kill cancer cells and shrink tumors.',
    taxonomyIds: { 'SNOMED': '108290001' },
    relevanceScore: 75,
    pharmaAffiliations: [],
    approvalStatus: 'FDA_APPROVED',
    mechanism: 'DNA damage to cancer cells'
  },
  {
    id: 'tr-7',
    type: NodeType.DRUG,
    label: 'Sacituzumab Govitecan',
    description: 'An antibody-drug conjugate used to treat triple-negative breast cancer.',
    aliases: ['Trodelvy'],
    taxonomyIds: { 'RxNorm': '2385112' },
    relevanceScore: 78,
    pharmaAffiliations: [
      {
        companyId: 'gilead',
        companyName: 'Gilead Sciences',
        relationshipType: 'MANUFACTURER',
        productName: 'Trodelvy'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '2020-04-22',
    mechanism: 'Trop-2-directed antibody-drug conjugate',
    patientEligibility: ['Triple-negative breast cancer']
  },
  {
    id: 'tr-8',
    type: NodeType.DRUG,
    label: 'Olaparib',
    description: 'A PARP inhibitor used to treat cancers with BRCA mutations.',
    aliases: ['Lynparza'],
    taxonomyIds: { 'RxNorm': '1535703' },
    relevanceScore: 70,
    pharmaAffiliations: [
      {
        companyId: 'astrazeneca',
        companyName: 'AstraZeneca',
        relationshipType: 'MANUFACTURER',
        productName: 'Lynparza'
      }
    ],
    approvalStatus: 'FDA_APPROVED',
    approvalDate: '2014-12-19',
    mechanism: 'PARP enzyme inhibitor',
    patientEligibility: ['BRCA-mutated breast cancer']
  }
];

// Relationships between nodes
const relationships: Relationship[] = [
  {
    id: 'rel-1',
    source: 'tr-2', // Trastuzumab
    target: 'mc-2', // HER2-Positive Breast Cancer
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Trastuzumab significantly improves outcomes in HER2-positive breast cancer, both in early and metastatic settings.',
    bidirectional: false,
    weight: 90,
    citations: [
      {
        sourceId: 'pmid-12648268',
        title: 'Trastuzumab after adjuvant chemotherapy in HER2-positive breast cancer',
        authors: ['Piccart-Gebhart MJ', 'Procter M', 'Leyland-Jones B'],
        publicationDate: '2005-10-20',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa052306',
        credibilityScore: 95,
        peerReviewed: true
      },
      {
        sourceId: 'pmid-16236737',
        title: 'Trastuzumab plus adjuvant chemotherapy for operable HER2-positive breast cancer',
        authors: ['Romond EH', 'Perez EA', 'Bryant J'],
        publicationDate: '2005-10-20',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa052122',
        credibilityScore: 95,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-2',
    source: 'tr-2', // Trastuzumab
    target: 'mc-4', // HER2 Overexpression
    type: RelationshipType.INTERACTS_WITH,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Trastuzumab binds to the HER2 receptor and blocks its function, preventing it from stimulating tumor cell growth.',
    bidirectional: true,
    weight: 95,
    citations: [
      {
        sourceId: 'pmid-9872473',
        title: 'Mechanism of action of trastuzumab and scientific update',
        authors: ['Hudis CA'],
        publicationDate: '2007-07-01',
        journal: 'Seminars in Oncology',
        doi: '10.1053/j.seminoncol.2007.05.003',
        credibilityScore: 90,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-3',
    source: 'mc-4', // HER2 Overexpression
    target: 'mc-2', // HER2-Positive Breast Cancer
    type: RelationshipType.INDICATES,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'HER2 overexpression is the defining characteristic of HER2-positive breast cancer.',
    bidirectional: true,
    weight: 100,
    citations: [
      {
        sourceId: 'pmid-12648269',
        title: 'Human epidermal growth factor receptor 2 and cancer prognosis',
        authors: ['Ross JS', 'Fletcher JA'],
        publicationDate: '2003-09-01',
        journal: 'Clinical Cancer Research',
        credibilityScore: 92,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-4',
    source: 'mc-4', // HER2 Overexpression
    target: 'mc-7', // Cancer Cell Proliferation
    type: RelationshipType.CAUSES,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'HER2 overexpression promotes cancer cell growth, proliferation, and survival through activation of multiple signaling pathways.',
    bidirectional: false,
    weight: 85,
    citations: [
      {
        sourceId: 'pmid-11208682',
        title: 'Untangling the ErbB signalling network',
        authors: ['Yarden Y', 'Sliwkowski MX'],
        publicationDate: '2001-02-01',
        journal: 'Nature Reviews Molecular Cell Biology',
        doi: '10.1038/35052073',
        credibilityScore: 94,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-5',
    source: 'tr-3', // Pertuzumab
    target: 'mc-2', // HER2-Positive Breast Cancer
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Pertuzumab, when used in combination with trastuzumab and chemotherapy, improves outcomes in HER2-positive breast cancer.',
    bidirectional: false,
    weight: 85,
    citations: [
      {
        sourceId: 'pmid-22149875',
        title: 'Pertuzumab plus trastuzumab plus docetaxel for metastatic breast cancer',
        authors: ['Baselga J', 'Cortés J', 'Kim SB'],
        publicationDate: '2012-01-12',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa1113216',
        credibilityScore: 93,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-6',
    source: 'tr-3', // Pertuzumab
    target: 'mc-4', // HER2 Overexpression
    type: RelationshipType.INTERACTS_WITH,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Pertuzumab binds to a different epitope of HER2 than trastuzumab, preventing HER2 from dimerizing with other HER receptors.',
    bidirectional: true,
    weight: 90,
    citations: [
      {
        sourceId: 'pmid-20453099',
        title: 'Pertuzumab: a review of its use in the treatment of HER2-positive breast cancer',
        authors: ['Harbeck N', 'Beckmann MW', 'Rody A'],
        publicationDate: '2013-06-01',
        journal: 'Cancer Treatment Reviews',
        doi: '10.1016/j.ctrv.2012.03.001',
        credibilityScore: 88,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-7',
    source: 'tr-2', // Trastuzumab
    target: 'tr-3', // Pertuzumab
    type: RelationshipType.AUGMENTS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'The combination of trastuzumab and pertuzumab provides more complete blockade of HER2 signaling than either agent alone.',
    bidirectional: true,
    weight: 88,
    citations: [
      {
        sourceId: 'pmid-2382114',
        title: 'Pertuzumab, trastuzumab, and docetaxel in HER2-positive metastatic breast cancer',
        authors: ['Swain SM', 'Kim SB', 'Cortés J'],
        publicationDate: '2013-07-02',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa1402678',
        credibilityScore: 95,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-8',
    source: 'tr-1', // Mastectomy
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Mastectomy is an effective surgical treatment for breast cancer, especially in early stages.',
    bidirectional: false,
    weight: 85,
    citations: [
      {
        sourceId: 'pmid-12237281',
        title: 'Twenty-year follow-up of a randomized trial comparing total mastectomy, lumpectomy, and lumpectomy plus irradiation for the treatment of invasive breast cancer',
        authors: ['Fisher B', 'Anderson S', 'Bryant J'],
        publicationDate: '2002-10-17',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa022152',
        credibilityScore: 92,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-9',
    source: 'tr-1', // Mastectomy
    target: 'mc-9', // Lymphedema
    type: RelationshipType.CAUSES,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'Mastectomy with axillary lymph node dissection can cause lymphedema in some patients.',
    bidirectional: false,
    weight: 60,
    temporalPattern: 'CHRONIC',
    citations: [
      {
        sourceId: 'pmid-19652073',
        title: 'Lymphedema in breast cancer survivors: incidence, degree, time course, treatment, and symptoms',
        authors: ['Norman SA', 'Localio AR', 'Potashnik SL'],
        publicationDate: '2009-07-15',
        journal: 'Journal of Clinical Oncology',
        doi: '10.1200/JCO.2008.20.9288',
        credibilityScore: 85,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-10',
    source: 'tr-7', // Sacituzumab Govitecan
    target: 'mc-3', // Triple-Negative Breast Cancer
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'Sacituzumab govitecan improves outcomes in previously treated metastatic triple-negative breast cancer.',
    bidirectional: false,
    weight: 75,
    citations: [
      {
        sourceId: 'pmid-31851799',
        title: 'Sacituzumab Govitecan-hziy in Refractory Metastatic Triple-Negative Breast Cancer',
        authors: ['Bardia A', 'Mayer IA', 'Vahdat LT'],
        publicationDate: '2019-02-21',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa1814213',
        credibilityScore: 90,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-11',
    source: 'tr-8', // Olaparib
    target: 'mc-5', // BRCA1 Mutation
    type: RelationshipType.INTERACTS_WITH,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Olaparib exploits synthetic lethality in BRCA1-mutated cancer cells by inhibiting PARP enzymes.',
    bidirectional: true,
    weight: 90,
    citations: [
      {
        sourceId: 'pmid-29581462',
        title: 'PARP inhibition: PARP1 and beyond',
        authors: ['Lord CJ', 'Ashworth A'],
        publicationDate: '2017-02-24',
        journal: 'Nature Reviews Cancer',
        doi: '10.1038/nrc.2017.110',
        credibilityScore: 92,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-12',
    source: 'tr-8', // Olaparib
    target: 'mc-6', // BRCA2 Mutation
    type: RelationshipType.INTERACTS_WITH,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Olaparib exploits synthetic lethality in BRCA2-mutated cancer cells by inhibiting PARP enzymes.',
    bidirectional: true,
    weight: 90,
    citations: [
      {
        sourceId: 'pmid-25195086',
        title: 'Olaparib for Metastatic Breast Cancer in Patients with a Germline BRCA Mutation',
        authors: ['Robson M', 'Im SA', 'Senkus E'],
        publicationDate: '2017-08-10',
        journal: 'New England Journal of Medicine',
        doi: '10.1056/NEJMoa1706450',
        credibilityScore: 93,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-13',
    source: 'mc-5', // BRCA1 Mutation
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.CAUSES,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'BRCA1 mutations significantly increase the lifetime risk of developing breast cancer.',
    bidirectional: false,
    weight: 85,
    citations: [
      {
        sourceId: 'pmid-23613926',
        title: 'Average Risks of Breast and Ovarian Cancer Associated with BRCA1 or BRCA2 Mutations',
        authors: ['Kuchenbaecker KB', 'Hopper JL', 'Barnes DR'],
        publicationDate: '2017-06-20',
        journal: 'JAMA',
        doi: '10.1001/jama.2017.7112',
        credibilityScore: 95,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-14',
    source: 'mc-6', // BRCA2 Mutation
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.CAUSES,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'BRCA2 mutations significantly increase the lifetime risk of developing breast cancer.',
    bidirectional: false,
    weight: 80,
    citations: [
      {
        sourceId: 'pmid-23613927',
        title: 'Meta-analysis of BRCA1 and BRCA2 penetrance',
        authors: ['Chen S', 'Parmigiani G'],
        publicationDate: '2007-04-01',
        journal: 'Journal of Clinical Oncology',
        doi: '10.1200/JCO.2006.09.1066',
        credibilityScore: 90,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-15',
    source: 'mc-8', // Breast Lump
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.INDICATES,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'A breast lump may be a symptom of breast cancer, although many breast lumps are benign.',
    bidirectional: false,
    weight: 65,
    citations: [
      {
        sourceId: 'pmid-29932959',
        title: 'Clinical Symptoms and Physical Findings in Breast Cancer Patients',
        authors: ['Walsh T', 'Casadei S', 'Coats KH'],
        publicationDate: '2018-03-01',
        journal: 'British Journal of Cancer',
        credibilityScore: 85,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-16',
    source: 'tr-5', // Tamoxifen
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.PREVENTS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Tamoxifen can reduce the risk of breast cancer in high-risk women and prevent recurrence in those with hormone receptor-positive breast cancer.',
    bidirectional: false,
    weight: 80,
    citations: [
      {
        sourceId: 'pmid-9671330',
        title: 'Tamoxifen for prevention of breast cancer: report of the National Surgical Adjuvant Breast and Bowel Project P-1 Study',
        authors: ['Fisher B', 'Costantino JP', 'Wickerham DL'],
        publicationDate: '1998-09-16',
        journal: 'Journal of the National Cancer Institute',
        doi: '10.1093/jnci/90.18.1371',
        credibilityScore: 92,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-17',
    source: 'mc-7', // Cancer Cell Proliferation
    target: 'mc-10', // Tumor Metastasis
    type: RelationshipType.CAUSES,
    evidenceStrength: EvidenceStrength.MODERATE,
    description: 'Uncontrolled cancer cell proliferation is a key factor leading to tumor growth and eventual metastasis.',
    bidirectional: false,
    weight: 75,
    citations: [
      {
        sourceId: 'pmid-22419067',
        title: 'Hallmarks of Cancer: The Next Generation',
        authors: ['Hanahan D', 'Weinberg RA'],
        publicationDate: '2011-03-04',
        journal: 'Cell',
        doi: '10.1016/j.cell.2011.02.013',
        credibilityScore: 98,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-18',
    source: 'tr-6', // Radiation Therapy
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Radiation therapy reduces the risk of breast cancer recurrence after surgery.',
    bidirectional: false,
    weight: 85,
    citations: [
      {
        sourceId: 'pmid-21696308',
        title: 'Effect of radiotherapy after breast-conserving surgery on 10-year recurrence and 15-year breast cancer death',
        authors: ['Early Breast Cancer Trialists\' Collaborative Group'],
        publicationDate: '2011-11-12',
        journal: 'The Lancet',
        doi: '10.1016/S0140-6736(11)61629-2',
        credibilityScore: 95,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-19',
    source: 'tr-4', // Paclitaxel
    target: 'mc-7', // Cancer Cell Proliferation
    type: RelationshipType.PREVENTS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Paclitaxel inhibits cancer cell division by stabilizing microtubules.',
    bidirectional: false,
    weight: 85,
    citations: [
      {
        sourceId: 'pmid-8358726',
        title: 'Taxol: a novel investigational antimicrotubule agent',
        authors: ['Rowinsky EK', 'Donehower RC'],
        publicationDate: '1995-06-15',
        journal: 'Journal of the National Cancer Institute',
        credibilityScore: 88,
        peerReviewed: true
      }
    ]
  },
  {
    id: 'rel-20',
    source: 'tr-4', // Paclitaxel
    target: 'mc-1', // Breast Cancer
    type: RelationshipType.TREATS,
    evidenceStrength: EvidenceStrength.STRONG,
    description: 'Paclitaxel is effective in treating various stages of breast cancer.',
    bidirectional: false,
    weight: 80,
    citations: [
      {
        sourceId: 'pmid-12507806',
        title: 'Randomized trial of paclitaxel versus cyclophosphamide, doxorubicin, and fluorouracil as adjuvant therapy for node-positive, hormone receptor-negative breast cancer',
        authors: ['Henderson IC', 'Berry DA', 'Demetri GD'],
        publicationDate: '2003-06-01',
        journal: 'Journal of Clinical Oncology',
        doi: '10.1200/JCO.2003.02.539',
        credibilityScore: 90,
        peerReviewed: true
      }
    ]
  }
];

// Complete knowledge graph
const oncologyKnowledgeGraph: KnowledgeGraph = {
  id: 'kg-oncology-1',
  name: 'Breast Cancer Treatment Knowledge Graph',
  description: 'A comprehensive knowledge graph showing relationships between breast cancer types, biomarkers, and treatments.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  version: '1.0.0',
  nodes: [...medicalConcepts, ...treatments],
  relationships: relationships,
  focusAreas: ['Oncology', 'Breast Cancer', 'Targeted Therapy', 'Precision Medicine'],
  pharmaCompanies: ['Roche', 'AstraZeneca', 'Bristol-Myers Squibb', 'Gilead Sciences'],
  metadata: {
    lastReviewDate: new Date().toISOString(),
    reviewedBy: 'Medical Knowledge Team',
    sources: ['PubMed', 'Clinical Guidelines', 'FDA Approvals']
  }
};

export default oncologyKnowledgeGraph; 