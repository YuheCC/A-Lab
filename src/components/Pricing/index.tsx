import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Pricing.css';

interface PricingProps {
  showHeader?: boolean;
  className?: string;
}

const Pricing: React.FC<PricingProps> = ({ showHeader = true, className = '' }) => {
  const { t } = useTranslation();
  const [activeGroup, setActiveGroup] = useState<'personal' | 'business'>('personal');

  const handleGroupSwitch = (group: 'personal' | 'business') => {
    setActiveGroup(group);
  };

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
            <button className="pricing-btn">{t('pricing.research.cta')}</button>
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
            <button className="pricing-btn" style={{background:'#1c7c54'}}>{t('pricing.explorer.cta')}</button>
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
            <button className="pricing-btn">{t('pricing.team.cta')}</button>
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
            <button className="pricing-btn secondary">{t('pricing.enterprise.cta')}</button>
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
            <button className="pricing-btn secondary">{t('pricing.joint.cta')}</button>
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
    </section>
  );
};

export default Pricing; 