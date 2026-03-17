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

// --------------------------------------------
// 后端 API DTO 定义（Backend API DTOs）
// --------------------------------------------

/**
 * 电极模型输入参数 - 后端 API 定义
 * Electrode Model Input Parameters - Backend API Definition
 *
 * 通过参数名前缀区分阴阳极参数：
 * - anode*: 阳极参数
 * - cathode*: 阴极参数
 * - width/length/layers: 尺寸参数
 */
export interface ElectrodeModelParamsDTO {
  // ========== 阳极参数 (Anode Parameters) ==========
  /** CMC (wt.%) */
  anode_binder1_wt: number;
  /** SBR (wt.%) */
  anode_binder2_wt: number;
  /** PAA (wt.%) */
  anode_binder3_wt: number;
  /** Super P (wt.%) */
  anode_conductive_carbon_wt: number;
  /** SWCNT (wt.%) */
  anode_cnt_wt: number;
  /** Press Density (g/cc) */
  anode_press_density: number;
  /** Active material-1 SC-B-I (%) */
  anodeSCBI: number;
  /** Active material-2 Gr-S-I (%) */
  anodeGrSI: number;
  /** Areal Loading (mAh/cm²) */
  anode_areal_loading: number;

  // ========== 阴极参数 (Cathode Parameters) ==========
  /** KF-9700 (wt.%) */
  cathode_binder_wt: number;
  /** CN-01Y (wt.%) */
  cathode_cnt_wt: number;
  /** Super C65 (wt.%) */
  cathode_conductive_carbon_wt: number;
  /** Areal Loading (mAh/cm²) */
  cathode_areal_loading: number;
  /** Press Density (g/cc) */
  cathode_press_density: number;
  /** Active material NCM-A (%) */
  cathode_NCMA: number;

  // ========== 尺寸参数 (Dimension Parameters) ==========
  /** Width (mm) */
  width: number;
  /** Length (mm) */
  length: number;
  /** Layers */
  layers: number;

  // ========== 设计参数 (Design Parameters) ==========
  /** NP Ratio */
  np_ratio?: number;
  /** Si 含量比例（= 100 - graphite%） */
  si_ratio?: number;
}

/**
 * 电极模型预测结果 - 后端 API 定义
 * Electrode Model Prediction Result - Backend API Definition
 */
export interface ElectrodeModelResultDTO {
  /** Design Capacity (Ah) */
  design_capacity: number;
  /** Specific Energy Density (Wh/kg) */
  specific_ED: number;
  /** Jelly Roll Thickness (mm) */
  jelly_roll_thickness: number;
  /** Volumetric Energy Density (Wh/L) */
  volumetric_ED: number;
  /** Capacity at 1C rate (%) */
  Cap_1C?: number;
  /** Capacity at 2C rate (%) */
  Cap_2C?: number;
  /** Capacity at 3C rate (%) */
  Cap_3C?: number;
  /** Capacity at 4C rate (%) */
  Cap_4C?: number;
  /** Capacity at 5C rate (%) */
  Cap_5C?: number;
  /** Temperature at 1C rate */
  T_1C?: number;
  /** Temperature at 2C rate */
  T_2C?: number;
  /** Temperature at 3C rate */
  T_3C?: number;
  /** Temperature at 4C rate */
  T_4C?: number;
  /** Temperature at 5C rate */
  T_5C?: number;
}

// --------------------------------------------
// 前端业务模型定义（Frontend Business Models）
// --------------------------------------------

/**
 * 电极模型输入参数 - 前端业务模型
 * Electrode Model Input Parameters - Frontend Business Model
 *
 * 使用驼峰命名，便于前端业务逻辑使用
 */
export interface ElectrodeModelParams {
  // ========== 阳极参数 (Anode Parameters) ==========
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

  // ========== 阴极参数 (Cathode Parameters) ==========
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

  // ========== 设计参数 (Design Parameters) ==========
  /** NP Ratio */
  npRatio?: number;
  /** Si 含量比例（= 100 - graphite%） */
  siRatio?: number;
}

