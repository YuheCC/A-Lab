import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Pricing.css';
import '@/components/SettingModal/settingModal.css';
import { useNavigate } from 'umi';
import { useAuthStore } from '@/models/useAuth';
import ContactSalesModal from '@/components/ContactSalesModal';
import { sendEducationCode } from '@/services/auth';
import { useMessage } from '@/components/MessageProvider';
import { useEffect } from 'react';
import { useLoginModal } from '@/components/LoginModal/hooks';

type TierId = 'basic' | 'research' | 'explorer' | 'team' | 'enterprise1' | 'enterprise2' | 'enterprise3' | 'joint';

interface PlanConfig {
  id: TierId;
  key: string;
  highlight?: boolean;
  buttonVariant?: 'primary' | 'secondary';
}

const PERSONAL_PLAN_CONFIGS: PlanConfig[] = [
  { id: 'basic', key: 'basic' },
  { id: 'research', key: 'research' },
  { id: 'explorer', key: 'explorer', highlight: true },
  { id: 'team', key: 'team' },
];

const BUSINESS_PLAN_CONFIGS: PlanConfig[] = [
  { id: 'enterprise1', key: 'enterprise1', buttonVariant: 'secondary' },
  { id: 'enterprise2', key: 'enterprise2', buttonVariant: 'secondary' },
  { id: 'enterprise3', key: 'enterprise3', buttonVariant: 'secondary' },
  { id: 'joint', key: 'joint', buttonVariant: 'secondary' },
];

const PERMISSION_NORMALIZATION: Record<string, TierId | 'admin'> = {
  basic: 'basic',
  common: 'basic',
  research: 'research',
  explorer: 'explorer',
  team: 'team',
  enterprise: 'enterprise1',
  enterprise1: 'enterprise1',
  enterprise_i: 'enterprise1',
  enterprise2: 'enterprise2',
  enterprise_ii: 'enterprise2',
  enterprise3: 'enterprise3',
  enterprise_iii: 'enterprise3',
  joint: 'joint',
  admin: 'admin',
};

const TIER_RANK: Record<TierId | 'admin', number> = {
  basic: 0,
  research: 1,
  explorer: 2,
  team: 3,
  enterprise1: 4,
  enterprise2: 5,
  enterprise3: 6,
  joint: 7,
  admin: 8,
};

const normalizeTierKey = (tier?: string | null): TierId | 'admin' | null => {
  if (!tier) {
    return null;
  }
  return PERMISSION_NORMALIZATION[tier] ?? null;
};

const getTierRankValue = (tier?: string | null): number => {
  const normalized = normalizeTierKey(tier);
  if (!normalized) {
    return -1;
  }
  return TIER_RANK[normalized];
};

const isEnterpriseTier = (tier: TierId) => tier === 'enterprise1' || tier === 'enterprise2' || tier === 'enterprise3';

interface PricingProps {
  showHeader?: boolean;
  className?: string;
  permission?: string | null;
}

