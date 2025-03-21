/**
 * Knowledge Graph Data Models
 * Defines the structure for medical concepts, treatments, and their relationships
 */

export enum NodeType {
  MEDICAL_CONCEPT = 'MEDICAL_CONCEPT',
  TREATMENT = 'TREATMENT',
  SYMPTOM = 'SYMPTOM',
  CONDITION = 'CONDITION',
  DRUG = 'DRUG',
  BIOMARKER = 'BIOMARKER',
}

export enum RelationshipType {
  TREATS = 'TREATS',
  CAUSES = 'CAUSES',
  PREVENTS = 'PREVENTS',
  INDICATES = 'INDICATES',
  INTERACTS_WITH = 'INTERACTS_WITH',
  CONTRADICTS = 'CONTRADICTS',
  AUGMENTS = 'AUGMENTS',
  RELATED_TO = 'RELATED_TO',
}

export enum EvidenceStrength {
  STRONG = 'STRONG',
  MODERATE = 'MODERATE',
  LIMITED = 'LIMITED',
  ANECDOTAL = 'ANECDOTAL',
  THEORETICAL = 'THEORETICAL',
}

export interface PharmaAffiliation {
  companyId: string;
  companyName: string;
  relationshipType: 'MANUFACTURER' | 'RESEARCH_SPONSOR' | 'DISTRIBUTOR';
  productName?: string;
}

export interface Citation {
  sourceId: string;
  title: string;
  authors: string[];
  publicationDate: string;
  journal?: string;
  doi?: string;
  url?: string;
  credibilityScore?: number; // 0-100
  peerReviewed: boolean;
}

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  description: string;
  aliases?: string[];
  taxonomyIds?: Record<string, string>; // Maps taxonomy type to ID (e.g., { "ICD10": "R52", "SNOMED": "22253000" })
  relevanceScore?: number; // 0-100
  imageUrl?: string;
  color?: string;
}

export interface MedicalConceptNode extends Node {
  type: NodeType.MEDICAL_CONCEPT | NodeType.SYMPTOM | NodeType.CONDITION | NodeType.BIOMARKER;
  prevalence?: number; // 0-100, percentage of population affected
  severity?: number; // 0-100
}

export interface TreatmentNode extends Node {
  type: NodeType.TREATMENT | NodeType.DRUG;
  pharmaAffiliations: PharmaAffiliation[];
  approvalStatus: 'FDA_APPROVED' | 'EMA_APPROVED' | 'CLINICAL_TRIAL' | 'INVESTIGATIONAL' | 'OFF_LABEL';
  approvalDate?: string;
  mechanism?: string;
  averageCost?: number;
  patientEligibility?: string[];
}

export interface Relationship {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: RelationshipType;
  evidenceStrength: EvidenceStrength;
  description?: string;
  bidirectional: boolean;
  citations: Citation[];
  weight?: number; // 0-100, strength of relationship
  temporalPattern?: 'ACUTE' | 'CHRONIC' | 'INTERMITTENT';
}

export interface KnowledgeGraph {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  nodes: (MedicalConceptNode | TreatmentNode)[];
  relationships: Relationship[];
  focusAreas: string[]; // e.g., "Oncology", "Cardiology", etc.
  pharmaCompanies: string[]; // IDs of pharma companies featured
  metadata?: Record<string, any>;
}

export interface KnowledgeGraphFilters {
  nodeTypes?: NodeType[];
  relationshipTypes?: RelationshipType[];
  evidenceStrengths?: EvidenceStrength[];
  pharmaCompanies?: string[];
  minRelevanceScore?: number;
  maxNodes?: number;
  focusNodeId?: string;
  depthLimit?: number;
} 