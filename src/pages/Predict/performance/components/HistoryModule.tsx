import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type PerformanceHistoryItem } from '@/services/prediction/performance';
import { getHistoryList, getHistoryDetail, deleteHistory, getBatterySystemOptions, isMockRecord } from '../model';
import './HistoryModule.css';
import { normalizeServerDate } from '@/utils/messageUtils';
import { ArrowUpIcon } from './ArrowIcons';

interface BatterySystem {
  id: string;
  name: string;
  cathode: string;
  anode: string;
  benchmark_electrolyte: string;
  cell_design: string;
  created_at: string;
  updated_at: string;
}

interface PredictionResult {
  id: string;
  date: string;
  battery_system_id: number;
  batterySystem: string;
  additive: string;
  results: {
    temp25: {
      cycleLife: string;
      ce: string;
      ratePerformance: string;
    };
    temp45: {
      cycleLife: string;
      ce: string;
    };
  };
  llmAnalysis: {
    optimization: string;
    cycling: string;
  };
  rawApiData?: PerformanceHistoryItem;
}

interface FilterState {
  smilesSearch: string;
  timeRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'completed' | 'pending' | 'failed';
}

interface HistoryModuleProps {
  onViewDetails: (result: PredictionResult) => void;
  onNewPrediction?: () => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ onViewDetails, onNewPrediction }) => {
  const { t } = useTranslation();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    smilesSearch: '',
    timeRange: 'all',
    status: 'all'
  });
  const [historyData, setHistoryData] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batterySystemOptions, setBatterySystemOptions] = useState<BatterySystem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 分别统计25°C和45°C的正向结果
  const calculateTemperatureStats = (apiData: PerformanceHistoryItem) => {
    // 25°C metrics
    const temp25Metrics = [
      parseInt(apiData.temperature_25_CE_label || '1'), // CE 25°C
      parseInt(apiData.temperature_25_CL_label || '1'), // CL 25°C  
      parseInt(apiData.temperature_25_CR_label || '1')  // CR 25°C
    ];
    
    // 45°C metrics  
    const temp45Metrics = [
      parseInt(apiData.temperature_45_CE_label || '1'), // CE 45°C
      parseInt(apiData.temperature_45_CL_label || '1')  // CL 45°C
    ];
    
    const temp25PositiveCount = temp25Metrics.filter(label => label === 0).length;
    const temp25TotalCount = temp25Metrics.length;
    const temp25Ratio = temp25PositiveCount / temp25TotalCount;
    
    const temp45PositiveCount = temp45Metrics.filter(label => label === 0).length;
    const temp45TotalCount = temp45Metrics.length;
    const temp45Ratio = temp45PositiveCount / temp45TotalCount;
    
    return {
      temp25: { positiveCount: temp25PositiveCount, totalCount: temp25TotalCount, ratio: temp25Ratio },
      temp45: { positiveCount: temp45PositiveCount, totalCount: temp45TotalCount, ratio: temp45Ratio }
    };
  };

  // 获取状态颜色和类名
  const getStatusColorAndClass = (ratio: number) => {
    if (ratio < 0.5) {
      return { color: '#ef4444', backgroundColor: '#fef2f2', className: 'negative' }; // 红色
    } else if (ratio === 0.5) {
      return { color: '#f59e0b', backgroundColor: '#fffbeb', className: 'neutral' }; // 黄色
    } else {
      return { color: '#10b981', backgroundColor: '#ecfdf5', className: 'positive' }; // 绿色
    }
  };

  // 根据电池系统ID获取电池系统名称
  const getBatterySystemNameById = (batterySystemId: number): string => {
    const batterySystem = batterySystemOptions instanceof Array && batterySystemOptions?.find(system => parseInt(system.id) === batterySystemId);
    return batterySystem ? batterySystem.name : `${t('performance.batterySystemFallback')} ${batterySystemId}`;
  };

  // 将API数据转换为组件需要的格式
  const transformAPIDataToPredictionResult = (originalApiData: PerformanceHistoryItem): PredictionResult & { rawApiData?: PerformanceHistoryItem } => {
    let apiData = {...originalApiData};
    try{
      const model_result = JSON.parse(originalApiData?.model_result || '{}');
      apiData = {
        ...apiData,
        temperature_25_CE_label: model_result?.ce_cl_result?.temperature_25_CE_label.toString(),
        temperature_25_CE_prob: model_result?.ce_cl_result?.temperature_25_CE_prob.toString(),
        temperature_25_CL_label: model_result?.ce_cl_result?.temperature_25_CL_label.toString(),
        temperature_25_CL_prob: model_result?.ce_cl_result?.temperature_25_CL_prob.toString(),
        temperature_25_CR_label: model_result?.cr_result?.temperature_25_CR_label.toString(),
        temperature_25_CR_prob: model_result?.cr_result?.temperature_25_CR_prob.toString(),
        temperature_45_CE_label: model_result?.ce_cl_result?.temperature_45_CE_label.toString(),
        temperature_45_CE_prob: model_result?.ce_cl_result?.temperature_45_CE_prob.toString(),
        temperature_45_CL_label: model_result?.ce_cl_result?.temperature_45_CL_label.toString(),
        temperature_45_CL_prob: model_result?.ce_cl_result?.temperature_45_CL_prob.toString()
      };
    } catch (error) {
      console.error('Error parsing API data:', error);
    }
    console.log('apiData:', apiData);
    return {
      id: apiData.id.toString(),
      date: normalizeServerDate(apiData.created_at).toLocaleString(),
      batterySystem: getBatterySystemNameById(apiData.battery_system_id),
      battery_system_id: apiData.battery_system_id,
      additive: apiData.smiles,
      results: {
        temp25: {
          cycleLife: apiData.temperature_25_CL_label || 'Unknown',
          ce: apiData.temperature_25_CE_label || 'Unknown', 
          ratePerformance: apiData.temperature_25_CR_label || 'Unknown'
        },
        temp45: {
          cycleLife: apiData.temperature_45_CL_label || 'Unknown',
          ce: apiData.temperature_45_CE_label || 'Unknown'
        }
      },
      llmAnalysis: {
        optimization: apiData.llm_analysis_result || t('performance.analysisStatus.noAnalysis'),
        cycling: apiData.llm_analysis_result ? t('performance.analysisStatus.available') : t('performance.analysisStatus.notAvailable')
      },
      // Include raw API data for proper processing in ResultModal
      rawApiData: apiData
    };
  };

  // 获取电池系统列表
  const fetchBatterySystemOptions = async () => {
    try {
      const response = await getBatterySystemOptions();
      if (response?.data) {
        setBatterySystemOptions(response.data);
      }
    } catch (error) {
      console.error('获取电池系统选项失败:', error);
    }
  };

  // 获取历史数据
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getHistoryList();

      if (response.data?.data) {
        const transformedData = response.data.data.map(transformAPIDataToPredictionResult);
        setHistoryData(transformedData);
      }
    } catch (err) {
      console.error('获取历史数据失败:', err);
      setError(t('performance.history.loading.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  // 删除历史记录
  const handleDeleteRecord = async (id: string) => {
    if (!confirm(t('performance.history.actions.deleteConfirm'))) {
      return;
    }

    try {
      await deleteHistory(parseInt(id));
      // 删除成功后刷新数据
      fetchHistoryData();
    } catch (err) {
      console.error('删除记录失败:', err);
      alert(t('performance.history.actions.deleteFailed'));
    }
  };

  // 查看详情
  const handleViewDetails = async (record: PredictionResult) => {
    try {
      const response = await getHistoryDetail(parseInt(record.id));
      if (response.data) {
        // 将详细数据转换为组件期望的格式并传递给父组件
        const detailedResult = transformAPIDataToPredictionResult(response.data);
        onViewDetails(detailedResult);
      }
    } catch (err) {
      console.error('获取详情失败:', err);
      // 如果获取详情失败，使用当前的数据
      onViewDetails(record);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 组件加载时获取电池系统列表
  useEffect(() => {
    fetchBatterySystemOptions();
  }, []);

  // 组件加载时获取数据
  useEffect(() => {
    fetchHistoryData();
  }, []);


  const filteredData = historyData.filter((record) => {
    // SMILES search filter
    if (filters.smilesSearch && !record.additive.toLowerCase().includes(filters.smilesSearch.toLowerCase())) {
      return false;
    }

    // Time range filter
    if (filters.timeRange !== 'all') {
      const recordDate = new Date(record.date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - recordDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      switch (filters.timeRange) {
        case 'today':
          if (diffDays > 1) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
      }
    }

    // Status filter - for now all records are completed, but we can extend this
    if (filters.status !== 'all' && filters.status !== 'completed') {
      return false;
    }

    return true;
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      smilesSearch: '',
      timeRange: 'all',
      status: 'all'
    });
  };

  return (
    <div className="history-module">
      <div className="history-header">
        <div className="header-content">
          <h2>{t('performance.history.title')}</h2>
          <div className="filter-container" ref={dropdownRef}>
            {/* <button 
              className={`filter-btn ${showFilterDropdown ? 'active' : ''}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
              </svg>
            </button> */}
            
            {showFilterDropdown && (
              <div className="filter-dropdown">
                <div className="filter-section">
                  <label className="filter-label">{t('performance.filters.smilesSearch')}</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder={t('performance.history.searchPlaceholder')}
                    value={filters.smilesSearch}
                    onChange={(e) => handleFilterChange('smilesSearch', e.target.value)}
                  />
                </div>
                
                <div className="filter-section">
                  <label className="filter-label">{t('performance.filters.timeRange')}</label>
                  <select
                    className="filter-select"
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  >
                    <option value="all">{t('performance.filters.timeOptions.allTime')}</option>
                    <option value="today">{t('performance.filters.timeOptions.today')}</option>
                    <option value="week">{t('performance.filters.timeOptions.thisWeek')}</option>
                    <option value="month">{t('performance.filters.timeOptions.thisMonth')}</option>
                  </select>
                </div>
                
                <div className="filter-section">
                  <label className="filter-label">{t('performance.filters.status')}</label>
                  <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">{t('performance.filters.statusOptions.allStatus')}</option>
                    <option value="completed">{t('performance.filters.statusOptions.completed')}</option>
                    <option value="pending">{t('performance.filters.statusOptions.pending')}</option>
                    <option value="failed">{t('performance.filters.statusOptions.failed')}</option>
                  </select>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                  >
                    {t('performance.filters.clearFilters')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <button 
          className="new-prediction-btn"
          onClick={onNewPrediction}
        >
          <span>+</span> {t('performance.history.newPrediction')}
        </button>
      </div>

      <div className="history-list">
        {loading ? (
          <div className="loading-state">
            <p>{t('performance.history.loading.message')}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{t('performance.history.loading.error')}: {error}</p>
            <button 
              className="retry-btn"
              onClick={fetchHistoryData}
            >
              {t('performance.history.loading.retry')}
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="no-results">
            <p>{t('performance.history.noResults.message')}</p>
            {/* <button 
              className="clear-filters-link"
              onClick={clearFilters}
            >
              {t('performance.history.noResults.clearFilters')}
            </button> */}
          </div>
        ) : (
          filteredData.map((record) => {
            // Calculate separate temperature statistics for this record
            const stats = record.rawApiData ? calculateTemperatureStats(record.rawApiData) : { 
              temp25: { positiveCount: 0, totalCount: 3, ratio: 0 },
              temp45: { positiveCount: 0, totalCount: 2, ratio: 0 }
            };
            const temp25Style = getStatusColorAndClass(stats.temp25.ratio);
            const temp45Style = getStatusColorAndClass(stats.temp45.ratio);
            
            const isMock = record.rawApiData && isMockRecord(record.rawApiData);

            return (
            <div key={record.id} className="history-item">
              <div className="item-header">
                <div className="date-status">
                  <span className="date">{record.date}</span>
                  {/* <span className="status completed">{t('performance.history.status.completed')}</span> */}
                </div>
              </div>
              
              <div className="item-content">
                <div className="battery-system">
                  <span className="system-name">{getBatterySystemNameById(record.battery_system_id)}</span>
                </div>
                
                <div className="additive">
                  <span className="additive-formula">{record.additive}</span>
                </div>
                
                <div className="results-preview">
                  <div className="result-tags">
                    <span 
                      className="result-tag"
                      style={{ 
                        color: temp25Style.color,
                        backgroundColor: temp25Style.backgroundColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>25°C: {stats.temp25.positiveCount}/{stats.temp25.totalCount}</span>
                      <ArrowUpIcon size={12} color={temp25Style.color} />
                    </span>
                    <span 
                      className="result-tag"
                      style={{ 
                        color: temp45Style.color,
                        backgroundColor: temp45Style.backgroundColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>45°C: {stats.temp45.positiveCount}/{stats.temp45.totalCount}</span>
                      <ArrowUpIcon size={12} color={temp45Style.color} />
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="item-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => handleViewDetails(record)}
                >
                  {t('performance.history.actions.viewDetails')}
                </button>
                {!isMock && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteRecord(record.id)}
                  >
                    {t('performance.history.actions.delete')}
                  </button>
                )}
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryModule;