# 电极参数验证配置使用说明

## 概述

`validation.ts` 文件提供了统一的参数验证配置和验证函数，用于 Predict 和 Optimize 页面的参数校验。

## 参数范围配置

### 阴极参数 (Cathode Parameters)

| 参数 | 字段名 | 最小值 | 最大值 | 单位 |
|------|--------|--------|--------|------|
| KF-9700 | cathodeKF9700 | 0.8 | 5 | wt.% |
| CN-01Y | cathodeCN01Y | 0 | 2 | wt.% |
| Super C65 | cathodeSuperC65 | 0 | 3 | wt.% |
| Areal Loading | cathodeArealLoading | 2.91 | 5.3 | mAh/cm² |
| Press Density | cathodePressDensity | 3.15 | 3.6 | g/cc |

### 阳极参数 (Anode Parameters)

| 参数 | 字段名 | 最小值 | 最大值 | 单位 |
|------|--------|--------|--------|------|
| CMC | anodeCMC | 0.1 | 3 | wt.% |
| SBR | anodeSBR | 0.1 | 3 | wt.% |
| PAA | anodePAA | 0.1 | 3 | wt.% |
| Super P (KS-6) | anodeSuperP | 0 | 2.0 | wt.% |
| SWCNT | anodeSWCNT | 0.05 | 1.2 | wt.% |
| Press Density | anodePressDensity | 1.28 | 1.5 | g/cc |

### 尺寸参数 (Dimension Parameters)

| 参数 | 字段名 | 最小值 | 最大值 | 单位 |
|------|--------|--------|--------|------|
| Width | width | 10 | 1000 | mm |
| Length | length | 10 | 1000 | mm |
| Layers | layers | 1 | 40 | - |

## 验证规则

### 规则 1: 阴极导电材料总和
```
(CB)cathode Conductive Carbon + (CN-01Y)cathode CNT > 0.8
即: cathodeSuperC65 + cathodeCN01Y > 0.8
```

### 规则 2: 阳极粘结剂与碳纳米管
```
(CMC)anode Binder2 > (SWCNT)anode CNT
即: anodeCMC > anodeSWCNT
```

### 规则 3: 阳极导电材料总和
```
(KS-6)anode Conductive Carbon + (SWCNT)anode CNT > 0.005
即: anodeSuperP + anodeSWCNT > 0.005
```

### 规则 4: 长宽比
```
ratio = min(width, length) / max(width, length)

如果 width <= 100:
  0.2 <= ratio <= 1

如果 100 < width <= 1000:
  0.1 <= ratio <= 0.5
```

## 支持的材料类型

**阴极材料**:
- NCM811
- NCM622
- NCM523
- LFP
- LCO
- NCA

**阳极材料**:
- Graphite
- Gr
- 12% Si
- 30% Si
- Silicon-Graphite
- SiOx

## 在 Predict 页面中使用

Predict 页面已经集成了验证配置，示例代码：

```typescript
import { 
  validateElectrodeParameters,
  cathodeParameterRanges,
  anodeParameterRanges,
  dimensionParameterRanges,
} from '../validation';

// 直接使用统一的参数范围
const cathodeRanges = cathodeParameterRanges;
const anodeRanges = anodeParameterRanges;

const handleCalculate = async () => {
  // 清空之前的错误
  setCathodeError('');
  setAnodeError('');
  setDimensionError('');

  // 使用验证配置进行参数验证
  const validationResult = validateElectrodeParameters({
    cathodeActiveMaterial,
    cathodeKF9700,
    cathodeCN01Y,
    cathodeSuperC65,
    cathodeArealLoading,
    cathodePressDensity,
    anodeActiveMaterial,
    anodeCMC,
    anodeSBR,
    anodePAA,
    anodeSuperP,
    anodeSWCNT,
    anodePressDensity,
    width,
    length,
    layers,
  });

  // 如果验证失败，设置错误信息
  if (!validationResult.isValid) {
    if (validationResult.errors.cathode) {
      setCathodeError(validationResult.errors.cathode);
    }
    if (validationResult.errors.anode) {
      setAnodeError(validationResult.errors.anode);
    }
    if (validationResult.errors.dimension) {
      setDimensionError(validationResult.errors.dimension);
    }
    return;
  }

  // 继续执行计算逻辑...
};

// 在 JSX 中使用参数范围
<ParameterInput
  label="KF-9700 (wt.%)"
  value={cathodeKF9700}
  onChange={setCathodeKF9700}
  min={cathodeParameterRanges.cathodeKF9700?.min}
  max={cathodeParameterRanges.cathodeKF9700?.max}
  step={0.1}
/>
```

## 在 Optimize 页面中使用

