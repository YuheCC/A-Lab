// FeedbackBox.js
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { getAPIUrl } from '../utils';

const API_URL = getAPIUrl();

const FeedbackBox = ({ isPositive, inputContent, responseContent, contextContent1, queryType, onClose }) => {
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
      setStatusMessage("Feedback text is required.");
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
      setStatusMessage("Feedback saved successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error("Error saving feedback:", err.message);
      setStatusMessage("Failed to save feedback. Please try again.");
    }
  };

  return (
    <div className="feedback-box" ref={feedbackBoxRef}>
      <div className="feedback-header">
        {isPositive ? "What was good?" : "What was wrong?"}
      </div>
      <textarea
        className="feedback-textarea"
        placeholder="Provide feedback regarding the answer and the model's thinking..."
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
      />
      <div className="feedback-buttons">
        <button className="feedback-cancel" onClick={onClose}>Cancel</button>
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
            Submit
            </button>
      </div>
      {statusMessage && <div className="feedback-status">{statusMessage}</div>}
    </div>
  );
};

export default FeedbackBox;