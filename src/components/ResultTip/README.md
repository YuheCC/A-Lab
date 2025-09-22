# ResultTip 组件

用于提交配置后显示处理状态的提示组件。

## 功能特性

- 显示算法模型计算状态
- 支持自定义标题和描述
- 齿轮图标 + 清晰的视觉层次
- 黄色提示框显示重要信息
- 支持多语言（中文、英文、日文、韩文）
- 响应式设计，适配移动端
- 纯组件设计，可灵活嵌入任何页面

## 使用方法

```jsx
import ResultTip from '@/components/ResultTip';

// 基本使用（需要外层容器提供页面级样式）
<div className="result-tip-page">
  <ResultTip isVisible={true} />
</div>

// 自定义内容
<div className="result-tip-page">
  <ResultTip
    isVisible={true}
    title="自定义标题"
    description="自定义描述"
    onClose={() => setVisible(false)}
  />
</div>

// 或者作为纯组件使用（不需要页面级样式）
<ResultTip isVisible={true} onClose={handleClose} />
```

## 属性说明

| 属性 | 类型 | 默认值 | 说明 |
|------|------|-------|------|
| isVisible | boolean | false | 是否显示组件 |
| title | string | - | 自定义标题，不传则使用默认翻译 |
| description | string | - | 自定义描述，不传则使用默认翻译 |
| onClose | function | - | 关闭回调函数，不传则不显示关闭按钮 |

## 样式说明

- **纯组件设计**：不包含页面级布局，可灵活嵌入
- **居中对齐**：内容自动居中，最大宽度560px
- **内置间距**：组件自带40px内边距（移动端32px）
- **齿轮图标 + 大标题**：清晰的视觉层次
- **黄色提示框**：重要信息突出显示
- **响应式设计**：在移动端自动适配

## 页面级样式

如需要页面级全屏显示效果，请使用 `result-tip-page` 类名：

```css
.result-tip-page {
  background: #ffffff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 120px 20px 40px 20px;
}
```

## 国际化支持

组件支持以下语言：
- 中文（zh）
- 英文（en）
- 日文（ja）
- 韩文（ko）

翻译文件位置：`src/locales/{lang}/resultTip.js`