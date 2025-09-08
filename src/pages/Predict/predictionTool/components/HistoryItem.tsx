import React from 'react';
import { FileText, Calendar, Battery, TrendingUp } from 'lucide-react';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
}

interface HistoryItemProps {
  file: FileRecord;
  onView: (file: FileRecord) => void;
  onDelete: (fileId: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ file, onView, onDelete }) => {
  const handleView = () => {
    onView(file);
  };

  const handleDelete = () => {
    onDelete(file.id);
  };

  return (
    <div className="file-item">
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
        <button className="file-action-btn view-btn" onClick={handleView}>
          查看
        </button>
        <button className="file-action-btn delete-btn" onClick={handleDelete}>
          删除
        </button>
      </div>
    </div>
  );
};

export default HistoryItem;