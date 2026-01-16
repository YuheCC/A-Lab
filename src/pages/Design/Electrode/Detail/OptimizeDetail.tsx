import React, { useState } from 'react';
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
    layers: number;
    design_capacity: [number, number];
    specific_ED: [number, number];
    jelly_roll_thickness: [number, number];
    volumetric_ED: [number, number];
  };
  modelResult: OptimizeResultItemDTO[];
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

  // 处理查看详情
  const handleViewDetails = (record: OptimizeResultItemDTO, index: number) => {
    setSelectedResult(record);
    setSelectedIndex(index);
    setModalVisible(true);
  };

  // 表格列配置
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

              <div className="electrode-optimize-form-row electrode-optimize-form-row--triple">
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

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.layers', 'Layers')}
                  </label>
                  <input
                    type="number"
                    value={modelParams.layers}
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
                  min={0}
                  max={20}
                  step={0.1}
                  readonly
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`}
                  rangeValue={modelParams.specific_ED}
                  onRangeChange={() => {}}
                  min={0}
                  max={500}
                  step={1}
                  readonly
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`}
                  rangeValue={modelParams.jelly_roll_thickness}
                  onRangeChange={() => {}}
                  min={0}
                  max={20}
                  step={0.1}
                  readonly
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`}
                  rangeValue={modelParams.volumetric_ED}
                  onRangeChange={() => {}}
                  min={0}
                  max={1500}
                  step={1}
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
          <Table
            columns={columns}
            dataSource={modelResult}
            rowKey={(_, index) => `result-${index}`}
            pagination={false}
            className="electrode-optimize-table"
          />
        </div>
      </div>

      {/* 详情 Modal */}
      <Modal
        title={`${t('design.electrode.optimize.designDetails', 'Design Details')} - Rank #${selectedIndex + 1}`}
        open={modalVisible}
        centered
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="90%"
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
                  unit="Ah"
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
                <DesignInfoItem label="Layers" value={selectedResult.layers} />
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
