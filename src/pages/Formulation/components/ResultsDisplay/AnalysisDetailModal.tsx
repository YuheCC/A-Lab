import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getMDHistoryDetail } from '@/services/formulation/md';
import './AnalysisDetailModal.css';

interface ResultData {
  system_properties?: {
    density?: number;
    viscosity?: number;
    conductivity?: number;
  };
  cluster_data?: Array<{
    size: number;
    category: string;
    fraction: number;
  }>;
  diffusion_data?: {
    [key: string]: number;
  };
  rdf_data?: any;
  cn_data?: any;
  msd_data?: any;
  output_json?: any;
  msd_plot?: string;
  rdf_cn_plot?: string;
}

interface AnalysisDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detailId?: string;
}

const AnalysisDetailModal: React.FC<AnalysisDetailModalProps> = ({ isOpen, onClose, detailId }) => {
  const { t } = useTranslation();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [configData, setConfigData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && detailId) {
      fetchDetailData();
    }
  }, [isOpen, detailId]);

  const fetchDetailData = async () => {
    if (!detailId) return;

    setLoading(true);
    try {
      const response = await getMDHistoryDetail(Number(detailId));
      if (response?.data) {
        if (response.data.result_data) {
          setResultData(response.data.result_data);
        }
        setConfigData(response.data);
      }
    } catch (error) {
      console.error('获取详情数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const saltSummary = [
    {
      label: t('formulation.detail.selected', 'Selected'),
      value: configData ? `${configData.cation_name} + ${configData.anion_name_list.join(' + ')}` : 'LiTFSI'
    },
    {
      label: t('formulation.detail.totalSaltConcentration', 'Total salt concentration'),
      value: configData ? `${configData.cation_molality.toFixed(2)} mol/kg` : '1.00 mol/kg'
    },
    {
      label: t('formulation.detail.fractions', 'Fractions:'),
      value: configData && configData.anion_name_list ?
        configData.anion_name_list.map((anion: string, index: number) =>
          `${anion}: ${configData.anion_fractions[index].toFixed(2)}`
        ).join(', ') : 'BF4-: 1.00'
    },
    {
      label: t('formulation.detail.fractionType', 'Fraction type:'),
      value: configData ?
        (configData.anion_fractions_type === 'mole' ? t('formulation.fractionType.mole', 'Molar fraction') : t('formulation.fractionType.weight', 'Weight fraction')) :
        t('formulation.fractionType.mole', 'Molar fraction')
    },
    {
      label: t('formulation.detail.totalFraction', 'Total fraction:'),
      value: configData && configData.anion_fractions ?
        configData.anion_fractions.reduce((sum: number, fraction: number) => sum + fraction, 0).toFixed(2) : '1.00'
    }
  ];

  const solventSummary = [
    {
      label: t('formulation.detail.solvent', 'Solvent:'),
      value: configData && configData.solvent_smiles_list ?
        configData.solvent_smiles_list.map((solvent: string, index: number) =>
          `${solvent}: ${configData.solvent_fractions[index].toFixed(2)}`
        ).join(', ') : 'CCO: 1.00'
    },
    {
      label: t('formulation.detail.fractionType', 'Fraction type:'),
      value: configData ?
        (configData.solvent_fractions_type === 'mole' ? t('formulation.fractionType.mole', 'Molar fraction') : t('formulation.fractionType.weight', 'Weight fraction')) :
        t('formulation.fractionType.weight', 'Weight fraction')
    },
    {
      label: t('formulation.detail.totalFraction', 'Total fraction:'),
      value: configData && configData.solvent_fractions ?
        configData.solvent_fractions.reduce((sum: number, fraction: number) => sum + fraction, 0).toFixed(2) : '1.00'
    }
  ];

  const systemProperties = [
    {
      property: t('formulation.detail.density', 'Density (g/cm³)'),
      value: resultData?.system_properties?.density?.toFixed(4) || '1.2000'
    },
    {
      property: t('formulation.detail.viscosity', 'Viscosity (cP)'),
      value: resultData?.system_properties?.viscosity?.toFixed(4) || '2.6600'
    },
    {
      property: t('formulation.detail.conductivity', 'Conductivity (mS/cm)'),
      value: resultData?.system_properties?.conductivity?.toFixed(4) || '5.7500'
    }
  ];

  const clusterAnalysis = resultData?.cluster_data?.map(item => ({
    size: item.size,
    category: item.category,
    fraction: `${(item.fraction * 100).toFixed(1)}%`
  })) || [
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
    let data;

    if (resultData?.output_json) {
      // 使用output_json字段的内容
      data = resultData.output_json;
    } else {
      // 降级处理：如果没有output_json，则使用当前显示的数据
      data = {
        saltSummary,
        solventSummary,
        systemProperties,
        clusterAnalysis,
        timestamp: new Date().toISOString()
      };
    }

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
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {t('formulation.detail.loading', '正在加载详情数据...')}
              </div>
            </div>
          ) : (
            <>
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
                {resultData?.rdf_cn_plot ? (
                  <div className="chart-image-container">
                    <img
                      src={`data:image/png;base64,${resultData.rdf_cn_plot}`}
                      alt={t('formulation.detail.radialDistribution', 'Radial Distribution Function and Coordination Number')}
                      className="chart-image"
                    />
                  </div>
                ) : (
                  <div className="chart-placeholder-modal">
                    <div className="chart-icon">📊</div>
                    <p>{t('formulation.detail.chartPlaceholder', 'Chart placeholder')}</p>
                    <p className="chart-subtitle">{t('formulation.detail.radialDistributionSubtitle', 'Radial Distribution Function and Coordination Number')}</p>
                  </div>
                )}
              </div>

              <div className="chart-box">
                <h4>{t('formulation.detail.meanSquareDisplacement', 'Mean Square Displacement')}</h4>
                {resultData?.msd_plot ? (
                  <div className="chart-image-container">
                    <img
                      src={`data:image/png;base64,${resultData.msd_plot}`}
                      alt={t('formulation.detail.meanSquareDisplacement', 'Mean Square Displacement')}
                      className="chart-image"
                    />
                  </div>
                ) : (
                  <div className="chart-placeholder-modal">
                    <div className="chart-icon">📈</div>
                    <p>{t('formulation.detail.chartPlaceholder', 'Chart placeholder')}</p>
                    <p className="chart-subtitle">{t('formulation.detail.meanSquareDisplacementSubtitle', 'Mean Square Displacement')}</p>
                  </div>
                )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetailModal;