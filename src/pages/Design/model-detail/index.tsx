import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText } from 'lucide-react';
import { getModelDetail, deployModel, isMockModel } from '../model';
import { type ModelDetailResponse } from '@/services/model/training';
import './index.less';

const DesignModelDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const modelId = searchParams.get('id');

  const [model, setModel] = useState<ModelDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    if (modelId) {
      fetchModelDetail(modelId);
    } else {
      setError(t('design.modelDetail.errors.noModelId', 'No model ID provided'));
      setLoading(false);
    }
  }, [modelId]);

  const fetchModelDetail = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getModelDetail(id);
      setModel(response);
    } catch (err) {
      console.error('Failed to fetch model detail:', err);
      setError(err instanceof Error ? err.message : t('design.modelDetail.errors.loadFailed', 'Failed to load model detail'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/design?tab=models');
  };

  const handleViewRecord = (recordId: string) => {
    // Remove 'DS-' prefix if present
    const id = recordId.toString().replace('DS-', '');
    navigate(`/design/record?id=${id}`);
  };

  const handleOnlineModel = async () => {
    if (!model || !modelId) return;

    // Check if it's a mock model
    if (model && isMockModel(model)) {
      alert(t('design.modelDetail.errors.cannotDeployDemo', 'Cannot deploy demo model'));
      return;
    }

    if (!confirm(t('design.modelDetail.confirmDeploy', 'Are you sure you want to deploy this model?'))) {
      return;
    }

    setIsDeploying(true);

    try {
      await deployModel(modelId);
      alert(t('design.modelDetail.deploySuccess', 'Model deployed successfully!'));
      // Refresh model detail
      await fetchModelDetail(modelId);
    } catch (err) {
      console.error('Failed to deploy model:', err);
      const errorMessage = err instanceof Error ? err.message : t('design.modelDetail.errors.deployFailed', 'Failed to deploy model');
      alert(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleOfflineModel = () => {
    // TODO: Implement offline API if available
    alert(t('design.modelDetail.offlineNotImplemented', 'Offline functionality coming soon'));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="model-detail-page-wrapper">
        <div className="loading-state">
          <p>{t('design.modelDetail.loadingText', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="model-detail-page-wrapper">
        <div className="error-state">
          <p>{t('design.modelDetail.error', 'Error')}: {error || 'Model not found'}</p>
          <button onClick={handleBack}>{t('design.modelDetail.back', '返回')}</button>
        </div>
      </div>
    );
  }

  const isMock = model && isMockModel(model);

  return (
    <div className="model-detail-page-wrapper">
      <div className="model-detail-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="title">{model.model_name}</h1>
            <p className="subtitle">{t('design.modelDetail.modelId', 'Model ID:')} DM-{String(model.id).padStart(6, '0')}</p>
          </div>
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={16} />
            {t('design.modelDetail.back', '返回')}
          </button>
        </div>

        {/* Model Information */}
        <div className="detail-section">
          <div className="section-header">
            <h2 className="section-title">{t('design.modelDetail.title', 'Model Information')}</h2>
            {!isMock && (
              <div className="section-actions">
                {model.status === 'online' ? (
                  <button className="offline-button" onClick={handleOfflineModel}>
                    {t('design.modelDetail.offlineModel', '下线模型')}
                  </button>
                ) : model.status === 'trained' ? (
                  <button
                    className="online-button"
                    onClick={handleOnlineModel}
                    disabled={isDeploying}
                  >
                    {isDeploying ? t('design.modelDetail.deploying', '部署中...') : t('design.modelDetail.onlineModel', '上线模型')}
                  </button>
                ) : null}
              </div>
            )}
          </div>
          <div className="info-card">
            <div className="info-row">
              <span className="label">{t('design.modelDetail.creator', 'Creator')}</span>
              <span className="value">{model.created_by_name || 'N/A'}</span>
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
              <span className="value">{formatDate(model.created_at)}</span>
            </div>
            <div className="info-row">
              <span className="label">{t('design.modelDetail.remarks', 'Remarks')}</span>
              <span className="value">{model.remark}</span>
            </div>
          </div>
        </div>

        {/* Base Model */}
        <div className="detail-section">
          <h2 className="section-title">{t('design.modelDetail.baseModel', 'Base Model')}</h2>
          <div className="info-card">
            <div className="info-row">
              <span className="value">{model.base_model_name}</span>
            </div>
          </div>
        </div>

        {/* Training Results - Only show if status is trained or online */}
        {(model.status === 'trained' || model.status === 'online') && model.train_result && (
          <div className="detail-section">
            <h2 className="section-title">{t('design.modelDetail.trainingResults', 'Training Results')}</h2>
            <div className="info-card">
              <div className="training-results-grid">
                {model.train_result.accuracy && (
                  <div className="result-card">
                    <span className="result-label">{t('design.modelDetail.accuracy', 'Accuracy')}</span>
                    <span className="result-value">{model.train_result.accuracy}</span>
                  </div>
                )}
                {model.train_result.loss && (
                  <div className="result-card">
                    <span className="result-label">{t('design.modelDetail.loss', 'Loss')}</span>
                    <span className="result-value">{model.train_result.loss}</span>
                  </div>
                )}
                {model.train_result.epochs && (
                  <div className="result-card">
                    <span className="result-label">{t('design.modelDetail.epochs', 'Epochs')}</span>
                    <span className="result-value">{model.train_result.epochs}</span>
                  </div>
                )}
                {model.train_result.training_time && (
                  <div className="result-card">
                    <span className="result-label">{t('design.modelDetail.trainingTime', 'Training Time')}</span>
                    <span className="result-value">{model.train_result.training_time}</span>
                  </div>
                )}
                {model.train_result.validation_score && (
                  <div className="result-card full-width">
                    <span className="result-label">{t('design.modelDetail.validationScore', 'Validation Score')}</span>
                    <span className="result-value">{model.train_result.validation_score}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Design Records - Only show if status is online */}
        {model.status === 'online' && model.prediction_result && model.prediction_result.length > 0 && (
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
                  {model.prediction_result.map((record: any) => (
                    <tr key={record.id}>
                      <td>DS-{String(record.id).padStart(3, '0')}</td>
                      <td style={{ fontFamily: 'monospace', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {record.smiles || 'N/A'}
                      </td>
                      <td>{record.temp25_count || 0}</td>
                      <td>{record.temp45_count || 0}</td>
                      <td>{formatDate(record.created_at)}</td>
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
