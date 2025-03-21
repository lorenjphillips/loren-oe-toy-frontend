import { NextResponse } from 'next/server';
import { initializeAdRepository, getAds, updateAdMetrics } from '../../../../data/adRepository';

// Initialize the ad repository on server start
let repositoryInitialized = false;

/**
 * API route to get all ads
 */
export async function GET() {
  try {
    // Initialize repository if not done already
    if (!repositoryInitialized) {
      await initializeAdRepository();
      repositoryInitialized = true;
    }

    const ads = await getAds();
    return NextResponse.json(ads);
  } catch (error: any) {
    console.error('Error fetching ads:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * API route to create a new ad
 */
export async function POST(request: Request) {
  try {
    // This would typically validate user permissions
    
    const adData = await request.json();
    
    // In a real implementation, this would add the ad to the database
    // For now, we'll just return a mock response
    
    return NextResponse.json({
      id: 'mock-new-ad-id',
      ...adData,
      impressions: 0,
      clicks: 0
    });
  } catch (error: any) {
    console.error('Error creating ad:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 