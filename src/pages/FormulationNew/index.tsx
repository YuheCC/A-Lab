import React, { useState, useEffect } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { getMDHistoryList, deleteMDHistory, MDHistoryItem } from '@/services/formulation/md';
import './index.css';
import { normalizeServerDate } from "@/utils/messageUtils";
import { formatIonDisplay } from './utils';
import GuideTooltip from './components/GuideTooltip';

interface FormulationTableProps {}

const FormulationNew: React.FC<FormulationTableProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<MDHistoryItem[]>([]);
  const [currentPage] = useState(1);
  const [pageSize] = useState(20);

  // 获取历史记录数据
  const fetchHistoryData = async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMDHistoryList({ page, page_size: pageSize });

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
  const handleDeleteRecord = async (id: number) => {
    if (!confirm(t('formulation.history.actions.deleteConfirm', '确定要删除这条记录吗？'))) {
      return;
    }

    try {
      const response = await deleteMDHistory(id);
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
    navigate('/formulation/create');
  };

  // 处理查看详情
  const handleViewDetails = (record: MDHistoryItem) => {
    navigate(`/formulation/detail?id=${record.id}`);
  };

  return (
    <div className="formulation-new-container">
      <div className="formulation-header">
        <div className="formulation-title-wrapper">
          <h1 className="formulation-title">
            {t('formulation.title', 'Salt & Solvent Configuration')}
          </h1>
          <GuideTooltip
            storageKey="formulation-new-guide-shown"
            content={
              <div>
                <p>{t('formulation.guide.content.intro', '此页面用于配置和管理电解质配方。')}</p>
                <ul>
                  <li>{t('formulation.guide.content.step1', '点击"New Analysis"创建新的分析')}</li>
                  <li>{t('formulation.guide.content.step2', '配置盐和溶剂的成分及比例')}</li>
                  <li>{t('formulation.guide.content.step3', '设置浓度参数')}</li>
                  <li>{t('formulation.guide.content.step4', '查看历史记录和分析结果')}</li>
                </ul>
                <p>{t('formulation.guide.content.note', '完成配置后，系统将自动进行分子动力学模拟计算。')}</p>
              </div>
            }
          />
        </div>
        <span className="formulation-subtitle">{t('formulation.subtitle', 'Configure and customize your electrolytes')}</span>
      </div>

      <div className="formulation-new-table-container">
        <button className="new-analysis-button" onClick={handleNewAnalysis}>
          + {t('formulation.history.newAnalysis', 'New Analysis')}
        </button>
        {loading ? (
          <div className="loading-state">
            <p>{t('formulation.history.loading.message', 'Loading...')}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{t('formulation.history.loading.error', 'Error')}: {error}</p>
          </div>
        ) : (
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
                  return (
                    <tr key={record.id}>
                      <td className="analysis-id">AN-{String(record.id).padStart(3, '0')}</td>
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
                            <div key={idx} className="compound-item">
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
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          {t('formulation.history.actions.delete', 'Delete')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FormulationNew;