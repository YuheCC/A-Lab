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
    <div className="prediction-history-card">
      <div className="card-content">
      <div className="info-row">
          <FileText size={14} color="#6b7280" />
          <span className="info-text">{file.name}</span>
        </div>
        <div className="info-row">
          <Calendar size={14} color="#6b7280" />
          <span className="info-text">{file.date}</span>
        </div>

        <div className="info-row">
          <Battery size={14} color="#6b7280" />
          <span className="info-text">电芯数量: {file.batteryCount}</span>
        </div>

        <div className="info-row">
          <TrendingUp size={14} color="#6b7280" />
          <span className="info-text">平均循环: {file.avgCirculation}</span>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="action-btn view-btn"
          onClick={() => onView && onView(file)}
        >
          查看
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete && onDelete(file.id)}
        >
          删除
        </button>
      </div>
    </div>
  );
};