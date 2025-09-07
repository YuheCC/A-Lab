import React from 'react';
import './HistoryModule.css';

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

interface HistoryModuleProps {
  historyData: PredictionResult[];
  onViewDetails: (result: PredictionResult) => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ historyData, onViewDetails }) => {
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

  return (
    <div className="history-module">
      <div className="history-header">
        <div className="header-content">
          <h2>Prediction Records</h2>
          <button className="filter-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
          </button>
        </div>
        <button className="new-prediction-btn">
          <span>+</span> New Prediction
        </button>
      </div>

      <div className="history-list">
        {historyData.map((record) => (
          <div key={record.id} className="history-item">
            <div className="item-header">
              <div className="date-status">
                <span className="date">{record.date}</span>
                <span className="status completed">Completed</span>
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
                onClick={() => onViewDetails(record)}
              >
                View Details
              </button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryModule;