import React from 'react';
import './index.less';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button 变体
   * - primary: 主按钮（深灰背景 #1f2937）
   * - secondary: 次要按钮（白色背景，带边框）
   * - outlined: 边框按钮（透明背景，绿色边框）
   * - text: 文本按钮（透明背景，无边框）
   * - danger: 危险按钮（红色背景）
   */
  variant?: ButtonVariant;

  /**
   * 按钮尺寸
   * - small: 小按钮（高度 32px）
   * - medium: 中等按钮（高度 40px，默认）
   * - large: 大按钮（高度 48px）
   */
  size?: ButtonSize;

  /**
   * 是否显示加载状态
   */
  loading?: boolean;

  /**
   * 是否占满父容器宽度
   */
  fullWidth?: boolean;

  /**
   * 左侧图标
   */
  leftIcon?: React.ReactNode;

  /**
   * 右侧图标
   */
  rightIcon?: React.ReactNode;

  /**
   * 按钮内容
   */
  children?: React.ReactNode;
}

/**
 * Button 组件 - 统一的按钮样式组件
 *
 * 符合项目设计规范，提供多种变体和状态。
 *
 * @example
 * // 主按钮
 * <Button variant="primary" onClick={handleClick}>
 *   提交
 * </Button>
 *
 * @example
 * // 带加载状态的按钮
 * <Button variant="primary" loading={isLoading}>
 *   保存
 * </Button>
 *
 * @example
 * // 带图标的按钮
 * <Button variant="secondary" leftIcon={<PlusIcon />}>
 *   新增
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  children,
  ...rest
}) => {
  const classNames = [
    'custom-btn',
    `custom-btn-${variant}`,
    `custom-btn-${size}`,
    fullWidth && 'custom-btn-full-width',
    loading && 'custom-btn-loading',
    disabled && 'custom-btn-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="custom-btn-loading-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {!loading && leftIcon && <span className="custom-btn-icon-left">{leftIcon}</span>}
      <span className="custom-btn-content">{children}</span>
      {!loading && rightIcon && <span className="custom-btn-icon-right">{rightIcon}</span>}
    </button>
  );
};

export default Button;
