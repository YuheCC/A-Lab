import { useState, useImperativeHandle, forwardRef, useContext } from "react";
import { useAuthStore } from "@/models/useAuth";
import './settingModal.css';
import { useTranslation } from "react-i18next";
import { verifyRedeemCode, sendEducationCode } from "@/services/auth";
import { useMessage } from "@/components/MessageProvider";
import { useNavigate } from "umi";
import { PricingContext } from "@/layouts/index";
import RoleRender from "@/components/RoleRender";

const SettingModal = forwardRef((props, ref) => {
    const [show, setShow] = useState(false);
    const [activeTab, setActiveTab] = useState('account');
    const { userName, userPermissions: permissions, userInfo, isAuthenticated } = useAuthStore();
    const { i18n, t } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemCode, setRedeemCode] = useState('');
    const [redeemError, setRedeemError] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [showEducationModal, setShowEducationModal] = useState(false);
    const [educationEmail, setEducationEmail] = useState('');
    const [educationError, setEducationError] = useState('');
    const [isSendingEducation, setIsSendingEducation] = useState(false);
    const { success, error, warning, info } = useMessage();
    const navigate = useNavigate();
    const { setShowPricingOverlay } = useContext(PricingContext) || { setShowPricingOverlay: () => {} };

    const languageChange = (language: string) => {
        i18n.changeLanguage(language);
        setCurrentLanguage(language);
    }

    const handleRedeemClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowRedeemModal(true);
        setRedeemCode('');
        setRedeemError('');
    }

    const handleRedeemSubmit = async () => {
        if (!redeemCode.trim()) {
            setRedeemError(t('settings.redeem.empty'));
            return;
        }

        // 简单的格式验证（假设团队码格式为 8-16 位字母数字）
        // if (!/^[A-Za-z0-9]{8,16}$/.test(redeemCode.trim())) {
        //     setRedeemError(t('settings.redeem.invalid'));
        //     return;
        // }

        setIsRedeeming(true);
        setRedeemError('');

        try {
            const response: any = await verifyRedeemCode({
                voucher: redeemCode,
            });
            const { data } = response;
            if(response.ok === false) {
                error(data.detail || t('settings.redeem.error'));
                return;
            }
            setShowRedeemModal(false);
            setRedeemCode('');
            success(t('settings.redeem.success'));
            window.location.reload();

        } catch (err: any) {
            error(err.detail || t('settings.redeem.error'));
        } finally {
            setIsRedeeming(false);
        }
    }

    const handleRedeemCancel = () => {
        setShowRedeemModal(false);
        setRedeemCode('');
        setRedeemError('');
    }

    const handleEducationClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowEducationModal(true);
        setEducationEmail('');
        setEducationError('');
    }

    const handleEducationSubmit = async () => {
        if (!educationEmail.trim()) {
            setEducationError(t('settings.education.empty'));
            return;
        }

        // 邮箱格式验证
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(educationEmail.trim())) {
            setEducationError(t('settings.education.invalid'));
            return;
        }

        setIsSendingEducation(true);
        setEducationError('');

        try {
            const response: any = await sendEducationCode({
              edu_email: educationEmail.trim(),
            });
            const { data } = response;
            if(response.ok === false) {
                error(data.detail || t('settings.education.error'));
                return;
            }
            setShowEducationModal(false);
            setEducationEmail('');
            success(t('settings.education.success'));
            
            // 跳转到验证页面，在URL中包含邮箱参数
            const encodedEmail = encodeURIComponent(educationEmail.trim());
            navigate(`/verify-education?id=${data.verify_id}`);

        } catch (err: any) {
            error(err.detail || t('settings.education.error'));
        } finally {
            setIsSendingEducation(false);
        }
    }

    const handleEducationCancel = () => {
        setShowEducationModal(false);
        setEducationEmail('');
        setEducationError('');
    }

    const handleUpgradeClick = () => {
        setShow(false); // 关闭设置模态框
        setShowPricingOverlay(true); // 显示定价浮层
    }

    const displayName = isAuthenticated && userName ? userName : 'public';
    const displayRole = isAuthenticated && permissions ? permissions : 'public';
    const registrationDisplay = userInfo?.created_at ? new Date(userInfo.created_at).toLocaleString() : t('settings.account.notAvailable');
    const emailDisplay = userInfo?.email ?? t('settings.account.notAvailable');

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
                            <div className="user-info-name">{displayName}</div>
                            <RoleRender role={displayRole} />
                          </div>
                            <div className="user-info-registered">{t('settings.account.registrationTime')}: {registrationDisplay}</div>
                        </div>
                      </div>
                    </div>
                    <div className="settings-card">
                      <div className="settings-group-title">{t('settings.account.accountInfo')}</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.account.name')}: {displayName}</div>
                        </div>
                        <div className="settings-item-action"></div>
                      </div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.account.email')}: {emailDisplay}</div>
                        </div>
                        <div className="settings-item-action"></div>
                      </div>
                      {/* <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.account.password')}</div>
                        </div>
                        <div className="settings-item-action"><a href="#" className="settings-link">{t('settings.account.modify')}</a></div>
                      </div> */}
                    </div>
                  </div>
                  <div className={`settings-panel ${activeTab === 'subscription' ? 'active' : ''}`} data-panel="subscription" style={{display: 'none'}}>
                    <div className="settings-card">
                      <div className="settings-group-title">{t('settings.subscription.status')}</div>
                      <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.subscription.currentPlan')} <RoleRender role={displayRole} /></div>
                          <div className="settings-item-desc">
                          <a href="#" className="redeem-team-code-link" onClick={handleRedeemClick}>{t('settings.subscription.redeemTeamCode')}</a>
                          </div>
                        </div>
                        {
                          (permissions === 'common' || permissions === 'research') && (
                            <div className="settings-item-action">
                              <button className="upgrade-btn" onClick={handleUpgradeClick}>
                                {t('settings.subscription.upgrade')}
                              </button>
                            </div>
                          )
                        }
                        </div>
                      {/* <div className="settings-item">
                        <div className="settings-item-main">
                          <div className="settings-item-title">{t('settings.subscription.validUntil')}</div>
                        </div>
                        <div className="settings-item-action">2025-12-31</div>
                      </div> */}
                    </div>
                    {
                      permissions === 'common' && (
                        <div className="settings-card">
                          <div className="settings-group-title">{t('settings.subscription.educationVerification')}</div>
                          <div className="settings-item">
                            <div className="settings-item-main">
                              <div className="settings-item-title">
                                {t('settings.subscription.isEducationAccount')}: {userInfo?.edu_email ? t('settings.subscription.yes') : t('settings.subscription.no')}
                              </div>
                            </div>
                            <div className="settings-item-action">
                              {
                                permissions === 'common' && (
                                  <a href="#" id="verifyEduBtn" className="btn btn-secondary" style={{marginLeft: '12px'}} onClick={handleEducationClick}>{t('settings.subscription.verifyEducation')}</a>
                                )
                              }
                            </div>
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
                            <option value="ja">{t('settings.preference.languages.ja')}</option>
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
              
              {/* Redeem Code Modal */}
              {showRedeemModal && (
                <div className="redeem-modal-overlay">
                  <div className="redeem-modal-content">
                    <div className="redeem-modal-header">
                      <h3 className="redeem-modal-title">{t('settings.redeem.title')}</h3>
                      <button className="redeem-modal-close" onClick={handleRedeemCancel}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <line x1="18" y1="6" x2="6" y2="18" stroke="#999" strokeWidth="2"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="#999" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="redeem-modal-body">
                      <p className="redeem-modal-description">{t('settings.redeem.description')}</p>
                      <div className="redeem-input-group">
                        <input
                          type="text"
                          className="redeem-input"
                          placeholder={t('settings.redeem.placeholder')}
                          value={redeemCode}
                          onChange={(e) => setRedeemCode(e.target.value)}
                          maxLength={16}
                          disabled={isRedeeming}
                        />
                        {redeemError && <div className="redeem-error">{redeemError}</div>}
                      </div>
                      <div className="redeem-actions">
                        <button 
                          className="redeem-btn redeem-btn-cancel" 
                          onClick={handleRedeemCancel}
                          disabled={isRedeeming}
                        >
                          {t('settings.redeem.cancel')}
                        </button>
                        <button 
                          className="redeem-btn redeem-btn-confirm" 
                          onClick={handleRedeemSubmit}
                          disabled={isRedeeming || !redeemCode.trim()}
                        >
                          {isRedeeming ? '...' : t('settings.redeem.confirm')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Education Verification Modal */}
              {showEducationModal && (
                <div className="redeem-modal-overlay">
                  <div className="redeem-modal-content">
                    <div className="redeem-modal-header">
                      <h3 className="redeem-modal-title">{t('settings.education.title')}</h3>
                      <button className="redeem-modal-close" onClick={handleEducationCancel}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <line x1="18" y1="6" x2="6" y2="18" stroke="#999" strokeWidth="2"/>
                          <line x1="6" y1="6" x2="18" y2="18" stroke="#999" strokeWidth="2"/>
                        </svg>
                      </button>
                    </div>
                    <div className="redeem-modal-body">
                      <p className="redeem-modal-description">{t('settings.education.description')}</p>
                      <div className="redeem-input-group">
                        <input
                          type="email"
                          className="redeem-input"
                          placeholder={t('settings.education.placeholder')}
                          value={educationEmail}
                          onChange={(e) => setEducationEmail(e.target.value)}
                          disabled={isSendingEducation}
                        />
                        {educationError && <div className="redeem-error">{educationError}</div>}
                      </div>
                      <div className="redeem-actions">
                        <button 
                          className="redeem-btn redeem-btn-cancel" 
                          onClick={handleEducationCancel}
                          disabled={isSendingEducation}
                        >
                          {t('settings.education.cancel')}
                        </button>
                        <button 
                          className="redeem-btn redeem-btn-confirm" 
                          onClick={handleEducationSubmit}
                          disabled={isSendingEducation || !educationEmail.trim()}
                        >
                          {isSendingEducation ? t('settings.education.sending') : t('settings.education.confirm')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
    );
});

export default SettingModal;
