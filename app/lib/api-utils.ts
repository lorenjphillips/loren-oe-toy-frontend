/**
 * API utilities for OpenEvidence platform
 */
import { NextResponse } from 'next/server';

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Creates a standardized API response
 */
export function createApiResponse<T>(data?: T, error?: ApiError): NextResponse {
  const timestamp = new Date().toISOString();
  
  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          details: error.details
        },
        timestamp
      } as ApiResponse,
      { status: error.status }
    );
  }
  
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp
    } as ApiResponse,
    { status: 200 }
  );
}

/**
 * Handles API errors and generates appropriate responses
 */
export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);
  
  if (error.name === 'ValidationError') {
    return createApiResponse(undefined, {
      status: 400,
      message: 'Validation error',
      details: error.details || error.message
    });
  }
  
  if (error.status && error.message) {
    return createApiResponse(undefined, error);
  }
  
  return createApiResponse(undefined, {
    status: 500,
    message: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(body: any, fields: string[]): string | null {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}

/**
 * Basic rate limiting utility - can be enhanced with Redis or other storage
 */
const ipRequestCounts: Record<string, { count: number, resetTime: number }> = {};

export function checkRateLimit(ip: string, limit = 100, windowMs = 60000): boolean {
  const now = Date.now();
  
  if (!ipRequestCounts[ip] || ipRequestCounts[ip].resetTime < now) {
    ipRequestCounts[ip] = { count: 1, resetTime: now + windowMs };
    return true;
  }
  
  if (ipRequestCounts[ip].count >= limit) {
    return false;
  }
  
  ipRequestCounts[ip].count += 1;
  return true;
}

/**
 * Authentication helper - placeholder for actual auth implementation
 */
export function validateAuthToken(token: string): boolean {
  // Implement actual token validation logic
  return Boolean(token && token.length > 10);
} 