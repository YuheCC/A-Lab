import React, { useState, useRef, useEffect } from 'react';
import { Filter, Plus } from 'lucide-react';
import HistoryItem from './HistoryItem';
import HistoryModal from './HistoryModal';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
}

interface FilterState {
  smilesSearch: string;
  timeRange: 'all' | 'today' | 'week' | 'month';
  status: 'all' | 'completed' | 'pending' | 'failed';
}

interface HistoryListProps {
  files: FileRecord[];
  onNewPrediction: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ files, onNewPrediction }) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    smilesSearch: '',
    timeRange: 'all',
    status: 'all'
  });
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  const filteredData = files.filter((record) => {
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

  const handleViewFile = (file: FileRecord) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleDeleteFile = (fileId: string) => {
    console.log('Delete file:', fileId);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  return (
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

      <button className="new-prediction-btn" onClick={onNewPrediction}>
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
            <HistoryItem
              key={file.id}
              file={file}
              onView={handleViewFile}
              onDelete={handleDeleteFile}
            />
          ))
        )}
      </div>

      <HistoryModal
        isOpen={showModal}
        onClose={handleCloseModal}
        fileRecord={selectedFile}
      />
    </div>
  );
};

export default HistoryList;