import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

interface TabSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

const TabSection: React.FC<TabSectionProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const { t } = useTranslation();

  const tabs = [
    { key: 'introduction', label: t('design.electrode.tabs.introduction'), disabled: false },
    { key: 'records', label: t('design.electrode.tabs.records'), disabled: false },
    // { key: 'models', label: t('design.electrode.tabs.models'), disabled: true }
  ];

  return (
    <div className="tab-section">
      <div className="tab-section__header">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-section__button ${activeTab === tab.key ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => !tab.disabled && onTabChange(tab.key)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-section__content">
        {children}
      </div>
    </div>
  );
};

export default TabSection;
