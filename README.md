# Pharmaceutical Ad Performance Analytics Framework

A comprehensive framework for measuring and comparing the effectiveness of pharmaceutical advertising across different dimensions.

## Features

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

### Segmentation System
- Filter by time period, category, and format
- Create and analyze cohorts
- Support custom segmentation criteria
- Save and manage comparison views

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
