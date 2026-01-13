# RateCapabilityChart 组件

## 概述

Rate Capability Chart 是一个用于展示电池倍率性能的曲线图组件，显示在不同 C-Rate 下的容量保持率（Capacity Retention）。

## 功能特性

- **曲线图展示**：使用 ECharts 绘制平滑的倍率性能曲线
- **Coming Soon 蒙层**：当前使用 mock 数据，并显示 "Coming Soon" 蒙层提示功能尚未完全开放
- **响应式设计**：支持移动端和桌面端自适应
- **品牌配色**：遵循项目设计规范，使用主品牌绿色 (#56B26A)

## 使用方式

```tsx
import RateCapabilityChart from './components/RateCapabilityChart';

// 在组件中使用
<RateCapabilityChart />
```

### 使用位置

该组件目前在以下两个页面中使用：

1. **Predict 页面** ([index.tsx](../../index.tsx:651))
   - 位置：Cell Performance Prediction 区域底部
   - 显示条件：仅在有预测结果时显示（`results` 存在）

2. **Predict Detail 页面** ([Detail/index.tsx](../../Detail/index.tsx:417))
   - 位置：Cell Performance Prediction 区域底部
   - 显示条件：始终显示（详情页面已有数据）

## Mock 数据结构

当前使用的 mock 数据格式：

```typescript
const mockData = [
  { cRate: '1C', retention: 100 },
  { cRate: '2C', retention: 85 },
  { cRate: '3C', retention: 78 },
  { cRate: '4C', retention: 68 },
  { cRate: '5C', retention: 62 },
];
```

## 样式规范

- **容器**：
  - 背景：白色 (#ffffff)
  - 边框：1px solid #e5e7eb
  - 圆角：12px
  - 内边距：24px

- **蒙层**：
  - 背景：rgba(255, 255, 255, 0.85)
  - 模糊效果：backdrop-filter: blur(4px)
  - Coming Soon 文字：28px / 600，灰色 (#6b7280)

- **图表配色**：
  - 线条颜色：#56B26A（主品牌绿色）
  - 线宽：3px
  - 区域渐变：从 rgba(86, 178, 106, 0.3) 到 rgba(86, 178, 106, 0.05)
  - 数据点：8px 圆点，白色边框

## 未来计划

- [ ] 接入真实 API 数据
- [ ] 移除 Coming Soon 蒙层
- [ ] 支持更多 C-Rate 范围（如 0.5C - 10C）
- [ ] 添加数据导出功能
- [ ] 支持多组数据对比

## 依赖

- `echarts`: ^5.0.0
- `echarts-for-react`: ^3.0.2
- `react`: ^18.x

## 注意事项

1. 当前组件仅在 Cell Performance Prediction 区域有结果时显示
2. 图表高度固定为 400px，可根据需求调整
3. Coming Soon 蒙层层级为 z-index: 10，确保在图表上方显示
