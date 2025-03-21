# Confidence Scoring System for Ad Relevance

This document explains the advanced confidence scoring system that enhances the pharmaceutical ad targeting system. The scoring system ensures we only show ads when they are truly relevant to physicians' questions.

## Overview

The confidence scoring system uses multiple factors to assess the relevance of pharmaceutical ads to medical questions. It builds upon the initial mapping between medical classifications and pharmaceutical companies, adding a layer of confidence assessment that considers:

1. Direct category match confidence
2. Semantic similarity (using OpenAI embeddings)
3. Question specificity
4. Clinical context indicators
5. Keyword relevance
6. Medication match strength

## Integration Points

The confidence scoring system integrates with the existing ad delivery pipeline:

```
Question → Classification → Company Mapping → Confidence Scoring → Ad Decision
```

## Confidence Factors

The system considers multiple factors when determining confidence:

### 1. Category Match Score (25% weight)
- How well the question's medical category matches the treatment area
- Higher scores for exact subcategory matches
- Considers classification confidence

### 2. Semantic Similarity Score (20% weight)
- Measures semantic similarity between the question and treatment area
- Uses OpenAI embeddings and cosine similarity
- Captures relationships not obvious from keyword matching

### 3. Question Specificity Score (15% weight)
- Assesses how specific or general the question is
- Higher scores for precise, detailed questions
- Lower scores for general overviews or ambiguous questions

### 4. Clinical Context Score (20% weight)
- Identifies treatment-focused and clinical practice questions
- Looks for indicators like "dosage," "treatment," "efficacy"
- Higher scores for questions with strong clinical relevance

### 5. Keyword Relevance Score (10% weight)
- Measures the significance of matching keywords
- Considers proportion of matched keywords to total keywords

### 6. Medication Match Score (10% weight)
- Measures the strength of medication matches
- Higher scores when medications mentioned in the question match flagship medications

## Threshold-Based Decision Making

The system uses a configurable confidence threshold (default 0.65) to determine if an ad should be shown:

- **High Confidence (>0.75)**: Strong recommendation to show an ad
- **Medium Confidence (0.65-0.75)**: Acceptable to show an ad
- **Low Confidence (<0.65)**: Not recommended to show an ad

## Example Use Cases

### High Confidence Example:
> "What is the latest evidence on sacubitril/valsartan in patients with HFrEF who are already on optimal medical therapy?"

This question will receive high confidence because:
- It mentions specific medications (sacubitril/valsartan)
- It's very specific about a condition (HFrEF)
- It has clear clinical context (therapy)
- It uses technical medical terminology

### Low Confidence Example:
> "What are common side effects?"

This question will receive low confidence because:
- It's extremely general
- Lacks specific medical context
- No medication mentions
- No clear category or subcategory

## Implementation Details

### Embedding Generation
The system uses OpenAI's text-embedding-3-small model to generate vector embeddings for:
- The physician's question
- Treatment areas of pharmaceutical companies

### Cosine Similarity
Semantic similarity is calculated using cosine similarity between the question embedding and treatment area embeddings.

### Error Handling
The system gracefully degrades when embedding generation fails, falling back to other confidence factors.

## Configuration Options

The confidence scoring system accepts the following configuration options:

- `confidenceThreshold`: Minimum confidence to recommend showing an ad (default: 0.65)
- `semanticAnalysis`: Whether to use semantic similarity analysis (default: true)
- `model`: OpenAI model to use for embeddings (default: 'text-embedding-3-small')
- `debug`: Whether to include embedding vectors in results for debugging (default: false)

## Usage Example

```typescript
import { classifyMedicalQuestion } from '../services/classification';
import { mapQuestionToCompanies } from '../services/adMapping';
import { enhanceMappingConfidence, shouldShowAd } from '../services/confidenceScoring';

async function determineAdRelevance(question: string) {
  // Step 1: Classify the question
  const classification = await classifyMedicalQuestion(question);
  
  // Step 2: Map to pharmaceutical companies
  const mappingResult = mapQuestionToCompanies(classification);
  
  // Step 3: Enhance with confidence scoring
  const enhancedMapping = await enhanceMappingConfidence(
    mappingResult, 
    question,
    { confidenceThreshold: 0.7 } // Custom threshold
  );
  
  // Step 4: Determine if we should show an ad
  const showAd = shouldShowAd(enhancedMapping);
  
  return {
    showAd,
    confidence: enhancedMapping.overallConfidence,
    topMatch: enhancedMapping.topMatch
  };
}
```

## Testing

The confidence scoring system includes comprehensive tests covering:
- High/medium/low confidence scenarios
- Specific and general questions
- Clinical context detection
- Semantic similarity calculation

## Performance Considerations

- Embedding generation adds additional latency (typically 200-400ms)
- Consider caching question embeddings for frequently asked questions
- The `semanticAnalysis` option can be disabled for lower latency in time-sensitive contexts 