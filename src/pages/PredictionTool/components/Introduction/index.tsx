import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

const Introduction: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="prediction-introduction-container">
      {/* Introduction Section */}
      <section className="introduction-section">
        <h2 className="section-title">{t('predictionTool.introduction.title')}</h2>
        <p className="section-paragraph">{t('predictionTool.introduction.paragraph1')}</p>
        <p className="section-paragraph">{t('predictionTool.introduction.paragraph2')}</p>
      </section>

      {/* Input Requirement Section */}
      <section className="introduction-section">
        <h2 className="section-title">{t('predictionTool.introduction.inputRequirement.title')}</h2>
        <p className="section-paragraph">{t('predictionTool.introduction.inputRequirement.paragraph1')}</p>
        <p className="section-paragraph">{t('predictionTool.introduction.inputRequirement.paragraph2')}</p>
        <ul className="section-list">
          <li>{t('predictionTool.introduction.inputRequirement.item1')}</li>
          <li>{t('predictionTool.introduction.inputRequirement.item2')}</li>
          <li>{t('predictionTool.introduction.inputRequirement.item3')}</li>
        </ul>
      </section>

      {/* Applicability Section */}
      <section className="introduction-section">
        <h2 className="section-title">{t('predictionTool.introduction.applicability.title')}</h2>
        <p className="section-paragraph">{t('predictionTool.introduction.applicability.paragraph1')}</p>
      </section>

      {/* Prediction Accuracy Section */}
      <section className="introduction-section">
        <h2 className="section-title">{t('predictionTool.introduction.predictionAccuracy.title')}</h2>
        <ul className="section-list">
          <li>{t('predictionTool.introduction.predictionAccuracy.item1')}</li>
          <li>{t('predictionTool.introduction.predictionAccuracy.item2')}</li>
        </ul>
      </section>

      {/* Example Section */}
      <section className="introduction-section">
        <h2 className="section-title">{t('predictionTool.introduction.example.title')}</h2>
        <div className="example-image-wrapper">
          <img
            src="/predict/predictExampleChartNew.png"
            alt="Prediction Example Chart"
            className="example-image"
          />
        </div>
        <p className="section-paragraph">{t('predictionTool.introduction.example.paragraph1')}</p>
        <p className="section-paragraph">{t('predictionTool.introduction.example.paragraph2')}</p>
      </section>
    </div>
  );
};

export default Introduction;
