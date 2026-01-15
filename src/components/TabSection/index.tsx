import React from 'react';
import './index.less';

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

export interface TabSectionProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: TabItem[];
  children?: React.ReactNode;
}

const TabSection: React.FC<TabSectionProps> = ({
  activeTab,
  onTabChange,
  tabs,
  children
}) => {
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
