import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { getShapEchartsConfig } from './shapEchartsConfig';

interface ConsistencyProps {
  onBackToIntro?: () => void;
}

const Consistency: React.FC<ConsistencyProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();

  // 处理ECharts配置，使用多语言支持
  const chartOption = useMemo(() => {
    return getShapEchartsConfig(t);
  }, [t]);

  return (
    <>
      {/* 完成提示 */}
      <div className="result-header">
        <div className="success-icon">✓</div>
        <h3 className="result-title">{t('manufacturing.result.complete')}</h3>
        <p className="result-desc">
          {t('manufacturing.result.fileAnalyzed')} <span className="filename">demo_data.csv</span>{' '}
          {t('manufacturing.result.fileSuccess')}
        </p>
      </div>

      {/* SHAP特征重要性图表 */}
      <div className="chart-section">
        <h3 className="chart-title">{t('manufacturing.charts.shap.title')}</h3>
        <ReactECharts
          option={chartOption}
          style={{ height: '600px', width: '100%' }}
          opts={{ renderer: 'svg' }}
        />
      </div>

      {/* 分析总结 */}
      <div className="analysis-summary">
        <h4 className="summary-title">{t('manufacturing.result.summary.title')}</h4>
        <ul className="summary-list">
          <li>✓ {t('manufacturing.result.summary.point1')}</li>
          <li>✓ {t('manufacturing.result.summary.point2')}</li>
          <li>⚠ {t('manufacturing.result.summary.point3')}</li>
          <li>✓ {t('manufacturing.result.summary.point4')}</li>
        </ul>
      </div>

      {/* 操作按钮 */}
      <div className="result-actions">
        <button className="btn-secondary" onClick={onBackToIntro}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 12l-4-4 4-4" />
          </svg>
          {t('manufacturing.result.backToIntro')}
        </button>
        {/* <button className="btn-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2v10m-4-6l4-4 4 4" />
          </svg>
          {t('manufacturing.result.exportReport')}
        </button> */}
      </div>
    </>
  );
};

export default Consistency;
