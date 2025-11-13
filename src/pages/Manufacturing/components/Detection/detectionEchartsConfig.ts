import type { EChartsOption } from 'echarts';

// 模拟数据：缺陷趋势
export const defectTrendData = {
  xAxis: ['检测1', '检测2', '检测3', '检测4', '检测5', '检测6', '检测7', '检测8'],
  values: [12, 15, 8, 18, 10, 14, 9, 11],
};

// 模拟数据：置信度分布
export const confidenceData = {
  xAxis: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
  values: [5, 12, 28, 45, 68],
};

// 模拟数据：区域分布
export const areaDistributionData = {
  xAxis: ['区域A', '区域B', '区域C', '区域D', '区域E', '区域F'],
  values: [23, 18, 32, 15, 27, 19],
};

// 模拟数据：时间序列
export const timeSeriesData = {
  xAxis: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
  values: [45, 38, 52, 61, 48, 55, 42],
};

// 缺陷趋势图表配置
export const getDefectTrendConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.defectTrend'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 个',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: defectTrendData.xAxis,
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        name: '缺陷数量',
        type: 'line',
        data: defectTrendData.values,
        smooth: true,
        lineStyle: {
          color: '#1890ff',
          width: 2,
        },
        itemStyle: {
          color: '#1890ff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
              { offset: 1, color: 'rgba(24, 144, 255, 0.05)' },
            ],
          },
        },
      },
    ],
  };
};

// 置信度分布图表配置
export const getConfidenceConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.confidence'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 个',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: confidenceData.xAxis,
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        name: '检测数量',
        type: 'line',
        data: confidenceData.values,
        smooth: true,
        lineStyle: {
          color: '#52c41a',
          width: 2,
        },
        itemStyle: {
          color: '#52c41a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
      },
    ],
  };
};

// 区域分布图表配置
export const getAreaDistributionConfig = (
  t: (key: string) => string,
): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.areaDistribution'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 个',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: areaDistributionData.xAxis,
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        name: '区域检测',
        type: 'line',
        data: areaDistributionData.values,
        smooth: true,
        lineStyle: {
          color: '#faad14',
          width: 2,
        },
        itemStyle: {
          color: '#faad14',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
              { offset: 1, color: 'rgba(250, 173, 20, 0.05)' },
            ],
          },
        },
      },
    ],
  };
};

// 时间序列图表配置
export const getTimeSeriesConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.timeSeries'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 个',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: timeSeriesData.xAxis,
      axisLabel: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        show: false,
      },
    },
    series: [
      {
        name: '检测数量',
        type: 'line',
        data: timeSeriesData.values,
        smooth: true,
        lineStyle: {
          color: '#722ed1',
          width: 2,
        },
        itemStyle: {
          color: '#722ed1',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(114, 46, 209, 0.3)' },
              { offset: 1, color: 'rgba(114, 46, 209, 0.05)' },
            ],
          },
        },
      },
    ],
  };
};
