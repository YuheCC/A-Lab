import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import './index.less';

interface ResultDisplayProps {
  label: string;
  value: number;
  unit: string;
  tooltip?: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ label, value, unit, tooltip }) => {
  return (
    <div className="result-display">
      <div className="result-display__label">
        {label}
        {tooltip && (
          <Tooltip title={tooltip} placement="top" overlayStyle={{ maxWidth: 400 }}>
            <InfoCircleOutlined className="result-display__info-icon" />
          </Tooltip>
        )}
      </div>
      <div className="result-display__value-wrapper">
        <span className="result-display__value">{value}</span>
        <span className="result-display__unit">{unit}</span>
      </div>
    </div>
  );
};

export default ResultDisplay;
