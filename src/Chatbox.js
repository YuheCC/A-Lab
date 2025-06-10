import React, { useState, useEffect, useRef, useMemo } from 'react';
import FeedbackBox from './components/FeedbackBox.js';
import './Chatbox.css';

import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authFetch, getAPIUrl } from './utils.js';
import { useAuthStore } from './providers/auth.js';
import { Tooltip } from '@mui/material';

const API_URL = getAPIUrl();

// New ChatInput component added for memoized chat input rendering
const ChatInput = React.memo(({ onSend, disabled, ignoreChatHistory, onIgnoreChatHistoryChange,
 disableLiteratureSearch, onDisableLiteratureSearchChange, userPermissions }) => {
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
          translate='no'
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
        <label htmlFor="ignoreChatHistory">
          Ignore chat history
        </label>
        {userPermissions === 'admin' && (
          <>
            <input 
              type="checkbox" 
              id="disableLiteratureSearch" 
              checked={disableLiteratureSearch}
              onChange={(e) => onDisableLiteratureSearchChange(e.target.checked)}
              style={{ marginLeft: '20px' }}
            />
            <label htmlFor="disableLiteratureSearch">
              Disable literature search
            </label>
          </>
        )}
      </div>
    </div>
  );
});

// Chatbot component
const ChatbotInterface = ({ messages, setMessages, remainingQueries, setRemainingQueries }) => {

  const userPermissions = useAuthStore(state => state.userPermissions);

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
  const [disableLiteratureSearch, setDisableLiteratureSearch] = useState(false);
  const [showFoundMolecules, setShowFoundMolecules] = useState(true);
  const [showSimilarMolecules, setShowSimilarMolecules] = useState(true);
  
  // Add new state for molecule feedback functionality
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMoleculeIndex, setFeedbackMoleculeIndex] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState(null); // 'up' or 'down'
  const [activeFindMessage, setActiveFindMessage] = useState(null);
  const [reasoningText, setReasoningText] = useState(null);
  
  // Add favorites state - remove unused states
  const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState({});

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
    const moleculeList = message.molecules || [];
    setSimilarMolecules([]);
    setFoundMolecules(null);
    setActiveMolecule(null);
    setShowFoundMolecules(true);
    try {
      setMoleculesLoading(true);
      const responses = await Promise.allSettled(
        moleculeList.map(async (mol) => {
          // Add the use_35m parameter when user has appropriate permissions
          let queryUrl = `${API_URL}/api/molecule_details?molecule=${encodeURIComponent(mol)}`;
          if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
            queryUrl += '&query_type=molecule&use_35m=true';
          }
          
          const res = await authFetch(queryUrl);
          return await res.json();
        })
      );

      // Filter out responses that indicate a successful molecule lookup.
      const validResponses = responses
        .filter(promise => promise.status === "fulfilled")
        .map(promise => promise.value)
        .filter(item => item.found);

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
      // Determine if user is high-tier
      const isHighTier = ["admin", "enterprise", "joint"].includes(userPermissions);
      // Extract original user query and LLM response
      const originalQuery = isHighTier
        ? (Array.isArray(activeFindMessage?.inputs)
            ? (activeFindMessage.inputs.filter(m => m.role === "user").pop() || {}).content
            : activeFindMessage?.inputs)
        : undefined;
      const llmResponse = isHighTier ? activeFindMessage?.text : undefined;
      // Build selected molecule string if high-tier
      const selectedMoleculeStr = isHighTier
        ? [
            `Name: ${details.name}`,
            `SMILES: ${details.SMILES}`,
            `Molecular weight: ${details.MOLECULAR_WEIGHT}`,
            `HOMO eV: ${details.HOMO}`,
            `LUMO eV: ${details.LUMO}`,
            `ESP Max: ${details.ESP_MAX}`,
            `ESP Min: ${details.ESP_MIN}`,
            `Functional groups: ${JSON.stringify(details.FUNCTIONAL_GROUPS)}`,
            `Predicted MP: ${details.PREDICTED_MP} °C`,
            `Predicted BP: ${details.PREDICTED_BP} °C`
          ].join("\n")
        : undefined;
      // Construct request payload
      const payload = {
        smiles: details.SMILES,
        use_35m: isHighTier,
        ...(isHighTier && { query: originalQuery, response: llmResponse, selected_molecule_str: selectedMoleculeStr })
      };
      // Perform POST request
      const response = await authFetch(
        `${API_URL}/find-friend-with-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
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
          const response = await authFetch(`${API_URL}/query_limit`, {
            method: "GET",
            headers: { 
              "Content-Type": "application/json"
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
      const response = await authFetch(`${API_URL}/rag`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messagesToSend,
          maxOutputLength: 8192, // deprecated
          ragEnabled: !disableLiteratureSearch,
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
        await authFetch(`${API_URL}/api/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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

  // Function to handle adding molecule to favorites
  const handleAddToFavorites = async (molecule) => {
    // Remove global loading state
    // Use SMILES as unique identifier for the molecule
    const smiles = molecule.SMILES || molecule.smiles;
    
    // Update state for just this specific molecule
    setMoleculeFavoriteStatus(prev => ({
      ...prev,
      [smiles]: { loading: true, success: null, error: null }
    }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to add favorites');
      }

      // Prepare favorite data from molecule properties
      const favoriteData = {
        smiles: smiles,
        molecular_weight: molecule.MOLECULAR_WEIGHT || molecule.molecular_weight || null,
        homo_ev: molecule.HOMO || molecule.HOMO_eV || null,
        lumo_ev: molecule.LUMO || molecule.LUMO_eV || null,
        esp_min_ev: molecule.ESP_MIN || molecule.ESP_min_eV || null,
        esp_max_ev: molecule.ESP_MAX || molecule.ESP_max_eV || null,
        predicted_melting_point: molecule.PREDICTED_MP || molecule.predicted_MP_celsius || null,
        predicted_boiling_point: molecule.PREDICTED_BP || molecule.predicted_BP_celsius || null,
        functional_groups: molecule.FUNCTIONAL_GROUPS || molecule.functional_groups || null,
        umap_x: molecule.UMAP_0 || null,
        umap_y: molecule.UMAP_1 || null
      };

      const response = await authFetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(favoriteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add to favorites');
      }

      const data = await response.json();
      
      // Check if the molecule was already in favorites
      if (data.message === "Molecule already in favorites") {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { loading: false, success: data.message, error: null }
        }));
      } else {
        // Set success for this specific molecule
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { loading: false, success: 'Molecule added to favorites successfully!', error: null }
        }));
      }
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { ...prev[smiles], success: null }
        }));
      }, 3000);
      
    } catch (error) {
      console.error('Error adding to favorites:', error);
      
      // Set error for this specific molecule
      setMoleculeFavoriteStatus(prev => ({
        ...prev,
        [smiles]: { loading: false, success: null, error: error.message || 'Failed to add to favorites' }
      }));
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { ...prev[smiles], error: null }
        }));
      }, 3000);
    }
  };

  return (
    <div className="chatbot-container">
      {reasoningText && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-button"
              onClick={() => setReasoningText(null)}
            >
              ×
            </button>
            <pre className="modal-pre">
              {reasoningText}
            </pre>
          </div>
        </div>
      )}
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
        <div className={`chatbot-content ${!showFoundMolecules && !showSimilarMolecules ? 'full-width' : 'with-molecules'}`}>
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.type}
                style={{ whiteSpace: 'pre-wrap' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
                {msg.molText && (
                  <div>
                    <br></br>
                    <strong>Detected chemical keywords in LLM response:</strong>
                    <br></br>
                  </div>
                )}
                {msg.molText && <div translate='no'>{msg.molText}</div>}
                {msg.type === "llm-message" && msg.molecules && msg.molecules.length > 0 && (
                  <div className="find-molecules-wrapper">
                    <button
                      className="find-molecules-button"
                      onClick={() => handleFindMolecules(msg)}>
                      Find Molecules
                    </button>
                    {moleculesLoading && (
                      <span className="searching-text">
                        searching our database
                        <span className="thinking-dots">
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
                  <div className="thumbs">
                    <button onClick={() => handleThumbsUp(msg.inputs, msg.text, msg.sources)}>👍</button>
                    <button onClick={() => handleThumbsDown(msg.inputs, msg.text, msg.sources)}>👎</button>
                    <Tooltip title="Copy" placement='bottom'>
                      <button
                        className="copy-btn"
                        onClick={() => {
                          // Create a temporary element and set its innerHTML to the message's text.
                          const tempEl = document.createElement('div');
                          tempEl.innerText = msg.text;
                          // Get the plain text version (which already has newlines)
                          const plainTextToCopy = tempEl.innerText;
                          // For markdown, copy plain text and also the markdown string as text/markdown
                          const blobText = new Blob([plainTextToCopy], { type: 'text/plain' });
                          const blobMarkdown = new Blob([msg.text], { type: 'text/markdown' });
                          const clipboardItem = new ClipboardItem({
                            'text/plain': blobText,
                            'text/markdown': blobMarkdown,
                          });
                          navigator.clipboard.write([clipboardItem])
                            .then(() => {
                              // Optionally update the button to indicate success.
                            })
                            .catch(err => console.error('Failed to copy:', err));
                        }}
                      >
                        📋
                      </button>
                    </Tooltip>
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
            disableLiteratureSearch={disableLiteratureSearch}
            onDisableLiteratureSearchChange={setDisableLiteratureSearch}
            userPermissions={userPermissions}
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
                <div key={idx} className="molecule-box">
                  <strong>{details.name}</strong>
                  <p>SMILES: {details.SMILES}</p>
                  <p>Molecular weight: {details.molecular_weight}</p>
                  <p>HOMO: {Number(details.HOMO_eV).toFixed(2)} eV</p>
                  <p>LUMO: {Number(details.LUMO_eV).toFixed(2)} eV</p>
                  <p>ESP Max: {Number(details.ESP_max_eV).toFixed(2)} eV</p>
                  <p>ESP Min: {Number(details.ESP_min_eV).toFixed(2)} eV</p>
                  <p>Functional groups: {details.functional_groups}</p>
                  {/* <p>UMAP_X: {details.UMAP_0 !== undefined && details.UMAP_0 !== null ? details.UMAP_0.toFixed(2) : 'N/A'}</p>
                  <p>UMAP_Y: {details.UMAP_1 !== undefined && details.UMAP_1 !== null ? details.UMAP_1.toFixed(2) : 'N/A'}</p> */}
                  {(userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                    <>
                      <p>Predicted MP: {details.predicted_MP_celsius} °C</p>
                      <p>Predicted BP: {details.predicted_BP_celsius} °C</p>
                    </>
                  )}
                  {details.image && (
                    <img 
                      src={details.image} 
                      alt={`Structure of ${details.SMILE}`} 
                      className="molecule-image"
                    />
                  )}
                  <div className="molecule-actions">
                    <button 
                      className="find-similar-molecules-button"
                      onClick={() => handleFindSimilarMolecules(details)}
                    >
                      Find Similar Molecules
                    </button>
                    
                    {/* Add to Favorites button */}
                    <button
                      className="favorites-button"
                      onClick={() => handleAddToFavorites(details)}
                      disabled={moleculeFavoriteStatus[details.SMILES]?.loading}
                    >
                      {moleculeFavoriteStatus[details.SMILES]?.loading ? 'Saving...' : 'Add to Favorites ★'}
                    </button>
                    
                    {similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === details.SMILES && (
                      <span className="searching-text">
                        searching
                        <span className="thinking-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </span>
                      </span>
                    )}
                  </div>
                  
                  {/* Replace global favorite status messages with molecule-specific ones */}
                  {moleculeFavoriteStatus[details.SMILES]?.success && (
                    <div className="success-message">
                      {moleculeFavoriteStatus[details.SMILES].success}
                    </div>
                  )}
                  
                  {moleculeFavoriteStatus[details.SMILES]?.error && (
                    <div className="error-message">
                      {moleculeFavoriteStatus[details.SMILES].error}
                    </div>
                  )}
                </div>
              );
              })
            }
          </div>
        )}
        {similarMolecules && similarMolecules.length > 0 && showSimilarMolecules && (
          <div className="similar-molecules-container">
            <div className="molecules-header">
              <h3>Friends ranked by likelihood to replace {activeMolecule ? activeMolecule.name.toLowerCase() : ''}</h3>
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
                <div key={idx} className="molecule-box">
                  <p><strong>SMILES: {details.SMILES}</strong></p>
                  {details.grade != null && (
                    <p style={{ display: 'inline' }}>
                      LLM Grade: {details.grade}/10
                      {details.reasoning != null && (
                        <button
                          className="reasoning-button"
                          onClick={() => setReasoningText(details.reasoning)}
                        >
                          ?
                        </button>
                      )}
                    </p>
                  )}
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
                      className="molecule-image"
                    />
                  )}
                  
                  {/* Add molecule feedback buttons */}
                  <div className="molecule-feedback-buttons">
                    <div>
                      <span>Rate this match:</span>
                      <button onClick={() => handleMoleculeThumbsUp(idx)}>
                        👍
                      </button>
                      <button onClick={() => handleMoleculeThumbsDown(idx)}>
                        👎
                      </button>
                    </div>

                    {feedbackOpen && feedbackMoleculeIndex === idx && (
                      <div className="feedback-form">
                        <p>
                          {feedbackType === 'up'
                            ? 'What makes this a good match?'
                            : 'Why is this not a good match?'}
                        </p>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          rows={4}
                          placeholder="Your feedback helps us improve molecule matching"
                        />
                        <div>
                          <button
                            className="cancel"
                            onClick={handleMoleculeFeedbackCancel}
                          >
                            Cancel
                          </button>
                          <button
                            className="submit"
                            onClick={handleMoleculeFeedbackSubmit}
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Replace global favorite status messages with molecule-specific ones in similar molecules section */}
                  {moleculeFavoriteStatus[details.SMILES]?.success && (
                    <div className="success-message">
                      {moleculeFavoriteStatus[details.SMILES].success}
                    </div>
                  )}
                  
                  {moleculeFavoriteStatus[details.SMILES]?.error && (
                    <div className="error-message">
                      {moleculeFavoriteStatus[details.SMILES].error}
                    </div>
                  )}
                  
                  {/* Add Favorites button at the bottom of the molecule box */}
                  <div className="favorites-container">
                    <button
                      className="favorites-button"
                      onClick={() => handleAddToFavorites(details)}
                      disabled={moleculeFavoriteStatus[details.SMILES]?.loading}
                    >
                      {moleculeFavoriteStatus[details.SMILES]?.loading ? 'Saving...' : 'Add to Favorites ★'}
                    </button>
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