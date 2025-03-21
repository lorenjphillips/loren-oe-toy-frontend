/**
 * Sample Citations Data
 * 
 * Contains properly formatted citations for clinical evidence and guidelines
 * in various citation styles for consistent reference formatting.
 */

import { CitationFormat } from '../../services/clinical-support/evidenceService';

/**
 * Citation interface
 */
export interface Citation {
  id: string;
  sourceId: string;  // ID of the study or guideline
  format: CitationFormat;
  formattedCitation: string;
}

/**
 * Sample formatted citations for studies and guidelines
 */
export const citations: Citation[] = [
  // AMA Format Citations
  {
    id: 'cit-cv-001-ama',
    sourceId: 'cv-study-001',
    format: CitationFormat.AMA,
    formattedCitation: 'Journal of the American College of Cardiology. Comparative Effectiveness of Oral Anticoagulants in Atrial Fibrillation. Published June 15, 2023. Accessed August 30, 2023.'
  },
  {
    id: 'cit-cv-002-ama',
    sourceId: 'cv-study-002',
    format: CitationFormat.AMA,
    formattedCitation: 'New England Journal of Medicine. Long-term Outcomes of Statin Therapy in Primary Prevention. Published March 22, 2023. Accessed August 30, 2023.'
  },
  {
    id: 'cit-onc-001-ama',
    sourceId: 'onc-study-001',
    format: CitationFormat.AMA,
    formattedCitation: 'The Lancet Oncology. Immunotherapy plus Chemotherapy in Advanced Non-Small-Cell Lung Cancer. Published May 10, 2023. Accessed August 30, 2023.'
  },
  {
    id: 'cit-neuro-001-ama',
    sourceId: 'neuro-study-001',
    format: CitationFormat.AMA,
    formattedCitation: 'JAMA Neurology. Novel Disease-Modifying Therapies for Alzheimer\'s Disease. Published July 5, 2023. Accessed August 30, 2023.'
  },
  {
    id: 'cit-guide-cv-001-ama',
    sourceId: 'cv-guide-001',
    format: CitationFormat.AMA,
    formattedCitation: 'American Heart Association. Guidelines for Management of Hypertension in Adults. Published January 15, 2023. Accessed August 30, 2023.'
  },
  {
    id: 'cit-guide-onc-001-ama',
    sourceId: 'onc-guide-001',
    format: CitationFormat.AMA,
    formattedCitation: 'National Comprehensive Cancer Network. Guidelines for Breast Cancer Screening and Diagnosis. Published March 10, 2023. Accessed August 30, 2023.'
  },
  
  // APA Format Citations
  {
    id: 'cit-cv-001-apa',
    sourceId: 'cv-study-001',
    format: CitationFormat.APA,
    formattedCitation: 'Journal of the American College of Cardiology. (2023, June 15). Comparative Effectiveness of Oral Anticoagulants in Atrial Fibrillation.'
  },
  {
    id: 'cit-cv-002-apa',
    sourceId: 'cv-study-002',
    format: CitationFormat.APA,
    formattedCitation: 'New England Journal of Medicine. (2023, March 22). Long-term Outcomes of Statin Therapy in Primary Prevention.'
  },
  {
    id: 'cit-onc-001-apa',
    sourceId: 'onc-study-001',
    format: CitationFormat.APA,
    formattedCitation: 'The Lancet Oncology. (2023, May 10). Immunotherapy plus Chemotherapy in Advanced Non-Small-Cell Lung Cancer.'
  },
  {
    id: 'cit-guide-cv-001-apa',
    sourceId: 'cv-guide-001',
    format: CitationFormat.APA,
    formattedCitation: 'American Heart Association. (2023, January 15). Guidelines for Management of Hypertension in Adults.'
  },
  
  // Vancouver Format Citations
  {
    id: 'cit-cv-001-van',
    sourceId: 'cv-study-001',
    format: CitationFormat.VANCOUVER,
    formattedCitation: 'Journal of the American College of Cardiology. Comparative Effectiveness of Oral Anticoagulants in Atrial Fibrillation. 2023 June 15.'
  },
  {
    id: 'cit-cv-002-van',
    sourceId: 'cv-study-002',
    format: CitationFormat.VANCOUVER,
    formattedCitation: 'New England Journal of Medicine. Long-term Outcomes of Statin Therapy in Primary Prevention. 2023 March 22.'
  },
  {
    id: 'cit-guide-cv-001-van',
    sourceId: 'cv-guide-001',
    format: CitationFormat.VANCOUVER,
    formattedCitation: 'American Heart Association. Guidelines for Management of Hypertension in Adults. 2023 January 15.'
  },
  
  // Harvard Format Citations
  {
    id: 'cit-cv-001-harv',
    sourceId: 'cv-study-001',
    format: CitationFormat.HARVARD,
    formattedCitation: 'Journal of the American College of Cardiology (2023) Comparative Effectiveness of Oral Anticoagulants in Atrial Fibrillation, 15 June.'
  },
  {
    id: 'cit-cv-002-harv',
    sourceId: 'cv-study-002',
    format: CitationFormat.HARVARD,
    formattedCitation: 'New England Journal of Medicine (2023) Long-term Outcomes of Statin Therapy in Primary Prevention, 22 March.'
  },
  {
    id: 'cit-guide-cv-001-harv',
    sourceId: 'cv-guide-001',
    format: CitationFormat.HARVARD,
    formattedCitation: 'American Heart Association (2023) Guidelines for Management of Hypertension in Adults, 15 January.'
  },
  
  // Plain Format Citations
  {
    id: 'cit-cv-001-plain',
    sourceId: 'cv-study-001',
    format: CitationFormat.PLAIN,
    formattedCitation: 'Comparative Effectiveness of Oral Anticoagulants in Atrial Fibrillation - Journal of the American College of Cardiology, June 15, 2023'
  },
  {
    id: 'cit-cv-002-plain',
    sourceId: 'cv-study-002',
    format: CitationFormat.PLAIN,
    formattedCitation: 'Long-term Outcomes of Statin Therapy in Primary Prevention - New England Journal of Medicine, March 22, 2023'
  },
  {
    id: 'cit-guide-cv-001-plain',
    sourceId: 'cv-guide-001',
    format: CitationFormat.PLAIN,
    formattedCitation: 'Guidelines for Management of Hypertension in Adults - American Heart Association, January 15, 2023'
  }
]; 