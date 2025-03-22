import { Ad, AdClick, AdImpression, AdTargetingOptions } from '../types/ad';
import { AdType } from '../types/adTypeUnified';

/**
 * Mock database of ads
 * In a real implementation, this would come from a database
 */
const mockAds: Ad[] = [
  {
    id: 'ad_pfizer_oncology_1',
    title: 'Pfizer Oncology Research & Treatments',
    body: 'Leading innovation in breast cancer treatments. Learn about our latest advances.',
    advertiser: 'Pfizer',
    type: AdType.BANNER,
    categories: ['oncology', 'breast_cancer'],
    url: 'https://example.com/pfizer/oncology',
    imageUrl: 'https://example.com/images/pfizer_oncology.jpg',
    active: true,
    priority: 8
  },
  {
    id: 'ad_genentech_oncology_1',
    title: 'New Genentech Clinical Trials for breast cancer',
    body: 'Genentech is recruiting patients for breakthrough oncology treatments. See if you qualify.',
    advertiser: 'Genentech',
    type: AdType.SPONSORED_CONTENT,
    categories: ['oncology', 'breast_cancer', 'clinical_trials'],
    url: 'https://example.com/genentech/trials/breast_cancer',
    imageUrl: 'https://example.com/images/genentech_trials.jpg',
    active: true,
    priority: 9
  },
  {
    id: 'ad_gsk_respiratory_1',
    title: 'GSK: Understanding asthma',
    body: 'Watch our educational video about respiratory treatments and management strategies.',
    advertiser: 'GSK',
    type: AdType.VIDEO,
    categories: ['respiratory', 'asthma'],
    url: 'https://example.com/gsk/respiratory/asthma',
    videoUrl: 'https://example.com/videos/gsk_asthma.mp4',
    active: true,
    priority: 7
  },
  {
    id: 'ad_eli_lilly_diabetes_1',
    title: 'Eli Lilly Diabetes Treatment Options',
    body: 'Discover how Eli Lilly\'s innovative treatments can help manage diabetes.',
    advertiser: 'Eli Lilly',
    type: AdType.TEXT,
    categories: ['endocrinology', 'diabetes'],
    url: 'https://example.com/eli_lilly/diabetes',
    active: true,
    priority: 8
  }
];

/**
 * Mock impressions database
 */
const impressions: AdImpression[] = [];

/**
 * Mock clicks database
 */
const clicks: AdClick[] = [];

/**
 * Get ads by category
 * 
 * @param options Targeting options for ad selection
 * @returns Matching ads
 */
export function getAdsByCategory(options: AdTargetingOptions): Ad[] {
  let filteredAds = [...mockAds];
  
  // Filter by categories if specified
  if (options.categories && options.categories.length > 0) {
    filteredAds = filteredAds.filter(ad => 
      ad.categories.some(category => options.categories!.includes(category))
    );
  }
  
  // Filter by advertisers if specified
  if (options.advertisers && options.advertisers.length > 0) {
    filteredAds = filteredAds.filter(ad => 
      options.advertisers!.includes(ad.advertiser)
    );
  }
  
  // Filter by ad types if specified
  if (options.types && options.types.length > 0) {
    filteredAds = filteredAds.filter(ad => 
      options.types!.includes(ad.type)
    );
  }
  
  // Exclude categories if specified
  if (options.excludeCategories && options.excludeCategories.length > 0) {
    filteredAds = filteredAds.filter(ad => 
      !ad.categories.some(category => options.excludeCategories!.includes(category))
    );
  }
  
  // Exclude advertisers if specified
  if (options.excludeAdvertisers && options.excludeAdvertisers.length > 0) {
    filteredAds = filteredAds.filter(ad => 
      !options.excludeAdvertisers!.includes(ad.advertiser)
    );
  }
  
  // Filter by minimum priority if specified
  if (options.priorityMin !== undefined) {
    filteredAds = filteredAds.filter(ad => ad.priority >= options.priorityMin!);
  }
  
  // Only return active ads
  filteredAds = filteredAds.filter(ad => ad.active);
  
  // Sort by priority (highest first)
  filteredAds.sort((a, b) => b.priority - a.priority);
  
  // Limit results if specified
  if (options.limit !== undefined && options.limit > 0) {
    filteredAds = filteredAds.slice(0, options.limit);
  }
  
  return filteredAds;
}

