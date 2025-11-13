import type { EChartsOption } from 'echarts';

// SHAP 特征重要性数据
export const shapFeatureData = {
  features: [
    'Process Data11',
    'Process Data55',
    'Process Data7',
    'Process Data19',
    'Process Data8',
    'Process Data40',
    'Process Data58',
    'Process Data47',
    'Process Data17',
    'Process Data32',
    'Process Data21',
    'Process Data5',
    'Process Data15',
    'Process Data13',
    'Process Data53',
    'Process Data23',
    'Process Data48',
    'Process Data60',
    'Process Data10',
    'Process Data61',
  ],
  values: [
    1.4161219596862793, 1.0078660249710083, 0.30046799778938293, 0.17237499356269836,
    0.17076300084590912, 0.1671919971704483, 0.1469469964504242, 0.14220499992370605,
    0.1208529993891716, 0.11656200140714645, 0.11290200054645538, 0.11133500188589096,
    0.10330700129270554, 0.09625200182199478, 0.09605400264263153, 0.09489399939775467,
    0.09398700296878815, 0.08991300314664841, 0.08948100358247757, 0.0893929973244667,
  ],
  colorStops: [
    { offset: 0, color: '#5470c6' },
    { offset: 1, color: '#91cc75' },
  ],
};

// 创建 ECharts 配置的函数，接收 i18n 翻译函数
export const getShapEchartsConfig = (t: (key: string) => string): EChartsOption => {
  return {
    title: {
      text: t('manufacturing.charts.shap.title'),
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'value',
      name: t('manufacturing.charts.shap.xAxisName'),
    },
    yAxis: {
      type: 'category',
      data: shapFeatureData.features,
      inverse: true,
    },
    series: [
      {
        name: t('manufacturing.charts.shap.seriesName'),
        type: 'bar',
        data: shapFeatureData.values,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: shapFeatureData.colorStops,
          },
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
        },
      },
    ],
    grid: {
      left: '15%',
      right: '10%',
      top: '15%',
      bottom: '10%',
    },
  };
};
