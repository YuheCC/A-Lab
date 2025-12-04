import React, { useState, useEffect } from 'react';
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
import { Activity, X } from 'lucide-react';
import { getHistoryList, deleteHistory, getModelList as getModelListFromModel, isMockModel } from './model';
import { type ModelListItem } from '@/services/model/training';
import { normalizeServerDate } from '@/utils/messageUtils';
import DesignIntroduction from './components/DesignIntroduction';
import Pagination from '@/components/Pagination';
import './index.less';

interface HistoryRecord {
  id: string;
  smiles: string;
  date: string;
  batterySystemId: number;
  temp25Count: number;
  temp45Count: number;
  isMock?: boolean;
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
  const [selectedModelStatus, setSelectedModelStatus] = useState<string>('all');
  const [selectedBaseModel, setSelectedBaseModel] = useState<string>('all');

  // Records filter state
  const [recordSearchKeyword, setRecordSearchKeyword] = useState<string>('');
  const [recordSelectedModel, setRecordSelectedModel] = useState<string>('all');
  const [recordSelectedDate, setRecordSelectedDate] = useState<string>('');

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

  const getInitialTab = (): 'introduction' | 'records' | 'models' => {
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

  const transformApiDataToRecord = (apiData: any): HistoryRecord => {
    return {
      id: apiData.id.toString(),
      smiles: apiData.smiles || '',
      date: new Date(normalizeServerDate(apiData.created_at)).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      batterySystemId: apiData.battery_system_id,
      temp25Count: apiData.temperature_25_label_0_count || 0,
      temp45Count: apiData.temperature_45_label_0_count || 0,
      isMock: apiData.isMock || false,
      rawData: apiData
    };
  };

  const fetchHistoryData = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryList({ page, page_size: pageSize });
      const transformedData = response.data.data.map(transformApiDataToRecord);
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

      // Add status filter if not 'all'
      if (selectedModelStatus !== 'all') {
        params.status = selectedModelStatus;
      }

      // Add base model filter if not 'all'
      if (selectedBaseModel !== 'all') {
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
    if (activeTab === 'records') {
      fetchHistoryData(currentPage);
    }
  }, [activeTab, currentPage]);

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
    if (activeTab === 'models' && modelsCurrentPage > 1) {
      fetchModelsData(modelsCurrentPage);
    }
  }, [modelsCurrentPage]);

  const handleNewDesign = () => {
    window.open('/design/create', '_blank');
  };

  const handleTrain = () => {
    navigate('/design/train');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/design/record?id=${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    const record = historyData.find(h => h.id === id);
    if (record && record.isMock) {
      alert(t('design.history.cannotDeleteDemo', 'Cannot delete demo records'));
      return;
    }

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleModelsPageChange = (page: number) => {
    setModelsCurrentPage(page);
  };

  const handleTabChange = (tab: 'introduction' | 'records' | 'models') => {
    setActiveTab(tab);
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

  const handleClearRecordsFilters = () => {
    setRecordSearchKeyword('');
    setRecordSelectedModel('all');
    setRecordSelectedDate('');
  };

  const handleClearModelsFilters = () => {
    setModelSearchKeyword('');
    setSelectedModelStatus('all');
    setSelectedBaseModel('all');
  };

  // Filter records data (currently no model field, so we'll just filter by keyword and date)
  const filteredHistoryData = historyData.filter((record) => {
    const keywordMatch = !recordSearchKeyword ||
      record.smiles.toLowerCase().includes(recordSearchKeyword.toLowerCase()) ||
      String(record.id).includes(recordSearchKeyword);
    const dateMatch = !recordSelectedDate || record.date.startsWith(recordSelectedDate);
    // Since records don't have a model field yet, we'll ignore model filter for now
    return keywordMatch && dateMatch;
  });

  // Get unique base models for filter options (from current page data)
  const uniqueBaseModels = Array.from(new Set(modelsData.map(model => model.base_model_name).filter(Boolean)));

  return (
    <div className="design-tool-container">
      <div className="design-header">
        <h1 className="design-title">{t('performance.title')}</h1>
        <p className="design-subtitle">
          {t('performance.subtitle')}
        </p>
      </div>

      <div className="design-action-section">
        <button className="new-design-button" onClick={handleNewDesign}>
          + {t('design.history.newDesign', 'New Design')}
        </button>
        <button className="train-button" onClick={handleTrain}>
          <Activity size={16} />
          {t('design.history.train', 'Train')}
        </button>
      </div>

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
                      placeholder={t('performance.records.searchPlaceholder', '搜索record名称或ID')}
                    />
                    <select
                      className="records-model-filter"
                      value={recordSelectedModel}
                      onChange={(e) => setRecordSelectedModel(e.target.value)}
                    >
                      <option value="all">{t('performance.records.allModels', '所有模型')}</option>
                    </select>
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={getDayjsLocale()}>
                      <DatePicker
                        className="records-date-filter"
                        value={recordSelectedDate ? dayjs(recordSelectedDate) : null}
                        onChange={(date: Dayjs | null) => {
                          setRecordSelectedDate(date ? date.format('YYYY-MM-DD') : '');
                        }}
                        slotProps={{
                          textField: {
                            placeholder: t('performance.models.filters.selectDate', '选择日期'),
                            size: 'small',
                            fullWidth: true,
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
                  </div>
                  <div className="records-count-text">
                    {t('performance.records.showingRecords', '显示 {{count}} / {{total}} 条记录', {
                      count: filteredHistoryData.length,
                      total: historyData.length
                    })}
                  </div>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('design.list.columns.recordId', 'Record ID')}</th>
                          <th>{t('design.list.columns.smiles', 'SMILES')}</th>
                          <th>{t('design.list.columns.temp25', '25°C Positive')}</th>
                          <th>{t('design.list.columns.temp45', '45°C Positive')}</th>
                          <th>{t('design.list.columns.created', 'Created')}</th>
                          <th>{t('design.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistoryData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="no-data">
                              {t('design.history.noResults', 'No design records found.')}
                            </td>
                          </tr>
                        ) : (
                          filteredHistoryData.map((record) => (
                            <tr key={record.id}>
                              <td className="record-id">DS-{String(record.id).padStart(3, '0')}</td>
                              <td className="smiles-cell">{record.smiles}</td>
                              <td>{record.temp25Count}</td>
                              <td>{record.temp45Count}</td>
                              <td className="created-date">{formatDate(record.date)}</td>
                              <td className="actions-cell">
                                <button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  {t('design.history.actions.viewDetails', 'View Details')}
                                </button>
                                {!record.isMock && (
                                  <button
                                    className="action-button delete-button"
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    {t('design.history.actions.delete', 'Delete')}
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
                  className="models-status-filter"
                  value={selectedModelStatus}
                  onChange={(e) => setSelectedModelStatus(e.target.value)}
                >
                  <option value="all">{t('performance.models.filters.allStatus', '所有状态')}</option>
                  <option value="online">{t('performance.models.statusOnline', 'Online')}</option>
                  <option value="trained">{t('performance.models.statusTrained', 'Trained')}</option>
                  <option value="training">{t('performance.models.statusTraining', 'Training')}</option>
                </select>
                <select
                  className="models-base-model-filter"
                  value={selectedBaseModel}
                  onChange={(e) => setSelectedBaseModel(e.target.value)}
                >
                  <option value="all">{t('performance.models.filters.allBaseModels', '所有基础模型')}</option>
                  {uniqueBaseModels.map((baseModel) => (
                    <option key={baseModel} value={baseModel}>{baseModel}</option>
                  ))}
                </select>
                {(modelSearchKeyword || selectedModelStatus !== 'all' || selectedBaseModel !== 'all') && (
                  <button className="clear-filters-button" onClick={handleClearModelsFilters}>
                    <X size={16} />
                    <span>{t('performance.models.filters.clearFilters', 'Clear Filters')}</span>
                  </button>
                )}
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
                      <th>{t('performance.models.columns.created', 'Created')}</th>
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
                            <a
                              className="model-name-link"
                              onClick={() => navigate(`/design/model-detail?id=${model.id}`)}
                              style={{ cursor: 'pointer', color: '#00a63e', textDecoration: 'underline' }}
                            >
                              {model.model_name}
                            </a>
                          </td>
                          <td>{model.base_model_name}</td>
                          <td>
                            <span style={{
                              backgroundColor: model.status === 'online' ? '#dcfce7' : model.status === 'trained' ? '#e0e7ff' : '#fef3c7',
                              color: model.status === 'online' ? '#008236' : model.status === 'trained' ? '#4338ca' : '#92400e',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}>
                              {model.status === 'online' ? t('performance.models.statusOnline', 'Online') :
                               model.status === 'trained' ? t('performance.models.statusTrained', 'Trained') :
                               t('performance.models.statusTraining', 'Training')}
                            </span>
                          </td>
                          <td className="created-date">
                            {new Date(model.created_at).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
