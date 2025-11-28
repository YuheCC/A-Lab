import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const Introduction: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="prediction-introduction-container">
      <div className="introduction-image-section">
        <img
          src="/predict/predictExampleChart.png"
          alt="Prediction Example Chart"
          className="introduction-chart-image"
        />
        <p className="introduction-image-caption">
          {t('predictionTool.tutorial.imageCaption')}
        </p>
      </div>

      <div className="introduction-text-content">
        <ul className="introduction-main-list">
          <li>
            {t('predictionTool.tutorial.point1')}
            <ul className="introduction-sub-list">
              <li>{t('predictionTool.tutorial.point1_sub1')}</li>
              <li>{t('predictionTool.tutorial.point1_sub2')}</li>
            </ul>
          </li>
          <li>{t('predictionTool.tutorial.point2')}</li>
          <li>
            {t('predictionTool.tutorial.point3')}
            <ul className="introduction-sub-list">
              <li>{t('predictionTool.tutorial.point3_sub1')}</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Introduction;
