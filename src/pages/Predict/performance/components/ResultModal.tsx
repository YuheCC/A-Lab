import React from 'react';
import './ResultModal.css';

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

interface ResultModalProps {
  result: PredictionResult;
  onClose: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const mockPercentages = {
    temp25: {
      cycleLife: '98.5%',
      ce: '95.2%',
      ratePerformance: '94.3%'
    },
    temp45: {
      cycleLife: '96.8%',
      ce: '92.1%'
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'Positive') return '#10b981';
    if (status === 'Negative') return '#ef4444';
    if (status === 'Neutral') return '#f59e0b';
    return '#6b7280';
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="result-modal-overlay" onClick={handleBackdropClick}>
      <div className="result-modal">
        <div className="modal-header">
          <h2>Calculation Results</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="result-modal-content">
          <div className="result-section">
            <h3>Battery System Selection</h3>
            <div className="system-info">
              <div className="info-row">
                <span className="label">Battery System:</span>
                <span className="value">{result.batterySystem}</span>
              </div>
              <div className="info-row">
                <span className="label">Additive:</span>
                <span className="value additive-value">{result.additive}</span>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>Cell Performance Prediction</h3>
            
            <div className="temperature-section">
              <h4>25°C Performance</h4>
              <div className="performance-grid">
                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">25 °C Cycle life</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(result.results.temp25.cycleLife) }}
                    >
                      {result.results.temp25.cycleLife}
                    </span>
                  </div>
                  <div className="perf-value">{mockPercentages.temp25.cycleLife}</div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">25 °C CE</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(result.results.temp25.ce) }}
                    >
                      {result.results.temp25.ce}
                    </span>
                  </div>
                  <div className="perf-value">{mockPercentages.temp25.ce}</div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">25 °C Rate performance</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(result.results.temp25.ratePerformance) }}
                    >
                      {result.results.temp25.ratePerformance}
                    </span>
                  </div>
                  <div className="perf-value">{mockPercentages.temp25.ratePerformance}</div>
                </div>
              </div>
            </div>

            <div className="temperature-section">
              <h4>45°C Performance</h4>
              <div className="performance-grid two-columns">
                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">45 °C Cycle life</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(result.results.temp45.cycleLife) }}
                    >
                      {result.results.temp45.cycleLife}
                    </span>
                  </div>
                  <div className="perf-value">{mockPercentages.temp45.cycleLife}</div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">45 °C CE</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(result.results.temp45.ce) }}
                    >
                      {result.results.temp45.ce}
                    </span>
                  </div>
                  <div className="perf-value">{mockPercentages.temp45.ce}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>LLM Analysis</h3>
            <div className="analysis-content">
              <div className="analysis-item">
                <h5>1. {result.llmAnalysis.optimization}</h5>
                <p>
                  The dimethyl carbonate-based molecule (SMILES: O=C(OC(C)(C)C)O) acts as a conductor in nickel-catalyzed denitrogenation products. 
                  This reaction can improve CE degradation under voltage. During the CE optimization process, when generating this structure with electrical nickel, 
                  it is essential to maintain good CE settings, cycle reversal CE display enhancement, and optimize aging CE display improvement patterns.
                </p>
              </div>
              
              <div className="analysis-item">
                <h5>2. {result.llmAnalysis.cycling}</h5>
                <p>
                  The rolling disc approach involves enhanced material comparison and LiFe distribution optimization for secondary reactions. 
                  This biochemical nickel enhancement process addresses charge-discharge cycles under nickel enhancement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;