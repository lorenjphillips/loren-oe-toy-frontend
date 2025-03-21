import { NextResponse } from 'next/server';
import { initializeAdRepository, getCategories } from '../../../../data/adRepository';

// Initialize the ad repository on server start
let repositoryInitialized = false;

/**
 * API route to get all ad categories
 */
export async function GET() {
  try {
    // Initialize repository if not done already
    if (!repositoryInitialized) {
      await initializeAdRepository();
      repositoryInitialized = true;
    }

    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 