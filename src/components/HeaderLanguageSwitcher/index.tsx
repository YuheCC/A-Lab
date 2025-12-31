import React from 'react';
import { useTranslation } from 'react-i18next';
import './HeaderLanguageSwitcher.less';

const HeaderLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', shortName: 'EN' },
    { code: 'zh', name: '中文', shortName: '中文' },
    { code: 'ko', name: '한국어', shortName: '한국어' },
    { code: 'ja', name: '日本語', shortName: '日本語' }
  ];

  // Get current language, i18n already handles language normalization
  const currentLang = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = async (lng: string) => {
    try {
      // i18n.changeLanguage automatically stores to localStorage
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error('Language switch failed:', error);
    }
  };

  return (
    <div className="header-language-switcher">
      <div className="language-trigger-text">
        {currentLang.shortName}
      </div>
      <div className="header-language-dropdown">
        {languages.map((lang) => (
          <div
            key={lang.code}
            className={`header-language-option ${lang.code === i18n.language ? 'active' : ''}`}
            onClick={() => changeLanguage(lang.code)}
          >
            <span className="language-name">{lang.name}</span>
            {lang.code === i18n.language && <span className="check-mark">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeaderLanguageSwitcher;

