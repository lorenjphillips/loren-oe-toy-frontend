/**
 * Analytics Data Store Service
 * 
 * Provides a consistent interface for storing analytics events
 * with support for:
 * - Local storage using IndexedDB
 * - Batched API submission
 * - Data aggregation for real-time dashboards
 * - HIPAA compliance and privacy protection
 */

// Note: You might need to install the idb package:
// npm install idb
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, anonymizeEvent } from '../../models/analytics/AnalyticsEvent';

/**
 * IndexedDB database schema
 */
interface AnalyticsDB extends DBSchema {
  events: {
    key: string;
    value: AnalyticsEvent;
    indexes: {
      'by-time': number;
      'by-type': string;
    };
  };
  eventBatches: {
    key: string;
    value: {
      batchId: string;
      events: AnalyticsEvent[];
      status: 'pending' | 'sending' | 'complete' | 'failed';
      createdAt: number;
      attempts: number;
    };
    indexes: {
      'by-status': string;
    };
  };
  aggregates: {
    key: string;
    value: {
      id: string;
      type: string;
      data: any;
      lastUpdated: number;
    };
  };
}

/**
 * Configuration options for the data store
 */
export interface DataStoreConfig {
  databaseName: string;
  apiEndpoint?: string;
  batchSize: number;
  syncInterval: number;
  retentionDays: number;
  privacyMode: "standard" | "enhanced";
  debug?: boolean;         // Enable debug logging
  maxRetries?: number;     // Maximum retry attempts for failed batches
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: DataStoreConfig = {
  databaseName: 'analytics_store',
  batchSize: 20,
  syncInterval: 60, // seconds
  retentionDays: 90,
  privacyMode: "enhanced",
  debug: false,
  maxRetries: 3
};

// Database connection
let db: IDBPDatabase<AnalyticsDB> | null = null;
let syncIntervalId: number | null = null;
let config: DataStoreConfig = { ...DEFAULT_CONFIG };
let initialized = false;

/**
 * Initialize the data store
 */
export async function initDataStore(customConfig: Partial<DataStoreConfig> = {}): Promise<void> {
  // Skip if already initialized
  if (initialized) {
    console.warn('Analytics data store already initialized');
    return;
  }
  
  // Merge configs
  config = { ...DEFAULT_CONFIG, ...customConfig };
  
  // Open or create the database
  db = await openDB<AnalyticsDB>(config.databaseName, 1, {
    upgrade(db: IDBPDatabase<AnalyticsDB>) {
      // Create object stores on first use
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        eventStore.createIndex('by-time', 'context.timestamp');
        eventStore.createIndex('by-type', 'eventType');
      }
      
      if (!db.objectStoreNames.contains('eventBatches')) {
        const batchStore = db.createObjectStore('eventBatches', { keyPath: 'batchId' });
        batchStore.createIndex('by-status', 'status');
      }
      
      if (!db.objectStoreNames.contains('aggregates')) {
        db.createObjectStore('aggregates', { keyPath: 'id' });
      }
    },
  });
  
  initialized = true;
  
  // Schedule periodic sync if API endpoint is configured
  if (config.apiEndpoint) {
    syncIntervalId = window.setInterval(() => {
      syncEvents().catch((e: Error) => {
        console.error('Failed to sync analytics events:', e);
      });
    }, config.syncInterval * 1000);
    
    // Immediate initial sync
    syncEvents().catch((e: Error) => {
      console.error('Failed to perform initial analytics sync:', e);
    });
  }
  
  // Schedule cleanup of old data
  window.setInterval(() => {
    cleanupOldData().catch((e: Error) => {
      console.error('Failed to clean up old analytics data:', e);
    });
  }, 86400000); // Run once a day
  
  console.log('Analytics data store initialized');
}

/**
 * Store a single analytics event
 */
