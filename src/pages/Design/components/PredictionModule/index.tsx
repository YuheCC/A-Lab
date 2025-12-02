import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import { Info, ArrowUp, ArrowDown } from 'lucide-react';
import { ArrowUpIcon, ArrowDownIcon } from '@/components/PerformanceBadge';
import { moleculeService, type MoleculeDetails } from '@/services/chat/moleculeService';
import { getBatterySystemList, predictPerformance, requestLLMAnalysis, type PerformancePredictionResponse, type LLMAnalysisRequest } from '@/services/prediction/performance';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { useAuthStore } from '@/models/useAuth';
import MolViewer2D from '@/components/NodePopup/MolViewer2D.js';
import './index.less';
import './PerformanceTooltip.less';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import CustomSelect from '../CustomSelect';
import ModelSelect from '@/components/ModelSelect';
import { mockModels } from './mockModelData';
import { PricingContext } from '@/layouts/index';
import { isColumnVisibleForUser } from '@/constants/columnAccess';

interface SystemSpec {
  cathode: string;
  anode: string;
  electrolyte: string;
  cellDesign: string;
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
  const [activeTab, setActiveTab] = useState<'25c' | '45c'>('25c');
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
  
  // 新增状态：计算相关
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [predictionResults, setPredictionResults] = useState<PerformancePredictionResponse | null>(null);
  
