/**
 * Dashboard Context
 * 
 * Provides shared state management across the dashboard components,
 * including date ranges, filters, selection state, and data loading.
 */
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  getDashboardMetrics, 
  DashboardMetricsResponse, 
  DashboardDataRequest 
} from '../../services/dashboardData';
import { getCompanyById } from '../../data/pharmaCategories';

// Dashboard context state interface
export interface DashboardContextState {
  // Date range for all analytics
  dateRange: [Date, Date];
  // Loading states
  isLoading: boolean;
  // Error state
  error: Error | null;
  // Selected company ID
  selectedCompanyId: string | null;
  // Set company ID
  setSelectedCompanyId: (id: string | null) => void;
  // Companies for comparison
  companyIds: string[];
  // Set companies for comparison
  setCompanyIds: (ids: string[]) => void;
  // Dashboard metrics data
  metricsData: Record<string, DashboardMetricsResponse>;
  // Selected category filter
  selectedCategory: string | null;
  // Set category filter
  setSelectedCategory: (category: string | null) => void;
  // Refresh data
  refreshData: (params?: Partial<DashboardDataRequest>) => Promise<void>;
  // Date range setter
  setDateRange: (range: [Date, Date]) => void;
}

// Create context with default values
const DashboardContext = createContext<DashboardContextState>({
  dateRange: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
  isLoading: false,
  error: null,
  selectedCompanyId: null,
  setSelectedCompanyId: () => {},
  companyIds: [],
  setCompanyIds: () => {},
  metricsData: {},
  selectedCategory: null,
  setSelectedCategory: () => {},
  refreshData: async () => {},
  setDateRange: () => {}
});

// Props for the provider component
interface DashboardProviderProps {
  children: ReactNode;
  dateRange?: [Date, Date];
  selectedCompanyId?: string | null;
  companyIds?: string[];
}

// Dashboard context provider component
export const DashboardProvider: React.FC<DashboardProviderProps> = ({ 
  children,
  dateRange: initialDateRange,
  selectedCompanyId: initialCompanyId = null,
  companyIds: initialCompanyIds = []
}) => {
  // Initialize state
  const [dateRange, setDateRangeState] = useState<[Date, Date]>(
    initialDateRange || [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string | null>(initialCompanyId);
  const [companyIds, setCompanyIdsState] = useState<string[]>(initialCompanyIds);
  const [metricsData, setMetricsData] = useState<Record<string, DashboardMetricsResponse>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Set company ID and update filtered metrics
  const setSelectedCompanyId = (id: string | null) => {
    setSelectedCompanyIdState(id);
    
    // If company is selected, initialize with default category
    if (id) {
      const company = getCompanyById(id);
      if (company && company.priorityCategories.length > 0) {
        setSelectedCategory(company.priorityCategories[0]);
      }
    }
  };
  
  // Set date range
  const setDateRange = (range: [Date, Date]) => {
    setDateRangeState(range);
    
    // Force refresh data with new date range
    refreshData({ dateRange: range });
  };
  
  // Set companies for comparison
  const setCompanyIds = (ids: string[]) => {
    setCompanyIdsState(ids);
    
    // Fetch metrics for each company in the comparison set
    ids.forEach(id => {
      if (!metricsData[id]) {
        fetchMetricsForCompany(id);
      }
    });
  };
  
  // Fetch metrics for a specific company
  const fetchMetricsForCompany = async (companyId: string) => {
    try {
      const params: DashboardDataRequest = {
        dateRange,
        companyId,
        category: selectedCategory || undefined
      };
      
      const metrics = await getDashboardMetrics(params);
      
      setMetricsData(prev => ({
        ...prev,
        [companyId]: metrics
      }));
    } catch (err) {
      console.error(`Error fetching metrics for company ${companyId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };
  
  // Refresh all dashboard data
  const refreshData = async (params?: Partial<DashboardDataRequest>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build complete request params
      const requestParams: DashboardDataRequest = {
        dateRange: params?.dateRange || dateRange,
        companyId: params?.companyId || selectedCompanyId,
        category: params?.category || selectedCategory || undefined
      };
      
      // If we have a selected company, fetch its metrics
      if (selectedCompanyId) {
        const metrics = await getDashboardMetrics({
          ...requestParams,
          companyId: selectedCompanyId
        });
        
        setMetricsData(prev => ({
          ...prev,
          [selectedCompanyId]: metrics
        }));
      }
      
      // If we're in comparison mode, fetch metrics for all companies
      if (companyIds.length > 0) {
        await Promise.all(
          companyIds.map(async companyId => {
            const metrics = await getDashboardMetrics({
              ...requestParams,
              companyId
            });
            
            setMetricsData(prev => ({
              ...prev,
              [companyId]: metrics
            }));
          })
        );
      }
      
      // If no company is selected, fetch aggregate metrics
      if (!selectedCompanyId && companyIds.length === 0) {
        const metrics = await getDashboardMetrics({
          ...requestParams,
          companyId: null
        });
        
        setMetricsData(prev => ({
          ...prev,
          aggregate: metrics
        }));
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data load when parameters change
  useEffect(() => {
    if (selectedCompanyId) {
      refreshData();
    } else if (companyIds.length > 0) {
      // Load data for comparison mode
      refreshData();
    } else {
      // Load aggregate data
      refreshData();
    }
  }, [selectedCompanyId, JSON.stringify(companyIds), selectedCategory]);
  
  // Create context value
  const contextValue: DashboardContextState = {
    dateRange,
    isLoading,
    error,
    selectedCompanyId,
    setSelectedCompanyId,
    companyIds,
    setCompanyIds,
    metricsData,
    selectedCategory,
    setSelectedCategory,
    refreshData,
    setDateRange
  };
  
  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Custom hook to use the dashboard context
export const useDashboard = () => useContext(DashboardContext); 