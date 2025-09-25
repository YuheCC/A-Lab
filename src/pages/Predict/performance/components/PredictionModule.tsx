import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import { Info } from 'lucide-react';
import { moleculeService, type MoleculeDetails } from '@/services/chat/moleculeService';
import { getBatterySystemList, predictPerformance, requestLLMAnalysis, type PerformancePredictionResponse, type LLMAnalysisRequest } from '@/services/prediction/performance';
import { globalWebSocketManager } from '@/services/chat/wsService';
import { useAuthStore } from '@/models/useAuth';
import MolViewer2D from '@/components/NodePopup/MolViewer2D.js';
import './PredictionModule.css';
import InlineMoleculeRenderer from '@/components/InlineMoleculeRenderer';
import CustomSelect from './CustomSelect';

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
  const userPermissions = useAuthStore(state => state.userPermissions);
  const [selectedSystem, setSelectedSystem] = useState('');
  const [additive, setAdditive] = useState('');
  const [showSpecs, setShowSpecs] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'25c' | '45c'>('25c');
  const [showLLMAnalysis, setShowLLMAnalysis] = useState(false);

  // 权限判断
  const isHighTier = useMemo(() => {
    return ['admin', 'enterprise', 'joint'].includes(userPermissions || '');
  }, [userPermissions]);

  
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

  // 从选中的电池系统中获取规格信息
  const getCurrentSpec = (): SystemSpec | null => {
    if (!selectedSystem) return null;
    const system = batterySystemOptions.find(s => s.name === selectedSystem);
    if (!system) return null;
    
    return {
      cathode: system.cathode,
      anode: system.anode,
      electrolyte: system.benchmark_electrolyte,
      cellDesign: system.cell_design
    };
  };

  const currentSpec = getCurrentSpec();

  // 获取电池系统选项
  useEffect(() => {
    const fetchBatterySystemOptions = async () => {
      try {
        setIsBatterySystemLoading(true);
        const response = await getBatterySystemList();
        if (response?.data) {
          setBatterySystemOptions(response.data);
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
    const selectedBatterySystem = batterySystemOptions.find(s => s.name === selectedSystem);
    if (!selectedBatterySystem) {
      alert(t('performance.ui.invalidBatterySystem'));
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);
    setPredictionResults(null);
    // 重置LLM分析状态，因为要进行新的计算
    setHasAnalysisResult(false);
    setAnalysisContent('');
    setIsAnalyzing(false);

    try {
      const response = await predictPerformance({
        smiles: additive.trim(),
        battery_system_id: parseInt(selectedBatterySystem.id)
      });

      if (response?.data) {
        setPredictionResults(response.data);
        setShowResults(true);
        console.log('Prediction results:', response.data);
      } else {
        throw new Error('No data received from prediction API');
      }
    } catch (error) {
      console.error('Prediction failed:', error);
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

    const selectedBatterySystem = batterySystemOptions.find(s => s.name === selectedSystem);
    if (!selectedBatterySystem) {
      alert(t('performance.ui.invalidBatterySystem'));
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisContent('');
    setHasAnalysisResult(false);

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
    const confidence = parseFloat((prob * 100).toFixed(1));
    const displayConfidence = label === 0 ? 100 - confidence : confidence;
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

    // Process each metric using unified logic
    const temp25_CE = processPerformanceMetric(
      predictionResults.temperature_25_CE_prob,
      predictionResults.temperature_25_CE_label
    );
    
    const temp25_CL = processPerformanceMetric(
      predictionResults.temperature_25_CL_prob,
      predictionResults.temperature_25_CL_label
    );
    
    const temp25_CR = processPerformanceMetric(
      predictionResults.temperature_25_CR_prob,
      predictionResults.temperature_25_CR_label
    );
    
    const temp45_CE = processPerformanceMetric(
      predictionResults.temperature_45_CE_prob,
      predictionResults.temperature_45_CE_label
    );
    
    const temp45_CL = processPerformanceMetric(
      predictionResults.temperature_45_CL_prob,
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
    
    // Reset to first battery system if available
    if (batterySystemOptions.length > 0) {
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
  const renderResultBadge = (metric: any) => {
    const isPositive = metric.status === 'Positive';
    const isNegative = metric.status === 'Negative';
    const badgeClass = isPositive ? 'positive' : isNegative ? 'negative' : 'unknown';
    const icon = isPositive ? '✓' : isNegative ? '✕' : '?';
    const statusText = isPositive ? t('performance.results.status.positive') : 
                       isNegative ? t('performance.results.status.negative') : 
                       t('performance.results.status.neutral');

    return (
      <div className={`result-badge ${badgeClass}`}>
        <span className="result-icon">{icon}</span>
        {statusText}
      </div>
    );
  };

  return (
    <div className="prediction-module">
      <div className="module-section">
        <h2>{t('performance.batterySystemSelection.title')}</h2>
        
        <div className="module-content-card">
          <div className="form-group">
            <label>{t('performance.batterySystemSelection.label')}</label>
            <CustomSelect
              value={selectedSystem}
              onChange={setSelectedSystem}
              onOptionClick={(option, isSelected) => {
                if(!showSpecs && selectedSystem) {
                  setShowSpecs(true);
                }
                // 这里可以添加你需要的option点击处理逻辑
              }}
              options={isBatterySystemLoading ?
                [{ id: 'loading', name: t('performance.batterySystemSelection.loading'), disabled: true }] :
                batterySystemOptions.map(system => ({
                  id: system.id,
                  name: system.name,
                  disabled: Number(system.id) !== 1,
                  disabledText: Number(system.id) !== 1 ? t('formulation.comingSoon', 'Will be available soon') : undefined
                }))
              }
              className="system-select"
              disabled={isBatterySystemLoading}
              placeholder={t('performance.batterySystemSelection.loading')}
            />
          </div>

          {showSpecs && currentSpec && (
            <div className="system-specs">
              <div className="specs-header">
                <span>{t('performance.batterySystemSelection.systemSpecs.title')}</span>
                <button 
                  className="close-specs"
                  onClick={() => setShowSpecs(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="specs-grid">
                <div className="spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.cathode')}</label>
                  <span>{currentSpec.cathode}</span>
                </div>
                
                <div className="spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.anode')}</label>
                  <span>{currentSpec.anode}</span>
                </div>
                
                <div className="spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.benchmarkElectrolyte')}</label>
                  <span>{currentSpec.electrolyte}</span>
                </div>
                
                <div className="spec-item">
                  <label>{t('performance.batterySystemSelection.systemSpecs.cellDesign')}</label>
                  <span>{currentSpec.cellDesign}</span>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="dual-input-row">
              <div className="dual-input-item">
                <label>
                  {t('performance.additive.label')} <span className="required">{t('performance.additive.required')}</span>
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
                  className="additive-input"
                />
              </div>

              <div className="dual-input-item">
                <label>
                  {t('performance.weightPercentage.label')}
                  <Tooltip title={t('performance.weightPercentage.tooltip')} placement="top">
                    <span className="info-icon">
                      ⓘ
                    </span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  value="1.9"
                  disabled
                  className="weight-percentage-input"
                />
              </div>
            </div>
          </div>

          {/* 分子详情显示区域 */}
          <div className="molecule-details-section" style={{ marginBottom: '20px' }}>
            {isMoleculeLoading && (
              <div className="molecule-loading">
                <p>{t('performance.moleculeInfo.loading')}</p>
              </div>
            )}

            {moleculeDetails && (
              <div className="molecule-information">
                <div className="molecule-header">
                  <h3>{t('performance.moleculeInfo.title')}</h3>
                  <button 
                    className="molecule-close-btn"
                    onClick={() => setMoleculeDetails(null)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="molecule-content">
                  <div className="molecule-structure">
                    {moleculeDetails.properties.smiles ? (
                      <MolViewer2D 
                        smile={moleculeDetails.properties.smiles} 
                        theme="light"
                      />
                    ) : (
                      <div className="structure-placeholder">
                        <div className="structure-circle">
                          <span>{t('performance.moleculeInfo.structurePlaceholder.line1')}</span>
                          <span>{t('performance.moleculeInfo.structurePlaceholder.line2')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="molecule-properties">
                    <div className="properties-grid">
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.smiles')}</label>
                          <span>{moleculeDetails.properties.smiles || '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.espMin')}</label>
                          <span>{typeof moleculeDetails.properties.espMin === 'number' ? moleculeDetails.properties.espMin.toFixed(2) + ' eV' : moleculeDetails.properties.espMin || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.molecularWeight')}</label>
                          <span>{typeof moleculeDetails.properties.molecularWeight === 'number' ? moleculeDetails.properties.molecularWeight.toFixed(2) : moleculeDetails.properties.molecularWeight || '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.predictedMp')}</label>
                          <span>{moleculeDetails.properties.meltingPoint || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.umapX')}</label>
                          <span>{moleculeDetails.properties.umapX !== undefined ? moleculeDetails.properties.umapX.toFixed(4) : '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.predictedBp')}</label>
                          <span>{moleculeDetails.properties.boilingPoint || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.umapY')}</label>
                          <span>{moleculeDetails.properties.umapY !== undefined ? moleculeDetails.properties.umapY.toFixed(4) : '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.predictedFp')}</label>
                          <span>{moleculeDetails.properties.flashPoint || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.homo')}</label>
                          <span>{typeof moleculeDetails.properties.homo === 'number' ? moleculeDetails.properties.homo.toFixed(4) + ' eV' : moleculeDetails.properties.homo || '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.combustionEnthalpy')}</label>
                          <span>{moleculeDetails.properties.combustionEnthalpy || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.lumo')}</label>
                          <span>{typeof moleculeDetails.properties.lumo === 'number' ? moleculeDetails.properties.lumo.toFixed(4) + ' eV' : moleculeDetails.properties.lumo || '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.commercialViability')}</label>
                          <span>{moleculeDetails.properties.commercialViability || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="property-row">
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.espMax')}</label>
                          <span>{typeof moleculeDetails.properties.espMax === 'number' ? moleculeDetails.properties.espMax.toFixed(3) + ' eV' : moleculeDetails.properties.espMax || '-'}</span>
                        </div>
                        <div className="property-item">
                          <label>{t('performance.moleculeInfo.properties.functionalGroups')}</label>
                          <span>{moleculeDetails.properties.functionalGroups ? (() => {
                            try {
                              const groups = JSON.parse(moleculeDetails.properties.functionalGroups);
                              return Array.isArray(groups) ? groups.join(', ') : moleculeDetails.properties.functionalGroups;
                            } catch {
                              return moleculeDetails.properties.functionalGroups;
                            }
                          })() : '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isInvalidSmiles && (
              <div className="smiles-error-display">
                <div className="error-header">
                  <h3>{t('performance.invalidSmiles.title')}</h3>
                </div>
                
                <div className="smiles-error-content">
                  <p>{t('performance.invalidSmiles.description')}</p>
                  <p>{t('performance.invalidSmiles.suggestion')}</p>
                  <div className="example-molecules">
                    <div className="molecule-examples">
                      <span className="example-molecule">[Li+].[O-]P(=O)(F)F</span>
                      <span className="example-molecule">O=C1OC(F)CO1</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            className={`calculate-btn ${showResults ? 'calculated' : ''} ${isCalculating ? 'calculating' : ''} ${isInvalidSmiles ? 'disabled' : ''}`}
            onClick={handleCalculate}
            disabled={isCalculating || showResults}
          >
            {isCalculating ? t('performance.ui.calculating') : t('performance.calculate.button')}
          </button>

          {calculationError && (
            <div className="calculation-error">
              <p>{calculationError}</p>
            </div>
          )}
        </div>

        {showResults && (
          <div className="results-section">
            <div className="results-title-container">
              <h2>{t('performance.results.title')}</h2>
              <Tooltip
                title={
                  <div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        flexShrink: 0,
                        marginTop: '6px'
                      }}></span>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          color: '#dc2626',
                          marginBottom: '4px'
                        }}>
                          {t('performance.results.negativeTitle')}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {t('performance.results.negativeTip')}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        flexShrink: 0,
                        marginTop: '6px'
                      }}></span>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '14px',
                          color: '#059669',
                          marginBottom: '4px'
                        }}>
                          {t('performance.results.positiveTitle')}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: '#6b7280',
                          margin: 0
                        }}>
                          {t('performance.results.positiveTip')}
                        </div>
                      </div>
                    </div>
                  </div>
                }
                placement="top"
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
                      maxWidth: 320,
                      minWidth: 280,
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
            
            <div className="results-card">
              <div className="temperature-tabs" data-active={activeTab}>
              <button 
                className={`temp-tab ${activeTab === '25c' ? 'active' : ''}`}
                onClick={() => setActiveTab('25c')}
              >
                {t('performance.results.temperatureTabs.temp25')}
              </button>
              <button 
                className={`temp-tab ${activeTab === '45c' ? 'active' : ''}`}
                onClick={() => setActiveTab('45c')}
              >
                {t('performance.results.temperatureTabs.temp45')}
              </button>
            </div>

            <div className="results-content">
              {activeTab === '25c' && (
                <div className="performance-results">
                  <div className="result-item">
                    <div className="result-label">{t('performance.results.performance.cycleLife25')}</div>
                    {renderResultBadge(resultsData['25c'].cycleLife)}
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{resultsData['25c'].cycleLife.confidence}%</span>
                    </div>
                  </div>

                  <div className={`result-item ${!isHighTier ? 'with-overlay' : ''}`} data-overlay-text={t('navigation.upgradeConfirmation.upgradeViewTitle')}>
                    <div className="result-label">{t('performance.results.performance.ce25')}</div>
                    {renderResultBadge(resultsData['25c'].ce)}
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{resultsData['25c'].ce.confidence}%</span>
                    </div>
                  </div>

                  <div className={`result-item ${!isHighTier ? 'with-overlay' : ''}`} data-overlay-text={t('navigation.upgradeConfirmation.upgradeViewTitle')}>
                    <div className="result-label">{t('performance.results.performance.ratePerformance25')}</div>
                    {renderResultBadge(resultsData['25c'].ratePerformance)}
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{resultsData['25c'].ratePerformance.confidence}%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === '45c' && (
                <div className="performance-results">
                  <div className={`result-item ${!isHighTier ? 'with-overlay' : ''}`} data-overlay-text={t('navigation.upgradeConfirmation.upgradeViewTitle')}>
                    <div className="result-label">{t('performance.results.performance.cycleLife45')}</div>
                    {renderResultBadge(resultsData['45c'].cycleLife)}
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{resultsData['45c'].cycleLife.confidence}%</span>
                    </div>
                  </div>

                  <div className={`result-item ${!isHighTier ? 'with-overlay' : ''}`} data-overlay-text={t('navigation.upgradeConfirmation.upgradeViewTitle')}>
                    <div className="result-label">{t('performance.results.performance.ce45')}</div>
                    {renderResultBadge(resultsData['45c'].ce)}
                    <div className="result-confidence">
                      <span className="confidence-label">{t('performance.results.confidence')}</span>
                      <span className="confidence-value">{resultsData['45c'].ce.confidence}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

              <div className="llm-button-section">
                <button 
                  className={`llm-analysis-btn ${isAnalyzing ? 'analyzing' : ''} ${hasAnalysisResult ? 'analyzed' : ''}`}
                  onClick={handleLLMAnalysis}
                  disabled={isAnalyzing || !predictionResults || hasAnalysisResult || !isHighTier}
                >
                  {isAnalyzing ? t('performance.ui.analyzing') : t('performance.llmAnalysis.button')}
                </button>
                
                {analysisError && (
                  <div className="analysis-error">
                    <p>{analysisError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(analysisContent || isAnalyzing || showLLMAnalysis) && (
          <div className="llm-analysis-section">
            <div className="llm-analysis-header">
              <h2>{t('performance.llmAnalysis.title')}</h2>
              {/* {(analysisContent || isAnalyzing) && (
                <button 
                  className="close-analysis-btn"
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
            
            <div className="llm-analysis-card">
              <div className="llm-content">
                {isAnalyzing && !analysisContent && (
                  <div className="analysis-loading">
                    <p>{t('performance.ui.startingAnalysis')}</p>
                    <div className="loading-spinner"></div>
                  </div>
                )}
                
                {analysisContent && (
                  <div className="analysis-content" style={{ fontSize: '14px', paddingTop: 0 }}>
                    <InlineMoleculeRenderer content={analysisContent} onMoleculeClick={() => {}} />
                  </div>
                )}
                
                {!analysisContent && !isAnalyzing && showLLMAnalysis && (
                  <div className="analysis-placeholder">
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