# ElectrolytePerformanceBadge 组件

## 概述

`ElectrolytePerformanceBadge` 是用于显示电解液性能预测结果的 Badge 组件，用于 Electrolyte Design 页面的 Cell Performance Prediction 模块中。

## 使用场景

- **Create 页面** (`src/pages/Design/Electrolyte/create/`): 通过 `PredictionModule` 组件使用
- **Record 页面** (`src/pages/Design/Electrolyte/record/`): 直接使用该组件显示历史记录详情

## 组件特性

### 1. 性能指标类型支持

- **Cycle Life (循环寿命)**: 显示箭头 + 百分比
- **Coulombic Efficiency (库伦效率)**: 仅显示箭头
- **Rate Performance (倍率性能)**: 显示箭头 + 百分比

### 2. 状态分类

根据 `metric.status` 和 `confidence` 值判断：

- **Positive (正向影响)**: 绿色系列
  - `light`: confidence < 5% - 浅绿背景 (#dcfce7)
  - `medium`: 5% ≤ confidence ≤ 25% - 中绿背景 (#00c950)
  - `dark`: confidence > 25% - 深绿背景 (#008236)

- **Negative (负向影响)**: 红色系列
  - `light`: confidence < 5% - 浅红背景 (#ffe2e2)
  - `medium`: 5% ≤ confidence ≤ 25% - 中红背景 (#fb2c36)
  - `dark`: confidence > 25% - 深红背景 (#c10007)

- **Unknown/Neutral**: 灰色背景

### 3. 样式规范

- 高度: 40px
- 内边距: 8px 16px (普通) / 8px (CE 仅箭头)
- 圆角: 8px
- 字体: 16px, weight 500
- 箭头大小: 15px (普通) / 16px (CE)

## 使用方法

```tsx
import ElectrolytePerformanceBadge from '../components/ElectrolytePerformanceBadge';

// 示例数据
const metric = {
  status: 'Positive',
  confidence: 15.5, // 或 '15.5%'
  rawProb: 0.155,
  rawLabel: 0,
  isRestricted: false
};

// 使用组件
<ElectrolytePerformanceBadge 
  metric={metric} 
  metricType="cycleLife" 
/>
```

## Props

```typescript
interface ElectrolytePerformanceBadgeProps {
  metric: PerformanceMetric;
  metricType: MetricType;
}

interface PerformanceMetric {
  status: 'Positive' | 'Negative' | 'Neutral' | 'Restricted';
  confidence: number | string | null;
  rawProb?: number | null;
  rawLabel?: number | null;
  isRestricted?: boolean;
}

type MetricType = 'cycleLife' | 'ce' | 'ratePerformance';
```

## 文件结构

```
ElectrolytePerformanceBadge/
├── index.tsx         # 组件逻辑
├── index.less        # 组件样式
└── README.md         # 本文档
```

## 迁移说明

### 从 PredictionModule 迁移

之前 badge 渲染逻辑在 `PredictionModule/index.tsx` 的 `renderResultBadge` 函数中。现已抽离为独立组件。

**迁移前:**
```tsx
{renderResultBadge(resultsData['25c'][config.dataKey], config.dataKey)}
```

**迁移后:**
```tsx
<ElectrolytePerformanceBadge 
  metric={resultsData['25c'][config.dataKey]} 
  metricType={config.dataKey} 
/>
```

### 从 PerformanceBadge 迁移

Record 页面之前使用全局的 `@/components/PerformanceBadge` 组件（需要传 `classPrefix="pm"`）。

**迁移前:**
```tsx
<PerformanceBadge 
  metric={processedResults.temp25.cycleLife} 
  metricType="cycleLife" 
  classPrefix="pm" 
/>
```

**迁移后:**
```tsx
<ElectrolytePerformanceBadge 
  metric={processedResults.temp25.cycleLife} 
  metricType="cycleLife" 
/>
```

## 注意事项

1. **样式独立**: 组件自带完整样式，无需额外引入 CSS
2. **硬编码值**: 使用硬编码的颜色值（非 Less 变量），确保与设计稿完全一致
3. **仅用于 Electrolyte**: 该组件专用于电解液设计模块，不建议在其他模块复用
4. **CE 特殊处理**: Coulombic Efficiency 指标仅显示箭头，不显示百分比

## 相关组件

- `@/components/PerformanceBadge`: 全局通用的性能 Badge 组件
- `PredictionModule`: 电解液预测模块
- `CustomSelect`: 电解液自定义选择器

## 更新日志

### v1.0.0 (2026-01-28)
- 从 `PredictionModule` 中抽离 badge 逻辑
- 创建独立组件供 create 和 record 页面共用
- 移除 `PredictionModule/index.less` 中的重复样式定义
