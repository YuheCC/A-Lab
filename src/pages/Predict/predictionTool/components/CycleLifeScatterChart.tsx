import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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
  const option = useMemo(() => {
    if (!brcodeData || brcodeData.length === 0) {
      return {};
    }

    // 散点图数据：显示最终预测的循环寿命
    const lifePredictionSeries: any[] = [];

    brcodeData.forEach((item) => {
      if (item.cycle_life_1 !== null) {
        const cycleLife = item.cycle_life_1;

        // 只显示预测的循环寿命点，不生成模拟的容量变化过程
        lifePredictionSeries.push([
          cycleLife,
          item.capacity || 0, // 使用真实容量数据，如果没有则使用默认值
          item.barcode
        ]);
      }
    });

    // 直接使用原始的循环寿命数据作为散点图数据
    const adjustedLifePredictionSeries = lifePredictionSeries;

    return {
      title: {
        text: '电池循环寿命预测',
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
              <strong>循环次数:</strong> ${Math.round(cycle)}<br/>
            </div>
          `;
        }
      },
      legend: {
        data: ['预测循环寿命'],
        bottom: 10
      },
      grid: {
        left: '10%',
        right: '8%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: '循环次数 (Cycle)',
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
        name: '放电容量',
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
          name: '预测循环寿命',
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
  }, [brcodeData, selectedBarcode]);

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