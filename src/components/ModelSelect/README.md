# ModelSelect 模型选择组件

基于表格形式的下拉选择组件，支持单选/多选、搜索、异步数据加载、分组显示等功能。

## 特性

- ✅ 支持单选和多选模式
- ✅ 表格形式展示选项，支持多列配置
- ✅ 支持分组显示（如 Base Model / Fine-tuned Models）
- ✅ 内置搜索/筛选功能（服务端搜索 + 客户端过滤）
- ✅ 支持异步数据加载（`request` 函数，支持搜索参数）
- ✅ 数量限制和分页加载（默认显示 20 条）
- ✅ 完整的键盘导航支持
- ✅ TypeScript 完整支持
- ✅ 国际化友好（支持中文、英文、日文、韩文）
- ✅ 响应式设计

## 使用方法

### 1. 基础单选

```tsx
import ModelSelect from '@/components/ModelSelect';

const Demo = () => {
  const [selectedModel, setSelectedModel] = useState('');

  return (
    <ModelSelect
      mode="single"
      value={selectedModel}
      onChange={setSelectedModel}
      columns={[
        { key: 'name', title: 'Model Name', width: '40%' },
        { key: 'id', title: 'Model ID', width: '30%' },
        { key: 'baseModel', title: 'Base Model', width: '30%' }
      ]}
      options={models}
      searchable
      pageSize={20}
    />
  );
};
```

### 2. 多选模式

```tsx
<ModelSelect
  mode="multiple"
  value={selectedModels}
  onChange={setSelectedModels}
  columns={[
    { key: 'name', title: 'Model Name', width: '50%' },
    { key: 'id', title: 'Model ID', width: '50%' }
  ]}
  options={models}
  searchable
/>
```

### 3. 异步数据加载（服务端搜索）

```tsx
<ModelSelect
  mode="single"
  value={selectedModel}
  onChange={setSelectedModel}
  request={async (searchValue) => {
    // searchValue 为搜索关键词，用于服务端过滤
    const res = await fetch(`/api/models?search=${searchValue || ''}`);
    return res.json();
  }}
  columns={[
    { key: 'name', title: 'Model Name' },
    { key: 'id', title: 'Model ID' }
  ]}
  searchable
  pageSize={20}
/>
```

### 4. 基于字段的自动分组（推荐）

```tsx
// 准备扁平的数据
const models = [
  { id: 'D-BASE-000', name: 'Base Model (Cycle Life + CE + Rate Performance)', category: 'base' },
  { id: 'D-2024-001', name: 'VC Additive Cycle Optimizer v1.2', category: 'finetuned' },
  { id: 'D-2024-002', name: 'FEC Impact Predictor v2.0', category: 'finetuned' },
  { id: 'D-2024-003', name: 'Experimental Model', category: null }, // 未分组
  // ... 更多模型
];

// 使用 groupBy 自动分组
<ModelSelect
  mode="single"
  value={selectedModel}
  onChange={setSelectedModel}
  options={models}
  groupBy="category"  // 基于 category 字段分组
  groupByLabel={{      // 自定义分组标题
    'base': 'Base Models',
    'finetuned': 'Fine-tuned Models'
  }}
  ungroupedLabel="Experimental"  // 自定义未分组标题
  columns={[
    { key: 'name', title: 'Model Name', width: '50%' },
    { key: 'id', title: 'Model ID', width: '50%' }
  ]}
  searchable
  pageSize={20}
/>
```

**或者使用函数映射：**

```tsx
<ModelSelect
  mode="single"
  value={selectedModel}
  onChange={setSelectedModel}
  options={models}
  groupBy="category"
  groupByLabel={(value) => {
    switch (value) {
      case 'base': return 'Base Models';
      case 'finetuned': return 'Fine-tuned Models';
      default: return value;
    }
  }}
  columns={[
    { key: 'name', title: 'Model Name', width: '50%' },
    { key: 'id', title: 'Model ID', width: '50%' }
  ]}
  searchable
/>
```

