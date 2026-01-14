import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useNavigate, useParams, useSearchParams } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Input, Spin, message, Table, Modal } from 'antd';
import ParameterInput from '../components/ParameterInput';
import ResultDisplay from '../components/ResultDisplay';
import RateCapabilityChart from '../components/RateCapabilityChart';
import * as electrodeModel from '../../model';
import { isOptimizeHistoryItem } from '../../model';
import type {
  ElectrodeHistoryItem,
  OptimizeHistoryItem,
  OptimizeResultItemDTO,
  UniversalHistoryDetailResponse,
} from '../../model';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
  ANODE_ACTIVE_MATERIAL_OPTIONS,
} from '../../constants';
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
    <div className="electrode-optimize-container">
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

              {/* 参数滑块 - disabled 模式 */}
              <div className="electrode-optimize-parameters">
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`}
                  rangeValue={modelParams.design_capacity}
                  onRangeChange={() => {}}
                  min={0}
                  max={20}
                  step={0.1}
                  disabled
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.specificEnergy', 'Specific E.D.')} (Wh/kg)`}
                  rangeValue={modelParams.specific_ED}
                  onRangeChange={() => {}}
                  min={0}
                  max={500}
                  step={1}
                  disabled
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`}
                  rangeValue={modelParams.jelly_roll_thickness}
                  onRangeChange={() => {}}
                  min={0}
                  max={20}
                  step={0.1}
                  disabled
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric E.D.')} (Wh/L)`}
                  rangeValue={modelParams.volumetric_ED}
                  onRangeChange={() => {}}
                  min={0}
                  max={1500}
                  step={1}
                  disabled
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

// ============================================
// 主组件
// ============================================

const DetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  // 从 URL 参数获取 type 用于 API 请求，默认为 1（正向预测）
  const typeParam = searchParams.get('type');
  const requestType = typeParam === '2'
    ? electrodeModel.PageType.INVERSE_DESIGN
    : electrodeModel.PageType.RESULT_PREDICTION;

  // 状态管理 - 使用联合类型存储返回数据
  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<UniversalHistoryDetailResponse | null>(null);

  // 加载详情数据
  useEffect(() => {
    const loadDetailData = async () => {
      if (!id) {
        message.error('无效的记录 ID');
        navigate(-1);
        return;
      }

      setLoading(true);
      try {
        const response = await electrodeModel.getElectrodeHistoryDetail({
          id: parseInt(id, 10),
          type: requestType,
        });

        // 直接存储返回数据，后续根据返回数据的 type 字段判断样式
        setDetailData(response);
      } catch (error) {
        message.error('加载详情失败');
        console.error('[DetailPage] Load detail error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, requestType]);

  // 根据 Cell Design 获取 NP Ratio
  const getNpRatio = (cellDesign: string): string => {
    switch (cellDesign) {
      case 'Balanced':
        return '1.07';
      case 'High Energy':
        return '1.05';
      case 'High Power':
        return '1.10';
      default:
        return '1.07';
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="electrode-predict-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip={t('common.loading', '加载中...')} />
      </div>
    );
  }

  // 根据返回数据的 type 字段判断样式（使用类型守卫）
  // type=2: Optimize 样式（参考 Optimize 页面，所有输入 disabled，无计算按钮）
  if (detailData && isOptimizeHistoryItem(detailData)) {
    const { cell_design, np_ratio, cathode_active_material, anode_active_material, model_params, model_result } = detailData;
    const npRatio = np_ratio || getNpRatio(cell_design);

    // 渲染 Optimize Detail 组件
    return (
      <OptimizeDetailContent
        t={t}
        cellDesign={cell_design}
        npRatio={npRatio}
        cathodeActiveMaterial={cathode_active_material}
        anodeActiveMaterial={anode_active_material}
        modelParams={model_params}
        modelResult={model_result}
        onGoBack={handleGoBack}
      />
    );
  }

  // type=1: Predict 样式（保持原有样式）
  // 如果没有数据，显示空状态
  if (!detailData) {
    return (
      <div className="electrode-predict-container">
        <div className="electrode-predict-actions">
          <h1 className="electrode-predict-title">
            {t('design.electrode.predict.title', 'Result Prediction')}
          </h1>
          <button className="electrode-predict-back-btn" onClick={handleGoBack}>
            <LeftOutlined style={{ marginRight: 8 }} />
            {t('design.electrode.predict.back', '返回')}
          </button>
        </div>
        <div className="electrode-predict-content">
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            {t('common.noData', '未找到记录')}
          </div>
        </div>
      </div>
    );
  }

  // type=1: 此时 detailData 是 ElectrodeHistoryItem 类型
  const predictData = detailData as ElectrodeHistoryItem;
  const { cell_design, np_ratio, cathode_active_material, anode_active_material, model_params, model_result } = predictData;
  // 优先使用 API 返回的 np_ratio，如果没有则根据 cell_design 计算（向后兼容）
  const npRatio = np_ratio || getNpRatio(cell_design);

  return (
    <div className="electrode-predict-container">
      {/* 页面标题和返回按钮 */}
      <div className="electrode-predict-actions">
        <h1 className="electrode-predict-title">
          {t('design.electrode.predict.title', 'Result Prediction')}
        </h1>
        <button className="electrode-predict-back-btn" onClick={handleGoBack}>
          <LeftOutlined style={{ marginRight: 8 }} />
          {t('design.electrode.predict.back', '返回')}
        </button>
      </div>

      <div className="electrode-predict-content">
        {/* 操作区域 */}
        <div className="electrode-predict-operation-area">
          {/* Electrode Design 部分 */}
          <div className="electrode-predict-section">
            <h2 className="electrode-predict-section-title">
              {t('design.electrode.predict.electrodeDesign', 'Electrode Design')}
            </h2>

            <div className="electrode-predict-form-container">
              {/* Cell Design 和 NP Ratio 并排 */}
              <div className="electrode-predict-electrode-grid">
                <div className="electrode-predict-form-item">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.cellDesign', 'Cell Design')}
                  </label>
                  <Select
                    disabled
                    value={cell_design}
                    className="electrode-predict-select"
                  >
                    {CELL_DESIGN_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="electrode-predict-form-item">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.npRatio', 'NP Ratio')}
                  </label>
                  <Input
                    disabled
                    type="number"
                    value={npRatio}
                    className="electrode-predict-input"
                  />
                </div>
              </div>

              {/* 阳极和阴极区域 */}
              <div className="electrode-predict-electrode-grid">
                {/* 阴极区域 */}
                <div className="electrode-predict-electrode-section">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.cathodeActiveMaterial', 'Cathode Active Material')}
                  </label>
                  <Select
                    disabled
                    value={cathode_active_material}
                    className="electrode-predict-select"
                  >
                    {CATHODE_ACTIVE_MATERIAL_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>

                  <h3 className="electrode-predict-subsection-title">
                    {t('design.electrode.predict.cathodeParameters', 'Cathode Parameters')}
                  </h3>

                  <div className="electrode-predict-parameters-container">
                    <ParameterInput
                      label={t('design.electrode.predict.kf9700', 'KF-9700 (wt.%)')}
                      value={model_params.cathodeKF9700}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.cn01y', 'CN-01Y (wt.%)')}
                      value={model_params.cathodeCN01Y}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.superC65', 'Super C65 (wt.%)')}
                      value={model_params.cathodeSuperC65}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.cathodeActiveMaterialLabel', 'Active material NCM-A (%)')}
                      value={model_params.cathodeNCMA}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.arealLoading', 'Areal Loading (mAh/cm²)')}
                      value={model_params.cathodeArealLoading}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                      value={model_params.cathodePressDensity}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                  </div>
                </div>

                {/* 阳极区域 */}
                <div className="electrode-predict-electrode-section">
                  <label className="electrode-predict-label">
                    {t('design.electrode.predict.anodeActiveMaterial', 'Anode Active Material')}
                  </label>
                  <Select
                    disabled
                    value={anode_active_material}
                    className="electrode-predict-select"
                  >
                    {ANODE_ACTIVE_MATERIAL_OPTIONS.map((opt) => (
                      <Option key={opt.value} value={opt.value}>
                        {opt.label}
                      </Option>
                    ))}
                  </Select>

                  <h3 className="electrode-predict-subsection-title">
                    {t('design.electrode.predict.anodeParameters', 'Anode Parameters')}
                  </h3>

                  <div className="electrode-predict-parameters-container">
                    <ParameterInput
                      label={t('design.electrode.predict.cmc', 'CMC (wt.%)')}
                      value={model_params.anodeCMC}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.sbr', 'SBR (wt.%)')}
                      value={model_params.anodeSBR}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.paa', 'PAA (wt.%)')}
                      value={model_params.anodePAA}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.superP', 'Super P (wt.%)')}
                      value={model_params.anodeSuperP}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.swcnt', 'SWCNT (wt.%)')}
                      value={model_params.anodeSWCNT}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.activeMaterial1', 'Active material-1 SC-B-I (%)')}
                      value={model_params.anodeSCBI}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.activeMaterial2', 'Active material-2 Gr-S-I (%)')}
                      value={model_params.anodeGrSI}
                      onChange={() => {}}
                      min={0}
                      max={100}
                      step={0.1}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.anodeArealLoading', 'Areal Loading (mAh/cm²)')}
                      value={model_params.anodeArealLoading}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                    <ParameterInput
                      label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                      value={model_params.anodePressDensity}
                      onChange={() => {}}
                      min={0}
                      max={10}
                      step={0.01}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>

              {/* Dimension 区域 */}
              <div className="electrode-predict-dimension-section">
                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.dimension', 'Dimension')}
                </h3>
                <div className="electrode-predict-dimension-grid">
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label-small">
                      {t('design.electrode.predict.width', 'Width (mm)')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.width}
                    />
                  </div>
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label-small">
                      {t('design.electrode.predict.length', 'Length (mm)')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.length}
                    />
                  </div>
                  <div className="electrode-predict-dimension-item">
                    <label className="electrode-predict-label-small">
                      {t('design.electrode.predict.layers', 'Layers')}
                    </label>
                    <Input
                      disabled
                      type="number"
                      value={model_params.layers}
                    />
                  </div>
                </div>
              </div>

              {/* 不显示 Calculate 按钮 */}
            </div>
          </div>

          {/* Cell Performance Prediction 部分 - 始终显示 */}
          <div className="electrode-predict-section">
            <h2 className="electrode-predict-section-title">
              {t('design.electrode.predict.cellPerformance', 'Cell Performance Prediction')}
            </h2>

            <div className="electrode-predict-results-container">
              <div className="electrode-predict-results-grid">
                <ResultDisplay
                  label={t('design.electrode.predict.designCapacity', 'Design Capacity')}
                  value={model_result.designCapacity}
                  unit="Ah"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.specificED', 'Specific E.D.')}
                  value={model_result.specificED}
                  unit="Wh/kg"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.jellyRollThickness', 'Jelly Roll Thickness')}
                  value={model_result.jellyRollThickness}
                  unit="mm"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.volumetricED', 'Volumetric E.D.')}
                  value={model_result.volumetricED}
                  unit="Wh/L"
                />
              </div>

              {/* Rate Capability 图表 */}
              <RateCapabilityChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
