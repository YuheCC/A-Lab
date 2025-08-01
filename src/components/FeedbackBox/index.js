// FeedbackBox.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { getAPIUrl } from '@/utils';

const API_URL = getAPIUrl();

const FeedbackBox = ({ isPositive, inputContent, responseContent, contextContent1, queryType, onClose }) => {
  const { t } = useTranslation();
  const [feedbackText, setFeedbackText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const feedbackBoxRef = useRef(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (feedbackBoxRef.current && !feedbackBoxRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      setStatusMessage(t('feedback.status.required'));
      return;
    }
    try {
      const feedbackData = {
        isPositive: isPositive,
        feedbackText: feedbackText.trim(),
        inputContent: inputContent,
        responseContent: responseContent,
        contextContent1: contextContent1,
        contextContent2: "",
        contextContent3: "",
        timestamp: new Date().toISOString(),
        queryType: queryType || "normal_ask",
      };
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/feedback`,
        feedbackData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          timeout: 10000,
        }
      );
      setStatusMessage(t('feedback.status.success'));
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error("Error saving feedback:", err.message);
      setStatusMessage(t('feedback.status.failed'));
    }
  };

  return (
    <div className="feedback-box" ref={feedbackBoxRef}>
      <div className="feedback-header">
        {isPositive ? t('feedback.header.positive') : t('feedback.header.negative')}
      </div>
      <textarea
        className="feedback-textarea"
        placeholder={t('feedback.placeholder')}
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
      />
      <div className="feedback-buttons">
        <button className="feedback-cancel" onClick={onClose}>{t('feedback.buttons.cancel')}</button>
        <button 
            className="feedback-submit" 
            style={{ 
                backgroundColor: isPositive ? '#4CAF50' : '#f44336', 
                color: 'white', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: '4px', 
                cursor: 'pointer'
            }}
            onClick={handleSubmit}
            >
            {t('feedback.buttons.submit')}
            </button>
      </div>
      {statusMessage && <div className="feedback-status">{statusMessage}</div>}
    </div>
  );
};

export default FeedbackBox;