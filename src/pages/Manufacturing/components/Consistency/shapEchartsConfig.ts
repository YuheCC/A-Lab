import type { EChartsOption } from 'echarts';
import scatterData from './scat.json';

// SHAP 特征重要性数据
export const shapFeatureData = {
  features: [
    "Process Data11",
    "Process Data55",
    "Process Data7",
    "Process Data18",
    "Process Data58",
    "Process Data40",
    "Process Data19",
    "Process Data21",
    "Process Data50",
    "Process Data24",
    "Process Data8",
    "Process Data47",
    "Process Data23",
    "Process Data48",
    "Process Data39",
    "Process Data5",
    "Process Data61",
    "Process Data2",
    "Process Data45",
    "Process Data41"
  ],
  values: [
    0.200081005692482,
    0.12066899985074997,
    0.024188999086618423,
    0.016797000542283058,
    0.013867000117897987,
    0.013844000175595284,
    0.012738999910652637,
    0.01158900000154972,
    0.010615999810397625,
    0.010187000036239624,
    0.009801000356674194,
    0.0096220001578331,
    0.008941000327467918,
    0.008488999679684639,
    0.00803299993276596,
    0.007507000118494034,
    0.006771999876946211,
    0.006587000098079443,
    0.006473999936133623,
    0.005305000115185976
  ],
  colorStops: [
    { offset: 0, color: '#5470c6' },
    { offset: 1, color: '#91cc75' },
  ],
};

// 处理散点图数据用于在柱状图旁边展示
const prepareScatterDataForBar = () => {
  const result: any[] = [];

  shapFeatureData.features.forEach((featureName) => {
    const featureData = (scatterData.scatterData as any)[featureName];
    if (featureData) {
      const { shap_values, feature_values } = featureData;
      // 为每个特征创建散点数据
      shap_values.forEach((shapValue: number, index: number) => {
        result.push({
          name: featureName,
          value: [shapValue, featureName, feature_values[index]],
          symbolSize: 6,
        });
      });
    }
  });

  return result;
};

// 创建 ECharts 配置的函数，接收 i18n 翻译函数
export const getShapEchartsConfig = (t: (key: string) => string): EChartsOption => {
  const scatterDataPoints = prepareScatterDataForBar();

  // 计算所有特征值的范围用于visualMap
  let minFeatureValue = Infinity;
  let maxFeatureValue = -Infinity;
  scatterDataPoints.forEach((point: any) => {
    const featureValue = point.value[2];
    minFeatureValue = Math.min(minFeatureValue, featureValue);
    maxFeatureValue = Math.max(maxFeatureValue, featureValue);
  });

  return {
    title: {
      text: t('manufacturing.charts.shap.title'),
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.seriesType === 'bar') {
          return `${params.name}<br/>${t('manufacturing.charts.shap.seriesName')}: ${params.value}`;
        } else {
          return `${params.data.name}<br/>
                  ${t('manufacturing.charts.scatter.shapValue')}: ${params.value[0].toFixed(4)}<br/>
                  ${t('manufacturing.charts.scatter.featureValue')}: ${params.value[2].toFixed(4)}`;
        }
      },
    },
    legend: {
      data: [t('manufacturing.charts.shap.seriesName'), t('manufacturing.charts.scatter.title')],
      top: '5%',
    },
    visualMap: {
      min: minFeatureValue,
      max: maxFeatureValue,
      dimension: 2, // 根据特征值（第3个维度）进行颜色映射
      orient: 'vertical',
      right: '2%',
      top: 'center',
      text: [t('manufacturing.charts.scatter.high'), t('manufacturing.charts.scatter.low')],
      calculable: true,
      inRange: {
        color: ['#08519c', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef',
                '#e377c2', '#d62976', '#e8564d', '#f03b20', '#bd0026'],
      },
      textStyle: {
        color: '#333',
      },
    },
    xAxis: [
      {
        type: 'value',
        name: t('manufacturing.charts.shap.xAxisName'),
        position: 'bottom',
      },
    ],
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
          opacity: 0.3,
        },
        label: {
          show: false, // 隐藏柱状图上的数值标签
        },
        z: 1,
      },
      {
        name: t('manufacturing.charts.scatter.title'),
        type: 'scatter',
        data: scatterDataPoints,
        symbolSize: 6,
        z: 2,
      },
    ],
    grid: {
      left: '15%',
      right: '15%',
      top: '15%',
      bottom: '10%',
    },
  };
};

