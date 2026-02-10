import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactECharts from 'echarts-for-react';
import './index.less';

const RateCapabilityChart: React.FC = () => {
  const { t } = useTranslation();

  // Mock 数据 - 模拟 Capacity Retention (1C-5C) 曲线
  const mockData = [
    { cRate: '1C', retention: 100 },
    { cRate: '2C', retention: 85 },
    { cRate: '3C', retention: 78 },
    { cRate: '4C', retention: 68 },
    { cRate: '5C', retention: 62 },
  ];

  const option = {
    grid: {
      left: '8%',
      right: '5%',
      top: '10%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: mockData.map(item => item.cRate),
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
    yAxis: {
      type: 'value',
      name: 'Capacity Retention (%)',
      nameTextStyle: {
        fontSize: 12,
        color: '#6b7280',
      },
      min: 0,
      max: 100,
      interval: 25,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        formatter: '{value}%',
      },
      splitLine: {
        lineStyle: {
          color: '#f3f4f6',
          type: 'solid',
        },
      },
    },
    series: [
      {
        name: 'Capacity Retention',
        type: 'line',
        data: mockData.map(item => item.retention),
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
              {
                offset: 0,
                color: 'rgba(86, 178, 106, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(86, 178, 106, 0.05)',
              },
            ],
          },
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
      formatter: (params: any) => {
        const param = params[0];
        return `
          <div style="padding: 4px 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${param.axisValue}</div>
            <div>Capacity Retention: <strong>${param.value}%</strong></div>
          </div>
        `;
      },
    },
  };

  return (
    <div className="rate-capability-chart-container">
      {/* HTML 标题 - 与 ResultDisplay 保持一致 */}
      <div className="rate-capability-chart-label">
        {t('design.electrode.predict.rateCapability', 'Rate Capability (1C-5C)')}
      </div>

      <div className="rate-capability-chart-wrapper">
        <ReactECharts
          option={option}
          style={{ height: '280px', width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
        {/* Coming Soon 蒙层 */}
        <div className="rate-capability-overlay">
          <div className="rate-capability-overlay-content">
            <span className="rate-capability-overlay-text">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateCapabilityChart;
