import type { EChartsOption } from 'echarts';

// 占位数据 - 后续可以替换为实际数据文件
// 用户可以将数据文件放在 public/manufacturing/ultrasound/ 目录下
const mockData1 = {
  xAxis: Array.from({ length: 50 }, (_, i) => `${i}`),
  values: Array.from({ length: 50 }, () => Math.floor(Math.random() * 100) + 20),
};

const mockData2 = {
  xAxis: Array.from({ length: 50 }, (_, i) => `${i}`),
  values: Array.from({ length: 50 }, () => Math.floor(Math.random() * 80) + 10),
};

const mockData3 = {
  xAxis: Array.from({ length: 50 }, (_, i) => `${i}`),
  values: Array.from({ length: 50 }, () => Math.floor(Math.random() * 120) + 30),
};

// 占位参考线数据 - 后续可以替换为实际的 remark.json
// 格式: { "chart1": [val0, val1, val2, ...], "chart2": [...], "chart3": [...] }
const mockRemarkData = {
  chart1: Array.from({ length: 12 }, () => Math.random() * 100 + 20),
  chart2: Array.from({ length: 12 }, () => Math.random() * 80 + 10),
  chart3: Array.from({ length: 12 }, () => Math.random() * 120 + 30),
};

// 第一个图表配置
export const getFirstChartConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  // 根据 index 从参考数据获取参考线数值
  const remarkYValue =
    index !== undefined && mockRemarkData.chart1?.[index]
      ? mockRemarkData.chart1[index]
      : null;

  // 将 y 轴的值转换为 x 轴位置索引
  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    const yValues = mockData1.values;
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
      text: t('manufacturing.modules.ultrasound.charts.chart1'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: mockData1.xAxis,
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
        name: '数据1',
        type: 'line',
        data: mockData1.values,
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
                formatter: `参考值: ${remarkYValue?.toFixed(2)}`,
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

// 第二个图表配置
export const getSecondChartConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  const remarkYValue =
    index !== undefined && mockRemarkData.chart2?.[index]
      ? mockRemarkData.chart2[index]
      : null;

  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    const yValues = mockData2.values;
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
      text: t('manufacturing.modules.ultrasound.charts.chart2'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: mockData2.xAxis,
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
        name: '数据2',
        type: 'line',
        data: mockData2.values,
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
                formatter: `参考值: ${remarkYValue?.toFixed(2)}`,
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

// 第三个图表配置
export const getThirdChartConfig = (
  t: (key: string) => string,
  index?: number,
): EChartsOption => {
  const remarkYValue =
    index !== undefined && mockRemarkData.chart3?.[index]
      ? mockRemarkData.chart3[index]
      : null;

  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    const yValues = mockData3.values;
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
      text: t('manufacturing.modules.ultrasound.charts.chart3'),
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '25%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: mockData3.xAxis,
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
        name: '数据3',
        type: 'line',
        data: mockData3.values,
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
                formatter: `参考值: ${remarkYValue?.toFixed(2)}`,
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
