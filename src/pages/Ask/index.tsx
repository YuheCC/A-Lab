import React, { useState, useEffect, useRef, useCallback } from 'react';
import streamSSE from "@/components/StreamSSE/index.js";
import './Chatbox.css';
import FeedbackBox from '@/components/FeedbackBox/index.js';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authFetch, COMMERCIAL_SCORE_MAP, getAPIUrl } from '@/utils.js';
import { useAuthStore } from '@/models/useAuth';
import rehypeRaw from 'rehype-raw';
import { IconButton, Tooltip } from '@mui/material';
import MolCard from '@/components/MolCard/index.js';
import { useChatStore, useActiveChatData } from '@/models/useChat';
import { useShallow } from 'zustand/react/shallow';
import i18n from '@/locales/i18n';
import MoleculeFeedbackBox from '@/components/MoleculeFeedbackBox';
import CustomButton from '@/components/CustomButton/index.js';
import { Copy, ExternalLink, Info, MessageCircle, Search, Star, ThumbsDown, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatHistorySidebar } from '@/components/ChatHistorySidebar/index.js';
import { useTranslation } from 'react-i18next';
import { InlineMoleculeRenderer } from '@/components/InlineMoleculeRenderer/index.js';

const API_URL = getAPIUrl();

// Helper function to check if content contains inline molecules
const hasInlineMolecules = (content) => {
  return /<inline_molecule>\{.*?\}<\/inline_molecule>/g.test(content);
};

// Custom message content renderer that handles both markdown and inline molecules
const MessageContentRenderer = ({ content, onMoleculeClick }) => {
  // Trim leading and trailing whitespace to prevent formatting issues
  const trimmedContent = content?.trim() || '';
  
  if (hasInlineMolecules(trimmedContent)) {
    // If content has inline molecules, render them with click capability
    return <InlineMoleculeRenderer content={trimmedContent} onMoleculeClick={onMoleculeClick} />;
  } else {
    // Otherwise, render as normal markdown
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Remove default margins from paragraphs
          p: ({ node, children, ...props }) => (
            <p {...props} style={{ margin: 0, marginBottom: '1em' }}>
              {children}
            </p>
          ),
          // Remove default margins from headings
          h1: ({ node, children, ...props }) => (
            <h1 {...props} style={{ margin: 0, marginBottom: '0.5em' }}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 {...props} style={{ margin: 0, marginBottom: '0.5em' }}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 {...props} style={{ margin: 0, marginBottom: '0.5em' }}>
              {children}
            </h3>
          ),
          // Remove margins from lists
          ul: ({ node, children, ...props }) => (
            <ul {...props} style={{ margin: 0, marginBottom: '1em', paddingLeft: '1.5em' }}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol {...props} style={{ margin: 0, marginBottom: '1em', paddingLeft: '1.5em' }}>
              {children}
            </ol>
          ),
          // Add proper spacing for horizontal rules
          hr: ({ node, ...props }) => (
            <hr {...props} style={{ margin: '1.5em 0', border: 'none', borderTop: '1px solid #ccc' }} />
          ),
        }}
      >
        {trimmedContent}
      </ReactMarkdown>
    );
  }
};

// Dropdown section for displaying supplemental information
const ExtraDataSection = ({ title, content, onMoleculeClick }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="extra-data-section">
      <div className="extra-data-header" onClick={() => setOpen(!open)}>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span>{title}</span>
      </div>
      {open && (
        <div className="extra-data-content">
          <MessageContentRenderer content={content} onMoleculeClick={onMoleculeClick} />
        </div>
      )}
    </div>
  );
};

