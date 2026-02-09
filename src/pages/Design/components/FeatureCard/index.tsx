import React from 'react';
import './index.less';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledTip?: React.ReactNode;      // 禁用提示内容，支持 HTML/React 节点
  disabledTipClassName?: string;      // 自定义提示样式类名
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconBgColor,
  onClick,
  disabled = false,
  disabledTip,
  disabledTipClassName
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // 判断是否有禁用提示
  const hasDisabledTip = disabled && disabledTip;

  return (
    <div
      className={`feature-card ${onClick && !disabled ? 'feature-card--clickable' : ''} ${disabled && !hasDisabledTip ? 'feature-card--disabled' : ''} ${hasDisabledTip ? 'feature-card--disabled-with-tip' : ''}`}
      onClick={handleClick}
    >
      <div className="feature-card__icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        {icon}
      </div>
      <div className="feature-card__content">
        <div className="feature-card__title">{title}</div>
        <div className="feature-card__description">{description}</div>
      </div>
      
      {/* 禁用提示蒙层 */}
      {hasDisabledTip && (
        <div className={`feature-card__disabled-overlay ${disabledTipClassName || ''}`}>
          <div className="feature-card__disabled-tip">
            {disabledTip}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
