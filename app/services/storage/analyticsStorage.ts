import { KVStorageService } from '../../lib/storage';
import { 
  AnalyticsEvent, 
  AnalyticsEventType, 
  AnalyticsEventValidator 
} from '../../models/storage/analyticsTypes';
import { StorageHelpers } from '../../models/storage/baseTypes';

/**
 * Storage service for analytics events
 */
export class AnalyticsStorageService extends KVStorageService {
  // Default TTL for analytics data (90 days)
  private readonly DEFAULT_TTL = 60 * 60 * 24 * 90;
  
  constructor() {
    super('analytics');
  }

  /**
   * Store an analytics event
   */
  async storeEvent(event: AnalyticsEvent): Promise<string> {
    const validator = new AnalyticsEventValidator(event);
    
    if (!validator.validate()) {
      throw new Error('Invalid analytics event');
    }
    
    const id = event.id || StorageHelpers.generateId();
    const storageKey = `event:${event.type}:${id}`;
    
    await this.set(storageKey, event, this.DEFAULT_TTL);
    
    // For events like impressions and clicks, update counters
    if (
      event.type === AnalyticsEventType.AD_IMPRESSION || 
      event.type === AnalyticsEventType.AD_CLICK
    ) {
      await this.incrementEventCounter(event.type);
      
      // If we have adId in properties, update ad-specific counters
      const adId = event.properties.adId;
      if (adId) {
        await this.incrementAdEventCounter(adId, event.type);
      }
    }
    
    return id;
  }

  /**
   * Get an analytics event by ID and type
   */
  async getEvent(eventType: AnalyticsEventType, eventId: string): Promise<AnalyticsEvent | null> {
    const storageKey = `event:${eventType}:${eventId}`;
    return this.get<AnalyticsEvent>(storageKey);
  }

  /**
   * Get events by time range
   */
  async getEventsByTimeRange(
    eventType: AnalyticsEventType,
    startTime: number,
    endTime: number,
    limit: number = 100
  ): Promise<AnalyticsEvent[]> {
    // This is a simplified implementation
    // For a real implementation, you would use sorted sets in Redis
    // or implement scanning with filtering
    
    // For prototype purposes, we'll return empty array as this would require
    // additional Redis features beyond simple key-value access
    console.warn('getEventsByTimeRange: Full implementation requires Redis sorted sets');
    return [];
  }

  /**
   * Increment global event counter
   */
  private async incrementEventCounter(eventType: AnalyticsEventType): Promise<number> {
    const counterKey = `counter:global:${eventType}`;
    return this.increment(counterKey);
  }

  /**
   * Increment ad-specific event counter
   */
  private async incrementAdEventCounter(adId: string, eventType: AnalyticsEventType): Promise<number> {
    const counterKey = `counter:ad:${adId}:${eventType}`;
    return this.increment(counterKey);
  }

  /**
   * Get count of events for a specific type
   */
  async getEventCount(eventType: AnalyticsEventType): Promise<number> {
    const counterKey = `counter:global:${eventType}`;
    const count = await this.get<number>(counterKey);
    return count || 0;
  }

  /**
   * Get ad-specific event count
   */
  async getAdEventCount(adId: string, eventType: AnalyticsEventType): Promise<number> {
    const counterKey = `counter:ad:${adId}:${eventType}`;
    const count = await this.get<number>(counterKey);
    return count || 0;
  }

  /**
   * Calculate ad CTR (Click-Through Rate)
   */
  async getAdCTR(adId: string): Promise<number> {
    const impressions = await this.getAdEventCount(adId, AnalyticsEventType.AD_IMPRESSION);
    const clicks = await this.getAdEventCount(adId, AnalyticsEventType.AD_CLICK);
    
    if (impressions === 0) return 0;
    return clicks / impressions;
  }
} 