import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTranslation } from 'react-i18next';
import { EchartsReactProps } from './types';
import echarts from '@/utils/echartsInit'; // 导入已注册组件的 echarts 实例
import './index.less';

/**
 * 通用 ECharts 图表组件
 *
 * 提供统一的图表配置、样式和交互功能
 *
 * @example
 * ```tsx
 * <EchartsReact
 *   option={chartOption}
 *   height="500px"
 *   loading={isLoading}
 *   onEvents={{ click: handleClick }}
 * />
 * ```
 */
const EchartsReact: React.FC<EchartsReactProps> = ({
  option,
  height = '400px',
  width = '100%',
  loading = false,
  loadingText,
  onEvents,
  style,
  className = '',
  autoResize = true,
  theme,
  showError = true,
}) => {
  const { t } = useTranslation();

  // 合并默认配置和用户配置
  const mergedOption = useMemo(() => {
    const defaultConfig = {
      backgroundColor: '#FFFFFF',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 12,
        fontWeight: 400,
      },
      grid: {
        containLabel: true,
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
      },
    };

    // 深度合并配置，用户配置优先
    return {
      ...defaultConfig,
      ...option,
      textStyle: {
        ...defaultConfig.textStyle,
        ...option.textStyle,
      },
      grid: option.grid || defaultConfig.grid,
    };
  }, [option]);

  // 加载配置
  const loadingOption = useMemo(() => ({
    text: loadingText || t('common.loading', { defaultValue: '加载中...' }),
    color: '#2196F3',
    textColor: '#666',
    maskColor: 'rgba(255, 255, 255, 0.8)',
    zlevel: 0,
  }), [loadingText, t]);

  // 容器样式
  const containerStyle = useMemo(() => ({
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  }), [width, height, style]);

  // 错误边界处理
  if (showError && !option) {
    return (
      <div className={`echarts-react-error ${className}`} style={containerStyle}>
        <div className="error-message">
          {t('common.chartError', { defaultValue: '图表配置错误' })}
        </div>
      </div>
    );
  }

  return (
    <div className={`echarts-react-container ${className}`} style={containerStyle}>
      <ReactECharts
        echarts={echarts}
        option={mergedOption}
        style={{ height: '100%', width: '100%' }}
        onEvents={onEvents}
        showLoading={loading}
        loadingOption={loadingOption}
        notMerge={true}
        lazyUpdate={true}
        theme={theme}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default EchartsReact;
export type { EchartsReactProps, EChartsEventParams, EChartsEvents, EChartsEventHandler } from './types';
