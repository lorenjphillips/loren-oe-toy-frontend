/**
 * Example demonstrating the ethical AI guardrails
 */

import { classifyMedicalQuestion } from '../services/classification';
import { mapQuestionToCompanies } from '../services/adMapping';
import { enhanceMappingConfidence, shouldShowAd } from '../services/confidenceScoring';
import { 
  getAdContentFromMappingWithGuardrails,
  filterCompliantContent,
  meetsGuardrailConfidenceThreshold
} from '../services/ethical-ai/integration';
import { processFeedback } from '../services/ethical-ai/guardrails';
import { setConfig, getConfig } from '../services/ethical-ai/configuration';

/**
 * Example demonstrating the ethical AI guardrails
 */
export async function demonstrateEthicalAIGuardrails() {
  console.log('====== ETHICAL AI GUARDRAILS EXAMPLE ======');
  
  // Define a medical question
  const question = "What are the treatment options for metastatic breast cancer with high PD-L1 expression?";
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
    
    // Step 3: Enhance mapping with confidence scoring
    console.log('\n3. Applying confidence scoring...');
    const enhancedMapping = await enhanceMappingConfidence(mappingResult, question);
    console.log(`   Overall confidence: ${enhancedMapping.overallConfidence.toFixed(2)}`);
    
    // Step 4: Check if confidence meets guardrail threshold
    const meetsThreshold = meetsGuardrailConfidenceThreshold(enhancedMapping);
    console.log(`   Meets guardrail confidence threshold: ${meetsThreshold ? 'Yes' : 'No'}`);
    
    if (!meetsThreshold) {
      console.log('   Not proceeding with ad display due to low confidence');
      return;
    }
    
    // Step 5: Retrieve ad content with guardrails
    console.log('\n4. Retrieving ad content with guardrails...');
    const adResponse = await getAdContentFromMappingWithGuardrails(
      enhancedMapping,
      2
    );
    console.log(`   Found ${adResponse.totalFound} ads before compliance filtering`);
    
    // Step 6: Filter to compliant content only
    console.log('\n5. Filtering to compliant content only...');
    const compliantResponse = filterCompliantContent(adResponse);
    console.log(`   ${compliantResponse.totalFound} ads passed all guardrail checks`);
    
    // Display ad content details with guardrail info
    if (compliantResponse.content.length > 0) {
      console.log('\n6. Compliant ad content details:');
      compliantResponse.content.forEach((adContent, index) => {
        console.log(`\n   Ad #${index + 1}: ${adContent.name}`);
        console.log(`   - Company: ${adContent.company.name}`);
        console.log(`   - Treatment: ${adContent.treatmentCategory.name}`);
        console.log(`   - Headline: ${adContent.creative.headline}`);
        
        // Display guardrail information
        console.log('   - Guardrail Results:');
        console.log(`     * Clinical Accuracy: ${adContent.guardrails?.clinicalAccuracy.isValid ? 'PASSED' : 'FAILED'}`);
        console.log(`     * Compliance: ${adContent.guardrails?.compliance.isCompliant ? 'PASSED' : 'FAILED'}`);
        console.log(`     * Separation Indicator: "${adContent.guardrails?.separationIndicator}"`);
        
        // If there were issues, show them
        if (adContent.guardrails?.clinicalAccuracy.issues.length) {
          console.log('     * Clinical Accuracy Issues:');
          adContent.guardrails.clinicalAccuracy.issues.forEach(issue => {
            console.log(`       - ${issue}`);
          });
        }
        
        if (adContent.guardrails?.compliance.issues.length) {
          console.log('     * Compliance Issues:');
          adContent.guardrails.compliance.issues.forEach(issue => {
            console.log(`       - ${issue}`);
          });
        }
      });
      
      // Step 7: Demonstrate feedback processing
      console.log('\n7. Demonstrating feedback processing:');
      const feedbackResult = processFeedback(
        compliantResponse.content[0].id,
        'inaccurate',
        'Information about the treatment efficacy seems outdated',
        'user-123'
      );
      console.log(`   Feedback processed: ${feedbackResult.feedbackId}`);
      console.log(`   Message: ${feedbackResult.message}`);
      
    } else {
      console.log('\n6. No compliant ads found. All content failed guardrail checks.');
      
      // Show what failed
      if (adResponse.content.length > 0) {
        console.log('\n   Failed guardrail details:');
        adResponse.content.forEach((adContent, index) => {
          console.log(`\n   Ad #${index + 1}: ${adContent.name}`);
          
          // Display guardrail failure reasons
          if (adContent.guardrails?.clinicalAccuracy.issues.length) {
            console.log('     * Clinical Accuracy Issues:');
            adContent.guardrails.clinicalAccuracy.issues.forEach(issue => {
              console.log(`       - ${issue}`);
            });
          }
          
          if (adContent.guardrails?.compliance.issues.length) {
            console.log('     * Compliance Issues:');
            adContent.guardrails.compliance.issues.forEach(issue => {
              console.log(`       - ${issue}`);
            });
          }
        });
      }
    }
    
    // Step 8: Demonstrate configuration change
    console.log('\n8. Demonstrating configuration change:');
    const currentConfig = getConfig();
    console.log(`   Current confidence threshold: ${currentConfig.transparencyDisclosures.confidenceThreshold}`);
    
    // Lower the threshold temporarily
    setConfig({
      transparencyDisclosures: {
        ...currentConfig.transparencyDisclosures,
        confidenceThreshold: 0.5
      }
    });
    
    console.log(`   Updated confidence threshold: ${getConfig().transparencyDisclosures.confidenceThreshold}`);
    console.log(`   With new threshold, meets requirement: ${meetsGuardrailConfidenceThreshold(enhancedMapping) ? 'Yes' : 'No'}`);
    
  } catch (error) {
    console.error('Error in ethical AI example:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  demonstrateEthicalAIGuardrails()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error running example:', error);
      process.exit(1);
    });
} 