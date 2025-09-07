import React, { useState, useRef, useEffect } from 'react';
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
  historyData: PredictionResult[];
  onViewDetails: (result: PredictionResult) => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ historyData, onViewDetails }) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    smilesSearch: '',
    timeRange: 'all',
    status: 'all'
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          <h2>Prediction Records</h2>
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
                    placeholder="Search by SMILES..."
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
        <button className="new-prediction-btn">
          <span>+</span> New Prediction
        </button>
      </div>

      <div className="history-list">
        {filteredData.length === 0 ? (
          <div className="no-results">
            <p>No prediction records found matching your filters.</p>
            <button 
              className="clear-filters-link"
              onClick={clearFilters}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredData.map((record) => (
          <div key={record.id} className="history-item">
            <div className="item-header">
              <div className="date-status">
                <span className="date">{record.date}</span>
                <span className="status completed">Completed</span>
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
                    25°C: 1/3 {record.results.temp25.cycleLife}
                  </span>
                  <span 
                    className="result-tag"
                    style={{ 
                      color: getStatusColor(record.results.temp45.cycleLife),
                      backgroundColor: getStatusBg(record.results.temp45.cycleLife)
                    }}
                  >
                    45°C: 1/2 {record.results.temp45.cycleLife}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="item-actions">
              <button 
                className="view-details-btn"
                onClick={() => onViewDetails(record)}
              >
                View Details
              </button>
              <button className="delete-btn">Delete</button>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryModule;