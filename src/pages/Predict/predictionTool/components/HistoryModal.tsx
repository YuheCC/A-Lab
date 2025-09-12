import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
      setError(err.message || '获取详细数据失败');
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
          <h3 className="modal-title">预测记录详情 - 历史数据</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="prediction-modal-content">
          <div className="modal-section">
            <h4 className="section-title">上传数据</h4>
            <div className="uploaded-file-info">
              <div className="file-link">
                {fileRecord.name}
              </div>
            </div>
          </div>
          
          <div className="modal-section">
            <h4 className="section-title">预测结果</h4>
            
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                加载中...
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
                      <div className="stats-label">电芯数量</div>
                      <div className="stats-value">{detailData.barcode_count}个</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-label">平均循环寿命</div>
                      <div className="stats-value">
                        {(() => {
                          const avg1 = detailData.avg_cycle_life_1 || 0;
                          const avg2 = detailData.avg_cycle_life_2 || 0;
                          const avgCycleLife = avg1 > 0 ? avg1 : avg2;
                          return avgCycleLife > 0 ? `${avgCycleLife.toFixed(1)}次` : '未知';
                        })()}
                      </div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-label">预测时间</div>
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
                          <th>Barcode</th>
                          <th>Predicted Cycle Life</th>
                          <th>Cycle Life 2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.brcode_data && detailData.brcode_data.length > 0 
                          ? detailData.brcode_data.map((item) => (
                              <tr key={item.id}>
                                <td>{item.barcode}</td>
                                <td>{item.cycle_life_1}</td>
                                <td>{item.cycle_life_2}</td>
                              </tr>
                            ))
                          : (
                              <tr>
                                <td colSpan={3} style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                  暂无详细条形码数据
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