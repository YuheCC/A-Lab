# PlaceholderInput 组件

支持 Tab 键自动填充 placeholder 的输入框组件。

## 功能说明

PlaceholderInput 是一个增强型的输入框组件，在保留原生 input 所有功能的基础上，添加了 Tab 键自动填充 placeholder 的功能：

- **输入框为空时**：按 Tab 键自动填充 placeholder 内容，光标停留在输入框末尾
- **输入框有内容时**：Tab 键保持默认行为（跳转到下一个可聚焦元素）
- **完全兼容**：支持所有原生 input 属性和事件

## Props API

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| value | `string` | 是 | - | 输入框的值 |
| onChange | `(value: string) => void` | 是 | - | 值变化的回调函数 |
| placeholder | `string` | 否 | `''` | 占位符文本 |
| enableTabFill | `boolean` | 否 | `true` | 是否启用 Tab 键自动填充功能 |
| type | `string` | 否 | `'text'` | 输入框类型 |
| className | `string` | 否 | `''` | 自定义样式类名 |
| style | `React.CSSProperties` | 否 | - | 内联样式对象 |
| disabled | `boolean` | 否 | `false` | 是否禁用 |
| readOnly | `boolean` | 否 | `false` | 是否只读 |
| id | `string` | 否 | - | 输入框 ID |
| name | `string` | 否 | - | 输入框名称 |
| autoComplete | `string` | 否 | - | 自动完成属性 |
| onKeyDown | `(e: KeyboardEvent) => void` | 否 | - | 键盘按下事件回调 |
| onFocus | `(e: FocusEvent) => void` | 否 | - | 获得焦点事件回调 |
| onBlur | `(e: FocusEvent) => void` | 否 | - | 失去焦点事件回调 |
| aria-label | `string` | 否 | - | 可访问性标签 |
| aria-describedby | `string` | 否 | - | 可访问性描述关联 |

## 使用示例

### 基础用法

```tsx
import PlaceholderInput from '@/components/PlaceholderInput';

function MyForm() {
  const [value, setValue] = useState('');

  return (
    <PlaceholderInput
      value={value}
      onChange={setValue}
      placeholder="请输入内容"
    />
  );
}
```

### 自定义样式

```tsx
<PlaceholderInput
  value={value}
  onChange={setValue}
  placeholder="请输入内容"
  className="my-custom-input"
  style={{ width: '300px' }}
/>
```

### 禁用 Tab 填充功能

```tsx
<PlaceholderInput
  value={value}
  onChange={setValue}
  placeholder="请输入内容"
  enableTabFill={false}  // 禁用 Tab 填充，恢复为普通输入框
/>
```

### 结合表单验证

```tsx
<div className="form-group">
  <label htmlFor="cathode">Cathode</label>
  <PlaceholderInput
    id="cathode"
    value={cathode}
    onChange={setCathode}
    placeholder="Polycrystal NCM811, 4 mAh/cm²"
    aria-label="Cathode material"
  />
</div>
```

## 交互逻辑

1. **Tab 键填充**：
   - 条件：输入框为空（`value.trim() === ''`）且 placeholder 不为空
   - 行为：阻止默认的焦点跳转，填充 placeholder 内容，光标移至末尾
   - 结果：用户可以继续编辑或再次按 Tab 跳转到下一个输入框

2. **正常 Tab 跳转**：
   - 条件：输入框有内容或 placeholder 为空
   - 行为：执行浏览器默认的 Tab 键行为（焦点跳转）

3. **Shift+Tab 反向导航**：
   - 不受影响，始终执行浏览器默认行为

## 注意事项

1. **样式继承**：组件本身不包含默认样式，完全依赖外部样式或全局样式，确保与项目整体风格一致。

2. **多语言支持**：placeholder 由外部传入，支持动态切换语言（如使用 `react-i18next` 的 `t()` 函数）。

3. **事件回调**：如果传入了 `onKeyDown` 回调，只有在未触发 Tab 填充逻辑时才会被调用。这样可以避免事件冲突。

4. **禁用状态**：当 `disabled` 或 `readOnly` 为 `true` 时，Tab 填充功能不会触发。

5. **可访问性**：组件保留了所有原生 input 的可访问性特性，建议配合 `aria-label` 或关联的 `<label>` 元素使用。

## 边界情况

- **快速连按 Tab**：第一次填充 placeholder，第二次正常跳转（因为输入框已有内容）
- **空格字符**：使用 `trim()` 判断是否为空，纯空格会被视为空值
- **IME 输入法**：当前未特殊处理，如遇到冲突可扩展添加 `isComposing` 检查
- **外部状态更新**：组件直接响应 `value` prop 变化，无内部缓存
