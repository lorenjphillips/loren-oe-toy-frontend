# OpenEvidence Pharmaceutical Ad Platform

A comprehensive platform for delivering tailored pharmaceutical advertising to healthcare professionals with integrated analytics and decision support.

## Quick Start Guide

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your API keys
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Instructions for deploying to Vercel
- [Testing Strategy](./TESTING.md) - Comprehensive testing approach and guidelines
- [Ad System Documentation](./AD_SYSTEM.md) - Details about the ad delivery system
- [Implementation Roadmap](./IMPLEMENATION.md) - Technical implementation plan
- [Layout Documentation](./LAYOUT.md) - Frontend layout design

## Project Structure

```
openevidence-ad-platform/
├── app/                    # Next.js application routes
├── components/             # React components
│   ├── ads/                # Ad-related components
│   ├── analytics/          # Analytics visualization components
│   └── ui/                 # Common UI components
├── services/               # Backend services
│   ├── adService.ts        # Ad delivery service
│   ├── classifierService.ts # Question classification service
│   └── analyticsService.ts # Analytics collection service
├── data/                   # Data models and repositories
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Project Status

### Completed Phases
- **Phase 1: Core Ad Delivery** - Base platform for targeted ad delivery to healthcare professionals
- **Phase 2: Analytics Framework** - Comprehensive framework for measuring advertising effectiveness
- **Phase 3: Knowledge Integration** - Knowledge graph and microsimulation integration

### Current Phase
- **Phase 4: Innovation Layer** - Implementing lightweight versions of clinical decision support and ethical AI guardrails

## Technologies Used

- **Frontend Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Data Visualization**: Recharts, D3.js
- **State Management**: React Context API
- **API Integration**: Axios
- **Statistical Analysis**: jStat
- **PDF Generation**: @react-pdf/renderer
- **TypeScript**: For type safety
- **Testing**: Jest and React Testing Library (planned)

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
