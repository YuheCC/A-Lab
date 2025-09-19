import React from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import './index.css';

interface ResultTipProps {}

const ResultTip: React.FC<ResultTipProps> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClose = () => {
    navigate('/formulation/new');
  };

  return (
    <div className="result-tip-container">
      <div className="result-tip-header">
        <h1 className="result-tip-title">{t('formulation.title', 'Salt & Solvent Configuration')}</h1>
        <span className="result-tip-subtitle">{t('formulation.subtitle', 'Configure and customize your electrolytes')}</span>
      </div>

      <div className="result-tip-content">
        <div className="tip-card">
          <h2 className="tip-title">{t('formulation.tip.calculating', '算法模型计算中')}</h2>
          <p className="tip-description">{t('formulation.tip.calculatingDesc', '系统正在处理您的模型参数，预计需要较长时间，请耐心等待')}</p>
          <div className="tip-notice">
            <div className="notice-icon">⚠</div>
            <div className="notice-text">
              <div>{t('formulation.tip.notice1', '模型训练完成后，系统将自动向您发送消息通知')}</div>
              <div>{t('formulation.tip.notice2', '您可以关闭此页面，不会影响后台计算进程')}</div>
            </div>
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