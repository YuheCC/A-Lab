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

    // 第一个散点图：真实容量变化数据（如果有的话）
    const cycleDataSeries: any[] = [];
    // 第二个散点图：预测的循环寿命
    const lifePredictionSeries: any[] = [];

    let markLineYValue: number | null = null;

    brcodeData.forEach((item) => {
      if (item.cycle_life_1 !== null) {
        const cycle_life_1_predict_detail = item.cycle_life_1_predict_detail || {};
        const cycleLife = item.cycle_life_1;

        // 如果有真实的容量历史数据，添加到第一个系列
        if (item.cycle_life_1_cycles_detail && typeof item.cycle_life_1_cycles_detail === 'object') {
          Object.entries(item.cycle_life_1_cycles_detail).forEach(([cycle, capacity]) => {
            cycleDataSeries.push([parseInt(cycle), capacity, parseInt(cycle)]);
          });
        }

        const maxCycleLife = Math.max(...Object.keys(item.cycle_life_1_cycles_detail || {}).map(Number));
        setMaxCycleLife(maxCycleLife);

        // 获取用于标记线的 y 值
        const predictValue = cycle_life_1_predict_detail?.[cycleLife];
        if (predictValue !== undefined && predictValue !== null) {
          markLineYValue = predictValue;
        }

        // 预测的循环寿命点添加到第二个系列
        lifePredictionSeries.push([
          (maxCycleLife * 1.2 ).toFixed(0),
          predictValue || 0, // 使用默认容量值，可以根据需要调整
          cycleLife
        ]);
      }
    });

    // 直接使用原始的循环寿命数据作为散点图数据
    const adjustedLifePredictionSeries = lifePredictionSeries;

    return {
      title: {
        text: t('predictionTool.chart.title'),
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
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
      grid: {
        left: '15%',
        right: '12%',
        bottom: '22%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: t('predictionTool.chart.xAxisName'),
        nameLocation: 'center',
        nameGap: 30,
        axisLabel: {
          formatter: (value: number) => {
            const roundedValue = Math.round(value);
            return roundedValue <= maxCycleLife ? roundedValue.toString() : '';
          }
        },
        axisTick: {
          show: true
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#e5e7eb',
            type: 'dashed'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: t('predictionTool.chart.yAxisName'),
        nameLocation: 'center',
        nameGap: 50,
        nameTextStyle: {
          fontSize: 12
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        }
      },
      series: [
        {
          name: t('predictionTool.chart.capacityProcess'),
          type: 'scatter',
          data: cycleDataSeries,
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
                  position: 'end',
                  formatter: `80% SOH`
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
          name: t('predictionTool.chart.predictedCycleLife'),
          type: 'scatter',
          data: adjustedLifePredictionSeries,
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