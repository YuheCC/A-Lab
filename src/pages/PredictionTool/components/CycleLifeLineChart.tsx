import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { BarcodeData } from '@/services/prediction/predictionTool';

interface CycleLifeLineChartProps {
  brcodeData: BarcodeData[];
  selectedBarcode?: string;
  onBarcodeSelect?: (barcode: string) => void;
}

const CycleLifeLineChart: React.FC<CycleLifeLineChartProps> = ({
  brcodeData,
  selectedBarcode,
  onBarcodeSelect
}) => {
  const { t } = useTranslation();

  const option = useMemo(() => {
    if (!brcodeData || brcodeData.length === 0) {
      return {};
    }

    const series: any[] = [];

    brcodeData.forEach((item) => {
      // Only process if model_result exists
      if (item.model_result) {
        const {
          original_cycles,
          original_sohs,
          predicted_cycles,
          predicted_sohs,
          max_cycle,
          predicted_value
        } = item.model_result;
        
        const isSelected = selectedBarcode === item.barcode;
        const opacity = 0.7; // selectedBarcode ? (isSelected ? 1 : 0.1) : 0.7;
        const z = 1; // isSelected ? 2 : 1;

        // Original Data (Blue)
        if (original_cycles && original_sohs && original_cycles.length === original_sohs.length) {
          
          if (max_cycle !== undefined) {
            // Split data into solid (<= max_cycle) and dashed (> max_cycle)
            const solidData: number[][] = [];
            const dashedData: number[][] = [];
            
            original_cycles.forEach((cycle, index) => {
              const soh = original_sohs[index];
              if (cycle <= max_cycle) {
                solidData.push([cycle, soh]);
                // If this is the last point <= max_cycle, check if next point exists and add it to dashed as start point?
                // Usually not needed for simple line charts, but better continuity:
                // If cycle == max_cycle, it is the connection point.
              } else {
                 dashedData.push([cycle, soh]);
              }
            });

            // Solid Line
            if (solidData.length > 0) {
              series.push({
                name: `${t('predictionTool.chart.originalSohUsed')}`,
                type: 'line',
                data: solidData,
                showSymbol: false,
                smooth: true,
                lineStyle: {
                  color: '#5470c6',
                  width: 1, // isSelected ? 3 : 1,
                  opacity: opacity,
                  type: 'solid'
                },
                z: z,
                customBarcode: item.barcode
              });
            }

            // Dashed Line
            if (dashedData.length > 0) {
              series.push({
                name: `${t('predictionTool.chart.originalSohUnused')}`,
                type: 'line',
                data: dashedData,
                showSymbol: false,
                smooth: true,
                lineStyle: {
                  color: '#5470c6',
                  width: 1, // isSelected ? 3 : 1,
                  opacity: opacity,
                  type: 'dashed'
                },
                z: z,
                customBarcode: item.barcode
              });
            }

          } else {
            // Fallback: All solid if no max_cycle
            const data = original_cycles.map((cycle, index) => [cycle, original_sohs[index]]);
            series.push({
              name: `${t('predictionTool.chart.originalSoh')}`,
              type: 'line',
              data: data,
              showSymbol: false,
              smooth: true,
              lineStyle: {
                color: '#5470c6',
                width: 1, // isSelected ? 3 : 1,
                opacity: opacity
              },
              z: z,
              customBarcode: item.barcode
            });
          }
        }

        // Predicted Data (Red)
        if (predicted_cycles && predicted_sohs && predicted_cycles.length === predicted_sohs.length) {
          const data = predicted_cycles.map((cycle, index) => [cycle, predicted_sohs[index]]);

          const seriesItem: any = {
            name: `${t('predictionTool.chart.estimatedSoh')}`,
            type: 'line',
            data: data,
            showSymbol: false,
            smooth: true,
            lineStyle: {
              color: '#ee6666',
              width: 1, // isSelected ? 3 : 1,
              opacity: opacity,
              type: 'dashed' // Keeping red as dashed per previous logic, or solid? "predicted data red". Usually dashed for prediction.
            },
            z: z,
            customBarcode: item.barcode
          };

          // Add MarkLine and MarkPoint if selected or only one item?
          // Adding to ALL lines might be chaotic if many lines.
          // Let's add ONLY if isSelected is true OR if there is only 1 barcode.
          if ((isSelected || brcodeData.length === 1) && predicted_value) {
             seriesItem.markLine = {
                symbol: 'none',
                silent: true,
                data: [
                    {
                        yAxis: 80,
                        lineStyle: {
                            color: '#ee6666',
                            type: 'dashed',
                            width: 1
                        },
                        label: {
                            show: false
                        }
                    },
                    {
                        xAxis: max_cycle,
                        lineStyle: {
                            color: '#ee6666',
                            type: 'dashed',
                            width: 1
                        },
                        label: {
                            show: false
                        }
                    }
                ]
             };
             
             seriesItem.markPoint = {
                symbol: 'circle',
                symbolSize: 10,
                itemStyle: {
                    color: '#ee6666'
                },
                data: [
                    {
                        coord: [predicted_value, 80],
                        value: predicted_value,
                        label: {
                            show: true,
                            position: 'top',
                            formatter: ({ value }: any) => Math.round(value)
                        }
                    }
                ]
             };
          }

          series.push(seriesItem);
        }
      }
    });

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
            if (!params || params.length === 0) return '';
            
            const firstParam = params[0];
            const cycle = firstParam.value[0];
            let html = `<div><strong>${t('predictionTool.chart.cycleCount')}: ${Math.round(cycle)}</strong></div>`;
            
            // Deduplicate tooltips for split lines (solid/dashed of same barcode)
            const processedSeries = new Set();

            params.forEach(param => {
                if (params.length > 15 && !selectedBarcode) return; // Limit quantity
                if (selectedBarcode && param.seriesName.indexOf(selectedBarcode) === -1) return;

                // Simple deduplication logic: 
                // We use customBarcode to identify unique battery
                // But we have split series names.
                // Just let them show.
                
                const val = param.value[1];
                const color = param.seriesName === t('predictionTool.chart.estimatedSoh') ? '#ee6666' : '#5470c6';
                
                html += `<div style="color: ${color}">
                  ${param.seriesName}: ${val?.toFixed(4) || '0'}
                </div>`;
            });
            return html;
        }
      },
      legend: {
        data: [
            { name: t('predictionTool.chart.originalSoh'), itemStyle: { color: '#5470c6' } },
            { name: t('predictionTool.chart.estimatedSoh'), itemStyle: { color: '#ee6666' } }
        ],
        bottom: '10',
        selectedMode: false 
      },
      grid: {
        left: '3%',
        right: '3%',
        top: '10%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        name: t('predictionTool.chart.xAxisLabel'),
        nameLocation: 'middle',
        nameGap: 30,
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: t('predictionTool.chart.yAxisLabel'),
        nameLocation: 'middle',
        nameGap: 50,
        min: 75,
        max: 105,
        scale: true, // Auto scale
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
          ...series,
          // Dummy series for Legend
          {
              name: t('predictionTool.chart.originalSoh'),
              type: 'line',
              data: [],
              itemStyle: { color: '#5470c6' },
              showSymbol: false
          },
          {
              name: t('predictionTool.chart.estimatedSoh'),
              type: 'line',
              data: [],
              itemStyle: { color: '#ee6666' },
              lineStyle: { type: 'dashed' },
              showSymbol: false
          }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'filter'
        },
        {
          type: 'inside',
          xAxisIndex: 0,
          filterMode: 'filter'
        }
      ]
    };
  }, [brcodeData, selectedBarcode, t]);

  const onChartClick = (params: any) => {
      if (onBarcodeSelect && params.seriesName) {
          const parts = params.seriesName.split(' - ');
          if (parts.length > 0) {
              const barcode = parts[0];
              if (brcodeData.some(b => b.barcode === barcode)) {
                  onBarcodeSelect(barcode);
              }
          }
      }
  };

  const onEvents = {
    click: onChartClick
  };

  return (
    <div style={{ width: '100%', height: '550px' }}>
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
        notMerge={true} 
      />
    </div>
  );
};

export default CycleLifeLineChart;