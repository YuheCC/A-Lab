# EchartsReact 通用图表组件

基于 `echarts-for-react` 封装的通用图表组件，提供统一的配置、样式和交互功能。

## 功能特性

- ✅ 统一的图表配置（白色背景、规范字体）
- ✅ 自动响应式尺寸调整
- ✅ 内置 loading 状态
- ✅ 错误边界处理
- ✅ 完整的 TypeScript 类型支持
- ✅ 支持所有 ECharts 事件
- ✅ 国际化支持

## 安装依赖

```bash
pnpm add echarts echarts-for-react
```

## 基础用法

```tsx
import EchartsReact from '@/components/EchartsReact';
import { EChartsOption } from 'echarts';

const MyChart = () => {
  const option: EChartsOption = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }]
  };

  return <EchartsReact option={option} height="400px" />;
};
```

## Props 说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| option | EChartsOption | **必填** | ECharts 图表配置选项 |
| height | string \| number | '400px' | 图表高度 |
| width | string \| number | '100%' | 图表宽度 |
| loading | boolean | false | 是否显示加载状态 |
| loadingText | string | '加载中...' | 加载提示文字 |
| onEvents | EChartsEvents | - | 图表事件处理器 |
| style | CSSProperties | - | 自定义样式 |
| className | string | '' | 自定义类名 |
| autoResize | boolean | true | 窗口大小改变时自动调整 |
| theme | string \| object | - | 图表主题 |
| showError | boolean | true | 是否显示错误边界 |

## 事件处理

```tsx
const MyChart = () => {
  const handleClick = (params) => {
    console.log('点击了数据:', params);
  };

  const onEvents = {
    click: handleClick,
    mouseover: (params) => {
      console.log('鼠标悬停:', params);
    }
  };

  return (
    <EchartsReact
      option={option}
      onEvents={onEvents}
    />
  );
};
```

## 支持的事件

- `click` - 点击事件
- `dblclick` - 双击事件
- `mousedown` - 鼠标按下
- `mousemove` - 鼠标移动
- `mouseup` - 鼠标释放
- `mouseover` - 鼠标悬停
- `mouseout` - 鼠标移出
- `globalout` - 全局移出
- `contextmenu` - 右键菜单

## 高级用法

### 自定义加载状态

```tsx
<EchartsReact
  option={option}
  loading={isLoading}
  loadingText="数据加载中..."
/>
```

### 响应式尺寸

```tsx
<EchartsReact
  option={option}
  height="100%"
  width="100%"
  autoResize={true}
/>
```

### 自定义样式

```tsx
<EchartsReact
  option={option}
  style={{ border: '1px solid #ddd' }}
  className="my-custom-chart"
/>
```

## 默认配置

组件会自动注入以下默认配置（可被 option 覆盖）：

```typescript
{
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
  }
}
```

## TypeScript 类型

```typescript
import { EchartsReactProps, EChartsEventParams } from '@/components/EchartsReact';
```

## 注意事项

1. 确保父容器有明确的高度，否则图表可能不显示
2. 使用 `useMemo` 缓存 option 配置以优化性能
3. 大数据量时建议开启 ECharts 的数据采样功能
4. 移动端建议设置合适的 tooltip.confine 防止溢出

## 示例项目参考

查看 `src/pages/PredictionTool/components/CycleLifeScatterChart.tsx` 了解完整示例。
