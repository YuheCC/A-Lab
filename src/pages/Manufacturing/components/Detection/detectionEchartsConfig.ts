import type { EChartsOption } from 'echarts';

// 导入真实数据文件
import leftOhRangeData from './data/左侧oh极差分布.json';
import leftOhStdData from './data/左侧oh标准差分布.json';
import rightOhRangeData from './data/右侧oh极差分布.json';
import rightOhStdData from './data/右侧oh标准差分布.json';

// 左侧OH极差分布数据
export const defectTrendData = {
  xAxis: leftOhRangeData.x,
  values: leftOhRangeData.y,
};

// 左侧OH标准差分布数据
export const confidenceData = {
  xAxis: leftOhStdData.x,
  values: leftOhStdData.y,
};

// 右侧OH极差分布数据
export const areaDistributionData = {
  xAxis: rightOhRangeData.x,
  values: rightOhRangeData.y,
};

// 右侧OH标准差分布数据
export const timeSeriesData = {
  xAxis: rightOhStdData.x,
  values: rightOhStdData.y,
};

// 左侧OH极差分布图表配置
export const getDefectTrendConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.leftOhRange'),
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

// 左侧OH标准差分布图表配置
export const getConfidenceConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.leftOhStd'),
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

// 右侧OH极差分布图表配置
export const getAreaDistributionConfig = (
  t: (key: string) => string,
): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.rightOhRange'),
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

// 右侧OH标准差分布图表配置
export const getTimeSeriesConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.modules.detection.charts.rightOhStd'),
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
