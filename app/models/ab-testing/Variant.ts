/**
 * Variant model for A/B tests
 * 
 * Represents a specific variation in an A/B test
 */
export interface Variant {
  id: string;                    // Unique identifier for the variant
  name: string;                  // Human-readable name (e.g., "Control", "Treatment A")
  description: string;            // Description of the variant
  isControl: boolean;            // Whether this is the control variant
  trafficAllocation: number;      // % of test traffic allocated to this variant
  // Custom properties depend on the test type, like different copy, layouts, etc.
  properties: Record<string, any>;
  
  // Ad content modifications
  adModifications?: {
    contentId?: string;          // Target ad content ID to modify, or create new if not specified
    title?: string;              // Modified title
    description?: string;        // Modified description
    imageUrl?: string;           // Modified image URL
    layoutType?: string;         // Layout variation type
    callToAction?: string;       // Modified call to action text
    backgroundColor?: string;    // Background color
    textColor?: string;          // Text color
    fontFamily?: string;         // Font family
    fontSize?: string;           // Font size
    templateId?: string;         // Template identifier
    customData?: Record<string, any>; // Additional custom modifications
  };
  
  // Custom parameters for this variant
  parameters?: Record<string, any>;
} 