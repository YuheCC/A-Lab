import type { EChartsOption } from 'echarts';

// 数据类型定义
export interface StateData {
  x: number[];
  y: number[];
  metadata?: {
    data_points: number;
    x_min: number;
    x_max: number;
    bandwidth: number;
  };
}

export interface MarkData {
  [key: string]: {
    state1: number;
    state2: number;
    state3: number;
  };
}

// 数据加载函数 - 从 public 目录动态加载
export const loadUltrasoundData = async () => {
  try {
    const [state1Response, state2Response, state3Response, markResponse] = await Promise.all([
      fetch('/manufacturing/ultrasound/state1.json'),
      fetch('/manufacturing/ultrasound/state2.json'),
      fetch('/manufacturing/ultrasound/state3.json'),
      fetch('/manufacturing/ultrasound/mark.json'),
    ]);

    const state1Data = await state1Response.json();
    const state2Data = await state2Response.json();
    const state3Data = await state3Response.json();
    const markData = await markResponse.json();

    return {
      state1Data,
      state2Data,
      state3Data,
      markData,
    };
  } catch (error) {
    console.error('Failed to load ultrasound data:', error);
    throw error;
  }
};

// 第一个图表配置 (State 1)
export const getFirstChartConfig = (
  t: (key: string) => string,
  state1Data: StateData,
  markData: MarkData,
  index?: string,
): EChartsOption => {
  // markData 中的值是 x 轴的实际坐标，需要在 x 轴数据中找到对应的索引
  const remarkXValue =
    index && typeof markData[index]?.state1 === 'number'
      ? markData[index].state1
      : null;

  // 在 category 类型的 xAxis 中，markLine 的 xAxis 使用的是索引，所以需要找到对应的索引
  let remarkXAxisIndex = null;
  if (remarkXValue !== null && remarkXValue !== undefined) {
    const xValues = state1Data.x;
    let closestIndex = 0;
    let minDiff = Math.abs(xValues[0] - remarkXValue);

    for (let i = 1; i < xValues.length; i++) {
      const diff = Math.abs(xValues[i] - remarkXValue);
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
      top: 8,
      textStyle: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const xValue = params[0]?.axisValue;
        const numValue = parseFloat(xValue);
        return isNaN(numValue) ? xValue : numValue.toFixed(3);
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: 50,
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: state1Data.x,
      axisLabel: {
        show: true,
        interval: (index: number) => {
          return index === 0 || index === state1Data.x.length - 1;
        },
        formatter: (value: string) => {
          const num = parseFloat(value);
          return isNaN(num) ? value : num.toFixed(1);
        },
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
        data: state1Data.y,
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
                formatter: `参考值: ${remarkXValue?.toFixed(2)}`,
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

// 第二个图表配置 (State 2)
export const getSecondChartConfig = (
  t: (key: string) => string,
  state2Data: StateData,
  markData: MarkData,
  index?: string,
): EChartsOption => {
  // markData 中的值是 x 轴的实际坐标，需要在 x 轴数据中找到对应的索引
  const remarkXValue =
    index && typeof markData[index]?.state2 === 'number'
      ? markData[index].state2
      : null;

  // 在 category 类型的 xAxis 中，markLine 的 xAxis 使用的是索引，所以需要找到对应的索引
  let remarkXAxisIndex = null;
  if (remarkXValue !== null && remarkXValue !== undefined) {
    const xValues = state2Data.x;
    let closestIndex = 0;
    let minDiff = Math.abs(xValues[0] - remarkXValue);

    for (let i = 1; i < xValues.length; i++) {
      const diff = Math.abs(xValues[i] - remarkXValue);
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
      top: 8,
      textStyle: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const xValue = params[0]?.axisValue;
        const numValue = parseFloat(xValue);
        return isNaN(numValue) ? xValue : numValue.toFixed(3);
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: 50,
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: state2Data.x,
      axisLabel: {
        show: true,
        interval: (index: number) => {
          return index === 0 || index === state2Data.x.length - 1;
        },
        formatter: (value: string) => {
          const num = parseFloat(value);
          return isNaN(num) ? value : num.toFixed(1);
        },
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
        data: state2Data.y,
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
                formatter: `参考值: ${remarkXValue?.toFixed(2)}`,
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

// 第三个图表配置 (State 3)
export const getThirdChartConfig = (
  t: (key: string) => string,
  state3Data: StateData,
  markData: MarkData,
  index?: string,
): EChartsOption => {
  // markData 中的值是 x 轴的实际坐标，需要在 x 轴数据中找到对应的索引
  const remarkXValue =
    index && typeof markData[index]?.state3 === 'number'
      ? markData[index].state3
      : null;

  // 在 category 类型的 xAxis 中，markLine 的 xAxis 使用的是索引，所以需要找到对应的索引
  let remarkXAxisIndex = null;
  if (remarkXValue !== null && remarkXValue !== undefined) {
    const xValues = state3Data.x;
    let closestIndex = 0;
    let minDiff = Math.abs(xValues[0] - remarkXValue);

    for (let i = 1; i < xValues.length; i++) {
      const diff = Math.abs(xValues[i] - remarkXValue);
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
      top: 8,
      textStyle: {
        fontSize: 12,
        fontWeight: 'normal',
        lineHeight: 16,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const xValue = params[0]?.axisValue;
        const numValue = parseFloat(xValue);
        return isNaN(numValue) ? xValue : numValue.toFixed(3);
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      top: 50,
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: state3Data.x,
      axisLabel: {
        show: true,
        interval: (index: number) => {
          return index === 0 || index === state3Data.x.length - 1;
        },
        formatter: (value: string) => {
          const num = parseFloat(value);
          return isNaN(num) ? value : num.toFixed(1);
        },
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
        data: state3Data.y,
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
                formatter: `参考值: ${remarkXValue?.toFixed(2)}`,
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
