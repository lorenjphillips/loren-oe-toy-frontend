/**
 * Unified Ad Type definitions
 * 
 * This file contains a unified AdType enum that combines values
 * from both app/models/adTypes.ts and app/types/ad.ts to resolve
 * type conflicts in the codebase.
 */

/**
 * Unified enum for different types of ads that combines all values
 * from various parts of the codebase
 */
export enum AdType {
  // From app/models/adTypes.ts
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  INTERACTIVE = 'interactive',
  MICROSIMULATION = 'microsimulation',
  KNOWLEDGE_GRAPH = 'knowledge_graph',
  VIDEO = 'video',
  
  // From app/types/ad.ts
  TEXT = 'text',
  BANNER = 'banner',
  SPONSORED_CONTENT = 'sponsored_content',
  SIDEBAR = 'sidebar',
  
  // Add IMAGE type that seems to be referenced in some files
  IMAGE = 'image'
}

/**
 * Type guard to check if a string is a valid AdType
 */
export function isValidAdType(type: string): type is AdType {
  return Object.values(AdType).includes(type as AdType);
}

/**
 * Convert string to AdType safely
 */
export function toAdType(type: string): AdType | undefined {
  return isValidAdType(type) ? type as AdType : undefined;
} 