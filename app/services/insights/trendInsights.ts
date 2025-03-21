/**
 * Trend Insights Service
 * 
 * Automatically generates natural language insights and recommendations
 * based on medical trend analysis. Identifies opportunities and content
 * development needs from emerging topic patterns.
 */

import { 
  EmergingTopic, 
  TopicCorrelation, 
  SeasonalPattern, 
  TrendForecast,
  TrendSummary
} from '../analytics/trends';

export interface TrendInsight {
  id: string;
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
  category: 'emerging_topic' | 'correlation' | 'seasonality' | 'forecast' | 'opportunity';
  relatedTopics: string[];
  timestamp: Date;
  recommendedActions?: string[];
}

export interface ContentOpportunity {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: 'high' | 'medium' | 'low';
  targetAudience: string[];
  relatedTopics: string[];
  suggestedContent: string[];
}

export interface InformationGap {
  id: string;
  topic: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  evidencePoints: string[];
  suggestedResolution: string;
}

export interface TrendInsightSummary {
  insights: TrendInsight[];
  opportunities: ContentOpportunity[];
  informationGaps: InformationGap[];
  generatedAt: Date;
  overallAssessment: string;
}

class TrendInsightsService {
  /**
   * Generate natural language insights from trend analysis
   */
  public generateInsights(trendSummary: TrendSummary): TrendInsightSummary {
    const insights: TrendInsight[] = [];
    const opportunities: ContentOpportunity[] = [];
    const informationGaps: InformationGap[] = [];
    
    // Generate insights for emerging topics
    this.generateEmergingTopicInsights(trendSummary.topEmergingTopics, insights);
    
    // Generate insights for correlations
    this.generateCorrelationInsights(trendSummary.significantCorrelations, insights);
    
    // Generate insights for seasonal patterns
    this.generateSeasonalityInsights(trendSummary.seasonalPatterns, insights);
    
    // Generate insights for forecasts
    this.generateForecastInsights(trendSummary.forecasts, insights);
    
    // Identify content opportunities
    this.identifyContentOpportunities(trendSummary, insights, opportunities);
    
    // Identify information gaps
    this.identifyInformationGaps(trendSummary, informationGaps);
    
    // Generate overall assessment
    const overallAssessment = this.generateOverallAssessment(
      trendSummary, 
      insights, 
      opportunities, 
      informationGaps
    );
    
    return {
      insights,
      opportunities,
      informationGaps,
      generatedAt: new Date(),
      overallAssessment
    };
  }
  
  /**
   * Generate content development recommendations based on trend analysis
   */
  public generateContentRecommendations(
    trendSummary: TrendSummary
  ): ContentOpportunity[] {
    const opportunities: ContentOpportunity[] = [];
    const insights: TrendInsight[] = [];
    
    // First generate insights to use as input for content recommendations
    this.generateEmergingTopicInsights(trendSummary.topEmergingTopics, insights);
    this.generateCorrelationInsights(trendSummary.significantCorrelations, insights);
    
    // Then identify content opportunities
    this.identifyContentOpportunities(trendSummary, insights, opportunities);
    
    return opportunities.sort((a, b) => {
      // Sort by priority (high, medium, low) and then by estimated impact
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const impactOrder = { high: 0, medium: 1, low: 2 };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      return priorityDiff !== 0 ? 
        priorityDiff : 
        impactOrder[a.estimatedImpact] - impactOrder[b.estimatedImpact];
    });
  }
  
