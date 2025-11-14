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
  const remarkYValue =
    index && markData[index]?.state1
      ? markData[index].state1
      : null;

  // 将 y 轴的值转换为 x 轴位置索引
  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    const yValues = state1Data.y;
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
      data: state1Data.x,
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

// 第二个图表配置 (State 2)
export const getSecondChartConfig = (
  t: (key: string) => string,
  state2Data: StateData,
  markData: MarkData,
  index?: string,
): EChartsOption => {
  const remarkYValue =
    index && markData[index]?.state2
      ? markData[index].state2
      : null;

  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    const yValues = state2Data.y;
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
      data: state2Data.x,
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

// 第三个图表配置 (State 3)
export const getThirdChartConfig = (
  t: (key: string) => string,
  state3Data: StateData,
  markData: MarkData,
  index?: string,
): EChartsOption => {
  const remarkYValue =
    index && markData[index]?.state3
      ? markData[index].state3
      : null;

  let remarkXAxisIndex = null;
  if (remarkYValue !== null) {
    const yValues = state3Data.y;
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
      data: state3Data.y,
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
