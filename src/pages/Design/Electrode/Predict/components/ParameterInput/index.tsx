import React, { useState, useEffect, useRef } from 'react';
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
  readonly?: boolean; // 只读状态（无透明度）

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
  readonly = false,
  minDiff,
  maxDiff,
}) => {
  // 是否禁用交互（disabled 或 readonly 都禁用交互）
  const isDisabled = disabled || readonly;

  // 区间模式：内部状态用于存储输入过程中的值，避免输入被打断
  const [internalRangeValue, setInternalRangeValue] = useState<[number, number]>(
    rangeValue || [min, max]
  );

  // 使用 ref 同步跟踪最新的内部值，解决闭包陷阱问题
  const internalRangeValueRef = useRef<[number, number]>(internalRangeValue);

  // 更新内部状态的同时更新 ref
  const updateInternalRangeValue = (newValue: [number, number]) => {
    internalRangeValueRef.current = newValue;
    setInternalRangeValue(newValue);
  };

  // 同步外部值到内部状态
  useEffect(() => {
    if (rangeValue) {
      internalRangeValueRef.current = rangeValue;
      setInternalRangeValue(rangeValue);
    }
  }, [rangeValue]);

  // 获取样式类名
  const getStateClassName = () => {
    if (readonly) return 'parameter-input--readonly';
    if (disabled) return 'parameter-input--disabled';
    return '';
  };
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

    // 1. 先将两个值限制在 [min, max] 范围内
    minVal = Math.max(min, Math.min(max, minVal));
    maxVal = Math.max(min, Math.min(max, maxVal));

    // 2. 确保 maxVal >= minVal
    if (maxVal < minVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }

    // 3. 检查最小差值（差值不够时，优先调整 maxVal）
    if (minDiff && (maxVal - minVal) < minDiff) {
      // 尝试增加 maxVal
      const newMaxVal = minVal + minDiff;
      if (newMaxVal <= max) {
        maxVal = newMaxVal;
      } else {
        // maxVal 超出边界，则减少 minVal
        maxVal = max;
        minVal = Math.max(min, maxVal - minDiff);
      }
    }

    // 4. 检查最大差值
    if (maxDiff && (maxVal - minVal) > maxDiff) {
      maxVal = minVal + maxDiff;
    }

    return [minVal, maxVal];
  };

  // 单值模式：Slider 变化处理
  const handleSliderChange = (newValue: number) => {
    if (!isDisabled && onChange) {
      onChange(newValue);
    }
  };

  // 单值模式：输入框变化处理
  const handleInputChange = (newValue: number | null) => {
    if (!isDisabled && newValue !== null && onChange) {
      onChange(newValue);
    }
  };

  // 区间模式：Range Slider 变化处理（Slider 即时校验并更新）
  const handleRangeSliderChange = (newValue: number | number[]) => {
    if (!isDisabled && Array.isArray(newValue)) {
      const validatedRange = validateRange(newValue as [number, number]);
      updateInternalRangeValue(validatedRange);
      if (onRangeChange) {
        onRangeChange(validatedRange);
      }
    }
  };

  // 区间模式：输入框变化处理（只更新内部状态，不触发校验）
  const handleRangeInputChange = (newValue: number | null, index: 0 | 1) => {
    if (!isDisabled && newValue !== null) {
      const newRange: [number, number] = [...internalRangeValueRef.current] as [number, number];
      newRange[index] = newValue;
      updateInternalRangeValue(newRange);
    }
  };

  // 区间模式：输入框失焦处理（进行校验并同步到父组件）
  const handleRangeInputBlur = () => {
    if (!isDisabled && onRangeChange) {
      // 使用 ref 获取最新值，避免闭包陷阱
      const validatedRange = validateRange(internalRangeValueRef.current);
      updateInternalRangeValue(validatedRange);
      onRangeChange(validatedRange);
    }
  };

  // 区间模式渲染
  if (mode === 'range') {
    // Slider 使用外部值（只在失焦后更新），InputNumber 使用内部状态（允许自由输入）
    const sliderValue = rangeValue || [min, max];

    return (
      <div className={`parameter-input parameter-input--range ${getStateClassName()}`}>
        <div className="parameter-input__label">{label}</div>
        <div className="parameter-input__controls">
          <Slider
            range
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={handleRangeSliderChange}
            disabled={isDisabled}
            className="parameter-input__slider parameter-input__slider--range"
          />
          <div className="parameter-input__range-inputs">
            <InputNumber
              step={step}
              value={internalRangeValue[0]}
              onChange={(val) => handleRangeInputChange(val, 0)}
              onBlur={handleRangeInputBlur}
              onPressEnter={handleRangeInputBlur}
              disabled={isDisabled}
              className="parameter-input__number"
              formatter={formatNumber}
              parser={parseNumber}
            />
            <span className="parameter-input__range-separator">-</span>
            <InputNumber
              step={step}
              value={internalRangeValue[1]}
              onChange={(val) => handleRangeInputChange(val, 1)}
              onBlur={handleRangeInputBlur}
              onPressEnter={handleRangeInputBlur}
              disabled={isDisabled}
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
    <div className={`parameter-input ${getStateClassName()}`}>
      <div className="parameter-input__label">{label}</div>
      <div className="parameter-input__controls">
        <Slider
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleSliderChange}
          disabled={isDisabled}
          className="parameter-input__slider"
        />
        <InputNumber
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleInputChange}
          disabled={isDisabled}
          className="parameter-input__number"
          formatter={formatNumber}
          parser={parseNumber}
        />
      </div>
    </div>
  );
};

export default ParameterInput;
