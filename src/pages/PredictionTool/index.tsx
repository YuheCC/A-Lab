import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { getHistoryList, deleteHistory } from './model';
import { normalizeServerDate } from '@/utils/messageUtils';
import Introduction from './components/Introduction';
import Pagination from './components/Pagination';
import './index.less';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
  avgCycleLife1: number;
  avgCycleLife2: number;
  isMock?: boolean;
  rawData?: any;
}

interface PredictionToolProps {}

const PredictionTool: React.FC<PredictionToolProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<FileRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const getInitialTab = (): 'introduction' | 'records' => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'records' || tabParam === 'introduction') ? tabParam : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<'introduction' | 'records'>(getInitialTab());

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'records' || tabParam === 'introduction')) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, []);

  const transformApiDataToFileRecord = (apiData: any): FileRecord => {
    const avgCycleLife1 = apiData.avg_cycle_life_1 || 0;
    const avgCycleLife2 = apiData.avg_cycle_life_2 || 0;
    const avgCycleLife = avgCycleLife1 > 0 ? avgCycleLife1 : avgCycleLife2;

    return {
      id: apiData.id.toString(),
      name: apiData.file_name,
      date: new Date(normalizeServerDate(apiData.created_at)).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      batteryCount: apiData.barcode_count,
      avgCirculation: avgCycleLife > 0 ? `${avgCycleLife.toFixed(1)}${t('predictionTool.results.cycleUnit')}` : t('predictionTool.results.unknown'),
      avgCycleLife1: avgCycleLife1,
      avgCycleLife2: avgCycleLife2,
      isMock: apiData.isMock || false,
      rawData: apiData
    };
  };

  const fetchHistoryData = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryList({ page, page_size: pageSize });
      const transformedData = response.data.map(transformApiDataToFileRecord);
      setHistoryData(transformedData);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch prediction history:', err);
      setError(err instanceof Error ? err.message : t('predictionTool.history.loading.error', '获取历史记录失败'));
      setHistoryData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'records') {
      fetchHistoryData(currentPage);
    }
  }, [activeTab, currentPage]);

  const handleNewPrediction = () => {
    window.open('/predict/create', '_blank');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/predict/detail?id=${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    const record = historyData.find(h => h.id === id);
    if (record && record.isMock) {
      alert(t('predictionTool.history.cannotDeleteDemo', 'Cannot delete demo records'));
      return;
    }

    if (!confirm(t('predictionTool.history.deleteConfirm', '确定要删除这条记录吗？'))) {
      return;
    }

    try {
      await deleteHistory({ id: parseInt(id) });
      // 删除后重新获取当前页数据
      await fetchHistoryData(currentPage);
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError(err instanceof Error ? err.message : t('predictionTool.history.deleteFailed', '删除记录失败'));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: 'introduction' | 'records') => {
    setActiveTab(tab);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="prediction-tool-container">
      <div className="prediction-action-section">
        <button className="new-prediction-button" onClick={handleNewPrediction}>
          + {t('predictionTool.history.newPrediction', 'New Prediction')}
        </button>
      </div>

      <div className="prediction-tool-table-container">
        <div className="prediction-tabs-header">
          <div className="prediction-tabs">
            <button
              className={`prediction-tab ${activeTab === 'introduction' ? 'active' : ''}`}
              onClick={() => handleTabChange('introduction')}
            >
              {t('predictionTool.tabs.introduction', 'Introduction')}
            </button>
            <button
              className={`prediction-tab ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => handleTabChange('records')}
            >
              {t('predictionTool.tabs.records', 'Records')}
            </button>
          </div>
        </div>

        <div className="prediction-tab-content">
          {activeTab === 'introduction' && (
            <div className="prediction-tab-panel">
              <Introduction />
            </div>
          )}

          {activeTab === 'records' && (
            <div className="prediction-tab-panel">
              {loading ? (
                <div className="loading-state">
                  <p>{t('predictionTool.history.loading', 'Loading...')}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t('predictionTool.history.error', 'Error')}: {error}</p>
                </div>
              ) : (
                <>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('predictionTool.list.columns.recordId', 'Record ID')}</th>
                          <th>{t('predictionTool.list.columns.fileName', 'File Name')}</th>
                          <th>{t('predictionTool.list.columns.batteryCount', 'Battery Count')}</th>
                          <th>{t('predictionTool.list.columns.avgCycleLife', 'Avg Cycle Life')}</th>
                          <th>{t('predictionTool.list.columns.created', 'Created')}</th>
                          <th>{t('predictionTool.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="no-data">
                              {t('predictionTool.history.noResults', 'No prediction records found.')}
                            </td>
                          </tr>
                        ) : (
                          historyData.map((record) => (
                            <tr key={record.id}>
                              <td className="record-id">PR-{String(record.id).padStart(3, '0')}</td>
                              <td className="file-name">{record.name}</td>
                              <td>{record.batteryCount}</td>
                              <td>{record.avgCirculation}</td>
                              <td className="created-date">{formatDate(record.date)}</td>
                              <td className="actions-cell">
                                <button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  {t('predictionTool.history.actions.viewDetails', 'View Details')}
                                </button>
                                {!record.isMock && (
                                  <button
                                    className="action-button delete-button"
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    {t('predictionTool.history.actions.delete', 'Delete')}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionTool;
