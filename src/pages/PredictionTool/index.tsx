import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import { getHistoryList, deleteHistory, getModelList, isMockModel } from './model';
import { normalizeServerDate } from '@/utils/messageUtils';
import Introduction from './components/Introduction';
import Pagination from '@/components/Pagination';
import type { ModelListItem } from '@/services/model/training';
import './index.less';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
  avgCycleLife1: number;
  avgCycleLife2: number;
  model?: string;
  isMock?: boolean;
  rawData?: any;
}

interface PredictionToolProps {}

const PredictionTool: React.FC<PredictionToolProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<FileRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // Models state
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [modelsData, setModelsData] = useState<ModelListItem[]>([]);
  const [modelsCurrentPage, setModelsCurrentPage] = useState(1);
  const [modelsPageSize] = useState(20);
  const [modelsTotal, setModelsTotal] = useState(0);

  const getInitialTab = (): 'introduction' | 'records' | 'models' => {
    // Check if navigation state has activeTab (from train page)
    const stateTab = (location.state as any)?.activeTab;
    if (stateTab === 'models') return 'models';

    const tabParam = searchParams.get('tab');
    return (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models') ? tabParam as 'introduction' | 'records' | 'models' : 'introduction';
  };

  const [activeTab, setActiveTab] = useState<'introduction' | 'records' | 'models'>(getInitialTab());

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'records' || tabParam === 'introduction' || tabParam === 'models')) {
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
      avgCirculation: avgCycleLife > 0 ? `${avgCycleLife.toFixed(0)}` : t('predictionTool.results.unknown'),
      avgCycleLife1: avgCycleLife1,
      avgCycleLife2: avgCycleLife2,
      model: apiData.model || 'Li-ion Cycle Predictor v2.1',
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

  const fetchModelsData = async (page: number = modelsCurrentPage) => {
    setModelsLoading(true);
    setModelsError(null);

    try {
      const response = await getModelList({ page, page_size: modelsPageSize });
      setModelsData(response.data);
      setModelsTotal(response.total);
    } catch (err) {
      console.error('Failed to fetch models list:', err);
      setModelsError(err instanceof Error ? err.message : t('predictionTool.models.loading.error', 'Failed to load models'));
      setModelsData([]);
      setModelsTotal(0);
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'records') {
      fetchHistoryData(currentPage);
    } else if (activeTab === 'models') {
      fetchModelsData(modelsCurrentPage);
    }
  }, [activeTab, currentPage, modelsCurrentPage]);

  const handleNewPrediction = () => {
    window.open('/predict/create', '_blank');
  };

  const handleTrain = () => {
    navigate('/predict/train');
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

  const handleModelsPageChange = (page: number) => {
    setModelsCurrentPage(page);
  };

  const handleTabChange = (tab: 'introduction' | 'records' | 'models') => {
    setActiveTab(tab);
  };

  const handleViewModelDetail = (modelId: number | string) => {
    navigate(`/prediction-tool/model-detail?id=${modelId}`);
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return { text: t('predictionTool.models.statusOnline', 'Online'), color: '#dcfce7', textColor: '#008236' };
      case 'trained':
        return { text: t('predictionTool.models.statusTrained', 'Trained'), color: '#dbeafe', textColor: '#1e40af' };
      case 'training':
        return { text: t('predictionTool.models.statusTraining', 'Training'), color: '#fef3c7', textColor: '#92400e' };
      default:
        return { text: status, color: '#f3f4f6', textColor: '#374151' };
    }
  };

  return (
    <div className="prediction-tool-container">
      <div className="prediction-header">
        <h1 className="prediction-title">{t('predictionTool.title')}</h1>
        <p className="prediction-subtitle">
          {t('predictionTool.subtitle')}
        </p>
      </div>

      <div className="prediction-action-section">
        <button className="new-prediction-button" onClick={handleNewPrediction}>
          + {t('predictionTool.history.newPrediction', 'New Prediction')}
        </button>
        <button className="train-button" onClick={handleTrain}>
          <Activity size={16} />
          {t('predictionTool.history.train', 'Train')}
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
            <button
              className={`prediction-tab ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => handleTabChange('models')}
            >
              {t('predictionTool.tabs.models', 'Models')}
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
                  <p>{t('predictionTool.history.loadingText', 'Loading...')}</p>
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
                          <th>{t('predictionTool.list.columns.model', 'Model')}</th>
                          <th>{t('predictionTool.list.columns.created', 'Created')}</th>
                          <th>{t('predictionTool.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="no-data">
                              {t('predictionTool.history.noResults', 'No prediction records found.')}
                            </td>
                          </tr>
                        ) : (
                          historyData.map((record) => (
                            <tr key={record.id}>
                              <td className="record-id">PR-{String(record.id).padStart(3, '0')}</td>
                              <td className="file-name">{record.name}</td>
                              <td>{record.batteryCount}</td>
                              <td>{record.avgCirculation} {t('predictionTool.results.cycleUnit')}</td>
                              <td>{record.model}</td>
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

          {activeTab === 'models' && (
            <div className="prediction-tab-panel">
              {modelsLoading ? (
                <div className="loading-state">
                  <p>{t('predictionTool.models.loadingText', 'Loading models...')}</p>
                </div>
              ) : modelsError ? (
                <div className="error-state">
                  <p>{t('predictionTool.models.error', 'Error')}: {modelsError}</p>
                </div>
              ) : (
                <>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('predictionTool.models.columns.modelId', 'Model ID')}</th>
                          <th>{t('predictionTool.models.columns.modelName', 'Model Name')}</th>
                          <th>{t('predictionTool.models.columns.baseModel', 'Base Model')}</th>
                          <th>{t('predictionTool.models.columns.status', 'Status')}</th>
                          <th>{t('predictionTool.models.columns.created', 'Created')}</th>
                          <th>{t('predictionTool.models.columns.createdBy', 'Created By')}</th>
                          <th>{t('predictionTool.models.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelsData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="no-data">
                              {t('predictionTool.models.noResults', 'No models found.')}
                            </td>
                          </tr>
                        ) : (
                          modelsData.map((model) => {
                            const statusInfo = getStatusLabel(model.status);
                            return (
                              <tr key={model.id}>
                                <td className="record-id">M-{String(model.id).padStart(6, '0')}</td>
                                <td className="file-name">{model.model_name}</td>
                                <td>{model.base_model_name}</td>
                                <td>
                                  <span
                                    style={{
                                      backgroundColor: statusInfo.color,
                                      color: statusInfo.textColor,
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '14px'
                                    }}
                                  >
                                    {statusInfo.text}
                                  </span>
                                </td>
                                <td className="created-date">{formatDate(model.created_at)}</td>
                                <td>{model.created_by}</td>
                                <td className="actions-cell">
                                  <button
                                    className="action-button view-button"
                                    onClick={() => handleViewModelDetail(model.id)}
                                  >
                                    {t('predictionTool.models.actions.viewDetails', 'View Details')}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    current={modelsCurrentPage}
                    total={modelsTotal}
                    pageSize={modelsPageSize}
                    onChange={handleModelsPageChange}
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
