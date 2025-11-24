import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Activity } from 'lucide-react';
import { getHistoryList, deleteHistory } from './model';
import { normalizeServerDate } from '@/utils/messageUtils';
import Introduction from '@/components/Introduction';
import Pagination from '@/components/Pagination';
import './index.less';

interface HistoryRecord {
  id: string;
  smiles: string;
  date: string;
  batterySystemId: number;
  temp25Count: number;
  temp45Count: number;
  isMock?: boolean;
  rawData?: any;
}

interface DesignPageProps {}

const DesignPage: React.FC<DesignPageProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const getInitialTab = (): 'introduction' | 'records' | 'models' => {
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

  const transformApiDataToRecord = (apiData: any): HistoryRecord => {
    return {
      id: apiData.id.toString(),
      smiles: apiData.smiles || '',
      date: new Date(normalizeServerDate(apiData.created_at)).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      batterySystemId: apiData.battery_system_id,
      temp25Count: apiData.temperature_25_label_0_count || 0,
      temp45Count: apiData.temperature_45_label_0_count || 0,
      isMock: apiData.isMock || false,
      rawData: apiData
    };
  };

  const fetchHistoryData = async (page: number = currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryList({ page, page_size: pageSize });
      const transformedData = response.data.data.map(transformApiDataToRecord);
      setHistoryData(transformedData);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Failed to fetch design history:', err);
      setError(err instanceof Error ? err.message : t('design.history.loading.error', 'Failed to load history'));
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

  const handleNewDesign = () => {
    window.open('/design/create', '_blank');
  };

  const handleTrain = () => {
    navigate('/design/train');
  };

  const handleViewDetails = (id: string) => {
    navigate(`/design/record?id=${id}`);
  };

  const handleDeleteRecord = async (id: string) => {
    const record = historyData.find(h => h.id === id);
    if (record && record.isMock) {
      alert(t('design.history.cannotDeleteDemo', 'Cannot delete demo records'));
      return;
    }

    if (!confirm(t('design.history.deleteConfirm', 'Are you sure you want to delete this record?'))) {
      return;
    }

    try {
      await deleteHistory(parseInt(id));
      await fetchHistoryData(currentPage);
    } catch (err) {
      console.error('Failed to delete record:', err);
      setError(err instanceof Error ? err.message : t('design.history.deleteFailed', 'Failed to delete record'));
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: 'introduction' | 'records' | 'models') => {
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
    <div className="design-tool-container">
      <div className="design-header">
        <h1 className="design-title">{t('performance.title')}</h1>
        <p className="design-subtitle">
          {t('performance.subtitle')}
        </p>
      </div>

      <div className="design-action-section">
        <button className="new-design-button" onClick={handleNewDesign}>
          + {t('design.history.newDesign', 'New Design')}
        </button>
        <button className="train-button" onClick={handleTrain}>
          <Activity size={16} />
          {t('design.history.train', 'Train')}
        </button>
      </div>

      <div className="design-tool-table-container">
        <div className="design-tabs-header">
          <div className="design-tabs">
            <button
              className={`design-tab ${activeTab === 'introduction' ? 'active' : ''}`}
              onClick={() => handleTabChange('introduction')}
            >
              {t('design.tabs.introduction', 'Introduction')}
            </button>
            <button
              className={`design-tab ${activeTab === 'records' ? 'active' : ''}`}
              onClick={() => handleTabChange('records')}
            >
              {t('design.tabs.records', 'Records')}
            </button>
            <button
              className={`design-tab ${activeTab === 'models' ? 'active' : ''}`}
              onClick={() => handleTabChange('models')}
            >
              {t('design.tabs.models', 'Models')}
            </button>
          </div>
        </div>

        <div className="design-tab-content">
          {activeTab === 'introduction' && (
            <div className="design-tab-panel">
              <Introduction
                i18nKey="design.introduction.comingSoon"
                defaultText="Introduction content coming soon..."
              />
            </div>
          )}

          {activeTab === 'records' && (
            <div className="design-tab-panel">
              {loading ? (
                <div className="loading-state">
                  <p>{t('design.history.loadingText', 'Loading...')}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t('design.history.error', 'Error')}: {error}</p>
                </div>
              ) : (
                <>
                  <div className="records-table-wrapper">
                    <table className="records-table">
                      <thead>
                        <tr>
                          <th>{t('design.list.columns.recordId', 'Record ID')}</th>
                          <th>{t('design.list.columns.smiles', 'SMILES')}</th>
                          <th>{t('design.list.columns.temp25', '25°C Positive')}</th>
                          <th>{t('design.list.columns.temp45', '45°C Positive')}</th>
                          <th>{t('design.list.columns.created', 'Created')}</th>
                          <th>{t('design.list.columns.actions', 'Actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="no-data">
                              {t('design.history.noResults', 'No design records found.')}
                            </td>
                          </tr>
                        ) : (
                          historyData.map((record) => (
                            <tr key={record.id}>
                              <td className="record-id">DS-{String(record.id).padStart(3, '0')}</td>
                              <td className="smiles-cell">{record.smiles}</td>
                              <td>{record.temp25Count}</td>
                              <td>{record.temp45Count}</td>
                              <td className="created-date">{formatDate(record.date)}</td>
                              <td className="actions-cell">
                                <button
                                  className="action-button view-button"
                                  onClick={() => handleViewDetails(record.id)}
                                >
                                  {t('design.history.actions.viewDetails', 'View Details')}
                                </button>
                                {!record.isMock && (
                                  <button
                                    className="action-button delete-button"
                                    onClick={() => handleDeleteRecord(record.id)}
                                  >
                                    {t('design.history.actions.delete', 'Delete')}
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
            <div className="design-tab-panel">
              {/* Temporary list to access the model detail page */}
              <div className="records-table-wrapper">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>{t('design.models.columns.modelId', 'Model ID')}</th>
                      <th>{t('design.models.columns.modelName', 'Model Name')}</th>
                      <th>{t('design.models.columns.status', 'Status')}</th>
                      <th>{t('design.models.columns.created', 'Created')}</th>
                      <th>{t('design.models.columns.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="record-id">DM-2024-01</td>
                      <td className="file-name">Electrolyte Design Model v1.0</td>
                      <td><span style={{backgroundColor: '#dcfce7', color: '#008236', padding: '2px 8px', borderRadius: '4px', fontSize: '14px'}}>{t('design.models.statusOnline', 'Online')}</span></td>
                      <td className="created-date">2024/01/15</td>
                      <td className="actions-cell">
                        <button
                          className="action-button view-button"
                          onClick={() => navigate('/design/model-detail?id=DM-2024-01')}
                        >
                          {t('design.history.actions.viewDetails', 'View Details')}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignPage;