### 5. 预定义分组数据（向后兼容）

```tsx
<ModelSelect
  mode="single"
  value={selectedModel}
  onChange={setSelectedModel}
  groups={[
    {
      label: 'Base Model',
      options: [
        {
          id: 'D-BASE-000',
          name: 'Base Model (Cycle Life + CE + Rate Performance)',
          baseModel: '-'
        }
      ]
    },
    {
      label: 'Fine-tuned Models',
      options: [
        { id: 'D-2024-001', name: 'VC Additive Cycle Optimizer v1.2', baseModel: 'Cycle Life Base Model' },
        { id: 'D-2024-002', name: 'FEC Impact Predictor v2.0', baseModel: 'Coulombic Efficiency Base Model' },
        // ... 更多模型
      ]
    }
  ]}
  columns={[
    { key: 'name', title: 'Model Name', width: '40%' },
    { key: 'id', title: 'Model ID', width: '30%' },
    { key: 'baseModel', title: 'Base Model', width: '30%' }
  ]}
  searchable
  pageSize={20}
/>
```

### 6. 自定义搜索过滤

```tsx
<ModelSelect
  mode="single"
  value={selectedModel}
  onChange={setSelectedModel}
  options={models}
  filter={(inputValue, option) => {
    // 自定义搜索逻辑：只搜索 name 和 id
    return option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
           option.id.toLowerCase().includes(inputValue.toLowerCase());
  }}
  columns={[
    { key: 'name', title: 'Model Name' },
    { key: 'id', title: 'Model ID' }
  ]}
/>
```

### 7. 自定义列渲染

