import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, UploadCloud } from 'lucide-react';
import { trainModel, getBaseModelList } from '../model';
import type { ModelListItem } from '@/services/model/training';
import './index.less';

const DesignTrainPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [modelName, setModelName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [baseModel, setBaseModel] = useState('');
  const [baseModelList, setBaseModelList] = useState<ModelListItem[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
      const selectedFile = e.target.files[0];
      // Check file size (50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert(t('design.train.errors.fileSize', 'File size exceeds 50MB'));
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
        alert(t('design.train.errors.fileSize', 'File size exceeds 50MB'));
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleStartTraining = async () => {
    // Validation
    if (!modelName.trim()) {
      alert(t('design.train.errors.modelNameRequired', 'Please enter model name'));
      return;
    }

    if (!baseModel) {
      alert(t('design.train.errors.baseModelRequired', 'Please select a base model'));
      return;
    }

    if (!file) {
      alert(t('design.train.errors.fileRequired', 'Please upload training dataset'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected base model
      const selectedModel = baseModelList.find(m => m.id.toString() === baseModel);
      if (!selectedModel) {
        throw new Error('Selected base model not found');
      }

      const response = await trainModel({
        model_name: modelName.trim(),
        remark: remarks.trim(),
        base_model_name: selectedModel.model_name,
        data_files: file,
      });

      console.log('Training started successfully:', response);

      // Show success message
      alert(t('design.train.success', 'Model training started successfully!'));

      // Navigate to models tab
      navigate('/design?tab=models');
    } catch (error) {
      console.error('Failed to start training:', error);
      const errorMessage = error instanceof Error ? error.message : t('design.train.errors.unknown', 'Failed to start training');
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="train-page-container">
      <div className="train-header">
        <h1>{t('design.train.title', 'Train New Model')}</h1>
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={16} />
          {t('design.train.back', 'Back')}
        </button>
      </div>

      <div className="train-content">
        {/* Step 1: Model Information */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">1</div>
            <h2>{t('design.train.step1.title', 'Model Information')}</h2>
          </div>
          <div className="step-content">
            <div className="form-group">
              <label>
                {t('design.train.step1.name', 'Model Name')}
                <span className="required">*</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={t('design.train.step1.namePlaceholder', 'Enter model name')}
              />
            </div>
            <div className="form-group">
              <label>{t('design.train.step1.remarks', 'Remarks (Optional)')}</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={t('design.train.step1.remarksPlaceholder', 'Enter any additional notes or remarks')}
              />
            </div>
          </div>
        </div>

        {/* Step 2: Base Model */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">2</div>
            <h2>{t('design.train.step2.title', 'Base Model')}</h2>
          </div>
          <div className="step-content no-border">
            <div className="base-model-select-wrapper">
              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                disabled={isLoadingModels || baseModelList.length === 0}
              >
                {isLoadingModels ? (
                  <option value="">{t('design.train.step2.loading', 'Loading models...')}</option>
                ) : baseModelList.length === 0 ? (
                  <option value="">{t('design.train.step2.noModels', 'No base models available')}</option>
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
            <h2>{t('design.train.step3.title', 'Training Dataset')}</h2>
          </div>
          <div className="step-content">
            <div className="form-group">
              <label>
                {t('design.train.step3.upload', 'Upload Dataset')}
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
                      {t('design.train.step3.dragDrop', 'Drag and drop your file here, or click to browse')}
                    </div>
                    <div className="upload-hint">
                      {t('design.train.step3.formats', 'Supported formats: CSV, XLSX (Max 50MB)')}
                    </div>
                    <button className="upload-btn">
                      {t('design.train.step3.chooseFile', 'Choose File')}
                    </button>
                  </>
                )}
              </div>
              <button className="download-sample">
                <Download size={14} />
                {t('design.train.step3.downloadSample', 'Download Sample')}
              </button>
            </div>
          </div>
        </div>

        <div className="submit-section">
          <button
            className="submit-button"
            onClick={handleStartTraining}
            disabled={!modelName || !baseModel || !file || isSubmitting || isLoadingModels}
          >
            {isSubmitting ? t('design.train.submitting', 'Submitting...') : t('design.train.startTraining', 'Start Training')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignTrainPage;
