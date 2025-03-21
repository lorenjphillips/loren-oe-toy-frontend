/**
 * TreatmentCard Component
 * 
 * Displays key treatment information in a card format with
 * a clean, professional design suitable for clinical use.
 */

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EducationalContent } from '../../models/microsimulation';
import { AdCompany } from '../../models/adTypes';

interface TreatmentCardProps {
  title: string;
  content: string | React.ReactNode;
  treatmentName?: string;
  treatmentId?: string;
  source?: string;
  contentType?: EducationalContent['type'];
  company?: AdCompany;
  imageUrl?: string;
  onExpand?: () => void;
  className?: string;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  title,
  content,
  treatmentName,
  treatmentId,
  source,
  contentType = 'text',
  company,
  imageUrl,
  onExpand,
  className = '',
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpand = () => {
    setExpanded(!expanded);
    if (onExpand && !expanded) {
      onExpand();
    }
  };

  // Determine if content should show a "read more" based on length
  const isLongContent = typeof content === 'string' && content.length > 300;
  const displayContent = typeof content === 'string' && !expanded && isLongContent
    ? `${content.substring(0, 300)}...`
    : content;

  return (
    <div 
      className={`rounded-lg shadow-md overflow-hidden bg-white border border-gray-200 transition-all duration-300 ${
        expanded ? 'max-w-4xl' : 'max-w-xl'
      } ${className}`}
    >
      {/* Company branding if available */}
      {company && (
        <div 
          className="h-2" 
          style={{ 
            backgroundColor: company.primaryColor || '#3b82f6',
            backgroundImage: company.secondaryColor 
              ? `linear-gradient(to right, ${company.primaryColor || '#3b82f6'}, ${company.secondaryColor})` 
              : undefined
          }}
        />
      )}

      <div className="px-6 py-4">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-start justify-between">
          <span>{title}</span>
          {treatmentName && (
            <span className="text-sm bg-blue-100 text-blue-800 rounded-full px-3 py-1 ml-2">
              {treatmentName}
            </span>
          )}
        </h3>

        {/* Image content */}
        {contentType === 'image' && (
          <div className="my-4 flex justify-center">
            <Image 
              src={typeof content === 'string' ? content : imageUrl || ''}
              alt={`Visualization for ${title}`}
              width={400}
              height={300}
              className="rounded shadow-sm"
            />
          </div>
        )}

        {/* Video content */}
        {contentType === 'video' && (
          <div className="my-4 flex justify-center">
            <video 
              controls
              className="w-full rounded shadow-sm"
              src={typeof content === 'string' ? content : ''}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* PDF or link content */}
        {(contentType === 'pdf' || contentType === 'link') && (
          <div className="my-4 p-4 bg-gray-50 rounded flex items-center">
            <div className="mr-3">
              {contentType === 'pdf' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </div>
            <Link 
              href={typeof content === 'string' ? content : '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {contentType === 'pdf' ? 'View PDF document' : 'Visit external resource'}
            </Link>
          </div>
        )}
        
        {/* Text content */}
        {contentType === 'text' && (
          <div className="mt-3 text-gray-700">
            {typeof displayContent === 'string' ? (
              <p className="leading-relaxed whitespace-pre-line">
                {displayContent}
              </p>
            ) : (
              displayContent
            )}
            
            {isLongContent && (
              <button 
                onClick={handleExpand}
                className="text-blue-600 font-medium hover:text-blue-800 mt-2 focus:outline-none"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Source citation */}
        {source && (
          <div className="mt-4 text-xs text-gray-500 italic">
            Source: {source}
          </div>
        )}
      </div>
      
      <div className="px-6 pb-4 flex justify-end">
        {onExpand && contentType !== 'link' && contentType !== 'pdf' && !isLongContent && (
          <button
            onClick={handleExpand}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none flex items-center"
          >
            {expanded ? (
              <>
                <span>Collapse</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </>
            ) : (
              <>
                <span>Expand</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TreatmentCard; 