'use client';

import React, { useState } from 'react';
import { FeedbackCategory, feedbackCategories } from '../../services/feedback/FeedbackCategories';
import { FeedbackManager } from '../../services/feedback/FeedbackManager';
import { FeedbackSuccess } from './FeedbackSuccess';

interface FeedbackFormProps {
  adId: string;
  sessionId: string;
  onClose: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  adId,
  sessionId,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FeedbackCategory | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    const selectedCategoryDef = feedbackCategories.find(c => c.id === selectedCategory);
    if (selectedCategoryDef?.requiresDetails && !details.trim()) {
      setError('Please provide details for this category');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const feedbackManager = FeedbackManager.getInstance();
      await feedbackManager.submitFeedback({
        category: selectedCategory,
        details: details.trim() || undefined,
        adId,
        sessionId
      });
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to submit feedback. Please try again.');
      console.error('Feedback submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return <FeedbackSuccess onClose={onClose} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What issue are you reporting?
        </label>
        <div className="space-y-2">
          {feedbackCategories.map((category) => (
            <div key={category.id} className="flex items-start">
              <input
                type="radio"
                id={`category-${category.id}`}
                name="category"
                value={category.id}
                checked={selectedCategory === category.id}
                onChange={() => {
                  setSelectedCategory(category.id);
                  setError('');
                }}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 block">
                <span className="block text-sm font-medium text-gray-700">{category.label}</span>
                <span className="block text-xs text-gray-500">{category.description}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
          Additional details (optional)
        </label>
        <textarea
          id="details"
          rows={3}
          value={details}
          onChange={(e) => {
            setDetails(e.target.value);
            if (error && details.trim()) setError('');
          }}
          placeholder="Please provide any additional information about this issue"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        ></textarea>
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}; 