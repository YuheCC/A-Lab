import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

export type ModuleType = 'consistency' | 'detection' | 'kvalue' | 'sorting' | 'ultrasound';

interface ModuleNavProps {
  activeModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
}

const ModuleNav: React.FC<ModuleNavProps> = ({ activeModule, onModuleChange }) => {
  const { t } = useTranslation();

  const modules: { key: ModuleType; icon: React.ReactNode }[] = [
    {
      key: 'consistency',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2.5" y="2.5" width="5" height="5" fill="currentColor"/>
          <rect x="12.5" y="7.5" width="5" height="5" fill="currentColor"/>
          <rect x="10.83" y="4.17" width="0.83" height="0.83" fill="currentColor"/>
          <rect x="11.67" y="11.67" width="7.5" height="2.5" fill="currentColor"/>
        </svg>
      ),
    },
    {
      key: 'detection',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="6.67" stroke="currentColor" strokeWidth="1.67"/>
          <circle cx="10" cy="6.67" r="0.83" fill="currentColor"/>
          <circle cx="10.02" cy="13.33" r="0.02" fill="currentColor"/>
        </svg>
      ),
    },
    {
      key: 'kvalue',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3.33 3.33h13.34v13.34H3.33V3.33z" stroke="currentColor" strokeWidth="1.67"/>
        </svg>
      ),
    },
    // {
    //   key: 'sorting',
    //   icon: (
    //     <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    //       <rect x="3.33" y="3.33" width="13.34" height="2.5" stroke="currentColor" strokeWidth="1.67"/>
    //       <circle cx="10" cy="16.67" r="2" fill="currentColor"/>
    //       <path d="M5.71 10.42h8.58" stroke="currentColor" strokeWidth="1.67"/>
    //       <ellipse cx="10" cy="7.08" rx="1.46" ry="1.25" stroke="currentColor" strokeWidth="1.67"/>
    //     </svg>
    //   ),
    // },
    {
      key: 'ultrasound',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round"/>
          <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.67"/>
        </svg>
      ),
    },
  ];

  return (
    <aside className="module-nav-sidebar">
      <nav className="module-navigation">
        {modules.map((module) => (
          <button
            key={module.key}
            className={`nav-button ${activeModule === module.key ? 'active' : ''}`}
            onClick={() => onModuleChange(module.key)}
          >
            <div className="nav-icon">{module.icon}</div>
            <span className="nav-text">{t(`manufacturing.modules.${module.key}.title`)}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default ModuleNav;
