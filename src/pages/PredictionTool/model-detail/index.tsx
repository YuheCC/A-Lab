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
  prediction_records?: Array<{
    id: string;
    file_name: string;
    battery_count: number;
    avg_cycle_life: number; // cycles
    created_at: string;
  }>;
}

const ModelDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock data based on Figma
  const [model] = useState<ModelDetail>({
    id: 'M-2024-01',
    name: 'Li-ion Cycle Predictor v2.1',
    creator: 'Dr. Zhang Wei',
    status: 'online', // Change this to 'training' or 'trained' to test other states
    created_at: '2024/01/10',
    remarks: 'This model is optimized for Li-ion batteries with high energy density. It uses advanced deep learning techniques to predict cycle life with high accuracy.',
    base_model: 'OSES-Base-v1',
    dataset: {
      name: 'battery_training_data_2024.csv',
      size: '45.3 MB',
      samples: 15240,
      ratio: '7:3'
    },
    training_results: {
      accuracy: '96.8%',
      loss: '0.032',
      epochs: 150,
      training_time: '2h 45m',
      validation_score: '95.5%'
    },
    prediction_records: [
      {
        id: 'PR-888B',
        file_name: 'demo.csv',
        battery_count: 2806,
        avg_cycle_life: 851,
        created_at: '2024/03/15 18:30'
      },
      {
        id: 'PR-887A',
        file_name: 'battery_test_02.csv',
        battery_count: 1520,
        avg_cycle_life: 923,
        created_at: '2024/03/10 14:22'
      },
      {
        id: 'PR-883F',
        file_name: 'mixed_batch.csv',
        battery_count: 3567,
        avg_cycle_life: 895,
        created_at: '2024/02/25 13:20'
      }
    ]
  });

  const handleBack = () => {
    navigate('/predict?tab=models');
  };

  const handleViewRecord = (recordId: string) => {
    // Assuming the ID in record is like "PR-888B", but the route expects a number or just ID
    // Extracting number for demo purposes or passing as is
    const id = recordId.replace('PR-', '').replace(/[A-Z]/g, ''); 
    navigate(`/predict/detail?id=${id}`);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return t('predictionTool.modelDetail.statusOnline');
      case 'trained':
        return t('predictionTool.modelDetail.statusTrained');
      case 'training':
        return t('predictionTool.modelDetail.statusTraining');
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
          <p className="subtitle">{t('predictionTool.modelDetail.modelId')} {model.id}</p>
        </div>
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={16} />
          {t('predictionTool.modelDetail.back')}
        </button>
      </div>

      {/* Model Information */}
      <div className="detail-section">
        <h2 className="section-title">{t('predictionTool.modelDetail.title')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.creator')}</span>
            <span className="value">{model.creator}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.status')}</span>
            <span className="value">
              <span className="status-badge">
                {getStatusLabel(model.status)}
              </span>
            </span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.created')}</span>
            <span className="value">{model.created_at}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.remarks')}</span>
            <span className="value">{model.remarks}</span>
          </div>
        </div>
      </div>

      {/* Base Model */}
      <div className="detail-section">
        <h2 className="section-title">{t('predictionTool.modelDetail.baseModel')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="value">{model.base_model}</span>
          </div>
        </div>
      </div>

      {/* Training Dataset */}
      <div className="detail-section">
        <h2 className="section-title">{t('predictionTool.modelDetail.trainingDataset')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.datasetName')}</span>
            <span className="value file-link">
              <FileText size={16} color="#00a63e" />
              {model.dataset.name}
            </span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.fileSize')}</span>
            <span className="value">{model.dataset.size}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.totalSamples')}</span>
            <span className="value">{model.dataset.samples.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.ratio')}</span>
            <span className="value">{model.dataset.ratio}</span>
          </div>
        </div>
      </div>

      {/* Training Results - Only show if status is trained or online */}
      {(model.status === 'trained' || model.status === 'online') && model.training_results && (
        <div className="detail-section">
          <h2 className="section-title">{t('predictionTool.modelDetail.trainingResults')}</h2>
          <div className="info-card">
             <div className="training-results-grid">
               <div className="result-card">
                 <span className="result-label">{t('predictionTool.modelDetail.accuracy')}</span>
                 <span className="result-value">{model.training_results.accuracy}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">{t('predictionTool.modelDetail.loss')}</span>
                 <span className="result-value">{model.training_results.loss}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">{t('predictionTool.modelDetail.epochs')}</span>
                 <span className="result-value">{model.training_results.epochs}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">{t('predictionTool.modelDetail.trainingTime')}</span>
                 <span className="result-value">{model.training_results.training_time}</span>
               </div>
               <div className="result-card full-width">
                 <span className="result-label">{t('predictionTool.modelDetail.validationScore')}</span>
                 <span className="result-value">{model.training_results.validation_score}</span>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Prediction Records - Only show if status is online */}
      {model.status === 'online' && model.prediction_records && (
        <div className="detail-section">
          <h2 className="section-title">{t('predictionTool.modelDetail.predictionRecords')}</h2>
          <div className="records-table-container">
            <table>
              <thead>
                <tr>
                  <th>{t('predictionTool.modelDetail.recordId')}</th>
                  <th>{t('predictionTool.modelDetail.fileName')}</th>
                  <th>{t('predictionTool.modelDetail.batteryCount')}</th>
                  <th>{t('predictionTool.modelDetail.avgCycleLife')}</th>
                  <th>{t('predictionTool.modelDetail.created')}</th>
                  <th>{t('predictionTool.modelDetail.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {model.prediction_records.map(record => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.file_name}</td>
                    <td>{record.battery_count}</td>
                    <td>{record.avg_cycle_life} {t('predictionTool.results.cycleUnit')}</td>
                    <td>{record.created_at}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewRecord(record.id)}>
                        {t('predictionTool.modelDetail.viewDetails')}
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

export default ModelDetailPage;
