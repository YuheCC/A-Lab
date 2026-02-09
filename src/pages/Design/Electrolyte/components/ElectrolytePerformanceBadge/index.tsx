import React from 'react';
import './index.less';

// Arrow Icons - 自定义箭头组件
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

interface ElectrolytePerformanceBadgeProps {
  metric: PerformanceMetric;
  metricType: MetricType;
}

const ElectrolytePerformanceBadge: React.FC<ElectrolytePerformanceBadgeProps> = ({
  metric,
  metricType,
}) => {
  const isPositive = metric.status === 'Positive';
  const isNegative = metric.status === 'Negative';

  // 获取百分比数值
  let percentValue = 0;
  if (typeof metric.confidence === 'string') {
    percentValue = Math.abs(parseFloat(metric.confidence.replace('%', '')));
  } else if (typeof metric.confidence === 'number') {
    percentValue = Math.abs(metric.confidence);
  }

  // 根据百分比值判断严重程度级别
  let level = '';
  if (percentValue < 5) {
    level = 'light';
  } else if (percentValue >= 5 && percentValue <= 25) {
    level = 'medium';
  } else if (percentValue > 25) {
    level = 'dark';
  }

  const badgeClass = `${isPositive ? 'positive' : isNegative ? 'negative' : 'unknown'}-${level}`;

  // 选择箭头图标
  const ArrowIcon = isPositive ? ArrowUpIcon : isNegative ? ArrowDownIcon : null;

  // CE 只显示箭头
  if (metricType === 'ce') {
    return (
      <div className={`electrolyte-performance-badge electrolyte-performance-badge--${badgeClass} electrolyte-performance-badge--ce-only`}>
        <span className="electrolyte-performance-badge__arrow">
          {ArrowIcon && <ArrowIcon size={16} />}
        </span>
      </div>
    );
  }

  // 其他指标显示箭头 + 百分比
  const value = percentValue > 0 ? `${percentValue}%` : '';

  return (
    <div className={`electrolyte-performance-badge electrolyte-performance-badge--${badgeClass}`}>
      <span className="electrolyte-performance-badge__text">
        {ArrowIcon && <ArrowIcon size={15} />}
        {value && <span>{value}</span>}
      </span>
    </div>
  );
};

export default ElectrolytePerformanceBadge;
export { ArrowUpIcon, ArrowDownIcon };
