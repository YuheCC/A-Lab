import React from 'react';

interface ArrowIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// 自定义向上箭头 - 更长的线条设计
export const ArrowUpIcon: React.FC<ArrowIconProps> = ({ 
  size = 16, 
  color = 'currentColor',
  strokeWidth = 1.5 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* 垂直线 - 从底部到顶部 */}
      <line
        x1="8"
        y1="14"
        x2="8"
        y2="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* 左侧箭头 - 加长 */}
      <line
        x1="8"
        y1="2"
        x2="4"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 右侧箭头 - 加长 */}
      <line
        x1="8"
        y1="2"
        x2="12"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// 自定义向下箭头 - 更长的线条设计
export const ArrowDownIcon: React.FC<ArrowIconProps> = ({ 
  size = 16, 
  color = 'currentColor',
  strokeWidth = 1.5 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {/* 垂直线 - 从顶部到底部 */}
      <line
        x1="8"
        y1="2"
        x2="8"
        y2="14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* 左侧箭头 - 加长 */}
      <line
        x1="8"
        y1="14"
        x2="4"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 右侧箭头 - 加长 */}
      <line
        x1="8"
        y1="14"
        x2="12"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

