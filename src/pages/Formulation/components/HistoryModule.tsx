import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnalysisDetailModal from './ResultsDisplay/AnalysisDetailModal';
import './HistoryModule.css';

interface FormulationResult {
  id: string;
  date: string;
  saltConfiguration: {
    cation: string;
    anion: string;
    totalConcentration: number;
    fractionType: 'mole' | 'weight';
    anionFraction: number;
  };
  solventConfiguration: string;
}

interface HistoryModuleProps {
  onViewDetails: (result: FormulationResult) => void;
  onNewFormulation?: () => void;
}

const HistoryModule: React.FC<HistoryModuleProps> = ({ onViewDetails, onNewFormulation }) => {
  const { t } = useTranslation();
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FormulationResult | null>(null);

  // Mock data for demonstration
  const [historyData] = useState<FormulationResult[]>([
    {
      id: '1',
      date: '2025/1/15 14:30:25',
      saltConfiguration: {
        cation: 'Li+',
        anion: 'BF4-',
        totalConcentration: 1.0,
        fractionType: 'mole',
        anionFraction: 0.5
      },
      solventConfiguration: 'CCO'
    },
    {
      id: '2',
      date: '2025/1/14 16:45:12',
      saltConfiguration: {
        cation: 'Li+',
        anion: 'TFSI-',
        totalConcentration: 1.0,
        fractionType: 'mole',
        anionFraction: 0.5
      },
      solventConfiguration: 'CCOCC'
    },
    {
      id: '3',
      date: '2025/1/13 09:15:33',
      saltConfiguration: {
        cation: 'Li+',
        anion: 'BF4-',
        totalConcentration: 1.0,
        fractionType: 'mole',
        anionFraction: 0.5
      },
      solventConfiguration: 'CCO, CCOCC'
    }
  ]);

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

  const handleDeleteRecord = async (id: string) => {
    if (!confirm(t('formulation.history.actions.deleteConfirm', 'Are you sure you want to delete this record?'))) {
      return;
    }
    // TODO: Implement delete functionality
    console.log('Delete record:', id);
  };

  const handleViewDetails = (record: FormulationResult) => {
    setSelectedRecord(record);
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
              </div>

              <div className="item-content">
                <div className="salt-info">
                  <span className="salt-config">
                    {t('formulation.history.salt', 'Salt')}: {formatIonDisplay(record.saltConfiguration.cation)} + {formatIonDisplay(record.saltConfiguration.anion)}
                  </span>
                </div>

                <div className="solvent-info">
                  <span className="solvent-config">
                    {t('formulation.history.solvent', 'Solvent')}: {record.solventConfiguration}
                  </span>
                </div>

                <div className="config-summary">
                  <div className="config-details">
                    <span className="concentration">
                      {record.saltConfiguration.totalConcentration} {t('formulation.history.unit.molPerKg', 'mol/kg')}
                    </span>
                    <span className="fraction">
                      {formatIonDisplay(record.saltConfiguration.anion)} ({record.saltConfiguration.anionFraction})
                    </span>
                  </div>
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
          setSelectedRecord(null);
        }}
      />
    </div>
  );
};

export default HistoryModule;