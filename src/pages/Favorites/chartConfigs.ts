import { EChartsOption } from 'echarts';

/**
 * Favorites 页面图表配置常量
 */

// ==================== 公共配置 ====================

/**
 * 图表公共配置
 */
export const CHART_COMMON_CONFIG = {
  backgroundColor: '#FFFFFF',
  textStyle: {
    fontFamily: 'Arial, sans-serif',
    fontSize: 12,
    fontWeight: 400,
  },
  grid: {
    containLabel: true,
    left: '10%',
    right: '10%',
    top: '15%',
    bottom: '15%',
  },
};

/**
 * 图表标题样式
 */
export const CHART_TITLE_STYLE = {
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'Arial, sans-serif',
};

/**
 * 坐标轴标签样式
 */
export const AXIS_LABEL_STYLE = {
  fontSize: 12,
  fontWeight: 400,
  fontFamily: 'Arial, sans-serif',
};

/**
 * 图例样式
 */
export const LEGEND_STYLE = {
  textStyle: {
    fontSize: 12,
    fontWeight: 400,
    fontFamily: 'Arial, sans-serif',
  },
};

// ==================== 雷达图配置 ====================

/**
 * 雷达图维度配置
 * 顺序：从右侧开始顺时针排列 HOMO -> Molecular Weight -> BP -> MP -> LUMO
 */
export const RADAR_DIMENSIONS = [
  { name: 'LUMO', key: 'lumo_ev', unit: 'eV', shortName: 'LUMO' },
  { name: 'Melting Point', key: 'predicted_melting_point', unit: '°C', shortName: 'MP' },
  { name: 'Boiling Point', key: 'predicted_boiling_point', unit: '°C', shortName: 'BP' },
  { name: 'Molecular Weight', key: 'molecular_weight', unit: '', shortName: 'Molecular Weight' },
  { name: 'HOMO', key: 'homo_ev', unit: 'eV', shortName: 'HOMO' },
];

// ==================== MO 图配置 ====================

/**
 * MO 图参考分子数据
 * 12个固定的参考分子，用于对比分析
 */
export interface ReferenceMolecule {
  ABBREVIATION: string;
  HOMO_EV: number;
  LUMO_EV: number;
  SOLUBILITY: string;
}

export const REFERENCE_MOLECULES: ReferenceMolecule[] = [
  { ABBREVIATION: 'DEC', HOMO_EV: -8.0, LUMO_EV: 1.0, SOLUBILITY: 'medium solubility' },
  { ABBREVIATION: 'DME', HOMO_EV: -7.2, LUMO_EV: 1.15, SOLUBILITY: 'medium solubility' },
  { ABBREVIATION: 'AN', HOMO_EV: -9.1, LUMO_EV: 0.72, SOLUBILITY: 'high solubility' },
  { ABBREVIATION: 'TTE', HOMO_EV: -9.3, LUMO_EV: 0.6, SOLUBILITY: 'diluent' },
  { ABBREVIATION: 'BTFE', HOMO_EV: -8.5, LUMO_EV: 0.68, SOLUBILITY: 'diluent' },
  { ABBREVIATION: 'EC', HOMO_EV: -8.2, LUMO_EV: 0.64, SOLUBILITY: 'high solubility' },
  { ABBREVIATION: 'PC', HOMO_EV: -8.2, LUMO_EV: 0.56, SOLUBILITY: 'high solubility' },
  { ABBREVIATION: 'FDMB', HOMO_EV: -7.6, LUMO_EV: 0.68, SOLUBILITY: 'medium solubility' },
  { ABBREVIATION: 'MA', HOMO_EV: -7.6, LUMO_EV: 0.22, SOLUBILITY: 'medium solubility' },
  { ABBREVIATION: 'DFEC', HOMO_EV: -9.1, LUMO_EV: -0.14, SOLUBILITY: 'high solubility' },
  { ABBREVIATION: 'Benzene', HOMO_EV: -6.9, LUMO_EV: -0.22, SOLUBILITY: 'low solubility' },
  { ABBREVIATION: 'MTFP', HOMO_EV: -8.0, LUMO_EV: -0.52, SOLUBILITY: 'medium solubility' },
];

/**
 * 溶解度颜色映射
 */
export const SOLUBILITY_COLORS: Record<string, string> = {
  'high solubility': '#4CAF50', // 绿色
  'medium solubility': '#FF9800', // 橙色
  'low solubility': '#F44336', // 红色
  'diluent': '#2196F3', // 蓝色
};

/**
 * MO 图 Jitter 偏移量（防止重叠）
 */
export const MO_JITTER_OFFSET = 0.02;

// ==================== ESP 图配置 ====================

/**
 * ESP 椭圆区域配置
 */
export interface ESPRegion {
  center: [number, number]; // [x, y] 椭圆中心
  width: number; // 椭圆宽度（长半轴 * 2）
  height: number; // 椭圆高度（短半轴 * 2）
  angle: number; // 旋转角度（度）
  color: string; // 颜色
  label: string; // 标签
  opacity?: number; // 透明度
}

/**
 * ESP 溶解度区域配置
 * 三个椭圆区域：高溶解度、低溶解度、稀释剂
 */
export const ESP_REGIONS: ESPRegion[] = [
  {
    center: [-1.5, 1.6],
    width: 1.5,
    height: 0.55,
    angle: 65,
    color: '#4CAF50', // 绿色 - 高溶解度
    label: 'high solubility',
    opacity: 0.2,
  },
  {
    center: [-0.75, 0.65],
    width: 0.6,
    height: 0.6,
    angle: 0,
    color: '#F44336', // 红色 - 低溶解度
    label: 'low solubility',
    opacity: 0.2,
  },
  {
    center: [-0.55, 1.6],
    width: 0.65,
    height: 1.3,
    angle: 0,
    color: '#2196F3', // 蓝色 - 稀释剂
    label: 'diluent',
    opacity: 0.2,
  },
];

// ==================== 工具函数 ====================

/**
 * 数据归一化函数
 * 将数据映射到 [0, 1] 范围
 */
export function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

/**
 * 生成 jitter 偏移
 * 用于防止散点重叠
 */
export function generateJitter(offset: number = MO_JITTER_OFFSET): number {
  return (Math.random() - 0.5) * 2 * offset;
}

/**
 * 截断 SMILES 字符串
 * 如果超过指定长度则截断并添加省略号
 */
export function truncateSmiles(smiles: string, maxLength: number = 15): string {
  if (!smiles) return '';
  return smiles.length > maxLength ? `${smiles.substring(0, maxLength)}...` : smiles;
}

/**
 * 计算椭圆路径
 * 用于在 ECharts graphic 中绘制椭圆
 */
export function calculateEllipsePath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number = 0
): string {
  const points: [number, number][] = [];
  const steps = 100;
  const angleRad = (angle * Math.PI) / 180;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);

    // 应用旋转
    const rotatedX = x * Math.cos(angleRad) - y * Math.sin(angleRad);
    const rotatedY = x * Math.sin(angleRad) + y * Math.cos(angleRad);

    points.push([cx + rotatedX, cy + rotatedY]);
  }

  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ') + ' Z';
}
