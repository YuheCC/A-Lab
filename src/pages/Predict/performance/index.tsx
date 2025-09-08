import React, { useState } from 'react';
import PredictionModule from './components/PredictionModule';
import UniversalHistoryModule from '../components/UniversalHistoryModule';
import { renderPerformanceCard } from './components/PerformanceCardRenderer';
import ResultModal from './components/ResultModal';
import './index.css';

interface PredictionResult {
  id: string;
  date: string;
  batterySystem: string;
  additive: string;
  results: {
    temp25: {
      cycleLife: string;
      ce: string;
      ratePerformance: string;
    };
    temp45: {
      cycleLife: string;
      ce: string;
    };
  };
  llmAnalysis: {
    optimization: string;
    cycling: string;
  };
}

const PerformancePage: React.FC = () => {
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock history data
  const historyData: PredictionResult[] = [
    {
      id: '1',
      date: '2025/9/4 16:16:06',
      batterySystem: 'NCM811 - 12%Si/graphite - Carbonate electrolyte',
      additive: 'CC(C)(C)OCCOC(C)(C)C',
      results: {
        temp25: {
          cycleLife: 'Positive',
          ce: 'Positive',
          ratePerformance: 'Positive'
        },
        temp45: {
          cycleLife: 'Positive',
          ce: 'Positive'
        }
      },
      llmAnalysis: {
        optimization: 'Nickel Dehydrogenation Optimization',
        cycling: '4°C Cycling Optimization'
      }
    },
    {
      id: '2',
      date: '2025/9/3 16:16:06',
      batterySystem: 'NCM811 - 100%Si - Carbonate electrolyte',
      additive: 'CCOCC',
      results: {
        temp25: {
          cycleLife: 'Positive',
          ce: 'Positive',
          ratePerformance: 'Positive'
        },
        temp45: {
          cycleLife: 'Positive',
          ce: 'Positive'
        }
      },
      llmAnalysis: {
        optimization: 'Silicon Electrode Optimization',
        cycling: 'Temperature Cycling Optimization'
      }
    },
    {
      id: '3',
      date: '2025/9/2 16:16:06',
      batterySystem: 'NCM811 - 12%Si/graphite - Carbonate electrolyte',
      additive: 'O=C1OCCO1',
      results: {
        temp25: {
          cycleLife: 'Positive',
          ce: 'Negative',
          ratePerformance: 'Positive'
        },
        temp45: {
          cycleLife: 'Negative',
          ce: 'Negative'
        }
      },
      llmAnalysis: {
        optimization: 'Electrolyte Optimization',
        cycling: 'Capacity Retention Optimization'
      }
    },
    {
      id: '4',
      date: '2025/9/1 16:16:06',
      batterySystem: 'LFP - 10%Si/graphite - Solid electrolyte',
      additive: 'CCC(C)OC(C)C',
      results: {
        temp25: {
          cycleLife: 'Neutral',
          ce: 'Positive',
          ratePerformance: 'Neutral'
        },
        temp45: {
          cycleLife: 'Neutral',
          ce: 'Negative'
        }
      },
      llmAnalysis: {
        optimization: 'Balanced Performance',
        cycling: '50% Efficiency Target'
      }
    }
  ];

  const handleViewDetails = (result: PredictionResult) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedResult(null);
  };

  return (
    <div className="performance-page">
      <div className="page-header">
        <h1>Cell performance prediction with additive molecules</h1>
        <span className="beta-badge">BETA</span>
      </div>
      
      <div className="page-content">
        <div className="prediction-section">
          <PredictionModule />
        </div>
        
        <div className="history-section">
          <UniversalHistoryModule
            title="Prediction Records"
            data={historyData}
            cardRenderer={renderPerformanceCard}
            onViewDetails={handleViewDetails}
            newPredictionText="New Prediction"
          />
        </div>
      </div>

      {showModal && selectedResult && (
        <ResultModal 
          result={selectedResult}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default PerformancePage;