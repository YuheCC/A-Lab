import React from 'react';
import './index.less';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconBgColor,
  onClick
}) => {
  return (
    <div
      className={`feature-card ${onClick ? 'feature-card--clickable' : ''}`}
      onClick={onClick}
    >
      <div className="feature-card__icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        {icon}
      </div>
      <div className="feature-card__content">
        <div className="feature-card__title">{title}</div>
        <div className="feature-card__description">{description}</div>
      </div>
    </div>
  );
};

export default FeatureCard;
