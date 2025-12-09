import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, UploadCloud, X } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';
import { trainModel, getBaseModelList } from '../model';
import type { ModelListItem } from '@/services/model/training';
import { useLoginModalContext } from '@/components/LoginModal/context';
import { formatFileSize } from '@/utils/fileUtils';
import './index.less';

const TrainPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { openLoginModal } = useLoginModalContext();
  const [modelName, setModelName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [baseModel, setBaseModel] = useState('');
  const [baseModelList, setBaseModelList] = useState<ModelListItem[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
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

  // Load base model list on component mount
  useEffect(() => {
    const loadBaseModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await getBaseModelList();
        if (response?.data && response.data.length > 0) {
          setBaseModelList(response.data);
          // Set first model as default
          setBaseModel(response.data[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to load base models:', error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadBaseModels();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const addFiles = (newFiles: File[]) => {
    // Filter valid files (check format only, no size limit)
    const validFiles = newFiles.filter((file) => {
      // Check file format - only support Excel formats
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
        setSnackbar({
          open: true,
          message: t('predictionTool.train.errors.fileFormat', 'Unsupported file format') + `: ${file.name}`,
          severity: 'error',
        });
        return false;
      }
      return true;
    });

    // Avoid duplicate files (by name)
    const existingNames = new Set(files.map((f) => f.name));
    const uniqueFiles = validFiles.filter((f) => !existingNames.has(f.name));

    if (uniqueFiles.length < validFiles.length) {
      setSnackbar({
        open: true,
        message: t('predictionTool.train.errors.duplicateFiles', 'Some duplicate files were skipped'),
        severity: 'error',
      });
    }

    if (uniqueFiles.length > 0) {
      setFiles([...files, ...uniqueFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleStartTraining = async () => {
    // Check if user is logged in first
    const token = localStorage.getItem('token');
    if (!token) {
      // Open login modal directly without showing error message
      openLoginModal();
      return;
    }

    // Validate required fields
    if (!modelName.trim()) {
      setSnackbar({
        open: true,
        message: t('predictionTool.train.errors.modelNameRequired', 'Please enter model name'),
        severity: 'error',
      });
      return;
    }

    if (!baseModel) {
      setSnackbar({
        open: true,
        message: t('predictionTool.train.errors.baseModelRequired', 'Please select a base model'),
        severity: 'error',
      });
      return;
    }

    if (files.length === 0) {
      setSnackbar({
        open: true,
        message: t('predictionTool.train.errors.fileRequired', 'Please upload training dataset'),
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      // Find the selected base model
      const selectedModel = baseModelList.find(m => m.id.toString() === baseModel);
      if (!selectedModel) {
        throw new Error('Selected base model not found');
      }

      // Call the train model API with files array
      await trainModel({
        model_name: modelName.trim(),
        remark: remarks.trim(),
        base_model_id: selectedModel.id,
        data_files: files,
      });

      // Show success notification
      setSnackbar({
        open: true,
        message: t('predictionTool.train.success', 'Model training started successfully'),
        severity: 'success',
      });

      // Navigate to main page (models tab) after a short delay
      setTimeout(() => {
        navigate('/predict', { state: { activeTab: 'models' } });
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
                disabled={isLoadingModels || baseModelList.length === 0}
              >
                {isLoadingModels ? (
                  <option value="">{t('predictionTool.train.step2.loading', 'Loading models...')}</option>
                ) : baseModelList.length === 0 ? (
                  <option value="">{t('predictionTool.train.step2.noModels', 'No base models available')}</option>
                ) : (
                  baseModelList.map((model) => (
                    <option key={model.id} value={model.id.toString()}>
                      {model.model_name}
                    </option>
                  ))
                )}
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
            <div className="form-group">
              <label>
                {t('predictionTool.train.step3.upload', 'Upload Dataset')}
                <span className="required">*</span>
                <span className="prediction-train-file-count">
                  ({files.length})
                </span>
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
                  accept=".xlsx,.xls,.csv"
                  multiple
                />
                <div className="upload-icon">
                   <UploadCloud size={28} />
                </div>
                <div className="upload-text">
                  {t('predictionTool.train.step3.dragDropMultiple', 'Drag and drop your files here, or click to browse')}
                </div>
                <div className="upload-hint">
                  {t('predictionTool.train.step3.formats', 'Supported formats: CSV, XLSX')}
                </div>
                <button className="upload-btn">
                  {t('predictionTool.train.step3.chooseFiles', 'Choose Files')}
                </button>
              </div>
              
              {/* File list */}
              {files.length > 0 && (
                <div className="prediction-train-file-list">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="prediction-train-file-item">
                      <span className="prediction-train-file-name" title={file.name}>
                        {file.name}
                      </span>
                      <span className="prediction-train-file-size">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        className="prediction-train-file-remove"
                        onClick={() => removeFile(index)}
                        title={t('predictionTool.train.step3.removeFile', 'Remove file')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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
            disabled={!modelName || !baseModel || files.length === 0 || loading || isLoadingModels}
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
