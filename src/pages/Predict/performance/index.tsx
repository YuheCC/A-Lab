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

  const handleNewPrediction = () => {
    // Handle new prediction action - could scroll to prediction form or reset it
    console.log('New prediction clicked');
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
      <div className="prediction-header">
        <h1 className="prediction-title">{t('performance.title')}</h1>
        <span className="beta-tag">{t('performance.beta')}</span>
      </div>
      
      <div className="prediction-content">
        <div className="operation-area">
          <PredictionModule />
        </div>
        
        <div className="history-area">
          <HistoryModule
            onViewDetails={handleViewDetails}
            onNewPrediction={handleNewPrediction}
          />
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