import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { authFetch, getAPIUrl } from '@/utils';
import { updateChatMetadata } from '@/services/chat';
import i18n from '@/locales/i18n';

const API_URL = getAPIUrl();

// 定义聊天消息类型
interface ChatMessage {
    role: string;
    content: string;
    molText?: string;
    molecules?: any[];
    inputs?: any;
    sources?: any;
    extraData?: any;
}

// 定义分子类型
interface Molecule {
    [key: string]: any;
}

// 定义聊天状态类型
interface Chat {
    name: string;
    useMultiAgent: boolean;
    isInClarifyFlow: boolean;
    isThinking: boolean;
    thinkingStartedAt: string | null;
    moleculesLoading: boolean;
    similarMoleculesLoading: boolean;
    messages: ChatMessage[];
    activeMolecule: Molecule | null;
    foundMolecules: Molecule[];
    similarMolecules: Molecule[];
    awaitingClarify: boolean;
    status: string;
    createdAt: string;
}

// 定义状态类型
interface ChatState {
    isLoading: boolean;
    error: string | null;
    isSynced: boolean;
    activeChat: string;
    chatMap: Record<string, Chat>;
}

const getWelcomeMessage = () => {
    return i18n.t('chatbox.systemMessage.welcome') || "Welcome to the Molecular Universe. How can I help you today?";
};

const generateNewChat = (): Chat => ({
    name: i18n.t('chatbox.history.newChat') || "New Chat",
    useMultiAgent: false,
    isInClarifyFlow: false,
    isThinking: false,
    thinkingStartedAt: null,
    moleculesLoading: false,
    similarMoleculesLoading: false,
    messages: [
        { role: "system", content: getWelcomeMessage() }
    ],
    activeMolecule: null,
    foundMolecules: [],
    similarMolecules: [],

    // Deep Space metadata
    awaitingClarify: false,
    status: 'complete',

    createdAt: new Date().toISOString(),
})

/**
 * State management for chat functionality using Zustand.
 * - This store handles chat creation, deletion, message management, and molecule handling.
 * - It also loads chat history from server and persists state in session storage.
 */
