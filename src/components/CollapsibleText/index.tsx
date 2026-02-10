import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import './index.less';

interface CollapsibleTextProps {
  children: React.ReactNode;
  lineClamp?: number;
  className?: string;
}

/**
 * 可折叠文本组件
 *
 * 当文本超过指定行数时，显示折叠按钮，点击可展开/收起
 *
 * @param children - 文本内容
 * @param lineClamp - 限制的行数，默认为 3
 * @param className - 自定义类名（可选）
 */
const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  children,
  lineClamp = 2,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggleButton, setShowToggleButton] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  // 语言切换时自动收起
  useEffect(() => {
    setIsExpanded(false);
  }, [i18n.language]);

  // 检测文本是否超过指定行数，决定是否显示折叠按钮
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const hasOverflow = textRef.current.scrollHeight > textRef.current.clientHeight;
        setShowToggleButton(hasOverflow);
      }
    };

    // 使用 setTimeout 确保 DOM 已更新（特别是语言切换时）
    const timer = setTimeout(() => {
      checkOverflow();
    }, 100); // 增加延迟确保文本内容已更新

    // 监听窗口大小变化
    window.addEventListener('resize', checkOverflow);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [i18n.language, lineClamp]); // 只监听语言变化和行数变化，不监听展开状态

  return (
    <div className={`collapsible-text-wrapper ${className}`}>
      <p
        ref={textRef}
        className={`collapsible-text ${isExpanded ? 'expanded' : ''}`}
        style={{
          WebkitLineClamp: lineClamp,
          lineClamp: lineClamp,
          maxHeight: isExpanded ? 'none' : `calc(1.5em * ${lineClamp})`,
          minHeight: isExpanded ? 'unset' : `calc(1.5em * ${lineClamp})`,
        }}
      >
        {children}
      </p>
      {showToggleButton && (
        <button
          className="collapsible-text-toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse text' : 'Expand text'}
        >
          <ChevronDown
            size={16}
            className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}
          />
        </button>
      )}
    </div>
  );
};

export default CollapsibleText;
