import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHistoryDetail, type HistoryDetailResponse } from '@/services/prediction/predictionTool';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileRecord: {
    id: string;
    name: string;
    date: string;
    batteryCount: number;
    avgCirculation: string;
  } | null;
}

// Mock数据已移除，使用真实API数据

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, fileRecord }) => {
  const { t } = useTranslation();
  const [detailData, setDetailData] = useState<HistoryDetailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 当Modal打开且有fileRecord时，获取详细数据
  useEffect(() => {
    if (isOpen && fileRecord) {
      loadDetailData();
    } else {
      // 清空数据
      setDetailData(null);
      setError(null);
    }
  }, [isOpen, fileRecord?.id]);

  const loadDetailData = async () => {
    if (!fileRecord) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const detail = await getHistoryDetail(parseInt(fileRecord.id));
      setDetailData(detail);
    } catch (err: any) {
      setError(err.message || t('predictionTool.modal.loadDetailFailed'));
      console.error('Load detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !fileRecord) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t('predictionTool.modal.title')}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="prediction-modal-content">
          <div className="modal-section">
            <h4 className="section-title">{t('predictionTool.modal.uploadedData')}</h4>
            <div className="uploaded-file-info">
              <div className="file-link">
                {fileRecord.name}
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h4 className="section-title">{t('predictionTool.modal.predictionResults')}</h4>
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                {t('predictionTool.modal.loadingDetail')}
              </div>
            )}
            
            {error && (
              <div style={{
                color: '#e53e3e',
                backgroundColor: '#fed7d7',
                padding: '12px',
                borderRadius: '6px',
                margin: '16px 0',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            {detailData && !loading && (
              <div className="results-display">
                <div className="results-stats-card">
                  <div className="results-stats">
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.batteryCount')}</div>
                      <div className="stats-value">{detailData.barcode_count}{t('predictionTool.results.batteryCountUnit')}</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.avgCycleLife1')}</div>
                      <div className="stats-value">
                        {(detailData.avg_cycle_life_1 || 0) > 0 ? `${(detailData.avg_cycle_life_1 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}
                      </div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.avgCycleLife2')}</div>
                      <div className="stats-value">
                        {(detailData.avg_cycle_life_2 || 0) > 0 ? `${(detailData.avg_cycle_life_2 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}
                      </div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.predictionTime')}</div>
                      <div className="stats-value">
                        {new Date(detailData.created_at).toLocaleString('zh-CN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="results-table-card">
                  <div className="results-table">
                    <table className="prediction-table">
                      <thead>
                        <tr>
                          <th className="barcode-col">{t('predictionTool.results.barcode')}</th>
                          <th className="cycle-life-col">{t('predictionTool.results.cycleLife1')}</th>
                          <th className="cycle-life-col">{t('predictionTool.results.cycleLife2')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.brcode_data && detailData.brcode_data.length > 0 
                          ? detailData.brcode_data.map((item) => (
                              <tr key={item.id}>
                                <td className="barcode-cell" title={item.barcode}>{item.barcode}</td>
                                <td className="cycle-life-cell">{parseFloat(item.cycle_life_1.toString()).toFixed(0)}</td>
                                <td className="cycle-life-cell">{parseFloat(item.cycle_life_2.toString()).toFixed(0)}</td>
                              </tr>
                            ))
                          : (
                              <tr>
                                <td colSpan={3} style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                  {t('predictionTool.results.noDetailedData')}
                                </td>
                              </tr>
                            )
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;