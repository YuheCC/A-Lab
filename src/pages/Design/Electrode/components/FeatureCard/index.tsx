import React from 'react';
import './index.less';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBgColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  iconBgColor
}) => {
  return (
    <div className="feature-card">
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