```tsx
<ModelSelect
  mode="single"
  value={selectedModel}
  onChange={setSelectedModel}
  options={models}
  columns={[
    {
      key: 'name',
      title: 'Model Name',
      width: '50%',
      render: (value, record) => (
        <span style={{ fontWeight: 'bold' }}>{value}</span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: '50%',
      render: (value) => (
        <span className={`status-${value}`}>{value}</span>
      )
    }
  ]}
/>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| mode | 选择模式 | `'single' \| 'multiple'` | `'single'` |
| value | 当前选中值 | `string \| string[]` | - |
| onChange | 值变化回调 | `(value: string \| string[]) => void` | - |
| options | 静态选项数据 | `ModelSelectOption[]` | `[]` |
| groups | 预定义分组数据（与 groupBy 二选一，优先级更高） | `ModelSelectGroup[]` | - |
| request | 异步加载函数，支持搜索参数 | `(searchValue?: string) => Promise<ModelSelectOption[] \| ModelSelectGroup[]>` | - |
| **groupBy** | **基于某个字段自动分组（如 'category'）** | `string` | - |
| **groupByLabel** | **分组标题映射（对象或函数）** | `Record<string, string> \| ((value: string \| undefined) => string)` | - |
| **ungroupedLabel** | **未分组项的标题** | `string` | `'未分组'` |
| columns | 列配置 | `ColumnConfig[]` | `[]` |
| defaultColumns | 默认显示的列（当未提供 columns 时使用） | `string[]` | - |
| searchable | 是否支持搜索 | `boolean` | `false` |
| searchPlaceholder | 搜索占位符 | `string` | `'搜索...'` |
| filter | 客户端搜索过滤函数（仅在无 request 时生效） | `boolean \| ((inputValue: string, option: ModelSelectOption) => boolean)` | `true` |
| searchOnServer | 是否使用服务端搜索（有 request 时默认 true） | `boolean` | - |
| pageSize | 每页显示数量 | `number` | `20` |
| showMore | 是否显示"加载更多"按钮 | `boolean` | `true` |
| placeholder | 占位符 | `string` | `'请选择'` |
| disabled | 禁用状态 | `boolean` | `false` |
| loading | 加载状态 | `boolean` | `false` |
| className | 自定义类名 | `string` | `''` |
| maxHeight | 下拉框最大高度 | `number` | `400` |
| fieldNames | 字段映射 | `{ label?: string; value?: string }` | `{ label: 'name', value: 'id' }` |

### 类型定义

#### ModelSelectOption

```typescript
interface ModelSelectOption {
  id: string | number;
  [key: string]: any; // 支持动态字段
}
```

#### ModelSelectGroup

```typescript
interface ModelSelectGroup {
  label: string;                  // 分组标题
  options: ModelSelectOption[];   // 分组内的选项
}
```

#### ColumnConfig

```typescript
interface ColumnConfig {
  key: string;                    // 数据字段名
  title: string;                  // 列标题
  width?: string | number;        // 列宽度
  render?: (value: any, record: ModelSelectOption) => React.ReactNode; // 自定义渲染
}
```

## 键盘导航

| 按键 | 功能 |
|------|------|
| `Tab` | 聚焦到触发器 |
| `Enter` / `Space` | 打开/关闭下拉框 |
| `↑` / `↓` | 在选项间导航 |
| `Enter` | 选择当前高亮选项 |
| `Esc` | 关闭下拉框 |

## 注意事项

1. **搜索模式**：
   - 开启搜索功能（`searchable={true}`）后，搜索直接在主输入框内进行，无需额外的搜索框
   - 当下拉框关闭时，输入框显示选中的值（只读）
   - 当下拉框打开且 `searchable` 为 `true` 时，输入框可输入文本进行搜索
   - 如果配置了 `request`，默认使用**服务端搜索**，输入搜索词后会重新调用 `request(searchValue)` 获取数据
   - 如果没有配置 `request`，使用**客户端搜索**，对本地数据进行过滤

2. **数据来源**：
   - 如果配置了 `request`，会忽略 `options` 和 `groups`，以 `request` 返回的数据为准
   - 否则使用 `options` 或 `groups` 提供的静态数据

3. **分组显示**（支持两种方式）：
   - **自动分组**（推荐）：使用 `groupBy` 指定分组字段，组件会自动将扁平数据按字段值分组
     - 使用 `groupByLabel` 自定义分组标题（对象或函数）
     - 使用 `ungroupedLabel` 自定义未分组项的标题
     - 字段值为空或不存在的选项会放入"未分组"
   - **预定义分组**（向后兼容）：直接传入 `groups` 数组，每个分组包含 `label` 和 `options`
   - **优先级**：`groups` > `groupBy`（如果同时提供，使用 `groups`）
   - 分组模式下，数量限制只对第一个分组生效
   - 分组标题使用 sticky 定位，滚动时固定在顶部

4. **性能优化**：
   - 默认只显示前 20 条数据，点击"加载更多"可加载下一批
   - 搜索防抖 300ms，避免频繁请求

5. **样式自定义**：
   - 组件使用全局样式变量，确保与项目风格一致
   - 可通过 `className` 添加自定义样式

## 更新日志

### v1.2.1 (2025-12-08)

- 🎯 优化点击区域：整个触发器框线范围都可以点击，提升用户体验
- 🔧 技术优化：使用 `pointer-events` 属性优化事件处理，避免子元素拦截点击

### v1.2.0 (2025-01-27)

- 🔄 优化搜索功能：搜索直接在主输入框内进行，移除独立搜索框
- ✨ 改进用户体验：下拉框关闭时显示选中值，打开时可直接搜索
- 🎯 简化界面：减少视觉元素，提升操作效率

### v1.1.0 (2025-01-27)

- 🆕 新增基于字段的自动分组功能（`groupBy`）
- 🆕 新增分组标题映射配置（`groupByLabel`）
- 🆕 新增未分组项标题自定义（`ungroupedLabel`）
- 🔄 优化分组显示逻辑，支持两种分组方式
- ✅ 向后兼容原有 `groups` prop

### v1.0.0 (2025-01-27)

- 初始版本发布
- 支持单选/多选模式
- 支持预定义分组显示
- 支持服务端/客户端搜索
- 支持异步数据加载
- 完整的键盘导航
- 国际化支持（中英日韩）
