import { Ad, AdDeliveryResponse, QuestionClassification } from '../types/ads';
import { getAds } from '../data/adRepository';

/**
 * Delivers an appropriate ad based on the question classification
 * @param classification The classification result from the classifier service
 * @returns The most relevant ad, match confidence, and matched categories
 */
export async function deliverAd(
  classification: QuestionClassification
): Promise<AdDeliveryResponse> {
  if (!classification || !classification.categories || classification.categories.length === 0) {
    return { ad: null, matchConfidence: 0, matchedCategories: [] };
  }

  try {
    // Get all available ads
    const allAds = await getAds();
    if (!allAds || allAds.length === 0) {
      return { ad: null, matchConfidence: 0, matchedCategories: [] };
    }

    // Current date for filtering active ads
    const now = new Date();
    
    // Filter active ads (within date range, if specified)
    const activeAds = allAds.filter(ad => {
      if (ad.startDate && new Date(ad.startDate) > now) return false;
      if (ad.endDate && new Date(ad.endDate) < now) return false;
      return true;
    });

    // Calculate relevance score for each ad
    const scoredAds = activeAds.map(ad => {
      let totalScore = 0;
      const matchedCategories: string[] = [];
      
      // Check each classified category against ad categories
      classification.categories.forEach(classifiedCategory => {
        if (ad.categories.includes(classifiedCategory.categoryId)) {
          totalScore += classifiedCategory.confidence;
          matchedCategories.push(classifiedCategory.categoryId);
        }
      });
      
      // Apply ad priority as a multiplier
      const finalScore = totalScore * (ad.priority || 1);
      
      return {
        ad,
        score: finalScore,
        matchedCategories
      };
    });

    // Sort ads by score (highest first)
    scoredAds.sort((a, b) => b.score - a.score);
    
    // Select the top ad
    const topAd = scoredAds[0];
    
    if (!topAd || topAd.score === 0) {
      return { ad: null, matchConfidence: 0, matchedCategories: [] };
    }
    
    return {
      ad: topAd.ad,
      matchConfidence: topAd.score,
      matchedCategories: topAd.matchedCategories
    };
  } catch (error) {
    console.error('Error delivering ad:', error);
    return { ad: null, matchConfidence: 0, matchedCategories: [] };
  }
} 