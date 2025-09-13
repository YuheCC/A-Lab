import React from 'react';
import { FileText, Calendar, Battery, TrendingUp } from 'lucide-react';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
}

export const renderPredictionCard = (
  file: FileRecord,
  onView?: (item: FileRecord) => void,
  onDelete?: (itemId: string) => void
) => {
  return (
    <div className="history-item">
      <div className="item-header">
        <div className="date-status">
          <span className="date">{file.date}</span>
          <span className="status completed">Completed</span>
        </div>
      </div>
      
      <div className="item-content">
        <div className="battery-system">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <FileText size={14} />
            <span 
              className="system-name"
              style={{
                flex: 1,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0
              }}
              title={file.name}
            >
              {file.name}
            </span>
          </div>
        </div>
        
        <div className="results-preview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <Battery size={12} />
              <span>电芯数量: {file.batteryCount}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' }}>
              <TrendingUp size={12} />
              <span>平均循环: {file.avgCirculation}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="item-actions">
        <button 
          className="view-details-btn"
          onClick={() => onView && onView(file)}
        >
          查看
        </button>
        <button 
          className="delete-btn"
          onClick={() => onDelete && onDelete(file.id)}
        >
          删除
        </button>
      </div>
    </div>
  );
};