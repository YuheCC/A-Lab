# DesignDetailsModal 组件

## 概述
设计详情弹窗组件，用于展示电极优化推荐的详细参数信息。

## 组件结构

### 1. Performance Prediction（性能预测）
- 4 个关键性能指标横向排列
- Design Capacity (mAh) - 设计容量
- Gravimetric Energy Density (Wh/kg) - 质量能量密度
- Thickness (mm) - 厚度
- Volumetric Energy (Wh/L) - 体积能量密度

### 2. Design（设计信息）
- 基本设计信息采用 3 列网格布局
- Cell Type - 电池类型
- Cathode Material - 正极材料
- Anode Material - 负极材料
- Width (mm) - 宽度
- Length (mm) - 长度
- Layers - 层数

### 3. Cathode & Anode（正极和负极参数）
- 两列并排显示
- Cathode（正极）带蓝色标识线 (#1890ff)
- Anode（负极）带绿色标识线 (#52c41a)
- 每个参数以"标签-数值"的形式展示

## 样式特点

### 整体布局
- 弹窗背景：#f5f5f5（浅灰色）
- 内容区域：白色卡片 (#ffffff)
- 圆角：8px
- 间距：统一使用 16px、20px、24px

### Performance Prediction 卡片
- 数值字体：24px，加粗 (600)
- 标签字体：13px，普通 (400)
- 单位字体：14px，灰色 (#666)

### Design 信息
- 标签字体：13px，灰色 (#666)
- 数值字体：15px，加粗 (600)

### Cathode/Anode 区域
- 标题左侧带 4px 宽的彩色竖线
- 参数行采用左右布局：标签在左，数值在右
- 数值右对齐，宽度 80px

## 响应式设计
- 大屏（>1024px）：4列性能指标，3列设计信息，2列正负极
- 中屏（768px-1024px）：2列性能指标，2列设计信息，1列正负极
- 小屏（<768px）：1列布局

## 类型定义
所有数据类型定义在 `../../types.ts` 文件中的 `DesignDetails` 接口。

## 使用示例
```tsx
<DesignDetailsModal
  visible={modalVisible}
  data={selectedDesign}
  loading={modalLoading}
  onClose={() => setModalVisible(false)}
/>
```

## Mock 数据
Mock 数据在 `../../example.ts` 中的 `generateMockDetail` 函数生成。
