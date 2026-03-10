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
    ? [results!.cap1C, results!.cap2C, results!.cap3C, results!.cap4C, results!.cap5C]
    : [100, 85, 78, 68, 62];

  const tempData = hasRealData
    ? [results!.t1C, results!.t2C, results!.t3C, results!.t4C, results!.t5C]
    : [15, 14, 13, 14, 17];

  const option = {
    grid: {
      left: '8%',
      right: '10%',
      top: '15%',
      bottom: '15%',
      containLabel: true,
    },
    legend: {
      top: '2%',
      right: '5%',
      data: [
        t('design.electrode.predict.capacityRetention', 'Capacity Retention'),
        t('design.electrode.predict.temperature', 'Temperature'),
      ],
      textStyle: {
        fontSize: 12,
        color: '#6b7280',
      },
    },
    xAxis: {
      type: 'category',
      data: C_RATES,
      name: 'C-Rate',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 12,
        color: '#6b7280',
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb',
        },
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: t('design.electrode.predict.capacityRetentionAxis', 'Capacity Retention (%)'),
        nameTextStyle: {
          fontSize: 11,
          color: '#56B26A',
          padding: [0, 0, 0, 0],
        },
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#56B26A',
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#56B26A',
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: '{value}%',
        },
        splitLine: {
          lineStyle: {
            color: '#f3f4f6',
            type: 'solid',
          },
        },
      },
      {
        type: 'value',
        name: t('design.electrode.predict.temperatureAxis', 'Temperature (°C)'),
        nameTextStyle: {
          fontSize: 11,
          color: '#f59e0b',
          padding: [0, 0, 0, 0],
        },
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#f59e0b',
          },
        },
        axisTick: {
          show: true,
          lineStyle: {
            color: '#f59e0b',
          },
        },
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          formatter: '{value}°C',
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
        smooth: true,
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
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(86, 178, 106, 0.2)' },
              { offset: 1, color: 'rgba(86, 178, 106, 0.02)' },
            ],
          },
        },
      },
      {
        name: t('design.electrode.predict.temperature', 'Temperature'),
        type: 'line',
        yAxisIndex: 1,
        data: tempData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#f59e0b',
          borderWidth: 2,
          borderColor: '#fff',
        },
        lineStyle: {
          color: '#f59e0b',
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
            ${capParam ? `<div style="color:#56B26A">Capacity Retention: <strong>${capParam.value}%</strong></div>` : ''}
            ${tempParam ? `<div style="color:#f59e0b">Temperature: <strong>${tempParam.value}°C</strong></div>` : ''}
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
