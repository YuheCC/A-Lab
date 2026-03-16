import React, { useState, useEffect, useCallback, useMemo, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip, Select, InputNumber } from 'antd';
import { Info, ArrowUp, ArrowDown } from 'lucide-react';
import Button from '@/components/Button';
import { getBatterySystemList, predictPerformance, requestLLMAnalysisStream, type PerformancePredictionResponse, type LLMAnalysisStreamRequest } from '@/services/prediction/performance';
import { useAuthStore } from '@/models/useAuth';
import streamSSE from '@/components/StreamSSE';
import './index.less';
import './PerformanceTooltip.less';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import CustomSelect from '../CustomSelect';
import ModelSelect from '@/components/ModelSelect';
import { upcomingModels, type PerformanceMetricType, type ModelOption } from './mockModelData';
import { ADDITIVE_NAME_OPTIONS } from './additiveOptions';
import SmilesInputWithPreview, { type SmilesInputHandle } from './SmilesInputWithPreview';
import { PricingContext } from '@/layouts/index';
import { getModelList } from '../../model';
import type { ModelListItem } from '@/services/model/training';
import { parseModelResult } from '@/utils/modelResultParser';
import { getWeightPercentage } from '../../utils/weightPercentage';
import CellPerformanceResults, { type CellPerformanceData } from '../CellPerformanceResults';

interface SystemSpec {
  cathode: string;
  anode: string;
  electrolyte: string;
  cellDesign: string;
}

interface TrainParams {
  cathode?: string;
  anode?: string;
  benchmarkElectrolyte?: {
    solvent?: string;
    salt?: string;
    additive?: string;
  };
  cellDesign?: string;
}

interface BatterySystem {
  id: string;
  name: string;
  cathode: string;
  anode: string;
  benchmark_electrolyte: string;
  cell_design: string;
  created_at: string;
  updated_at: string;
}

interface PredictionModuleProps {
  onResetRef?: (resetFn: () => void) => void;
}

