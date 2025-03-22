# OpenEvidence Ad Platform Deployment Guide

This document provides comprehensive instructions for deploying the OpenEvidence ad platform to Vercel.

## Deployment Architecture Overview

The OpenEvidence ad platform is built as a Next.js application that consists of:

- React frontend components for ad display and analytics visualization
- API routes for ad delivery, classification, and analytics collection
- External service integration with OpenAI for question classification

The application architecture is optimized for Vercel's serverless deployment model, with API routes automatically converted to serverless functions.

## Requirements

Before deployment, ensure you have:

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **GitHub Repository**: The codebase should be hosted in a GitHub repository
3. **Vercel CLI**: Install with `npm install -g vercel`
4. **Node.js**: Version 16 or higher
5. **Environment Variables**: Prepare the following API keys and configuration values:
   - `OPENAI_API_KEY`: For the question classification service
   - `OPENAI_MODEL`: The OpenAI model to use (e.g., "gpt-4o")
   - `AD_ANALYTICS_ENABLED`: Set to "true" to enable analytics
   - `AD_MAX_SLOTS_PER_PAGE`: Maximum number of ad slots per page
   - `AD_REFRESH_INTERVAL`: Refresh interval in milliseconds
   - `AD_MIN_CONFIDENCE_THRESHOLD`: Minimum confidence threshold for ad display
   - `FEATURE_AD_SYSTEM`: Set to "true" to enable the ad system
   - `FEATURE_AD_ANALYTICS`: Set to "true" to enable analytics features
   - `FEATURE_AD_ADMIN`: Set to "true" to enable admin features

## Deployment Methods

### Method 1: Using the Deployment Script (Recommended)

We provide a deployment script that handles pre-deployment validation, environment variable setup, build optimization, and deployment:

```bash
# Navigate to the project directory
cd openevidence-ad-platform

# Make the deployment script executable
chmod +x scripts/deploy.js

# Run the deployment script
node scripts/deploy.js
```

The script will:
1. Validate your environment setup
2. Check for required environment variables
3. Optimize the build for production
4. Deploy to Vercel (preview or production)
5. Verify the deployment

### Method 2: Manual Deployment Using Vercel CLI

Follow these steps for a manual deployment via the Vercel CLI:

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Link to Vercel Project

```bash
# Log in to Vercel
npx vercel login

# Link to existing project or create a new one
npx vercel link
```

#### 3. Set Up Environment Variables

```bash
# Add required environment variables (you will be prompted for values)
npx vercel env add OPENAI_API_KEY
npx vercel env add OPENAI_MODEL
npx vercel env add AD_ANALYTICS_ENABLED
npx vercel env add AD_MAX_SLOTS_PER_PAGE
npx vercel env add AD_REFRESH_INTERVAL
npx vercel env add AD_MIN_CONFIDENCE_THRESHOLD
npx vercel env add FEATURE_AD_SYSTEM
npx vercel env add FEATURE_AD_ANALYTICS
npx vercel env add FEATURE_AD_ADMIN
```

#### 4. Deploy to Preview Environment

```bash
npx vercel
```

#### 5. Deploy to Production

After verifying the preview deployment:

```bash
npx vercel --prod
```

### Method 3: Vercel Dashboard Deployment

1. Log in to your Vercel account
2. Click "Add New..." and select "Project"
3. Import your GitHub repository containing the OpenEvidence ad platform
4. Vercel will automatically detect the Next.js project
5. Configure environment variables and deploy

## Setting Up Vercel KV Storage

The application uses Vercel KV for storing analytics data. To set up Vercel KV:

### 1. Create a KV Database

```bash
# Create a new KV database
npx vercel kv create openevidence-analytics
```

### 2. Link KV to Your Project

```bash
# Link the KV database to your project
npx vercel link
npx vercel kv link openevidence-analytics
```

### 3. Configure Environment Variables

Vercel automatically adds the following environment variables to your project:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

## Environment Variable Configuration

### Production vs. Development Variables

