import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Empty } from 'antd';
import './index.less';

interface FeatureData {
  name: string;
  value: number;
  impact: number;
}

export interface FeatureImportanceProps {
  data: FeatureData[];
}

const FeatureImportance: React.FC<FeatureImportanceProps> = ({ data }) => {

  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="feature-importance" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Empty description="暂无数据" />
      </div>
    );
  }

  const chartData = data;

  const chartOption = useMemo(() => {
    // 从数据中提取基准值（名称为 'E[f(X)]' 的项）
    const baseValueItem = chartData.find(item => item.name === 'E[f(X)]');
    const baseValue = baseValueItem ? baseValueItem.value : 0.362;

    // 过滤掉基准值项，只保留特征项
    const featuresOnly = chartData.filter(item => item.name !== 'E[f(X)]');

    // 查找 "others" 项
    const othersItem = featuresOnly.find(item => item.name.toLowerCase().includes('others'));
    const otherFeaturesImpact = othersItem ? othersItem.impact : 0;
    const otherFeaturesCount = othersItem ? 52 : 0; // 可以从 details 字段解析，暂时使用默认值

    // 过滤掉 "others" 项，单独处理
    const regularFeatures = featuresOnly.filter(item => !item.name.toLowerCase().includes('others'));

    // 计算总影响和预测值
    const totalImpact = featuresOnly.reduce((sum, item) => sum + item.impact, 0);
    const predictedValue = baseValue + totalImpact;

    // 按影响从负到正排序（负影响在前，正影响在后）
    const sortedData = [...regularFeatures].sort((a, b) => a.impact - b.impact);

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

    // 添加"其他特征"（如果存在）
    let yAxisData = [...waterfallData];
    if (othersItem) {
      const otherStart = cumulative;
      cumulative += otherFeaturesImpact;
      yAxisData.push({
        name: othersItem.name, // 使用 JSON 中的名称，通常是 "others"
        value: 0,
        impact: otherFeaturesImpact,
        start: otherStart,
        end: cumulative,
      });
    }

    // Y轴数据（倒序显示，从上到下）
    yAxisData = yAxisData.reverse();

    // 动态计算 x 轴范围
    const allValues = [baseValue, predictedValue, ...yAxisData.map(d => d.start), ...yAxisData.map(d => d.end)];
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const padding = (maxValue - minValue) * 0.1; // 10% padding
    const xAxisMin = Math.max(0, minValue - padding); // 不小于 0
    const xAxisMax = maxValue + padding;

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
        left: 160,
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
        min: xAxisMin,
        max: xAxisMax,
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
          formatter: (value: number) => value.toFixed(2),
        },
      },
      yAxis: {
        type: 'category',
        data: yAxisData.map((item) => {
          if (item.name.toLowerCase().includes('others') || item.name.includes('other features')) {
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
          width: 180,
          overflow: 'truncate',
          ellipsis: '...',
        },
      },
      series: [
        // 箭头形状的影响条（自定义渲染）
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const dataIndex = params.dataIndex;
            const item = yAxisData[dataIndex];

            // 获取起始和结束位置的像素坐标
            const startCoord = api.coord([item.start, dataIndex]);
            const endCoord = api.coord([item.end, dataIndex]);

            // 计算柱状图的像素宽度
            const width = Math.abs(endCoord[0] - startCoord[0]);

            // 柱状图的高度
            const barHeight = 25;

            // 箭头宽度自适应：保证最小3px，最大占比16%，默认10%
            const minArrowWidth = 3;
            const maxArrowRatio = 0.16;
            const defaultArrowRatio = 0.1;
            const arrowWidth = Math.max(
              minArrowWidth,
              Math.min(width * maxArrowRatio, width * defaultArrowRatio)
            );
            const rectWidth = width - arrowWidth;

            // 确定绘制方向（正影响向右，负影响向左）
            const isPositive = item.impact > 0;
            const x = startCoord[0];
            const y = startCoord[1];

            // 箭头的5个顶点坐标
            let points;
            if (isPositive) {
              // 正影响：箭头指向右侧
              points = [
                [x, y - barHeight / 2],                    // 左下
                [x, y + barHeight / 2],                    // 左上
                [x + rectWidth, y + barHeight / 2],        // 矩形右上
                [x + width, y],                            // 箭头尖端（右侧顶点）
                [x + rectWidth, y - barHeight / 2],        // 矩形右下
              ];
            } else {
              // 负影响：箭头指向左侧
              points = [
                [x + width, y - barHeight / 2],            // 右下
                [x + width, y + barHeight / 2],            // 右上
                [x + arrowWidth, y + barHeight / 2],       // 矩形左上
                [x, y],                                    // 箭头尖端（左侧顶点）
                [x + arrowWidth, y - barHeight / 2],       // 矩形左下
              ];
            }

            // 返回箭头形状和标签
            return {
              type: 'group',
              children: [
                // 箭头多边形
                {
                  type: 'polygon',
                  shape: { points },
                  style: {
                    fill: item.impact > 0 ? '#ff1744' : '#2962ff',
                  },
                  // 保留 hover 效果
                  emphasis: {
                    style: {
                      opacity: 0.8,
                    },
                  },
                },
                // 右侧标签
                {
                  type: 'text',
                  style: {
                    text: `${item.impact > 0 ? '+' : ''}${item.impact.toFixed(4)}`,
                    x: endCoord[0] + 5,
                    y: y,
                    textAlign: 'left',
                    textVerticalAlign: 'middle',
                    fontSize: 11,
                    fill: '#333',
                  },
                },
              ],
            };
          },
          data: yAxisData,
          z: 10, // 确保显示在最上层
        },
        // 基准线
        // {
        //   type: 'line',
        //   markLine: {
        //     silent: true,
        //     symbol: 'none',
        //     label: {
        //       show: true,
        //       position: 'insideEndTop',
        //       formatter: `E[f(X)] = ${baseValue.toFixed(3)}`,
        //       fontSize: 11,
        //       color: '#666',
        //     },
        //     lineStyle: {
        //       type: 'solid',
        //       color: '#999',
        //       width: 2,
        //     },
        //     data: [
        //       {
        //         xAxis: baseValue,
        //       },
        //     ],
        //   },
        // },
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
          if (item.name.toLowerCase().includes('others') || item.name.includes('other features')) {
            return `${item.name}<br/>Impact: ${item.impact > 0 ? '+' : ''}${item.impact.toFixed(4)}<br/>Cumulative: ${item.end.toFixed(3)}`;
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
