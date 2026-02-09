# ColumnSettings 列配置组件

类似于 Ant Design Table 的 setting 功能，支持动态显示/隐藏表格列，并使用 localStorage 存储用户配置。

## 功能特性

- ✅ 动态显示/隐藏表格列
- ✅ 支持全选/取消全选
- ✅ 支持重置到默认配置
- ✅ 使用 localStorage 持久化存储用户配置
- ✅ 某些列可以设置为不允许隐藏（如 ID、操作列）
- ✅ 显示当前可见列数量统计
- ✅ 点击外部自动关闭下拉框

## 使用方法

### 1. 基本使用

```tsx
import ColumnSettings, { ColumnConfig } from '@/components/ColumnSettings';

const MyTable: React.FC = () => {
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([
    { key: 'id', title: 'ID', visible: true, disabled: true }, // disabled: 不允许隐藏
    { key: 'name', title: '名称', visible: true },
    { key: 'age', title: '年龄', visible: true },
    { key: 'email', title: '邮箱', visible: false }, // 默认隐藏
    { key: 'actions', title: '操作', visible: true, disabled: true },
  ]);

  const isColumnVisible = (key: string) => {
    const column = columnConfigs.find(col => col.key === key);
    return column ? column.visible : true;
  };

  return (
    <div>
      {/* 列配置按钮 */}
      <ColumnSettings
        columns={columnConfigs}
        onChange={setColumnConfigs}
        storageKey="my-table-columns" // localStorage 存储键
      />

      {/* 表格 */}
      <table>
        <thead>
          <tr>
            {isColumnVisible('id') && <th>ID</th>}
            {isColumnVisible('name') && <th>名称</th>}
            {isColumnVisible('age') && <th>年龄</th>}
            {isColumnVisible('email') && <th>邮箱</th>}
            {isColumnVisible('actions') && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.id}>
              {isColumnVisible('id') && <td>{row.id}</td>}
              {isColumnVisible('name') && <td>{row.name}</td>}
              {isColumnVisible('age') && <td>{row.age}</td>}
              {isColumnVisible('email') && <td>{row.email}</td>}
              {isColumnVisible('actions') && <td>...</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 2. FormulationNew 页面示例

参考 `/src/pages/FormulationNew/index.tsx` 中的完整实现：

```tsx
// 1. 定义列配置
const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>([
  { key: 'analysisId', title: t('formulation.list.columns.analysisId'), visible: true, disabled: true },
  { key: 'saltFraction', title: t('formulation.list.columns.saltFraction'), visible: true },
  // ... 更多列
  { key: 'actions', title: t('formulation.list.columns.actions'), visible: true, disabled: true },
]);

// 2. 辅助函数判断列可见性
const isColumnVisible = (key: string) => {
  const column = columnConfigs.find(col => col.key === key);
  return column ? column.visible : true;
};

// 3. 在筛选器区域添加组件
<ColumnSettings
  columns={columnConfigs}
  onChange={setColumnConfigs}
  storageKey="formulation-table-columns"
/>

// 4. 表头根据配置显示/隐藏
<thead>
  <tr>
    {isColumnVisible('analysisId') && <th>Analysis ID</th>}
    {isColumnVisible('saltFraction') && <th>Salt (Fraction)</th>}
    // ...
  </tr>
</thead>

// 5. 表体根据配置显示/隐藏
<tbody>
  {data.map(record => (
    <tr key={record.id}>
      {isColumnVisible('analysisId') && <td>{record.id}</td>}
      {isColumnVisible('saltFraction') && <td>{record.salt}</td>}
      // ...
    </tr>
  ))}
</tbody>
```

## Props 参数

### ColumnSettings

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| columns | `ColumnConfig[]` | ✅ | 列配置数组 |
| onChange | `(columns: ColumnConfig[]) => void` | ✅ | 列配置变化回调 |
| storageKey | `string` | ❌ | localStorage 存储键，不传则不持久化 |

### ColumnConfig

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | `string` | ✅ | 列的唯一标识 |
| title | `string` | ✅ | 列的显示名称 |
| visible | `boolean` | ✅ | 是否可见 |
| disabled | `boolean` | ❌ | 是否禁止隐藏（如 ID、操作列） |

## 样式定制

组件样式使用 Less 编写，可以通过以下变量进行定制：

```less
@color-gray-50: #f9fafb;
@color-gray-100: #f3f4f6;
@color-gray-200: #e5e7eb;
@color-gray-300: #d1d5db;
@color-gray-400: #9ca3af;
@color-gray-500: #6b7280;
@color-gray-700: #374151;
@color-gray-800: #1f2937;
@color-accent: #56B26A;
```

## localStorage 存储格式

```json
[
  { "key": "analysisId", "visible": true },
  { "key": "saltFraction", "visible": false },
  { "key": "status", "visible": true }
]
```

## 注意事项

1. **disabled 列**：设置了 `disabled: true` 的列不能被隐藏，复选框会被禁用
2. **localStorage 键名**：不同表格使用不同的 `storageKey` 以避免冲突
3. **初始化加载**：组件会在 mount 时自动从 localStorage 加载配置
4. **重置功能**：点击"重置"按钮会清除 localStorage 并恢复所有列为可见状态
5. **colSpan 计算**：空数据行的 colSpan 应该动态计算：`columnConfigs.filter(col => col.visible).length`

## 浏览器兼容性

- Chrome ✅
- Firefox ✅
- Safari ✅
- Edge ✅

依赖 localStorage API，不支持 IE11 以下版本。
