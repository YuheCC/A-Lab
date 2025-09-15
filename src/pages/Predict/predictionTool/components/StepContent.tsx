import React, { useState } from 'react';
import { FileText, RefreshCw, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { predict, type HistoryDetailResponse } from '@/services/prediction/predictionTool';
import { normalizeServerDate } from '@/utils/messageUtils';

interface StepContentProps {
  activeStep: number;
  onStepChange?: (step: number) => void;
  onPredictionComplete?: () => void;
  onReset?: () => void;
}

const StepContent: React.FC<StepContentProps> = ({ activeStep, onStepChange, onPredictionComplete, onReset }) => {
  const { t } = useTranslation();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [predictionResult, setPredictionResult] = useState<HistoryDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload process
      setTimeout(() => {
        setUploadedFile(file);
        setIsUploading(false);
        // Auto advance to AI prediction step
        if (onStepChange) {
          onStepChange(1);
        }
      }, 1500);
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleResetAll = () => {
    // 重置所有状态
    setUploadedFile(null);
    setIsUploading(false);
    setIsProcessing(false);
    setProgress(0);
    setPredictionResult(null);
    setError(null);
    
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
      const result = await predict({ file: uploadedFile });
      
      // 清除上传进度更新
      clearInterval(uploadInterval);
      
      // 阶段2: 完成 (100%)
      setProgress(100);
      
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
            <div className="upload-area">
              <h4 className="upload-title">{t('predictionTool.upload.clickToUpload')}</h4>
              <p className="upload-subtitle">
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
            
            {/* 数据格式要求提示 - 放置在upload区域外部下方靠左 */}
            <div className="data-format-tip">
              <div className="tip-header">
                <span className="tip-title">{t('predictionTool.upload.dataFormatTip')}</span>
                <span className="tip-sample-link">{t('predictionTool.upload.sampleData')}</span>
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
                      {uploadedFile?.name || '历史数据_20250110125920_001PE0XT00001DAB0800004_CAB1_1#检测通道.xlsx'}
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
            
            {error && (
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
                <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.avgCycleLife1')}</div>
                  <div className="stats-value">{avgCycleLife1 >= 0 ? `${(avgCycleLife1 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.avgCycleLife2')}</div>
                  <div className="stats-value">{avgCycleLife2 >= 0 ? `${(avgCycleLife2 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">{t('predictionTool.results.predictionTime')}</div>
                  <div className="stats-value">{formatDate(predictionResult.created_at)}</div>
                </div>
              </div>
            </div>
            
            <div className="results-table-card">
              <div className="results-table">                
                {/* 显示详细的条形码预测结果 */}
                {predictionResult.brcode_data && predictionResult.brcode_data.length > 0 ? (
                  <table className="prediction-table">
                    <thead>
                      <tr>
                        <th className="barcode-col">{t('predictionTool.results.barcode')}</th>
                        <th className="cycle-life-col">{t('predictionTool.results.cycleLife1')}</th>
                        <th className="cycle-life-col">{t('predictionTool.results.cycleLife2')}</th>
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
                            <td className="cycle-life-cell">{getCycleLife2Display()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                    {t('predictionTool.results.noDetailedData')}
                  </p>
                )}
              </div>
            </div>
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