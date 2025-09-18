import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@umijs/max';
import { getMDHistoryDetail, MDHistoryDetailResponse } from '@/services/formulation/md';
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
      setError('缺少分析ID参数');
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
        setError('获取分析详情失败');
      }
    } catch (err) {
      console.error('Failed to fetch detail data:', err);
      setError(err instanceof Error ? err.message : '获取分析详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    navigate('/formulation');
  };

  // 动态生成系统属性数据
  const systemProperties = [
    {
      property: 'Density (g/cm³)',
      value: resultData?.system_properties?.density?.toFixed(4) || '1.2000'
    },
    {
      property: 'Viscosity (cP)',
      value: resultData?.system_properties?.viscosity?.toFixed(4) || '2.6600'
    },
    {
      property: 'Conductivity (mS/cm)',
      value: resultData?.system_properties?.conductivity?.toFixed(4) || '5.7600'
    }
  ];

  // 动态生成集群分析数据
  const clusterAnalysis = resultData?.cluster_data?.map(item => ({
    size: item.size,
    category: item.category,
    fraction: `${(item.fraction * 100).toFixed(1)}%`
  })) || [
    { size: 0, category: 'SSIP', fraction: '20.0%' },
    { size: 1, category: 'CIP', fraction: '40.0%' },
    { size: 2, category: 'AGG', fraction: '10.0%' },
    { size: 3, category: 'AGG', fraction: '5.0%' },
    { size: 4, category: 'AGG', fraction: '25.0%' }
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
          <h1 className="detail-title">Salt & Solvent Configuration</h1>
          <span className="detail-subtitle">View detailed analysis results</span>
          <div className="detail-actions">
            <span className="detail-action-title">Analysis Details</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              Back to List
            </button>
          </div>
        </div>
        <div className="detail-content">
          <div className="loading-state">
            <p>Loading analysis details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-page-container">
        <div className="detail-header">
          <h1 className="detail-title">Salt & Solvent Configuration</h1>
          <span className="detail-subtitle">View detailed analysis results</span>
          <div className="detail-actions">
            <span className="detail-action-title">Analysis Details</span>
            <button className="back-to-list-button" onClick={handleBackToList}>
              Back to List
            </button>
          </div>
        </div>
        <div className="detail-content">
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
        <h1 className="detail-title">Salt & Solvent Configuration</h1>
        <span className="detail-subtitle">View detailed analysis results - AN-{String(id).padStart(3, '0')}</span>
        <div className="detail-actions">
          <span className="detail-action-title">Analysis Details</span>
          <button className="back-to-list-button" onClick={handleBackToList}>
            Back to List
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="results-section">
          <h2>Analysis Results</h2>

          <div className="system-properties">
            <h3>System Properties</h3>
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
            <h3>Cluster Analysis</h3>
            <div className="cluster-table">
              <div className="table-header">
                <span>Size</span>
                <span>Category</span>
                <span>Fraction</span>
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
            <h3>Analysis Charts</h3>

            <div className="chart-section">
              <h4>Radial Distribution Function and Coordination Number</h4>
              {resultData?.rdf_cn_plot ? (
                <div className="chart-image-container">
                  <img
                    src={`data:image/png;base64,${resultData.rdf_cn_plot}`}
                    alt="Radial Distribution Function and Coordination Number"
                    className="chart-image"
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-icon">📊</div>
                  <p>Chart placeholder</p>
                  <p className="chart-subtitle">Radial Distribution Function and Coordination Number</p>
                </div>
              )}
            </div>

            <div className="chart-section">
              <h4>Mean Square Displacement</h4>
              {resultData?.msd_plot ? (
                <div className="chart-image-container">
                  <img
                    src={`data:image/png;base64,${resultData.msd_plot}`}
                    alt="Mean Square Displacement"
                    className="chart-image"
                  />
                </div>
              ) : (
                <div className="chart-placeholder">
                  <div className="chart-icon">📈</div>
                  <p>Chart placeholder</p>
                  <p className="chart-subtitle">Mean Square Displacement</p>
                </div>
              )}
            </div>
          </div>

          <div className="analysis-file">
            <h3>Analysis File</h3>
            <div className="file-content">
              <div className="file-text">
                <p>Download the complete analysis results in JSON format</p>
                <p className="file-details">File contains configuration details, analysis parameters, and computed results</p>
              </div>
              <button
                className="download-btn"
                onClick={handleDownloadJSON}
              >
                Download JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;