import React, { useState } from 'react';
import { useNavigate } from '@umijs/max';
import { useTranslation } from 'react-i18next';
import { Upload, Activity, BarChart3 } from 'lucide-react';
import StepContent from '../components/StepContent';
import './index.less';
import { LeftOutlined } from '@ant-design/icons';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const handleBackToList = () => {
    navigate('/predict?tab=records');
  };

  const handleNewPrediction = () => {
    // 重置所有状态
    setCurrentStep(0);
    setResetKey(prev => prev + 1);
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
          <h1 className="prediction-title">{t('predictionTool.create.title', 'New Prediction')}</h1>
          <div className="right-actions">
            <button className="new-prediction-button" onClick={handleNewPrediction}>
              {t('predictionTool.actions.newPrediction', 'New Prediction')}
            </button>
            <button className="back-button" onClick={handleBackToList}>
              <LeftOutlined style={{ marginRight: 8 }} />
              {t('predictionTool.actions.back', 'Back')}
            </button>
          </div>
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
            key={resetKey}
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
