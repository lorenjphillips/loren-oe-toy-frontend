import { StorageEntity, ValidatableEntity } from './baseTypes';

/**
 * Analytics event types
 */
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  AD_IMPRESSION = 'ad_impression',
  AD_CLICK = 'ad_click',
  AD_CONVERSION = 'ad_conversion',
  USER_INTERACTION = 'user_interaction',
  ERROR = 'error'
}

/**
 * Base analytics event interface
 */
export interface AnalyticsEvent extends StorageEntity {
  type: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  properties: Record<string, any>;
}

/**
 * Ad impression event
 */
export interface AdImpressionEvent extends AnalyticsEvent {
  type: AnalyticsEventType.AD_IMPRESSION;
  properties: {
    adId: string;
    position: string;
    context: string;
    loadTime: number;
    viewTime?: number;
  };
}

/**
 * Ad click event
 */
export interface AdClickEvent extends AnalyticsEvent {
  type: AnalyticsEventType.AD_CLICK;
  properties: {
    adId: string;
    position: string;
    targetUrl: string;
    timeToClick: number;
  };
}

/**
 * Analytics event validator
 */
export class AnalyticsEventValidator extends ValidatableEntity implements AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  properties: Record<string, any>;

  constructor(data: Partial<AnalyticsEvent>) {
    super(data);
    this.type = data.type || AnalyticsEventType.PAGE_VIEW;
    this.timestamp = data.timestamp || Date.now();
    this.sessionId = data.sessionId || '';
    this.userId = data.userId;
    this.properties = data.properties || {};
  }

  validate(): boolean {
    if (!this.sessionId) {
      console.error('Analytics event validation failed: Missing sessionId');
      return false;
    }

    if (!Object.values(AnalyticsEventType).includes(this.type)) {
      console.error(`Analytics event validation failed: Invalid event type ${this.type}`);
      return false;
    }

    if (!this.properties || typeof this.properties !== 'object') {
      console.error('Analytics event validation failed: Properties must be an object');
      return false;
    }

    return true;
  }
} 