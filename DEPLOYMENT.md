# OpenEvidence Ad Platform Deployment Guide

This document provides instructions for deploying the OpenEvidence ad platform to Vercel.

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
3. **Environment Variables**: Prepare the following API keys and configuration values:
   - `OPENAI_API_KEY`: For the question classification service
   - `OPENAI_MODEL`: The OpenAI model to use (e.g., "gpt-4o")
   - `AD_ANALYTICS_ENABLED`: Set to "true" to enable analytics
   - `AD_MAX_SLOTS_PER_PAGE`: Maximum number of ad slots per page
   - `AD_REFRESH_INTERVAL`: Refresh interval in milliseconds
   - `AD_MIN_CONFIDENCE_THRESHOLD`: Minimum confidence threshold for ad display

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New..." and select "Project"
3. Import your GitHub repository containing the OpenEvidence ad platform
4. Vercel will automatically detect the Next.js project

### 2. Configure Environment Variables

1. In the Vercel project settings, navigate to the "Environment Variables" tab
2. Add all required environment variables from your `.env.local` file
3. Ensure you set environment variables for all deployment environments (Production, Preview, Development)

### 3. Configure Build Settings

1. Framework Preset: Next.js
2. Build Command: `npm run build` (default)
3. Output Directory: `.next` (default)
4. Install Command: `npm install` (default)

### 4. Deploy the Application

1. Click "Deploy" to initiate the deployment process
2. Vercel will build and deploy your application
3. Once deployment is complete, Vercel will provide a URL to access your application

### 5. Custom Domain Configuration (Optional)

1. In the Vercel project settings, navigate to the "Domains" tab
2. Add your custom domain and follow the verification process
3. Update DNS settings with your domain registrar as instructed by Vercel

## Continuous Deployment

Vercel automatically sets up continuous deployment from your GitHub repository:

1. Each push to the main branch will trigger a production deployment
2. Pull requests will generate preview deployments
3. You can configure deployment settings in the Vercel project settings

## Monitoring and Logs

1. Access deployment logs from the Vercel dashboard
2. Monitor function invocations and performance in the "Analytics" tab
3. Set up status alerts in the "Monitoring" tab

## Troubleshooting Common Issues

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

### Performance Issues

- **Issue**: Slow API response times
  - **Solution**: Consider implementing caching for frequently accessed data
  - **Solution**: Monitor OpenAI API usage and optimize prompts

## Scaling Considerations

- Vercel automatically scales serverless functions based on demand
- For high-traffic applications, consider:
  - Implementing caching strategies
  - Optimizing API calls to external services
  - Using Vercel's Edge Functions for performance-critical components

## Relevant Documentation

- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments/overview)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [OpenAI API Documentation](https://platform.openai.com/docs/introduction) 