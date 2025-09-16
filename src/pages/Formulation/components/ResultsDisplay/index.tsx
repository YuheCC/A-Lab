import React from 'react';
import { useTranslation } from 'react-i18next';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  onNewAnalysis: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ onNewAnalysis }) => {
  const { t } = useTranslation();

  const systemProperties = [
    { property: t('formulation.results.density', 'Density (g/cm³)'), value: '1.2000' },
    { property: t('formulation.results.viscosity', 'Viscosity (cP)'), value: '2.6600' },
    { property: t('formulation.results.conductivity', 'Conductivity (mS/cm)'), value: '5.7600' }
  ];

  const clusterAnalysis = [
    { size: 0, category: t('formulation.results.SSIP', 'SSIP'), fraction: '20.0%' },
    { size: 1, category: t('formulation.results.CIP', 'CIP'), fraction: '40.0%' },
    { size: 2, category: t('formulation.results.AGG', 'AGG'), fraction: '10.0%' },
    { size: 3, category: t('formulation.results.AGG', 'AGG'), fraction: '5.0%' },
    { size: 4, category: t('formulation.results.AGG', 'AGG'), fraction: '25.0%' }
  ];

  const handleDownloadJSON = () => {
    const data = {
      systemProperties,
      clusterAnalysis,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis-results.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="results-display">
      <div className="results-content">
        <div className="results-section">
          <h2>{t('formulation.results.analysisResults', 'Analysis Results')}</h2>

            <div className="system-properties">
              <h3>{t('formulation.results.systemProperties', 'System Properties')}</h3>
              <div className="properties-table">
                {systemProperties.map((prop, index) => (
                  <div key={index} className="property-row">
                    <span className="property-name">{prop.property}</span>
                    <span className="property-value">{prop.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cluster-analysis">
              <h3>{t('formulation.results.clusterAnalysis', 'Cluster Analysis')}</h3>
              <div className="cluster-table">
                <div className="table-header">
                  <span>{t('formulation.results.size', 'Size')}</span>
                  <span>{t('formulation.results.category', 'Category')}</span>
                  <span>{t('formulation.results.fraction', 'Fraction')}</span>
                </div>
                {clusterAnalysis.map((item, index) => (
                  <div key={index} className="table-row">
                    <span>{item.size}</span>
                    <span
                      className="category-tag"
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

            <div className="analysis-charts">
              <h3>{t('formulation.results.analysisCharts', 'Analysis Charts')}</h3>

              <div className="chart-section">
                <h4>{t('formulation.results.radialDistribution', 'Radial Distribution Function and Coordination Number')}</h4>
                <div className="chart-placeholder">
                  <div className="chart-icon">📊</div>
                  <p>{t('formulation.results.chartPlaceholder', 'Chart placeholder')}</p>
                  <p className="chart-subtitle">{t('formulation.results.radialDistributionSubtitle', 'Radial Distribution Function and Coordination Number')}</p>
                </div>
              </div>

              <div className="chart-section">
                <h4>{t('formulation.results.meanSquareDisplacement', 'Mean Square Displacement')}</h4>
                <div className="chart-placeholder">
                  <div className="chart-icon">📈</div>
                  <p>{t('formulation.results.chartPlaceholder', 'Chart placeholder')}</p>
                  <p className="chart-subtitle">{t('formulation.results.meanSquareDisplacementSubtitle', 'Mean Square Displacement')}</p>
                </div>
              </div>
            </div>

            <div className="analysis-file">
              <h3>{t('formulation.results.analysisFile', 'Analysis File')}</h3>
              <div className="file-content">
                <div className="file-text">
                  <p>{t('formulation.results.downloadDescription', 'Download the complete analysis results in JSON format')}</p>
                  <p className="file-details">{t('formulation.results.fileContains', 'File contains configuration details, analysis parameters, and computed results')}</p>
                </div>
                <button
                  className="download-btn"
                  onClick={handleDownloadJSON}
                >
                  {t('formulation.results.downloadJSON', 'Download JSON')}
                </button>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;