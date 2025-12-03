import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { getHistoryDetail } from '../model';
import { normalizeServerDate } from '@/utils/messageUtils';
import { useAuthStore } from '@/models/useAuth';
import PerformanceBadge, { PerformanceMetric } from '@/components/PerformanceBadge';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import './index.less';

interface ProcessedMetric {
  status: 'Positive' | 'Negative' | 'Neutral' | 'Restricted';
  confidence: number | null;
  rawProb: number | null;
  rawLabel: number | null;
  isRestricted: boolean;
}

const RecordPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  const userPermissions = useAuthStore((state: any) => state.userPermissions);
  const id = searchParams.get('id');

  const isHighTier = useMemo(() => {
    return ['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '');
  }, [userPermissions]);

  useEffect(() => {
    if (id) {
      fetchDetailData();
    } else {
      setError(t('design.record.missingId', 'Missing record ID parameter'));
      setLoading(false);
    }
  }, [id]);

  const fetchDetailData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryDetail(parseInt(id));
      setDetailData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch detail data:', err);
      setError(err.message || t('design.record.fetchError', 'Failed to fetch record details'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/design?tab=records');
  };

  const isMissingMetricValue = (value?: string | number | null) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'number') return Number.isNaN(value);
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

  const processPerformanceMetric = (
    probValue?: string | null,
    labelValue?: string | null
  ): ProcessedMetric => {
    if (isMissingMetricValue(probValue) || isMissingMetricValue(labelValue)) {
      return restrictedMetric();
    }

    const parsedProb = typeof probValue === 'number' ? probValue : parseFloat(probValue as string);
    const parsedLabel = typeof labelValue === 'number' ? labelValue : parseInt(labelValue as string, 10);

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

    const adjustedConfidence = parseFloat(parsedProb.toFixed(2));

    return {
      status,
      confidence: adjustedConfidence,
      rawProb: parsedProb,
      rawLabel: parsedLabel,
      isRestricted: false,
    };
  };

  const getProcessedResults = () => {
    if (!detailData) return null;

    let apiData = detailData;
    let quantification_result: any = {};

    try {
      if (apiData?.model_result) {
        const model_result = JSON.parse(apiData.model_result);
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
      }
    } catch (error) {
      console.error('Error parsing API data:', error);
    }

    return {
      temp25: {
        cycleLife: processPerformanceMetric(
          quantification_result?.pred_cl_25 ?? apiData.temperature_25_CL_prob,
          apiData.temperature_25_CL_label
        ),
        ce: processPerformanceMetric(
          apiData.temperature_25_CE_prob,
          apiData.temperature_25_CE_label
        ),
        ratePerformance: processPerformanceMetric(
          quantification_result?.cr ?? apiData.temperature_25_CR_prob,
          apiData.temperature_25_CR_label
        )
      },
      temp45: {
        cycleLife: processPerformanceMetric(
          quantification_result?.pred_cl_45 ?? apiData.temperature_45_CL_prob,
          apiData.temperature_45_CL_label
        ),
        ce: processPerformanceMetric(
          apiData.temperature_45_CE_prob,
          apiData.temperature_45_CE_label
        )
      }
    };
  };

  const processedResults = getProcessedResults();
  const isMock = detailData?.isMock;

  if (loading) {
    return (
      <div className="design-record-container">
        <div className="design-record-content">
          <div className="design-record-actions">
            <span className="design-action-title">{t('design.record.title', 'Record Details')}</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              {t('design.actions.backToList', 'Back to List')}
            </button>
          </div>
          <div className="loading-state">
            <p>{t('design.record.loading', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="design-record-container">
        <div className="design-record-content">
          <div className="design-record-actions">
            <span className="design-action-title">{t('design.record.title', 'Record Details')}</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              {t('design.actions.backToList', 'Back to List')}
            </button>
          </div>
          <div className="error-state">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="design-record-container">
      <div className="design-record-content">
        <div className="design-record-actions">
          <span className="design-action-title">{t('design.record.title', 'Record Details')}</span>
          <button className="back-to-list-button" onClick={handleBackToList}>
            {t('design.actions.backToList', 'Back to List')}
          </button>
        </div>

        <div className="record-detail-card">
          <div className="result-section">
            <h3>{t('performance.batterySystemSelection.title')}</h3>
            <div className="system-info">
              <div className="info-row">
                <span className="label">{t('performance.additive.label')}:</span>
                <span className="value additive-value">{detailData?.smiles}</span>
              </div>
              <div className="info-row">
                <span className="label">{t('design.record.createdAt', 'Created')}:</span>
                <span className="value">
                  {detailData?.created_at ? new Date(normalizeServerDate(detailData.created_at)).toLocaleString('zh-CN') : '-'}
                </span>
              </div>
            </div>
          </div>

          {processedResults && (
            <div className="result-section">
              <h3>{t('performance.results.title')}</h3>

              {(isHighTier || isMock) ? (
                <>
                  <div className="temperature-section">
                    <h4>{t('performance.results.temperatureTabs.temp25')}</h4>
                    <div className="performance-results">
                      <div className="result-item">
                        <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                        <PerformanceBadge metric={processedResults.temp25.cycleLife} metricType="cycleLife" />
                      </div>
                      <div className="result-item">
                        <div className="result-label">{t('performance.results.performance.ce25')}</div>
                        <PerformanceBadge metric={processedResults.temp25.ce} metricType="ce" />
                      </div>
                      <div className="result-item">
                        <div className="result-label">{t('performance.results.performance.ratePerformance25')}</div>
                        <PerformanceBadge metric={processedResults.temp25.ratePerformance} metricType="ratePerformance" />
                      </div>
                    </div>
                  </div>

                  <div className="temperature-section">
                    <h4>{t('performance.results.temperatureTabs.temp45')}</h4>
                    <div className="performance-results">
                      <div className="result-item">
                        <div className="result-label">{t('performance.results.performance.cycleLife45')}</div>
                        <PerformanceBadge metric={processedResults.temp45.cycleLife} metricType="cycleLife" />
                      </div>
                      <div className="result-item">
                        <div className="result-label">{t('performance.results.performance.ce45')}</div>
                        <PerformanceBadge metric={processedResults.temp45.ce} metricType="ce" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="temperature-section">
                  <h4>{t('performance.results.temperatureTabs.temp25')}</h4>
                  <div className="limited-preview">
                    <div className="result-item">
                      <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                      <PerformanceBadge metric={processedResults.temp25.cycleLife} metricType="cycleLife" />
                    </div>
                    <div className="upgrade-prompt">
                      {t('performance.results.upgradeToViewMetrics')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {detailData?.llm_analysis_result && (
            <div className="result-section">
              <h3>{t('performance.llmAnalysis.title')}</h3>
              <div className="analysis-content">
                <InlineMoleculeRenderer content={detailData.llm_analysis_result} onMoleculeClick={() => {}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordPage;
