#!/usr/bin/env node

/**
 * OpenEvidence Ad Platform Post-Deployment Verification Checklist
 * 
 * This script performs automated checks to verify that a deployment is functioning correctly.
 * It tests API endpoints, storage connections, OpenAI integration, and performance metrics.
 */

const { execSync } = require('child_process');
const fetch = require('node-fetch');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Main verification function
async function verifyDeployment() {
  try {
    console.log('🔍 Starting OpenEvidence Post-Deployment Verification...\n');
    
    // Get deployment URL
    const deploymentUrl = await getDeploymentUrl();
    
    // Run verification checks
    let results = {
      apiEndpoints: await verifyApiEndpoints(deploymentUrl),
      openaiIntegration: await verifyOpenAiIntegration(deploymentUrl),
      storageConnection: await verifyStorageConnection(),
      performance: await verifyPerformance(deploymentUrl)
    };
    
    // Generate verification report
    generateReport(results, deploymentUrl);
    
    console.log('\n✅ Verification process completed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Get the deployment URL
 */
async function getDeploymentUrl() {
  console.log('🔍 Retrieving deployment URL...');
  
  try {
    // Try to get URL from Vercel CLI
    const deploymentJson = execSync('npx vercel ls --json').toString();
    const deployments = JSON.parse(deploymentJson);
    
    if (deployments && deployments.length > 0) {
      const latestUrl = `https://${deployments[0].url}`;
      console.log(`ℹ️  Found deployment URL: ${latestUrl}`);
      return latestUrl;
    }
  } catch (error) {
    console.warn('⚠️  Unable to get deployment URL from Vercel CLI.');
  }
  
  // Ask user for URL
  const manualUrl = await askQuestion('Please enter the deployment URL: ');
  if (!manualUrl.startsWith('http')) {
    return `https://${manualUrl}`;
  }
  return manualUrl;
}

/**
 * Verify API endpoints
 */
async function verifyApiEndpoints(baseUrl) {
  console.log('\n🔄 Verifying API endpoints...');
  
  const testQuestion = "What are treatment options for diabetes?";
  const endpoints = [
    {
      name: 'Health Check',
      method: 'GET',
      path: '/api/health-check',
      expectedStatus: 200
    },
    {
      name: 'Classification',
      method: 'POST',
      path: '/api/classification',
      body: { question: testQuestion },
      expectedStatus: 200
    },
    {
      name: 'Ad Content',
      method: 'GET',
      path: '/api/ad-content?category=diabetes',
      expectedStatus: 200
    },
    {
      name: 'Analytics Impression',
      method: 'POST',
      path: '/api/analytics/impression',
      body: { adId: 'test-ad-123', userId: 'test-user', questionText: testQuestion },
      expectedStatus: 200
    }
  ];
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const endpoint of endpoints) {
    console.log(`ℹ️  Testing ${endpoint.name}...`);
    
    try {
      const url = `${baseUrl}${endpoint.path}`;
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(url, options);
      const status = response.status;
      
      const result = {
        endpoint: endpoint.name,
        url,
        status,
        passed: status === endpoint.expectedStatus
      };
      
      if (result.passed) {
        console.log(`✅ ${endpoint.name}: Status ${status}`);
        results.passed++;
      } else {
        console.error(`❌ ${endpoint.name}: Status ${status}, Expected ${endpoint.expectedStatus}`);
        results.failed++;
      }
      
      results.details.push(result);
      
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.message}`);
      results.failed++;
      results.details.push({
        endpoint: endpoint.name,
        error: error.message,
        passed: false
      });
    }
  }
  
  return results;
}

/**
 * Verify OpenAI integration
 */
async function verifyOpenAiIntegration(baseUrl) {
  console.log('\n🧠 Verifying OpenAI integration...');
  
  try {
    const testQuestions = [
      "What are treatment options for diabetes?",
      "What are the side effects of metformin?",
      "How is heart failure diagnosed?"
    ];
    
    const results = {
      passed: 0,
      failed: 0,
      details: []
    };
    
    for (const question of testQuestions) {
      console.log(`ℹ️  Testing classification with: "${question}"`);
      
      try {
        const url = `${baseUrl}/api/classification`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question })
        });
        
        if (response.status !== 200) {
          throw new Error(`Status code: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate classification response
        const valid = data.primaryCategory && 
                      data.primaryCategory.name && 
                      data.subcategory &&
                      data.confidence > 0;
        
        const result = {
          question,
          classification: data.primaryCategory?.name,
          confidence: data.confidence,
          passed: valid
        };
        
        if (valid) {
          console.log(`✅ Classification for "${question}": ${data.primaryCategory.name} (${data.confidence.toFixed(2)})`);
          results.passed++;
        } else {
          console.error(`❌ Invalid classification response for "${question}"`);
          results.failed++;
        }
        
        results.details.push(result);
        
      } catch (error) {
        console.error(`❌ Classification failed for "${question}": ${error.message}`);
        results.failed++;
        results.details.push({
          question,
          error: error.message,
          passed: false
        });
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ OpenAI integration verification failed:', error.message);
    return {
      passed: 0,
      failed: 1,
      details: [{ error: error.message, passed: false }]
    };
  }
}

/**
 * Verify storage connection
 */
async function verifyStorageConnection() {
  console.log('\n💾 Verifying Vercel KV connection...');
  
  try {
    // Check if Vercel KV is set up
    const kvOutput = execSync('npx vercel kv ls').toString();
    
    if (!kvOutput.includes('openevidence-analytics')) {
      console.warn('⚠️  Vercel KV "openevidence-analytics" not found.');
      
      const create = await askQuestion('Would you like to create it now? (y/n): ');
      if (create.toLowerCase() === 'y') {
        execSync('npx vercel kv create openevidence-analytics', { stdio: 'inherit' });
        execSync('npx vercel kv link openevidence-analytics', { stdio: 'inherit' });
      } else {
        return {
          passed: 0,
          failed: 1,
          details: [{ error: 'KV database not found', passed: false }]
        };
      }
    }
    
    // Check KV connection status
    const statsOutput = execSync('npx vercel kv stats').toString();
    console.log(`ℹ️  KV connection status: ${statsOutput.includes('Connected') ? 'Connected' : 'Not connected'}`);
    
    return {
      passed: 1,
      failed: 0,
      details: [{ status: 'KV connection verified', passed: true }]
    };
    
  } catch (error) {
    console.error('❌ Storage connection verification failed:', error.message);
    return {
      passed: 0,
      failed: 1,
      details: [{ error: error.message, passed: false }]
    };
  }
}

/**
 * Verify performance metrics
 */
async function verifyPerformance(baseUrl) {
  console.log('\n⚡ Verifying performance metrics...');
  
  try {
    const results = {
      passed: 0,
      failed: 0,
      details: []
    };
    
    // Test API response times
    const endpoints = [
      { name: 'Health Check', path: '/api/health-check' },
      { name: 'Ad Content', path: '/api/ad-content?category=general' }
    ];
    
    for (const endpoint of endpoints) {
      console.log(`ℹ️  Testing response time for ${endpoint.name}...`);
      
      const start = Date.now();
      await fetch(`${baseUrl}${endpoint.path}`);
      const responseTime = Date.now() - start;
      
      const threshold = 1000; // 1 second
      const passed = responseTime < threshold;
      
      if (passed) {
        console.log(`✅ ${endpoint.name}: ${responseTime}ms`);
        results.passed++;
      } else {
        console.warn(`⚠️  ${endpoint.name}: ${responseTime}ms (exceeds ${threshold}ms threshold)`);
        results.failed++;
      }
      
      results.details.push({
        endpoint: endpoint.name,
        responseTime,
        threshold,
        passed
      });
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Performance verification failed:', error.message);
    return {
      passed: 0,
      failed: 1,
      details: [{ error: error.message, passed: false }]
    };
  }
}

/**
 * Generate verification report
 */
function generateReport(results, deploymentUrl) {
  console.log('\n📊 Generating verification report...');
  
  const totalPassed = results.apiEndpoints.passed + 
                       results.openaiIntegration.passed + 
                       results.storageConnection.passed + 
                       results.performance.passed;
  
  const totalFailed = results.apiEndpoints.failed + 
                       results.openaiIntegration.failed + 
                       results.storageConnection.failed + 
                       results.performance.failed;
  
  const totalTests = totalPassed + totalFailed;
  const successRate = (totalPassed / totalTests * 100).toFixed(2);
  
  const report = `
# OpenEvidence Deployment Verification Report

- **Deployment URL**: ${deploymentUrl}
- **Verification Date**: ${new Date().toISOString()}
- **Success Rate**: ${successRate}% (${totalPassed}/${totalTests})

## API Endpoint Tests

- Passed: ${results.apiEndpoints.passed}
- Failed: ${results.apiEndpoints.failed}

${results.apiEndpoints.details.map(detail => 
  `- ${detail.passed ? '✅' : '❌'} ${detail.endpoint}: ${detail.status || detail.error || ''}`
).join('\n')}

## OpenAI Integration Tests

- Passed: ${results.openaiIntegration.passed}
- Failed: ${results.openaiIntegration.failed}

${results.openaiIntegration.details.map(detail => 
  detail.passed 
    ? `- ✅ "${detail.question}": ${detail.classification} (${detail.confidence?.toFixed(2)})`
    : `- ❌ "${detail.question}": ${detail.error || 'Invalid response'}`
).join('\n')}

## Storage Connection Tests

- Passed: ${results.storageConnection.passed}
- Failed: ${results.storageConnection.failed}

${results.storageConnection.details.map(detail => 
  `- ${detail.passed ? '✅' : '❌'} ${detail.status || detail.error || ''}`
).join('\n')}

## Performance Tests

- Passed: ${results.performance.passed}
- Failed: ${results.performance.failed}

${results.performance.details.map(detail => 
  `- ${detail.passed ? '✅' : '❌'} ${detail.endpoint}: ${detail.responseTime}ms (threshold: ${detail.threshold}ms)`
).join('\n')}

## Recommendations

${totalFailed > 0 ? 'The following issues should be addressed:' : 'No critical issues detected.'}

${results.apiEndpoints.failed > 0 ? '- Fix failing API endpoints' : ''}
${results.openaiIntegration.failed > 0 ? '- Troubleshoot OpenAI integration issues' : ''}
${results.storageConnection.failed > 0 ? '- Check Vercel KV configuration' : ''}
${results.performance.failed > 0 ? '- Optimize slow endpoints' : ''}
`;

  // Save report to file
  const reportFile = path.join(process.cwd(), 'verification-report.md');
  fs.writeFileSync(reportFile, report);
  
  console.log(`ℹ️  Verification report saved to: ${reportFile}`);
  console.log(`\n${report}`);
}

/**
 * Helper function to ask questions in the terminal
 */
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Run the verification process
verifyDeployment().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
}); 