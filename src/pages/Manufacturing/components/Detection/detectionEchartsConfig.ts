import type { EChartsOption } from 'echarts';

// 导入真实数据文件
import leftOhRangeData from './data/左侧oh极差分布.json';
import leftOhStdData from './data/左侧oh标准差分布.json';
import rightOhRangeData from './data/右侧oh极差分布.json';
import rightOhStdData from './data/右侧oh标准差分布.json';
import remarkData from './data/remark.json';

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
export const getDefectTrendConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  // 根据 index 从 remark.json 获取参考线数值（y轴的值）
  const remarkYValue =
    index !== undefined && remarkData['hist of left OH range']?.[index]
      ? remarkData['hist of left OH range'][index]
      : null;

  // 将 y 轴的值转换为 x 轴位置索引
  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    // 在数据中找到最接近的 y 值对应的索引
    const yValues = defectTrendData.values;
    let closestIndex = 0;
    let minDiff = Math.abs(yValues[0] - remarkYValue);

    for (let i = 1; i < yValues.length; i++) {
      const diff = Math.abs(yValues[i] - remarkYValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    remarkXAxisIndex = closestIndex;
  }

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
        markLine: remarkXAxisIndex !== null
          ? {
              silent: true,
              symbol: 'none',
              lineStyle: {
                color: '#ff4d4f',
                type: 'dashed',
                width: 2,
              },
              label: {
                show: false,
                position: 'end',
                formatter: `参考值: ${remarkYValue?.toFixed(3)}`,
                color: '#ff4d4f',
              },
              data: [
                {
                  xAxis: remarkXAxisIndex,
                },
              ],
            }
          : undefined,
      },
    ],
  };
};

// 左侧OH标准差分布图表配置
export const getConfidenceConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  // 根据 index 从 remark.json 获取参考线数值（y轴的值）
  const remarkYValue =
    index !== undefined && remarkData['hist of left OH std']?.[index]
      ? remarkData['hist of left OH std'][index]
      : null;

  // 将 y 轴的值转换为 x 轴位置索引
  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    // 在数据中找到最接近的 y 值对应的索引
    const yValues = confidenceData.values;
    let closestIndex = 0;
    let minDiff = Math.abs(yValues[0] - remarkYValue);

    for (let i = 1; i < yValues.length; i++) {
      const diff = Math.abs(yValues[i] - remarkYValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    remarkXAxisIndex = closestIndex;
  }

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
        markLine: remarkXAxisIndex !== null
          ? {
              silent: true,
              symbol: 'none',
              lineStyle: {
                color: '#ff4d4f',
                type: 'dashed',
                width: 2,
              },
              label: {
                show: false,
                position: 'end',
                formatter: `参考值: ${remarkYValue?.toFixed(3)}`,
                color: '#ff4d4f',
              },
              data: [
                {
                  xAxis: remarkXAxisIndex,
                },
              ],
            }
          : undefined,
      },
    ],
  };
};

// 右侧OH极差分布图表配置
export const getAreaDistributionConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  // 根据 index 从 remark.json 获取参考线数值（y轴的值）
  const remarkYValue =
    index !== undefined && remarkData['hist of right OH range']?.[index]
      ? remarkData['hist of right OH range'][index]
      : null;

  // 将 y 轴的值转换为 x 轴位置索引
  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    // 在数据中找到最接近的 y 值对应的索引
    const yValues = areaDistributionData.values;
    let closestIndex = 0;
    let minDiff = Math.abs(yValues[0] - remarkYValue);

    for (let i = 1; i < yValues.length; i++) {
      const diff = Math.abs(yValues[i] - remarkYValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    remarkXAxisIndex = closestIndex;
  }

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
        markLine: remarkXAxisIndex !== null
          ? {
              silent: true,
              symbol: 'none',
              lineStyle: {
                color: '#ff4d4f',
                type: 'dashed',
                width: 2,
              },
              label: {
                show: false,
                position: 'end',
                formatter: `参考值: ${remarkYValue?.toFixed(3)}`,
                color: '#ff4d4f',
              },
              data: [
                {
                  xAxis: remarkXAxisIndex,
                },
              ],
            }
          : undefined,
      },
    ],
  };
};

// 右侧OH标准差分布图表配置
export const getTimeSeriesConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  // 根据 index 从 remark.json 获取参考线数值（y轴的值）
  const remarkYValue =
    index !== undefined && remarkData['hist of right OH std']?.[index]
      ? remarkData['hist of right OH std'][index]
      : null;

  // 将 y 轴的值转换为 x 轴位置索引
  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    // 在数据中找到最接近的 y 值对应的索引
    const yValues = timeSeriesData.values;
    let closestIndex = 0;
    let minDiff = Math.abs(yValues[0] - remarkYValue);

    for (let i = 1; i < yValues.length; i++) {
      const diff = Math.abs(yValues[i] - remarkYValue);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    remarkXAxisIndex = closestIndex;
  }

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
        markLine: remarkXAxisIndex !== null
          ? {
              silent: true,
              symbol: 'none',
              lineStyle: {
                color: '#ff4d4f',
                type: 'dashed',
                width: 2,
              },
              label: {
                show: false,
                position: 'end',
                formatter: `参考值: ${remarkYValue?.toFixed(3)}`,
                color: '#ff4d4f',
              },
              data: [
                {
                  xAxis: remarkXAxisIndex,
                },
              ],
            }
          : undefined,
      },
    ],
  };
};
