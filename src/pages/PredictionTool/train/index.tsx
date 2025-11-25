import React, { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, UploadCloud } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';
import { trainModel } from '../model';
import './index.less';

const TrainPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modelName, setModelName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [baseModel, setBaseModel] = useState('OSES-Base-v1');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Loading and notification state
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      // Check file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert(t('predictionTool.train.errors.fileSize', 'File size exceeds 50MB'));
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
       // Check file size (50MB)
       if (droppedFile.size > 50 * 1024 * 1024) {
        alert(t('predictionTool.train.errors.fileSize', 'File size exceeds 50MB'));
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleStartTraining = async () => {
    // Validate required fields
    if (!modelName || !file) {
      setSnackbar({
        open: true,
        message: t('predictionTool.train.errors.missingFields', 'Please fill in all required fields'),
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      // Call the train model API
      const response = await trainModel({
        model_name: modelName,
        remark: remarks,
        base_model_name: baseModel,
        data_files: file,
      });

      // Show success notification
      setSnackbar({
        open: true,
        message: t('predictionTool.train.success', 'Model training started successfully'),
        severity: 'success',
      });

      // Navigate to main page (models tab) after a short delay
      setTimeout(() => {
        navigate('/prediction-tool', { state: { activeTab: 'models' } });
      }, 1500);
    } catch (error: any) {
      // Show error notification
      setSnackbar({
        open: true,
        message: error.message || t('predictionTool.train.errors.failed', 'Failed to start training'),
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="train-page-container">
      <div className="train-header">
        <h1>{t('predictionTool.train.title', 'Train New Model')}</h1>
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={16} />
          {t('predictionTool.train.back', 'Back')}
        </button>
      </div>

      <div className="train-content">
        {/* Step 1: Model Information */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">1</div>
            <h2>{t('predictionTool.train.step1.title', 'Model Information')}</h2>
          </div>
          <div className="step-content">
            <div className="form-group">
              <label>
                {t('predictionTool.train.step1.name', 'Model Name')}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={t('predictionTool.train.step1.namePlaceholder', 'Enter model name')}
              />
            </div>
            <div className="form-group">
              <label>{t('predictionTool.train.step1.remarks', 'Remarks (Optional)')}</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={t('predictionTool.train.step1.remarksPlaceholder', 'Enter any additional notes or remarks')}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Base Model */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">2</div>
            <h2>{t('predictionTool.train.step2.title', 'Base Model')}</h2>
          </div>
          <div className="step-content no-border">
            <div className="base-model-select-wrapper">
              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
              >
                <option value="OSES-Base-v1">{t('predictionTool.train.step2.modelName', 'OSES-Base-v1')}</option>
                {/* Future models can be added here */}
              </select>
            </div>
          </div>
        </div>

        {/* Step 3: Training Dataset */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">3</div>
            <h2>{t('predictionTool.train.step3.title', 'Training Dataset')}</h2>
          </div>
          <div className="step-content">
            <div className="dataset-info">
              <div className="split-ratio">
                <span className="label">{t('predictionTool.train.step3.ratio', 'Train-Test Split Ratio:')}</span>
                <span className="value">{t('predictionTool.train.step3.ratioValue', '7 : 3')}</span>
              </div>
              <p className="description">
                {t('predictionTool.train.step3.ratioDesc', '70% of your dataset will be used for training, 30% for testing')}
              </p>
            </div>

            <div className="form-group">
              <label>
                {t('predictionTool.train.step3.upload', 'Upload Dataset')}
                <span className="required">*</span>
              </label>
              <div
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx"
                />
                <div className="upload-icon">
                   <UploadCloud size={28} />
                </div>
                {file ? (
                  <div className="upload-text">{file.name}</div>
                ) : (
                  <>
                    <div className="upload-text">
                      {t('predictionTool.train.step3.dragDrop', 'Drag and drop your file here, or click to browse')}
                    </div>
                    <div className="upload-hint">
                      {t('predictionTool.train.step3.formats', 'Supported formats: CSV, XLSX (Max 50MB)')}
                    </div>
                    <button className="upload-btn">
                      {t('predictionTool.train.step3.chooseFile', 'Choose File')}
                    </button>
                  </>
                )}
              </div>
              <button className="download-sample">
                <Download size={14} />
                {t('predictionTool.train.step3.downloadSample', 'Download Sample')}
              </button>
            </div>
          </div>
        </div>

        <div className="submit-section">
          <button
            className="submit-button"
            onClick={handleStartTraining}
            disabled={!modelName || !file || loading}
          >
            {loading
              ? t('predictionTool.train.submitting', 'Submitting...')
              : t('predictionTool.train.startTraining', 'Start Training')
            }
          </button>
        </div>
      </div>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TrainPage;
