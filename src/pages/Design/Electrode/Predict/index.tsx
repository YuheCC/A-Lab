import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { LeftOutlined } from '@ant-design/icons';
import { Select, Input } from 'antd';
import Button from '@/components/Button';
import ParameterInput from './components/ParameterInput';
import ResultDisplay from './components/ResultDisplay';
import RateCapabilityChart from './components/RateCapabilityChart';
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
import {
  CELL_DESIGN_OPTIONS,
  CATHODE_ACTIVE_MATERIAL_OPTIONS,
  DEFAULT_VALUES,
} from '../constants';
import { useDebounce } from '@/hooks/useDebounce';
import './index.less';

const { Option } = Select;

const PredictPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 表单状态
  const [cellDesign, setCellDesign] = useState(DEFAULT_VALUES.cellDesign);
  const [npRatio, setNpRatio] = useState(DEFAULT_VALUES.npRatio);
  // graphitePercent: Anode Active Material Graphite (%)，范围 85-100 整数
  // siRatio = 100 - graphitePercent，作为 si_ratio 字段发给后端
  const [graphitePercent, setGraphitePercent] = useState(88);
  const [cathodeActiveMaterial, setCathodeActiveMaterial] = useState(DEFAULT_VALUES.cathodeActiveMaterial);

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

  // 电解液参数
  const [electrolyteContent, setElectrolyteContent] = useState(2.322); // 电解液含量 (g/Ah)

  // 尺寸参数
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');

  // Loading 状态
  const [loading, setLoading] = useState(false);

  // 预测结果（初始值设为 null，等待计算）
  const [results, setResults] = useState<electrodeModel.ElectrodeModelResult | null>(null);

  // 表单修改状态
  const [lastCalculatedFormData, setLastCalculatedFormData] = useState<any>(null);
  const [isFormModified, setIsFormModified] = useState(false);

  // 错误状态
  const [npRatioError, setNpRatioError] = useState<string>('');
  const [graphiteError, setGraphiteError] = useState<string>('');
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

  // Dimension 字段防抖
  const debouncedWidth = useDebounce(width, 300);
  const debouncedLength = useDebounce(length, 300);

  const debouncedNpRatio = useDebounce(npRatio, 300);
  const debouncedGraphitePercent = useDebounce(graphitePercent, 300);

  // 实时验证 NP Ratio（范围 1.05-1.2）
  useEffect(() => {
    const val = parseFloat(debouncedNpRatio);
    if (isNaN(val) || debouncedNpRatio === '') {
      setNpRatioError(t('design.electrode.validation.npRatioRequired', 'NP Ratio is required'));
    } else if (val < 1.05 || val > 1.2) {
      setNpRatioError(t('design.electrode.validation.npRatioRange', 'NP Ratio must be between 1.05 and 1.2'));
    } else {
      setNpRatioError('');
    }
  }, [debouncedNpRatio, t]);

  // 实时验证 Graphite Percent（范围 85-100 整数）
  useEffect(() => {
    const val = debouncedGraphitePercent;
    if (!Number.isInteger(val) || val < 85 || val > 100) {
      setGraphiteError(t('design.electrode.validation.graphitePercentRange', 'Graphite content must be an integer between 85 and 100'));
    } else {
      setGraphiteError('');
    }
  }, [debouncedGraphitePercent, t]);

  // 联动逻辑1: Cathode的Active material NCM-A = 100 - (KF-9700 + CN-01Y + Super C65)
  useEffect(() => {
    const calculatedNCMA = 100 - (cathodeKF9700 + cathodeCN01Y + cathodeSuperC65);
    setCathodeNCMA(Number(calculatedNCMA.toFixed(2)));
  }, [cathodeKF9700, cathodeCN01Y, cathodeSuperC65]);

  // 联动逻辑2: Anode的Active material = 100 - (CMC + SBR + PAA + Super P + SWCNT)
  // Active material-1 (SC-B-I) = 计算值 × siRatio%（= 100 - graphitePercent）
  // Active material-2 (Gr-S-I) = 计算值 × graphitePercent%
  useEffect(() => {
    const siRatio = 100 - graphitePercent;
    const totalActiveMaterial = 100 - (anodeCMC + anodeSBR + anodePAA + anodeSuperP + anodeSWCNT);
    const scbi = totalActiveMaterial * (siRatio / 100);
    const grsi = totalActiveMaterial * (graphitePercent / 100);
    
    setAnodeSCBI(Number(scbi.toFixed(2)));
    setAnodeGrSI(Number(grsi.toFixed(2)));
  }, [anodeCMC, anodeSBR, anodePAA, anodeSuperP, anodeSWCNT, graphitePercent]);

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

    // 执行验证（实时验证跳过空值检查，只检查范围和业务规则）
    const error = validateCathodeParameters(cathodeParams, t, { skipEmptyCheck: true });

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
      anodeCMC: debouncedAnodeCMC,
      anodeSBR: debouncedAnodeSBR,
      anodePAA: debouncedAnodePAA,
      anodeSuperP: debouncedAnodeSuperP,
      anodeSWCNT: debouncedAnodeSWCNT,
      anodePressDensity: debouncedAnodePressDensity,
    };

    // 执行验证（实时验证跳过空值检查，只检查范围和业务规则）
    const error = validateAnodeParameters(anodeParams, t, { skipEmptyCheck: true });

    // 更新错误状态
    setAnodeError(error || '');
  }, [
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

  // 使用统一的默认参数范围（不根据材料动态调整）
  const cathodeRanges = cathodeParameterRanges;
  const anodeRanges = anodeParameterRanges;

  // 监听表单数据变化，判断是否与上次计算的数据不同
  useEffect(() => {
    if (!lastCalculatedFormData) {
      // 如果还没有计算过，表单未修改
      setIsFormModified(false);
      return;
    }

    // 构建当前表单数据对象
    const currentFormData = {
      cellDesign,
      npRatio,
      graphitePercent,
      cathodeActiveMaterial,
      anodeCMC,
      anodeSBR,
      anodePAA,
      anodeSuperP,
      anodeSWCNT,
      anodePressDensity,
      cathodeKF9700,
      cathodeCN01Y,
      cathodeSuperC65,
      cathodeArealLoading,
      cathodePressDensity,
      width,
      length,
    };

    // 比较当前表单数据与上次计算的数据
    const isModified = JSON.stringify(currentFormData) !== JSON.stringify(lastCalculatedFormData);
    
    // 如果表单被修改，清空结果数据（即使用户改回原值，结果也不会重新显示）
    if (isModified) {
      setResults(null);
    }
    
    setIsFormModified(isModified);
  }, [
    cellDesign,
    npRatio,
    graphitePercent,
    cathodeActiveMaterial,
    anodeCMC,
    anodeSBR,
    anodePAA,
    anodeSuperP,
    anodeSWCNT,
    anodePressDensity,
    cathodeKF9700,
    cathodeCN01Y,
    cathodeSuperC65,
    cathodeArealLoading,
    cathodePressDensity,
    width,
    length,
    lastCalculatedFormData,
  ]);

  const handleCalculate = async () => {
    let hasError = false;

    // NP Ratio 验证
    const npVal = parseFloat(npRatio);
    if (isNaN(npVal) || npRatio === '') {
      setNpRatioError(t('design.electrode.validation.npRatioRequired', 'NP Ratio is required'));
      hasError = true;
    } else if (npVal < 1.05 || npVal > 1.2) {
      setNpRatioError(t('design.electrode.validation.npRatioRange', 'NP Ratio must be between 1.05 and 1.2'));
      hasError = true;
    }

    // Graphite Percent 验证
    if (isNaN(graphitePercent) || graphitePercent < 85 || graphitePercent > 100 || !Number.isInteger(graphitePercent)) {
      setGraphiteError(t('design.electrode.validation.graphiteRange', 'Graphite content must be an integer between 85 and 100'));
      hasError = true;
    }

    // 电极参数验证（包含空值检查和范围检查）
    const validationResult = validateElectrodeParameters({
      cathodeActiveMaterial,
      cathodeKF9700,
      cathodeCN01Y,
      cathodeSuperC65,
      cathodeArealLoading,
      cathodePressDensity,
      anodeCMC,
      anodeSBR,
      anodePAA,
      anodeSuperP,
      anodeSWCNT,
      anodePressDensity,
      width,
      length,
    }, t);

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
      hasError = true;
    }

    if (hasError) {
      return;
    }

    // 构建 model params（打平的结构）
    const modelParams: electrodeModel.ElectrodeModelParams = {
      anodeCMC,
      anodeSBR,
      anodePAA,
      anodeSuperP,
      anodeSWCNT,
      anodePressDensity,
      anodeSCBI,
      anodeGrSI,
      anodeArealLoading,
      cathodeKF9700,
      cathodeCN01Y,
      cathodeSuperC65,
      cathodeArealLoading,
      cathodePressDensity,
      cathodeNCMA,
      width: parseFloat(width),
      length: parseFloat(length),
      layers: 0,
      npRatio: parseFloat(npRatio),
      siRatio: graphitePercent,// 算法侧使用的是siratio命名，但是用的是石墨含量，暂时先hook，后期更改
    };

    const requestParams = electrodeModel.buildPredictParams(
      {
        cellDesign,
        cathodeActiveMaterial,
        modelParams,
      },
      electrodeModel.PageType.RESULT_PREDICTION,
    );

    setLoading(true);
    try {
      const response = await electrodeModel.predictElectrodePerformance(requestParams);
      setResults(response.model_result);

      // 保存本次计算的表单数据
      setLastCalculatedFormData({
        cellDesign,
        npRatio,
        graphitePercent,
        cathodeActiveMaterial,
        anodeCMC,
        anodeSBR,
        anodePAA,
        anodeSuperP,
        anodeSWCNT,
        anodePressDensity,
        cathodeKF9700,
        cathodeCN01Y,
        cathodeSuperC65,
        cathodeArealLoading,
        cathodePressDensity,
        width,
        length,
      });
      setIsFormModified(false); // 计算完成后，表单未修改
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

  const handleNewPrediction = () => {
    // 重置所有表单状态为默认值
    setCellDesign(DEFAULT_VALUES.cellDesign);
    setNpRatio(DEFAULT_VALUES.npRatio);
    setGraphitePercent(88);
    setCathodeActiveMaterial(DEFAULT_VALUES.cathodeActiveMaterial);
    
    // 重置阳极参数
    const defaultAnodeCMC = 1.52;
    const defaultAnodeSBR = 2.21;
    const defaultAnodePAA = 2.33;
    const defaultAnodeSuperP = 1.4;
    const defaultAnodeSWCNT = 0.41;
    
    setAnodeCMC(defaultAnodeCMC);
    setAnodeSBR(defaultAnodeSBR);
    setAnodePAA(defaultAnodePAA);
    setAnodeSuperP(defaultAnodeSuperP);
    setAnodeSWCNT(defaultAnodeSWCNT);
    setAnodePressDensity(1.5);
    
    // 计算阳极活性物质的默认值
    const totalActiveMaterial = 100 - (defaultAnodeCMC + defaultAnodeSBR + defaultAnodePAA + defaultAnodeSuperP + defaultAnodeSWCNT);
    const defaultAnodeSCBI = Number((totalActiveMaterial * 0.12).toFixed(2));
    const defaultAnodeGrSI = Number((totalActiveMaterial * 0.88).toFixed(2));
    setAnodeSCBI(defaultAnodeSCBI);
    setAnodeGrSI(defaultAnodeGrSI);
    
    // 重置阴极参数
    const defaultCathodeKF9700 = 1.24;
    const defaultCathodeCN01Y = 0.5;
    const defaultCathodeSuperC65 = 2.04;
    const defaultCathodeArealLoading = 2.93;
    
    setCathodeKF9700(defaultCathodeKF9700);
    setCathodeCN01Y(defaultCathodeCN01Y);
    setCathodeSuperC65(defaultCathodeSuperC65);
    setCathodeArealLoading(defaultCathodeArealLoading);
    setCathodePressDensity(3.52);
    
    // 计算阴极活性物质的默认值
    const defaultCathodeNCMA = Number((100 - (defaultCathodeKF9700 + defaultCathodeCN01Y + defaultCathodeSuperC65)).toFixed(2));
    setCathodeNCMA(defaultCathodeNCMA);
    
    // 计算阳极面载量的默认值
    const defaultAnodeArealLoading = Number(((defaultCathodeArealLoading / 0.9142) * 1.07 * 0.878).toFixed(2));
    setAnodeArealLoading(defaultAnodeArealLoading);
    
    // 重置电解液参数
    setElectrolyteContent(2.322);
    
    // 重置尺寸参数
    setWidth('');
    setLength('');
    
    // 重置结果和错误状态
    setResults(null);
    setLastCalculatedFormData(null);
    setIsFormModified(false);
    setNpRatioError('');
    setGraphiteError('');
    setCathodeError('');
    setAnodeError('');
    setDimensionError('');
  };

  return (
    <div className="electrode-predict-container">
      {/* 页面标题和返回按钮 */}
      <div className="electrode-predict-actions">
        <h1 className="electrode-predict-title">
          {t('design.electrode.predict.title', 'Result Prediction')}
        </h1>
        <div className="electrode-predict-right-actions">
          <button className="electrode-predict-new-btn" onClick={handleNewPrediction}>
            {t('design.actions.newPrediction', 'New Prediction')}
          </button>
          <button className="electrode-predict-back-btn" onClick={handleGoBack}>
            <LeftOutlined style={{ marginRight: 8 }} />
            {t('design.actions.back', 'Back')}
          </button>
        </div>
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
            {/* 4 个基础输入项：2x2 网格 */}
            <div className="electrode-predict-basic-grid">
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

              <div className="electrode-predict-form-item">
                <label className="electrode-predict-label">
                  {t('design.electrode.predict.npRatio', 'NP Ratio')}
                </label>
                <Input
                  type="number"
                  value={npRatio}
                  onChange={(e) => setNpRatio(e.target.value)}
                  placeholder={t('design.electrode.predict.enterNpRatio', 'Enter NP ratio')}
                  step={0.01}
                  min={1.05}
                  max={1.2}
                  className="electrode-predict-input"
                />
                {npRatioError && (
                  <div className="electrode-predict-error-message" style={{ marginTop: 4 }}>
                    {npRatioError}
                  </div>
                )}
              </div>

              <div className="electrode-predict-form-item">
                <label className="electrode-predict-label">
                  {t('design.electrode.predict.cathodeActiveMaterial', 'Cathode Active Material')}
                </label>
                <Select
                  value={cathodeActiveMaterial}
                  onChange={setCathodeActiveMaterial}
                  placeholder={t('design.electrode.predict.selectMaterial', 'Select material')}
                  className="electrode-predict-select"
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

              <div className="electrode-predict-form-item">
                <label className="electrode-predict-label">
                  {t('design.electrode.predict.anodeActiveMaterialGraphite', 'Anode Active Material Graphite (%)')}
                </label>
                <Input
                  type="number"
                  value={graphitePercent}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setGraphitePercent(val);
                  }}
                  placeholder={t('design.electrode.predict.enterGraphitePercent', 'Enter graphite content')}
                  min={85}
                  max={100}
                  step={1}
                  className="electrode-predict-input"
                />
                {graphiteError && (
                  <div className="electrode-predict-error-message" style={{ marginTop: 4 }}>
                    {graphiteError}
                  </div>
                )}
              </div>
            </div>

            {/* 阴极和阳极参数并排 */}
            <div className="electrode-predict-electrode-grid">
              {/* 阴极区域 */}
              <div className="electrode-predict-electrode-section">
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
                    label={t('design.electrode.predict.cathodeActiveMaterialLabel', 'Active Material NCM-A (%)')}
                    value={cathodeNCMA}
                    onChange={setCathodeNCMA}
                    min={0}
                    max={100}
                    disabled={true}
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
                
                {cathodeError && (
                  <div className="electrode-predict-error-message">
                    {cathodeError}
                  </div>
                )}

                <h3 className="electrode-predict-subsection-title">
                  {t('design.electrode.predict.electrolyteParameters', 'Electrolyte Parameters')}
                </h3>

                <div className="electrode-predict-parameters-container">
                  <ParameterInput
                    label={t('design.electrode.predict.electrolyteContent', 'Electrolyte Content (g/Ah)')}
                    value={electrolyteContent}
                    onChange={setElectrolyteContent}
                    min={0}
                    disabled={true}
                    max={2.322}
                  />
                </div>
              </div>

              {/* 阳极区域 */}
              <div className="electrode-predict-electrode-section">
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
                    label={t('design.electrode.predict.activeMaterial1', 'Active Material-1 SC-B-I (%)')}
                    value={anodeSCBI}
                    onChange={setAnodeSCBI}
                    min={0}
                    max={100}
                    disabled={true}
                  />
                  <ParameterInput
                    label={t('design.electrode.predict.activeMaterial2', 'Active Material-2 Gr-S-I (%)')}
                    value={anodeGrSI}
                    onChange={setAnodeGrSI}
                    min={0}
                    max={100}
                    disabled={true}
                  />
                  <ParameterInput
                    label={t('design.electrode.predict.anodeArealLoading', 'Areal Loading (mAh/cm²)')}
                    value={anodeArealLoading}
                    onChange={setAnodeArealLoading}
                    min={anodeRanges.anodeArealLoading?.min}
                    max={anodeRanges.anodeArealLoading?.max}
                    disabled={true}
                  />
                  <ParameterInput
                    label={t('design.electrode.predict.pressDensity', 'Press Density (g/cc)')}
                    value={anodePressDensity}
                    onChange={setAnodePressDensity}
                    min={anodeRanges.anodePressDensity?.min}
                    max={anodeRanges.anodePressDensity?.max}
                  />
                </div>
                
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
                  <label className="electrode-predict-label">
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
                  <label className="electrode-predict-label">
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
                disabled={loading || (results !== null && !isFormModified)}
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
                  tooltip={t('design.electrode.predict.specificEDTooltip', 'Energy density calculated based on total cell mass, including pouch materials, electrolyte, and auxiliary inactive components. Electrolyte loading is ~41% excessive relative to the active area.')}
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
                  tooltip={t('design.electrode.predict.volumetricEDTooltip', 'Energy density calculated based on the jelly roll volume.')}
                />
              </div>

              {/* Rate Capability 图表 */}
              <RateCapabilityChart results={results} />
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;