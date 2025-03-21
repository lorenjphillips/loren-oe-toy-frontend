'use client';

import React from 'react';

interface FeedbackSuccessProps {
  onClose: () => void;
}

export const FeedbackSuccess: React.FC<FeedbackSuccessProps> = ({ onClose }) => {
  return (
    <div className="text-center py-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-lg leading-6 font-medium text-gray-900">Feedback submitted</h3>
      <div className="mt-2 text-sm text-gray-500 space-y-1">
        <p>Thank you for your feedback.</p>
        <p>We take all reports seriously and will review this promptly.</p>
      </div>
      <div className="mt-5">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  );
}; 