// New ChatInput component added for memoized chat input rendering
const ChatInput = React.memo((props: {
  onSend: (input: string) => void;
  disabled: boolean;
  ignoreChatHistory: boolean;
  onIgnoreChatHistoryChange: (value: boolean) => void;
  disableLiteratureSearch: boolean;
  onDisableLiteratureSearchChange: (value: boolean) => void;
  disableTools: boolean;
  onDisableToolsChange: (value: boolean) => void;
  userPermissions: string;
  useMultiAgent: boolean;
  onUseMultiAgentChange: (value: boolean) => void;
  fullDeepSpace: boolean;
  onFullDeepSpaceChange: (value: boolean) => void;
  remainingDeepSpaceQueries: number;
  enablePatentRag: boolean;
  onEnablePatentRagChange: (value: boolean) => void;
}) => {
  const { onSend, disabled, ignoreChatHistory, onIgnoreChatHistoryChange,
      disableLiteratureSearch, onDisableLiteratureSearchChange,
      disableTools, onDisableToolsChange,
      userPermissions, useMultiAgent, onUseMultiAgentChange,
      fullDeepSpace, onFullDeepSpaceChange, remainingDeepSpaceQueries, 
      enablePatentRag, onEnablePatentRagChange } = props;
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
    // if (e.key === 'Enter' && !e.shiftKey) {
    //   e.preventDefault();
    //   if (inputValue.trim()) {
    //     onSend(inputValue);
    //     setInputValue("");

    //     // Reset height after sending
    //     if (textareaRef.current) {
    //       textareaRef.current.style.height = 'auto';
    //     }
    //   }
    // }
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

  // Disable multi-agent and literature search if remaining deep space queries are less than 0
  useEffect(() => {
    if (remainingDeepSpaceQueries < 0) {
      onUseMultiAgentChange(false);
      onDisableLiteratureSearchChange(true);
    }
  }, [remainingDeepSpaceQueries])

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
        {(
          <div className='checkbox-item'>
            <input
              disabled={ remainingDeepSpaceQueries <= 0}
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
            <div className='checkbox-item'>
              <input
                type="checkbox"
                id="fullDeepSpace"
                checked={fullDeepSpace}
                onChange={e => onFullDeepSpaceChange(e.target.checked)}
              />
              <label htmlFor="fullDeepSpace">
                {t('chatbox.checkboxes.fullDeepSpace')}
              </label>
            </div>
            <div className='checkbox-item'>
              <input
                type="checkbox"
                id="enablePatentRag"
                checked={enablePatentRag}
                onChange={e => onEnablePatentRagChange(e.target.checked)}
              />
              <label htmlFor="enablePatentRag">
                Enable Patent RAG
              </label>
            </div>
            <div className='checkbox-item'>
              <input
                type="checkbox"
                id="disableTools"
                checked={disableTools}
                onChange={e => onDisableToolsChange(e.target.checked)}
              />
              <label htmlFor="disableTools">
                {t('chatbox.checkboxes.disableTools')}
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
const ChatbotInterface = () => {
  const { t } = useTranslation();
  const [remainingQueries, setRemainingQueries] = useState(0);
  const [remainingDeepSpaceQueries, setRemainingDeepSpaceQueries] = useState(0);

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

  // Debug: Log the current active chat data


  const { addMessage, setActiveMolecule, setFoundMolecules, setSimilarMolecules, loadHistory, isLoading, isSynced, setIsThinking, updateNewChatId, activeChat, setMoleculesLoading, setSimilarMoleculesLoading, setAwaitingClarify, setUseMultiAgent, setIsInClarifyFlow, setStatus, setChatName } = useChatStore(useShallow(state => ({
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
    setStatus: state.setStatus,
    setChatName: state.setChatName,
  })));

  useEffect(() => {
    console.log(foundMolecules)
  }, [foundMolecules])
  const userPermissions = useAuthStore(state => state.userPermissions);

  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const messagesEndRef = useRef(null);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [ignoreChatHistory, setIgnoreChatHistory] = useState(false);
  const [disableLiteratureSearch, setDisableLiteratureSearch] = useState(false);
  const [fullDeepSpace, setFullDeepSpace] = useState(false);
  const [enablePatentRag, setEnablePatentRag] = useState(false);
  const [disableTools, setDisableTools] = useState(false);
  const [showFoundMolecules, setShowFoundMolecules] = useState(true);
  const [foundMoleculesMessageIndex, setFoundMoleculesMessageIndex] = useState(null);
  const [foundMoleculesError, setFoundMoleculesError] = useState(null);
  const [showSimilarMolecules, setShowSimilarMolecules] = useState(false);
  
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
  const [molTypeSelections, setMolTypeSelections] = useState({});

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
    setFeedbackData({ 
      isPositive: true, 
      inputContent: inputContent, 
      responseContent: responseContent, 
      contextContent1,
      queryType: useMultiAgent ? "deep_space" : "normal_ask"
    });
    setShowFeedbackBox(true);
  };

  const handleThumbsDown = (inputContent, responseContent, contextContent1) => {
    setFeedbackData({ 
      isPositive: false, 
      inputContent: inputContent, 
      responseContent: responseContent, 
      contextContent1,
      queryType: useMultiAgent ? "deep_space" : "normal_ask"
    });
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
      const isHighTier = true; //["admin", "enterprise", "joint"].includes(userPermissions);
      
      // Extract original user query and LLM response from message history
      let originalQuery = undefined;
      let llmResponse = undefined;
      
      if (isHighTier) {
        if (activeFindMessage) {
          // Find the index of the message containing molecules
          const messageIndex = messages.findIndex(msg => msg === activeFindMessage);
          
          // Get the user query that led to this response
          // Look backwards for the most recent user message
          for (let i = messageIndex - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
              originalQuery = messages[i].content;
              break;
            }
          }
          
          // Get the assistant's response content
          llmResponse = activeFindMessage.content;
        } else {
          // Fallback: extract from current conversation context
          // Get the most recent user message and assistant response
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'assistant' && !llmResponse) {
              llmResponse = messages[i].content;
            } else if (messages[i].role === 'user' && !originalQuery) {
              originalQuery = messages[i].content;
            }
            
            // Stop once we have both
            if (originalQuery && llmResponse) {
              break;
            }
          }
        }
      }
      
      // Build selected molecule string if high-tier
      const selectedMoleculeStr = isHighTier
        ? [
            `Name: ${details.name || 'N/A'}`,
            `SMILES: ${details.SMILES}`,
            `Molecular weight: ${details.molecular_weight || 'N/A'}`,
            `HOMO eV: ${details.HOMO_eV || 'N/A'}`,
            `LUMO eV: ${details.LUMO_eV || 'N/A'}`,
            `ESP Max: ${details.ESP_max_eV || 'N/A'}`,
            `ESP Min: ${details.ESP_min_eV || 'N/A'}`,
            `Functional groups: ${JSON.stringify(details.functional_groups || [])}`,
            `Predicted MP: ${details.predicted_MP_celsius || 'N/A'} °C`,
            `Predicted BP: ${details.predicted_BP_celsius || 'N/A'} °C`
          ].join("\n")
        : undefined;
      
      // Construct request payload
      const payload = {
        smiles: details.SMILES,
        use_35m: isHighTier,
        ...(isHighTier && { query: originalQuery, response: llmResponse, selected_molecule_str: selectedMoleculeStr }),
        ...(molTypeSelections[details.SMILES] && { mol_type: molTypeSelections[details.SMILES] })
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
  const fetchQueryLimit = async () => {
    if (userPermissions === 'research' || true) {
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
          setRemainingDeepSpaceQueries(data.ds_limit);
        } else {
          console.error("Failed to fetch query limit");
        }
      } catch (error) {
        console.error("Error fetching query limit:", error);
      }
    }
  };
  // Fetch query limit from API
  useEffect(() => {
    fetchQueryLimit();
  }, [userPermissions, setRemainingQueries, setRemainingDeepSpaceQueries]);

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
    setSimilarMolecules([]);
    setShowSimilarMolecules(false);
  }, [activeChat]);

  // Poll helper – waits until the back‑end returns an assistant message, or error/timeout.
  const pollChatUntilComplete = async (
    chatId: string,
    {
      intervalMs = 5000,
      maxTries   = 1200, // ≈20 min at default interval
    } = {}
  ) => {
    let tries = 0;
    while (tries < maxTries) {
      // Don’t await before the very first pass so we can react quickly if the
      // message is already there.
      if (tries > 0) await new Promise((r) => setTimeout(r, intervalMs));
      tries += 1;

      try {
        const res = await authFetch(`${API_URL}/chat-history/${chatId}`);
        if (!res.ok) continue;

        const data = await res.json();
        // If the back‑end now has a better title, update it.
        if (data.chat_name && data.chat_name !== (i18n.t('chatbox.history.newChat') || 'New Chat')) {
          setChatName(data.chat_name, chatId);
        }
        // Back‑end may return either { messages: [...] } or the older
        // { content: [...] }.  Normalise to one array.
        const { status } = data;
        // ─── Synchronise local clarify‑state with the back‑end ───
        if (status === "awaiting_clarification") {
          setAwaitingClarify(true, chatId);
        } else {
          setAwaitingClarify(false, chatId);
        }
        const serverMsgs = data.messages || data.content || [];

        // Look for an assistant turn (most likely the last one)
        const assistant = [...serverMsgs].reverse().find((m: any) => m.role === "assistant");
        if (assistant) {
          // Compare against the latest assistant message we already have.
          const existingMsgs   = useChatStore.getState().chatMap[chatId]?.messages || [];
          const lastAssistant  = [...existingMsgs].reverse().find((m: any) => m.role === "assistant");
          const isDuplicate    = lastAssistant &&
                                 lastAssistant.content === (assistant.content || "") &&
                                 JSON.stringify(lastAssistant.sources) === JSON.stringify(assistant.sources);

          // Only act when we discover a *new* assistant message.
          if (!isDuplicate) {
            addMessage(
              {
                role: "assistant",
                content: assistant.content || "",
                sources: assistant.sources,
                extraData: assistant.extra_data || null,
              },
              chatId
            );

            setIsThinking(false, chatId);
            // Keep whatever status the server sent (e.g. awaiting_clarification)
            setStatus(status || "complete", chatId);
            return; // Finished – exit polling loop.
          }

          // Duplicate of the previous turn – keep waiting.
          continue;
        }

        // If the backend explicitly reports an error state, stop polling
        if (status === "error") {
          setIsThinking(false, chatId);
          setStatus("complete", chatId);
          return;
        }

        // If status is complete *but* no assistant message yet, keep waiting.
        // Some pipelines mark the session complete a fraction of a second
        // before they finish persisting the assistant row.

      } catch (err) {
        console.error("[pollChat]", err);
      }
    }

    // Hard timeout – give up, clear spinner so the UI doesn’t hang forever.
    setIsThinking(false, chatId);
    setStatus("complete", chatId);
  };

  const handleSend = useCallback(
    async (input) => {
      if (!input.trim()) return;

      /* enforce research-tier quota */
      if (userPermissions === 'research' && remainingQueries <= 0) {
        addMessage({
          role: "assistant",
          content: t('chatbox.queryLimit.reachedLimit')
        });
        return;
      }

      // Handle temporary chat IDs so multiple new chats can be created
      let localChatId = activeChat;
      let isNewChat = localChatId === '-1';
      if (isNewChat) {
        const tempId = Date.now().toString();
        updateNewChatId(tempId);
        localChatId = tempId;
      }

      /* push new user message */
      const newUserMessage = { role: "user", content: input.trim() };
      addMessage(newUserMessage, localChatId);

      /* construct message list for the back-end */
      const messagesToSend = ignoreChatHistory
        ? [{ role: "user", content: input.trim() }]
        : [...messages, newUserMessage]
            .filter(m => m.role === "user" || m.role === "assistant");

      setIsThinking(true, localChatId);
      let effectiveChatId = localChatId;
      setStatus('pending', effectiveChatId);
      const isAdvancedTier  = ['admin', 'enterprise', 'joint'].includes(userPermissions);
      const ragModel        = isAdvancedTier ? 'o3' : 'o4-mini';
      const ragResultsCount = isAdvancedTier ? 10 : 3;

      const currentChatId = isNewChat ? -1 : parseInt(localChatId, 10);
      let data; // final payload from the back-end

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
            const multiAgentPayload: any = { messages: updatedHistory };
            if (currentChatId !== -1) multiAgentPayload.chat_id = currentChatId;
            if (fullDeepSpace) multiAgentPayload.dump_state = true;

            const res = await authFetch(`${API_URL}/multi-agent`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
              body: JSON.stringify(multiAgentPayload),
            });
            if (!res.ok) {
              fetchQueryLimit();
              throw new Error(await res.text());
            }

            for await (const evt of streamSSE(res)) {
              if (evt.event === "init" && evt.chat_id !== undefined) {
                if (isNewChat) {
                  updateNewChatId(`${evt.chat_id}`, localChatId);
                  effectiveChatId = `${evt.chat_id}`;
                  localChatId     = effectiveChatId;
                  isNewChat       = false;
                }
                // Set chat name if provided
                if (evt.title) setChatName(evt.title, `${evt.chat_id}`);
                continue; // keep listening for the final answer
              }
              if (evt.answer || evt.error) {
                data = evt;
                break;
              }
            }

            setAwaitingClarify(false, effectiveChatId);

          /* 2️⃣  First contact – ask for clarifying questions -------- */
          } else {
            setIsInClarifyFlow(true, effectiveChatId);

            const multiAgentPayload: any = { messages: messagesToSend };
            if (currentChatId !== -1) multiAgentPayload.chat_id = currentChatId;
            if (fullDeepSpace) multiAgentPayload.dump_state = true;

            const clarifyPayload: any = { messages: messagesToSend };
            if (currentChatId !== -1) clarifyPayload.chat_id = currentChatId;

            const clarRes = await authFetch(`${API_URL}/multi-agent/clarify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(clarifyPayload),
            });
            if (!clarRes.ok) {
              fetchQueryLimit();
              throw new Error(await clarRes.text());
            }
            // 202 → just { chat_id }, start polling and return early
            if (clarRes.status === 202) {
              const { chat_id } = await clarRes.json();
              if (isNewChat && chat_id !== undefined) {
                updateNewChatId(`${chat_id}`, localChatId);
                effectiveChatId = `${chat_id}`;
                localChatId     = effectiveChatId;
                isNewChat       = false;
              }
              // Wait for clarifying questions to arrive via history polling
              await pollChatUntilComplete(effectiveChatId);
              return; // will exit after polling completes
            }
            const clarData = await clarRes.json();

            if (isNewChat && clarData.chat_id !== undefined) {
              updateNewChatId(`${clarData.chat_id}`, localChatId);
              effectiveChatId = `${clarData.chat_id}`;
              localChatId = effectiveChatId;
              isNewChat = false;
            }

            if (clarData.clarifying_questions?.length) {
              addMessage({
                role: "assistant",
                content: clarData.clarifying_questions,
              }, effectiveChatId);
              setAwaitingClarify(true, effectiveChatId);
              setStatus('awaiting_clarification', effectiveChatId);
              setIsThinking(false, effectiveChatId);
              fetchQueryLimit();
              return; // wait for user reply
            }

            setIsInClarifyFlow(false, effectiveChatId);

            const res = await authFetch(`${API_URL}/multi-agent`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
              body: JSON.stringify(multiAgentPayload),
            });
            if (!res.ok) {
              fetchQueryLimit();
              throw new Error(await res.text());
            }

            for await (const evt of streamSSE(res)) {
              if (evt.event === "init" && evt.chat_id !== undefined) {
                if (isNewChat) {
                  updateNewChatId(`${evt.chat_id}`, localChatId);
                  effectiveChatId = `${evt.chat_id}`;
                  localChatId     = effectiveChatId;
                  isNewChat       = false;
                }
                // Set chat name if provided
                if (evt.title) setChatName(evt.title, `${evt.chat_id}`);
                continue; // keep listening for the final answer
              }
              if (evt.answer || evt.error) {
                data = evt;
                break;
              }
            }
          }
          fetchQueryLimit();
        /* ---------------------------------------------------------- */
        /* NORMAL `/rag` WORKFLOW                                    */
        /* ---------------------------------------------------------- */
        } else {
          const ragPayload: any = {
            messages: messagesToSend,
            ragEnabled: !disableLiteratureSearch,
            toolsEnabled: !disableTools,
            webSearchEnabled: false,
            webSearchClient: "Tavily",
            numRagResults: ragResultsCount,
            model: ragModel,
            patentRagEnabled: enablePatentRag,
          };
          if (currentChatId !== -1) ragPayload.chatId = currentChatId;
          const res = await authFetch(`${API_URL}/rag`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(ragPayload),
          });

          if (!res.ok && res.status !== 202) {
            const errText = await res.text();
            if (res.status === 400 &&
                errText.includes("Query is not relevant to batteries or battery chemistry"))
              throw new Error(t('chatbox.errors.batteryRelevance'));
            throw new Error(errText || t('chatbox.errors.networkError'));
          }

          // 202 → just { chat_id }, start polling and return early
          if (res.status === 202) {
            const { chat_id } = await res.json();
            if (isNewChat && chat_id !== undefined) {
              updateNewChatId(`${chat_id}`, localChatId);
              effectiveChatId = `${chat_id}`;
              localChatId     = effectiveChatId;
              isNewChat       = false;
            }
            await pollChatUntilComplete(effectiveChatId);
            // spinner stays active – subsequent poll will add the assistant message
            return; // will exit after polling completes
          }

          // 200 – old synchronous behaviour
          data = await res.json();
        }

        /* ---------------------------------------------------------- */
        /* Common post-processing                                     */
        /* ---------------------------------------------------------- */
        if (data?.error) throw new Error(data.error);

        if (isNewChat && data?.chat_id !== undefined) {
          updateNewChatId(`${data.chat_id}`, localChatId);
          effectiveChatId = `${data.chat_id}`;
          localChatId = effectiveChatId;
          isNewChat = false;
        }

        if (data?.status) setStatus(data.status, effectiveChatId);
        else setStatus('complete', effectiveChatId);

        const llmMessage = {
          role: "assistant",
          inputs: data.inputs || null,
          content: data.llmOutput || data.answer || "",
          sources: data.source_html,
          molText: data.molecule_text,
          molecules: data.molecules,
          extraData: data.extra_data ? { extra_data: data.extra_data } : null,
        };

        addMessage(llmMessage, effectiveChatId);
        setIsThinking(false, effectiveChatId);

        if (userPermissions === 'research' && data.remaining_queries !== undefined)
          setRemainingQueries(data.remaining_queries);

      } catch (err) {
        addMessage({ role: "assistant", content: "Error: " + err.message }, effectiveChatId);
        setIsThinking(false, effectiveChatId);
        setStatus('complete', effectiveChatId);
      } finally {
        /*
         * Don’t forcibly clear the spinner here: in the 202‑polling path
         * `pollChatUntilComplete` already does that when the assistant
         * message lands.  For the synchronous paths we’ve already called
         * `setIsThinking(false)` earlier in the try block or in catch.
         */
        fetchQueryLimit();
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
      fullDeepSpace,
      disableTools,
    ]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleMolTypeChange = (smiles, type) => {
    setMolTypeSelections(prev => ({ ...prev, [smiles]: type }));
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
        <div className={`chatbot-content ${!showSelectedMolecule && !showSimilarMolecules ? 'full-width' : 'with-molecules'}`}>
          {userPermissions !== 'admin' && (
            <div className="chatbot-header">
              <div className={`query-limit-display ${remainingQueries <= 3 ? 'warning' : ''} ${remainingQueries === 0 ? 'danger' : ''}`}>
                <MessageCircle size={18} className='query-limit-icon'></MessageCircle>
                {
                  userPermissions === 'research' && (
                    <span>
                      {t('chatbox.queryLimit.queriesRemaining')} <span className="query-limit-count">{remainingQueries}</span>
                    </span>
                  )
                }
                <span style={{ marginLeft: 10 }}>
                  {t('chatbox.queryLimit.deepSpaceQueriesRemaining')} <span className="query-limit-count">{remainingDeepSpaceQueries}</span>
                </span>
              </div>
            </div>
            )} 
          <div className="chat-messages">
            {messages.map((msg, index) => {
              const errorText = msg.extraData?.extra_data?.error;
              const displayContent = errorText ? `Error: ${errorText}` : msg.content;
              const isError = !!errorText || (displayContent && displayContent.startsWith('Error:'));
              return (
                <div
                  key={index}
                  className={`message-${msg.role} ${isError ? 'error-message' : ''}`}>
                  <div className='message-content'>
                    <MessageContentRenderer content={displayContent} onMoleculeClick={handleMoleculeClick} />

                    {msg.extraData && msg.extraData.extra_data && Object.keys(msg.extraData.extra_data).length > 0 && (
                      <div className="extra-data-wrapper">
                        {Object.entries(msg.extraData.extra_data).map(([key, value]) => (
                          <ExtraDataSection
                            key={key}
                            title={key}
                            content={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                            onMoleculeClick={handleMoleculeClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                {/* Add thumbs buttons for feedback */}
                {msg.role === "assistant" && (
                  <div className="thumbs">
                    {
                      <>
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
                      </>
                    }

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
                            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'hr', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'sub', 'sup'],
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
              );
            })}
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
            disableTools={disableTools}
            onDisableToolsChange={setDisableTools}
            userPermissions={userPermissions}
            useMultiAgent={useMultiAgent}
            onUseMultiAgentChange={setUseMultiAgent}
            remainingDeepSpaceQueries={remainingDeepSpaceQueries}
            fullDeepSpace={fullDeepSpace}
            onFullDeepSpaceChange={setFullDeepSpace}
            enablePatentRag={enablePatentRag}
            onEnablePatentRagChange={setEnablePatentRag}
          />
        </div>
        {false && foundMolecules && foundMolecules.length > 0 && showFoundMolecules && (
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
                  { label: 'SMILES', value: details.SMILES, span: 2, wrap: true },
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
                    <div style={{ display: 'flex', width: '100%' }}>
                      <CustomButton Icon={Search} color="secondary" onClick={() => handleFindSimilarMolecules(details)}
                        fullWidth
                        loading={similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === details.SMILES}
                        loadingText={t('chatbox.molecules.searchingForFriends')}
                        size="small" style={{ flexGrow: 1 }}>
                        {t('chatbox.buttons.findSimilarMolecules')}
                      </CustomButton>
                      <select
                        value={molTypeSelections[details.SMILES] || ""}
                        onChange={e => handleMolTypeChange(details.SMILES, e.target.value)}
                        style={{ marginLeft: '5px', backgroundColor: '#FFA500', color: '#000', border: '1px solid #FFA500', borderRadius: '4px', padding: '4px' }}
                      >
                        <option value="" disabled hidden>{t('search.moleculeTypes.selectMolType')}</option>
                        <option value="solvent">{t('search.moleculeTypes.solvent')}</option>
                        <option value="diluent">{t('search.moleculeTypes.diluent')}</option>
                        <option value="additive">{t('search.moleculeTypes.additive')}</option>
                      </select>
                    </div>
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
              <h3>Selected molecule</h3>
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
                  { label: 'SMILES', value: selectedMolecule.SMILES, span: 2, wrap: true },
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
                    loadingText={t('chatbox.buttons.addToFavoritesLoading')}
                    successMessage={moleculeFavoriteStatus[selectedMolecule.SMILES]?.success}
                    errorMessage={moleculeFavoriteStatus[selectedMolecule.SMILES]?.error} size="small">
                    { t('chatbox.buttons.addToFavorites')}
                  </CustomButton>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <CustomButton Icon={Search} color="secondary" onClick={() => handleFindSimilarMolecules(selectedMolecule)}
                      fullWidth
                      loading={similarMoleculesLoading && activeMolecule && activeMolecule.SMILES === selectedMolecule.SMILES}
                      loadingText={t('chatbox.molecules.searchingForFriends')}
                      size="small" style={{ flexGrow: 1 }}>
                      {t('chatbox.buttons.findSimilarMolecules')}
                    </CustomButton>
                    <select
                      value={molTypeSelections[selectedMolecule.SMILES] || ""}
                      onChange={e => handleMolTypeChange(selectedMolecule.SMILES, e.target.value)}
                      style={{ marginLeft: '5px', backgroundColor: '#FFA500', color: '#000', border: '1px solid #FFA500', borderRadius: '4px', padding: '4px' }}
                    >
                      <option value="" disabled hidden>{t('search.moleculeTypes.selectMolType')}</option>
                      <option value="solvent">{t('search.moleculeTypes.solvent')}</option>
                      <option value="diluent">{t('search.moleculeTypes.diluent')}</option>
                      <option value="additive">{t('search.moleculeTypes.additive')}</option>
                    </select>
                  </div>
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
                  { label: 'SMILES', value: details.SMILES, span: 2, wrap: true },
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
                  {
                    userPermissions === 'admin' && (
                      <MoleculeFeedbackBox
                        fullWidth={true}
                        molecule={details}
                        lastSearch={activeMolecule}
                        contextContent1={contextObject.contextContent1}
                        contextContent2={contextObject.contextContent2}
                        contextContent3={contextObject.contextContent3}
                        useMultiAgent={useMultiAgent}
                        onClose={() => { }}
                      />
                    )
                  }
                  
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
          queryType={feedbackData.queryType}
          useMultiAgent={useMultiAgent}
          onClose={() => setShowFeedbackBox(false)}
        />
      )}
    </div>
  );
};


export default ChatbotInterface;