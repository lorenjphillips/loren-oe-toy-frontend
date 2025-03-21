import { FeedbackCategory } from './FeedbackCategories';
import { FeedbackItem, FeedbackStore } from './FeedbackStore';
import { FeedbackProcessor } from './FeedbackProcessor';

export interface FeedbackSubmission {
  category: FeedbackCategory;
  details?: string;
  adId: string;
  sessionId: string;
  userHash?: string;
}

export interface FeedbackAnalytics {
  totalFeedbackCount: number;
  feedbackByCategory: Record<FeedbackCategory, number>;
  pendingCount: number;
  submittedCount: number;
  acknowledgedCount: number;
}

export class FeedbackManager {
  private static instance: FeedbackManager;
  private store: FeedbackStore;
  private processor: FeedbackProcessor;
  private apiEndpoint = '/api/feedback';

  private constructor() {
    this.store = FeedbackStore.getInstance();
    this.processor = FeedbackProcessor.getInstance();
  }

  public static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  /**
   * Submit feedback and store locally
   */
  public async submitFeedback(feedback: FeedbackSubmission): Promise<FeedbackItem> {
    // Store feedback locally first
    const feedbackItem = this.store.addFeedback({
      category: feedback.category,
      details: feedback.details,
      adId: feedback.adId,
      sessionId: feedback.sessionId,
      userHash: feedback.userHash
    });

    // Try to submit to server if available
    try {
      const response = await this.sendFeedbackToServer(feedbackItem);
      if (response.success) {
        this.processor.markAsSubmitted(feedbackItem.id);
        return this.store.getFeedbackById(feedbackItem.id)!;
      }
    } catch (error) {
      console.error('Failed to submit feedback to server:', error);
      // Keep as pending - will be retried later
    }

    return feedbackItem;
  }

  /**
   * Send feedback to server
   */
  private async sendFeedbackToServer(feedback: FeedbackItem): Promise<{ success: boolean }> {
    try {
      // If in development/test mode, simulate success
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        return { success: true };
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending feedback to server:', error);
      return { success: false };
    }
  }

  /**
   * Retry sending pending feedback
   */
  public async retryPendingFeedback(): Promise<number> {
    const pendingFeedback = this.store.getPendingFeedback();
    let successCount = 0;

    for (const item of pendingFeedback) {
      try {
        const response = await this.sendFeedbackToServer(item);
        if (response.success) {
          this.processor.markAsSubmitted(item.id);
          successCount++;
        }
      } catch (error) {
        console.error(`Failed to retry feedback ${item.id}:`, error);
      }
    }

    return successCount;
  }

  /**
   * Get feedback analytics
   */
  public getFeedbackAnalytics(): FeedbackAnalytics {
    const allFeedback = this.store.getAllFeedback();
    
    // Count by category
    const feedbackByCategory = Object.values(FeedbackCategory).reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {} as Record<FeedbackCategory, number>);
    
    // Count by status
    let pendingCount = 0;
    let submittedCount = 0;
    let acknowledgedCount = 0;
    
    allFeedback.forEach(item => {
      // Count by category
      feedbackByCategory[item.category]++;
      
      // Count by status
      if (item.status === 'pending') pendingCount++;
      else if (item.status === 'submitted') submittedCount++;
      else if (item.status === 'acknowledged') acknowledgedCount++;
    });
    
    return {
      totalFeedbackCount: allFeedback.length,
      feedbackByCategory,
      pendingCount,
      submittedCount,
      acknowledgedCount
    };
  }
} 