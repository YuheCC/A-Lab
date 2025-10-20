import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Pricing.less';
import '@/components/SettingModal/settingModal.css';
import { useNavigate } from 'umi';
import { useAuthStore } from '@/models/useAuth';
import ContactSalesModal from '@/components/ContactSalesModal';
import { sendEducationCode } from '@/services/auth';
import { useMessage } from '@/components/MessageProvider';
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

// Checkmark icon component
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="pricing-check-icon">
    <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Chevron icon component (for collapsible sections like Ask and Search)
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="pricing-chevron-icon">
    <path d="M6 9L12 15L18 9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Info icon component (for Data Security)
const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="pricing-info-icon">
    <circle cx="12" cy="12" r="10" stroke="#6B7280" strokeWidth="2"/>
    <path d="M12 16V12M12 8H12.01" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Pricing = ({ showHeader = true, className = '', permission }: PricingProps) => {
  const { t } = useTranslation();
  const [activeGroup, setActiveGroup] = useState<'personal' | 'business'>('personal');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'enterprise1' | 'enterprise2' | 'enterprise3' | 'joint'>('enterprise1');
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [educationEmail, setEducationEmail] = useState('');
  const [educationError, setEducationError] = useState('');
  const [isSendingEducation, setIsSendingEducation] = useState(false);
  
  // 折叠状态管理（默认展开）
  const [expandedSections, setExpandedSections] = useState<{
    ask: boolean;
    search: boolean;
    dataSecurity: boolean;
  }>({
    ask: true,
    search: true,
    dataSecurity: true,
  });
  
  const navigate = useNavigate();
  const { userPermissions: myPermission, userInfo, isAuthenticated } = useAuthStore();
  const { success, error } = useMessage();
  const { openLoginModal } = useLoginModal();

  const toggleSection = (section: 'ask' | 'search' | 'dataSecurity') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const pricingUrlMap = useMemo(() => {
    const email = localStorage.getItem('email') || userInfo?.email || '';
    return {
      explorer: explorer_url ? `${explorer_url}?prefilled_email=${email}` : '',
      team: team_url ? `${team_url}?prefilled_email=${email}` : '',
    };
  }, [userInfo?.email]);

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
    const isEnterprisePlan = isEnterpriseTier(tier) || tier === 'joint';
    
    if (showHeader) {
      if (!isEnterprisePlan) {
        navigate('/map?showPricing=true&permission=' + tier);
        return;
      }
    }
    
    if (!isEnterprisePlan) {
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

  // 渲染表格头部（套餐信息）
  const renderTableHeader = (plans: PlanConfig[]) => {
    return (
      <div className="pricing-table-header">
        <div className="pricing-header-cell pricing-header-empty"></div>
        {plans.map((plan) => {
          const title = t(`pricing.${plan.key}.title`);
          const description = t(`pricing.${plan.key}.description`);
          const price = t(`pricing.${plan.key}.price`);
          const period = t(`pricing.${plan.key}.period`);
          const cta = t(`pricing.${plan.key}.cta`);
          const subtitle = t(`pricing.${plan.key}.subtitle`, { defaultValue: '' }) as string;
          const isDisabled = hasPermission(plan.id);
          
          return (
            <div key={plan.id} className="pricing-header-cell pricing-plan-cell">
              <div className="pricing-plan-title">{title}</div>
              <div className="pricing-plan-description">{description}</div>
              <div className="pricing-plan-subtitle">{subtitle ?? ""}</div>
              {price && (
                <div className="pricing-plan-price-container">
                  <span className="pricing-plan-price">{price}</span>
                  {period && <span className="pricing-plan-period">{period}</span>}
                </div>
              )}
              <button
                disabled={isDisabled}
                onClick={() => clickButtonHandler(plan.id)}
                className={`pricing-plan-button ${plan.buttonVariant === 'secondary' ? 'secondary' : ''}`}
                data-permission={plan.id}
              >
                {cta}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // 渲染功能对比行
  const renderFeatureRow = (
    category: string,
    title: string,
    values: Array<string | React.ReactNode>,
    hasIcon?: boolean,
    isSubRow?: boolean,
    description?: string
  ) => {
    return (
      <div className={`pricing-feature-row ${isSubRow ? 'sub-row' : ''}`} key={category}>
        <div className={`pricing-feature-label ${isSubRow ? 'sub-label' : ''}`}>
          {hasIcon && <InfoIcon />}
          <div className="pricing-feature-label-content">
            <div className="pricing-feature-label-title">{title}</div>
            {description && <div className="pricing-feature-label-description">({description})</div>}
          </div>
        </div>
        {values.map((value, idx) => (
          <div key={idx} className="pricing-feature-cell">
            {value}
          </div>
        ))}
      </div>
    );
  };

  // 获取 Map 功能的值
  const getMapValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.map.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? '' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Ask Lightning 的值
  const getAskLightningValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.askLightning.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Ask Pro 的值
  const getAskProValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.askPro.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Deep Space 的值
  const getDeepSpaceValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.askDeepSpace.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Filter 的值
  const getFilterValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.filter.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      if (!featureData.text && hasCheckIcon) {
        return <CheckIcon />;
      }
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Search 的值
  const getSearchValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.searchSearch.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Find Friends 的值
  const getFindFriendsValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.findFriends.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      if (!featureData.text && hasCheckIcon) {
        return <CheckIcon />;
      }
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Intelligent Find Friends 的值
  const getIntelligentFindFriendsValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.intelligentFindFriends.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = plan.id !== 'basic';
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className="pricing-cell-description">{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Formulate 的值（主文本）
  const getFormulateValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.formulate.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = !['basic', 'research', 'explorer', 'team'].includes(plan.id);
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Formulate 的值（描述）
  const getFormulateDescriptionValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.formulate.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = !['basic', 'research', 'explorer', 'team'].includes(plan.id);
      
      return (
        <div className="pricing-cell-content">
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Design 的值
  const getDesignValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.design.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = !['basic', 'research'].includes(plan.id);
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`} style={{ whiteSpace: 'pre-line' }}>
              {featureData.text}
            </div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Predict 的值
  const getPredictValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.predict.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      const hasCheckIcon = ['enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(plan.id);
      
      return (
        <div className="pricing-cell-content">
          {hasCheckIcon && <CheckIcon />}
          {featureData.text && (
            <div className={`pricing-cell-text ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className={`pricing-cell-description ${!hasCheckIcon ? 'gray' : ''}`}>{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Data Security On Cloud 的值
  const getDataSecurityValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.dataSecurityOnCloud.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      
      return (
        <div className="pricing-cell-content">
          {featureData.text && (
            <div className="pricing-cell-text">{featureData.text}</div>
          )}
          {featureData.description && (
            <div className="pricing-cell-description">{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 获取 Data Security On Prem 的值（仅用于Joint Development）
  const getDataSecurityOnPremValues = (plans: PlanConfig[]) => {
    return plans.map((plan) => {
      const featureData = t(`pricing.features.dataSecurityOnPrem.${plan.id}`, { returnObjects: true }) as { text?: string; description?: string };
      
      return (
        <div className="pricing-cell-content">
          {featureData.text && (
            <div className={`pricing-cell-text ${plan.id !== 'joint' ? 'gray' : ''}`}>{featureData.text}</div>
          )}
          {featureData.description && (
            <div className="pricing-cell-description">{featureData.description}</div>
          )}
        </div>
      );
    });
  };

  // 渲染表格主体
  const renderTableBody = (plans: PlanConfig[]) => {
    return (
      <div className="pricing-table-body">
        {/* Map */}
        <div className="pricing-section-header">
          <div className="pricing-section-title">{t('pricing.featureTitles.map')}</div>
        </div>
        {renderFeatureRow('map', t('pricing.featureTitles.map'), getMapValues(plans))}

        {/* Ask */}
        <div 
          className="pricing-section-header pricing-section-collapsible" 
          onClick={() => toggleSection('ask')}
        >
          <div className="pricing-section-title">
            <div className={`pricing-chevron-wrapper ${expandedSections.ask ? 'expanded' : ''}`}>
              <ChevronIcon />
            </div>
            <span>{t('pricing.featureTitles.ask')}</span>
          </div>
        </div>
        {expandedSections.ask && (
          <>
            {renderFeatureRow(
              'ask-lightning',
              t('pricing.featureTitles.askLightning'),
              getAskLightningValues(plans),
              false,
              true,
              t('pricing.featureTitles.askLightningDescription')
            )}
            {renderFeatureRow(
              'ask-pro',
              t('pricing.featureTitles.askPro'),
              getAskProValues(plans),
              false,
              true,
              t('pricing.featureTitles.askProDescription')
            )}
            {renderFeatureRow(
              'ask-deepspace',
              t('pricing.featureTitles.askDeepSpace'),
              getDeepSpaceValues(plans),
              false,
              true,
              t('pricing.featureTitles.askDeepSpaceDescription')
            )}
          </>
        )}

        {/* Search */}
        <div 
          className="pricing-section-header pricing-section-collapsible" 
          onClick={() => toggleSection('search')}
        >
          <div className="pricing-section-title">
            <div className={`pricing-chevron-wrapper ${expandedSections.search ? 'expanded' : ''}`}>
              <ChevronIcon />
            </div>
            <span>{t('pricing.featureTitles.search')}</span>
          </div>
        </div>
        {expandedSections.search && (
          <>
            {renderFeatureRow('filter', t('pricing.featureTitles.filter'), getFilterValues(plans), false, true)}
            {renderFeatureRow('search', t('pricing.featureTitles.searchSearch'), getSearchValues(plans), false, true)}
            {renderFeatureRow('find-friends', t('pricing.featureTitles.findFriends'), getFindFriendsValues(plans), false, true)}
            {renderFeatureRow(
              'intelligent-find-friends',
              t('pricing.featureTitles.intelligentFindFriends'),
              getIntelligentFindFriendsValues(plans),
              false,
              true
            )}
          </>
        )}

        {/* Formulate */}
        <div className="pricing-section-header">
          <div className="pricing-section-title">{t('pricing.featureTitles.formulate')}</div>
        </div>
        {renderFeatureRow('formulate', t('pricing.featureTitles.formulate'), getFormulateValues(plans))}
        {renderFeatureRow('formulate-description', '', getFormulateDescriptionValues(plans), false, true)}

        {/* Design */}
        <div className="pricing-section-header">
          <div className="pricing-section-title">{t('pricing.featureTitles.design')}</div>
        </div>
        {renderFeatureRow('design', t('pricing.featureTitles.design'), getDesignValues(plans))}

        {/* Predict */}
        <div className="pricing-section-header">
          <div className="pricing-section-title">{t('pricing.featureTitles.predict')}</div>
        </div>
        {renderFeatureRow('predict', t('pricing.featureTitles.predict'), getPredictValues(plans))}

        {/* Data Security */}
        <div 
          className="pricing-section-header pricing-section-collapsible" 
          onClick={() => toggleSection('dataSecurity')}
        >
          <div className="pricing-section-title">
            <div className={`pricing-chevron-wrapper ${expandedSections.dataSecurity ? 'expanded' : ''}`}>
              <ChevronIcon />
            </div>
            <span>{t('pricing.featureTitles.dataSecurity')}</span>
          </div>
        </div>
        {expandedSections.dataSecurity && (
          <>
            {renderFeatureRow('data-security-cloud', t('pricing.featureTitles.dataSecurityOnCloud'), getDataSecurityValues(plans), false, true)}
            {plans.some(plan => plan.id === 'joint') && renderFeatureRow('data-security-prem', t('pricing.featureTitles.dataSecurityOnPrem'), getDataSecurityOnPremValues(plans), false, true)}
          </>
        )}
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
  
    if(myPermission) clickButtonHandler(normalized);
  }, [permission, myPermission]);

  return (
    <section id="pricing" className={`pricing-component pricing-section ${className}`}>
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

      {/* Personal Plans Table */}
      {filteredPersonalPlans.length > 0 && (
        <div className={`pricing-group ${activeGroup === 'personal' ? 'active' : ''}`} data-group="personal">
          <div className="pricing-table-wrapper">
            <div className="pricing-table">
              {renderTableHeader(filteredPersonalPlans)}
              {renderTableBody(filteredPersonalPlans)}
            </div>
          </div>
        </div>
      )}

      {/* Business Plans Table */}
      {filteredBusinessPlans.length > 0 && (
        <div className={`pricing-group ${activeGroup === 'business' ? 'active' : ''}`} data-group="business">
          <div className="pricing-table-wrapper">
            <div className="pricing-table">
              {renderTableHeader(filteredBusinessPlans)}
              {renderTableBody(filteredBusinessPlans)}
            </div>
          </div>
        </div>
      )}

      {noPlansAvailable && (
        <div style={{ textAlign: 'center', margin: '24px 0', color: '#6b7280' }}>
          {t('pricing.noHigherPlansMessage', 'You already have the highest level available. Contact us if you need anything else.')}
        </div>
      )}
      
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
