import { MedicalClassification, classifyMedicalQuestion } from '../services/classification';
import { mapQuestionToCompanies, PharmaMappingResult } from '../services/adMapping';
import { Ad } from '../types/ad';
import { getAdsByCategory, trackAdImpression, trackAdClick } from '../services/adService';
import { enhancedAdService } from '../services/enhancedAdService';
import { AdType } from '../types/adTypeUnified';

/**
 * Example demonstrating the complete flow from question to ad delivery
 * This shows how classification and company mapping integrate with the ad system
 */
export async function integrationExample() {
  // Step 1: User asks a medical question
  const userQuestion = "What are the latest treatments for HER2+ metastatic breast cancer, and are there any new clinical trials?";
  console.log(`\n🔍 User Question: "${userQuestion}"`);
  
  try {
    // Step 2: Classify the question using ML
    console.log("\n⏳ Classifying question...");
    const classification = await classifyMedicalQuestion(userQuestion);
    
    console.log("✅ Classification complete:");
    console.log(`   Primary Category: ${classification.primaryCategory.name} (${Math.round(classification.primaryCategory.confidence * 100)}% confidence)`);
    console.log(`   Subcategory: ${classification.subcategory.name} (${Math.round(classification.subcategory.confidence * 100)}% confidence)`);
    console.log(`   Keywords: ${classification.keywords.join(", ")}`);
    
    if (classification.relevantMedications && classification.relevantMedications.length > 0) {
      console.log(`   Medications: ${classification.relevantMedications.join(", ")}`);
    }
    
    // Step 3: Map classification to pharmaceutical companies
    console.log("\n⏳ Mapping to pharmaceutical companies...");
    const mappingResult = mapQuestionToCompanies(classification, {
      minScore: 40,
      maxResults: 3
    });
    
    if (mappingResult.matches.length === 0) {
      console.log("❌ No pharmaceutical companies matched this query");
      return;
    }
    
    console.log(`✅ Found ${mappingResult.matches.length} matches across ${new Set(mappingResult.matches.map(m => m.company.id)).size} companies`);
    
    // Show top match
    const topMatch = mappingResult.topMatch;
    if (topMatch) {
      console.log("\n🏆 Top Match:");
      console.log(`   Company: ${topMatch.company.name}`);
      console.log(`   Treatment Area: ${topMatch.treatmentArea.category} - ${topMatch.treatmentArea.id}`);
      console.log(`   Match Score: ${topMatch.score}`);
      
      if (topMatch.keywordMatches.length > 0) {
        console.log(`   Keyword Matches: ${topMatch.keywordMatches.join(", ")}`);
      }
      
      if (topMatch.medicationMatches.length > 0) {
        console.log(`   Medication Matches: ${topMatch.medicationMatches.join(", ")}`);
      }
    }
    
    // Step 4: Fetch relevant ads
    console.log("\n⏳ Fetching relevant pharmaceutical ads...");
    const matchedTreatmentAreas = mappingResult.matches.map(match => match.treatmentArea.id);
    const matchedCompanies = Array.from(new Set(mappingResult.matches.map(match => match.company.id)));
    
    // Normally we'd call our ad service with these parameters
    const mockAdResults = createMockAds(mappingResult);
    console.log(`✅ Found ${mockAdResults.length} relevant ads`);
    
    // Step 5: Display ads (simulation)
    if (mockAdResults.length > 0) {
      console.log("\n📣 Displaying Ads:");
      mockAdResults.forEach((ad, index) => {
        console.log(`\n   Ad #${index + 1}: ${ad.title}`);
        console.log(`   Advertiser: ${ad.advertiser}`);
        console.log(`   Type: ${ad.type}`);
        console.log(`   Categories: ${ad.categories.join(", ")}`);
        
        // Step 6: Track ad impression
        const impressionId = `imp_${Math.random().toString(36).substring(2, 15)}`;
        console.log(`   ✓ Impression tracked (${impressionId})`);
      });
      
      // Step 7: Simulate a user clicking on the first ad
      if (mockAdResults.length > 0) {
        const clickedAd = mockAdResults[0];
        console.log(`\n👆 User clicked on ad: "${clickedAd.title}"`);
        
        // Track the click
        const clickId = `click_${Math.random().toString(36).substring(2, 15)}`;
        console.log(`   ✓ Click tracked (${clickId})`);
        
        // Record conversion data
        console.log(`   ✓ Conversion data recorded for ${clickedAd.advertiser}`);
      }
    } else {
      console.log("❌ No suitable ads found for this query");
    }
    
    console.log("\n✅ End-to-end integration example complete");
    
  } catch (error) {
    console.error("❌ Error in integration example:", error);
  }
}

/**
 * Create mock ads based on the mapping result
 * In a real implementation, this would call the ad service API
 */
function createMockAds(mappingResult: PharmaMappingResult): Ad[] {
  const ads: Ad[] = [];
  
  // Create an ad for each of the top matches
  mappingResult.matches.slice(0, 2).forEach(match => {
    const categoryName = match.treatmentArea.category.charAt(0).toUpperCase() + match.treatmentArea.category.slice(1);
    
    // Create different ad types based on the company
    let adType: AdType;
    let title: string;
    let body: string;
    
    switch (match.company.id) {
      case 'pfizer':
        adType = AdType.BANNER;
        title = `Pfizer ${categoryName} Research & Treatments`;
        body = `Leading innovation in ${match.treatmentArea.id.replace('_', ' ')} treatments. Learn about our latest advances.`;
        break;
        
      case 'genentech':
        adType = AdType.SPONSORED_CONTENT;
        title = `New Genentech Clinical Trials for ${match.treatmentArea.id.replace('_', ' ')}`;
        body = `Genentech is recruiting patients for breakthrough ${categoryName.toLowerCase()} treatments. See if you qualify.`;
        break;
        
      case 'gsk':
        adType = AdType.VIDEO;
        title = `GSK: Understanding ${match.treatmentArea.id.replace('_', ' ')}`;
        body = `Watch our educational video about ${categoryName.toLowerCase()} treatments and management strategies.`;
        break;
        
      case 'eli_lilly':
        adType = AdType.TEXT;
        title = `Eli Lilly ${categoryName} Treatment Options`;
        body = `Discover how Eli Lilly's innovative treatments can help manage ${match.treatmentArea.id.replace('_', ' ')}.`;
        break;
        
      default:
        adType = AdType.TEXT;
        title = `Latest ${categoryName} Treatments`;
        body = `Learn about cutting-edge treatments for ${match.treatmentArea.id.replace('_', ' ')}.`;
    }
    
    // Create the ad
    ads.push({
      id: `ad_${Math.random().toString(36).substring(2, 9)}`,
      title,
      body,
      advertiser: match.company.name,
      type: adType,
      categories: [match.treatmentArea.category, match.treatmentArea.id],
      url: `https://example.com/${match.company.id}/${match.treatmentArea.id}`,
      imageUrl: match.company.id === 'pfizer' || match.company.id === 'genentech' 
        ? `https://example.com/images/${match.company.id}_${match.treatmentArea.category}.jpg`
        : undefined,
      active: true,
      priority: match.score / 10, // Convert score to 0-10 scale
      metadata: {
        companyId: match.company.id,
        treatmentAreaId: match.treatmentArea.id,
        score: match.score
      }
    });
  });
  
  return ads;
}

// This function would be called from a page component
export function runExample() {
  console.log("Starting OpenEvidence Pharmaceutical Ad Integration Example...");
  integrationExample()
    .then(() => console.log("Example completed successfully"))
    .catch(err => console.error("Example failed:", err));
} 