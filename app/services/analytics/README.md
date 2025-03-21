# OpenEvidence Analytics System

## Overview

The OpenEvidence Analytics System is designed to track user interactions with the platform, with a specific focus on pharmaceutical ad impressions, engagements, and contextual relevance. The system is built to be:

- **HIPAA-Compliant**: All personally identifiable information is anonymized or removed
- **Privacy-First**: Data collection follows a privacy-by-design approach
- **Efficient**: Uses local storage with batch processing to minimize API calls
- **Comprehensive**: Tracks impressions, engagements, user journeys, and medical context

## Architecture

The analytics system consists of several interconnected components:

### Data Models
- `AnalyticsEvent.ts` - Core event model and utilities
- `ImpressionMetrics.ts` - Ad impression tracking
- `EngagementMetrics.ts` - User engagement with ads
- `QuestionContextMetrics.ts` - Medical context analysis
- `UserJourneyMetrics.ts` - Session and flow tracking

### Data Storage
- `dataStore.ts` - IndexedDB storage, batch processing, and API syncing

### Processors
- `ImpressionProcessor.ts` - Tracks when and how ads are displayed
- `EngagementProcessor.ts` - Measures meaningful user interactions
- `ContextProcessor.ts` - Analyzes medical context and relevance
- `JourneyProcessor.ts` - Tracks user journeys while maintaining privacy

### Main Service
- `index.ts` - Unified API for application integration

## Usage

### Initialization

```typescript
import * as Analytics from 'app/services/analytics';

// Initialize with custom configuration
Analytics.initialize({
  privacyCompliant: true,
  syncInterval: 60,  // seconds
  batchSize: 20,
  autoTimeoutMinutes: 30,
  retentionDays: 90,
  apiEndpoint: '/api/analytics',
  autoStartSession: true
});
```

### Tracking Page Views

```typescript
import { PageType } from 'app/models/analytics/UserJourneyMetrics';

Analytics.trackPageView('question-123', PageType.QUESTION);
```

### Tracking Questions

```typescript
Analytics.trackQuestion('q-123', 'What are the latest treatments for rheumatoid arthritis?');
```

### Tracking Ad Impressions

```typescript
// When an ad is displayed
const impressionId = Analytics.trackAd(
  adContent.id,
  adContent,
  'sidebar',
  { questionId: currentQuestionId }
);

// When a user interacts with an ad
const engagementId = Analytics.trackAdInteraction(
  adContent.id,
  impressionId,
  'cta_click',
  { ctaType: 'learn_more' }
);

// When an engagement is completed
Analytics.completeAdInteraction(engagementId, { completed: true });
```

### Session Management

```typescript
// Start a new session (if not using autoStartSession)
const sessionId = Analytics.startSession();

// End the current session
Analytics.endSession('user_logout');
```

## Privacy Features

1. **Anonymization**: All events are anonymized before storage
2. **Sanitization**: PII/PHI is filtered out of all metadata
3. **Configurability**: Privacy levels can be adjusted based on requirements
4. **Data Retention**: Automatic cleanup of old data based on retention policy

## Metrics & Aggregation

The system automatically calculates and updates aggregate metrics for:

- Impression quality, viewability, and context relevance
- Engagement depth, completion rates, and conversion rates
- User journey patterns, including bounce rates and page flow
- Medical context distribution across specialties, treatments, and conditions

These aggregates are stored locally and can be queried for real-time dashboards or synced to a backend service for broader analytics.

## Dependencies

- `idb`: For IndexedDB access
- `uuid`: For generating unique identifiers

## File Structure

```
app/
├── models/
│   └── analytics/
│       ├── index.ts
│       ├── AnalyticsEvent.ts
│       ├── ImpressionMetrics.ts
│       ├── EngagementMetrics.ts
│       ├── QuestionContextMetrics.ts
│       └── UserJourneyMetrics.ts
└── services/
    └── analytics/
        ├── index.ts
        ├── dataStore.ts
        └── processors/
            ├── AnalyticsProcessorIndex.ts
            ├── ImpressionProcessor.ts
            ├── EngagementProcessor.ts
            ├── ContextProcessor.ts
            └── JourneyProcessor.ts
``` 