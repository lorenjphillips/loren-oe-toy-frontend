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
import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsEvent, anonymizeEvent } from '../../models/analytics/AnalyticsEvent';

// Type for our database
type AnalyticsDB = any;

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
    upgrade(db) {
      // Create object stores on first use
      if (!db.objectStoreNames.contains('events')) {
        const eventStore = db.createObjectStore('events', { keyPath: 'id' });
        // Using any to bypass type checking for createIndex which varies across idb versions
        (eventStore as any).createIndex('by-time', 'context.timestamp');
        (eventStore as any).createIndex('by-type', 'eventType');
      }
      
      if (!db.objectStoreNames.contains('eventBatches')) {
        const batchStore = db.createObjectStore('eventBatches', { keyPath: 'batchId' });
        // Using any to bypass type checking for createIndex which varies across idb versions
        (batchStore as any).createIndex('by-status', 'status');
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
      events: eventIds, // Store event IDs, not the events themselves
      status: 'pending',
      createdAt: Date.now(),
      attempts: 0
    });
    
    console.log(`[Analytics DataStore] Created new batch ${batchId} with ${eventIds.length} events`);
  } catch (error) {
    console.error('[Analytics DataStore] Failed to prepare event batch:', error);
  }
}

/**
 * Sync events to the API
 */
async function syncEvents(): Promise<void> {
  if (!db || !config.apiEndpoint) return;
  
  try {
    // Get pending batches
    const pendingBatches = await db.getAllFromIndex('eventBatches', 'by-status', 'pending');
    if (!pendingBatches.length) return;
    
    console.log(`[Analytics DataStore] Processing ${pendingBatches.length} pending batches`);
    
    // Process each batch
    for (const batch of pendingBatches) {
      // Update batch status
      await db.put('eventBatches', {
        ...batch,
        status: 'sending',
        attempts: batch.attempts + 1
      });
      
      // Fetch the actual events from their IDs
      const events: AnalyticsEvent[] = [];
      for (const eventId of batch.events) {
        const event = await db.get('events', eventId);
        if (event) {
          events.push(event);
        }
      }
      
      const success = await sendEventsToAPI(events);
      
      if (success) {
        // Update batch status
        await db.put('eventBatches', {
          ...batch,
          status: 'complete',
          sentAt: Date.now()
        });
        
        // Delete the events from storage
        const tx = db.transaction('events', 'readwrite');
        for (const eventId of batch.events) {
          await tx.store.delete(eventId);
        }
        await tx.done;
        
        console.log(`[Analytics DataStore] Successfully synced batch ${batch.batchId}`);
      } else {
        // Mark batch as failed if exceeded max retries
        // Use a definite value for maxRetries to avoid TypeScript errors
        const maxRetries = typeof config.maxRetries === 'number' ? config.maxRetries : DEFAULT_CONFIG.maxRetries;
        if (batch.attempts >= maxRetries) {
          await db.put('eventBatches', {
            ...batch,
            status: 'failed'
          });
          console.error(`[Analytics DataStore] Batch ${batch.batchId} failed after ${batch.attempts} attempts`);
        } else {
          // Revert status to pending for retry
          await db.put('eventBatches', {
            ...batch,
            status: 'pending'
          });
          console.warn(`[Analytics DataStore] Will retry batch ${batch.batchId} (attempt ${batch.attempts})`);
        }
      }
    }
  } catch (error) {
    console.error('[Analytics DataStore] Failed to sync events:', error);
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
        events,
        clientTimestamp: Date.now()
      }),
      keepalive: true // Allow request to complete even if page is closed
    });
    
    if (!response.ok) {
      console.error(`[Analytics DataStore] API returned status ${response.status}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[Analytics DataStore] Failed to send events to API:', error);
    return false;
  }
}

/**
 * Clean up old data based on retention policy
 */
async function cleanupOldData(): Promise<void> {
  if (!db) return;
  
  try {
    // Delete completed batches older than retention period
    const completedBatches = await db.getAllFromIndex('eventBatches', 'by-status', 'complete');
    
    const cutoffTime = Date.now() - (config.retentionDays * 86400000);
    const batchesToDelete = completedBatches.filter(b => b.sentAt && b.sentAt < cutoffTime);
    
    if (batchesToDelete.length) {
      console.log(`[Analytics DataStore] Cleaning up ${batchesToDelete.length} old batches`);
      
      const tx = db.transaction('eventBatches', 'readwrite');
      for (const batch of batchesToDelete) {
        await tx.store.delete(batch.batchId);
      }
      await tx.done;
    }
  } catch (error) {
    console.error('[Analytics DataStore] Failed to clean up old data:', error);
  }
}

/**
 * Update aggregate data
 */
export async function updateAggregateData<T>(
  aggregateId: string,
  aggregateType: string,
  updateFn: (currentData: T | null) => T
): Promise<boolean> {
  if (!db) return false;
  
  try {
    // Get current data
    const current = await db.get('aggregates', aggregateId) as { data: T } | undefined;
    
    // Apply update function
    const newData = updateFn(current ? current.data : null);
    
    // Store updated data
    await db.put('aggregates', {
      id: aggregateId,
      type: aggregateType,
      data: newData,
      lastUpdated: Date.now()
    });
    
    return true;
  } catch (error) {
    console.error('[Analytics DataStore] Failed to update aggregate data:', error);
    return false;
  }
}

/**
 * Get aggregate data
 */
export async function getAggregateData<T>(
  aggregateId: string
): Promise<T | null> {
  if (!db) return null;
  
  try {
    const record = await db.get('aggregates', aggregateId) as { data: T } | undefined;
    return record ? record.data : null;
  } catch (error) {
    console.error('[Analytics DataStore] Failed to get aggregate data:', error);
    return null;
  }
}

/**
 * Force a synchronization of events
 */
export async function forceSync(): Promise<boolean> {
  if (!initialized || !config.apiEndpoint) {
    console.warn('[Analytics DataStore] Cannot force sync: not initialized or no API endpoint');
    return false;
  }
  
  try {
    await syncEvents();
    return true;
  } catch (error) {
    console.error('[Analytics DataStore] Force sync failed:', error);
    return false;
  }
}

/**
 * Close the data store
 */
export function closeDataStore(): void {
  if (syncIntervalId) {
    window.clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  
  if (db) {
    db.close();
    db = null;
  }
  
  initialized = false;
  console.log('[Analytics DataStore] Closed');
}

// Initialize on load if in browser environment
if (typeof window !== 'undefined') {
  // We'll initialize when needed rather than automatically
  // to give applications control over timing and configuration
} 