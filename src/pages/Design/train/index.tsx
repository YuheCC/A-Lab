import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download, UploadCloud, X, BookOpen } from 'lucide-react';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, IconButton, Box, Typography } from '@mui/material';
import { trainModel, getBaseModelList } from '../model';
import type { ModelListItem } from '@/services/model/training';
import { formatFileSize } from '@/utils/fileUtils';
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

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

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
    // Only take the first file
    const file = newFiles[0];
    if (!file) return;

    // Check file format - only support xlsx
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx') {
      setSnackbar({
        open: true,
        message: t('design.train.errors.fileFormat', 'Unsupported file format') + `: ${file.name}`,
        severity: 'error',
      });
      return;
    }

    // Replace existing file with the new one
    setFiles([file]);
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
            <IconButton onClick={handleOpenDialog} size="small" sx={{ ml: 'auto', color: '#666' }}>
              <BookOpen size={18} />
            </IconButton>
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              maxWidth="lg"
              fullWidth
            >
              <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {t('design.train.instruction.title')}
                </Typography>
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  sx={{
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <X size={20} />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                {/* 1. Functionality */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {t('design.train.instruction.functionality.title')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {t('design.train.instruction.functionality.desc')}
                  </Typography>
                  
                  <Box sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="subtitle2">
                      {t('design.train.instruction.functionality.train.title')}
                    </Typography>
                    <Typography variant="body2">
                      {t('design.train.instruction.functionality.train.input')}
                    </Typography>
                    <Typography variant="body2">
                      {t('design.train.instruction.functionality.train.output')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5, color: 'text.secondary', fontSize: '0.8rem' }}>
                      {t('design.train.instruction.functionality.train.metrics1')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', fontSize: '0.8rem' }}>
                      {t('design.train.instruction.functionality.train.metrics2')}
                    </Typography>
                  </Box>

                  <Box sx={{ pl: 2 }}>
                    <Typography variant="subtitle2">
                      {t('design.train.instruction.functionality.predict.title')}
                    </Typography>
                    <Typography variant="body2">
                      {t('design.train.instruction.functionality.predict.input')}
                    </Typography>
                    <Typography variant="body2">
                      {t('design.train.instruction.functionality.predict.output')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {t('design.train.instruction.functionality.predict.note')}
                    </Typography>
                  </Box>
                </Box>

                {/* 2. Structure */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {t('design.train.instruction.structure.title')}
                  </Typography>

                  <div className="instruction-table-container">
                    <table className="instruction-table">
                      <thead>
                        <tr>
                          {/* Cell Info - Merged rows */}
                          <th rowSpan={2} className="header-cell-info">Cathode</th>
                          <th rowSpan={2} className="header-cell-info">Anode</th>
                          <th rowSpan={2} className="header-cell-info">Electrolyte code</th>

                          <th colSpan={10} className="header-solvent">Solvent</th>
                          <th colSpan={6} className="header-salt">Salt</th>
                          <th colSpan={12} className="header-additive">Additive</th>
                          <th colSpan={5} className="header-performance">Cell performance</th>
                        </tr>
                        <tr>
                          {/* Solvent 1-5 */}
                          <th className="header-solvent">Solvent 1</th>
                          <th className="header-solvent">Solvent 1 content (wt%)</th>
                          <th className="header-solvent">Solvent 2</th>
                          <th className="header-solvent">Solvent 2 content (wt%)</th>
                          <th className="header-solvent">Solvent 3</th>
                          <th className="header-solvent">Solvent 3 content (wt%)</th>
                          <th className="header-solvent">Solvent 4</th>
                          <th className="header-solvent">Solvent 4 content (wt%)</th>
                          <th className="header-solvent">Solvent 5</th>
                          <th className="header-solvent">Solvent 5 content (wt%)</th>

                          {/* Salt 1-3 */}
                          <th className="header-salt">Salt 1</th>
                          <th className="header-salt">Salt 1 content (wt%)</th>
                          <th className="header-salt">Salt 2</th>
                          <th className="header-salt">Salt 2 content (wt%)</th>
                          <th className="header-salt">Salt 3</th>
                          <th className="header-salt">Salt 3 content (wt%)</th>

                          {/* Additive 1-6 */}
                          <th className="header-additive">Additive 1</th>
                          <th className="header-additive">Additive 1 content (wt%)</th>
                          <th className="header-additive">Additive 2</th>
                          <th className="header-additive">Additive 2 content (wt%)</th>
                          <th className="header-additive">Additive 3</th>
                          <th className="header-additive">Additive 3 content (wt%)</th>
                          <th className="header-additive">Additive 4</th>
                          <th className="header-additive">Additive 4 content (wt%)</th>
                          <th className="header-additive">Additive 5</th>
                          <th className="header-additive">Additive 5 content (wt%)</th>
                          <th className="header-additive">Additive 6</th>
                          <th className="header-additive">Additive 6 content (wt%)</th>

                          {/* Performance */}
                          <th className="header-performance">Cycle number (25C)</th>
                          <th className="header-performance">Average CE (25C)</th>
                          <th className="header-performance">retention at 5C discharge</th>
                          <th className="header-performance">Cycle number (45C)</th>
                          <th className="header-performance">Average CE (45C)</th>
                        </tr>
                      </thead>
                    </table>
                  </div>

                  <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                    <li><Typography variant="body2">{t('design.train.instruction.structure.p1')}</Typography></li>
                    <li><Typography variant="body2">{t('design.train.instruction.structure.p2')}</Typography></li>
                    <li><Typography variant="body2">{t('design.train.instruction.structure.p3')}</Typography></li>
                    <li><Typography variant="body2">{t('design.train.instruction.structure.p4')}</Typography></li>
                    <li><Typography variant="body2">{t('design.train.instruction.structure.p5')}</Typography></li>
                  </ul>
                </Box>

                {/* 3. Filling */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {t('design.train.instruction.filling.title')}
                  </Typography>
                  
                  <Box sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="subtitle2">
                      {t('design.train.instruction.filling.template.title')}
                    </Typography>
                    <Typography variant="body2">• {t('design.train.instruction.filling.template.row1')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.filling.template.row2')}</Typography>
                  </Box>

                  <Box sx={{ pl: 2 }}>
                    <Typography variant="subtitle2">
                      {t('design.train.instruction.filling.requirements.title')}
                    </Typography>
                    <Typography variant="body2">• {t('design.train.instruction.filling.requirements.item1')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.filling.requirements.item2')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.filling.requirements.item3')}</Typography>
                  </Box>
                </Box>

                {/* 4. Notes */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {t('design.train.instruction.notes.title')}
                  </Typography>
                  
                  <Box sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="subtitle2">{t('design.train.instruction.notes.p1.title')}</Typography>
                    
                    <div className="instruction-table-container">
                      <table className="instruction-table">
                        <thead>
                          <tr>
                            <th className="header-cell-info">Cathode</th>
                            <th className="header-cell-info">Anode</th>
                            <th className="header-cell-info">Electrolyte code</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    <Typography variant="body2">• {t('design.train.instruction.notes.p1.item1')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.notes.p1.item2')}</Typography>
                  </Box>

                  <Box sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="subtitle2">{t('design.train.instruction.notes.p2.title')}</Typography>
                    
                    <div className="instruction-table-container">
                      <table className="instruction-table">
                        <thead>
                          <tr>
                            <th colSpan={10} className="header-solvent">Solvent</th>
                          </tr>
                          <tr>
                            <th className="header-solvent">Solvent 1</th>
                            <th className="header-solvent">Solvent 1 content (wt%)</th>
                            <th className="header-solvent">Solvent 2</th>
                            <th className="header-solvent">Solvent 2 content (wt%)</th>
                            <th className="header-solvent">Solvent 3</th>
                            <th className="header-solvent">Solvent 3 content (wt%)</th>
                            <th className="header-solvent">Solvent 4</th>
                            <th className="header-solvent">Solvent 4 content (wt%)</th>
                            <th className="header-solvent">Solvent 5</th>
                            <th className="header-solvent">Solvent 5 content (wt%)</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    <Typography variant="body2">• {t('design.train.instruction.notes.p2.item1')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.notes.p2.item2')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.notes.p2.item3')}</Typography>
                  </Box>

                  <Box sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="subtitle2">{t('design.train.instruction.notes.p3.title')}</Typography>
                    
                    <div className="instruction-table-container">
                      <table className="instruction-table">
                        <thead>
                          <tr>
                            <th colSpan={6} className="header-salt">Salt</th>
                          </tr>
                          <tr>
                            <th className="header-salt">Salt 1</th>
                            <th className="header-salt">Salt 1 content (wt%)</th>
                            <th className="header-salt">Salt 2</th>
                            <th className="header-salt">Salt 2 content (wt%)</th>
                            <th className="header-salt">Salt 3</th>
                            <th className="header-salt">Salt 3 content (wt%)</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    <Typography variant="body2">• {t('design.train.instruction.notes.p3.item1')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.notes.p3.item2')}</Typography>
                  </Box>
                  
                  <Box sx={{ pl: 2, mb: 1 }}>
                    <Typography variant="subtitle2">{t('design.train.instruction.notes.p4.title')}</Typography>
                    
                    <div className="instruction-table-container">
                      <table className="instruction-table">
                        <thead>
                          <tr>
                            <th colSpan={12} className="header-additive">Additive</th>
                          </tr>
                          <tr>
                            <th className="header-additive">Additive 1</th>
                            <th className="header-additive">Additive 1 content (wt%)</th>
                            <th className="header-additive">Additive 2</th>
                            <th className="header-additive">Additive 2 content (wt%)</th>
                            <th className="header-additive">Additive 3</th>
                            <th className="header-additive">Additive 3 content (wt%)</th>
                            <th className="header-additive">Additive 4</th>
                            <th className="header-additive">Additive 4 content (wt%)</th>
                            <th className="header-additive">Additive 5</th>
                            <th className="header-additive">Additive 5 content (wt%)</th>
                            <th className="header-additive">Additive 6</th>
                            <th className="header-additive">Additive 6 content (wt%)</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    <Typography variant="body2">• {t('design.train.instruction.notes.p4.item1')}</Typography>
                    <Typography variant="body2">• {t('design.train.instruction.notes.p4.item2')}</Typography>
                  </Box>

                  <Box sx={{ pl: 2 }}>
                    <Typography variant="subtitle2">{t('design.train.instruction.notes.p5.title')}</Typography>
                    
                    <div className="instruction-table-container">
                      <table className="instruction-table">
                        <thead>
                          <tr>
                            <th colSpan={5} className="header-performance">Cell performance</th>
                          </tr>
                          <tr>
                            <th className="header-performance">Cycle number (25C)</th>
                            <th className="header-performance">Average CE (25C)</th>
                            <th className="header-performance">retention at 5C discharge</th>
                            <th className="header-performance">Cycle number (45C)</th>
                            <th className="header-performance">Average CE (45C)</th>
                          </tr>
                        </thead>
                      </table>
                    </div>

                    <Typography variant="body2" sx={{ mb: 0.5 }}>• {t('design.train.instruction.notes.p5.item1')}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• {t('design.train.instruction.notes.p5.item2')}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• {t('design.train.instruction.notes.p5.item3')}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• {t('design.train.instruction.notes.p5.item4')}</Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>• {t('design.train.instruction.notes.p5.item5')}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>{t('design.train.instruction.notes.p5.note1')}</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{t('design.train.instruction.notes.p5.note2')}</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{t('design.train.instruction.notes.p5.note3')}</Typography>
                  </Box>
                </Box>

                {/* 5. Tips */}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {t('design.train.instruction.tips.title')}
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2 }}>
                    {t('design.train.instruction.tips.item1')}
                  </Typography>
                </Box>
              </DialogContent>
            </Dialog>
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
                />
                <div className="upload-icon">
                   <UploadCloud size={28} />
                </div>
                <div className="upload-text">
                  {t('design.train.step4.dragDrop', 'Drag and drop your file here, or click to browse')}
                </div>
                <div className="upload-hint">
                  {t('design.train.step4.formats', 'Supported format: XLSX only')}
                </div>
                <button className="upload-btn">
                  {t('design.train.step4.chooseFile', 'Choose File')}
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
