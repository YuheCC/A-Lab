import React, { useMemo, useState } from 'react';
import { Checkbox } from 'antd';
import type { EChartsOption } from 'echarts';
import { useTranslation } from 'react-i18next';
import EchartsReact from '@/components/EchartsReact';
import './index.less';

export type TrendChartFieldKey =
  | 'no'
  | 'designCapacity'
  | 'specificEnergy'
  | 'thickness'
  | 'volumetricEnergyDensity'
  | 'cathodeBinderWt'
  | 'cathodeCntWt'
  | 'cathodeConductiveCarbonWt'
  | 'cathodeArealLoading'
  | 'cathodePressDensity'
  | 'anodeBinder1Wt'
  | 'anodeBinder2Wt'
  | 'anodeBinder3Wt'
  | 'anodeConductiveCarbonWt'
  | 'anodeCntWt'
  | 'anodePressDensity';
export type TrendChartXAxisKey = TrendChartFieldKey;
export type TrendChartYAxisKey = TrendChartFieldKey;

export interface RecommendationTrendDatum {
  no: number;
  designCapacity: number;
  specificEnergy: number;
  thickness: number;
  volumetricEnergyDensity: number;
  cathodeBinderWt: number;
  cathodeCntWt: number;
  cathodeConductiveCarbonWt: number;
  cathodeArealLoading: number;
  cathodePressDensity: number;
  anodeBinder1Wt: number;
  anodeBinder2Wt: number;
  anodeBinder3Wt: number;
  anodeConductiveCarbonWt: number;
  anodeCntWt: number;
  anodePressDensity: number;
}

interface RecommendationTrendChartProps {
  data: RecommendationTrendDatum[];
  title?: string;
  defaultXAxis?: TrendChartFieldKey;
  defaultYAxes?: TrendChartFieldKey[];
  className?: string;
}

// 轴可选个数配置：当前都为 1，后续放开只需改这里
const X_AXIS_SELECTION_LIMIT = 1;
const Y_AXIS_SELECTION_LIMIT = 1;
const DEFAULT_X_AXIS: TrendChartFieldKey = 'designCapacity';
const DEFAULT_Y_AXIS: TrendChartFieldKey = 'specificEnergy';

const AXIS_FIELD_KEYS: TrendChartFieldKey[] = [
  'no',
  'designCapacity',
  'specificEnergy',
  'thickness',
  'volumetricEnergyDensity',
  'cathodeBinderWt',
  'cathodeCntWt',
  'cathodeConductiveCarbonWt',
  'cathodeArealLoading',
  'cathodePressDensity',
  'anodeBinder1Wt',
  'anodeBinder2Wt',
  'anodeBinder3Wt',
  'anodeConductiveCarbonWt',
  'anodeCntWt',
  'anodePressDensity',
];

const FIELD_META: Record<TrendChartFieldKey, { unit: string; color: string }> = {
  no: { unit: '', color: '#6b7280' },
  designCapacity: { unit: 'Ah', color: '#8b5cf6' },
  specificEnergy: { unit: 'Wh/kg', color: '#56B26A' },
  thickness: { unit: 'mm', color: '#3b82f6' },
  volumetricEnergyDensity: { unit: 'Wh/L', color: '#f59e0b' },
  cathodeBinderWt: { unit: 'wt.%', color: '#10b981' },
  cathodeCntWt: { unit: 'wt.%', color: '#14b8a6' },
  cathodeConductiveCarbonWt: { unit: 'wt.%', color: '#06b6d4' },
  cathodeArealLoading: { unit: 'mAh/cm²', color: '#0ea5e9' },
  cathodePressDensity: { unit: 'g/cc', color: '#0284c7' },
  anodeBinder1Wt: { unit: 'wt.%', color: '#84cc16' },
  anodeBinder2Wt: { unit: 'wt.%', color: '#65a30d' },
  anodeBinder3Wt: { unit: 'wt.%', color: '#a3e635' },
  anodeConductiveCarbonWt: { unit: 'wt.%', color: '#f97316' },
  anodeCntWt: { unit: 'wt.%', color: '#ea580c' },
  anodePressDensity: { unit: 'g/cc', color: '#fb7185' },
};

