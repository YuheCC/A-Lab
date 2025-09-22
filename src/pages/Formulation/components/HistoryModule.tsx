import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMDHistoryList, deleteMDHistory, MDHistoryItem } from '@/services/formulation/md';
import AnalysisDetailModal from './ResultsDisplay/AnalysisDetailModal';
import './HistoryModule.css';

interface FormulationResult {
  id: number;
  date: string;
  saltConfiguration: {
    cation: string;
    anions: string[];
    totalConcentration: number;
    fractionType: 'mole' | 'weight';
    anionFractions: number[];
  };
  solventConfiguration: string[];
  status: string;
}

interface HistoryModuleProps {
  onViewDetails: (result: FormulationResult) => void;
  onNewFormulation?: () => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ onViewDetails, onNewFormulation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | undefined>(undefined);
  const [historyData, setHistoryData] = useState<FormulationResult[]>([]);

  // 将MD历史记录转换为FormulationResult格式
  const convertMDHistoryToFormulationResult = (mdHistory: MDHistoryItem): FormulationResult => {
    return {
      id: mdHistory.id,
      date: new Date(mdHistory.created_at).toLocaleString('zh-CN'),
      saltConfiguration: {
        cation: mdHistory.cation_name,
        anions: mdHistory.anion_name_list,
        totalConcentration: mdHistory.cation_molality,
        fractionType: mdHistory.anion_fractions_type as 'mole' | 'weight',
        anionFractions: mdHistory.anion_fractions
      },
      solventConfiguration: mdHistory.solvent_smiles_list,
      status: mdHistory.status
    };
  };

  // 获取历史记录数据
  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMDHistoryList({ page: 1, page_size: 20 });

      if (response && response.data && response.data.data) {
        const formattedData = response.data.data.map(convertMDHistoryToFormulationResult);
        setHistoryData(formattedData);
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

  // 组件挂载时获取数据
  useEffect(() => {
    fetchHistoryData();
  }, []);

  // Format ion display
  const formatIonDisplay = (ionValue: string) => {
    const ionMap: { [key: string]: string } = {
      'Li+': 'Li⁺',
      'Na+': 'Na⁺',
      'Mg2+': 'Mg²⁺',
      'Zn2+': 'Zn²⁺',
      'BF4-': 'BF₄⁻',
      'PF6-': 'PF₆⁻',
      'FSI-': 'FSI⁻',
      'TFSI-': 'TFSI⁻'
    };
    return ionMap[ionValue] || ionValue;
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm(t('formulation.history.actions.deleteConfirm', 'Are you sure you want to delete this record?'))) {
      return;
    }

    try {
      const response = await deleteMDHistory(id);

      if (response && response.status < 400) {
        // 删除成功，刷新历史记录列表
        await fetchHistoryData();
      } else {
        setError('删除记录失败');
      }
    } catch (err) {
      console.error('Failed to delete MD history:', err);
      setError(err instanceof Error ? err.message : '删除记录失败');
    }
  };

  const handleViewDetails = (record: FormulationResult) => {
    setSelectedRecordId(record.id.toString());
    setIsDetailModalOpen(true);
    onViewDetails(record);
  };

  return (
    <div className="formulation-history-module">
      <div className="history-header">
        <div className="header-content">
          <h2>{t('formulation.history.title', 'Analysis Records')}</h2>
        </div>
        <button
          className="new-analysis-btn"
          onClick={onNewFormulation}
        >
          <span>+</span> {t('formulation.history.newAnalysis', 'New Analysis')}
        </button>
      </div>

      <div className="history-list">
        {loading ? (
          <div className="loading-state">
            <p>{t('formulation.history.loading.message', 'Loading...')}</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{t('formulation.history.loading.error', 'Error')}: {error}</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="no-results">
            <p>{t('formulation.history.noResults.message', 'No analysis records found.')}</p>
          </div>
        ) : (
          historyData.map((record) => (
            <div key={record.id} className="history-item">
              <div className="item-header">
                <div className="date-status">
                  <span className="date">{record.date}</span>
                </div>
                {record.status === 'success' && (
                  <div className="status-indicator">
                    <span className="status-dot" style={{
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#52c41a',
                      marginLeft: '8px'
                    }}></span>
                  </div>
                )}
              </div>

              <div className="item-content">
                <div className="salt-info">
                  <span className="salt-config">
                    {t('formulation.history.salt', 'Salt')}: {formatIonDisplay(record.saltConfiguration.cation)} + {record.saltConfiguration.anions.map(anion => formatIonDisplay(anion)).join(' + ')}
                  </span>
                </div>

                <div className="solvent-info">
                  <span className="solvent-config">
                    {t('formulation.history.solvent', 'Solvent')}: {record.solventConfiguration.join(', ')}
                  </span>
                </div>
              </div>

              <div className="item-actions">
                <button
                  className="view-details-btn"
                  onClick={() => handleViewDetails(record)}
                >
                  {t('formulation.history.actions.viewDetails', 'View Details')}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteRecord(record.id)}
                >
                  {t('formulation.history.actions.delete', 'Delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnalysisDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecordId(undefined);
        }}
        detailId={selectedRecordId}
      />
    </div>
  );
};

export default HistoryModule;