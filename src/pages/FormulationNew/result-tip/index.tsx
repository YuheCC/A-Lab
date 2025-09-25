import React from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import GuideTooltip from '../components/GuideTooltip';
import PropertiesTable from '../components/PropertiesTable';
import './index.css';

interface ResultTipProps {}

const ResultTip: React.FC<ResultTipProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClose = () => {
    navigate('/formulation/new?tab=analysis');
  };

  return (
    <div className="result-tip-container">
      <div className="result-tip-header">
        <div className="formulation-title-wrapper">
          <h1 className="result-tip-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
          {/* <GuideTooltip
            storageKey="formulation-new-guide-shown"
          /> */}
        </div>
        <span className="result-tip-subtitle">{t('formulation.subtitle', 'Configure and customize your electrolytes')}</span>
      </div>

      <div className="result-tip-content">
        <div className="tip-card">
          <h2 className="tip-title">{t('formulation.tip.calculating', '计算中')}</h2>
          <p className="tip-description">{t('formulation.tip.calculatingDesc', '基于极化力场的分子动力学模拟耗时较长（24-48小时），可在预计时间之后查看结果，系统会提醒您计算的状态')}</p>
          <div className="tip-notice">
            <div className="notice-icon">⚠</div>
            <div className="notice-text">
              <div>{t('formulation.tip.notice2', '您可以关闭此页面，不会影响后台计算进程')}</div>
            </div>
          </div>
          <div className="properties-table-section">
            <PropertiesTable />
          </div>
          <button className="result-tip-close-button" onClick={handleClose}>
            {t('formulation.resultTip.close', '关闭')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultTip;