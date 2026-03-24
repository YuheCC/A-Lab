import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import type { TFunction } from 'i18next';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Table, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import ParameterInput from '../Predict/components/ParameterInput';
import DesignDetailsModal from '../Optimize/components/DesignDetailsModal';
import RecommendationTrendChart, {
  type RecommendationTrendChartPointClickPayload,
} from '../Optimize/components/RecommendationTrendChart';
import { getBackwardResultKey, mapBackwardResultsToTrendData } from '../Optimize/recommendationData';
import { downloadRecommendationData } from '../Optimize/recommendationExport';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
} from '../constants';
import type {
  OptimizeModelParamsDTO,
  OptimizeModelResultStatsDTO,
  BackwardResultItemDTO,
} from '@/services/electrode/types';
import { getBackwardResultList } from '@/services/electrode/electrodeService';
import type { DeviatedFieldType } from '../Optimize/types';
import { PARAMETER_RANGES } from '../Optimize/types';
import Button from '@/components/Button';
import { useAuthStore } from '@/models/useAuth';
import { PricingContext } from '@/layouts/index';
import './index.less';

const { Option } = Select;

type InvalidBackwardResultItem = BackwardResultItemDTO & { deviatedFields: DeviatedFieldType[] };

// ============================================
// type=2 (Optimize) 详情内容组件
// ============================================

interface OptimizeDetailContentProps {
  t: TFunction;
  historyId: number;
  cellDesign: string;
  npRatio: string;
  cathodeActiveMaterial: string;
  anodeActiveMaterial: string;
  modelParams: OptimizeModelParamsDTO;
  modelResult: OptimizeModelResultStatsDTO;
  onGoBack: () => void;
}

const getCellDesignLabel = (value: string): string => {
  const option = CELL_DESIGN_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

const getCathodeMaterialLabel = (value: string): string => {
  const option = CATHODE_ACTIVE_MATERIAL_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

const formatPercent = (value: number): string => {
  return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(2)));
};

const getAnodeMaterialLabel = (
  result?: BackwardResultItemDTO | null,
  fallback?: string,
): string => {
  // 兼容后端字段命名：si_ratio（标准）与 siratio（历史）
  const rawSiRatio = (result as any)?.siratio ?? result?.si_ratio;
  const siRatio = Number(rawSiRatio);
  if (!Number.isFinite(siRatio)) {
    return fallback || '-';
  }

  const sicPercent = Math.max(0, Math.min(100, siRatio));
  const graphitePercent = Math.max(0, Math.min(100, 100 - sicPercent));
  return `${formatPercent(graphitePercent)}% SiC / ${formatPercent(sicPercent)}% Graphite`;
};

const OptimizeDetailContent: React.FC<OptimizeDetailContentProps> = ({
  t,
  historyId,
  cellDesign,
  npRatio,
  cathodeActiveMaterial,
  anodeActiveMaterial,
  modelParams,
  modelResult,
  onGoBack,
}) => {
  const { userPermissions } = useAuthStore();
  const pricingContext = useContext(PricingContext);

  // 推荐结果状态（通过 getBackwardResultList 加载）
  const [validItems, setValidItems] = useState<BackwardResultItemDTO[]>([]);
  const [invalidItems, setInvalidItems] = useState<InvalidBackwardResultItem[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Modal 状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BackwardResultItemDTO | null>(null);
  const [isAdditionalExpanded, setIsAdditionalExpanded] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const additionalSectionRef = useRef<HTMLDivElement>(null);

  /**
   * 检查单条结果是否有偏差（超出目标范围）
   * 始终检查 jrt 和 ved；根据 model_params 中有无 sed/dc 字段决定检查哪个次要目标
   */
  const checkDeviations = (item: BackwardResultItemDTO): DeviatedFieldType[] => {
    const deviatedFields: DeviatedFieldType[] = [];

    if (
      item.jelly_roll_thickness < modelParams.jrt_min ||
      item.jelly_roll_thickness > modelParams.jrt_max
    ) {
      deviatedFields.push('thickness');
    }

    if (
      item.volumetric_ED < modelParams.ved_min ||
      item.volumetric_ED > modelParams.ved_max
    ) {
      deviatedFields.push('volumetricEnergyDensity');
    }

    if (modelParams.sed_min !== undefined && modelParams.sed_max !== undefined) {
      if (item.specific_ED < modelParams.sed_min || item.specific_ED > modelParams.sed_max) {
        deviatedFields.push('specificEnergy');
      }
    }

    if (modelParams.dc_min !== undefined && modelParams.dc_max !== undefined) {
      if (item.design_capacity < modelParams.dc_min || item.design_capacity > modelParams.dc_max) {
        deviatedFields.push('designCapacity');
      }
    }

    return deviatedFields;
  };

  // 加载推荐结果列表
  useEffect(() => {
    const loadResults = async () => {
      setResultsLoading(true);
      try {
        const flatItems = await getBackwardResultList({ history_id: historyId });

        const valid: BackwardResultItemDTO[] = [];
        const invalid: InvalidBackwardResultItem[] = [];

        flatItems.forEach((item) => {
          const deviations = checkDeviations(item);
          if (deviations.length === 0) {
            valid.push(item);
          } else {
            invalid.push({ ...item, deviatedFields: deviations });
          }
        });

        setValidItems(valid);
        setInvalidItems(invalid);
      } catch (error) {
        console.error('[OptimizeDetail] Failed to load backward results:', error);
      } finally {
        setResultsLoading(false);
      }
    };

    loadResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyId]);

  const handleToggleAdditional = () => {
    if (isAdditionalExpanded) {
      setIsCollapsing(true);
      setTimeout(() => {
        setIsAdditionalExpanded(false);
        setIsCollapsing(false);
      }, 300);
    } else {
      setIsAdditionalExpanded(true);
      setTimeout(() => {
        if (additionalSectionRef.current) {
          additionalSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const handleViewDetails = (record: BackwardResultItemDTO, isInvalid = false) => {
    if (!['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '')) {
      pricingContext?.setShowUpgradeModal?.(true);
      return;
    }
    const sourceData = isInvalid ? invalidItems : validItems;
    const fullData = sourceData.find((item) => getBackwardResultKey(item) === getBackwardResultKey(record));
    if (!fullData) {
      return;
    }
    setSelectedResult(fullData);
    setModalVisible(true);
  };

  const handleTrendPointClick = ({ resultKey }: RecommendationTrendChartPointClickPayload) => {
    if (!['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '')) {
      pricingContext?.setShowUpgradeModal?.(true);
      return;
    }

    const selectedItem = validItems.find((item) => getBackwardResultKey(item) === resultKey);
    if (!selectedItem) {
      return;
    }

    setSelectedResult(selectedItem);
    setModalVisible(true);
  };

  const isFieldDeviated = (field: DeviatedFieldType, deviatedFields?: DeviatedFieldType[]) =>
    deviatedFields?.includes(field);

  // 主表格列配置（valid 数据）
  const columns: ColumnsType<BackwardResultItemDTO> = [
    {
      title: `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`,
      dataIndex: 'design_capacity',
      width: 180,
      sorter: (a, b) => a.design_capacity - b.design_capacity,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: `${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`,
      dataIndex: 'specific_ED',
      width: 200,
      sorter: (a, b) => a.specific_ED - b.specific_ED,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`,
      dataIndex: 'jelly_roll_thickness',
      width: 200,
      sorter: (a, b) => a.jelly_roll_thickness - b.jelly_roll_thickness,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`,
      dataIndex: 'volumetric_ED',
      width: 220,
      sorter: (a, b) => a.volumetric_ED - b.volumetric_ED,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: t('design.electrode.optimize.actions', 'Actions'),
      width: 100,
      render: (_: any, record: BackwardResultItemDTO) => (
        <a className="electrode-optimize-details-link" onClick={() => handleViewDetails(record)}>
          {t('design.electrode.optimize.details', 'Details')}
        </a>
      ),
    },
  ];

  // Invalid 数据列配置（带偏差高亮）
  const invalidColumns: ColumnsType<InvalidBackwardResultItem> = [
    {
      title: `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`,
      dataIndex: 'design_capacity',
      width: 180,
      sorter: (a, b) => a.design_capacity - b.design_capacity,
      render: (value: number, record: InvalidBackwardResultItem) => (
        <span className={isFieldDeviated('designCapacity', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: `${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`,
      dataIndex: 'specific_ED',
      width: 200,
      sorter: (a, b) => a.specific_ED - b.specific_ED,
      render: (value: number, record: InvalidBackwardResultItem) => (
        <span className={isFieldDeviated('specificEnergy', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`,
      dataIndex: 'jelly_roll_thickness',
      width: 200,
      sorter: (a, b) => a.jelly_roll_thickness - b.jelly_roll_thickness,
      render: (value: number, record: InvalidBackwardResultItem) => (
        <span className={isFieldDeviated('thickness', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`,
      dataIndex: 'volumetric_ED',
      width: 220,
      sorter: (a, b) => a.volumetric_ED - b.volumetric_ED,
      render: (value: number, record: InvalidBackwardResultItem) => (
        <span className={isFieldDeviated('volumetricEnergyDensity', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: t('design.electrode.optimize.actions', 'Actions'),
      width: 100,
      render: (_: any, record: InvalidBackwardResultItem) => (
        <a className="electrode-optimize-details-link" onClick={() => handleViewDetails(record, true)}>
          {t('design.electrode.optimize.details', 'Details')}
        </a>
      ),
    },
  ];

  const trendChartData = useMemo(
    () => mapBackwardResultsToTrendData(validItems),
    [validItems],
  );

  // 页面信息区优先展示当前选中结果的 SiC/Graphite 比例，未选中时回退到首条结果
  const anodeMaterialDisplayResult = useMemo<BackwardResultItemDTO | null>(
    () => selectedResult || validItems[0] || invalidItems[0] || null,
    [selectedResult, validItems, invalidItems],
  );

  const handleDownloadRecommendations = () => {
    downloadRecommendationData({
      type: 'csv',
      data: validItems,
      t,
    });
  };

  return (
    <div className="electrode-optimize-container antd-readonly-style">
      {/* 页面标题和返回按钮 */}
      <div className="electrode-optimize-actions">
        <h1 className="electrode-optimize-title">
          {t('design.electrode.optimize.title', 'Inverse Design')}
        </h1>
        <button className="electrode-optimize-back-btn" onClick={onGoBack}>
          <LeftOutlined style={{ marginRight: 8 }} />
          {t('design.electrode.optimize.back', 'Back')}
        </button>
      </div>

      {/* 内容区域 */}
      <div className="electrode-optimize-content">
        {/* Performance Targets 区域 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.performanceTargets', 'Performance Targets')}
          </h2>

          <div className="electrode-optimize-form-container">
            {/* Cell Information */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cellInformation', 'Cell Information')}
              </h3>

              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cellType', 'Cell Type')}
                  </label>
                  <Select value={cellDesign} disabled className="electrode-optimize-select">
                    <Option value={cellDesign}>{getCellDesignLabel(cellDesign)}</Option>
                  </Select>
                </div>
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.npRatio', 'NP Ratio')}
                  </label>
                  <input
                    type="text"
                    value={npRatio}
                    disabled
                    className="electrode-optimize-input electrode-optimize-input--disabled"
                  />
                </div>
              </div>

              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cathodeActiveMaterial', 'Cathode Active Material')}
                  </label>
                  <Select value={cathodeActiveMaterial} disabled className="electrode-optimize-select">
                    <Option value={cathodeActiveMaterial}>{getCathodeMaterialLabel(cathodeActiveMaterial)}</Option>
                  </Select>
                </div>
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.anodeActiveMaterial', 'Anode Active Material')}
                  </label>
                  <Select value={anodeActiveMaterial} disabled className="electrode-optimize-select">
                    <Option value={anodeActiveMaterial}>
                      {getAnodeMaterialLabel(anodeMaterialDisplayResult, anodeActiveMaterial)}
                    </Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cathode Dimension */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cathodeDimension', 'Cathode Dimension')}
              </h3>

              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.width', 'Width (mm)')}
                  </label>
                  <input
                    type="number"
                    value={modelParams.cathode_width}
                    disabled
                    className="electrode-optimize-input electrode-optimize-input--disabled"
                  />
                </div>
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.length', 'Length (mm)')}
                  </label>
                  <input
                    type="number"
                    value={modelParams.cathode_length}
                    disabled
                    className="electrode-optimize-input electrode-optimize-input--disabled"
                  />
                </div>
              </div>

              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-parameter-card">
                  <ParameterInput
                    label={`${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`}
                    mode="range"
                    rangeValue={[modelParams.jrt_min, modelParams.jrt_max]}
                    min={PARAMETER_RANGES.thickness.min}
                    max={PARAMETER_RANGES.thickness.max}
                    step={PARAMETER_RANGES.thickness.step}
                    minDiff={PARAMETER_RANGES.thickness.minDiff}
                    showBounds
                    singleLine
                    readonly
                  />
                </div>
              </div>
            </div>

            {/* Targets */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.targets', 'Targets')}
              </h3>

              <div className="electrode-optimize-parameters">
                <div className="electrode-optimize-parameters__ved-row">
                  <div className="electrode-optimize-parameter-card">
                    <ParameterInput
                      label={`${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`}
                      mode="range"
                      rangeValue={[modelParams.ved_min, modelParams.ved_max]}
                      min={PARAMETER_RANGES.volumetricEnergyDensity.min}
                      max={PARAMETER_RANGES.volumetricEnergyDensity.max}
                      step={PARAMETER_RANGES.volumetricEnergyDensity.step}
                      minDiff={PARAMETER_RANGES.volumetricEnergyDensity.minDiff}
                      showBounds
                      singleLine
                      readonly
                    />
                  </div>
                </div>

                {/* 根据 model_params 中实际存在的字段决定显示 sed 还是 dc */}
                <div className="electrode-optimize-parameters__secondary-row">
                  {modelParams.sed_min !== undefined && modelParams.sed_max !== undefined && (
                    <div className="electrode-optimize-parameter-card">
                      <ParameterInput
                        label={`${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`}
                        mode="range"
                        rangeValue={[modelParams.sed_min, modelParams.sed_max]}
                        min={PARAMETER_RANGES.specificEnergy.min}
                        max={PARAMETER_RANGES.specificEnergy.max}
                        step={PARAMETER_RANGES.specificEnergy.step}
                        minDiff={PARAMETER_RANGES.specificEnergy.minDiff}
                        showBounds
                        singleLine
                        readonly
                      />
                    </div>
                  )}

                  {modelParams.dc_min !== undefined && modelParams.dc_max !== undefined && (
                    <div className="electrode-optimize-parameter-card">
                      <ParameterInput
                        label={`${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`}
                        mode="range"
                        rangeValue={[modelParams.dc_min, modelParams.dc_max]}
                        min={PARAMETER_RANGES.designCapacity.min}
                        max={PARAMETER_RANGES.designCapacity.max}
                        step={PARAMETER_RANGES.designCapacity.step}
                        minDiff={PARAMETER_RANGES.designCapacity.minDiff}
                        showBounds
                        singleLine
                        readonly
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Design Recommendations 表格 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.designRecommendations', 'Design Recommendations')}
          </h2>

          {!resultsLoading && validItems.length > 0 && (
            <div className="electrode-optimize-table-toolbar">
              <Button variant="secondary" size="small" onClick={handleDownloadRecommendations}>
                {t('design.actions.download', 'Download')}
              </Button>
            </div>
          )}

          {resultsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : validItems.length === 0 ? (
            <div className="electrode-optimize-empty-state">
              <div className="electrode-optimize-empty-icon">
                <div className="electrode-optimize-empty-icon-circle">
                  <svg width="75" height="75" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="12" stroke="#5fd98f" strokeWidth="3" fill="none" />
                    <line x1="33" y1="33" x2="38" y2="38" stroke="#5fd98f" strokeWidth="3" strokeLinecap="round" />
                    <line x1="19" y1="19" x2="29" y2="29" stroke="#5fd98f" strokeWidth="3" strokeLinecap="round" />
                    <line x1="29" y1="19" x2="19" y2="29" stroke="#5fd98f" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="electrode-optimize-empty-dot electrode-optimize-empty-dot--top" />
                <div className="electrode-optimize-empty-dot electrode-optimize-empty-dot--bottom" />
              </div>
              <h3 className="electrode-optimize-empty-title">
                {t('design.electrode.optimize.emptyState.title', 'No Matching Designs Found')}
              </h3>
              <p className="electrode-optimize-empty-description">
                {invalidItems.length > 0
                  ? t('design.electrode.optimize.emptyState.descriptionWithRecommendation')
                  : t('design.electrode.optimize.emptyState.description')}
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={validItems}
              rowKey={(record) => `valid-${record.id}-${record.item_id}`}
              pagination={false}
              className="electrode-optimize-table"
            />
          )}

          {!resultsLoading && validItems.length > 0 && (
            <RecommendationTrendChart
              data={trendChartData}
              onPointClick={handleTrendPointClick}
            />
          )}

          {/* Additional Recommendations 折叠提示 */}
          {!resultsLoading && invalidItems.length > 0 && (
            <div className="electrode-optimize-additional-banner">
              <span className="electrode-optimize-additional-banner-text">
                {t('design.electrode.optimize.additionalPrompt', 'Additional recommendations with slight deviations from target values are available.')}
              </span>
              <Button variant="primary" size="small" onClick={handleToggleAdditional}>
                {isAdditionalExpanded
                  ? t('design.electrode.optimize.collapse', 'Collapse')
                  : t('design.electrode.optimize.expand', 'Expand')}
              </Button>
            </div>
          )}

          {(isAdditionalExpanded || isCollapsing) && invalidItems.length > 0 && (
            <div
              ref={additionalSectionRef}
              className={`electrode-optimize-additional-section ${isCollapsing ? 'collapsing' : ''}`}
            >
              <h3 className="electrode-optimize-section-title">
                {t('design.electrode.optimize.additionalRecommendations', 'Additional Recommendations')}
              </h3>
              <Table
                columns={invalidColumns}
                dataSource={invalidItems}
                rowKey={(record) => `invalid-${record.id}-${record.item_id}`}
                pagination={false}
                className="electrode-optimize-table electrode-optimize-table-additional"
              />
            </div>
          )}
        </div>
      </div>

      {/* 详情 Modal */}
      <DesignDetailsModal
        visible={modalVisible}
        data={selectedResult}
        cellDesign={cellDesign}
        npRatio={npRatio}
        cathodeActiveMaterial={cathodeActiveMaterial}
        anodeMaterialLabel={getAnodeMaterialLabel(selectedResult, anodeActiveMaterial)}
        width={modelParams.cathode_width}
        length={modelParams.cathode_length}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default OptimizeDetailContent;
