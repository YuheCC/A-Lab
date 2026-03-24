import React, { useCallback, useMemo, useState } from 'react';
import { Select } from 'antd';
import type { EChartsOption } from 'echarts';
import { useTranslation } from 'react-i18next';
import EchartsReact, { type EChartsEventParams } from '@/components/EchartsReact';
import {
  TREND_FIELD_KEYS,
  TREND_FIELD_META,
  getTrendFieldLabel,
  isTrendField,
  type TrendChartFieldKey,
  type RecommendationTrendDatum,
} from '../../recommendationData';
import './index.less';

export type TrendChartXAxisKey = TrendChartFieldKey;
export type TrendChartYAxisKey = TrendChartFieldKey;

export interface RecommendationTrendChartPointClickPayload {
  dataIndex: number;
  datum: RecommendationTrendDatum;
  no: number;
}

interface RecommendationTrendChartProps {
  data: RecommendationTrendDatum[];
  title?: string;
  defaultXAxis?: TrendChartFieldKey;
  defaultYAxes?: TrendChartFieldKey[];
  className?: string;
  onPointClick?: (payload: RecommendationTrendChartPointClickPayload) => void;
}

// 轴可选个数配置：当前都为 1，后续放开只需改这里
const DEFAULT_X_AXIS: TrendChartFieldKey = 'designCapacity';
const DEFAULT_Y_AXIS: TrendChartFieldKey = 'specificEnergy';

const isValidField = (value?: string): value is TrendChartFieldKey =>
  !!value && isTrendField(value);

const getFirstAvailableField = (
  excluded: TrendChartFieldKey[],
  preferred: TrendChartFieldKey,
): TrendChartFieldKey => {
  if (!excluded.includes(preferred)) {
    return preferred;
  }
  return TREND_FIELD_KEYS.find((field) => !excluded.includes(field)) || preferred;
};

const sanitizeDefaultYAxis = (
  defaultYAxes: TrendChartFieldKey[] | undefined,
  selectedXAxis: TrendChartFieldKey,
): TrendChartFieldKey => {
  const deduplicated = (defaultYAxes || []).filter(
    (key): key is TrendChartFieldKey => isValidField(key) && key !== selectedXAxis,
  );

  if (deduplicated.length > 0 && deduplicated[0]) {
    return deduplicated[0];
  }

  return getFirstAvailableField([selectedXAxis], DEFAULT_Y_AXIS);
};

const formatNumber = (value: number): string => value.toFixed(2);

