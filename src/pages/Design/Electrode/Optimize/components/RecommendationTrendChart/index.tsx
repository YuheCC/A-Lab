import React, { useMemo, useState } from 'react';
import { Checkbox } from 'antd';
import type { EChartsOption } from 'echarts';
import { useTranslation } from 'react-i18next';
import EchartsReact from '@/components/EchartsReact';
import './index.less';

export type TrendChartXAxisKey = 'no' | 'designCapacity';
export type TrendChartYAxisKey = 'specificEnergy' | 'thickness' | 'volumetricEnergyDensity';

export interface RecommendationTrendDatum {
  no: number;
  designCapacity: number;
  specificEnergy: number;
  thickness: number;
  volumetricEnergyDensity: number;
}

interface RecommendationTrendChartProps {
  data: RecommendationTrendDatum[];
  title?: string;
  defaultXAxis?: TrendChartXAxisKey;
  defaultYAxes?: TrendChartYAxisKey[];
  className?: string;
}

const MAX_Y_AXES = 2;
const DEFAULT_X_AXIS: TrendChartXAxisKey = 'designCapacity';
const DEFAULT_Y_AXES: TrendChartYAxisKey[] = ['specificEnergy'];

const Y_AXIS_KEYS: TrendChartYAxisKey[] = [
  'specificEnergy',
  'thickness',
  'volumetricEnergyDensity',
];

const Y_AXIS_META: Record<TrendChartYAxisKey, { unit: string; color: string }> = {
  specificEnergy: { unit: 'Wh/kg', color: '#56B26A' },
  thickness: { unit: 'mm', color: '#3b82f6' },
  volumetricEnergyDensity: { unit: 'Wh/L', color: '#f59e0b' },
};

const isValidXAxis = (value?: TrendChartXAxisKey): value is TrendChartXAxisKey =>
  value === 'no' || value === 'designCapacity';

const isValidYAxis = (value: string): value is TrendChartYAxisKey =>
  Y_AXIS_KEYS.includes(value as TrendChartYAxisKey);

const sanitizeDefaultYAxes = (defaultYAxes?: TrendChartYAxisKey[]): TrendChartYAxisKey[] => {
  if (!defaultYAxes || defaultYAxes.length === 0) {
    return DEFAULT_Y_AXES;
  }

  const deduplicated = Array.from(new Set(defaultYAxes)).filter((key) => isValidYAxis(key));
  if (deduplicated.length === 0) {
    return DEFAULT_Y_AXES;
  }

  return deduplicated.slice(0, MAX_Y_AXES);
};

const formatNumber = (value: number): string => value.toFixed(2);

