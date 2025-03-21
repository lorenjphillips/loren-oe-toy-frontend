/**
 * ComparisonTable Component
 * 
 * Objectively compares treatment options side by side,
 * highlighting differences in efficacy, safety, cost, and other factors.
 */

'use client';

import React, { useState } from 'react';
import { EducationalContent } from '../../models/microsimulation';

interface ComparisonCategory {
  id: string;
  name: string;
  description?: string;
  importance?: 'high' | 'medium' | 'low';
}

interface ComparisonMetric {
  categoryId: string;
  label: string;
  type: 'numeric' | 'rating' | 'text' | 'boolean';
  description?: string;
  ratingScale?: number; // For rating type, usually 1-5
  unit?: string; // For numeric type
  sortDirection?: 'asc' | 'desc'; // Preferred direction for comparison (higher or lower is better)
}

interface TreatmentComparison {
  treatmentId: string;
  treatmentName: string;
  companyName?: string;
  metrics: {
    [metricKey: string]: {
      value: number | string | boolean;
      description?: string;
      highlight?: boolean; // Whether to highlight this as a strength
      citation?: string;
    };
  };
}

interface ComparisonTableProps {
  title: string;
  description?: string;
  categories: ComparisonCategory[];
  metrics: ComparisonMetric[];
  treatments: TreatmentComparison[];
  educationalContent?: EducationalContent;
  showCitations?: boolean;
  highlightDifferences?: boolean;
  onCitationClick?: (citation: string) => void;
  className?: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  title,
  description,
  categories,
  metrics,
  treatments,
  educationalContent,
  showCitations = false,
  highlightDifferences = true,
  onCitationClick,
  className = '',
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, category) => ({ ...acc, [category.id]: true }), {})
  );
  const [sortedBy, setSortedBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Function to handle category expansion toggle
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // Function to handle sorting by metric
  const handleSort = (metricId: string) => {
    if (sortedBy === metricId) {
      // Toggle sort order if already sorting by this metric
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort metric and default order based on metric's preferred direction
      const metric = metrics.find(m => m.label === metricId);
      setSortedBy(metricId);
      setSortOrder(metric?.sortDirection || 'asc');
    }
  };
  
  // Function to render metric value with proper formatting
  const renderMetricValue = (treatment: TreatmentComparison, metric: ComparisonMetric) => {
    const metricData = treatment.metrics[metric.label];
    if (!metricData) return 'N/A';
    
    const value = metricData.value;
    
    // Format based on metric type
    switch (metric.type) {
      case 'numeric':
        return `${value}${metric.unit ? ` ${metric.unit}` : ''}`;
      
      case 'rating':
        if (typeof value === 'number') {
          return (
            <div className="flex items-center">
              {[...Array(metric.ratingScale || 5)].map((_, i) => (
                <svg 
                  key={i}
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 ${i < value ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          );
        }
        return value;
      
      case 'boolean':
        return (
          <span className={`inline-flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
            {value ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Yes
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No
              </>
            )}
          </span>
        );
      
      default:
        return value;
    }
  };
  
  // Helper function to determine if a cell should be highlighted
  const shouldHighlight = (treatment: TreatmentComparison, metric: ComparisonMetric) => {
    if (!highlightDifferences) return false;
    
    const metricData = treatment.metrics[metric.label];
    if (!metricData || !metricData.highlight) return false;
    
    return true;
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-green-50 px-6 py-4 border-b border-green-100">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-gray-600">{description}</p>
        )}
      </div>
      
      {/* Comparison Table */}
      <div className="px-6 py-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Category / Metric
              </th>
              {treatments.map((treatment, index) => (
                <th key={treatment.treatmentId} scope="col" className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {treatment.treatmentName}
                  {treatment.companyName && (
                    <span className="block text-xs font-normal mt-1 text-gray-400">
                      {treatment.companyName}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Render by category */}
            {categories.map(category => (
              <React.Fragment key={category.id}>
                {/* Category Row */}
                <tr className="bg-gray-50">
                  <td 
                    colSpan={treatments.length + 1} 
                    className="px-4 py-3"
                  >
                    <button 
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between text-left font-medium text-gray-700"
                    >
                      <span className="flex items-center">
                        {category.importance && (
                          <span 
                            className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              category.importance === 'high' ? 'bg-red-500' : 
                              category.importance === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                          />
                        )}
                        {category.name}
                      </span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-5 w-5 transform ${expandedCategories[category.id] ? 'rotate-180' : ''} transition-transform duration-200`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {category.description && (
                      <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                    )}
                  </td>
                </tr>
                
                {/* Metrics for this category */}
                {expandedCategories[category.id] && 
                  metrics
                    .filter(metric => metric.categoryId === category.id)
                    .map(metric => (
                      <tr key={metric.label} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="font-medium">{metric.label}</div>
                          {metric.description && (
                            <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                          )}
                        </td>
                        
                        {/* Treatment values for this metric */}
                        {treatments.map(treatment => {
                          const metricData = treatment.metrics[metric.label];
                          const isHighlighted = shouldHighlight(treatment, metric);
                          
                          return (
                            <td 
                              key={`${treatment.treatmentId}-${metric.label}`} 
                              className={`px-4 py-3 text-sm text-center ${
                                isHighlighted ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className={isHighlighted ? 'font-medium' : ''}>
                                {renderMetricValue(treatment, metric)}
                              </div>
                              
                              {metricData?.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {metricData.description}
                                </div>
                              )}
                              
                              {showCitations && metricData?.citation && (
                                <div className="text-xs text-gray-400 mt-1 italic">
                                  <span
                                    className={onCitationClick ? "cursor-pointer text-blue-600 hover:underline" : ""}
                                    onClick={() => onCitationClick && onCitationClick(metricData.citation || '')}
                                  >
                                    [{metricData.citation}]
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                }
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Educational content or disclaimer */}
      {educationalContent && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-medium text-gray-700">Additional Information:</h4>
          <p className="mt-2 text-gray-700">{educationalContent.content}</p>
          {educationalContent.source && (
            <p className="mt-2 text-xs text-gray-500 italic">Source: {educationalContent.source}</p>
          )}
        </div>
      )}
      
      {/* Legend for highlights if applicable */}
      {highlightDifferences && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
          <span className="inline-block px-2 py-1 bg-green-50 rounded mr-2">Highlighted cells</span>
          indicate notable advantages for that treatment.
        </div>
      )}
    </div>
  );
};

export default ComparisonTable; 