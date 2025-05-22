import React, { useState } from 'react';
import API_URL from '../Constants.js';
import { authFetch } from '../utils.js';

const MoleculeFeedbackBox = ({ molecule, lastSearch, onClose }) => {
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
          contextContent1: '',
          contextContent2: '',
          contextContent3: '',
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
    <div className="molecule-feedback-buttons" style={{
      margin: '10px 0',
      textAlign: 'center',
      flexGrow: 1,
      display: 'flex',
      flexFlow: 'column',
      alignItems: 'flex-start',
      width: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '5px' }}>
        <span style={{ fontSize: '14px', marginRight: '5px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>Rate this match:</span>
        <button
          onClick={handleThumbsUp}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            margin: '0 5px',
            opacity: feedbackType === 'up' ? 1 : 0.6,
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6'
          }}
        >
          👍
        </button>
        <button
          onClick={handleThumbsDown}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            margin: '0 5px',
            opacity: feedbackType === 'down' ? 1 : 0.6,
            fontFamily: 'Arial, sans-serif',
            lineHeight: '1.6'
          }}
        >
          👎
        </button>
      </div>

      {feedbackType && (
        <div className="feedback-form" style={{
          marginTop: '10px',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          textAlign: 'left',
          maxWidth: '400px',
          width: '100%',
          display: 'flex',
          flexFlow: 'column',
        }}>
          <p style={{ margin: '0 0 10px' }}>
            {feedbackType === 'up'
              ? 'What makes this a good match?'
              : 'Why is this not a good match?'}
          </p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            style={{
              flexGrow: 1,
              padding: '8px',
              marginBottom: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            placeholder="Your feedback helps us improve molecule matching"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancel}
              style={{
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: '#f1f1f1',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleFeedbackSubmit}
              style={{
                padding: '5px 10px',
                backgroundColor: '#0080ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          {statusMessage && (
            <div style={{ 
              marginTop: '8px', 
              color: statusMessage.includes('Failed') ? 'red' : 'green', 
              fontSize: '14px',
              fontWeight: 'bold',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.6'
            }}>
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MoleculeFeedbackBox; 