/**
 * 电极模型预测结果 - 前端业务模型
 * Electrode Model Prediction Result - Frontend Business Model
 *
 * 使用驼峰命名，便于前端业务逻辑使用
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
  /** Capacity at 1C rate (%) */
  cap1C?: number;
  /** Capacity at 2C rate (%) */
  cap2C?: number;
  /** Capacity at 3C rate (%) */
  cap3C?: number;
  /** Capacity at 4C rate (%) */
  cap4C?: number;
  /** Capacity at 5C rate (%) */
  cap5C?: number;
  /** Temperature at 1C rate */
  t1C?: number;
  /** Temperature at 2C rate */
  t2C?: number;
  /** Temperature at 3C rate */
  t3C?: number;
  /** Temperature at 4C rate */
  t4C?: number;
  /** Temperature at 5C rate */
  t5C?: number;
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
 * 历史记录项（API 直接响应）- type=1 正向预测
 * History Item (Direct API Response) - type=1 Result Prediction
 */
export interface ElectrodeHistoryItem {
  /** 记录 ID */
  id: number;
  /** Cell Design */
  cell_design: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料（老版本字段） */
  anode_active_material: string;
  /** 模型参数（对象，包含 npRatio / siRatio） */
  model_params: ElectrodeModelParams;
  /** 模型结果（对象） */
  model_result: ElectrodeModelResult;
  /** 页面类型：1=正向预测, 2=反向设计 */
  type?: ElectrodePageType;
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
 * 历史记录详情响应
 * History Detail Response
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
  /** 负极活性材料（老版本兼容，Optimize 页面使用） */
  anode_active_material?: string;
  /** 模型参数（对象，包含 np_ratio / si_ratio） */
  model_params: ElectrodeModelParams;
  /** 页面类型：1=正向预测, 2=反向设计 */
  type: ElectrodePageType;
}

/**
 * 性能预测响应（API 直接响应）
 * Model Predict Response (Direct API Response)
 */
export interface ElectrodeModelPredictResponse {
  /** 预测结果 ID */
  id: number;
  /** 模型结果（对象） */
  model_result: ElectrodeModelResult;
}

// ============================================
// 反向设计优化类型（Optimize / Inverse Design）
// ============================================

/**
 * Optimize 模型参数（min/max 平铺模式） - 后端 DTO
 * Optimize Model Parameters (Min/Max Flat Mode) - Backend DTO
 *
 * 用于反向设计（type=2）时的输入参数
 */
export interface OptimizeModelParamsDTO {
  /** Cathode Width (mm) */
  cathode_width: number;
  /** Cathode Length (mm) */
  cathode_length: number;
  /** Jelly Roll Thickness min (mm) */
  jrt_min: number;
  /** Jelly Roll Thickness max (mm) */
  jrt_max: number;
  /** Volumetric Energy Density min (Wh/L) */
  ved_min: number;
  /** Volumetric Energy Density max (Wh/L) */
  ved_max: number;
  /** Design Capacity min (Ah) - 选填 */
  dc_min?: number;
  /** Design Capacity max (Ah) - 选填 */
  dc_max?: number;
  /** Specific Energy Density min (Wh/kg) - 选填 */
  sed_min?: number;
  /** Specific Energy Density max (Wh/kg) - 选填 */
  sed_max?: number;
}

/**
 * 电极反向设计优化请求参数
 * Electrode Optimize Request Parameters
 *
 * 用于 type=2（INVERSE_DESIGN）场景
 */
export interface ElectrodeOptimizeParams {
  /** Cell Design */
  cell_design: string;
  /** NP Ratio */
  np_ratio: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料 */
  anode_active_material: string;
  /** 页面类型：2=反向设计 */
  type: ElectrodePageType;
  /** 模型参数（区间模式） */
  model_params: OptimizeModelParamsDTO;
}

