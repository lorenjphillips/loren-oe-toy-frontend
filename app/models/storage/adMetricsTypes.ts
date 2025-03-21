import { StorageEntity, ValidatableEntity } from './baseTypes';

/**
 * Ad metric types
 */
export enum AdMetricType {
  IMPRESSION = 'impression',
  CLICK = 'click',
  CONVERSION = 'conversion',
  ENGAGEMENT = 'engagement',
  VIEWABILITY = 'viewability',
  RETURN_ON_AD_SPEND = 'roas'
}

/**
 * Time period for metrics
 */
export enum MetricTimePeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

/**
 * Base ad metric interface
 */
export interface AdMetric extends StorageEntity {
  adId: string;
  metricType: AdMetricType;
  value: number;
  period: MetricTimePeriod;
  periodStart: number;
  periodEnd: number;
  metadata: Record<string, any>;
}

/**
 * Aggregated metrics for an ad
 */
export interface AdAggregatedMetrics extends StorageEntity {
  adId: string;
  period: MetricTimePeriod;
  periodStart: number;
  periodEnd: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversionRate: number;
  engagement: number;
  viewability: number;
  roas: number;
}

/**
 * Ad metric validator
 */
export class AdMetricValidator extends ValidatableEntity implements AdMetric {
  adId: string;
  metricType: AdMetricType;
  value: number;
  period: MetricTimePeriod;
  periodStart: number;
  periodEnd: number;
  metadata: Record<string, any>;

  constructor(data: Partial<AdMetric>) {
    super(data);
    this.adId = data.adId || '';
    this.metricType = data.metricType || AdMetricType.IMPRESSION;
    this.value = data.value || 0;
    this.period = data.period || MetricTimePeriod.DAILY;
    this.periodStart = data.periodStart || 0;
    this.periodEnd = data.periodEnd || 0;
    this.metadata = data.metadata || {};
  }

  validate(): boolean {
    if (!this.adId) {
      console.error('Ad metric validation failed: Missing adId');
      return false;
    }

    if (!Object.values(AdMetricType).includes(this.metricType)) {
      console.error(`Ad metric validation failed: Invalid metric type ${this.metricType}`);
      return false;
    }

    if (typeof this.value !== 'number') {
      console.error('Ad metric validation failed: Value must be a number');
      return false;
    }

    if (!Object.values(MetricTimePeriod).includes(this.period)) {
      console.error(`Ad metric validation failed: Invalid period ${this.period}`);
      return false;
    }

    if (this.periodStart >= this.periodEnd) {
      console.error('Ad metric validation failed: Period start must be before period end');
      return false;
    }

    return true;
  }
} 