Vercel allows you to set different environment variable values for Production, Preview, and Development environments:

```bash
# Set production-specific value
npx vercel env add OPENAI_MODEL production gpt-4o

# Set preview-specific value
npx vercel env add OPENAI_MODEL preview gpt-4-turbo

# Set development-specific value
npx vercel env add OPENAI_MODEL development gpt-3.5-turbo
```

### Sensitive vs. Non-Sensitive Variables

For sensitive variables like API keys:

```bash
# Add as a secret (will not be visible in logs)
npx vercel env add OPENAI_API_KEY
```

For non-sensitive configuration:

```bash
# Can be added directly to vercel.json
"env": {
  "AD_MAX_SLOTS_PER_PAGE": "3"
}
```

## Scaling and Performance Configuration

Our `vercel.json` includes optimized settings for production:

```json
{
  "regions": ["iad1", "sfo1"],
  "functions": {
    "api/classification.js": {
      "memory": 1024,
      "maxDuration": 10
    },
    "api/ad-content.js": {
      "memory": 512,
      "maxDuration": 5
    }
  }
}
```

- **regions**: Deploys to multiple regions for reduced latency
- **functions**: Configures memory and execution time for serverless functions
- **headers**: Sets caching strategies for improved performance

## Post-Deployment Verification

After deployment, verify the following:

### 1. API Endpoint Testing

```bash
# Test classification endpoint
curl -X POST https://your-deployment-url.vercel.app/api/classification \
  -H "Content-Type: application/json" \
  -d '{"question":"What are treatment options for diabetes?"}'

# Test ad content delivery
curl -X GET https://your-deployment-url.vercel.app/api/ad-content?category=diabetes

# Test analytics collection
curl -X POST https://your-deployment-url.vercel.app/api/analytics/impression \
  -H "Content-Type: application/json" \
  -d '{"adId":"test-ad-123","userId":"test-user","questionText":"Test question"}'
```

### 2. Storage Connection Verification

Access the Vercel KV dashboard to verify data is being stored:

```bash
npx vercel kv stats
```

### 3. OpenAI Integration Testing

Verify OpenAI integration by checking classification API responses for accurate categorization.

### 4. Performance Validation

Run performance tests using Vercel's analytics:

```bash
# View function execution metrics
npx vercel insights
```

## Common Deployment Issues and Solutions

### Build Failures

- **Issue**: Build fails due to missing dependencies
  - **Solution**: Ensure all dependencies are properly listed in `package.json`

- **Issue**: Environment variables not accessible during build
  - **Solution**: Check that all required environment variables are set in Vercel project settings

### Runtime Errors

- **Issue**: API routes return 500 errors
  - **Solution**: Check logs for errors related to OpenAI API key or other external services

- **Issue**: Missing environment variables in production
  - **Solution**: Verify all environment variables are correctly set for the production environment

### OpenAI Integration Issues

- **Issue**: Classification API returns errors
  - **Solution**: Verify your OpenAI API key and model name are correct
  - **Solution**: Check OpenAI API quota and limits

### Performance Issues

- **Issue**: Slow API response times
  - **Solution**: Increase memory allocation for critical functions in `vercel.json`
  - **Solution**: Implement caching for frequently accessed data
  - **Solution**: Optimize OpenAI API calls with more efficient prompts

### Vercel KV Issues

- **Issue**: Cannot connect to KV storage
  - **Solution**: Verify KV connection variables are set correctly
  - **Solution**: Check KV database status in Vercel dashboard

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:

1. Each push to the main branch will trigger a production deployment
2. Pull requests will generate preview deployments
3. You can configure deployment settings in the Vercel project settings

## Rolling Back Deployments

If issues are detected after deployment:

```bash
# List recent deployments
npx vercel ls

# Roll back to a previous deployment
npx vercel rollback
```

## Monitoring and Logs

1. Access deployment logs from the Vercel dashboard
2. Monitor function invocations and performance in the "Analytics" tab
3. Set up status alerts in the "Monitoring" tab

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments/overview)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction) 