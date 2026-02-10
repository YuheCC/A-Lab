import React from 'react';
import { useNavigate } from 'umi';
import { useTranslation } from 'react-i18next';
import './index.less';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <div className="error-code">404</div>
        </div>

        <h1 className="not-found-title">{t('common.notFound.title')}</h1>
        <p className="not-found-message">{t('common.notFound.message')}</p>

        <div className="not-found-actions">
          <button className="not-found-btn primary" onClick={handleGoHome}>
            {t('common.notFound.goHome')}
          </button>
          <button className="not-found-btn secondary" onClick={handleGoBack}>
            {t('common.notFound.goBack')}
          </button>
        </div>

        <div className="not-found-suggestions">
          <p className="suggestions-title">{t('common.notFound.suggestions')}</p>
          <ul className="suggestions-list">
            <li>{t('common.notFound.suggestion1')}</li>
            <li>{t('common.notFound.suggestion2')}</li>
            <li>{t('common.notFound.suggestion3')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
