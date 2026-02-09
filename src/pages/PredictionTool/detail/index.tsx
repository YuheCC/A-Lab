import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { downloadFile, type HistoryDetailResponse } from '@/services/prediction/predictionTool';
import { getHistoryDetail } from '../model';
import type { MockHistoryDetailResponse } from '../example';
import { formatUTCDateTime } from '@/utils/dateUtils';
import CycleLifeScatterChart from '../components/CycleLifeScatterChart';
import CycleLifeLineChart from '../components/CycleLifeLineChart';
import './index.less';

const DetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<HistoryDetailResponse | MockHistoryDetailResponse | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<string | undefined>();

  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      fetchDetailData();
    } else {
      setError(t('predictionTool.detail.missingId', 'Missing prediction ID parameter'));
      setLoading(false);
    }
  }, [id]);

  const fetchDetailData = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const detail = await getHistoryDetail(parseInt(id));
      setDetailData(detail);
    } catch (err: any) {
      console.error('Failed to fetch detail data:', err);
      setError(err.message || t('predictionTool.detail.fetchError', 'Failed to fetch prediction details'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/predict?tab=records');
  };

  const handleDownload = async () => {
    if (!detailData?.file_name) return;

    // example 数据直接下载静态文件，不调用接口
    const isMockData = (detailData as MockHistoryDetailResponse).isMock;
    if (isMockData) {
      const link = document.createElement('a');
      link.href = '/predict/demo.csv';
      link.download = 'demo.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    setDownloading(true);
    try {
      const data = await downloadFile({ filename: detailData.file_path });

      let blob: Blob;
      if (data instanceof Blob) {
        blob = data;
      } else {
        blob = new Blob([data], { type: 'application/octet-stream' });
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = detailData.file_name;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      setError(err.message || t('predictionTool.detail.downloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page-container">
        <div className="detail-content">
          <div className="detail-actions">
            <span className="detail-action-title">{t('predictionTool.detail.actionTitle', 'Prediction Details')}</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              {t('predictionTool.actions.backToList', 'Back to List')}
            </button>
          </div>
          <div className="loading-state">
            <p>{t('predictionTool.detail.loading', 'Loading prediction details...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page-container">
        <div className="detail-content">
          <div className="detail-actions">
            <span className="detail-action-title">{t('predictionTool.detail.actionTitle', 'Prediction Details')}</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              {t('predictionTool.actions.backToList', 'Back to List')}
            </button>
          </div>
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page-container">
      <div className="detail-content">
        <div className="detail-actions">
          <span style={{ fontSize: '18px', fontWeight: '600' }} className="detail-action-title">
            {t('predictionTool.detail.actionTitle', 'Prediction Details')} - PR-{String(id).padStart(3, '0')}
          </span>
          <button className="back-to-list-button" onClick={handleBackToList}>
            {t('predictionTool.actions.backToList', 'Back to List')}
          </button>
        </div>

        <div className="detail-section">
          {detailData && (
            <>
              <div className="uploaded-file-section">
                <h4 className="section-title">{t('predictionTool.modal.uploadedData')}</h4>
                <div className="uploaded-file-info">
                  <div className="file-link-container">
                    <span className="file-link">
                      {detailData.file_name}
                    </span>
                    {detailData.file_name && (
                      <button
                        className="download-btn"
                        onClick={handleDownload}
                        disabled={downloading}
                        title={t('predictionTool.modal.downloadFile')}
                      >
                        <Download size={16} />
                        {downloading ? t('predictionTool.modal.downloading') : t('predictionTool.modal.download')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="results-section">
                <h4 className="section-title">{t('predictionTool.modal.predictionResults')}</h4>

                <div className="results-stats-card">
                  <div className="results-stats">
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.batteryCount')}</div>
                      <div className="stats-value">{detailData.barcode_count}{t('predictionTool.results.batteryCountUnit')}</div>
                    </div>
                    <div className="stats-card">
                      <div className="stats-label">{t('predictionTool.results.predictionTime')}</div>
                      <div className="stats-value">{formatUTCDateTime(detailData.created_at, { showSeconds: true })}</div>
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
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.brcode_data && detailData.brcode_data.length > 0
                          ? detailData.brcode_data.map((item) => {
                              const getCycleLife1Display = () => {
                                if (detailData.status === 'fail' && item.cycle_life_1 === null && detailData.fail_reason_1) {
                                  return detailData.fail_reason_1;
                                }
                                return parseFloat((item.cycle_life_1 || 0).toString()).toFixed(0);
                              };

                              const isSelected = selectedBarcode === item.barcode;

                              return (
                                <tr
                                  key={item.id}
                                  className={isSelected ? 'selected-row' : ''}
                                  // onClick={() => setSelectedBarcode(item.barcode)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <td className="barcode-cell" title={item.barcode}>{item.barcode}</td>
                                  <td className="cycle-life-cell">{getCycleLife1Display()}</td>
                                </tr>
                              );
                            })
                          : (
                              <tr>
                                <td colSpan={2} style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                                  {t('predictionTool.results.noDetailedData')}
                                </td>
                              </tr>
                            )
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 散点图或折线图展示 */}
                {detailData.brcode_data && detailData.brcode_data.length > 0 && (
                  (() => {
                    const hasModelResult = detailData.brcode_data.some(item => !!item.model_result);
                    const hasLegacyData = detailData.brcode_data.some(item => !!item.cycle_life_1_cycles_detail);

                    if (hasModelResult) {
                      return (
                        <div className="chart-section">
                          <div className="chart-container">
                            <CycleLifeLineChart
                              brcodeData={detailData.brcode_data}
                              // selectedBarcode={selectedBarcode}
                              // onBarcodeSelect={setSelectedBarcode}
                            />
                          </div>
                        </div>
                      );
                    } else if (hasLegacyData) {
                      return (
                        <div className="chart-section">
                          <div className="chart-container">
                            <CycleLifeScatterChart
                              brcodeData={detailData.brcode_data}
                              // selectedBarcode={selectedBarcode}
                              // onBarcodeSelect={setSelectedBarcode}
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
