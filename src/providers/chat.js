import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produce } from 'immer';
import { authFetch, getAPIUrl } from '../utils';

const API_URL = getAPIUrl();

 const generateNewChat = () => ({
    name: 'New Chat',
    isThinking: false,
    moleculesLoading: false,
    similarMoleculesLoading: false,
    messages: [
        { type: "system-message", text: "Welcome to the Molecular Universe. How can I help you today?" }
    ],
    activeMolecule: null,
    foundMolecules: [],
    similarMolecules: [],
    createdAt: new Date().toISOString(),
})

export const useChatStore = create(persist((set, get) => ({
    
    isLoading: false,
    error: null,
    isSynced: false,
    activeChat: "-1",
    chatMap: {
        "-1": generateNewChat()
    },

    updateNewChatId: (chatId) => {
        set(produce((state) => {
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
            
            // Add chat with new ID
            state.chatMap[chatId] = chatData;
            delete state.chatMap['-1'];
            state.activeChat = chatId;
        }));
    },

    loadHistory: async () => {
        console.log("Loading chat history from server...");
        get().createChat(); // Ensure default chat is created if not present
        try {
            const historyData = await authFetch(`${API_URL}/chat-history`).then(res => res.json());
            console.log("Chat history loaded:", historyData);
            set(produce((draft) => {
                draft.isSynced = true;

                // Delete all existing chats except the default one
                draft.chatMap = {
                    "-1": generateNewChat()
                };

                if (historyData.length > 0) {
                    historyData.forEach(chat => {
                            draft.chatMap[chat.id] = {
                                createdAt: chat.created_at,
                                name: chat.chat_name || 'New Chat',
                                messages: chat.content.map(item => ({
                                    type: item.role === 'system' ? 'system-message' : item.role === 'user' ? 'user-message' : 'llm-message',
                                    text: item.content || '',
                                    molText: item.molecules.join(", ") || [],
                                    molecules: item.molecules || [],
                                })) || [],
                            activeMolecule: chat.meta_active_molecule || null,
                            foundMolecules: chat.meta_molecules || [],
                            similarMolecules: chat.meta_similar_molecules || [],
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

    deleteChat: async (chatId) => {
        set(produce((state) => {
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
        if (chatId !== '-1' && !get().chatMap[chatId]) {
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

    createChat: (name = 'New Chat') => {
        set(produce((state) => {
            if (state.chatMap['-1']) {
                console.warn("Default chat already exists, not creating a new one.");
                return;
            }

            console.log("Creating new chat with name:", name);
            state.chatMap['-1'] = generateNewChat();
            state.activeChat = '-1';
        }));
    },

    setActiveChat: (chatId) => {
        console.log("Setting active chat to:", chatId);
        set({ activeChat: chatId });
    },

    // LLM actions
    setIsThinking: (isThinking, chatId = null) => set(produce((state) => {
        console.log("Setting isThinking for chat:", chatId || state.activeChat, isThinking);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.isThinking = isThinking;
    })),

    // Message actions (immer: only update active chat)
    setMessages: (messagesOrUpdater, chatId = null) => set(produce((state) => {
        console.log("Setting messages for chat:", chatId || state.activeChat);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.messages = typeof messagesOrUpdater === 'function'
            ? messagesOrUpdater(chat.messages)
            : [...messagesOrUpdater];
    })),
    addMessage: (message, chatId = null) => set(produce((state) => {
        if (message.type === 'user-message' && state.activeChat === '-1') {
            state.chatMap[state.activeChat].name = message.text;
        }
        console.log("Adding message to chat:", chatId || state.activeChat, message);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.messages.push(message);
    })),
    clearMessages: () => set(produce((state) => {
        console.log("Clearing messages for chat:", state.activeChat);
        const chat = state.chatMap[state.activeChat];
        if (!chat) return;
        chat.messages = [];
    })),

    // Molecule actions (immer: only update active chat)
    setFoundMolecules: async (molecules, chatId = null) => {
        set(produce((state) => {
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
                    chat_id: parseInt(chatId || get().activeChat),
                    meta_molecules: JSON.stringify(molecules),
                })
            });
        } catch (error) {
            console.error("Failed to update found molecules on server:", error);
        }
    },
    setSimilarMolecules: async (molecules, chatId = null) => {
        set(produce((state) => {
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
                    chat_id: parseInt(chatId || get().activeChat),
                    meta_similar_molecules: JSON.stringify(molecules),
                })
            });
        } catch (error) {
            console.error("Failed to update similar molecules on server:", error);
        }
    },
    setActiveMolecule: (molecule, chatId = null) => set(produce((state) => {
        console.log("Setting active molecule for chat:", chatId || state.activeChat, molecule);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.activeMolecule = molecule;
    })),

    setMoleculesLoading: (isLoading, chatId = null) => set(produce((state) => {
        console.log("Setting molecules loading state for chat:", chatId || state.activeChat, isLoading);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.moleculesLoading = isLoading;
    })),

    setSimilarMoleculesLoading: (isLoading, chatId = null) => set(produce((state) => {
        console.log("Setting similar molecules loading state for chat:", chatId || state.activeChat, isLoading);
        const chat = state.chatMap[chatId || state.activeChat];
        if (!chat) return;
        chat.similarMoleculesLoading = isLoading;
    })),

}), {
    name: 'chat-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        isSynced: false,
        activeChat: state.activeChat,
        chatMap: Object.fromEntries(
            Object.entries(state.chatMap).map(([key, value]) => [
                key,
                {
                    name: value.name,
                    messages: value.messages,
                    activeMolecule: value.activeMolecule,
                    foundMolecules: value.foundMolecules,
                    similarMolecules: value.similarMolecules,
                    createdAt: value.createdAt,
                }
            ])
        )
    }),
}));

export const useActiveChatData = () => {
    return useChatStore((state) => state.chatMap[state.activeChat], (oldData, newData) => {
        // Deep comparison of the relevant data to prevent unnecessary re-renders
        return (
            oldData.foundMolecules === newData.foundMolecules &&
            oldData.similarMolecules === newData.similarMolecules &&
            oldData.activeMolecule === newData.activeMolecule &&
            oldData.messages === newData.messages &&
            oldData.isThinking === newData.isThinking &&
            oldData.moleculesLoading === newData.moleculesLoading &&
            oldData.similarMoleculesLoading === newData.similarMoleculesLoading
        );
    });
};