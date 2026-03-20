import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import type { ElectrodeModelResult } from '@/services/electrode/types';
import './index.less';

type RateCapabilityCamelFields = Pick<
  ElectrodeModelResult,
  'cap1C' | 'cap2C' | 'cap3C' | 'cap4C' | 'cap5C' | 't1C' | 't2C' | 't3C' | 't4C' | 't5C'
>;

type RateCapabilitySnakeFields = {
  Cap_1C?: number | string;
  Cap_2C?: number | string;
  Cap_3C?: number | string;
  Cap_4C?: number | string;
  Cap_5C?: number | string;
  T_1C?: number | string;
  T_2C?: number | string;
  T_3C?: number | string;
  T_4C?: number | string;
  T_5C?: number | string;
};

export type RateCapabilityChartResult = Partial<RateCapabilityCamelFields & RateCapabilitySnakeFields>;

type MissingDataBehavior = 'overlay' | 'hide';

interface RateCapabilityChartProps {
  results?: RateCapabilityChartResult | null;
  missingDataBehavior?: MissingDataBehavior;
}

const C_RATES = ['1C', '2C', '3C', '4C', '5C'];

const RATE_FIELD_PAIRS: Array<{
  capCamel: keyof RateCapabilityCamelFields;
  capSnake: keyof RateCapabilitySnakeFields;
  tempCamel: keyof RateCapabilityCamelFields;
  tempSnake: keyof RateCapabilitySnakeFields;
}> = [
  { capCamel: 'cap1C', capSnake: 'Cap_1C', tempCamel: 't1C', tempSnake: 'T_1C' },
  { capCamel: 'cap2C', capSnake: 'Cap_2C', tempCamel: 't2C', tempSnake: 'T_2C' },
  { capCamel: 'cap3C', capSnake: 'Cap_3C', tempCamel: 't3C', tempSnake: 'T_3C' },
  { capCamel: 'cap4C', capSnake: 'Cap_4C', tempCamel: 't4C', tempSnake: 'T_4C' },
  { capCamel: 'cap5C', capSnake: 'Cap_5C', tempCamel: 't5C', tempSnake: 'T_5C' },
];

const getNumericValue = (
  source: RateCapabilityChartResult,
  camelKey: keyof RateCapabilityCamelFields,
  snakeKey: keyof RateCapabilitySnakeFields,
): number | undefined => {
  const rawValue = source[camelKey] ?? source[snakeKey];
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return undefined;
  }
  const numeric = Number(rawValue);
  return Number.isFinite(numeric) ? numeric : undefined;
};

export const hasRateCapabilityData = (results?: RateCapabilityChartResult | null): boolean => {
  if (!results) {
    return false;
  }

  return RATE_FIELD_PAIRS.every(({ capCamel, capSnake, tempCamel, tempSnake }) => {
    const capValue = getNumericValue(results, capCamel, capSnake);
    const tempValue = getNumericValue(results, tempCamel, tempSnake);
    return capValue !== undefined && tempValue !== undefined;
  });
};

