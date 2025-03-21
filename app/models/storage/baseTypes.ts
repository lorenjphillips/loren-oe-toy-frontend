/**
 * Base interface for all stored entities
 */
export interface StorageEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Storage serialization helpers
 */
export const StorageHelpers = {
  /**
   * Serialize an entity for storage
   */
  serialize: <T>(data: T): string => {
    return JSON.stringify(data);
  },

  /**
   * Deserialize an entity from storage
   */
  deserialize: <T>(data: string | null): T | null => {
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (e) {
      console.error('Error deserializing data:', e);
      return null;
    }
  },

  /**
   * Create a timestamp for the current time
   */
  now: (): number => {
    return Date.now();
  },

  /**
   * Generate a random ID (simplified version, consider using uuid in production)
   */
  generateId: (): string => {
    return Math.random().toString(36).substring(2, 12);
  }
};

/**
 * Base class with validation functionality
 */
export abstract class ValidatableEntity implements StorageEntity {
  id: string;
  createdAt: number;
  updatedAt: number;

  constructor(data: Partial<StorageEntity>) {
    this.id = data.id || StorageHelpers.generateId();
    this.createdAt = data.createdAt || StorageHelpers.now();
    this.updatedAt = data.updatedAt || StorageHelpers.now();
  }

  /**
   * Validate the entity
   * Should be implemented by derived classes
   */
  abstract validate(): boolean;

  /**
   * Update the entity timestamp
   */
  touch(): void {
    this.updatedAt = StorageHelpers.now();
  }
} 