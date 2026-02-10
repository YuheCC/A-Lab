import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import './ResultModal.less';
import './PerformanceTooltip.less';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { ArrowUpIcon, ArrowDownIcon } from './ArrowIcons';
import { useAuthStore } from '@/models/useAuth';

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
  const userPermissions = useAuthStore((state: any) => state.userPermissions);
  const isMock = (result as any)?.rawApiData?.isMock;
  // 权限判断
  const isHighTier = useMemo(() => {
    return ['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '');
  }, [userPermissions]);

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
    // 只检查 labelValue，不检查 probValue
    if (isMissingMetricValue(labelValue)) {
      return restrictedMetric();
    }

    const parsedLabel = typeof labelValue === 'number'
      ? labelValue
      : parseInt(labelValue as string, 10);

    // 只验证 label 是否有效
    if (!Number.isFinite(parsedLabel)) {
      return restrictedMetric();
    }

    // 根据 label 确定 status
    let status: ProcessedMetric['status'];
    if (parsedLabel === 0) {
      status = 'Positive';
    } else if (parsedLabel === 1) {
      status = 'Negative';
    } else {
      status = 'Neutral';
    }

    // 尝试解析 probValue 来获取 confidence，如果不存在或无效则为 null
    let confidence: number | null = null;
    let parsedProb: number | null = null;

    if (!isMissingMetricValue(probValue)) {
      parsedProb = typeof probValue === 'number'
        ? probValue
        : parseFloat(probValue as string);

      if (Number.isFinite(parsedProb)) {
        const adjustedConfidence = parseFloat(parsedProb.toFixed(2));
        if (Number.isFinite(adjustedConfidence)) {
          confidence = adjustedConfidence;
        }
      }
    }

    return {
      status,
      confidence,
      rawProb: parsedProb,
      rawLabel: parsedLabel,
      isRestricted: false,
    };
  };

  // Try to extract raw API data if available, otherwise use transformed data
  const getProcessedResults = () => {
    // If the result object has raw API data, use it for processing
    if ((result as any).rawApiData) {
      let apiData = (result as any).rawApiData;
      let quantification_result: any = {};
      try{
        const model_result = JSON.parse(apiData?.model_result);
        apiData = {
          ...apiData,
          temperature_25_CE_label: model_result?.ce_cl_result?.temperature_25_CE_label?.toString(),
          temperature_25_CE_prob: model_result?.ce_cl_result?.temperature_25_CE_prob?.toString(),
          temperature_25_CL_label: model_result?.ce_cl_result?.temperature_25_CL_label?.toString(),
          temperature_25_CL_prob: model_result?.ce_cl_result?.temperature_25_CL_prob?.toString(),
          temperature_25_CR_label: model_result?.cr_result?.temperature_25_CR_label?.toString(),
          temperature_25_CR_prob: model_result?.cr_result?.temperature_25_CR_prob?.toString(),
          temperature_45_CE_label: model_result?.ce_cl_result?.temperature_45_CE_label?.toString(),
          temperature_45_CE_prob: model_result?.ce_cl_result?.temperature_45_CE_prob?.toString(),
          temperature_45_CL_label: model_result?.ce_cl_result?.temperature_45_CL_label?.toString(),
          temperature_45_CL_prob: model_result?.ce_cl_result?.temperature_45_CL_prob?.toString()
        };
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

  // Helper function to render result badge (same as PredictionModule)
  const renderResultBadge = (metric: ProcessedMetric, metricType: 'cycleLife' | 'ce' | 'ratePerformance') => {
    const isPositive = metric.status === 'Positive';
    const isNegative = metric.status === 'Negative';
    
    // 获取百分比数值
    let percentValue = 0;
    if (metric.confidence !== null) {
      percentValue = Math.abs(metric.confidence);
    }
    
    // 根据百分比值判断严重程度级别
    let level = '';
    if (percentValue < 5) {
      level = 'light';
    } else if (percentValue >= 5 && percentValue <= 25) {
      level = 'medium';
    } else if (percentValue > 25) {
      level = 'dark';
    }
    
    const badgeClass = `${isPositive ? 'positive' : isNegative ? 'negative' : 'unknown'}-${level}`;
    
    // 选择箭头图标 - 使用自定义箭头
    const ArrowIcon = isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : null;
    
    // CE 只显示箭头
    if (metricType === 'ce') {
      return (
        <div className={`performance-result-badge performance-result-badge--${badgeClass} performance-result-badge--ce-only`}>
          <span className="performance-result-badge__arrow">
            {ArrowIcon && <ArrowIcon size={16} />}
          </span>
        </div>
      );
    }
    
    // 其他指标显示箭头 + 百分比
    const value = percentValue > 0 ? `${percentValue}%` : '';
    
    return (
      <div className={`performance-result-badge performance-result-badge--${badgeClass}`}>
        <span className="performance-result-badge__text">
          {ArrowIcon && <ArrowIcon size={15} />}
          {value && <span>{value}</span>}
        </span>
      </div>
    );
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
                      <div className="result-tooltip__indicator result-tooltip__indicator--positive">
                        <ArrowUp className="result-tooltip__indicator-icon" />
                        <p className="result-tooltip__indicator-text">{t('performance.results.positiveTip')}</p>
                      </div>
                      <div className="result-tooltip__indicator result-tooltip__indicator--negative">
                        <ArrowDown className="result-tooltip__indicator-icon" />
                        <p className="result-tooltip__indicator-text">{t('performance.results.negativeTip')}</p>
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
            
            {isHighTier || isMock ? (
              <>
                <div className="temperature-section">
                  <h4>{t('performance.results.temperatureTabs.temp25')}</h4>
                  <div className="performance-results">
                    <div className="result-item">
                      <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                      {renderResultBadge(processedResults.temp25.cycleLife, 'cycleLife')}
                    </div>

                    <div className="result-item">
                      <div className="result-label">{t('performance.results.performance.ce25')}</div>
                      {renderResultBadge(processedResults.temp25.ce, 'ce')}
                    </div>

                    <div className="result-item">
                      <div className="result-label">{t('performance.results.performance.ratePerformance25')}</div>
                      {renderResultBadge(processedResults.temp25.ratePerformance, 'ratePerformance')}
                    </div>
                  </div>
                </div>

                <div className="temperature-section">
                  <h4>{t('performance.results.temperatureTabs.temp45')}</h4>
                  <div className="performance-results">
                    <div className="result-item">
                      <div className="result-label">{t('performance.results.performance.cycleLife45')}</div>
                      {renderResultBadge(processedResults.temp45.cycleLife, 'cycleLife')}
                    </div>

                    <div className="result-item">
                      <div className="result-label">{t('performance.results.performance.ce45')}</div>
                      {renderResultBadge(processedResults.temp45.ce, 'ce')}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="temperature-section">
                <h4>{t('performance.results.temperatureTabs.temp25')}</h4>
                <div className="limited-preview">
                  <div className="limited-preview-content">
                    <div className="result-item-centered">
                      <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                      {renderResultBadge(processedResults.temp25.cycleLife, 'cycleLife')}
                    </div>
                    <div className="upgrade-prompt">
                      {t('performance.results.upgradeToViewMetrics')}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