const isValidField = (value?: string): value is TrendChartFieldKey =>
  !!value && AXIS_FIELD_KEYS.includes(value as TrendChartFieldKey);

const getFirstAvailableField = (
  excluded: TrendChartFieldKey[],
  preferred: TrendChartFieldKey,
): TrendChartFieldKey => {
  if (!excluded.includes(preferred)) {
    return preferred;
  }
  return AXIS_FIELD_KEYS.find((field) => !excluded.includes(field)) || preferred;
};

const sanitizeDefaultYAxes = (
  defaultYAxes: TrendChartFieldKey[] | undefined,
  selectedXAxis: TrendChartFieldKey,
): TrendChartFieldKey[] => {
  const deduplicated = Array.from(new Set(defaultYAxes || [])).filter(
    (key): key is TrendChartFieldKey => isValidField(key) && key !== selectedXAxis,
  );

  if (deduplicated.length > 0) {
    return deduplicated.slice(0, Y_AXIS_SELECTION_LIMIT);
  }

  return [getFirstAvailableField([selectedXAxis], DEFAULT_Y_AXIS)];
};

const formatNumber = (value: number): string => value.toFixed(2);

const RecommendationTrendChart: React.FC<RecommendationTrendChartProps> = ({
  data,
  title,
  defaultXAxis = DEFAULT_X_AXIS,
  defaultYAxes = [DEFAULT_Y_AXIS],
  className = '',
}) => {
  const { t } = useTranslation();

  const initialXAxis = isValidField(defaultXAxis) ? defaultXAxis : DEFAULT_X_AXIS;
  const [selectedXAxis, setSelectedXAxis] = useState<TrendChartFieldKey>(initialXAxis);
  const [selectedYAxes, setSelectedYAxes] = useState<TrendChartFieldKey[]>(
    sanitizeDefaultYAxes(defaultYAxes, initialXAxis),
  );

  const normalizedData = useMemo(
    () =>
      data.filter(
        (item) =>
          Number.isFinite(item.no) &&
          Number.isFinite(item.designCapacity) &&
          Number.isFinite(item.specificEnergy) &&
          Number.isFinite(item.thickness) &&
          Number.isFinite(item.volumetricEnergyDensity) &&
          Number.isFinite(item.cathodeBinderWt) &&
          Number.isFinite(item.cathodeCntWt) &&
          Number.isFinite(item.cathodeConductiveCarbonWt) &&
          Number.isFinite(item.cathodeArealLoading) &&
          Number.isFinite(item.cathodePressDensity) &&
          Number.isFinite(item.anodeBinder1Wt) &&
          Number.isFinite(item.anodeBinder2Wt) &&
          Number.isFinite(item.anodeBinder3Wt) &&
          Number.isFinite(item.anodeConductiveCarbonWt) &&
          Number.isFinite(item.anodeCntWt) &&
          Number.isFinite(item.anodePressDensity),
      ),
    [data],
  );

  const getFieldLabel = (key: TrendChartFieldKey): string => {
    if (key === 'no') {
      return t('design.electrode.optimize.no', 'No.');
    }
    if (key === 'designCapacity') {
      return `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`;
    }
    if (key === 'specificEnergy') {
      return `${t('design.electrode.optimize.specificEnergy', 'Gravimetric Energy Density')} (Wh/kg)`;
    }
    if (key === 'thickness') {
      return `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`;
    }
    if (key === 'volumetricEnergyDensity') {
      return `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric Energy Density')} (Wh/L)`;
    }
    if (key === 'cathodeBinderWt') {
      return 'PVDF (wt.%)';
    }
    if (key === 'cathodeCntWt') {
      return 'Cathode CNT (wt.%)';
    }
    if (key === 'cathodeConductiveCarbonWt') {
      return 'Cathode Carbon black (wt.%)';
    }
    if (key === 'cathodeArealLoading') {
      return 'Cathode Areal Loading (mAh/cm²)';
    }
    if (key === 'cathodePressDensity') {
      return 'Cathode Press Density (g/cc)';
    }
    if (key === 'anodeBinder1Wt') {
      return 'CMC (wt.%)';
    }
    if (key === 'anodeBinder2Wt') {
      return 'SBR (wt.%)';
    }
    if (key === 'anodeBinder3Wt') {
      return 'PAA (wt.%)';
    }
    if (key === 'anodeConductiveCarbonWt') {
      return 'Anode Carbon black (wt.%)';
    }
    if (key === 'anodeCntWt') {
      return 'Anode CNT (wt.%)';
    }
    return 'Anode Press Density (g/cc)';
  };

  const xAxisOptions = useMemo(
    () => AXIS_FIELD_KEYS.map((key) => ({ value: key, label: getFieldLabel(key) })),
    [t],
  );

  const yAxisOptions = useMemo(
    () => AXIS_FIELD_KEYS.map((key) => ({ value: key, label: getFieldLabel(key) })),
    [t],
  );

  const handleXAxisCheckboxChange = (value: TrendChartFieldKey, checked: boolean) => {
    if (X_AXIS_SELECTION_LIMIT <= 0) {
      return;
    }

    if (checked) {
      if (selectedYAxes.includes(value)) {
        return;
      }
      setSelectedXAxis(value);
      return;
    }

    const fallback = getFirstAvailableField(selectedYAxes, DEFAULT_X_AXIS);
    setSelectedXAxis(fallback);
  };

  const handleYAxisCheckboxChange = (value: TrendChartFieldKey, checked: boolean) => {
    if (checked) {
      if (value === selectedXAxis) {
        return;
      }
      if (selectedYAxes.includes(value)) {
        return;
      }
      if (selectedYAxes.length >= Y_AXIS_SELECTION_LIMIT) {
        // 常用交互：达到上限时，勾选新项直接替换旧项
        if (Y_AXIS_SELECTION_LIMIT === 1) {
          setSelectedYAxes([value]);
          return;
        }
        setSelectedYAxes([...selectedYAxes.slice(1), value]);
        return;
      }
      setSelectedYAxes([...selectedYAxes, value].slice(0, Y_AXIS_SELECTION_LIMIT));
      return;
    }

    if (!selectedYAxes.includes(value)) {
      return;
    }

    // 保持至少 1 个 Y 轴
    if (selectedYAxes.length === 1) {
      return;
    }

    const nextValues = selectedYAxes.filter((item) => item !== value);
    setSelectedYAxes(nextValues);
  };

  const isXAxisOptionDisabled = (value: TrendChartFieldKey): boolean =>
    X_AXIS_SELECTION_LIMIT <= 0 || (selectedYAxes.includes(value) && selectedXAxis !== value);

  const isYAxisOptionDisabled = (value: TrendChartFieldKey): boolean =>
    value === selectedXAxis && !selectedYAxes.includes(value);

  const buildChartOption = (): EChartsOption => {
    const xAxisName = getFieldLabel(selectedXAxis);
    const activeYAxes = selectedYAxes.slice(0, Y_AXIS_SELECTION_LIMIT);
    const isDualAxis = activeYAxes.length === 2;

    const yAxisConfig = activeYAxes.map((key, index) => {
      const label = getFieldLabel(key);
      return {
        type: 'value' as const,
        name: label,
        position: index === 0 ? ('left' as const) : ('right' as const),
        nameLocation: 'middle' as const,
        nameRotate: index === 0 ? 90 : 270,
        nameGap: index === 0 ? 56 : 64,
        nameTextStyle: {
          fontSize: 11,
          color: '#374151',
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: '#d1d5db',
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#d1d5db',
          },
        },
        splitLine:
          index === 1
            ? { show: false }
            : {
                lineStyle: {
                  color: '#e5e7eb',
                  type: 'solid',
                },
              },
        axisLabel: {
          color: '#374151',
          fontSize: 12,
          formatter: (value: number) => formatNumber(value),
        },
      };
    });

    const series = activeYAxes.map((key, index) => ({
      name: getFieldLabel(key),
      type: 'scatter' as const,
      symbol: 'circle' as const,
      showSymbol: true,
      symbolSize: 8,
      yAxisIndex: index,
      data:
        selectedXAxis === 'no'
          ? normalizedData.map((item) => [String(item.no), item[key]])
          : normalizedData.map((item) => [item[selectedXAxis], item[key]]),
      itemStyle: {
        color: FIELD_META[key].color,
        borderWidth: 2,
        borderColor: '#fff',
      },
    }));

    return {
      color: activeYAxes.map((key) => FIELD_META[key].color),
      legend: {
        top: 0,
        data: activeYAxes.map((key) => getFieldLabel(key)),
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937',
          fontSize: 12,
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) {
            return '';
          }

          const firstParam = params[0];
          const xValue =
            selectedXAxis === 'no'
              ? `${getFieldLabel(selectedXAxis)}: ${firstParam.axisValue}`
              : `${getFieldLabel(selectedXAxis)}: ${formatNumber(Number(firstParam.axisValue))}`;

          const lines = [xValue];
          params.forEach((param: any) => {
            const yValueRaw = Array.isArray(param.value) ? param.value[1] : param.value;
            const yValue = formatNumber(Number(yValueRaw));
            const yKey = activeYAxes[param.seriesIndex];
            const unit = yKey ? FIELD_META[yKey].unit : '';
            lines.push(`${param.marker}${param.seriesName}: ${yValue} ${unit}`);
          });

          return lines.join('<br/>');
        },
      },
      grid: {
        left: 68,
        right: isDualAxis ? 88 : 28,
        top: 52,
        bottom: 50,
      },
      xAxis:
        selectedXAxis === 'no'
          ? {
              type: 'category',
              name: xAxisName,
              nameLocation: 'middle',
              nameGap: 32,
              boundaryGap: false,
              data: normalizedData.map((item) => String(item.no)),
              nameTextStyle: {
                fontSize: 12,
                color: '#374151',
              },
              axisLine: {
                lineStyle: {
                  color: '#d1d5db',
                },
              },
              axisLabel: {
                color: '#374151',
                fontSize: 12,
              },
            }
          : {
              type: 'value',
              scale: true,
              name: xAxisName,
              nameLocation: 'middle',
              nameGap: 32,
              nameTextStyle: {
                fontSize: 12,
                color: '#374151',
              },
              axisLine: {
                lineStyle: {
                  color: '#d1d5db',
                },
              },
              axisLabel: {
                color: '#374151',
                fontSize: 12,
                formatter: (value: number) => formatNumber(value),
              },
            },
      yAxis: yAxisConfig,
      series,
    };
  };

  const trendTitle = title || t('design.electrode.optimize.trendChartTitle', 'Recommendation Trend Chart');
  const chartOption = buildChartOption();

  return (
    <div className={`recommendation-trend-chart ${className}`.trim()}>
      <h3 className="recommendation-trend-chart__title">{trendTitle}</h3>

      <div className="recommendation-trend-chart__controls">
        <div className="recommendation-trend-chart__control-row">
          <label className="recommendation-trend-chart__control-label">
            {t('design.electrode.optimize.xAxisLabel', 'X-Axis')}
          </label>
          <div className="recommendation-trend-chart__checkbox-group">
            {xAxisOptions.map((option) => (
              <Checkbox
                key={option.value}
                checked={selectedXAxis === option.value}
                disabled={isXAxisOptionDisabled(option.value)}
                onChange={(event) => handleXAxisCheckboxChange(option.value, event.target.checked)}
              >
                {option.label}
              </Checkbox>
            ))}
          </div>
        </div>

        <div className="recommendation-trend-chart__control-row">
          <label className="recommendation-trend-chart__control-label">
            {t('design.electrode.optimize.yAxisLabel', 'Y-Axis')}
          </label>
          <div className="recommendation-trend-chart__checkbox-group">
            {yAxisOptions.map((option) => (
              <Checkbox
                key={option.value}
                checked={selectedYAxes.includes(option.value)}
                disabled={isYAxisOptionDisabled(option.value)}
                onChange={(event) =>
                  handleYAxisCheckboxChange(option.value, event.target.checked)
                }
              >
                {option.label}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>

      {normalizedData.length === 0 ? (
        <div className="recommendation-trend-chart__empty">
          {t('design.electrode.optimize.trendChartEmpty', 'No data available for trend chart')}
        </div>
      ) : (
        <div className="recommendation-trend-chart__chart">
          <EchartsReact option={chartOption} height={360} />
        </div>
      )}
    </div>
  );
};

export default RecommendationTrendChart;