export async function storeEvent(event: AnalyticsEvent): Promise<string | null> {
  try {
    // Enforce privacy compliance
    const sanitizedEvent = config.privacyMode === 'enhanced' 
      ? anonymizeEvent(event)
      : event;
    
    // If local storage is disabled, send directly to API
    if (!db) {
      await sendEventsToAPI([sanitizedEvent]);
      return sanitizedEvent.id;
    }
    
    // Store in IndexedDB
    await db.add('events', sanitizedEvent);
    
    // Check if we need to create a new batch
    await prepareBatchIfNeeded();
    
    return sanitizedEvent.id;
  } catch (error) {
    console.error('[Analytics DataStore] Failed to store event:', error);
    return null;
  }
}

/**
 * Store multiple analytics events
 */
export async function storeEvents(events: AnalyticsEvent[]): Promise<string[]> {
  if (!events.length) return [];
  
  const storedIds: string[] = [];
  
  try {
    // Apply privacy compliance to all events
    const sanitizedEvents = events.map(event => 
      config.privacyMode === 'enhanced' ? anonymizeEvent(event) : event
    );
    
    // If local storage is disabled, send directly to API
    if (!db) {
      await sendEventsToAPI(sanitizedEvents);
      return sanitizedEvents.map((e: AnalyticsEvent) => e.id);
    }
    
    // Store each event in IndexedDB
    const tx = db.transaction('events', 'readwrite');
    
    for (const event of sanitizedEvents) {
      await tx.store.add(event);
      storedIds.push(event.id);
    }
    
    await tx.done;
    
    // Check if we need to create a new batch
    await prepareBatchIfNeeded();
    
    return storedIds;
  } catch (error) {
    console.error('[Analytics DataStore] Failed to store multiple events:', error);
    return storedIds;
  }
}

/**
 * Prepare a batch of events for sending if needed
 */
async function prepareBatchIfNeeded(): Promise<void> {
  if (!db) return;
  
  try {
    // Count pending events
    const pendingCount = await db.count('events');
    
    // Get existing pending batches
    const pendingBatches = await db.getAllFromIndex(
      'eventBatches', 
      'by-status', 
      'pending'
    );
    
    // If we already have pending batches or not enough events, skip
    if (pendingBatches.length > 0 || pendingCount < config.batchSize) {
      return;
    }
    
    // Get events to batch
    const events = await db.getAll('events', undefined, config.batchSize);
    
    // Create a new batch
    const batchId = uuidv4();
    const eventIds = events.map(e => e.id);
    
    await db.add('eventBatches', {
      batchId,
      events: eventIds,
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0
    });
    
    if (config.debug) {
      console.log(`[Analytics DataStore] Created batch ${batchId} with ${eventIds.length} events`);
    }
  } catch (error) {
    console.error('[Analytics DataStore] Failed to prepare batch:', error);
  }
}

/**
 * Synchronize events with the server
 */
async function syncEvents(): Promise<void> {
  if (!db || !initialized) return;
  
  try {
    // Get pending batches
    const pendingBatches = await db.getAllFromIndex(
      'eventBatches',
      'by-status',
      'pending'
    );
    
    // Process each batch
    for (const batch of pendingBatches) {
      // Mark batch as sending
      await db.put('eventBatches', {
        ...batch,
        status: 'sending'
      });
      
      // Get events for this batch
      const events: AnalyticsEvent[] = [];
      
      for (const eventId of batch.events) {
        const event = await db.get('events', eventId);
        if (event) events.push(event);
      }
      
      // Send events to API
      try {
        await sendEventsToAPI(events);
        
        // Mark batch as complete
        await db.put('eventBatches', {
          ...batch,
          status: 'complete',
          sentAt: Date.now()
        });
        
        // Remove events that were successfully sent
        const tx = db.transaction('events', 'readwrite');
        for (const eventId of batch.events) {
          await tx.store.delete(eventId);
        }
        await tx.done;
        
        if (config.debug) {
          console.log(`[Analytics DataStore] Successfully synced batch ${batch.batchId}`);
        }
      } catch (error) {
        // Mark batch as failed if exceeded max retries
        if (batch.attempts >= config.maxRetries) {
          await db.put('eventBatches', {
            ...batch,
            status: 'failed'
          });
          
          console.error(`[Analytics DataStore] Batch ${batch.batchId} failed after ${config.maxRetries} retries`);
        } else {
          // Increment retry count
          await db.put('eventBatches', {
            ...batch,
            status: 'pending',
            attempts: batch.attempts + 1
          });
          
          console.warn(`[Analytics DataStore] Batch ${batch.batchId} sync failed, will retry (${batch.attempts + 1}/${config.maxRetries})`);
        }
      }
    }
  } catch (error) {
    console.error('[Analytics DataStore] Sync process failed:', error);
  }
}

