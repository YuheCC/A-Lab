import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, UploadCloud, X } from 'lucide-react';
import { Snackbar, Alert } from '@mui/material';
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
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Cell Chemistry Specifications
  const [cathode, setCathode] = useState('');
  const [anode, setAnode] = useState('');
  // Benchmark Electrolyte sub-fields
  const [solvent, setSolvent] = useState('');
  const [salt, setSalt] = useState('');
  const [additive, setAdditive] = useState('');
  const [cellDesign, setCellDesign] = useState('');

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
    // Filter valid files (check format only)
    const validFiles = newFiles.filter((file) => {
      // Check file format - only support xlsx
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx') {
        setSnackbar({
          open: true,
          message: t('design.train.errors.fileFormat', 'Unsupported file format') + `: ${file.name}`,
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
        message: t('design.train.errors.duplicateFiles', 'Some duplicate files were skipped'),
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
    // Validation
    if (!modelName.trim()) {
      setSnackbar({
        open: true,
        message: t('design.train.errors.modelNameRequired', 'Please enter model name'),
        severity: 'error',
      });
      return;
    }

    if (!baseModel) {
      setSnackbar({
        open: true,
        message: t('design.train.errors.baseModelRequired', 'Please select a base model'),
        severity: 'error',
      });
      return;
    }

    if (files.length === 0) {
      setSnackbar({
        open: true,
        message: t('design.train.errors.fileRequired', 'Please upload training dataset'),
        severity: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the selected base model
      const selectedModel = baseModelList.find(m => m.id.toString() === baseModel);
      if (!selectedModel) {
        throw new Error('Selected base model not found');
      }

      // Build train_params object
      const trainParams = {
        cathode: cathode.trim(),
        anode: anode.trim(),
        benchmarkElectrolyte: {
          solvent: solvent.trim(),
          salt: salt.trim(),
          additive: additive.trim(),
        },
        cellDesign: cellDesign.trim(),
      };

      const response = await trainModel({
        model_name: modelName.trim(),
        remark: remarks.trim(),
        base_model_id: selectedModel.id,
        data_files: files,
        train_params: JSON.stringify(trainParams),
      });

      console.log('Training started successfully:', response);

      // Show success message
      setSnackbar({
        open: true,
        message: t('design.train.success', 'Model training started successfully!'),
        severity: 'success',
      });

      // Navigate to models tab after a short delay
      setTimeout(() => {
        navigate('/design?tab=models');
      }, 1500);
    } catch (error) {
      console.error('Failed to start training:', error);
      const errorMessage = error instanceof Error ? error.message : t('design.train.errors.unknown', 'Failed to start training');
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDownloadSample = () => {
    const link = document.createElement('a');
    link.href = '/design/sample/Design sample.xlsx';
    link.download = 'Design sample.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        {/* Step 2: Cell Chemistry Specifications */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">2</div>
            <h2>{t('design.train.step2.title', 'Cell Specifications')}</h2>
          </div>
          <div className="step-content">
            <div className="form-group">
              <label>{t('design.train.step2.cathode', 'Cathode')}</label>
              <input
                type="text"
                value={cathode}
                onChange={(e) => setCathode(e.target.value)}
                placeholder={t('design.train.step2.cathodePlaceholder', 'Polycrystal NCM811, 4 mAh/cm²')}
              />
            </div>
            <div className="form-group">
              <label>{t('design.train.step2.anode', 'Anode')}</label>
              <input
                type="text"
                value={anode}
                onChange={(e) => setAnode(e.target.value)}
                placeholder={t('design.train.step2.anodePlaceholder', '12% SiC + Graphite')}
              />
            </div>
            <div className="form-group">
              <label>{t('design.train.step2.benchmarkElectrolyte', 'Benchmark Electrolyte')}</label>
              <div className="electrolyte-input-group">
                <div className="electrolyte-field-wrapper">
                  <label className="electrolyte-field-label">Solvent</label>
                  <input
                    type="text"
                    value={solvent}
                    onChange={(e) => setSolvent(e.target.value)}
                    placeholder={t('design.train.step2.solventPlaceholder', 'EC/EMC/DEC')}
                    className="electrolyte-field"
                  />
                </div>
                <span className="electrolyte-separator">+</span>
                <div className="electrolyte-field-wrapper">
                  <label className="electrolyte-field-label">Salt</label>
                  <input
                    type="text"
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    placeholder={t('design.train.step2.saltPlaceholder', '1M LiPF6/LiFSI')}
                    className="electrolyte-field"
                  />
                </div>
                <span className="electrolyte-separator">+</span>
                <div className="electrolyte-field-wrapper">
                  <label className="electrolyte-field-label">Additive</label>
                  <input
                    type="text"
                    value={additive}
                    onChange={(e) => setAdditive(e.target.value)}
                    placeholder={t('design.train.step2.additivePlaceholder', 'VC/LiDFP')}
                    className="electrolyte-field"
                  />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>{t('design.train.step2.cellDesign', 'Cell Design')}</label>
              <input
                type="text"
                value={cellDesign}
                onChange={(e) => setCellDesign(e.target.value)}
                placeholder={t('design.train.step2.cellDesignPlaceholder', '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity')}
              />
            </div>
          </div>
        </div>

        {/* Step 3: Base Model */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">3</div>
            <h2>{t('design.train.step3.title', 'Base Model')}</h2>
          </div>
          <div className="step-content no-border">
            <div className="base-model-select-wrapper">
              <select
                value={baseModel}
                onChange={(e) => setBaseModel(e.target.value)}
                disabled={isLoadingModels || baseModelList.length === 0}
              >
                {isLoadingModels ? (
                  <option value="">{t('design.train.step3.loading', 'Loading models...')}</option>
                ) : baseModelList.length === 0 ? (
                  <option value="">{t('design.train.step3.noModels', 'No base models available')}</option>
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

        {/* Step 4: Training Dataset */}
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">4</div>
            <h2>{t('design.train.step4.title', 'Training Dataset')}</h2>
          </div>
          <div className="step-content">
            <div className="form-group">
              <label>
                {t('design.train.step4.upload', 'Upload Dataset')}
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
                  accept=".xlsx"
                  multiple
                />
                <div className="upload-icon">
                   <UploadCloud size={28} />
                </div>
                <div className="upload-text">
                  {t('design.train.step4.dragDropMultiple', 'Drag and drop your files here, or click to browse')}
                </div>
                <div className="upload-hint">
                  {t('design.train.step4.formatsMultiple', 'Supported format: XLSX only')}
                </div>
                <button className="upload-btn">
                  {t('design.train.step4.chooseFiles', 'Choose Files')}
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
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        className="prediction-train-file-remove"
                        onClick={() => removeFile(index)}
                        title={t('design.train.step4.removeFile', 'Remove file')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button className="download-sample" onClick={handleDownloadSample}>
                <Download size={14} />
                {t('design.train.step4.downloadSample', 'Download Sample')}
              </button>
            </div>
          </div>
        </div>

        <div className="submit-section">
          <button
            className="submit-button"
            onClick={handleStartTraining}
            disabled={!modelName || !baseModel || files.length === 0 || isSubmitting || isLoadingModels}
          >
            {isSubmitting ? t('design.train.submitting', 'Submitting...') : t('design.train.startTraining', 'Start Training')}
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

export default DesignTrainPage;
