import React, { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import PredictionModule from '../components/PredictionModule';
import './index.less';
import { LeftOutlined } from '@ant-design/icons';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [resetKey, setResetKey] = useState(0);

  const handleBackToList = () => {
    navigate('/design?tab=records');
  };

  const handleNewDesign = () => {
    // 重置页面状态
    setResetKey(prev => prev + 1);
  };

  return (
    <div className="design-create-container">
      <div className="design-create-content">
        <div className="design-create-actions">
          <h1 className="design-title">{t('design.create.title', 'New Design')}</h1>
          <div className="right-actions">
            <button className="new-design-button" onClick={handleNewDesign}>
              {t('design.actions.newDesign', 'New Design')}
            </button>
            <button className="back-button" onClick={handleBackToList}>
              <LeftOutlined style={{ marginRight: 8 }} />
              {t('design.actions.back', 'Back')}
            </button>
          </div>
        </div>

        <div className="design-operation-area">
          <PredictionModule key={resetKey} />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
