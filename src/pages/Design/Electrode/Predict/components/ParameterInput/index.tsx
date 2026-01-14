import React from 'react';
import { Slider, InputNumber } from 'antd';
import './index.less';

interface ParameterInputProps {
  label: string;
  mode?: 'single' | 'range'; // 模式选择：单值或区间
  
  // 单值模式 props
  value?: number;
  onChange?: (value: number) => void;
  
  // 区间模式 props
  rangeValue?: [number, number];
  onRangeChange?: (value: [number, number]) => void;
  
  // 通用 props
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  
  // 差值限制（仅区间模式）
  minDiff?: number; // 最小差值
  maxDiff?: number; // 最大差值（可选）
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  label,
  mode = 'single',
  value,
  onChange,
  rangeValue,
  onRangeChange,
  min = 0,
  max = 10,
  step = 0.01,
  disabled = false,
  minDiff,
  maxDiff,
}) => {
  // 格式化数字：移除不必要的尾随零
  const formatNumber = (val: number | string | undefined): string => {
    if (val === undefined || val === null) return '';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '';
    // 使用 parseFloat 自动去除尾随零
    return String(parseFloat(num.toFixed(10)));
  };

  // 解析数字
  const parseNumber = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val) || 0;
  };
  // 区间模式：差值校验函数
  const validateRange = (newValue: [number, number]): [number, number] => {
    let [minVal, maxVal] = newValue;
    
    // 确保 max >= min
    if (maxVal < minVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }
    
    // 检查最小差值
    if (minDiff && (maxVal - minVal) < minDiff) {
      maxVal = minVal + minDiff;
    }
    
    // 检查最大差值
    if (maxDiff && (maxVal - minVal) > maxDiff) {
      maxVal = minVal + maxDiff;
    }
    
    // 确保在范围内
    if (maxVal > max) {
      maxVal = max;
      if (minDiff) {
        minVal = Math.max(min, maxVal - minDiff);
      }
    }
    
    if (minVal < min) {
      minVal = min;
      if (minDiff) {
        maxVal = Math.min(max, minVal + minDiff);
      }
    }
    
    return [minVal, maxVal];
  };

  // 单值模式：Slider 变化处理
  const handleSliderChange = (newValue: number) => {
    if (!disabled && onChange) {
      onChange(newValue);
    }
  };

  // 单值模式：输入框变化处理
  const handleInputChange = (newValue: number | null) => {
    if (!disabled && newValue !== null && onChange) {
      onChange(newValue);
    }
  };

  // 区间模式：Range Slider 变化处理
  const handleRangeSliderChange = (newValue: number | number[]) => {
    if (!disabled && onRangeChange && Array.isArray(newValue)) {
      const validatedRange = validateRange(newValue as [number, number]);
      onRangeChange(validatedRange);
    }
  };

  // 区间模式：输入框变化处理
  const handleRangeInputChange = (newValue: number | null, index: 0 | 1) => {
    if (!disabled && newValue !== null && rangeValue && onRangeChange) {
      const newRange: [number, number] = [...rangeValue] as [number, number];
      newRange[index] = newValue;
      const validatedRange = validateRange(newRange);
      onRangeChange(validatedRange);
    }
  };

  // 区间模式渲染
  if (mode === 'range') {
    const currentRangeValue = rangeValue || [min, max];
    
    return (
      <div className={`parameter-input parameter-input--range ${disabled ? 'parameter-input--disabled' : ''}`}>
        <div className="parameter-input__label">{label}</div>
        <div className="parameter-input__controls">
          <Slider
            range
            min={min}
            max={max}
            step={step}
            value={currentRangeValue}
            onChange={handleRangeSliderChange}
            disabled={disabled}
            className="parameter-input__slider parameter-input__slider--range"
          />
          <div className="parameter-input__range-inputs">
            <InputNumber
              min={min}
              max={currentRangeValue[1]}
              step={step}
              value={currentRangeValue[0]}
              onChange={(val) => handleRangeInputChange(val, 0)}
              disabled={disabled}
              className="parameter-input__number"
              formatter={formatNumber}
              parser={parseNumber}
            />
            <span className="parameter-input__range-separator">-</span>
            <InputNumber
              min={currentRangeValue[0]}
              max={max}
              step={step}
              value={currentRangeValue[1]}
              onChange={(val) => handleRangeInputChange(val, 1)}
              disabled={disabled}
              className="parameter-input__number"
              formatter={formatNumber}
              parser={parseNumber}
            />
          </div>
        </div>
      </div>
    );
  }

  // 单值模式渲染（默认）
  const currentValue = value || min;
  
  return (
    <div className={`parameter-input ${disabled ? 'parameter-input--disabled' : ''}`}>
      <div className="parameter-input__label">{label}</div>
      <div className="parameter-input__controls">
        <Slider
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleSliderChange}
          disabled={disabled}
          className="parameter-input__slider"
        />
        <InputNumber
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleInputChange}
          disabled={disabled}
          className="parameter-input__number"
          formatter={formatNumber}
          parser={parseNumber}
        />
      </div>
    </div>
  );
};

export default ParameterInput;
