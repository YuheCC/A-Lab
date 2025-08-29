# Filter页面重构说明

## 概述
Filter页面已按照Map页面的实现模式进行了重构，采用了标签页结构和组件化布局。

## 文件结构
```
src/pages/Filter/
├── index.tsx              # 主页面组件，包含标签页导航
├── Filter.css             # 页面样式文件
├── README.md              # 本说明文件
└── components/            # 组件目录
    ├── index.ts           # 组件导出文件
    ├── OrganicFilters.tsx # 有机分子过滤组件
    └── InorganicFilters.tsx # 无机分子过滤组件
```

## 重构特点

### 1. 标签页结构
- 采用与Map页面相同的标签页设计
- 支持"有机分子"和"无机分子"两个标签
- 平滑的标签切换动画和样式

### 2. 组件化布局
- 左侧：UMAP可视化图表区域
- 右侧：过滤控制面板
- 使用`search-umap-container`布局保持与Map页面一致

### 3. 功能分离
- `OrganicFilters`: 处理有机分子的过滤功能
- `InorganicFilters`: 处理无机分子的过滤功能
- 每个组件都有独立的过滤逻辑和状态管理

### 4. 样式一致性
- 标签页样式与Map页面保持一致
- 使用相同的CSS类名和布局结构
- 响应式设计支持

## 国际化支持
- 支持中文、英文、日文、韩文四种语言
- 标签页文本通过`explorer.filterTabs`命名空间管理
- 过滤器标签和功能说明支持多语言

## 技术实现
- 使用React Hooks管理状态
- TypeScript类型定义完整
- 支持权限控制（企业版功能）
- 实时过滤和图表更新

## 使用方法
1. 选择相应的标签页（有机/无机分子）
2. 在右侧面板调整过滤参数
3. 左侧图表实时显示过滤结果
4. 支持重置单个过滤器或全部过滤器

## 注意事项
- 无机分子过滤需要调用`useInorganicPlotDataStore`
- 有机分子过滤使用`usePlotDataStore`
- 权限控制功能保持原有逻辑不变
