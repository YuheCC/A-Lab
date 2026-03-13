import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { getHistoryDetail, getModelList } from '../model';
import { useAuthStore } from '@/models/useAuth';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import type { ModelListItem } from '@/services/model/training';
import { parseModelResult } from '@/utils/modelResultParser';
import { formatWeightPercentage } from '../utils/weightPercentage';
import CellPerformanceResults, { type ProcessedMetric, type CellPerformanceData } from '../components/CellPerformanceResults';
import './index.less';

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
          apiData.temperature_25_CE_prob ?? '0',
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
          apiData.temperature_45_CE_prob ?? '0',
          apiData.temperature_45_CE_label
        )
      }
    };
  };

  const processedResults = getProcessedResults();
  const isMock = detailData?.isMock;

  const modelParams = useMemo(() => {
    try {
      return detailData?.model_params ? JSON.parse(detailData.model_params) : null;
    } catch {
      return null;
    }
  }, [detailData]);

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
                  <span className="value">{formatWeightPercentage(baseModelId, modelType)}</span>
                </div>
              </div>

              {modelParams && (
                <div className="chemistry-formulas-grid">
                  {([
                    {
                      titleKey: 'performance.formulas.formulaA',
                      titleFallback: 'Formula A',
                      formulation: modelParams.formulation_a,
                      variant: 'a' as const,
                    },
                    {
                      titleKey: 'performance.formulas.formulaB',
                      titleFallback: 'Formula B',
                      formulation: modelParams.formulation_b,
                      variant: 'b' as const,
                    },
                  ]).map(({ titleKey, titleFallback, formulation, variant }) => (
                    <div className={`chemistry-formula-block chemistry-formula-block--${variant}`} key={titleKey}>
                      <div className="chemistry-formula-header">
                        <span className="chemistry-formula-bar" />
                        <span className="chemistry-formula-title">{t(titleKey, titleFallback)}</span>
                      </div>
                      <div className="chemistry-formula-items">
                        {[
                          { label: t('performance.formulas.additive1Label', 'Additive 1'), name: formulation?.additive_3_name, wt: formulation?.additive_3_wt },
                          { label: t('performance.formulas.additive2Label', 'Additive 2'), name: formulation?.additive_4_name, wt: formulation?.additive_4_wt },
                          { label: t('performance.formulas.additive3Label', 'Additive 3'), name: formulation?.additive_5_name, wt: formulation?.additive_5_wt },
                          { label: t('performance.formulas.newAdditiveSmiles', 'New Additive SMILES'), name: formulation?.additive_6_smiles, wt: formulation?.additive_6_wt },
                        ].map((item, idx) => (
                          <div className="chemistry-formula-item" key={idx}>
                            <span className="cfi-label">{item.label}</span>
                            <span className="cfi-name">{item.name || '-'}</span>
                            <span className={`cfi-wt${item.wt == null ? ' cfi-wt--empty' : ''}`}>
                              {item.wt != null ? `${item.wt} wt%` : '- wt%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {processedResults && (
            <div className="design-results-section">
              <h4 className="design-section-title">{t('performance.results.title')}</h4>
              <CellPerformanceResults
                data={processedResults as CellPerformanceData}
                modelType={modelType}
                isHighTier={isHighTier}
                isMock={isMock}
              />
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
