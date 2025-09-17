import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormulationModule from './components/FormulationModule';
import HistoryModule from './components/HistoryModule';
import './index.css';

interface FormulationResult {
  id: string;
  date: string;
  saltConfiguration: {
    cation: string;
    anion: string;
    totalConcentration: number;
    fractionType: 'mole' | 'weight';
    anionFraction: number;
  };
  solventConfiguration: string;
}

const FormulationPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useState<FormulationResult | null>(null);
  const [resetFormulationFn, setResetFormulationFn] = useState<(() => void) | null>(null);

  const handleNewFormulation = () => {
    if (resetFormulationFn) {
      resetFormulationFn();
      console.log('Formulation state reset');
    } else {
      console.log('Reset function not available yet');
    }
  };

  const handleResetRef = (resetFn: () => void) => {
    setResetFormulationFn(() => resetFn);
  };

  const handleViewDetails = (result: FormulationResult) => {
    setSelectedResult(result);
  };

  return (
    <div className="formulation-tool">
      <div className="formulation-header">
        <h1 className="formulation-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
        <span className="formulation-subtitle">{t('formulation.subtitle', 'Configure and customize your electrolytes')}</span>
      </div>

      <div className="formulation-content">
        <div className="operation-area">
          <FormulationModule onResetRef={handleResetRef} />
        </div>

        <div className="history-area">
          <HistoryModule
            onViewDetails={handleViewDetails}
            onNewFormulation={handleNewFormulation}
          />
        </div>
      </div>
    </div>
  );
};

export default FormulationPage;