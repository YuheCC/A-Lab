import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import './ResultModal.css';
import './PerformanceTooltip.css';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';

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

interface ProcessedMetric {
  status: 'Positive' | 'Negative' | 'Neutral' | 'Restricted';
  confidence: number | null;
  rawProb: number | null;
  rawLabel: number | null;
  isRestricted: boolean;
}

const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
  const { t } = useTranslation();

  const isMissingMetricValue = (value?: string | number | null) => {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'number') {
      return Number.isNaN(value);
    }

    const trimmed = value.trim();
    return trimmed.length === 0 || trimmed.toLowerCase() === 'none';
  };

  const restrictedMetric = (): ProcessedMetric => ({
    status: 'Restricted',
    confidence: null,
    rawProb: null,
    rawLabel: null,
    isRestricted: true,
  });

  const createFallbackMetric = (statusText: string, confidence: number): ProcessedMetric => {
    const normalizedText = statusText?.toString().trim().toLowerCase();

    if (normalizedText === 'restricted') {
      return restrictedMetric();
    }

    let status: ProcessedMetric['status'] = 'Neutral';
    if (normalizedText === 'positive' || normalizedText === '0') {
      status = 'Positive';
    } else if (normalizedText === 'negative' || normalizedText === '1') {
      status = 'Negative';
    }

    return {
      status,
      confidence,
      rawProb: null,
      rawLabel: null,
      isRestricted: false,
    };
  };

  // Same processing logic as in PredictionModule but resilient to null/undefined values
  const processPerformanceMetric = (
    probValue?: string | null,
    labelValue?: string | null
  ): ProcessedMetric => {
    if (isMissingMetricValue(probValue) || isMissingMetricValue(labelValue)) {
      return restrictedMetric();
    }

    const parsedProb = typeof probValue === 'number'
      ? probValue
      : parseFloat(probValue as string);
    const parsedLabel = typeof labelValue === 'number'
      ? labelValue
      : parseInt(labelValue as string, 10);

    if (!Number.isFinite(parsedProb) || !Number.isFinite(parsedLabel)) {
      return restrictedMetric();
    }

    let status: ProcessedMetric['status'];
    if (parsedLabel === 0) {
      status = 'Positive';
    } else if (parsedLabel === 1) {
      status = 'Negative';
    } else {
      status = 'Neutral';
    }

    const baseConfidence = parsedProb;
    if (!Number.isFinite(baseConfidence)) {
      return restrictedMetric();
    }

    const adjustedConfidence = parseFloat(baseConfidence.toFixed(3));

    if (!Number.isFinite(adjustedConfidence)) {
      return restrictedMetric();
    }

    return {
      status,
      confidence: adjustedConfidence,
      rawProb: parsedProb,
      rawLabel: parsedLabel,
      isRestricted: false,
    };
  };

  // Try to extract raw API data if available, otherwise use transformed data
  const getProcessedResults = () => {
    // If the result object has raw API data, use it for processing
    if ((result as any).rawApiData) {
      const apiData = (result as any).rawApiData;
      let quantification_result: any = {};
      try{
        const model_result = JSON.parse(apiData?.model_result);
        quantification_result = model_result?.quantification_result ?? {};
      } catch (error) {
        console.error('Error parsing API data:', error);
      }

      return {
        temp25: {
          cycleLife: processPerformanceMetric(
            quantification_result?.pred_cl_25 ?? apiData.temperature_25_CL_prob ?? apiData.temperature_25_CL_prop,
            apiData.temperature_25_CL_label
          ),
          ce: processPerformanceMetric(
            apiData.temperature_25_CE_prob ?? apiData.temperature_25_CE_prop,
            apiData.temperature_25_CE_label
          ),
          ratePerformance: processPerformanceMetric(
            quantification_result?.cr ??apiData.temperature_25_CR_prob ?? apiData.temperature_25_CR_prop,
            apiData.temperature_25_CR_label
          )
        },
        temp45: {
          cycleLife: processPerformanceMetric(
            quantification_result?.pred_cl_45 ?? apiData.temperature_45_CL_prob ?? apiData.temperature_45_CL_prop,
            apiData.temperature_45_CL_label
          ),
          ce: processPerformanceMetric(
            apiData.temperature_45_CE_prob ?? apiData.temperature_45_CE_prop,
            apiData.temperature_45_CE_label
          )
        }
      };
    } else {
      // Fallback to mock data with proper processing
      return {
        temp25: {
          cycleLife: createFallbackMetric(result.results.temp25.cycleLife, 98.5),
          ce: createFallbackMetric(result.results.temp25.ce, 95.2),
          ratePerformance: createFallbackMetric(result.results.temp25.ratePerformance, 94.3)
        },
        temp45: {
          cycleLife: createFallbackMetric(result.results.temp45.cycleLife, 96.8),
          ce: createFallbackMetric(result.results.temp45.ce, 92.1)
        }
      };
    }
  };

  const processedResults = getProcessedResults();

  const getStatusColor = (status: string) => {
    if (status === 'Positive') return '#10b981';
    if (status === 'Negative') return '#ef4444';
    if (status === 'Neutral') return '#f59e0b';
    if (status === 'Restricted') return '#9ca3af';
    return '#6b7280';
  };

  const getStatusText = (metric: ProcessedMetric) => {
    if (metric.isRestricted) {
      return t('performance.results.status.restricted');
    }
    if (metric.status === 'Positive') {
      return t('performance.results.status.positive');
    }
    if (metric.status === 'Negative') {
      return t('performance.results.status.negative');
    }
    return t('performance.results.status.neutral');
  };

  const getConfidenceText = (metric: ProcessedMetric) => {
    if (metric.isRestricted || metric.confidence === null) {
      return t('performance.results.status.restricted');
    }
    return `${metric.confidence}%`;
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
                  <div className="result-tooltip">
                    <div className="result-tooltip__section result-tooltip__section--description">
                      <div className="result-tooltip__description"><strong>{t('performance.results.descriptions.cycleLifeLabel')}:</strong> {t('performance.results.descriptions.cycleLife')}</div>
                      <div className="result-tooltip__description"><strong>{t('performance.results.descriptions.ceLabel')}:</strong> {t('performance.results.descriptions.ce')}</div>
                      <div className="result-tooltip__description"><strong>{t('performance.results.descriptions.ratePerformanceLabel')}:</strong> {t('performance.results.descriptions.ratePerformance')}</div>
                    </div>
                    <div className="result-tooltip__section">
                      <div className="result-tooltip__indicator result-tooltip__indicator--negative">
                        <ArrowDown className="result-tooltip__indicator-icon" />
                        <p className="result-tooltip__indicator-text">{t('performance.results.negativeTip')}</p>
                      </div>
                      <div className="result-tooltip__indicator result-tooltip__indicator--positive">
                        <ArrowUp className="result-tooltip__indicator-icon" />
                        <p className="result-tooltip__indicator-text">{t('performance.results.positiveTip')}</p>
                      </div>
                    </div>
                    <div className="result-tooltip__section result-tooltip__section--badge">
                      <div className="result-tooltip__badge-title">{t('performance.results.badgeTitle')}</div>
                      <div className="result-tooltip__badge-grid">
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--gain-light">
                            <ArrowUp size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelLow')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--gain-medium">
                            <ArrowUp size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelMid')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--gain-strong">
                            <ArrowUp size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelHigh')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--loss-light">
                            <ArrowDown size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelLow')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--loss-medium">
                            <ArrowDown size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelMid')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--loss-strong">
                            <ArrowDown size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelHigh')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                placement="bottom"
                arrow
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'white',
                      color: 'black',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '14px',
                      maxWidth: 500,
                      minWidth: 380,
                      border: 'none'
                    },
                    '& .MuiTooltip-arrow': {
                      color: 'white',
                    }
                  }
                }}
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
                      className={`perf-status${processedResults.temp25.cycleLife.isRestricted ? ' blurred-content' : ''}`}
                      style={{ color: getStatusColor(processedResults.temp25.cycleLife.status) }}
                    >
                      {getStatusText(processedResults.temp25.cycleLife)}
                    </span>
                  </div>
                  <div 
                    className={`perf-value${processedResults.temp25.cycleLife.isRestricted ? ' blurred-content' : ''}`}
                    aria-label={processedResults.temp25.cycleLife.isRestricted ? t('performance.results.status.restricted') : undefined}
                  >
                    {getConfidenceText(processedResults.temp25.cycleLife)}
                  </div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.ce25')}</span>
                    <span 
                      className={`perf-status${processedResults.temp25.ce.isRestricted ? ' blurred-content' : ''}`}
                      style={{ color: getStatusColor(processedResults.temp25.ce.status) }}
                    >
                      {getStatusText(processedResults.temp25.ce)}
                    </span>
                  </div>
                  <div 
                    className={`perf-value${processedResults.temp25.ce.isRestricted ? ' blurred-content' : ''}`}
                    aria-label={processedResults.temp25.ce.isRestricted ? t('performance.results.status.restricted') : undefined}
                  >
                    {getConfidenceText(processedResults.temp25.ce)}
                  </div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.ratePerformance25')}</span>
                    <span 
                      className={`perf-status${processedResults.temp25.ratePerformance.isRestricted ? ' blurred-content' : ''}`}
                      style={{ color: getStatusColor(processedResults.temp25.ratePerformance.status) }}
                    >
                      {getStatusText(processedResults.temp25.ratePerformance)}
                    </span>
                  </div>
                  <div 
                    className={`perf-value${processedResults.temp25.ratePerformance.isRestricted ? ' blurred-content' : ''}`}
                    aria-label={processedResults.temp25.ratePerformance.isRestricted ? t('performance.results.status.restricted') : undefined}
                  >
                    {getConfidenceText(processedResults.temp25.ratePerformance)}
                  </div>
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
                      className={`perf-status${processedResults.temp45.cycleLife.isRestricted ? ' blurred-content' : ''}`}
                      style={{ color: getStatusColor(processedResults.temp45.cycleLife.status) }}
                    >
                      {getStatusText(processedResults.temp45.cycleLife)}
                    </span>
                  </div>
                  <div 
                    className={`perf-value${processedResults.temp45.cycleLife.isRestricted ? ' blurred-content' : ''}`}
                    aria-label={processedResults.temp45.cycleLife.isRestricted ? t('performance.results.status.restricted') : undefined}
                  >
                    {getConfidenceText(processedResults.temp45.cycleLife)}
                  </div>
                </div>

                <div className="performance-item">
                  <div className="perf-header">
                    <span className="perf-label">{t('performance.results.performance.ce45')}</span>
                    <span 
                      className={`perf-status${processedResults.temp45.ce.isRestricted ? ' blurred-content' : ''}`}
                      style={{ color: getStatusColor(processedResults.temp45.ce.status) }}
                    >
                      {getStatusText(processedResults.temp45.ce)}
                    </span>
                  </div>
                  <div 
                    className={`perf-value${processedResults.temp45.ce.isRestricted ? ' blurred-content' : ''}`}
                    aria-label={processedResults.temp45.ce.isRestricted ? t('performance.results.status.restricted') : undefined}
                  >
                    {getConfidenceText(processedResults.temp45.ce)}
                  </div>
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
