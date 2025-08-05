import './chat-styles.css';
import ChatSider from './components/ChatSider';

const Chat = () => {
    return (
        <div className="chat-container">
            <ChatSider />
            <main className="chat-main" id="chatMain" style={{position:'relative'}}>
                <div className="chat-messages" id="chat-messages">
                    {/* 对话内容将由JS动态插入 */}
                </div>
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea id="chat-input" placeholder="Ask me anything, as long as it's about batteries, battery chemistry, or related topics." rows={3}></textarea>
                        <div className="chat-controls-row">
                            <button id="send-btn" className="send-btn" disabled>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5V4.5M12 4.5L6 10.5M12 4.5L18 10.5" />
                                </svg>
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Chat;