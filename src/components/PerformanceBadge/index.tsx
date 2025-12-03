import React from 'react';
import './index.less';

// Arrow Icons
const ArrowUpIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const ArrowDownIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

export interface PerformanceMetric {
  status: 'Positive' | 'Negative' | 'Neutral' | 'Restricted';
  confidence: number | string | null;
  rawProb?: number | null;
  rawLabel?: number | null;
  isRestricted?: boolean;
}

export type MetricType = 'cycleLife' | 'ce' | 'ratePerformance';

interface PerformanceBadgeProps {
  metric: PerformanceMetric;
  metricType: MetricType;
  /** Class name prefix, defaults to 'cc' */
  classPrefix?: string;
}

const PerformanceBadge: React.FC<PerformanceBadgeProps> = ({
  metric,
  metricType,
  classPrefix = 'cc'
}) => {
  const isPositive = metric.status === 'Positive';
  const isNegative = metric.status === 'Negative';

  // Get percentage value
  let percentValue = 0;
  if (typeof metric.confidence === 'string') {
    percentValue = Math.abs(parseFloat(metric.confidence.replace('%', '')));
  } else if (typeof metric.confidence === 'number') {
    percentValue = Math.abs(metric.confidence);
  }

  // Determine severity level based on percentage
  let level = '';
  if (percentValue < 5) {
    level = 'light';
  } else if (percentValue >= 5 && percentValue <= 25) {
    level = 'medium';
  } else if (percentValue > 25) {
    level = 'dark';
  }

  const badgeClass = `${isPositive ? 'positive' : isNegative ? 'negative' : 'unknown'}-${level}`;
  const ArrowIcon = isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : null;

  const prefix = `${classPrefix}-performance-badge`;

  // CE only shows arrow
  if (metricType === 'ce') {
    return (
      <div className={`${prefix} ${prefix}--${badgeClass} ${prefix}--ce-only`}>
        <span className={`${prefix}__arrow`}>
          {ArrowIcon && <ArrowIcon size={16} />}
        </span>
      </div>
    );
  }

  // Other metrics show arrow and percentage
  const value = percentValue > 0 ? `${percentValue}%` : '';

  return (
    <div className={`${prefix} ${prefix}--${badgeClass}`}>
      <span className={`${prefix}__text`}>
        {ArrowIcon && <ArrowIcon size={15} />}
        {value && <span>{value}</span>}
      </span>
    </div>
  );
};

export default PerformanceBadge;
export { ArrowUpIcon, ArrowDownIcon };
