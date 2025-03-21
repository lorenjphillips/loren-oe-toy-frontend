# Clinical Decision Support Services

This directory contains services for the Clinical Decision Support feature in Phase 4 of the OpenEvidence platform.

## Purpose

These services provide the backend logic for retrieving, analyzing, and delivering clinical evidence and guidelines to enhance the decision-making process for healthcare professionals.

## Services

- **evidenceService.ts**: Fetches and filters clinical evidence from sources
- **guidelineService.ts**: Retrieves relevant clinical guidelines
- **decisionSupportService.ts**: Core service integrating evidence with ad content
- **clinicalContextService.ts**: Analyzes user context for relevance
- **evidenceRankingService.ts**: Ranks evidence by relevance and quality

## Implementation Plan

1. Basic evidence retrieval services
2. Integration with ad content service
3. Context-aware evidence recommendation
4. Evidence quality assessment

## Usage

Services in this directory should:
- Follow TypeScript interfaces defined in `app/models/clinical-support.ts`
- Use dependency injection for testability
- Include comprehensive error handling
- Be well-documented with JSDoc
- Include unit tests

## Integration Points

- Ad Content Service
- User Context
- Classification Service
- External evidence APIs

## Future Enhancements

- Real-time evidence updates
- Machine learning for relevance scoring
- Integration with electronic health record systems
- Personalized evidence recommendations 