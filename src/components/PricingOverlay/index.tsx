import React, { useEffect } from 'react';
import Pricing from '@/components/Pricing';
import { useTranslation } from 'react-i18next';
import './PricingOverlay.css';

interface PricingOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const PricingOverlay: React.FC<PricingOverlayProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();

  // 监听ESC键关闭浮层
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscape);
      // 阻止背景滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [visible, onClose]);

  if (!visible) return null;

  // 点击蒙层关闭
  const handleMaskClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="pricing-overlay" onClick={handleMaskClick}>
      <div className="pricing-overlay-content">
        <div className="pricing-overlay-header">
          <h2 className="pricing-overlay-title">{t('pricing.title')}</h2>
          <button 
            className="pricing-overlay-close"
            onClick={onClose}
            aria-label="关闭"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="pricing-overlay-body">
          <Pricing showHeader={false} className="pricing-overlay-pricing" />
        </div>
      </div>
    </div>
  );
};

export default PricingOverlay; 