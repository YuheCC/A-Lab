# Ultrasound 超声检测组件

## 组件说明

超声检测组件用于展示超声波检测分析结果，包括三个数据分布图表和对应的超声图像。

## 数据结构

### 1. 图表数据 (state1.json, state2.json, state3.json)

位置：`src/pages/Manufacturing/components/Ultrasound/data/`

每个 state 文件包含以下结构：

```json
{
  "x": [0, 1, 2, ...],  // X轴数据点
  "y": [44.2, 55.8, ...],  // Y轴数据值
  "metadata": {
    "unit": "单位",
    "description": "描述信息"
  }
}
```

### 2. 参考线数据 (mark.json)

位置：`src/pages/Manufacturing/components/Ultrasound/data/mark.json`

结构说明：
```json
{
  "A37": {
    "state1": 44.2,  // 对应 state1 图表的参考线 Y 值
    "state2": 55.8,  // 对应 state2 图表的参考线 Y 值
    "state3": 0      // 对应 state3 图表的参考线 Y 值
  },
  "A38": {
    "state1": 45.1,
    "state2": 54.9,
    "state3": 0
  },
  "A39": {
    "state1": 43.8,
    "state2": 56.2,
    "state3": 0
  }
}
```

- 键名为节点 ID（A37, A38, A39）
- 每个节点包含三个状态的参考线数值
- 参考线会在图表上显示为红色虚线

### 3. 图像文件

位置：`public/manufacturing/ultrasound/`

命名规范：
- 灰度图：`{nodeId}_grays.png`（如：A37_grays.png）
- 掩膜图：`{nodeId}_mask.jpg`（如：A37_mask.jpg）

当前支持的节点：
- A37
- A38
- A39

## 使用方式

### 导入组件

```tsx
import Ultrasound from '@/pages/Manufacturing/components/Ultrasound';

<Ultrasound onBackToIntro={() => {}} />
```

### Props

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| onBackToIntro | () => void | 否 | 返回介绍页的回调函数 |

## 功能特性

1. **树形列表**：左侧展示检测节点列表（A37, A38, A39）
2. **数据图表**：显示三个状态的超声数据分布图
3. **参考线**：根据选中节点在图表上显示参考线
4. **图像查看**：支持灰度图和掩膜图的切换查看

## 参考线计算逻辑

参考线的位置通过以下步骤计算：
1. 从 `mark.json` 读取当前节点对应状态的 Y 值
2. 在 state 数据的 Y 轴数组中查找最接近该值的索引
3. 使用该索引作为 X 轴位置绘制垂直参考线

## 注意事项

1. 确保 JSON 数据文件格式正确，包含必要的 `x` 和 `y` 字段
2. 图像文件需要按照命名规范放置在 public 目录
3. 新增节点时需要同时更新 mark.json 和准备对应的图像文件
4. 参考线为可选功能，如果 mark.json 中某节点某状态值为 0 或不存在，则不显示参考线
