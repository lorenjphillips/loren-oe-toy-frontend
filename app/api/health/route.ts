import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createApiResponse, handleApiError } from '../../lib/api-utils';

// Create OpenAI client for health check
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-health-check',
});

/**
 * Data storage health check - placeholder
 * In a real app, this would check database connectivity
 */
async function checkStorageHealth(): Promise<{
  status: 'ok' | 'degraded' | 'unavailable';
  responseTimeMs: number;
  details?: string;
}> {
  // Simulate a storage check
  const startTime = Date.now();
  
  try {
    // This would be a real database query in production
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      status: 'ok',
      responseTimeMs: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      status: 'unavailable',
      responseTimeMs: Date.now() - startTime,
      details: error.message
    };
  }
}

/**
 * OpenAI API health check
 */
async function checkOpenAIHealth(): Promise<{
  status: 'ok' | 'degraded' | 'unavailable';
  responseTimeMs: number;
  details?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Simple model request to verify API connectivity
    await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'System health check' }],
      max_tokens: 5,
    });
    
    return {
      status: 'ok',
      responseTimeMs: Date.now() - startTime
    };
  } catch (error: any) {
    return {
      status: 'unavailable',
      responseTimeMs: Date.now() - startTime,
      details: error.message
    };
  }
}

/**
 * Calculate overall system status based on component statuses
 */
function calculateOverallStatus(components: Record<string, { status: 'ok' | 'degraded' | 'unavailable' }>) {
  const statuses = Object.values(components).map(c => c.status);
  
  if (statuses.some(s => s === 'unavailable')) {
    return 'unavailable';
  }
  
  if (statuses.some(s => s === 'degraded')) {
    return 'degraded';
  }
  
  return 'ok';
}

/**
 * Health check endpoint
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  try {
    // Check the health of critical components
    const [storageHealth, openaiHealth] = await Promise.all([
      checkStorageHealth(),
      checkOpenAIHealth()
    ]);
    
    // Get memory usage metrics
    const memoryUsage = process.memoryUsage();
    
    // Calculate response time for this request
    const requestStartTime = Date.now();
    
    // Components health
    const components = {
      storage: storageHealth,
      openai: openaiHealth
    };
    
    // Calculate overall status
    const overallStatus = calculateOverallStatus(components);
    
    // Build health check response
    const healthResponse = {
      status: overallStatus,
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      components,
      metrics: {
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB'
        },
        responseTime: Date.now() - requestStartTime + ' ms'
      }
    };
    
    // Return health check response
    return createApiResponse(healthResponse);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
} 