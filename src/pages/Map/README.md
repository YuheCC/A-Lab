# Map Page - Inorganic Molecules Implementation

## 概述

无机分子页面已经实现了完整的UMAP数据集成和多语言支持，包括数据模型、接口调用和可视化展示。

## 数据模型

### 无机分子数据类型 (InorganicPlotDataNode)

```typescript
interface InorganicPlotDataNode {
    id: string;
    x: number;           // UMAP X坐标
    y: number;           // UMAP Y坐标
    smiles: string;      // 分子SMILES表示
    properties: {
        molwt: number;                    // 分子量
        homo_eV: number;                  // HOMO能级
        lumo_eV: number;                  // LUMO能级
        esp_min_eV: number;               // ESP最小值
        esp_max_eV: number;               // ESP最大值
        functional_groups: string;        // 官能团
        predicted_mp: number;             // 预测熔点
        predicted_bp: number;             // 预测沸点
        predicted_fp: number;             // 预测闪点
        chemical_formula: string;         // 化学式
        combustion_enthalpy: number;      // 燃烧焓
        commercial_score: number;         // 商业化评分
        commercial_link: string;          // 商业化链接
        CLUSTER: string;                  // 聚类标签
    };
    rawData: any;                        // 原始数据
}
```

## 数据存储

### 无机分子数据存储 (useInorganicPlotDataStore)

- **状态管理**: 使用Zustand进行状态管理
- **数据获取**: 直接从API接口获取数据，无预加载逻辑
- **接口兼容**: 暂时使用有机分子接口，直到无机分子专用接口实现
- **错误处理**: 完整的错误处理和加载状态管理

## 组件结构

### InorganicMolecules 组件

- **UMAP可视化**: 集成UMAPClusterPlotDeck组件
- **多语言支持**: 支持中文、英文、日语、韩语
- **内容展示**: 包含研究动机、数据集生成、可视化方法、结果分析等完整内容
- **聚类分析**: 展示6个无机分子聚类的详细描述

## 数据流程

1. **组件挂载**: 组件挂载时自动调用fetchData()
2. **API调用**: 调用snowflake-query接口获取数据
3. **数据处理**: 将API返回的数据映射为InorganicPlotDataNode格式
4. **状态更新**: 更新loading、error和data状态
5. **可视化**: 将数据传递给UMAPClusterPlotDeck进行可视化

## 接口集成

### 当前实现
- 使用有机分子接口 `/snowflake-query` 作为临时方案
- 数据格式完全兼容现有的UMAP可视化组件

### 未来扩展
- 实现专门的无机分子接口
- 添加无机分子特有的属性和分析方法
- 优化无机分子的聚类算法和可视化效果

## 多语言支持

### 支持语言
- 中文 (zh)
- 英文 (en)
- 日语 (ja)
- 韩语 (ko)

### 内容结构
- 研究动机
- 数据集生成
- 可视化方法
- 结果分析
- 聚类描述

## 技术特点

- **响应式设计**: 适配不同屏幕尺寸
- **性能优化**: 移除预加载逻辑，直接从接口获取数据
- **类型安全**: 完整的TypeScript类型定义
- **状态管理**: 使用Zustand进行高效的状态管理
- **组件复用**: 复用现有的UMAP可视化组件

## 使用说明

1. 切换到无机分子标签页
2. 系统自动从接口获取数据
3. 数据加载完成后显示UMAP可视化图表
4. 右侧显示详细的无机分子研究内容
5. 支持多语言切换查看不同语言版本

## 注意事项

- 当前使用有机分子接口作为临时方案
- 数据格式需要与有机分子保持一致
- 未来需要实现专门的无机分子接口
- 聚类分析基于现有的6个聚类结构
