import React from 'react';
import { Slider, InputNumber } from 'antd';
import './index.less';

interface ParameterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.01,
  disabled = false,
}) => {
  const handleSliderChange = (newValue: number) => {
    if (!disabled) {
      onChange(newValue);
    }
  };

  const handleInputChange = (newValue: number | null) => {
    if (!disabled && newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <div className={`parameter-input ${disabled ? 'parameter-input--disabled' : ''}`}>
      <div className="parameter-input__label">{label}</div>
      <div className="parameter-input__controls">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="parameter-input__slider"
        />
        <InputNumber
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className="parameter-input__number"
        />
      </div>
    </div>
  );
};

export default ParameterInput;
