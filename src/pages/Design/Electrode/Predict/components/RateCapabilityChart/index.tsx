import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import type { ElectrodeModelResult } from '@/services/electrode/types';
import './index.less';

interface RateCapabilityChartProps {
  results?: ElectrodeModelResult | null;
}

const C_RATES = ['1C', '2C', '3C', '4C', '5C'];

const RateCapabilityChart: React.FC<RateCapabilityChartProps> = ({ results }) => {
  const { t } = useTranslation();

  // 判断是否有真实 Cap/T 数据
  const hasRealData = results &&
    results.cap1C !== undefined &&
    results.t1C !== undefined;

  const capData = hasRealData
    ? [results!.cap1C, results!.cap2C, results!.cap3C, results!.cap4C, results!.cap5C].map((v) => Math.round(v))
    : [100, 85, 78, 68, 62];

  const tempData = hasRealData
    ? [results!.t1C, results!.t2C, results!.t3C, results!.t4C, results!.t5C].map((v) => Math.round(v))
    : [15, 14, 13, 14, 17];

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
        {!hasRealData && (
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
