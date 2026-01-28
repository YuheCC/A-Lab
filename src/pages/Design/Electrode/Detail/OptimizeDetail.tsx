import React, { useState, useRef } from 'react';
import type { TFunction } from 'i18next';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Table, Modal } from 'antd';
import ParameterInput from '../Predict/components/ParameterInput';
import type { OptimizeResultItemDTO } from '../model';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
  ANODE_ACTIVE_MATERIAL_OPTIONS,
} from '../constants';
import type { OptimizeGroupedResultDTO } from '@/services/electrode/types';
import type { DeviatedFieldType } from '../Optimize/types';
import { PARAMETER_RANGES } from '../Optimize/types';
import Button from '@/components/Button';
import './index.less';

const { Option } = Select;

// ============================================
// type=2 (Optimize) 详情内容组件
// ============================================

interface OptimizeDetailContentProps {
  t: TFunction;
  cellDesign: string;
  npRatio: string;
  cathodeActiveMaterial: string;
  anodeActiveMaterial: string;
  modelParams: {
    width: number;
    length: number;
    design_capacity: [number, number];
    specific_ED: [number, number];
    jelly_roll_thickness: [number, number];
    volumetric_ED: [number, number];
  };
  modelResult: OptimizeGroupedResultDTO;
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

/**
 * 根据 value 获取 Cell Design 的 label
 */
const getCellDesignLabel = (value: string): string => {
  const option = CELL_DESIGN_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

/**
 * 根据 value 获取 Cathode Material 的 label
 */
const getCathodeMaterialLabel = (value: string): string => {
  const option = CATHODE_ACTIVE_MATERIAL_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

/**
 * 根据 value 获取 Anode Material 的 label
 */
const getAnodeMaterialLabel = (value: string): string => {
  const option = ANODE_ACTIVE_MATERIAL_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

const OptimizeDetailContent: React.FC<OptimizeDetailContentProps> = ({
  t,
  cellDesign,
  npRatio,
  cathodeActiveMaterial,
  anodeActiveMaterial,
  modelParams,
  modelResult,
  onGoBack,
}) => {
  // Modal 状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResult, setSelectedResult] = useState<OptimizeResultItemDTO | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isAdditionalExpanded, setIsAdditionalExpanded] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const additionalSectionRef = useRef<HTMLDivElement>(null);

  /**
   * 检查单条结果是否有偏差（超出目标范围）
   */
  const checkDeviations = (
    item: OptimizeResultItemDTO,
  ): DeviatedFieldType[] => {
    const deviatedFields: DeviatedFieldType[] = [];

    // 检查 Design Capacity
    if (
      item.design_capacity < modelParams.design_capacity[0] ||
      item.design_capacity > modelParams.design_capacity[1]
    ) {
      deviatedFields.push('designCapacity');
    }

    // 检查 Specific Energy (Gravimetric Energy Density)
    if (
      item.specific_ED < modelParams.specific_ED[0] ||
      item.specific_ED > modelParams.specific_ED[1]
    ) {
      deviatedFields.push('specificEnergy');
    }

    // 检查 Jelly Roll Thickness
    if (
      item.jelly_roll_thickness < modelParams.jelly_roll_thickness[0] ||
      item.jelly_roll_thickness > modelParams.jelly_roll_thickness[1]
    ) {
      deviatedFields.push('thickness');
    }

    // 检查 Volumetric Energy Density
    if (
      item.volumetric_ED < modelParams.volumetric_ED[0] ||
      item.volumetric_ED > modelParams.volumetric_ED[1]
    ) {
      deviatedFields.push('volumetricEnergyDensity');
    }

    return deviatedFields;
  };

  // 为 invalid 数据添加偏差字段
  const invalidDataWithDeviations = modelResult.invalid.map((item, index) => ({
    ...item,
    deviatedFields: checkDeviations(item),
  }));

  // 处理额外推荐的展开/折叠
  const handleToggleAdditional = () => {
    if (isAdditionalExpanded) {
      // 开始折叠动画
      setIsCollapsing(true);
      setTimeout(() => {
        setIsAdditionalExpanded(false);
        setIsCollapsing(false);
      }, 300); // 动画持续时间匹配 CSS
    } else {
      // 直接展开
      setIsAdditionalExpanded(true);
      // 延迟滚动到可视区域（等待 DOM 更新）
      setTimeout(() => {
        if (additionalSectionRef.current) {
          additionalSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 100);
    }
  };

  // 处理查看详情
  const handleViewDetails = (record: OptimizeResultItemDTO, index: number, isInvalid: boolean = false) => {
    setSelectedResult(record);
    // 如果是 invalid 数据，索引需要加上 valid 数据的长度
    const actualIndex = isInvalid ? modelResult.valid.length + index : index;
    setSelectedIndex(actualIndex);
    setModalVisible(true);
  };

  // 检查字段是否偏差
  const isFieldDeviated = (field: DeviatedFieldType, deviatedFields?: DeviatedFieldType[]) => {
    return deviatedFields?.includes(field);
  };

  // 主表格列配置（valid 数据）
  const columns = [
    {
      title: t('design.electrode.optimize.no', 'No.'),
      dataIndex: 'rank',
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
      render: (_: any, record: OptimizeResultItemDTO, index: number) => (
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
      dataIndex: 'rank',
      width: 80,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => modelResult.valid.length + index + 1,
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
        <a
          className="electrode-optimize-details-link"
          onClick={() => handleViewDetails(record, index, true)}
        >
          {t('design.electrode.optimize.details', 'Details')}
        </a>
      ),
    },
  ];

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
            {/* Cell Information 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cellInformation', 'Cell Information')}
              </h3>

              {/* Cell Type 和 NP Ratio - 两列布局 */}
              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cellType', 'Cell Type')}
                  </label>
                  <Select
                    value={cellDesign}
                    disabled
                    className="electrode-optimize-select"
                  >
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

              {/* Cathode Active Material 和 Anode Active Material - 两列布局 */}
              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cathodeActiveMaterial', 'Cathode Active Material')}
                  </label>
                  <Select
                    value={cathodeActiveMaterial}
                    disabled
                    className="electrode-optimize-select"
                  >
                    <Option value={cathodeActiveMaterial}>{getCathodeMaterialLabel(cathodeActiveMaterial)}</Option>
                  </Select>
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.anodeActiveMaterial', 'Anode Active Material')}
                  </label>
                  <Select
                    value={anodeActiveMaterial}
                    disabled
                    className="electrode-optimize-select"
                  >
                    <Option value={anodeActiveMaterial}>{getAnodeMaterialLabel(anodeActiveMaterial)}</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cathode Dimension 分组 */}
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
                    value={modelParams.width}
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
                    value={modelParams.length}
                    disabled
                    className="electrode-optimize-input electrode-optimize-input--disabled"
                  />
                </div>
              </div>
            </div>

            {/* Targets 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.targets', 'Targets')}
              </h3>

              {/* 参数滑块 - readonly 模式 */}
              <div className="electrode-optimize-parameters">
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`}
                  rangeValue={modelParams.design_capacity}
                  onRangeChange={() => {}}
                  min={PARAMETER_RANGES.designCapacity.min}
                  max={PARAMETER_RANGES.designCapacity.max}
                  step={PARAMETER_RANGES.designCapacity.step}
                  readonly
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`}
                  rangeValue={modelParams.specific_ED}
                  onRangeChange={() => {}}
                  min={PARAMETER_RANGES.specificEnergy.min}
                  max={PARAMETER_RANGES.specificEnergy.max}
                  step={PARAMETER_RANGES.specificEnergy.step}
                  readonly
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`}
                  rangeValue={modelParams.jelly_roll_thickness}
                  onRangeChange={() => {}}
                  min={PARAMETER_RANGES.thickness.min}
                  max={PARAMETER_RANGES.thickness.max}
                  step={PARAMETER_RANGES.thickness.step}
                  readonly
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`}
                  rangeValue={modelParams.volumetric_ED}
                  onRangeChange={() => {}}
                  min={PARAMETER_RANGES.volumetricEnergyDensity.min}
                  max={PARAMETER_RANGES.volumetricEnergyDensity.max}
                  step={PARAMETER_RANGES.volumetricEnergyDensity.step}
                  readonly
                />
              </div>
            </div>

            {/* 无 Calculate 按钮 */}
          </div>
        </div>

        {/* Design Recommendations 表格 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.designRecommendations', 'Design Recommendations')}
          </h2>

          {modelResult.valid.length === 0 ? (
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
                {t('design.electrode.optimize.emptyState.description', 'We couldn\'t find any designs that match your current criteria. Try adjusting your target values or check out other recommendations below.')}
              </p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={modelResult.valid}
              rowKey={(_, index) => `valid-result-${index}`}
              pagination={false}
              className="electrode-optimize-table"
            />
          )}

          {/* Additional Recommendations 折叠提示 */}
          {modelResult.invalid.length > 0 && (
            <div className="electrode-optimize-additional-banner">
              <span className="electrode-optimize-additional-banner-text">
                {t('design.electrode.optimize.additionalPrompt', 'Additional recommendations with slight deviations from target values are available.')}
              </span>
              <Button
                variant="primary"
                size="small"
                onClick={handleToggleAdditional}
              >
                {isAdditionalExpanded
                  ? t('design.electrode.optimize.collapse', 'Collapse')
                  : t('design.electrode.optimize.expand', 'Expand')}
              </Button>
            </div>
          )}

          {/* Additional Recommendations 表格（可折叠） */}
          {(isAdditionalExpanded || isCollapsing) && modelResult.invalid.length > 0 && (
            <div
              ref={additionalSectionRef}
              className={`electrode-optimize-additional-section ${isCollapsing ? 'collapsing' : ''}`}
            >
              <h3 className="electrode-optimize-section-title">
                {t('design.electrode.optimize.additionalRecommendations', 'Additional Recommendations')}
              </h3>
              <Table
                columns={invalidColumns}
                dataSource={invalidDataWithDeviations}
                rowKey={(_, index) => `invalid-result-${index}`}
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
                <PerformanceCard
                  label="Design Capacity"
                  value={selectedResult.design_capacity}
                  unit="mAh"
                />
                <PerformanceCard
                  label="Specific E.D."
                  value={selectedResult.specific_ED}
                  unit="Wh/kg"
                />
                <PerformanceCard
                  label="Jelly Roll Thickness"
                  value={selectedResult.jelly_roll_thickness}
                  unit="mm"
                />
                <PerformanceCard
                  label="Volumetric E.D."
                  value={selectedResult.volumetric_ED}
                  unit="Wh/L"
                />
              </div>
            </div>

            {/* Design */}
            <div className="designdetail-section">
              <h3 className="designdetail-section-title">Design</h3>
              <div className="designdetail-design-grid">
                <DesignInfoItem label="Cell Type" value={getCellDesignLabel(cellDesign)} />
                <DesignInfoItem label="NP Ratio" value={npRatio} />
                <DesignInfoItem
                  label="Cathode Material"
                  value={getCathodeMaterialLabel(cathodeActiveMaterial)}
                />
                <DesignInfoItem
                  label="Anode Material"
                  value={getAnodeMaterialLabel(anodeActiveMaterial)}
                />
                <DesignInfoItem label="Width (mm)" value={selectedResult.width} />
                <DesignInfoItem label="Length (mm)" value={selectedResult.length} />
                <DesignInfoItem label="Layers" value={selectedResult.layers.toFixed(0)} />
              </div>
            </div>

            {/* Cathode & Anode */}
            <div className="designdetail-electrodes-grid">
              {/* Cathode */}
              <div className="designdetail-electrode-section">
                <h3 className="designdetail-electrode-title designdetail-cathode-title">
                  Cathode
                </h3>
                <div className="designdetail-parameters">
                  <ParameterItem label="PVDF (wt.%)" value={selectedResult.cathode_binder_wt} />
                  <ParameterItem label="CNT (wt.%)" value={selectedResult.cathode_cnt_wt} />
                  <ParameterItem label="Carbon black (wt.%)" value={selectedResult.cathode_conductive_carbon_wt} />
                  <ParameterItem label="Areal Loading (mAh/cm²)" value={selectedResult.cathode_areal_loading} />
                  <ParameterItem label="Press Density (g/cc)" value={selectedResult.cathode_press_density} />
                </div>
              </div>

              {/* Anode */}
              <div className="designdetail-electrode-section">
                <h3 className="designdetail-electrode-title designdetail-anode-title">
                  Anode
                </h3>
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
