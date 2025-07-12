import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Pricing.css';
import '@/components/SettingModal/settingModal.css';
import { useNavigate } from 'umi';
import { useAuthStore } from '@/models/useAuth';
import ContactSalesModal from '@/components/ContactSalesModal';
import { sendEducationCode } from '@/services/auth';
import { useMessage } from '@/components/MessageProvider';

interface PricingProps {
  showHeader?: boolean;
  className?: string;
}

const Pricing = ({ showHeader = true, className = '' }: PricingProps) => {
  const { t } = useTranslation();
  const [activeGroup, setActiveGroup] = useState<'personal' | 'business'>('personal');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'enterprise' | 'joint'>('enterprise');
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [educationEmail, setEducationEmail] = useState('');
  const [educationError, setEducationError] = useState('');
  const [isSendingEducation, setIsSendingEducation] = useState(false);
  const navigate = useNavigate();
  const { userPermissions: myPermission, userInfo } = useAuthStore();
  const { success, error } = useMessage();

  const handleGroupSwitch = (group: 'personal' | 'business') => {
    setActiveGroup(group);
  };

  const permissionList = ["common", "research", "explorer", "team", "enterprise", "joint"];
  const hasPermission = (permission: string) => {
    if(!myPermission){
      return false;
    }
    const index = permissionList.indexOf(permission);
    const myIndex = permissionList.indexOf(myPermission || "common");
    return index <= myIndex;
  }

  const pricingUrlMpas = useMemo(() => ({
    research: "/map?showPricing=true",
    explorer: "https://buy.stripe.com/test_9B66oGgL2dPh0C12Mzebu01?prefilled_email=" + userInfo?.email,
    team: "https://buy.stripe.com/test_9B600iamEeTl1G572Pebu02?prefilled_email=" + userInfo?.email,
    enterprise: "",
    joint: "",
  }), [userInfo]);

  const handleEducationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowEducationModal(true);
    setEducationEmail('');
    setEducationError('');
  };

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
      
      // 跳转到验证页面
      navigate(`/verify-education?id=${data.verify_id}`);

    } catch (err: any) {
      error(err.detail || t('settings.education.error'));
    } finally {
      setIsSendingEducation(false);
    }
  };

  const handleEducationCancel = () => {
    setShowEducationModal(false);
    setEducationEmail('');
    setEducationError('');
  };

  const clickButtonHandler = (permission: string) => {
    if(showHeader){
      navigate(`/map?showPricing=true`);
      return;
    }

    // 处理 research 点击事件，显示教育邮箱验证浮层
    if(permission === 'research'){
      handleEducationClick(new MouseEvent('click') as any);
      return;
    }

    // 处理 enterprise 和 joint 点击事件，显示联系销售浮层
    if(permission === 'enterprise' || permission === 'joint'){
      setSelectedPlan(permission);
      setContactModalOpen(true);
      return;
    }

    if(pricingUrlMpas[permission as keyof typeof pricingUrlMpas]){
      window.open(pricingUrlMpas[permission as keyof typeof pricingUrlMpas], '_blank');
    }
  }

  return (
    <section id="pricing" className={`pricing-section ${className}`}>
      {showHeader && <h2>{t('pricing.title')}</h2>}
      
      <div className="pricing-switcher">
        <button 
          className={`pricing-switch-btn ${activeGroup === 'personal' ? 'active' : ''}`}
          onClick={() => handleGroupSwitch('personal')}
        >
          {t('pricing.switcher.individual')}
        </button>
        <button 
          className={`pricing-switch-btn ${activeGroup === 'business' ? 'active' : ''}`}
          onClick={() => handleGroupSwitch('business')}
        >
          {t('pricing.switcher.enterprise')}
        </button>
      </div>

      <div className={`pricing-group ${activeGroup === 'personal' ? 'active' : ''}`} data-group="personal">
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-card-top">
              <div className="pricing-title">{t('pricing.research.title')}</div>
              <div className="pricing-access">{t('pricing.research.description')}</div>
              <div className="pricing-price">{t('pricing.research.price')}<span className="pricing-unit">{t('pricing.research.period')}</span></div>
            </div>
            <button disabled={hasPermission('research')} onClick={() => clickButtonHandler('research')} className="pricing-btn">{t('pricing.research.cta')}</button>
            <ul className="pricing-features">
              {(t('pricing.research.details', { returnObjects: true }) as string[]).map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
          
          <div className="pricing-card highlight">
            <div className="pricing-card-top">
              <div className="pricing-title">{t('pricing.explorer.title')}</div>
              <div className="pricing-access">{t('pricing.explorer.description')}</div>
              <div className="pricing-price">{t('pricing.explorer.price')}<span className="pricing-unit">{t('pricing.explorer.period')}</span></div>
            </div>
            <button disabled={hasPermission('explorer')} onClick={() => clickButtonHandler('explorer')} className="pricing-btn" style={{background:'#1c7c54'}}>{t('pricing.explorer.cta')}</button>
            <ul className="pricing-features">
              {(t('pricing.explorer.details', { returnObjects: true }) as string[]).map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
          
          <div className="pricing-card">
            <div className="pricing-card-top">
              <div className="pricing-title">{t('pricing.team.title')}</div>
              <div className="pricing-access">{t('pricing.team.description')}</div>
              <div className="pricing-price">{t('pricing.team.price')}<span className="pricing-unit">{t('pricing.team.period')}</span></div>
            </div>
            <button disabled={hasPermission('team')} onClick={() => clickButtonHandler('team')} className="pricing-btn">{t('pricing.team.cta')}</button>
            <ul className="pricing-features">
              {(t('pricing.team.details', { returnObjects: true }) as string[]).map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={`pricing-group ${activeGroup === 'business' ? 'active' : ''}`} data-group="business">
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-card-top">
              <div className="pricing-title">{t('pricing.enterprise.title')}</div>
              <div className="pricing-access">{t('pricing.enterprise.description')}</div>
            </div>
            <button disabled={hasPermission('enterprise')} onClick={() => clickButtonHandler('enterprise')} className="pricing-btn secondary">{t('pricing.enterprise.cta')}</button>
            <ul className="pricing-features">
              {(t('pricing.enterprise.details', { returnObjects: true }) as string[]).map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
          
          <div className="pricing-card">
            <div className="pricing-card-top">
              <div className="pricing-title">{t('pricing.joint.title')}</div>
              <div className="pricing-access">{t('pricing.joint.description')}</div>
            </div>
            <button disabled={hasPermission('joint')} onClick={() => clickButtonHandler('joint')} className="pricing-btn secondary">{t('pricing.joint.cta')}</button>
            <ul className="pricing-features">
              {(t('pricing.joint.details', { returnObjects: true }) as string[]).map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* <div className="pricing-footer-note">
        {t('pricing.footer.note')} <span className="pricing-verify-link">{t('pricing.footer.verify')}</span>
      </div> */}
      
      <ContactSalesModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        planType={selectedPlan}
      />
      
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
    </section>
  );
};

export default Pricing; 