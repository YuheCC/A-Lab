import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

interface GuideTooltipProps {
  storageKey: string;
  content?: React.ReactNode;
}

const GuideTooltip: React.FC<GuideTooltipProps> = ({
  storageKey,
  content = '这里是功能说明内容，稍后补充。'
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasShown = localStorage.getItem(storageKey);
    if (!hasShown) {
      setIsVisible(true);
      localStorage.setItem(storageKey, 'true');
    }
  }, [storageKey]);

  const handleClose = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({ x: rect.left, y: rect.top });
    }

    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleToggle = () => {
    if (isVisible) {
      handleClose();
    } else {
      setIsVisible(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        className="guide-tooltip-trigger"
        onClick={handleToggle}
        aria-label={t('formulation.guide.help', '帮助')}
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.8807 13.3807 12 12 12V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="17" r="1" fill="currentColor"/>
        </svg>
      </button>

      {isVisible && (
        <>
          <div
            className={`guide-tooltip-overlay ${isAnimating ? 'closing' : ''}`}
            onClick={handleClose}
          />
          <div
            ref={tooltipRef}
            className={`guide-tooltip ${isAnimating ? 'closing' : ''}`}
            style={isAnimating ? {
              '--target-x': `${buttonPosition.x}px`,
              '--target-y': `${buttonPosition.y}px`,
            } as React.CSSProperties : {}}
          >
            <div className="guide-tooltip-header">
              <h3>{t('formulation.guide.title', '功能说明')}</h3>
              <button
                className="guide-tooltip-close"
                onClick={handleClose}
                aria-label={t('formulation.guide.close', '关闭')}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="guide-tooltip-content">
              {content}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GuideTooltip;