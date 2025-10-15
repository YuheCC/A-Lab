import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import './TutorialLink.css';

const TutorialLink: React.FC = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="tutorial-link-container">
        <span 
          className="tutorial-link-text"
          onClick={() => setShowModal(true)}
        >
          {/* <BookOpen size={16} className="tutorial-link-icon" /> */}
          {t('predictionTool.tutorial.button')}
        </span>
      </div>

      {/* Tutorial Modal */}
      {showModal && (
        <div className="tutorial-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tutorial-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="tutorial-modal-header">
              <h2 className="tutorial-modal-title">{t('predictionTool.tutorial.modalTitle')}</h2>
              <button
                className="tutorial-modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 5L5 15M5 5L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="tutorial-modal-content">
              {/* 图片和图片说明 */}
              <div className="tutorial-image-section">
                <img 
                  src="/predict/predictExampleChart.png" 
                  alt="Prediction Example Chart" 
                  className="tutorial-chart-image"
                />
                <p className="tutorial-image-caption">
                  {t('predictionTool.tutorial.imageCaption')}
                </p>
              </div>

              {/* 文字内容 */}
              <div className="tutorial-text-content">
                <ul className="tutorial-main-list">
                  <li>
                    {t('predictionTool.tutorial.point1')}
                    <ul className="tutorial-sub-list">
                      <li>{t('predictionTool.tutorial.point1_sub1')}</li>
                      <li>{t('predictionTool.tutorial.point1_sub2')}</li>
                    </ul>
                  </li>
                  <li>{t('predictionTool.tutorial.point2')}</li>
                  <li>
                    {t('predictionTool.tutorial.point3')}
                    <ul className="tutorial-sub-list">
                      <li>{t('predictionTool.tutorial.point3_sub1')}</li>
                    </ul>
                  </li>
                  <li>{t('predictionTool.tutorial.point4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TutorialLink;

