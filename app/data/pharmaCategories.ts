/**
 * Interfaces for pharma company category mapping
 */

/**
 * Treatment area for a pharmaceutical company
 */
export interface PharmaTreatmentArea {
  id: string;                // Unique identifier for the treatment area
  category: string;          // Main medical category (e.g., "oncology")
  subcategories: string[];   // Specific subcategories (e.g., ["breast_cancer", "lung_cancer"])
  keywords: string[];        // Related keywords for matching
  flagship_medications: string[]; // Key medications in this treatment area
  priority: number;          // Priority ranking (higher = more important for company)
}

/**
 * Pharmaceutical company profile
 */
export interface PharmaCompany {
  id: string;                // Company identifier
  name: string;              // Company name
  logo_url?: string;         // URL to company logo
  treatment_areas: PharmaTreatmentArea[]; // Treatment areas for this company
  keywords: string[];        // Company-specific keywords
}

/**
 * Pharmaceutical company database
 */
export const PHARMA_COMPANIES: PharmaCompany[] = [
  {
    id: "pfizer",
    name: "Pfizer",
    logo_url: "/logos/pfizer.png",
    keywords: ["pfizer", "pfe", "xeljanz", "ibrance", "prevnar", "xtandi"],
    treatment_areas: [
      {
        id: "pfizer_oncology",
        category: "oncology",
        subcategories: ["breast_cancer", "lung_cancer", "prostate_cancer"],
        keywords: ["breast cancer", "lung cancer", "metastatic", "carcinoma", "ibrance", "xtandi"],
        flagship_medications: ["Ibrance", "Xtandi", "Xalkori"],
        priority: 9
      },
      {
        id: "pfizer_immunology",
        category: "rheumatology",
        subcategories: ["rheumatoid_arthritis", "psoriatic_arthritis"],
        keywords: ["rheumatoid arthritis", "psoriatic arthritis", "RA", "joint pain", "autoimmune", "xeljanz"],
        flagship_medications: ["Xeljanz", "Enbrel"],
        priority: 8
      },
      {
        id: "pfizer_vaccines",
        category: "infectious_diseases",
        subcategories: ["covid19", "pneumonia"],
        keywords: ["vaccine", "immunization", "covid", "pneumonia", "prevnar"],
        flagship_medications: ["Prevnar", "Comirnaty"],
        priority: 7
      }
    ]
  },
  
  {
    id: "genentech",
    name: "Genentech",
    logo_url: "/logos/genentech.png",
    keywords: ["genentech", "roche", "avastin", "herceptin", "tecentriq", "ocrevus"],
    treatment_areas: [
      {
        id: "genentech_oncology",
        category: "oncology",
        subcategories: ["breast_cancer", "pancreatic_cancer", "lung_cancer"],
        keywords: ["breast cancer", "pancreatic cancer", "targeted therapy", "herceptin", "avastin"],
        flagship_medications: ["Herceptin", "Avastin", "Tecentriq", "Kadcyla"],
        priority: 10
      },
      {
        id: "genentech_ophthalmology",
        category: "ophthalmology",
        subcategories: ["macular_degeneration", "diabetic_retinopathy"],
        keywords: ["macular degeneration", "AMD", "wet AMD", "vision loss", "lucentis"],
        flagship_medications: ["Lucentis", "Vabysmo"],
        priority: 8
      },
      {
        id: "genentech_neurology",
        category: "neurology",
        subcategories: ["multiple_sclerosis"],
        keywords: ["multiple sclerosis", "MS", "ocrevus"],
        flagship_medications: ["Ocrevus", "Rituxan"],
        priority: 7
      }
    ]
  },
  
  {
    id: "gsk",
    name: "GlaxoSmithKline",
    logo_url: "/logos/gsk.png",
    keywords: ["gsk", "glaxosmithkline", "advair", "trelegy", "nucala", "benlysta"],
    treatment_areas: [
      {
        id: "gsk_respiratory",
        category: "pulmonology",
        subcategories: ["asthma", "copd"],
        keywords: ["asthma", "COPD", "chronic obstructive pulmonary disease", "respiratory", "breathing", "advair", "trelegy", "nucala"],
        flagship_medications: ["Advair", "Trelegy", "Nucala"],
        priority: 10
      },
      {
        id: "gsk_immunology",
        category: "rheumatology",
        subcategories: ["lupus"],
        keywords: ["lupus", "SLE", "systemic lupus erythematosus", "autoimmune", "benlysta"],
        flagship_medications: ["Benlysta"],
        priority: 8
      },
      {
        id: "gsk_vaccines",
        category: "infectious_diseases",
        subcategories: ["influenza", "meningitis", "shingles"],
        keywords: ["vaccine", "shingles", "flu", "influenza", "shingrix"],
        flagship_medications: ["Shingrix", "Bexsero", "Fluarix"],
        priority: 9
      }
    ]
  },
  
  {
    id: "lilly",
    name: "Eli Lilly",
    logo_url: "/logos/lilly.png",
    keywords: ["eli lilly", "lilly", "trulicity", "humalog", "jardiance", "taltz", "olumiant"],
    treatment_areas: [
      {
        id: "lilly_endocrinology",
        category: "endocrinology",
        subcategories: ["diabetes", "obesity"],
        keywords: ["diabetes", "type 2 diabetes", "T2D", "insulin", "GLP-1", "trulicity", "humalog", "jardiance", "mounjaro"],
        flagship_medications: ["Trulicity", "Humalog", "Jardiance", "Mounjaro"],
        priority: 10
      },
      {
        id: "lilly_neurology",
        category: "neurology",
        subcategories: ["alzheimers", "migraine"],
        keywords: ["alzheimer's", "dementia", "cognitive decline", "amyloid", "donanemab", "migraine", "emgality"],
        flagship_medications: ["Donanemab", "Emgality"],
        priority: 9
      },
      {
        id: "lilly_immunology",
        category: "rheumatology",
        subcategories: ["rheumatoid_arthritis", "psoriasis"],
        keywords: ["rheumatoid arthritis", "psoriasis", "psoriatic arthritis", "taltz", "olumiant"],
        flagship_medications: ["Taltz", "Olumiant"],
        priority: 7
      }
    ]
  }
];

/**
 * Map of medical categories to subcategories
 * This helps with fallback matching when exact subcategories aren't found
 */
export const MEDICAL_CATEGORY_MAP: Record<string, string[]> = {
  oncology: ["breast_cancer", "lung_cancer", "pancreatic_cancer", "prostate_cancer", "colorectal_cancer"],
  rheumatology: ["rheumatoid_arthritis", "osteoarthritis", "lupus", "gout", "psoriatic_arthritis"],
  pulmonology: ["asthma", "copd", "pneumonia", "pulmonary_fibrosis", "sleep_apnea"],
  endocrinology: ["diabetes", "thyroid_disorders", "adrenal_disorders", "obesity", "pituitary_disorders"],
  neurology: ["alzheimers", "multiple_sclerosis", "parkinsons", "migraine", "epilepsy", "stroke"],
  ophthalmology: ["macular_degeneration", "glaucoma", "diabetic_retinopathy", "cataracts", "dry_eye"],
  infectious_diseases: ["covid19", "influenza", "hiv", "hepatitis_c", "tuberculosis", "meningitis", "shingles"]
};

/**
 * Find a company by ID
 */
export function getCompanyById(id: string): PharmaCompany | undefined {
  return PHARMA_COMPANIES.find(company => company.id === id);
}

/**
 * Get all treatment areas for a specific category across all companies
 */
export function getTreatmentAreasByCategory(category: string): PharmaTreatmentArea[] {
  return PHARMA_COMPANIES.flatMap(company => 
    company.treatment_areas.filter(area => area.category === category)
  );
}

/**
 * Get all companies that focus on a specific medical category
 */
export function getCompaniesByCategory(category: string): PharmaCompany[] {
  return PHARMA_COMPANIES.filter(company => 
    company.treatment_areas.some(area => area.category === category)
  );
} 