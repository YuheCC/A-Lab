import React, { useState } from 'react';
import { FileText, RefreshCw, Play } from 'lucide-react';
import { predict, type HistoryDetailResponse } from '@/services/prediction/predictionTool';

interface StepContentProps {
  activeStep: number;
  onStepChange?: (step: number) => void;
}

const StepContent: React.FC<StepContentProps> = ({ activeStep, onStepChange }) => {
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

  const handleStartPrediction = async () => {
    if (!uploadedFile) {
      setError('请先上传文件');
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
      
      // 自动跳转到结果页面
      setTimeout(() => {
        if (onStepChange) {
          onStepChange(2);
        }
      }, 500);
      
    } catch (err: any) {
      setIsProcessing(false);
      setProgress(0);
      setError(err.message || '预测失败，请重试');
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
                <h4 className="upload-title">正在上传文件...</h4>
                <p className="upload-subtitle">请稍候</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="upload-area">
            <h4 className="upload-title">点击上传电池数据文件</h4>
            <p className="upload-subtitle">
              请按
              <a href="#" className="upload-link">样例数据</a>
            </p>
            <label className="select-file-btn" htmlFor="file-upload">
              选择文件
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        );
      
      case 1: // AI预测
        return (
          <div className="prediction-area">
            <div className="uploaded-files-section">
              <div className="section-header">
                <h4 className="section-title">已上传数据</h4>
                <button className="refresh-btn">
                  <RefreshCw size={12} />
                  更换文件
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
                      文件大小: {uploadedFile ? formatFileSize(uploadedFile.size) : '19.15 MB'} · 类型: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isProcessing && (
              <div className="prediction-progress">
                <div className="progress-header">
                  <span className="progress-label">分析进度</span>
                  <span className="progress-percentage">{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {progress < 30 ? '正在上传文件并创建预测任务...' : '预测任务正在后台处理，请耐心等待...'}
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
            
            <button 
              className="start-prediction-btn"
              onClick={handleStartPrediction}
              disabled={isProcessing}
            >
              <Play size={14} />
              {isProcessing ? '分析中...' : '开始预测'}
            </button>
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
                暂无预测结果，请先完成预测
              </div>
            </div>
          );
        }

        // 计算平均循环寿命
        const avgCycleLife1 = predictionResult.avg_cycle_life_1 || 0;
        const avgCycleLife2 = predictionResult.avg_cycle_life_2 || 0;
        const avgCycleLife = avgCycleLife1 > 0 ? avgCycleLife1 : avgCycleLife2;

        // 格式化创建时间
        const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleString('zh-CN', {
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
                  <div className="stats-label">电芯数量</div>
                  <div className="stats-value">{predictionResult.barcode_count}个</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">平均循环寿命</div>
                  <div className="stats-value">{avgCycleLife > 0 ? `${avgCycleLife.toFixed(1)}次` : '未知'}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">预测时间</div>
                  <div className="stats-value">{formatDate(predictionResult.created_at)}</div>
                </div>
              </div>
            </div>
            
            <div className="results-table-card">
              <div className="results-table">
                <div className="file-info" style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                  文件名: {predictionResult.file_name}
                </div>
                <div className="prediction-status" style={{ marginBottom: '16px' }}>
                  <span style={{ 
                    color: predictionResult.status === 'success' ? '#38a169' : '#e53e3e',
                    fontWeight: '500'
                  }}>
                    状态: {predictionResult.status === 'success' ? '预测成功' : '预测失败'}
                  </span>
                </div>
                
                {/* 显示详细的条形码预测结果 */}
                {predictionResult.brcode_data && predictionResult.brcode_data.length > 0 ? (
                  <table className="prediction-table">
                    <thead>
                      <tr>
                        <th>Barcode</th>
                        <th>Cycle Life 1</th>
                        <th>Cycle Life 2</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictionResult.brcode_data.map((item) => (
                        <tr key={item.id}>
                          <td>{item.barcode}</td>
                          <td>{item.cycle_life_1}</td>
                          <td>{item.cycle_life_2}</td>
                          <td>
                            <span style={{ 
                              color: item.status === 'success' ? '#38a169' : '#e53e3e',
                              fontSize: '12px'
                            }}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                    暂无详细条形码数据
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="upload-area">
            <h4 className="upload-title">请选择操作步骤</h4>
            <p className="upload-subtitle">
              请从上方步骤中选择要执行的操作
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