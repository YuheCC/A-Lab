import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import en from './en';
import zh from './zh';
import ko from './ko';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      convertDetectedLanguage: (lng) => {
        if (lng.startsWith('zh')) return 'zh';
        if (lng.startsWith('en')) return 'en';
        if (lng.startsWith('ko')) return 'ko';
        return lng;
      }
    },

    supportedLngs: ['en', 'zh', 'ko'],
    load: 'languageOnly',

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
      ko: {
        translation: ko,
      }
    }
  });

export default i18n; 