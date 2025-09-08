import React, { useState } from 'react';
import { FileText, RefreshCw, Play } from 'lucide-react';

interface StepContentProps {
  activeStep: number;
  onStepChange?: (step: number) => void;
}

const StepContent: React.FC<StepContentProps> = ({ activeStep, onStepChange }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
                      {uploadedFile?.name || 'test_data.csv'}
                    </div>
                    <div className="file-meta">
                      文件大小: {uploadedFile ? formatFileSize(uploadedFile.size) : '10.25 MB'} · 类型: text/csv
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="start-prediction-btn">
              <Play size={14} />
              开始预测
            </button>
          </div>
        );
      
      case 2: // 结果展示
        return (
          <div className="upload-area">
            <h4 className="upload-title">预测结果展示</h4>
            <p className="upload-subtitle">
              查看电池生命周期预测结果和详细分析报告
            </p>
            <button className="select-file-btn">查看结果</button>
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