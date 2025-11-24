import React, { useState } from 'react';
import { useNavigate } from '@umijs/max';
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

  return (
    <div className="model-detail-page-wrapper">
      <div className="model-detail-page">
        {/* Header */}
        <div className="page-header">
        <div className="header-content">
          <h1 className="title">{model.name}</h1>
          <p className="subtitle">Model ID: {model.id}</p>
        </div>
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={16} />
          返回
        </button>
      </div>

      {/* Model Information */}
      <div className="detail-section">
        <h2 className="section-title">Model Information</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">Creator:</span>
            <span className="value">{model.creator}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span className="value">
              <span className="status-badge">
                {model.status === 'online' ? '上线' : model.status === 'trained' ? '训练完成' : '训练中'}
              </span>
            </span>
          </div>
          <div className="info-row">
            <span className="label">Created:</span>
            <span className="value">{model.created_at}</span>
          </div>
          <div className="info-row">
            <span className="label">Remarks:</span>
            <span className="value">{model.remarks}</span>
          </div>
        </div>
      </div>

      {/* Base Model */}
      <div className="detail-section">
        <h2 className="section-title">Base Model</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="value">{model.base_model}</span>
          </div>
        </div>
      </div>

      {/* Training Dataset */}
      <div className="detail-section">
        <h2 className="section-title">Training Dataset</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="label">Dataset Name:</span>
            <span className="value file-link">
              <FileText size={16} color="#00a63e" />
              {model.dataset.name}
            </span>
          </div>
          <div className="info-row">
            <span className="label">File Size:</span>
            <span className="value">{model.dataset.size}</span>
          </div>
          <div className="info-row">
            <span className="label">Total Samples:</span>
            <span className="value">{model.dataset.samples.toLocaleString()}</span>
          </div>
          <div className="info-row">
            <span className="label">Train-Test Ratio:</span>
            <span className="value">{model.dataset.ratio}</span>
          </div>
        </div>
      </div>

      {/* Training Results - Only show if status is trained or online */}
      {(model.status === 'trained' || model.status === 'online') && model.training_results && (
        <div className="detail-section">
          <h2 className="section-title">Training Results</h2>
          <div className="info-card">
             <div className="training-results-grid">
               <div className="result-card">
                 <span className="result-label">Accuracy</span>
                 <span className="result-value">{model.training_results.accuracy}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">Loss</span>
                 <span className="result-value">{model.training_results.loss}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">Epochs</span>
                 <span className="result-value">{model.training_results.epochs}</span>
               </div>
               <div className="result-card">
                 <span className="result-label">Training Time</span>
                 <span className="result-value">{model.training_results.training_time}</span>
               </div>
               <div className="result-card full-width">
                 <span className="result-label">Validation Score</span>
                 <span className="result-value">{model.training_results.validation_score}</span>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Prediction Records - Only show if status is online */}
      {model.status === 'online' && model.prediction_records && (
        <div className="detail-section">
          <h2 className="section-title">Prediction Records</h2>
          <div className="records-table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>File Name</th>
                  <th>Battery Count</th>
                  <th>Avg Cycle Life</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {model.prediction_records.map(record => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.file_name}</td>
                    <td>{record.battery_count}</td>
                    <td>{record.avg_cycle_life} cycles</td>
                    <td>{record.created_at}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewRecord(record.id)}>
                        View Details
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

