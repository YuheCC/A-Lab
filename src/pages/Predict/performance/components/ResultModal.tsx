import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import './ResultModal.css';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import { Info } from 'lucide-react';

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
  const { t } = useTranslation();

  // Same processing logic as in PredictionModule
  const processPerformanceMetric = (propValue: string, labelValue: string) => {
    // Parse string values to numbers
    const prob = parseFloat(propValue || '0');
    const label = parseInt(labelValue || '0');
    
    // Determine status based on label
    let status: string;
    if (label === 0) {
      status = 'Positive';  // Positive
    } else if (label === 1) {
      status = 'Negative';  // Negative
    } else {
      status = 'UNKNOWN';
    }
    
    // Format confidence percentage
    const confidence = parseFloat((prob * 100).toFixed(1));
    const displayConfidence = label === 0 ? 100 - confidence : confidence;
    return {
      status,
      confidence: displayConfidence,
      rawProb: prob,
      rawLabel: label
    };
  };

  // Try to extract raw API data if available, otherwise use transformed data
  const getProcessedResults = () => {
    // If the result object has raw API data, use it for processing
    if ((result as any).rawApiData) {
      const apiData = (result as any).rawApiData;
      return {
        temp25: {
          cycleLife: processPerformanceMetric(apiData.temperature_25_CL_prob, apiData.temperature_25_CL_label),
          ce: processPerformanceMetric(apiData.temperature_25_CE_prob, apiData.temperature_25_CE_label),
          ratePerformance: processPerformanceMetric(apiData.temperature_25_CR_prob, apiData.temperature_25_CR_label)
        },
        temp45: {
          cycleLife: processPerformanceMetric(apiData.temperature_45_CL_prob, apiData.temperature_45_CL_label),
          ce: processPerformanceMetric(apiData.temperature_45_CE_prob, apiData.temperature_45_CE_label)
        }
      };
    } else {
      // Fallback to mock data with proper processing
      return {
        temp25: {
          cycleLife: { status: result.results.temp25.cycleLife, confidence: 98.5 },
          ce: { status: result.results.temp25.ce, confidence: 95.2 },
          ratePerformance: { status: result.results.temp25.ratePerformance, confidence: 94.3 }
        },
        temp45: {
          cycleLife: { status: result.results.temp45.cycleLife, confidence: 96.8 },
          ce: { status: result.results.temp45.ce, confidence: 92.1 }
        }
      };
    }
  };

  const processedResults = getProcessedResults();

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
          <h2>{t('performance.results.title')}</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="result-modal-content">
          <div className="result-section">
            <h3>{t('performance.batterySystemSelection.title')}</h3>
            <div className="system-info">
              <div className="info-row">
                <span className="label">{t('performance.batterySystemSelection.label')}:</span>
                <span className="value">{result.batterySystem}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('performance.additive.label')}:</span>
                <span className="value additive-value">{result.additive}</span>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>
              {t('performance.results.title')}
              <Tooltip
                title={
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {t('performance.results.titleTip')}
                  </div>
                }
                placement="top"
                classes={{ tooltip: 'white-tooltip' }}
                arrow
              >
                <div className="tip-icon-container">
                  <Info
                    size={16}
                    className="tip-icon"
                  />
                </div>
              </Tooltip>
            </h3>
            
            <div className="temperature-section">
              <h4>{t('performance.results.temperatureTabs.temp25')}</h4>
              <div className="performance-grid">
                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.cycleLife25')}</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(processedResults.temp25.cycleLife.status) }}
                    >
                      {processedResults.temp25.cycleLife.status === 'Positive' ? t('performance.results.status.positive') : 
                       processedResults.temp25.cycleLife.status === 'Negative' ? t('performance.results.status.negative') : 
                       t('performance.results.status.neutral')}
                    </span>
                  </div>
                  <div className="perf-value">{processedResults.temp25.cycleLife.confidence}%</div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.ce25')}</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(processedResults.temp25.ce.status) }}
                    >
                      {processedResults.temp25.ce.status === 'Positive' ? t('performance.results.status.positive') : 
                       processedResults.temp25.ce.status === 'Negative' ? t('performance.results.status.negative') : 
                       t('performance.results.status.neutral')}
                    </span>
                  </div>
                  <div className="perf-value">{processedResults.temp25.ce.confidence}%</div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.ratePerformance25')}</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(processedResults.temp25.ratePerformance.status) }}
                    >
                      {processedResults.temp25.ratePerformance.status === 'Positive' ? t('performance.results.status.positive') : 
                       processedResults.temp25.ratePerformance.status === 'Negative' ? t('performance.results.status.negative') : 
                       t('performance.results.status.neutral')}
                    </span>
                  </div>
                  <div className="perf-value">{processedResults.temp25.ratePerformance.confidence}%</div>
                </div>
              </div>
            </div>

            <div className="temperature-section">
              <h4>{t('performance.results.temperatureTabs.temp45')}</h4>
              <div className="performance-grid two-columns">
                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.cycleLife45')}</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(processedResults.temp45.cycleLife.status) }}
                    >
                      {processedResults.temp45.cycleLife.status === 'Positive' ? t('performance.results.status.positive') : 
                       processedResults.temp45.cycleLife.status === 'Negative' ? t('performance.results.status.negative') : 
                       t('performance.results.status.neutral')}
                    </span>
                  </div>
                  <div className="perf-value">{processedResults.temp45.cycleLife.confidence}%</div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.ce45')}</span>
                    <span 
                      className="perf-status"
                      style={{ color: getStatusColor(processedResults.temp45.ce.status) }}
                    >
                      {processedResults.temp45.ce.status === 'Positive' ? t('performance.results.status.positive') : 
                       processedResults.temp45.ce.status === 'Negative' ? t('performance.results.status.negative') : 
                       t('performance.results.status.neutral')}
                    </span>
                  </div>
                  <div className="perf-value">{processedResults.temp45.ce.confidence}%</div>
                </div>
              </div>
            </div>
          </div>

          <div className="result-section">
            <h3>{t('performance.llmAnalysis.title')}</h3>
            <div className="analysis-content" style={{ fontSize: '14px', paddingTop: 0 }}>
              <div className="analysis-item">
                <InlineMoleculeRenderer content={result.llmAnalysis.optimization} onMoleculeClick={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;