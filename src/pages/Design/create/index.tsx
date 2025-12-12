import React from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import PredictionModule from '../components/PredictionModule';
import './index.less';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackToList = () => {
    navigate('/design?tab=records');
  };

  return (
    <div className="design-create-container">
      <div className="design-create-content">
        <div className="design-create-actions">
          <h1 className="design-title">{t('design.create.title', 'New Design')}</h1>
          <button className="back-to-list-button" onClick={handleBackToList}>
            {t('design.actions.backToList', 'Back to List')}
          </button>
        </div>

        <div className="design-operation-area">
          <PredictionModule />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
