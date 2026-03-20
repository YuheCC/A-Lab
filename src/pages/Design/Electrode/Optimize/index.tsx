import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Button from '@/components/Button';
import { useMessage } from '@/components/MessageProvider';
import type { BackwardResultItemDTO } from '@/services/electrode/types';
import DesignDetailsModal from './components/DesignDetailsModal';
import RecommendationTrendChart from './components/RecommendationTrendChart';
import { getOptimizeRecommendations } from './model';
import { mapBackwardResultsToTrendData } from './recommendationData';
import { downloadRecommendationData } from './recommendationExport';
import ParameterInput from '../Predict/components/ParameterInput';
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
import { getGedBoundsFromVed } from './constData/vedGedLookup';
import { validateDimensionParameters, dimensionParameterRanges } from '../validation';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/models/useAuth';
import { PricingContext } from '@/layouts/index';
import './index.less';
import { Info } from 'lucide-react';

const { Option } = Select;

const formatPercent = (value: number): string => {
  return Number.isInteger(value) ? String(value) : String(parseFloat(value.toFixed(2)));
};

const getAnodeMaterialLabelByResult = (
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

const OptimizePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const message = useMessage();
  const { userPermissions } = useAuthStore();
  const pricingContext = useContext(PricingContext);

  // 表单状态
  const [formData, setFormData] = useState<DesignTargetsFormData>({
    cellDesign: DEFAULT_VALUES.cellDesign,
    npRatio: DEFAULT_VALUES.npRatio,
    anodeActiveMaterial: DEFAULT_VALUES.anodeActiveMaterial,
    cathodeActiveMaterial: DEFAULT_VALUES.cathodeActiveMaterial,
    width: '',
    length: '',
    designCapacity: PARAMETER_RANGES.designCapacity.default,
    specificEnergy: PARAMETER_RANGES.specificEnergy.default,
    thickness: PARAMETER_RANGES.thickness.default,
    volumetricEnergyDensity: PARAMETER_RANGES.volumetricEnergyDensity.default,
  });

  // Capacity 动态范围：由 VED / width / length / thickness 联动计算
  const [capacityBounds, setCapacityBounds] = useState<[number, number]>([
    PARAMETER_RANGES.designCapacity.min,
    PARAMETER_RANGES.designCapacity.max,
  ]);

  // GED（specificEnergy）动态范围：由 VED 区间通过查找表联动计算
  const [specificEnergyBounds, setSpecificEnergyBounds] = useState<[number, number]>([
    PARAMETER_RANGES.specificEnergy.min,
    PARAMETER_RANGES.specificEnergy.max,
  ]);

  // 错误状态
  const [dimensionError, setDimensionError] = useState<string>('');
  const [targetParameterError, setTargetParameterError] = useState<string>('');
  const [targetParameterErrorAnchor, setTargetParameterErrorAnchor] = useState<
    'thickness' | 'volumetricEnergyDensity' | 'specificEnergy' | 'designCapacity' | null
  >(null);
  const [calculateError, setCalculateError] = useState<string>('');

  // ============ VED-Capacity 公式联动 ============
  // capacity = Width * Length * thickness / 1_000_000 * VED / 3.51

  const canComputeLinkedRange = (
    width: string,
    length: string,
    thickness: [number, number],
  ): boolean => {
    const w = parseFloat(width);
    const l = parseFloat(length);
    const [tMin, tMax] = thickness;
    return (
      !isNaN(w) && w > 0 &&
      !isNaN(l) && l > 0 &&
      tMin > 0 && tMax > 0
    );
  };

  const computeCapacityFromVED = (
    vedRange: [number, number],
    width: string,
    length: string,
    thickness: [number, number],
  ): [number, number] => {
    const w = parseFloat(width);
    const l = parseFloat(length);
    const [tMin, tMax] = thickness;
    const [vedMin, vedMax] = vedRange;
    const { min: capMin, max: capMax } = PARAMETER_RANGES.designCapacity;
    const rawMin = (w * l * tMin * vedMin) / (1_000_000 * 3.51);
    const rawMax = (w * l * tMax * vedMax) / (1_000_000 * 3.51);
    const round2 = (v: number) => Math.round(v * 100) / 100;
    return [
      round2(Math.min(capMax, Math.max(capMin, rawMin))),
      round2(Math.min(capMax, Math.max(capMin, rawMax))),
    ];
  };

  // ============ 防抖值 - 用于优化实时验证性能 ============
  // Dimension 字段防抖（2个）
  const debouncedWidth = useDebounce(formData.width, 300);
  const debouncedLength = useDebounce(formData.length, 300);

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
    };

    // 执行验证（实时验证跳过空值检查，只检查范围和业务规则）
    const error = validateDimensionParameters(dimensionParams, t, { skipEmptyCheck: true });

    // 更新错误状态
    setDimensionError(error || '');
  }, [
    debouncedWidth,
    debouncedLength,
    t,
  ]);

  // 当 width 和 length 均已填写时，清空目标参数的前置校验错误
  useEffect(() => {
    const hasWidth = String(formData.width ?? '').trim() !== '';
    const hasLength = String(formData.length ?? '').trim() !== '';
    if (hasWidth && hasLength) {
      setTargetParameterError('');
      setTargetParameterErrorAnchor(null);
    }
  }, [formData.width, formData.length]);

  // 监听 VED / width / length / thickness 变化，动态计算 capacity 的 min/max 范围
  useEffect(() => {
    if (canComputeLinkedRange(formData.width, formData.length, formData.thickness)) {
      const newBounds = computeCapacityFromVED(
        formData.volumetricEnergyDensity,
        formData.width,
        formData.length,
        formData.thickness,
      );
      setCapacityBounds(newBounds);
      setFormData((prev) => ({
        ...prev,
        designCapacity: [newBounds[0], newBounds[1]],
      }));
    } else {
      setCapacityBounds([
        PARAMETER_RANGES.designCapacity.min,
        PARAMETER_RANGES.designCapacity.max,
      ]);
      setFormData((prev) => ({
        ...prev,
        designCapacity: PARAMETER_RANGES.designCapacity.default,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.width, formData.length, formData.thickness, formData.volumetricEnergyDensity]);

  // 监听 VED 变化，通过查找表动态计算 GED（specificEnergy）的 min/max 范围并重置为默认全范围
  useEffect(() => {
    const newBounds = getGedBoundsFromVed(formData.volumetricEnergyDensity);
    setSpecificEnergyBounds(newBounds);
    setFormData((prev) => ({
      ...prev,
      specificEnergy: [newBounds[0], newBounds[1]],
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.volumetricEnergyDensity]);

  // 第二行 target 的 radio 选择状态
  const [activeSecondaryTarget, setActiveSecondaryTarget] = useState<'specificEnergy' | 'designCapacity'>('specificEnergy');

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
  const [selectedDesign, setSelectedDesign] = useState<BackwardResultItemDTO | null>(null);
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
    
    // 如果表单被修改，清空结果数据（即使用户改回原值，结果也不会重新显示）
    if (isModified) {
      setRecommendations({ valid: [], invalid: [] });
      setFullResults({ valid: [], invalid: [] });
      setHasCalculated(false);
    }
    
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

  // 处理 VED 滑块变化：边界计算由 useEffect 统一处理
  const handleVEDChange = (vedRange: [number, number]) => {
    setFormData((prev) => ({ ...prev, volumetricEnergyDensity: vedRange }));
  };

  // ParameterInput 前置校验：仅检查 width/length 是否已填写，失败时显示组件区域内联错误
  const validateBeforeTargetChange = (
    anchor: 'thickness' | 'volumetricEnergyDensity' | 'specificEnergy' | 'designCapacity',
  ) => (_nextValue: number | [number, number]): boolean => {
    const hasWidth = String(formData.width ?? '').trim() !== '';
    const hasLength = String(formData.length ?? '').trim() !== '';
    if (hasWidth && hasLength) {
      return true;
    }

    setTargetParameterError(t('design.electrode.optimize.messages.fillWidthLengthFirst'));
    setTargetParameterErrorAnchor(anchor);
    return false;
  };

  // 处理计算
  const handleCalculate = async () => {
    // 验证表单 - 材料选择
    if (!formData.cellDesign || !formData.anodeActiveMaterial || !formData.cathodeActiveMaterial) {
      message.error(t('design.electrode.optimize.messages.fillAllFields'));
      return;
    }

    // 验证 Cathode Dimension 字段（空值检查）
    if (!formData.width || !formData.length) {
      // 通过二次验证设置错误状态，页面会显示错误提示
      const emptyError = validateDimensionParameters({
        width: formData.width,
        length: formData.length,
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
    }, t);

    if (dimensionValidationError) {
      setDimensionError(dimensionValidationError);
      console.error('[OptimizePage] Double-check validation failed');
      return;
    }

    setLoading(true);
    setCalculateError('');
    try {
      const response = await getOptimizeRecommendations(formData, activeSecondaryTarget);
      setRecommendations(response.data);
      setFullResults(response.fullResults);
      setHasCalculated(true);
      setLastCalculatedFormData({ ...formData }); // 保存本次计算的表单数据
      setIsFormModified(false); // 计算完成后，表单未修改
      setIsAdditionalExpanded(false); // 重置折叠状态
      // message.success(t('design.electrode.optimize.messages.calculateSuccess'));
    } catch (error: any) {
      console.error('Calculate error:', error);
      const errorMsg = error?.message || error?.data?.message || t('design.electrode.optimize.messages.calculateError');
      setCalculateError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 处理查看详情
  const handleViewDetails = (record: DesignRecommendation, index: number, isInvalid = false) => {
    // 权限判断：非 enterprise 以上权限，显示会员升级框
    if (!['admin', 'enterprise','enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '')) {
      pricingContext?.setShowUpgradeModal?.(true);
      return;
    }

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

  const trendChartData = useMemo(
    () => mapBackwardResultsToTrendData(fullResults.valid),
    [fullResults.valid],
  );

  const handleDownloadRecommendations = () => {
    downloadRecommendationData({
      type: 'csv',
      data: fullResults.valid,
      t,
    });
  };

  const handleNewDesign = () => {
    // 重置所有状态为默认值
    setFormData({
      cellDesign: DEFAULT_VALUES.cellDesign,
      npRatio: DEFAULT_VALUES.npRatio,
      anodeActiveMaterial: DEFAULT_VALUES.anodeActiveMaterial,
      cathodeActiveMaterial: DEFAULT_VALUES.cathodeActiveMaterial,
      width: '',
      length: '',
      designCapacity: PARAMETER_RANGES.designCapacity.default,
      specificEnergy: PARAMETER_RANGES.specificEnergy.default,
      thickness: PARAMETER_RANGES.thickness.default,
      volumetricEnergyDensity: PARAMETER_RANGES.volumetricEnergyDensity.default,
    });
    setDimensionError('');
    setCalculateError('');
    setCapacityBounds([
      PARAMETER_RANGES.designCapacity.min,
      PARAMETER_RANGES.designCapacity.max,
    ]);
    setSpecificEnergyBounds([
      PARAMETER_RANGES.specificEnergy.min,
      PARAMETER_RANGES.specificEnergy.max,
    ]);
    setRecommendations({ valid: [], invalid: [] });
    setFullResults({ valid: [], invalid: [] });
    setHasCalculated(false);
    setLastCalculatedFormData(null);
    setIsFormModified(false);
    setIsAdditionalExpanded(false);
    setModalVisible(false);
    setActiveSecondaryTarget('specificEnergy');
  };

  return (
    <div className="electrode-optimize-container">
      {/* 标题和返回按钮 */}
      <div className="electrode-optimize-actions">
        <h1 className="electrode-optimize-title">
          {t('design.electrode.optimize.title')}
        </h1>
        <div className="electrode-optimize-right-actions">
          <button className="electrode-optimize-new-btn" onClick={handleNewDesign}>
            {t('design.actions.newDesign', 'New Design')}
          </button>
          <button className="electrode-optimize-back-btn" onClick={() => navigate(-1)}>
            <LeftOutlined style={{ marginRight: 8 }} />
            {t('design.actions.back', 'Back')}
          </button>
        </div>
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
                    onChange={(value) => setFormData((prev) => ({ ...prev, cellDesign: value }))}
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
                    onChange={(value) => setFormData((prev) => ({ ...prev, cathodeActiveMaterial: value }))}
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
                    <Tooltip
                      title={
                        <div className="electrode-material-tooltip">
                          <div className="electrode-material-tooltip__title">
                            {t('design.electrode.materialDescription.title')}
                          </div>
                          <div className="electrode-material-tooltip__composition">
                            <strong>{t('design.electrode.materialDescription.silicon')}</strong> 50.0% (wt%) <strong>{t('design.electrode.materialDescription.carbon')}</strong> 50.0% (wt%)
                          </div>
                          <div className="electrode-material-tooltip__content">
                            {t('design.electrode.materialDescription.description')}
                          </div>
                        </div>
                      }
                      overlayClassName="common-tooltip-overlay"
                    >
                      <div className="tip-icon-container">
                        <Info
                          size={16}
                          className="tip-icon"
                        />
                      </div>
                    </Tooltip>
                  </label>
                  <Select
                    value={formData.anodeActiveMaterial}
                    onChange={(value) => setFormData((prev) => ({ ...prev, anodeActiveMaterial: value }))}
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

              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.width')}
                    <Tooltip
                      title={t('design.electrode.validation.parameterRange', {
                        label: t('design.electrode.optimize.width'),
                        min: dimensionParameterRanges.width.min,
                        max: dimensionParameterRanges.width.max,
                      })}
                      overlayClassName="common-tooltip-overlay"
                    >
                      <div className="tip-icon-container">
                        <Info
                          size={16}
                          className="tip-icon"
                        />
                      </div>
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData((prev) => ({ ...prev, width: e.target.value }))}
                    placeholder={t('design.electrode.optimize.enterWidth')}
                    className="electrode-optimize-input"
                  />
                </div>

                <div className="electrode-optimize-form-item">
                  <label className="electrode-optimize-label">
                    {t('design.electrode.optimize.length')}
                    <Tooltip
                      title={t('design.electrode.validation.parameterRange', {
                        label: t('design.electrode.optimize.length'),
                        min: dimensionParameterRanges.length.min,
                        max: dimensionParameterRanges.length.max,
                      })}
                      overlayClassName="common-tooltip-overlay"
                    >
                      <div className="tip-icon-container">
                        <Info
                          size={16}
                          className="tip-icon"
                        />
                      </div>
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={formData.length}
                    onChange={(e) => setFormData((prev) => ({ ...prev, length: e.target.value }))}
                    placeholder={t('design.electrode.optimize.enterLength')}
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

              <div className="electrode-optimize-form-row">
                <div className="electrode-optimize-parameter-item">
                  <div className="electrode-optimize-parameter-card">
                    <ParameterInput
                      label={`${t('design.electrode.optimize.jellyRollThickness')} (mm)`}
                      mode="range"
                      rangeValue={formData.thickness}
                      onRangeChange={(value) => setFormData((prev) => ({ ...prev, thickness: value }))}
                      min={PARAMETER_RANGES.thickness.min}
                      max={PARAMETER_RANGES.thickness.max}
                      step={PARAMETER_RANGES.thickness.step}
                      minDiff={PARAMETER_RANGES.thickness.minDiff}
                      showBounds
                      singleLine
                      beforeValidate={validateBeforeTargetChange('thickness')}
                    />
                  </div>
                  {targetParameterError && targetParameterErrorAnchor === 'thickness' && (
                    <div className="electrode-optimize-parameter-error-message">
                      {targetParameterError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Targets 分组 */}
            <div className="electrode-optimize-subsection">
              <h3 className="electrode-optimize-subsection-title">
                {t('design.electrode.optimize.targets')}
              </h3>

              {/* 参数滑块 */}
              <div className="electrode-optimize-parameters">
                {/* Row 1: VED 独占整行 */}
                <div className="electrode-optimize-parameters__ved-row">
                  <div className="electrode-optimize-parameter-item">
                    <div className="electrode-optimize-parameter-card">
                      <ParameterInput
                        label={`${t('design.electrode.optimize.volumetricEnergyDensity')} (Wh/L)`}
                        mode="range"
                        rangeValue={formData.volumetricEnergyDensity}
                        onRangeChange={handleVEDChange}
                        min={PARAMETER_RANGES.volumetricEnergyDensity.min}
                        max={PARAMETER_RANGES.volumetricEnergyDensity.max}
                        step={PARAMETER_RANGES.volumetricEnergyDensity.step}
                        minDiff={PARAMETER_RANGES.volumetricEnergyDensity.minDiff}
                        showBounds
                        singleLine
                        beforeValidate={validateBeforeTargetChange('volumetricEnergyDensity')}
                      />
                    </div>
                    {targetParameterError && targetParameterErrorAnchor === 'volumetricEnergyDensity' && (
                      <div className="electrode-optimize-parameter-error-message">
                        {targetParameterError}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: GED 和 Design Capacity */}
                <div className="electrode-optimize-parameters__secondary-row">
                  {/* GED */}
                  <div className="electrode-optimize-parameter-item">
                    <div
                      className={`electrode-optimize-parameter-card electrode-optimize-parameter-card--selectable${activeSecondaryTarget === 'specificEnergy' ? ' electrode-optimize-parameter-card--active' : ''}`}
                      onClick={() => setActiveSecondaryTarget('specificEnergy')}
                    >
                      <span className="electrode-optimize-parameter-card__radio">
                        <span className="electrode-optimize-parameter-card__radio-dot" />
                      </span>
                      <ParameterInput
                        label={`${t('design.electrode.optimize.specificEnergy')} (Wh/kg)`}
                        mode="range"
                        rangeValue={formData.specificEnergy}
                        onRangeChange={(value) => setFormData((prev) => ({ ...prev, specificEnergy: value }))}
                        min={specificEnergyBounds[0]}
                        max={specificEnergyBounds[1]}
                        step={PARAMETER_RANGES.specificEnergy.step}
                        minDiff={PARAMETER_RANGES.specificEnergy.minDiff}
                        disabled={activeSecondaryTarget !== 'specificEnergy'}
                        showBounds
                        singleLine
                        beforeValidate={validateBeforeTargetChange('specificEnergy')}
                      />
                    </div>
                    {targetParameterError && targetParameterErrorAnchor === 'specificEnergy' && (
                      <div className="electrode-optimize-parameter-error-message">
                        {targetParameterError}
                      </div>
                    )}
                  </div>

                  {/* Design Capacity */}
                  <div className="electrode-optimize-parameter-item">
                    <div
                      className={`electrode-optimize-parameter-card electrode-optimize-parameter-card--selectable${activeSecondaryTarget === 'designCapacity' ? ' electrode-optimize-parameter-card--active' : ''}`}
                      onClick={() => setActiveSecondaryTarget('designCapacity')}
                    >
                      <span className="electrode-optimize-parameter-card__radio">
                        <span className="electrode-optimize-parameter-card__radio-dot" />
                      </span>
                      <ParameterInput
                        label={`${t('design.electrode.optimize.designCapacity')} (Ah)`}
                        mode="range"
                        rangeValue={formData.designCapacity}
                        onRangeChange={(value) => setFormData((prev) => ({ ...prev, designCapacity: value }))}
                        min={capacityBounds[0]}
                        max={capacityBounds[1]}
                        step={PARAMETER_RANGES.designCapacity.step}
                        minDiff={PARAMETER_RANGES.designCapacity.minDiff}
                        disabled={activeSecondaryTarget !== 'designCapacity'}
                        showBounds
                        singleLine
                        beforeValidate={validateBeforeTargetChange('designCapacity')}
                      />
                    </div>
                    {targetParameterError && targetParameterErrorAnchor === 'designCapacity' && (
                      <div className="electrode-optimize-parameter-error-message">
                        {targetParameterError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 计算错误提示 */}
            {calculateError && (
              <div className="electrode-optimize-calculate-error">
                {calculateError}
              </div>
            )}

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

            {recommendations.valid.length > 0 && (
              <div className="electrode-optimize-table-toolbar">
                <Button variant="secondary" size="small" onClick={handleDownloadRecommendations}>
                  {t('design.actions.download', 'Download')}
                </Button>
              </div>
            )}

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

            {recommendations.valid.length > 0 && (
              <RecommendationTrendChart data={trendChartData} />
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
        anodeMaterialLabel={getAnodeMaterialLabelByResult(selectedDesign, formData.anodeActiveMaterial)}
        width={formData.width}
        length={formData.length}
        loading={modalLoading}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default OptimizePage;
