import { StorageEntity } from './baseTypes';

/**
 * Cache priority levels
 */
export enum CachePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Cache item interface
 */
export interface CacheItem<T = any> extends StorageEntity {
  key: string;
  value: T;
  ttl: number | null;
  expiresAt: number | null;
  priority: CachePriority;
  metadata: Record<string, any>;
}

/**
 * Cache serialization utilities
 */
export const CacheUtils = {
  /**
   * Calculate expiration timestamp from TTL
   */
  calculateExpiration: (ttl: number | null): number | null => {
    if (ttl === null) return null;
    return Date.now() + ttl * 1000;
  },

  /**
   * Check if cache item is expired
   */
  isExpired: (item: CacheItem): boolean => {
    if (item.expiresAt === null) return false;
    return Date.now() > item.expiresAt;
  },

  /**
   * Create a cache key with namespace
   */
  createKey: (namespace: string, key: string): string => {
    return `cache:${namespace}:${key}`;
  },

  /**
   * Create a cache item
   */
  createItem: <T>(
    key: string,
    value: T,
    options: {
      ttl?: number | null;
      priority?: CachePriority;
      metadata?: Record<string, any>;
    } = {}
  ): CacheItem<T> => {
    const ttl = options.ttl ?? 3600; // Default 1 hour TTL
    const expiresAt = CacheUtils.calculateExpiration(ttl);
    
    return {
      id: key,
      key,
      value,
      ttl,
      expiresAt,
      priority: options.priority || CachePriority.MEDIUM,
      metadata: options.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
};

/**
 * Migration helper for cache version upgrades
 */
export const CacheMigration = {
  /**
   * Migrate a cache item to a new version
   * @param item The cache item to migrate
   * @param version The target version
   * @param migrator Function to perform migration
   */
  migrateItem: <T, U>(
    item: CacheItem<T>,
    version: number,
    migrator: (data: T) => U
  ): CacheItem<U> => {
    const currentVersion = item.metadata.version || 1;
    
    if (currentVersion >= version) {
      return item as unknown as CacheItem<U>;
    }
    
    const migratedValue = migrator(item.value);
    
    return {
      ...item,
      value: migratedValue,
      metadata: {
        ...item.metadata,
        version,
        migratedAt: Date.now(),
        previousVersion: currentVersion
      },
      updatedAt: Date.now()
    };
  }
}; 