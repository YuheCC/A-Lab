# CollapsibleText 可折叠文本组件

可折叠文本组件，用于显示有长度限制的文本内容。当文本超过指定行数时，自动显示折叠/展开按钮。

## 功能特性

- ✅ 自动检测文本是否溢出
- ✅ 只在文本超过指定行数时显示折叠按钮
- ✅ 支持自定义行数限制
- ✅ 平滑的展开/收起动画
- ✅ 响应式设计，支持窗口大小变化
- ✅ 自动监听语言切换，确保多语言环境下正确显示
- ✅ 箭头图标对齐到文本最后一行

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| children | `React.ReactNode` | - | 文本内容（必填） |
| lineClamp | `number` | `3` | 限制显示的行数 |
| className | `string` | `''` | 自定义类名，用于覆盖默认样式 |

## 使用示例

### 基础用法

```tsx
import CollapsibleText from '@/components/CollapsibleText';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>页面标题</h1>
      <CollapsibleText>
        {t('page.subtitle')}
      </CollapsibleText>
    </div>
  );
}
```

### 自定义行数

```tsx
<CollapsibleText lineClamp={5}>
  这是一段很长的文本内容，超过5行时会显示折叠按钮...
</CollapsibleText>
```

### 自定义样式

```tsx
<CollapsibleText className="my-custom-text">
  {t('page.description')}
</CollapsibleText>
```

然后在你的样式文件中：

```less
.my-custom-text {
  .collapsible-text {
    font-size: 16px;
    color: #333;
  }
}
```

## 样式覆盖

组件提供了以下 CSS 类名用于样式覆盖：

- `.collapsible-text-wrapper` - 外层容器
- `.collapsible-text` - 文本元素
- `.collapsible-text-toggle-button` - 折叠/展开按钮
- `.toggle-icon` - 箭头图标

## 注意事项

1. **文本内容要求**：children 应该是纯文本或简单的文本节点，复杂的嵌套结构可能影响溢出检测
2. **行高固定**：组件内部假定行高为 1.5em，如果需要修改行高，需要同时调整样式
3. **语言切换**：组件会自动监听语言切换并重新检测溢出，无需手动处理

## 更新日志

### v1.0.3 (2025-01-12)

- 修复：展开时不再触发溢出检测，避免按钮消失
- 优化：设置固定最小高度（3行），减少页面切换时的视觉抖动
- 改进：展开时取消最小高度限制，完整显示内容

### v1.0.2 (2025-01-12)

- 修复：语言切换时，文本自动收起，确保按钮正常显示
- 优化：增加溢出检测延迟时间（100ms），确保文本内容完全更新后再检测
- 改进：简化检测逻辑，提升性能

### v1.0.1 (2025-01-12)

- 修复：已展开状态下切换语言时，收起按钮消失的问题
- 优化：改进溢出检测逻辑，通过临时修改 DOM 样式来检测，避免状态闪烁

### v1.0.0 (2025-01-12)

- 初始版本
- 支持基础的折叠/展开功能
- 支持自定义行数限制
- 自动检测文本溢出
- 响应式设计
- 多语言支持
