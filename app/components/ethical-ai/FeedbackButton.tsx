import React, { useState } from 'react';
import { processFeedback } from '../../services/ethical-ai/guardrails';

interface FeedbackButtonProps {
  adContentId: string;
  feedbackOptions?: string[];
  userId?: string;
}

interface FeedbackResult {
  success: boolean;
  feedbackId: string;
  message: string;
}

/**
 * Feedback Button component
 * 
 * Allows users to report inappropriate content and provide feedback
 * on ad content that may be inaccurate, misleading, or irrelevant.
 */
const FeedbackButton: React.FC<FeedbackButtonProps> = ({ 
  adContentId, 
  feedbackOptions = [
    'inaccurate',
    'misleading',
    'inappropriate',
    'irrelevant',
    'other'
  ],
  userId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = () => {
    if (!selectedOption) {
      setMessage('Please select a reason for your feedback');
      return;
    }
    
    setIsSubmitting(true);
    
    Promise.resolve(
      processFeedback(
        adContentId,
        selectedOption,
        feedbackText || undefined,
        userId
      )
    )
      .then((result: FeedbackResult) => {
        setSubmitted(true);
        setMessage(result.message);
        setIsSubmitting(false);
      })
      .catch((error: Error) => {
        setMessage('Error submitting feedback. Please try again.');
        console.error('Feedback submission error:', error);
        setIsSubmitting(false);
      });
  };
  
  // Reset the form
  const handleReset = () => {
    setIsOpen(false);
    setSelectedOption(null);
    setFeedbackText('');
    setSubmitted(false);
    setMessage('');
  };
  
  if (submitted) {
    return (
      <div className="feedback-button-container">
        <div className="feedback-thank-you">
          <p>{message}</p>
          <button 
            className="feedback-reset" 
            onClick={handleReset}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="feedback-button-container">
      {!isOpen ? (
        <button 
          className="feedback-toggle" 
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
        >
          Report this content
        </button>
      ) : (
        <div className="feedback-form">
          <h4>Report Content</h4>
          
          <div className="feedback-options">
            {feedbackOptions.map(option => (
              <label key={option} className="feedback-option">
                <input
                  type="radio"
                  name="feedback-reason"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => setSelectedOption(option)}
                />
                <span className="option-text">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </span>
              </label>
            ))}
          </div>
          
          <textarea
            className="feedback-text"
            placeholder="Additional details (optional)"
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            rows={3}
          />
          
          {message && <p className="feedback-message">{message}</p>}
          
          <div className="feedback-buttons">
            <button 
              className="feedback-cancel" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button 
              className="feedback-submit" 
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackButton; 