export const useChatStore = create<ChatState>()(persist((set, get) => ({
    
    isLoading: false,
    error: null,
    isSynced: false,
    activeChat: '-1',
    chatMap: {
        "-1": generateNewChat()
    },

    /**
     * 更新所有聊天中的系统欢迎消息（用于语言切换时）
     */
    updateWelcomeMessages: () => {
        const welcomeMessage = getWelcomeMessage();
        set(produce((state: ChatState) => {
            Object.keys(state.chatMap).forEach(chatId => {
                const chat = state.chatMap[chatId];
                if (chat.messages && chat.messages.length > 0 && chat.messages[0].role === 'system') {
                    // 只更新默认的欢迎消息，不更新其他系统消息
                    const originalContent = chat.messages[0].content;
                    // 检测是否为默认欢迎消息的各种语言版本
                    const isWelcomeMessage = 
                        originalContent.includes('Welcome to the Molecular Universe') || 
                        originalContent.includes('欢迎来到分子宇宙') || 
                        originalContent.includes('Molecular Universe에 오신 것을 환영합니다');
                    
                    if (isWelcomeMessage) {
                        chat.messages[0].content = welcomeMessage;
                    }
                }
            });
        }));
    },

    /**
     * Method to update new chat ID after receiving it from the server.
     * @param {*} chatId 
     */
    updateNewChatId: (chatId: string, oldChatId: string = '-1') => {
        set(produce((state: ChatState) => {
            console.log("Updating chat ID:", oldChatId, "→", chatId);

            const chatData = state.chatMap[oldChatId];
            if (!chatData) {
                console.warn(`❌ Chat with id ${oldChatId} does not exist.`);
                return;
            }

            if (chatId === null) {
                console.warn("❌ Chat ID is null, not updating.");
                return;
            }

            if (state.chatMap[chatId]) {
                console.log(`⚠️ Chat with id ${chatId} already exists - merging messages and removing ${oldChatId} chat`);
                const existingChat = state.chatMap[chatId];
                const localMessages = chatData.messages || [];

                const mergedMessages = [...existingChat.messages];
                localMessages.forEach(localMsg => {
                    const isDuplicate = mergedMessages.some(existingMsg =>
                        existingMsg.role === localMsg.role &&
                        existingMsg.content === localMsg.content
                    );
                    if (!isDuplicate) {
                        mergedMessages.push(localMsg);
                    }
                });

                state.chatMap[chatId] = {
                    ...existingChat,
                    messages: mergedMessages,
                    name: chatData.name || existingChat.name
                };
            } else {
                state.chatMap[chatId] = chatData;
            }

            delete state.chatMap[oldChatId];

            if (state.activeChat === oldChatId) {
                state.activeChat = chatId;
            }

            console.log("✅ CHAT ID UPDATED SUCCESSFULLY:", {
                newActiveChat: state.activeChat,
                newChatExists: !!state.chatMap[chatId],
                messagesInNewChat: state.chatMap[chatId]?.messages?.length
            });
        }));
    },

    /**
     * Method to load chat history from the server.
     * - It fetches chat history, updates the chat map, and sets the active chat.
     * - If you want to sync chat history, this method needs to be called on page load
     */
    loadHistory: async () => {
        console.log("📥 LOADING CHAT HISTORY FROM SERVER...");
        
        // Prevent multiple simultaneous loads
        if (get().isLoading) {
            console.log("📥 CHAT HISTORY ALREADY LOADING, SKIPPING...");
            return;
        }
        
        set(produce((draft) => {
            draft.isLoading = true;
        }));
        
        try {
            const historyResp = await authFetch(`${API_URL}/chat-history`);
            const historyJson = await historyResp.json().catch(() => []);
            const historyList = Array.isArray(historyJson) ? historyJson : [];
            if (!Array.isArray(historyJson)) {
                console.warn("📥 UNEXPECTED CHAT HISTORY RESPONSE:", historyJson);
            }
            console.log("📥 CHAT HISTORY LOADED FROM SERVER:", historyList.length, "sessions");

            const fullChats = await Promise.all(historyList.map(async (chat: any) => {
                const details = await authFetch(`${API_URL}/chat-history/${chat.id}`).then(res => res.json());
                return { ...chat, ...details };
            }));

            set(produce((draft: ChatState) => {
                draft.isSynced = true;
                draft.isLoading = false;

                draft.chatMap = { "-1": generateNewChat() };

                const parseMaybeJSON = (v: any) => {
                    if (!v) return v;
                    if (typeof v === 'string') {
                        try { return JSON.parse(v); } catch { return v; }
                    }
                    return v;
                };

                fullChats.forEach((chat, index) => {
                    console.log(`📥 LOADING SESSION ${index + 1}/${fullChats.length}: ID=${chat.id}, Name="${chat.chat_name}", Messages=${chat.messages?.length || 0}`);

                    draft.chatMap[chat.id] = {
                        createdAt: new Date(chat.created_at.endsWith('Z') ? chat.created_at : chat.created_at + 'Z').toISOString(),
                        useMultiAgent: false,
                        name: chat.chat_name || 'New Chat',
                        messages: (chat.content || chat.messages || []).map((item: any) => ({
                            role: item.role,
                            content: item.content || '',
                            molText: (item.molecules || []).join(', '),
                            molecules: item.molecules || [],
                            extraData: item.extra_data || null,
                            inputs: item.inputs,
                            sources: item.sources,
                        })),
                        activeMolecule: parseMaybeJSON(chat.meta_active_molecule) || null,
                        foundMolecules: parseMaybeJSON(chat.meta_molecules) || [],
                        similarMolecules: parseMaybeJSON(chat.meta_similar_molecules) || [],
                        awaitingClarify: chat.status === 'awaiting_clarification',
                        status: chat.status || 'complete',
                        isInClarifyFlow: false,
                        isThinking: chat.status === 'pending',
                        thinkingStartedAt: null,
                        moleculesLoading: false,
                        similarMoleculesLoading: false,
                    };

                    if (chat.messages && chat.messages.length > 0) {
                        console.log(`📥 SESSION ${chat.id} MESSAGES:`, chat.messages.map((msg: any) => `${msg.role}: ${(msg.content || '').substring(0, 50)}...`));
                    }
                });

                draft.activeChat = draft.chatMap['-1'] ? '-1' : Object.keys(draft.chatMap)[0];

                console.log("✅ CHAT MAP UPDATED - Active chat:", draft.activeChat, "Total sessions:", Object.keys(draft.chatMap).length);
            }));

        } catch (error) {
            console.error("❌ ERROR LOADING CHAT HISTORY:", error);
            set(produce((draft) => {
                draft.isLoading = false;
            }));
        }
    },

    /**
     * Overwrite the chat’s title (name) once the back‑end generates it.
     */
    setChatName: (name: string, chatId = null) => set(produce((state: ChatState) => {
        if (!name) return;
        const targetChatId = chatId || state.activeChat;
        const chat = state.chatMap[targetChatId];
        if (!chat) return;
        chat.name = name;
    })),

    deleteChat: async (chatId: string) => {
        set(produce((state: ChatState) => {
            console.log("Deleting chat with id:", chatId);
            delete state.chatMap[chatId];

            // If deleted chat was the last one, create a new default chat
            if (Object.keys(state.chatMap).length === 0) {
                state.chatMap['-1'] = generateNewChat();
            }

            // Resets to default chat if the default chat exists
            if (state.chatMap['-1']) {
                state.activeChat = '-1';
            } else {

                // If no default chat exists, set active chat to the most recent one
                const chatIds = Object.keys(state.chatMap);
                const mostRecentChat = chatIds.reduce((latest, chatId) => {
                    const currentChat = state.chatMap[chatId];
                    const latestChat = state.chatMap[latest];
                    return new Date(currentChat.createdAt) > new Date(latestChat.createdAt) ? chatId : latest;
                }, chatIds[0]);
                state.activeChat = mostRecentChat;
                console.log("No default chat found, setting active chat to first available chat:", state.activeChat);
            }
        }));

        // Delete chat session history from server
        if (chatId !== '-1' && !get().chatMap[chatId as string]) {
            await authFetch(`${API_URL}/chat-history/delete/${chatId}`, {
                method: 'DELETE',
            }).then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to delete chat with id ${chatId}`);
                }
            }).catch(error => {
                console.error("Error deleting chat:", error);
            });
        }
    },

    /**
     * Creates a new chat with the given name.
     * - If a blank chat already exists, switch to it instead of creating a new one.
     * - If the existing default chat has messages, preserve it with a temporary ID and open a fresh blank chat.
     * @param {*} name
     */
    createChat: (name = 'New Chat') => {
        set(produce((state: ChatState) => {
            const defaultChat = state.chatMap['-1'];

            if (defaultChat) {
                const isBlank = !defaultChat.messages ||
                    defaultChat.messages.length === 0 ||
                    (defaultChat.messages.length === 1 && defaultChat.messages[0].role === 'system');

                if (isBlank) {
                    state.activeChat = '-1';
                    return;
                }

                const tempId = Date.now().toString();
                state.chatMap[tempId] = defaultChat;
                if (state.activeChat === '-1') {
                    state.activeChat = tempId;
                }
                delete state.chatMap['-1'];
            }

            console.log("Creating new chat with name:", name);
            state.chatMap['-1'] = generateNewChat();
            state.activeChat = '-1';
        }));
    },

    setActiveChat: (chatId: string) => {
        const currentState = get();
        console.log("🔄 SWITCHING ACTIVE CHAT:", currentState.activeChat, "→", chatId);
        
        // Log details about the chat being switched to
        const targetChat = currentState.chatMap[chatId];
        if (targetChat) {
            console.log("🔄 TARGET CHAT DETAILS:", {
                id: chatId,
                name: targetChat.name,
                messages: targetChat.messages?.length || 0,
                createdAt: targetChat.createdAt
            });
        } else {
            console.warn("⚠️ TARGET CHAT NOT FOUND IN CHAT MAP:", chatId);
        }
        
        set({ activeChat: chatId });
    },

    // LLM actions
    // - LLM actions states are only tracked locally, not on the server
    setIsThinking: (isThinking: boolean, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting isThinking for chat:", chatId || state.activeChat, isThinking);

        const targetChatId = chatId || state.activeChat;
        const chat = state.chatMap[targetChatId];
        
        if (!chat) {
            console.warn("⚠️ Cannot set isThinking - chat not found:", targetChatId);
            return;
        }

        if (isThinking) {
            // If thinking starts, set the timestamp
            chat.thinkingStartedAt = new Date().toISOString();
        } else {
            // If thinking ends, clear the timestamp
            chat.thinkingStartedAt = null;
        }
        
        chat.isThinking = isThinking;
    })),
    setStatus: (status: string, chatId = null) => set(produce((state: ChatState) => {
        const targetChatId = chatId || state.activeChat;
        const chat = state.chatMap[targetChatId];
        if (!chat) return;
        chat.status = status;
    })),

    // Message actions (immer: only update active chat)
    // - Messages are persistent, but through ChatBox.js since the backend expects specific formats (and a chat message being set != a chat message being sent)
    setMessages: (messagesOrUpdater: any, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting messages for chat:", chatId || state.activeChat);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.messages = typeof messagesOrUpdater === 'function'
            ? messagesOrUpdater(chat.messages)
            : [...messagesOrUpdater];
    })),
    addMessage: (message: any, chatId = null) => {
        const targetChatId = chatId || get().activeChat;

        set(produce((state) => {
            // Give the chat a meaningful title once the very first user message
            // arrives.  We only overwrite the placeholder “New Chat”.  This works
            // for chats that have already been assigned a real ID, too.
            const chat = state.chatMap[targetChatId];
            if (
              message.role === 'user' &&
              chat &&
              chat.messages.length === 0 &&
              chat.name === (i18n.t('chatbox.history.newChat') || 'New Chat')
            ) {
              chat.name = message.content;
            }

            if (!chat) return;

            // Use immutable update so selectors that rely on reference equality
            // (useActiveChatData deep compare) notice the change.
            chat.messages = [...chat.messages, message];
        }));
    },
    clearMessages: () => set(produce((state) => {
        console.log("Clearing messages for chat:", state.activeChat);
        const chat = state.chatMap[state.activeChat];
        if (!chat) return;
        chat.messages = [];
    })),

    // Molecule actions (immer: only update active chat)
    // - Molecule actions are persistent, through both sessionStorage and server
    // - Setting either found or similar molecules will update the history on the server
    setFoundMolecules: async (preMolecules: any, chatId = null) => {

        const molecules = preMolecules.map((molecule: any) => {
            const { image, ...moleculeWithoutImage } = molecule;
            return moleculeWithoutImage;
        });

        set(produce((state: ChatState) => {
            console.log("Setting found molecules for chat:", chatId || state.activeChat, molecules);
            const chat = state.chatMap[chatId || state.activeChat];
            if (!chat) return;
            chat.foundMolecules = molecules;
        }));

        try {
            await updateChatMetadata({
                chat_id: parseInt(chatId || get().activeChat as string),
                meta_molecules: molecules,
            });
        } catch (error) {
            console.error("Failed to update similar molecules on server:", error);
        }
    },
    setSimilarMolecules: async (preMolecules: any, chatId = null) => {
        console.log("Setting similar molecules for chat:", chatId || get().activeChat, preMolecules);

        const molecules = preMolecules.map((molecule: any) => {
            const { image, ...moleculeWithoutImage } = molecule;
            return moleculeWithoutImage;
        });

        set(produce((state: ChatState) => {
            console.log("Setting similar molecules for chat:", chatId || state.activeChat, molecules);
            const chat = state.chatMap[chatId || state.activeChat];
            if (!chat) return;
            chat.similarMolecules = molecules;
        }));

        // Send similar molecules to server
        try {
            await updateChatMetadata({
                chat_id: parseInt(chatId || get().activeChat as string),
                meta_similar_molecules: molecules,
            });
        } catch (error) {
            console.error("Failed to update similar molecules on server:", error);
        }
    },
    setActiveMolecule: async (molecule: any, chatId = null) => {
        set(produce((state: ChatState) => {
            console.log("Setting active molecule for chat:", chatId || state.activeChat, molecule);
            const chat = state.chatMap[chatId || state.activeChat];
            if (!chat) return;
            chat.activeMolecule = molecule;
        }));

        // Send active molecule to server
        try {
            await updateChatMetadata({
                chat_id: parseInt(chatId || get().activeChat as string),
                meta_active_molecule: molecule,
            });
        } catch (error) {
            console.error("Failed to update active molecule on server:", error);
        }
    },

    setMoleculesLoading: (isLoading: boolean, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting molecules loading state for chat:", chatId || state.activeChat, isLoading);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.moleculesLoading = isLoading;
    })),

    setSimilarMoleculesLoading: (isLoading: boolean, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting similar molecules loading state for chat:", chatId || state.activeChat, isLoading);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.similarMoleculesLoading = isLoading;
    })),

    // Deep Space actions
    setUseMultiAgent: (multiAgent: boolean, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting useMultiAgent for chat:", chatId || state.activeChat, multiAgent);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.useMultiAgent = multiAgent;
    })),
    setAwaitingClarify: async (awaitingClarify: boolean, chatId = null) => {
        set(produce((state: ChatState) => {
            console.log("Setting awaitingClarify for chat:", chatId || state.activeChat, awaitingClarify);
            const chat = state.chatMap[chatId || state.activeChat];
            if (!chat) return;
            chat.awaitingClarify = awaitingClarify;
        }));
    },
    setIsInClarifyFlow: (isInClarifyFlow: boolean, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting isInClarifyFlow for chat:", chatId || state.activeChat, isInClarifyFlow);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.isInClarifyFlow = isInClarifyFlow;
    }))

}), {
    name: 'chat-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        isSynced: false,
        // If default chat exists, save it as active chat
        // Otherwise, set active chat to the first available chat
        /* activeChat: Object.keys(state.chatMap).includes("-1") ? "-1" : 
            state.activeChat !== "-1" ? state.activeChat : Object.keys(state.chatMap)[0], */
        chatMap: Object.fromEntries(
            Object.entries(state.chatMap).map(([key, value]: [string, any]  ) => [
                key,
                {
                    name: value.name,
                    messages: value.messages,
                    activeMolecule: value.activeMolecule,
                    foundMolecules: value.foundMolecules,
                    similarMolecules: value.similarMolecules,
                    awaitingClarify: value.awaitingClarify,
                    isInClarifyFlow: value.isInClarifyFlow,
                    useMultiAgent: value.useMultiAgent,
                    status: value.status,
                    createdAt: value.createdAt,
                }
            ])
        ),
    }),
    onRehydrateStorage: () => (state: any) => {
        if (!state) return;
        
        // Ensure default chat exists after rehydration
        if (!state.chatMap['-1']) {
            console.log("Default chat not found after rehydration, creating a new one.");
            state.chatMap['-1'] = generateNewChat();
            state.activeChat = '-1';
        }
    }
}));

export const useActiveChatData = () => {
    const result = useChatStore((state: ChatState) => {
        const activeChat = state.chatMap[state.activeChat];
        
        // Enhanced debugging with more detail
        console.log("🔍 ACTIVE CHAT DATA ACCESS:", {
            activeChatId: state.activeChat,
            activeChatExists: !!activeChat,
            messagesLength: activeChat?.messages?.length || 0,
            chatMapKeys: Object.keys(state.chatMap),
            chatFullData: activeChat,
            chatName: activeChat?.name,
            lastMessage: activeChat?.messages?.length > 0 ? {
                role: activeChat.messages[activeChat.messages.length - 1].role,
                contentPreview: (activeChat.messages[activeChat.messages.length - 1].content || '').substring(0, 50) + '...'
            } : null
        });
        
        // Log warning if active chat has no messages but should have some
        if (activeChat && activeChat.messages?.length === 0 && state.activeChat !== '-1') {
            console.warn("⚠️ ACTIVE CHAT HAS NO MESSAGES - This might indicate a display issue for chat:", state.activeChat);
        }
        
        return activeChat;
    }, (oldData, newData) => {
        // Deep comparison of the relevant data to prevent unnecessary re-renders
        const isEqual = (
            oldData?.foundMolecules === newData?.foundMolecules &&
            oldData?.similarMolecules === newData?.similarMolecules &&
            oldData?.activeMolecule === newData?.activeMolecule &&
            oldData?.messages === newData?.messages &&
            oldData?.isThinking === newData?.isThinking &&
            oldData?.moleculesLoading === newData?.moleculesLoading &&
            oldData?.similarMoleculesLoading === newData?.similarMoleculesLoading &&
            oldData?.awaitingClarify === newData?.awaitingClarify
        );
        
        // Log re-render decisions for debugging
        if (!isEqual) {
            console.log("🔄 ACTIVE CHAT DATA CHANGED - Component will re-render");
            }

            return isEqual;
        }
    );
    return result;
};