const RecommendationTrendChart: React.FC<RecommendationTrendChartProps> = ({
  data,
  title,
  defaultXAxis = DEFAULT_X_AXIS,
  defaultYAxes = DEFAULT_Y_AXES,
  className = '',
}) => {
  const { t } = useTranslation();

  const [selectedXAxis, setSelectedXAxis] = useState<TrendChartXAxisKey>(
    isValidXAxis(defaultXAxis) ? defaultXAxis : DEFAULT_X_AXIS,
  );
  const [selectedYAxes, setSelectedYAxes] = useState<TrendChartYAxisKey[]>(
    sanitizeDefaultYAxes(defaultYAxes),
  );

  const normalizedData = useMemo(
    () =>
      data.filter(
        (item) =>
          Number.isFinite(item.no) &&
          Number.isFinite(item.designCapacity) &&
          Number.isFinite(item.specificEnergy) &&
          Number.isFinite(item.thickness) &&
          Number.isFinite(item.volumetricEnergyDensity),
      ),
    [data],
  );

  const xAxisOptions = useMemo(
    () => [
      {
        value: 'no' as const,
        label: t('design.electrode.optimize.no', 'No.'),
      },
      {
        value: 'designCapacity' as const,
        label: `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`,
      },
    ],
    [t],
  );

  const yAxisOptions = useMemo(
    () =>
      Y_AXIS_KEYS.map((key) => {
        if (key === 'specificEnergy') {
          return {
            value: key,
            label: `${t('design.electrode.optimize.specificEnergy', 'Gravimetric Energy Density')} (Wh/kg)`,
          };
        }
        if (key === 'thickness') {
          return {
            value: key,
            label: `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`,
          };
        }
        return {
          value: key,
          label: `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric Energy Density')} (Wh/L)`,
        };
      }),
    [t],
  );

  const getYAxisLabel = (key: TrendChartYAxisKey): string => {
    if (key === 'specificEnergy') {
      return `${t('design.electrode.optimize.specificEnergy', 'Gravimetric Energy Density')} (Wh/kg)`;
    }
    if (key === 'thickness') {
      return `${t('design.electrode.optimize.jellyRollThickness', 'Jelly Roll Thickness')} (mm)`;
    }
    return `${t('design.electrode.optimize.volumetricEnergyDensity', 'Volumetric Energy Density')} (Wh/L)`;
  };

  const handleYAxesChange = (nextValues: TrendChartYAxisKey[]) => {
    if (nextValues.length === 0) {
      setSelectedYAxes(DEFAULT_Y_AXES);
      return;
    }

    setSelectedYAxes(nextValues.slice(0, MAX_Y_AXES));
  };

  const handleXAxisCheckboxChange = (value: TrendChartXAxisKey) => {
    setSelectedXAxis(value);
  };

  const handleYAxisCheckboxChange = (value: TrendChartYAxisKey, checked: boolean) => {
    const nextValues = checked
      ? [...selectedYAxes, value]
      : selectedYAxes.filter((item) => item !== value);
    handleYAxesChange(nextValues);
  };

  const buildChartOption = (): EChartsOption => {
    const xAxisName =
      selectedXAxis === 'no'
        ? t('design.electrode.optimize.no', 'No.')
        : `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah)`;
    const activeYAxes = selectedYAxes.slice(0, MAX_Y_AXES);
    const isDualAxis = activeYAxes.length === 2;

    const yAxisConfig = activeYAxes.map((key, index) => {
      const label = getYAxisLabel(key);
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
      name: getYAxisLabel(key),
      type: 'line' as const,
      smooth: false,
      symbol: 'circle' as const,
      showSymbol: true,
      symbolSize: 8,
      yAxisIndex: index,
      data:
        selectedXAxis === 'no'
          ? normalizedData.map((item) => item[key])
          : normalizedData.map((item) => [item.designCapacity, item[key]]),
      lineStyle: {
        width: 2,
        color: Y_AXIS_META[key].color,
      },
      itemStyle: {
        color: Y_AXIS_META[key].color,
        borderWidth: 2,
        borderColor: '#fff',
      },
    }));

    return {
      color: activeYAxes.map((key) => Y_AXIS_META[key].color),
      legend: {
        top: 0,
        data: activeYAxes.map((key) => getYAxisLabel(key)),
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
              ? `${t('design.electrode.optimize.no', 'No.')}: ${firstParam.axisValue}`
              : `${t('design.electrode.optimize.designCapacity', 'Design Capacity')} (Ah): ${formatNumber(
                  Number(firstParam.axisValue),
                )}`;

          const lines = [xValue];
          params.forEach((param: any) => {
            const yValueRaw = Array.isArray(param.value) ? param.value[1] : param.value;
            const yValue = formatNumber(Number(yValueRaw));
            const yKey = activeYAxes[param.seriesIndex];
            const unit = yKey ? Y_AXIS_META[yKey].unit : '';
            lines.push(`${param.marker}${param.seriesName}: ${yValue} ${unit}`);
          });

          return lines.join('<br/>');
        },
      },
      grid: {
        left: 68,
        right: isDualAxis ? 68 : 28,
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
                onChange={() => handleXAxisCheckboxChange(option.value)}
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
                disabled={
                  selectedYAxes.length >= MAX_Y_AXES &&
                  !selectedYAxes.includes(option.value)
                }
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
