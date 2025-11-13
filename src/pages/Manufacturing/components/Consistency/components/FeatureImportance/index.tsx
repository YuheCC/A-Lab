import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import './index.less';

interface FeatureData {
  name: string;
  value: number;
  impact: number;
}

export interface FeatureImportanceProps {
  nodeId?: string;
  data?: FeatureData[];
}

// 不同节点的 Mock 数据
const mockDataMap: Record<string, FeatureData[]> = {
  // 默认数据（全局）
  default: [
    { name: 'Feature 20', value: 4074.178, impact: 0.2134 },
    { name: 'Feature 10', value: 9.917, impact: 0.0726 },
    { name: 'Feature 54', value: 104.21, impact: -0.0521 },
    { name: 'Feature 23', value: 42.632, impact: 0.0516 },
    { name: 'Feature 40', value: 4166.833, impact: 0.0489 },
    { name: 'Feature 57', value: 1.699, impact: -0.0299 },
    { name: 'Feature 3', value: 52.823, impact: 0.0279 },
    { name: 'Feature 9', value: 41.22, impact: 0.0239 },
    { name: 'Feature 17', value: 24.614, impact: 0.0234 },
  ],
  // Production Line A
  '1': [
    { name: 'Feature 20', value: 4200.5, impact: 0.2450 },
    { name: 'Feature 10', value: 10.2, impact: 0.0850 },
    { name: 'Feature 23', value: 45.8, impact: 0.0620 },
    { name: 'Feature 54', value: 98.5, impact: -0.0380 },
    { name: 'Feature 40', value: 4250.2, impact: 0.0520 },
    { name: 'Feature 3', value: 55.1, impact: 0.0310 },
    { name: 'Feature 57', value: 1.85, impact: -0.0250 },
    { name: 'Feature 9', value: 43.5, impact: 0.0280 },
    { name: 'Feature 17', value: 26.3, impact: 0.0260 },
  ],
  // Machine 1
  '1-1': [
    { name: 'Feature 20', value: 4300.2, impact: 0.2680 },
    { name: 'Feature 10', value: 11.5, impact: 0.0920 },
    { name: 'Feature 23', value: 48.2, impact: 0.0680 },
    { name: 'Feature 40', value: 4320.5, impact: 0.0580 },
    { name: 'Feature 54', value: 95.3, impact: -0.0320 },
    { name: 'Feature 3', value: 58.2, impact: 0.0350 },
    { name: 'Feature 9', value: 45.8, impact: 0.0320 },
    { name: 'Feature 17', value: 28.5, impact: 0.0290 },
    { name: 'Feature 57', value: 1.95, impact: -0.0220 },
  ],
  // Machine 2
  '1-2': [
    { name: 'Feature 20', value: 4150.8, impact: 0.2280 },
    { name: 'Feature 10', value: 9.8, impact: 0.0780 },
    { name: 'Feature 54', value: 102.1, impact: -0.0450 },
    { name: 'Feature 23', value: 44.5, impact: 0.0580 },
    { name: 'Feature 40', value: 4180.5, impact: 0.0460 },
    { name: 'Feature 57', value: 1.75, impact: -0.0280 },
    { name: 'Feature 3', value: 52.8, impact: 0.0270 },
    { name: 'Feature 9', value: 41.2, impact: 0.0240 },
    { name: 'Feature 17', value: 24.8, impact: 0.0230 },
  ],
  // Production Line B
  '2': [
    { name: 'Feature 20', value: 3950.3, impact: 0.1980 },
    { name: 'Feature 10', value: 9.2, impact: 0.0680 },
    { name: 'Feature 54', value: 108.5, impact: -0.0580 },
    { name: 'Feature 23', value: 40.8, impact: 0.0480 },
    { name: 'Feature 40', value: 4050.2, impact: 0.0420 },
    { name: 'Feature 57', value: 1.55, impact: -0.0320 },
    { name: 'Feature 3', value: 50.2, impact: 0.0250 },
    { name: 'Feature 9', value: 39.5, impact: 0.0210 },
    { name: 'Feature 17', value: 23.1, impact: 0.0200 },
  ],
  // Production Line C
  '3': [
    { name: 'Feature 20', value: 4100.5, impact: 0.2250 },
    { name: 'Feature 10', value: 10.5, impact: 0.0800 },
    { name: 'Feature 23', value: 43.8, impact: 0.0560 },
    { name: 'Feature 54', value: 100.8, impact: -0.0480 },
    { name: 'Feature 40', value: 4200.8, impact: 0.0510 },
    { name: 'Feature 3', value: 54.5, impact: 0.0295 },
    { name: 'Feature 57', value: 1.72, impact: -0.0270 },
    { name: 'Feature 9', value: 42.5, impact: 0.0255 },
    { name: 'Feature 17', value: 25.5, impact: 0.0245 },
  ],
};

