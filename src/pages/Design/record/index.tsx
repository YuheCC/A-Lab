import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { getHistoryDetail, getModelList } from '../model';
import { useAuthStore } from '@/models/useAuth';
import PerformanceBadge from '@/components/PerformanceBadge';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import type { ModelListItem } from '@/services/model/training';
import { parseModelResult } from '@/utils/modelResultParser';
import { formatWeightPercentage } from '../utils/weightPercentage';
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

  // 模型相关状态
  const [modelOptions, setModelOptions] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [modelType, setModelType] = useState<number | undefined>();
  const [baseModelId, setBaseModelId] = useState<number | undefined>();
  const [isModelLoading, setIsModelLoading] = useState(false);

  const userPermissions = useAuthStore((state: any) => state.userPermissions);
  const id = searchParams.get('id');

  const isHighTier = useMemo(() => {
    return ['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '');
  }, [userPermissions]);

  // 获取模型列表
  const fetchModelList = async () => {
    setIsModelLoading(true);
    try {
      const response = await getModelList({ page_size: 100 });
      if (response?.data) {
        // 转换为 ModelSelect 期望的格式
        const options = response.data.map((item: ModelListItem) => ({
          id: item.id.toString(),
          name: item.model_name,
          baseModel: item.base_model_id === -1 ? '-' : item.base_model_name || '-',
          category: item.base_model_id === -1 ? 'base' : 'finetuned',
          model_type: item.model_type,
          base_model_id: item.base_model_id,
        }));
        setModelOptions(options);
      }
    } catch (error) {
      console.error('获取模型列表失败:', error);
    } finally {
      setIsModelLoading(false);
    }
  };

  // 获取历史详情
  const fetchDetailData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryDetail(parseInt(id));
      const data = response.data;
      setDetailData(data);

      // 如果返回了 model_id，设置选中状态
      if (data.model_id) {
        setSelectedModelId(data.model_id.toString());
      }
    } catch (err: any) {
      console.error('Failed to fetch detail data:', err);
      setError(err.message || t('design.record.fetchError', 'Failed to fetch record details'));
    } finally {
      setLoading(false);
    }
  };

  // 监听 modelOptions 和 selectedModelId 变化，匹配 model_type 和 base_model_id
  useEffect(() => {
    if (selectedModelId && modelOptions.length > 0) {
      const model = modelOptions.find(m => m.id === selectedModelId);
      if (model) {
        setModelType(model.model_type);
        setBaseModelId(model.base_model_id);
      }
    }
  }, [selectedModelId, modelOptions]);

  // 初始化数据获取
  useEffect(() => {
    if (id) {
      Promise.all([
        fetchDetailData(),
        fetchModelList(),
      ]);
    } else {
      setError(t('design.record.missingId', 'Missing record ID parameter'));
      setLoading(false);
    }
  }, [id]);

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

  // 根据 model_type 获取支持的指标类型
  const getSupportedMetrics = (): ('cl' | 'ce' | 'rate')[] => {
    // 未定义时，默认显示所有指标
    if (modelType === undefined) {
      return ['cl', 'ce', 'rate'];
    }

    // 根据 model_type 映射
    switch (modelType) {
      case 1:
        return ['rate'];  // 仅倍率性能
      case 2:
        return ['ce'];    // 仅库伦效率
      case 3:
        return ['cl'];    // 仅循环寿命
      default:
        return ['cl', 'ce', 'rate'];
    }
  };

  // 判断指定指标是否应该显示
  const shouldShowMetric = (metric: 'cl' | 'ce' | 'rate', temperature: '25' | '45'): boolean => {
    const supportedMetrics = getSupportedMetrics();

    // 检查指标是否在支持列表中
    if (!supportedMetrics.includes(metric)) {
      return false;
    }

    // 45°C 时过滤掉 rate（与 PredictionModule 保持一致）
    if (temperature === '45' && metric === 'rate') {
      return false;
    }

    return true;
  };

  // 判断是否显示 45°C 区域
  const shouldShow45CSection = (): boolean => {
    const supportedMetrics = getSupportedMetrics();
    // 45°C 只显示 cl 和 ce，所以检查是否有这两个指标
    return supportedMetrics.includes('cl') || supportedMetrics.includes('ce');
  };

  const getProcessedResults = () => {
    if (!detailData) return null;

    // 使用统一的 model_result 解析函数
    const parsed = parseModelResult(detailData);
    const apiData = {
      ...detailData,
      ...parsed,
    };
    const quantification_result = parsed.quantification_result ?? {};

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

        <div className="design-detail-section">
          {/* Cell Chemistry Selection Section */}
          <div className="design-cell-chemistry-section">
            <h4 className="design-section-title">{t('design.record.cellChemistry', 'Cell Chemistry Selection')}</h4>
            <div className="design-chemistry-card">
              <div className="chemistry-info-grid">
                <div className="info-item">
                  <span className="label">{t('design.record.modelSelect', 'Model Select')}:</span>
                  <span className="value model-name">
                    {isModelLoading ? (
                      t('design.record.loading', 'Loading...')
                    ) : selectedModelId && modelOptions.length > 0 ? (
                      modelOptions.find(m => m.id === selectedModelId)?.name || t('design.record.noModel', 'No model information')
                    ) : (
                      t('design.record.noModel', 'No model information')
                    )}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">{t('performance.additive.label', 'SMILES of Additive')}:</span>
                  <span className="value">{detailData?.smiles}</span>
                </div>
                <div className="info-item">
                  <span className="label">{t('design.record.weightPercentage', 'Weight Percentage')}:</span>
                  <span className="value">{formatWeightPercentage(baseModelId)}</span>
                </div>
              </div>
            </div>
          </div>

          {processedResults && (
            <div className="design-results-section">
              <h4 className="design-section-title">{t('performance.results.title')}</h4>

              {(isHighTier || isMock) ? (
                <div className="design-results-card">
                  {/* 25°C Section - 根据 supportedMetrics 条件渲染 */}
                  <div className="temperature-section">
                    <h5>{t('performance.results.temperatureTabs.temp25')}</h5>
                    <div className="performance-results">
                      {shouldShowMetric('cl', '25') && (
                        <div className="result-item">
                          <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                          <PerformanceBadge metric={processedResults.temp25.cycleLife} metricType="cycleLife" />
                        </div>
                      )}
                      {shouldShowMetric('ce', '25') && (
                        <div className="result-item">
                          <div className="result-label">{t('performance.results.performance.ce25')}</div>
                          <PerformanceBadge metric={processedResults.temp25.ce} metricType="ce" />
                        </div>
                      )}
                      {shouldShowMetric('rate', '25') && (
                        <div className="result-item">
                          <div className="result-label">{t('performance.results.performance.ratePerformance25')}</div>
                          <PerformanceBadge metric={processedResults.temp25.ratePerformance} metricType="ratePerformance" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 45°C Section - 仅在有支持的指标时显示 */}
                  {shouldShow45CSection() && (
                    <div className="temperature-section">
                      <h5>{t('performance.results.temperatureTabs.temp45')}</h5>
                      <div className="performance-results">
                        {shouldShowMetric('cl', '45') && (
                          <div className="result-item">
                            <div className="result-label">{t('performance.results.performance.cycleLife45')}</div>
                            <PerformanceBadge metric={processedResults.temp45.cycleLife} metricType="cycleLife" />
                          </div>
                        )}
                        {shouldShowMetric('ce', '45') && (
                          <div className="result-item">
                            <div className="result-label">{t('performance.results.performance.ce45')}</div>
                            <PerformanceBadge metric={processedResults.temp45.ce} metricType="ce" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="design-results-card">
                  <div className="temperature-section">
                    <h5>{t('performance.results.temperatureTabs.temp25')}</h5>
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
                </div>
              )}
            </div>
          )}

          {detailData?.llm_analysis_result && (
            <div className="design-analysis-section">
              <h4 className="design-section-title">{t('performance.llmAnalysis.title')}</h4>
              <div className="design-analysis-card">
                <div className="analysis-content">
                  <InlineMoleculeRenderer content={detailData.llm_analysis_result} onMoleculeClick={() => {}} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordPage;
