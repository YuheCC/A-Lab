import React from 'react';
import { useTranslation } from 'react-i18next';
import ElectrolytePerformanceBadge from '../ElectrolytePerformanceBadge';
import './index.less';

export interface ProcessedMetric {
  status: string;
  confidence: number | null;
  rawProb?: number | null;
  rawLabel?: number | null;
  isRestricted?: boolean;
}

export interface CellPerformanceData {
  temp25: {
    cycleLife: ProcessedMetric;
    ce: ProcessedMetric;
    ratePerformance: ProcessedMetric;
  };
  temp45: {
    cycleLife: ProcessedMetric;
    ce: ProcessedMetric;
  };
}

export type SupportedMetric = 'cl' | 'ce' | 'rate';

export const getSupportedMetrics = (modelType?: number): SupportedMetric[] => {
  if (modelType === undefined) return ['cl', 'ce', 'rate'];
  switch (modelType) {
    case 1: return ['rate'];
    case 2: return ['ce'];
    case 3: return ['cl'];
    default: return ['cl', 'ce', 'rate'];
  }
};

interface CellPerformanceResultsProps {
  data: CellPerformanceData;
  modelType?: number;
  isHighTier: boolean;
  isMock?: boolean;
  upgradeText?: string;
  className?: string;
  /** 传 true 时不渲染外层卡片边框/padding，适合嵌入已有卡片容器内 */
  noCard?: boolean;
}

const CellPerformanceResults: React.FC<CellPerformanceResultsProps> = ({
  data,
  modelType,
  isHighTier,
  isMock = false,
  upgradeText,
  className,
  noCard = false,
}) => {
  const { t } = useTranslation();

  const supportedMetrics = getSupportedMetrics(modelType);

  const shouldShowMetric = (metric: SupportedMetric, temperature: '25' | '45'): boolean => {
    if (!supportedMetrics.includes(metric)) return false;
    if (temperature === '45' && metric === 'rate') return false;
    return true;
  };

  const shouldShow45CSection = (): boolean =>
    supportedMetrics.includes('cl') || supportedMetrics.includes('ce');

  const canViewFull = isHighTier || isMock;

  const wrapperClass = noCard
    ? `cpr-inner ${className ?? ''}`
    : `cpr-results-card ${className ?? ''}`;

  if (!canViewFull) {
    return (
      <div className={wrapperClass}>
        <div className="cpr-temperature-section">
          <h5>{t('performance.results.temperatureTabs.temp25')}</h5>
          <div className="cpr-performance-results">
            <div className="cpr-result-item">
              <div className="cpr-result-label">
                {t('performance.results.performance.cycleLife25')}
              </div>
              <ElectrolytePerformanceBadge
                metric={data.temp25.cycleLife}
                metricType="cycleLife"
              />
            </div>
          </div>
          <div className="cpr-upgrade-prompt">
            {upgradeText || t('performance.results.upgradeToViewMetrics')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <div className="cpr-temperature-section">
        <h5>{t('performance.results.temperatureTabs.temp25')}</h5>
        <div className="cpr-performance-results">
          {shouldShowMetric('cl', '25') && (
            <div className="cpr-result-item">
              <div className="cpr-result-label">
                {t('performance.results.performance.cycleLife25')}
              </div>
              <ElectrolytePerformanceBadge
                metric={data.temp25.cycleLife}
                metricType="cycleLife"
              />
            </div>
          )}
          {shouldShowMetric('ce', '25') && (
            <div className="cpr-result-item">
              <div className="cpr-result-label">
                {t('performance.results.performance.ce25')}
              </div>
              <ElectrolytePerformanceBadge metric={data.temp25.ce} metricType="ce" />
            </div>
          )}
          {shouldShowMetric('rate', '25') && (
            <div className="cpr-result-item">
              <div className="cpr-result-label">
                {t('performance.results.performance.ratePerformance25')}
              </div>
              <ElectrolytePerformanceBadge
                metric={data.temp25.ratePerformance}
                metricType="ratePerformance"
              />
            </div>
          )}
        </div>
      </div>

      {shouldShow45CSection() && (
        <div className="cpr-temperature-section">
          <h5>{t('performance.results.temperatureTabs.temp45')}</h5>
          <div className="cpr-performance-results">
            {shouldShowMetric('cl', '45') && (
              <div className="cpr-result-item">
                <div className="cpr-result-label">
                  {t('performance.results.performance.cycleLife45')}
                </div>
                <ElectrolytePerformanceBadge
                  metric={data.temp45.cycleLife}
                  metricType="cycleLife"
                />
              </div>
            )}
            {shouldShowMetric('ce', '45') && (
              <div className="cpr-result-item">
                <div className="cpr-result-label">
                  {t('performance.results.performance.ce45')}
                </div>
                <ElectrolytePerformanceBadge
                  metric={data.temp45.ce}
                  metricType="ce"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CellPerformanceResults;
