// ============================================
// 电极性能 API 类型定义
// Electrode Performance API Types
// ============================================

// ============================================
// 基础枚举
// ============================================

/**
 * 电极页面类型枚举
 * Electrode Page Type Enum
 */
export enum ElectrodePageType {
  /** 正向预测 - Result Prediction */
  RESULT_PREDICTION = 1,
  /** 反向设计 - Inverse Design (Optimize) */
  INVERSE_DESIGN = 2,
}

// ============================================
// 模型参数和结果（核心类型）
// ============================================

/**
 * 电极模型输入参数（打平的一级对象）
 * Electrode Model Input Parameters (Flattened Structure)
 *
 * 通过参数名前缀区分阴阳极参数：
 * - anode*: 阳极参数
 * - cathode*: 阴极参数
 * - width/length/layers: 尺寸参数
 */
export interface ElectrodeModelParams {
  // ========== 阳极参数 (Anode Parameters) - 描述性命名 ==========
  /** CMC (wt.%) */
  anodeCMC: number;
  /** SBR (wt.%) */
  anodeSBR: number;
  /** PAA (wt.%) */
  anodePAA: number;
  /** Super P (wt.%) */
  anodeSuperP: number;
  /** SWCNT (wt.%) */
  anodeSWCNT: number;
  /** Press Density (g/cc) */
  anodePressDensity: number;
  /** Active material-1 SC-B-I (%) */
  anodeSCBI: number;
  /** Active material-2 Gr-S-I (%) */
  anodeGrSI: number;
  /** Areal Loading (mAh/cm²) */
  anodeArealLoading: number;

  // ========== 阴极参数 (Cathode Parameters) - 描述性命名 ==========
  /** KF-9700 (wt.%) */
  cathodeKF9700: number;
  /** CN-01Y (wt.%) */
  cathodeCN01Y: number;
  /** Super C65 (wt.%) */
  cathodeSuperC65: number;
  /** Areal Loading (mAh/cm²) */
  cathodeArealLoading: number;
  /** Press Density (g/cc) */
  cathodePressDensity: number;
  /** Active material NCM-A (%) */
  cathodeNCMA: number;

  // ========== 尺寸参数 (Dimension Parameters) ==========
  /** Width (mm) */
  width: number;
  /** Length (mm) */
  length: number;
  /** Layers */
  layers: number;
}

/**
 * 电极模型预测结果（打平的一级对象）
 * Electrode Model Prediction Result (Flattened Structure)
 */
export interface ElectrodeModelResult {
  /** Design Capacity (Ah) */
  designCapacity: number;
  /** Specific Energy Density (Wh/kg) */
  specificED: number;
  /** Jelly Roll Thickness (mm) */
  jellyRollThickness: number;
  /** Volumetric Energy Density (Wh/L) */
  volumetricED: number;
}

// ============================================
// 历史记录相关类型
// ============================================

/**
 * 历史记录列表查询参数
 * History List Query Parameters
 */
export interface ElectrodeHistoryListParams {
  /** 页码（从1开始） */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  /** 创建日期过滤（YYYY-MM-DD） */
  created_at?: string;
  /** ID 搜索 */
  id?: string;
  /** 页面类型（必需）：1=正向预测, 2=反向设计 */
  type: ElectrodePageType;
  /** Cell Design 过滤 */
  cell_design?: string;
  /** 正极活性材料过滤 */
  cathode_active_material?: string;
  /** 负极活性材料过滤 */
  anode_active_material?: string;
}

/**
 * 历史记录项（API 原始响应 - 包含 JSON 字符串）
 * History Item Raw (API Response with JSON Strings)
 */
export interface ElectrodeHistoryItemRaw {
  /** 记录 ID */
  id: number;
  /** Cell Design */
  cell_design: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料 */
  anode_active_material: string;
  /** 模型参数（JSON 字符串） */
  model_params: string;
  /** 模型结果（JSON 字符串） */
  model_result: string;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
}

/**
 * 历史记录项（解析后 - 供前端使用）
 * History Item Parsed (For Frontend Use)
 */
export interface ElectrodeHistoryItem {
  /** 记录 ID */
  id: number;
  /** Cell Design */
  cell_design: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料 */
  anode_active_material: string;
  /** 模型参数（解析后的对象） */
  model_params: ElectrodeModelParams;
  /** 模型结果（解析后的对象） */
  model_result: ElectrodeModelResult;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
}

/**
 * 历史记录列表响应
 * History List Response
 */
export interface ElectrodeHistoryListResponse {
  /** 总记录数 */
  total: number;
  /** 历史记录列表（已解析） */
  data: ElectrodeHistoryItem[];
}

/**
 * 历史记录详情查询参数
 * History Detail Query Parameters
 */
export interface ElectrodeHistoryDetailParams {
  /** 记录 ID */
  id: number;
  /** 页面类型（必需）：1=正向预测, 2=反向设计 */
  type: ElectrodePageType;
}

/**
 * 历史记录详情响应（解析后）
 * History Detail Response (Parsed)
 */
export interface ElectrodeHistoryDetailResponse extends ElectrodeHistoryItem {}

// ============================================
// 删除历史记录类型
// ============================================

/**
 * 删除历史记录参数
 * Delete History Parameters
 */
export interface ElectrodeHistoryDeleteParams {
  /** 要删除的记录 ID */
  id: number;
}

/**
 * 删除历史记录响应
 * Delete History Response
 */
export interface ElectrodeHistoryDeleteResponse {
  /** 是否成功 */
  success: boolean;
}

// ============================================
// 性能预测类型
// ============================================

/**
 * 性能预测请求参数（发送给 API）
 * Model Predict Request Parameters (Sent to API)
 */
export interface ElectrodeModelPredictParams {
  /** Cell Design */
  cell_design: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料 */
  anode_active_material: string;
  /** 模型参数（JSON 字符串 - 序列化后的 ElectrodeModelParams） */
  model_params: string;
  /** 页面类型：1=正向预测, 2=反向设计 */
  type: ElectrodePageType;
}

/**
 * 性能预测响应（API 原始响应 - 包含 JSON 字符串）
 * Model Predict Response Raw (API Response with JSON String)
 */
export interface ElectrodeModelPredictResponseRaw {
  /** 预测结果 ID */
  id: number;
  /** 模型结果（JSON 字符串） */
  model_result: string;
}

/**
 * 性能预测响应（解析后）
 * Model Predict Response Parsed
 */
export interface ElectrodeModelPredictResponse {
  /** 预测结果 ID */
  id: number;
  /** 模型结果（解析后的对象） */
  model_result: ElectrodeModelResult;
}
