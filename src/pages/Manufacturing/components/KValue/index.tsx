import React from 'react';
import { useTranslation } from 'react-i18next';

interface KValueProps {
  onBackToIntro?: () => void;
}

const KValue: React.FC<KValueProps> = ({ onBackToIntro }) => {
  const { t } = useTranslation();

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

      {/* 统计卡片 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-value">92</div>
          <div className="stat-label">{t('manufacturing.result.stats.score')}</div>
          <div className="stat-desc">{t('manufacturing.result.stats.scoreDesc')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">45 {t('manufacturing.result.stats.items')}</div>
          <div className="stat-label">{t('manufacturing.result.stats.passed')}</div>
          <div className="stat-desc">{t('manufacturing.result.stats.passedDesc')}</div>
        </div>
        <div className="stat-card attention">
          <div className="stat-value">5 {t('manufacturing.result.stats.items')}</div>
          <div className="stat-label">{t('manufacturing.result.stats.attention')}</div>
          <div className="stat-desc">{t('manufacturing.result.stats.attentionDesc')}</div>
        </div>
      </div>

      {/* K值分析相关图表 */}
      <div className="chart-section">
        <h3 className="chart-title">{t('manufacturing.result.chartTitle')}</h3>
        <div className="images-grid">
          <div className="image-placeholder">
            <div className="placeholder-icon">📊</div>
            <p>{t('manufacturing.modules.kvalue.imageTitle1')}</p>
          </div>
          <div className="image-placeholder">
            <div className="placeholder-icon">📈</div>
            <p>{t('manufacturing.modules.kvalue.imageTitle2')}</p>
          </div>
        </div>
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
      </div>
    </>
  );
};

export default KValue;
