#!/usr/bin/env node

/**
 * OpenEvidence Ad Platform Deployment Script
 * 
 * This script handles pre-deployment validation, build optimization,
 * and post-deployment verification for Vercel deployments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Required environment variables for successful deployment
const REQUIRED_ENV_VARS = [
  'OPENAI_API_KEY',
  'OPENAI_MODEL',
  'AD_ANALYTICS_ENABLED',
  'AD_MAX_SLOTS_PER_PAGE',
  'AD_REFRESH_INTERVAL',
  'AD_MIN_CONFIDENCE_THRESHOLD',
  'FEATURE_AD_SYSTEM',
  'FEATURE_AD_ANALYTICS',
  'FEATURE_AD_ADMIN'
];

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main deployment function that orchestrates the deployment process
 */
async function deploy() {
  try {
    console.log('🚀 Starting OpenEvidence deployment process...\n');
    
    // Run pre-deployment checks
    await runPreDeploymentChecks();
    
    // Optimize build
    await optimizeBuild();
    
    // Deploy to Vercel
    await deployToVercel();
    
    // Verify deployment
    await verifyDeployment();
    
    console.log('\n✅ Deployment process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Run pre-deployment validation checks
 */
async function runPreDeploymentChecks() {
  console.log('📋 Running pre-deployment checks...');
  
  // Check for uncommitted changes
  try {
    const status = execSync('git status --porcelain').toString();
    if (status) {
      console.warn('⚠️  Warning: You have uncommitted changes in your repository.');
      const proceed = await askQuestion('Do you want to proceed with deployment anyway? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        throw new Error('Deployment aborted due to uncommitted changes.');
      }
    } else {
      console.log('✅ No uncommitted changes detected.');
    }
  } catch (error) {
    if (!error.message.includes('Deployment aborted')) {
      console.warn('⚠️  Warning: Unable to check git status. Make sure git is installed.');
    } else {
      throw error;
    }
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`ℹ️  Node.js version: ${nodeVersion}`);
  const versionNum = nodeVersion.substring(1).split('.')[0];
  if (parseInt(versionNum) < 16) {
    throw new Error('Node.js version 16 or higher is required.');
  }
  
  // Validate environment variables
  await validateEnvironmentVariables();
  
  // Check dependencies
  console.log('📦 Checking dependencies...');
  execSync('npm ci', { stdio: 'inherit' });
  
  // Run linter
  console.log('🔍 Running linter...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    throw new Error('Linting failed. Please fix the issues before deploying.');
  }
  
  console.log('✅ Pre-deployment checks passed.');
}

/**
 * Validate environment variables
 */
async function validateEnvironmentVariables() {
  console.log('🔐 Validating environment variables...');
  
  // Check if .env.local exists
  if (!fs.existsSync(path.join(process.cwd(), '.env.local'))) {
    console.warn('⚠️  Warning: .env.local file not found.');
    const proceed = await askQuestion('Would you like to create a .env.local file now? (y/n): ');
    if (proceed.toLowerCase() === 'y') {
      await createEnvFile();
    } else {
      console.log('ℹ️  Checking for Vercel environment variables instead...');
    }
  }
  
  // Check Vercel environment variables
  try {
    const vercelEnv = execSync('npx vercel env ls').toString();
    const missingVars = REQUIRED_ENV_VARS.filter(env => !vercelEnv.includes(env));
    
    if (missingVars.length > 0) {
      console.warn(`⚠️  Warning: The following environment variables are missing in Vercel: ${missingVars.join(', ')}`);
      const proceed = await askQuestion('Would you like to add them now? (y/n): ');
      if (proceed.toLowerCase() === 'y') {
        await addVercelEnvVars(missingVars);
      } else {
        throw new Error('Deployment aborted due to missing environment variables.');
      }
    } else {
      console.log('✅ All required Vercel environment variables are set.');
    }
  } catch (error) {
    if (!error.message.includes('Deployment aborted')) {
      console.warn('⚠️  Warning: Unable to check Vercel environment variables. Make sure you\'re logged in to Vercel CLI.');
      console.warn('ℹ️  Run "npx vercel login" to authenticate.');
    } else {
      throw error;
    }
  }
}

/**
 * Create .env.local file
 */
async function createEnvFile() {
  console.log('📝 Creating .env.local file...');
  const envContent = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = await askQuestion(`Enter value for ${envVar}: `);
    envContent.push(`${envVar}=${value}`);
  }
  
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent.join('\n'));
  console.log('✅ .env.local file created successfully.');
}

/**
 * Add missing environment variables to Vercel
 */
async function addVercelEnvVars(missingVars) {
  console.log('🔄 Adding environment variables to Vercel...');
  
  for (const envVar of missingVars) {
    const value = await askQuestion(`Enter value for ${envVar}: `);
    execSync(`npx vercel env add ${envVar}`, { stdio: 'inherit' });
  }
  
  console.log('✅ Environment variables added to Vercel.');
}

/**
 * Optimize build for production deployment
 */
async function optimizeBuild() {
  console.log('⚙️ Optimizing build for production...');
  
  // Clean previous builds
  if (fs.existsSync(path.join(process.cwd(), '.next'))) {
    console.log('🗑️  Cleaning previous build...');
    fs.rmSync(path.join(process.cwd(), '.next'), { recursive: true, force: true });
  }
  
  // Run production build
  console.log('🔨 Building for production...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build optimization completed.');
}

/**
 * Deploy to Vercel
 */
async function deployToVercel() {
  console.log('🚀 Deploying to Vercel...');
  
  // Check if project is linked to Vercel
  try {
    execSync('npx vercel inspect', { stdio: 'pipe' });
  } catch (error) {
    console.log('ℹ️  Project not linked to Vercel. Linking now...');
    execSync('npx vercel link', { stdio: 'inherit' });
  }
  
  // Ask for production or preview deployment
  const isProd = await askQuestion('Deploy to production? (y/n): ');
  
  if (isProd.toLowerCase() === 'y') {
    console.log('🚀 Deploying to production...');
    execSync('npx vercel --prod', { stdio: 'inherit' });
  } else {
    console.log('🚀 Deploying to preview environment...');
    execSync('npx vercel', { stdio: 'inherit' });
  }
  
  console.log('✅ Deployment to Vercel completed.');
}

/**
 * Verify deployment
 */
async function verifyDeployment() {
  console.log('🔍 Verifying deployment...');
  
  // Get deployment URL
  const deploymentUrl = execSync('npx vercel ls --json').toString();
  const deployments = JSON.parse(deploymentUrl);
  const latestDeployment = deployments[0]?.url;
  
  if (!latestDeployment) {
    console.warn('⚠️  Warning: Unable to fetch deployment URL.');
    return;
  }
  
  console.log(`ℹ️  Latest deployment URL: https://${latestDeployment}`);
  
  // Verify API endpoints
  console.log('🔄 Verifying API endpoints...');
  try {
    execSync(`curl -s https://${latestDeployment}/api/health-check`);
    console.log('✅ API endpoint verification passed.');
  } catch (error) {
    console.warn('⚠️  Warning: API endpoint verification failed.');
  }
  
  // Log deployment info
  console.log(`
📋 Post-Deployment Verification Checklist:

1. Verify OpenAI integration by testing the classification endpoint:
   curl -X POST https://${latestDeployment}/api/classification -H "Content-Type: application/json" -d '{"question":"What are treatment options for diabetes?"}'

2. Check ad content delivery:
   curl -X GET https://${latestDeployment}/api/ad-content?category=diabetes

3. Verify analytics collection:
   curl -X POST https://${latestDeployment}/api/analytics/impression -H "Content-Type: application/json" -d '{"adId":"test-ad-123","userId":"test-user","questionText":"Test question"}'

4. Access the application in your browser:
   https://${latestDeployment}

ℹ️ For troubleshooting, check Vercel logs:
   npx vercel logs ${latestDeployment}
`);
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

// Run the deployment process
deploy().catch(error => {
  console.error('Deployment failed:', error);
  process.exit(1);
}); 