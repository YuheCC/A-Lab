import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Tooltip, Backdrop, CircularProgress } from '@mui/material';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { getModelDetail, deployModel, undeployModel, isMockModel, getModelFileList, getModelMetrics, downloadModelTrainLog, downloadModelFile } from '../model';
import { type ModelDetailResponse, type ModelFileListResponse, type ModelMetricsResponse, type MetricsData } from '@/services/model/training';
import { formatFileSize } from '@/utils/fileUtils';
import { formatUTCDateTime } from '@/utils/dateUtils';
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
  const [isUndeploying, setIsUndeploying] = useState(false);
  const [fileList, setFileList] = useState<ModelFileListResponse>([]);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [downloadingLog, setDownloadingLog] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);

  useEffect(() => {
    if (modelId) {
      fetchModelDetail(modelId);
      fetchModelFileList(modelId);
      fetchModelMetrics(modelId);
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

  const fetchModelFileList = async (id: string) => {
    setLoadingFiles(true);
    try {
      const response = await getModelFileList(id);
      setFileList(response);
    } catch (err) {
      console.error('Failed to fetch model file list:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchModelMetrics = async (id: string) => {
    setLoadingMetrics(true);
    try {
      const response = await getModelMetrics(id);
      setMetrics(response);
    } catch (err) {
      console.error('Failed to fetch model metrics:', err);
    } finally {
      setLoadingMetrics(false);
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

  const handleOfflineModel = async () => {
    if (!model || !modelId) return;

    // Check if it's a mock model
    if (model && isMockModel(model)) {
      alert(t('design.modelDetail.errors.cannotUndeployDemo', 'Cannot undeploy demo model'));
      return;
    }

    if (!confirm(t('design.modelDetail.confirmUndeploy', 'Are you sure you want to undeploy this model?'))) {
      return;
    }

    setIsUndeploying(true);

    try {
      await undeployModel(modelId);
      alert(t('design.modelDetail.undeploySuccess', 'Model undeployed successfully!'));
      // Refresh model detail
      await fetchModelDetail(modelId);
    } catch (err) {
      console.error('Failed to undeploy model:', err);
      const errorMessage = err instanceof Error ? err.message : t('design.modelDetail.errors.undeployFailed', 'Failed to undeploy model');
      alert(errorMessage);
    } finally {
      setIsUndeploying(false);
    }
  };

  const handleDownloadTrainLog = async () => {
    if (!modelId || !model) return;

    setDownloadingLog(true);
    try {
      await downloadModelTrainLog(modelId, model.model_name);
    } catch (err) {
      console.error('Failed to download train log:', err);
      const errorMessage = err instanceof Error ? err.message : t('design.modelDetail.errors.downloadLogFailed', 'Failed to download train log');
      alert(errorMessage);
    } finally {
      setDownloadingLog(false);
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    if (!modelId) return;

    setDownloadingFile(true);
    try {
      await downloadModelFile(modelId, filePath, fileName);
      // 下载成功提示可以通过 Snackbar 显示，但这里保持简洁，只在失败时提示
    } catch (err) {
      console.error('Failed to download file:', err);
      const errorMessage = err instanceof Error ? err.message : t('design.modelDetail.errors.downloadFileFailed', 'Failed to download file');
      alert(errorMessage);
    } finally {
      setDownloadingFile(false);
    }
  };

  const hasComparisonMetrics = (metricsData: ModelMetricsResponse | null): metricsData is { base: MetricsData; train: MetricsData } => {
    return Boolean(metricsData?.base && metricsData?.train);
  };

  /**
   * 检测 metrics 是否为数组格式
   * 数组格式：{ MAE: [27.83, 39.47], MAPE: [0.108, 0.128], RMSE: [28.37, 51.19] }
   */
  const hasArrayMetrics = (metricsData: ModelMetricsResponse | null): boolean => {
    if (!metricsData) return false;
    const entries = Object.entries(metricsData).filter(([key]) => key !== 'base' && key !== 'train');
    return entries.length > 0 && entries.some(([, value]) => Array.isArray(value));
  };

  /**
   * 从嵌套对象中提取数值
   * 例如：{0: 0.192307692307692} -> 0.192307692307692
   */
  const extractNestedValue = (value: any): number | undefined => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 取第一个键的值
      const firstKey = Object.keys(value)[0];
      if (firstKey !== undefined) {
        const extractedValue = value[firstKey];
        return typeof extractedValue === 'number' ? extractedValue : undefined;
      }
    }
    return undefined;
  };

  const formatMetricValue = (value?: number | string | MetricsData | { [key: string]: number }) => {
    if (value === null || value === undefined) return '--';

    // 处理嵌套对象格式（model_type = 2）
    if (typeof value === 'object' && !Array.isArray(value)) {
      const extractedValue = extractNestedValue(value);
      if (extractedValue !== undefined) {
        return extractedValue.toFixed(3);
      }
    }

    const numericValue = Number(value as number);
    if (Number.isFinite(numericValue)) {
      return numericValue.toFixed(3);
    }
    return String(value);
  };

  const renderFlatMetrics = (metricsData: ModelMetricsResponse) => {
    const entries = Object.entries(metricsData).filter(([key]) => key !== 'base' && key !== 'train');
    if (entries.length === 0) {
      return (
        <div className="info-card">
          <p>{t('design.modelDetail.noMetrics', '暂无训练指标')}</p>
        </div>
      );
    }

    return (
      <div className="info-card training-results">
        <div className="training-results-grid">
          {entries.map(([key, value]) => (
            <div className="result-card" key={key}>
              <span className="result-label">{key.toUpperCase()}</span>
              <span className="result-value">{formatMetricValue(value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * 渲染数组格式的训练结果
   * 数组格式：{ MAE: [27.83, 39.47], MAPE: [0.108, 0.128], RMSE: [28.37, 51.19] }
   * 索引 0 = 训练前，索引 1 = 训练后
   */
  const renderArrayMetrics = (metricsData: ModelMetricsResponse) => {
    const entries = Object.entries(metricsData).filter(([key]) => key !== 'base' && key !== 'train');

    return (
      <div className="info-card training-results">
        {entries.map(([key, value]) => {
          if (!Array.isArray(value) || value.length !== 2) {
            return null;
          }

          return (
            <div className="metric-section" key={key}>
              <h3 className="metric-title">{key.toUpperCase()}</h3>
              <div className="metric-comparison">
                <div className="metric-box base-model">
                  <div className="model-label">{t('design.modelDetail.beforeTraining', '训练前')}</div>
                  <div className="model-value">{value[0].toFixed(3)}</div>
                </div>
                <div className="metric-box new-model">
                  <div className="model-label">{t('design.modelDetail.afterTraining', '训练后')}</div>
                  <div className="model-value">{value[1].toFixed(3)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return t('design.modelDetail.statusOnline', 'Online');
      case 'trained':
        return t('design.modelDetail.statusTrained', 'Trained');
      case 'offline':
        return t('design.modelDetail.statusOffline', 'Offline');
      case 'training':
        return t('design.modelDetail.statusTraining', 'Training');
      case 'fail':
        return t('design.modelDetail.statusFail', 'Failed');
      default:
        return status;
    }
  };


  // RMSE Tooltip 内容
  const renderRMSETooltip = () => (
    <div>
      <div style={{
        marginBottom: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        RMSE measures the average magnitude of prediction errors. It is calculated as the square root of the mean of the squared differences between predicted and actual values. RMSE here is based on the difference between the model-predicted change relative to the benchmark electrolyte and the true experimentally measured change.
      </div>
      <div style={{
        marginTop: '16px',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#1f2937',
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.5px'
        }}>
          <span>RMSE =</span>
          <div style={{ display: 'inline-flex', alignItems: 'flex-start', position: 'relative', paddingLeft: '8px' }}>
            <span style={{ fontSize: '28px', lineHeight: '1', marginRight: '2px' }}>√</span>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              paddingTop: '4px',
              borderTop: '1.5px solid #1f2937',
              paddingLeft: '4px',
              paddingRight: '4px'
            }}>
              <span style={{ fontSize: '16px' }}>(</span>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 2px' }}>
                <span style={{ fontSize: '14px', padding: '0 6px' }}>1</span>
                <div style={{ width: '100%', height: '1px', backgroundColor: '#1f2937', margin: '2px 0' }}></div>
                <span style={{ fontSize: '14px', padding: '0 6px' }}>n</span>
              </div>
              <span style={{ fontSize: '15px' }}>× Σ(y<sub>i</sub> - ŷ<sub>i</sub>)<sup>2</sup></span>
              <span style={{ fontSize: '16px' }}>)</span>
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          lineHeight: '2',
          color: '#374151',
          paddingTop: '12px',
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}>
          <div><strong>y<sub>i</sub></strong> — True Value (Actual Value)</div>
          <div><strong>ŷ</strong> — Predicted Value</div>
          <div><strong>n</strong> – number of samples</div>
        </div>
      </div>
    </div>
  );

  // R² Tooltip 内容
  const renderR2Tooltip = () => (
    <div>
      <div style={{
        marginBottom: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        R² indicates how well the model explains the variance of the target variable. It compares the model's predictions to a simple baseline that always predicts the mean of the data. R² here is based on the difference between the model-predicted change relative to the benchmark electrolyte and the true experimentally measured change.
      </div>
      <div style={{
        marginTop: '16px',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#1f2937',
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.5px'
        }}>
          <span>R² = 1 -</span>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
            <span style={{ fontSize: '15px', padding: '4px 8px' }}>Σ(y<sub>i</sub> - ŷ<sub>i</sub>)<sup>2</sup></span>
            <div style={{ width: '100%', height: '1.5px', backgroundColor: '#1f2937', margin: '3px 0' }}></div>
            <span style={{ fontSize: '15px', padding: '4px 8px' }}>Σ(y<sub>i</sub> - ȳ)<sup>2</sup></span>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          lineHeight: '2',
          color: '#374151',
          paddingTop: '12px',
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}>
          <div><strong>y<sub>i</sub></strong> — True Value (Actual Value)</div>
          <div><strong>ŷ</strong> — Predicted Value</div>
          <div><strong>ȳ</strong> — Mean of True Value</div>
          <div><strong>n</strong> – number of samples</div>
        </div>
      </div>
    </div>
  );

  // F1 Score Tooltip 内容
  const renderF1ScoreTooltip = () => (
    <div>
      <div style={{
        marginBottom: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        {t('design.modelDetail.f1ScoreTooltip.description')}
      </div>
      <div style={{
        marginTop: '16px',
        padding: '16px'
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '500',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#1f2937',
          fontFamily: 'Georgia, serif',
          letterSpacing: '0.5px'
        }}>
          <span>F1 = 2 ×</span>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
            <span style={{ fontSize: '15px', padding: '4px 8px' }}>{t('design.modelDetail.f1ScoreTooltip.precision')} × {t('design.modelDetail.f1ScoreTooltip.recall')}</span>
            <div style={{ width: '100%', height: '1.5px', backgroundColor: '#1f2937', margin: '3px 0' }}></div>
            <span style={{ fontSize: '15px', padding: '4px 8px' }}>{t('design.modelDetail.f1ScoreTooltip.precision')} + {t('design.modelDetail.f1ScoreTooltip.recall')}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // AUC Tooltip 内容
  const renderAUCTooltip = () => (
    <div style={{
      fontSize: '13px',
      lineHeight: '1.6'
    }}>
      {t('design.modelDetail.aucTooltip.description')}
    </div>
  );

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
                  <button
                    className="offline-button"
                    onClick={handleOfflineModel}
                    disabled={isUndeploying}
                  >
                    {isUndeploying ? t('design.modelDetail.undeploying', '下线中...') : t('design.modelDetail.offlineModel', '下线模型')}
                  </button>
                ) : (model.status === 'trained' || model.status === 'offline') ? (
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
              <span className="value">{formatUTCDateTime(model.created_at)}</span>
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

        {/* Training Results - Only show if status is trained, offline or online */}
        {(model.status === 'trained' || model.status === 'offline' || model.status === 'online') && model.train_result && (
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
                      <td>{formatUTCDateTime(record.created_at, { showSeconds: true })}</td>
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

        {/* Training Dataset */}
        {(model.status === 'trained' || model.status === 'offline' || model.status === 'online' || model.status === 'fail') && (
          <div className="detail-section">
            <h2 className="section-title">{t('design.modelDetail.trainingFiles', 'Training Dataset')}</h2>
            {loadingFiles ? (
              <div className="info-card">
                <p>{t('design.modelDetail.loadingText', 'Loading...')}</p>
              </div>
            ) : fileList && fileList.length > 0 ? (
              <div className="info-card dataset-info">
                {fileList.map((file: { name: string; size: number; path: string }, index: number) => (
                  <div key={index} className="dataset-row">
                    <div className="dataset-item">
                      <span className="dataset-label">{t('design.modelDetail.datasetName', 'Dataset Name:')}</span>
                      <a
                        href="#"
                        className="dataset-link download-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDownloadFile(file.path, file.name);
                        }}
                      >
                        {file.name}
                      </a>
                    </div>
                    <div className="dataset-item">
                      <span className="dataset-label">{t('design.modelDetail.fileSize', 'File Size:')}</span>
                      <span className="dataset-value">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="info-card">
                <p>{t('design.modelDetail.noFiles', '暂无训练文件')}</p>
              </div>
            )}
          </div>
        )}

        {/* Training Results */}
        {(model.status === 'trained' || model.status === 'offline' || model.status === 'online' || model.status === 'fail') && (
          <div className="detail-section">
            <h2 className="section-title">{t('design.modelDetail.trainingMetrics', 'Training Results')}</h2>
            {loadingMetrics ? (
              <div className="info-card">
                <p>{t('design.modelDetail.loadingText', 'Loading...')}</p>
              </div>
            ) : metrics ? (
              // 优先检测数组格式
              hasArrayMetrics(metrics) ? (
                renderArrayMetrics(metrics)
              ) : hasComparisonMetrics(metrics) ? (
                model.model_type === 2 ? (
                  // model_type = 2: 显示 F1_Score 和 AUC（CE 模型）
                  <div className="info-card training-results">
                    {/* F1 Score Section */}
                    <div className="metric-section">
                      <h3 className="metric-title">
                        F1 Score
                        <Tooltip
                          title={renderF1ScoreTooltip()}
                          placement="top"
                          arrow
                          PopperProps={{
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                backgroundColor: 'white',
                                color: 'black',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: '8px',
                                padding: '16px',
                                fontSize: '14px',
                                maxWidth: 500,
                                border: 'none'
                              },
                              '& .MuiTooltip-arrow': {
                                color: 'white',
                              }
                            }
                          }}
                        >
                          <Info size={16} className="metric-info-icon" />
                        </Tooltip>
                      </h3>
                      <div className="metric-comparison">
                        <div className="metric-box base-model">
                          <div className="model-label">{t('design.modelDetail.baseModelLabel', 'Base Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.base?.F1_Score)}</div>
                        </div>
                        <div className="metric-box new-model">
                          <div className="model-label">{t('design.modelDetail.newModelLabel', 'New Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.train?.F1_Score)}</div>
                        </div>
                      </div>
                    </div>

                    {/* AUC Section */}
                    <div className="metric-section">
                      <h3 className="metric-title">
                        AUC
                        <Tooltip
                          title={renderAUCTooltip()}
                          placement="top"
                          arrow
                          PopperProps={{
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                backgroundColor: 'white',
                                color: 'black',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: '8px',
                                padding: '16px',
                                fontSize: '14px',
                                maxWidth: 500,
                                border: 'none'
                              },
                              '& .MuiTooltip-arrow': {
                                color: 'white',
                              }
                            }
                          }}
                        >
                          <Info size={16} className="metric-info-icon" />
                        </Tooltip>
                      </h3>
                      <div className="metric-comparison">
                        <div className="metric-box base-model">
                          <div className="model-label">{t('design.modelDetail.baseModelLabel', 'Base Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.base?.AUC)}</div>
                        </div>
                        <div className="metric-box new-model">
                          <div className="model-label">{t('design.modelDetail.newModelLabel', 'New Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.train?.AUC)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 其他 model_type: 显示 RMSE 和 R²
                  <div className="info-card training-results">
                    {/* RMSE Section */}
                    <div className="metric-section">
                      <h3 className="metric-title">
                        {t('design.modelDetail.rmse', 'RMSE')}
                        <Tooltip
                          title={renderRMSETooltip()}
                          placement="top"
                          arrow
                          PopperProps={{
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                backgroundColor: 'white',
                                color: 'black',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: '8px',
                                padding: '16px',
                                fontSize: '14px',
                                maxWidth: 500,
                                border: 'none'
                              },
                              '& .MuiTooltip-arrow': {
                                color: 'white',
                              }
                            }
                          }}
                        >
                          <Info size={16} className="metric-info-icon" />
                        </Tooltip>
                      </h3>
                      <div className="metric-comparison">
                        <div className="metric-box base-model">
                          <div className="model-label">{t('design.modelDetail.baseModelLabel', 'Base Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.base?.rmse)}</div>
                        </div>
                        <div className="metric-box new-model">
                          <div className="model-label">{t('design.modelDetail.newModelLabel', 'New Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.train?.rmse)}</div>
                        </div>
                      </div>
                    </div>

                    {/* R² Section */}
                    <div className="metric-section">
                      <h3 className="metric-title">
                        R²
                        <Tooltip
                          title={renderR2Tooltip()}
                          placement="top"
                          arrow
                          PopperProps={{
                            sx: {
                              '& .MuiTooltip-tooltip': {
                                backgroundColor: 'white',
                                color: 'black',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                borderRadius: '8px',
                                padding: '16px',
                                fontSize: '14px',
                                maxWidth: 500,
                                border: 'none'
                              },
                              '& .MuiTooltip-arrow': {
                                color: 'white',
                              }
                            }
                          }}
                        >
                          <Info size={16} className="metric-info-icon" />
                        </Tooltip>
                      </h3>
                      <div className="metric-comparison">
                        <div className="metric-box base-model">
                          <div className="model-label">{t('design.modelDetail.baseModelLabel', 'Base Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.base?.r2)}</div>
                        </div>
                        <div className="metric-box new-model">
                          <div className="model-label">{t('design.modelDetail.newModelLabel', 'New Model')}</div>
                          <div className="model-value">{formatMetricValue(metrics.train?.r2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                renderFlatMetrics(metrics)
              )
            ) : (
              <div className="info-card">
                <p>{t('design.modelDetail.noMetrics', '暂无训练指标')}</p>
              </div>
            )}
            {/* Download Train Log Button */}
            <button
              className="download-log-button"
              onClick={handleDownloadTrainLog}
              disabled={downloadingLog || isMock}
            >
              <Download size={16} />
              {downloadingLog
                ? t('design.modelDetail.downloadingLog', '下载中...')
                : t('design.modelDetail.downloadTrainLog', '下载训练日志')
              }
            </button>
          </div>
        )}
      </div>

      {/* File Download Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={downloadingFile}
      >
        <div style={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <div style={{ marginTop: '16px', fontSize: '16px' }}>
            {t('design.modelDetail.downloadingFile', '文件下载中...')}
          </div>
        </div>
      </Backdrop>
    </div>
  );
};

export default DesignModelDetailPage;
