# Button 组件

统一的按钮样式组件，符合项目设计规范，提供多种变体和状态。

## 特性

- 🎨 **多种变体**：支持 primary、secondary、outlined、text、danger 五种样式
- 📏 **灵活尺寸**：提供 small、medium、mlarge、large 四种尺寸
- ⚡ **状态管理**：支持 loading、disabled 等状态
- 🎯 **图标支持**：可添加左侧或右侧图标
- ♿ **无障碍**：符合 WAI-ARIA 规范
- 🎭 **TypeScript**：完整的类型定义

## 使用方法

### 基础用法

```tsx
import Button from '@/components/Button';

// Primary 按钮（默认）
<Button onClick={handleClick}>主按钮</Button>

// Secondary 按钮
<Button variant="secondary">次要按钮</Button>

// Outlined 按钮
<Button variant="outlined">边框按钮</Button>

// Text 按钮
<Button variant="text">文本按钮</Button>

// Danger 按钮
<Button variant="danger">危险按钮</Button>
```

### 不同尺寸

```tsx
// Small 按钮（高度 32px）
<Button size="small">小按钮</Button>

// Medium 按钮（高度 40px，默认）
<Button size="medium">中等按钮</Button>

// Medium-Large 按钮（高度 44px）
<Button size="mlarge">中大按钮</Button>

// Large 按钮（高度 48px）
<Button size="large">大按钮</Button>
```

### Loading 状态

```tsx
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={handleSubmit}>
  提交
</Button>
```

### Disabled 状态

```tsx
<Button disabled>禁用按钮</Button>
```

### 带图标

```tsx
import { PlusIcon, DownloadIcon } from 'lucide-react';

// 左侧图标
<Button leftIcon={<PlusIcon size={16} />}>
  新增
</Button>

// 右侧图标
<Button rightIcon={<DownloadIcon size={16} />}>
  下载
</Button>
```

### Full Width

```tsx
<Button fullWidth>占满宽度</Button>
```

## API

### ButtonProps

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'primary' \| 'secondary' \| 'outlined' \| 'text' \| 'danger'` | `'primary'` | 按钮变体 |
| size | `'small' \| 'medium' \| 'mlarge' \| 'large'` | `'medium'` | 按钮尺寸（32px / 40px / 44px / 48px） |
| loading | `boolean` | `false` | 是否显示加载状态 |
| disabled | `boolean` | `false` | 是否禁用 |
| fullWidth | `boolean` | `false` | 是否占满父容器宽度 |
| leftIcon | `ReactNode` | - | 左侧图标 |
| rightIcon | `ReactNode` | - | 右侧图标 |
| onClick | `(e: React.MouseEvent) => void` | - | 点击事件 |
| className | `string` | - | 自定义类名 |
| children | `ReactNode` | - | 按钮内容 |

继承所有原生 `button` 元素的属性。

## 样式变体说明

### Primary（主按钮）
- **用途**：页面主要操作，如"提交"、"保存"、"确认"
- **样式**：深灰背景 (#1f2937)，白色文字
- **Hover**：背景变浅 (#374151)
- **Focus**：绿色光晕

### Secondary（次要按钮）
- **用途**：次要操作，如"取消"、"返回"
- **样式**：白色背景，灰色边框，灰色文字
- **Hover**：浅灰背景
- **Focus**：绿色边框 + 绿色光晕

### Outlined（边框按钮）
- **用途**：强调操作，如"查看详情"
- **样式**：透明背景，绿色边框，绿色文字
- **Hover**：浅绿背景
- **Focus**：绿色光晕

### Text（文本按钮）
- **用途**：弱化操作，如"了解更多"
- **样式**：透明背景，无边框，灰色文字
- **Hover**：浅灰背景
- **Focus**：绿色光晕

### Danger（危险按钮）
- **用途**：危险操作，如"删除"、"清空"
- **样式**：红色背景 (#ef4444)，白色文字
- **Hover**：深红背景
- **Focus**：红色光晕

## 设计规范

本组件遵循项目设计规范（`.claude/design-guidelines.md`），使用全局变量（`@/styles/variables.less`）：

- **主操作色**：`@color-gray-800` (#1f2937)
- **强调色**：`@color-accent` (#56B26A)
- **字体**：14px / 500 (Medium)
- **圆角**：`@radius-lg` (8px)
- **过渡**：`@transition-fast` (0.2s ease)
- **焦点态**：绿色光晕 `0 0 0 3px rgba(86, 178, 106, 0.1)`

## 注意事项

1. **避免使用 Ant Design Button**：本组件替代 Ant Design Button，避免需要 `!important` 覆盖样式
2. **图标尺寸**：建议使用 16px 的图标尺寸
3. **Loading 状态**：loading 时自动禁用按钮，无需额外设置 disabled
4. **无障碍**：按钮自动处理键盘焦点，支持 Enter 和 Space 键触发

## 示例：替换 Ant Design Button

### 替换前（Ant Design）

```tsx
import { Button } from 'antd';

<Button
  type="primary"
  size="large"
  onClick={handleCalculate}
  loading={loading}
  className="calculate-btn"
>
  Calculate
</Button>
```

### 替换后（自定义 Button）

```tsx
import Button from '@/components/Button';

<Button
  variant="primary"
  size="large"
  onClick={handleCalculate}
  loading={loading}
  className="calculate-btn"
>
  Calculate
</Button>
```

## 更新日志

### v1.1.0 (2026-01-09)
- 新增 mlarge 尺寸（高度 44px），在 medium 和 large 之间提供更多选择
- 现在支持 4 种尺寸：small (32px)、medium (40px)、mlarge (44px)、large (48px)

### v1.0.0 (2026-01-09)
- 初始版本
- 支持 5 种变体（primary、secondary、outlined、text、danger）
- 支持 3 种尺寸（small、medium、large）
- 支持 loading 和 disabled 状态
- 支持左右图标
- 完整的 TypeScript 类型定义
