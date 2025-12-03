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

        <figure className="design-introduction__figure">
          <img
            src="/design/introduction1.png"
            alt={t('design.introduction.figureAlt')}
            className="design-introduction__image"
          />
          <figcaption className="design-introduction__caption">
            {t('design.introduction.figureCaption')}
          </figcaption>
        </figure>

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

