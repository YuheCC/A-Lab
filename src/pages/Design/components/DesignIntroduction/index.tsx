import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const DesignIntroduction: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="design-introduction">
      <div className="design-introduction__content">
        <p className="design-introduction__paragraph">
          {t('design.introduction.overview')}
        </p>

        <p className="design-introduction__paragraph">
          {t('design.introduction.modelDescription')}
        </p>

        <p className="design-introduction__paragraph">
          {t('design.introduction.predictionProcess')}
        </p>

        <p className="design-introduction__paragraph">
          {t('design.introduction.example')}
        </p>

        {/* Figure Gallery */}
        <div className="design-introduction__gallery">
          <div className="design-introduction__figure">
            <h4 className="design-introduction__figure-title">
              1. {t('design.introduction.figure1Caption')}
            </h4>
            <img
              src="/design/introduction1.png"
              alt={t('design.introduction.figure1Alt')}
              className="design-introduction__image"
            />
          </div>

          <div className="design-introduction__figure">
            <h4 className="design-introduction__figure-title">
              2. {t('design.introduction.figure2Caption')}
            </h4>
            <img
              src="/design/introduction2.png"
              alt={t('design.introduction.figure2Alt')}
              className="design-introduction__image"
            />
          </div>

          <div className="design-introduction__figure">
            <h4 className="design-introduction__figure-title">
              3. {t('performance.results.title')}
            </h4>
            <p className="design-introduction__figure-caption">{t('design.introduction.figure3Caption')}</p>
            <img
              src="/design/introduction3.png"
              alt={t('design.introduction.figure3Alt')}
              className="design-introduction__image"
            />
          </div>
        </div>

        <p className="design-introduction__paragraph">
          {t('design.introduction.accuracy')}
        </p>

        <p className="design-introduction__paragraph">
          {t('design.introduction.supportedSystems')}
        </p>
      </div>
    </div>
  );
};

export default DesignIntroduction;

