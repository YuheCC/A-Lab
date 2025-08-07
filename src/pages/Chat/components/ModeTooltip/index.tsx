import React from 'react';
import type { FC } from 'react';

interface ModeTooltipProps {
  mode: 'regular' | 'deep-space';
  isVisible: boolean;
  position: { x: number; y: number };
  buttonCenterX?: number; // 按钮中心位置，用于箭头定位
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ModeTooltip: FC<ModeTooltipProps> = ({ mode, isVisible, position, buttonCenterX, onMouseEnter, onMouseLeave }) => {
  if (!isVisible) return null;

  const getTooltipContent = () => {
    if (mode === 'regular') {
      return {
        title: 'Regular Ask',
        remaining: '今日剩余: 100次',
        description: '基础问答模式，适合日常电池相关问题咨询。提供准确、简洁的回答。'
      };
    } else if (mode === 'deep-space') {
      return {
        title: 'Deep Space',
        remaining: '本月剩余: 20次',
        description: '由大型语言模型智能体团队分析您的电池问题，搜索文献和我们的分子数据库，然后协作制作研究级答案。预计响应时间为10-20分钟。'
      };
    }
    return { title: '', remaining: '', description: '' };
  };

  const content = getTooltipContent();

  // 计算箭头位置
  const arrowLeft = buttonCenterX ? `${buttonCenterX - position.x}px` : '50%';
  const arrowTransform = buttonCenterX ? 'none' : 'translateX(-50%)';

  return (
    <div
      className={`mode-tooltip ${isVisible ? 'show' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 2147483647
      }}
    >
      {/* 小箭头 */}
      <div style={{
        position: 'absolute',
        top: '-8px',
        left: arrowLeft,
        transform: arrowTransform,
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: '8px solid white',
        filter: 'drop-shadow(0 -2px 2px rgba(0, 0, 0, 0.1))',
        zIndex: 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0
      }} />
      <div style={{ marginBottom: '8px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#111827'
          }}>
            {content.title}
          </h4>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            backgroundColor: '#f3f4f6',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {content.remaining}
          </span>
        </div>
        <div style={{
          fontSize: '13px',
          color: '#4b5563',
          lineHeight: '1.5'
        }}>
          {content.description}
        </div>
      </div>
    </div>
  );
};

export default ModeTooltip;
