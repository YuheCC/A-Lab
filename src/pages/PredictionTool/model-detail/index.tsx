import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Download } from 'lucide-react';
import {
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Backdrop,
  Tooltip,
} from '@mui/material';
import { Info } from 'lucide-react';
import { getModelDetail, deployModel, undeployModel, isMockModel, getModelFileList, getModelMetrics, downloadModelTrainLog, downloadModelFile } from '../model';
import type { ModelDetailResponse, ModelFileListResponse, ModelMetricsResponse, MetricsData } from '@/services/model/training';
import { formatFileSize } from '@/utils/fileUtils';
import { formatUTCDateTime } from '@/utils/dateUtils';
import './index.less';

const ModelDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Get model ID from URL query params
  const modelId = searchParams.get('id') || '';

  // State management
  const [model, setModel] = useState<ModelDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fileList, setFileList] = useState<ModelFileListResponse>([]);
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [downloadingLog, setDownloadingLog] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: 'deploy' | 'undeploy' | null;
  }>({
    open: false,
    type: null,
  });

  // Fetch model detail on mount
  useEffect(() => {
    const fetchModelDetail = async () => {
      if (!modelId) {
        setSnackbar({
          open: true,
          message: t('predictionTool.modelDetail.errors.noId', 'Model ID is required'),
          severity: 'error',
        });
        setLoading(false);
        return;
      }

      try {
        const data = await getModelDetail(modelId);
        setModel(data);
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.message || t('predictionTool.modelDetail.errors.fetchFailed', 'Failed to fetch model details'),
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchModelFileList = async () => {
      if (!modelId) return;
      setLoadingFiles(true);
      try {
        const data = await getModelFileList(modelId);
        setFileList(data);
      } catch (error) {
        console.error('Failed to fetch model file list:', error);
      } finally {
        setLoadingFiles(false);
      }
    };

    const fetchModelMetrics = async () => {
      if (!modelId) return;
      setLoadingMetrics(true);
      try {
        const data = await getModelMetrics(modelId);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch model metrics:', error);
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchModelDetail();
    fetchModelFileList();
    fetchModelMetrics();
  }, [modelId, t]);

  const handleBack = () => {
    navigate('/predict', { state: { activeTab: 'models' } });
  };

  const handleViewRecord = (recordId?: string) => {
    if (!recordId) return;
    navigate(`/predict/detail?id=${recordId}`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (type: 'deploy' | 'undeploy') => {
    // Check if it's a mock model
    if (model && isMockModel(model)) {
      setSnackbar({
        open: true,
        message: t('predictionTool.modelDetail.errors.mockModel', 'Cannot modify demo model'),
        severity: 'error',
      });
      return;
    }
    setDialog({ open: true, type });
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, type: null });
  };

  const handleConfirmAction = async () => {
    if (!model || !dialog.type) return;

    setActionLoading(true);
    try {
      if (dialog.type === 'deploy') {
        await deployModel(model.id);
        setSnackbar({
          open: true,
          message: t('predictionTool.modelDetail.deploySuccess', 'Model deployed successfully'),
          severity: 'success',
        });
        // Refresh model detail
        const updatedModel = await getModelDetail(modelId);
        setModel(updatedModel);
      } else if (dialog.type === 'undeploy') {
        await undeployModel(model.id);
        setSnackbar({
          open: true,
          message: t('predictionTool.modelDetail.undeploySuccess', 'Model undeployed successfully'),
          severity: 'success',
        });
        // Refresh model detail
        const updatedModel = await getModelDetail(modelId);
        setModel(updatedModel);
      }
      handleCloseDialog();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || t('predictionTool.modelDetail.errors.actionFailed', 'Action failed'),
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadTrainLog = async () => {
    if (!modelId || !model) return;

    setDownloadingLog(true);
    try {
      await downloadModelTrainLog(modelId, model.model_name);
      setSnackbar({
        open: true,
        message: t('predictionTool.modelDetail.downloadLogSuccess', '训练日志下载成功'),
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || t('predictionTool.modelDetail.errors.downloadLogFailed', '下载训练日志失败'),
        severity: 'error',
      });
    } finally {
      setDownloadingLog(false);
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    if (!modelId) return;

    setDownloadingFile(true);
    try {
      await downloadModelFile(modelId, filePath, fileName);
      setSnackbar({
        open: true,
        message: t('predictionTool.modelDetail.downloadFileSuccess', '文件下载成功'),
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || t('predictionTool.modelDetail.errors.downloadFileFailed', '文件下载失败'),
        severity: 'error',
      });
    } finally {
      setDownloadingFile(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return t('predictionTool.modelDetail.statusOnline');
      case 'trained':
        return t('predictionTool.modelDetail.statusTrained');
      case 'offline':
        return t('predictionTool.modelDetail.statusOffline');
      case 'training':
        return t('predictionTool.modelDetail.statusTraining');
      case 'fail':
        return t('predictionTool.modelDetail.statusFail');
      default:
        return status;
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

  const formatMetricValue = (value?: number | string | MetricsData, metricName?: string) => {
    if (value === null || value === undefined) return '--';
    const numericValue = Number(value as number);
    if (Number.isFinite(numericValue)) {
      // MAPE 需要转换为百分比
      if (metricName?.toUpperCase() === 'MAPE') {
        return `${(numericValue * 100).toFixed(2)}%`;
      }
      return numericValue.toFixed(2);
    }
    return String(value);
  };

  // RMSE Tooltip 内容
  const renderRMSETooltip = () => (
    <div>
      <div style={{
        marginBottom: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        {t('predictionTool.modelDetail.metricsInfo.rmse.name')}
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
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 2px' }}>
                <span style={{ fontSize: '14px', padding: '0 6px' }}>1</span>
                <div style={{ width: '100%', height: '1px', backgroundColor: '#1f2937', margin: '2px 0' }}></div>
                <span style={{ fontSize: '14px', padding: '0 6px' }}>N</span>
              </div>
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
                <span style={{ fontSize: '10px', lineHeight: '1', marginBottom: '2px' }}>N</span>
                <span style={{ fontSize: '20px', lineHeight: '1' }}>Σ</span>
                <span style={{ fontSize: '10px', lineHeight: '1', marginTop: '2px' }}>i=1</span>
              </div>
              <span style={{ fontSize: '15px' }}>(ŷ<sub>i</sub> - y<sub>i</sub>)<sup>2</sup></span>
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
          <div><strong>ŷ<sub>i</sub></strong> — {t('predictionTool.modelDetail.metricsInfo.predictedValue', '预测循环数')}</div>
          <div><strong>y<sub>i</sub></strong> — {t('predictionTool.modelDetail.metricsInfo.actualValue', '真实循环数')}</div>
          <div><strong>N</strong> — {t('predictionTool.modelDetail.metricsInfo.sampleSize', '测试集样本量')}</div>
        </div>
      </div>
    </div>
  );

  // MAE Tooltip 内容
  const renderMAETooltip = () => (
    <div>
      <div style={{
        marginBottom: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        {t('predictionTool.modelDetail.metricsInfo.mae.name')}
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
          <span>MAE =</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 2px' }}>
              <span style={{ fontSize: '14px', padding: '0 6px' }}>1</span>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#1f2937', margin: '2px 0' }}></div>
              <span style={{ fontSize: '14px', padding: '0 6px' }}>N</span>
            </div>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
              <span style={{ fontSize: '10px', lineHeight: '1', marginBottom: '2px' }}>N</span>
              <span style={{ fontSize: '20px', lineHeight: '1' }}>Σ</span>
              <span style={{ fontSize: '10px', lineHeight: '1', marginTop: '2px' }}>i=1</span>
            </div>
            <span style={{ fontSize: '15px' }}>|ŷ<sub>i</sub> - y<sub>i</sub>|</span>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          lineHeight: '2',
          color: '#374151',
          paddingTop: '12px',
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}>
          <div><strong>ŷ<sub>i</sub></strong> — {t('predictionTool.modelDetail.metricsInfo.predictedValue', '预测循环数')}</div>
          <div><strong>y<sub>i</sub></strong> — {t('predictionTool.modelDetail.metricsInfo.actualValue', '真实循环数')}</div>
          <div><strong>N</strong> — {t('predictionTool.modelDetail.metricsInfo.sampleSize', '测试集样本量')}</div>
        </div>
      </div>
    </div>
  );

  // MAPE Tooltip 内容
  const renderMAPETooltip = () => (
    <div>
      <div style={{
        marginBottom: '12px',
        fontSize: '13px',
        lineHeight: '1.6'
      }}>
        {t('predictionTool.modelDetail.metricsInfo.mape.name')}
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
          <span>MAPE =</span>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 2px' }}>
              <span style={{ fontSize: '14px', padding: '0 6px' }}>100%</span>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#1f2937', margin: '2px 0' }}></div>
              <span style={{ fontSize: '14px', padding: '0 6px' }}>N</span>
            </div>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
              <span style={{ fontSize: '10px', lineHeight: '1', marginBottom: '2px' }}>N</span>
              <span style={{ fontSize: '20px', lineHeight: '1' }}>Σ</span>
              <span style={{ fontSize: '10px', lineHeight: '1', marginTop: '2px' }}>i=1</span>
            </div>
            <span style={{ fontSize: '20px', lineHeight: '1' }}>|</span>
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 2px' }}>
              <span style={{ fontSize: '14px', padding: '0 6px' }}>ŷ<sub>i</sub> - y<sub>i</sub></span>
              <div style={{ width: '100%', height: '1px', backgroundColor: '#1f2937', margin: '2px 0' }}></div>
              <span style={{ fontSize: '14px', padding: '0 6px' }}>y<sub>i</sub></span>
            </div>
            <span style={{ fontSize: '20px', lineHeight: '1' }}>|</span>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          lineHeight: '2',
          color: '#374151',
          paddingTop: '12px',
          borderTop: '1px solid rgba(0,0,0,0.08)'
        }}>
          <div><strong>ŷ<sub>i</sub></strong> — {t('predictionTool.modelDetail.metricsInfo.predictedValue', '预测循环数')}</div>
          <div><strong>y<sub>i</sub></strong> — {t('predictionTool.modelDetail.metricsInfo.actualValue', '真实循环数')}</div>
          <div><strong>N</strong> — {t('predictionTool.modelDetail.metricsInfo.sampleSize', '测试集样本量')}</div>
        </div>
      </div>
    </div>
  );

  /**
   * 获取指标的 Tooltip 渲染函数
   */
  const getMetricTooltip = (metricKey: string) => {
    const key = metricKey.toLowerCase();
    const tooltipMap: Record<string, () => JSX.Element> = {
      rmse: renderRMSETooltip,
      mae: renderMAETooltip,
      mape: renderMAPETooltip,
    };
    return tooltipMap[key];
  };

  /**
   * 渲染带说明的指标标题
   */
  const renderMetricTitle = (metricKey: string) => {
    const tooltipRenderer = getMetricTooltip(metricKey);
    if (!tooltipRenderer) {
      return <span className="result-label">{metricKey.toUpperCase()}</span>;
    }

    return (
      <Tooltip
        title={tooltipRenderer()}
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
        <span className="result-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'help' }}>
          {metricKey.toUpperCase()}
          <Info size={14} style={{ opacity: 0.7 }} />
        </span>
      </Tooltip>
    );
  };

  const renderFlatMetrics = (metricsData: ModelMetricsResponse) => {
    const entries = Object.entries(metricsData).filter(([key]) => key !== 'base' && key !== 'train');
    if (entries.length === 0) {
      return (
        <div className="info-card">
          <p>{t('predictionTool.modelDetail.noMetrics', '暂无训练指标')}</p>
        </div>
      );
    }

    return (
      <div className="info-card training-results">
        <div className="training-results-grid">
          {entries.map(([key, value]) => (
            <div className="result-card" key={key}>
              {renderMetricTitle(key)}
              <span className="result-value">{formatMetricValue(value, key)}</span>
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

          // MAPE 需要转换为百分比
          const isMAPE = key.toUpperCase() === 'MAPE';
          const beforeValue = isMAPE ? `${(value[0] * 100).toFixed(2)}%` : value[0].toFixed(2);
          const afterValue = isMAPE ? `${(value[1] * 100).toFixed(2)}%` : value[1].toFixed(2);

          const tooltipRenderer = getMetricTooltip(key);

          return (
            <div className="metric-section" key={key}>
              <h3 className="metric-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {key.toUpperCase()}
                {tooltipRenderer && (
                  <Tooltip
                    title={tooltipRenderer()}
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
                    <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                      <Info size={16} style={{ opacity: 0.7 }} />
                    </span>
                  </Tooltip>
                )}
              </h3>
              <div className="metric-comparison">
                <div className="metric-box base-model">
                  <div className="model-label">{t('predictionTool.modelDetail.beforeTraining', '训练前')}</div>
                  <div className="model-value">{beforeValue}</div>
                </div>
                <div className="metric-box new-model">
                  <div className="model-label">{t('predictionTool.modelDetail.afterTraining', '训练后')}</div>
                  <div className="model-value">{afterValue}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <div className="model-detail-page-wrapper">
        <div className="model-detail-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </div>
      </div>
    );
  }

  // Show error state if no model
  if (!model) {
    return (
      <div className="model-detail-page-wrapper">
        <div className="model-detail-page">
          <div className="page-header">
            <button className="back-button" onClick={handleBack}>
              <ArrowLeft size={16} />
              {t('predictionTool.modelDetail.back')}
            </button>
          </div>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>{t('predictionTool.modelDetail.errors.notFound', 'Model not found')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="model-detail-page-wrapper">
      <div className="model-detail-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="title">{model.model_name}</h1>
            <p className="subtitle">{t('predictionTool.modelDetail.modelId')} {model.id}</p>
          </div>
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={16} />
            {t('predictionTool.modelDetail.back')}
          </button>
        </div>

      {/* Model Information */}
      <div className="detail-section">
        <div className="section-header">
          <h2 className="section-title">{t('predictionTool.modelDetail.title')}</h2>
          <div className="section-actions">
            {!isMockModel(model) && (
              <>
                {model.status === 'online' ? (
                  <button className="offline-button" onClick={() => handleOpenDialog('undeploy')}>
                    {t('predictionTool.modelDetail.offlineModel', '下线模型')}
                  </button>
                ) : (model.status === 'trained' || model.status === 'offline') ? (
                  <button className="online-button" onClick={() => handleOpenDialog('deploy')}>
                    {t('predictionTool.modelDetail.onlineModel', '上线模型')}
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
        <div className="info-card">
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
            <span className="value">{formatUTCDateTime(model.created_at)}</span>
          </div>
          <div className="info-row">
            <span className="label">{t('predictionTool.modelDetail.remarks')}</span>
            <span className="value">{model.remark}</span>
          </div>
        </div>
      </div>

      {/* Base Model */}
      <div className="detail-section">
        <h2 className="section-title">{t('predictionTool.modelDetail.baseModel')}</h2>
        <div className="info-card">
          <div className="info-row">
            <span className="value">{model.base_model_name}</span>
          </div>
        </div>
      </div>

      {/* Training Results - Only show if status is trained, offline or online */}
      {(model.status === 'trained' || model.status === 'offline' || model.status === 'online') && model.train_result && (
        <div className="detail-section">
          <h2 className="section-title">{t('predictionTool.modelDetail.trainingResults')}</h2>
          <div className="info-card">
             <div className="training-results-grid">
               {model.train_result.accuracy && (
                 <div className="result-card">
                   <span className="result-label">{t('predictionTool.modelDetail.accuracy')}</span>
                   <span className="result-value">{model.train_result.accuracy}</span>
                 </div>
               )}
               {model.train_result.loss && (
                 <div className="result-card">
                   <span className="result-label">{t('predictionTool.modelDetail.loss')}</span>
                   <span className="result-value">{model.train_result.loss}</span>
                 </div>
               )}
               {model.train_result.epochs && (
                 <div className="result-card">
                   <span className="result-label">{t('predictionTool.modelDetail.epochs')}</span>
                   <span className="result-value">{model.train_result.epochs}</span>
                 </div>
               )}
               {model.train_result.training_time && (
                 <div className="result-card">
                   <span className="result-label">{t('predictionTool.modelDetail.trainingTime')}</span>
                   <span className="result-value">{model.train_result.training_time}</span>
                 </div>
               )}
               {model.train_result.validation_score && (
                 <div className="result-card full-width">
                   <span className="result-label">{t('predictionTool.modelDetail.validationScore')}</span>
                   <span className="result-value">{model.train_result.validation_score}</span>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Training Dataset */}
      {(model.status === 'trained' || model.status === 'offline' || model.status === 'online' || model.status === 'fail') && (
        <div className="detail-section">
          <h2 className="section-title">{t('predictionTool.modelDetail.trainingFiles', 'Training Dataset')}</h2>
          {loadingFiles ? (
            <div className="info-card">
              <p>{t('predictionTool.modelDetail.loadingText', 'Loading...')}</p>
            </div>
          ) : fileList && fileList.length > 0 ? (
            <div className="info-card dataset-info">
              {fileList.map((file, index) => (
                <div key={index} className="dataset-row">
                  <div className="dataset-item">
                    <span className="dataset-label">{t('predictionTool.modelDetail.datasetName', 'Dataset Name:')}</span>
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
                    <span className="dataset-label">{t('predictionTool.modelDetail.fileSize', 'File Size:')}</span>
                    <span className="dataset-value">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="info-card">
              <p>{t('predictionTool.modelDetail.noFiles', '暂无训练文件')}</p>
            </div>
          )}
        </div>
      )}

      {/* Training Results */}
      {(model.status === 'trained' || model.status === 'offline' || model.status === 'online' || model.status === 'fail') && (
        <div className="detail-section">
          <h2 className="section-title">{t('predictionTool.modelDetail.trainingMetrics', 'Training Results')}</h2>
          {loadingMetrics ? (
            <div className="info-card">
              <p>{t('predictionTool.modelDetail.loadingText', 'Loading...')}</p>
            </div>
          ) : metrics ? (
            // 优先检测数组格式
            hasArrayMetrics(metrics) ? (
              renderArrayMetrics(metrics)
            ) : hasComparisonMetrics(metrics) ? (
              <div className="info-card training-results">
                {/* RMSE Section */}
                <div className="metric-section">
                  <h3 className="metric-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t('predictionTool.modelDetail.rmse', 'RMSE')}
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
                      <span style={{ cursor: 'help', display: 'inline-flex', alignItems: 'center' }}>
                        <Info size={16} style={{ opacity: 0.7 }} />
                      </span>
                    </Tooltip>
                  </h3>
                  <div className="metric-comparison">
                    <div className="metric-box base-model">
                      <div className="model-label">{t('predictionTool.modelDetail.baseModelLabel', 'Base Model')}</div>
                      <div className="model-value">{formatMetricValue(metrics.base?.rmse)}</div>
                    </div>
                    <div className="metric-box new-model">
                      <div className="model-label">{t('predictionTool.modelDetail.newModelLabel', 'New Model')}</div>
                      <div className="model-value">{formatMetricValue(metrics.train?.rmse)}</div>
                    </div>
                  </div>
                </div>

                {/* R² Section */}
                <div className="metric-section">
                  <h3 className="metric-title">R²</h3>
                  <div className="metric-comparison">
                    <div className="metric-box base-model">
                      <div className="model-label">{t('predictionTool.modelDetail.baseModelLabel', 'Base Model')}</div>
                      <div className="model-value">{formatMetricValue(metrics.base?.r2)}</div>
                    </div>
                    <div className="metric-box new-model">
                      <div className="model-label">{t('predictionTool.modelDetail.newModelLabel', 'New Model')}</div>
                      <div className="model-value">{formatMetricValue(metrics.train?.r2)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              renderFlatMetrics(metrics)
            )
          ) : (
            <div className="info-card">
              <p>{t('predictionTool.modelDetail.noMetrics', '暂无训练指标')}</p>
            </div>
          )}
          {/* Download Train Log Button */}
          <button
            className="download-log-button"
            onClick={handleDownloadTrainLog}
            disabled={downloadingLog || isMockModel(model)}
          >
            <Download size={16} />
            {downloadingLog
              ? t('predictionTool.modelDetail.downloadingLog', '下载中...')
              : t('predictionTool.modelDetail.downloadTrainLog', '下载训练日志')
            }
          </button>
        </div>
      )}

      {/* Prediction Records - Only show if status is online */}
      {model.status === 'online' && model.prediction_result && model.prediction_result.length > 0 && (
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
                {model.prediction_result.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.file_name}</td>
                    <td>{record.battery_count}</td>
                    <td>{record.avg_cycle_life} {t('predictionTool.results.cycleUnit', 'cycles')}</td>
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

      {/* Confirmation Dialog */}
      <Dialog open={dialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialog.type === 'deploy'
            ? t('predictionTool.modelDetail.confirmDeploy', 'Confirm Deploy')
            : t('predictionTool.modelDetail.confirmUndeploy', 'Confirm Undeploy')
          }
        </DialogTitle>
        <DialogContent>
          {dialog.type === 'deploy'
            ? t('predictionTool.modelDetail.deployMessage', 'Are you sure you want to deploy this model? This will make it available for predictions.')
            : t('predictionTool.modelDetail.undeployMessage', 'Are you sure you want to undeploy this model? This will make it offline.')
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            {t('predictionTool.modelDetail.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={dialog.type === 'deploy' ? 'primary' : 'warning'}
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : t('predictionTool.modelDetail.confirm', 'Confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Download Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={downloadingFile}
      >
        <div style={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <div style={{ marginTop: '16px', fontSize: '16px' }}>
            {t('predictionTool.modelDetail.downloadingFile', '文件下载中...')}
          </div>
        </div>
      </Backdrop>
    </div>
  );
};

export default ModelDetailPage;
