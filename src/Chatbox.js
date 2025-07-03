import React, { useState, useEffect, useRef, useCallback } from 'react';
import streamSSE from "./components/streamSSE.js";

import FeedbackBox from './components/FeedbackBox.js';
import './Chatbox.css';

import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authFetch, COMMERCIAL_SCORE_MAP, getAPIUrl } from './utils.js';
import { useAuthStore } from './providers/auth.js';
import { IconButton, Tooltip } from '@mui/material';
import {MolCard} from './components/MolCard/index.js';
import { useChatStore, useActiveChatData } from './providers/chat.js';
import { useShallow } from 'zustand/react/shallow';
import MoleculeFeedbackBox from './components/MoleculeFeedbackBox/index.js';
import CustomButton from './components/CustomButton/index.js';
import { Copy, ExternalLink, Info, MessageCircle, Search, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { ChatHistorySidebar } from './components/ChatHistorySidebar/index.js';
import { useTranslation } from 'react-i18next';
import { InlineMoleculeRenderer } from './components/InlineMoleculeRenderer.js';

const API_URL = getAPIUrl();

// Helper function to check if content contains inline molecules
const hasInlineMolecules = (content) => {
  return /<inline_molecule>\{.*?\}<\/inline_molecule>/g.test(content);
};

// Custom message content renderer that handles both markdown and inline molecules
const MessageContentRenderer = ({ content, onMoleculeClick }) => {
  if (hasInlineMolecules(content)) {
    // If content has inline molecules, render them with click capability
    return <InlineMoleculeRenderer content={content} onMoleculeClick={onMoleculeClick} />;
  } else {
    // Otherwise, render as normal markdown
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    );
  }
};

// New ChatInput component added for memoized chat input rendering
const ChatInput = React.memo(({ onSend, disabled, ignoreChatHistory, onIgnoreChatHistoryChange,
    disableLiteratureSearch, onDisableLiteratureSearchChange,
    userPermissions, useMultiAgent, onUseMultiAgentChange }) => {
  const [inputValue, setInputValue] = React.useState("");
  const textareaRef = useRef(null);
  const { t } = useTranslation();

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
      <div className={"chat-input-container " + (disabled ? "disabled" : "")}>
        <textarea
          ref={textareaRef}
          translate='no'
          className="chat-input"
          placeholder={t('chatbox.input.placeholder')}
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
          {t('chatbox.input.sendButton')}
        </button>
      </div>
      <div className="checkbox-group">
        <div className='checkbox-item'>
          <input 
            type="checkbox" 
            id="ignoreChatHistory" 
            checked={ignoreChatHistory}
            onChange={(e) => onIgnoreChatHistoryChange(e.target.checked)}
          />
          <label htmlFor="ignoreChatHistory">
            {t('chatbox.checkboxes.ignoreChatHistory')}
          </label>
        </div>
        {['enterprise', 'admin', 'joint'].includes(userPermissions) && (
          <div className='checkbox-item'>
            <input
              type="checkbox"
              id="useMultiAgent"
              checked={useMultiAgent}
              onChange={e => onUseMultiAgentChange(e.target.checked)}
              style={{ marginLeft: '20px' }}
            />
            <label htmlFor="useMultiAgent">
              {t('chatbox.checkboxes.enterDeepSpace')}
              <Tooltip
                title={t('chatbox.checkboxes.deepSpaceTooltip')}
                placement="top"
              >
                <Info size={18} style={{ cursor: 'help', marginLeft: '4px' }} />
              </Tooltip>
            </label>
          </div>
        )}
        {userPermissions === 'admin' && (
          <div className='admin-controls' style={{ marginLeft: 'auto' }}>
            <label className='admin-controls-label'>{t('chatbox.checkboxes.admin')}</label>
            <div className='checkbox-item'>
              <input 
                type="checkbox" 
                id="disableLiteratureSearch" 
                checked={disableLiteratureSearch}
                onChange={(e) => onDisableLiteratureSearchChange(e.target.checked)}
              />
              <label htmlFor="disableLiteratureSearch">
                {t('chatbox.checkboxes.disableLiteratureSearch')}
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

const formatThinkingTime = (seconds) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds) || seconds < 0) {
    return "0 seconds";
  }
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
  }
}

