import { KVStorageService } from '../../lib/storage';
import { 
  AdMetric, 
  AdMetricType, 
  AdMetricValidator, 
  AdAggregatedMetrics, 
  MetricTimePeriod 
} from '../../models/storage/adMetricsTypes';
import { StorageHelpers } from '../../models/storage/baseTypes';

/**
 * Storage service for ad metrics
 */
export class AdMetricsStorageService extends KVStorageService {
  // Default TTL for metrics data (365 days)
  private readonly DEFAULT_TTL = 60 * 60 * 24 * 365;
  
  constructor() {
    super('admetrics');
  }

  /**
   * Store a metric data point
   */
  async storeMetric(metric: AdMetric): Promise<string> {
    const validator = new AdMetricValidator(metric);
    
    if (!validator.validate()) {
      throw new Error('Invalid ad metric data');
    }
    
    const id = metric.id || StorageHelpers.generateId();
    metric.id = id;
    
    const storageKey = `metric:${metric.adId}:${metric.metricType}:${id}`;
    await this.set(storageKey, metric, this.DEFAULT_TTL);
    
    // Update aggregated metrics
    await this.updateAggregatedMetrics(metric);
    
    return id;
  }

  /**
   * Get a specific metric by ID
   */
  async getMetric(
    adId: string, 
    metricType: AdMetricType, 
    metricId: string
  ): Promise<AdMetric | null> {
    const storageKey = `metric:${adId}:${metricType}:${metricId}`;
    return this.get<AdMetric>(storageKey);
  }

  /**
   * Get aggregated metrics for an ad
   */
  async getAggregatedMetrics(
    adId: string,
    period: MetricTimePeriod = MetricTimePeriod.DAILY,
    timestamp: number = Date.now()
  ): Promise<AdAggregatedMetrics | null> {
    // Calculate period start/end based on timestamp and period
    const { periodStart, periodEnd } = this.calculatePeriodRange(period, timestamp);
    
    const storageKey = `aggregated:${adId}:${period}:${periodStart}`;
    return this.get<AdAggregatedMetrics>(storageKey);
  }

  /**
   * Calculate time period range based on period type and timestamp
   */
  private calculatePeriodRange(
    period: MetricTimePeriod,
    timestamp: number
  ): { periodStart: number; periodEnd: number } {
    const date = new Date(timestamp);
    let periodStart: Date;
    let periodEnd: Date;
    
    switch (period) {
      case MetricTimePeriod.HOURLY:
        // Start of the hour
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          0,
          0,
          0
        );
        // End of the hour
        periodEnd = new Date(periodStart);
        periodEnd.setHours(periodEnd.getHours() + 1);
        break;
        
      case MetricTimePeriod.DAILY:
        // Start of the day
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        );
        // End of the day
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
        break;
        
      case MetricTimePeriod.WEEKLY:
        // Start of the week (Sunday)
        const dayOfWeek = date.getDay();
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - dayOfWeek,
          0,
          0,
          0,
          0
        );
        // End of the week
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 7);
        break;
        
      case MetricTimePeriod.MONTHLY:
        // Start of the month
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          1,
          0,
          0,
          0,
          0
        );
        // End of the month
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
        
      case MetricTimePeriod.QUARTERLY:
        // Start of the quarter
        const quarter = Math.floor(date.getMonth() / 3);
        periodStart = new Date(
          date.getFullYear(),
          quarter * 3,
          1,
          0,
          0,
          0,
          0
        );
        // End of the quarter
        periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 3);
        break;
        
      default:
        // Default to daily
        periodStart = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        );
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + 1);
    }
    
    return {
      periodStart: periodStart.getTime(),
      periodEnd: periodEnd.getTime()
    };
  }

  /**
   * Update aggregated metrics when a new metric is added
   */
  private async updateAggregatedMetrics(metric: AdMetric): Promise<void> {
    const { adId, period, periodStart, metricType, value } = metric;
    const storageKey = `aggregated:${adId}:${period}:${periodStart}`;
    
    // Get existing aggregated metrics for this period or create new ones
    const existing = await this.get<AdAggregatedMetrics>(storageKey);
    const periodRange = this.calculatePeriodRange(period, periodStart);
    
    let aggregated: AdAggregatedMetrics;
    
    if (existing) {
      aggregated = existing;
    } else {
      // Create new aggregated metrics with defaults
      aggregated = {
        id: `${adId}:${period}:${periodStart}`,
        adId,
        period,
        periodStart: periodRange.periodStart,
        periodEnd: periodRange.periodEnd,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
        conversionRate: 0,
        engagement: 0,
        viewability: 0,
        roas: 0,
        createdAt: StorageHelpers.now(),
        updatedAt: StorageHelpers.now()
      };
    }
    
    // Update the appropriate metric
    switch (metricType) {
      case AdMetricType.IMPRESSION:
        aggregated.impressions += value;
        break;
      case AdMetricType.CLICK:
        aggregated.clicks += value;
        break;
      case AdMetricType.CONVERSION:
        aggregated.conversions += value;
        break;
      case AdMetricType.ENGAGEMENT:
        // For engagement, we might want to average or use the latest value
        aggregated.engagement = value;
        break;
      case AdMetricType.VIEWABILITY:
        // For viewability, we might want to average or use the latest value
        aggregated.viewability = value;
        break;
      case AdMetricType.RETURN_ON_AD_SPEND:
        // For ROAS, use the latest value
        aggregated.roas = value;
        break;
    }
    
    // Recalculate derived metrics
    if (aggregated.impressions > 0) {
      aggregated.ctr = aggregated.clicks / aggregated.impressions;
      
      if (aggregated.clicks > 0) {
        aggregated.conversionRate = aggregated.conversions / aggregated.clicks;
      }
    }
    
    aggregated.updatedAt = StorageHelpers.now();
    
    // Store the updated aggregated metrics
    await this.set(storageKey, aggregated, this.DEFAULT_TTL);
  }

  /**
   * Get metrics history for an ad
   */
  async getMetricsHistory(
    adId: string,
    metricType: AdMetricType,
    period: MetricTimePeriod,
    limit: number = 10
  ): Promise<AdMetric[]> {
    // In a real implementation, this would use sorted sets or scans with the appropriate pattern
    console.warn('getMetricsHistory: Full implementation requires Redis sorted sets or scans');
    
    // For prototype purposes, we'll return empty array
    return [];
  }

  /**
   * Delete metrics for an ad
   */
  async deleteAdMetrics(adId: string): Promise<void> {
    // In a real implementation, this would use scans with the appropriate pattern
    console.warn('deleteAdMetrics: Full implementation requires Redis scans');
    
    // For prototype purposes, we'll just log a warning
    console.log(`Deleting metrics for ad ${adId} would require scanning all metrics with this adId pattern`);
  }
} 