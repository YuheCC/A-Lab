import { useState, useImperativeHandle, forwardRef } from "react";
import { useAuthStore } from "@/models/useAuth";
import './settingModal.css';
import { useTranslation } from "react-i18next";

const SettingModal = forwardRef((props, ref) => {
    const [show, setShow] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const { userName, userPermissions: permissions, userInfo } = useAuthStore();
    const { i18n, t } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    const languageChange = (language: string) => {
        i18n.changeLanguage(language);
        setCurrentLanguage(language);
    }

    useImperativeHandle(ref, () => ({
        show: () => setShow(true),
        hide: () => setShow(false),
    }));
    
    return (
        <div className={`settings-modal modal ${show ? 'show' : ''}`} id="settingsModal">
              <div className="settings-modal-content">
                <div className="settings-modal-sidebar">
                  <button className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`} data-tab="account" onClick={() => setActiveTab('account')}>{t('settings.tabs.account')}</button>
                  <button className={`settings-tab ${activeTab === 'subscription' ? 'active' : ''}`} data-tab="subscription" onClick={() => setActiveTab('subscription')}>{t('settings.tabs.subscription')}</button>
                  <button className={`settings-tab ${activeTab === 'preference' ? 'active' : ''}`} data-tab="preference" onClick={() => setActiveTab('preference')}>{t('settings.tabs.preference')}</button>
                </div>
                <div className="settings-modal-main">
                  <div className={`settings-panel ${activeTab === 'account' ? 'active' : ''}`} data-panel="account">
                    <div className="user-info-card" style={{boxShadow: 'none', marginBottom: '32px'}}>
                      <div className="user-info-left">
                        <div className="user-info-meta">
                          <div className="user-info-name-wrapper">
                            <div className="user-info-name">{userName}</div>
                            <span className="subscription-badge">{permissions}</span>
                          </div>
                            <div className="user-info-registered">{t('settings.account.registrationTime')}: {userInfo.created_at}</div>
                        </div>
                      </div>
                    </div>
                    <div className="settings-card">
                      <div className="settings-group-title">{t('settings.account.accountInfo')}</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.account.name')}</div>
                        </div>
                        <div className="settings-item-action">{userName} <a href="#" className="settings-link">{t('settings.account.modify')}</a></div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.account.email')}</div>
                        </div>
                        <div className="settings-item-action">{userName} <a href="#" className="settings-link">{t('settings.account.modify')}</a></div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.account.password')}</div>
                        </div>
                        <div className="settings-item-action"><a href="#" className="settings-link">{t('settings.account.modify')}</a></div>
                      </div>
                    </div>
                  </div>
                  <div className={`settings-panel ${activeTab === 'subscription' ? 'active' : ''}`} data-panel="subscription" style={{display: 'none'}}>
                    <div className="settings-card">
                      <div className="settings-group-title">{t('settings.subscription.status')}</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.subscription.currentPlan')}</div>
                        </div>
                        <div className="settings-item-action">
                          <a href="#" className="redeem-team-code-link">{t('settings.subscription.redeemTeamCode')}</a>
                          <span className="subscription-badge">{permissions}</span>
                        </div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.subscription.validUntil')}</div>
                        </div>
                        <div className="settings-item-action">2025-12-31</div>
                      </div>
                    </div>
                    {
                      permissions === 'common' && (
                        <div className="settings-card">
                          <div className="settings-group-title">{t('settings.subscription.educationVerification')}</div>
                          <div className="settings-item">
                            <div className="settings-item-main">
                              <div className="settings-item-title">{t('settings.subscription.isEducationAccount')}</div>
                            </div>
                            <div className="settings-item-action">{t('settings.subscription.no')} <a href="#" id="verifyEduBtn" className="btn btn-secondary" style={{marginLeft: '12px'}}>{t('settings.subscription.verifyEducation')}</a></div>
                          </div>
                        </div>
                      )
                    }
                  </div>
                  <div className={`settings-panel ${activeTab === 'preference' ? 'active' : ''}`} data-panel="preference" style={{display: 'none'}}>
                    <div className="settings-card">
                      <div className="settings-group-title">{t('settings.preference.interfaceAndLanguage')}</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.preference.language')}</div>
                          <div className="settings-item-desc">{t('settings.preference.languageDescription')}</div>
                        </div>
                        <div className="settings-item-action">
                          <select className="lang-select" value={currentLanguage} onChange={(e) => languageChange(e.target.value)}>
                            <option value="zh">{t('settings.preference.languages.zh')}</option>
                            <option value="en">{t('settings.preference.languages.en')}</option>
                            <option value="ko">{t('settings.preference.languages.ko')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span onClick={() => setShow(false)} className="settings-modal-close close-btn" aria-label={t('settings.common.close')} tabIndex={0} style={{background: 'none', border: 'none', boxShadow: 'none', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
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