import React, { useState } from 'react';
import { authFetch, getAPIUrl } from '../../utils.js';
import { ThumbsDown, ThumbsUp } from 'lucide-react';

import './MoleculeFeedbackBox.css';

const API_URL = getAPIUrl();

export const MoleculeFeedbackBox = ({ fullWidth, molecule, lastSearch, onClose, contextContent1, contextContent2, contextContent3 }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState(null); // 'up' or 'down'
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleThumbsUp = () => {
    setFeedbackType('up');
  };

  const handleThumbsDown = () => {
    setFeedbackType('down');
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackType) {
      setStatusMessage('Please select thumbs up or down first');
      return;
    }

    try {
      setSubmitting(true);

      // Submit feedback to backend
      await authFetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPositive: feedbackType === 'up',
          feedbackText: feedbackText.trim(),
          inputContent: lastSearch || '',
          responseContent: molecule.SMILES || molecule.smiles || '',
          contextContent1,
          contextContent2,
          contextContent3,
          timestamp: new Date().toISOString(),
          collection: 'friends-feedback',
        }),
      });

      setStatusMessage('Thank you for your feedback!');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setStatusMessage('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFeedbackText('');
    setFeedbackType(null);
  };

  return (
    <div className={`molecule-feedback-buttons ${fullWidth ? 'full-width' : ''}`}>
      <div className='feedback-buttons'>
        <span className="rate-text">Rate this match</span>
        <ThumbsUp className={`feedback-icon ${feedbackType === 'up' ? 'active' : ''}`} size={18} onClick={handleThumbsUp} />
        <ThumbsDown className={`feedback-icon ${feedbackType === 'down' ? 'active' : ''}`} size={18} onClick={handleThumbsDown} />
      </div>

      {feedbackType && (
        <div className="feedback-form">
          <p className="feedback-question">
            {feedbackType === 'up'
              ? 'What makes this a good match?'
              : 'Why is this not a good match?'}
          </p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="feedback-textarea"
            placeholder="Your feedback helps us improve molecule matching"
          />
          <div className="feedback-actions">
            <button
              onClick={handleCancel}
              className="cancel-button"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleFeedbackSubmit}
              className={`submit-button ${feedbackType === 'up' ? 'sucess' : 'error'}`}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {statusMessage && (
            <div className={`status-message ${statusMessage.includes('Failed') ? 'error' : 'success'}`}>
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoleculeFeedbackBox;