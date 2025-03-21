/**
 * TypeScript interfaces for ad content, companies, and related models
 */

import { AdType } from '../types/ad';

/**
 * Display settings for ad content
 */
export interface AdDisplaySettings {
  backgroundColor?: string;      // Preferred background color (hex)
  textColor?: string;            // Preferred text color (hex)
  fontFamily?: string;           // Preferred font family
  border?: boolean;              // Whether to show a border
  borderColor?: string;          // Border color if border is true
  cornerRadius?: number;         // Border radius in pixels
  maxWidth?: number;             // Maximum width in pixels
  padding?: number;              // Padding in pixels
  logoPosition?: 'top' | 'bottom' | 'left' | 'right'; // Logo position
  animationEnabled?: boolean;    // Whether to enable animations
  contentLayout?: 'standard' | 'compact' | 'expanded'; // Layout style
}

/**
 * Treatment category information
 */
export interface TreatmentCategory {
  id: string;                    // Treatment area ID (e.g., "cardiology_hypertension")
  name: string;                  // Display name (e.g., "Hypertension")
  medicalCategory: string;       // Medical category ID (e.g., "cardiology")
  medicalCategoryName: string;   // Medical category name (e.g., "Cardiology")
  keywords: string[];            // Related keywords for this treatment
  description?: string;          // Brief description of this treatment area
  preferredAdTypes?: AdType[];   // Preferred ad formats for this treatment
}

/**
 * Pharma company information for ad content
 */
export interface AdCompany {
  id: string;                    // Company ID (e.g., "pfizer")
  name: string;                  // Company name (e.g., "Pfizer")
  logoUrl: string;               // URL to company logo
  primaryColor?: string;         // Primary brand color (hex)
  secondaryColor?: string;       // Secondary brand color (hex)
  website?: string;              // Company website URL
  defaultDisplaySettings: AdDisplaySettings; // Default display settings for all ads
  legalDisclaimer?: string;      // Legal disclaimer text to show with ads
}

/**
 * Creative content for a specific ad
 */
export interface AdCreative {
  id: string;                    // Unique identifier for the creative
  headline: string;              // Main headline text
  subheadline?: string;          // Secondary headline
  bodyText: string;              // Body text content
  callToAction: string;          // Call to action text
  imageUrl?: string;             // Main image URL
  thumbnailUrl?: string;         // Thumbnail image URL
  videoUrl?: string;             // Video content URL
  displaySettings?: AdDisplaySettings; // Creative-specific display settings (overrides defaults)
}

/**
 * Metadata for tracking and analytics
 */
export interface AdMetadata {
  campaignId?: string;           // Marketing campaign ID
  targetAudience?: string[];     // Target audience segments
  keywords?: string[];           // Additional targeting keywords
  startDate?: Date;              // Start date for this ad content
  endDate?: Date;                // End date for this ad content
  priority: number;              // Priority level (1-10, higher = more important)
  maxImpressions?: number;       // Maximum number of impressions allowed
  maxImpressionsByUser?: number; // Maximum impressions per unique user
  frequencyCap?: {               // Frequency capping settings
    count: number;               // Number of impressions allowed
    timeWindowHours: number;     // Time window in hours
  };
  abTestGroup?: string;          // A/B test group identifier
}

/**
 * Complete ad content model
 */
export interface AdContent {
  id: string;                    // Unique identifier
  name: string;                  // Internal name for this content
  company: AdCompany;            // Company information
  treatmentCategory: TreatmentCategory; // Treatment category
  type: AdType;                  // Ad format type
  creative: AdCreative;          // Creative content
  metadata: AdMetadata;          // Tracking and analytics metadata
  isActive: boolean;             // Whether this ad is currently active
  alternateAds?: string[];       // IDs of alternate ad content to try if this one is unavailable
}

/**
 * Ad impression tracking data
 */
export interface AdContentImpression {
  id: string;                    // Unique identifier for this impression
  adContentId: string;           // ID of the ad content
  timestamp: Date;               // When the impression occurred
  userId?: string;               // User ID if available
  questionId?: string;           // Question ID if available
  questionText?: string;         // The original question text
  deviceInfo?: {                 // Device information if available
    type: string;                // Device type
    browser: string;             // Browser information
    os: string;                  // Operating system
  };
  sourceInfo?: {                 // Source information
    page: string;                // Page where the ad was shown
    placement: string;           // Placement location on the page
    referrer?: string;           // Referrer URL if available
  };
  confidenceScore?: number;      // Confidence score that triggered this ad
}

/**
 * Ad content filter options
 */
export interface AdContentFilterOptions {
  companyIds?: string[];         // Filter by company IDs
  treatmentCategoryIds?: string[];  // Filter by treatment category IDs
  medicalCategoryIds?: string[]; // Filter by medical category IDs
  adTypes?: AdType[];            // Filter by ad types
  minimumConfidence?: number;    // Minimum confidence score threshold
  priorityMin?: number;          // Minimum priority level
  isActive?: boolean;            // Filter by active status
  limit?: number;                // Maximum number of results to return
  excludeCompanyIds?: string[];  // Exclude specific company IDs
  excludeCategoryIds?: string[]; // Exclude specific category IDs
}

/**
 * Response format for ad content retrieval
 */
export interface AdContentResponse {
  content: AdContent[];          // List of ad content
  totalFound: number;            // Total number of matches found
  confidenceScore?: number;      // Confidence score used for filtering
  impressionId?: string;         // ID of the recorded impression if tracked
} 