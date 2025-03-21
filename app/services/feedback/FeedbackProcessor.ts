import { FeedbackCategory, getFeedbackCategoryById } from './FeedbackCategories';
import { FeedbackItem, FeedbackStore } from './FeedbackStore';

interface ProcessedFeedback {
  id: string;
  categoryLabel: string;
  categoryDescription: string;
  details: string;
  adId: string;
  timestamp: number;
  formattedDate: string;
  priorityLevel: 'low' | 'medium' | 'high';
}

export class FeedbackProcessor {
  private static instance: FeedbackProcessor;
  private store: FeedbackStore;

  private constructor() {
    this.store = FeedbackStore.getInstance();
  }

  public static getInstance(): FeedbackProcessor {
    if (!FeedbackProcessor.instance) {
      FeedbackProcessor.instance = new FeedbackProcessor();
    }
    return FeedbackProcessor.instance;
  }

  /**
   * Process feedback items for review
   */
  public processFeedbackForReview(): ProcessedFeedback[] {
    const pendingItems = this.store.getPendingFeedback();
    return pendingItems.map(item => this.processFeedbackItem(item));
  }

  /**
   * Process a single feedback item
   */
  private processFeedbackItem(item: FeedbackItem): ProcessedFeedback {
    const category = getFeedbackCategoryById(item.category);
    
    return {
      id: item.id,
      categoryLabel: category.label,
      categoryDescription: category.description,
      details: item.details || 'No details provided',
      adId: item.adId,
      timestamp: item.timestamp,
      formattedDate: new Date(item.timestamp).toLocaleString(),
      priorityLevel: this.determinePriorityLevel(item.category),
    };
  }

  /**
   * Determine priority level based on feedback category
   */
  private determinePriorityLevel(category: FeedbackCategory): 'low' | 'medium' | 'high' {
    // High priority categories
    if ([
      FeedbackCategory.INAPPROPRIATE_CONTENT,
      FeedbackCategory.SENSITIVE_HEALTH_DATA,
      FeedbackCategory.ETHICAL_CONCERN
    ].includes(category)) {
      return 'high';
    }
    
    // Medium priority categories
    if ([
      FeedbackCategory.MISLEADING_INFORMATION,
      FeedbackCategory.ACCURACY_ISSUE
    ].includes(category)) {
      return 'medium';
    }
    
    // Low priority categories
    return 'low';
  }

  /**
   * Mark feedback as submitted and prepare for transmission
   */
  public markAsSubmitted(feedbackId: string): void {
    this.store.updateFeedback(feedbackId, { status: 'submitted' });
  }

  /**
   * Mark feedback as acknowledged after receiving confirmation
   */
  public markAsAcknowledged(feedbackId: string): void {
    this.store.updateFeedback(feedbackId, { status: 'acknowledged' });
  }
} 