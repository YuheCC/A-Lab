import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PredictionModule from './components/PredictionModule';
import HistoryModule from './components/HistoryModule';
import ResultModal from './components/ResultModal';
import './index.css';

interface PredictionResult {
  id: string;
  date: string;
  batterySystem: string;
  additive: string;
  results: {
    temp25: {
      cycleLife: string;
      ce: string;
      ratePerformance: string;
    };
    temp45: {
      cycleLife: string;
      ce: string;
    };
  };
  llmAnalysis: {
    optimization: string;
    cycling: string;
  };
}

const PerformancePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resetPredictionFn, setResetPredictionFn] = useState<(() => void) | null>(null);

  const handleNewPrediction = () => {
    // Call the reset function to clear current prediction state
    if (resetPredictionFn) {
      resetPredictionFn();
      console.log('Prediction state reset');
    } else {
      console.log('Reset function not available yet');
    }
  };

  const handleResetRef = (resetFn: () => void) => {
    setResetPredictionFn(() => resetFn);
  };

  const handleViewDetails = (result: PredictionResult) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
  };

  return (
    <div className="prediction-tool">
      <div className="prediction-layout">
        <div className="left-area">
          <HistoryModule
            onViewDetails={handleViewDetails}
            onNewPrediction={handleNewPrediction}
          />
        </div>

        <div className="right-area">
          <div className="prediction-header">
            <div className="title-row">
              <h1 className="prediction-title">{t('performance.title')}</h1>
              <span className="beta-tag">{t('performance.beta')}</span>
            </div>
            <p className="prediction-subtitle">{t('performance.subtitle')}</p>
          </div>

          <div className="operation-area">
            <PredictionModule onResetRef={handleResetRef} />
          </div>
        </div>
      </div>

      {showModal && selectedResult && (
        <ResultModal
          result={selectedResult}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PerformancePage;