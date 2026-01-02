import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const IntroductionContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="introduction-content">
      <p className="introduction-content__title">
        {t('design.electrode.introduction.overview')}
      </p>
      <div className="introduction-content__list">
        <p className="introduction-content__item">
          {t('design.electrode.introduction.function1')}
        </p>
        <p className="introduction-content__item">
          {t('design.electrode.introduction.function2')}
        </p>
        <p className="introduction-content__item">
          {t('design.electrode.introduction.function3')}
        </p>
        <p className="introduction-content__item">
          {t('design.electrode.introduction.function4')}
        </p>
      </div>
    </div>
  );
};

export default IntroductionContent;
