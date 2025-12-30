import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { deleteMDHistory, MDHistoryItem } from '@/services/formulation/md';
import { getHistoryList, isMockRecord } from './model';
import './index.less';
import { normalizeServerDate } from "@/utils/messageUtils";
import { formatIonDisplay } from './utils';
import IntroductionNew from './components/IntroductionNew';

interface FormulationTableProps {}

const FormulationNew: React.FC<FormulationTableProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<MDHistoryItem[]>([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);

  // 根据 URL query 参数初始化 activeTab
  const getInitialTab = (): 'introductionNew' | 'analysis' => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'analysis' || tabParam === 'introductionNew') ? tabParam : 'introductionNew';
  };

  const [activeTab, setActiveTab] = useState<'introductionNew' | 'analysis'>(getInitialTab());

  // 处理初始化时的 URL 参数，识别后删除 tab 参数
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (tabParam === 'analysis' || tabParam === 'introductionNew')) {
      // 删除 tab 参数，保持其他参数不变
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, []);

  // 获取历史记录数据
  const fetchHistoryData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getHistoryList({ page, page_size: pageSize });

      if (response && response.data && response.data.data) {
        setHistoryData(response.data.data);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error('Failed to fetch MD history:', err);
      setError(err instanceof Error ? err.message : t('formulation.history.loading.error', '获取历史记录失败'));
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData(currentPage);
  }, [currentPage]);

  // 格式化浓度显示
  const formatConcentration = (value: number) => {
    return `${value} mol/kg`;
  };

  // 格式化日期
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

  // 格式化状态
  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'completed': { text: t('formulation.status.completed', '已完成'), className: 'status-completed' },
      'success': { text: t('formulation.status.success', '已完成'), className: 'status-completed' },
      'running': { text: t('formulation.status.running', '运行中'), className: 'status-running' },
      'failed': { text: t('formulation.status.failed', '失败'), className: 'status-failed' },
      'pending': { text: t('formulation.status.pending', '等待中'), className: 'status-pending' }
    };
    return statusMap[status] || { text: status, className: 'status-unknown' };
  };

  // 处理删除记录
  const handleDeleteRecord = async (id: number | string) => {
    // 检查是否是mock数据，如果是则直接跳过
    const mockRecord = historyData.find(record => record.id === id);
    if (mockRecord && isMockRecord(mockRecord)) {
      return;
    }

    if (!confirm(t('formulation.history.actions.deleteConfirm', '确定要删除这条记录吗？'))) {
      return;
    }

    try {
      const response = await deleteMDHistory(Number(id));
      if (response && response.status < 400) {
        await fetchHistoryData(currentPage);
      } else {
        setError(t('formulation.history.actions.deleteFailed', '删除记录失败'));
      }
    } catch (err) {
      console.error('Failed to delete MD history:', err);
      setError(err instanceof Error ? err.message : t('formulation.history.actions.deleteFailed', '删除记录失败'));
    }
  };

  // 处理新建分析
  const handleNewAnalysis = () => {
    window.open('/formulate/create', '_blank');
  };

  // 处理查看详情
  const handleViewDetails = (record: MDHistoryItem) => {
    navigate(`/formulate/detail?id=${record.id}`);
  };

  // 处理tab切换
  const handleTabChange = (tab: 'introductionNew' | 'analysis') => {
    setActiveTab(tab);
  };

  return (
    <div className="formulation-new-container">
      <div className="formulation-action-section">
        <button className="new-analysis-button" onClick={handleNewAnalysis}>
          + {t('formulation.history.newAnalysis', 'New Analysis')}
        </button>
      </div>

      <div className="formulation-new-table-container">
        <div className="formulation-tabs-header">
          <div className="formulation-tabs">
            <button
              className={`formulation-tab ${activeTab === 'introductionNew' ? 'active' : ''}`}
              onClick={() => handleTabChange('introductionNew')}
            >
              {t('formulation.tabs.introduction', 'Introduction')}
            </button>
            <button
              className={`formulation-tab ${activeTab === 'analysis' ? 'active' : ''}`}
              onClick={() => handleTabChange('analysis')}
            >
              {t('formulation.tabs.records', 'Records')}
            </button>
          </div>
        </div>

        <div className="formulation-tab-content">
          {activeTab === 'introductionNew' && (
            <div className="formulation-tab-panel">
              <IntroductionNew />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="formulation-tab-panel">
              {loading ? (
                <div className="loading-state">
                  <p>{t('formulation.history.loading.message', 'Loading...')}</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <p>{t('formulation.history.loading.error', 'Error')}: {error}</p>
                </div>
              ) : (
                <div className="analysis-table-wrapper">
                  <table className="analysis-table">
                  <thead>
                    <tr>
                      <th>{t('formulation.list.columns.analysisId', 'Analysis ID')}</th>
                      <th>{t('formulation.list.columns.saltFraction', 'Salt (Fraction)')}</th>
                      <th>{t('formulation.list.columns.saltFractionType', 'Fraction Type (Salt)')}</th>
                      <th>{t('formulation.list.columns.solventFraction', 'Solvent (Fraction)')}</th>
                      <th>{t('formulation.list.columns.solventFractionType', 'Fraction Type (Solvent)')}</th>
                      <th>{t('formulation.list.columns.concentration', 'Concentration')}</th>
                      <th>{t('formulation.list.columns.created', 'Created')}</th>
                      <th>{t('formulation.list.columns.status', 'Status')}</th>
                      <th>{t('formulation.list.columns.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="no-data">
                          {t('formulation.history.noResults.message', 'No analysis records found.')}
                        </td>
                      </tr>
                    ) : (
                      historyData.map((record) => {
                        const statusInfo = formatStatus(record.status);
                        const isMock = isMockRecord(record);
                        return (
                          <tr key={record.id}>
                            <td className="analysis-id">
                              {isMock ? record.id : `AN-${String(record.id).padStart(3, '0')}`}
                            </td>
                            <td className="salt-info">
                              <div className="compound-list">
                                {formatIonDisplay(record.cation_name)}
                                {record.anion_name_list.map((anion, idx) => (
                                  <div key={idx} className="compound-item">
                                    {formatIonDisplay(anion)}({record.anion_fractions[idx]})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td>{record.anion_fractions_type === 'mole' ? t('formulation.fractionType.mole', 'Molar fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</td>
                            <td className="solvent-info">
                              <div className="compound-list">
                                {record.solvent_smiles_list.map((solvent, idx) => (
                                  <div key={idx} className="compound-item" title={solvent + ' (' + record.solvent_fractions[idx] + ')'}>
                                    {solvent}({record.solvent_fractions[idx]})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td>{record.solvent_fractions_type === 'mole' ? t('formulation.fractionType.mole', 'Molar fraction') : t('formulation.fractionType.weight', 'Weight fraction')}</td>
                            <td>{formatConcentration(record.cation_molality)}</td>
                            <td className="created-date">{formatDate(normalizeServerDate(record.created_at).toISOString())}</td>
                            <td>
                              <span className={`status-badge ${statusInfo.className}`}>
                                {statusInfo.text}
                              </span>
                            </td>
                            <td className="actions-cell">
                              {record.status === 'success' && (
                              <button
                                className="action-button view-button"
                                onClick={() => handleViewDetails(record)}
                              >
                                {t('formulation.history.actions.viewDetails', 'View Details')}
                              </button>
                              )}
                              {!isMock && (
                                <button
                                  className="action-button delete-button"
                                  onClick={() => handleDeleteRecord(record.id)}
                                >
                                  {t('formulation.history.actions.delete', 'Delete')}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormulationNew;