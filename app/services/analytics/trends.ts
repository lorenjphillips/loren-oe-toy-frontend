/**
 * Medical Trend Analysis Service
 * 
 * Identifies and analyzes emerging clinical topics in physician questions.
 * Provides trend detection, correlation analysis, and forecasting capabilities.
 */

import { 
  QuestionContext, 
  MedicalConcept,
  ClinicalIntent
} from '../../types/analytics';
import { questionAnalyzer } from './questionAnalyzer';

// Extended MedicalConcept type with ID for trend analysis
interface ExtendedMedicalConcept extends MedicalConcept {
  id: string; // Concept identifier
}

// Types for trend analysis
export interface TrendAnalysisOptions {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  baselinePeriod?: number; // Number of periods to use as baseline
  minSampleSize?: number; // Minimum sample size for statistical validity
  confidenceLevel?: number; // Statistical confidence level (0-1)
  geographicFilter?: string[]; // Geographic regions to include
  specialtyFilter?: string[]; // Medical specialties to include
  conceptTypes?: string[]; // Types of medical concepts to analyze
}

export interface TopicTrend {
  topicId: string;
  name: string;
  conceptType: string;
  currentFrequency: number; // Normalized frequency in current period
  previousFrequency: number; // Normalized frequency in previous period
  baselineFrequency: number; // Normalized baseline frequency
  percentageChange: number; // Change vs previous period
  growthRate: number; // Compound growth rate
  statisticalSignificance: number; // p-value of observed change
  relatedTopics: Array<{
    topicId: string;
    name: string;
    correlationStrength: number;
  }>;
  seasonalityPattern?: 'increasing' | 'decreasing' | 'peak' | 'trough' | 'stable';
  geographicDistribution?: Record<string, number>; // Region to normalized frequency
  forecastedGrowth?: number; // Predicted growth rate
}

export interface EmergingTopic extends TopicTrend {
  newness: number; // Score of how new this topic is (0-1)
  velocityScore: number; // Rate of acceleration in frequency
}

export interface TopicCorrelation {
  sourceTopicId: string;
  sourceName: string;
  targetTopicId: string;
  targetName: string;
  correlationCoefficient: number; // Pearson or Spearman correlation (-1 to 1)
  cooccurrenceFrequency: number; // How often they appear together
  timeOffset?: number; // If one tends to lead the other (in days)
  pValue: number; // Statistical significance of correlation
  isNovel: boolean; // Whether this is a newly observed correlation
}

export interface SeasonalPattern {
  topicId: string;
  name: string;
  seasonalityType: 'annual' | 'quarterly' | 'monthly' | 'weekly';
  peakPeriods: string[]; // Time periods with peak frequency
  troughPeriods: string[]; // Time periods with minimum frequency
  seasonalityStrength: number; // Measure of seasonality (0-1)
  currentPosition: 'rising' | 'falling' | 'peak' | 'trough';
  nextPredictedChange?: {
    direction: 'up' | 'down';
    estimatedTimeframe: string;
    confidence: number;
  };
}

export interface TrendForecast {
  topicId: string;
  name: string;
  currentFrequency: number;
  projectedFrequency: number; // Projected future frequency
  forecastPeriod: string; // Time period of forecast (e.g., "next 3 months")
  growthProjection: number; // Projected growth percentage
  confidenceInterval: [number, number]; // 95% confidence interval
  influencingFactors: string[]; // Factors that may influence the forecast
  seasonalAdjusted: boolean; // Whether seasonality was factored in
}

export interface TrendSummary {
  topEmergingTopics: EmergingTopic[];
  topFadingTopics: TopicTrend[];
  significantCorrelations: TopicCorrelation[];
  seasonalPatterns: SeasonalPattern[];
  forecasts: TrendForecast[];
  analysisTimestamp: Date;
  dataTimeframe: {
    start: Date;
    end: Date;
  };
}

