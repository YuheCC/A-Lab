import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getHistoryDetail, downloadFile, type HistoryDetailResponse } from '@/services/prediction/predictionTool';
import { normalizeServerDate } from '@/utils/messageUtils';
import CycleLifeScatterChart from './CycleLifeScatterChart';

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
  const [downloading, setDownloading] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<string | undefined>();

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

  const handleDownload = async () => {
    if (!detailData?.file_name) return;

    setDownloading(true);
    try {
      const data = await downloadFile({ filename: detailData.file_path });

      // 确保数据是Blob类型
      let blob: Blob;
      if (data instanceof Blob) {
        blob = data;
      } else {
        // 如果不是Blob，尝试转换
        blob = new Blob([data], { type: 'application/octet-stream' });
      }

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = detailData.file_name;
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || '下载文件失败');
    } finally {
      setDownloading(false);
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
              <div className="file-link-container">
                <span className="file-link">
                  {fileRecord.name}
                </span>
                {detailData?.file_name && (
                  <button
                    className="download-btn"
                    onClick={handleDownload}
                    disabled={downloading}
                    title="下载文件"
                  >
                    <Download size={16} />
                    {downloading ? '下载中...' : '下载'}
                  </button>
                )}
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
                    {/* <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.avgCycleLife1')}</div>
                      <div className="stats-value">
                        {(detailData.avg_cycle_life_1 || 0) >= 0 ? `${(detailData.avg_cycle_life_1 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}
                      </div>
                    </div> */}
                    {/* <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.avgCycleLife2')}</div>
                      <div className="stats-value">
                        {(detailData.avg_cycle_life_2 || 0) >= 0 ? `${(detailData.avg_cycle_life_2 || 0).toFixed(0)}` : t('predictionTool.results.unknown')}
                      </div>
                    </div> */}
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.predictionTime')}</div>
                      <div className="stats-value">
                        {new Date(normalizeServerDate(detailData.created_at)).toLocaleString('zh-CN', {
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
                          {/* <th className="cycle-life-col">{t('predictionTool.results.cycleLife2')}</th> */}
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.brcode_data && detailData.brcode_data.length > 0
                          ? detailData.brcode_data.map((item) => {
                              // 当状态为fail且cycle_life为null时，显示fail_reason
                              const getCycleLife1Display = () => {
                                if (detailData.status === 'fail' && item.cycle_life_1 === null && detailData.fail_reason_1) {
                                  return detailData.fail_reason_1;
                                }
                                return parseFloat((item.cycle_life_1 || 0).toString()).toFixed(0);
                              };

                              const getCycleLife2Display = () => {
                                if (detailData.status === 'fail' && item.cycle_life_2 === null && detailData.fail_reason_2) {
                                  return detailData.fail_reason_2;
                                }
                                return parseFloat((item.cycle_life_2 || 0).toString()).toFixed(0);
                              };

                              const isSelected = selectedBarcode === item.barcode;

                              return (
                                <tr
                                  key={item.id}
                                  className={isSelected ? 'selected-row' : ''}
                                  onClick={() => setSelectedBarcode(item.barcode)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <td className="barcode-cell" title={item.barcode}>{item.barcode}</td>
                                  <td className="cycle-life-cell">{getCycleLife1Display()}</td>
                                  {/* <td className="cycle-life-cell">{getCycleLife2Display()}</td> */}
                                </tr>
                              );
                            })
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

                {/* 散点图展示区域 */}
                {detailData.brcode_data && detailData.brcode_data.length > 0 && (
                  <div className="chart-section" style={{ marginTop: '24px' }}>
                    <h4 className="section-title">电池容量变化图表</h4>
                    <div className="chart-container" style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#ffffff'
                    }}>
                      <CycleLifeScatterChart
                        brcodeData={detailData.brcode_data}
                        selectedBarcode={selectedBarcode}
                        onBarcodeSelect={setSelectedBarcode}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;