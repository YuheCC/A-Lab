# Consistency 组件

## 概述

Consistency 组件是 Manufacturing 页面中 consistency 模块的结果展示组件，用于展示一致性分析的结果，包括统计数据、SHAP特征重要性图表和分析总结。

## 功能特性

- **结果概览**：显示分析完成的成功提示和文件信息
- **统计卡片**：展示三个关键统计指标（评分、通过率、需要关注的项）
- **SHAP图表**：基于 ECharts 渲染 SHAP 特征重要性分析图表
- **分析总结**：列出主要分析结果的要点
- **操作按钮**：提供返回介绍页和导出报告的操作

## 技术栈

- **React 18**：使用函数式组件和 Hooks
- **TypeScript**：提供类型安全
- **ECharts**：通过 `echarts-for-react` 集成
- **i18next**：支持国际化
- **Less**：样式预处理器

## Props

```typescript
interface ConsistencyProps {
  onBackToIntro?: () => void; // 返回介绍页的回调函数
}
```

## 使用方式

```tsx
import Consistency from '../Consistency';

<Consistency onBackToIntro={handleBackToIntro} />
```

## 数据源

组件使用 TypeScript 配置文件 `shapEchartsConfig.ts` 作为图表数据源，该文件导出：

- `shapFeatureData`: 包含特征名称、数值和颜色配置的数据对象
- `getShapEchartsConfig(t)`: 接收 i18n 翻译函数并返回完整的 ECharts 配置

### 多语言支持

图表文案通过 i18n 实现多语言支持，翻译键包括：
- `manufacturing.charts.shap.title`: 图表标题
- `manufacturing.charts.shap.xAxisName`: X轴名称
- `manufacturing.charts.shap.seriesName`: 数据系列名称

支持的语言：中文、英文、日文、韩文

## 样式定制

组件直接复用父级 ModuleContent 的样式类，无需独立样式文件：

- `.result-header`: 头部成功提示区域
- `.success-icon`: 成功图标
- `.result-title`: 结果标题
- `.result-desc`: 结果描述
- `.stats-cards`: 统计卡片网格
- `.stat-card`: 单个统计卡片
- `.chart-section`: 图表展示区域
- `.analysis-summary`: 分析总结区域
- `.result-actions`: 操作按钮区域
- `.btn-primary`: 主要按钮样式
- `.btn-secondary`: 次要按钮样式

## 图表配置

图表使用 SVG 渲染器，高度为 600px，宽度自适应容器：

```typescript
<ReactECharts
  option={chartOption}
  style={{ height: '600px', width: '100%' }}
  opts={{ renderer: 'svg' }}
/>
```

## 国际化支持

组件使用 `react-i18next` 进行国际化，引用的翻译键包括：

- `manufacturing.result.complete`
- `manufacturing.result.fileAnalyzed`
- `manufacturing.result.fileSuccess`
- `manufacturing.result.stats.*`
- `manufacturing.result.summary.*`
- `manufacturing.result.backToIntro`
- `manufacturing.result.exportReport`

## 未来扩展

1. **其他模块组件**：按照相同模式创建 Detection、KValue、Sorting 组件
2. **动态数据**：支持从后端 API 获取数据而不是静态 JSON
3. **交互增强**：添加图表交互功能，如缩放、筛选等
4. **导出功能**：实现报告导出功能
5. **自定义配置**：支持通过 props 自定义图表配置

## 注意事项

- 确保 `echarts-for-react` 依赖已安装
- JSON 数据文件路径需要正确
- 样式依赖全局 Less 变量和公共样式类
- 图表渲染需要足够的容器高度
