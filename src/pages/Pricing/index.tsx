import { useNavigate } from "umi";
import { useTranslation } from 'react-i18next';
import Sidebar from "@/components/Sidebar";

// Pricing Page component
const PricingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  return (
    <Sidebar>
      <div className="pricing-container" style={{ display: 'flex', width: '100%', padding: '0' }}>
        <div className="pricing-cards" style={{ width: '100%' }}>
          <div className="pricing-card">
            {/* <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm4-9H8v2h8Z"/>
            </svg>
          </div> */}
            <h2>{t('pricing.research.title')}</h2>
            <p className="pricing-description">
              {t('pricing.research.description')}
            </p>
            <div className="pricing-price">
              <span className="price-amount">{t('pricing.research.price')}</span>
              <span className="price-period">{t('pricing.research.period')}</span>
            </div>
            <button
              className="pricing-cta research"
              onClick={() => {
                navigate('/login');
              }}
            >
              {t('pricing.research.cta')}
            </button>
            <div className="pricing-details">
              <ul>
                {t('pricing.research.details', { returnObjects: true }).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pricing-card">
            <h2>{t('pricing.explorer.title')}</h2>
            <p className="pricing-description">
              {t('pricing.explorer.description')}
            </p>
            <div className="pricing-price">
              <span className="price-amount">{t('pricing.explorer.price')}</span>
              <span className="price-period">{t('pricing.explorer.period')}</span>
            </div>
            <button
              className="pricing-cta professional"
              onClick={() => window.open('https://buy.stripe.com/6oE165fCb3Tf0qA5kl', '_blank')}
            >
              {t('pricing.explorer.cta')}
            </button>
            <div className="pricing-details">
              <ul>
                {t('pricing.explorer.details', { returnObjects: true }).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pricing-card">
            <h2>{t('pricing.team.title')}</h2>
            <p className="pricing-description">
              {t('pricing.team.description')}
            </p>
            <div className="pricing-price">
              <span className="price-amount">{t('pricing.team.price')}</span>
              <span className="price-period">{t('pricing.team.period')}</span>
            </div>
            <button className="pricing-cta unlimited"
              onClick={() => window.open('https://buy.stripe.com/dR67utfCb3TffludQS', '_blank')}
            >
              {t('pricing.team.cta')}
            </button>
            <div className="pricing-details">
              <ul>
                {t('pricing.team.details', { returnObjects: true }).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pricing-card">
            <h2>{t('pricing.enterprise.title')}</h2>
            <p className="pricing-description">
              {t('pricing.enterprise.description')}
            </p>
            <div className="pricing-price">
              <span className="price-amount">{t('pricing.enterprise.price')}</span>
              <span className="price-period">{t('pricing.enterprise.period')}</span>
            </div>
            <button
              className="pricing-cta strategic"
              onClick={() => window.location.href = 'mailto:partnership@ses.ai?subject=Joint Development Inquiry'}
            >
              {t('pricing.enterprise.cta')}
            </button>
            <div className="pricing-details">
              <ul>
                {t('pricing.enterprise.details', { returnObjects: true }).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pricing-card">
            <h2>{t('pricing.joint.title')}</h2>
            <p className="pricing-description">
              {t('pricing.joint.description')}
            </p>
            <div className="pricing-price">
              <span className="price-amount">{t('pricing.joint.price')}</span>
              <span className="price-period">{t('pricing.joint.period')}</span>
            </div>
            <button
              className="pricing-cta joint"
              onClick={() => window.location.href = 'mailto:Yumin.Zhang@ses.ai?subject=Joint Development Inquiry'}
            >
              {t('pricing.joint.cta')}
            </button>
            <div className="pricing-details">
              <ul>
                {t('pricing.joint.details', { returnObjects: true }).map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>
    </Sidebar>
  );
};

export default PricingPage;