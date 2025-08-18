# Chat页面布局优化说明

## 概述

本次优化实现了基于CSS变量的动态布局系统，能够根据MoleculeModal的宽度自动调整chat-main和chatsider的宽度。

## 主要特性

### 1. 动态宽度调整
- 使用CSS变量 `--molecule-panel-width` 控制分子面板宽度
- 使用CSS变量 `--sidebar-collapsed-width` 控制收缩后的侧边栏宽度
- chat-main宽度自动计算：`100vw - 分子面板宽度 - 侧边栏宽度`

### 2. 响应式设计
- 大屏幕（>1200px）：分子面板380px/730px，侧边栏收缩至50px
- 中等屏幕（768px-1200px）：分子面板宽度按比例调整
- 小屏幕（<768px）：分子面板全屏显示，隐藏侧边栏

### 3. 状态管理
- `useMoleculePanel` hook统一管理分子面板状态
- 自动处理布局类的添加/移除
- 支持展开/收缩状态切换

## 核心文件

### 1. 布局工具 (`utils/layoutUtils.ts`)
```typescript
// 计算布局尺寸
calculateLayoutDimensions(isExpanded, viewportWidth)

// 应用CSS变量
applyLayoutVariables(dimensions)

// 设置响应式监听
setupResponsiveLayout(isExpanded, callback)

// 切换展开状态
toggleMoleculePanelExpansion(isExpanded, callback)
```

### 2. 状态管理Hook (`hooks/useMoleculePanel.ts`)
```typescript
const {
  state,           // 面板状态
  showPanel,       // 显示面板
  hidePanel,       // 隐藏面板
  toggleExpansion, // 切换展开
  handleMoleculeClick,  // 处理分子点击
  handleFindSimilar,    // 处理查找相似
} = useMoleculePanel();
```

### 3. CSS变量系统
```css
.chat-container {
  --molecule-panel-width: 380px;      /* 分子面板宽度 */
  --sidebar-collapsed-width: 50px;    /* 收缩侧边栏宽度 */
  --sidebar-normal-width: 220px;      /* 正常侧边栏宽度 */
  --chat-main-width: auto;            /* 聊天区域宽度 */
}
```

## 使用方法

### 1. 在组件中使用
```typescript
import { useMoleculePanel } from './hooks/useMoleculePanel';

const MyComponent = () => {
  const { handleMoleculeClick, handleFindSimilar } = useMoleculePanel();
  
  return (
    <div>
      <button onClick={() => handleMoleculeClick('LiPF6')}>
        显示分子
      </button>
      <button onClick={() => handleFindSimilar('LiPF6')}>
        查找相似分子
      </button>
    </div>
  );
};
```

### 2. 自定义宽度
```typescript
import { applyLayoutVariables } from './utils/layoutUtils';

// 自定义分子面板宽度
applyLayoutVariables({
  moleculePanelWidth: 500,
  sidebarCollapsedWidth: 60,
  chatMainWidth: window.innerWidth - 500 - 60
});
```

## 布局状态

### 1. 正常状态
- 侧边栏：220px
- 聊天区域：自适应
- 分子面板：隐藏

### 2. 分子面板激活状态
- 侧边栏：50px（mini模式）
- 聊天区域：`100vw - 380px - 50px`
- 分子面板：380px

### 3. 分子面板展开状态
- 侧边栏：50px（mini模式）
- 聊天区域：`100vw - 730px - 50px`
- 分子面板：730px

## 性能优化

1. **CSS变量**：避免频繁的DOM操作，使用CSS变量实现高性能的样式切换
2. **防抖处理**：窗口大小变化时使用防抖避免频繁计算
3. **过渡动画**：使用CSS transition实现平滑的宽度变化
4. **最小宽度保护**：确保聊天区域最小宽度为300px

## 兼容性

- 支持现代浏览器的CSS变量特性
- 提供fallback值确保在不支持CSS变量的浏览器中正常显示
- 响应式设计适配各种屏幕尺寸

## 扩展性

系统设计具有良好的扩展性：
- 可以轻松添加新的布局状态
- 支持自定义CSS变量
- 可以集成其他面板组件
- 支持主题切换和暗色模式