import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const IntroductionContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="electrode-introduction-content">
      {/* Result Prediction Section */}
      <div className="electrode-introduction-content__section">
        <h2 className="electrode-introduction-content__section-title">
          {t('design.electrode.introduction.resultPrediction.title')}
        </h2>
        <p className="electrode-introduction-content__paragraph">
          {t('design.electrode.introduction.resultPrediction.description1')}
        </p>
        <p className="electrode-introduction-content__paragraph">
          {t('design.electrode.introduction.resultPrediction.description2')}
        </p>
        <div className="electrode-introduction-content__example">
          <p className="electrode-introduction-content__example-title">
            {t('design.electrode.introduction.resultPrediction.exampleTitle')}
          </p>
          <p className="electrode-introduction-content__example-text">
            {t('design.electrode.introduction.resultPrediction.example')}
          </p>
          <div className="electrode-introduction-content__example-images">
            <div className="electrode-introduction-content__example-image-item">
              <img 
                src="/design/electrode/introduction/example1-1.png" 
                alt="Electrode parameters configuration"
                className="electrode-introduction-content__example-image"
              />
            </div>
            <div className="electrode-introduction-content__example-image-item">
              <img 
                src="/design/electrode/introduction/example1-2.png" 
                alt="Cell performance prediction results"
                className="electrode-introduction-content__example-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inverse Design Section */}
      <div className="electrode-introduction-content__section">
        <h2 className="electrode-introduction-content__section-title">
          {t('design.electrode.introduction.inverseDesign.title')}
        </h2>
        <p className="electrode-introduction-content__paragraph">
          {t('design.electrode.introduction.inverseDesign.description1')}
        </p>
        <p className="electrode-introduction-content__paragraph">
          {t('design.electrode.introduction.inverseDesign.description2')}
        </p>
      </div>
    </div>
  );
};

export default IntroductionContent;
