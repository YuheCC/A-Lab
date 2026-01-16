import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Button from '@/components/Button';
import { useMessage } from '@/components/MessageProvider';
import type { OptimizeResultItemDTO } from '@/services/electrode/types';
import ParameterInput from '../Predict/components/ParameterInput';
import DesignDetailsModal from './components/DesignDetailsModal';
import { getOptimizeRecommendations } from './model';
import {
  DesignTargetsFormData,
  DesignRecommendation,
  PARAMETER_RANGES,
} from './types';
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
  ANODE_ACTIVE_MATERIAL_OPTIONS,
  getNpRatioByCellDesign,
  DEFAULT_VALUES,
} from '../constants';
import {
  validateDimensionParameters,
  dimensionParameterRanges,
} from '../validation';
import { useDebounce } from '@/hooks/useDebounce';
import './index.less';

const { Option } = Select;

const OptimizePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const message = useMessage();

  // 表单状态
  const [formData, setFormData] = useState<DesignTargetsFormData>({
    cellDesign: DEFAULT_VALUES.cellDesign,
    npRatio: DEFAULT_VALUES.npRatio,
    anodeActiveMaterial: DEFAULT_VALUES.anodeActiveMaterial,
    cathodeActiveMaterial: DEFAULT_VALUES.cathodeActiveMaterial,
    width: '',
    length: '',
    layers: '',
    designCapacity: PARAMETER_RANGES.designCapacity.default,
    specificEnergy: PARAMETER_RANGES.specificEnergy.default,
    thickness: PARAMETER_RANGES.thickness.default,
    volumetricEnergyDensity: PARAMETER_RANGES.volumetricEnergyDensity.default,
  });

  // 错误状态
  const [dimensionError, setDimensionError] = useState<string>('');

  // ============ 防抖值 - 用于优化实时验证性能 ============
  // Dimension 字段防抖（3个）
  const debouncedWidth = useDebounce(formData.width, 300);
  const debouncedLength = useDebounce(formData.length, 300);
  const debouncedLayers = useDebounce(formData.layers, 300);

  // 根据 Cell Design 自动更新 NP Ratio
  useEffect(() => {
    const npRatio = getNpRatioByCellDesign(formData.cellDesign);
    setFormData((prev) => ({ ...prev, npRatio }));
  }, [formData.cellDesign]);

  // ============ 实时验证 useEffect ============
  // 实时验证 Dimension 参数
  useEffect(() => {
    // 构建 dimension 参数对象
    const dimensionParams = {
      width: debouncedWidth,
      length: debouncedLength,
      layers: debouncedLayers,
    };

    // 执行验证（实时验证跳过空值检查，只检查范围和业务规则）
    const error = validateDimensionParameters(dimensionParams, t, { skipEmptyCheck: true });

    // 更新错误状态
    setDimensionError(error || '');
  }, [
    debouncedWidth,
    debouncedLength,
    debouncedLayers,
    t,
  ]);

  // 推荐结果状态
  const [recommendations, setRecommendations] = useState<DesignRecommendation[]>([]);
  const [fullResults, setFullResults] = useState<OptimizeResultItemDTO[]>([]); // 保存完整的 API 数据
  const [loading, setLoading] = useState(false);

  // Modal 状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<OptimizeResultItemDTO | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalLoading, setModalLoading] = useState(false);

  // 处理计算
  const handleCalculate = async () => {
    // 验证表单 - 材料选择
    if (!formData.cellDesign || !formData.anodeActiveMaterial || !formData.cathodeActiveMaterial) {
      message.error(t('design.electrode.optimize.messages.fillAllFields'));
      return;
    }

    // 验证 Cathode Dimension 字段（空值检查）
    if (!formData.width || !formData.length || !formData.layers) {
      // 通过二次验证设置错误状态，页面会显示错误提示
      const emptyError = validateDimensionParameters({
        width: formData.width,
        length: formData.length,
        layers: formData.layers,
      }, t);
      if (emptyError) {
        setDimensionError(emptyError);
      }
      return;
    }

    // 首先检查实时验证的错误状态
    // 如果存在任何错误，直接返回，不执行计算
    if (dimensionError) {
      console.warn('[OptimizePage] Validation failed:', { dimensionError });
      return;
    }

    // 二次验证（防御性编程，确保数据一致性）
    // 这是为了防止状态异步更新导致的问题
    const dimensionValidationError = validateDimensionParameters({
      width: formData.width,
      length: formData.length,
      layers: formData.layers,
    }, t);

    if (dimensionValidationError) {
      setDimensionError(dimensionValidationError);
      console.error('[OptimizePage] Double-check validation failed');
      return;
    }

    setLoading(true);
    try {
      const response = await getOptimizeRecommendations(formData);
      setRecommendations(response.data);
      setFullResults(response.fullResults); // 保存完整的 API 数据
      message.success(t('design.electrode.optimize.messages.calculateSuccess'));
    } catch (error) {
      console.error('Calculate error:', error);
      message.error(t('design.electrode.optimize.messages.calculateError'));
    } finally {
      setLoading(false);
    }
  };

  // 处理查看详情
  const handleViewDetails = (record: DesignRecommendation, index: number) => {
    // 从完整数据中获取对应的详细信息
    const fullData = fullResults[index];
    if (fullData) {
      setSelectedDesign(fullData);
      setSelectedIndex(index);
      setModalVisible(true);
    } else {
      message.error(t('design.electrode.optimize.messages.loadDetailsError'));
    }
  };

  // 表格列配置
  const columns: ColumnsType<DesignRecommendation> = [
    {
      title: t('design.electrode.optimize.no'),
      dataIndex: 'rank',
      width: 80,
      align: 'center',
    },
    {
      title: t('design.electrode.optimize.designCapacity') + ' (Ah)',
      dataIndex: 'designCapacity',
      width: 180,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: t('design.electrode.optimize.specificEnergy') + ' (Wh/kg)',
      dataIndex: 'specificEnergy',
      width: 200,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: t('design.electrode.optimize.jellyRollThickness') + ' (mm)',
      dataIndex: 'thickness',
      width: 200,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: t('design.electrode.optimize.volumetricEnergyDensity') + ' (Wh/L)',
      dataIndex: 'volumetricEnergyDensity',
      width: 220,
      render: (value: number) => value.toFixed(2),
    },
    {
      title: t('design.electrode.optimize.actions'),
      width: 100,
      render: (_: any, record: DesignRecommendation, index: number) => (
        <a className="electrode-optimize-details-link" onClick={() => handleViewDetails(record, index)}>
          {t('design.electrode.optimize.details')}
        </a>
      ),
    },
  ];

  return (
    <div className="electrode-optimize-container">
      {/* 标题和返回按钮 */}
      <div className="electrode-optimize-actions">
        <h1 className="electrode-optimize-title">
          {t('design.electrode.optimize.title')}
        </h1>
        <button className="electrode-optimize-back-btn" onClick={() => navigate(-1)}>
          <LeftOutlined style={{ marginRight: 8 }} />
          {t('design.electrode.optimize.back')}
        </button>
      </div>

      {/* 内容区域 */}
      <div className="electrode-optimize-content">
        {/* Performance Targets 区域 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.performanceTargets')}
          </h2>

          <div className="electrode-optimize-form-container">
            {/* Cell Information 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cellInformation')}
              </h3>

              {/* Cell Type 和 NP Ratio - 两列布局 */}
              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cellType')}
                  </label>
                  <Select
                    value={formData.cellDesign}
                    onChange={(value) => setFormData({ ...formData, cellDesign: value })}
                    placeholder={t('design.electrode.optimize.selectCellDesign')}
                    className="electrode-optimize-select"
                  >
                    {CELL_DESIGN_OPTIONS.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.npRatio')}
                  </label>
                  <input
                    type="text"
                    value={formData.npRatio}
                    disabled
                    className="electrode-optimize-input electrode-optimize-input--disabled"
                  />
                </div>
              </div>

              {/* Cathode Active Material 和 Anode Active Material - 两列布局 */}
              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.cathodeActiveMaterial')}
                  </label>
                  <Select
                    value={formData.cathodeActiveMaterial}
                    onChange={(value) => setFormData({ ...formData, cathodeActiveMaterial: value })}
                    placeholder={t('design.electrode.optimize.selectMaterial')}
                    className="electrode-optimize-select"
                  >
                    {CATHODE_ACTIVE_MATERIAL_OPTIONS.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.anodeActiveMaterial')}
                  </label>
                  <Select
                    value={formData.anodeActiveMaterial}
                    onChange={(value) => setFormData({ ...formData, anodeActiveMaterial: value })}
                    placeholder={t('design.electrode.optimize.selectMaterial')}
                    className="electrode-optimize-select"
                  >
                    {ANODE_ACTIVE_MATERIAL_OPTIONS.map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Cathode Dimension 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.cathodeDimension')}
              </h3>

              <div className="electrode-optimize-form-row electrode-optimize-form-row--triple">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.width')}
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    placeholder={t('design.electrode.optimize.enterWidth')}
                    className="electrode-optimize-input"
                  />
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.length')}
                  </label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                    placeholder={t('design.electrode.optimize.enterLength')}
                    className="electrode-optimize-input"
                  />
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.layers')}
                  </label>
                  <input
                    type="number"
                    value={formData.layers}
                    onChange={(e) => setFormData({ ...formData, layers: e.target.value })}
                    placeholder={t('design.electrode.optimize.enterLayers')}
                    className="electrode-optimize-input"
                  />
                </div>
              </div>

              {/* 尺寸错误提示 */}
              {dimensionError && (
                <div className="electrode-optimize-error-message">
                  {dimensionError}
                </div>
              )}
            </div>

            {/* Targets 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.targets')}
              </h3>

              {/* 参数滑块 */}
              <div className="electrode-optimize-parameters">
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.designCapacity')} (Ah)`}
                  rangeValue={formData.designCapacity}
                  onRangeChange={(value) => setFormData({ ...formData, designCapacity: value })}
                  min={PARAMETER_RANGES.designCapacity.min}
                  max={PARAMETER_RANGES.designCapacity.max}
                  step={PARAMETER_RANGES.designCapacity.step}
                  minDiff={PARAMETER_RANGES.designCapacity.minDiff}
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.specificEnergy')} (Wh/kg)`}
                  rangeValue={formData.specificEnergy}
                  onRangeChange={(value) => setFormData({ ...formData, specificEnergy: value })}
                  min={PARAMETER_RANGES.specificEnergy.min}
                  max={PARAMETER_RANGES.specificEnergy.max}
                  step={PARAMETER_RANGES.specificEnergy.step}
                  minDiff={PARAMETER_RANGES.specificEnergy.minDiff}
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.jellyRollThickness')} (mm)`}
                  rangeValue={formData.thickness}
                  onRangeChange={(value) => setFormData({ ...formData, thickness: value })}
                  min={PARAMETER_RANGES.thickness.min}
                  max={PARAMETER_RANGES.thickness.max}
                  step={PARAMETER_RANGES.thickness.step}
                  minDiff={PARAMETER_RANGES.thickness.minDiff}
                />
                <ParameterInput
                  mode="range"
                  label={`${t('design.electrode.optimize.volumetricEnergyDensity')} (Wh/L)`}
                  rangeValue={formData.volumetricEnergyDensity}
                  onRangeChange={(value) => setFormData({ ...formData, volumetricEnergyDensity: value })}
                  min={PARAMETER_RANGES.volumetricEnergyDensity.min}
                  max={PARAMETER_RANGES.volumetricEnergyDensity.max}
                  step={PARAMETER_RANGES.volumetricEnergyDensity.step}
                  minDiff={PARAMETER_RANGES.volumetricEnergyDensity.minDiff}
                />
              </div>
            </div>

            {/* Calculate 按钮 */}
            <div className="electrode-optimize-calculate-btn-wrapper">
              <Button
                variant="primary"
                size="mlarge"
                onClick={handleCalculate}
                loading={loading}
                className="electrode-optimize-calculate-btn"
              >
                {t('design.electrode.optimize.calculate')}
              </Button>
            </div>
          </div>
        </div>

        {/* Design Recommendations 表格 */}
        <div className="electrode-optimize-section">
          <h2 className="electrode-optimize-section-title">
            {t('design.electrode.optimize.designRecommendations')}
          </h2>
          <Table
            columns={columns}
            dataSource={recommendations}
            rowKey="id"
            pagination={false}
            className="electrode-optimize-table"
          />
        </div>
      </div>

      {/* 详情 Modal */}
      <DesignDetailsModal
        visible={modalVisible}
        data={selectedDesign}
        rank={selectedIndex + 1}
        cellDesign={formData.cellDesign}
        npRatio={formData.npRatio}
        cathodeActiveMaterial={formData.cathodeActiveMaterial}
        anodeActiveMaterial={formData.anodeActiveMaterial}
        loading={modalLoading}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default OptimizePage;
