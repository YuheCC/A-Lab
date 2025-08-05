import './chat-styles.css';
import { useState } from 'react';

const Chat = () => {
    const [ isSidebarCollapsed, setIsSidebarCollapsed ] = useState(false);
    return (
        <div className="chat-container">
            <aside className={`chat-sidebar ${isSidebarCollapsed ? 'mini-sidebar' : ''}`} id="chatSidebar">
                <div className="sidebar-top-section">
                    <div style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 0 12px 0'}}>
                    <div className="ask-title">ASK</div>
                    <button id="toggleSidebarBtn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="toggle-sidebar-btn" title="Toggle sidebar" style={{background:'none',border:'none',cursor:'pointer',padding:'4px'}}>
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
                        <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                        <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                        </svg>
                    </button>
                    </div>
                    {/* Mini模式下的切换按钮 */}
                    <button id="miniToggleSidebarBtn" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mini-toggle-btn" title="Toggle sidebar">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="5" width="14" height="2" rx="1" fill="currentColor"/>
                        <rect x="3" y="9" width="14" height="2" rx="1" fill="currentColor"/>
                        <rect x="3" y="13" width="14" height="2" rx="1" fill="currentColor"/>
                    </svg>
                    </button>
                    {/* Mini模式下的新聊天按钮 */}
                    <a href="#" className="mini-new-chat-btn" id="miniNewChatBtn" title="新聊天">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="7" y="3" width="2" height="12" rx="1" fill="currentColor"/>
                        <rect x="2" y="9" width="12" height="2" rx="1" fill="currentColor"/>
                    </svg>
                    </a>
                    {/* Mini模式下的搜索按钮 */}
                    <a href="#" className="mini-search-btn" id="miniSearchBtn" title="搜索聊天">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M12.5 12.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    </a>
                    <div className="sidebar-actions">
                    <a href="#" className="new-chat-btn" id="mainNewChatBtn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7" y="3" width="2" height="12" rx="1" fill="currentColor"/><rect x="2" y="9" width="12" height="2" rx="1" fill="currentColor"/></svg>
                        <span>新聊天</span>
                    </a>
                    <a href="#" className="new-chat-btn" id="searchChatBtn">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M12.5 12.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        <span>搜索聊天</span>
                    </a>
                    </div>
                </div>
                <nav className="history-nav">
                    <p className="history-title">历史对话</p>
                    <ul>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="7">LiFePO4石墨电池电解质推荐</a>
                            <button className="chat-menu-btn" data-chat-id="7">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="1">电解质溶剂稳定性预测分析</a>
                            <button className="chat-menu-btn" data-chat-id="1">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="2">锂枝晶形成原因及抑制方法</a>
                            <button className="chat-menu-btn" data-chat-id="2">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="3">SEI层组成成分研究</a>
                            <button className="chat-menu-btn" data-chat-id="3">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="4">高镍正极材料性能优化</a>
                            <button className="chat-menu-btn" data-chat-id="4">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="5">固态电解质界面稳定性</a>
                            <button className="chat-menu-btn" data-chat-id="5">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="6">电池热管理系统设计</a>
                            <button className="chat-menu-btn" data-chat-id="6">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="8">磷酸铁锂正极材料改性研究</a>
                            <button className="chat-menu-btn" data-chat-id="8">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="9">钠离子电池电解质设计</a>
                            <button className="chat-menu-btn" data-chat-id="9">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="10">锂硫电池正极材料优化</a>
                            <button className="chat-menu-btn" data-chat-id="10">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="11">固态电池界面工程研究</a>
                            <button className="chat-menu-btn" data-chat-id="11">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="12">电池循环寿命预测模型</a>
                            <button className="chat-menu-btn" data-chat-id="12">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="13">快充技术对电池性能影响</a>
                            <button className="chat-menu-btn" data-chat-id="13">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="14">电池安全性能评估方法</a>
                            <button className="chat-menu-btn" data-chat-id="14">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="15">锂离子电池容量衰减机理</a>
                            <button className="chat-menu-btn" data-chat-id="15">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="16">电池管理系统算法优化</a>
                            <button className="chat-menu-btn" data-chat-id="16">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="17">新型电解质添加剂研究</a>
                            <button className="chat-menu-btn" data-chat-id="17">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="18">电池材料表征技术进展</a>
                            <button className="chat-menu-btn" data-chat-id="18">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="19">电池回收技术发展趋势</a>
                            <button className="chat-menu-btn" data-chat-id="19">⋯</button>
                        </li>
                        <li>
                            <a href="#" className="recent-chat" data-chat-id="20">电池制造工艺优化方案</a>
                            <button className="chat-menu-btn" data-chat-id="20">⋯</button>
                        </li>
                    </ul>
                </nav>
            </aside>
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