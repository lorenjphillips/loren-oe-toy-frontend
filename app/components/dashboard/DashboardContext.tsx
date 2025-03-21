/**
 * Dashboard Context
 * 
 * Provides shared context for all dashboard components,
 * including date ranges and other global settings.
 */
import React from 'react';

// Default date range is the last 2 years
const defaultDateRange: [Date, Date] = [
  new Date(new Date().getFullYear() - 2, 0, 1), // Jan 1, 2 years ago
  new Date() // Current date
];

// Dashboard context type
interface DashboardContextType {
  dateRange: [Date, Date];
}

// Create context with default values
export const DashboardContext = React.createContext<DashboardContextType>({
  dateRange: defaultDateRange
}); 