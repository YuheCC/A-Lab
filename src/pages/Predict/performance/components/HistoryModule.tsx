import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPerformanceHistoryList, deletePerformanceHistory, getPerformanceHistoryDetail, type PerformanceHistoryItem } from '@/services/prediction/performance';
import './HistoryModule.css';

interface PredictionResult {
  id: string;
  date: string;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 将API数据转换为组件需要的格式
  const transformAPIDataToPredictionResult = (apiData: PerformanceHistoryItem): PredictionResult => {
    return {
      id: apiData.id.toString(),
      date: new Date(apiData.created_at).toLocaleString(),
      batterySystem: `Battery System ${apiData.battery_system_id}`,
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
        optimization: apiData.llm_analysis_result || 'No Analysis Available',
        cycling: apiData.llm_analysis_result ? 'Available' : 'Not Available'
      }
    };
  };

  // 获取历史数据
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPerformanceHistoryList();
      
      if (response.data?.data) {
        const transformedData = response.data.data.map(transformAPIDataToPredictionResult);
        setHistoryData(transformedData);
      }
    } catch (err) {
      console.error('获取历史数据失败:', err);
      setError('Failed to load history data');
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
      await deletePerformanceHistory(parseInt(id));
      // 删除成功后刷新数据
      fetchHistoryData();
    } catch (err) {
      console.error('删除记录失败:', err);
      alert('Failed to delete record');
    }
  };

  // 查看详情
  const handleViewDetails = async (record: PredictionResult) => {
    try {
      const response = await getPerformanceHistoryDetail(parseInt(record.id));
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

  // 组件加载时获取数据
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'Positive') return '#10b981';
    if (status === 'Negative') return '#ef4444';
    if (status === 'Neutral') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusBg = (status: string) => {
    if (status === 'Positive') return '#ecfdf5';
    if (status === 'Negative') return '#fef2f2';
    if (status === 'Neutral') return '#fffbeb';
    return '#f9fafb';
  };

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
            <button 
              className={`filter-btn ${showFilterDropdown ? 'active' : ''}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
              </svg>
            </button>
            
            {showFilterDropdown && (
              <div className="filter-dropdown">
                <div className="filter-section">
                  <label className="filter-label">SMILES Search</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder={t('performance.history.searchPlaceholder')}
                    value={filters.smilesSearch}
                    onChange={(e) => handleFilterChange('smilesSearch', e.target.value)}
                  />
                </div>
                
                <div className="filter-section">
                  <label className="filter-label">Time Range</label>
                  <select
                    className="filter-select"
                    value={filters.timeRange}
                    onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>
                
                <div className="filter-section">
                  <label className="filter-label">Status</label>
                  <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div className="filter-actions">
                  <button 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                  >
                    Clear Filters
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
            <p>Loading history data...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button 
              className="retry-btn"
              onClick={fetchHistoryData}
            >
              Retry
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="no-results">
            <p>{t('performance.history.noResults.message')}</p>
            <button 
              className="clear-filters-link"
              onClick={clearFilters}
            >
              {t('performance.history.noResults.clearFilters')}
            </button>
          </div>
        ) : (
          filteredData.map((record) => (
          <div key={record.id} className="history-item">
            <div className="item-header">
              <div className="date-status">
                <span className="date">{record.date}</span>
                <span className="status completed">{t('performance.history.status.completed')}</span>
              </div>
            </div>
            
            <div className="item-content">
              <div className="battery-system">
                <span className="system-name">{record.batterySystem}</span>
              </div>
              
              <div className="additive">
                <span className="additive-formula">{record.additive}</span>
              </div>
              
              <div className="results-preview">
                <div className="result-tags">
                  <span 
                    className="result-tag"
                    style={{ 
                      color: getStatusColor(record.results.temp25.cycleLife),
                      backgroundColor: getStatusBg(record.results.temp25.cycleLife)
                    }}
                  >
                    25°C CL: {record.results.temp25.cycleLife}
                  </span>
                  <span 
                    className="result-tag"
                    style={{ 
                      color: getStatusColor(record.results.temp25.ce),
                      backgroundColor: getStatusBg(record.results.temp25.ce)
                    }}
                  >
                    25°C CE: {record.results.temp25.ce}
                  </span>
                  <span 
                    className="result-tag"
                    style={{ 
                      color: getStatusColor(record.results.temp25.ratePerformance),
                      backgroundColor: getStatusBg(record.results.temp25.ratePerformance)
                    }}
                  >
                    25°C CR: {record.results.temp25.ratePerformance}
                  </span>
                  <span 
                    className="result-tag"
                    style={{ 
                      color: getStatusColor(record.results.temp45.cycleLife),
                      backgroundColor: getStatusBg(record.results.temp45.cycleLife)
                    }}
                  >
                    45°C CL: {record.results.temp45.cycleLife}
                  </span>
                  <span 
                    className="result-tag"
                    style={{ 
                      color: getStatusColor(record.results.temp45.ce),
                      backgroundColor: getStatusBg(record.results.temp45.ce)
                    }}
                  >
                    45°C CE: {record.results.temp45.ce}
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
              <button 
                className="delete-btn"
                onClick={() => handleDeleteRecord(record.id)}
              >
                {t('performance.history.actions.delete')}
              </button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryModule;