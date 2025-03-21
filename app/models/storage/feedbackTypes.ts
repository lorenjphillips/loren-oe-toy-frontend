import { StorageEntity, ValidatableEntity } from './baseTypes';

/**
 * Feedback types
 */
export enum FeedbackType {
  AD_RATING = 'ad_rating',
  AD_REPORT = 'ad_report',
  CONTENT_FEEDBACK = 'content_feedback',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report'
}

/**
 * Feedback severity levels
 */
export enum FeedbackSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Feedback status
 */
export enum FeedbackStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

/**
 * Base feedback interface
 */
export interface Feedback extends StorageEntity {
  type: FeedbackType;
  userId?: string;
  sessionId: string;
  message: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  metadata: Record<string, any>;
}

/**
 * Ad feedback specific interface
 */
export interface AdFeedback extends Feedback {
  type: FeedbackType.AD_RATING | FeedbackType.AD_REPORT;
  metadata: {
    adId: string;
    rating?: number;
    reason?: string;
    screenshot?: string;
  };
}

/**
 * Feedback validator
 */
export class FeedbackValidator extends ValidatableEntity implements Feedback {
  type: FeedbackType;
  userId?: string;
  sessionId: string;
  message: string;
  severity: FeedbackSeverity;
  status: FeedbackStatus;
  metadata: Record<string, any>;

  constructor(data: Partial<Feedback>) {
    super(data);
    this.type = data.type || FeedbackType.CONTENT_FEEDBACK;
    this.userId = data.userId;
    this.sessionId = data.sessionId || '';
    this.message = data.message || '';
    this.severity = data.severity || FeedbackSeverity.MEDIUM;
    this.status = data.status || FeedbackStatus.NEW;
    this.metadata = data.metadata || {};
  }

  validate(): boolean {
    if (!this.sessionId) {
      console.error('Feedback validation failed: Missing sessionId');
      return false;
    }

    if (!Object.values(FeedbackType).includes(this.type)) {
      console.error(`Feedback validation failed: Invalid feedback type ${this.type}`);
      return false;
    }

    if (!this.message.trim()) {
      console.error('Feedback validation failed: Message cannot be empty');
      return false;
    }

    if (!Object.values(FeedbackSeverity).includes(this.severity)) {
      console.error(`Feedback validation failed: Invalid severity ${this.severity}`);
      return false;
    }

    if (!Object.values(FeedbackStatus).includes(this.status)) {
      console.error(`Feedback validation failed: Invalid status ${this.status}`);
      return false;
    }

    if (this.type === FeedbackType.AD_RATING || this.type === FeedbackType.AD_REPORT) {
      if (!this.metadata.adId) {
        console.error('Feedback validation failed: Missing adId for ad feedback');
        return false;
      }
    }

    return true;
  }
} 