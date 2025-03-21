import { classifyMedicalQuestion, MedicalClassification } from './classification';

/**
 * Simple test script to validate the medical question classifier
 */
async function runTest() {
  console.log('Testing Medical Question Classifier...');
  console.log('--------------------------------------');
  
  const testQuestions = [
    {
      question: "What are the latest treatment options for a 67-year-old male with stage 3 pancreatic cancer who has not responded to gemcitabine?",
      expectedCategory: "oncology"
    },
    {
      question: "My patient is experiencing joint pain, swelling, and morning stiffness in multiple joints. Could this be rheumatoid arthritis?",
      expectedCategory: "rheumatology"
    },
    {
      question: "What's the recommended protocol for a patient with treatment-resistant depression who has failed two SSRIs?",
      expectedCategory: "psychiatry"
    }
  ];
  
  for (const test of testQuestions) {
    console.log(`\nTesting question: "${test.question}"`);
    console.log(`Expected primary category: ${test.expectedCategory}`);
    
    try {
      const result = await classifyMedicalQuestion(test.question);
      
      console.log('\nClassification Result:');
      console.log('---------------------');
      console.log(`Primary Category: ${result.primaryCategory.name} (${result.primaryCategory.id})`);
      console.log(`Confidence: ${result.primaryCategory.confidence.toFixed(2)}`);
      console.log(`Subcategory: ${result.subcategory.name} (${result.subcategory.id})`);
      console.log(`Subcategory Confidence: ${result.subcategory.confidence.toFixed(2)}`);
      console.log(`Keywords: ${result.keywords.join(', ')}`);
      
      if (result.relevantMedications) {
        console.log(`Relevant Medications: ${result.relevantMedications.join(', ')}`);
      }
      
      // Validate if the classification matches expected category
      const isCorrect = result.primaryCategory.id === test.expectedCategory;
      console.log(`\nClassification ${isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}`);
      
      if (!isCorrect) {
        console.log(`Expected: ${test.expectedCategory}, Got: ${result.primaryCategory.id}`);
      }
    } catch (error) {
      console.error('Error testing classification:', error);
    }
    
    console.log('\n--------------------------------------');
  }
}

// Only run test when executed directly (not when imported)
if (require.main === module) {
  runTest().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export default runTest; 