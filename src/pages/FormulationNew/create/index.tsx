import React from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import FormulationModule from '@/pages/Formulation/components/FormulationModule';
import './index.css';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBackToList = () => {
    navigate('/formulation');
  };

  return (
    <div className="create-page-container">
      <div className="create-header">
        <h1 className="create-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
        <span className="create-subtitle">{t('formulation.subtitle', 'Configure and customize your electrolytes')}</span>
      </div>

      <div className="create-content formulation-container">
        <div className="create-actions">
          <span className="create-action-title">{t('formulation.create.newConfiguration', 'New Configuration')}</span>
          <button className="back-to-list-button" onClick={handleBackToList}>
            {t('formulation.actions.backToList', 'Back to List')}
          </button>
        </div>
        <FormulationModule />
      </div>
    </div>
  );
};

export default CreatePage;