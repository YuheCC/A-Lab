import React, { useState, useEffect, useRef, useMemo } from 'react';
import FeedbackBox from './FeedbackBox';

import API_URL from './Constants.js';

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
          placeholder="Ask a question about molecules, properties, or chemical structures..."
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


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Define handlers for thumbs feedback
  const handleThumbsUp = (inputContent, responseContent, collapsibleContent) => {
    setFeedbackData({ isPositive: true, inputContent: inputContent, responseContent: responseContent, collapsibleContent });
    setShowFeedbackBox(true);
  };

  const handleThumbsDown = (inputContent, responseContent, collapsibleContent) => {
    setFeedbackData({ isPositive: false, inputContent: inputContent, responseContent: responseContent, collapsibleContent });
    setShowFeedbackBox(true);
  };

  
  const handleFindMolecules = async (moleculeList) => {
    setSimilarMolecules([]);
    setFoundMolecules(null);
    setActiveMolecule(null);
    try {
      setMoleculesLoading(true);
      const responses = await Promise.all(
        moleculeList.map(async (mol) => {
          const res = await fetch(`https://api.ses.ai/api/molecule_details?molecule=${encodeURIComponent(mol)}`);
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
    try {
      const response = await fetch(`${API_URL}/find-friend-with-image?smiles=${encodeURIComponent(details.SMILES)}`);
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
      // Query the backend via the /rag endpoint using the messages array
      const response = await fetch(`${API_URL}/rag`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: messagesToSend,
          maxOutputLength: 1024,
          ragEnabled: true,
          webSearchEnabled: false,
          webSearchClient: "Tavily",
          model: "o3-mini"
        })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
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
      
      // Update the query limit after each query for research users
      if (userPermissions === 'research') {
        try {
          const limitResponse = await fetch(`${API_URL}/query_limit_update`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          });
          if (limitResponse.ok) {
            const limitData = await limitResponse.json();
            setRemainingQueries(limitData.query_limit);
          } else {
            const getResponse = await fetch(`${API_URL}/query_limit`, {
              method: "GET",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            });
            if (getResponse.ok) {
              const getData = await getResponse.json();
              setRemainingQueries(getData.query_limit);
            }
          }
        } catch (error) {
          console.error("Error updating query limit:", error);
        }
      }
    } catch (error) {
      const errorMessage = { type: "llm-message", text: "Error querying the index: " + error.message };
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
        <div className="chatbot-content">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={msg.type} 
                style={{ whiteSpace: 'pre-wrap' }}>
                <div>{msg.text}</div>
                {msg.sources && <div dangerouslySetInnerHTML={{ __html: msg.sources }} />}
                {msg.molText && <div>{msg.molText}</div>}
                {msg.type === "llm-message" && msg.molecules && msg.molecules.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                    <button 
                      className="find-molecules-button" 
                      style={{ backgroundColor: '#ADD8E6', border: 'none', padding: '8px 12px', cursor: 'pointer' }}
                      onClick={() => handleFindMolecules(msg.molecules)}>
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
                    <button onClick={() => handleThumbsUp(msg.inputs, msg.text, msg.collapsibleContent)}>👍</button>
                    <button onClick={() => handleThumbsDown(msg.inputs, msg.text, msg.collapsibleContent)}>👎</button>
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
        {foundMolecules && foundMolecules.length > 0 && (
          <div className="found-molecules-container">
            <h3>LLM Found Molecules</h3>
            {foundMolecules.map((details, idx) => {
              return (
                <div key={idx} className="molecule-box" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f9f9f9' }}>
                  <strong>{details.name}</strong>
                  <p>SMILES: {details.SMILES}</p>
                  <p>Molecular weight: {details.MOLECULAR_WEIGHT}</p>
                  <p>HOMO: {details.HOMO} eV</p>
                  <p>LUMO: {details.LUMO} eV</p>
                  <p>ESP Max: {details.ESP_MAX} eV</p>
                  <p>ESP Min: {details.ESP_MIN} eV</p>
                  <p>Functional groups: {details.FUNCTIONAL_GROUPS}</p>
                  <p>Predicted MP: {details.PREDICTED_MP} °C</p>
                  <p>Predicted BP: {details.PREDICTED_BP} °C</p>
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
        {similarMolecules && similarMolecules.length > 0 && (
          <div className="similar-molecules-container" style={{ marginLeft: '20px' }}>
            <h3>Friends of {activeMolecule ? activeMolecule.name.toLowerCase() : ''} ranked by structure similarity</h3>
            {similarMolecules.map((item, idx) => {
              // Adjust based on your response structure (if using item.molecule_details or directly item)
              const details = item.molecule_details || item;
              return (
                <div key={idx} className="molecule-box" style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f9f9f9' }}>
                  <strong>SMILES: {details.SMILES}</strong>
                  <p>Molecular weight: {details.molecular_weight}</p>
                  <p>HOMO eV: {details.HOMO_eV} eV</p>
                  <p>LUMO eV: {details.LUMO_eV} eV</p>
                  <p>ESP Max: {details.ESP_max_eV} eV</p>
                  <p>ESP Min: {details.ESP_min_eV} eV</p>
                  <p>Functional groups: {details.functional_groups}</p>
                  <p>Predicted MP: {details.predicted_MP_celsius} °C</p>
                  <p>Predicted BP: {details.predicted_BP_celsius} °C</p>
                  {details.image && (
                    <img 
                      src={details.image} 
                      alt={`Structure of ${details.SMILE}`} 
                      style={{ width: '150px', height: '150px', marginTop: '10px', objectFit: 'contain' }} 
                    />
                  )}
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
          collapsibleContent={feedbackData.collapsibleContent}
          onClose={() => setShowFeedbackBox(false)}
        />
      )}
    </div>
  );
};


export default ChatbotInterface;