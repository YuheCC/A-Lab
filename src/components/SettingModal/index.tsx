import { useState, useImperativeHandle, forwardRef } from "react";
import './settingModal.css';

const SettingModal = forwardRef((props, ref) => {
    const [show, setShow] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    
    useImperativeHandle(ref, () => ({
        show: () => setShow(true),
        hide: () => setShow(false),
    }));
    
    return (
        <div className={`settings-modal modal ${show ? 'show' : ''}`} id="settingsModal">
              <div className="settings-modal-content">
                <div className="settings-modal-sidebar">
                  <button className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`} data-tab="account" onClick={() => setActiveTab('account')}>账号管理</button>
                  <button className={`settings-tab ${activeTab === 'subscription' ? 'active' : ''}`} data-tab="subscription" onClick={() => setActiveTab('subscription')}>订阅管理</button>
                  <button className={`settings-tab ${activeTab === 'preference' ? 'active' : ''}`} data-tab="preference" onClick={() => setActiveTab('preference')}>偏好设置</button>
                </div>
                <div className="settings-modal-main">
                  <div className={`settings-panel ${activeTab === 'account' ? 'active' : ''}`} data-panel="account">
                    <div className="user-info-card" style={{boxShadow: 'none', marginBottom: '32px'}}>
                      <div className="user-info-left">
                        <div className="user-info-meta">
                          <div className="user-info-name-wrapper">
                            <div className="user-info-name">Yuhe.Chen</div>
                            <span className="subscription-badge">Explorer</span>
                          </div>
                          <div className="user-info-registered">注册时间: 2025-05-01</div>
                        </div>
                      </div>
                    </div>
                    <div className="settings-card">
                      <div className="settings-group-title">账号信息</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">姓名</div>
                        </div>
                        <div className="settings-item-action">Yuhe.Chen <a href="#" className="settings-link">修改</a></div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">注册邮箱</div>
                        </div>
                        <div className="settings-item-action">Yuhe.Chen@ses.ai <a href="#" className="settings-link">修改</a></div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">修改密码</div>
                        </div>
                        <div className="settings-item-action"><a href="#" className="settings-link">修改</a></div>
                      </div>
                    </div>
                  </div>
                  <div className={`settings-panel ${activeTab === 'subscription' ? 'active' : ''}`} data-panel="subscription" style={{display: 'none'}}>
                    <div className="settings-card">
                      <div className="settings-group-title">订阅状态</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">当前套餐</div>
                        </div>
                        <div className="settings-item-action"><span className="subscription-badge">Explorer</span></div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">有效期</div>
                        </div>
                        <div className="settings-item-action">2025-12-31</div>
                      </div>
                    </div>
                    <div className="settings-card">
                      <div className="settings-group-title">教育验证</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">是否教育账号</div>
                        </div>
                        <div className="settings-item-action">否 <a href="#" id="verifyEduBtn" className="btn btn-secondary" style={{marginLeft: '12px'}}>验证教育身份</a></div>
                      </div>
                    </div>
                  </div>
                  <div className={`settings-panel ${activeTab === 'preference' ? 'active' : ''}`} data-panel="preference" style={{display: 'none'}}>
                    <div className="settings-card">
                      <div className="settings-group-title">界面与语言</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">语言</div>
                          <div className="settings-item-desc">更改用户界面的语言。</div>
                        </div>
                        <div className="settings-item-action">
                          <select className="lang-select">
                            <option>中文</option>
                            <option>English (US)</option>
                            <option>한국어</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span onClick={() => setShow(false)} className="settings-modal-close close-btn" aria-label="关闭" tabIndex={0} style={{background: 'none', border: 'none', boxShadow: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <line x1="6" y1="6" x2="18" y2="18" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="18" y1="6" x2="6" y2="18" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </div>
            </div>
    );
});

export default SettingModal;