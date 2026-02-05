import React from 'react';
import { Image } from 'antd';
import { useTranslation } from 'react-i18next';
import './index.less';

const IntroductionContent: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="electrode-introduction-content">
      <Image.PreviewGroup>
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
            <div className="electrode-introduction-content__example-images-centered">
              <div className="electrode-introduction-content__example-image-item">
                <Image 
                  style={{ cursor: 'pointer' }}
                  preview={{
                    mask: false
                  }}
                  src="/design/electrode/introduction/example1-1.png" 
                  alt="Electrode parameters configuration"
                  className="electrode-introduction-content__example-image"
                />
                <span className="electrode-introduction-content__example-image-caption">
                  {t('design.electrode.introduction.resultPrediction.image1Caption')}
                </span>
              </div>
              <div className="electrode-introduction-content__example-image-item">
                <Image 
                  style={{ cursor: 'pointer' }}
                  preview={{
                    mask: false
                  }}
                  src="/design/electrode/introduction/example1-2.png" 
                  alt="Cell performance prediction results"
                  className="electrode-introduction-content__example-image"
                />
                <span className="electrode-introduction-content__example-image-caption">
                  {t('design.electrode.introduction.resultPrediction.image2Caption')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Inverse Design Section */}
        {/* <div className="electrode-introduction-content__section">
          <h2 className="electrode-introduction-content__section-title">
            {t('design.electrode.introduction.inverseDesign.title')}
          </h2>
          <p className="electrode-introduction-content__paragraph">
            {t('design.electrode.introduction.inverseDesign.description1')}
          </p>
          <p className="electrode-introduction-content__paragraph">
            {t('design.electrode.introduction.inverseDesign.description2')}
          </p>
          <div className="electrode-introduction-content__example">
            <p className="electrode-introduction-content__example-title">
              {t('design.electrode.introduction.inverseDesign.exampleTitle')}
            </p>
            <p className="electrode-introduction-content__example-text">
              {t('design.electrode.introduction.inverseDesign.example')}
            </p>
            <div className="electrode-introduction-content__example-images-row">
              <div className="electrode-introduction-content__example-image-item">
                <Image
                  style={{ cursor: 'pointer' }}
                  preview={{
                    mask: false
                  }}
                  src="/design/electrode/introduction/example2-1.png"
                  alt="Inverse design example 1"
                  className="electrode-introduction-content__example-image"
                />
                <span className="electrode-introduction-content__example-image-caption">
                  {t('design.electrode.introduction.inverseDesign.image1Caption')}
                </span>
              </div>
              <div className="electrode-introduction-content__example-image-item">
                <Image
                  style={{ cursor: 'pointer' }}
                  preview={{
                    mask: false
                  }}
                  src="/design/electrode/introduction/example2-2.png"
                  alt="Inverse design example 2"
                  className="electrode-introduction-content__example-image"
                />
                <span className="electrode-introduction-content__example-image-caption">
                  {t('design.electrode.introduction.inverseDesign.image2Caption')}
                </span>
              </div>
              <div className="electrode-introduction-content__example-image-item">
                <Image
                  style={{ cursor: 'pointer' }}
                  preview={{
                    mask: false
                  }}
                  src="/design/electrode/introduction/example2-3.png"
                  alt="Inverse design example 3"
                  className="electrode-introduction-content__example-image"
                />
                <span className="electrode-introduction-content__example-image-caption">
                  {t('design.electrode.introduction.inverseDesign.image3Caption')}
                </span>
              </div>
            </div>
          </div>
        </div> */}
      </Image.PreviewGroup>
    </div>
  );
};

export default IntroductionContent;
