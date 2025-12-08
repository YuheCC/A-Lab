import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import { Activity, X } from 'lucide-react';
import { getHistoryList, deleteHistory, getModelList, getBaseModelList, isMockModel } from './model';
import { normalizeServerDate } from '@/utils/messageUtils';
import Introduction from './components/Introduction';
import Pagination from '@/components/Pagination';
import type { ModelListItem } from '@/services/model/training';
import './index.less';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
  avgCycleLife1: number;
  avgCycleLife2: number;
  model?: string;
  isMock?: boolean;
  rawData?: any;
}

interface PredictionToolProps {}

const PredictionTool: React.FC<PredictionToolProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

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

  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<FileRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Models state
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelsData, setModelsData] = useState<ModelListItem[]>([]);
  const [modelsCurrentPage, setModelsCurrentPage] = useState(1);
  const [modelsPageSize] = useState(20);
  const [modelsTotal, setModelsTotal] = useState(0);

  // Models filter state
  const [modelSearchKeyword, setModelSearchKeyword] = useState<string>('');
  const [selectedModelStatus, setSelectedModelStatus] = useState<string>('');
  const [selectedBaseModel, setSelectedBaseModel] = useState<string>('');
  const [selectedBaseModelId, setSelectedBaseModelId] = useState<number | undefined>(undefined);
  const [baseModelOptions, setBaseModelOptions] = useState<Array<{ id: number; name: string }>>([]);

  // Records filter state
  const [recordSearchKeyword, setRecordSearchKeyword] = useState<string>('');
  const [recordSelectedModel, setRecordSelectedModel] = useState<string>('all');
  const [recordSelectedDate, setRecordSelectedDate] = useState<string>('');

  const getInitialTab = (): 'introduction' | 'records' | 'models' => {
    // Check if navigation state has activeTab (from train page)
    const stateTab = (location.state as any)?.activeTab;
    if (stateTab === 'models') return 'models';

    const tabParam = searchParams.get('tab');
    return (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models') ? tabParam as 'introduction' | 'records' | 'models' : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<'introduction' | 'records' | 'models'>(getInitialTab());

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, []);

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
      avgCirculation: avgCycleLife > 0 ? `${avgCycleLife.toFixed(0)}` : t('predictionTool.results.unknown'),
      avgCycleLife1: avgCycleLife1,
      avgCycleLife2: avgCycleLife2,
      model: apiData.model || 'Li-ion Cycle Predictor v2.1',
      isMock: apiData.isMock || false,
      rawData: apiData
    };
  };

  const fetchHistoryData = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryList({ page, page_size: pageSize });
      const transformedData = response.data.map(transformApiDataToFileRecord);
      setHistoryData(transformedData);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch prediction history:', err);
      setError(err instanceof Error ? err.message : t('predictionTool.history.loading.error', '获取历史记录失败'));
      setHistoryData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

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

      // Add base_model_id filter if selected
      if (selectedBaseModelId !== undefined) {
        params.base_model_id = selectedBaseModelId;
      }

      const response = await getModelList(params);
      setModelsData(response.data);
      setModelsTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch models list:', err);
      setModelsError(err instanceof Error ? err.message : t('predictionTool.models.loading.error', 'Failed to load models'));
      setModelsData([]);
      setModelsTotal(0);
    } finally {
      setModelsLoading(false);
    }
  };

  // Fetch base model options from API
  useEffect(() => {
    const fetchBaseModelOptions = async () => {
      try {
        const response = await getBaseModelList({ page: 1, page_size: 100 });
        const options = response.data
          .map(model => ({
            id: model.id,
            name: model.model_name
          }))
          .filter(option => option.name);
        setBaseModelOptions(options);
      } catch (err) {
        console.error('Failed to fetch base model options:', err);
        setBaseModelOptions([]);
      }
    };
    fetchBaseModelOptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'models') {
      // Reset to page 1 when filters change
      if (modelsCurrentPage === 1) {
        fetchModelsData(1);
      } else {
        setModelsCurrentPage(1);
      }
    }
  }, [activeTab, modelSearchKeyword, selectedModelStatus, selectedBaseModelId]);

  useEffect(() => {
    if (activeTab === 'models') {
      fetchModelsData(modelsCurrentPage);
    }
  }, [modelsCurrentPage]);

  useEffect(() => {
    if (activeTab === 'records') {
      fetchHistoryData(currentPage);
    }
  }, [activeTab, currentPage]);

  const handleNewPrediction = () => {
    window.open('/predict/create', '_blank');
  };

  const handleTrain = () => {
    navigate('/predict/train');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/predict/detail?id=${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    const record = historyData.find(h => h.id === id);
    if (record && record.isMock) {
      alert(t('predictionTool.history.cannotDeleteDemo', 'Cannot delete demo records'));
      return;
    }

    if (!confirm(t('predictionTool.history.deleteConfirm', '确定要删除这条记录吗？'))) {
      return;
    }

    try {
      await deleteHistory({ id: parseInt(id) });
      // 删除后重新获取当前页数据
      await fetchHistoryData(currentPage);
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError(err instanceof Error ? err.message : t('predictionTool.history.deleteFailed', '删除记录失败'));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleModelsPageChange = (page: number) => {
    setModelsCurrentPage(page);
  };

  const handleTabChange = (tab: 'introduction' | 'records' | 'models') => {
    setActiveTab(tab);
  };

  const handleViewModelDetail = (modelId: number | string) => {
    navigate(`/prediction-tool/model-detail?id=${modelId}`);
  };

  const handleModelStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModelStatus(e.target.value);
  };

  const handleBaseModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setSelectedBaseModel(selectedValue);

    if (selectedValue) {
      const selectedOption = baseModelOptions.find(option => option.name === selectedValue);
      setSelectedBaseModelId(selectedOption?.id);
    } else {
      setSelectedBaseModelId(undefined);
    }
  };

  const handleClearModelsFilters = () => {
    setModelSearchKeyword('');
    setSelectedModelStatus('');
    setSelectedBaseModel('');
    setSelectedBaseModelId(undefined);
  };

  // Filter records data
  const filteredHistoryData = historyData.filter((record) => {
    const keywordMatch = !recordSearchKeyword ||
      record.name.toLowerCase().includes(recordSearchKeyword.toLowerCase()) ||
      record.id.includes(recordSearchKeyword);
    const modelMatch = recordSelectedModel === 'all' || record.model === recordSelectedModel;
    const dateMatch = !recordSelectedDate || record.date.startsWith(recordSelectedDate);
    return keywordMatch && modelMatch && dateMatch;
  });

  // Get unique model names from history data
  const uniqueModels = Array.from(new Set(historyData.map(record => record.model).filter(Boolean)));

  // Clear records filters
  const handleClearRecordsFilters = () => {
    setRecordSearchKeyword('');
    setRecordSelectedModel('all');
    setRecordSelectedDate('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return { text: t('predictionTool.models.statusOnline', 'Online'), color: '#dcfce7', textColor: '#008236' };
      case 'trained':
        return { text: t('predictionTool.models.statusTrained', 'Trained'), color: '#dbeafe', textColor: '#1e40af' };
      case 'training':
        return { text: t('predictionTool.models.statusTraining', 'Training'), color: '#fef3c7', textColor: '#92400e' };
      case 'offline':
        return { text: t('predictionTool.models.statusOffline', 'Offline'), color: '#f3f4f6', textColor: '#6b7280' };
      default:
        return { text: status, color: '#f3f4f6', textColor: '#374151' };
    }
  };

  return (
    <div className="prediction-tool-container">
      <div className="prediction-header">
        <h1 className="prediction-title">{t('predictionTool.title')}</h1>
        <p className="prediction-subtitle">
          {t('predictionTool.subtitle')}
        </p>
      </div>

      <div className="prediction-action-section">
        <button className="new-prediction-button" onClick={handleNewPrediction}>
          + {t('predictionTool.history.newPrediction', 'New Prediction')}
        </button>
        <button className="train-button" onClick={handleTrain}>
          <Activity size={16} />
          {t('predictionTool.history.train', 'Train')}
        </button>
      </div>

      <div className="prediction-tool-table-container">
        <div className="prediction-tabs-header">
          <div className="prediction-tabs">
            <button
              className={`prediction-tab ${activeTab === 'introduction' ? 'active' : ''}`}
              onClick={() => handleTabChange('introduction')}
            >
              {t('predictionTool.tabs.introduction', 'Introduction')}
            </button>
            <button
              className={`prediction-tab ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => handleTabChange('records')}
            >
              {t('predictionTool.tabs.records', 'Records')}
            </button>
            <button
              className={`prediction-tab ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => handleTabChange('models')}
            >
              {t('predictionTool.tabs.models', 'Models')}
            </button>
          </div>
        </div>

        <div className="prediction-tab-content">
          {activeTab === 'introduction' && (
            <div className="prediction-tab-panel">
              <Introduction />
            </div>
          )}

          {activeTab === 'records' && (
            <div className="prediction-tab-panel">
              {loading ? (
                <div className="loading-state">
                  <p>{t('predictionTool.history.loadingText', 'Loading...')}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t('predictionTool.history.error', 'Error')}: {error}</p>
                </div>
              ) : (
                <>
                  <div className="records-filters">
                    <input
                      type="text"
                      className="records-search-input"
                      value={recordSearchKeyword}
                      onChange={(e) => setRecordSearchKeyword(e.target.value)}
                      placeholder={t('predictionTool.records.searchPlaceholder', '搜索record名称或ID')}
                    />
                    <select
                      className="records-model-filter"
                      value={recordSelectedModel}
                      onChange={(e) => setRecordSelectedModel(e.target.value)}
                      aria-label={t('predictionTool.records.modelFilter', 'Model filter')}
                    >
                      <option value="all">{t('predictionTool.records.allModels', 'All Models')}</option>
                      {uniqueModels.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale={getDayjsLocale()}
                    >
                      <DatePicker
                        className="records-date-filter"
                        value={recordSelectedDate ? dayjs(recordSelectedDate) : null}
                        onChange={(date: Dayjs | null) => {
                          setRecordSelectedDate(date ? date.format('YYYY-MM-DD') : '');
                        }}
                        enableAccessibleFieldDOMStructure={false}
                        slotProps={{
                          textField: {
                            placeholder: t('predictionTool.models.filters.selectDate', 'Select date'),
                            size: 'small',
                            fullWidth: true,
                            sx: {
                              minWidth: 140,
                              maxWidth: 180,
                              '& .MuiInputBase-root': {
                                height: 32,
                                minHeight: 32,
                                fontSize: 13,
                                borderRadius: '6px',
                              },
                              '& .MuiInputBase-input': {
                                padding: '0 10px',
                                height: 32,
                                lineHeight: '32px',
                                fontSize: 13,
                                color: '#374151',
                                boxSizing: 'border-box',
                                '&::placeholder': {
                                  color: '#9ca3af',
                                  opacity: 1,
                                },
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#d1d5dc',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#9ca3af',
                              },
                              '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#56B26A',
                                borderWidth: 1,
                              },
                              '& .MuiInputAdornment-root': {
                                height: 32,
                                maxHeight: 32,
                                marginLeft: 0,
                              },
                              '& .MuiIconButton-root': {
                                padding: '4px',
                              },
                            },
                          }
                        }}
                      />
                    </LocalizationProvider>
                    {(recordSearchKeyword || recordSelectedModel !== 'all' || recordSelectedDate) && (
                      <button className="clear-filters-button" onClick={handleClearRecordsFilters}>
                        <X size={16} />
                        <span>{t('predictionTool.records.clearFilters', 'Clear Filters')}</span>
                      </button>
                    )}
                  </div>
                  <div className="records-count-text">
                    {t('predictionTool.records.showingRecords', 'Showing {{count}} of {{total}} records', {
                      count: filteredHistoryData.length,
                      total: historyData.length
                    })}
                  </div>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('predictionTool.list.columns.recordId', 'Record ID')}</th>
                          <th>{t('predictionTool.list.columns.fileName', 'File Name')}</th>
                          <th>{t('predictionTool.list.columns.batteryCount', 'Battery Count')}</th>
                          <th>{t('predictionTool.list.columns.avgCycleLife', 'Avg Cycle Life')}</th>
                          <th>{t('predictionTool.list.columns.model', 'Model')}</th>
                          <th>{t('predictionTool.list.columns.created', 'Created')}</th>
                          <th>{t('predictionTool.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistoryData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="no-data">
                              {t('predictionTool.history.noResults', 'No prediction records found.')}
                            </td>
                          </tr>
                        ) : (
                          filteredHistoryData.map((record) => (
                            <tr key={record.id}>
                              <td className="record-id">PR-{String(record.id).padStart(3, '0')}</td>
                              <td className="file-name">{record.name}</td>
                              <td>{record.batteryCount}</td>
                              <td>{record.avgCirculation} {t('predictionTool.results.cycleUnit')}</td>
                              <td>{record.model}</td>
                              <td className="created-date">{formatDate(record.date)}</td>
                              <td className="actions-cell">
                                <button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  {t('predictionTool.history.actions.viewDetails', 'View Details')}
                                </button>
                                {!record.isMock && (
                                  <button
                                    className="action-button delete-button"
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    {t('predictionTool.history.actions.delete', 'Delete')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'models' && (
            <div className="prediction-tab-panel">
              {modelsLoading ? (
                <div className="loading-state">
                  <p>{t('predictionTool.models.loadingText', 'Loading models...')}</p>
                </div>
              ) : modelsError ? (
                <div className="error-state">
                  <p>{t('predictionTool.models.error', 'Error')}: {modelsError}</p>
                </div>
              ) : (
                <>
                  <div className="models-filters">
                    <input
                      type="text"
                      className="models-search-input"
                      value={modelSearchKeyword}
                      onChange={(e) => setModelSearchKeyword(e.target.value)}
                      placeholder={t('predictionTool.models.filters.searchPlaceholder', 'Search Model ID or Name...')}
                    />
                    <select
                      className={`models-status-filter ${selectedModelStatus ? 'has-value' : ''}`}
                      value={selectedModelStatus}
                      onChange={handleModelStatusChange}
                      aria-label={t('predictionTool.models.filters.statusPlaceholder', 'Select Status')}
                    >
                      <option value="" disabled selected hidden>{t('predictionTool.models.filters.statusPlaceholder', 'Select Status')}</option>
                      <option value="online">{t('predictionTool.models.statusOnline', 'Online')}</option>
                      <option value="trained">{t('predictionTool.models.statusTrained', 'Trained')}</option>
                      <option value="training">{t('predictionTool.models.statusTraining', 'Training')}</option>
                      <option value="offline">{t('predictionTool.models.statusOffline', 'Offline')}</option>
                    </select>
                    <select
                      className={`models-base-model-filter ${selectedBaseModel ? 'has-value' : ''}`}
                      value={selectedBaseModel}
                      onChange={handleBaseModelChange}
                      aria-label={t('predictionTool.models.filters.baseModelPlaceholder', 'Select Base Model')}
                    >
                      <option value="" disabled selected hidden>{t('predictionTool.models.filters.baseModelPlaceholder', 'Select Base Model')}</option>
                      {baseModelOptions.map((option) => (
                        <option key={option.id} value={option.name}>{option.name}</option>
                      ))}
                    </select>
                    {(modelSearchKeyword || selectedModelStatus || selectedBaseModel) && (
                      <button className="clear-filters-button" onClick={handleClearModelsFilters}>
                        <X size={16} />
                        <span>{t('predictionTool.models.filters.clearFilters', 'Clear Filters')}</span>
                      </button>
                    )}
                  </div>
                  <div className="models-count-text">
                    {t('predictionTool.models.showingRecords', 'Showing {{count}} of {{total}} records', {
                      count: modelsData.length,
                      total: modelsTotal
                    })}
                  </div>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('predictionTool.models.columns.modelId', 'Model ID')}</th>
                          <th>{t('predictionTool.models.columns.modelName', 'Model Name')}</th>
                          <th>{t('predictionTool.models.columns.baseModel', 'Base Model')}</th>
                          <th>{t('predictionTool.models.columns.status', 'Status')}</th>
                          <th>{t('predictionTool.models.columns.created', 'Created')}</th>
                          <th>{t('predictionTool.models.columns.createdBy', 'Created By')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelsData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="no-data">
                              {t('predictionTool.models.noResults', 'No models found.')}
                            </td>
                          </tr>
                        ) : (
                          modelsData.map((model) => {
                            const statusInfo = getStatusLabel(model.status);
                            const isBaseModel = model.base_model_id === -1 || model.base_model_id === -2;
                            return (
                              <tr key={model.id}>
                                <td className="record-id">M-{String(model.id).padStart(6, '0')}</td>
                                <td className="file-name">
                                  {isBaseModel ? (
                                    <span>{model.model_name}</span>
                                  ) : (
                                    <a className="model-name-link" onClick={() => navigate(`/predict/model-detail?id=${model.id}`)}>{model.model_name}</a>
                                  )}
                                </td>
                                <td>{model.base_model_name}</td>
                                <td>
                                  <span
                                    style={{
                                      backgroundColor: statusInfo.color,
                                      color: statusInfo.textColor,
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '14px'
                                    }}
                                  >
                                    {statusInfo.text}
                                  </span>
                                </td>
                                <td className="created-date">{formatDate(model.created_at)}</td>
                                <td>{model.created_by_name}</td>
                              </tr>
                            );
                          })
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
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionTool;
