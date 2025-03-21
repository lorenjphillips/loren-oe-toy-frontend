/**
 * Analytics Store
 * 
 * In-memory store for analytics events during the user session.
 * Provides functionality for storing events and periodically syncing them to a backend.
 */

import axios from 'axios';
import { AnalyticsEvent, AnalyticsOptions } from '../services/analytics';

/**
 * Configuration for the analytics store
 */
export interface AnalyticsStoreConfig {
  endpoint: string;              // Backend endpoint for sending events
  batchSize: number;             // Number of events to batch before sending
  sendIntervalMs: number;        // How often to send events (ms)
  maxRetries: number;            // Maximum number of retries for failed sends
  retryDelayMs: number;          // Delay between retries in milliseconds
  maxStoredEvents: number;       // Maximum number of events to store in memory
  persistToLocalStorage: boolean; // Whether to persist events to localStorage
}

// Default configuration
const DEFAULT_CONFIG: AnalyticsStoreConfig = {
  endpoint: '/api/analytics/events',
  batchSize: 10,
  sendIntervalMs: 30000, // 30 seconds
  maxRetries: 3,
  retryDelayMs: 5000, // 5 seconds
  maxStoredEvents: 500,
  persistToLocalStorage: true
};

// Current configuration
let storeConfig: AnalyticsStoreConfig = { ...DEFAULT_CONFIG };

// In-memory event storage
let eventQueue: AnalyticsEvent[] = [];
let sendingInProgress = false;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let retryCount = 0;

/**
 * Configure the analytics store
 */
export function configureStore(config: Partial<AnalyticsStoreConfig>): void {
  storeConfig = {
    ...storeConfig,
    ...config
  };
  
  // Restart sync timer if interval changed
  if (syncInterval && config.sendIntervalMs) {
    startBackgroundSync();
  }
}

/**
 * Initialize the analytics store
 */
export function initStore(config?: Partial<AnalyticsStoreConfig>): void {
  // Apply configuration if provided
  if (config) {
    configureStore(config);
  }
  
  // Restore events from localStorage if enabled
  if (storeConfig.persistToLocalStorage && typeof window !== 'undefined') {
    const storedEvents = localStorage.getItem('analytics_events');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents) as AnalyticsEvent[];
        eventQueue = parsedEvents.slice(0, storeConfig.maxStoredEvents);
      } catch (error) {
        console.error('Failed to parse stored analytics events:', error);
        localStorage.removeItem('analytics_events');
      }
    }
  }
  
  // Start background sync
  startBackgroundSync();
  
  // Add event listeners for page visibility changes
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', syncEventsImmediately);
  }
}

/**
 * Cleanup the analytics store
 */
export function cleanupStore(): void {
  // Stop background sync
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  // Remove event listeners
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', syncEventsImmediately);
  }
}

/**
 * Add an event to the store
 */
export function addEvent(event: AnalyticsEvent): void {
  // Add event to queue
  eventQueue.push(event);
  
  // Trim queue if it exceeds maximum size
  if (eventQueue.length > storeConfig.maxStoredEvents) {
    eventQueue = eventQueue.slice(-storeConfig.maxStoredEvents);
  }
  
  // Persist to localStorage if enabled
  if (storeConfig.persistToLocalStorage && typeof window !== 'undefined') {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(eventQueue));
    } catch (error) {
      console.error('Failed to store analytics events in localStorage:', error);
    }
  }
  
  // Trigger sync if batch size reached
  if (eventQueue.length >= storeConfig.batchSize && !sendingInProgress) {
    syncEvents();
  }
}

/**
 * Start the background sync process
 */
export function startBackgroundSync(): void {
  // Clear existing interval if any
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  // Start new interval
  syncInterval = setInterval(() => {
    if (eventQueue.length > 0 && !sendingInProgress) {
      syncEvents();
    }
  }, storeConfig.sendIntervalMs);
}

/**
 * Handle document visibility changes
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden' && eventQueue.length > 0) {
    // Try to sync events when page is hidden (user navigating away)
    syncEventsImmediately();
  } else if (document.visibilityState === 'visible' && !syncInterval) {
    // Restart sync when page becomes visible again
    startBackgroundSync();
  }
}

/**
 * Sync events to the backend
 */
export function syncEvents(): Promise<void> {
  if (sendingInProgress || eventQueue.length === 0) {
    return Promise.resolve();
  }
  
  sendingInProgress = true;
  
  // Take batch of events
  const batch = eventQueue.slice(0, storeConfig.batchSize);
  
  // Send to backend
  return axios.post(storeConfig.endpoint, { events: batch })
    .then(() => {
      // Remove synced events from queue
      eventQueue = eventQueue.slice(batch.length);
      
      // Persist updated queue
      if (storeConfig.persistToLocalStorage && typeof window !== 'undefined') {
        try {
          localStorage.setItem('analytics_events', JSON.stringify(eventQueue));
        } catch (error) {
          console.error('Failed to update stored analytics events:', error);
        }
      }
      
      // Reset retry count on success
      retryCount = 0;
      sendingInProgress = false;
    })
    .catch(error => {
      console.error('Failed to sync analytics events:', error);
      
      // Retry if not reached max retries
      if (retryCount < storeConfig.maxRetries) {
        retryCount++;
        sendingInProgress = false;
        
        // Schedule retry with delay
        setTimeout(() => {
          if (eventQueue.length > 0) {
            syncEvents();
          }
        }, storeConfig.retryDelayMs);
      } else {
        // Max retries reached, give up on this batch
        console.warn(`Failed to sync analytics events after ${storeConfig.maxRetries} retries. Discarding events.`);
        eventQueue = eventQueue.slice(batch.length);
        retryCount = 0;
        sendingInProgress = false;
      }
    });
}

/**
 * Force immediate sync, used when page is unloading
 */
function syncEventsImmediately(): void {
  if (eventQueue.length === 0) {
    return;
  }
  
  // Use sendBeacon for more reliable delivery during page unload if available
  if (navigator.sendBeacon) {
    try {
      const batch = eventQueue.slice(0, storeConfig.batchSize);
      const success = navigator.sendBeacon(
        storeConfig.endpoint,
        JSON.stringify({ events: batch })
      );
      
      if (success) {
        // Remove synced events from queue
        eventQueue = eventQueue.slice(batch.length);
        
        // Persist remaining events
        if (storeConfig.persistToLocalStorage && typeof window !== 'undefined') {
          try {
            localStorage.setItem('analytics_events', JSON.stringify(eventQueue));
          } catch (error) {
            // Ignore localStorage errors during unload
          }
        }
      }
    } catch (error) {
      console.error('Failed to send analytics events with sendBeacon:', error);
    }
  } else {
    // Fall back to synchronous XHR as a last resort
    syncEvents();
  }
}

/**
 * Get the current event queue (for debugging)
 */
export function getEventQueue(): AnalyticsEvent[] {
  return [...eventQueue];
}

/**
 * Clear all stored events
 */
export function clearEvents(): void {
  eventQueue = [];
  
  if (storeConfig.persistToLocalStorage && typeof window !== 'undefined') {
    localStorage.removeItem('analytics_events');
  }
}

// Export all functions and initialize store
export default {
  initStore,
  configureStore,
  addEvent,
  syncEvents,
  getEventQueue,
  clearEvents,
  cleanupStore
}; 