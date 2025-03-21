export interface AdCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  categories: string[]; // category IDs
  priority: number; // Higher number means higher priority
  startDate?: Date;
  endDate?: Date;
  impressions: number;
  clicks: number;
  conversionRate?: number;
}

export interface AdDeliveryResponse {
  ad: Ad | null;
  matchConfidence: number;
  matchedCategories: string[];
}

export interface QuestionClassification {
  categories: {
    categoryId: string;
    confidence: number;
  }[];
  keywords: string[];
}

export interface AnalyticsEvent {
  type: 'impression' | 'click' | 'conversion';
  adId: string;
  userId?: string;
  questionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
} 