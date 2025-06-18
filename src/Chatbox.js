import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import FeedbackBox from './components/FeedbackBox.js';
import './Chatbox.css';

import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authFetch, getAPIUrl } from './utils.js';
import { useAuthStore } from './providers/auth.js';
import { IconButton, Tooltip } from '@mui/material';
import {MolCard} from './components/MolCard';
import { useChatStore, useActiveChatData } from './providers/chat.js';
import { useShallow } from 'zustand/react/shallow';
import MoleculeFeedbackBox from './components/MoleculeFeedbackBox/index.js';
import CustomButton from './components/CustomButton/index.js';
import { Copy, Info, MessageCircle, Search, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { ChatHistorySidebar } from './components/ChatHistorySidebar/index.js';

const API_URL = getAPIUrl();

// New ChatInput component added for memoized chat input rendering
const ChatInput = React.memo(({ onSend, disabled, ignoreChatHistory, onIgnoreChatHistoryChange,
 disableLiteratureSearch, onDisableLiteratureSearchChange, userPermissions }) => {
  const [inputValue, setInputValue] = React.useState("");
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setInputValue(e.target.value);

    // Auto-resize textarea
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto'; // Reset height to auto to shrink if needed
    textareaRef.current.style.height = (textareaRef.current.scrollHeight - 20) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim()) {
        onSend(inputValue);
        setInputValue("");

        // Reset height after sending
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleClickSend = () => {
    if (inputValue.trim()) {
      onSend(inputValue);
      setInputValue("");

      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  return (
    <div className="chat-input-group">
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          translate='no'
          className="chat-input"
          placeholder="Ask me anything, as long as it's about batteries, battery chemistry, or related topics."
          rows={1}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          style={{
            resize: 'none',
            overflowY: 'scroll',
            minHeight: '10px',
            maxHeight: '200px',
          }}
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
const ChatbotInterface = ({ remainingQueries, setRemainingQueries }) => {
  const { 
    messages, 
    activeMolecule,
    foundMolecules,
    similarMolecules,
    isThinking,
    thinkingStartedAt,
    moleculesLoading,
    similarMoleculesLoading,
  } = useActiveChatData();

  const { addMessage, setActiveMolecule, setFoundMolecules, setSimilarMolecules, loadHistory, isLoading, isSynced, setIsThinking, updateNewChatId, activeChat, setMoleculesLoading, setSimilarMoleculesLoading } = useChatStore(useShallow(state => ({
    addMessage: state.addMessage,
    setActiveMolecule: state.setActiveMolecule,
    setFoundMolecules: state.setFoundMolecules,
    setSimilarMolecules: state.setSimilarMolecules,
    loadHistory: state.loadHistory,
    isLoading: state.isLoading,
    isSynced: state.isSynced,
    setIsThinking: state.setIsThinking,
    updateNewChatId: state.updateNewChatId,
    activeChat: state.activeChat,
    setMoleculesLoading: state.setMoleculesLoading,
    setSimilarMoleculesLoading: state.setSimilarMoleculesLoading,
  })));

  const userPermissions = useAuthStore(state => state.userPermissions);

  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const messagesEndRef = useRef(null);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [ignoreChatHistory, setIgnoreChatHistory] = useState(false);
  const [disableLiteratureSearch, setDisableLiteratureSearch] = useState(false);
  const [showFoundMolecules, setShowFoundMolecules] = useState(true);
  const [foundMoleculesMessageIndex, setFoundMoleculesMessageIndex] = useState(null);
  const [foundMoleculesError, setFoundMoleculesError] = useState(null);
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

  // Timer for thinking message
  useEffect(() => {
    let interval = null;
    if (thinkingStartedAt && isThinking) {
      const timeElapsed = Math.floor((Date.now() - new Date(thinkingStartedAt).getTime()) / 1000);
      setThinkingTime(timeElapsed);
      interval = setInterval(() => {
        setThinkingTime(time => time + 1);
      }, 1000);
    } else {
      setThinkingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [thinkingStartedAt, isThinking]);

  // Define handlers for thumbs feedback
  const handleThumbsUp = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ isPositive: true, inputContent: inputContent, responseContent: responseContent, contextContent1 });
    setShowFeedbackBox(true);
  };

  const handleThumbsDown = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ isPositive: false, inputContent: inputContent, responseContent: responseContent, contextContent1 });
    setShowFeedbackBox(true);
  };

  
  const handleFindMolecules = async (message, index) => {
    setFoundMoleculesMessageIndex(index);
    setActiveFindMessage(message);
    const moleculeList = message.molecules || [];
    setSimilarMolecules([]);
    setFoundMolecules(null);
    setActiveMolecule(null);
    setShowFoundMolecules(true);
    setFoundMoleculesError(null);
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

      if (flattenedMolecules.length === 0) {
        setMoleculesLoading(false, activeChat);
        setFoundMoleculesError("No molecules found.");
      } else {
        setFoundMolecules(flattenedMolecules, activeChat);
        setFoundMoleculesError(null);
      }
    } catch (err) {
      console.error("Error fetching molecule details:", err);
      setFoundMoleculesError("Failed to find molecules. Please try again later.");
    } finally {
      setMoleculesLoading(false, activeChat);
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

      if (!response.ok) {
        throw new Error(data.detail || "Failed to find similar molecules");
      }
      setSimilarMolecules(data["similar_molecules"], activeChat);
    } catch (error) {
      console.error("Error finding similar molecules:", error);
    } finally {
      setSimilarMoleculesLoading(false, activeChat);
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

  useEffect(() => {
    // Load chat history
    if (!isSynced) {
      loadHistory();
    }
  }, [isSynced, loadHistory]);

  const handleSend = useCallback(async (input) => {
    if (!input.trim()) return;

    // For research users, check query limit
    if (userPermissions === 'research' && remainingQueries <= 0) {
      const errorMessage = { 
        type: "llm-message", 
        text: "You have reached your monthly query limit. Please contact an administrator for assistance." 
      };
      addMessage(errorMessage);
      return;
    }

    // Create new user message
    const newUserMessage = { type: "user-message", text: input.trim() };
    // Update the messages state
    const updatedMessages = [...messages, newUserMessage];
    addMessage(newUserMessage);

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

    const currentChat = activeChat ? parseInt(activeChat) : -1;
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
          chatId: activeChat ? parseInt(activeChat) : -1, 
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

      // Update chat ID if it is a new chat
      if (currentChat === -1)
        updateNewChatId(data.chat_id);

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
      
      // Add the LLM message to the chat history
      // - Need to specify chat_id because activeChat may have changed
      addMessage(llmMessage, data.chat_id);
      setIsThinking(false, data.chat_id);
      // setMessages(prev => [...prev, llmMessage]);

      // Update remaining queries based on server payload
      if (userPermissions === 'research' && data.remaining_queries !== undefined) {
        setRemainingQueries(data.remaining_queries);
      }
    } catch (error) {
      const errorMessage = { type: "llm-message", text: "Error: " + error.message };
      addMessage(errorMessage);
      setIsThinking(false, currentChat);
    } finally {
      if (currentChat !== -1) {
        setIsThinking(false, currentChat);
      }
    }
  }, [userPermissions, remainingQueries, messages, addMessage, ignoreChatHistory, activeChat, disableLiteratureSearch, updateNewChatId, setRemainingQueries]);

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
      <div className="chat-and-molecules">
        <ChatHistorySidebar/>
        <div className={`chatbot-content ${!showFoundMolecules && !showSimilarMolecules ? 'full-width' : 'with-molecules'}`}>
          {userPermissions === 'research' && (
            <div className="chatbot-header">
              <div className={`query-limit-display ${remainingQueries <= 3 ? 'warning' : ''} ${remainingQueries === 0 ? 'danger' : ''}`}>
                <MessageCircle size={18} className='query-limit-icon'></MessageCircle>
                <span>
                  Queries remaining this month: <span className="query-limit-count">{remainingQueries}</span>
                </span>
              </div>
            </div>
            )} 
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.type}
                style={{ whiteSpace: 'pre-wrap' }}>
                <div className='message-content'>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                  {msg.molText && msg.molecules && msg.molecules.length > 0 && (
                    <>
                      <div>
                        <br></br>
                        <strong>Detected chemical keywords in LLM response:</strong>
                        <br></br>
                      </div>
                      <div translate='no'>{msg.molText}</div>
                    </>
                  )}
                </div>
                {msg.type === "llm-message" && msg.molecules && msg.molecules.length > 0 && (
                  <div className="find-molecules-wrapper">
                    <CustomButton Icon={Search} onClick={() => handleFindMolecules(msg, index)} size="small" 
                      loading={foundMoleculesMessageIndex === index ? moleculesLoading : false} loadingText={"searching our database"}
                      errorMessage={foundMoleculesMessageIndex === index ? foundMoleculesError : null}
                      sideError
                      hideTime={10000} // 10 seconds
                      disabled={moleculesLoading && foundMoleculesMessageIndex !== index}
                      style={{ marginRight: 10 }}>
                      Find Molecules
                    </CustomButton>
                  </div>
                )}
                {/* Add thumbs buttons for feedback */}
                {msg.type === "llm-message" && (
                  <div className="thumbs">
                    <IconButton
                      onClick={() => handleThumbsUp(msg.inputs, msg.text, msg.sources)}
                      size="small"
                      style={{ marginRight: 5 }} variant="contained">
                        <ThumbsUp size={18} style={{ margin: 4}} />
                      </IconButton>
                    <IconButton
                      onClick={() => handleThumbsDown(msg.inputs, msg.text, msg.sources)}
                      size="small"
                      style={{ marginRight: 5 }} variant="contained">
                        <ThumbsDown size={18} style={{ margin: 4}} />
                      </IconButton>
                    <Tooltip title="Copy" placement='bottom'>
                      <IconButton
                        size="small"
                        style={{ marginRight: 5 }}
                        variant="contained"
                        className="copy-btn"
                        onClick={(evt) => {
                          // Extract the message html from the event target
                          const messageElement = evt.target.closest('.llm-message').querySelector('.message-content');

                          // Create a temporary element and set its innerHTML to the message's text.
                          const tempEl = document.createElement('div');
                          tempEl.innerText = msg.text;

                          // Get the plain text version (which already has newlines)
                          const plainTextToCopy = tempEl.innerText;

                          // Sanitize the HTML in case the backend returns unusual HTML
                          const htmlToCopy = messageElement.innerHTML ? DOMPurify.sanitize(messageElement.innerHTML, {
                            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
                            ALLOWED_ATTR: ['href', 'target']
                          }) : msg.text;

                          // For markdown, copy plain text and also the markdown string as text/markdown
                          const blobText = new Blob([plainTextToCopy], { type: 'text/plain' });
                          const blobHtml = new Blob([htmlToCopy], { type: 'text/html' });
                          const clipboardItem = new ClipboardItem({
                            'text/plain': blobText,
                            'text/html': blobHtml,
                          });
                          navigator.clipboard.write([clipboardItem])
                            .then(() => {
                              // Optionally update the button to indicate success.
                            })
                            .catch(err => console.error('Failed to copy:', err));
                        }}
                      >
                        <Copy size={18} style={{ margin: 4 }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
            {isThinking && (
              <div className="thinking-message">
                <span>thinking for {thinkingTime} second{thinkingTime !== 1 ? 's' : ''}</span>
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
            disabled={(userPermissions === 'research' && remainingQueries <= 0) || isThinking || isLoading || !isSynced}
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
                onClick={() => {
                  setShowFoundMolecules(false);
                  setFoundMolecules([]);
                  setActiveMolecule(null);
                  setFoundMoleculesError(null);
                  setFoundMoleculesMessageIndex(null);
                }}
              >
                ×
              </button>
            </div>
            {foundMolecules.map((details, idx) => {
              return <MolCard
                key={idx}
                vertical={true}
                name={details.name}
                large={true}
                style={{ margin: 5 }}
                propGroups={[
                  { label: 'SMILES', value: details.SMILES, span: 2 },
                  { label: 'Molecular Weight', value: details.molecular_weight, span: 2, suffix: ' g/mol' },
                  { label: 'Predicted Melting Point', value: details.predicted_MP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                   },
                  { label: 'Predicted Boiling Point', value: details.predicted_BP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                   },
                  { label: 'HOMO', value: details.HOMO_eV, span: 1, suffix: ' eV' },
                  { label: 'LUMO', value: details.LUMO_eV, span: 1, suffix: ' eV' },
                  { label: 'ESP Max', value: details.ESP_max_eV, span: 1, suffix: ' eV' },
                  { label: 'ESP Min', value: details.ESP_min_eV, span: 1, suffix: ' eV' },
                ]} foldPropGroups={[
                  { label: 'UMAP X', value: details.UMAP_0, span: 2 },
                  { label: 'UMAP Y', value: details.UMAP_1, span: 2 },
                  { label: 'Functional Groups', value: JSON.parse(details.functional_groups ?? "[]"), span: 4 },
                ]}>
                  <div className="molecule-actions">
                    {/* Add to Favorites button */}
                    <CustomButton Icon={Star} onClick={() => handleAddToFavorites(details)}
                      fullWidth
                      loading={moleculeFavoriteStatus[details.SMILES]?.loading}
                      loadingText={"Saving ..."}
                      successMessage={moleculeFavoriteStatus[details.SMILES]?.success}
                      errorMessage={moleculeFavoriteStatus[details.SMILES]?.error} size="small">
                      Add To Favorites
                    </CustomButton>
                    <CustomButton Icon={Search} color="secondary" onClick={() => handleFindSimilarMolecules(details)}
                      fullWidth
                      loading={similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === details.SMILES}
                      loadingText={"Searching for friends"}
                      size="small">
                      Find Similar Molecules
                    </CustomButton>
                  </div>
                </MolCard>
              })
            }
          </div>
        )}
        {similarMolecules && similarMolecules.length > 0 && showSimilarMolecules && (
          <div className="similar-molecules-container">
            <div className="molecules-header">
                <h3>Friends ranked by likelihood to replace: {activeMolecule ? activeMolecule.name.toLowerCase() : ''}</h3>
              <button 
                className="close-molecules-button"
                onClick={() => {
                  setShowSimilarMolecules(false);
                  setSimilarMolecules([]);
                  setActiveMolecule(null);
                }}
              >
                ×
              </button>
            </div>
            {similarMolecules.map((item, idx) => {
              // Adjust based on your response structure (if using item.molecule_details or directly item)
              const details = item.molecule_details || item;

              return <MolCard
                key={idx}
                vertical={true}
                name={details.SMILES}
                large={true}
                style={{ margin: 5 }}
                propGroups={[
                  { label: 'LLM Grade', value: details.grade, span: 2, suffix: '/10', action: (details.reasoning ?
                    <IconButton onClick={() => {
                          setReasoningText(details.reasoning);
                        }} style={{ marginLeft: 5 }} size="small">
                      <Info size={18} style={{ margin: 2 }}/>
                    </IconButton> : null
                  ), show: details.grade !== null && details.grade !== undefined },
                  { label: 'SMILES', value: details.SMILES, span: 2 },
                  { label: 'Molecular Weight', value: details.molecular_weight, span: 2, suffix: ' g/mol' },
                  { label: 'Predicted Melting Point', value: details.predicted_MP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                   },
                  { label: 'Predicted Boiling Point', value: details.predicted_BP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                   },
                   {
                    label: 'HOMO', value: details.HOMO_eV, span: 1, suffix: ' eV'
                   },
                   {
                    label: 'LUMO', value: details.LUMO_eV, span: 1, suffix: ' eV'
                   },
                   {
                    label: 'ESP Min', value: details.ESP_min_eV, span: 1, suffix: ' eV'
                   },
                    {
                      label: 'ESP Max', value: details.ESP_max_eV, span: 1, suffix: ' eV'
                    },
                  ]} foldPropGroups={[
                    { label: 'Functional Groups', value: JSON.parse(details.functional_groups ?? "[]"), span: 4 }
                  ]}>
                <div className='molecule-actions'>

                  <CustomButton Icon={Star} onClick={() => handleAddToFavorites(details)}
                    loading={moleculeFavoriteStatus[details.SMILES]?.loading}
                    fullWidth
                    loadingText={"Saving ..."}
                    successMessage={moleculeFavoriteStatus[details.SMILES]?.success}
                    errorMessage={moleculeFavoriteStatus[details.SMILES]?.error} size="small">
                    Add To Favorites
                  </CustomButton>
                  {/* Add Favorites button at the bottom of the molecule box */}
                  <MoleculeFeedbackBox
                    fullWidth={true}
                    molecule={details}
                    lastSearch={activeMolecule}
                    onClose={() => { }}
                  />
                </div>
              </MolCard>
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