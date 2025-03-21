'use client';

import React, { useState } from 'react';
import { FeedbackForm } from './FeedbackForm';

interface FeedbackButtonProps {
  adId: string;
  className?: string;
  sessionId: string;
  variant?: 'default' | 'text' | 'icon';
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  adId,
  className = '',
  sessionId,
  variant = 'default'
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const openFeedback = () => {
    setShowFeedback(true);
  };

  const closeFeedback = () => {
    setShowFeedback(false);
  };

  const baseClasses = 'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500';
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'text':
        return `${baseClasses} text-gray-500 hover:text-gray-700 text-sm underline`;
      case 'icon':
        return `${baseClasses} text-gray-500 hover:text-gray-700 p-1 rounded-full`;
      default:
        return `${baseClasses} text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded`;
    }
  };

  return (
    <>
      <button
        className={`${getButtonStyle()} ${className}`}
        onClick={openFeedback}
        aria-label="Report an issue with this ad"
      >
        {variant === 'icon' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          'Report issue'
        )}
      </button>

      {showFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <button 
              onClick={closeFeedback}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Close feedback form"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Report an issue with this ad</h2>
              <FeedbackForm 
                adId={adId}
                sessionId={sessionId}
                onClose={closeFeedback}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 