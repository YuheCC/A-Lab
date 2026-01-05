import React from 'react';
import './index.less';

interface ResultDisplayProps {
  label: string;
  value: number;
  unit: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, value, unit }) => {
  return (
    <div className="result-display">
      <div className="result-display__label">{label}</div>
      <div className="result-display__value-wrapper">
        <span className="result-display__value">{value}</span>
        <span className="result-display__unit">{unit}</span>
      </div>
    </div>
  );
};

export default ResultDisplay;
