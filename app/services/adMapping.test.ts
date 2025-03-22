import { MedicalClassification } from './classification';
import { mapQuestionToCompanies, AdMappingOptions } from './adMapping';

/**
 * Test cases for the ad mapping service
 */
export async function runAdMappingTests() {
  console.log("======= RUNNING AD MAPPING TESTS =======");
  console.log("Testing the pharmaceutical company mapping service with various medical classifications\n");

  // Define test cases with expected company matches
  const testCases: Array<{
    name: string;
    classification: MedicalClassification;
    expectedCompanies: string[];
    options?: AdMappingOptions;
  }> = [
    {
      name: "Oncology - Breast Cancer Test",
      classification: {
        primaryCategory: {
          id: "oncology",
          name: "Oncology",
          confidence: 0.95
        },
        subcategory: {
          id: "breast_cancer",
          name: "Breast Cancer",
          confidence: 0.92
        },
        keywords: ["breast cancer", "HER2+", "metastatic", "hormonal therapy"],
        relevantMedications: ["herceptin", "tamoxifen"],
        categories: ['oncology', 'breast_cancer', 'medication']
      },
      expectedCompanies: ["pfizer", "genentech"]
    },
    {
      name: "Immunology - Rheumatoid Arthritis Test",
      classification: {
        primaryCategory: {
          id: "immunology",
          name: "Immunology",
          confidence: 0.88
        },
        subcategory: {
          id: "rheumatoid_arthritis",
          name: "Rheumatoid Arthritis",
          confidence: 0.85
        },
        keywords: ["joint pain", "inflammation", "autoimmune", "DMARDs"],
        relevantMedications: ["humira", "enbrel"],
        categories: ['immunology', 'rheumatoid_arthritis', 'medication']
      },
      expectedCompanies: ["pfizer", "gsk"]
    },
    {
      name: "Respiratory - Asthma Test",
      classification: {
        primaryCategory: {
          id: "respiratory",
          name: "Respiratory",
          confidence: 0.91
        },
        subcategory: {
          id: "asthma",
          name: "Asthma",
          confidence: 0.89
        },
        keywords: ["wheezing", "shortness of breath", "inhaler", "corticosteroids"],
        relevantMedications: ["advair", "flovent"],
        categories: ['respiratory', 'asthma', 'medication']
      },
      expectedCompanies: ["gsk"]
    },
    {
      name: "Endocrinology - Diabetes Test",
      classification: {
        primaryCategory: {
          id: "endocrinology",
          name: "Endocrinology",
          confidence: 0.94
        },
        subcategory: {
          id: "diabetes",
          name: "Diabetes",
          confidence: 0.93
        },
        keywords: ["blood sugar", "insulin", "type 2", "glycemic control"],
        relevantMedications: ["humalog", "trulicity"],
        categories: ['endocrinology', 'diabetes', 'medication']
      },
      expectedCompanies: ["eli_lilly"]
    },
    {
      name: "Neurology - Alzheimer's Test",
      classification: {
        primaryCategory: {
          id: "neurology",
          name: "Neurology",
          confidence: 0.87
        },
        subcategory: {
          id: "alzheimers",
          name: "Alzheimer's Disease",
          confidence: 0.83
        },
        keywords: ["memory loss", "cognitive decline", "dementia", "amyloid"],
        relevantMedications: ["aduhelm", "donanemab"],
        categories: ['neurology', 'alzheimers', 'medication']
      },
      expectedCompanies: ["eli_lilly"]
    },
    {
      name: "Ophthalmology - Macular Degeneration Test",
      classification: {
        primaryCategory: {
          id: "ophthalmology",
          name: "Ophthalmology",
          confidence: 0.90
        },
        subcategory: {
          id: "macular_degeneration",
          name: "Macular Degeneration",
          confidence: 0.88
        },
        keywords: ["vision loss", "retina", "wet AMD", "anti-VEGF"],
        relevantMedications: ["lucentis", "eylea"],
        categories: ['ophthalmology', 'macular_degeneration', 'medication']
      },
      expectedCompanies: ["genentech"]
    }
  ];

  // Run all test cases
  for (const testCase of testCases) {
    console.log(`\n===== TEST CASE: ${testCase.name} =====`);
    console.log(`Classification: ${testCase.classification.primaryCategory.name} - ${testCase.classification.subcategory.name}`);
    
    try {
      // Run the mapping
      const result = mapQuestionToCompanies(testCase.classification, testCase.options);
      
      // Get unique companies from the result
      const matchedCompanyIds = Array.from(new Set(result.matches.map(m => m.company.id)));
      console.log(`Matched ${result.matches.length} treatment areas across ${matchedCompanyIds.length} companies`);
      
      // Log the top match
      if (result.topMatch) {
        console.log(`Top Match: ${result.topMatch.company.name} - ${result.topMatch.treatmentArea.id} (Score: ${result.topMatch.score})`);
      } else {
        console.log("No top match found");
      }
      
      // List all matched companies
      console.log("Matched Companies:");
      result.matches.forEach(match => {
        console.log(`- ${match.company.name} (${match.company.id}): ${match.treatmentArea.id} (Score: ${match.score})`);
      });
      
      // Check if the expected companies were found
      const foundAllExpected = testCase.expectedCompanies.every(
        expectedId => matchedCompanyIds.includes(expectedId)
      );
      
      if (foundAllExpected) {
        console.log("✅ PASS: All expected companies were matched");
      } else {
        console.log("❌ FAIL: Not all expected companies were matched");
        console.log(`Expected: ${testCase.expectedCompanies.join(", ")}`);
        console.log(`Actual: ${matchedCompanyIds.join(", ")}`);
      }
      
      // Check for unexpected companies
      const unexpectedCompanies = matchedCompanyIds.filter(
        id => !testCase.expectedCompanies.includes(id)
      );
      
      if (unexpectedCompanies.length > 0) {
        console.log(`⚠️ WARNING: Found ${unexpectedCompanies.length} unexpected companies:`);
        console.log(unexpectedCompanies.join(", "));
      }
      
    } catch (error) {
      console.error(`Error testing case ${testCase.name}:`, error);
    }
  }
  
  console.log("\n======= AD MAPPING TESTS COMPLETE =======");
  return "Tests completed";
} 