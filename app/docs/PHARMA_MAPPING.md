# Pharmaceutical Company Mapping System

## Overview

The Pharmaceutical Company Mapping System is a core component of the OpenEvidence ad delivery platform. It bridges the gap between medical question classifications and relevant pharmaceutical advertisements by mapping medical topics to the most appropriate pharmaceutical companies and their treatment areas.

## Purpose

This system enables highly targeted advertising by:

1. Taking a classified medical question (from the ML classification service)
2. Determining which pharmaceutical companies specialize in treatments related to that question
3. Prioritizing companies and treatment areas based on relevance scores
4. Providing structured data for ad targeting

## System Components

The mapping system consists of two primary components:

### 1. Pharmaceutical Company Data (`/app/data/pharmaCategories.ts`)

This module defines:

- **Structure for pharmaceutical companies**: Name, ID, focus areas, treatment categories
- **Treatment area definitions**: Categories, subcategories, keywords, flagship medications  
- **Comprehensive mapping data** for Pfizer, Genentech, GSK, and Eli Lilly
- **Utility functions** for querying companies by category, ID, etc.

### 2. Ad Mapping Service (`/app/services/adMapping.ts`)

This service provides:

- **Advanced mapping algorithm**: Maps medical classifications to relevant pharmaceutical companies
- **Scoring system**: Calculates relevance scores based on multiple factors
- **Prioritization**: Ranks matches by relevance to show most appropriate ads first
- **Detailed match information**: Provides transparency into why a company was matched

## Key Features

- **Multi-factor matching**: Considers primary category, subcategory, keywords, and medications
- **Weighted scoring**: Different match types contribute different weights to the final score
- **Configurable thresholds**: Minimum score requirements can be adjusted
- **Treatment area prioritization**: Companies' strategic focus areas are given higher priority
- **Detailed match explanations**: Each match includes information about which elements matched
- **Extensive test coverage**: Comprehensive test suite for validation

## Example Usage

```typescript
import { classifyMedicalQuestion } from '../services/classification';
import { mapQuestionToCompanies } from '../services/adMapping';

// Step 1: Classify a medical question
const classification = await classifyMedicalQuestion(
  "What are the latest treatments for HER2+ breast cancer?"
);

// Step 2: Map to pharmaceutical companies
const mappingResult = mapQuestionToCompanies(classification, {
  minScore: 40,  // Only return matches with score ≥ 40
  maxResults: 3  // Return up to 3 top matches
});

// Step 3: Use mapping result for ad targeting
console.log(`Top match: ${mappingResult.topMatch?.company.name}`);
console.log(`Score: ${mappingResult.topMatch?.score}`);

// Get treatment area IDs for ad targeting
const targetingCategories = mappingResult.matches.map(
  match => match.treatmentArea.id
);

// Get company IDs for reporting
const companyIds = [...new Set(
  mappingResult.matches.map(match => match.company.id)
)];
```

## Company Treatment Areas

The system includes detailed treatment areas for each pharmaceutical company:

### Pfizer
- **Oncology**: Breast cancer, lung cancer, prostate cancer
- **Immunology**: Rheumatoid arthritis, psoriasis
- **Vaccines**: COVID-19, pneumococcal disease
- **Rare Diseases**: Hemophilia, transthyretin amyloidosis

### Genentech
- **Oncology**: Breast cancer, lung cancer, hematologic malignancies
- **Ophthalmology**: Macular degeneration, diabetic retinopathy
- **Immunology**: Multiple sclerosis, asthma
- **Neuroscience**: Alzheimer's, Parkinson's

### GSK
- **Respiratory**: Asthma, COPD, pulmonary fibrosis
- **Immunology**: Lupus, rheumatoid arthritis
- **Infectious Diseases**: HIV, TB, malaria
- **Vaccines**: Shingles, RSV, meningitis

### Eli Lilly
- **Endocrinology**: Diabetes, obesity
- **Neurology**: Alzheimer's, migraine
- **Oncology**: Gastrointestinal cancer, sarcoma
- **Immunology**: Rheumatoid arthritis, psoriatic arthritis

## Scoring System

The mapping algorithm scores matches based on:

| Match Type | Score Contribution | Notes |
|------------|-------------------|-------|
| Primary Category | 50 points | Basic qualification |
| Subcategory | 30 points | Specific condition match |
| Keyword | 5 points each | Terminology match |
| Medication | 15 points each | Significant indicator |
| Treatment Area Priority | Multiplier | Higher priority areas get boost |

## Testing

A comprehensive test suite is available in `/app/services/adMapping.test.ts`. This includes test cases covering various medical specialties and expected company matches.

## Integration with Ad System

The mapping system integrates with the broader ad system by:

1. Using the output of the classification service as input
2. Providing structured targeting data for the ad delivery service
3. Supporting analytics by tracking which companies' ads are shown

## Future Enhancements

- Additional pharmaceutical companies can be added to `pharmaCategories.ts`
- Machine learning could refine the scoring algorithm based on ad performance
- User feedback mechanisms could improve mapping accuracy
- Support for market-specific variations in company treatment areas 