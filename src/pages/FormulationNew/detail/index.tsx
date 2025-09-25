import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import { Info } from 'lucide-react';
import { getMDHistoryDetail, MDHistoryDetailResponse } from '@/services/formulation/md';
import GuideTooltip from '../components/GuideTooltip';
import './index.css';

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

const DetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<MDHistoryDetailResponse | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);

  const id = searchParams.get('id');

  useEffect(() => {
    if (id) {
      fetchDetailData();
    } else {
      setError(t('formulation.detail.missingId', 'Missing analysis ID parameter'));
      setLoading(false);
    }
  }, [id]);

  const fetchDetailData = async () => {
    if (!id) return;

    setLoading(true);
    
    setError(null);

    try {
      const response = await getMDHistoryDetail(Number(id));
      if (response?.data) {
        setDetailData(response.data);
        if (response.data.result_data) {
          setResultData(response.data.result_data);
        }
      } else {
        setError(t('formulation.detail.fetchError', 'Failed to fetch analysis details'));
      }
    } catch (err) {
      console.error('Failed to fetch detail data:', err);
      setError(err instanceof Error ? err.message : t('formulation.detail.fetchError', 'Failed to fetch analysis details'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/formulation/new?tab=analysis');
  };

  // 动态生成系统属性数据
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
      value: resultData?.system_properties?.conductivity?.toFixed(4) || '5.7600'
    }
  ];

  // 动态生成集群分析数据
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

  const handleDownloadJSON = () => {
    let data;

    if (resultData?.output_json) {
      // 使用output_json字段的内容
      data = resultData.output_json;
    } else {
      // 降级处理：如果没有output_json，则使用当前显示的数据
      data = {
        configData: detailData,
        systemProperties,
        clusterAnalysis,
        timestamp: new Date().toISOString()
      };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-results-${id}.json`;
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

  if (loading) {
    return (
      <div className="detail-page-container">
        <div className="detail-header">
          <div className="formulation-title-wrapper">
            <h1 className="detail-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
            {/* <GuideTooltip
              storageKey="formulation-new-guide-shown"
            /> */}
          </div>
          <span className="detail-subtitle">{t('formulation.detail.viewSubtitle', 'View detailed analysis results')}</span>
        </div>
        <div className="detail-content">
          <div className="detail-actions">
            <span className="detail-action-title">{t('formulation.detail.actionTitle', 'Analysis Details')}</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              {t('formulation.actions.backToList', 'Back to List')}
            </button>
          </div>
          <div className="loading-state">
            <p>{t('formulation.detail.loading', 'Loading analysis details...')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page-container">
        <div className="detail-header">
          <div className="formulation-title-wrapper">
            <h1 className="detail-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
            {/* <GuideTooltip
              storageKey="formulation-new-guide-shown"
            /> */}
          </div>
          <span className="detail-subtitle">{t('formulation.detail.viewSubtitle', 'View detailed analysis results')}</span>
        </div>
        <div className="detail-content">
          <div className="detail-actions">
            <span className="detail-action-title">{t('formulation.detail.actionTitle', 'Analysis Details')}</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              {t('formulation.actions.backToList', 'Back to List')}
            </button>
          </div>
          <div className="error-state">
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page-container">
      <div className="detail-header">
        <div className="formulation-title-wrapper">
          <h1 className="detail-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
          {/* <GuideTooltip
            storageKey="formulation-new-guide-shown"
          /> */}
        </div>
        <span className="detail-subtitle">{t('formulation.detail.viewSubtitleWithId', 'View detailed analysis results')} - AN-{String(id).padStart(3, '0')}</span>
      </div>

      <div className="detail-content">
        <div className="detail-actions">
          <span className="detail-action-title">{t('formulation.detail.actionTitle', 'Analysis Details')}</span>
          <button className="back-to-list-button" onClick={handleBackToList}>
            {t('formulation.actions.backToList', 'Back to List')}
          </button>
        </div>
        <div className="results-section">
          <h2>{t('formulation.results.analysisResults', 'Analysis Results')}</h2>

          <div className="system-properties">
            <h3>{t('formulation.results.systemProperties', 'System Properties')}</h3>
            <div className="properties-table">
              {systemProperties.map((prop, index) => (
                <div key={index} className="property-row">
                  <span className="property-name">{prop.property}</span>
                  <span className="property-value">{Number(prop.value).toFixed(2)}</span>
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
                  <span className="category-cell">
                    <span
                      className="category-tag"
                      style={{
                        backgroundColor: getCategoryColor(item.category),
                        color: getCategoryTextColor(item.category)
                      }}
                    >
                      {item.category}
                    </span>
                    <Tooltip
                      title={t(`formulation.results.${item.category}Title`, '')}
                      placement="top"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: 'white',
                            color: 'black',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px',
                            fontSize: '14px',
                            maxWidth: '300px',
                            whiteSpace: 'pre-line',
                            '& .MuiTooltip-arrow': {
                              color: 'white',
                              '&::before': {
                                border: '1px solid #e5e7eb'
                              }
                            }
                          }
                        }
                      }}
                    >
                      <div className="tip-icon-container">
                        <Info
                          size={16}
                          className="tip-icon"
                        />
                      </div>
                    </Tooltip>
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
              {resultData?.rdf_cn_plot ? (
                <div className="chart-image-container">
                  <img
                    style={{ maxWidth: '60%' }}
                    src={`data:image/png;base64,${resultData.rdf_cn_plot}`}
                    alt="Radial Distribution Function and Coordination Number"
                    className="chart-image"
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-icon">📊</div>
                  <p>{t('formulation.results.chartPlaceholder', 'Chart placeholder')}</p>
                  <p className="chart-subtitle">{t('formulation.results.radialDistributionSubtitle', 'Radial Distribution Function and Coordination Number')}</p>
                </div>
              )}
            </div>

            <div className="chart-section">
              <h4>{t('formulation.results.meanSquareDisplacement', 'Mean Square Displacement')}</h4>
              {resultData?.msd_plot ? (
                <div className="chart-image-container">
                  <img
                    style={{ maxWidth: '60%' }}
                    src={`data:image/png;base64,${resultData.msd_plot}`}
                    alt="Mean Square Displacement"
                    className="chart-image"
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-icon">📈</div>
                  <p>{t('formulation.results.chartPlaceholder', 'Chart placeholder')}</p>
                  <p className="chart-subtitle">{t('formulation.results.meanSquareDisplacementSubtitle', 'Mean Square Displacement')}</p>
                </div>
              )}
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

export default DetailPage;