const RecommendationTrendChart: React.FC<RecommendationTrendChartProps> = ({
  data,
  title,
  defaultXAxis = DEFAULT_X_AXIS,
  defaultYAxes = [DEFAULT_Y_AXIS],
  className = '',
  onPointClick,
}) => {
  const { t } = useTranslation();

  const initialXAxis = isValidField(defaultXAxis) ? defaultXAxis : DEFAULT_X_AXIS;
  const [selectedXAxis, setSelectedXAxis] = useState<TrendChartFieldKey>(initialXAxis);
  const [selectedYAxis, setSelectedYAxis] = useState<TrendChartFieldKey>(
    sanitizeDefaultYAxis(defaultYAxes, initialXAxis),
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

  const getFieldLabel = (key: TrendChartFieldKey): string => getTrendFieldLabel(t, key);

  const xAxisOptions = useMemo(
    () =>
      TREND_FIELD_KEYS.map((key) => ({
        value: key,
        label: getFieldLabel(key),
        disabled: key === selectedYAxis,
      })),
    [selectedYAxis, t],
  );

  const yAxisOptions = useMemo(
    () =>
      TREND_FIELD_KEYS.map((key) => ({
        value: key,
        label: getFieldLabel(key),
        disabled: key === selectedXAxis,
      })),
    [selectedXAxis, t],
  );

  const handleXAxisChange = (value: TrendChartFieldKey) => {
    setSelectedXAxis(value);
    if (value === selectedYAxis) {
      const fallback = getFirstAvailableField([value], DEFAULT_Y_AXIS);
      setSelectedYAxis(fallback);
    }
  };

  const handleYAxisChange = (value: TrendChartFieldKey) => {
    if (value === selectedXAxis) {
      return;
    }
    setSelectedYAxis(value);
  };

  const handleChartClick = useCallback(
    (params: EChartsEventParams) => {
      const { dataIndex } = params;
      if (
        params.componentType !== 'series' ||
        params.seriesType !== 'scatter' ||
        typeof dataIndex !== 'number' ||
        !Number.isInteger(dataIndex)
      ) {
        return;
      }

      const clickedDatum = normalizedData[dataIndex];
      if (!clickedDatum) {
        return;
      }

      onPointClick?.({
        dataIndex,
        datum: clickedDatum,
        no: clickedDatum.no,
      });
    },
    [normalizedData, onPointClick],
  );

  const chartEvents = useMemo(
    () => ({ click: handleChartClick }),
    [handleChartClick],
  );

  const chartOption = useMemo((): EChartsOption => {
    const xAxisName = getFieldLabel(selectedXAxis);
    const activeYAxes = [selectedYAxis];
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
                  type: 'solid' as const,
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
      data: normalizedData.map((item) => ({
        value: [item[selectedXAxis], item[key]],
        no: item.no,
      })),
      itemStyle: {
        color: TREND_FIELD_META[key].color,
        borderWidth: 2,
        borderColor: '#fff',
      },
    }));

    return {
      color: activeYAxes.map((key) => TREND_FIELD_META[key].color),
      legend: {
        top: 0,
        data: activeYAxes.map((key) => getFieldLabel(key)),
        textStyle: {
          fontSize: 12,
          color: '#374151',
        },
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        textStyle: {
          color: '#1f2937',
          fontSize: 12,
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          if (!param) {
            return '';
          }

          const xValueRaw = Array.isArray(param.value) ? param.value[0] : param.value;
          const yValueRaw = Array.isArray(param.value) ? param.value[1] : param.value;
          const xValue = selectedXAxis === 'no'
            ? `${getFieldLabel(selectedXAxis)}: ${Math.round(Number(xValueRaw))}`
            : `${getFieldLabel(selectedXAxis)}: ${formatNumber(Number(xValueRaw))}`;
          const yValue = formatNumber(Number(yValueRaw));
          const yKey = activeYAxes[param.seriesIndex];
          const unit = yKey ? TREND_FIELD_META[yKey].unit : '';

          const noLine = selectedXAxis !== 'no' && param.data?.no !== undefined
            ? `No: ${Math.round(Number(param.data.no))}<br/>`
            : '';

          return `${noLine}${xValue}<br/>${param.seriesName}: ${yValue} ${unit}`;
        },
      },
      grid: {
        left: 68,
        right: isDualAxis ? 88 : 28,
        top: 52,
        bottom: 50,
      },
      xAxis: {
        type: 'value' as const,
        scale: true,
        name: xAxisName,
        nameLocation: 'middle' as const,
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
          formatter: selectedXAxis === 'no'
            ? (value: number) => String(Math.round(value))
            : (value: number) => formatNumber(value),
        },
      },
      yAxis: yAxisConfig,
      series,
    };
  }, [normalizedData, selectedXAxis, selectedYAxis, t]);

  const trendTitle = title || t('design.electrode.optimize.trendChartTitle', 'Recommendation Trend Chart');

  return (
    <div className={`recommendation-trend-chart ${className}`.trim()}>
      <h3 className="recommendation-trend-chart__title">{trendTitle}</h3>

      <div className="recommendation-trend-chart__controls">
        <div className="recommendation-trend-chart__control-item">
          <label className="recommendation-trend-chart__control-label">
            {t('design.electrode.optimize.xAxisLabel', 'X-Axis')}
          </label>
          <Select
            className="recommendation-trend-chart__select"
            value={selectedXAxis}
            options={xAxisOptions}
            onChange={(value) => handleXAxisChange(value as TrendChartFieldKey)}
          />
        </div>

        <div className="recommendation-trend-chart__control-item">
          <label className="recommendation-trend-chart__control-label">
            {t('design.electrode.optimize.yAxisLabel', 'Y-Axis')}
          </label>
          <Select
            className="recommendation-trend-chart__select"
            value={selectedYAxis}
            options={yAxisOptions}
            onChange={(value) => handleYAxisChange(value as TrendChartFieldKey)}
          />
        </div>
      </div>

      {normalizedData.length === 0 ? (
        <div className="recommendation-trend-chart__empty">
          {t('design.electrode.optimize.trendChartEmpty', 'No data available for trend chart')}
        </div>
      ) : (
        <div className="recommendation-trend-chart__chart">
          <EchartsReact
            option={chartOption}
            height={360}
            onEvents={chartEvents}
          />
        </div>
      )}
    </div>
  );
};

export default RecommendationTrendChart;