const PredictionModule: React.FC<PredictionModuleProps> = ({ onResetRef }) => {
  const { t, i18n } = useTranslation();
  const pricingContext = useContext(PricingContext);
  const userPermissions = useAuthStore(state => state.userPermissions);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [additive, setAdditive] = useState('');
  const [showSpecs, setShowSpecs] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showLLMAnalysis, setShowLLMAnalysis] = useState(false);

  // 权限判断
  const isHighTier = useMemo(() => {
    return ['admin', 'enterprise', 'enterprise1', 'enterprise2', 'enterprise3', 'joint'].includes(userPermissions || '');
  }, [userPermissions]);

  // Formula A 添加剂配置
  const [faAdd3Name, setFaAdd3Name] = useState('');
  const [faAdd3Wt, setFaAdd3Wt] = useState<number | null>(null);
  const [faAdd4Name, setFaAdd4Name] = useState('');
  const [faAdd4Wt, setFaAdd4Wt] = useState<number | null>(null);
  const [faAdd5Name, setFaAdd5Name] = useState('');
  const [faAdd5Wt, setFaAdd5Wt] = useState<number | null>(null);
  const [faAdd6Wt, setFaAdd6Wt] = useState<number | null>(null);
  // faAdd6Smiles 复用现有 additive state

  // Formula B 添加剂配置
  const [fbAdd3Name, setFbAdd3Name] = useState('');
  const [fbAdd3Wt, setFbAdd3Wt] = useState<number | null>(null);
  const [fbAdd4Name, setFbAdd4Name] = useState('');
  const [fbAdd4Wt, setFbAdd4Wt] = useState<number | null>(null);
  const [fbAdd5Name, setFbAdd5Name] = useState('');
  const [fbAdd5Wt, setFbAdd5Wt] = useState<number | null>(null);
  const [fbAdd6Smiles, setFbAdd6Smiles] = useState('');
  const [fbAdd6Wt, setFbAdd6Wt] = useState<number | null>(null);

  // SMILES 输入组件的 ref（用于触发验证）
  const faRef = useRef<SmilesInputHandle>(null);
  const fbRef = useRef<SmilesInputHandle>(null);

  // 新增状态：电池系统相关
  const [batterySystemOptions, setBatterySystemOptions] = useState<BatterySystem[]>([]);
  const [isBatterySystemLoading, setIsBatterySystemLoading] = useState(true);

  // 新增状态：模型相关
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [selectedModelData, setSelectedModelData] = useState<ModelListItem | null>(null);

  // 新增状态：计算相关
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);
  const [predictionResults, setPredictionResults] = useState<PerformancePredictionResponse | null>(null);
  
  // 新增状态：记录上次计算的表单数据
  const [lastCalculatedFormData, setLastCalculatedFormData] = useState<{
    selectedSystem: string;
    selectedModel: string;
    additive: string;
    modelParams: string;
  } | null>(null);
  
  // 新增状态：LLM分析相关
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisContent, setAnalysisContent] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasAnalysisResult, setHasAnalysisResult] = useState(false);

  // 等待时间展示相关状态
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  const [analysisElapsed, setAnalysisElapsed] = useState<number>(0);

  // 从选中模型的 train_params 中获取规格信息
  const getCurrentSpec = (): SystemSpec | null => {
    // 只使用选中模型的 train_params
    if (selectedModelData?.train_params) {
      try {
        const trainParams: TrainParams = JSON.parse(selectedModelData.train_params);
        if (trainParams.cathode || trainParams.anode || trainParams.benchmarkElectrolyte || trainParams.cellDesign) {
          const { solvent = '', salt = '', additive = '' } = trainParams.benchmarkElectrolyte || {};
          const electrolyteStr = [solvent, salt, additive].filter(Boolean).join(' + ');

          return {
            cathode: trainParams.cathode || '',
            anode: trainParams.anode || '',
            electrolyte: electrolyteStr || '',
            cellDesign: trainParams.cellDesign || ''
          };
        }
      } catch (error) {
        console.error('Failed to parse train_params:', error);
      }
    }

    // 如果模型没有 train_params，返回 null
    return null;
  };

  const currentSpec = getCurrentSpec();

  // 计算等待时间的useEffect
  useEffect(() => {
    if (!isAnalyzing || !analysisStartTime) {
      setAnalysisElapsed(0);
      return;
    }

    const computeElapsed = () => {
      const now = Date.now();
      const elapsedSec = Math.max(0, Math.floor((now - analysisStartTime.getTime()) / 1000));
      setAnalysisElapsed(elapsedSec);
    };

    computeElapsed();
    const timer = setInterval(computeElapsed, 1000);
    return () => clearInterval(timer);
  }, [isAnalyzing, analysisStartTime]);

  // 格式化等待时间显示
  const formatElapsedTime = useMemo(() => {
    const minutes = Math.floor(analysisElapsed / 60);
    const seconds = analysisElapsed % 60;
    if (minutes <= 0) {
      return t('performance.analysis.analyzingForSeconds', { seconds: analysisElapsed });
    }
    return t('performance.analysis.analyzingForMinutesAndSeconds', { minutes, seconds });
  }, [analysisElapsed, t]);

  // 获取电池系统选项
  useEffect(() => {
    const fetchBatterySystemOptions = async () => {
      try {
        setIsBatterySystemLoading(true);
        const response = await getBatterySystemList();
        if (response?.data) {
          setBatterySystemOptions(response?.data instanceof Array ? response?.data : []);
          // 如果有选项，默认选择第一个
          if (response.data.length > 0) {
            setSelectedSystem(response.data[0].name);
          }
        }
      } catch (error) {
        console.error('获取电池系统选项失败:', error);
      } finally {
        setIsBatterySystemLoading(false);
      }
    };

    fetchBatterySystemOptions();
  }, []);

  // 获取模型列表
  useEffect(() => {
    const fetchModelOptions = async () => {
      setIsModelLoading(true);
      try {
        // 获取完整的 100 条模型数据,只获取在线状态的模型
        const response = await getModelList({ page_size: 100, status: 'online' });

        if (!response?.data || response.data.length === 0) {
          console.log('No model data found, using mock data');
          setIsModelLoading(false);
          return;
        }

        // 保存完整的模型数据列表，用于后续查找
        const modelDataMap = new Map(response.data.map(item => [item.id.toString(), item]));
        (window as any).__modelDataMap = modelDataMap;

        // 根据 base_model_id 转换为 ModelOption 并设置分类
        const convertToModelOption = (item: ModelListItem): ModelOption => {
          let category: 'base' | 'finetuned' | 'mu' = 'finetuned';

          // 根据 base_model_id 判断分类
          if (item.base_model_id === -1) {
            category = 'base';
          }else if (item.base_model_id === -2) {
            category = 'mu';
          }

          // 根据 model_type 映射 supportedMetrics
          // 1: ratePerformance, 2: ce, 3: cycleLife
          let supportedMetrics: PerformanceMetricType[] = ['cl', 'ce', 'rate']; // 默认支持所有指标
          if (item.model_type !== undefined) {
            switch (item.model_type) {
              case 1:
                supportedMetrics = ['rate'];
                break;
              case 2:
                supportedMetrics = ['ce'];
                break;
              case 3:
                supportedMetrics = ['cl'];
                break;
              default:
                // 保持默认值
                supportedMetrics = ['cl', 'ce', 'rate'];
            }
          }

          return {
            id: item.id.toString(),
            name: item.model_name,
            baseModel: category === 'mu' ? 'Cycle Life + Coulombic Efficiency + Rate Performance' : (item.base_model_name || '-'),
            category,
            supportedMetrics
          };
        };

        const allModels = response.data.filter(item => item.base_model_id !== -1).map(convertToModelOption);

        // 添加即将推出的模型（不做多语言转换，保持原样）
        const modelsWithUpcoming = [...allModels, ...upcomingModels];

        if (modelsWithUpcoming.length > 0) {
          setModelOptions(modelsWithUpcoming);
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
        // 出错时保持使用 mock 数据
      } finally {
        setIsModelLoading(false);
      }
    };

    fetchModelOptions();
  }, []);


  // Weight Percentage 范围钳制（0 ≤ value ≤ 1，保留两位小数）
  const clampWeight = (val: number | null): number | null =>
    val === null ? null : Math.min(1, Math.max(0, parseFloat(val.toFixed(2))));

  // 执行实际的计算逻辑（在验证通过后调用）
  const performCalculation = async () => {
    const selectedBatterySystem = batterySystemOptions?.find(s => s.name === selectedSystem);

    setIsCalculating(true);
    setCalculationError(null);
    setShowResults(false);
    setPredictionResults(null);
    // 重置LLM分析状态，因为要进行新的计算
    setHasAnalysisResult(false);
    setAnalysisContent('');
    setIsAnalyzing(false);
    setAnalysisStartTime(null);
    setAnalysisElapsed(0);

    const modelParams = JSON.stringify({
      formulation_a: {
        additive_3_name: faAdd3Name,
        additive_3_wt: faAdd3Wt ?? 0,
        additive_4_name: faAdd4Name,
        additive_4_wt: faAdd4Wt ?? 0,
        additive_5_name: faAdd5Name,
        additive_5_wt: faAdd5Wt ?? 0,
        additive_6_smiles: additive.trim(),
        additive_6_wt: faAdd6Wt ?? 0,
      },
      formulation_b: {
        additive_3_name: fbAdd3Name,
        additive_3_wt: fbAdd3Wt ?? 0,
        additive_4_name: fbAdd4Name,
        additive_4_wt: fbAdd4Wt ?? 0,
        additive_5_name: fbAdd5Name,
        additive_5_wt: fbAdd5Wt ?? 0,
        additive_6_smiles: fbAdd6Smiles,
        additive_6_wt: fbAdd6Wt ?? 0,
      },
    });

    try {
      const response = await predictPerformance({
        smiles: additive.trim(),
        battery_system_id: selectedBatterySystem ? parseInt(selectedBatterySystem.id) : undefined,
        model_id: selectedModel || undefined,
        model_params: modelParams,
      });

      const status = response?.status ?? response?.data?.status;

      if (status === 402 || status === 401) {
        setCalculationError(null);
        setShowResults(false);
        return;
      }

      if (status && status >= 400) {
        throw new Error(response?.data?.message || response?.data?.detail?.message || 'Prediction request failed');
      }

      if (response?.data) {
        let responseData = response?.data || {};
        // 使用统一的 model_result 解析函数
        const parsed = parseModelResult(responseData);
        responseData = {
          ...responseData,
          ...parsed,
        };
        console.log('Prediction results:', responseData);
        setPredictionResults(responseData);
        setShowResults(true);
        // 保存本次计算的表单数据
        setLastCalculatedFormData({
          selectedSystem,
          selectedModel,
          additive,
          modelParams,
        });
      } else {
        throw new Error('No data received from prediction API');
      }
    } catch (error) {
      console.error('Prediction failed:', error);
      const errorStatus = (error as any)?.response?.status ?? (error as any)?.status ?? (error as any)?.data?.status;
      if (errorStatus === 402 || errorStatus === 401) {
        setShowResults(false);
        setCalculationError(null);
        return;
      }

      setCalculationError(t('performance.ui.calculationFailed'));
    } finally {
      setIsCalculating(false);
    }
  };

  // 计算按钮点击处理函数 - 包含前置验证
  const handleCalculate = async () => {
    // 校验模型是否选择
    if (!selectedModel) {
      setFormValidationError(t('performance.validation.selectModel'));
      return;
    }

    // 校验 Formula A 和 B 都至少填写一组参数
    const hasFormulaA = !!(faAdd3Name || faAdd4Name || faAdd5Name || additive.trim());
    const hasFormulaB = !!(fbAdd3Name || fbAdd4Name || fbAdd5Name || fbAdd6Smiles.trim());

    if (!hasFormulaA || !hasFormulaB) {
      setFormValidationError(
        t('performance.validation.atLeastOneAdditive')
      );
      return;
    }

    // 清除校验错误
    setFormValidationError(null);

    // 检查 SMILES 验证结果是否合法
    // blur 时已触发验证并缓存结果，这里优先使用同步缓存状态，避免重复请求
    // 若用户未触发 blur（如直接点击 Calculate），则 fallback 到异步验证
    const checkSmiles = async (
      smiles: string,
      ref: React.RefObject<SmilesInputHandle>,
    ): Promise<{ isValid: boolean }> => {
      if (!smiles.trim()) return { isValid: true };
      const state = ref.current?.getValidationState();
      if (state?.hasBeenValidated) return { isValid: state.isValid };
      return ref.current?.validate() ?? { isValid: true };
    };

    const [faResult, fbResult] = await Promise.all([
      checkSmiles(additive, faRef),
      checkSmiles(fbAdd6Smiles, fbRef),
    ]);

    if (!faResult.isValid || !fbResult.isValid) {
      const which: string[] = [];
      if (!faResult.isValid) which.push('Formula A');
      if (!fbResult.isValid) which.push('Formula B');
      setFormValidationError(
        t('performance.validation.invalidSmiles', { formulas: which.join(' & ') }),
      );
      return;
    }

    // 两个 SMILES 均有效，进入计算流程
    await performCalculation();
  };

  // 获取当前语言设置
  const getCurrentLanguage = () => {
    const currentLang = i18n.language || 'en';
    
    // 如果是中文（包括zh、zh-CN、zh-TW等），返回'zh'，其他都返回'en'
    return currentLang.startsWith('zh') ? 'zh' : 'en';
  };

  // LLM分析处理函数
  const handleLLMAnalysis = async () => {
    if (!predictionResults) {
      return;
    }

    const selectedBatterySystem = batterySystemOptions?.find((s: BatterySystem) => s.name === selectedSystem);

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisContent('');
    setHasAnalysisResult(false);
    setAnalysisStartTime(new Date()); // 记录分析开始时间

    try {
      const currentLang = getCurrentLanguage();
      const analysisParams: LLMAnalysisStreamRequest = {
        id: predictionResults.id,
        battery_system_id: selectedBatterySystem ? parseInt(selectedBatterySystem.id) : 0,
        lang: currentLang
      };

      console.log('发送LLM分析SSE请求:', analysisParams);
      console.log('predictionResults', predictionResults);

      // 使用SSE流式接收数据
      console.log('[LLM Analysis] 开始请求SSE流...');
      const response = await requestLLMAnalysisStream(analysisParams);
      console.log('[LLM Analysis] SSE响应已获取:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // 使用streamSSE解析SSE流
      console.log('[LLM Analysis] 开始读取SSE流...');
      let eventCount = 0;
      for await (const event of streamSSE(response)) {
        eventCount++;
        console.log(`[LLM Analysis] 收到第 ${eventCount} 个SSE事件:`, event);

        // 处理流式数据
        if (event) {
          // 1) 直接是字符串
          if (typeof event === 'string') {
            setAnalysisContent(prev => prev + event);
          }

          // 2) 对象：优先取 answer 字段
          if (typeof event === 'object') {
            const answer = (event as any)?.answer;
            if (typeof answer === 'string' && answer) {
              setAnalysisContent(prev => prev + answer);
            } else if (typeof (event as any)?.data === 'string') {
              // 3) data 为字符串：若看起来像 JSON，再尝试解析提取 answer
              const raw = (event as any).data as string;
              const trimmed = raw.trim();
              if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                  const parsed = JSON.parse(trimmed);
                  const inner = (parsed as any)?.answer ?? (parsed as any)?.content ?? trimmed;
                  if (typeof inner === 'string') {
                    setAnalysisContent(prev => prev + inner);
                  }
                } catch {
                  try {
                    // 宽松再试（与 streamSSE 保持一致的兼容性）
                    // 动态导入避免顶层依赖耦合
                    // @ts-ignore
                    const JSON5 = (await import('json5')).default;
                    const parsedLoose = JSON5.parse(trimmed);
                    const innerLoose = parsedLoose?.answer ?? parsedLoose?.content ?? trimmed;
                    if (typeof innerLoose === 'string') {
                      setAnalysisContent(prev => prev + innerLoose);
                    }
                  } catch {
                    setAnalysisContent(prev => prev + raw);
                  }
                }
              } else {
                setAnalysisContent(prev => prev + raw);
              }
            }
          }

          // 检查是否完成
          if (event.finished === true || event.complete === true || event.done === true) {
            setIsAnalyzing(false);
            setHasAnalysisResult(true);
            setAnalysisStartTime(null);
            console.log('[LLM Analysis] 分析完成（通过done标志）');
            break;
          }
        }
      }

      // 流结束后，确保状态正确
      console.log('[LLM Analysis] SSE流读取结束，共收到', eventCount, '个事件');
      setIsAnalyzing(false);
      setHasAnalysisResult(true);
      setAnalysisStartTime(null);

    } catch (error) {
      console.error('LLM分析请求失败:', error);
      setAnalysisError(t('performance.ui.analysisFailed'));
      setIsAnalyzing(false);
      setHasAnalysisResult(false);
      setAnalysisStartTime(null); // 清理开始时间
    }
  };

  // Unified processing function based on Python logic (老格式处理)
  const processPerformanceMetric = (propValue: string, labelValue: string) => {
    // Parse string values to numbers
    const prob = parseFloat(propValue || '0');
    const label = parseInt(labelValue || '0');
    
    // Determine status based on label
    let status: string;
    if (label === 0) {
      status = 'Positive';  // Positive
    } else if (label === 1) {
      status = 'Negative';  // Negative
    } else {
      status = 'UNKNOWN';
    }
    
    // Format confidence percentage
    const confidence = prob;
    const displayConfidence = parseFloat(confidence.toFixed(2));
    return {
      status,
      confidence: displayConfidence,
      rawProb: prob,
      rawLabel: label
    };
  };

  // 新格式数据类型定义
  interface NewFormatMetric {
    status: string;
    performance_type: string; // 'CR_25', 'CL_25', 'CL_45', 'CE_25', 'CE_45'
    task: string; // 'regression' 或 'classification'
    smiles: string;
    value?: number; // 回归任务的预测值
    label?: number; // 分类任务的标签
    prob?: number;  // 分类任务的概率
  }

  // performance_type 到显示指标的映射
  const PERFORMANCE_TYPE_MAP: Record<string, { temp: '25c' | '45c'; metric: 'cycleLife' | 'ce' | 'ratePerformance' }> = {
    'CR_25': { temp: '25c', metric: 'ratePerformance' },
    'CL_25': { temp: '25c', metric: 'cycleLife' },
    'CL_45': { temp: '45c', metric: 'cycleLife' },
    'CE_25': { temp: '25c', metric: 'ce' },
    'CE_45': { temp: '45c', metric: 'ce' },
  };

  // 处理新格式的单个指标数据
  const processNewFormatMetric = (metricData: NewFormatMetric | undefined) => {
    if (!metricData) {
      return { status: 'UNKNOWN', confidence: 0, rawProb: 0, rawLabel: -1 };
    }

    // 处理CE_25和CE_45
    if(metricData.performance_type === "CE_25" || metricData.performance_type === "CE_45"){
      return {
        status: (metricData?.value ?? 0) <= 0 ? 'Positive' : 'Negative',
        confidence: 0,
        rawProb: 0,
        rawLabel: Number(metricData.value)
      };
    }

    // 根据任务类型处理
    if (metricData.task === 'regression') {
      // 回归任务：使用 value 作为置信度显示
      const value = metricData.value ?? 0;
      // 根据 value 的正负判断状态
      const status = value >= 0 ? 'Positive' : 'Negative';
      const displayValue = parseFloat((Math.abs(value) * 100).toFixed(2));
      return {
        status,
        confidence: displayValue,
        rawProb: value,
        rawLabel: value >= 0 ? 0 : 1
      };
    } else {
      // 分类任务：使用 label 和 prob
      const label = metricData.label ?? 0;
      const prob = metricData.prob ?? metricData.value ?? 0;
      const status = label === 0 ? 'Positive' : label === 1 ? 'Negative' : 'UNKNOWN';
      return {
        status,
        confidence: parseFloat(Math.abs(prob).toFixed(2)),
        rawProb: prob,
        rawLabel: label
      };
    }
  };

  // 检测是否为新格式数据
  const isNewFormatData = (modelResult: any): boolean => {
    // 新格式特征：包含 temperature_25 或 temperature_45，且有 performance_type 字段
    return (
      modelResult &&
      (modelResult.temperature_25?.performance_type || modelResult.temperature_45?.performance_type)
    );
  };

  // Transform API response to results format
  const getResultsData = () => {
    console.log('predictionResults', predictionResults);
    if (!predictionResults) {
      // Return mock data if no API results
      return {
        '25c': {
          cycleLife: { status: 'POSITIVE', confidence: '98.5%' },
          ce: { status: 'NEGATIVE', confidence: '102.5%' },
          ratePerformance: { status: 'NEGATIVE', confidence: '94.3%' }
        },
        '45c': {
          cycleLife: { status: 'POSITIVE', confidence: '96.8%' },
          ce: { status: 'NEGATIVE', confidence: '92.1%' }
        }
      };
    }

    // 尝试解析 model_result
    let parsedModelResult: any = null;
    try {
      if ((predictionResults as any)?.model_result) {
        parsedModelResult = JSON.parse((predictionResults as any).model_result);
        console.log('Parsed model_result:', parsedModelResult);
      }
    } catch (error) {
      console.error('Error parsing model_result:', error);
    }

    // 检测并处理新格式数据
    if (isNewFormatData(parsedModelResult)) {
      console.log('[Performance] Detected new format data, adapting...');
      
      // 初始化默认结果
      const defaultMetric = { status: 'UNKNOWN', confidence: 0, rawProb: 0, rawLabel: -1 };
      const result: any = {
        '25c': {
          cycleLife: { ...defaultMetric },
          ce: { ...defaultMetric },
          ratePerformance: { ...defaultMetric }
        },
        '45c': {
          cycleLife: { ...defaultMetric },
          ce: { ...defaultMetric }
        }
      };

      // 处理 temperature_25 数据
      if (parsedModelResult.temperature_25) {
        const metric25 = parsedModelResult.temperature_25 as NewFormatMetric;
        const mapping = PERFORMANCE_TYPE_MAP[metric25.performance_type];
        if (mapping) {
          result[mapping.temp][mapping.metric] = processNewFormatMetric(metric25);
        }
      }

      // 处理 temperature_45 数据
      if (parsedModelResult.temperature_45) {
        const metric45 = parsedModelResult.temperature_45 as NewFormatMetric;
        const mapping = PERFORMANCE_TYPE_MAP[metric45.performance_type];
        if (mapping) {
          result[mapping.temp][mapping.metric] = processNewFormatMetric(metric45);
        }
      }

      console.log('[Performance] Adapted result:', result);
      return result;
    }

    // 老格式处理逻辑
    console.log('[Performance] Using old format data processing...');
    let quantification_result: any = {};
    if (parsedModelResult) {
      quantification_result = parsedModelResult?.quantification_result ?? {};
    }
    
    // Process each metric using unified logic
    const temp25_CE = processPerformanceMetric(
      predictionResults.temperature_25_CE_prob,
      predictionResults.temperature_25_CE_label
    );
    
    const temp25_CL = processPerformanceMetric(
      quantification_result?.pred_cl_25 ?? predictionResults.temperature_25_CL_prob,
      predictionResults.temperature_25_CL_label
    );
    
    const temp25_CR = processPerformanceMetric(
      quantification_result?.cr ?? predictionResults.temperature_25_CR_prob,
      predictionResults.temperature_25_CR_label
    );
    
    const temp45_CE = processPerformanceMetric(
      predictionResults.temperature_45_CE_prob,
      predictionResults.temperature_45_CE_label
    );
    
    const temp45_CL = processPerformanceMetric(
      quantification_result?.pred_cl_45 ?? predictionResults.temperature_45_CL_prob,
      predictionResults.temperature_45_CL_label
    );

    return {
      '25c': {
        cycleLife: temp25_CL,
        ce: temp25_CE,
        ratePerformance: temp25_CR
      },
      '45c': {
        cycleLife: temp45_CL,
        ce: temp45_CE
      }
    };
  };

  const resultsData = getResultsData();

  // Reset function to clear all state
  const resetPredictionState = useCallback(() => {
    // Clear form inputs
    setAdditive('');
    setSelectedModel('');
    setSelectedModelData(null);

    // Reset display states
    setShowSpecs(true);
    setShowResults(false);
    setShowLLMAnalysis(false);

    // Clear molecule details
    setMoleculeDetails(null);
    setIsMoleculeLoading(false);
    setLastQueriedSmiles(null);
    setIsInvalidSmiles(false);

    // Clear calculation states
    setIsCalculating(false);
    setCalculationError(null);
    setPredictionResults(null);
    setLastCalculatedFormData(null);

    // Clear LLM analysis states
    setIsAnalyzing(false);
    setAnalysisContent('');
    setAnalysisError(null);
    setHasAnalysisResult(false);
    setAnalysisStartTime(null);
    setAnalysisElapsed(0);

    // Reset to first battery system if available
    if (batterySystemOptions?.length > 0) {
      setSelectedSystem(batterySystemOptions[0].name);
    }
  }, [batterySystemOptions]);

  // Expose reset function to parent component
  useEffect(() => {
    if (onResetRef) {
      onResetRef(resetPredictionState);
    }
  }, [onResetRef, resetPredictionState]);

  // 监听表单数据变化，当参数修改后重置结果显示
  useEffect(() => {
    // 如果还没有计算过，不做处理
    if (!lastCalculatedFormData || !predictionResults) {
      return;
    }

    // 比较当前表单数据与上次计算的数据
    // 注意：与 performCalculation 中保持一致，null 权重用 ?? 0 处理，否则序列化结果不同导致误判
    const currentModelParams = JSON.stringify({
      formulation_a: { additive_3_name: faAdd3Name, additive_3_wt: faAdd3Wt ?? 0, additive_4_name: faAdd4Name, additive_4_wt: faAdd4Wt ?? 0, additive_5_name: faAdd5Name, additive_5_wt: faAdd5Wt ?? 0, additive_6_smiles: additive.trim(), additive_6_wt: faAdd6Wt ?? 0 },
      formulation_b: { additive_3_name: fbAdd3Name, additive_3_wt: fbAdd3Wt ?? 0, additive_4_name: fbAdd4Name, additive_4_wt: fbAdd4Wt ?? 0, additive_5_name: fbAdd5Name, additive_5_wt: fbAdd5Wt ?? 0, additive_6_smiles: fbAdd6Smiles, additive_6_wt: fbAdd6Wt ?? 0 },
    });
    const isFormModified = 
      selectedSystem !== lastCalculatedFormData.selectedSystem ||
      selectedModel !== lastCalculatedFormData.selectedModel ||
      additive !== lastCalculatedFormData.additive ||
      currentModelParams !== lastCalculatedFormData.modelParams;

    // 如果表单被修改，重置结果显示
    if (isFormModified) {
      setShowResults(false);
      setPredictionResults(null);
      setHasAnalysisResult(false);
      setAnalysisContent('');
      setIsAnalyzing(false);
    }
  }, [selectedSystem, selectedModel, additive, lastCalculatedFormData, predictionResults]);

  // 任意校验相关字段变化时，清除表单校验错误提示
  useEffect(() => {
    if (formValidationError) {
      setFormValidationError(null);
    }
  }, [
    selectedModel,
    faAdd3Name, faAdd4Name, faAdd5Name, additive,
    fbAdd3Name, fbAdd4Name, fbAdd5Name, fbAdd6Smiles,
  ]);

  const comingSoonText = useMemo(() => {
    return {
      1: t('formulation.comingSoon', 'Will be available soon'),
      2: t('formulation.comingSoon', 'Will be available soon'),
      3: t('formulation.comingSoon', 'Will be available soon'),
      4: t('formulation.comingSoon2', 'Will be available soon')
    };
  }, [t]);
  const batterySystemDisplayOptions = useMemo(() => {
    return batterySystemOptions?.map(system => ({
      id: system.id,
      name: system.name,
      disabled: Number(system.id) !== 1,
      disabledText: Number(system.id) !== 1 ? (comingSoonText[Number(system.id) as keyof typeof comingSoonText] || undefined) : undefined
    }));
  }, [batterySystemOptions?.length, comingSoonText]);

  return (
    <div className="pm-prediction-module">
      <div className="pm-module-section">
        <h2>{t('performance.batterySystemSelection.title')}</h2>
        
        <div className="pm-module-content-card">

          {/* 1. Model Selection 子分区 */}
          <div className="pm-subsection-card">
            <h3 className="pm-subsection-title">{t('performance.modelSelection.sectionTitle', '1. Model Selection')}</h3>
            <div className="pm-form-group pm-model-selection">
              <label>
                {t('performance.modelSelection.label', '预测模型选择')}
                <span className="required-star">*</span>
              </label>
              <ModelSelect
                mode="single"
                value={selectedModel}
                onChange={(value) => {
                  setSelectedModel(value as string);
                  const modelDataMap = (window as any).__modelDataMap as Map<string, ModelListItem>;
                  if (modelDataMap && value) {
                    const modelData = modelDataMap.get(value as string);
                    setSelectedModelData(modelData || null);
                  }
                  if (value) {
                    setShowSpecs(true);
                  }
                }}
                options={modelOptions}
                loading={isModelLoading}
                groupBy="category"
                groupByLabel={{
                  'base': t('performance.modelSelection.baseModel', 'Base Model'),
                  'finetuned': t('performance.modelSelection.finetunedModels', 'Fine-tuned Models'),
                  'mu': t('performance.modelSelection.muModels', 'Mu Models')
                }}
                columns={[
                  { key: 'name', title: t('performance.modelSelection.columns.modelName', 'Model Name'), width: '45%' },
                  {
                    key: 'id',
                    title: t('performance.modelSelection.columns.modelId', 'Model ID'),
                    width: '15%',
                    render: (value: any) => `DM-${String(value).padStart(6, '0')}`
                  },
                  { key: 'baseModel', title: t('performance.modelSelection.columns.baseModel', 'Base Model'), width: '40%' }
                ]}
                searchable
                pageSize={20}
                placeholder={t('performance.modelSelection.placeholder', '请选择预测模型')}
                className="pm-model-select"
                fieldNames={{ label: 'name', value: 'id' }}
              />
            </div>

            {selectedModel && showSpecs && currentSpec && (currentSpec.cathode || currentSpec.anode || currentSpec.electrolyte || currentSpec.cellDesign) && (
              <div className="pm-system-specs">
                <div className="pm-specs-header">
                  <span>{t('performance.batterySystemSelection.systemSpecs.title')}</span>
                  <button className="pm-close-specs" onClick={() => setShowSpecs(false)}>×</button>
                </div>
                <div className="pm-specs-grid">
                  {currentSpec.cathode && (
                    <div className="pm-spec-item">
                      <label>{t('performance.batterySystemSelection.systemSpecs.cathode')}</label>
                      <span>{currentSpec.cathode}</span>
                    </div>
                  )}
                  {currentSpec.anode && (
                    <div className="pm-spec-item">
                      <label>{t('performance.batterySystemSelection.systemSpecs.anode')}</label>
                      <span>{currentSpec.anode}</span>
                    </div>
                  )}
                  {currentSpec.electrolyte && (
                    <div className="pm-spec-item">
                      <label>{t('performance.batterySystemSelection.systemSpecs.benchmarkElectrolyte')}</label>
                      <span>{currentSpec.electrolyte}</span>
                    </div>
                  )}
                  {currentSpec.cellDesign && (
                    <div className="pm-spec-item">
                      <label>{t('performance.batterySystemSelection.systemSpecs.cellDesign')}</label>
                      <span>{currentSpec.cellDesign}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Additive Formulations Configuration 子分区 */}
          <div className="pm-subsection-card">
            <h3 className="pm-subsection-title">{t('performance.formulas.sectionTitle', '2. Additive Formulations Configuration')}</h3>
            <div className="pm-formula-columns">

              {/* Formula A */}
              <div className="pm-formula-column pm-formula-column--a">
                <div className="pm-formula-column-header">
                  <span className="pm-formula-column-bar" />
                  <h4 className="pm-formula-column-title">{t('performance.formulas.formulaA', 'Formula A')}</h4>
                </div>

                {/* Additive 1 */}
                <div className="pm-additive-row">
                  <div className="pm-additive-select-group">
                    <label className="pm-additive-label">{t('performance.formulas.additive1Label', 'Additive 1')}</label>
                    <Select
                      value={faAdd3Name || undefined}
                      onChange={(value) => setFaAdd3Name(value ?? '')}
                      options={ADDITIVE_NAME_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, value: o.value }))}
                      allowClear
                      className="pm-additive-select"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={faAdd3Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFaAdd3Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Additive 2 */}
                <div className="pm-additive-row">
                  <div className="pm-additive-select-group">
                    <label className="pm-additive-label">{t('performance.formulas.additive2Label', 'Additive 2')}</label>
                    <Select
                      value={faAdd4Name || undefined}
                      onChange={(value) => setFaAdd4Name(value ?? '')}
                      options={ADDITIVE_NAME_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, value: o.value }))}
                      allowClear
                      className="pm-additive-select"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={faAdd4Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFaAdd4Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Additive 3 */}
                <div className="pm-additive-row">
                  <div className="pm-additive-select-group">
                    <label className="pm-additive-label">{t('performance.formulas.additive3Label', 'Additive 3')}</label>
                    <Select
                      value={faAdd5Name || undefined}
                      onChange={(value) => setFaAdd5Name(value ?? '')}
                      options={ADDITIVE_NAME_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, value: o.value }))}
                      allowClear
                      className="pm-additive-select"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={faAdd5Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFaAdd5Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* New Additive SMILES (Formula A) */}
                <div className="pm-additive-row pm-smiles-row">
                  <div className="pm-additive-smiles-group">
                    <SmilesInputWithPreview
                      ref={faRef}
                      value={additive}
                      onChange={setAdditive}
                      label={t('performance.formulas.newAdditiveSmiles', 'New Additive SMILES')}
                      placeholder={t('performance.additive.placeholder')}
                      onResultsInvalidate={() => {
                        setShowResults(false);
                        setPredictionResults(null);
                        setHasAnalysisResult(false);
                        setAnalysisContent('');
                        setIsAnalyzing(false);
                      }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={faAdd6Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFaAdd6Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Formula B */}
              <div className="pm-formula-column pm-formula-column--b">
                <div className="pm-formula-column-header">
                  <span className="pm-formula-column-bar" />
                  <h4 className="pm-formula-column-title">{t('performance.formulas.formulaB', 'Formula B')}</h4>
                </div>

                {/* Additive 1 */}
                <div className="pm-additive-row">
                  <div className="pm-additive-select-group">
                    <label className="pm-additive-label">{t('performance.formulas.additive1Label', 'Additive 1')}</label>
                    <Select
                      value={fbAdd3Name || undefined}
                      onChange={(value) => setFbAdd3Name(value ?? '')}
                      options={ADDITIVE_NAME_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, value: o.value }))}
                      allowClear
                      className="pm-additive-select"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={fbAdd3Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFbAdd3Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Additive 2 */}
                <div className="pm-additive-row">
                  <div className="pm-additive-select-group">
                    <label className="pm-additive-label">{t('performance.formulas.additive2Label', 'Additive 2')}</label>
                    <Select
                      value={fbAdd4Name || undefined}
                      onChange={(value) => setFbAdd4Name(value ?? '')}
                      options={ADDITIVE_NAME_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, value: o.value }))}
                      allowClear
                      className="pm-additive-select"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={fbAdd4Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFbAdd4Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Additive 3 */}
                <div className="pm-additive-row">
                  <div className="pm-additive-select-group">
                    <label className="pm-additive-label">{t('performance.formulas.additive3Label', 'Additive 3')}</label>
                    <Select
                      value={fbAdd5Name || undefined}
                      onChange={(value) => setFbAdd5Name(value ?? '')}
                      options={ADDITIVE_NAME_OPTIONS.filter(o => o.value).map(o => ({ label: o.label, value: o.value }))}
                      allowClear
                      className="pm-additive-select"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={fbAdd5Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFbAdd5Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* New Additive SMILES (Formula B) */}
                <div className="pm-additive-row pm-smiles-row">
                  <div className="pm-additive-smiles-group">
                    <SmilesInputWithPreview
                      ref={fbRef}
                      value={fbAdd6Smiles}
                      onChange={setFbAdd6Smiles}
                      label={t('performance.formulas.newAdditiveSmiles', 'New Additive SMILES')}
                      placeholder={t('performance.additive.placeholder')}
                    />
                  </div>
                  <div className="pm-weight-group">
                    <label className="pm-additive-label">{t('performance.formulas.weightPercentageLabel', 'Weight Percentage (wt%)')}</label>
                    <InputNumber
                      value={fbAdd6Wt}
                      min={0}
                      max={1}
                      step={0.01}
                      onChange={(val) => setFbAdd6Wt(clampWeight(val))}
                      className="pm-weight-input-number"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {formValidationError && (
            <div className="pm-form-validation-error">
              <p>{formValidationError}</p>
            </div>
          )}
          <div className="pm-calculate-btn-wrapper">
            <Button
              variant="primary"
              size="mlarge"
              loading={isCalculating}
              onClick={handleCalculate}
              disabled={isCalculating || showResults}
              className="pm-calculate-btn"
            >
              {t('performance.calculate.button')}
            </Button>
          </div>

          {calculationError && (
            <div className="pm-calculation-error">
              <p>{calculationError}</p>
            </div>
          )}
        </div>

        {showResults && (
          <div className="pm-results-section">
            <div className="pm-results-title-container">
              <h2>{t('performance.results.title')}</h2>
              <Tooltip
                title={
                  <div className="result-tooltip">
                    <div className="result-tooltip__section result-tooltip__section--description">
                      <div className="result-tooltip__description"><strong>{t('performance.results.descriptions.cycleLifeLabel')}:</strong> {t('performance.results.descriptions.cycleLife')}</div>
                      <div className="result-tooltip__description"><strong>{t('performance.results.descriptions.ceLabel')}:</strong> {t('performance.results.descriptions.ce')}</div>
                      <div className="result-tooltip__description"><strong>{t('performance.results.descriptions.ratePerformanceLabel')}:</strong> {t('performance.results.descriptions.ratePerformance')}</div>
                    </div>
                    <div className="result-tooltip__section">
                      <div className="result-tooltip__indicator result-tooltip__indicator--positive">
                        <ArrowUp className="result-tooltip__indicator-icon" />
                        <p className="result-tooltip__indicator-text">{t('performance.results.positiveTip')}</p>
                      </div>
                      <div className="result-tooltip__indicator result-tooltip__indicator--negative">
                        <ArrowDown className="result-tooltip__indicator-icon" />
                        <p className="result-tooltip__indicator-text">{t('performance.results.negativeTip')}</p>
                      </div> 
                    </div>
                    <div className="result-tooltip__section result-tooltip__section--badge">
                      <div className="result-tooltip__badge-title">{t('performance.results.badgeTitle')}</div>
                      <div className="result-tooltip__badge-grid">
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--gain-light">
                            <ArrowUp size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelLow')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--gain-medium">
                            <ArrowUp size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelMid')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--gain-strong">
                            <ArrowUp size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelHigh')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--loss-light">
                            <ArrowDown size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelLow')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--loss-medium">
                            <ArrowDown size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelMid')}</span>
                        </div>
                        <div className="result-tooltip__badge-item">
                          <span className="result-tooltip__badge result-tooltip__badge--loss-strong">
                            <ArrowDown size={12} />
                          </span>
                          <span className="result-tooltip__badge-label">{t('performance.results.badgeDescriptions.levelHigh')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                placement="bottom"
                overlayClassName="performance-tooltip-overlay"
              >
                <div className="tip-icon-container">
                  <Info
                    size={16}
                    className="tip-icon"
                  />
                </div>
              </Tooltip>
            </div>
            
            {/* 提示模块 */}
            <div className="pm-improvement-hint">
              <p className="pm-improvement-hint__text">
                {t('performance.results.improvementHint', 'Improvement of Formula B compared with Formula A')}
              </p>
            </div>

            {/* 免责声明提示 */}
            <div 
              style={{ marginTop: '20px', fontSize: '14px', lineHeight: '1.6', color: '#4a5568' }}
              dangerouslySetInnerHTML={{ __html: t('performance.disclaimer') }}
            />
            
            <div className="pm-results-card">
              <CellPerformanceResults
                data={{
                  temp25: resultsData['25c'] as CellPerformanceData['temp25'],
                  temp45: resultsData['45c'] as CellPerformanceData['temp45'],
                }}
                modelType={selectedModelData?.model_type}
                isHighTier={isHighTier}
                noCard
              />

              <div className="pm-llm-button-section">
                <Button
                  variant="primary"
                  size="mlarge"
                  loading={isAnalyzing}
                  onClick={handleLLMAnalysis}
                  disabled={isAnalyzing || !predictionResults || hasAnalysisResult || !isHighTier}
                  className="pm-llm-analysis-btn"
                >
                  {t('performance.llmAnalysis.button')}
                </Button>

                {analysisError && (
                  <div className="pm-analysis-error">
                    <p>{analysisError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(analysisContent || isAnalyzing || showLLMAnalysis) && (
          <div className="pm-llm-analysis-section">
            <div className="pm-llm-analysis-header">
              <h2>{t('performance.llmAnalysis.title')}</h2>
              {/* {(analysisContent || isAnalyzing) && (
                <button 
                  className="pm-close-analysis-btn"
                  onClick={() => {
                    setShowLLMAnalysis(false);
                    setAnalysisContent('');
                    setIsAnalyzing(false);
                  }}
                >
                  ×
                </button>
              )} */}
            </div>
            
            <div className="pm-llm-analysis-card">
              <div className="pm-llm-content">
                {isAnalyzing && !analysisContent && (
                  <div className="pm-analysis-loading">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <span>{t('performance.analysis.analyzing') || 'LLM分析中'}</span>
                      {analysisElapsed > 0 && (
                        <span style={{ fontVariantNumeric: 'tabular-nums', color: '#6b7280' }}>{formatElapsedTime}</span>
                      )}
                    </div>
                    <div className="pm-loading-spinner"></div>
                  </div>
                )}
                
                {analysisContent && (
                  <div className="pm-analysis-content" style={{ fontSize: '14px', paddingTop: 0 }}>
                    <InlineMoleculeRenderer content={analysisContent} onMoleculeClick={() => {}} />
                  </div>
                )}
                
                {!analysisContent && !isAnalyzing && showLLMAnalysis && (
                  <div className="pm-analysis-placeholder">
                    <p>{t('performance.ui.analysisPlaceholder')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionModule;
