import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

// 通用的数据项接口
export interface HistoryItem {
  id: string;
  date: string;
  [key: string]: any;
}

// 过滤器状态接口
export interface FilterState {
  smilesSearch: string;
  timeRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'completed' | 'pending' | 'failed';
}

// 卡片渲染器接口
export interface CardRenderer<T extends HistoryItem> {
  (item: T, onView?: (item: T) => void, onDelete?: (itemId: string) => void): ReactNode;
}

// 过滤器接口
export interface FilterConfig {
  smilesSearchPlaceholder?: string;
  enableTimeRange?: boolean;
  enableStatus?: boolean;
  customFilters?: ReactNode;
}

// 主组件的 Props 接口
interface UniversalHistoryModuleProps<T extends HistoryItem> {
  title: string;
  data: T[];
  cardRenderer: CardRenderer<T>;
  onNewPrediction?: () => void;
  onViewDetails?: (item: T) => void;
  onDeleteItem?: (itemId: string) => void;
  filterConfig?: FilterConfig;
  newPredictionText?: string;
  className?: string;
  customFilterFunction?: (item: T, filters: FilterState) => boolean;
}

function UniversalHistoryModule<T extends HistoryItem>({
  title,
  data,
  cardRenderer,
  onNewPrediction,
  onViewDetails,
  onDeleteItem,
  filterConfig = {},
  newPredictionText = "New Prediction",
  className = "",
  customFilterFunction
}: UniversalHistoryModuleProps<T>) {
  const { t } = useTranslation();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    smilesSearch: '',
    timeRange: 'all',
    status: 'all'
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    smilesSearchPlaceholder = "Search by SMILES...",
    enableTimeRange = true,
    enableStatus = true,
    customFilters
  } = filterConfig;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultFilterFunction = (item: T, filters: FilterState): boolean => {
    // SMILES search filter - 尝试在多个字段中搜索
    if (filters.smilesSearch) {
      const searchTerm = filters.smilesSearch.toLowerCase();
      const searchableFields = [item.name, item.additive, item.batterySystem].filter(Boolean);
      const found = searchableFields.some(field => 
        field && field.toString().toLowerCase().includes(searchTerm)
      );
      if (!found) return false;
    }

    // Time range filter
    if (filters.timeRange !== 'all' && enableTimeRange) {
      const recordDate = new Date(item.date);
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

    // Status filter
    if (filters.status !== 'all' && enableStatus) {
      if (filters.status !== 'completed') return false;
    }

    return true;
  };

  const filteredData = data.filter((item) => {
    if (customFilterFunction) {
      return customFilterFunction(item, filters);
    }
    return defaultFilterFunction(item, filters);
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

  const handleViewDetails = (item: T) => {
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (onDeleteItem) {
      onDeleteItem(itemId);
    }
  };

  return (
    <div className={`history-module ${className}`}>
      <div className="history-header">
        <div className="header-content">
          <h2>{title}</h2>
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
                  <label className="filter-label">SMILES Search</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder={smilesSearchPlaceholder}
                    value={filters.smilesSearch}
                    onChange={(e) => handleFilterChange('smilesSearch', e.target.value)}
                  />
                </div>
                
                {enableTimeRange && (
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
                )}
                
                {enableStatus && (
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
                )}

                {customFilters}
                
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
        {onNewPrediction && (
          <button className="new-prediction-btn" onClick={onNewPrediction}>
            <span>+</span> {newPredictionText}
          </button>
        )}
      </div>

      <div className="history-list">
        {filteredData.length === 0 ? (
          <div className="no-results">
            <p>{t('performance.history.noResults.message')}</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div key={item.id}>
              {cardRenderer(item, handleViewDetails, handleDeleteItem)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UniversalHistoryModule;