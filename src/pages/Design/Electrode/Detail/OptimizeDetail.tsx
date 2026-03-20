import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import type { TFunction } from 'i18next';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Table, Modal, Spin } from 'antd';
import ParameterInput from '../Predict/components/ParameterInput';
import RecommendationTrendChart from '../Optimize/components/RecommendationTrendChart';
import { mapBackwardResultsToTrendData } from '../Optimize/recommendationData';
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

// Modal 内部组件
interface ParameterItemProps {
  label: string;
  value?: string | number;
}

const ParameterItem: React.FC<ParameterItemProps> = ({ label, value }) => (
  <div className="designdetail-parameter-item">
    <span className="designdetail-parameter-label">{label}</span>
    <span className="designdetail-parameter-value">
      {value !== undefined ? (typeof value === 'number' ? value.toFixed(2) : value) : '-'}
    </span>
  </div>
);

interface PerformanceCardProps {
  label: string;
  value: number | string;
  unit: string;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({ label, value, unit }) => (
  <div className="designdetail-performance-card">
    <div className="designdetail-performance-label">{label}</div>
    <div className="designdetail-performance-value">
      {typeof value === 'number' ? value.toFixed(2) : value}{' '}
      <span className="designdetail-performance-unit">{unit}</span>
    </div>
  </div>
);

interface DesignInfoItemProps {
  label: string;
  value: string | number;
}

const DesignInfoItem: React.FC<DesignInfoItemProps> = ({ label, value }) => (
  <div className="designdetail-design-info-item">
    <div className="designdetail-design-info-label">{label}</div>
    <div className="designdetail-design-info-value">{value}</div>
  </div>
);

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
  const [invalidItems, setInvalidItems] = useState<(BackwardResultItemDTO & { deviatedFields: DeviatedFieldType[] })[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);

  // Modal 状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BackwardResultItemDTO | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
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
        const invalid: (BackwardResultItemDTO & { deviatedFields: DeviatedFieldType[] })[] = [];

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

  const handleViewDetails = (record: BackwardResultItemDTO, index: number, isInvalid = false) => {
    if (!['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '')) {
      pricingContext?.setShowUpgradeModal?.(true);
      return;
    }
    setSelectedResult(record);
    const actualIndex = isInvalid ? validItems.length + index : index;
    setSelectedIndex(actualIndex);
    setModalVisible(true);
  };

  const isFieldDeviated = (field: DeviatedFieldType, deviatedFields?: DeviatedFieldType[]) =>
    deviatedFields?.includes(field);

  // 主表格列配置（valid 数据）
  const columns = [
    {
      title: t('design.electrode.optimize.no', 'No.'),
      width: 80,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`,
      dataIndex: 'design_capacity',
      width: 180,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: `${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`,
      dataIndex: 'specific_ED',
      width: 200,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`,
      dataIndex: 'jelly_roll_thickness',
      width: 200,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`,
      dataIndex: 'volumetric_ED',
      width: 220,
      render: (value: number) => value?.toFixed(2),
    },
    {
      title: t('design.electrode.optimize.actions', 'Actions'),
      width: 100,
      render: (_: any, record: BackwardResultItemDTO, index: number) => (
        <a className="electrode-optimize-details-link" onClick={() => handleViewDetails(record, index)}>
          {t('design.electrode.optimize.details', 'Details')}
        </a>
      ),
    },
  ];

  // Invalid 数据列配置（带偏差高亮）
  const invalidColumns = [
    {
      title: t('design.electrode.optimize.no', 'No.'),
      width: 80,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => validItems.length + index + 1,
    },
    {
      title: `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`,
      dataIndex: 'design_capacity',
      width: 180,
      render: (value: number, record: any) => (
        <span className={isFieldDeviated('designCapacity', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: `${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`,
      dataIndex: 'specific_ED',
      width: 200,
      render: (value: number, record: any) => (
        <span className={isFieldDeviated('specificEnergy', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`,
      dataIndex: 'jelly_roll_thickness',
      width: 200,
      render: (value: number, record: any) => (
        <span className={isFieldDeviated('thickness', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`,
      dataIndex: 'volumetric_ED',
      width: 220,
      render: (value: number, record: any) => (
        <span className={isFieldDeviated('volumetricEnergyDensity', record.deviatedFields) ? 'deviated-value' : ''}>
          {value?.toFixed(2)}
        </span>
      ),
    },
    {
      title: t('design.electrode.optimize.actions', 'Actions'),
      width: 100,
      render: (_: any, record: any, index: number) => (
        <a className="electrode-optimize-details-link" onClick={() => handleViewDetails(record, index, true)}>
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
      data: trendChartData,
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
            <RecommendationTrendChart data={trendChartData} />
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
      <Modal
        title={`${t('design.electrode.optimize.designDetails', 'Design Details')} - ${t('design.electrode.optimize.no')} #${selectedIndex + 1}`}
        open={modalVisible}
        centered
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="80%"
        style={{ maxWidth: 1100 }}
        className="design-details-modal"
      >
        {selectedResult && (
          <div className="designdetail-content">
            {/* Performance Prediction */}
            <div className="designdetail-section">
              <h3 className="designdetail-section-title">Performance Prediction</h3>
              <div className="designdetail-performance-grid">
                <PerformanceCard label="Design Capacity" value={selectedResult.design_capacity} unit="Ah" />
                <PerformanceCard label="Specific E.D." value={selectedResult.specific_ED} unit="Wh/kg" />
                <PerformanceCard label="Jelly Roll Thickness" value={selectedResult.jelly_roll_thickness} unit="mm" />
                <PerformanceCard label="Volumetric E.D." value={selectedResult.volumetric_ED} unit="Wh/L" />
              </div>
            </div>

            {/* Design */}
            <div className="designdetail-section">
              <h3 className="designdetail-section-title">Design</h3>
              <div className="designdetail-design-grid">
                <DesignInfoItem label="Cell Type" value={getCellDesignLabel(cellDesign)} />
                <DesignInfoItem label="NP Ratio" value={npRatio} />
                <DesignInfoItem label="Cathode Material" value={getCathodeMaterialLabel(cathodeActiveMaterial)} />
                <DesignInfoItem label="Anode Material" value={getAnodeMaterialLabel(selectedResult, anodeActiveMaterial)} />
                <DesignInfoItem label="Width (mm)" value={modelParams.cathode_width} />
                <DesignInfoItem label="Length (mm)" value={modelParams.cathode_length} />
                <DesignInfoItem label="Layers" value={selectedResult.layers} />
              </div>
            </div>

            {/* Cathode & Anode */}
            <div className="designdetail-electrodes-grid">
              <div className="designdetail-electrode-section">
                <h3 className="designdetail-electrode-title designdetail-cathode-title">Cathode</h3>
                <div className="designdetail-parameters">
                  <ParameterItem label="PVDF (wt.%)" value={selectedResult.cathode_binder_wt} />
                  <ParameterItem label="CNT (wt.%)" value={selectedResult.cathode_cnt_wt} />
                  <ParameterItem label="Carbon black (wt.%)" value={selectedResult.cathode_conductive_carbon_wt} />
                  <ParameterItem label="Areal Loading (mAh/cm²)" value={selectedResult.cathode_areal_loading} />
                  <ParameterItem label="Press Density (g/cc)" value={selectedResult.cathode_press_density} />
                </div>
              </div>

              <div className="designdetail-electrode-section">
                <h3 className="designdetail-electrode-title designdetail-anode-title">Anode</h3>
                <div className="designdetail-parameters">
                  <ParameterItem label="CMC (wt.%)" value={selectedResult.anode_binder1_wt} />
                  <ParameterItem label="SBR (wt.%)" value={selectedResult.anode_binder2_wt} />
                  <ParameterItem label="PAA (wt.%)" value={selectedResult.anode_binder3_wt} />
                  <ParameterItem label="Carbon black (wt.%)" value={selectedResult.anode_conductive_carbon_wt} />
                  <ParameterItem label="CNT (wt.%)" value={selectedResult.anode_cnt_wt} />
                  <ParameterItem label="Press Density (g/cc)" value={selectedResult.anode_press_density} />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OptimizeDetailContent;
