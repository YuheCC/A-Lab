import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, Play, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { predict, type HistoryDetailResponse } from '@/services/prediction/predictionTool';
import { normalizeServerDate } from '@/utils/messageUtils';
import { useAuthStore } from '@/models/useAuth';
import CycleLifeScatterChart from './CycleLifeScatterChart';
import ModelSelect from '@/components/ModelSelect';
import { getModelList } from '../model';
import type { ModelListItem } from '@/services/model/training';

// 模型选项接口
interface ModelOption {
  id: string;
  name: string;
  baseModel: string;
  category: 'base' | 'finetuned';
}

interface StepContentProps {
  activeStep: number;
  onStepChange?: (step: number) => void;
  onPredictionComplete?: () => void;
  onReset?: () => void;
}

const StepContent: React.FC<StepContentProps> = ({ activeStep, onStepChange, onPredictionComplete, onReset }) => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictionResult, setPredictionResult] = useState<HistoryDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 模型选择相关状态
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(false);

  // 获取模型列表
  useEffect(() => {
    const fetchModelOptions = async () => {
      setIsModelLoading(true);
      try {
        const response = await getModelList({ page_size: 100, status: 'online' });

        if (!response?.data || response.data.length === 0) {
          console.log('No model data found');
          setIsModelLoading(false);
          return;
        }

        // 转换为 ModelOption 格式
        const convertToModelOption = (item: ModelListItem): ModelOption => {
          let category: 'base' | 'finetuned' = 'finetuned';

          // 根据 base_model_id 判断分类
          if (item.base_model_id === -1) {
            category = 'base';
          }

          return {
            id: item.id.toString(),
            name: item.model_name,
            baseModel: category === 'base' ? '-' : (item.base_model_name || '-'),
            category,
          };
        };

        const allModels = response.data.map(convertToModelOption);

        if (allModels.length > 0) {
          setModelOptions(allModels);
        }
      } catch (error) {
        console.error('获取模型列表失败:', error);
      } finally {
        setIsModelLoading(false);
      }
    };

    fetchModelOptions();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleDownloadSampleData = () => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = '/predict/demo.csv';
    link.download = 'demo.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetAll = () => {
    // 重置所有状态
    setUploadedFile(null);
    setIsUploading(false);
    setIsProcessing(false);
    setProgress(0);
    setPredictionResult(null);
    setError(null);
    setSelectedModel('');
    
    // 回到第一步
    if (onStepChange) {
      onStepChange(0);
    }
    
    // 调用父组件的重置回调
    if (onReset) {
      onReset();
    }
  };

  const handleStartPrediction = async () => {
    if (!uploadedFile) {
      setError(t('predictionTool.prediction.pleaseUploadFirst'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);
    
    try {
      let currentProgress = 0;
      
      // 阶段1: 文件上传阶段 (0-30%)
      const uploadInterval = setInterval(() => {
        setProgress(prevProgress => {
          currentProgress = Math.min(prevProgress + Math.random() * 5 + 2, 30);
          return currentProgress;
        });
      }, 300);

      // 调用真实的预测接口（包含轮询）
      const result = await predict({
        file: uploadedFile,
        model_id: selectedModel
      });
      
      // 清除上传进度更新
      clearInterval(uploadInterval);
      
      // 阶段2: 完成 (100%)
      setProgress(100);

      // 预测结果为空时，不跳转并提示错误
      if (!result || Object.keys(result).length === 0) {
        setIsProcessing(false);
        setPredictionResult(null);
        setError(null);
        return;
      }
      
      // 保存预测结果
      setPredictionResult(result);
      setIsProcessing(false);
      
      // 刷新历史记录
      if (onPredictionComplete) {
        onPredictionComplete();
      }
      
      // 自动跳转到结果页面
      setTimeout(() => {
        if (onStepChange) {
          onStepChange(2);
        }
      }, 500);
      
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      console.log('Prediction error:', err);
      setError(err.message || t('predictionTool.errors.predictionFailed'));
      console.error('Prediction error:', err);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // 数据上传
        if (isUploading) {
          return (
            <div className="upload-area">
              <div className="upload-progress">
                <RefreshCw className="loading-icon" />
                <h4 className="upload-title">{t('predictionTool.upload.uploading')}</h4>
                <p className="upload-subtitle">{t('predictionTool.upload.waitText')}</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="upload-step-container">
            {/* 模型选择区域 */}
            <div className="step-content-model-selection">
              <label className="step-content-model-label">{t('predictionTool.modelSelection.label', 'Select a Model')}</label>
              <ModelSelect
                mode="single"
                value={selectedModel}
                onChange={(value) => setSelectedModel(value as string)}
                options={modelOptions}
                loading={isModelLoading}
                groupBy="category"
                groupByLabel={{
                  'base': t('predictionTool.modelSelection.baseModel', 'Base Model'),
                  'finetuned': t('predictionTool.modelSelection.finetunedModels', 'Fine-tuned Models')
                }}
                columns={[
                  { key: 'name', title: t('predictionTool.modelSelection.columns.modelName', 'Model Name'), width: '40%' },
                  {
                    key: 'id',
                    title: t('predictionTool.modelSelection.columns.modelId', 'Model ID'),
                    width: '30%',
                    render: (value: any) => `PM-${String(value).padStart(6, '0')}`
                  },
                  { key: 'baseModel', title: t('predictionTool.modelSelection.columns.baseModel', 'Base Model'), width: '30%' }
                ]}
                searchable
                pageSize={20}
                placeholder={t('predictionTool.modelSelection.placeholder', 'Choose a model')}
                className="step-content-model-select"
                fieldNames={{ label: 'name', value: 'id' }}
              />
            </div>

            {/* 文件上传区域 */}
            <div className="step-content-upload-section">
              <label className="step-content-upload-label">{t('predictionTool.upload.title', 'Upload Data')}</label>
              {uploadedFile ? (
                <div className="step-content-uploaded-file">
                  <div className="step-content-file-info">
                    <FileText className="step-content-file-icon" size={18} />
                    <div className="step-content-file-details">
                      <span className="step-content-file-name">{uploadedFile.name}</span>
                      <span className="step-content-file-size">{formatFileSize(uploadedFile.size)}</span>
                    </div>
                  </div>
                  <span 
                    className="step-content-remove-file"
                    onClick={() => setUploadedFile(null)}
                  >
                    {t('predictionTool.upload.removeFile', 'Remove file')}
                  </span>
                </div>
              ) : (
                <div className="upload-area">
                  <Upload className="step-content-upload-icon" size={32} />
                  <h4 className="upload-title">{t('predictionTool.upload.clickToUpload')}</h4>
                  <p className="upload-subtitle">
                    {t('predictionTool.upload.subtitle')}
                  </p>
                  <label className="select-file-btn" htmlFor="file-upload">
                    {t('predictionTool.upload.selectFile')}
                    <input
                      id="file-upload"
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </div>
            
            {/* 数据格式要求提示 - 放置在upload区域外部下方靠左 */}
            <div className="data-format-tip">
              <div className="tip-header">
                <span className="tip-title">{t('predictionTool.upload.dataFormatTip')}</span>
                <span 
                  className="tip-sample-link" 
                  onClick={handleDownloadSampleData}
                  style={{ cursor: 'pointer' }}
                >
                  {t('predictionTool.upload.sampleData')}
                </span>
              </div>

              <div className="tip-content">
                <div className="tip-row">
                  <span className="tip-label">{t('predictionTool.upload.requiredFields')}</span>
                  <span className="tip-value">{t('predictionTool.upload.requiredFieldsValue')}</span>
                </div>

                <div className="tip-row">
                  <span className="tip-label">{t('predictionTool.upload.currentDirection')}</span>
                  <span className="tip-value">{t('predictionTool.upload.currentDirectionValue')}</span>
                </div>

                <div className="tip-row">
                  <span className="tip-label">{t('predictionTool.upload.unitRequirement')}</span>
                  <span className="tip-value">{t('predictionTool.upload.unitRequirementValue')}</span>
                </div>

                <div className="tip-row">
                  <span className="tip-label">{t('predictionTool.upload.dataRequirement')}</span>
                  <span className="tip-value">{t('predictionTool.upload.dataRequirementValue')}</span>
                </div>
              </div>
            </div>

            {/* 开始预测按钮 */}
            <div className="step-content-actions">
              <button
                className="step-content-start-btn"
                onClick={handleStartPrediction}
                disabled={!selectedModel || !uploadedFile || isProcessing}
              >
                {t('predictionTool.prediction.startPrediction', 'Start Prediction')}
              </button>
            </div>
          </div>
        );
      
      case 1: // AI预测
        return (
          <div className="prediction-area">
            <div className="uploaded-files-section">
              <div className="section-header">
                <h4 className="section-title">{t('predictionTool.prediction.uploadedData')}</h4>
                <button className="refresh-btn" onClick={handleResetAll}>
                  <RefreshCw size={12} />
                  {t('predictionTool.prediction.changeFile')}
                </button>
              </div>
              
              <div className="file-info-card">
                <div className="file-info-content">
                  <FileText className="file-icon" />
                  <div className="file-details">
                    <div className="file-name-display">
                      {uploadedFile?.name || ""}
                    </div>
                    <div className="file-meta">
                      {t('predictionTool.prediction.fileSize')}: {uploadedFile ? formatFileSize(uploadedFile.size) : '19.15 MB'} · {t('predictionTool.prediction.fileType')}: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isProcessing && (
              <div className="prediction-progress">
                <div className="progress-header">
                  <span className="progress-label">{t('predictionTool.prediction.progressLabel')}</span>
                  <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {progress < 30 ? t('predictionTool.prediction.uploadingFile') : t('predictionTool.prediction.processing')}
                </p>
              </div>
            )}
            
            {error && isAuthenticated && (
              <div className="error-message" style={{
                color: '#e53e3e',
                backgroundColor: '#fed7d7',
                padding: '12px',
                borderRadius: '6px',
                margin: '16px 0',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            {!isProcessing && (
              <button
                className="start-prediction-btn"
                onClick={handleStartPrediction}
              >
                <Play size={14} />
                {t('predictionTool.prediction.startPrediction')}
              </button>
            )}
          </div>
        );
      
      case 2: // 结果展示
        if (!predictionResult) {
          return (
            <div className="results-display">
              <div className="error-message" style={{
                color: '#e53e3e',
                backgroundColor: '#fed7d7',
                padding: '12px',
                borderRadius: '6px',
                textAlign: 'center'
              }}>
                {t('predictionTool.results.noResults')}
              </div>
            </div>
          );
        }

        // 计算平均循环寿命
        const avgCycleLife1 = predictionResult.avg_cycle_life_1 || 0;
        const avgCycleLife2 = predictionResult.avg_cycle_life_2 || 0;

        // 格式化创建时间
        const formatDate = (dateString: string) => {
          return new Date(normalizeServerDate(dateString)).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        };

        return (
          <div className="results-display">
            <div className="results-stats-card">
              <div className="results-stats">
                <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.batteryCount')}</div>
                  <div className="stats-value">{predictionResult.barcode_count}{t('predictionTool.results.batteryCountUnit')}</div>
                </div>
                {/* <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.avgCycleLife1')}</div>
                  <div className="stats-value">{avgCycleLife1 >= 0 ? `${(avgCycleLife1 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}</div>
                </div> */}
                {/* <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.avgCycleLife2')}</div>
                  <div className="stats-value">{avgCycleLife2 >= 0 ? `${(avgCycleLife2 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}</div>
                </div> */}
                <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.predictionTime')}</div>
                  <div className="stats-value">{formatDate(predictionResult.created_at)}</div>
                </div>
              </div>
            </div>

            {/* 免责声明提示 */}
            <div 
              className="disclaimer-tip" 
              style={{
                margin: '20px 0',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#4a5568'
              }}
              dangerouslySetInnerHTML={{ __html: t('predictionTool.disclaimer') }}
            />
            
            <div className="results-table-card">
              <div className="results-table">                
                {/* 显示详细的条形码预测结果 */}
                {predictionResult.brcode_data && predictionResult.brcode_data.length > 0 ? (
                  <table className="prediction-table">
                    <thead>
                      <tr>
                        <th className="barcode-col">{t('predictionTool.results.barcode')}</th>
                        <th className="cycle-life-col">{t('predictionTool.results.cycleLife1')}</th>
                        {/* <th className="cycle-life-col">{t('predictionTool.results.cycleLife2')}</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {predictionResult.brcode_data.map((item) => {
                        // 当状态为fail且cycle_life为null时，显示fail_reason
                        const getCycleLife1Display = () => {
                          if (predictionResult.status === 'fail' && item.cycle_life_1 === null && predictionResult.fail_reason_1) {
                            return predictionResult.fail_reason_1;
                          }
                          return parseFloat((item.cycle_life_1 || 0).toString()).toFixed(0);
                        };

                        const getCycleLife2Display = () => {
                          if (predictionResult.status === 'fail' && item.cycle_life_2 === null && predictionResult.fail_reason_2) {
                            return predictionResult.fail_reason_2;
                          }
                          return parseFloat((item.cycle_life_2 || 0).toString()).toFixed(0);
                        };

                        return (
                          <tr key={item.id}>
                            <td className="barcode-cell" title={item.barcode}>{item.barcode}</td>
                            <td className="cycle-life-cell">{getCycleLife1Display()}</td>
                            {/* <td className="cycle-life-cell">{getCycleLife2Display()}</td> */}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginLeft: '20px' }}>
                    {t('predictionTool.results.noDetailedData')}
                  </p>
                )}
              </div>
              
              {/* 检查brcode_data中是否有status=fail的数据，如果有则显示提示信息 - 移到table容器外 */}
              {predictionResult.brcode_data && predictionResult.brcode_data.length > 0 && predictionResult.brcode_data.some(item => item.status === 'fail') && (
                <div className="data-requirement-notice" style={{
                  color: '#d69e2e',
                  backgroundColor: '#fefcbf',
                  border: '1px solid #f6e05e',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  marginTop: '16px',
                  fontSize: '14px',
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}>
                  {t('predictionTool.results.dataRequirementNotMet')}
                  <span 
                    style={{
                      color: '#3182ce',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginLeft: '2px'
                    }}
                    onClick={() => {
                      window.location.href = 'mailto:partnership@ses.ai?subject=Data Processing Support Request&body=Hello, I need help with data processing for battery life prediction.';
                    }}
                  >
                    {t('predictionTool.results.contactSupport')}
                  </span>
                  。
                </div>
              )}
            </div>

            {/* 散点图展示 */}
            {predictionResult.brcode_data && predictionResult.brcode_data.length > 0 && (
              <div className="scatter-chart-card" style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <CycleLifeScatterChart
                  brcodeData={predictionResult.brcode_data}
                />
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="upload-area">
            <h4 className="upload-title">{t('predictionTool.default.selectStep')}</h4>
            <p className="upload-subtitle">
              {t('predictionTool.default.selectStepDescription')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="upload-content">
      {renderStepContent()}
    </div>
  );
};

export default StepContent;
