"""
生成 vedGedLookup.ts 的脚本。

用法（在项目根目录执行）：
    python3 src/pages/Design/Electrode/Optimize/constData/generate_ved_ged_lookup.py

数据源：
    public/design/electrode/VED_GED.npy
    - Shape: (413749, 2)
    - Column 0: VED (Volumetric Energy Density, Wh/L)
    - Column 1: GED (Gravimetric Energy Density, Wh/kg)

输出：
    src/pages/Design/Electrode/Optimize/constData/vedGedLookup.ts
"""

import os
import numpy as np

# ── 配置 ──────────────────────────────────────────────────────────────────────
REPO_ROOT = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '..', '..', '..')
NPY_PATH = os.path.join(REPO_ROOT, 'public', 'design', 'electrode', 'VED_GED.npy')
OUT_PATH = os.path.join(os.path.dirname(__file__), 'vedGedLookup.ts')

VED_MIN = 391.0
VED_MAX = 1098.73
N_BINS = 1000
# ─────────────────────────────────────────────────────────────────────────────


def main():
    print(f'Loading {NPY_PATH} ...')
    data = np.load(NPY_PATH)
    ved_col = data[:, 0]
    ged_col = data[:, 1]
    print(f'  Shape: {data.shape}  VED [{ved_col.min():.2f}, {ved_col.max():.2f}]  '
          f'GED [{ged_col.min():.2f}, {ged_col.max():.2f}]')

    bin_width = (VED_MAX - VED_MIN) / N_BINS
    ged_mins = []
    ged_maxs = []

    for i in range(N_BINS):
        lo = VED_MIN + i * bin_width
        hi = lo + bin_width
        if i == N_BINS - 1:
            mask = (ved_col >= lo) & (ved_col <= VED_MAX + 1)
        else:
            mask = (ved_col >= lo) & (ved_col < hi)

        if mask.sum() > 0:
            ged_mins.append(round(float(ged_col[mask].min()), 3))
            ged_maxs.append(round(float(ged_col[mask].max()), 3))
        else:
            ged_mins.append(None)
            ged_maxs.append(None)

    # 对空 bin 插值填充
    for i in range(len(ged_mins)):
        if ged_mins[i] is None:
            prev_i = next((j for j in range(i - 1, -1, -1) if ged_mins[j] is not None), None)
            next_i = next((j for j in range(i + 1, len(ged_mins)) if ged_mins[j] is not None), None)
            if prev_i is not None and next_i is not None:
                t = (i - prev_i) / (next_i - prev_i)
                ged_mins[i] = round(ged_mins[prev_i] + t * (ged_mins[next_i] - ged_mins[prev_i]), 3)
                ged_maxs[i] = round(ged_maxs[prev_i] + t * (ged_maxs[next_i] - ged_maxs[prev_i]), 3)
            elif prev_i is not None:
                ged_mins[i] = ged_mins[prev_i]
                ged_maxs[i] = ged_maxs[prev_i]
            elif next_i is not None:
                ged_mins[i] = ged_mins[next_i]
                ged_maxs[i] = ged_maxs[next_i]

    none_count = sum(1 for x in ged_mins if x is None)
    print(f'  Bins: {N_BINS}  Empty after fill: {none_count}')

    mins_str = ', '.join(str(x) for x in ged_mins)
    maxs_str = ', '.join(str(x) for x in ged_maxs)

    ts_content = f"""// AUTO-GENERATED — DO NOT EDIT
// Regenerate: python3 src/pages/Design/Electrode/Optimize/constData/generate_ved_ged_lookup.py
// Source: public/design/electrode/VED_GED.npy ({data.shape[0]} rows)
// VED range: {VED_MIN} ~ {VED_MAX} Wh/L  |  {N_BINS} equal-width bins (~{round(bin_width, 4)} Wh/L each)
// GED range per bin: precomputed min/max of Gravimetric Energy Density (Wh/kg)

const VED_MIN = {VED_MIN};
const VED_MAX = {VED_MAX};
const N_BINS = {N_BINS};
const BIN_WIDTH = (VED_MAX - VED_MIN) / N_BINS;

const GED_MINS: number[] = [{mins_str}];
const GED_MAXS: number[] = [{maxs_str}];

/**
 * 根据 VED（Volumetric Energy Density）区间，从预计算查找表中
 * 获取对应的 GED（Gravimetric Energy Density）min/max 范围。
 *
 * @param vedRange - 用户选择的 VED 区间 [vedMin, vedMax]
 * @returns [gedMin, gedMax] — GED 的可行范围
 */
export function getGedBoundsFromVed(vedRange: [number, number]): [number, number] {{
  const [vedLo, vedHi] = vedRange;

  // 钳制到查找表覆盖范围
  const clampedLo = Math.max(VED_MIN, Math.min(VED_MAX, vedLo));
  const clampedHi = Math.max(VED_MIN, Math.min(VED_MAX, vedHi));

  // 找首个重叠 bin（bin_lo < clampedHi 且 bin_hi > clampedLo）
  const startBin = Math.max(0, Math.floor((clampedLo - VED_MIN) / BIN_WIDTH));
  const endBin = Math.min(N_BINS - 1, Math.floor((clampedHi - VED_MIN) / BIN_WIDTH));

  let gedMin = Infinity;
  let gedMax = -Infinity;

  for (let i = startBin; i <= endBin; i++) {{
    if (GED_MINS[i] < gedMin) gedMin = GED_MINS[i];
    if (GED_MAXS[i] > gedMax) gedMax = GED_MAXS[i];
  }}

  // Fallback：若未命中任何 bin，返回全局范围
  if (!isFinite(gedMin) || !isFinite(gedMax)) {{
    return [24, 360];
  }}

  return [Math.round(gedMin * 100) / 100, Math.round(gedMax * 100) / 100];
}}
"""

    with open(OUT_PATH, 'w') as f:
        f.write(ts_content)

    size = os.path.getsize(OUT_PATH)
    print(f'Written: {OUT_PATH}  ({size} bytes, {size // 1024} KB)')


if __name__ == '__main__':
    main()
