import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authFetch, getAPIUrl } from '../../utils.js';
import { ThumbsDown, ThumbsUp, X } from 'lucide-react';

import './MoleculeFeedbackBox.css';

const API_URL = getAPIUrl();

export const MoleculeFeedbackBox = ({ fullWidth, molecule, lastSearch, onClose, contextContent1, contextContent2, contextContent3 }) => {
  const { t } = useTranslation();
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
      setStatusMessage(t('chatbox.feedback.selectFirst'));
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

      setStatusMessage(t('chatbox.feedback.thankYou'));
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setStatusMessage(t('chatbox.success.feedbackSubmitted'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFeedbackText('');
    setFeedbackType(null);
  };

  const handleClose = () => {
    setFeedbackText('');
    setFeedbackType(null);
    setStatusMessage('');
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={`molecule-feedback-buttons ${fullWidth ? 'full-width' : ''}`}>
      <div className='feedback-buttons'>
        <span className="rate-text">{t('chatbox.molecules.rateMatch')}</span>
        <ThumbsUp className={`feedback-icon ${feedbackType === 'up' ? 'active' : ''}`} size={18} onClick={handleThumbsUp} />
        <ThumbsDown className={`feedback-icon ${feedbackType === 'down' ? 'active' : ''}`} size={18} onClick={handleThumbsDown} />
      </div>

      {feedbackType && (
        <div className="feedback-form">
          <button
            onClick={handleClose}
            className="feedback-close-button"
            disabled={submitting}
          >
            <X size={16} />
          </button>
          <p className="feedback-question">
            {feedbackType === 'up'
              ? t('chatbox.feedback.goodMatch')
              : t('chatbox.feedback.badMatch')}
          </p>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="feedback-textarea"
            placeholder={t('chatbox.feedback.placeholder')}
          />
          <div className="feedback-actions">
            <button
              onClick={handleCancel}
              className="cancel-button"
              disabled={submitting}
            >
              {t('chatbox.buttons.cancel')}
            </button>
            <button
              onClick={handleFeedbackSubmit}
              className={`submit-button ${feedbackType === 'up' ? 'sucess' : 'error'}`}
              disabled={submitting}
            >
              {submitting ? t('chatbox.feedback.submitting') : t('chatbox.buttons.submit')}
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