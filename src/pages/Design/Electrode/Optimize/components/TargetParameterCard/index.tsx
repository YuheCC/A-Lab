import React, { useState, useEffect, useMemo, useId } from 'react';
import { Slider, InputNumber } from 'antd';
import './index.less';

interface TargetParameterCardProps {
  title: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** 预计算的曲线数据（x 已映射到 [min,max]，y 已归一化到 [0,1]），优先于 data 使用 */
  curveData?: { x: number; y: number }[];
  /** 原始数据点，用于在组件内进行 KDE 计算（curveData 不存在时使用） */
  data?: number[];
  minDiff?: number;
}

// KDE 密度曲线计算（纯函数，只依赖 data 和范围）
const calculateKDE = (data: number[], min: number, max: number, points: number = 100) => {
  if (!data || data.length === 0) return null;

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const sigma = Math.sqrt(variance);

  // Silverman's rule 带宽
  const bandwidth = 1.06 * sigma * Math.pow(data.length, -1 / 5);

  const stepSize = (max - min) / (points - 1);
  const kdePoints: { x: number; y: number }[] = [];

  for (let i = 0; i < points; i++) {
    const x = min + i * stepSize;
    let density = 0;
    for (const dataPoint of data) {
      const u = (x - dataPoint) / bandwidth;
      density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }
    density = density / (data.length * bandwidth);
    kdePoints.push({ x, y: density });
  }

  // 归一化 y 值到 [0, 1]
  const maxDensity = Math.max(...kdePoints.map(p => p.y));
  if (maxDensity > 0) {
    kdePoints.forEach(p => {
      p.y = p.y / maxDensity;
    });
  }

  return kdePoints;
};

// 在 KDE 数据中插值获取指定 x 位置的 y 值
const interpolateY = (kdeData: { x: number; y: number }[], targetX: number): number => {
  if (kdeData.length === 0) return 0;

  if (targetX <= kdeData[0].x) return kdeData[0].y;
  if (targetX >= kdeData[kdeData.length - 1].x) return kdeData[kdeData.length - 1].y;

  for (let i = 0; i < kdeData.length - 1; i++) {
    if (targetX >= kdeData[i].x && targetX <= kdeData[i + 1].x) {
      const t = (targetX - kdeData[i].x) / (kdeData[i + 1].x - kdeData[i].x);
      return kdeData[i].y + t * (kdeData[i + 1].y - kdeData[i].y);
    }
  }

  return 0;
};

// SVG 尺寸常量
const SVG_VIEW_HEIGHT = 70; // SVG viewBox 高度（纯曲线区域）
const CURVE_TOP_PADDING = 6; // 曲线顶部留白，避免裁切