/**
 * Send events to the API endpoint
 */
async function sendEventsToAPI(events: AnalyticsEvent[]): Promise<boolean> {
  if (!events.length || !config.apiEndpoint) return true;
  
  try {
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        batchId: uuidv4(),
        timestamp: Date.now(),
        count: events.length,
        events
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('[Analytics DataStore] API submission failed:', error);
    
    // If running in development, we'll still consider it a success
    // to avoid blocking the flow when API endpoints aren't available
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Analytics DataStore] Running in development mode - treating API failure as success');
      return true;
    }
    
    throw error;
  }
}

/**
 * Clean up old data based on retention policy
 */
async function cleanupOldData(): Promise<void> {
  if (!db) return;
  
  try {
    const cutoffTime = Date.now() - (config.retentionDays * 24 * 60 * 60 * 1000);
    
    // Find old completed batches
    const oldBatches = await db.getAllFromIndex(
      'eventBatches',
      'by-status',
      'complete'
    );
    
    const batchesToDelete = oldBatches.filter((b: { sentAt?: number }) => b.sentAt && b.sentAt < cutoffTime);
    
    // Delete old batches
    const tx = db.transaction('eventBatches', 'readwrite');
    for (const batch of batchesToDelete) {
      await tx.store.delete(batch.batchId);
    }
    await tx.done;
    
    if (config.debug && batchesToDelete.length > 0) {
      console.log(`[Analytics DataStore] Cleaned up ${batchesToDelete.length} old batches`);
    }
  } catch (error) {
    console.error('[Analytics DataStore] Cleanup process failed:', error);
  }
}

/**
 * Update aggregated data for real-time dashboard
 */
export async function updateAggregateData<T>(
  aggregateId: string,
  aggregateType: string,
  updateFn: (currentData: T | null) => T
): Promise<boolean> {
  if (!db) return false;
  
  try {
    // Get current aggregate data
    const currentAggregate = await db.get('aggregates', aggregateId);
    const currentData = currentAggregate?.data as T || null;
    
    // Apply update function
    const newData = updateFn(currentData);
    
    // Store updated aggregate
    await db.put('aggregates', {
      id: aggregateId,
      type: aggregateType,
      data: newData,
      lastUpdated: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('[Analytics DataStore] Aggregate update failed:', error);
    return false;
  }
}

/**
 * Get aggregated data
 */
export async function getAggregateData<T>(
  aggregateId: string
): Promise<T | null> {
  if (!db) return null;
  
  try {
    const aggregate = await db.get('aggregates', aggregateId);
    return aggregate?.data as T || null;
  } catch (error) {
    console.error('[Analytics DataStore] Failed to get aggregate data:', error);
    return null;
  }
}

/**
 * Force synchronization of all pending events
 */
export async function forceSync(): Promise<boolean> {
  if (!db) return false;
  
  try {
    await syncEvents();
    return true;
  } catch (error) {
    console.error('[Analytics DataStore] Force sync failed:', error);
    return false;
  }
}

/**
 * Close the data store connection
 */
export function closeDataStore(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  
  if (db) {
    db.close();
    db = null;
  }
  
  initialized = false;
  
  if (config.debug) {
    console.log('[Analytics DataStore] Connection closed');
  }
}

// Initialize on load if in browser environment
if (typeof window !== 'undefined') {
  // We'll initialize when needed rather than automatically
  // to give applications control over timing and configuration
} 