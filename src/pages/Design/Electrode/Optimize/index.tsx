import React, { useState, useEffect, useRef } from 'react';
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
  DesignRecommendationWithDeviation,
  GroupedRecommendations,
  GroupedFullResults,
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

  // 推荐结果状态 - 分组数据
  const [recommendations, setRecommendations] = useState<GroupedRecommendations>({
    valid: [],
    invalid: [],
  });
  const [fullResults, setFullResults] = useState<GroupedFullResults>({
    valid: [],
    invalid: [],
  });
  const [loading, setLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false); // 是否已计算过
  const [isAdditionalExpanded, setIsAdditionalExpanded] = useState(false); // 额外推荐折叠状态
  const [isCollapsing, setIsCollapsing] = useState(false); // 折叠动画状态
  const [lastCalculatedFormData, setLastCalculatedFormData] = useState<DesignTargetsFormData | null>(null); // 上次计算的表单数据
  const [isFormModified, setIsFormModified] = useState(false); // 表单是否被修改

  // Modal 状态
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<OptimizeResultItemDTO | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [modalLoading, setModalLoading] = useState(false);

  // 额外推荐区域的 ref
  const additionalSectionRef = useRef<HTMLDivElement>(null);

  // 监听表单数据变化，判断是否与上次计算的数据不同
  useEffect(() => {
    if (!lastCalculatedFormData) {
      // 如果还没有计算过，表单未修改
      setIsFormModified(false);
      return;
    }

    // 比较当前 formData 与上次计算的 formData
    const isModified = JSON.stringify(formData) !== JSON.stringify(lastCalculatedFormData);
    setIsFormModified(isModified);
  }, [formData, lastCalculatedFormData]);

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
      setFullResults(response.fullResults);
      setHasCalculated(true);
      setLastCalculatedFormData({ ...formData }); // 保存本次计算的表单数据
      setIsFormModified(false); // 计算完成后，表单未修改
      setIsAdditionalExpanded(false); // 重置折叠状态
      // message.success(t('design.electrode.optimize.messages.calculateSuccess'));
    } catch (error) {
      console.error('Calculate error:', error);
      // message.error(t('design.electrode.optimize.messages.calculateError'));
    } finally {
      setLoading(false);
    }
  };

  // 处理查看详情
  const handleViewDetails = (record: DesignRecommendation, index: number, isInvalid = false) => {
    // 根据来源从 fullResults.valid 或 fullResults.invalid 获取详情数据
    const sourceData = isInvalid ? fullResults.invalid : fullResults.valid;
    const fullData = sourceData[index];
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

  // Invalid 表格列配置 - 显示偏差值为绿色
  const invalidColumns: ColumnsType<DesignRecommendationWithDeviation> = [
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
      render: (value: number, record: DesignRecommendationWithDeviation) => (
        <span className={record.deviatedFields.includes('designCapacity') ? 'deviated-value' : ''}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      title: t('design.electrode.optimize.specificEnergy') + ' (Wh/kg)',
      dataIndex: 'specificEnergy',
      width: 200,
      render: (value: number, record: DesignRecommendationWithDeviation) => (
        <span className={record.deviatedFields.includes('specificEnergy') ? 'deviated-value' : ''}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      title: t('design.electrode.optimize.jellyRollThickness') + ' (mm)',
      dataIndex: 'thickness',
      width: 200,
      render: (value: number, record: DesignRecommendationWithDeviation) => (
        <span className={record.deviatedFields.includes('thickness') ? 'deviated-value' : ''}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      title: t('design.electrode.optimize.volumetricEnergyDensity') + ' (Wh/L)',
      dataIndex: 'volumetricEnergyDensity',
      width: 220,
      render: (value: number, record: DesignRecommendationWithDeviation) => (
        <span className={record.deviatedFields.includes('volumetricEnergyDensity') ? 'deviated-value' : ''}>
          {value.toFixed(2)}
        </span>
      ),
    },
    {
      title: t('design.electrode.optimize.actions'),
      width: 100,
      render: (_: any, record: DesignRecommendationWithDeviation, index: number) => (
        <a className="electrode-optimize-details-link" onClick={() => handleViewDetails(record, index, true)}>
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
                disabled={loading || !!dimensionError || (hasCalculated && !isFormModified)}
                className="electrode-optimize-calculate-btn"
              >
                {t('design.electrode.optimize.calculate')}
              </Button>
            </div>
          </div>
        </div>

        {/* Design Recommendations 表格 - 仅在计算后显示 */}
        {hasCalculated && (
          <div className="electrode-optimize-section">
            <h2 className="electrode-optimize-section-title">
              {t('design.electrode.optimize.designRecommendations')}
            </h2>

            {recommendations.valid.length === 0 ? (
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
                  {t('design.electrode.optimize.emptyState.title')}
                </h3>
                <p className="electrode-optimize-empty-description">
                  {recommendations.invalid.length > 0
                    ? t('design.electrode.optimize.emptyState.descriptionWithRecommendation')
                    : t('design.electrode.optimize.emptyState.description')}
                </p>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={recommendations.valid}
                rowKey="id"
                pagination={false}
                className="electrode-optimize-table"
              />
            )}

            {/* 额外推荐折叠提示栏 - 仅在有 invalid 数据时显示 */}
            {recommendations.invalid.length > 0 && (
              <>
                <div className="electrode-optimize-additional-banner">
                  <span className="electrode-optimize-additional-banner-text">
                    {t('design.electrode.optimize.additionalPrompt')}
                  </span>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleToggleAdditional}
                  >
                    {isAdditionalExpanded
                      ? t('design.electrode.optimize.collapse')
                      : t('design.electrode.optimize.expand')}
                  </Button>
                </div>

                {/* 展开后的额外表格区域 */}
                {(isAdditionalExpanded || isCollapsing) && (
                  <div
                    ref={additionalSectionRef}
                    className={`electrode-optimize-additional-section ${isCollapsing ? 'collapsing' : ''}`}
                  >
                    <h3 className="electrode-optimize-section-title">
                      {t('design.electrode.optimize.additionalRecommendations')}
                    </h3>
                    <Table
                      columns={invalidColumns}
                      dataSource={recommendations.invalid}
                      rowKey="id"
                      pagination={false}
                      className="electrode-optimize-table electrode-optimize-table-additional"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
