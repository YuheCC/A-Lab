import React, { useState, useEffect } from 'react';
import { Upload, Activity, BarChart3, Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from '@umijs/max';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import InfoTooltip from '@/components/InfoTooltip';
import StepContent from './components/StepContent';
import UniversalHistoryModule from '../components/UniversalHistoryModule';
import { renderPredictionCard } from './components/PredictionCardRenderer';
import HistoryModal from './components/HistoryModal';
import TutorialLink from './components/TutorialLink';
import Pagination from '@/components/Pagination';
import { type PredictResponse } from '@/services/prediction/predictionTool';
import { getHistoryList, deleteHistory, isMockRecord } from './model';
import { getModelList as getModelListFromModel, getBaseModelList } from '@/pages/Design/model';
import { type ModelListItem } from '@/services/model/training';
import { formatUTCDateTime } from '@/utils/dateUtils';
import './PredictionTool.less';
import { normalizeServerDate } from '@/utils/messageUtils';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;  // 保留兼容性
  avgCycleLife1: number;
  avgCycleLife2: number;
  isMock?: boolean;  // 标识是否为mock数据
  rawData?: any;  // 保存原始数据用于判断
}

// Mock数据已移除，使用真实API数据

const PredictionTool: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [historyData, setHistoryData] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab state
  const getInitialTab = (): 'tool' | 'models' => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'models' || tabParam === 'tool') ? tabParam as 'tool' | 'models' : 'tool';
  };
  const [activeTab, setActiveTab] = useState<'tool' | 'models'>(getInitialTab());

  // Models data state
  const [modelsData, setModelsData] = useState<ModelListItem[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelsCurrentPage, setModelsCurrentPage] = useState(1);
  const [modelsPageSize] = useState(20);
  const [modelsTotal, setModelsTotal] = useState(0);

  // Models filter state
  const [modelSearchKeyword, setModelSearchKeyword] = useState<string>('');
  const [selectedModelStatus, setSelectedModelStatus] = useState<string>('');
  const [selectedBaseModel, setSelectedBaseModel] = useState<string>('');
  const [baseModelOptions, setBaseModelOptions] = useState<string[]>([]);

  // Get dayjs locale based on current language
  const getDayjsLocale = () => {
    const lang = i18n.language || 'zh';
    const localeMap: Record<string, string> = {
      'zh': 'zh-cn',
      'zh-CN': 'zh-cn',
      'en': 'en',
      'en-US': 'en',
      'ja': 'ja',
      'ja-JP': 'ja',
      'ko': 'ko',
      'ko-KR': 'ko',
    };
    return localeMap[lang] || 'zh-cn';
  };

  // 将API数据转换为FileRecord格式
  const transformApiDataToFileRecord = (apiData: any): FileRecord => {
    const avgCycleLife1 = apiData.avg_cycle_life_1 || 0;
    const avgCycleLife2 = apiData.avg_cycle_life_2 || 0;
    const avgCycleLife = avgCycleLife1 > 0 ? avgCycleLife1 : avgCycleLife2;

    return {
      id: apiData.id.toString(),
      name: apiData.file_name,
      date: new Date(normalizeServerDate(apiData.created_at)).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      batteryCount: apiData.barcode_count,
      avgCirculation: avgCycleLife > 0 ? `${avgCycleLife.toFixed(1)}${t('predictionTool.results.cycleUnit')}` : t('predictionTool.results.unknown'),
      avgCycleLife1: avgCycleLife1,
      avgCycleLife2: avgCycleLife2,
      isMock: apiData.isMock || false,
      rawData: apiData
    };
  };

  // 加载历史记录
  const loadHistoryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getHistoryList({ page: 1, page_size: 20 });
      const transformedData = response.data.map(transformApiDataToFileRecord);
      setHistoryData(transformedData);
    } catch (err: any) {
      setError(err.message || t('predictionTool.errors.loadHistoryFailed'));
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取历史记录
  useEffect(() => {
    if (activeTab === 'tool') {
      loadHistoryData();
    }
  }, [activeTab]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'models' || tabParam === 'tool')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, []);

  const fetchModelsData = async (page: number = modelsCurrentPage) => {
    setModelsLoading(true);
    setModelsError(null);

    try {
      const params: any = {
        page,
        page_size: modelsPageSize,
      };

      // Add search keyword if provided
      if (modelSearchKeyword) {
        params.keyword = modelSearchKeyword;
      }

      // Add status filter if selected
      if (selectedModelStatus) {
        params.status = selectedModelStatus;
      }

      // Add base model filter if selected
      if (selectedBaseModel) {
        params.base_model_name = selectedBaseModel;
      }

      const response = await getModelListFromModel(params);
      setModelsData(response.data);
      setModelsTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setModelsError(err instanceof Error ? err.message : t('design.models.loadingError', 'Failed to load models'));
      setModelsData([]);
      setModelsTotal(0);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'models') {
      // Reset to page 1 when filters change
      if (modelsCurrentPage === 1) {
        fetchModelsData(1);
      } else {
        setModelsCurrentPage(1);
      }
    }
  }, [activeTab, modelSearchKeyword, selectedModelStatus, selectedBaseModel]);

  useEffect(() => {
    if (activeTab === 'models') {
      fetchModelsData(modelsCurrentPage);
    }
  }, [modelsCurrentPage]);

  // Fetch base model options from API
  useEffect(() => {
    const fetchBaseModelOptions = async () => {
      try {
        const response = await getBaseModelList({ page: 1, page_size: 100 });
        const baseModelNames = response.data
          .map(model => model.model_name)
          .filter(Boolean);
        setBaseModelOptions(baseModelNames);
      } catch (err) {
        console.error('Failed to fetch base model options:', err);
        setBaseModelOptions([]);
      }
    };
    fetchBaseModelOptions();
  }, []);

  const steps = [
    {
      id: 'upload',
      title: t('predictionTool.steps.upload'),
      icon: Upload
    },
    {
      id: 'ai-predict',
      title: t('predictionTool.steps.aiPredict'),
      icon: Activity
    },
    {
      id: 'results',
      title: t('predictionTool.steps.results'),
      icon: BarChart3
    }
  ];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const handleNewPrediction = () => {
    setCurrentStep(0);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedFile(null);
    setError(null);
  };

  const handleViewDetails = (file: FileRecord) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleDeleteFile = async (fileId: string) => {
    // 查找对应的记录
    const record = historyData.find(h => h.id === fileId);
    if (record && record.isMock) {
      alert(t('predictionTool.history.cannotDeleteDemo', 'Cannot delete demo records'));
      return;
    }

    // 显示确认对话框
    if (!confirm(t('predictionTool.history.deleteConfirm'))) {
      return;
    }

    try {
      setLoading(true);
      await deleteHistory({ id: parseInt(fileId) });

      // 删除成功后，重新加载历史记录
      await loadHistoryData();
    } catch (err: any) {
      setError(err.message || t('predictionTool.history.deleteFailed'));
      console.error('Delete file error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const handleTabChange = (tab: 'tool' | 'models') => {
    setActiveTab(tab);
  };

  const handleClearModelsFilters = () => {
    setModelSearchKeyword('');
    setSelectedModelStatus('');
    setSelectedBaseModel('');
  };

  const handleModelsPageChange = (page: number) => {
    setModelsCurrentPage(page);
  };

  return (
    <div className="prediction-tool">
      <div className="prediction-layout">
        {activeTab === 'tool' && (
          <>
            <div className="left-area">
              {error && (
                <div style={{
                  color: '#e53e3e',
                  backgroundColor: '#fed7d7',
                  padding: '12px',
                  borderRadius: '6px',
                  margin: '16px 0',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              <UniversalHistoryModule
                title={t('predictionTool.history.title')}
                data={historyData}
                cardRenderer={renderPredictionCard}
                onNewPrediction={handleNewPrediction}
                onViewDetails={handleViewDetails}
                onDeleteItem={handleDeleteFile}
                newPredictionText={t('predictionTool.history.newPrediction')}
                filterConfig={{
                  smilesSearchPlaceholder: t('predictionTool.history.searchPlaceholder')
                }}
              />
              {loading && (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {t('predictionTool.history.loadingText')}
                </div>
              )}
            </div>

            <div className="right-area">
              <div className="prediction-header">
                <div className="title-row">
                  <h1 className="prediction-title">{t('predictionTool.title')}</h1>
                  <InfoTooltip
                    title={
                      <div style={{ maxWidth: '320px' }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ color: 'red' }}>{t('predictionTool.disclaimerTitle')}</strong>
                        </div>
                        <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                          {t('predictionTool.disclaimer')}
                        </div>
                      </div>
                    }
                    placement="bottom"
                  >
                    <Info size={20} style={{ color: '#64748b', cursor: 'pointer' }} />
                  </InfoTooltip>
                </div>
                <p className="prediction-subtitle">
                  {t('predictionTool.subtitle')}
                  <TutorialLink />
                </p>
                
                <div className="prediction-tool-tabs-header">
                  <div className="prediction-tool-tabs">
                    <button
                      className={`prediction-tool-tab ${activeTab === 'tool' ? 'active' : ''}`}
                      onClick={() => handleTabChange('tool')}
                    >
                      {t('predictionTool.tabs.tool', 'Prediction Tool')}
                    </button>
                    <button
                      className={`prediction-tool-tab ${activeTab === 'models' ? 'active' : ''}`}
                      onClick={() => handleTabChange('models')}
                    >
                      {t('predictionTool.tabs.models', 'Models')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="operation-area">
                <div className="steps-container">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const status = getStepStatus(index);

                    return (
                      <div
                        key={step.id}
                        className="step-item"
                        // onClick={() => setCurrentStep(index)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`step-icon ${status}`}>
                          <Icon size={16} />
                        </div>
                        <span className={`step-text ${status}`}>
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <StepContent
                  activeStep={currentStep}
                  onStepChange={setCurrentStep}
                  onPredictionComplete={loadHistoryData}
                  onReset={handleReset}
                />
              </div>
            </div>
          </>
        )}

        {activeTab === 'models' && (
          <div className="prediction-tool-models-container">
            <div className="prediction-header">
              <div className="title-row">
                <h1 className="prediction-title">{t('predictionTool.title')}</h1>
                <InfoTooltip
                  title={
                    <div style={{ maxWidth: '320px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong style={{ color: 'red' }}>{t('predictionTool.disclaimerTitle')}</strong>
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                        {t('predictionTool.disclaimer')}
                      </div>
                    </div>
                  }
                  placement="bottom"
                >
                  <Info size={20} style={{ color: '#64748b', cursor: 'pointer' }} />
                </InfoTooltip>
              </div>
              <p className="prediction-subtitle">
                {t('predictionTool.subtitle')}
                <TutorialLink />
              </p>
              
              <div className="prediction-tool-tabs-header">
                <div className="prediction-tool-tabs">
                  <button
                    className={`prediction-tool-tab ${activeTab === 'tool' ? 'active' : ''}`}
                    onClick={() => handleTabChange('tool')}
                  >
                    {t('predictionTool.tabs.tool', 'Prediction Tool')}
                  </button>
                  <button
                    className={`prediction-tool-tab ${activeTab === 'models' ? 'active' : ''}`}
                    onClick={() => handleTabChange('models')}
                  >
                    {t('predictionTool.tabs.models', 'Models')}
                  </button>
                </div>
              </div>
            </div>

            <div className="prediction-tool-tab-content">
              <div className="prediction-tool-tab-panel">
                <div className="prediction-tool-models-filters">
                  <input
                    type="text"
                    className="prediction-tool-models-search-input"
                    value={modelSearchKeyword}
                    onChange={(e) => setModelSearchKeyword(e.target.value)}
                    placeholder={t('performance.models.filters.searchPlaceholder', '搜索模型ID或名称...')}
                  />
                  <select
                    className="prediction-tool-models-status-filter"
                    value={selectedModelStatus}
                    onChange={(e) => setSelectedModelStatus(e.target.value)}
                  >
                    <option value="" disabled hidden>{t('performance.models.filters.selectStatus', 'Select Status')}</option>
                    <option value="online">{t('performance.models.statusOnline', 'Online')}</option>
                    <option value="trained">{t('performance.models.statusTrained', 'Trained')}</option>
                    <option value="offline">{t('performance.models.statusOffline', 'Offline')}</option>
                    <option value="training">{t('performance.models.statusTraining', 'Training')}</option>
                  </select>
                  <select
                    className="prediction-tool-models-base-model-filter"
                    value={selectedBaseModel}
                    onChange={(e) => setSelectedBaseModel(e.target.value)}
                  >
                    <option value="" disabled hidden>{t('performance.models.filters.selectBaseModel', 'Select Base Model')}</option>
                    {baseModelOptions.map((baseModel) => (
                      <option key={baseModel} value={baseModel}>{baseModel}</option>
                    ))}
                  </select>
                  {(modelSearchKeyword || selectedModelStatus || selectedBaseModel) && (
                    <button className="prediction-tool-clear-filters-button" onClick={handleClearModelsFilters}>
                      <X size={16} />
                      <span>{t('performance.models.filters.clearFilters', 'Clear Filters')}</span>
                    </button>
                  )}
                </div>
                <div className="prediction-tool-models-count-text">
                  {t('performance.models.showingRecords', '显示 {{count}} / {{total}} 条记录', {
                    count: modelsData.length,
                    total: modelsTotal
                  })}
                </div>
                {modelsLoading ? (
                  <div className="prediction-tool-loading-state">
                    <p>{t('design.models.loadingText', 'Loading...')}</p>
                  </div>
                ) : modelsError ? (
                  <div className="prediction-tool-error-state">
                    <p>{t('design.models.error', 'Error')}: {modelsError}</p>
                  </div>
                ) : (
                  <>
                    <div className="prediction-tool-records-table-wrapper">
                      <table className="prediction-tool-records-table">
                        <thead>
                          <tr>
                            <th>{t('performance.models.columns.modelId', 'Model ID')}</th>
                            <th>{t('performance.models.columns.modelName', 'Model Name')}</th>
                            <th>{t('performance.models.columns.baseModel', 'Base Model')}</th>
                            <th>{t('performance.models.columns.status', 'Status')}</th>
                            <th>{t('performance.models.columns.created', 'Created')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modelsData.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="prediction-tool-no-data">
                                {t('performance.models.noResults', 'No models found.')}
                              </td>
                            </tr>
                          ) : (
                            modelsData.map((model) => (
                              <tr key={model.id}>
                                <td className="prediction-tool-record-id">DM-{String(model.id).padStart(6, '0')}</td>
                                <td className="prediction-tool-file-name">
                                  {model.base_model_id === -1 ? (
                                    <span className="prediction-tool-model-name-text">{model.model_name}</span>
                                  ) : (
                                    <a
                                      className="prediction-tool-model-name-link"
                                      onClick={() => navigate(`/design/model-detail?id=${model.id}`)}
                                    >
                                      {model.model_name}
                                    </a>
                                  )}
                                </td>
                                <td>{model.base_model_name}</td>
                                <td>
                                  <span style={{
                                    backgroundColor: model.status === 'online' ? '#dcfce7' :
                                                   model.status === 'trained' ? '#e0e7ff' :
                                                   model.status === 'offline' ? '#e0e7ff' : '#fef3c7',
                                    color: model.status === 'online' ? '#008236' :
                                           model.status === 'trained' ? '#4338ca' :
                                           model.status === 'offline' ? '#4338ca' : '#92400e',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                  }}>
                                    {model.status === 'online' ? t('performance.models.statusOnline', 'Online') :
                                     model.status === 'trained' ? t('performance.models.statusTrained', 'Trained') :
                                     model.status === 'offline' ? t('performance.models.statusOffline', 'Offline') :
                                     t('performance.models.statusTraining', 'Training')}
                                  </span>
                                </td>
                                <td className="prediction-tool-created-date">
                                  {formatUTCDateTime(model.created_at) || '-'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      current={modelsCurrentPage}
                      total={modelsTotal}
                      pageSize={modelsPageSize}
                      onChange={handleModelsPageChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <HistoryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        fileRecord={selectedFile}
      />
    </div>
  );
};

export default PredictionTool;