/**
 * Optimize 结果项 - 后端 DTO
 * Optimize Result Item - Backend DTO
 *
 * 反向设计返回的单条推荐结果
 */
export interface OptimizeResultItemDTO {
  // ========== 阴极参数 (Cathode Parameters) ==========
  /** KF-9700 (wt.%) */
  cathode_binder_wt: number;
  /** CN-01Y (wt.%) */
  cathode_cnt_wt: number;
  /** Super C65 (wt.%) */
  cathode_conductive_carbon_wt: number;
  /** Areal Loading (mAh/cm²) */
  cathode_areal_loading: number;
  /** Press Density (g/cc) */
  cathode_press_density: number;

  // ========== 阳极参数 (Anode Parameters) ==========
  /** CMC (wt.%) */
  anode_binder1_wt: number;
  /** SBR (wt.%) */
  anode_binder2_wt: number;
  /** PAA (wt.%) */
  anode_binder3_wt: number;
  /** Super P (wt.%) */
  anode_conductive_carbon_wt: number;
  /** SWCNT (wt.%) */
  anode_cnt_wt: number;
  /** Press Density (g/cc) */
  anode_press_density: number;

  // ========== 尺寸参数 (Dimension Parameters) ==========
  /** Width (mm) */
  width: number;
  /** Length (mm) */
  length: number;
  /** Layers */
  layers: number;

  // ========== 结果参数 (Result Parameters) ==========
  /** Design Capacity (Ah) */
  design_capacity: number;
  /** Specific Energy Density (Wh/kg) */
  specific_ED: number;
  /** Jelly Roll Thickness (mm) */
  jelly_roll_thickness: number;
  /** Volumetric Energy Density (Wh/L) */
  volumetric_ED: number;
}

/**
 * Optimize 分组结果 - 后端返回的 valid/invalid 分组结构
 * Optimize Grouped Result - Backend valid/invalid grouped structure
 */
export interface OptimizeGroupedResultDTO {
  /** 符合目标范围的推荐结果 */
  valid: OptimizeResultItemDTO[];
  /** 存在偏差的推荐结果 */
  invalid: OptimizeResultItemDTO[];
}

/**
 * 反向设计模型结果统计 - 后端 DTO
 * Optimize Model Result Stats - Backend DTO
 *
 * detail 接口返回的 model_result 字段，为生成统计信息
 * 实际推荐结果通过 getBackwardResultList 单独获取
 */
export interface OptimizeModelResultStatsDTO {
  /** 总共生成的候选数量 */
  total_generated: number;
  /** 经过范围过滤后的数量 */
  after_range_filter: number;
  /** 经过验证后的数量 */
  after_validation: number;
  /** 最终返回的推荐数量 */
  count: number;
}

/**
 * Optimize API 响应 - 后端 DTO
 * Optimize API Response - Backend DTO
 *
 * 反向设计 API 返回的完整响应结构（仅含 id，实际结果通过 getBackwardResultList 获取）
 */
export interface ElectrodeOptimizeResponseDTO {
  /** 记录 ID */
  id: number;
  /** Cell Design */
  cell_design: string;
  /** NP Ratio */
  np_ratio: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料 */
  anode_active_material: string;
  /** 页面类型：2=反向设计 */
  type: number;
  /** 模型参数 */
  model_params: OptimizeModelParamsDTO;
  /** 模型结果统计（非推荐列表） */
  model_result: OptimizeModelResultStatsDTO;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
  /** 用户 ID */
  user_id?: number;
}

/**
 * Optimize 历史记录项 - type=2 反向设计
 * Optimize History Item - type=2 Inverse Design
 */
