import React from 'react';
import { useTranslation } from 'react-i18next';
import './index.less';

interface StepIndicatorProps {
  currentStep: number; // 1, 2, 3
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const { t } = useTranslation();

  const steps = [
    { number: 1, label: t('manufacturing.steps.upload') },
    { number: 2, label: t('manufacturing.steps.detection') },
    { number: 3, label: t('manufacturing.steps.results') },
  ];

  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div
          key={step.number}
          className={`step-item ${
            step.number < currentStep
              ? 'completed'
              : step.number === currentStep
              ? 'active'
              : ''
          }`}
        >
          <div className="step-number">{step.number}</div>
          <span className="step-label">{step.label}</span>
          {index < steps.length - 1 && <div className="step-line"></div>}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
