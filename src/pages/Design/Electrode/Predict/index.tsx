import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Input } from 'antd';
import Button from '@/components/Button';
import ParameterInput from './components/ParameterInput';
import ResultDisplay from './components/ResultDisplay';
import * as electrodeModel from '../model';
import {
  validateElectrodeParameters,
  validateCathodeParameters,
  validateAnodeParameters,
  validateDimensionParameters,
  cathodeParameterRanges,
  anodeParameterRanges,
  dimensionParameterRanges,
} from '../validation';
import { useDebounce } from '@/hooks/useDebounce';
import './index.less';

const { Option } = Select;

const PredictPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 表单状态
  const [cellDesign, setCellDesign] = useState('Balanced');
  const [npRatio, setNpRatio] = useState('1.07');
  const [anodeActiveMaterial, setAnodeActiveMaterial] = useState('12% Si');
  const [cathodeActiveMaterial, setCathodeActiveMaterial] = useState('NCM811');

  // 阳极参数 - 重命名为描述性名称
  const [anodeCMC, setAnodeCMC] = useState(1.52);                 // 原 anodeBinder1
  const [anodeSBR, setAnodeSBR] = useState(2.21);                 // 原 anodeBinder2
  const [anodePAA, setAnodePAA] = useState(2.33);                 // 原 anodeBinder3
  const [anodeSuperP, setAnodeSuperP] = useState(1.4);            // 原 anodeConductiveCarbon (KS-6)
  const [anodeSWCNT, setAnodeSWCNT] = useState(0.41);             // 原 anodeCNT
  const [anodePressDensity, setAnodePressDensity] = useState(1.5); // 保持不变
  const [anodeSCBI, setAnodeSCBI] = useState(0);                  // 新增 - 计算字段
  const [anodeGrSI, setAnodeGrSI] = useState(0);                  // 新增 - 计算字段
  const [anodeArealLoading, setAnodeArealLoading] = useState(0);  // 新增 - 输入字段（由 cathode loading 计算）

  // 阴极参数 - 重命名为描述性名称
  const [cathodeKF9700, setCathodeKF9700] = useState(1.24);       // 原 cathodeBinder1
  const [cathodeCN01Y, setCathodeCN01Y] = useState(0.5);          // 原 cathodeCNT
  const [cathodeSuperC65, setCathodeSuperC65] = useState(2.04);   // 原 cathodeConductiveCarbon (CB)
  const [cathodeArealLoading, setCathodeArealLoading] = useState(2.93); // 保持不变
  const [cathodePressDensity, setCathodePressDensity] = useState(3.52); // 保持不变
  const [cathodeNCMA, setCathodeNCMA] = useState(0);              // 新增 - 计算字段

  // 尺寸参数
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [layers, setLayers] = useState('');

  // Loading 状态
  const [loading, setLoading] = useState(false);

  // 预测结果（初始值设为 null，等待计算）
  const [results, setResults] = useState<electrodeModel.ElectrodeModelResult | null>(null);

  // 错误状态
  const [cathodeError, setCathodeError] = useState<string>('');
  const [anodeError, setAnodeError] = useState<string>('');
  const [dimensionError, setDimensionError] = useState<string>('');

  // ============ 防抖值 - 用于优化实时验证性能 ============

  // Cathode 可编辑字段防抖（5个）
  const debouncedCathodeKF9700 = useDebounce(cathodeKF9700, 300);
  const debouncedCathodeCN01Y = useDebounce(cathodeCN01Y, 300);
  const debouncedCathodeSuperC65 = useDebounce(cathodeSuperC65, 300);
  const debouncedCathodeArealLoading = useDebounce(cathodeArealLoading, 300);
  const debouncedCathodePressDensity = useDebounce(cathodePressDensity, 300);
  // cathodeNCMA 是计算字段，不需要防抖

  // Anode 可编辑字段防抖（6个）
  const debouncedAnodeCMC = useDebounce(anodeCMC, 300);
  const debouncedAnodeSBR = useDebounce(anodeSBR, 300);
  const debouncedAnodePAA = useDebounce(anodePAA, 300);
  const debouncedAnodeSuperP = useDebounce(anodeSuperP, 300);
  const debouncedAnodeSWCNT = useDebounce(anodeSWCNT, 300);
  const debouncedAnodePressDensity = useDebounce(anodePressDensity, 300);
  // anodeSCBI、anodeGrSI、anodeArealLoading 是计算字段，不需要防抖

  // Dimension 字段防抖（3个）
  const debouncedWidth = useDebounce(width, 300);
  const debouncedLength = useDebounce(length, 300);
  const debouncedLayers = useDebounce(layers, 300);

  // 根据 Cell Design 设置 NP Ratio 默认值
  useEffect(() => {
    if (cellDesign === 'Balanced') {
      setNpRatio('1.07');
    } else if (cellDesign === 'High Energy') {
      setNpRatio('1.05'); // 示例值，根据实际需求调整
    } else if (cellDesign === 'High Power') {
      setNpRatio('1.10'); // 示例值，根据实际需求调整
    }
  }, [cellDesign]);

  // 联动逻辑1: Cathode的Active material NCM-A = 100 - (KF-9700 + CN-01Y + Super C65)
  useEffect(() => {
    const calculatedNCMA = 100 - (cathodeKF9700 + cathodeCN01Y + cathodeSuperC65);
    setCathodeNCMA(Number(calculatedNCMA.toFixed(2)));
  }, [cathodeKF9700, cathodeCN01Y, cathodeSuperC65]);

  // 联动逻辑2: Anode的Active material = 100 - (CMC + SBR + PAA + Super P + SWCNT)
  // Active material-1 (SC-B-I) = 计算值 × 12%
  // Active material-2 (Gr-S-I) = 计算值 × 88%
  useEffect(() => {
    const totalActiveMaterial = 100 - (anodeCMC + anodeSBR + anodePAA + anodeSuperP + anodeSWCNT);
    const scbi = totalActiveMaterial * 0.12;
    const grsi = totalActiveMaterial * 0.88;
    
    setAnodeSCBI(Number(scbi.toFixed(2)));
    setAnodeGrSI(Number(grsi.toFixed(2)));
  }, [anodeCMC, anodeSBR, anodePAA, anodeSuperP, anodeSWCNT]);

  // 联动逻辑3: Anode的Areal Loading = cathode_loading / 0.9142 * 1.07 * 0.878，保留两位小数
  useEffect(() => {
    const calculatedAnodeLoading = (cathodeArealLoading / 0.9142) * 1.07 * 0.878;
    setAnodeArealLoading(Number(calculatedAnodeLoading.toFixed(2)));
  }, [cathodeArealLoading]);

  // ============ 实时验证 useEffect ============

  // 实时验证 Cathode 参数
  useEffect(() => {
    // 构建 cathode 参数对象
    const cathodeParams = {
      cathodeActiveMaterial,
      cathodeKF9700: debouncedCathodeKF9700,
      cathodeCN01Y: debouncedCathodeCN01Y,
      cathodeSuperC65: debouncedCathodeSuperC65,
      cathodeArealLoading: debouncedCathodeArealLoading,
      cathodePressDensity: debouncedCathodePressDensity,
    };

    // 执行验证
    const error = validateCathodeParameters(cathodeParams, t);

    // 更新错误状态（null 转为空字符串）
    setCathodeError(error || '');
  }, [
    cathodeActiveMaterial,
    debouncedCathodeKF9700,
    debouncedCathodeCN01Y,
    debouncedCathodeSuperC65,
    debouncedCathodeArealLoading,
    debouncedCathodePressDensity,
    t,
  ]);

  // 实时验证 Anode 参数
  useEffect(() => {
    // 构建 anode 参数对象
    const anodeParams = {
      anodeActiveMaterial,
      anodeCMC: debouncedAnodeCMC,
      anodeSBR: debouncedAnodeSBR,
      anodePAA: debouncedAnodePAA,
      anodeSuperP: debouncedAnodeSuperP,
      anodeSWCNT: debouncedAnodeSWCNT,
      anodePressDensity: debouncedAnodePressDensity,
    };

    // 执行验证
    const error = validateAnodeParameters(anodeParams, t);

    // 更新错误状态
    setAnodeError(error || '');
  }, [
    anodeActiveMaterial,
    debouncedAnodeCMC,
    debouncedAnodeSBR,
    debouncedAnodePAA,
    debouncedAnodeSuperP,
    debouncedAnodeSWCNT,
    debouncedAnodePressDensity,
    t,
  ]);

  // 实时验证 Dimension 参数
  useEffect(() => {
    // 如果 dimension 字段都为空（初始状态），则不进行验证
    // 只有用户开始输入后才进行实时验证
    if (!debouncedWidth && !debouncedLength && !debouncedLayers) {
      return;
    }

    // 构建 dimension 参数对象
    const dimensionParams = {
      width: debouncedWidth,
      length: debouncedLength,
      layers: debouncedLayers,
    };

    // 执行验证
    const error = validateDimensionParameters(dimensionParams, t);

    // 更新错误状态
    setDimensionError(error || '');
  }, [
    debouncedWidth,
    debouncedLength,
    debouncedLayers,
    t,
  ]);

  // 使用统一的默认参数范围（不根据材料动态调整）
  const cathodeRanges = cathodeParameterRanges;
  const anodeRanges = anodeParameterRanges;

  const handleCalculate = async () => {
    // 首先检查实时验证的错误状态
    // 如果存在任何错误，直接返回，不执行计算
    if (cathodeError || anodeError || dimensionError) {
      console.warn('[PredictPage] Validation failed:', {
        cathodeError,
        anodeError,
        dimensionError,
      });
      return;
    }

    // 二次验证（防御性编程，确保数据一致性）
    // 这是为了防止状态异步更新导致的问题
    const validationResult = validateElectrodeParameters({
      cathodeActiveMaterial,
      cathodeKF9700,
      cathodeCN01Y,
      cathodeSuperC65,
      cathodeArealLoading,
      cathodePressDensity,
      anodeActiveMaterial,
      anodeCMC,
      anodeSBR,
      anodePAA,
      anodeSuperP,
      anodeSWCNT,
      anodePressDensity,
      width,
      length,
      layers,
    }, t);

    // 如果二次验证失败，更新错误状态
    if (!validationResult.isValid) {
      if (validationResult.errors.cathode) {
        setCathodeError(validationResult.errors.cathode);
      }
      if (validationResult.errors.anode) {
        setAnodeError(validationResult.errors.anode);
      }
      if (validationResult.errors.dimension) {
        setDimensionError(validationResult.errors.dimension);
      }
      console.error('[PredictPage] Double-check validation failed');
      return;
    }

    // 构建 model params（打平的结构）
    const modelParams: electrodeModel.ElectrodeModelParams = {
      anodeCMC,              // 重命名
      anodeSBR,              // 重命名
      anodePAA,              // 重命名
      anodeSuperP,           // 重命名
      anodeSWCNT,            // 重命名
      anodePressDensity,     // 保持不变
      anodeSCBI,             // 新增
      anodeGrSI,             // 新增
      anodeArealLoading,     // 新增
      cathodeKF9700,         // 重命名
      cathodeCN01Y,          // 重命名
      cathodeSuperC65,       // 重命名
      cathodeArealLoading,   // 保持不变
      cathodePressDensity,   // 保持不变
      cathodeNCMA,           // 新增
      width: parseFloat(width),
      length: parseFloat(length),
      layers: parseInt(layers, 10),
    };

    // 构建 API 请求参数
    const requestParams = electrodeModel.buildPredictParams(
      {
        cellDesign,
        npRatio,
        cathodeActiveMaterial,
        anodeActiveMaterial,
        modelParams,
      },
      electrodeModel.PageType.RESULT_PREDICTION,
    );

    setLoading(true);
    try {
      const response = await electrodeModel.predictElectrodePerformance(requestParams);
      setResults(response.model_result);
    } catch (error) {
      // 将API错误显示在dimension区域（或者可以根据错误类型分配到不同区域）
      setDimensionError(t('design.electrode.predict.calculateError', 'Failed to calculate prediction'));
      console.error('[PredictPage] Calculate error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
                  value={cellDesign}
                  onChange={setCellDesign}
                  placeholder={t('design.electrode.predict.selectCellDesign', 'Select cell design')}
                  className="electrode-predict-select"
                >
                  <Option value="Balanced">Balanced</Option>
                  <Option value="High Energy" disabled>High Energy</Option>
                  <Option value="High Power" disabled>High Power</Option>               
                </Select>
              </div>

              <div className="electrode-predict-form-item">
                <label className="electrode-predict-label">
                  {t('design.electrode.predict.npRatio', 'NP Ratio')}
                </label>
                <Input
                  disabled={true}
                  type="number"
                  value={npRatio}
                  onChange={(e) => setNpRatio(e.target.value)}
                  placeholder={t('design.electrode.predict.enterNpRatio', 'Enter NP ratio')}
                  step={0.01}
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
                value={cathodeActiveMaterial}
                onChange={setCathodeActiveMaterial}
                  placeholder={t('design.electrode.predict.selectMaterial', 'Select material')}
                  className="electrode-predict-select"
                >
                  <Option value="NCM811">NCM811</Option>
                  <Option value="NCM622" disabled>NCM622</Option>
                  <Option value="LFP" disabled>LFP</Option>
                </Select>

                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.cathodeParameters', 'Cathode Parameters')}
                </h3>

                <div className="electrode-predict-parameters-container">
                <ParameterInput
                  label={t('design.electrode.predict.kf9700', 'KF-9700 (wt.%)')}
                  value={cathodeKF9700}
                  onChange={setCathodeKF9700}
                  min={cathodeRanges.cathodeKF9700?.min}
                  max={cathodeRanges.cathodeKF9700?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.cn01y', 'CN-01Y (wt.%)')}
                  value={cathodeCN01Y}
                  onChange={setCathodeCN01Y}
                  min={cathodeRanges.cathodeCN01Y?.min}
                  max={cathodeRanges.cathodeCN01Y?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.superC65', 'Super C65 (wt.%)')}
                  value={cathodeSuperC65}
                  onChange={setCathodeSuperC65}
                  min={cathodeRanges.cathodeSuperC65?.min}
                  max={cathodeRanges.cathodeSuperC65?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.cathodeActiveMaterialLabel', 'Active material NCM-A (%)')}
                  value={cathodeNCMA}
                  onChange={setCathodeNCMA}
                  min={0}
                  max={100}
                  disabled={true}  // 置灰 - 计算字段
                />
                <ParameterInput
                  label={t('design.electrode.predict.arealLoading', 'Areal Loading (mAh/cm²)')}
                  value={cathodeArealLoading}
                  onChange={setCathodeArealLoading}
                  min={cathodeRanges.cathodeArealLoading?.min}
                  max={cathodeRanges.cathodeArealLoading?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                  value={cathodePressDensity}
                  onChange={setCathodePressDensity}
                  min={cathodeRanges.cathodePressDensity?.min}
                  max={cathodeRanges.cathodePressDensity?.max}
                />
                </div>
                
                {/* 阴极错误提示 */}
                {cathodeError && (
                  <div className="electrode-predict-error-message">
                    {cathodeError}
                  </div>
                )}
              </div>

              {/* 阳极区域 */}
              <div className="electrode-predict-electrode-section">
                <label className="electrode-predict-label">
                {t('design.electrode.predict.anodeActiveMaterial', 'Anode Active Material')}
              </label>
              <Select
                value={anodeActiveMaterial}
                onChange={setAnodeActiveMaterial}
                  placeholder={t('design.electrode.predict.selectMaterial', 'Select material')}
                  className="electrode-predict-select"
                >
                  <Option value="12% Si">12% Si</Option>
                  <Option value="30% Si" disabled>30% Si</Option>
                  <Option value="Si" disabled>Si</Option>
                  <Option value="Gr" disabled>Gr</Option>                
                </Select>

                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.anodeParameters', 'Anode Parameters')}
                </h3>

                <div className="electrode-predict-parameters-container">
                <ParameterInput
                  label={t('design.electrode.predict.cmc', 'CMC (wt.%)')}
                  value={anodeCMC}
                  onChange={setAnodeCMC}
                  min={anodeRanges.anodeCMC?.min}
                  max={anodeRanges.anodeCMC?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.sbr', 'SBR (wt.%)')}
                  value={anodeSBR}
                  onChange={setAnodeSBR}
                  min={anodeRanges.anodeSBR?.min}
                  max={anodeRanges.anodeSBR?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.paa', 'PAA (wt.%)')}
                  value={anodePAA}
                  onChange={setAnodePAA}
                  min={anodeRanges.anodePAA?.min}
                  max={anodeRanges.anodePAA?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.superP', 'Super P (wt.%)')}
                  value={anodeSuperP}
                  onChange={setAnodeSuperP}
                  min={anodeRanges.anodeSuperP?.min}
                  max={anodeRanges.anodeSuperP?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.swcnt', 'SWCNT (wt.%)')}
                  value={anodeSWCNT}
                  onChange={setAnodeSWCNT}
                  min={anodeRanges.anodeSWCNT?.min}
                  max={anodeRanges.anodeSWCNT?.max}
                />
                <ParameterInput
                  label={t('design.electrode.predict.activeMaterial1', 'Active material-1 SC-B-I (%)')}
                  value={anodeSCBI}
                  onChange={setAnodeSCBI}
                  min={0}
                  max={100}
                  disabled={true}  // 置灰 - 计算字段
                />
                <ParameterInput
                  label={t('design.electrode.predict.activeMaterial2', 'Active material-2 Gr-S-I (%)')}
                  value={anodeGrSI}
                  onChange={setAnodeGrSI}
                  min={0}
                  max={100}
                  disabled={true}  // 置灰 - 计算字段
                />
                <ParameterInput
                  label={t('design.electrode.predict.anodeArealLoading', 'Areal Loading (mAh/cm²)')}
                  value={anodeArealLoading}
                  onChange={setAnodeArealLoading}
                  min={anodeRanges.anodeArealLoading?.min}
                  max={anodeRanges.anodeArealLoading?.max}
                  disabled={true}  // 置灰 - 计算字段
                />
                <ParameterInput
                  label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                  value={anodePressDensity}
                  onChange={setAnodePressDensity}
                  min={anodeRanges.anodePressDensity?.min}
                  max={anodeRanges.anodePressDensity?.max}
                />
                </div>
                
                {/* 阳极错误提示 */}
                {anodeError && (
                  <div className="electrode-predict-error-message">
                    {anodeError}
                  </div>
                )}
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
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                    placeholder={t('design.electrode.predict.enterWidth', 'Enter width')}
                    min={dimensionParameterRanges.width.min}
                    max={dimensionParameterRanges.width.max}
                  />
                </div>
                <div className="electrode-predict-dimension-item">
                  <label className="electrode-predict-label-small">
                  {t('design.electrode.predict.length', 'Length (mm)')}
                </label>
                <Input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                    placeholder={t('design.electrode.predict.enterLength', 'Enter length')}
                    min={dimensionParameterRanges.length.min}
                    max={dimensionParameterRanges.length.max}
                  />
                </div>
                <div className="electrode-predict-dimension-item">
                  <label className="electrode-predict-label-small">
                  {t('design.electrode.predict.layers', 'Layers')}
                </label>
                <Input
                  type="number"
                  value={layers}
                  onChange={(e) => setLayers(e.target.value)}
                    placeholder={t('design.electrode.predict.enterLayers', 'Enter layers')}
                    min={dimensionParameterRanges.layers.min}
                    max={dimensionParameterRanges.layers.max}
                  />
                </div>
              </div>
              
              {/* 尺寸错误提示 */}
              {dimensionError && (
                <div className="electrode-predict-error-message">
                  {dimensionError}
                </div>
              )}
            </div>

            {/* Calculate 按钮 */}
            <div className="electrode-predict-calculate-btn-wrapper">
              <Button
                variant="primary"
                size="large"
                onClick={handleCalculate}
                loading={loading}
                className="electrode-predict-calculate-btn"
              >
                {t('design.electrode.predict.calculate', 'Calculate')}
              </Button>
            </div>
          </div>
        </div>

        {/* Cell Performance Prediction 部分 - 仅在有结果时显示 */}
        {results && (
          <div className="electrode-predict-section">
            <h2 className="electrode-predict-section-title">
              {t('design.electrode.predict.cellPerformance', 'Cell Performance Prediction')}
            </h2>

            <div className="electrode-predict-results-container">
              <div className="electrode-predict-results-grid">
                <ResultDisplay
                  label={t('design.electrode.predict.designCapacity', 'Design Capacity')}
                  value={results.designCapacity}
                  unit="Ah"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.specificED', 'Specific E.D.')}
                  value={results.specificED}
                  unit="Wh/kg"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.jellyRollThickness', 'Jelly Roll Thickness')}
                  value={results.jellyRollThickness}
                  unit="mm"
                />
                <ResultDisplay
                  label={t('design.electrode.predict.volumetricED', 'Volumetric E.D.')}
                  value={results.volumetricED}
                  unit="Wh/L"
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;