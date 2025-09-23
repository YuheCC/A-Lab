import React, { useMemo } from 'react';
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

  const option = useMemo(() => {
    if (!brcodeData || brcodeData.length === 0) {
      return {};
    }

    // 第一个散点图：真实容量变化数据（如果有的话）
    const cycleDataSeries: any[] = [];
    // 第二个散点图：预测的循环寿命
    const lifePredictionSeries: any[] = [];

    brcodeData.forEach((item) => {
      if (item.cycle_life_1 !== null) {
        const cycleLife = item.cycle_life_1;

        // 如果有真实的容量历史数据，添加到第一个系列
        if (item.cycle_life_1_cycles_detail && typeof item.cycle_life_1_cycles_detail === 'object') {
          Object.entries(item.cycle_life_1_cycles_detail).forEach(([cycle, capacity]) => {
            cycleDataSeries.push([parseInt(cycle), capacity, item.barcode]);
          });
        }

        // 预测的循环寿命点添加到第二个系列
        lifePredictionSeries.push([
          cycleLife,
          1.4, // 使用默认容量值，可以根据需要调整
          item.barcode
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
          const [cycle] = params.data;
          return `
            <div>
              <strong>${t('predictionTool.chart.cycleCount')}:</strong> ${Math.round(cycle)}<br/>
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
        right: '10%',
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
          formatter: (value: number) => Math.round(value).toString()
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
          }
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
  }, [brcodeData, selectedBarcode, t]);

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