如果需要在 Optimize 页面中使用验证，可以这样做：

```typescript
import { 
  validateElectrodeParameters,
  anodeParameterRanges,
  cathodeParameterRanges,
  dimensionParameterRanges,
} from '../validation';

// 方式1: 使用验证函数
const handleCalculate = async () => {
  const validationResult = validateElectrodeParameters({
    cathodeActiveMaterial: formData.cathodeActiveMaterial,
    anodeActiveMaterial: formData.anodeActiveMaterial,
    // ... 其他参数
  });

  if (!validationResult.isValid) {
    // 处理错误
    console.error(validationResult.errors);
    return;
  }
  
  // 继续执行...
};

// 方式2: 直接使用参数范围配置
// 用于在 UI 中显示 Slider 或 Input 的最小/最大值
<Slider
  min={anodeParameterRanges.anodeCMC.min}
  max={anodeParameterRanges.anodeCMC.max}
  value={formData.anodeCMC}
/>
```

## API 说明

### validateElectrodeParameters(params, t?, options?)

验证电极参数是否符合所有规则，支持多语言和验证模式选择。

**参数:**
- `params: ElectrodeParameters` - 包含所有电极参数的对象
- `t?: TranslateFunction` - 可选的翻译函数，用于多语言支持。如果不提供，将使用默认的中文错误消息。
- `options?: ValidationOptions` - 可选的验证选项

**ValidationOptions:**
```typescript
interface ValidationOptions {
  skipEmptyCheck?: boolean;  // 是否跳过空值检查，默认 false
}
```

**返回:**
```typescript
{
  isValid: boolean;  // 是否通过验证
  errors: {
    cathode?: string;    // 阴极错误信息
    anode?: string;      // 阳极错误信息
    dimension?: string;  // 尺寸错误信息
  }
}
```

**示例:**
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// 完整验证（包含空值检查）- 用于提交时
const validationResult = validateElectrodeParameters(params, t);

// 跳过空值检查 - 用于实时验证，只检查范围和业务规则
const validationResult = validateElectrodeParameters(params, t, { skipEmptyCheck: true });
```

### 区域验证函数

除了 `validateElectrodeParameters`，还可以单独使用各区域的验证函数：

```typescript
import {
  validateCathodeParameters,
  validateAnodeParameters,
  validateDimensionParameters,
} from '../validation';

// 实时验证时跳过空值检查
const cathodeError = validateCathodeParameters(params, t, { skipEmptyCheck: true });
const anodeError = validateAnodeParameters(params, t, { skipEmptyCheck: true });
const dimensionError = validateDimensionParameters(params, t, { skipEmptyCheck: true });

// 提交时完整验证
const cathodeError = validateCathodeParameters(params, t);
const anodeError = validateAnodeParameters(params, t);
const dimensionError = validateDimensionParameters(params, t);
```

### getAllParameterRanges()

获取所有参数的范围配置。

**返回:**
```typescript
{
  cathode: Record<string, ParameterRange>;
  anode: Record<string, ParameterRange>;
  dimension: Record<string, ParameterRange>;
}
```

### getParameterMin(key: string)

获取指定参数的最小值。

### getParameterMax(key: string)

获取指定参数的最大值。

## 自定义验证

如果需要添加新的验证规则，可以直接修改 `validation.ts` 文件中的验证函数：

1. 在 `cathodeParameterRanges`、`anodeParameterRanges` 或 `dimensionParameterRanges` 中添加新参数的范围
2. 在 `validateCathodeParameters`、`validateAnodeParameters` 或 `validateDimensionParameters` 中添加新的验证逻辑
3. 确保错误信息清晰明了，方便用户理解

## 注意事项

1. **统一范围**: 所有材料使用统一的参数范围配置
2. **验证时机**:
   - **实时验证**: 使用 `{ skipEmptyCheck: true }` 选项，只检查范围和业务规则，不检查空值
   - **提交验证**: 点击"Calculate"按钮时执行完整验证，包括空值检查
3. **空值判断**: 验证函数使用严格的空值判断，0 不会被误识别为空值
4. **错误显示**: 错误信息会显示在对应区域的下方（阴极区域、阳极区域、尺寸区域）
5. **验证顺序**: 验证函数会按顺序检查：空值检查（可跳过）→ 范围验证 → 业务规则验证
6. **错误处理**: 每次只显示每个区域的第一个错误，修复后会继续显示下一个错误
7. **范围一致性**: 参数范围和验证规则应该与后端 API 保持一致
8. **多语言支持**: 验证函数支持多语言，传入 `t` 翻译函数即可。验证错误消息的翻译键位于 `design.electrode.validation.*`