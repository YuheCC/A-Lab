import React, { useState } from 'react';
import { Upload, Activity, BarChart3 } from 'lucide-react';
import StepContent from './components/StepContent';
import HistoryList from './components/HistoryList';
import './PredictionTool.css';

interface FileRecord {
  id: string;
  name: string;
  date: string;
  batteryCount: number;
  avgCirculation: string;
}

const mockFiles: FileRecord[] = [
  {
    id: '1',
    name: 'Battery_NCM811_Cycle_Data.csv',
    date: '2024/8/5 16:30:38',
    batteryCount: 5,
    avgCirculation: '285次'
  },
  {
    id: '2',
    name: 'LiFePO4_Degradation_Test.csv',
    date: '2024/8/5 15:45:22',
    batteryCount: 3,
    avgCirculation: '312次'
  },
  {
    id: '3',
    name: 'Battery_Thermal_Cycling.csv',
    date: '2024/8/5 14:12:15',
    batteryCount: 8,
    avgCirculation: '267次'
  }
];

const PredictionTool: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { 
      id: 'upload', 
      title: '数据上传',
      icon: Upload
    },
    { 
      id: 'ai-predict', 
      title: 'AI预测',
      icon: Activity
    },
    { 
      id: 'results', 
      title: '结果展示',
      icon: BarChart3
    }
  ];

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const handleNewPrediction = () => {
    setCurrentStep(0);
  };

  return (
    <div className="prediction-tool">
      {/* Header */}
      <div className="prediction-header">
        <h1 className="prediction-title">电池早期生命预测工具</h1>
        <span className="beta-tag">BETA</span>
      </div>

      {/* Content */}
      <div className="prediction-content">
        {/* Left - Operation Area */}
        <div className="operation-area">
          <div className="steps-container">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(index);
              
              return (
                <div 
                  key={step.id} 
                  className="step-item"
                  onClick={() => setCurrentStep(index)}
                  style={{ cursor: 'pointer' }}
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
          
          <StepContent activeStep={currentStep} onStepChange={setCurrentStep} />
        </div>

        {/* Right - History Area */}
        <HistoryList 
          files={mockFiles} 
          onNewPrediction={handleNewPrediction}
        />
      </div>
    </div>
  );
};

export default PredictionTool;