const RateCapabilityChart: React.FC<RateCapabilityChartProps> = ({
  results,
  missingDataBehavior = 'overlay',
}) => {
  const { t } = useTranslation();

  const parsedData = RATE_FIELD_PAIRS.map(({ capCamel, capSnake, tempCamel, tempSnake }) => ({
    cap: results ? getNumericValue(results, capCamel, capSnake) : undefined,
    temp: results ? getNumericValue(results, tempCamel, tempSnake) : undefined,
  }));

  // 需要 10 个倍率字段都存在时才算真实数据
  const hasRealData = parsedData.every((item) => item.cap !== undefined && item.temp !== undefined);

  const capData = hasRealData
    ? parsedData.map((item) => Math.round(item.cap as number))
    : [100, 85, 78, 68, 62];

  const tempData = hasRealData
    ? parsedData.map((item) => Math.round(item.temp as number))
    : [15, 14, 13, 14, 17];

  if (!hasRealData && missingDataBehavior === 'hide') {
    return null;
  }

  const option = {
    grid: {
      left: '8%',
      right: '10%',
      top: '10%',
      bottom: '20%',
      containLabel: true,
    },
    legend: {
      bottom: '2%',
      left: 'center',
      data: [
        t('design.electrode.predict.capacityRetention', 'Capacity Retention'),
        t('design.electrode.predict.temperature', 'Temperature'),
      ],
      textStyle: {
        fontSize: 12,
        color: '#374151',
      },
    },
    xAxis: {
      type: 'category',
      data: C_RATES,
      name: t('design.electrode.predict.cRate', 'Rate'),
      nameLocation: 'middle',
      nameGap: 30,
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
    },
    yAxis: [
      {
        type: 'value',
        name: t('design.electrode.predict.capacityRetentionAxis', 'Capacity Retention (%)'),
        nameTextStyle: {
          fontSize: 11,
          color: '#374151',
          padding: [0, 0, 0, 0],
        },
        position: 'left',
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
        min: 0,
        max: 100,
        axisLabel: {
          color: '#374151',
          fontSize: 12,
          formatter: '{value}',
        },
        splitLine: {
          lineStyle: {
            color: '#e5e7eb',
            type: 'solid',
          },
        },
      },
      {
        type: 'value',
        name: t('design.electrode.predict.temperatureAxis', 'Temperature (°C)'),
        nameTextStyle: {
          fontSize: 11,
          color: '#374151',
          padding: [0, 0, 0, 0],
        },
        position: 'right',
        min: 20,
        max: 110,
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
        axisLabel: {
          color: '#374151',
          fontSize: 12,
          formatter: '{value}',
        },
        splitLine: {
          show: false,
        },
      },
    ],
    series: [
      {
        name: t('design.electrode.predict.capacityRetention', 'Capacity Retention'),
        type: 'line',
        yAxisIndex: 0,
        data: capData,
        smooth: false,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#56B26A',
          borderWidth: 2,
          borderColor: '#fff',
        },
        lineStyle: {
          color: '#56B26A',
          width: 3,
        },
      },
      {
        name: t('design.electrode.predict.temperature', 'Temperature'),
        type: 'line',
        yAxisIndex: 1,
        data: tempData,
        smooth: false,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#3b82f6',
          borderWidth: 2,
          borderColor: '#fff',
        },
        lineStyle: {
          color: '#3b82f6',
          width: 3,
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#1f2937',
        fontSize: 12,
      },
      formatter: (params: any[]) => {
        const cRate = params[0]?.axisValue ?? '';
        const capParam = params.find((p: any) => p.seriesIndex === 0);
        const tempParam = params.find((p: any) => p.seriesIndex === 1);
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${cRate}</div>
            ${capParam ? `<div>${t('design.electrode.predict.capacityRetention', 'Capacity Retention')}: <strong>${Math.round(capParam.value)}%</strong></div>` : ''}
            ${tempParam ? `<div>${t('design.electrode.predict.temperature', 'Temperature')}: <strong>${Math.round(tempParam.value)}°C</strong></div>` : ''}
          </div>
        `;
      },
    },
  };

  return (
    <div className="rate-capability-chart-container">
      <div className="rate-capability-chart-label">
        {t('design.electrode.predict.rateCapability', 'Rate Capability (1C-5C)')}
      </div>

      <div className="rate-capability-chart-wrapper">
        <ReactECharts
          option={option}
          style={{ height: '300px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          opts={{ renderer: 'canvas', devicePixelRatio: window.devicePixelRatio || 2 }}
        />
        {/* 无真实数据时显示 Coming Soon 遮罩（兼容老数据） */}
        {!hasRealData && missingDataBehavior === 'overlay' && (
          <div className="rate-capability-overlay">
            <div className="rate-capability-overlay-content">
              <span className="rate-capability-overlay-text">Coming Soon</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RateCapabilityChart;