const FeatureImportance: React.FC<FeatureImportanceProps> = ({ nodeId, data }) => {
  const { t } = useTranslation();

  // 根据 nodeId 获取对应的数据
  const chartData = useMemo(() => {
    if (data) return data;
    return mockDataMap[nodeId || 'default'] || mockDataMap.default;
  }, [nodeId, data]);

  const chartOption = useMemo(() => {
    // 基准值和预测值（根据数据动态计算）
    const totalImpact = chartData.reduce((sum, item) => sum + item.impact, 0);
    const baseValue = 0.362;
    const otherFeaturesImpact = 0.0608;
    const predictedValue = baseValue + totalImpact + otherFeaturesImpact;

    // 其他特征汇总
    const otherFeaturesCount = 52;

    // 按影响从负到正排序（负影响在前，正影响在后）
    const sortedData = [...chartData].sort((a, b) => a.impact - b.impact);

    // 计算累积值（瀑布图的关键：每个bar的起始位置）
    let cumulative = baseValue;
    const waterfallData = sortedData.map((item) => {
      const start = cumulative;
      cumulative += item.impact;
      return {
        name: item.name,
        value: item.value,
        impact: item.impact,
        start: start,
        end: cumulative,
      };
    });

    // 添加"其他特征"
    const otherStart = cumulative;
    cumulative += otherFeaturesImpact;

    // Y轴数据（倒序显示，从上到下）
    const yAxisData = [...waterfallData, {
      name: `${otherFeaturesCount} other features`,
      value: 0,
      impact: otherFeaturesImpact,
      start: otherStart,
      end: cumulative,
    }].reverse();

    return {
      title: {
        text: `f(x) = ${predictedValue.toFixed(3)}`,
        right: 10,
        top: 10,
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal',
          color: '#666',
        },
      },
      grid: {
        left: 120,
        right: 120,
        top: 50,
        bottom: 60,
      },
      xAxis: {
        type: 'value',
        name: 'E[f(X)]',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: {
          fontSize: 12,
          color: '#666',
        },
        min: 0.3,
        max: 0.85,
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: '#e0e0e0',
          },
        },
        axisLine: {
          lineStyle: {
            color: '#999',
          },
        },
        axisLabel: {
          formatter: (value: number) => value.toFixed(1),
        },
      },
      yAxis: {
        type: 'category',
        data: yAxisData.map((item) => {
          if (item.name.includes('other features')) {
            return item.name;
          }
          return `${item.value.toFixed(3)} = ${item.name}`;
        }),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          fontSize: 11,
          color: '#666',
        },
      },
      series: [
        // 透明占位（实现瀑布图效果）
        {
          type: 'bar',
          stack: 'total',
          silent: true,
          barWidth: 20,
          itemStyle: {
            color: 'transparent',
          },
          data: yAxisData.map((item) => item.start),
        },
        // 实际的影响条
        {
          type: 'bar',
          stack: 'total',
          barWidth: 20,
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const item = yAxisData[params.dataIndex];
              if (!item) return '';
              return `${item.impact > 0 ? '+' : ''}${item.impact.toFixed(4)}`;
            },
            fontSize: 11,
            color: '#333',
          },
          data: yAxisData.map((item) => ({
            value: Math.abs(item.impact),
            impact: item.impact, // 保存原始 impact 值
            itemStyle: {
              color: item.impact > 0 ? '#ff1744' : '#2962ff',
            },
          })),
        },
        // 基准线
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              show: true,
              position: 'insideEndTop',
              formatter: `E[f(X)] = ${baseValue.toFixed(3)}`,
              fontSize: 11,
              color: '#666',
            },
            lineStyle: {
              type: 'solid',
              color: '#999',
              width: 2,
            },
            data: [
              {
                xAxis: baseValue,
              },
            ],
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          if (!params || !params[0]) return '';
          const item = yAxisData[params[0].dataIndex];
          if (!item) return '';
          if (item.name.includes('other features')) {
            return `${item.name}<br/>Impact: +${item.impact.toFixed(4)}<br/>Cumulative: ${item.end.toFixed(3)}`;
          }
          return `${item.name}<br/>Value: ${item.value.toFixed(3)}<br/>Impact: ${item.impact > 0 ? '+' : ''}${item.impact.toFixed(4)}<br/>Cumulative: ${item.end.toFixed(3)}`;
        },
      },
    };
  }, [chartData]);

  return (
    <div className="feature-importance">
      <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'svg' }} />
    </div>
  );
};

export default FeatureImportance;
