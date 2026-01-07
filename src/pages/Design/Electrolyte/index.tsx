import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import { Activity, X, RefreshCw } from 'lucide-react';
import { getHistoryList, deleteHistory, getModelList as getModelListFromModel, getBaseModelList, removeModel } from './model';
import { type ModelListItem } from '@/services/model/training';
import { formatUTCDateTime } from '@/utils/dateUtils';
import DesignIntroduction from './components/DesignIntroduction';
import Pagination from '@/components/Pagination';
import CollapsibleText from '@/components/CollapsibleText';
import FeatureCard from '../components/FeatureCard';
import FeatureCardGroup from '../components/FeatureCardGroup';
import './index.less';

interface HistoryRecord {
  id: string;
  smiles: string;
  date: string;
  batterySystemId: number;
  temp25Count: number;
  temp45Count: number;
  modelId?: number;
  modelName?: string;
  baseModelType?: number;
  modelType?: number;
  rawData?: any;
}

interface DesignPageProps {}

const DesignPage: React.FC<DesignPageProps> = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

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
  const [selectedBaseModelId, setSelectedBaseModelId] = useState<number | undefined>(undefined);
  const [baseModelOptions, setBaseModelOptions] = useState<Array<{ id: number; name: string }>>([]);

  // Records filter state
  const [recordSearchKeyword, setRecordSearchKeyword] = useState<string>('');
  const [recordSelectedModel, setRecordSelectedModel] = useState<string>('all');
  const [recordSelectedDate, setRecordSelectedDate] = useState<string>('');
  const [debouncedRecordId, setDebouncedRecordId] = useState<string>('');

  // Model options for records filter (top 100 models)
  const [recordModelOptions, setRecordModelOptions] = useState<ModelListItem[]>([]);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Parse and validate record ID format (e.g., "DS-001" -> "1", "76" -> "76")
  const parseRecordId = (input: string): string | null => {
    if (!input || input.trim() === '') {
      return '';
    }

    const trimmedInput = input.trim();

    // Check if it matches DS-XXX format
    const dsMatch = trimmedInput.match(/^DS-(\d+)$/i);
    if (dsMatch) {
      return dsMatch[1];
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

  // Calculate total positive count based on base_model_type
  const getTotalPositiveCount = (modelType?: number): number => {
    if (modelType === undefined || modelType === null) return 0;
    switch (modelType) {
      case 100:
        return 5;
      case 1:
        return 1;
      case 2:
        return 2;
      case 3:
        return 2;
      default:
        return 0;
    }
  };

  const getInitialTab = (): 'introduction' | 'records' | 'models' => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models') ? tabParam as 'introduction' | 'records' | 'models' : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<'introduction' | 'records' | 'models'>(getInitialTab());

  // 初始化时,如果URL没有tab参数,则设置默认值
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (!tabParam) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', activeTab);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, []);

  const transformApiDataToRecord = (apiData: any, modelOptions: ModelListItem[]): HistoryRecord => {
    // Find model info by model_id
    const modelInfo = apiData.model_id
      ? modelOptions.find(m => m.id === apiData.model_id)
      : undefined;

    return {
      id: apiData.id.toString(),
      smiles: apiData.smiles || '',
      date: formatUTCDateTime(apiData.created_at, { showSeconds: true }),
      batterySystemId: apiData.battery_system_id,
      temp25Count: apiData.temperature_25_label_0_count || 0,
      temp45Count: apiData.temperature_45_label_0_count || 0,
      modelId: apiData.model_id,
      modelName: modelInfo?.model_name || '-',
      modelType: modelInfo?.model_type || 0,
      baseModelType: modelInfo?.base_model_id,
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

      // Add date filter (split to 0:00:00 - 23:59:59 of selected day)
      if (recordSelectedDate) {
        const selectedDay = dayjs(recordSelectedDate);
        params.created_at = `${selectedDay.format('YYYY-MM-DD')}T00:00:00,${selectedDay.format('YYYY-MM-DD')}T23:59:59`;
      }

      const response = await getHistoryList(params);
      const transformedData = response.data.data.map((item: any) =>
        transformApiDataToRecord(item, recordModelOptions)
      );
      setHistoryData(transformedData);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch design history:', err);
      setError(err instanceof Error ? err.message : t('design.history.loading.error', 'Failed to load history'));
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

  // Fetch model options for records filter (top 100 models)
  useEffect(() => {
    const fetchRecordModelOptions = async () => {
      try {
        const response = await getModelListFromModel({ page: 1, page_size: 100 });
        setRecordModelOptions(response.data);
      } catch (err) {
        console.error('Failed to fetch record model options:', err);
        setRecordModelOptions([]);
      }
    };
    fetchRecordModelOptions();
  }, []);

  const handleNewDesign = () => {
    window.open('/design/electrolyte/create', '_blank');
  };

  const handleTrain = () => {
    navigate('/design/electrolyte/train');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/design/electrolyte/record?id=${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm(t('design.history.deleteConfirm', 'Are you sure you want to delete this record?'))) {
      return;
    }

    try {
      await deleteHistory(parseInt(id));
      await fetchHistoryData(currentPage);
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError(err instanceof Error ? err.message : t('design.history.deleteFailed', 'Failed to delete record'));
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm(t('design.models.deleteConfirm', 'Are you sure you want to delete this model?'))) {
      return;
    }

    try {
      await removeModel(id);
      await fetchModelsData(modelsCurrentPage);
    } catch (err) {
      console.error('Failed to delete model:', err);
      setModelsError(err instanceof Error ? err.message : t('design.models.deleteFailed', 'Failed to delete model'));
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


  const handleClearRecordsFilters = () => {
    setRecordSearchKeyword('');
    setDebouncedRecordId('');
    setRecordSelectedModel('all');
    setRecordSelectedDate('');
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


  return (
    <div className="design-tool-container">
      <div className="design-header">
        <h1 className="design-title">{t('performance.title')}</h1>
        <CollapsibleText className="design-subtitle-wrapper">
          {t('performance.subtitle')}
        </CollapsibleText>
      </div>

      <FeatureCardGroup 
        columns={{
          default: 1,
          sm: 2,
          md: 2,
          lg: 4
        }}
        gap={16}
      >
        <FeatureCard
          icon={<img src="/design/electrolyte/icon-new-design.svg" alt="New Design" style={{ width: 24, height: 24 }} />}
          title={t('design.history.newDesign', 'New Design')}
          description={t('design.electrolyte.features.newDesign.description', 'Create a new electrolyte design')}
          iconBgColor="#dbeafe"
          onClick={handleNewDesign}
        />
        <FeatureCard
          icon={<Activity size={20} />}
          title={t('design.history.train', 'Train')}
          description={t('design.electrolyte.features.train.description', 'Train a new model')}
          iconBgColor="#dcfce7"
          onClick={handleTrain}
        />
      </FeatureCardGroup>

      <div className="design-tool-table-container">
        <div className="design-tabs-header">
          <div className="design-tabs">
            <button
              className={`design-tab ${activeTab === 'introduction' ? 'active' : ''}`}
              onClick={() => handleTabChange('introduction')}
            >
              {t('design.tabs.introduction', 'Introduction')}
            </button>
            <button
              className={`design-tab ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => handleTabChange('records')}
            >
              {t('design.tabs.records', 'Records')}
            </button>
            <button
              className={`design-tab ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => handleTabChange('models')}
            >
              {t('design.tabs.models', 'Models')}
            </button>
          </div>
        </div>

        <div className="design-tab-content">
          {activeTab === 'introduction' && (
            <div className="design-tab-panel">
              <DesignIntroduction />
            </div>
          )}

          {activeTab === 'records' && (
            <div className="design-tab-panel">
              {loading ? (
                <div className="loading-state">
                  <p>{t('design.history.loadingText', 'Loading...')}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t('design.history.error', 'Error')}: {error}</p>
                </div>
              ) : (
                <>
                  <div className="records-filters">
                    <input
                      type="text"
                      className="records-search-input"
                      value={recordSearchKeyword}
                      onChange={(e) => setRecordSearchKeyword(e.target.value)}
                      placeholder={t('performance.records.searchPlaceholder', 'Search record ID')}
                    />
                    <select
                      className="records-model-filter"
                      value={recordSelectedModel}
                      onChange={(e) => setRecordSelectedModel(e.target.value)}
                    >
                      <option value="all">{t('performance.records.allModels', '所有模型')}</option>
                      {recordModelOptions.map((model) => (
                        <option key={model.id} value={model.id.toString()}>
                          {model.model_name}
                        </option>
                      ))}
                    </select>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={getDayjsLocale()}>
                      <DatePicker
                        className="records-date-filter"
                        value={recordSelectedDate ? dayjs(recordSelectedDate) : null}
                        onChange={(date: Dayjs | null) => {
                          setRecordSelectedDate(date ? date.format('YYYY-MM-DD') : '');
                        }}
                        enableAccessibleFieldDOMStructure={false}
                        slotProps={{
                          textField: {
                            placeholder: t('performance.models.filters.selectDate', '选择日期'),
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
                        <span>{t('performance.records.clearFilters', 'Clear Filters')}</span>
                      </button>
                    )}
                    <button
                      className="design-refresh-button"
                      onClick={() => fetchHistoryData(currentPage)}
                      aria-label={t('performance.models.filters.refresh', 'Refresh')}
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>
                  <div className="records-count-text">
                    {t('performance.records.showingRecords', '显示 {{count}} / {{total}} 条记录', {
                      count: historyData.length,
                      total: total
                    })}
                  </div>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('design.list.columns.recordId', 'Record ID')}</th>
                          <th>{t('design.list.columns.smiles', 'SMILES')}</th>
                          <th>{t('design.list.columns.modelName', 'Model Name')}</th>
                          <th>{t('design.list.columns.totalPositive', 'Total Positive')}</th>
                          <th>{t('design.list.columns.created', 'Created')}</th>
                          <th>{t('design.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="no-data">
                              {t('design.history.noResults', 'No design records found.')}
                            </td>
                          </tr>
                        ) : (
                          historyData.map((record) => {
                            const totalPositive = getTotalPositiveCount(record.modelType);
                            const actualPositive = record.temp25Count + record.temp45Count;
                            return (
                            <tr key={record.id}>
                              <td className="record-id">DS-{String(record.id).padStart(3, '0')}</td>
                              <td className="smiles-cell">{record.smiles}</td>
                              <td>{record.modelName || '-'}</td>
                              <td>{totalPositive > 0 ? `${actualPositive}/${totalPositive}` : '-'}</td>
                              <td className="created-date">{record.date || '-'}</td>
                              <td className="actions-cell">
                                <button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  {t('design.history.actions.viewResults', 'View Results')}
                                </button>
                                <button
                                  className="action-button delete-button"
                                  onClick={() => handleDeleteRecord(record.id)}
                                >
                                  {t('design.history.actions.delete', 'Delete')}
                                </button>
                              </td>
                            </tr>
                            );
                          })
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
            <div className="design-tab-panel">
              <div className="models-filters">
                <input
                  type="text"
                  className="models-search-input"
                  value={modelSearchKeyword}
                  onChange={(e) => setModelSearchKeyword(e.target.value)}
                  placeholder={t('performance.models.filters.searchPlaceholder', '搜索模型ID或名称...')}
                />
                <select
                  className={`models-status-filter ${selectedModelStatus ? 'has-value' : ''}`}
                  value={selectedModelStatus}
                  onChange={(e) => setSelectedModelStatus(e.target.value)}
                >
                  <option value="" disabled selected hidden>{t('performance.models.filters.selectStatus', 'Select Status')}</option>
                  <option value="online">{t('performance.models.statusOnline', 'Online')}</option>
                  <option value="trained">{t('performance.models.statusTrained', 'Trained')}</option>
                  <option value="offline">{t('performance.models.statusOffline', 'Offline')}</option>
                  <option value="training">{t('performance.models.statusTraining', 'Training')}</option>
                  <option value="fail">{t('performance.models.statusFail', 'Failed')}</option>
                </select>
                <select
                  className={`models-base-model-filter ${selectedBaseModel ? 'has-value' : ''}`}
                  value={selectedBaseModel}
                  onChange={handleBaseModelChange}
                >
                  <option value="" disabled selected hidden>{t('performance.models.filters.selectBaseModel', 'Select Base Model')}</option>
                  {baseModelOptions.map((option) => (
                    <option key={option.id} value={option.name}>{option.name}</option>
                  ))}
                </select>
                {(modelSearchKeyword || selectedModelStatus || selectedBaseModel) && (
                  <button className="clear-filters-button" onClick={handleClearModelsFilters}>
                    <X size={16} />
                    <span>{t('performance.models.filters.clearFilters', 'Clear Filters')}</span>
                  </button>
                )}
                <button 
                  className="design-refresh-button" 
                  onClick={() => fetchModelsData(modelsCurrentPage)}
                  aria-label={t('performance.models.filters.refresh', 'Refresh')}
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              <div className="models-count-text">
                {t('performance.models.showingRecords', '显示 {{count}} / {{total}} 条记录', {
                  count: modelsData.length,
                  total: modelsTotal
                })}
              </div>
              {modelsLoading ? (
                <div className="loading-state">
                  <p>{t('design.models.loadingText', 'Loading...')}</p>
                </div>
              ) : modelsError ? (
                <div className="error-state">
                  <p>{t('design.models.error', 'Error')}: {modelsError}</p>
                </div>
              ) : (
                <>
              <div className="records-table-wrapper">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>{t('performance.models.columns.modelId', 'Model ID')}</th>
                      <th>{t('performance.models.columns.modelName', 'Model Name')}</th>
                      <th>{t('performance.models.columns.baseModel', 'Base Model')}</th>
                      <th>{t('performance.models.columns.status', 'Status')}</th>
                      <th>{t('performance.models.columns.created', 'Created Time')}</th>
                      <th>{t('performance.models.columns.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelsData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="no-data">
                          {t('performance.models.noResults', 'No models found.')}
                        </td>
                      </tr>
                    ) : (
                      modelsData.map((model) => (
                        <tr key={model.id}>
                          <td className="record-id">DM-{String(model.id).padStart(6, '0')}</td>
                          <td className="file-name">
                            {model.base_model_id === -1 || model.base_model_id === -2 ? (
                              <span className="model-name-text">{model.model_name}</span>
                            ) : (
                              <a
                                className="model-name-link"
                                onClick={() => navigate(`/design/electrolyte/model-detail?id=${model.id}`)}
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
                                             model.status === 'offline' ? '#e0e7ff' :
                                             model.status === 'fail' ? '#fee2e2' : '#fef3c7',
                              color: model.status === 'online' ? '#008236' :
                                     model.status === 'trained' ? '#4338ca' :
                                     model.status === 'offline' ? '#4338ca' :
                                     model.status === 'fail' ? '#991b1b' : '#92400e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}>
                              {model.status === 'online' ? t('performance.models.statusOnline', 'Online') :
                               model.status === 'trained' ? t('performance.models.statusTrained', 'Trained') :
                               model.status === 'offline' ? t('performance.models.statusOffline', 'Offline') :
                               model.status === 'fail' ? t('performance.models.statusFail', 'Failed') :
                               t('performance.models.statusTraining', 'Training')}
                            </span>
                          </td>
                          <td className="created-date">
                            {formatUTCDateTime(model.created_at) || '-'}
                          </td>
                          <td className="actions-cell">
                          {
                            model.base_model_id !== -1 && model.base_model_id !== -2 && (
                              <button
                                className="action-button delete-button"
                                onClick={() => handleDeleteModel(model.id.toString())}
                              >
                                {t('design.models.actions.delete', 'Delete')}
                              </button>
                            )
                          }
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
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
