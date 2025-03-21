/**
 * Ad Type definitions
 * 
 * Contains type definitions for ad content and related structures
 * used throughout the OpenEvidence platform.
 */

/**
 * Enum for different types of ads
 */
export enum AdType {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  INTERACTIVE = 'interactive',
  MICROSIMULATION = 'microsimulation',
  KNOWLEDGE_GRAPH = 'knowledge_graph',
  VIDEO = 'video'
}

/**
 * Interface for treatment categories
 */
export interface TreatmentCategory {
  id: string;
  name: string;
  medicalCategory: string;
  relevantSpecialties: string[];
  description?: string;
}

/**
 * Interface for interactive content options
 */
export interface InteractiveContent {
  type: string;
  data: any;
  interactionOptions: string[];
}

/**
 * Interface for the core ad content
 */
export interface AdContent {
  id: string;
  campaignId: string;
  adType: AdType;
  title: string;
  description: string;
  treatmentCategory: TreatmentCategory;
  targetConditions: string[];
  brandName?: string;
  genericName?: string;
  manufacturer?: string;
  imageUrl?: string;
  templateId?: string;
  callToAction?: {
    text: string;
    url: string;
    trackingId: string;
  };
  keywords: string[];
  entityMappings: {
    entity: string;
    type: string;
    confidence: number;
  }[];
  interactiveContent?: InteractiveContent;
  videoUrl?: string;
  microsimulationConfig?: {
    modelId: string;
    parameters: Record<string, any>;
  };
  knowledgeGraphConfig?: {
    topics: string[];
    depth: number;
  };
  createdAt: number;
  updatedAt: number;
  activeTo: number;
  isActive: boolean;
  regulatoryApproved: boolean;
  disclaimers: string[];
  references: {
    title: string;
    url: string;
  }[];
}

/**
 * Interface for ad impression data
 */
export interface AdImpression {
  id: string;
  adId: string;
  adContent: AdContent;
  placementId: string;
  sessionId: string;
  questionId?: string;
  startTime: number;
  endTime?: number;
  viewable: boolean;
  viewableDuration: number;
  interacted: boolean;
  completed: boolean;
}

/**
 * Interface for ad placement configuration
 */
export interface AdPlacement {
  id: string;
  name: string;
  location: 'sidebar' | 'in_content' | 'banner' | 'post_question';
  size: {
    width: number;
    height: number;
  };
  allowedAdTypes: AdType[];
  contextual: boolean;
  maxAdsPerPage: number;
  priority: number;
}

/**
 * Interface for ad campaign details
 */
export interface AdCampaign {
  id: string;
  name: string;
  advertiserId: string;
  treatmentCategories: TreatmentCategory[];
  startDate: number;
  endDate: number;
  budget: number;
  targetSpecialties: string[];
  targetGeographies?: string[];
  targetIntents?: string[];
  isActive: boolean;
  ads: AdContent[];
  createdAt: number;
  updatedAt: number;
}

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