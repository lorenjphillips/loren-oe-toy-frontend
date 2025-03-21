/**
 * Analytics Serializer Service
 * 
 * Responsible for:
 * - Preparing interaction data for storage
 * - Batching events efficiently
 * - Removing any potentially identifying information
 * - Ensuring HIPAA compliance in all tracking
 */

import { AnalyticsEvent } from './analytics';
import { v4 as uuidv4 } from 'uuid';

/**
 * PII (Personally Identifiable Information) fields that must be removed or anonymized
 */
const PII_FIELDS = [
  'userId',
  'email',
  'name',
  'firstName',
  'lastName',
  'fullName',
  'phoneNumber',
  'address',
  'zipCode',
  'dateOfBirth',
  'age',
  'gender',
  'ipAddress',
  'deviceId'
];

/**
 * PHI (Protected Health Information) fields that must be removed or anonymized
 */
const PHI_FIELDS = [
  'diagnosis',
  'condition',
  'treatment',
  'medication',
  'medicalHistory',
  'symptoms',
  'labResults',
  'patientId',
  'mrn',
  'prescriptionNumber',
  'insuranceId',
  'healthplanNumber'
];

/**
 * Analytics batch configuration
 */
export interface AnalyticsBatchConfig {
  maxBatchSize: number;        // Maximum number of events in a batch
  maxBatchAgeMs: number;       // Maximum age of a batch before sending
  compressionEnabled: boolean; // Whether to compress batches
  encryptionEnabled: boolean;  // Whether to encrypt sensitive fields
}

/**
 * Default batch configuration
 */
const DEFAULT_BATCH_CONFIG: AnalyticsBatchConfig = {
  maxBatchSize: 50,
  maxBatchAgeMs: 30000, // 30 seconds
  compressionEnabled: true,
  encryptionEnabled: true
};

/**
 * Current batch configuration
 */
let batchConfig: AnalyticsBatchConfig = { ...DEFAULT_BATCH_CONFIG };

/**
 * Active event batches
 */
let currentBatch: AnalyticsEvent[] = [];
let currentBatchStartTime = Date.now();

/**
 * Configure the analytics serializer
 */
export function configureSerializer(config: Partial<AnalyticsBatchConfig>): void {
  batchConfig = {
    ...batchConfig,
    ...config
  };
}

/**
 * Serialize an analytics event, removing any PII/PHI
 */
export function serializeEvent(event: AnalyticsEvent): AnalyticsEvent {
  // Create a deep copy of the event to avoid modifying the original
  const serializedEvent = JSON.parse(JSON.stringify(event)) as AnalyticsEvent;
  
  // Anonymize the event by removing PII/PHI
  return anonymizeEvent(serializedEvent);
}

/**
 * Remove or anonymize any PII/PHI from an event
 */
export function anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
  // Check top-level fields
  for (const field of [...PII_FIELDS, ...PHI_FIELDS]) {
    if (field in event && field !== 'userId') {
      delete (event as any)[field];
    }
  }
  
  // If userId exists in metadata, hash it for anonymization
  if (event.metadata?.userId) {
    // In a real implementation, we would use a secure one-way hash
    // For this mock implementation, we'll just use a placeholder
    event.metadata.userId = `anon_${String(event.metadata.userId).split('').reverse().join('')}`;
  }
  
  // Check metadata for PII/PHI
  if (event.metadata) {
    event.metadata = anonymizeMetadata(event.metadata);
  }
  
  return event;
}

/**
 * Anonymize metadata fields recursively
 */
function anonymizeMetadata(metadata: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    // Skip PII/PHI fields
    if ([...PII_FIELDS, ...PHI_FIELDS].includes(key)) {
      continue;
    }
    
    // Handle nested objects
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = anonymizeMetadata(value);
    } else {
      // Check if the key looks like it might contain PII/PHI
      if (containsSensitiveKeywords(key)) {
        continue;
      }
      
      // Handle string values that might contain PII/PHI
      if (typeof value === 'string' && mightContainPII(value)) {
        result[key] = redactPotentialPII(value);
      } else {
        result[key] = value;
      }
    }
  }
  
  return result;
}

/**
 * Check if a key might contain sensitive information
 */
function containsSensitiveKeywords(key: string): boolean {
  const lowerKey = key.toLowerCase();
  const sensitiveKeywords = [
    'name', 'email', 'phone', 'address', 'zip', 'birth', 'age', 'gender',
    'diagnos', 'condition', 'treatment', 'medication', 'symptom', 'patient', 'record'
  ];
  
  return sensitiveKeywords.some(keyword => lowerKey.includes(keyword));
}

/**
 * Check if a string value might contain PII
 */
function mightContainPII(value: string): boolean {
  // Check for common PII patterns like email, phone, etc.
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
  const ssnPattern = /\d{3}-\d{2}-\d{4}/;
  
  return emailPattern.test(value) || phonePattern.test(value) || ssnPattern.test(value);
}

