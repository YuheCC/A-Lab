import React from 'react';
import { useTranslation } from 'react-i18next';
import './ResultTip.less';

interface ResultTipProps {
  isVisible?: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
}

const ResultTip: React.FC<ResultTipProps> = ({
  isVisible = false,
  title,
  description,
  onClose
}) => {
  const { t } = useTranslation();

  const defaultTitle = title || t('formulation.result.processing', '算法模型计算中');
  const defaultDescription = description || t('formulation.result.description', '系统正在处理您的模型参数，预计需要较长时间，请耐心等待');
  const noticeText = t('formulation.result.notice', '模型训练完成后，系统将自动向您发送消息通知');
  const actionText = t('formulation.result.action', '您可以关闭此页面，不会影响后台计算进程');

  if (!isVisible) return null;

  return (
    <div className="result-tip-container">
      <div className="result-tip-header">
        <div className="result-tip-icon">⚙️</div>
        <h1 className="result-tip-title">{defaultTitle}</h1>
      </div>

      <p className="result-tip-description">{defaultDescription}</p>

      <div className="result-tip-notice">
        <div className="notice-icon">💡</div>
        <div className="notice-text">
          <p>{noticeText}</p>
          <p>{actionText}</p>
        </div>
      </div>

      {onClose && (
        <div className="result-tip-actions">
          <button
            className="result-tip-close-btn"
            onClick={onClose}
          >
            {t('formulation.result.close', '返回配置')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultTip;