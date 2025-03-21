import { KVStorageService } from '../../lib/storage';
import { 
  Feedback, 
  FeedbackStatus, 
  FeedbackType, 
  FeedbackValidator 
} from '../../models/storage/feedbackTypes';
import { StorageHelpers } from '../../models/storage/baseTypes';

/**
 * Storage service for user feedback
 */
export class FeedbackStorageService extends KVStorageService {
  // Default TTL for feedback data (180 days)
  private readonly DEFAULT_TTL = 60 * 60 * 24 * 180;
  
  constructor() {
    super('feedback');
  }

  /**
   * Store feedback
   */
  async storeFeedback(feedback: Feedback): Promise<string> {
    const validator = new FeedbackValidator(feedback);
    
    if (!validator.validate()) {
      throw new Error('Invalid feedback data');
    }
    
    const id = feedback.id || StorageHelpers.generateId();
    feedback.id = id;
    
    // If not already set, mark as new
    if (!feedback.status) {
      feedback.status = FeedbackStatus.NEW;
    }
    
    const storageKey = `feedback:${feedback.type}:${id}`;
    await this.set(storageKey, feedback, this.DEFAULT_TTL);
    
    // Add to index by type
    await this.addToTypeIndex(feedback.type, id);
    
    // If it's ad feedback, also index by adId
    if (
      feedback.type === FeedbackType.AD_RATING || 
      feedback.type === FeedbackType.AD_REPORT
    ) {
      const adId = feedback.metadata?.adId;
      if (adId) {
        await this.addToAdIndex(adId, id);
      }
    }
    
    return id;
  }

  /**
   * Get feedback by ID
   */
  async getFeedback(id: string): Promise<Feedback | null> {
    // We need to find the feedback type first
    const types = Object.values(FeedbackType);
    
    for (const type of types) {
      const storageKey = `feedback:${type}:${id}`;
      const feedback = await this.get<Feedback>(storageKey);
      if (feedback) {
        return feedback;
      }
    }
    
    return null;
  }

  /**
   * Get all feedback of a specific type
   */
  async getFeedbackByType(type: FeedbackType): Promise<string[]> {
    const indexKey = `index:type:${type}`;
    const result = await this.get<string[]>(indexKey);
    return result || [];
  }

  /**
   * Get all feedback for a specific ad
   */
  async getFeedbackByAd(adId: string): Promise<string[]> {
    const indexKey = `index:ad:${adId}`;
    const result = await this.get<string[]>(indexKey);
    return result || [];
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<boolean> {
    const feedback = await this.getFeedback(id);
    
    if (!feedback) {
      return false;
    }
    
    feedback.status = status;
    feedback.updatedAt = StorageHelpers.now();
    
    const storageKey = `feedback:${feedback.type}:${id}`;
    await this.set(storageKey, feedback, this.DEFAULT_TTL);
    
    return true;
  }

  /**
   * Add feedback ID to type index
   */
  private async addToTypeIndex(type: FeedbackType, id: string): Promise<void> {
    const indexKey = `index:type:${type}`;
    const ids = await this.get<string[]>(indexKey) || [];
    
    if (!ids.includes(id)) {
      ids.push(id);
      await this.set(indexKey, ids);
    }
  }

  /**
   * Add feedback ID to ad index
   */
  private async addToAdIndex(adId: string, id: string): Promise<void> {
    const indexKey = `index:ad:${adId}`;
    const ids = await this.get<string[]>(indexKey) || [];
    
    if (!ids.includes(id)) {
      ids.push(id);
      await this.set(indexKey, ids);
    }
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(id: string): Promise<boolean> {
    const feedback = await this.getFeedback(id);
    
    if (!feedback) {
      return false;
    }
    
    const storageKey = `feedback:${feedback.type}:${id}`;
    await this.delete(storageKey);
    
    // Remove from type index
    await this.removeFromTypeIndex(feedback.type, id);
    
    // If it's ad feedback, also remove from ad index
    if (
      feedback.type === FeedbackType.AD_RATING || 
      feedback.type === FeedbackType.AD_REPORT
    ) {
      const adId = feedback.metadata?.adId;
      if (adId) {
        await this.removeFromAdIndex(adId, id);
      }
    }
    
    return true;
  }

  /**
   * Remove feedback ID from type index
   */
  private async removeFromTypeIndex(type: FeedbackType, id: string): Promise<void> {
    const indexKey = `index:type:${type}`;
    const ids = await this.get<string[]>(indexKey) || [];
    
    const newIds = ids.filter(existingId => existingId !== id);
    await this.set(indexKey, newIds);
  }

  /**
   * Remove feedback ID from ad index
   */
  private async removeFromAdIndex(adId: string, id: string): Promise<void> {
    const indexKey = `index:ad:${adId}`;
    const ids = await this.get<string[]>(indexKey) || [];
    
    const newIds = ids.filter(existingId => existingId !== id);
    await this.set(indexKey, newIds);
  }
} 