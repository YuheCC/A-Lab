import React, { useState, useRef, useEffect } from 'react';
import { Upload, Activity, BarChart3, Filter, Plus, FileText, Calendar, Battery, TrendingUp } from 'lucide-react';
import StepContent from './components/StepContent';
import './PredictionTool.css';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
}

const mockFiles: FileRecord[] = [
  {
    id: '1',
    name: 'Battery_NCM811_Cycle_Data.csv',
    date: '2024/8/5 16:30:38',
    batteryCount: 5,
    avgCirculation: '285次'
  },
  {
    id: '2',
    name: 'LiFePO4_Degradation_Test.csv',
    date: '2024/8/5 15:45:22',
    batteryCount: 3,
    avgCirculation: '312次'
  },
  {
    id: '3',
    name: 'Battery_Thermal_Cycling.csv',
    date: '2024/8/5 14:12:15',
    batteryCount: 8,
    avgCirculation: '267次'
  }
];

interface FilterState {
  smilesSearch: string;
  timeRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'completed' | 'pending' | 'failed';
}

const PredictionTool: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
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

  const steps = [
    { 
      id: 'upload', 
      title: '数据上传',
      icon: Upload
    },
    { 
      id: 'ai-predict', 
      title: 'AI预测',
      icon: Activity
    },
    { 
      id: 'results', 
      title: '结果展示',
      icon: BarChart3
    }
  ];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const filteredData = mockFiles.filter((record) => {
    if (filters.smilesSearch && !record.name.toLowerCase().includes(filters.smilesSearch.toLowerCase())) {
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
    <div className="prediction-tool">
      {/* Header */}
      <div className="prediction-header">
        <h1 className="prediction-title">电池早期生命预测工具</h1>
        <span className="beta-tag">BETA</span>
      </div>

      {/* Content */}
      <div className="prediction-content">
        {/* Left - Operation Area */}
        <div className="operation-area">
          <div className="steps-container">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(index);
              
              return (
                <div 
                  key={step.id} 
                  className="step-item"
                  onClick={() => setCurrentStep(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`step-icon ${status}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`step-text ${status}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          
          <StepContent activeStep={currentStep} onStepChange={setCurrentStep} />
        </div>

        {/* Right - History Area */}
        <div className="history-area">
          <div className="history-header">
            <h3 className="history-title">预测记录</h3>
            <div className="filter-container" ref={dropdownRef}>
              <Filter 
                className="filter-icon" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              />
              
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
            <Plus />
            新增预测
          </button>

          <div className="file-list">
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
              filteredData.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-name">
                    <FileText />
                    {file.name}
                  </div>
                  <div className="file-date">
                    <Calendar />
                    {file.date}
                  </div>
                  <div className="file-stats">
                    <div className="file-stat">
                      <Battery />
                      电芯数量: {file.batteryCount}
                    </div>
                    <div className="file-stat">
                      <TrendingUp />
                      平均循环: {file.avgCirculation}
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="file-action-btn view-btn">查看</button>
                    <button className="file-action-btn delete-btn">删除</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionTool;