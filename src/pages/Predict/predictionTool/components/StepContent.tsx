import React, { useState } from 'react';
import { FileText, RefreshCw, Play } from 'lucide-react';

interface StepContentProps {
  activeStep: number;
  onStepChange?: (step: number) => void;
}

const StepContent: React.FC<StepContentProps> = ({ activeStep, onStepChange }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleStartPrediction = () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Simulate prediction progress
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          // Auto-transition to results step after completion
          setTimeout(() => {
            if (onStepChange) {
              onStepChange(2);
            }
          }, 500);
          return 100;
        }
        // Random progress increment between 1-5%
        return Math.min(prevProgress + Math.random() * 4 + 1, 100);
      });
    }, 200); // Update every 200ms
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
                <p className="progress-text">正在分析电池表现模式并预测制剂寿命，请稍候...</p>
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
        return (
          <div className="results-display">
            <div className="results-stats-card">
              <div className="results-stats">
                <div className="stats-card">
                  <div className="stats-label">电芯数量</div>
                  <div className="stats-value">6个</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">平均循环寿命</div>
                  <div className="stats-value">285次</div>
                </div>
                <div className="stats-card">
                  <div className="stats-label">预测时间</div>
                  <div className="stats-value">2025/09/08 11:53:42</div>
                </div>
              </div>
            </div>
            
            <div className="results-table-card">
              <div className="results-table">
                <table className="prediction-table">
                  <thead>
                    <tr>
                      <th>Barcode</th>
                      <th>Predicted Cycle Life</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>ISU-LLCC_663C4</td>
                      <td>290</td>
                    </tr>
                    <tr>
                      <td>BT-NCM811_A2B5</td>
                      <td>312</td>
                    </tr>
                    <tr>
                      <td>LFP-456_X7Y9</td>
                      <td>268</td>
                    </tr>
                    <tr>
                      <td>NCM-622_M4N8</td>
                      <td>295</td>
                    </tr>
                    <tr>
                      <td>LTO-789_P3Q6</td>
                      <td>343</td>
                    </tr>
                    <tr>
                      <td>NCA-123_R5S2</td>
                      <td>261</td>
                    </tr>
                  </tbody>
                </table>
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