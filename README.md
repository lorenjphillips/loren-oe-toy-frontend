# OpenEvidence Pharmaceutical Ad Platform

A comprehensive platform for delivering tailored pharmaceutical advertising to healthcare professionals with integrated analytics and decision support.

## Project Status

### Completed Phases
- **Phase 1: Core Ad Delivery** - Base platform for targeted ad delivery to healthcare professionals
- **Phase 2: Analytics Framework** - Comprehensive framework for measuring advertising effectiveness
- **Phase 3: Knowledge Integration** - Knowledge graph and microsimulation integration

### Current Phase
- **Phase 4: Innovation Layer** - Implementing lightweight versions of clinical decision support and ethical AI guardrails

## Features

### Ad Delivery System
- Targeted ad delivery based on medical specialty and interests
- Company matching with confidence scoring
- Impression tracking and frequency capping
- Treatment category mapping

### Comparison Service
- Calculates relative performance metrics between categories
- Implements statistical significance testing using t-tests
- Normalizes metrics for fair comparison
- Provides trending indicators for changing performance

### Visualization Components
1. **Category Comparison**
   - Compare performance across medical categories
   - Visualize relative changes with statistical significance
   - Interactive tooltips with detailed metrics

2. **Format Comparison**
   - Compare microsimulations vs. knowledge graphs
   - Radar chart visualization for multi-dimensional comparison
   - Confidence intervals for each metric

3. **Time Comparison**
   - Track performance changes over time
   - Trend analysis with statistical significance
   - Confidence bands for uncertainty visualization

4. **Benchmark Comparison**
   - Compare against industry benchmarks
   - Anonymized competitive analysis
   - Error bars for benchmark uncertainty

### Knowledge Integration
- Interactive knowledge graphs for treatment relationships
- Microsimulation for patient outcome visualization
- Scenario-based content delivery

### Innovation Layer (In Progress)
- Clinical decision support integration
- Ethical AI guardrails for content delivery
- Enhanced relevance scoring

## Future Work

### Enhanced Clinical Decision Support
- Integration with clinical practice guidelines
- Personalized recommendation engine
- Treatment comparison tools
- Patient case-based learning modules

### Voice-Activated Engagement
- Natural language interaction with platform
- Voice commands for content navigation
- Hands-free operation for clinical settings
- Voice-triggered microsimulation controls

### Extended Ethical AI Guardrails
- Content bias detection and mitigation
- Transparency reports for algorithm decisions
- User-controlled filtering preferences
- Educational content balance monitoring

### Additional Planned Enhancements
- Multi-modal content delivery optimization
- Longitudinal engagement tracking
- Cross-platform synchronization
- Collaborative filtering recommendation system
- Integration with electronic health record systems

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Comparing Categories
```typescript
import { ComparisonService } from '@/services/analytics/comparison';

const comparisonService = new ComparisonService();
const results = comparisonService.compareCategoryPerformance({
  categoryA: {
    engagement: { value: 0.45, sampleSize: 1000 },
    retention: { value: 0.75, sampleSize: 1000 },
    conversion: { value: 0.25, sampleSize: 1000 },
    satisfaction: { value: 0.85, sampleSize: 1000 }
  },
  categoryB: {
    // ... similar metrics
  }
});
```

### Analyzing Time Trends
```typescript
const trends = comparisonService.calculateTimeTrends([
  { value: 0.45, sampleSize: 1000 },
  { value: 0.48, sampleSize: 1000 },
  { value: 0.52, sampleSize: 1000 }
]);
```

### Segmentation
```typescript
import { SegmentationService } from '@/services/analytics/segmentation';

const segmentationService = new SegmentationService();
const filteredData = segmentationService.applySegmentation(data, {
  timeRange: {
    start: new Date('2023-01-01'),
    end: new Date('2023-12-31')
  },
  categories: ['Oncology', 'Cardiology'],
  formats: ['microsimulation']
});
```

## Architecture

The framework is built with:
- Next.js for the frontend framework
- TypeScript for type safety
- Recharts for data visualization
- jStat for statistical computations
- Zod for data validation
- TailwindCSS for styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
