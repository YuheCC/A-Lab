import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { authFetch, getAPIUrl } from '@/utils';
import i18n from '@/locales/i18n';

const API_URL = getAPIUrl();

// 定义聊天消息类型
interface ChatMessage {
    role: string;
    content: string;
    molText?: string;
    molecules?: any[];
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
    updateNewChatId: (chatId: string) => {
        set(produce((state: ChatState) => {
            console.log("Updating new chat ID to:", chatId);
            // Get the chat data
            const chatData = state.chatMap['-1'];
            if (!chatData) {
                console.warn(`Chat with id -1 does not exist.`);
                return;
            }
            
            // Check if the target chat already exists to prevent overwriting
            if (state.chatMap[chatId]) {
                console.warn(`Chat with id ${chatId} already exists, skipping update.`);
                return;
            }

            if (chatId === null) {
                console.warn("Chat ID is null, not updating.");
                return;
            }
            
            // Add chat with new ID
            state.chatMap[chatId] = chatData;
            delete state.chatMap['-1'];
            state.activeChat = chatId;
        }));
    },

    /**
     * Method to load chat history from the server.
     * - It fetches chat history, updates the chat map, and sets the active chat.
     * - If you want to sync chat history, this method needs to be called on page load
     */
    loadHistory: async () => {
        console.log("Loading chat history from server...");
        try {
            const historyData = await authFetch(`${API_URL}/chat-history`).then(res => res.json());
            console.log("Chat history loaded:", historyData);
            set(produce((draft: ChatState) => {
                draft.isSynced = true;

                // Delete all existing chats except the default one
                draft.chatMap = {
                    "-1": generateNewChat()
                };

                if (historyData.length > 0) {
                    historyData.forEach((chat: any) => {
                        draft.chatMap[chat.id] = {
                            createdAt: new Date(chat.created_at.endsWith('Z') ? chat.created_at : chat.created_at + 'Z').toISOString(),
                            useMultiAgent: false,
                            name: chat.chat_name || 'New Chat',
                            messages: chat.content.map((item: any) => ({
                                role: item.role,
                                content: item.content || '',
                                molText: item.molecules.join(", ") || [],
                                molecules: item.molecules || [],
                                extraData: item.extra_data || {},
                            })) || [],
                            activeMolecule: chat.meta_active_molecule || null,
                            foundMolecules: chat.meta_molecules || [],
                            similarMolecules: chat.meta_similar_molecules || [],
                            awaitingClarify: chat.awaiting_clarification || false,
                            isInClarifyFlow: false,
                            isThinking: false,
                            thinkingStartedAt: null,
                            moleculesLoading: false,
                            similarMoleculesLoading: false,
                        };
                    });
                }

                if (draft.chatMap['-1']) {
                    draft.activeChat = '-1';
                } else {
                    const chatIds = Object.keys(draft.chatMap);
                    draft.activeChat = chatIds[0];
                }

                console.log("Chat map after loading history:", draft.activeChat);

            }));

        } catch (error) {
            console.error("Error loading chat history:", error);
        }
    },

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
     * - If a chat with ID '-1' already exists, it will not create a new one. (Limited to one new chat without a server set ID)
     * @param {*} name 
     */
    createChat: (name = 'New Chat') => {
        set(produce((state: ChatState) => {
            if (state.chatMap['-1']) {
                console.warn("Default chat already exists, not creating a new one.");
                return;
            }

            console.log("Creating new chat with name:", name);
            state.chatMap['-1'] = generateNewChat();
            state.activeChat = '-1';
        }));
    },

    setActiveChat: (chatId: string) => {
        console.log("Setting active chat to:", chatId);
        set({ activeChat: chatId });
    },

    // LLM actions
    // - LLM actions states are only tracked locally, not on the server
    setIsThinking: (isThinking: boolean, chatId = null) => set(produce((state: ChatState) => {
        console.log("Setting isThinking for chat:", chatId || state.activeChat, isThinking);

        if (isThinking) {
            // If thinking starts, set the timestamp
            state.chatMap[chatId || state.activeChat].thinkingStartedAt = new Date().toISOString();
        } else {
            // If thinking ends, clear the timestamp
            state.chatMap[chatId || state.activeChat].thinkingStartedAt = null;
        }
        
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.isThinking = isThinking;
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
    addMessage: (message: any, chatId = null) => set(produce((state: ChatState) => {
        if (message.role === 'user' && state.activeChat === '-1') {
            state.chatMap[state.activeChat].name = message.content;
        }
        console.log("Adding message to chat:", chatId || state.activeChat, message);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.messages.push(message);
    })),
    clearMessages: () => set(produce((state: ChatState) => {
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

        // Send found molecules to server
        try {
            await authFetch(`${API_URL}/chat-history/update`, {
                method: "PUT",
                headers: {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: parseInt(chatId || get().activeChat as string),
                    meta_molecules: JSON.stringify(molecules),
                })
            });
        } catch (error) {
            console.error("Failed to update found molecules on server:", error);
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
            await authFetch(`${API_URL}/chat-history/update`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: parseInt(chatId || get().activeChat as string),
                    meta_similar_molecules: JSON.stringify(molecules),
                })
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
            await authFetch(`${API_URL}/chat-history/update`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: parseInt(chatId || get().activeChat as string),
                    meta_active_molecule: JSON.stringify(molecule),
                })
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

        // Send awaitingClarify to server
        try {
            await authFetch(`${API_URL}/chat-history/update`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: parseInt(chatId || get().activeChat as string),
                    awaiting_clarification: awaitingClarify,
                })
            });
        } catch (error) {
            console.error("Failed to update awaiting clarification on server:", error);
        }
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
    return useChatStore((state: ChatState) => state.chatMap[state.activeChat]);
};