export interface OptimizeHistoryItem {
  /** 记录 ID */
  id: number;
  /** Cell Design */
  cell_design: string;
  /** NP Ratio */
  np_ratio?: string;
  /** 正极活性材料 */
  cathode_active_material: string;
  /** 负极活性材料 */
  anode_active_material: string;
  /** 页面类型：2=反向设计 */
  type: ElectrodePageType;
  /** 模型参数（新格式：cathode_width/length、jrt/ved/sed/dc min/max） */
  model_params: OptimizeModelParamsDTO;
  /** 模型结果统计（非推荐列表，推荐列表通过 getBackwardResultList 获取） */
  model_result: OptimizeModelResultStatsDTO;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
  /** 用户 ID */
  user_id?: number;
}

// ============================================
// 反向设计结果列表类型（新接口）
// ============================================

/**
 * 反向设计结果列表请求参数
 * Backward Result List Request Parameters
 */
export interface BackwardResultListParams {
  /** 历史记录 ID */
  history_id: number;
}

/**
 * 反向设计结果列表单条记录 - 后端 DTO
 * Backward Result List Item - Backend DTO
 *
 * 接口返回平铺数组，每条包含完整的电极参数、结果参数及倍率性能数据
 */
export interface BackwardResultItemDTO {
  /** 记录 ID */
  id: number;
  /** 条目序号（1-based） */
  item_id: number;

  // ========== 结果参数 (Result Parameters) ==========
  /** Design Capacity (Ah) */
  design_capacity: number;
  /** Specific Energy Density (Wh/kg) */
  specific_ED: number;
  /** Jelly Roll Thickness (mm) */
  jelly_roll_thickness: number;
  /** Volumetric Energy Density (Wh/L) */
  volumetric_ED: number;

  // ========== 倍率性能 (Rate Capability) ==========
  Cap_1C?: number;
  Cap_2C?: number;
  Cap_3C?: number;
  Cap_4C?: number;
  Cap_5C?: number;
  T_1C?: number;
  T_2C?: number;
  T_3C?: number;
  T_4C?: number;
  T_5C?: number;

  // ========== 阴极参数 (Cathode Parameters) ==========
  /** KF-9700 / PVDF (wt.%) */
  cathode_binder_wt: number;
  /** CN-01Y / CNT (wt.%) */
  cathode_cnt_wt: number;
  /** Super C65 / Carbon black (wt.%) */
  cathode_conductive_carbon_wt: number;
  /** Areal Loading (mAh/cm²) */
  cathode_areal_loading: number;
  /** Press Density (g/cc) */
  cathode_press_density: number;

  // ========== 阳极参数 (Anode Parameters) ==========
  /** CMC (wt.%) */
  anode_binder1_wt: number;
  /** SBR (wt.%) */
  anode_binder2_wt: number;
  /** PAA (wt.%) */
  anode_binder3_wt: number;
  /** Super P / Carbon black (wt.%) */
  anode_conductive_carbon_wt: number;
  /** SWCNT / CNT (wt.%) */
  anode_cnt_wt: number;
  /** Press Density (g/cc) */
  anode_press_density: number;

  // ========== 其他参数 ==========
  /** Layers */
  layers: number;
  /** NP Ratio */
  np_ratio: number;
  /** Si Ratio (%) */
  si_ratio: number;
}

/**
 * 反向设计结果列表响应 - 后端 DTO
 * Backward Result List Response - Backend DTO
 *
 * 接口返回平铺数组，valid/invalid 分组由前端根据目标范围计算
 */
export type BackwardResultListResponseDTO = BackwardResultItemDTO[];

/**
 * 通用历史记录详情响应（联合类型）
 * Universal History Detail Response (Union Type)
 *
 * 根据 type 字段区分数据结构：
 * - type=1: ElectrodeHistoryItem
 * - type=2: OptimizeHistoryItem
 */
export type UniversalHistoryDetailResponse = ElectrodeHistoryItem | OptimizeHistoryItem;

/**
 * 类型守卫：判断是否为 Optimize 历史记录
 * Type Guard: Check if it's an Optimize History Item
 */
export function isOptimizeHistoryItem(
  item: UniversalHistoryDetailResponse,
): item is OptimizeHistoryItem {
  return item.type === ElectrodePageType.INVERSE_DESIGN;
}

