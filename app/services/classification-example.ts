import { classifyMedicalQuestion } from './classification';

/**
 * Example usage of the medical question classifier
 */
async function exampleUsage() {
  // Example medical question
  const question = "What are the latest treatment options for a 67-year-old male with stage 3 pancreatic cancer who has not responded to gemcitabine?";
  
  console.log(`Analyzing question: "${question}"`);
  
  try {
    // Classify the question
    const classification = await classifyMedicalQuestion(question);
    
    // Print the results
    console.log('\nClassification Results:');
    console.log('-----------------------');
    console.log(`Primary Category: ${classification.primaryCategory.name} (${classification.primaryCategory.id})`);
    console.log(`Confidence: ${classification.primaryCategory.confidence.toFixed(2)}`);
    console.log(`Subcategory: ${classification.subcategory.name} (${classification.subcategory.id})`);
    console.log(`Subcategory Confidence: ${classification.subcategory.confidence.toFixed(2)}`);
    console.log(`Keywords: ${classification.keywords.join(', ')}`);
    
    if (classification.relevantMedications) {
      console.log(`Relevant Medications: ${classification.relevantMedications.join(', ')}`);
    }
    
    // Example of using classification for ad targeting
    console.log('\nAd Targeting Example:');
    console.log('---------------------');
    console.log(`Targeting ads for: ${classification.primaryCategory.name} (${classification.primaryCategory.id})`);
    console.log(`Specific focus: ${classification.subcategory.name}`);
    console.log(`Match confidence: ${(classification.primaryCategory.confidence * 100).toFixed(0)}%`);
    
    // Demonstrate how this could be used for ad delivery
    const adCategories = [classification.primaryCategory.id];
    
    // If confidence is high enough, also include the subcategory
    if (classification.subcategory.confidence > 0.7) {
      console.log(`Including subcategory targeting due to high confidence (${classification.subcategory.confidence.toFixed(2)})`);
    }
    
    // Example ad delivery decision based on confidence scores
    if (classification.primaryCategory.confidence > 0.8) {
      console.log('High confidence classification: Showing premium targeted ads');
    } else if (classification.primaryCategory.confidence > 0.5) {
      console.log('Medium confidence classification: Showing general category ads');
    } else {
      console.log('Low confidence classification: Showing general medical ads');
    }
    
  } catch (error) {
    console.error('Error in classification:', error);
  }
}

// Run the example
exampleUsage().catch(console.error); 