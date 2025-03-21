import { z } from 'zod';
import { PerformanceMetric } from './comparison';

export interface SegmentationCriteria {
  timeRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  formats?: ('microsimulation' | 'knowledge_graph')[];
  customFilters?: Record<string, any>;
}

export interface CohortDefinition {
  id: string;
  name: string;
  criteria: SegmentationCriteria;
  description?: string;
}

export interface SavedView {
  id: string;
  name: string;
  criteria: SegmentationCriteria;
  cohorts?: CohortDefinition[];
  createdAt: Date;
  updatedAt: Date;
}

const segmentationSchema = z.object({
  timeRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  categories: z.array(z.string()).optional(),
  formats: z.array(z.enum(['microsimulation', 'knowledge_graph'])).optional(),
  customFilters: z.record(z.any()).optional(),
});

export class SegmentationService {
  private savedViews: Map<string, SavedView> = new Map();

  /**
   * Apply segmentation criteria to a dataset
   */
  public applySegmentation<T extends Record<string, any>>(
    data: T[],
    criteria: SegmentationCriteria
  ): T[] {
    // Validate criteria
    segmentationSchema.parse(criteria);

    return data.filter(item => {
      // Time range filter
      if (criteria.timeRange) {
        const itemDate = new Date(item.timestamp);
        if (itemDate < criteria.timeRange.start || itemDate > criteria.timeRange.end) {
          return false;
        }
      }

      // Category filter
      if (criteria.categories?.length && !criteria.categories.includes(item.category)) {
        return false;
      }

      // Format filter
      if (criteria.formats?.length && !criteria.formats.includes(item.format)) {
        return false;
      }

      // Custom filters
      if (criteria.customFilters) {
        return Object.entries(criteria.customFilters).every(([key, value]) => {
          return item[key] === value;
        });
      }

      return true;
    });
  }

  /**
   * Create and analyze cohorts based on criteria
   */
  public createCohort(definition: CohortDefinition): string {
    // Validate cohort definition
    if (!definition.id || !definition.name || !definition.criteria) {
      throw new Error('Invalid cohort definition');
    }

    // Store cohort definition for future use
    this.savedViews.set(definition.id, {
      id: definition.id,
      name: definition.name,
      criteria: definition.criteria,
      cohorts: [definition],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return definition.id;
  }

  /**
   * Save a comparison view for future reference
   */
  public saveView(view: Omit<SavedView, 'createdAt' | 'updatedAt'>): SavedView {
    const now = new Date();
    const savedView: SavedView = {
      ...view,
      createdAt: now,
      updatedAt: now,
    };

    this.savedViews.set(view.id, savedView);
    return savedView;
  }

  /**
   * Retrieve a saved view
   */
  public getView(id: string): SavedView | undefined {
    return this.savedViews.get(id);
  }

  /**
   * List all saved views
   */
  public listViews(): SavedView[] {
    return Array.from(this.savedViews.values());
  }

  /**
   * Update an existing view
   */
  public updateView(id: string, updates: Partial<SavedView>): SavedView {
    const existing = this.savedViews.get(id);
    if (!existing) {
      throw new Error(`View with id ${id} not found`);
    }

    const updated: SavedView = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };

    this.savedViews.set(id, updated);
    return updated;
  }

  /**
   * Delete a saved view
   */
  public deleteView(id: string): boolean {
    return this.savedViews.delete(id);
  }
} 