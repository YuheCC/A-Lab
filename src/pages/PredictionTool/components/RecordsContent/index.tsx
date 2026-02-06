import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import 'dayjs/locale/ja';
import 'dayjs/locale/ko';
import { X, RefreshCw } from 'lucide-react';
import { useDateFilter } from '@/hooks/useDateFilter';
import { getHistoryList, deleteHistory, getModelList } from '../../model';
import { formatUTCDateTime } from '@/utils/dateUtils';
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

const RecordsContent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 使用日期筛选 hook
  const {
    selectedDate: recordSelectedDate,
    datePickerValue: recordDatePickerValue,
    handleDateChange: handleRecordDateChange,
    getUTCDateRange: getRecordDateRange,
    getDayjsLocale,
    resetDate: resetRecordDate,
  } = useDateFilter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<FileRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Records filter state
  const [recordSearchKeyword, setRecordSearchKeyword] = useState<string>('');
  const [recordSelectedModel, setRecordSelectedModel] = useState<string>('all');
  const [debouncedRecordId, setDebouncedRecordId] = useState<string>('');

  // Model options for records filter (top 100 models)
  const [recordModelOptions, setRecordModelOptions] = useState<ModelListItem[]>([]);
  // 标记 model options 是否已加载完成（无论成功与否）
  const [modelOptionsLoaded, setModelOptionsLoaded] = useState(false);

  // Parse and validate record ID format (e.g., "PR-001" -> "1", "76" -> "76", "example" -> "8888")
  const parseRecordId = (input: string): string | null => {
    if (!input || input.trim() === '') {
      return '';
    }

    const trimmedInput = input.trim();

    // Check if it's "example" (case insensitive) - map to mock data ID
    if (trimmedInput.toLowerCase() === 'example') {
      return '8888';
    }

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

  // Handle search on blur or Enter key
  const handleSearchTrigger = () => {
    const parsedId = parseRecordId(recordSearchKeyword);
    setDebouncedRecordId(parsedId || '');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchTrigger();
    }
  };

  const transformApiDataToFileRecord = (apiData: any): FileRecord => {
    const avgCycleLife1 = apiData.avg_cycle_life_1 || 0;
    const avgCycleLife2 = apiData.avg_cycle_life_2 || 0;
    const avgCycleLife = avgCycleLife1 > 0 ? avgCycleLife1 : avgCycleLife2;

    let modelName = apiData.model || '-';

    if (apiData.model_id) {
      const targetModel = recordModelOptions.find((item) => item.id === apiData.model_id);
      if (targetModel) {
        modelName = targetModel.model_name;
      }
    } else {
      const defaultModel = recordModelOptions.find((item) => item.base_model_id === -2);
      if (defaultModel) {
        modelName = defaultModel.model_name;
      }
    }

    return {
      id: apiData.id.toString(),
      name: apiData.file_name,
      date: formatUTCDateTime(apiData.created_at, { showSeconds: true }),
      batteryCount: apiData.barcode_count,
      avgCirculation: avgCycleLife > 0 ? `${avgCycleLife.toFixed(0)}` : t('predictionTool.results.unknown'),
      avgCycleLife1: avgCycleLife1,
      avgCycleLife2: avgCycleLife2,
      model: modelName,
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

  // Fetch model options for records filter (top 100 models)
  useEffect(() => {
    const fetchRecordModelOptions = async () => {
      try {
        const response = await getModelList({ page: 1, page_size: 100 });
        setRecordModelOptions(response.data);
      } catch (err) {
        console.error('Failed to fetch record model options:', err);
        setRecordModelOptions([]);
      } finally {
        setModelOptionsLoaded(true);
      }
    };
    fetchRecordModelOptions();
  }, []);

  useEffect(() => {
    if (modelOptionsLoaded) {
      // Reset to page 1 when filters change
      if (currentPage === 1) {
        fetchHistoryData(1);
      } else {
        setCurrentPage(1);
      }
    }
  }, [modelOptionsLoaded, debouncedRecordId, recordSelectedModel, recordSelectedDate]);

  useEffect(() => {
    if (modelOptionsLoaded) {
      fetchHistoryData(currentPage);
    }
  }, [currentPage]);

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

  // Clear records filters
  const handleClearRecordsFilters = () => {
    setRecordSearchKeyword('');
    setDebouncedRecordId('');
    setRecordSelectedModel('all');
    resetRecordDate();
  };

  if (loading) {
    return (
      <div className="loading-state">
        <p>{t('predictionTool.history.loadingText', 'Loading...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{t('predictionTool.history.error', 'Error')}: {error}</p>
      </div>
    );
  }

  return (
    <div className="records-content">
      <div className="records-filters">
        <input
          type="text"
          className="records-search-input"
          value={recordSearchKeyword}
          onChange={(e) => setRecordSearchKeyword(e.target.value)}
          onBlur={handleSearchTrigger}
          onKeyDown={handleSearchKeyDown}
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
                  <td className="record-id">{record.isMock ? 'example' : `PR-${String(record.id).padStart(3, '0')}`}</td>
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
    </div>
  );
};

export default RecordsContent;
