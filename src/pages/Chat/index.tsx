import './chat-styles.css';
import ChatSider from './components/ChatSider';
import ChatWelcome from './components/ChatWelcome';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import MoleculeModal from './components/MoleculeModal';
import { ChatProvider, useChatContext } from './context/ChatContext';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/models/useAuth';

const ChatContent: React.FC = () => {
    const {
        currentChatId,
        showInput,
        wsConnected,
        isLoading,
        moleculePanelState,
        handleMoleculePanelClose,
        handleFindSimilar,
        messages,
    } = useChatContext();
    const { t } = useTranslation();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const initialAuthLoaded = useAuthStore(state => state.initialAuthLoaded);
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isPublic = initialAuthLoaded && (!isAuthenticated || userPermissions === 'common');

    return (
        <>
            <div className="chat-container chat-container-with-messages">
                <ChatSider />
                <main className="chat-main" id="chatMain" style={{ position: 'relative' }}>
                    <div className="chat-messages" id="chat-messages">
                        {currentChatId ? <MessageList /> : <ChatWelcome />}
                    </div>
                    {showInput && (
                        <>
                            {!wsConnected && (
                                <div style={{
                                    background: '#fff3cd',
                                    border: '1px solid #ffeaa7',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    margin: '8px 16px',
                                    fontSize: '14px',
                                    color: '#856404',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                    backgroundColor: '#ffc107',
                                    animation: 'pulse 2s infinite'
                                }}></div>
                                    {t('chatbox.status.connectingToServer')}
                                </div>
                            )}
                            <ChatInput
                                disabled={isLoading || !wsConnected || isPublic}
                                inputLocked={isPublic}
                            />
                        </>
                    )}
                </main>
            </div>
            {moleculePanelState.isVisible && (
                <MoleculeModal
                    moleculeName={moleculePanelState.currentMolecule?.name || moleculePanelState.currentMolecule?.SMILES || 'LiPF6'}
                    molecule={moleculePanelState.currentMolecule}
                    onClose={handleMoleculePanelClose}
                    onFindSimilar={handleFindSimilar}
                    messages={messages}
                />
            )}
        </>
    );
};

const Chat: React.FC = () => {
    return (
        <ChatProvider>
            <ChatContent />
        </ChatProvider>
    );
};

export default Chat;
