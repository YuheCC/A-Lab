import React from 'react';
import { useTranslation } from 'react-i18next';
import './AnalysisDetailModal.css';

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const saltSummary = [
    { label: t('formulation.detail.selected', 'Selected'), value: 'LiTFSI' },
    { label: t('formulation.detail.weightConcentration', 'Weight concentration'), value: t('formulation.fractionType.mole', 'Mole fraction') + ':' },
    { label: t('formulation.detail.fractions', 'Fractions:'), value: 'BF4-: 1.00' },
    { label: t('formulation.detail.fractionType', 'Fraction type:'), value: 'TFSI-: 1.00' },
    { label: t('formulation.detail.totalFraction', 'Total fraction:'), value: '1.00' }
  ];

  const solventSummary = [
    { label: t('formulation.detail.solvent', 'Solvent:'), value: 'CCO: 1.00' },
    { label: t('formulation.detail.fractionType', 'Fraction type:'), value: t('formulation.fractionType.weight', 'Weight fraction') },
    { label: t('formulation.detail.totalFraction', 'Total fraction:'), value: '1.00' }
  ];

  const systemProperties = [
    { property: t('formulation.detail.density', 'Density (g/cm³)'), value: '1.2000' },
    { property: t('formulation.detail.viscosity', 'Viscosity (cP)'), value: '2.6600' },
    { property: t('formulation.detail.conductivity', 'Conductivity (mS/cm)'), value: '5.7500' }
  ];

  const clusterAnalysis = [
    { size: 0, category: t('formulation.detail.SSIP', 'SSIP'), fraction: '20.0%' },
    { size: 1, category: t('formulation.detail.CIP', 'CIP'), fraction: '40.0%' },
    { size: 2, category: t('formulation.detail.AGG', 'AGG'), fraction: '10.0%' },
    { size: 3, category: t('formulation.detail.AGG', 'AGG'), fraction: '5.0%' },
    { size: 4, category: t('formulation.detail.AGG', 'AGG'), fraction: '25.0%' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SSIP': return '#fef2f2';
      case 'CIP': return '#fff7ed';
      case 'AGG': return '#f0fdf4';
      default: return '#f9fafb';
    }
  };

  const getCategoryTextColor = (category: string) => {
    switch (category) {
      case 'SSIP': return '#dc2626';
      case 'CIP': return '#ea580c';
      case 'AGG': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const handleDownloadJSON = () => {
    const data = {
      saltSummary,
      solventSummary,
      systemProperties,
      clusterAnalysis,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-details.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('formulation.detail.title', 'Analysis Results')}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Salt & Solvent Configuration */}
          <div className="configuration-section">
            <h3>{t('formulation.detail.saltSolventConfig', 'Salt & Solvent Configuration')}</h3>

            <div className="config-grid">
              <div className="config-box">
                <h4>{t('formulation.detail.saltSummary', 'Salt Summary')}</h4>
                <div className="summary-content">
                  {saltSummary.map((item, index) => (
                    <div key={index} className="summary-row">
                      <span className="summary-label">{item.label}</span>
                      <span className="summary-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="config-box">
                <h4>{t('formulation.detail.solventSummary', 'Solvent Summary')}</h4>
                <div className="summary-content">
                  {solventSummary.map((item, index) => (
                    <div key={index} className="summary-row">
                      <span className="summary-label">{item.label}</span>
                      <span className="summary-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="results-section">
            <h3>{t('formulation.detail.analysisResults', 'Analysis Results')}</h3>

            <div className="results-grid">
              <div className="result-box">
                <h4>{t('formulation.detail.systemProperties', 'System Properties')}</h4>
                <div className="properties-list">
                  {systemProperties.map((prop, index) => (
                    <div key={index} className="property-item">
                      <span className="property-name">{prop.property}</span>
                      <span className="property-value">{prop.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="result-box">
                <h4>{t('formulation.detail.clusterAnalysis', 'Cluster Analysis')}</h4>
                <div className="cluster-table-modal">
                  <div className="table-header-modal">
                    <span>{t('formulation.detail.size', 'Size')}</span>
                    <span>{t('formulation.detail.category', 'Category')}</span>
                    <span>{t('formulation.detail.fraction', 'Fraction')}</span>
                  </div>
                  {clusterAnalysis.map((item, index) => (
                    <div key={index} className="table-row-modal">
                      <span>{item.size}</span>
                      <span
                        className="category-tag-modal"
                        style={{
                          backgroundColor: getCategoryColor(item.category),
                          color: getCategoryTextColor(item.category)
                        }}
                      >
                        {item.category}
                      </span>
                      <span>{item.fraction}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Charts */}
          <div className="charts-section">
            <h3>{t('formulation.detail.analysisCharts', 'Analysis Charts')}</h3>

            <div className="charts-grid">
              <div className="chart-box">
                <h4>{t('formulation.detail.radialDistribution', 'Radial Distribution Function and Coordination Number')}</h4>
                <div className="chart-placeholder-modal">
                  <div className="chart-icon">📊</div>
                  <p>{t('formulation.detail.chartPlaceholder', 'Chart placeholder')}</p>
                  <p className="chart-subtitle">{t('formulation.detail.radialDistributionSubtitle', 'Radial Distribution Function and Coordination Number')}</p>
                </div>
              </div>

              <div className="chart-box">
                <h4>{t('formulation.detail.meanSquareDisplacement', 'Mean Square Displacement')}</h4>
                <div className="chart-placeholder-modal">
                  <div className="chart-icon">📈</div>
                  <p>{t('formulation.detail.chartPlaceholder', 'Chart placeholder')}</p>
                  <p className="chart-subtitle">{t('formulation.detail.meanSquareDisplacementSubtitle', 'Mean Square Displacement')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis File */}
          <div className="file-section-modal">
            <h3>{t('formulation.detail.analysisFile', 'Analysis File')}</h3>
            <div className="file-content-modal">
              <div className="file-text-modal">
                <p>{t('formulation.detail.downloadDescription', 'Download the complete analysis results in JSON format')}</p>
                <p className="file-details-modal">{t('formulation.detail.fileContains', 'File contains configuration details, analysis parameters, and computed results')}</p>
              </div>
              <button
                className="download-btn-modal"
                onClick={handleDownloadJSON}
              >
                {t('formulation.detail.downloadJSON', 'Download JSON')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;