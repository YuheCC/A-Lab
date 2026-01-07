import React from 'react';
import './index.less';

interface ResponsiveConfig {
  /** 默认列数 */
  default: number;
  /** 小屏幕 (≥768px) 列数 */
  sm?: number;
  /** 中等屏幕 (≥1024px) 列数 */
  md?: number;
  /** 大屏幕 (≥1200px) 列数 */
  lg?: number;
  /** 超大屏幕 (≥1440px) 列数 */
  xl?: number;
  /** 极大屏幕 (≥1920px) 列数 */
  xxl?: number;
}

interface FeatureCardGroupProps {
  /** 子元素（FeatureCard组件） */
  children: React.ReactNode;
  /** 响应式列数配置 */
  columns?: number | ResponsiveConfig;
  /** 卡片之间的间距，单位px，默认16 */
  gap?: number;
  /** 自定义className */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * FeatureCardGroup - 功能卡片容器组件
 * 
 * 支持响应式布局，可以根据屏幕宽度自动调整卡片显示列数
 * 
 * @example
 * // 简单使用，固定2列
 * <FeatureCardGroup columns={2}>
 *   <FeatureCard ... />
 *   <FeatureCard ... />
 * </FeatureCardGroup>
 * 
 * @example
 * // 响应式配置
 * <FeatureCardGroup 
 *   columns={{
 *     default: 1,
 *     sm: 1,
 *     md: 2,
 *     lg: 3,
 *     xl: 4,
 *     xxl: 6
 *   }}
 *   gap={20}
 * >
 *   <FeatureCard ... />
 *   <FeatureCard ... />
 *   <FeatureCard ... />
 * </FeatureCardGroup>
 */
const FeatureCardGroup: React.FC<FeatureCardGroupProps> = ({
  children,
  columns = 2,
  gap = 16,
  className = '',
  style = {},
}) => {
  // 生成响应式类名
  const getResponsiveClasses = () => {
    if (typeof columns === 'number') {
      return `feature-card-group--cols-${columns}`;
    }

    const classes: string[] = [];
    const config = columns as ResponsiveConfig;

    // 默认列数（必需）
    classes.push(`feature-card-group--cols-default-${config.default}`);

    // 其他断点列数（可选）
    if (config.sm !== undefined) {
      classes.push(`feature-card-group--cols-sm-${config.sm}`);
    }
    if (config.md !== undefined) {
      classes.push(`feature-card-group--cols-md-${config.md}`);
    }
    if (config.lg !== undefined) {
      classes.push(`feature-card-group--cols-lg-${config.lg}`);
    }
    if (config.xl !== undefined) {
      classes.push(`feature-card-group--cols-xl-${config.xl}`);
    }
    if (config.xxl !== undefined) {
      classes.push(`feature-card-group--cols-xxl-${config.xxl}`);
    }

    return classes.join(' ');
  };

  const responsiveClasses = getResponsiveClasses();

  return (
    <div
      className={`feature-card-group ${responsiveClasses} ${className}`}
      style={{
        ...style,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
};

export default FeatureCardGroup;
