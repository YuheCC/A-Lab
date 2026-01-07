# FeatureCardGroup 组件

功能卡片容器组件，支持响应式布局，可以根据屏幕宽度自动调整卡片显示列数。

## 特性

- ✅ 支持固定列数布局
- ✅ 支持响应式列数配置（移动端优先）
- ✅ 支持自定义卡片间距
- ✅ 使用 CSS Grid 布局，性能优秀
- ✅ 完整的 TypeScript 类型支持

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| children | ReactNode | - | 子元素（FeatureCard组件） |
| columns | number \| ResponsiveConfig | 2 | 列数配置，可以是固定数字或响应式配置对象 |
| gap | number | 16 | 卡片之间的间距，单位px |
| className | string | '' | 自定义className |
| style | CSSProperties | {} | 自定义样式 |

### ResponsiveConfig 类型

```typescript
interface ResponsiveConfig {
  default: number;  // 默认列数（必需）
  sm?: number;      // 小屏幕 (≥768px) 列数
  md?: number;      // 中等屏幕 (≥1024px) 列数
  lg?: number;      // 大屏幕 (≥1200px) 列数
  xl?: number;      // 超大屏幕 (≥1440px) 列数
  xxl?: number;     // 极大屏幕 (≥1920px) 列数
}
```

## 响应式断点

| 断点 | 屏幕宽度 | 说明 |
|------|----------|------|
| default | < 768px | 移动端（默认） |
| sm | ≥ 768px | 小屏（平板竖屏） |
| md | ≥ 1024px | 中屏（平板横屏/小笔记本） |
| lg | ≥ 1200px | 大屏（笔记本/小桌面） |
| xl | ≥ 1440px | 超大屏（桌面显示器） |
| xxl | ≥ 1920px | 极大屏（大尺寸显示器） |

## 使用示例

### 1. 固定列数布局

```tsx
import FeatureCardGroup from '@/pages/Design/components/FeatureCardGroup';
import FeatureCard from '@/pages/Design/components/FeatureCard';
import { Plus, Activity } from 'lucide-react';

<FeatureCardGroup columns={2} gap={16}>
  <FeatureCard
    icon={<Plus size={20} />}
    title="新建设计"
    description="创建新的电解液设计"
    iconBgColor="#dbeafe"
    onClick={handleNewDesign}
  />
  <FeatureCard
    icon={<Activity size={20} />}
    title="模型训练"
    description="训练新的预测模型"
    iconBgColor="#dcfce7"
    onClick={handleTrain}
  />
</FeatureCardGroup>
```

### 2. 响应式布局配置

```tsx
<FeatureCardGroup 
  columns={{
    default: 1,  // 移动端：1列
    sm: 2,       // 平板竖屏：2列
    md: 3,       // 平板横屏：3列
    lg: 4,       // 笔记本：4列
    xl: 5,       // 桌面：5列
    xxl: 6       // 大显示器：6列
  }}
  gap={20}
>
  <FeatureCard ... />
  <FeatureCard ... />
  <FeatureCard ... />
  <FeatureCard ... />
</FeatureCardGroup>
```

### 3. 自定义样式

```tsx
<FeatureCardGroup 
  columns={3}
  gap={24}
  className="custom-card-group"
  style={{ marginTop: '20px' }}
>
  <FeatureCard ... />
  <FeatureCard ... />
  <FeatureCard ... />
</FeatureCardGroup>
```

### 4. 典型场景配置

#### 场景一：产品功能展示（桌面优先）

```tsx
<FeatureCardGroup 
  columns={{
    default: 1,
    sm: 2,
    md: 2,
    lg: 3
  }}
>
  {/* 3-6个功能卡片 */}
</FeatureCardGroup>
```

#### 场景二：工具入口（简洁布局）

```tsx
<FeatureCardGroup columns={2} gap={16}>
  {/* 2-4个主要功能入口 */}
</FeatureCardGroup>
```

#### 场景三：特性列表（响应式网格）

```tsx
<FeatureCardGroup 
  columns={{
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 6
  }}
  gap={20}
>
  {/* 多个特性卡片 */}
</FeatureCardGroup>
```

## 设计原则

1. **移动端优先**：默认配置从移动端开始，逐步适配大屏
2. **灵活扩展**：支持1-6列的任意组合
3. **语义化**：使用清晰的断点命名（sm/md/lg/xl）
4. **性能优化**：使用原生 CSS Grid，无 JavaScript 计算

## 注意事项

1. `default` 配置项是必需的，其他断点配置可选
2. 子元素建议使用 `FeatureCard` 组件，确保样式一致性
3. 如果只需要固定列数，直接传入数字即可：`columns={2}`
4. 间距 `gap` 单位为像素，会同时应用于行间距和列间距
5. 响应式断点采用移动端优先策略，未配置的断点会继承较小断点的值

## 兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- CSS Grid 支持的所有浏览器
- 不支持 IE11（如需兼容，请使用 flexbox 替代方案）

## 更新日志

### v1.0.0 (2026-01-07)
- ✨ 初始版本发布
- ✨ 支持固定列数和响应式配置
- ✨ 支持自定义间距和样式
