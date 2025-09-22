import React from 'react';
import { useTranslation } from 'react-i18next';

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

const getStatusColor = (status: string) => {
  if (status === 'Positive') return '#10b981';
  if (status === 'Negative') return '#ef4444';
  if (status === 'Neutral') return '#f59e0b';
  return '#6b7280';
};

const getStatusBg = (status: string) => {
  if (status === 'Positive') return '#ecfdf5';
  if (status === 'Negative') return '#fef2f2';
  if (status === 'Neutral') return '#fffbeb';
  return '#f9fafb';
};

export const renderPerformanceCard = (
  record: PredictionResult,
  onView?: (item: PredictionResult) => void,
  onDelete?: (itemId: string) => void
) => {
  const { t } = useTranslation();
  
  return (
    <div className="history-item">
      <div className="item-header">
        <div className="date-status">
          <span className="date">{record.date}</span>
          <span className="status completed">{t('performance.history.status.completed')}</span>
        </div>
      </div>
      
      <div className="item-content">
        <div className="battery-system">
          <span className="system-name">{record.batterySystem}</span>
        </div>
        
        <div className="additive">
          <span className="additive-formula">{record.additive}</span>
        </div>
        
        <div className="results-preview">
          <div className="result-tags">
            <span 
              className="result-tag"
              style={{ 
                color: getStatusColor(record.results.temp25.cycleLife),
                backgroundColor: getStatusBg(record.results.temp25.cycleLife)
              }}
            >
              25°C: 1/3 {record.results.temp25.cycleLife}
            </span>
            <span 
              className="result-tag"
              style={{ 
                color: getStatusColor(record.results.temp45.cycleLife),
                backgroundColor: getStatusBg(record.results.temp45.cycleLife)
              }}
            >
              45°C: 1/2 {record.results.temp45.cycleLife}
            </span>
          </div>
        </div>
      </div>
      
      <div className="item-actions">
        <button 
          className="view-details-btn"
          onClick={() => onView && onView(record)}
        >
          {t('performance.history.actions.viewDetails')}
        </button>
        <button 
          className="delete-btn"
          onClick={() => onDelete && onDelete(record.id)}
        >
          {t('performance.history.actions.delete')}
        </button>
      </div>
    </div>
  );
};