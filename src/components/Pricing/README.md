# Pricing 组件

一个可复用的定价展示组件，支持个人版和企业版的切换展示。

## 特性

- 🎯 支持个人版和企业版两种定价模式
- 🎨 响应式设计，适配移动端和桌面端
- 🔧 可自定义标题显示和样式
- 🌐 支持中英文切换（通过i18next）
- ⚡ 基于React Hooks的状态管理

## 使用方法

### 基础用法

```tsx
import Pricing from '../../components/Pricing';

// 在组件中使用
<Pricing />
```

### 高级用法

```tsx
import Pricing from '../../components/Pricing';

// 自定义参数
<Pricing 
  showHeader={false}  // 不显示标题
  className="custom-pricing"  // 自定义样式类
/>
```

### 国际化支持

组件完全支持多语言，切换器文本会根据语言自动调整：

- **英文**：Individual / Enterprise
- **中文**：个人版 / 企业版
- **韩语**：개인 / 기업

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showHeader | boolean | true | 是否显示标题 |
| className | string | '' | 自定义样式类名 |

## 功能说明

### 1. 定价切换器
- 支持个人版和企业版之间的切换
- 平滑的过渡动画效果

### 2. 定价卡片
- 个人版：研究版、探索版、团队版
- 企业版：企业版、联合开发版
- 每个卡片包含：标题、访问权限、价格、功能列表

### 3. 响应式设计
- 桌面端：网格布局，最多3列，1.5rem间距
- 移动端：单列布局，垂直排列，1.2rem间距

### 4. 性能优化
- 去掉所有hover动画效果，减少重绘开销
- 统一间距设计，提升视觉一致性
- 优化卡片内边距，更紧凑的布局

## 样式定制

组件使用独立的CSS文件 `Pricing.css`，可以通过以下方式自定义样式：

```css
/* 自定义定价卡片颜色 */
.pricing-card {
  border-color: #your-color !important;
}

/* 自定义按钮样式 */
.pricing-btn {
  background: #your-color !important;
}
```

## 依赖

- React 18+
- react-i18next (用于国际化)
- TypeScript (可选)

## 文件结构

```
src/components/Pricing/
├── index.tsx       # 主组件文件
├── Pricing.css     # 样式文件
├── demo.tsx        # 演示文件
└── README.md       # 说明文档
```

## 注意事项

1. 组件依赖于 `react-i18next` 进行国际化，确保项目中已正确配置
2. 样式文件使用了大量的 `!important` 声明以确保样式优先级
3. 响应式断点设置为 900px，可根据需要调整

## 更新日志

- v1.2.0：
  - ✅ 优化卡片间距，统一个人版和企业版的间距
  - ✅ 去掉所有hover动画效果，提升性能
  - ✅ 优化卡片内边距，更紧凑的布局
  - ✅ 调整圆角半径，使用更现代的设计
  - ✅ 优化响应式设计的间距
- v1.1.0：
  - ✅ 切换器文本更新为 Individual / Enterprise
  - ✅ 完整的多语言支持（英文、中文、韩语）
  - ✅ 所有文本内容支持国际化
  - ✅ 类型安全的翻译功能
- v1.0.0：初始版本，支持基础定价展示功能 