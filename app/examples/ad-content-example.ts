/**
 * Example demonstrating how to use the ad content service
 */

import { classifyMedicalQuestion } from '../services/classification';
import { mapQuestionToCompanies } from '../services/adMapping';
import { enhanceMappingConfidence, shouldShowAd } from '../services/confidenceScoring';
import { 
  getAdContentFromMapping, 
  getAdContentForTreatmentCategory,
  getAdContentWithFallback,
  trackImpression
} from '../services/adContentService';
import { getTreatmentCategoryById } from '../data/adContent';

/**
 * Example demonstrating the end-to-end flow from question to ad content
 */
export async function demonstrateAdContentFlow() {
  console.log('====== AD CONTENT EXAMPLE ======');
  
  // Define a medical question
  const question = "What are the latest treatment options for HER2+ metastatic breast cancer?";
  console.log(`Question: "${question}"`);
  console.log('----------------------------------------');
  
  try {
    // Step 1: Classify the question
    console.log('1. Classifying the question...');
    const classification = await classifyMedicalQuestion(question);
    console.log(`   Primary category: ${classification.primaryCategory.name}`);
    console.log(`   Subcategory: ${classification.subcategory.name}`);
    
    // Step 2: Map to pharmaceutical companies
    console.log('\n2. Mapping to pharmaceutical companies...');
    const mappingResult = mapQuestionToCompanies(classification);
    console.log(`   Found ${mappingResult.matches.length} potential company matches`);
    
    // Step 3: Enhance mapping with confidence scoring
    console.log('\n3. Applying confidence scoring...');
    const enhancedMapping = await enhanceMappingConfidence(mappingResult, question);
    console.log(`   Overall confidence: ${enhancedMapping.overallConfidence.toFixed(2)}`);
    console.log(`   Should show ad: ${shouldShowAd(enhancedMapping) ? 'Yes' : 'No'}`);
    
    // Step 4: Retrieve relevant ad content
    console.log('\n4. Retrieving relevant ad content...');
    const adContentResponse = await getAdContentFromMapping(enhancedMapping);
    console.log(`   Found ${adContentResponse.totalFound} relevant ads`);
    
    // Display ad content details
    if (adContentResponse.content.length > 0) {
      console.log('\n5. Ad content details:');
      adContentResponse.content.forEach((adContent, index) => {
        console.log(`\n   Ad #${index + 1}: ${adContent.name}`);
        console.log(`   - Company: ${adContent.company.name}`);
        console.log(`   - Treatment: ${adContent.treatmentCategory.name}`);
        console.log(`   - Type: ${adContent.type}`);
        console.log(`   - Headline: ${adContent.creative.headline}`);
        console.log(`   - Body: ${adContent.creative.bodyText.substring(0, 100)}...`);
        
        // Track impression
        const impressionId = trackImpression(
          adContent.id,
          question,
          'user-123',
          enhancedMapping.overallConfidence
        );
        console.log(`   - Impression tracked: ${impressionId}`);
      });
    } else {
      console.log('\n5. No relevant ads found with sufficient confidence. Using fallback...');
      
      // Fallback to general category ads
      const fallbackResponse = await getAdContentForTreatmentCategory('oncology_breast_cancer');
      console.log(`   Found ${fallbackResponse.content.length} fallback ads`);
      
      if (fallbackResponse.content.length > 0) {
        console.log('\n   Fallback ad details:');
        fallbackResponse.content.forEach((adContent, index) => {
          console.log(`\n   Ad #${index + 1}: ${adContent.name}`);
          console.log(`   - Company: ${adContent.company.name}`);
          console.log(`   - Treatment: ${adContent.treatmentCategory.name}`);
          console.log(`   - Headline: ${adContent.creative.headline}`);
          
          // Track impression with lower confidence
          const impressionId = trackImpression(
            adContent.id,
            question,
            'user-123',
            0.5 // Lower confidence for fallback ads
          );
          console.log(`   - Impression tracked: ${impressionId} (fallback)`);
        });
      }
    }
    
    // Demonstrate fallback functionality with explicit options
    console.log('\n6. Demonstrating fallback functionality:');
    const primaryOptions = {
      treatmentCategoryIds: ['nonexistent_category'],
      isActive: true
    };
    
    const fallbackOptions = {
      companyIds: ['pfizer'],
      isActive: true,
      limit: 1
    };
    
    const fallbackResult = await getAdContentWithFallback(primaryOptions, fallbackOptions);
    console.log(`   Primary options found ${fallbackResult.totalFound} ads`);
    if (fallbackResult.content.length > 0) {
      const fallbackAd = fallbackResult.content[0];
      console.log(`   Using fallback ad: ${fallbackAd.name} from ${fallbackAd.company.name}`);
    }
    
  } catch (error) {
    console.error('Error in ad content example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateAdContentFlow()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error running example:', error);
      process.exit(1);
    });
} 