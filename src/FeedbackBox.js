// FeedbackBox.js
import React, { useState } from 'react';
import axios from 'axios';

const FeedbackBox = ({ isPositive, inputContent, responseContent, collapsibleContent, onClose }) => {
  const [feedbackText, setFeedbackText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      setStatusMessage("Feedback text is required.");
      return;
    }
    try {
      const feedbackData = {
        isPositive,
        feedbackText: feedbackText.trim(),
        inputContent,
        responseContent,
        collapsibleContent,
        timestamp: new Date().toISOString(),
      };
      const response = await axios.post('http://localhost:8000/api/feedback', feedbackData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
      setStatusMessage("Feedback saved successfully!");
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error("Error saving feedback:", err.message);
      setStatusMessage("Failed to save feedback. Please try again.");
    }
  };

  return (
    <div className="feedback-box">
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