const TargetParameterCard: React.FC<TargetParameterCardProps> = ({
  title,
  min,
  max,
  step,
  value,
  onChange,
  curveData,
  data,
  minDiff,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const [internalValue, setInternalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 优先使用预计算的 curveData，否则从原始 data 进行 KDE 计算
  const kdeData = useMemo(() => {
    if (curveData && curveData.length > 0) return curveData;
    if (!data || data.length === 0) return null;
    return calculateKDE(data, min, max);
  }, [curveData, data, min, max]);

  // 根据 kdeData 生成 SVG 曲线路径（仅依赖 kdeData，不受 slider 影响）
  const curvePath = useMemo(() => {
    if (!kdeData || kdeData.length === 0) return '';

    const points = kdeData.map((point) => {
      const xPercent = ((point.x - min) / (max - min)) * 100;
      // 曲线基线 = SVG_VIEW_HEIGHT，峰值向上延伸
      const y = SVG_VIEW_HEIGHT - point.y * (SVG_VIEW_HEIGHT - CURVE_TOP_PADDING);
      return `${xPercent},${y}`;
    });

    return `M 0,${SVG_VIEW_HEIGHT} L ${points.join(' L ')} L 100,${SVG_VIEW_HEIGHT} Z`;
  }, [kdeData, min, max]);

  // 验证范围值
  const validateRange = (newValue: [number, number]): [number, number] => {
    let [minVal, maxVal] = newValue;

    minVal = Math.max(min, Math.min(max, minVal));
    maxVal = Math.max(min, Math.min(max, maxVal));

    if (minVal > maxVal) {
      [minVal, maxVal] = [maxVal, minVal];
    }

    if (minDiff && maxVal - minVal < minDiff) {
      const newMaxVal = minVal + minDiff;
      if (newMaxVal <= max) {
        maxVal = newMaxVal;
      } else {
        maxVal = max;
        minVal = Math.max(min, maxVal - minDiff);
      }
    }

    return [minVal, maxVal];
  };

  const handleSliderChange = (newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      const validatedValue = validateRange(newValue as [number, number]);
      setInternalValue(validatedValue);
      onChange(validatedValue);
    }
  };

  const handleInputChange = (newValue: number | null, index: 0 | 1) => {
    if (newValue !== null) {
      const newRange: [number, number] = [...internalValue] as [number, number];
      newRange[index] = newValue;
      setInternalValue(newRange);
    }
  };

  const handleInputBlur = () => {
    const validatedValue = validateRange(internalValue);
    setInternalValue(validatedValue);
    onChange(validatedValue);
  };

  // 计算参考线（仅参考线随 slider 值变化，曲线不变）
  const referenceLines = useMemo(() => {
    if (!kdeData || kdeData.length === 0) return [];

    return [internalValue[0], internalValue[1]].map((val) => {
      const xPercent = ((val - min) / (max - min)) * 100;
      const yNormalized = interpolateY(kdeData, val);
      const yPos = SVG_VIEW_HEIGHT - yNormalized * (SVG_VIEW_HEIGHT - CURVE_TOP_PADDING);

      return { x: xPercent, topY: yPos, bottomY: SVG_VIEW_HEIGHT };
    });
  }, [kdeData, internalValue, min, max]);

  const formatNumber = (val: number | string | undefined): string => {
    if (val === undefined || val === null) return '';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '';
    return String(parseFloat(num.toFixed(10)));
  };

  const parseNumber = (val: string | undefined): number => {
    if (!val) return 0;
    return parseFloat(val) || 0;
  };

  const hasChart = kdeData && kdeData.length > 0;

  return (
    <div className="target-parameter-card">
      {/* 标题和输入框 */}
      <div className="target-parameter-card__header">
        <div className="target-parameter-card__title">{title}</div>
        <div className="target-parameter-card__inputs">
          <InputNumber
            value={internalValue[0]}
            onChange={(val) => handleInputChange(val, 0)}
            onBlur={handleInputBlur}
            onPressEnter={handleInputBlur}
            step={step}
            className="target-parameter-card__input"
            formatter={formatNumber}
            parser={parseNumber}
          />
          <span className="target-parameter-card__separator">-</span>
          <InputNumber
            value={internalValue[1]}
            onChange={(val) => handleInputChange(val, 1)}
            onBlur={handleInputBlur}
            onPressEnter={handleInputBlur}
            step={step}
            className="target-parameter-card__input"
            formatter={formatNumber}
            parser={parseNumber}
          />
        </div>
      </div>

      {/* 曲线 + Slider 合体区域 */}
      <div className="target-parameter-card__body">
        {hasChart && (
          <svg
            className="target-parameter-card__svg"
            viewBox={`0 0 100 ${SVG_VIEW_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`kde-grad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#56B26A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#56B26A" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* 填充曲线 */}
            <path
              d={curvePath}
              fill={`url(#kde-grad-${uniqueId})`}
              stroke="#56B26A"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* 参考线 */}
            {referenceLines.map((line, index) => (
              <line
                key={index}
                x1={line.x}
                y1={line.bottomY}
                x2={line.x}
                y2={line.topY}
                stroke="#56B26A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}

        {/* Range Slider - 通过负 margin 上移与曲线基线重合 */}
        <div className="target-parameter-card__slider-wrapper">
          <Slider
            range
            min={min}
            max={max}
            step={step}
            value={internalValue}
            onChange={handleSliderChange}
            className="target-parameter-card__slider"
          />
        </div>
      </div>
    </div>
  );
};

export default TargetParameterCard;