const Pricing = ({ showHeader = true, className = '', permission }: PricingProps) => {
  const { t } = useTranslation();
  const [activeGroup, setActiveGroup] = useState<'personal' | 'business'>('personal');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'enterprise1' | 'enterprise2' | 'enterprise3' | 'joint'>('enterprise1');
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [educationEmail, setEducationEmail] = useState('');
  const [educationError, setEducationError] = useState('');
  const [isSendingEducation, setIsSendingEducation] = useState(false);
  const navigate = useNavigate();
  const { userPermissions: myPermission, userInfo, isAuthenticated } = useAuthStore();
  const { success, error } = useMessage();
  const { openLoginModal } = useLoginModal();

  const handleGroupSwitch = (group: 'personal' | 'business') => {
    setActiveGroup(group);
  };

  const myTierRank = getTierRankValue(myPermission);

  const hasPermission = (target: TierId | string) => {
    if (!isAuthenticated) {
      return false;
    }
    if (myTierRank < 0) {
      return false;
    }
    const targetRank = getTierRankValue(target);
    if (targetRank < 0) {
      return false;
    }
    return myTierRank >= targetRank;
  };

  const pricingUrlMap = useMemo(() => ({
    explorer: explorer_url ? `${explorer_url}?prefilled_email=${userInfo?.email ?? ''}` : '',
    team: team_url ? `${team_url}?prefilled_email=${userInfo?.email ?? ''}` : '',
  }), [userInfo?.email]);

  const openEducationModal = () => {
    setShowEducationModal(true);
    setEducationEmail('');
    setEducationError('');
  };

  const handleEducationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openEducationModal();
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

  const clickButtonHandler = (tier: TierId) => {
    // 企业版按钮（Enterprise I/II/III、Joint）不需要登录检查
    const isEnterprisePlan = isEnterpriseTier(tier) || tier === 'joint';
    
    // 如果是 showHeader 的情况
    if (showHeader) {
      // 如果不是企业版按钮（非 contact 按钮），跳转到 /map?showPricing
      if (!isEnterprisePlan) {
        navigate('/map?showPricing=true&permission=' + tier);
        return;
      }
      // 如果是企业版按钮，继续执行下面的逻辑（打开 contact modal）
    }
    
    if (!isEnterprisePlan) {
      // 个人计划按钮需要登录检查
      if (!localStorage.getItem('token')) {
        openLoginModal();
        return;
      }
    }

    if (tier === 'research') {
      openEducationModal();
      return;
    }

    if (isEnterprisePlan) {
      setSelectedPlan(tier);
      setContactModalOpen(true);
      return;
    }

    const targetUrl = pricingUrlMap[tier as keyof typeof pricingUrlMap];
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
  };

  const filteredPersonalPlans = useMemo(() => {
    return PERSONAL_PLAN_CONFIGS;
  }, []);

  const filteredBusinessPlans = useMemo(() => {
    return BUSINESS_PLAN_CONFIGS;
  }, []);

  const availablePersonalPlans = useMemo(() => {
    if (!isAuthenticated) {
      return filteredPersonalPlans;
    }
    return filteredPersonalPlans.filter((plan) => getTierRankValue(plan.id) > myTierRank);
  }, [isAuthenticated, myTierRank, filteredPersonalPlans]);

  const availableBusinessPlans = useMemo(() => {
    if (!isAuthenticated) {
      return filteredBusinessPlans;
    }
    return filteredBusinessPlans.filter((plan) => getTierRankValue(plan.id) > myTierRank);
  }, [isAuthenticated, myTierRank, filteredBusinessPlans]);

  const noPlansAvailable = !showHeader && isAuthenticated && availablePersonalPlans.length === 0 && availableBusinessPlans.length === 0;
  const personalGroupDisabled = !showHeader && availablePersonalPlans.length === 0;
  const businessGroupDisabled = !showHeader && availableBusinessPlans.length === 0;

  const renderPlanCard = (plan: PlanConfig) => {
    const title = t(`pricing.${plan.key}.title`);
    const description = t(`pricing.${plan.key}.description`);
    const price = t(`pricing.${plan.key}.price`);
    const period = t(`pricing.${plan.key}.period`);
    const cta = t(`pricing.${plan.key}.cta`);
    const details = t(`pricing.${plan.key}.details`, { returnObjects: true }) as string[];
    const detailItems = Array.isArray(details) ? details : [];
    const subtitle = t(`pricing.${plan.key}.subtitle`, { defaultValue: '' }) as string;
    const isDisabled = hasPermission(plan.id);
    const buttonClass = ['pricing-btn', plan.buttonVariant === 'secondary' ? 'secondary' : '']
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`pricing-card ${plan.highlight ? 'highlight' : ''}`} key={plan.id}>
        <div className="pricing-card-top">
          <div className="pricing-title">{title}</div>
          <div className="pricing-subtitle">{subtitle}</div>
          <div className="pricing-access">{description}</div>
          {(price || period) && (
            <div className="pricing-price">
              {price}
              <span className="pricing-unit">{period}</span>
            </div>
          )}
        </div>
        <button
          disabled={isDisabled}
          onClick={() => clickButtonHandler(plan.id)}
          className={buttonClass}
          data-permission={plan.id}
        >
          {cta}
        </button>
        <ul className="pricing-features">
          {detailItems.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    if (!permission) {
      return;
    }

    const normalized = normalizeTierKey(permission);
    if (!normalized || normalized === 'admin') {
      return;
    }

    if (myPermission && hasPermission(normalized)) {
      return;
    }

    if (isEnterpriseTier(normalized) || normalized === 'joint') {
      setActiveGroup('business');
    }
  
    if(myPermission)clickButtonHandler(normalized);
  }, [permission, myPermission]);

  useEffect(() => {
    console.log('activeGroup', activeGroup);
  }, [activeGroup]);

  return (
    <section id="pricing" className={`pricing-section ${className}`}>
      {showHeader && (
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0}}>{t('pricing.title')}</h2>
          <a href="/map" style={{color: '#1c7c54', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginLeft: '20px'}}>
            {t('about.navigation.enterMu')} ↗
          </a>
        </div>
      )}
      
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

      {filteredPersonalPlans.length > 0 && (
        <div className={`pricing-group ${activeGroup === 'personal' ? 'active' : ''}`} data-group="personal">
          <div className="pricing-grid">
            {filteredPersonalPlans.map((plan) => renderPlanCard(plan))}
          </div>
        </div>
      )}

      {filteredBusinessPlans.length > 0 && (
        <div className={`pricing-group ${activeGroup === 'business' ? 'active' : ''}`} data-group="business">
          <div className="pricing-grid">
            {filteredBusinessPlans.map((plan) => renderPlanCard(plan))}
          </div>
        </div>
      )}

      {noPlansAvailable && (
        <div style={{ textAlign: 'center', marginTop: '24px', color: '#6b7280' }}>
          {t('pricing.noHigherPlansMessage', 'You already have the highest level available. Contact us if you need anything else.')}
        </div>
      )}
      
      {/* <div className="pricing-footer-note">
        {t('pricing.footer.note')} <span className="pricing-verify-link">{t('pricing.footer.verify')}</span>
      </div> */}
      
      <ContactSalesModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        planType={selectedPlan}
        userEmail={userInfo?.email}
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
