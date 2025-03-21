/**
 * User Journey Metrics
 * 
 * Models for tracking session flows in an anonymized manner.
 * Ensures HIPAA compliance and physician privacy.
 */

import { AnalyticsEvent, AnalyticsEventCategory } from './AnalyticsEvent';

// Adding JOURNEY category to AnalyticsEventCategory
declare module './AnalyticsEvent' {
  export interface AnalyticsEventCategoryInterface {
    JOURNEY: 'journey';
  }

  export enum AnalyticsEventCategory {
    JOURNEY = 'journey'
  }
}

/**
 * Types of actions a user can take during a session
 */
export enum SessionActionType {
  VIEW_PAGE = 'view_page',
  ASK_QUESTION = 'ask_question',
  VIEW_ANSWER = 'view_answer',
  SEARCH = 'search',
  FILTER = 'filter',
  NAVIGATE = 'navigate',
  INTERACT_WITH_AD = 'interact_with_ad',
  VIEW_AD = 'view_ad',
  OPEN_RESOURCE = 'open_resource',
  LOGIN = 'login',
  LOGOUT = 'logout',
  CLICK_BUTTON = 'click_button',
  EXPAND_SECTION = 'expand_section',
  COLLAPSE_SECTION = 'collapse_section',
  SUBMIT_FORM = 'submit_form',
  COPY_TEXT = 'copy_text',
  SHARE_CONTENT = 'share_content',
  PROVIDE_FEEDBACK = 'provide_feedback',
  ERROR = 'error'
}

/**
 * Types of pages in the application
 */
export enum PageType {
  HOME = 'home',
  QUESTION = 'question',
  ANSWER = 'answer',
  SEARCH_RESULTS = 'search_results',
  PROFILE = 'profile',
  RESOURCES = 'resources',
  HISTORY = 'history',
  FEED = 'feed',
  SETTINGS = 'settings',
  ERROR = 'error',
  LANDING = 'landing',
  CATEGORY = 'category',
  CURRENT = 'current'
}

/**
 * Data for each step in a user session
 */
export interface SessionStep {
  stepId: string;
  timestamp: number;
  actionType: SessionActionType;
  pageType: PageType;
  pageId: string;
  durationSinceLast: number;
  metadata?: Record<string, any>;
}

/**
 * Core data structure for user journey data
 */
export interface UserJourneyData {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  stepCount: number;
  pagesVisited: number;
  completedQuestions: number;
  adImpressions: number;
  adInteractions: number;
  adInteractionRate: number;
  bounced: boolean;
  entryPage?: string;
  exitPage?: string;
  endReason: string;
}

/**
 * Event triggered when a session starts
 */
export interface SessionStartEvent extends AnalyticsEvent {
  eventType: 'session_start';
  eventCategory: AnalyticsEventCategory.JOURNEY;
  data: {
    sessionId: string;
    timestamp: number;
    anonymous: boolean;
  };
}

/**
 * Event triggered for each step in a session
 */
export interface SessionStepEvent extends AnalyticsEvent {
  eventType: 'session_step';
  eventCategory: AnalyticsEventCategory.JOURNEY;
  data: {
    sessionId: string;
    timestamp: number;
    step: SessionStep;
  };
}

/**
 * Event triggered when a session ends
 */
export interface SessionEndEvent extends AnalyticsEvent {
  eventType: 'session_end';
  eventCategory: AnalyticsEventCategory.JOURNEY;
  data: UserJourneyData;
}

/**
 * Event for tracking question flows
 */
export interface QuestionFlowEvent extends AnalyticsEvent {
  eventType: 'question_flow';
  eventCategory: AnalyticsEventCategory.JOURNEY;
  data: {
    sessionId: string;
    questionId: string;
    startTime: number;
    currentTime: number;
    duration: number;
    stepCount: number;
    currentAction: SessionActionType;
    hasViewedAnswer: boolean;
    hasInteractedWithAd: boolean;
    stepsInFlow: Array<{
      actionType: SessionActionType;
      timestamp: number;
    }>;
  };
}

/**
 * Event for tracking feature usage
 */
export interface FeatureUsageEvent extends AnalyticsEvent {
  eventType: 'feature_usage';
  eventCategory: AnalyticsEventCategory.JOURNEY;
  data: {
    sessionId: string;
    timestamp: number;
    featureName: string;
    featureCategory: string;
    action: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Aggregated metrics for reporting on user journeys
 */
export interface AggregateJourneyMetrics {
  date: string;
  totalSessions: number;
  totalSessionDuration: number;
  averageSessionDuration: number;
  bounceCount: number;
  bounceRate: number;
  totalPageViews: number;
  avgPagesPerSession: number;
  entryPageCounts: Record<string, number>;
  exitPageCounts: Record<string, number>;
  totalAdImpressions: number;
  totalAdInteractions: number;
  adInteractionRate: number;
  totalQuestions: number;
  avgQuestionsPerSession: number;
} 