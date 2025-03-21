import { classifyMedicalQuestion } from '../services/classification';
import { mapQuestionToCompanies } from '../services/adMapping';
import { enhanceMappingConfidence, shouldShowAd } from '../services/confidenceScoring';
import { Ad } from '../types/ad';

/**
 * Example demonstrating the end-to-end flow with confidence scoring
 * including the decision to show or hide ads based on confidence
 */
export async function demonstrateConfidenceScoring() {
  console.log('====== CONFIDENCE SCORING EXAMPLE ======');
  
  // Define different kinds of example questions
  const questions = [
    // High specificity, targeted question with medication mention
    {
      text: "What's the latest data on sacubitril/valsartan for reducing hospitalizations in HFrEF patients?",
      expectedConfidence: "HIGH"
    },
    // Medium specificity, still clinical but less targeted
    {
      text: "How do you manage hypertension in diabetic patients?",
      expectedConfidence: "MEDIUM"
    },
    // Low specificity, very general question
    {
      text: "What are the basics of asthma treatment?",
      expectedConfidence: "MEDIUM-LOW"
    },
    // Ambiguous question without clear context
    {
      text: "What are common side effects of that new medication?",
      expectedConfidence: "LOW"
    }
  ];
  
  // Process each question
  for (const question of questions) {
    console.log(`\n\nPROCESSING QUESTION: "${question.text}"`);
    console.log(`Expected confidence: ${question.expectedConfidence}`);
    console.log('----------------------------------------');
    
    try {
      // Step 1: Classify the question using ML
      console.log('1. Classifying question...');
      const classification = await classifyMedicalQuestion(question.text);
      console.log(`   - Primary category: ${classification.primaryCategory.name} (${classification.primaryCategory.confidence.toFixed(2)})`);
      console.log(`   - Subcategory: ${classification.subcategory.name} (${classification.subcategory.confidence.toFixed(2)})`);
      console.log(`   - Keywords: ${classification.keywords.join(', ')}`);
      if (classification.relevantMedications?.length) {
        console.log(`   - Medications: ${classification.relevantMedications.join(', ')}`);
      }
      
      // Step 2: Map to pharmaceutical companies
      console.log('\n2. Mapping to pharmaceutical companies...');
      const mappingResult = mapQuestionToCompanies(classification);
      console.log(`   - Total matches: ${mappingResult.totalMatches}`);
      console.log(`   - Top company: ${mappingResult.topMatch?.company.name || 'No match'}`);
      console.log(`   - Top treatment area: ${mappingResult.topMatch?.treatmentArea.id || 'N/A'}`);
      
      // Step 3: Apply confidence scoring
      console.log('\n3. Applying confidence scoring...');
      const enhancedMapping = await enhanceMappingConfidence(mappingResult, question.text);
      console.log(`   - Overall confidence: ${enhancedMapping.overallConfidence.toFixed(2)}`);
      console.log(`   - Ad recommended: ${enhancedMapping.adRecommended ? 'YES' : 'NO'}`);
      
      if (enhancedMapping.topMatch) {
        const topMatch = enhancedMapping.topMatch;
        console.log('\n4. Top match details:');
        console.log(`   - Company: ${topMatch.company.name}`);
        console.log(`   - Treatment area: ${topMatch.treatmentArea.id}`);
        console.log(`   - Base score: ${topMatch.score}`);
        console.log(`   - Confidence score: ${topMatch.confidenceScore.toFixed(2)}`);
        console.log(`   - Should show ad: ${topMatch.shouldShowAd ? 'YES' : 'NO'}`);
        
        console.log('\n5. Confidence factors:');
        for (const [factor, score] of Object.entries(topMatch.confidenceFactors)) {
          console.log(`   - ${factor}: ${(score as number).toFixed(2)}`);
        }
      }
      
      // Step 4: Make ad display decision
      console.log('\n6. Ad display decision:');
      if (shouldShowAd(enhancedMapping)) {
        console.log('   ✅ SHOW AD - Confidence is high enough');
        // In a real system, we would fetch and display the ad here
        console.log('   [Displaying relevant ad from ' + enhancedMapping.topMatch?.company.name + ']');
      } else {
        console.log('   ❌ DO NOT SHOW AD - Confidence too low');
        console.log('   [No ad will be displayed to avoid irrelevant advertising]');
      }
      
    } catch (error) {
      console.error('Error processing question:', error);
    }
    
    console.log('\n========================================');
  }
}

/**
 * Example showing how to integrate confidence scoring into an ad serving function
 */
export async function getRelevantAds(
  question: string,
  confidenceThreshold = 0.65
): Promise<{ ads: Ad[], showAds: boolean, confidence: number }> {
  try {
    // Step 1: Classify the question
    const classification = await classifyMedicalQuestion(question);
    
    // Step 2: Map to pharmaceutical companies
    const mappingResult = mapQuestionToCompanies(classification);
    
    // Step 3: Enhance with confidence scoring
    const enhancedMapping = await enhanceMappingConfidence(
      mappingResult, 
      question,
      { confidenceThreshold }
    );
    
    // Step 4: Get a list of company IDs that have enough confidence
    const highConfidenceCompanies = enhancedMapping.matches
      .filter(match => match.shouldShowAd)
      .map(match => match.company.id);
    
    // Step 5: Determine if we should show ads at all
    const showAds = shouldShowAd(enhancedMapping);
    
    // Step 6: In a real implementation, we would fetch ads from these companies
    // For this example, we'll just return mock data
    const mockAds: Ad[] = showAds ? highConfidenceCompanies.map(companyId => ({
      id: `ad-${Math.random().toString(36).substring(2, 9)}`,
      title: `Ad from ${companyId}`,
      body: `This is a relevant ad based on your question about ${classification.primaryCategory.name}`,
      advertiser: companyId,
      type: 'text' as any, // Using the enum value would be better in real code
      categories: [classification.primaryCategory.id, classification.subcategory.id],
      url: `https://example.com/${companyId}`,
      active: true,
      priority: 5
    })) : [];
    
    return {
      ads: mockAds,
      showAds,
      confidence: enhancedMapping.overallConfidence
    };
    
  } catch (error) {
    console.error('Error getting relevant ads:', error);
    return { ads: [], showAds: false, confidence: 0 };
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateConfidenceScoring()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error running example:', error);
      process.exit(1);
    });
} 