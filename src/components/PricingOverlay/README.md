# PricingOverlay 浮层组件

## 概述

PricingOverlay是一个全屏浮层组件，用于显示定价信息。它包含全屏蒙层背景和居中的浮层内容区域，内容是现有的Pricing组件。

## 功能特点

- ✅ 全屏蒙层背景，点击蒙层可关闭
- ✅ 按ESC键可关闭浮层
- ✅ 右上角关闭按钮
- ✅ 响应式设计，适配各种屏幕尺寸
- ✅ 平滑的进入和退出动画
- ✅ 防止背景滚动
- ✅ 高层级z-index，确保在最上层显示

## 组件结构

```
PricingOverlay/
├── index.tsx           # 主组件文件
├── PricingOverlay.css  # 样式文件
├── demo.tsx           # 演示文件
└── README.md          # 说明文档
```

## Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| visible | boolean | 是 | - | 控制浮层显示/隐藏 |
| onClose | () => void | 是 | - | 关闭浮层的回调函数 |

## 使用方法

### 基本用法

```tsx
import React, { useState } from 'react';
import PricingOverlay from '@/components/PricingOverlay';

const MyComponent = () => {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <>
      <button onClick={() => setShowPricing(true)}>
        查看定价
      </button>
      
      <PricingOverlay 
        visible={showPricing}
        onClose={() => setShowPricing(false)}
      />
    </>
  );
};
```

### 使用自定义Hook

```tsx
import { usePricingOverlay } from '@/hooks/usePricingOverlay';
import PricingOverlay from '@/components/PricingOverlay';

const MyComponent = () => {
  const pricing = usePricingOverlay();

  return (
    <>
      <button onClick={pricing.open}>
        查看定价
      </button>
      
      <PricingOverlay 
        visible={pricing.visible}
        onClose={pricing.close}
      />
    </>
  );
};
```

## 样式说明

### 主要CSS类

- `.pricing-overlay` - 全屏蒙层容器
- `.pricing-overlay-content` - 浮层内容区域
- `.pricing-overlay-header` - 浮层头部
- `.pricing-overlay-body` - 浮层内容体
- `.pricing-overlay-close` - 关闭按钮

### 响应式断点

- `1024px` - 中等屏幕调整
- `768px` - 小屏幕调整
- `480px` - 移动设备全屏显示

## 演示

在Header组件中已经集成了PricingOverlay的使用示例，点击导航栏中的"定价"按钮即可查看效果。

## 注意事项

1. 组件会自动管理body的overflow属性，防止背景滚动
2. ESC键和点击蒙层都会触发onClose回调
3. 移动设备上会自动切换为全屏显示
4. 确保z-index足够高，避免被其他元素遮挡

## 依赖

- React
- react-i18next (用于国际化)
- @/components/Pricing (内部依赖的定价组件)

## 更新日志

- v1.3.0 - 优化标题高度和内容区域
  - 缩小标题字体大小和头部padding，节省垂直空间
  - 标题字体：2rem → 1.5rem（桌面端）
  - 头部padding：减少约25%，更紧凑
  - 内容区域高度：从90vh增加到95vh
  - 内容区域获得更多显示空间，更好的内容展示效果
- v1.2.0 - 优化浮层尺寸和布局
  - 浮层宽度调整为95vw，最大宽度1200px
  - 浮层高度调整为90vh，更好的屏幕适配
  - 内容区域居中对齐，更好的视觉效果
  - 移动端保持圆角设计（10px）
- v1.1.0 - 优化浮层高度设置
  - 设置固定高度适配企业版卡片
  - 桌面端：700px（适配企业版6个功能项）
  - 1024px以下：650px
  - 768px以下：600px
  - 480px以下：保持100vh全屏
- v1.0.0 - 初始版本，基础功能实现 