// Chatbot component
const ChatbotInterface = ({ remainingQueries, setRemainingQueries }) => {
  const { t } = useTranslation();
  const { 
    messages, 
    activeMolecule,
    foundMolecules,
    similarMolecules,
    isThinking,
    thinkingStartedAt,
    moleculesLoading,
    similarMoleculesLoading,
    awaitingClarify,
    isInClarifyFlow,
    useMultiAgent
  } = useActiveChatData();

  const { addMessage, setActiveMolecule, setFoundMolecules, setSimilarMolecules, loadHistory, isLoading, isSynced, setIsThinking, updateNewChatId, activeChat, setMoleculesLoading, setSimilarMoleculesLoading, setAwaitingClarify, setUseMultiAgent, setIsInClarifyFlow } = useChatStore(useShallow(state => ({
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
    setAwaitingClarify: state.setAwaitingClarify,
    setUseMultiAgent: state.setUseMultiAgent,
    setIsInClarifyFlow: state.setIsInClarifyFlow,
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
  
  // State for selected molecule functionality
  const [selectedMolecule, setSelectedMolecule] = useState(null);
  const [showSelectedMolecule, setShowSelectedMolecule] = useState(false);
  
  // Add new state for molecule feedback functionality
  const [activeFindMessage, setActiveFindMessage] = useState(null);
  const [contextObject, setContextObject] = useState({
    contextContent1: "",
    contextContent2: "",
    contextContent3: "",
  });
  const [reasoningText, setReasoningText] = useState(null);
  
  // Add favorites state - remove unused states
  const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState({});

  useEffect(() => {
    // If awaitingClarify is true, set useMultiAgent to true
    if (awaitingClarify)
      setUseMultiAgent(awaitingClarify);
  }, [awaitingClarify, setUseMultiAgent]);

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

  // Define handlers for llm response thumbs feedback
  const handleThumbsUp = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ isPositive: true, inputContent: inputContent, responseContent: responseContent, contextContent1 });
    setShowFeedbackBox(true);
  };

  const handleThumbsDown = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ isPositive: false, inputContent: inputContent, responseContent: responseContent, contextContent1 });
    setShowFeedbackBox(true);
  };

  // Handler for when an inline molecule is clicked
  const handleMoleculeClick = (molecule) => {
    setSelectedMolecule(molecule);
    setShowSelectedMolecule(true);
    // Hide other molecule panels
    setShowFoundMolecules(false);
    setShowSimilarMolecules(false);
  };

  
  const handleFindMolecules = async (message, index) => {
    setFoundMoleculesMessageIndex(index);
    setActiveFindMessage(message);
    const moleculeList = message.molecules || [];
    setSimilarMolecules([]);
    setFoundMolecules([]);
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
        setFoundMoleculesError(t('chatbox.status.noMoleculesFound'));
      } else {
        setFoundMolecules(flattenedMolecules, activeChat);
        setFoundMoleculesError(null);
      }
    } catch (err) {
      console.error("Error fetching molecule details:", err);
      setFoundMoleculesError(t('chatbox.status.findMoleculesFailed'));
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
      const llmResponse = isHighTier ? activeFindMessage?.content : undefined;
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

  // Clear selected molecule state when switching chats
  useEffect(() => {
    setSelectedMolecule(null);
    setShowSelectedMolecule(false);
  }, [activeChat]);

  const handleSend = useCallback(
    async (input) => {
      if (!input.trim()) return;

      /* enforce research-tier quota */
      if (userPermissions === 'research' && remainingQueries <= 0) {
        addMessage({
          role : "assistant",
          content : t('chatbox.queryLimit.reachedLimit')
        });
        return;
      }

      /* push new user message */
      const newUserMessage = { role: "user", content: input.trim() };
      addMessage(newUserMessage);

      /* construct message list for the back-end */
      const messagesToSend = ignoreChatHistory
        ? [{ role: "user", content: input.trim() }]
        : [...messages, newUserMessage]
            .filter(m => m.role === "user" || m.role === "assistant");

      setIsThinking(true);
      const currentChatId   = activeChat ? parseInt(activeChat, 10) : -1;
      const isAdvancedTier  = ['admin', 'enterprise', 'joint'].includes(userPermissions);
      const ragModel        = isAdvancedTier ? 'o3'       : 'o4-mini';
      const ragResultsCount = isAdvancedTier ? 10          : 3;

      let data;          // final payload from the back-end
      let effectiveChatId = currentChatId;

      try {
        /* ---------------------------------------------------------- */
        /* MULTI-AGENT WORKFLOW                                      */
        /* ---------------------------------------------------------- */
        if (useMultiAgent) {

          /* 1️⃣  Second half of a clarification round --------------- */
          if (awaitingClarify) {
            const updatedHistory = [
              ...messages,
              { role: "user", content: input.trim() }
            ];
            
            setIsInClarifyFlow(false, effectiveChatId);

            const res = await authFetch(`${API_URL}/multi-agent`, {
              method : "POST",
              headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
              body   : JSON.stringify(({ messages: updatedHistory, chat_id: currentChatId })),
            });
            if (!res.ok) throw new Error(await res.text());

            for await (const evt of streamSSE(res)) {
              if (evt.answer || evt.error) {
                data = evt;
                break;
              }
            }

            setAwaitingClarify(false, effectiveChatId);

          /* 2️⃣  First contact – ask for clarifying questions -------- */
          } else {
            // Track whether we are in a clarification flow
            setIsInClarifyFlow(true, effectiveChatId);

            const clarRes = await authFetch(`${API_URL}/multi-agent/clarify`, {
              method : "POST",
              headers: { "Content-Type": "application/json" },
              body   : JSON.stringify(({ messages: messagesToSend, chat_id: currentChatId })),
            });
            if (!clarRes.ok) throw new Error(await clarRes.text());
            const clarData = await clarRes.json();

            // Update chat ID for new chat
            if (effectiveChatId === -1 && clarData.chat_id !== undefined) {
              updateNewChatId(clarData.chat_id);
              effectiveChatId = clarData.chat_id;
            }

            if (clarData.clarifying_questions?.length) {
              addMessage({
                role: "assistant",
                content: clarData.clarifying_questions,
              }, effectiveChatId);
              setAwaitingClarify(true, effectiveChatId);
              setIsThinking(false, effectiveChatId);
              return;                 // wait for user reply
            }

            setIsInClarifyFlow(false, effectiveChatId);

            /* 3️⃣  No clarifications – run Deep Space directly ---- */
            const res = await authFetch(`${API_URL}/multi-agent`, {
              method : "POST",
              headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
              body   : JSON.stringify({ messages: messagesToSend, chat_id: effectiveChatId }),
            });
            if (!res.ok) throw new Error(await res.text());

            for await (const evt of streamSSE(res)) {
              if (evt.answer || evt.error) {
                data = evt;
                break;
              }
            }
          }

        /* ---------------------------------------------------------- */
        /* NORMAL `/rag` WORKFLOW                                    */
        /* ---------------------------------------------------------- */
        } else {
          const res = await authFetch(`${API_URL}/rag`, {
            method : "POST",
            headers: { "Content-Type": "application/json" },
            body   : JSON.stringify({
              chatId          : currentChatId,
              messages        : messagesToSend,
              ragEnabled      : !disableLiteratureSearch,
              webSearchEnabled: false,
              webSearchClient : "Tavily",
              numRagResults   : ragResultsCount,
              model           : ragModel,
            }),
          });

          if (!res.ok) {
            const errText = await res.text();
            if (res.status === 400 &&
                errText.includes("Query is not relevant to batteries or battery chemistry"))
              throw new Error(t('chatbox.errors.batteryRelevance'));

            throw new Error(errText || t('chatbox.errors.networkError'));
          }
          data = await res.json();
        }

        /* ---------------------------------------------------------- */
        /* Common post-processing                                     */
        /* ---------------------------------------------------------- */
        if (data?.error) throw new Error(data.error);

        /* adopt/assign chat ID */
        if (effectiveChatId === -1 && data?.chat_id !== undefined) {
          updateNewChatId(data.chat_id);
          effectiveChatId = data.chat_id;
        }

        /* build LLM message */
        const llmMessage = {
          role     : "assistant",
          inputs   : data.inputs || null,
          content  : data.llmOutput || data.answer || "",
          sources  : data.source_html,
          molText  : data.molecule_text,
          molecules: data.molecules,
        };

        addMessage(llmMessage, effectiveChatId);
        setIsThinking(false, effectiveChatId);

        /* refresh quota for research tier */
        if (userPermissions === 'research' && data.remaining_queries !== undefined)
          setRemainingQueries(data.remaining_queries);

      } catch (err) {
        addMessage({ role: "assistant", content: "Error: " + err.message }, effectiveChatId);
        setIsThinking(false, effectiveChatId);
      } finally {
        if (effectiveChatId !== -1) setIsThinking(false, effectiveChatId);
      }
    },

    /* dependencies */
    [
      setIsThinking,
      userPermissions,
      remainingQueries,
      messages,
      addMessage,
      ignoreChatHistory,
      activeChat,
      disableLiteratureSearch,
      updateNewChatId,
      setRemainingQueries,
      useMultiAgent,
      awaitingClarify,
      setAwaitingClarify,
    ]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

      // Get the raw commercial score (numeric 0-3)
      const rawCommercialScore = molecule.COMMERCIAL_SCORE || molecule.commercial_score;
      
      // Convert commercial score from numeric to descriptive text
      const commercialScoreText = rawCommercialScore !== null && rawCommercialScore !== undefined 
        ? COMMERCIAL_SCORE_MAP[rawCommercialScore] || null
        : null;

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
        predicted_fp_celsius: molecule.PREDICTED_FP || molecule.PREDICTED_FP_CELSIUS || molecule.predicted_FP_celsius || molecule.predicted_fp_celsius || null,
        combustion_enthalpy_ev: molecule.COMBUSTION_ENTHALPY_EV || molecule.combustion_enthalpy_ev || null,
        commercial_score: commercialScoreText,
        commercial_link: molecule.COMMERCIAL_LINK || molecule.commercial_link || null,
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
        throw new Error(errorData.detail || t('chatbox.errors.addToFavoritesError'));
      }

      const data = await response.json();
      
      // Check if the molecule was already in favorites
      if (data.message === "Molecule already in favorites") {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { loading: false, success: t('chatbox.success.alreadyInFavorites'), error: null }
        }));
      } else {
        // Set success for this specific molecule
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { loading: false, success: t('chatbox.success.addedToFavorites'), error: null }
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
        [smiles]: { loading: false, success: null, error: error.message || t('chatbox.errors.addToFavoritesError') }
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

  useEffect(() => {
    // Extract feedback context information from the source message
    const rawInputs = activeFindMessage?.inputs;
    const contextContent1 = Array.isArray(rawInputs)
      ? rawInputs.filter(m => m.role === "user").pop()?.content || ""
      : rawInputs || "";
    const contextContent2 = activeFindMessage?.content || "";
    const contextContent3 = activeFindMessage?.sources || "";

    setContextObject({
      contextContent1: contextContent1,
      contextContent2: contextContent2,
      contextContent3: contextContent3,
    });

  }, [activeFindMessage])

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
        <ChatHistorySidebar compressed={foundMolecules?.length > 0 && similarMolecules?.length > 0}/>
        <div className={`chatbot-content ${!showFoundMolecules && !showSimilarMolecules ? 'full-width' : 'with-molecules'}`}>
          {userPermissions === 'research' && (
            <div className="chatbot-header">
              <div className={`query-limit-display ${remainingQueries <= 3 ? 'warning' : ''} ${remainingQueries === 0 ? 'danger' : ''}`}>
                <MessageCircle size={18} className='query-limit-icon'></MessageCircle>
                <span>
                  {t('chatbox.queryLimit.queriesRemaining')} <span className="query-limit-count">{remainingQueries}</span>
                </span>
              </div>
            </div>
            )} 
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-${msg.role}`}
                style={{ whiteSpace: 'pre-wrap' }}>
                <div className='message-content'>
                  <MessageContentRenderer content={msg.content} onMoleculeClick={handleMoleculeClick} />
                </div>

                {/* Add thumbs buttons for feedback */}
                {msg.role === "assistant" && (
                  <div className="thumbs">
                    <IconButton
                      onClick={() => handleThumbsUp(msg.inputs, msg.content, msg.sources)}
                      size="small"
                      style={{ marginRight: 5 }} variant="contained">
                        <ThumbsUp size={18} style={{ margin: 4}} />
                      </IconButton>
                    <IconButton
                      onClick={() => handleThumbsDown(msg.inputs, msg.content, msg.sources)}
                      size="small"
                      style={{ marginRight: 5 }} variant="contained">
                        <ThumbsDown size={18} style={{ margin: 4}} />
                      </IconButton>
                    <Tooltip title={t('chatbox.buttons.copy')} placement='bottom'>
                      <IconButton
                        size="small"
                        style={{ marginRight: 5 }}
                        variant="contained"
                        className="copy-btn"
                        onClick={(evt) => {
                          // Extract the message html from the event target
                          const messageElement = evt.target.closest('.message-assistant').querySelector('.message-content');

                          // Create a temporary element and set its innerHTML to the message's text.
                          const tempEl = document.createElement('div');
                          tempEl.innerText = msg.content;

                          console.log("Copying message:", tempEl.innerText);

                          // Get the plain text version (which already has newlines)
                          const plainTextToCopy = tempEl.innerText;

                          // Sanitize the HTML in case the backend returns unusual HTML
                          const htmlToCopy = messageElement.innerHTML ? DOMPurify.sanitize(messageElement.innerHTML, {
                            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'hr', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                            ALLOWED_ATTR: ['href', 'target']
                          }) : msg.content;

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
                <div className='thinking-header'>
                  <span>{t('chatbox.status.thinking')} {formatThinkingTime(thinkingTime)}</span>
                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
                {useMultiAgent && 
                  <div className="thinking-note">
                    <Info size={16} style={{ margin: 3, marginRight: 10 }} />
                    <span>
                      {isInClarifyFlow ? t('chatbox.status.clarifyingQuestions') : t('chatbox.status.deepSpaceWorking')}
                    </span>
                  </div>
                }
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
            useMultiAgent={useMultiAgent}
            onUseMultiAgentChange={setUseMultiAgent}
          />
        </div>
        {foundMolecules && foundMolecules.length > 0 && showFoundMolecules && (
          <div className="found-molecules-container">
            <div className="molecules-header">
              <h3>{t('chatbox.molecules.llmFoundMolecules')}</h3>
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
                  {
                    label: 'Predicted Flash Point', value: details.predicted_FP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                  },
                  {
                    label: 'Combustion Enthalpy', value: details.COMBUSTION_ENTHALPY_EV, span: 2, suffix: ' eV',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                  },
                  { label: 'HOMO', value: details.HOMO_eV, span: 1, suffix: ' eV' },
                  { label: 'LUMO', value: details.LUMO_eV, span: 1, suffix: ' eV' },
                  { label: 'ESP Max', value: details.ESP_max_eV, span: 1, suffix: ' eV' },
                  { label: 'ESP Min', value: details.ESP_min_eV, span: 1, suffix: ' eV' },
                  {
                    label: 'Commercial Viability', value: COMMERCIAL_SCORE_MAP[details.COMMERCIAL_SCORE], span: 4, wrap: true
                  }
                ]} foldPropGroups={[
                  { label: 'Functional Groups', value: JSON.parse(details.functional_groups ?? "[]"), span: 4 },
                ]}>
                  <div className="molecule-actions">
                    {/* Add to Favorites button */}
                    <CustomButton Icon={Star} onClick={() => handleAddToFavorites(details)}
                      fullWidth
                      loading={moleculeFavoriteStatus[details.SMILES]?.loading}
                      loadingText={t('chatbox.molecules.saving')}
                      successMessage={moleculeFavoriteStatus[details.SMILES]?.success}
                      errorMessage={moleculeFavoriteStatus[details.SMILES]?.error} size="small">
                      {t('chatbox.buttons.addToFavorites')}
                    </CustomButton>
                    <CustomButton Icon={Search} color="secondary" onClick={() => handleFindSimilarMolecules(details)}
                      fullWidth
                      loading={similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === details.SMILES}
                      loadingText={t('chatbox.molecules.searchingForFriends')}
                      size="small">
                      {t('chatbox.buttons.findSimilarMolecules')}
                    </CustomButton>
                    {false && details.COMMERCIAL_LINK && <CustomButton Icon={ExternalLink} size="small" fullWidth variant="outlined" onClick={() => {
                        window.open(details.COMMERCIAL_LINK, '_blank', 'noopener,noreferrer');
                    }}>
                        {t('chatbox.buttons.viewInMolPort')}
                    </CustomButton>}
                  </div>
                </MolCard>
              })
            }
          </div>
        )}
        {selectedMolecule && showSelectedMolecule && (
          <div className="found-molecules-container">
            <div className="molecules-header">
              <h3>Selected Molecule</h3>
              <button 
                className="close-molecules-button"
                onClick={() => {
                  setShowSelectedMolecule(false);
                  setSelectedMolecule(null);
                }}
              >
                ×
              </button>
            </div>
            <MolCard
              vertical={true}
              name={selectedMolecule.name}
              large={true}
              style={{ margin: 5 }}
              propGroups={[
                { label: 'SMILES', value: selectedMolecule.SMILES, span: 2 },
                { label: 'Molecular Weight', value: selectedMolecule.molecular_weight, span: 2, suffix: ' g/mol' },
                { label: 'Predicted Melting Point', value: selectedMolecule.predicted_MP_celsius, span: 2, suffix: ' °C',
                  show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                 },
                { label: 'Predicted Boiling Point', value: selectedMolecule.predicted_BP_celsius, span: 2, suffix: ' °C',
                  show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                 },
                {
                  label: 'Predicted Flash Point', value: selectedMolecule.predicted_FP_celsius, span: 2, suffix: ' °C',
                  show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                },
                {
                  label: 'Combustion Enthalpy', value: selectedMolecule.COMBUSTION_ENTHALPY_EV, span: 2, suffix: ' eV',
                  show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                },
                { label: 'HOMO', value: selectedMolecule.HOMO_eV, span: 1, suffix: ' eV' },
                { label: 'LUMO', value: selectedMolecule.LUMO_eV, span: 1, suffix: ' eV' },
                { label: 'ESP Max', value: selectedMolecule.ESP_max_eV, span: 1, suffix: ' eV' },
                { label: 'ESP Min', value: selectedMolecule.ESP_min_eV, span: 1, suffix: ' eV' },
                {
                  label: 'Commercial Viability', value: COMMERCIAL_SCORE_MAP[selectedMolecule.COMMERCIAL_SCORE], span: 4, wrap: true
                }
              ]} foldPropGroups={[
                { label: 'Functional Groups', value: JSON.parse(selectedMolecule.functional_groups ?? "[]"), span: 4 },
              ]}>
                <div className="molecule-actions">
                  {/* Add to Favorites button */}
                  <CustomButton Icon={Star} onClick={() => handleAddToFavorites(selectedMolecule)}
                    fullWidth
                    loading={moleculeFavoriteStatus[selectedMolecule.SMILES]?.loading}
                    loadingText={"Saving ..."}
                    successMessage={moleculeFavoriteStatus[selectedMolecule.SMILES]?.success}
                    errorMessage={moleculeFavoriteStatus[selectedMolecule.SMILES]?.error} size="small">
                    { t('chatbox.buttons.addToFavorites')}
                  </CustomButton>
                  <CustomButton Icon={Search} color="secondary" onClick={() => handleFindSimilarMolecules(selectedMolecule)}
                    fullWidth
                    loading={similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === selectedMolecule.SMILES}
                    loadingText={"Searching for friends"}
                    size="small">
                    {t('chatbox.buttons.findSimilarMolecules')}
                  </CustomButton>
                  {false && selectedMolecule.COMMERCIAL_LINK && <CustomButton Icon={ExternalLink} size="small" fullWidth variant="outlined" onClick={() => {
                      window.open(selectedMolecule.COMMERCIAL_LINK, '_blank', 'noopener,noreferrer');
                  }}>
                      View in MolPort
                  </CustomButton>}
                </div>
              </MolCard>
          </div>
        )}
        {similarMolecules && similarMolecules.length > 0 && showSimilarMolecules && (
          <div className="similar-molecules-container">
            <div className="molecules-header">
              <h3>
                {t('chatbox.molecules.friendsRankedBy')}&nbsp;
                {((activeMolecule?.name || activeMolecule?.SMILES || '')).toLowerCase()}
              </h3>
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
                  {
                    label: 'LLM Grade', value: details.grade, span: 2, suffix: '/10', action: (details.reasoning ?
                      <IconButton onClick={() => {
                        setReasoningText(details.reasoning);
                      }} style={{ marginLeft: 5 }} size="small">
                        <Info size={18} style={{ margin: 2 }} />
                      </IconButton> : null
                    ), show: details.grade !== null && details.grade !== undefined
                  },
                  { label: 'SMILES', value: details.SMILES, span: 2 },
                  { label: 'Molecular Weight', value: details.molecular_weight, span: 2, suffix: ' g/mol' },
                  {
                    label: 'Predicted Melting Point', value: details.predicted_MP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                  },
                  {
                    label: 'Predicted Boiling Point', value: details.predicted_BP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                  },
                  {
                    label: 'Predicted Flash Point', value: details.predicted_FP_celsius, span: 2, suffix: ' °C',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                  },
                  {
                    label: 'Combustion Enthalpy', value: details.COMBUSTION_ENTHALPY_EV, span: 2, suffix: ' eV',
                    show: userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint'
                  },
                  { label: 'HOMO', value: details.HOMO_eV, span: 1, suffix: ' eV' },
                  { label: 'LUMO', value: details.LUMO_eV, span: 1, suffix: ' eV' },
                  { label: 'ESP Min', value: details.ESP_min_eV, span: 1, suffix: ' eV' },
                  { label: 'ESP Max', value: details.ESP_max_eV, span: 1, suffix: ' eV' },
                  {
                    label: '', value: COMMERCIAL_SCORE_MAP[details.COMMERCIAL_SCORE], span: 4, wrap: true
                  }
                  ]} foldPropGroups={[
                    { label: 'Functional Groups', value: JSON.parse(details.functional_groups ?? "[]"), span: 4 }
                  ]}>
                <div className='molecule-actions'>

                  <CustomButton Icon={Star} onClick={() => handleAddToFavorites(details)}
                    loading={moleculeFavoriteStatus[details.SMILES]?.loading}
                    fullWidth
                    loadingText={t('chatbox.molecules.saving')}
                    successMessage={moleculeFavoriteStatus[details.SMILES]?.success}
                    errorMessage={moleculeFavoriteStatus[details.SMILES]?.error} size="small">
                    {t('chatbox.buttons.addToFavorites')}
                  </CustomButton>
                  {/* Add Favorites button at the bottom of the molecule box */}
                  <MoleculeFeedbackBox
                    fullWidth={true}
                    molecule={details}
                    lastSearch={activeMolecule}
                    contextContent1={contextObject.contextContent1}
                    contextContent2={contextObject.contextContent2}
                    contextContent3={contextObject.contextContent3}
                    onClose={() => { }}
                  />
                  {false && details.COMMERCIAL_LINK && <CustomButton Icon={ExternalLink} size="small" fullWidth variant="outlined" onClick={() => {
                    window.open(details.COMMERCIAL_LINK, '_blank', 'noopener,noreferrer');
                  }}>
                    {t('chatbox.buttons.viewInMolPort')}
                  </CustomButton>}
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