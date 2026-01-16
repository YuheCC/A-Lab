import React, { useState, useRef, useEffect } from 'react';
import { Radio, message, Spin } from 'antd';
import { RefreshCw } from 'lucide-react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import { Dayjs } from 'dayjs';
import { formatUTCDateTime } from '@/utils/dateUtils';
import { useDateFilter } from '@/hooks/useDateFilter';
import * as electrodeModel from '../../model';
import type { ElectrodeHistoryItem } from '../../model';
import './index.less';

const RecordsContent: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 二级 Tab 状态
  const [activeSubTab, setActiveSubTab] = useState('result-prediction');

  // 搜索和过滤状态
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState<string>('');

  // 使用日期筛选 hook
  const {
    selectedDate,
    datePickerValue,
    handleDateChange,
    getUTCDateRange,
    getDayjsLocale,
    resetDate,
  } = useDateFilter();

  // 数据状态
  const [records, setRecords] = useState<ElectrodeHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // 防抖 timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 将 activeSubTab 映射到 type 参数
  const getTypeFromSubTab = (subTab: string): electrodeModel.PageType => {
    switch (subTab) {
      case 'result-prediction':
        return electrodeModel.PageType.RESULT_PREDICTION;
      case 'inverse-design':
        return electrodeModel.PageType.INVERSE_DESIGN;
      case 'trend-analysis':
        return electrodeModel.PageType.RESULT_PREDICTION; // 假设使用正向预测
      default:
        return electrodeModel.PageType.RESULT_PREDICTION;
    }
  };

  // 格式化 Record ID（将数字 id 格式化为 RP-XXX）
  const formatRecordId = (id: number): string => {
    return `RP-${String(id).padStart(3, '0')}`;
  };

  // 加载记录列表
  const loadRecords = async () => {
    setLoading(true);
    try {
      // 使用 hook 获取 UTC 时间范围
      const createdAtParam = getUTCDateRange();

      const response = await electrodeModel.getElectrodeHistoryList({
        type: getTypeFromSubTab(activeSubTab),
        page: 1,
        page_size: 100,
        // 可选过滤参数
        ...(createdAtParam && { created_at: createdAtParam }),
        ...(debouncedSearchKeyword && { id: debouncedSearchKeyword.replace(/\D/g, '') }),
      });
      setRecords(response.data);
      setTotal(response.total);
    } catch (error) {
      message.error(t('design.electrode.records.loadError', 'Failed to load records'));
      console.error('[RecordsContent] Load records error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除记录
  const handleDelete = async (id: number) => {
    if (!confirm(t('design.electrode.records.deleteConfirm', 'Are you sure you want to delete this record?'))) {
      return;
    }

    try {
      await electrodeModel.deleteElectrodeHistory({ id });
      message.success(t('design.electrode.records.deleteSuccess', 'Record deleted successfully'));
      loadRecords(); // 重新加载列表
    } catch (error) {
      message.error(t('design.electrode.records.deleteError', 'Failed to delete record'));
      console.error('[RecordsContent] Delete record error:', error);
    }
  };

  // 防抖搜索
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  // 监听 Tab、搜索关键词、日期变化，自动加载数据
  useEffect(() => {
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubTab, debouncedSearchKeyword, selectedDate]);

  // 刷新数据
  const handleRefresh = () => {
    loadRecords();
  };

  // 重置所有过滤条件
  const handleReset = () => {
    setSearchKeyword('');
    resetDate();
  };

  return (
    <Spin spinning={loading}>
      <div className="records-content">
      <div className="records-toolbar">
        <div className="records-toolbar-left">
          <div className="records-tabs">
            <Radio.Group
              value={activeSubTab}
              onChange={(e) => {
                setActiveSubTab(e.target.value);
                // Tab 切换时清空搜索条件
                setSearchKeyword('');
                resetDate();
              }}
              buttonStyle="solid"
              className="records-radio-group"
            >
              <Radio.Button value="result-prediction">
                {t('design.electrode.records.resultPrediction', 'Result Prediction')}
              </Radio.Button>
              {/* <Radio.Button value="trend-analysis">
                {t('design.electrode.records.trendAnalysis', 'Trend Analysis')}
              </Radio.Button> */}
              <Radio.Button value="inverse-design">
                {t('design.electrode.records.inverseDesign', 'Inverse Design')}
              </Radio.Button>
            </Radio.Group>
          </div>

          <div className="records-filters-inline">
            {/* ID 搜索框 */}
            <input
              type="text"
              className="records-search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('design.electrode.records.searchPlaceholder', 'Search record ID')}
            />

            {/* 日期选择器 */}
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={getDayjsLocale()}>
              <DatePicker
                className="records-date-filter"
                value={datePickerValue}
                onChange={handleDateChange}
                enableAccessibleFieldDOMStructure={false}
                slotProps={{
                  textField: {
                    placeholder: t('design.electrode.records.selectDate', '年/月/日'),
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
                  },
                }}
              />
            </LocalizationProvider>

            {/* 重置按钮 */}
            <button
              className="records-reset-button"
              onClick={handleReset}
            >
              {t('design.electrode.records.reset', 'Reset')}
            </button>
          </div>
        </div>

        {/* 刷新按钮 */}
        <button
          className="design-refresh-button"
          onClick={handleRefresh}
          aria-label={t('design.electrode.records.refresh', 'Refresh')}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* 记录计数 */}
      {/* <div className="records-count-text">
        {t('design.electrode.records.showing', 'Showing {{count}} of {{total}} records', {
          count: filteredRecords.length,
          total: records.length,
        })}
      </div> */}

      {/* 表格列表 */}
      <div className="records-table-wrapper">
        <table className="records-table">
          <thead>
            <tr>
              <th>{t('design.electrode.records.recordId', 'Record ID')}</th>
              <th>{t('design.electrode.records.cellDesign', 'Cell Design')}</th>
              <th>{t('design.electrode.records.cathode', 'Cathode Active Material')}</th>
              <th>{t('design.electrode.records.anode', 'Anode Active Material')}</th>
              <th>{t('design.electrode.records.createdTime', 'Created Time')}</th>
              <th>{t('design.electrode.records.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-data">
                  {t('design.electrode.records.noRecords', 'No records found.')}
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td className="record-id">{formatRecordId(record.id)}</td>
                  <td>{record.cell_design}</td>
                  <td>{record.cathode_active_material}</td>
                  <td>{record.anode_active_material}</td>
                  <td className="created-date">
                    {formatUTCDateTime(record.created_at, { showSeconds: true }) || '-'}
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-button view-button"
                      onClick={() => {
                        // 根据当前 tab 决定跳转参数 type
                        const type = activeSubTab === 'inverse-design' ? 2 : 1;
                        navigate(`/design/electrode/detail/${record.id}?type=${type}`);
                      }}
                    >
                      {t('design.electrode.records.viewResults', 'View Results')}
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDelete(record.id)}
                    >
                      {t('design.electrode.records.delete', 'Delete')}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </Spin>
  );
};

export default RecordsContent;
