import { kv } from '@vercel/kv';

/**
 * Base service for Vercel KV data storage operations
 */
export class KVStorageService {
  private namespace: string;
  private retryCount: number = 3;
  private retryDelay: number = 300;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  /**
   * Generates a namespaced key for storage
   */
  protected getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  /**
   * Store data with optional expiration
   */
  async set<T>(key: string, data: T, expirationSeconds?: number): Promise<void> {
    const namespaceKey = this.getKey(key);
    
    try {
      if (expirationSeconds) {
        await kv.set(namespaceKey, data, { ex: expirationSeconds });
      } else {
        await kv.set(namespaceKey, data);
      }
    } catch (error) {
      console.error(`Error storing data for key ${namespaceKey}:`, error);
      throw new Error(`Failed to store data: ${(error as Error).message}`);
    }
  }

  /**
   * Retrieve data with retry logic
   */
  async get<T>(key: string): Promise<T | null> {
    const namespaceKey = this.getKey(key);
    let attempt = 0;
    
    while (attempt < this.retryCount) {
      try {
        const data = await kv.get<T>(namespaceKey);
        return data;
      } catch (error) {
        console.warn(`Error retrieving data for key ${namespaceKey} (attempt ${attempt + 1}/${this.retryCount}):`, error);
        attempt++;
        
        if (attempt === this.retryCount) {
          throw new Error(`Failed to retrieve data after ${this.retryCount} attempts: ${(error as Error).message}`);
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
    
    return null;
  }

  /**
   * Delete data
   */
  async delete(key: string): Promise<void> {
    const namespaceKey = this.getKey(key);
    
    try {
      await kv.del(namespaceKey);
    } catch (error) {
      console.error(`Error deleting data for key ${namespaceKey}:`, error);
      throw new Error(`Failed to delete data: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const data = await this.get(key);
    return data !== null;
  }

  /**
   * Set expiration on existing key
   */
  async expire(key: string, expirationSeconds: number): Promise<void> {
    const namespaceKey = this.getKey(key);
    
    try {
      await kv.expire(namespaceKey, expirationSeconds);
    } catch (error) {
      console.error(`Error setting expiration for key ${namespaceKey}:`, error);
      throw new Error(`Failed to set expiration: ${(error as Error).message}`);
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const namespaceKey = this.getKey(key);
    
    try {
      return await kv.incrby(namespaceKey, amount);
    } catch (error) {
      console.error(`Error incrementing value for key ${namespaceKey}:`, error);
      throw new Error(`Failed to increment value: ${(error as Error).message}`);
    }
  }

  /**
   * Store multiple values in hash
   */
  async hmset(key: string, data: Record<string, any>): Promise<void> {
    const namespaceKey = this.getKey(key);
    
    try {
      await kv.hset(namespaceKey, data);
    } catch (error) {
      console.error(`Error storing hash data for key ${namespaceKey}:`, error);
      throw new Error(`Failed to store hash data: ${(error as Error).message}`);
    }
  }

  /**
   * Get all hash fields
   */
  async hgetall<T extends Record<string, any>>(key: string): Promise<T | null> {
    const namespaceKey = this.getKey(key);
    
    try {
      return await kv.hgetall(namespaceKey);
    } catch (error) {
      console.error(`Error retrieving hash data for key ${namespaceKey}:`, error);
      throw new Error(`Failed to retrieve hash data: ${(error as Error).message}`);
    }
  }
} 