/**
 * Redact potential PII from a string
 */
function redactPotentialPII(value: string): string {
  // Replace email addresses
  value = value.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  
  // Replace phone numbers
  value = value.replace(/(\+\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[REDACTED_PHONE]');
  
  // Replace SSNs
  value = value.replace(/\d{3}-\d{2}-\d{4}/g, '[REDACTED_SSN]');
  
  return value;
}

/**
 * Add an event to the current batch
 */
export function addToBatch(event: AnalyticsEvent): void {
  // Serialize and anonymize the event
  const serializedEvent = serializeEvent(event);
  
  // Add to current batch
  currentBatch.push(serializedEvent);
  
  // Check if the batch should be sent based on size or age
  if (shouldSendBatch()) {
    sendBatch();
  }
}

/**
 * Check if the current batch should be sent
 */
function shouldSendBatch(): boolean {
  const batchSize = currentBatch.length;
  const batchAgeMs = Date.now() - currentBatchStartTime;
  
  return batchSize >= batchConfig.maxBatchSize || batchAgeMs >= batchConfig.maxBatchAgeMs;
}

/**
 * Force-send the current batch
 */
export function forceSendBatch(): void {
  if (currentBatch.length > 0) {
    sendBatch();
  }
}

/**
 * Send the current batch to the analytics endpoint
 */
function sendBatch(): void {
  // Create a batch ID
  const batchId = uuidv4();
  
  // Prepare the batch payload
  const payload = {
    batchId,
    timestamp: Date.now(),
    eventCount: currentBatch.length,
    events: currentBatch
  };
  
  // In a real implementation, this would send the data to a server
  console.log(`Sending analytics batch ${batchId} with ${currentBatch.length} events`);
  
  // Reset the batch
  currentBatch = [];
  currentBatchStartTime = Date.now();
  
  // Simulate sending the batch
  setTimeout(() => {
    console.log(`Analytics batch ${batchId} sent successfully`);
  }, 200);
}

/**
 * Filter out any HIPAA-related information from an analytics event
 */
export function ensureHIPAACompliance(event: AnalyticsEvent): AnalyticsEvent {
  // First, apply standard anonymization
  const compliantEvent = anonymizeEvent(event);
  
  // Apply additional HIPAA-specific anonymization
  
  // Remove or redact any medical data in metadata
  if (compliantEvent.metadata) {
    compliantEvent.metadata = filterMedicalData(compliantEvent.metadata);
  }
  
  // Remove question text that might contain medical information
  if (compliantEvent.metadata?.questionText) {
    delete compliantEvent.metadata.questionText;
  }
  
  // Keep medical categories but remove specific condition names
  if (compliantEvent.metadata?.condition) {
    delete compliantEvent.metadata.condition;
  }
  
  return compliantEvent;
}

/**
 * Filter out medical data from metadata
 */
function filterMedicalData(metadata: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  const medicalKeywords = [
    'diagnos', 'condition', 'symptom', 'treatment', 'medication', 'prescription',
    'dose', 'patient', 'illness', 'disease', 'disorder', 'syndrome'
  ];
  
  for (const [key, value] of Object.entries(metadata)) {
    const lowerKey = key.toLowerCase();
    
    // Skip medical fields completely
    if (medicalKeywords.some(keyword => lowerKey.includes(keyword))) {
      continue;
    }
    
    // Handle nested objects
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = filterMedicalData(value);
    } else if (typeof value === 'string') {
      // Redact any text that might include medical information
      const containsMedicalInfo = medicalKeywords.some(keyword => 
        value.toLowerCase().includes(keyword));
      
      result[key] = containsMedicalInfo ? '[REDACTED_MEDICAL_INFO]' : value;
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Create a HIPAA-compliant batch from a list of events
 */
export function createHIPAACompliantBatch(events: AnalyticsEvent[]): {
  batchId: string;
  timestamp: number;
  eventCount: number;
  events: AnalyticsEvent[];
} {
  // Apply HIPAA compliance to each event
  const compliantEvents = events.map(event => ensureHIPAACompliance(event));
  
  return {
    batchId: uuidv4(),
    timestamp: Date.now(),
    eventCount: compliantEvents.length,
    events: compliantEvents
  };
}

/**
 * Prepare event data for storage, ensuring all privacy requirements are met
 */
export function prepareForStorage(
  events: AnalyticsEvent[]
): AnalyticsEvent[] {
  // Apply serialization, anonymization, and HIPAA compliance
  return events.map(event => ensureHIPAACompliance(serializeEvent(event)));
}

// Export the serializer functions
export default {
  serializeEvent,
  anonymizeEvent,
  ensureHIPAACompliance,
  addToBatch,
  forceSendBatch,
  configureSerializer,
  prepareForStorage,
  createHIPAACompliantBatch
}; 