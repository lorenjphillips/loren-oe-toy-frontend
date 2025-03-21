/**
 * EducationalNode Component
 * 
 * Provides educational treatment information in the microsimulation
 * Includes treatment mechanisms, indications, and evidence-based citations
 */

'use client';

import React, { useState } from 'react';
import { EducationalNode as EducationalNodeType } from '../../../services/decisionTreeService';

// Component props
interface EducationalNodeProps {
  node: EducationalNodeType;
  onComplete: (viewDuration: number) => void;
}

/**
 * EducationalNode component
 */
const EducationalNode: React.FC<EducationalNodeProps> = ({ node, onComplete }) => {
  // Track if educational content has been viewed
  const [startTime] = useState(Date.now());
  const [activeTab, setActiveTab] = useState<'overview' | 'indications' | 'contraindications' | 'sideEffects' | 'evidence'>('overview');
  const [hasExpandedAll, setHasExpandedAll] = useState(false);
  
  // Handle completing the educational node
  const handleContinue = () => {
    const viewDuration = Math.floor((Date.now() - startTime) / 1000);
    onComplete(viewDuration);
  };
  
  // Handle tab change
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };
  
  // Handle expanding all sections
  const handleExpandAll = () => {
    setHasExpandedAll(true);
  };
  
  // Get evidence level badge styling
  const getEvidenceLevelBadge = () => {
    const evidenceLevel = node.treatmentInfo?.evidenceLevel || 'moderate';
    
    switch (evidenceLevel) {
      case 'high':
        return {
          text: 'High Quality Evidence',
          color: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'moderate':
        return {
          text: 'Moderate Quality Evidence',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'low':
        return {
          text: 'Low Quality Evidence',
          color: 'bg-red-100 text-red-800 border-red-200'
        };
      default:
        return {
          text: 'Evidence Level Unspecified',
          color: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };
  
  const evidenceBadge = getEvidenceLevelBadge();
  
  // Determine if this is sponsored content
  const isSponsoredContent = node.isSponsoredContent || false;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Educational content header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{node.title}</h2>
            {isSponsoredContent && (
              <div className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded mb-2">
                Sponsored Content
              </div>
            )}
          </div>
          
          {/* Evidence level badge if available */}
          {node.treatmentInfo?.evidenceLevel && (
            <div className={`px-3 py-1 rounded-md text-sm border ${evidenceBadge.color}`}>
              {evidenceBadge.text}
            </div>
          )}
        </div>
        <p className="text-gray-700">{node.content}</p>
      </div>
      
      {/* Treatment information tabs */}
      {node.treatmentInfo && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button 
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => handleTabChange('overview')}
              >
                Overview
              </button>
              {node.treatmentInfo.indications.length > 0 && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'indications' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('indications')}
                >
                  Indications
                </button>
              )}
              {node.treatmentInfo.contraindications.length > 0 && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'contraindications' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('contraindications')}
                >
                  Contraindications
                </button>
              )}
              {node.treatmentInfo.sideEffects.length > 0 && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'sideEffects' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('sideEffects')}
                >
                  Side Effects
                </button>
              )}
              {node.references && node.references.length > 0 && (
                <button 
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'evidence' 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => handleTabChange('evidence')}
                >
                  Evidence
                </button>
              )}
            </nav>
          </div>
          
          <div className="mt-4">
            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{node.treatmentInfo.name}</h3>
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h4 className="font-medium text-gray-800 mb-2">Mechanism of Action</h4>
                  <p className="text-gray-700">{node.treatmentInfo.mechanism}</p>
                </div>
                {!hasExpandedAll && (
                  <button 
                    onClick={handleExpandAll}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Expand All Sections
                  </button>
                )}
              </div>
            )}
            
            {/* Indications tab */}
            {(activeTab === 'indications' || hasExpandedAll) && (
              <div className={activeTab !== 'indications' && hasExpandedAll ? 'mt-6' : ''}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Indications</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {node.treatmentInfo.indications.map((indication, index) => (
                    <li key={index} className="text-gray-700">{indication}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Contraindications tab */}
            {(activeTab === 'contraindications' || hasExpandedAll) && (
              <div className={activeTab !== 'contraindications' && hasExpandedAll ? 'mt-6' : ''}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contraindications</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {node.treatmentInfo.contraindications.map((contraindication, index) => (
                    <li key={index} className="text-gray-700">{contraindication}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Side Effects tab */}
            {(activeTab === 'sideEffects' || hasExpandedAll) && (
              <div className={activeTab !== 'sideEffects' && hasExpandedAll ? 'mt-6' : ''}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Side Effects</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {node.treatmentInfo.sideEffects.map((sideEffect, index) => (
                    <li key={index} className="text-gray-700">{sideEffect}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Evidence tab */}
            {(activeTab === 'evidence' || hasExpandedAll) && node.references && (
              <div className={activeTab !== 'evidence' && hasExpandedAll ? 'mt-6' : ''}>
                <h3 className="text-lg font-medium text-gray-900 mb-2">References</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ol className="list-decimal pl-5 space-y-2">
                    {node.references.map((reference, index) => (
                      <li key={index} className="text-gray-700">
                        {reference.citation}
                        {reference.url && (
                          <a 
                            href={reference.url} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            [Link]
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Image if available */}
      {node.image && (
        <div className="mb-6">
          <img 
            src={node.image} 
            alt={`Image for ${node.title}`} 
            className="rounded-lg shadow-md max-h-80 mx-auto"
          />
        </div>
      )}
      
      {/* Continue button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default EducationalNode; 