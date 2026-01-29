import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { Info, ArrowUp, ArrowDown } from 'lucide-react';
import Button from '@/components/Button';
import { moleculeService, type MoleculeDetails } from '@/services/chat/moleculeService';
import { getBatterySystemList, predictPerformance, requestLLMAnalysisStream, type PerformancePredictionResponse, type LLMAnalysisStreamRequest } from '@/services/prediction/performance';
import { useAuthStore } from '@/models/useAuth';
import streamSSE from '@/components/StreamSSE';
import MolViewer2D from '@/components/NodePopup/MolViewer2D.js';
import './index.less';
import './PerformanceTooltip.less';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import CustomSelect from '../CustomSelect';
import ModelSelect from '@/components/ModelSelect';
import { mockModels, type PerformanceMetricType, type ModelOption } from './mockModelData';
import { PricingContext } from '@/layouts/index';
import { isColumnVisibleForUser } from '@/constants/columnAccess';
import { getModelList } from '../../model';
import type { ModelListItem } from '@/services/model/training';
import { parseModelResult } from '@/utils/modelResultParser';
import { getWeightPercentage } from '../../utils/weightPercentage';
import ElectrolytePerformanceBadge from '../ElectrolytePerformanceBadge';

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

  const canShowColumn = useCallback(
    (columnId?: string | null) => isColumnVisibleForUser(columnId, userPermissions),
    [userPermissions]
  );
  
  // 新增状态：分子详情相关
  const [moleculeDetails, setMoleculeDetails] = useState<MoleculeDetails | null>(null);
  const [isMoleculeLoading, setIsMoleculeLoading] = useState(false);
  const [lastQueriedSmiles, setLastQueriedSmiles] = useState<string | null>(null);
  const [isInvalidSmiles, setIsInvalidSmiles] = useState(false);
  
  // 新增状态：电池系统相关
  const [batterySystemOptions, setBatterySystemOptions] = useState<BatterySystem[]>([]);
  const [isBatterySystemLoading, setIsBatterySystemLoading] = useState(true);

  // 新增状态：模型相关
  const [modelOptions, setModelOptions] = useState<ModelOption[]>(mockModels);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [selectedModelData, setSelectedModelData] = useState<ModelListItem | null>(null);

  // 新增状态：计算相关
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [predictionResults, setPredictionResults] = useState<PerformancePredictionResponse | null>(null);
  
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

  // 性能指标配置映射
  const metricConfig: Record<PerformanceMetricType, {
    label25Key: string;
    label45Key: string;
    dataKey: 'cycleLife' | 'ce' | 'ratePerformance';
  }> = {
    'cl': {
      label25Key: 'performance.results.performance.cycleLife25',
      label45Key: 'performance.results.performance.cycleLife45',
      dataKey: 'cycleLife'
    },
    'ce': {
      label25Key: 'performance.results.performance.ce25',
      label45Key: 'performance.results.performance.ce45',
      dataKey: 'ce'
    },
    'rate': {
      label25Key: 'performance.results.performance.ratePerformance25',
      label45Key: '',
      dataKey: 'ratePerformance'
    }
  };

  // 根据模型配置和温度限制，获取可显示的性能指标
  const getAvailableMetrics = useCallback(
    (temperature: '25c' | '45c'): PerformanceMetricType[] => {
      if (!selectedModel) return [];

      const model = modelOptions.find(m => m.id === selectedModel);
      if (!model || !model.supportedMetrics || model.supportedMetrics.length === 0) {
        return [];
      }

      let availableMetrics = [...model.supportedMetrics];

      // 45°C 温度限制：移除 rate（API 不支持）
      if (temperature === '45c') {
        availableMetrics = availableMetrics.filter(m => m !== 'rate');
      }

      return availableMetrics;
    },
    [selectedModel, modelOptions]
  );

  // 判断是否需要显示 45°C 区块
  const shouldShow45C = useCallback((): boolean => {
    return getAvailableMetrics('45c').length > 0;
  }, [getAvailableMetrics]);

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

        if (allModels.length > 0) {
          setModelOptions(allModels);
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


  // 处理 SMILES 输入框失焦事件 (简化版，只清理状态)
  const handleSmilesBlur = () => {
    const trimmedAdditive = additive.trim();
    
    // 如果输入为空，清除所有状态
    if (!trimmedAdditive) {
      setMoleculeDetails(null);
      setIsInvalidSmiles(false);
      setLastQueriedSmiles(null);
    }
  };

  // 验证SMILES分子式的函数
  const validateSmiles = async (smilesInput: string): Promise<{isValid: boolean, details: MoleculeDetails | null}> => {
    // 如果与上次查询相同，直接返回缓存结果
    if (smilesInput === lastQueriedSmiles) {
      return { 
        isValid: !isInvalidSmiles, 
        details: moleculeDetails 
      };
    }

    setIsMoleculeLoading(true);
    setMoleculeDetails(null);
    setIsInvalidSmiles(false);

    try {
      const details = await moleculeService.getMoleculeDetails(smilesInput, userPermissions || undefined);
      
      // 检查是否是实际的分子数据还是mock数据
      if (details && details.properties.smiles && 
          details.properties.smiles === 'F[P-](F)(F)(F)(F)F.[Li+]') {
        // 这是默认的mock数据，表示没有找到，但仍然是有效的
        setMoleculeDetails(null);
      } else {
        // 有效的分子数据
        setMoleculeDetails(details);
      }
      
      // 记录已查询的分子式
      setLastQueriedSmiles(smilesInput);
      return { isValid: true, details: details };
      
    } catch (error) {
      console.error('获取分子详情失败:', error);
      
      // 检查是否为无效的 SMILES 错误
      if (error instanceof Error && error.message === 'Invalid SMILES string') {
        setIsInvalidSmiles(true);
        setLastQueriedSmiles(smilesInput);
        return { isValid: false, details: null };
      } else {
        // 其他错误（如未找到分子）仍然被认为是有效的SMILES
        setLastQueriedSmiles(smilesInput);
        return { isValid: true, details: null };
      }
    } finally {
      setIsMoleculeLoading(false);
    }
  };

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

    try {
      const response = await predictPerformance({
        smiles: additive.trim(),
        battery_system_id: selectedBatterySystem ? parseInt(selectedBatterySystem.id) : undefined,
        model_id: selectedModel || undefined
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
    if (!additive.trim()) {
      alert(t('performance.additive.placeholder'));
      return;
    }

    const trimmedAdditive = additive.trim();

    // 执行前置分子验证
    const validationResult = await validateSmiles(trimmedAdditive);

    if (!validationResult.isValid) {
      // 分子式无效，已经显示错误卡片，不允许继续计算
      return;
    }

    // 分子式有效，可以进入计算流程
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
      alert(t('performance.ui.predictionFirst'));
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
          <div className="pm-form-group pm-model-selection">
            <label>{t('performance.modelSelection.label', '预测模型选择')}</label>
            <ModelSelect
              mode="single"
              value={selectedModel}
              onChange={(value) => {
                setSelectedModel(value as string);
                // 从全局 map 中获取完整的模型数据
                const modelDataMap = (window as any).__modelDataMap as Map<string, ModelListItem>;
                if (modelDataMap && value) {
                  const modelData = modelDataMap.get(value as string);
                  setSelectedModelData(modelData || null);
                }
                // 选择模型后显示电池规格
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
                { key: 'name', title: t('performance.modelSelection.columns.modelName', 'Model Name'), width: '40%' },
                {
                  key: 'id',
                  title: t('performance.modelSelection.columns.modelId', 'Model ID'),
                  width: '20%',
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
                <button
                  className="pm-close-specs"
                  onClick={() => setShowSpecs(false)}
                >
                  ×
                </button>
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

          <div className="pm-form-group">
            <div className="pm-dual-input-row">
              <div className="pm-dual-input-item">
                <label>
                  {t('performance.additive.label')} <span className="pm-required">{t('performance.additive.required')}</span>
                </label>
                <input
                  type="text"
                  value={additive}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setAdditive(newValue);

                    // 如果用户清除了输入或者输入与上次查询的不同，清除分子信息
                    const trimmedValue = newValue.trim();
                    if (!trimmedValue || (lastQueriedSmiles && trimmedValue !== lastQueriedSmiles)) {
                      setMoleculeDetails(null);
                      setIsInvalidSmiles(false);
                      if (!trimmedValue) {
                        setLastQueriedSmiles(null);
                      }
                    }

                    // 分子式输入变化时，重置计算结果和LLM分析状态
                    if (predictionResults && trimmedValue !== lastQueriedSmiles) {
                      setShowResults(false);
                      setPredictionResults(null);
                      setHasAnalysisResult(false);
                      setAnalysisContent('');
                      setIsAnalyzing(false);
                    }
                  }}
                  onBlur={handleSmilesBlur}
                  placeholder={t('performance.additive.placeholder')}
                  className="pm-additive-input"
                />
              </div>

              <div className="pm-dual-input-item">
                <label>
                  {t('performance.weightPercentage.label')}
                  <Tooltip title={t('performance.weightPercentage.tooltip')} placement="top">
                    <span className="pm-info-icon">
                      ⓘ
                    </span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value={getWeightPercentage(selectedModelData?.base_model_id)}
                  disabled
                  className="pm-weight-percentage-input"
                />
              </div>
            </div>
          </div>

          {/* 分子详情显示区域 */}
          <div className="pm-molecule-details-section" style={{ marginBottom: '20px' }}>
            {isMoleculeLoading && (
              <div className="pm-molecule-loading">
                <p>{t('performance.moleculeInfo.loading')}</p>
              </div>
            )}

            {moleculeDetails && (
              <div className="pm-molecule-information">
                <div className="pm-molecule-header">
                  <h3>{t('performance.moleculeInfo.title')}</h3>
                  <button 
                    className="pm-molecule-close-btn"
                    onClick={() => setMoleculeDetails(null)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="pm-molecule-content">
                  <div className="pm-molecule-structure">
                    {moleculeDetails.properties.smiles ? (
                      <MolViewer2D
                        smile={moleculeDetails.properties.smiles}
                        cation={moleculeDetails.properties.cation}
                        theme="light"
                        className=""
                        style={{}}
                      />
                    ) : (
                      <div className="pm-structure-placeholder">
                        <div className="pm-structure-circle">
                          <span>{t('performance.moleculeInfo.structurePlaceholder.line1')}</span>
                          <span>{t('performance.moleculeInfo.structurePlaceholder.line2')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pm-molecule-properties">
                    <div className="pm-properties-grid">
                      {(() => {
                        // 定义所有属性配置
                        const allProperties = [
                          {
                            label: t('performance.moleculeInfo.properties.smiles'),
                            value: moleculeDetails.properties.smiles || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.espMin'),
                            value: typeof moleculeDetails.properties.espMin === 'number' 
                              ? moleculeDetails.properties.espMin.toFixed(2) + ' eV' 
                              : moleculeDetails.properties.espMin || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.molecularWeight'),
                            value: typeof moleculeDetails.properties.molecularWeight === 'number' 
                              ? moleculeDetails.properties.molecularWeight.toFixed(2) 
                              : moleculeDetails.properties.molecularWeight || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.predictedMp'),
                            value: moleculeDetails.properties.meltingPoint || '-',
                            show: canShowColumn('predicted_mp_celsius')
                          },
                          {
                            label: t('performance.moleculeInfo.properties.umapX'),
                            value: moleculeDetails.properties.umapX !== undefined 
                              ? moleculeDetails.properties.umapX.toFixed(4) 
                              : '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.predictedBp'),
                            value: moleculeDetails.properties.boilingPoint || '-',
                            show: canShowColumn('predicted_bp_celsius')
                          },
                          {
                            label: t('performance.moleculeInfo.properties.umapY'),
                            value: moleculeDetails.properties.umapY !== undefined 
                              ? moleculeDetails.properties.umapY.toFixed(4) 
                              : '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.predictedFp'),
                            value: moleculeDetails.properties.flashPoint || '-',
                            show: canShowColumn('predicted_fp_celsius')
                          },
                          {
                            label: t('performance.moleculeInfo.properties.homo'),
                            value: typeof moleculeDetails.properties.homo === 'number' 
                              ? moleculeDetails.properties.homo.toFixed(4) + ' eV' 
                              : moleculeDetails.properties.homo || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.combustionEnthalpy'),
                            value: moleculeDetails.properties.combustionEnthalpy || '-',
                            show: canShowColumn('combustion_enthalpy_ev')
                          },
                          {
                            label: t('performance.moleculeInfo.properties.lumo'),
                            value: typeof moleculeDetails.properties.lumo === 'number' 
                              ? moleculeDetails.properties.lumo.toFixed(4) + ' eV' 
                              : moleculeDetails.properties.lumo || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.commercialViability'),
                            value: moleculeDetails.properties.commercialViability || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.espMax'),
                            value: typeof moleculeDetails.properties.espMax === 'number' 
                              ? moleculeDetails.properties.espMax.toFixed(3) + ' eV' 
                              : moleculeDetails.properties.espMax || '-',
                            show: true
                          },
                          {
                            label: t('performance.moleculeInfo.properties.functionalGroups'),
                            value: moleculeDetails.properties.functionalGroups ? (() => {
                              try {
                                const groups = JSON.parse(moleculeDetails.properties.functionalGroups);
                                return Array.isArray(groups) ? groups.join(', ') : moleculeDetails.properties.functionalGroups;
                              } catch {
                                return moleculeDetails.properties.functionalGroups;
                              }
                            })() : '-',
                            show: true
                          }
                        ];

                        // 过滤出需要显示的属性
                        const visibleProperties = allProperties.filter(prop => prop.show);

                        // 按两列布局分组
                        const rows = [];
                        for (let i = 0; i < visibleProperties.length; i += 2) {
                          rows.push(visibleProperties.slice(i, i + 2));
                        }

                        return rows.map((row, rowIndex) => (
                          <div className="pm-property-row" key={rowIndex}>
                            {row.map((prop, propIndex) => (
                              <div className="pm-property-item" key={propIndex}>
                                <label>{prop.label}</label>
                                <span>{prop.value}</span>
                              </div>
                            ))}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isInvalidSmiles && (
              <div className="pm-smiles-error-display">
                <div className="pm-error-header">
                  <h3>{t('performance.invalidSmiles.title')}</h3>
                </div>
                
                <div className="pm-smiles-error-content">
                  <p>{t('performance.invalidSmiles.description')}</p>
                  <p>{t('performance.invalidSmiles.suggestion')}</p>
                  <div className="pm-example-molecules">
                    <div className="pm-molecule-examples">
                      <span className="pm-example-molecule">[Li+].[O-]P(=O)(F)F</span>
                      <span className="pm-example-molecule">O=C1OC(F)CO1</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pm-calculate-btn-wrapper">
            <Button
              variant="primary"
              size="mlarge"
              loading={isCalculating}
              onClick={handleCalculate}
              disabled={isCalculating || showResults || isInvalidSmiles}
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
            
            {/* 免责声明提示 */}
            <div 
              style={{ marginTop: '20px', fontSize: '14px', lineHeight: '1.6', color: '#4a5568' }}
              dangerouslySetInnerHTML={{ __html: t('performance.disclaimer') }}
            />
            
            <div className="pm-results-card">
              {(() => {
                // 计算总指标数
                const metrics25c = getAvailableMetrics('25c');
                const metrics45c = getAvailableMetrics('45c');
                const totalMetrics = metrics25c.length + metrics45c.length;

                // 根据总指标数决定容器布局类名
                const containerClass = totalMetrics === 2 ? 'pm-results-container--horizontal' : 'pm-results-container';

                return (
                  <div className={containerClass}>
                    {/* 25°C Performance 区块 */}
                <div className="pm-temperature-section">
                  <h3 className="pm-temperature-title">{t('performance.results.temperatureTabs.temp25')}</h3>
                  {(() => {
                    const metrics25c = getAvailableMetrics('25c');
                    const layoutClass = metrics25c.length === 1 ? 'pm-performance-results--single' :
                                       metrics25c.length === 2 ? 'pm-performance-results--double' :
                                       'pm-performance-results--triple';

                    return (
                      <div className={`pm-performance-results ${layoutClass}`}>
                        {metrics25c.length > 0 && (() => {
                          const firstMetric = metrics25c[0];
                          const config = metricConfig[firstMetric];
                          return (
                            <div className="pm-result-item" key={firstMetric}>
                              <div className="pm-result-label">{t(config.label25Key)}</div>
                              <ElectrolytePerformanceBadge metric={resultsData['25c'][config.dataKey]} metricType={config.dataKey} />
                            </div>
                          );
                        })()}

                        {metrics25c.length > 1 && (
                          <div className={`pm-results-group ${!isHighTier ? 'pm-with-overlay' : ''}`}
                               data-overlay-text={t('performance.results.upgradeToViewMetrics')}>
                            {metrics25c.slice(1).map((metric) => {
                              const config = metricConfig[metric];
                              return (
                                <div className="pm-result-item" key={metric}>
                                  <div className="pm-result-label">{t(config.label25Key)}</div>
                                  <ElectrolytePerformanceBadge metric={resultsData['25c'][config.dataKey]} metricType={config.dataKey} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* 45°C Performance 区块（条件渲染） */}
                {shouldShow45C() && (
                  <div className={`pm-temperature-section ${!isHighTier ? 'pm-with-overlay' : ''}`}
                       data-overlay-text={t('performance.results.upgradeToViewMetrics')}>
                    <h3 className="pm-temperature-title">{t('performance.results.temperatureTabs.temp45')}</h3>
                    {(() => {
                      const metrics45c = getAvailableMetrics('45c');
                      const layoutClass = metrics45c.length === 1 ? 'pm-performance-results--single' :
                                         metrics45c.length === 2 ? 'pm-performance-results--double' :
                                         'pm-performance-results--triple';

                      return (
                        <div className={`pm-performance-results ${layoutClass}`}>
                          {metrics45c.map((metric) => {
                            const config = metricConfig[metric];
                            return (
                              <div className="pm-result-item" key={metric}>
                                <div className="pm-result-label">{t(config.label45Key)}</div>
                                <ElectrolytePerformanceBadge metric={resultsData['45c'][config.dataKey]} metricType={config.dataKey} />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
                  </div>
                );
              })()}

              <div className="pm-llm-button-section">
                <Button
                  variant="primary"
                  size="large"
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
