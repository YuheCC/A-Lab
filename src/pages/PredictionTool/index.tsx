import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import { Activity, X, RefreshCw } from 'lucide-react';
import { useDateFilter } from '@/hooks/useDateFilter';
import Button from '@/components/Button';
import { getHistoryList, deleteHistory, getModelList, getBaseModelList, isMockModel, removeModel } from './model';
import { formatUTCDateTime } from '@/utils/dateUtils';
import Introduction from './components/Introduction';
import Pagination from '@/components/Pagination';
import CollapsibleText from '@/components/CollapsibleText';
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
  const { t } = useTranslation();

  // 使用日期筛选 hook（PredictionTool 使用本地时间格式）
  const {
    selectedDate: recordSelectedDate,
    datePickerValue: recordDatePickerValue,
    handleDateChange: handleRecordDateChange,
    getUTCDateRange: getRecordDateRange,
    getDayjsLocale,
    resetDate: resetRecordDate,
  } = useDateFilter();

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
  const [debouncedRecordId, setDebouncedRecordId] = useState<string>('');

  // Model options for records filter (top 100 models)
  const [recordModelOptions, setRecordModelOptions] = useState<ModelListItem[]>([]);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse and validate record ID format (e.g., "PR-001" -> "1", "76" -> "76")
  const parseRecordId = (input: string): string | null => {
    if (!input || input.trim() === '') {
      return '';
    }

    const trimmedInput = input.trim();

    // Check if it matches PR-XXX format
    const prMatch = trimmedInput.match(/^PR-(\d+)$/i);
    if (prMatch) {
      return prMatch[1];
    }

    // Check if it's a pure number
    const numberMatch = trimmedInput.match(/^\d+$/);
    if (numberMatch) {
      return trimmedInput;
    }

    // Invalid format
    return null;
  };

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const parsedId = parseRecordId(recordSearchKeyword);
      setDebouncedRecordId(parsedId || '');
    }, 500); // 500ms delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [recordSearchKeyword]);

  const getInitialTab = (): 'introduction' | 'records' | 'models' => {
    // Check if navigation state has activeTab (from train page)
    const stateTab = (location.state as any)?.activeTab;
    if (stateTab === 'models') return 'models';

    const tabParam = searchParams.get('tab');
    return (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models') ? tabParam as 'introduction' | 'records' | 'models' : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<'introduction' | 'records' | 'models'>(getInitialTab());

  // 初始化时,如果URL没有tab参数且没有从state传递,则设置默认值
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const stateTab = (location.state as any)?.activeTab;
    if (!tabParam && !stateTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', activeTab);
      setSearchParams(newSearchParams, { replace: true });
    } else if (stateTab && !tabParam) {
      // 如果是从state传递的tab,同步到URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', activeTab);
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
      date: formatUTCDateTime(apiData.created_at, { showSeconds: true }),
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
      const params: any = {
        page,
        page_size: pageSize,
      };

      // Add search keyword filter (by record ID) - use debounced and validated ID
      if (debouncedRecordId) {
        params.id = debouncedRecordId;
      }

      // Add model filter
      if (recordSelectedModel && recordSelectedModel !== 'all') {
        params.model_id = parseInt(recordSelectedModel);
      }

      // Add date filter using hook
      if (recordSelectedDate) {
        params.created_at = getRecordDateRange();
      }

      const response = await getHistoryList(params);
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

  // Fetch model options for records filter (top 100 models)
  useEffect(() => {
    const fetchRecordModelOptions = async () => {
      try {
        const response = await getModelList({ page: 1, page_size: 100 });
        setRecordModelOptions(response.data);
      } catch (err) {
        console.error('Failed to fetch record model options:', err);
        setRecordModelOptions([]);
      }
    };
    fetchRecordModelOptions();
  }, []);

  useEffect(() => {
    if (activeTab === 'records' && recordModelOptions.length > 0) {
      // Reset to page 1 when filters change
      if (currentPage === 1) {
        fetchHistoryData(1);
      } else {
        setCurrentPage(1);
      }
    }
  }, [activeTab, recordModelOptions, debouncedRecordId, recordSelectedModel, recordSelectedDate]);

  useEffect(() => {
    if (activeTab === 'records' && recordModelOptions.length > 0) {
      fetchHistoryData(currentPage);
    }
  }, [currentPage]);

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

  const handleDeleteModel = async (id: string) => {
    const model = modelsData.find(m => m.id.toString() === id);
    if (model && isMockModel(model)) {
      alert(t('predictionTool.models.cannotDeleteDemo', 'Cannot delete demo models'));
      return;
    }

    if (!confirm(t('predictionTool.models.deleteConfirm', 'Are you sure you want to delete this model?'))) {
      return;
    }

    try {
      await removeModel(id);
      await fetchModelsData(modelsCurrentPage);
    } catch (err) {
      console.error('Failed to delete model:', err);
      setModelsError(err instanceof Error ? err.message : t('predictionTool.models.deleteFailed', 'Failed to delete model'));
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
    // 更新URL参数
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleModelStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModelStatus(e.target.value);
  };

  const handleClearModelsFilters = () => {
    setModelSearchKeyword('');
    setSelectedModelStatus('');
    setSelectedBaseModel('');
    setSelectedBaseModelId(undefined);
  };

  // Clear records filters
  const handleClearRecordsFilters = () => {
    setRecordSearchKeyword('');
    setDebouncedRecordId('');
    setRecordSelectedModel('all');
    resetRecordDate();
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
      case 'fail':
        return { text: t('predictionTool.models.statusFail', 'Failed'), color: '#fee2e2', textColor: '#991b1b' };
      default:
        return { text: status, color: '#f3f4f6', textColor: '#374151' };
    }
  };

  return (
    <div className="prediction-tool-container">
      <div className="prediction-header">
        <h1 className="prediction-title">{t('predictionTool.title')}</h1>
        <CollapsibleText className="prediction-subtitle-wrapper">
          {t('predictionTool.subtitle')}
        </CollapsibleText>
      </div>

      <div className="prediction-action-section">
        <Button variant="primary" onClick={handleNewPrediction}>
          + {t('predictionTool.history.newPrediction', 'New Prediction')}
        </Button>
        <Button variant="secondary" leftIcon={<Activity size={16} />} onClick={handleTrain}>
          {t('predictionTool.history.train', 'Train')}
        </Button>
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
                      placeholder={t('predictionTool.records.searchPlaceholder', 'Search record ID')}
                    />
                    <select
                      className="records-model-filter"
                      value={recordSelectedModel}
                      onChange={(e) => setRecordSelectedModel(e.target.value)}
                      aria-label={t('predictionTool.records.modelFilter', 'Model filter')}
                    >
                      <option value="all">{t('predictionTool.records.allModels', 'All Models')}</option>
                      {recordModelOptions.map((model) => (
                        <option key={model.id} value={model.id.toString()}>
                          {model.model_name}
                        </option>
                      ))}
                    </select>
                    <LocalizationProvider
                      dateAdapter={AdapterDayjs}
                      adapterLocale={getDayjsLocale()}
                    >
                      <DatePicker
                        className="records-date-filter"
                        value={recordDatePickerValue}
                        onChange={handleRecordDateChange}
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
                    <button
                      className="predictiontool-refresh-button"
                      onClick={() => fetchHistoryData(currentPage)}
                      aria-label={t('predictionTool.models.filters.refresh', 'Refresh')}
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <div className="records-count-text">
                    {t('predictionTool.records.showingRecords', 'Showing {{count}} of {{total}} records', {
                      count: historyData.length,
                      total: total
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
                          <th>{t('predictionTool.list.columns.created', 'Created Time')}</th>
                          <th>{t('predictionTool.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="no-data">
                              {t('predictionTool.history.noResults', 'No prediction records found.')}
                            </td>
                          </tr>
                        ) : (
                          historyData.map((record) => (
                            <tr key={record.id}>
                              <td className="record-id">PR-{String(record.id).padStart(3, '0')}</td>
                              <td className="file-name">{record.name}</td>
                              <td>{record.batteryCount}</td>
                              <td>{record.avgCirculation} {t('predictionTool.results.cycleUnit')}</td>
                              <td>{record.model}</td>
                              <td className="created-date">{record.date || '-'}</td>
                              <td className="actions-cell">
                                <button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  {t('predictionTool.history.actions.viewResults', 'View Results')}
                                </button>
                                <button
                                  className="action-button delete-button"
                                  onClick={() => handleDeleteRecord(record.id)}
                                >
                                  {t('predictionTool.history.actions.delete', 'Delete')}
                                </button>
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
                      <option value="fail">{t('predictionTool.models.statusFail', 'Failed')}</option>
                    </select>
                    
                    {(modelSearchKeyword || selectedModelStatus || selectedBaseModel) && (
                      <button className="clear-filters-button" onClick={handleClearModelsFilters}>
                        <X size={16} />
                        <span>{t('predictionTool.models.filters.clearFilters', 'Clear Filters')}</span>
                      </button>
                    )}
                    <button 
                      className="predictiontool-refresh-button" 
                      onClick={() => fetchModelsData(modelsCurrentPage)}
                      aria-label={t('predictionTool.models.filters.refresh', 'Refresh')}
                    >
                      <RefreshCw size={16} />
                    </button>
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
                          <th>{t('predictionTool.models.columns.status', 'Status')}</th>
                          <th>{t('predictionTool.models.columns.created', 'Created Time')}</th>
                          <th>{t('predictionTool.models.columns.createdBy', 'Created By')}</th>
                          <th>{t('predictionTool.models.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelsData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="no-data">
                              {t('predictionTool.models.noResults', 'No models found.')}
                            </td>
                          </tr>
                        ) : (
                          modelsData.map((model) => {
                            const statusInfo = getStatusLabel(model.status);
                            const isBaseModel = model.base_model_id === -1 || model.base_model_id === -2;
                            return (
                              <tr key={model.id}>
                                <td className="record-id">PM-{String(model.id).padStart(6, '0')}</td>
                                <td className="file-name">
                                  {isBaseModel ? (
                                    <span>{model.model_name}</span>
                                  ) : (
                                    <a className="model-name-link" onClick={() => navigate(`/predict/model-detail?id=${model.id}`)}>{model.model_name}</a>
                                  )}
                                </td>
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
                                <td className="created-date">{formatUTCDateTime(model.created_at)}</td>
                                <td>{model.created_by_name}</td>
                                <td className="actions-cell">
                                  {
                                    model.base_model_id !== -1 && model.base_model_id !== -2 && (
                                      <button
                                        className="action-button delete-button"
                                        onClick={() => handleDeleteModel(model.id.toString())}
                                      >
                                        {t('predictionTool.models.actions.delete', 'Delete')}
                                      </button>
                                    )
                                  }
                                </td>
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
