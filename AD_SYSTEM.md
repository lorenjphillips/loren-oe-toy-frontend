# OpenEvidence Ad Delivery System

This document outlines the architecture and components of the ad delivery system for OpenEvidence, a medical question-answering platform for physicians.

## System Architecture

The ad system consists of three main components:

1. **Question Classifier Service**: Uses OpenAI to classify medical questions into relevant categories
2. **Ad Delivery System**: Matches medical categories to appropriate advertisements
3. **Analytics Collection System**: Tracks impressions, clicks, and conversions

## Key Features

- Category-based ad matching using AI question classification
- Real-time ad delivery based on question content
- Analytics tracking for ad performance
- Admin interface for ad management
- Privacy-focused user tracking

## Components

### Question Classifier Service

Located in `services/classifierService.ts`, this service:
- Analyzes medical questions using OpenAI
- Classifies them into predefined medical categories
- Extracts relevant keywords
- Provides confidence scores for each category

### Ad Delivery System

Core functionality in `services/adService.ts` with:
- Repository for ad storage (`data/adRepository.ts`)
- Matching algorithm to find the most relevant ad
- Priority-based ad selection
- Date range filtering

### Analytics Collection System

Implemented in `services/analyticsService.ts`:
- Tracks impressions when ads are shown
- Records clicks when users interact with ads
- Captures conversion events
- Supports filtering and reporting

## API Endpoints

- `/api/ads`: Main endpoint for fetching relevant ads
- `/api/ads/click`: Tracks ad clicks
- `/api/admin/ads`: Admin endpoints for managing ads
- `/api/admin/categories`: Endpoints for category management

## React Components

- `AdDisplay.tsx`: Client-side component for rendering ads
- `AdManager.tsx`: Admin component for managing ads

## Environment Variables

The system requires the following environment variables:

```
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o
AD_ANALYTICS_ENABLED=true
AD_MAX_SLOTS_PER_PAGE=2
AD_REFRESH_INTERVAL=60000
AD_MIN_CONFIDENCE_THRESHOLD=0.25
```

See `.env.local.example` for a complete list.

## Getting Started

1. Copy `.env.local.example` to `.env.local` and add your OpenAI API key
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Navigate to http://localhost:3000 to see the application

## Future Enhancements

- User segmentation for more targeted ads
- Machine learning for ad optimization
- A/B testing framework
- Enhanced analytics dashboard
- Integration with external ad networks
- Support for rich media and interactive ads 