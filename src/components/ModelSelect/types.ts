import { ReactNode } from 'react';

// 选项数据结构
export interface ModelSelectOption {
  id: string | number;
  [key: string]: any; // 支持动态字段
}

// 分组数据结构
export interface ModelSelectGroup {
  label: string; // 分组标题
  options: ModelSelectOption[]; // 分组内的选项
}

// 列配置
export interface ColumnConfig {
  key: string; // 数据字段名
  title: string; // 列标题
  width?: string | number; // 列宽度
  render?: (value: any, record: ModelSelectOption) => ReactNode; // 自定义渲染
}

// 分组标题映射类型
export type GroupByLabelMapping =
  | Record<string, string> // 对象映射：{ 'base': 'Base Models', 'finetuned': 'Fine-tuned Models' }
  | ((value: string | undefined) => string); // 函数映射：(value) => value === 'base' ? 'Base Models' : value

// 组件 Props
export interface ModelSelectProps {
  // 基础配置
  mode?: 'single' | 'multiple'; // 单选/多选
  value?: string | string[]; // 当前值
  onChange?: (value: string | string[]) => void; // 值变化回调

  // 数据配置
  options?: ModelSelectOption[]; // 静态选项数据
  groups?: ModelSelectGroup[]; // 预定义分组数据（与 groupBy 二选一，优先级更高）
  request?: (searchValue?: string) => Promise<ModelSelectOption[] | ModelSelectGroup[]>; // 异步加载函数，支持搜索参数

  // 自动分组配置
  groupBy?: string; // 基于某个字段自动分组（如 'baseModel'）
  groupByLabel?: GroupByLabelMapping; // 分组标题映射（对象或函数）
  ungroupedLabel?: string; // 未分组项的标题，默认"未分组"

  // 列配置
  columns?: ColumnConfig[]; // 列配置
  defaultColumns?: string[]; // 默认显示的列

  // 搜索配置
  searchable?: boolean; // 是否支持搜索
  searchPlaceholder?: string; // 搜索占位符
  filter?: boolean | ((inputValue: string, option: ModelSelectOption) => boolean); // 客户端搜索过滤函数（仅在无 request 时生效）
  searchOnServer?: boolean; // 是否使用服务端搜索（有 request 时默认 true）

  // 分页配置
  pageSize?: number; // 每页显示数量，默认 20
  showMore?: boolean; // 是否显示"加载更多"按钮

  // UI 配置
  placeholder?: string; // 占位符
  disabled?: boolean; // 禁用状态
  loading?: boolean; // 加载状态
  className?: string; // 自定义类名
  maxHeight?: number; // 下拉框最大高度

  // 字段映射
  fieldNames?: {
    label?: string; // 显示字段（默认 'name'）
    value?: string; // 值字段（默认 'id'）
  };
}
