import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { BarcodeData } from '@/services/prediction/predictionTool';

interface CycleLifeScatterChartProps {
  brcodeData: BarcodeData[];
  selectedBarcode?: string;
  onBarcodeSelect?: (barcode: string) => void;
}

const CycleLifeScatterChart: React.FC<CycleLifeScatterChartProps> = ({
  brcodeData,
  selectedBarcode,
  onBarcodeSelect
}) => {
  const { t } = useTranslation();
  const [ maxCycleLife, setMaxCycleLife ] = useState<number>(0);

  const option = useMemo(() => {
    if (!brcodeData || brcodeData.length === 0) {
      return {};
    }

    // 数据准备
    const cycleDataSeries: any[] = [];
    const lifePredictionSeries: any[] = [];
    const leftCycleDataSeries: any[] = [];  // 左侧图表的容量数据
    const rightPredictionSeries: any[] = []; // 右侧图表的预测数据

    let markLineYValue: number | null = null;
    let actualMaxCycleLife = 0;

    brcodeData.forEach((item) => {
      if (item.cycle_life_1 !== null) {
        const cycle_life_1_predict_detail = item.cycle_life_1_predict_detail || {};
        const cycleLife = item.cycle_life_1;

        // 如果有真实的容量历史数据，添加到第一个系列
        if (item.cycle_life_1_cycles_detail && typeof item.cycle_life_1_cycles_detail === 'object') {
          Object.entries(item.cycle_life_1_cycles_detail).forEach(([cycle, capacity]) => {
            const cycleNum = parseInt(cycle);
            cycleDataSeries.push([cycleNum, capacity, cycleNum]);
            // 分配到左侧图表（历史数据）
            leftCycleDataSeries.push([cycleNum, capacity, cycleNum]);
          });
        }

        const maxCycleLifeFromData = Math.max(...Object.keys(item.cycle_life_1_cycles_detail || {}).map(Number));
        actualMaxCycleLife = Math.max(actualMaxCycleLife, maxCycleLifeFromData);

        // 获取用于标记线的 y 值
        const predictValue = cycle_life_1_predict_detail?.[cycleLife];
        if (predictValue !== undefined && predictValue !== null) {
          markLineYValue = predictValue;
        }

        // 预测的循环寿命点 - 分配到右侧图表
        lifePredictionSeries.push([
          cycleLife,
          predictValue || 0,
          cycleLife
        ]);
        rightPredictionSeries.push([
          cycleLife,
          predictValue || 0,
          cycleLife
        ]);
      }
    });

    setMaxCycleLife(actualMaxCycleLife);

    // 计算断点位置 - 在实际数据的最大循环次数和预测值之间留出间隙
    const breakPoint = actualMaxCycleLife;

    // 安全地计算预测循环的范围，处理空数组情况
    const predictionCycles = lifePredictionSeries.map(item => item[0]).filter(val => !isNaN(val) && isFinite(val));
    const minPredictionCycle = predictionCycles.length > 0 ? Math.min(...predictionCycles) : breakPoint + 100;
    const maxPredictionCycle = predictionCycles.length > 0 ? Math.max(...predictionCycles) : breakPoint + 1000;

    console.log('预测范围:', {
      minPredictionCycle,
      maxPredictionCycle,
      数据数量: lifePredictionSeries.length,
      预测数据: lifePredictionSeries,
      是否单点: minPredictionCycle === maxPredictionCycle
    });

    // 计算统一的Y轴范围，确保左右图表Y轴对齐
    const allYValues = [
      ...leftCycleDataSeries.map(item => item[1]),
      ...rightPredictionSeries.map(item => item[1])
    ].filter(val => val !== null && val !== undefined);
    
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);
    const yPadding = (maxY - minY) * 0.1; // 10%的边距
    const yAxisMin = minY - yPadding;
    const yAxisMax = maxY + yPadding;


    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          // 处理 markLine 的情况
          if (params.componentType === 'markLine') {
            return `
              <div>
                <strong>80% SOH 预测线</strong><br/>
                <strong>值:</strong> ${params.value?.toFixed(2) || markLineYValue?.toFixed(2) || '0'}<br/>
              </div>
            `;
          }

          // 处理散点图数据的情况
          if (Array.isArray(params.data) && params.data.length >= 3) {
            const [_, __, cycle] = params.data;
            return `
              <div>
                <strong>${t('predictionTool.chart.cycleCount')}:</strong> ${Math.round(cycle)}<br/>
              </div>
            `;
          }

          // 默认情况
          return `
            <div>
              <strong>${params.seriesName}</strong><br/>
              <strong>值:</strong> ${params.value || '无数据'}<br/>
            </div>
          `;
        }
      },
      legend: {
        data: [t('predictionTool.chart.capacityProcess'), t('predictionTool.chart.predictedCycleLife')],
        bottom: '10',
      },
      // 在图表中间添加X轴标签
      graphic: [
        {
          type: 'text',
          left: 'center',
          bottom: '13%',
          style: {
            text: t('predictionTool.chart.xAxisName'),
            fontSize: 12,
            fontWeight: 'normal',
            fill: '#333'
          }
        }
      ],
      // 使用多个grid系统创建左右两个图表区域
      grid: [
        {
          // 左侧图表区域 - 显示历史容量数据
          left: '13%',
          right: '35%',
          top: '10%',
          bottom: '22%',
          containLabel: true,
          borderWidth: 1,
          borderColor: '#e5e7eb'
        },
        {
          // 右侧图表区域 - 显示预测数据（缩小宽度）
          left: '67%',
          right: '10%',
          top: '10%',
          bottom: '22%',
          containLabel: true,
          borderWidth: 1,
          borderColor: '#e5e7eb'
        }
      ],
      // 配置两个X轴
      xAxis: [
        {
          // 左侧X轴 - 显示0到maxCycleLife的历史数据
          gridIndex: 0,
          type: 'value',
          name: '', // 左侧不显示标签
          nameLocation: 'center',
          nameGap: 30,
          min: 0,
          max: breakPoint + breakPoint * 0.1, // 添加10%的边距
          axisTick: {
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e5e7eb',
              type: 'dashed'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#666'
            }
          },
          axisLabel: {
            show: true,
            fontSize: 11
          }
        },
        {
          // 右侧X轴 - 显示预测寿命范围
          gridIndex: 1,
          type: 'value',
          name: '',
          nameLocation: 'center',
          nameGap: 30,
          min: minPredictionCycle === maxPredictionCycle
            ? minPredictionCycle - Math.max(minPredictionCycle * 0.1, 100)
            : minPredictionCycle - (maxPredictionCycle - minPredictionCycle) * 0.1,
          max: minPredictionCycle === maxPredictionCycle
            ? maxPredictionCycle + Math.min(maxPredictionCycle * 0.1, 100)
            : maxPredictionCycle + (maxPredictionCycle - minPredictionCycle) * 0.1,
          axisTick: {
            show: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e5e7eb',
              type: 'dashed'
            }
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#666'
            }
          },
          axisLabel: {
            show: true,
            fontSize: 11
          }
        }
      ],
      // 配置两个Y轴
      yAxis: [
        {
          // 左侧Y轴
          gridIndex: 0,
          type: 'value',
          name: t('predictionTool.chart.yAxisName'),
          nameLocation: 'center',
          nameGap: 50,
          nameTextStyle: {
            fontSize: 12
          },
          min: yAxisMin,
          max: yAxisMax,
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          }
        },
        {
          // 右侧Y轴
          gridIndex: 1,
          type: 'value',
          name: '',
          nameLocation: 'center',
          nameGap: 50,
          nameTextStyle: {
            fontSize: 12
          },
          min: yAxisMin,
          max: yAxisMax,
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false  // 隐藏Y轴实线
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e5e7eb',
              type: 'dashed'  // 使用虚线样式，与X轴保持一致
            }
          }
        }
      ],
      series: [
        {
          // 左侧图表：历史容量数据
          name: t('predictionTool.chart.capacityProcess'),
          type: 'scatter',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: leftCycleDataSeries,
          symbolSize: 4,
          itemStyle: {
            color: '#5470c6',
            opacity: 0.7
          },
          emphasis: {
            itemStyle: {
              color: '#5470c6',
              opacity: 1,
              borderColor: '#fff',
              borderWidth: 2
            }
          },
          markLine: markLineYValue !== null ? {
            symbol: 'none',
            silent: true,
            data: [
              {
                yAxis: markLineYValue,
                name: '预测容量线',
                label: {
                  show: true,
                  position: 'start',
                  formatter: `80%\nSOH`
                },
                lineStyle: {
                  color: '#ff6b6b',
                  type: 'dashed',
                  width: 2
                }
              }
            ]
          } : undefined
        },
        {
          // 右侧图表：预测循环寿命数据
          name: t('predictionTool.chart.predictedCycleLife'),
          type: 'scatter',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: rightPredictionSeries,
          symbolSize: 8,
          itemStyle: {
            color: '#ee6666',
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              color: '#ee6666',
              borderColor: '#fff',
              borderWidth: 2,
              shadowColor: '#ee6666',
              shadowBlur: 8
            }
          },
          // 在右侧图表也显示markline，确保连接性
          markLine: markLineYValue !== null ? {
            symbol: 'none',
            silent: true,
            data: [
              {
                yAxis: markLineYValue,
                name: '预测容量线',
                label: {
                  show: false // 右侧不显示标签，避免重复
                },
                lineStyle: {
                  color: '#ff6b6b',
                  type: 'dashed',
                  width: 2
                }
              }
            ]
          } : undefined
        },
        {
          // 左侧轴线断裂效果 - 斜线组合
          name: '',
          type: 'line',
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [],
          silent: true,
          markPoint: {
            symbol: 'path://M-3,-10 L3,-2 M-3,2 L3,10',
            symbolSize: [6, 20],
            symbolOffset: [0, 0],
            itemStyle: {
              color: '#333',
              borderColor: '#333',
              borderWidth: 2
            },
            data: [
              {
                coord: [breakPoint + breakPoint * 0.1, yAxisMax],
                value: '',
                label: {
                  show: false
                }
              },
              {
                coord: [breakPoint + breakPoint * 0.1, yAxisMin],
                value: '',
                label: {
                  show: false
                }
              }
            ]
          }
        },
        {
          // 右侧轴线断裂效果 - 斜线组合
          name: '',
          type: 'line',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: [],
          silent: true,
          markPoint: {
            symbol: 'path://M-3,-10 L3,-2 M-3,2 L3,10',
            symbolSize: [6, 20],
            symbolOffset: [0, 0],
            itemStyle: {
              color: '#333',
              borderColor: '#333',
              borderWidth: 2
            },
            data: [
              {
                coord: [
                  minPredictionCycle === maxPredictionCycle
                    ? minPredictionCycle - Math.max(minPredictionCycle * 0.1, 50)
                    : minPredictionCycle - (maxPredictionCycle - minPredictionCycle) * 0.1,
                  yAxisMax
                ],
                value: '',
                label: {
                  show: false
                }
              },
              {
                coord: [
                  minPredictionCycle === maxPredictionCycle
                    ? minPredictionCycle - Math.max(minPredictionCycle * 0.1, 50)
                    : minPredictionCycle - (maxPredictionCycle - minPredictionCycle) * 0.1,
                  yAxisMin
                ],
                value: '',
                label: {
                  show: false
                }
              }
            ]
          }
        }
      ]
    };
  }, [brcodeData, selectedBarcode, t, maxCycleLife]);

  const onChartClick = (params: any) => {
    if (params.data && params.data[2] && onBarcodeSelect) {
      onBarcodeSelect(params.data[2]); // 第三个元素是barcode
    }
  };

  const onEvents = {
    click: onChartClick
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
      />
    </div>
  );
};

export default CycleLifeScatterChart;