/**
 * Track an ad impression
 * 
 * @param adId ID of the ad that was shown
 * @param userId Optional user ID
 * @param sessionId Optional session ID
 * @param query Optional search query that led to this ad
 * @param categories Categories associated with this impression
 * @returns Impression ID
 */
export function trackAdImpression(
  adId: string,
  userId?: string,
  sessionId?: string,
  query?: string,
  categories: string[] = []
): string {
  // Find the ad
  const ad = mockAds.find(a => a.id === adId);
  
  if (!ad) {
    throw new Error(`Ad with ID ${adId} not found`);
  }
  
  // Create a new impression
  const impression: AdImpression = {
    id: `imp_${Math.random().toString(36).substring(2, 15)}`,
    adId,
    userId,
    timestamp: new Date(),
    query,
    categories: categories.length > 0 ? categories : ad.categories,
    advertiserId: ad.advertiser,
    placement: 'main_content',
    sessionId
  };
  
  // Store the impression (in a real implementation, this would go to a database)
  impressions.push(impression);
  
  console.log(`[Ad Service] Tracked impression ${impression.id} for ad ${adId}`);
  
  return impression.id;
}

/**
 * Track an ad click
 * 
 * @param adId ID of the ad that was clicked
 * @param impressionId ID of the impression that led to this click
 * @param userId Optional user ID
 * @param sessionId Optional session ID
 * @returns Click ID
 */
export function trackAdClick(
  adId: string,
  impressionId: string,
  userId?: string,
  sessionId?: string
): string {
  // Find the ad
  const ad = mockAds.find(a => a.id === adId);
  
  if (!ad) {
    throw new Error(`Ad with ID ${adId} not found`);
  }
  
  // Find the impression
  const impression = impressions.find(imp => imp.id === impressionId);
  
  if (!impression) {
    // If impression not found, create a synthetic one
    console.warn(`Impression ${impressionId} not found, creating synthetic impression`);
    trackAdImpression(adId, userId, sessionId);
  }
  
  // Create a new click
  const click: AdClick = {
    id: `click_${Math.random().toString(36).substring(2, 15)}`,
    adId,
    impressionId,
    userId,
    timestamp: new Date(),
    advertiserId: ad.advertiser,
    url: ad.url,
    sessionId
  };
  
  // Store the click (in a real implementation, this would go to a database)
  clicks.push(click);
  
  console.log(`[Ad Service] Tracked click ${click.id} for ad ${adId} from impression ${impressionId}`);
  
  return click.id;
}

/**
 * Get ads by treatment area IDs
 * 
 * @param treatmentAreaIds Array of treatment area IDs
 * @param limit Maximum number of ads to return
 * @returns Matching ads
 */
export function getAdsByTreatmentArea(treatmentAreaIds: string[], limit: number = 3): Ad[] {
  return getAdsByCategory({
    categories: treatmentAreaIds,
    limit
  });
}

/**
 * Get ads by pharmaceutical company IDs
 * 
 * @param companyIds Array of company IDs
 * @param limit Maximum number of ads to return
 * @returns Matching ads
 */
export function getAdsByCompany(companyIds: string[], limit: number = 3): Ad[] {
  // Convert company IDs to advertiser names
  const advertiserMap: Record<string, string> = {
    'pfizer': 'Pfizer',
    'genentech': 'Genentech',
    'gsk': 'GSK',
    'eli_lilly': 'Eli Lilly'
  };
  
  const advertisers = companyIds
    .map(id => advertiserMap[id])
    .filter(name => name !== undefined);
  
  return getAdsByCategory({
    advertisers,
    limit
  });
} 