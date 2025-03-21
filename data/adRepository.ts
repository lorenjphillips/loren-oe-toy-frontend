import { Ad, AdCategory } from '../types/ads';

// In a real application, this would be a database connection
// For now, we'll use in-memory storage
let ads: Ad[] = [];
let categories: AdCategory[] = [];

/**
 * Initialize the ad repository with sample data
 */
export async function initializeAdRepository(): Promise<void> {
  // Sample categories
  categories = [
    {
      id: 'cardiology',
      name: 'Cardiology',
      description: 'Heart and cardiovascular system',
      keywords: ['heart', 'cardiovascular', 'blood pressure', 'arrhythmia', 'cholesterol']
    },
    {
      id: 'dermatology',
      name: 'Dermatology',
      description: 'Skin conditions',
      keywords: ['skin', 'rash', 'acne', 'eczema', 'psoriasis']
    },
    {
      id: 'endocrinology',
      name: 'Endocrinology',
      description: 'Hormonal and metabolic disorders',
      keywords: ['diabetes', 'thyroid', 'hormone', 'metabolism', 'insulin']
    },
    {
      id: 'gastroenterology',
      name: 'Gastroenterology',
      description: 'Digestive system',
      keywords: ['stomach', 'digestive', 'colon', 'liver', 'intestine']
    },
    {
      id: 'neurology',
      name: 'Neurology',
      description: 'Brain and nervous system',
      keywords: ['brain', 'nerve', 'headache', 'seizure', 'migraine']
    }
  ];

  // Sample ads
  ads = [
    {
      id: 'ad1',
      title: 'New Cardiac Monitoring Device',
      description: 'Revolutionary cardiac monitoring for patients with arrhythmias',
      imageUrl: '/images/cardiac-monitor.jpg',
      targetUrl: 'https://example.com/cardiac-monitor',
      categories: ['cardiology'],
      priority: 2,
      impressions: 0,
      clicks: 0
    },
    {
      id: 'ad2',
      title: 'Advanced Dermatology Treatment',
      description: 'Clinically proven treatment for persistent skin conditions',
      imageUrl: '/images/derma-treatment.jpg',
      targetUrl: 'https://example.com/derma-treatment',
      categories: ['dermatology'],
      priority: 1,
      impressions: 0,
      clicks: 0
    },
    {
      id: 'ad3',
      title: 'Diabetes Management System',
      description: 'Comprehensive solution for diabetes monitoring and management',
      imageUrl: '/images/diabetes-management.jpg',
      targetUrl: 'https://example.com/diabetes-management',
      categories: ['endocrinology'],
      priority: 3,
      impressions: 0,
      clicks: 0
    },
    {
      id: 'ad4',
      title: 'Neurological Diagnostic Tool',
      description: 'Next-generation diagnostic equipment for neurological disorders',
      imageUrl: '/images/neuro-diagnostic.jpg',
      targetUrl: 'https://example.com/neuro-diagnostic',
      categories: ['neurology'],
      priority: 2,
      impressions: 0,
      clicks: 0
    }
  ];
}

/**
 * Get all available ads
 * @returns Array of all ads
 */
export async function getAds(): Promise<Ad[]> {
  // In a real app, this would fetch from a database
  return [...ads];
}

/**
 * Get a specific ad by ID
 * @param id The ad ID
 * @returns The ad if found, null otherwise
 */
export async function getAdById(id: string): Promise<Ad | null> {
  const ad = ads.find(a => a.id === id);
  return ad || null;
}

/**
 * Get all ad categories
 * @returns Array of all categories
 */
export async function getCategories(): Promise<AdCategory[]> {
  return [...categories];
}

/**
 * Update ad metrics (impressions, clicks)
 * @param id The ad ID
 * @param metrics Metrics to update
 */
export async function updateAdMetrics(
  id: string, 
  metrics: { impressions?: number; clicks?: number }
): Promise<boolean> {
  const adIndex = ads.findIndex(a => a.id === id);
  if (adIndex === -1) return false;
  
  if (metrics.impressions !== undefined) {
    ads[adIndex].impressions += metrics.impressions;
  }
  
  if (metrics.clicks !== undefined) {
    ads[adIndex].clicks += metrics.clicks;
  }
  
  // Calculate conversion rate
  if (ads[adIndex].impressions > 0) {
    ads[adIndex].conversionRate = ads[adIndex].clicks / ads[adIndex].impressions;
  }
  
  return true;
} 