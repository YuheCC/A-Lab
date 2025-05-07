import React, { useState, useEffect, useRef, useMemo } from 'react';
import FeedbackBox from './FeedbackBox';

import API_URL from './Constants.js';
import DOMPurify from 'dompurify';

// New ChatInput component added for memoized chat input rendering
const ChatInput = React.memo(({ onSend, disabled, ignoreChatHistory, onIgnoreChatHistoryChange }) => {
  const [inputValue, setInputValue] = React.useState("");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend(inputValue);
        setInputValue("");
      }
    }
  };

  const handleClickSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="chat-input-group">
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          placeholder="Ask me anything, as long as it's about batteries, and we will return molecules that answer your questions and suggest their friends for you to explore further."
          rows={2}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button 
          className="send-button" 
          onClick={handleClickSend}
          disabled={disabled}
        >
          Send
        </button>
      </div>
      <div className="checkbox-group">
          <input 
            type="checkbox" 
            id="ignoreChatHistory" 
            checked={ignoreChatHistory}
            onChange={(e) => onIgnoreChatHistoryChange(e.target.checked)}
          />
          <label htmlFor="ignoreChatHistory" style={{ fontSize: '14px' }}>
            Ignore chat history
          </label>
        </div>
    </div>
  );
});

// Chatbot component
const ChatbotInterface = ({ messages, setMessages, userPermissions, remainingQueries, setRemainingQueries }) => {
  const [foundMolecules, setFoundMolecules] = useState([]);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const messagesEndRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [moleculesLoading, setMoleculesLoading] = useState(false);
  const [similarMoleculesLoading, setSimilarMoleculesLoading] = useState(false);
  const [similarMolecules, setSimilarMolecules] = useState([]);
  const [activeMolecule, setActiveMolecule] = useState(null);
  const [ignoreChatHistory, setIgnoreChatHistory] = useState(false);
  const [showFoundMolecules, setShowFoundMolecules] = useState(true);
  const [showSimilarMolecules, setShowSimilarMolecules] = useState(true);
  
  // Add new state for molecule feedback functionality
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMoleculeIndex, setFeedbackMoleculeIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState(null); // 'up' or 'down'
  const [activeFindMessage, setActiveFindMessage] = useState(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Define handlers for thumbs feedback
  const handleThumbsUp = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ isPositive: true, inputContent: inputContent, responseContent: responseContent, contextContent1 });
    setShowFeedbackBox(true);
  };

  const handleThumbsDown = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ isPositive: false, inputContent: inputContent, responseContent: responseContent, contextContent1 });
    setShowFeedbackBox(true);
  };

  
  const handleFindMolecules = async (message) => {
    setActiveFindMessage(message);
    console.log(message);
    const moleculeList = message.molecules || [];
    setSimilarMolecules([]);
    setFoundMolecules(null);
    setActiveMolecule(null);
    setShowFoundMolecules(true);
    try {
      setMoleculesLoading(true);
      const responses = await Promise.all(
        moleculeList.map(async (mol) => {
          const token = localStorage.getItem('token');
          
          // Add the use_35m parameter when user has appropriate permissions
          let queryUrl = `${API_URL}/api/molecule_details?molecule=${encodeURIComponent(mol)}`;
          if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
            queryUrl += '&query_type=molecule&use_35m=true';
          }
          
          const res = await fetch(
            queryUrl,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          return data;
        })
      );
      // Filter out responses that indicate a successful molecule lookup.
      const validResponses = responses.filter(item => item.found);
      // Flatten the molecule_details lists from each response into a single array.
      const flattenedMolecules = validResponses.reduce((acc, cur) => {
        if (Array.isArray(cur.molecule_details)) {
          return acc.concat(cur.molecule_details);
        }
        return acc;
      }, []);

      setFoundMolecules(flattenedMolecules);
      console.log(flattenedMolecules);
    } catch (err) {
      console.error("Error fetching molecule details:", err);
    } finally {
      setMoleculesLoading(false);
    }
  };

  const handleFindSimilarMolecules = async (details) => {
    setActiveMolecule(details);
    setSimilarMoleculesLoading(true);
    setShowSimilarMolecules(true);
    try {
      const token = localStorage.getItem('token');
      // Add the use_35m parameter when user has appropriate permissions
      let queryUrl = `${API_URL}/find-friend-with-image?smiles=${encodeURIComponent(details.SMILES)}`;
      if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
        queryUrl += '&use_35m=true';
      }
      
      const response = await fetch(
        queryUrl,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      console.log(data["similar_molecules"]);
      setSimilarMolecules(data["similar_molecules"]);
    } catch (error) {
      console.error("Error finding similar molecules:", error);
    } finally {
      setSimilarMoleculesLoading(false);
    }
  };

  // Fetch query limit from API
  useEffect(() => {
    const fetchQueryLimit = async () => {
      if (userPermissions === 'research') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/query_limit`, {
            method: "GET",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setRemainingQueries(data.query_limit);
          } else {
            console.error("Failed to fetch query limit");
          }
        } catch (error) {
          console.error("Error fetching query limit:", error);
        }
      }
    };

    fetchQueryLimit();
  }, [userPermissions, setRemainingQueries]);

  const handleSend = async (input) => {
    if (!input.trim()) return;

    // For research users, check query limit
    if (userPermissions === 'research' && remainingQueries <= 0) {
      const errorMessage = { 
        type: "llm-message", 
        text: "You have reached your monthly query limit. Please contact an administrator for assistance." 
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Create new user message
    const newUserMessage = { type: "user-message", text: input.trim() };
    // Update the messages state
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Build the messages array to send to the backend
    let messagesToSend;
    if (ignoreChatHistory) {
      messagesToSend = [{ role: "user", content: input.trim() }];
    } else {
      messagesToSend = updatedMessages
        .filter(msg => msg.type === "user-message" || msg.type === "llm-message")
        .map(msg => {
          if (msg.type === "user-message") {
            return { role: "user", content: msg.text };
          } else if (msg.type === "llm-message") {
            return { role: "assistant", content: msg.text };
          }
        });
    }

    setIsThinking(true);

    try {
      const token = localStorage.getItem('token');
      // Determine RAG model and result count based on user tier
      const isAdvancedTier = ['admin', 'enterprise', 'joint'].includes(userPermissions);
      const ragModel = isAdvancedTier ? 'o3' : 'o4-mini';
      const ragResultsCount = isAdvancedTier ? 10 : 3;
      // Query the backend via the /rag endpoint using the messages array
      const response = await fetch(`${API_URL}/rag`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: messagesToSend,
          maxOutputLength: 8192, // deprecated
          ragEnabled: true,
          webSearchEnabled: false,
          webSearchClient: "Tavily",
          numRagResults: ragResultsCount,
          model: ragModel
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        let message = "Network response was not ok";
        if (response.status === 400 && errorText.includes("Query is not relevant to batteries or battery chemistry")) {
          message = "Your question isn't relevant to batteries or battery chemistry. Please ask a battery-related question.";
        } else {
          try {
            const errData = JSON.parse(errorText);
            if (errData.detail) message = errData.detail;
          } catch {
            // leave default message
          }
        }
        throw new Error(message);
      }
      const data = await response.json();
      // Assuming the response returns an 'outputs' field with the result text
      // Use llmOutput for chat history (only the raw LLM response) and fullOutput for display
      const llmMessage = { 
        type: "llm-message", 
        inputs: data.inputs, 
        text: data.llmOutput, 
        sources: data.source_html, 
        molText: data.molecule_text,
        molecules: data.molecules 
      };
      setMessages(prev => [...prev, llmMessage]);

      // Update remaining queries based on server payload
      if (userPermissions === 'research' && data.remaining_queries !== undefined) {
        setRemainingQueries(data.remaining_queries);
      }
    } catch (error) {
      const errorMessage = { type: "llm-message", text: "Error: " + error.message };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Add feedback handlers for thumbs up/down
  const handleMoleculeThumbsUp = (moleculeIndex) => {
    const message = activeFindMessage;
    setFeedbackMoleculeIndex(moleculeIndex);
    setFeedbackType('up');
    setFeedbackOpen(true);
    setFeedbackText('');
  };

  const handleMoleculeThumbsDown = (moleculeIndex) => {
    const message = activeFindMessage;
    setFeedbackMoleculeIndex(moleculeIndex);
    setFeedbackType('down');
    setFeedbackOpen(true);
    setFeedbackText('');
  };

  const handleMoleculeFeedbackSubmit = async () => {
    if (feedbackMoleculeIndex !== null && similarMolecules && similarMolecules.length > feedbackMoleculeIndex) {
      try {
        const molecule = similarMolecules[feedbackMoleculeIndex];
        const token = localStorage.getItem('token');

        // Gather LLM context for this feedback from the originating message
        const rawInputs = activeFindMessage?.inputs;
        let contextContent1 = "";
        if (Array.isArray(rawInputs)) {
          const lastUserMsg = rawInputs.filter(m => m.role === "user").pop() || {};
          contextContent1 = lastUserMsg.content || "";
        } else if (typeof rawInputs === "string") {
          contextContent1 = rawInputs;
        }
        const contextContent2 = activeFindMessage?.text || "";
        const contextContent3 = activeFindMessage?.sources || "";

        // Submit feedback to backend
        await fetch(`${API_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            isPositive: feedbackType === 'up',
            feedbackText: feedbackText.trim(),
            inputContent: activeMolecule ? activeMolecule.SMILES : '',
            responseContent: molecule.SMILES,
            contextContent1,
            contextContent2,
            contextContent3,
            timestamp: new Date().toISOString(),
            collection: 'friends-feedback',
          }),
        });

        // Close the feedback form
        setFeedbackOpen(false);
        setFeedbackMoleculeIndex(null);
        setFeedbackText('');

        // You might want to show a success message
        alert('Thank you for your feedback!');
      } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
      }
    }
  };

  const handleMoleculeFeedbackCancel = () => {
    setFeedbackOpen(false);
    setFeedbackMoleculeIndex(null);
    setFeedbackText('');
  };

  return (
    <div className="chatbot-container">
      {userPermissions === 'research' && (
        <div className="chatbot-header">
          <div className={`query-limit-display ${remainingQueries <= 3 ? 'warning' : ''} ${remainingQueries === 0 ? 'danger' : ''}`}>
            <span className="query-limit-icon">💬</span>
            <span>
              Queries remaining this month: <span className="query-limit-count">{remainingQueries}</span>
            </span>
          </div>
        </div>
        )}
      <div className="chat-and-molecules">
        <div className="chatbot-content" style={{ width: !showFoundMolecules && !showSimilarMolecules ? '100%' : '90%' }}>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={msg.type} 
                style={{ whiteSpace: 'pre-wrap' }}>
                <div>{msg.text}</div>
                {msg.sources && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(msg.sources, {
                        ALLOWED_TAGS: ['a', 'strong', 'em', 'br', 'p', 'ul', 'li', 'ol'],
                        ALLOWED_ATTR: ['href', 'target', 'rel']
                      })
                    }}
                  />
                )}
                {msg.molText && <div>{msg.molText}</div>}
                {msg.type === "llm-message" && msg.molecules && msg.molecules.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                    <button 
                      className="find-molecules-button" 
                      style={{ backgroundColor: '#ADD8E6', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => handleFindMolecules(msg)}>
                      Find Molecules
                    </button>
                    {moleculesLoading && (
                      <span style={{ 
                        marginLeft: '10px', 
                        fontStyle: 'italic', 
                        color: '#555',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        searching our database
                        <span className="thinking-dots" style={{ marginLeft: '5px' }}>
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                      </span>
                    )}
                  </div>
                )}
                {/* Add thumbs buttons for feedback */}
                {msg.type === "llm-message" && (
                  <div className="thumbs" style={{ marginTop: '10px' }}>
                    <button onClick={() => handleThumbsUp(msg.inputs, msg.text, msg.sources)}>👍</button>
                    <button onClick={() => handleThumbsDown(msg.inputs, msg.text, msg.sources)}>👎</button>
                    <button 
                      className="copy-btn" 
                      onClick={() => {
                        // Create a temporary element and set its innerHTML to the message's HTML content.
                        const tempEl = document.createElement('div');
                        tempEl.innerHTML = msg.text;
                        
                        // Get the raw HTML.
                        const rawHtml = tempEl.innerHTML;
                        // Replace newline characters with <br> tags.
                        const htmlToCopy = rawHtml.replace(/\n/g, '<br>');
                        
                        // Also, get the plain text version (which already has newlines)
                        const plainTextToCopy = tempEl.innerText;

                        // Create Blob objects for each representation.
                        const blobHTML = new Blob([htmlToCopy], { type: 'text/html' });
                        const blobText = new Blob([plainTextToCopy], { type: 'text/plain' });

                        // Create a ClipboardItem that includes both formats.
                        const clipboardItem = new ClipboardItem({
                          'text/html': blobHTML,
                          'text/plain': blobText,
                        });

                        navigator.clipboard.write([clipboardItem])
                          .then(() => {
                            console.log('Copied to clipboard with both HTML and plain text');
                            // Optionally update the button to indicate success.
                          })
                          .catch(err => console.error('Failed to copy:', err));
                      }}
                    >
                      📋
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="thinking-message">
                <span>thinking</span>
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput 
            onSend={handleSend}
            disabled={userPermissions === 'research' && remainingQueries <= 0}
            ignoreChatHistory={ignoreChatHistory}
            onIgnoreChatHistoryChange={setIgnoreChatHistory}
          />
        </div>
        {foundMolecules && foundMolecules.length > 0 && showFoundMolecules && (
          <div className="found-molecules-container">
            <div className="molecules-header">
              <h3>LLM Found Molecules</h3>
              <button 
                className="close-molecules-button"
                onClick={() => setShowFoundMolecules(false)}
              >
                ×
              </button>
            </div>
            {foundMolecules.map((details, idx) => {
              return (
                <div key={idx} className="molecule-box" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f9f9f9' }}>
                  <strong>{details.name}</strong>
                  <p>SMILES: {details.SMILES}</p>
                  <p>Molecular weight: {details.MOLECULAR_WEIGHT}</p>
                  <p>HOMO: {Number(details.HOMO).toFixed(2)} eV</p>
                  <p>LUMO: {Number(details.LUMO).toFixed(2)} eV</p>
                  <p>ESP Max: {Number(details.ESP_MAX).toFixed(2)} eV</p>
                  <p>ESP Min: {Number(details.ESP_MIN).toFixed(2)} eV</p>
                  <p>Functional groups: {details.FUNCTIONAL_GROUPS}</p>
                  {/* <p>UMAP_X: {details.UMAP_0 !== undefined && details.UMAP_0 !== null ? details.UMAP_0.toFixed(2) : 'N/A'}</p>
                  <p>UMAP_Y: {details.UMAP_1 !== undefined && details.UMAP_1 !== null ? details.UMAP_1.toFixed(2) : 'N/A'}</p> */}
                  {(userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                    <>
                      <p>Predicted MP: {details.PREDICTED_MP} °C</p>
                      <p>Predicted BP: {details.PREDICTED_BP} °C</p>
                    </>
                  )}
                  {details.image && (
                    <img 
                      src={details.image} 
                      alt={`Structure of ${details.SMILE}`} 
                      style={{ width: '150px', height: '150px', marginTop: '10px', objectFit: 'contain' }} 
                    />
                  )}
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                  <button 
                    className="find-similar-molecules-button"
                    style={{
                      backgroundColor: '#FFA500',
                      border: 'none',
                      padding: '6px 10px',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleFindSimilarMolecules(details)}
                  >
                    Find Similar Molecules
                  </button>
                  {similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === details.SMILES && (
                    <span style={{ 
                      marginLeft: '10px', 
                      fontStyle: 'italic', 
                      color: '#555',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      searching
                      <span className="thinking-dots" style={{ marginLeft: '5px' }}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </span>
                  )}
                  </div>
                </div>
              );
              })
            }
          </div>
        )}
        {similarMolecules && similarMolecules.length > 0 && showSimilarMolecules && (
          <div className="similar-molecules-container" style={{ marginLeft: '20px' }}>
            <div className="molecules-header">
              <h3>Friends of {activeMolecule ? activeMolecule.name.toLowerCase() : ''} ranked by property similarity</h3>
              <button 
                className="close-molecules-button"
                onClick={() => setShowSimilarMolecules(false)}
              >
                ×
              </button>
            </div>
            {similarMolecules.map((item, idx) => {
              // Adjust based on your response structure (if using item.molecule_details or directly item)
              const details = item.molecule_details || item;
              return (
                <div key={idx} className="molecule-box" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f9f9f9' }}>
                  <strong>SMILES: {details.SMILES}</strong>
                  <p>Molecular weight: {details.molecular_weight}</p>
                  <p>HOMO eV: {Number(details.HOMO_eV).toFixed(2)} eV</p>
                  <p>LUMO eV: {Number(details.LUMO_eV).toFixed(2)} eV</p>
                  <p>ESP Max: {Number(details.ESP_max_eV).toFixed(2)} eV</p>
                  <p>ESP Min: {Number(details.ESP_min_eV).toFixed(2)} eV</p>
                  <p>Functional groups: {details.functional_groups}</p>
                  {/* <p>UMAP_X: {details.UMAP_0 !== undefined && details.UMAP_0 !== null ? details.UMAP_0.toFixed(2) : 'N/A'}</p>
                  <p>UMAP_Y: {details.UMAP_1 !== undefined && details.UMAP_1 !== null ? details.UMAP_1.toFixed(2) : 'N/A'}</p> */}
                  {(userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                    <>
                      <p>Predicted MP: {Number(details.predicted_MP_celsius).toFixed(2)} °C</p>
                      <p>Predicted BP: {Number(details.predicted_BP_celsius).toFixed(2)} °C</p>
                    </>
                  )}
                  {details.image && (
                    <img 
                      src={details.image} 
                      alt={`Structure of ${details.SMILE}`} 
                      style={{ width: '150px', height: '150px', marginTop: '10px', objectFit: 'contain' }} 
                    />
                  )}
                  
                  {/* Add molecule feedback buttons */}
                  <div className="molecule-feedback-buttons" style={{
                    margin: '10px 0',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{ fontSize: '14px', marginRight: '5px' }}>Rate this match:</span>
                      <button
                        onClick={() => handleMoleculeThumbsUp(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          margin: '0 5px'
                        }}
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleMoleculeThumbsDown(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '18px',
                          cursor: 'pointer',
                          margin: '0 5px'
                        }}
                      >
                        👎
                      </button>
                    </div>

                    {feedbackOpen && feedbackMoleculeIndex === idx && (
                      <div className="feedback-form" style={{
                        marginTop: '10px',
                        padding: '10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: '#f9f9f9',
                        textAlign: 'left',
                        width: '100%',
                        maxWidth: '400px'
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
                            width: '100%',
                            padding: '8px',
                            marginBottom: '10px',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                          }}
                          placeholder="Your feedback helps us improve molecule matching"
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={handleMoleculeFeedbackCancel}
                            style={{
                              marginRight: '10px',
                              padding: '5px 10px',
                              backgroundColor: '#f1f1f1',
                              border: '1px solid #ccc',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleMoleculeFeedbackSubmit}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#0080ff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Render the FeedbackBox if needed */}
      {showFeedbackBox && feedbackData && (
        <FeedbackBox 
          isPositive={feedbackData.isPositive}
          inputContent={feedbackData.inputContent}
          responseContent={feedbackData.responseContent}
          contextContent1={feedbackData.contextContent1}
          onClose={() => setShowFeedbackBox(false)}
        />
      )}
    </div>
  );
};


export default ChatbotInterface;