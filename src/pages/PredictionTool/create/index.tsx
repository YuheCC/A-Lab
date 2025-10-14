import React, { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Upload, Activity, BarChart3, Info } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';
import StepContent from '../components/StepContent';
import './index.less';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const handleBackToList = () => {
    navigate('/predict?tab=records');
  };

  const handlePredictionComplete = () => {
    // 预测完成后的回调
    console.log('Prediction completed');
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const steps = [
    {
      id: 'upload',
      title: t('predictionTool.steps.upload'),
      icon: Upload
    },
    {
      id: 'ai-predict',
      title: t('predictionTool.steps.aiPredict'),
      icon: Activity
    },
    {
      id: 'results',
      title: t('predictionTool.steps.results'),
      icon: BarChart3
    }
  ];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="create-page-container">
      <div className="create-content">
        <div className="create-actions">
          <div className="prediction-header-wrapper">
            <h1 className="prediction-title">{t('predictionTool.title')}</h1>
            <InfoTooltip
              title={
                <div style={{ maxWidth: '320px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={{ color: 'red' }}>{t('predictionTool.disclaimerTitle')}</strong>
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    {t('predictionTool.disclaimer')}
                  </div>
                </div>
              }
              placement="bottom"
            >
              <Info size={20} style={{ color: '#64748b', cursor: 'pointer' }} />
            </InfoTooltip>
          </div>
          <button className="back-to-list-button" onClick={handleBackToList}>
            {t('predictionTool.actions.backToList', 'Back to List')}
          </button>
        </div>

        <div className="prediction-subtitle-wrapper">
          <p className="prediction-subtitle">
            {t('predictionTool.subtitle')}
          </p>
        </div>

        <div className="operation-area">
          <div className="steps-container">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(index);

              return (
                <div
                  key={step.id}
                  className="step-item"
                  style={{ cursor: 'default' }}
                >
                  <div className={`step-icon ${status}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`step-text ${status}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          <StepContent
            activeStep={currentStep}
            onStepChange={setCurrentStep}
            onPredictionComplete={handlePredictionComplete}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