class TrendAnalysisService {
  /**
   * Analyze trends in medical topics from physician questions
   */
  public async analyzeTrends(
    questions: QuestionContext[],
    options: TrendAnalysisOptions
  ): Promise<TrendSummary> {
    // Validate inputs
    if (!questions.length) {
      throw new Error('No questions provided for trend analysis');
    }

    // Extract all medical concepts from questions
    const allConcepts = this.extractAllConcepts(questions);
    
    // Group questions by time periods
    const timeSeriesData = this.groupQuestionsByTime(questions, options.timeframe);
    
    // Calculate topic frequencies over time
    const topicFrequencies = this.calculateTopicFrequencies(timeSeriesData);
    
    // Identify emerging topics
    const emergingTopics = this.identifyEmergingTopics(topicFrequencies, options);
    
    // Identify fading topics
    const fadingTopics = this.identifyFadingTopics(topicFrequencies, options);
    
    // Analyze topic correlations
    const correlations = this.analyzeTopicCorrelations(questions, allConcepts);
    
    // Detect seasonal patterns
    const seasonalPatterns = this.detectSeasonalPatterns(topicFrequencies);
    
    // Generate forecasts
    const forecasts = this.generateForecasts(topicFrequencies, seasonalPatterns, options);
    
    return {
      topEmergingTopics: emergingTopics,
      topFadingTopics: fadingTopics,
      significantCorrelations: correlations,
      seasonalPatterns: seasonalPatterns,
      forecasts: forecasts,
      analysisTimestamp: new Date(),
      dataTimeframe: {
        start: new Date(Math.min(...questions.map(q => q.timestamp.getTime()))),
        end: new Date(Math.max(...questions.map(q => q.timestamp.getTime())))
      }
    };
  }

  /**
   * Identify topics with increasing frequency
   */
  public async detectEmergingTopics(
    questions: QuestionContext[],
    options: TrendAnalysisOptions
  ): Promise<EmergingTopic[]> {
    // Get full trend analysis
    const trendSummary = await this.analyzeTrends(questions, options);
    // Return just the emerging topics
    return trendSummary.topEmergingTopics;
  }

  /**
   * Analyze correlations between medical topics
   */
  public async analyzeCorrelations(
    questions: QuestionContext[]
  ): Promise<TopicCorrelation[]> {
    const allConcepts = this.extractAllConcepts(questions);
    return this.analyzeTopicCorrelations(questions, allConcepts);
  }

  /**
   * Detect seasonal patterns in medical topic frequencies
   */
  public async analyzeSeasonality(
    questions: QuestionContext[],
    options: TrendAnalysisOptions
  ): Promise<SeasonalPattern[]> {
    const timeSeriesData = this.groupQuestionsByTime(questions, options.timeframe);
    const topicFrequencies = this.calculateTopicFrequencies(timeSeriesData);
    return this.detectSeasonalPatterns(topicFrequencies);
  }

  /**
   * Generate forecasts for future topic frequencies
   */
  public async forecastTrends(
    questions: QuestionContext[],
    options: TrendAnalysisOptions
  ): Promise<TrendForecast[]> {
    const timeSeriesData = this.groupQuestionsByTime(questions, options.timeframe);
    const topicFrequencies = this.calculateTopicFrequencies(timeSeriesData);
    const seasonalPatterns = this.detectSeasonalPatterns(topicFrequencies);
    return this.generateForecasts(topicFrequencies, seasonalPatterns, options);
  }

  /**
   * Compare trend against external medical developments
   */
  public async correlateWithExternalDevelopments(
    topic: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{event: string, date: Date, correlationStrength: number}>> {
    // TODO: Implement correlation with external medical developments database
    // This could include FDA approvals, major studies, conference announcements, etc.
    return [];
  }

  // Private helper methods

  private extractAllConcepts(questions: QuestionContext[]): MedicalConcept[] {
    const concepts: MedicalConcept[] = [];
    questions.forEach(question => {
      question.medicalConcepts.forEach(concept => {
        concepts.push(concept);
      });
    });
    return concepts;
  }

  private groupQuestionsByTime(
    questions: QuestionContext[],
    timeframe: TrendAnalysisOptions['timeframe']
  ): Map<string, QuestionContext[]> {
    const groupedQuestions = new Map<string, QuestionContext[]>();
    
    // Group questions by time period based on timeframe
    questions.forEach(question => {
      const timePeriod = this.formatTimePeriod(question.timestamp, timeframe);
      if (!groupedQuestions.has(timePeriod)) {
        groupedQuestions.set(timePeriod, []);
      }
      groupedQuestions.get(timePeriod)!.push(question);
    });
    
    return groupedQuestions;
  }

  private formatTimePeriod(date: Date, timeframe: TrendAnalysisOptions['timeframe']): string {
    switch (timeframe) {
      case 'daily':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      case 'weekly':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        return `${startOfWeek.getFullYear()}-W${Math.ceil((startOfWeek.getDate() + (new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), 0).getDate())) / 7)}`;
      case 'monthly':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      default:
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  }

  private calculateTopicFrequencies(
    timeSeriesData: Map<string, QuestionContext[]>
  ): Map<string, Map<string, number>> {
    const topicFrequencies = new Map<string, Map<string, number>>();
    
    // Initialize topic frequencies map
    Array.from(timeSeriesData.entries()).forEach(([timePeriod, questions]) => {
      const periodFrequencies = new Map<string, number>();
      topicFrequencies.set(timePeriod, periodFrequencies);
      
      // Count concept frequencies in this time period
      questions.forEach((question: QuestionContext) => {
        question.medicalConcepts.forEach((concept: MedicalConcept) => {
          // Generate concept ID from term and category if not available
          const conceptId = this.getConceptId(concept);
          const currentFreq = periodFrequencies.get(conceptId) || 0;
          periodFrequencies.set(conceptId, currentFreq + 1);
        });
      });
      
      // Normalize frequencies by total question count
      const totalQuestions = questions.length;
      Array.from(periodFrequencies.entries()).forEach(([conceptId, frequency]) => {
        periodFrequencies.set(conceptId, frequency / totalQuestions);
      });
    });
    
    return topicFrequencies;
  }

  private identifyEmergingTopics(
    topicFrequencies: Map<string, Map<string, number>>,
    options: TrendAnalysisOptions
  ): EmergingTopic[] {
    const emergingTopics: EmergingTopic[] = [];
    
    // Convert time series to arrays for analysis
    const timePoints = Array.from(topicFrequencies.keys()).sort();
    const currentPeriod = timePoints[timePoints.length - 1];
    const previousPeriod = timePoints[timePoints.length - 2];
    
    // Calculate baseline period range
    const baselinePeriods = timePoints.slice(
      0, 
      Math.max(0, timePoints.length - (options.baselinePeriod || 3))
    );
    
    // Get current period frequencies
    const currentFrequencies = topicFrequencies.get(currentPeriod)!;
    
    // Analyze each topic for emergence
    Array.from(currentFrequencies.entries()).forEach(([topicId, currentFreq]) => {
      const previousFreq = (topicFrequencies.get(previousPeriod) || new Map()).get(topicId) || 0;
      
      // Calculate baseline frequency
      let baselineFreq = 0;
      let baselineCount = 0;
      for (const period of baselinePeriods) {
        const freq = (topicFrequencies.get(period) || new Map()).get(topicId) || 0;
        baselineFreq += freq;
        baselineCount++;
      }
      baselineFreq = baselineFreq / (baselineCount || 1);
      
      // Calculate metrics
      const percentageChange = previousFreq > 0 ? 
        ((currentFreq - previousFreq) / previousFreq) * 100 : 
        100; // If previous is 0, consider it 100% growth
      
      const growthRate = baselineFreq > 0 ? 
        Math.pow((currentFreq / baselineFreq), 1 / Math.max(1, baselineCount)) - 1 : 
        1; // If baseline is 0, consider it 100% growth
      
      // Statistical significance calculation (simplified)
      const statisticalSignificance = this.calculateStatisticalSignificance(
        currentFreq, previousFreq, baselineFreq
      );
      
      // Calculate newness and velocity
      const newness = baselineFreq === 0 ? 1 : Math.max(0, 1 - (baselineFreq / currentFreq));
      const velocityScore = Math.max(0, percentageChange / 100);
      
      // Determine if this is an emerging topic
      if (
        (currentFreq > previousFreq) && 
        (growthRate > 0.1 || newness > 0.7) &&
        statisticalSignificance < 0.05 // p < 0.05
      ) {
        // Find related topics (simplified version - would be refined in real implementation)
        const relatedTopics = this.findRelatedTopics(topicId);
        
        emergingTopics.push({
          topicId,
          name: `Topic ${topicId}`, // Real implementation would use a topic name lookup
          conceptType: 'medical_concept', // Real implementation would classify concept type
          currentFrequency: currentFreq,
          previousFrequency: previousFreq,
          baselineFrequency: baselineFreq,
          percentageChange,
          growthRate,
          statisticalSignificance,
          relatedTopics,
          newness,
          velocityScore
        });
      }
    });
    
    // Sort by growth rate descending
    return emergingTopics.sort((a, b) => b.velocityScore - a.velocityScore);
  }

  private identifyFadingTopics(
    topicFrequencies: Map<string, Map<string, number>>,
    options: TrendAnalysisOptions
  ): TopicTrend[] {
    const fadingTopics: TopicTrend[] = [];
    
    // Convert time series to arrays for analysis
    const timePoints = Array.from(topicFrequencies.keys()).sort();
    const currentPeriod = timePoints[timePoints.length - 1];
    const previousPeriod = timePoints[timePoints.length - 2];
    
    // Calculate baseline period range
    const baselinePeriods = timePoints.slice(
      0, 
      Math.max(0, timePoints.length - (options.baselinePeriod || 3))
    );
    
    // Get current and previous period frequencies
    const currentFrequencies = topicFrequencies.get(currentPeriod)!;
    const previousFrequencies = topicFrequencies.get(previousPeriod) || new Map();
    
    // Analyze each topic in previous period for decline
    Array.from(previousFrequencies.entries()).forEach(([topicId, previousFreq]) => {
      const currentFreq = currentFrequencies.get(topicId) || 0;
      
      // Calculate baseline frequency
      let baselineFreq = 0;
      let baselineCount = 0;
      for (const period of baselinePeriods) {
        const freq = (topicFrequencies.get(period) || new Map()).get(topicId) || 0;
        baselineFreq += freq;
        baselineCount++;
      }
      baselineFreq = baselineFreq / (baselineCount || 1);
      
      // Calculate metrics
      const percentageChange = previousFreq > 0 ? 
        ((currentFreq - previousFreq) / previousFreq) * 100 : 
        0;
      
      const growthRate = baselineFreq > 0 ? 
        Math.pow((currentFreq / baselineFreq), 1 / Math.max(1, baselineCount)) - 1 : 
        0;
      
      // Calculate statistical significance
      const statisticalSignificance = this.calculateStatisticalSignificance(
        currentFreq, previousFreq, baselineFreq
      );
      
      // Determine if this is a fading topic
      if (
        (currentFreq < previousFreq) && 
        (growthRate < -0.1) &&
        (statisticalSignificance < 0.05) // p < 0.05
      ) {
        // Find related topics
        const relatedTopics = this.findRelatedTopics(topicId);
        
        fadingTopics.push({
          topicId,
          name: `Topic ${topicId}`, // Real implementation would use a topic name lookup
          conceptType: 'medical_concept', // Real implementation would classify concept type
          currentFrequency: currentFreq,
          previousFrequency: previousFreq,
          baselineFrequency: baselineFreq,
          percentageChange,
          growthRate,
          statisticalSignificance,
          relatedTopics
        });
      }
    });
    
    // Sort by percentage change ascending (most declining first)
    return fadingTopics.sort((a, b) => a.percentageChange - b.percentageChange);
  }

  private analyzeTopicCorrelations(
    questions: QuestionContext[],
    concepts: MedicalConcept[]
  ): TopicCorrelation[] {
    const correlations: TopicCorrelation[] = [];
    const uniqueConceptIds = new Set(concepts.map(c => this.getConceptId(c)));
    const conceptPairs = this.generateConceptPairs(Array.from(uniqueConceptIds));
    
    // Create co-occurrence matrix
    const cooccurrenceMatrix: Record<string, Record<string, number>> = {};
    const conceptFrequencies: Record<string, number> = {};
    
    // Initialize matrices
    Array.from(uniqueConceptIds).forEach(conceptId => {
      cooccurrenceMatrix[conceptId] = {};
      conceptFrequencies[conceptId] = 0;
      
      Array.from(uniqueConceptIds).forEach(otherId => {
        cooccurrenceMatrix[conceptId][otherId] = 0;
      });
    });
    
    // Fill matrices
    questions.forEach(question => {
      const questionConceptIds = question.medicalConcepts.map(c => this.getConceptId(c));
      
      // Increment individual concept frequencies
      questionConceptIds.forEach(conceptId => {
        conceptFrequencies[conceptId] = (conceptFrequencies[conceptId] || 0) + 1;
      });
      
      // Increment co-occurrence counts
      for (let i = 0; i < questionConceptIds.length; i++) {
        for (let j = i + 1; j < questionConceptIds.length; j++) {
          const conceptId1 = questionConceptIds[i];
          const conceptId2 = questionConceptIds[j];
          
          cooccurrenceMatrix[conceptId1][conceptId2] = 
            (cooccurrenceMatrix[conceptId1][conceptId2] || 0) + 1;
          
          cooccurrenceMatrix[conceptId2][conceptId1] = 
            (cooccurrenceMatrix[conceptId2][conceptId1] || 0) + 1;
        }
      }
    });
    
    // Calculate correlation coefficients
    for (const [conceptId1, conceptId2] of conceptPairs) {
      const cooccurrenceCount = cooccurrenceMatrix[conceptId1][conceptId2];
      
      if (cooccurrenceCount > 0) {
        // Calculate Phi coefficient (a measure of association for binary variables)
        const n = questions.length;
        const n11 = cooccurrenceCount; // Both concepts present
        const n10 = conceptFrequencies[conceptId1] - n11; // Concept 1 present, Concept 2 absent
        const n01 = conceptFrequencies[conceptId2] - n11; // Concept 1 absent, Concept 2 present
        const n00 = n - n11 - n10 - n01; // Both concepts absent
        
        const phi = (n11 * n00 - n10 * n01) / 
          Math.sqrt((n11 + n10) * (n11 + n01) * (n10 + n00) * (n01 + n00));
        
        // Calculate p-value using chi-squared approximation
        const chiSquared = phi * phi * n;
        const pValue = this.chiSquaredToPValue(chiSquared, 1); // 1 degree of freedom
        
        if (Math.abs(phi) > 0.3 && pValue < 0.05) { // Only include significant correlations
          correlations.push({
            sourceTopicId: conceptId1,
            sourceName: `Concept ${conceptId1}`, // Real implementation would use a name lookup
            targetTopicId: conceptId2,
            targetName: `Concept ${conceptId2}`, // Real implementation would use a name lookup
            correlationCoefficient: phi,
            cooccurrenceFrequency: cooccurrenceCount / n, // Normalize by question count
            pValue,
            isNovel: cooccurrenceCount < Math.min(conceptFrequencies[conceptId1], conceptFrequencies[conceptId2]) * 0.1
          });
        }
      }
    }
    
    // Sort by correlation strength
    return correlations.sort((a, b) => Math.abs(b.correlationCoefficient) - Math.abs(a.correlationCoefficient));
  }

  private detectSeasonalPatterns(
    topicFrequencies: Map<string, Map<string, number>>
  ): SeasonalPattern[] {
    const seasonalPatterns: SeasonalPattern[] = [];
    const timePoints = Array.from(topicFrequencies.keys()).sort();
    
    // Need at least 2 years of data for reliable seasonality detection
    if (timePoints.length < 8) { // Arbitrary minimum, real implementation would be more sophisticated
      return [];
    }
    
    // Get a list of all topics that have appeared in any time period
    const allTopics = new Set<string>();
    Array.from(topicFrequencies.values()).forEach(frequencies => {
      Array.from(frequencies.keys()).forEach(topicId => {
        allTopics.add(topicId);
      });
    });
    
    // Analyze each topic for seasonality
    Array.from(allTopics).forEach(topicId => {
      // Extract time series for this topic
      const timeSeries: Array<{period: string, frequency: number}> = [];
      
      for (const period of timePoints) {
        const frequency = (topicFrequencies.get(period) || new Map()).get(topicId) || 0;
        timeSeries.push({ period, frequency });
      }
      
      // Skip topics with insufficient data
      if (timeSeries.filter(point => point.frequency > 0).length < timePoints.length * 0.5) {
        return;
      }
      
      // Simplified seasonal analysis (real implementation would use more sophisticated techniques)
      const seasonalityScore = this.calculateSeasonalityScore(timeSeries);
      
      if (seasonalityScore > 0.4) { // Arbitrary threshold, real implementation would be more rigorous
        const peakPeriods = this.identifyPeakPeriods(timeSeries);
        const troughPeriods = this.identifyTroughPeriods(timeSeries);
        
        const seasonalPattern: SeasonalPattern = {
          topicId,
          name: `Topic ${topicId}`, // Real implementation would use a topic name lookup
          seasonalityType: this.detectSeasonalityType(peakPeriods),
          peakPeriods,
          troughPeriods,
          seasonalityStrength: seasonalityScore,
          currentPosition: this.determineCurrentPosition(timeSeries)
        };
        
        seasonalPatterns.push(seasonalPattern);
      }
    });
    
    return seasonalPatterns.sort((a, b) => b.seasonalityStrength - a.seasonalityStrength);
  }

  private generateForecasts(
    topicFrequencies: Map<string, Map<string, number>>,
    seasonalPatterns: SeasonalPattern[],
    options: TrendAnalysisOptions
  ): TrendForecast[] {
    const forecasts: TrendForecast[] = [];
    const timePoints = Array.from(topicFrequencies.keys()).sort();
    
    // Need at least a few data points for forecasting
    if (timePoints.length < 3) {
      return [];
    }
    
    // Get most recent period
    const currentPeriod = timePoints[timePoints.length - 1];
    const currentFrequencies = topicFrequencies.get(currentPeriod)!;
    
    // Get all topics from current period
    Array.from(currentFrequencies.entries()).forEach(([topicId, currentFreq]) => {
      // Skip topics with very low frequency
      if (currentFreq < 0.01) { // 1% threshold, adjust as needed
        return;
      }
      
      // Extract time series for this topic
      const timeSeries: Array<number> = [];
      
      for (const period of timePoints) {
        const frequency = (topicFrequencies.get(period) || new Map()).get(topicId) || 0;
        timeSeries.push(frequency);
      }
      
      // Check if this topic has a seasonal pattern
      const seasonalPattern = seasonalPatterns.find(pattern => pattern.topicId === topicId);
      const seasonalAdjusted = seasonalPattern !== undefined;
      
      // Simple forecasting using linear regression with optional seasonal adjustment
      const projection = this.forecastTopic(timeSeries, seasonalPattern);
      
      // Create forecast object
      forecasts.push({
        topicId,
        name: `Topic ${topicId}`, // Real implementation would use a topic name lookup
        currentFrequency: currentFreq,
        projectedFrequency: projection.projectedValue,
        forecastPeriod: `next ${options.timeframe}`,
        growthProjection: ((projection.projectedValue - currentFreq) / currentFreq) * 100,
        confidenceInterval: projection.confidenceInterval,
        influencingFactors: projection.influencingFactors,
        seasonalAdjusted
      });
    });
    
    // Sort by projected growth
    return forecasts.sort((a, b) => b.growthProjection - a.growthProjection);
  }

  // Statistical and mathematical helper methods

  private calculateStatisticalSignificance(
    currentFreq: number,
    previousFreq: number,
    baselineFreq: number
  ): number {
    // Simplified p-value calculation
    // Real implementation would use appropriate statistical tests
    return 0.01; // Placeholder
  }

  private findRelatedTopics(
    topicId: string
  ): Array<{topicId: string, name: string, correlationStrength: number}> {
    // In a real implementation, this would query a pre-computed correlation matrix
    return [
      {
        topicId: `${topicId}_related1`,
        name: `Related to ${topicId} #1`,
        correlationStrength: 0.7
      },
      {
        topicId: `${topicId}_related2`,
        name: `Related to ${topicId} #2`,
        correlationStrength: 0.5
      }
    ];
  }

  private generateConceptPairs(conceptIds: string[]): Array<[string, string]> {
    const pairs: Array<[string, string]> = [];
    
    for (let i = 0; i < conceptIds.length; i++) {
      for (let j = i + 1; j < conceptIds.length; j++) {
        pairs.push([conceptIds[i], conceptIds[j]]);
      }
    }
    
    return pairs;
  }

  private chiSquaredToPValue(chiSquared: number, degreesOfFreedom: number): number {
    // Simplified approximation
    // Real implementation would use statistical libraries
    return Math.exp(-0.5 * chiSquared);
  }

  private calculateSeasonalityScore(
    timeSeries: Array<{period: string, frequency: number}>
  ): number {
    // Simplified seasonality detection
    // Real implementation would use autocorrelation or spectral analysis
    return 0.6; // Placeholder
  }

  private identifyPeakPeriods(
    timeSeries: Array<{period: string, frequency: number}>
  ): string[] {
    // Simplified peak detection
    // Real implementation would use more sophisticated techniques
    return ['January', 'February']; // Placeholder
  }

  private identifyTroughPeriods(
    timeSeries: Array<{period: string, frequency: number}>
  ): string[] {
    // Simplified trough detection
    return ['July', 'August']; // Placeholder
  }

  private detectSeasonalityType(peakPeriods: string[]): 'annual' | 'quarterly' | 'monthly' | 'weekly' {
    // Simplified detection of seasonality type
    return 'annual'; // Placeholder
  }

  private determineCurrentPosition(
    timeSeries: Array<{period: string, frequency: number}>
  ): 'rising' | 'falling' | 'peak' | 'trough' {
    // Simplified detection of current position in seasonal cycle
    return 'rising'; // Placeholder
  }

  private forecastTopic(
    timeSeries: number[],
    seasonalPattern?: SeasonalPattern
  ): {
    projectedValue: number,
    confidenceInterval: [number, number],
    influencingFactors: string[]
  } {
    // Simple linear projection
    // Real implementation would use more sophisticated forecasting models
    const lastValue = timeSeries[timeSeries.length - 1];
    const projectedValue = lastValue * 1.1; // Simple 10% growth prediction
    
    return {
      projectedValue,
      confidenceInterval: [projectedValue * 0.9, projectedValue * 1.2],
      influencingFactors: [
        'historical trend',
        seasonalPattern ? 'seasonal factors' : '',
        'recent acceleration'
      ].filter(Boolean)
    };
  }

  // Helper to get or generate a concept ID
  private getConceptId(concept: MedicalConcept): string {
    // In a real implementation, this would use an actual ID from the concept
    // For now, generate a deterministic ID from the term and category
    return `${concept.category}_${concept.term.toLowerCase().replace(/\s+/g, '_')}`;
  }
}

// Export singleton instance
export const trendAnalysisService = new TrendAnalysisService(); 