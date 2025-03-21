import { KVStorageService } from '../../lib/storage';
import { 
  CacheItem, 
  CachePriority, 
  CacheUtils 
} from '../../models/storage/cacheTypes';
import { StorageHelpers } from '../../models/storage/baseTypes';

/**
 * Storage service for caching API responses and other data
 */
export class CacheStorageService extends KVStorageService {
  // Default TTL for cache items (1 hour)
  private readonly DEFAULT_TTL = 60 * 60;
  
  constructor(namespace: string = 'cache') {
    super(namespace);
  }

  /**
   * Store an item in the cache
   */
  async setCacheItem<T>(
    key: string, 
    value: T, 
    options: {
      ttl?: number | null;
      priority?: CachePriority;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<void> {
    const ttl = options.ttl ?? this.DEFAULT_TTL;
    const cacheItem = CacheUtils.createItem(key, value, {
      ttl,
      priority: options.priority || CachePriority.MEDIUM,
      metadata: options.metadata || {}
    });
    
    // Store with expiration if ttl is provided
    await super.set(key, cacheItem, ttl || undefined);
  }

  /**
   * Get an item from the cache
   */
  async getCacheItem<T>(key: string): Promise<T | null> {
    const cacheItem = await super.get<CacheItem<T>>(key);
    
    if (!cacheItem) {
      return null;
    }
    
    // Check if the item is expired
    if (CacheUtils.isExpired(cacheItem)) {
      await this.delete(key);
      return null;
    }
    
    return cacheItem.value;
  }

  /**
   * Get an item with its metadata
   */
  async getWithMetadata<T>(key: string): Promise<CacheItem<T> | null> {
    const cacheItem = await super.get<CacheItem<T>>(key);
    
    if (!cacheItem) {
      return null;
    }
    
    // Check if the item is expired
    if (CacheUtils.isExpired(cacheItem)) {
      await this.delete(key);
      return null;
    }
    
    return cacheItem;
  }

  /**
   * Check if a key exists and is not expired
   */
  async exists(key: string): Promise<boolean> {
    const cacheItem = await super.get<CacheItem>(key);
    
    if (!cacheItem) {
      return false;
    }
    
    // Check if the item is expired
    if (CacheUtils.isExpired(cacheItem)) {
      await this.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Set or update item expiration
   */
  async setExpiration(key: string, ttl: number): Promise<boolean> {
    const cacheItem = await super.get<CacheItem>(key);
    
    if (!cacheItem) {
      return false;
    }
    
    // Check if the item is already expired
    if (CacheUtils.isExpired(cacheItem)) {
      await this.delete(key);
      return false;
    }
    
    // Update the TTL and expiration
    cacheItem.ttl = ttl;
    cacheItem.expiresAt = CacheUtils.calculateExpiration(ttl);
    cacheItem.updatedAt = StorageHelpers.now();
    
    // Store with new expiration
    await super.set(key, cacheItem, ttl);
    
    // Also call the parent's expire method
    await super.expire(key, ttl);
    
    return true;
  }

  /**
   * Update cache item metadata
   */
  async updateMetadata(key: string, metadata: Record<string, any>): Promise<boolean> {
    const cacheItem = await super.get<CacheItem>(key);
    
    if (!cacheItem) {
      return false;
    }
    
    // Check if the item is expired
    if (CacheUtils.isExpired(cacheItem)) {
      await this.delete(key);
      return false;
    }
    
    // Update the metadata and timestamp
    cacheItem.metadata = {
      ...cacheItem.metadata,
      ...metadata
    };
    cacheItem.updatedAt = StorageHelpers.now();
    
    // Store with the same expiration
    const ttl = cacheItem.ttl || undefined;
    await super.set(key, cacheItem, ttl);
    
    return true;
  }

  /**
   * Cache API response with standard TTL
   */
  async cacheApiResponse<T>(
    endpoint: string, 
    params: Record<string, any>, 
    data: T, 
    ttl: number = this.DEFAULT_TTL
  ): Promise<void> {
    // Create a deterministic key from the endpoint and params
    const paramsString = JSON.stringify(params);
    const key = `api:${endpoint}:${paramsString}`;
    
    await this.setCacheItem(key, data, { 
      ttl, 
      metadata: { 
        endpoint,
        params,
        cachedAt: Date.now()
      }
    });
  }

  /**
   * Get cached API response
   */
  async getCachedApiResponse<T>(
    endpoint: string, 
    params: Record<string, any>
  ): Promise<T | null> {
    // Create the same deterministic key
    const paramsString = JSON.stringify(params);
    const key = `api:${endpoint}:${paramsString}`;
    
    return this.getCacheItem<T>(key);
  }

  /**
   * Invalidate all cache entries for a specific endpoint
   */
  async invalidateApiCache(endpoint: string): Promise<void> {
    // In a real implementation, this would scan for all keys matching a pattern
    console.warn('invalidateApiCache: Full implementation requires Redis scans');
    console.log(`Invalidating cache for endpoint ${endpoint} would require scanning all keys with this pattern`);
  }
} 