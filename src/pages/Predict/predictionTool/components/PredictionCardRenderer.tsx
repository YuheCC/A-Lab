import React from 'react';
import { FileText, Calendar, Battery, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;  // 保留兼容性
  avgCycleLife1: number;
  avgCycleLife2: number;
}

interface PredictionCardProps {
  file: FileRecord;
  onView?: (item: FileRecord) => void;
  onDelete?: (itemId: string) => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ file, onView, onDelete }) => {
  const { t } = useTranslation();

  return (
    <div className="prediction-history-card">
      <div className="card-content">
        <div className="info-row">
          <FileText size={16} color="#6b7280" />
          <span className="card-title">{file.name}</span>
        </div>
        <div className="info-row">
          <Calendar size={14} color="#6b7280" />
          <span className="info-text">{file.date}</span>
        </div>

        <div className="info-row">
          <Battery size={14} color="#6b7280" />
          <span className="info-text">{t('predictionTool.results.batteryCount')}: {file.batteryCount}</span>
        </div>

        <div className="info-row">
          <TrendingUp size={14} color="#6b7280" />
          <span className="info-text">{t('predictionTool.results.avgCycleLife1')}: {file.avgCycleLife1 >= 0 ? file.avgCycleLife1.toFixed(0) : t('predictionTool.results.unknown')}</span>
        </div>

        <div className="info-row">
          <TrendingUp size={14} color="#6b7280" />
          <span className="info-text">{t('predictionTool.results.avgCycleLife2')}: {file.avgCycleLife2 >= 0 ? file.avgCycleLife2.toFixed(0) : t('predictionTool.results.unknown')}</span>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="action-btn view-btn"
          onClick={() => onView && onView(file)}
        >
          {t('predictionTool.history.view', '查看')}
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete && onDelete(file.id)}
        >
          {t('predictionTool.history.delete', '删除')}
        </button>
      </div>
    </div>
  );
};

export const renderPredictionCard = (
  file: FileRecord,
  onView?: (item: FileRecord) => void,
  onDelete?: (itemId: string) => void
) => {
  return <PredictionCard file={file} onView={onView} onDelete={onDelete} />;
};