  /**
   * Identify underserved information needs based on trend analysis
   */
  public identifyUnderservedNeeds(
    trendSummary: TrendSummary
  ): InformationGap[] {
    const informationGaps: InformationGap[] = [];
    
    this.identifyInformationGaps(trendSummary, informationGaps);
    
    return informationGaps.sort((a, b) => {
      // Sort by severity (high, medium, low)
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
  
  /**
   * Generate summary of treatment relevance correlations
   */
  public correlateWithTreatmentRelevance(
    trendSummary: TrendSummary
  ): Array<{
    topic: string;
    treatmentRelevance: number;
    clinicalSignificance: string;
    recommendedFocus: string;
  }> {
    // In a real implementation, this would correlate with clinical data
    // and treatment guidelines to assess relevance
    return trendSummary.topEmergingTopics.slice(0, 5).map(topic => ({
      topic: topic.name,
      treatmentRelevance: Math.random(), // Placeholder for real analysis
      clinicalSignificance: "Potential impact on treatment decisions",
      recommendedFocus: "Clinical management"
    }));
  }
  
  // Private helper methods
  
  private generateEmergingTopicInsights(
    emergingTopics: EmergingTopic[],
    insights: TrendInsight[]
  ): void {
    emergingTopics.forEach(topic => {
      // Generate insights for high-velocity topics
      if (topic.velocityScore > 0.5) {
        insights.push({
          id: `insight_emerging_${topic.topicId}`,
          title: `Rapidly emerging topic: ${topic.name}`,
          description: `${topic.name} is showing a significant increase in physician interest with a ${topic.percentageChange.toFixed(1)}% growth. This represents an emerging information need that should be addressed in content strategy.`,
          significance: topic.velocityScore > 0.7 ? 'high' : 'medium',
          category: 'emerging_topic',
          relatedTopics: topic.relatedTopics.map(rt => rt.name),
          timestamp: new Date(),
          recommendedActions: [
            `Develop comprehensive content on ${topic.name}`,
            `Ensure clinical guidelines for ${topic.name} are up-to-date`,
            `Consider CME opportunities focused on ${topic.name}`
          ]
        });
      }
      
      // Generate insights for novel topics with little baseline presence
      if (topic.newness > 0.8) {
        insights.push({
          id: `insight_novel_${topic.topicId}`,
          title: `New medical topic emerging: ${topic.name}`,
          description: `${topic.name} appears to be a novel topic with minimal historical baseline. This may represent a new clinical concept or emerging medical concern.`,
          significance: 'high',
          category: 'emerging_topic',
          relatedTopics: topic.relatedTopics.map(rt => rt.name),
          timestamp: new Date(),
          recommendedActions: [
            `Research latest literature on ${topic.name}`,
            `Develop early educational resources on ${topic.name}`,
            `Monitor closely for continued growth`
          ]
        });
      }
    });
  }
  
  private generateCorrelationInsights(
    correlations: TopicCorrelation[],
    insights: TrendInsight[]
  ): void {
    // Focus on strong and novel correlations
    correlations
      .filter(corr => Math.abs(corr.correlationCoefficient) > 0.6 || corr.isNovel)
      .forEach(correlation => {
        const isPositive = correlation.correlationCoefficient > 0;
        
        insights.push({
          id: `insight_corr_${correlation.sourceTopicId}_${correlation.targetTopicId}`,
          title: `${isPositive ? 'Positive' : 'Negative'} correlation discovered: ${correlation.sourceName} and ${correlation.targetName}`,
          description: `Physicians who inquire about ${correlation.sourceName} are ${isPositive ? 'more' : 'less'} likely to also inquire about ${correlation.targetName} (correlation: ${correlation.correlationCoefficient.toFixed(2)}). ${correlation.isNovel ? 'This is a newly observed relationship.' : ''}`,
          significance: correlation.isNovel ? 'high' : 'medium',
          category: 'correlation',
          relatedTopics: [correlation.sourceName, correlation.targetName],
          timestamp: new Date(),
          recommendedActions: [
            `Create content exploring the relationship between ${correlation.sourceName} and ${correlation.targetName}`,
            `Update treatment guidance to reflect this clinical relationship`,
            `Research underlying mechanisms connecting these topics`
          ]
        });
      });
  }
  
  private generateSeasonalityInsights(
    seasonalPatterns: SeasonalPattern[],
    insights: TrendInsight[]
  ): void {
    seasonalPatterns
      .filter(pattern => pattern.seasonalityStrength > 0.5)
      .forEach(pattern => {
        const peakPeriodsList = pattern.peakPeriods.join(', ');
        
        insights.push({
          id: `insight_seasonal_${pattern.topicId}`,
          title: `Seasonal pattern identified: ${pattern.name}`,
          description: `${pattern.name} shows strong seasonal variation with peak interest during ${peakPeriodsList}. The pattern is currently in a ${pattern.currentPosition} phase.`,
          significance: pattern.seasonalityStrength > 0.7 ? 'high' : 'medium',
          category: 'seasonality',
          relatedTopics: [pattern.name],
          timestamp: new Date(),
          recommendedActions: [
            `Plan content releases to anticipate seasonal demand for ${pattern.name}`,
            `Develop preparatory resources before ${peakPeriodsList}`,
            `Consider seasonal factors in education and outreach initiatives`
          ]
        });
      });
  }
  
  private generateForecastInsights(
    forecasts: TrendForecast[],
    insights: TrendInsight[]
  ): void {
    forecasts
      .filter(forecast => forecast.growthProjection > 20 || forecast.growthProjection < -20)
      .forEach(forecast => {
        const isGrowth = forecast.growthProjection > 0;
        const confidenceLower = forecast.confidenceInterval[0].toFixed(1);
        const confidenceUpper = forecast.confidenceInterval[1].toFixed(1);
        
        insights.push({
          id: `insight_forecast_${forecast.topicId}`,
          title: `${isGrowth ? 'Growth' : 'Decline'} forecast: ${forecast.name}`,
          description: `${forecast.name} is projected to ${isGrowth ? 'grow' : 'decline'} by ${Math.abs(forecast.growthProjection).toFixed(1)}% in the ${forecast.forecastPeriod} (confidence interval: ${confidenceLower}% to ${confidenceUpper}%).`,
          significance: Math.abs(forecast.growthProjection) > 50 ? 'high' : 'medium',
          category: 'forecast',
          relatedTopics: [forecast.name],
          timestamp: new Date(),
          recommendedActions: isGrowth ? [
            `Prepare content strategy to address growing interest in ${forecast.name}`,
            `Expand clinical resources related to ${forecast.name}`,
            `Consider allocating additional resources to this topic area`
          ] : [
            `Review current content coverage of ${forecast.name} for consolidation`,
            `Focus on maintaining core educational resources`,
            `Monitor for stabilization or renewed interest`
          ]
        });
      });
  }
  
  private identifyContentOpportunities(
    trendSummary: TrendSummary,
    insights: TrendInsight[],
    opportunities: ContentOpportunity[]
  ): void {
    // Use insights to generate content opportunities
    insights
      .filter(insight => insight.significance === 'high')
      .forEach(insight => {
        const id = `opportunity_${insight.id.split('_')[1]}_${Date.now()}`;
        const title = `Content opportunity: ${insight.title.split(':')[1].trim()}`;
        
        // Different opportunity types based on insight category
        switch (insight.category) {
          case 'emerging_topic':
            opportunities.push({
              id,
              title,
              description: `Develop comprehensive educational content on this emerging topic to address growing physician interest.`,
              priority: 'high',
              estimatedImpact: 'high',
              targetAudience: ['Primary Care Physicians', 'Specialists', 'Medical Educators'],
              relatedTopics: insight.relatedTopics,
              suggestedContent: [
                'Evidence-based overview article',
                'Clinical management guidelines',
                'Patient education materials',
                'Interactive case studies'
              ]
            });
            break;
            
          case 'correlation':
            opportunities.push({
              id,
              title,
              description: `Create content exploring the relationship between correlated medical topics to help physicians understand these connections.`,
              priority: 'medium',
              estimatedImpact: 'medium',
              targetAudience: ['Specialists', 'Researchers', 'Medical Educators'],
              relatedTopics: insight.relatedTopics,
              suggestedContent: [
                'Review article on topic relationship',
                'Expert commentary on clinical implications',
                'Research summary on underlying mechanisms',
                'Decision-support tools'
              ]
            });
            break;
            
          case 'seasonality':
            opportunities.push({
              id,
              title,
              description: `Develop seasonal preparedness content to help physicians manage cyclical medical issues.`,
              priority: 'medium',
              estimatedImpact: 'high',
              targetAudience: ['Primary Care Physicians', 'Emergency Medicine', 'Public Health'],
              relatedTopics: insight.relatedTopics,
              suggestedContent: [
                'Seasonal preparedness guide',
                'Patient education materials',
                'Preventive care recommendations',
                'Treatment protocol updates'
              ]
            });
            break;
            
          case 'forecast':
            opportunities.push({
              id,
              title,
              description: `Prepare content to address projected physician interest in this topic area.`,
              priority: 'high',
              estimatedImpact: 'medium',
              targetAudience: ['All Physicians', 'Medical Educators', 'Healthcare Administrators'],
              relatedTopics: insight.relatedTopics,
              suggestedContent: [
                'State-of-the-art review',
                'Latest research developments',
                'Best practice recommendations',
                'Expert interviews and perspectives'
              ]
            });
            break;
        }
      });
      
    // Look for combinations of emerging topics and correlations
    const emergingTopicIds = new Set(
      trendSummary.topEmergingTopics.map(topic => topic.topicId)
    );
    
    trendSummary.significantCorrelations
      .filter(corr => 
        emergingTopicIds.has(corr.sourceTopicId) || 
        emergingTopicIds.has(corr.targetTopicId)
      )
      .forEach(corr => {
        opportunities.push({
          id: `opportunity_combined_${corr.sourceTopicId}_${corr.targetTopicId}`,
          title: `Intersection opportunity: ${corr.sourceName} and ${corr.targetName}`,
          description: `Develop content at the intersection of these related topics to address an emerging physician information need.`,
          priority: 'high',
          estimatedImpact: 'high',
          targetAudience: ['Specialists', 'Researchers', 'Medical Educators'],
          relatedTopics: [corr.sourceName, corr.targetName],
          suggestedContent: [
            'Comprehensive review of topic intersection',
            'Clinical guidance on managing patients with both conditions',
            'Expert perspectives on emerging research',
            'Case studies highlighting clinical decision-making'
          ]
        });
      });
  }
  
  private identifyInformationGaps(
    trendSummary: TrendSummary,
    informationGaps: InformationGap[]
  ): void {
    // Identify emerging topics with few related topics
    trendSummary.topEmergingTopics
      .filter(topic => topic.relatedTopics.length < 2)
      .forEach(topic => {
        informationGaps.push({
          id: `gap_isolated_${topic.topicId}`,
          topic: topic.name,
          description: `${topic.name} is growing in physician interest but has limited connections to established medical concepts, suggesting an information gap.`,
          severity: topic.velocityScore > 0.7 ? 'high' : 'medium',
          evidencePoints: [
            `${topic.percentageChange.toFixed(1)}% increase in physician questions`,
            `Limited integration with existing medical knowledge base`,
            `Few contextual resources available for physicians`
          ],
          suggestedResolution: `Develop foundational educational resources on ${topic.name} including definition, clinical significance, and management approaches.`
        });
      });
      
    // Identify seasonal topics without adequate preparatory content
    trendSummary.seasonalPatterns
      .filter(pattern => 
        pattern.currentPosition === 'rising' || 
        pattern.currentPosition === 'trough'
      )
      .forEach(pattern => {
        if (pattern.currentPosition === 'rising') {
          informationGaps.push({
            id: `gap_seasonal_${pattern.topicId}`,
            topic: pattern.name,
            description: `${pattern.name} is showing seasonal increase but may lack adequate preparatory content for physicians.`,
            severity: 'medium',
            evidencePoints: [
              `Seasonal pattern entering rising phase`,
              `Physicians likely to face increased patient presentations`,
              `Opportunity for proactive education`
            ],
            suggestedResolution: `Create preparedness resources for the upcoming seasonal peak in ${pattern.name} including updated clinical guidance.`
          });
        }
      });
      
    // Identify correlated topics that lack integrated information
    trendSummary.significantCorrelations
      .filter(corr => corr.isNovel)
      .forEach(corr => {
        informationGaps.push({
          id: `gap_correlated_${corr.sourceTopicId}_${corr.targetTopicId}`,
          topic: `${corr.sourceName} + ${corr.targetName}`,
          description: `Strong relationship between ${corr.sourceName} and ${corr.targetName} lacks integrated clinical resources.`,
          severity: Math.abs(corr.correlationCoefficient) > 0.7 ? 'high' : 'medium',
          evidencePoints: [
            `Strong statistical correlation (${corr.correlationCoefficient.toFixed(2)})`,
            `Newly identified clinical relationship`,
            `Limited integrated guidance for physicians`
          ],
          suggestedResolution: `Develop clinical guidance that addresses the relationship between ${corr.sourceName} and ${corr.targetName}, including diagnostic and treatment considerations.`
        });
      });
  }
  
  private generateOverallAssessment(
    trendSummary: TrendSummary,
    insights: TrendInsight[],
    opportunities: ContentOpportunity[],
    informationGaps: InformationGap[]
  ): string {
    const highPriorityInsights = insights.filter(i => i.significance === 'high').length;
    const highPriorityOpportunities = opportunities.filter(o => o.priority === 'high').length;
    const highSeverityGaps = informationGaps.filter(g => g.severity === 'high').length;
    
    const emergingTopicsCount = trendSummary.topEmergingTopics.length;
    const novelCorrelationsCount = trendSummary.significantCorrelations.filter(c => c.isNovel).length;
    
    return `
      Analysis of physician question trends has identified ${emergingTopicsCount} emerging medical topics
      and ${novelCorrelationsCount} significant topic correlations. There are ${highPriorityInsights} high-priority
      insights requiring attention, ${highPriorityOpportunities} high-impact content opportunities,
      and ${highSeverityGaps} critical information gaps to address. The primary focus areas should be
      on rapidly emerging topics and novel clinical relationships that suggest shifting information needs
      among physicians.
    `.replace(/\s+/g, ' ').trim();
  }
}

// Export singleton instance
export const trendInsightsService = new TrendInsightsService(); 