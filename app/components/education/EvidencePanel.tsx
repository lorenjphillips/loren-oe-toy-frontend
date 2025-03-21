/**
 * EvidencePanel Component
 * 
 * Presents clinical evidence supporting treatments in a structured format,
 * highlighting key metrics, statistical significance, and study design.
 */

'use client';

import React, { useState } from 'react';
import { EducationalContent } from '../../models/microsimulation';

interface ClinicalEvidence {
  studyName: string;
  sampleSize: number;
  design: string;
  primaryOutcome: string;
  results: string;
  pValue?: string;
  confidenceInterval?: string;
  year?: number;
  citation: string;
  referenceLink?: string;
  limitations?: string;
}

interface EvidencePanelProps {
  title: string;
  treatmentName?: string;
  evidence: ClinicalEvidence | ClinicalEvidence[];
  educationalContent?: EducationalContent;
  showFullDetails?: boolean;
  showFilterOptions?: boolean;
  onCitationClick?: (citation: string) => void;
  className?: string;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({
  title,
  treatmentName,
  evidence,
  educationalContent,
  showFullDetails = false,
  showFilterOptions = false,
  onCitationClick,
  className = '',
}) => {
  const [detailsVisible, setDetailsVisible] = useState(showFullDetails);
  const [selectedEvidence, setSelectedEvidence] = useState<ClinicalEvidence | null>(null);
  const [filterOption, setFilterOption] = useState<'all' | 'rct' | 'meta' | 'recent'>('all');
  
  // Handle single or multiple evidence objects
  const evidenceArray = Array.isArray(evidence) ? evidence : [evidence];
  
  // Filter evidence if multiple studies are provided
  const filteredEvidence = evidenceArray.filter(study => {
    if (filterOption === 'all') return true;
    if (filterOption === 'rct') return study.design.toLowerCase().includes('randomized') || study.design.toLowerCase().includes('rct');
    if (filterOption === 'meta') return study.design.toLowerCase().includes('meta-analysis') || study.design.toLowerCase().includes('systematic review');
    if (filterOption === 'recent') return study.year ? study.year >= (new Date().getFullYear() - 3) : true;
    return true;
  });

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible);
  };
  
  const handleCitationClick = (citation: string) => {
    if (onCitationClick) {
      onCitationClick(citation);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {title}
          {treatmentName && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1">
              {treatmentName}
            </span>
          )}
        </h3>
      </div>

      {/* Filter options */}
      {showFilterOptions && evidenceArray.length > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 font-medium mr-2 self-center">Filter by:</span>
          <button 
            onClick={() => setFilterOption('all')}
            className={`px-3 py-1 text-sm rounded-full ${
              filterOption === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All Evidence
          </button>
          <button 
            onClick={() => setFilterOption('rct')}
            className={`px-3 py-1 text-sm rounded-full ${
              filterOption === 'rct' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            RCTs Only
          </button>
          <button 
            onClick={() => setFilterOption('meta')}
            className={`px-3 py-1 text-sm rounded-full ${
              filterOption === 'meta' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Meta-analyses
          </button>
          <button 
            onClick={() => setFilterOption('recent')}
            className={`px-3 py-1 text-sm rounded-full ${
              filterOption === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Recent (≤3 years)
          </button>
        </div>
      )}

      <div className="px-6 py-4">
        {/* Evidence summary */}
        {filteredEvidence.map((item, index) => (
          <div key={index} className={`${index > 0 ? 'mt-6 pt-6 border-t border-gray-200' : ''}`}>
            <h4 className="font-semibold text-gray-800 text-lg">
              {item.studyName}
              {item.year && <span className="text-gray-600 font-normal ml-2">({item.year})</span>}
            </h4>
            
            {/* Study info bar */}
            <div className="flex flex-wrap gap-3 mt-2 text-sm">
              <div className="bg-gray-100 px-3 py-1.5 rounded-md">
                <span className="font-medium text-gray-700">Design:</span> {item.design}
              </div>
              <div className="bg-gray-100 px-3 py-1.5 rounded-md">
                <span className="font-medium text-gray-700">N=</span>{item.sampleSize}
              </div>
              {item.pValue && (
                <div className="bg-gray-100 px-3 py-1.5 rounded-md">
                  <span className="font-medium text-gray-700">p=</span>{item.pValue}
                </div>
              )}
              {item.confidenceInterval && (
                <div className="bg-gray-100 px-3 py-1.5 rounded-md">
                  <span className="font-medium text-gray-700">95% CI:</span> {item.confidenceInterval}
                </div>
              )}
            </div>
            
            {/* Primary outcome */}
            <div className="mt-4">
              <h5 className="font-medium text-gray-700">Primary Outcome:</h5>
              <p className="mt-1 text-gray-700">{item.primaryOutcome}</p>
            </div>
            
            {/* Results */}
            <div className="mt-3">
              <h5 className="font-medium text-gray-700">Key Results:</h5>
              <p className="mt-1 text-gray-700">{item.results}</p>
            </div>
            
            {/* Expanded details section */}
            {detailsVisible && (
              <>
                {item.limitations && (
                  <div className="mt-3">
                    <h5 className="font-medium text-gray-700">Limitations:</h5>
                    <p className="mt-1 text-gray-700">{item.limitations}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Citation */}
            <div className="mt-4 text-sm text-gray-600 italic">
              <span 
                className={onCitationClick ? "text-blue-600 hover:underline cursor-pointer" : ""}
                onClick={() => onCitationClick && handleCitationClick(item.citation)}
              >
                {item.citation}
              </span>
              {item.referenceLink && (
                <a 
                  href={item.referenceLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-2"
                >
                  [View Source]
                </a>
              )}
            </div>
          </div>
        ))}
        
        {filteredEvidence.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            No studies match the selected filter criteria.
          </div>
        )}
        
        {/* Toggle details button */}
        {evidenceArray.some(e => e.limitations) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={toggleDetails}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
            >
              {detailsVisible ? 'Hide details' : 'Show more details'}
            </button>
          </div>
        )}
      </div>
      
      {/* Additional educational content if provided */}
      {educationalContent && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <h4 className="font-medium text-gray-700">Additional Information:</h4>
          <p className="mt-2 text-gray-700">{educationalContent.content}</p>
          {educationalContent.source && (
            <p className="mt-2 text-xs text-gray-500 italic">Source: {educationalContent.source}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidencePanel; 