/**
 * ECharts 组件初始化配置
 *
 * 统一注册 ECharts 所需的组件，避免运行时错误
 */
import * as echarts from 'echarts/core';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  GraphicComponent, // 用于绘制自定义图形（如椭圆、路径等）
} from 'echarts/components';
import {
  LineChart,
  BarChart,
  ScatterChart,
  RadarChart,
  PieChart,
} from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
  // 组件
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  MarkPointComponent,
  GraphicComponent, // ⚠️ 重要：用于支持 graphic 配置

  // 图表类型
  LineChart,
  BarChart,
  ScatterChart,
  RadarChart,
  PieChart,

  // 渲染器
  CanvasRenderer,
]);

export default echarts;
