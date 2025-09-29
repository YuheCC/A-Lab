# Search Page 重构说明

## 概述

Search页面已经根据Map页面的结构进行了重构，现在支持有机分子和无机分子的独立搜索功能。

## 结构变化

### 1. 主页面结构
- **主文件**: `src/pages/Search/index.tsx`
- **功能**: 提供tab切换界面，管理有机和无机搜索组件的显示

### 2. 组件结构
```
src/pages/Search/
├── index.tsx                    # 主页面，包含tab切换
├── Search.css                   # 页面样式
├── components/
│   ├── index.ts                 # 组件导出
│   ├── OrganicSearch.tsx        # 有机分子搜索组件
│   └── InorganicSearch.tsx      # 无机分子搜索组件
└── README.md                    # 本文档
```

### 3. Tab功能
- **有机分子**: 使用原有的搜索逻辑和数据源
- **无机分子**: 使用新的无机分子搜索接口和数据源

## 技术特点

### 1. 逻辑独立
- 有机和无机搜索使用不同的数据源
- 搜索接口独立（`/search` vs `/search-inorganic`）
- 分子属性显示不同（无机分子显示cluster、硫含量等）

### 2. URL保持一致
- 页面URL仍然是 `/search`
- 通过内部状态管理tab切换
- 用户体验保持一致

### 3. 数据源分离
- **有机分子**: `usePlotDataStore()` - 使用原有的有机分子数据
- **无机分子**: `useInorganicPlotDataStore()` - 使用新的无机分子数据

## 搜索接口

### 有机分子搜索
- 基础接口: `/search`
- 高级接口: `/search-35` (admin/enterprise/joint权限)
- 相似分子: `/api/llm/find-friend-with-image`

### 无机分子搜索
- 基础接口: `/search-inorganic`
- 高级接口: `/search-inorganic-35` (admin/enterprise/joint权限)
- 相似分子: `/llm/find-friend-inorganic`

## 分子属性显示

### 有机分子
- 标准属性: SMILES, 分子量, HOMO, LUMO, ESP等
- 高级属性: 预测熔点/沸点/闪点, 燃烧焓, 商业评分等

### 无机分子
- 基础属性: SMILES, 分子量, HOMO, LUMO, ESP等
- 特有属性: Cluster编号, 硫含量, 氧含量, 氮含量, 卤素含量等

## 国际化支持

支持四种语言：
- 中文 (zh)
- 英文 (en)
- 日语 (ja)
- 韩语 (ko)

每种语言都包含tab标签的翻译。

## 样式特点

- 继承Map页面的tab样式设计
- 响应式设计，支持移动端
- 平滑的tab切换动画
- 可拖拽的分隔条调整左右面板宽度

## 使用方法

1. 用户访问 `/search` 页面
2. 默认显示有机分子搜索tab
3. 点击"无机分子"tab切换到无机分子搜索
4. 每个tab都有独立的搜索历史和状态
5. 搜索逻辑完全独立，互不影响

## 注意事项

1. 无机分子搜索需要后端提供相应的API接口
2. 无机分子数据源需要正确配置
3. 两种搜索模式的分子属性结构不同，需要分别处理
4. 收藏功能在两个模式下都能正常工作
