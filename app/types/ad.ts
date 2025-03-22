/**
 * Types for the ad delivery system
 */

import { AdType } from './adTypeUnified';

/**
 * Interface for an ad in the system
 */
export interface Ad {
  id: string;
  title: string;
  body: string;
  advertiser: string;
  type: AdType;
  categories: string[];
  url: string;
  imageUrl?: string;
  videoUrl?: string;
  active: boolean;
  priority: number; // 0-10 scale where 10 is highest priority
  metadata?: Record<string, any>;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Ad impression event data
 */
export interface AdImpression {
  id: string;
  adId: string;
  userId?: string;
  timestamp: Date;
  query?: string;
  categories: string[];
  advertiserId: string;
  placement: string;
  sessionId?: string;
}

/**
 * Ad click event data
 */
export interface AdClick {
  id: string;
  adId: string;
  impressionId: string;
  userId?: string;
  timestamp: Date;
  advertiserId: string;
  url: string;
  sessionId?: string;
}

/**
 * Options for ad targeting
 */
export interface AdTargetingOptions {
  categories?: string[];
  advertisers?: string[];
  types?: AdType[];
  excludeCategories?: string[];
  excludeAdvertisers?: string[];
  priorityMin?: number;
  limit?: number;
}

/**
 * Response from the ad service
 */
export interface AdResponse {
  ads: Ad[];
  totalMatches: number;
  categories: string[];
} 