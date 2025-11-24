import React, { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react';
import './index.less';

// Mock types
interface ModelDetail {
  id: string;
  name: string;
  creator: string;
  status: 'training' | 'trained' | 'online';
  created_at: string;
  remarks: string;
  base_model: string;
  dataset: {
    name: string;
    size: string;
    samples: number;
    ratio: string;
  };
  training_results?: {
    accuracy: string;
    loss: string;
    epochs: number;
    training_time: string;
    validation_score: string;
  };
  design_records?: Array<{
    id: string;
    smiles: string;
    temp25_count: number;
    temp45_count: number;
    created_at: string;
  }>;
}

const DesignModelDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock data based on Figma
  const [model] = useState<ModelDetail>({
    id: 'DM-2024-01',
    name: 'Electrolyte Design Model v1.0',
    creator: 'Dr. Li Ming',
    status: 'online',
    created_at: '2024/01/15',
    remarks: 'This model is optimized for electrolyte design prediction. It uses advanced machine learning techniques to predict battery performance based on molecular structure.',
    base_model: 'OSES-Design-v1',
    dataset: {
      name: 'electrolyte_training_data_2024.csv',
      size: '32.5 MB',
      samples: 12580,
      ratio: '7:3'
    },
    training_results: {
      accuracy: '94.2%',
      loss: '0.045',
      epochs: 120,
      training_time: '1h 30m',
      validation_score: '93.8%'
    },
    design_records: [
      {
        id: 'DS-001',
        smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
        temp25_count: 15,
        temp45_count: 12,
        created_at: '2024/03/20 10:30'
      },
      {
        id: 'DS-002',
        smiles: 'CCO[P](=O)(OCC)OCC',
        temp25_count: 8,
        temp45_count: 6,
        created_at: '2024/03/18 14:45'
      },
      {
        id: 'DS-003',
        smiles: 'CC1=CC=C(C=C1)C(=O)O',
        temp25_count: 22,
        temp45_count: 18,
        created_at: '2024/03/15 09:15'
      }
    ]
  });

  const handleBack = () => {
    navigate('/design?tab=models');
  };

  const handleViewRecord = (recordId: string) => {
    const id = recordId.replace('DS-', '');
    navigate(`/design/record?id=${id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return t('design.modelDetail.statusOnline', 'Online');
      case 'trained':
        return t('design.modelDetail.statusTrained', 'Trained');
      case 'training':
        return t('design.modelDetail.statusTraining', 'Training');
      default:
        return status;
    }
  };

  return (
    <div className="model-detail-page-wrapper">
      <div className="model-detail-page">
        {/* Header */}
        <div className="page-header">
        <div className="header-content">
          <h1 className="title">{model.name}</h1>
          <p className="subtitle">{t('design.modelDetail.modelId', 'Model ID:')} {model.id}</p>
        </div>
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={16} />
          {t('design.modelDetail.back', 'Back')}
        </button>
      </div>

      {/* Model Information */}
      <div className="detail-section">
        <h2 className="section-title">{t('design.modelDetail.title', 'Model Information')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">{t('design.modelDetail.creator', 'Creator')}</span>
            <span className="value">{model.creator}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('design.modelDetail.status', 'Status')}</span>
            <span className="value">
              <span className="status-badge">
                {getStatusLabel(model.status)}
              </span>
            </span>
          </div>
          <div className="info-row">
            <span className="label">{t('design.modelDetail.created', 'Created')}</span>
            <span className="value">{model.created_at}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('design.modelDetail.remarks', 'Remarks')}</span>
            <span className="value">{model.remarks}</span>
          </div>
        </div>
      </div>

      {/* Base Model */}
      <div className="detail-section">
        <h2 className="section-title">{t('design.modelDetail.baseModel', 'Base Model')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="value">{model.base_model}</span>
          </div>
        </div>
      </div>

      {/* Training Dataset */}
      <div className="detail-section">
        <h2 className="section-title">{t('design.modelDetail.trainingDataset', 'Training Dataset')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">{t('design.modelDetail.datasetName', 'Dataset Name')}</span>
            <span className="value file-link">
              <FileText size={16} color="#00a63e" />
              {model.dataset.name}
            </span>
          </div>
          <div className="info-row">
            <span className="label">{t('design.modelDetail.fileSize', 'File Size')}</span>
            <span className="value">{model.dataset.size}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('design.modelDetail.totalSamples', 'Total Samples')}</span>
            <span className="value">{model.dataset.samples.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('design.modelDetail.ratio', 'Train-Test Ratio')}</span>
            <span className="value">{model.dataset.ratio}</span>
          </div>
        </div>
      </div>

      {/* Training Results - Only show if status is trained or online */}
      {(model.status === 'trained' || model.status === 'online') && model.training_results && (
        <div className="detail-section">
          <h2 className="section-title">{t('design.modelDetail.trainingResults', 'Training Results')}</h2>
          <div className="info-card">
             <div className="training-results-grid">
               <div className="result-card">
                 <span className="result-label">{t('design.modelDetail.accuracy', 'Accuracy')}</span>
                 <span className="result-value">{model.training_results.accuracy}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">{t('design.modelDetail.loss', 'Loss')}</span>
                 <span className="result-value">{model.training_results.loss}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">{t('design.modelDetail.epochs', 'Epochs')}</span>
                 <span className="result-value">{model.training_results.epochs}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">{t('design.modelDetail.trainingTime', 'Training Time')}</span>
                 <span className="result-value">{model.training_results.training_time}</span>
               </div>
               <div className="result-card full-width">
                 <span className="result-label">{t('design.modelDetail.validationScore', 'Validation Score')}</span>
                 <span className="result-value">{model.training_results.validation_score}</span>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Design Records - Only show if status is online */}
      {model.status === 'online' && model.design_records && (
        <div className="detail-section">
          <h2 className="section-title">{t('design.modelDetail.designRecords', 'Design Records')}</h2>
          <div className="records-table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('design.modelDetail.recordId', 'Record ID')}</th>
                  <th>{t('design.modelDetail.smiles', 'SMILES')}</th>
                  <th>{t('design.modelDetail.temp25Count', '25°C Positive')}</th>
                  <th>{t('design.modelDetail.temp45Count', '45°C Positive')}</th>
                  <th>{t('design.modelDetail.created', 'Created')}</th>
                  <th>{t('design.modelDetail.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {model.design_records.map(record => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td style={{ fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{record.smiles}</td>
                    <td>{record.temp25_count}</td>
                    <td>{record.temp45_count}</td>
                    <td>{record.created_at}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewRecord(record.id)}>
                        {t('design.modelDetail.viewDetails', 'View Details')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DesignModelDetailPage;
