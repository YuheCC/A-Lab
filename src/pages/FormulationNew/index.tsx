import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMDHistoryList, deleteMDHistory, MDHistoryItem } from '@/services/formulation/md';
import './index.css';
import { normalizeServerDate } from "@/utils/messageUtils";

interface FormulationTableProps {}

const FormulationNew: React.FC<FormulationTableProps> = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<MDHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
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
      setError(err instanceof Error ? err.message : '获取历史记录失败');
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData(currentPage);
  }, [currentPage]);

  // 格式化离子显示
  const formatIonDisplay = (ionValue: string) => {
    const ionMap: { [key: string]: string } = {
      'Li+': 'Li⁺',
      'Na+': 'Na⁺',
      'Mg2+': 'Mg²⁺',
      'Zn2+': 'Zn²⁺',
      'BF4-': 'BF₄⁻',
      'PF6-': 'PF₆⁻',
      'FSI-': 'FSI⁻',
      'TFSI-': 'TFSI⁻',
      'LiPF6': 'LiPF₆',
      'LiBF4': 'LiBF₄',
      'LiTFSI': 'LiTFSI'
    };
    return ionMap[ionValue] || ionValue;
  };

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
      'completed': { text: 'Completed', className: 'status-completed' },
      'success': { text: 'Completed', className: 'status-completed' },
      'running': { text: 'Running', className: 'status-running' },
      'failed': { text: 'Failed', className: 'status-failed' },
      'pending': { text: 'Pending', className: 'status-pending' }
    };
    return statusMap[status] || { text: status, className: 'status-unknown' };
  };

  // 处理删除记录
  const handleDeleteRecord = async (id: number) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return;
    }

    try {
      const response = await deleteMDHistory(id);
      if (response && response.status < 400) {
        await fetchHistoryData(currentPage);
      } else {
        setError('删除记录失败');
      }
    } catch (err) {
      console.error('Failed to delete MD history:', err);
      setError(err instanceof Error ? err.message : '删除记录失败');
    }
  };

  // 处理新建分析
  const handleNewAnalysis = () => {
    console.log('Create new analysis');
  };

  // 处理查看详情
  const handleViewDetails = (record: MDHistoryItem) => {
    console.log('View details for:', record.id);
  };

  return (
    <div className="formulation-new-container">
      <div className="formulation-header">
        <h1 className="formulation-title">Salt & Solvent Configuration</h1>
        <span className="formulation-subtitle">Configure and customize your electrolytes</span>
        <button className="new-analysis-button" onClick={handleNewAnalysis}>
          + New Analysis
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        ) : (
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Analysis ID</th>
                <th>Salt (Fraction)</th>
                <th>Fraction Type (Salt)</th>
                <th>Solvent (Fraction)</th>
                <th>Fraction Type (Solvent)</th>
                <th>Concentration</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="no-data">
                    No analysis records found.
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
                      <td>{record.anion_fractions_type === 'mole' ? 'Molar fraction' : 'Weight fraction'}</td>
                      <td className="solvent-info">
                        <div className="compound-list">
                          {record.solvent_smiles_list.map((solvent, idx) => (
                            <div key={idx} className="compound-item">
                              {solvent}({record.solvent_fractions[idx]})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{record.solvent_fractions_type === 'mole' ? 'Molar fraction' : 'Weight fraction'}</td>
                      <td>{formatConcentration(record.cation_molality)}</td>
                      <td className="created-date">{formatDate(normalizeServerDate(record.created_at).toISOString())}</td>
                      <td>
                        <span className={`status-badge ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="action-button view-button"
                          onClick={() => handleViewDetails(record)}
                        >
                          查看
                        </button>
                        <button
                          className="action-button delete-button"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          删除
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