  // 新增状态：LLM分析相关
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisContent, setAnalysisContent] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [hasAnalysisResult, setHasAnalysisResult] = useState(false);

  // 等待时间展示相关状态
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  const [analysisElapsed, setAnalysisElapsed] = useState<number>(0);

  // 从选中的电池系统中获取规格信息
  const getCurrentSpec = (): SystemSpec | null => {
    if (!selectedSystem) return null;
    const system = batterySystemOptions?.find(s => s.name === selectedSystem);
    if (!system) return null;
    
    return {
      cathode: system.cathode,
      anode: system.anode,
      electrolyte: system.benchmark_electrolyte,
      cellDesign: system.cell_design
    };
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

  // WebSocket初始化和消息处理
  useEffect(() => {
    console.log('PredictionModule: 初始化WebSocket连接');
    globalWebSocketManager.initialize();

    // 检查初始连接状态
    const initialInfo = globalWebSocketManager.getConnectionInfo();
    console.log('PredictionModule: 初始连接状态:', initialInfo);

    // 从WebSocket连接信息中获取sessionId
    const updateSessionId = () => {
      const info = globalWebSocketManager.getConnectionInfo();
      console.log('PredictionModule: 获取连接信息:', info);
      const sid = info?.socketId as string;
      if (sid) {
        setSessionId(sid);
        globalWebSocketManager.setSessionId(sid);
        console.log('PredictionModule: 设置sessionId:', sid);
      } else {
        console.log('PredictionModule: 未获取到socketId');
      }
    };

    // 监听WebSocket连接成功事件，获取sessionId
    const unsubscribeConnect = globalWebSocketManager.onConnect(() => {
      console.log('PredictionModule: WebSocket连接成功，获取sessionId');
      updateSessionId();
    });

    // 检查是否已经连接，如果已连接则立即获取sessionId
    const initialConnectionHealth = globalWebSocketManager.checkConnectionHealth();
    console.log('PredictionModule: 初始连接健康状态:', initialConnectionHealth);
    if (initialConnectionHealth) {
      console.log('PredictionModule: WebSocket已连接，立即获取sessionId');
      updateSessionId();
    }

    // 添加连接状态监控（类似chat页面）
    const checkConnection = () => {
      const connectionInfo = globalWebSocketManager.getConnectionInfo();
      console.log('PredictionModule: WebSocket连接状态:', connectionInfo);
      
      if (!globalWebSocketManager.checkConnectionHealth()) {
        console.warn('PredictionModule: WebSocket连接异常，尝试重连...');
        globalWebSocketManager.reconnect();
      }
    };

    // 立即检查一次连接状态
    checkConnection();

    // 每30秒检查一次连接状态
    const healthCheckInterval = setInterval(checkConnection, 30000);

    // 监听WebSocket消息
    console.log('PredictionModule: 注册WebSocket消息监听器');
    const unsubscribeMessage = globalWebSocketManager.onMessage((data) => {
      console.log('PredictionModule收到WebSocket消息:', data);
      
      try {
        // 处理不同格式的数据
        let parsedData = data;
        if (typeof data === 'string') {
          parsedData = JSON.parse(data);
        }
        
        // 处理数组格式: ["cell-performance-events", {...}]
        if (Array.isArray(parsedData) && parsedData.length >= 2 && parsedData[0] === 'cell-performance-events') {
          const eventData = parsedData[1];
          console.log('收到LLM分析事件 (数组格式):', eventData);
          
          if (eventData?.data) {
            setAnalysisContent(prev => prev + eventData.data);
            // 确保在接收数据时分析状态为进行中
            setIsAnalyzing(prevState => {
              if (!prevState) {
                console.log('设置分析状态为进行中 (数组格式)');
              }
              return true;
            });
          }
          
          // 检查是否完成
          if (eventData?.finished === true || eventData?.complete === true || eventData?.done === true) {
            setIsAnalyzing(false);
            setHasAnalysisResult(true);
            setAnalysisStartTime(null); // 清理开始时间
            console.log('LLM分析完成 (数组格式)');
          }
          return;
        }
        
        // 处理非数组格式: 对象包含 data 和 history_id 字段
        if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
          // 检查是否为 cell-performance-events 相关的对象格式
          if (parsedData.history_id !== undefined && parsedData.data !== undefined) {
            console.log('收到LLM分析事件 (对象格式):', parsedData);
            
            // 使用函数式更新获取最新的 predictionResults
            setPredictionResults(currentPredictionResults => {
              console.log('当前 predictionResults:', currentPredictionResults);
              
              // 验证 history_id 是否匹配当前预测结果的 id
              if (currentPredictionResults && currentPredictionResults.id !== undefined && parsedData.history_id === currentPredictionResults.id) {
                // 如果有数据内容，追加到分析内容中
                if (typeof parsedData.data === 'string' && parsedData.data.trim()) {
                  setAnalysisContent(prev => prev + parsedData.data);
                }
                
                // 只要收到对应 history_id 的消息就标记分析完成
                setIsAnalyzing(false);
                setHasAnalysisResult(true);
                setAnalysisStartTime(null); // 清理开始时间
                console.log('LLM分析完成 (对象格式)，history_id:', parsedData.history_id);
              } else {
                console.log('收到的消息 history_id 不匹配当前预测结果，忽略:', {
                  'received_history_id': parsedData.history_id,
                  'current_prediction_id': currentPredictionResults?.id,
                  'has_predictionResults': !!currentPredictionResults,
                  'prediction_id_defined': currentPredictionResults?.id !== undefined
                });
              }
              
              // 返回原有的 predictionResults，不修改
              return currentPredictionResults;
            });
            return;
          }
          
          // 处理其他对象格式消息
          if (parsedData.event_name && parsedData.event_name !== 'cell-performance-events') {
            console.log('收到其他类型事件:', parsedData.event_name, parsedData);
            // 可以在这里添加对其他事件类型的处理
            return;
          }
          
          // 兜底处理：如果有 data 字段但格式不明确
          if (parsedData.data !== undefined) {
            console.log('收到未识别格式的消息，尝试处理 data 字段:', parsedData);
            if (typeof parsedData.data === 'string' && parsedData.data.trim()) {
              setAnalysisContent(prev => prev + parsedData.data);
              // 确保分析状态正确
              setIsAnalyzing(prevState => prevState || true);
            }
            // 如果没有明确的结束标识，保持分析状态
            return;
          }
        }
        
        // 处理其他格式或纯字符串消息
        console.log('收到其他格式消息:', parsedData);
        if (typeof parsedData === 'string') {
          setAnalysisContent(prev => prev + parsedData);
        }
        
      } catch (error) {
        console.error('处理WebSocket消息失败:', error);
      }
    });

    return () => {
      console.log('PredictionModule: 清理WebSocket监听');
      unsubscribeMessage && unsubscribeMessage();
      unsubscribeConnect && unsubscribeConnect();
      clearInterval(healthCheckInterval);
    };
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
    if (!selectedBatterySystem) {
      alert(t('performance.ui.invalidBatterySystem'));
      return;
    }

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
        battery_system_id: parseInt(selectedBatterySystem.id)
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
        try{
          if(responseData.model_result) {
            const model_result = JSON.parse(responseData.model_result);
            responseData = {
              ...responseData,
              temperature_25_CE_label: model_result?.ce_cl_result?.temperature_25_CE_label?.toString(),
              temperature_25_CE_prob: model_result?.ce_cl_result?.temperature_25_CE_prob?.toString(),
              temperature_25_CL_label: model_result?.ce_cl_result?.temperature_25_CL_label?.toString(),
              temperature_25_CL_prob: model_result?.ce_cl_result?.temperature_25_CL_prob?.toString(),
              temperature_25_CR_label: model_result?.cr_result?.temperature_25_CR_label?.toString(),
              temperature_25_CR_prob: model_result?.cr_result?.temperature_25_CR_prob?.toString(),
              temperature_45_CE_label: model_result?.ce_cl_result?.temperature_45_CE_label?.toString(),
              temperature_45_CE_prob: model_result?.ce_cl_result?.temperature_45_CE_prob?.toString(),
              temperature_45_CL_label: model_result?.ce_cl_result?.temperature_45_CL_label?.toString(),
              temperature_45_CL_prob: model_result?.ce_cl_result?.temperature_45_CL_prob?.toString()
            };
          }
        } catch (error) {
          console.error('Error parsing API data:', error);
        }
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
    
    if (!selectedSystem) {
      alert(t('performance.ui.pleaseSelectBattery'));
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

    if (!sessionId) {
      console.error('LLM分析失败: sessionId未设置');
      alert(t('performance.ui.sessionNotInitialized'));
      return;
    }

    console.log('LLM分析开始: sessionId =', sessionId);

    const selectedBatterySystem = batterySystemOptions?.find(s => s.name === selectedSystem);
    if (!selectedBatterySystem) {
      alert(t('performance.ui.invalidBatterySystem'));
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisContent('');
    setHasAnalysisResult(false);
    setAnalysisStartTime(new Date()); // 记录分析开始时间

    try {
      const currentLang = getCurrentLanguage();
      const analysisParams: LLMAnalysisRequest = {
        id: predictionResults.id,
        battery_system_id: parseInt(selectedBatterySystem.id),
        session_id: sessionId,
        lang: currentLang
      };

      console.log('发送LLM分析请求:', analysisParams);
      console.log('predictionResults', predictionResults);
      const response = await requestLLMAnalysis(analysisParams);
      console.log('LLM分析API响应:', response);
      
      // API调用成功后，等待WebSocket消息
    } catch (error) {
      console.error('LLM分析请求失败:', error);
      setAnalysisError(t('performance.ui.analysisFailed'));
      setIsAnalyzing(false);
      setHasAnalysisResult(false);
      setAnalysisStartTime(null); // 清理开始时间
    }
  };

  // Unified processing function based on Python logic
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

    let quantification_result: any = {};
    try{
      const model_result = JSON.parse((predictionResults as any)?.model_result);
      quantification_result = model_result?.quantification_result ?? {};
    } catch (error) {
      console.error('Error parsing API data:', error);
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

    // Reset display states
    setShowSpecs(true);
    setShowResults(false);
    setActiveTab('25c');
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

  // Helper function to render result badge
  const renderResultBadge = (metric: any, metricType: 'cycleLife' | 'ce' | 'ratePerformance') => {
    const isPositive = metric.status === 'Positive';
    const isNegative = metric.status === 'Negative';
    
    // 获取百分比数值
    let percentValue = 0;
    if (typeof metric.confidence === 'string') {
      percentValue = Math.abs(parseFloat(metric.confidence.replace('%', '')));
    } else if (typeof metric.confidence === 'number') {
      percentValue = Math.abs(metric.confidence);
    }
    
    // 根据百分比值判断严重程度级别
    let level = '';
    if (percentValue < 5) {
      level = 'light';
    } else if (percentValue >= 5 && percentValue <= 25) {
      level = 'medium';
    } else if (percentValue > 25) {
      level = 'dark';
    }
    
    const badgeClass = `${isPositive ? 'positive' : isNegative ? 'negative' : 'unknown'}-${level}`;
    
    // 选择箭头图标 - 使用自定义箭头
    const ArrowIcon = isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : null;
    
    // CE 只显示箭头
    if (metricType === 'ce') {
      return (
        <div className={`pm-performance-result-badge pm-performance-result-badge--${badgeClass} pm-performance-result-badge--ce-only`}>
          <span className="pm-performance-result-badge__arrow">
            {ArrowIcon && <ArrowIcon size={16} />}
          </span>
        </div>
      );
    }
    
    // 其他指标显示箭头 + 百分比
    const value = percentValue > 0 ? `${percentValue}%` : '';
    
    return (
      <div className={`pm-performance-result-badge pm-performance-result-badge--${badgeClass}`}>
        <span className="pm-performance-result-badge__text">
          {ArrowIcon && <ArrowIcon size={15} />}
          {value && <span>{value}</span>}
        </span>
      </div>
    );
  };

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
                // 选择模型后显示电池规格
                if (value) {
                  setShowSpecs(true);
                }
              }}
              options={mockModels}
              groupBy="category"
              groupByLabel={{
                'base': t('performance.modelSelection.baseModel', 'Base Model'),
                'finetuned': t('performance.modelSelection.finetunedModels', 'Fine-tuned Models')
              }}
              columns={[
                { key: 'name', title: t('performance.modelSelection.columns.modelName', 'Model Name'), width: '40%' },
                { key: 'id', title: t('performance.modelSelection.columns.modelId', 'Model ID'), width: '30%' },
                { key: 'baseModel', title: t('performance.modelSelection.columns.baseModel', 'Base Model'), width: '30%' }
              ]}
              searchable
              pageSize={20}
              placeholder={t('performance.modelSelection.placeholder', '请选择预测模型')}
              className="pm-model-select"
              fieldNames={{ label: 'name', value: 'id' }}
            />
          </div>

          {selectedModel && showSpecs && currentSpec && (
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
                <div className="pm-spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.cathode')}</label>
                  <span>{currentSpec.cathode}</span>
                </div>
                
                <div className="pm-spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.anode')}</label>
                  <span>{currentSpec.anode}</span>
                </div>
                
                <div className="pm-spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.benchmarkElectrolyte')}</label>
                  <span>{currentSpec.electrolyte}</span>
                </div>
                
                <div className="pm-spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.cellDesign')}</label>
                  <span>{currentSpec.cellDesign}</span>
                </div>
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
                  value="1.9"
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

          <button 
            className={`pm-calculate-btn ${showResults ? 'pm-calculated' : ''} ${isCalculating ? 'pm-calculating' : ''} ${isInvalidSmiles ? 'pm-disabled' : ''}`}
            onClick={handleCalculate}
            disabled={isCalculating || showResults}
          >
            {isCalculating ? t('performance.ui.calculating') : t('performance.calculate.button')}
          </button>

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
                arrow
                PopperProps={{
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'white',
                      color: 'black',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '14px',
                      maxWidth: 500,
                      minWidth: 380,
                      border: 'none'
                    },
                    '& .MuiTooltip-arrow': {
                      color: 'white',
                    }
                  }
                }}
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
              <div className="pm-temperature-tabs" data-active={activeTab}>
              <button 
                className={`pm-temp-tab ${activeTab === '25c' ? 'active' : ''}`}
                onClick={() => setActiveTab('25c')}
              >
                {t('performance.results.temperatureTabs.temp25')}
              </button>
              <button 
                className={`pm-temp-tab ${activeTab === '45c' ? 'active' : ''} ${!isHighTier ? 'disabled' : ''}`}
                onClick={() => isHighTier && setActiveTab('45c')}
                disabled={!isHighTier}
              >
                {t('performance.results.temperatureTabs.temp45')}
              </button>
            </div>

            <div className="pm-results-content">
              {activeTab === '25c' && (
                <div className="pm-performance-results">
                  <div className="pm-result-item">
                    <div className="pm-result-label">{t('performance.results.performance.cycleLife25')}</div>
                    {renderResultBadge(resultsData['25c'].cycleLife, 'cycleLife')}
                  </div>

                  <div className={`pm-results-group ${!isHighTier ? 'pm-with-overlay' : ''}`} data-overlay-text={t('performance.results.upgradeToViewMetrics')}>
                    <div className="pm-result-item">
                      <div className="pm-result-label">{t('performance.results.performance.ce25')}</div>
                      {renderResultBadge(resultsData['25c'].ce, 'ce')}
                    </div>

                    <div className="pm-result-item">
                      <div className="pm-result-label">{t('performance.results.performance.ratePerformance25')}</div>
                      {renderResultBadge(resultsData['25c'].ratePerformance, 'ratePerformance')}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '45c' && (
                <div className={`pm-performance-results ${!isHighTier ? 'pm-with-overlay' : ''}`} data-overlay-text={t('performance.results.upgradeToViewMetrics')}>
                  <div className="pm-result-item">
                    <div className="pm-result-label">{t('performance.results.performance.cycleLife45')}</div>
                    {renderResultBadge(resultsData['45c'].cycleLife, 'cycleLife')}
                  </div>

                  <div className="pm-result-item">
                    <div className="pm-result-label">{t('performance.results.performance.ce45')}</div>
                    {renderResultBadge(resultsData['45c'].ce, 'ce')}
                  </div>
                </div>
              )}
            </div>

              <div className="pm-llm-button-section">
                <button
                  className={`pm-llm-analysis-btn ${isAnalyzing ? 'pm-analyzing' : ''} ${hasAnalysisResult ? 'pm-analyzed' : ''}`}
                  onClick={handleLLMAnalysis}
                  disabled={isAnalyzing || !predictionResults || hasAnalysisResult || !isHighTier}
                >
                  {isAnalyzing ? t('performance.ui.analyzing') : t('performance.llmAnalysis.button')}
                </button>

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
