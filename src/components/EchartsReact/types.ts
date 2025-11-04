import { EChartsOption } from 'echarts';
import { CSSProperties } from 'react';

/**
 * ECharts 事件参数接口
 */
export interface EChartsEventParams {
  componentType: string;
  seriesType?: string;
  dataIndex?: number;
  data?: any;
  name?: string;
  value?: any;
  color?: string;
  [key: string]: any;
}

/**
 * ECharts 事件处理函数类型
 */
export type EChartsEventHandler = (params: EChartsEventParams) => void;

/**
 * ECharts 事件映射接口
 */
export interface EChartsEvents {
  click?: EChartsEventHandler;
  dblclick?: EChartsEventHandler;
  mousedown?: EChartsEventHandler;
  mousemove?: EChartsEventHandler;
  mouseup?: EChartsEventHandler;
  mouseover?: EChartsEventHandler;
  mouseout?: EChartsEventHandler;
  globalout?: EChartsEventHandler;
  contextmenu?: EChartsEventHandler;
  [key: string]: EChartsEventHandler | undefined;
}

/**
 * EchartsReact 组件 Props 接口
 */
export interface EchartsReactProps {
  /** ECharts 图表配置选项 */
  option: EChartsOption;

  /** 图表高度，默认 '400px' */
  height?: string | number;

  /** 图表宽度，默认 '100%' */
  width?: string | number;

  /** 是否显示加载状态 */
  loading?: boolean;

  /** 加载提示文字 */
  loadingText?: string;

  /** 图表事件处理器 */
  onEvents?: EChartsEvents;

  /** 自定义样式 */
  style?: CSSProperties;

  /** 自定义类名 */
  className?: string;

  /** 是否在窗口大小改变时自动调整图表大小，默认 true */
  autoResize?: boolean;

  /** 图表主题，默认使用内置主题 */
  theme?: string | object;

  /** 是否显示错误边界，默认 true */
  showError?: boolean;
}
