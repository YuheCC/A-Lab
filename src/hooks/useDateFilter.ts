/**
 * 日期筛选 Hook
 * 用于处理日期选择器的状态管理和 UTC 时间转换
 *
 * @example
 * // 基本用法
 * const {
 *   selectedDate,
 *   datePickerValue,
 *   handleDateChange,
 *   getUTCDateRange,
 *   getDayjsLocale,
 *   resetDate,
 * } = useDateFilter();
 *
 * // 在 DatePicker 中使用
 * <DatePicker
 *   value={datePickerValue}
 *   onChange={handleDateChange}
 * />
 *
 * // 获取 API 查询参数
 * const createdAtParam = getUTCDateRange();
 * // 返回格式: "2024-01-01 00:00:00,2024-01-01 23:59:59" 或 ""
 */

import { useState, useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

// 扩展 dayjs 以支持 UTC
dayjs.extend(utc);

export interface UseDateFilterOptions {
  /** 初始日期值，格式 'YYYY-MM-DD' */
  initialDate?: string;
  /** UTC 时间格式，默认 'YYYY-MM-DD HH:mm:ss' */
  utcFormat?: string;
  /** 日期格式，默认 'YYYY-MM-DD' */
  dateFormat?: string;
  /** 是否转换为 UTC 时间，默认 true */
  useUTC?: boolean;
  /** 本地时间格式（当 useUTC 为 false 时使用），默认 'YYYY-MM-DDTHH:mm:ss' */
  localFormat?: string;
}

export interface UseDateFilterReturn {
  /** 当前选中的日期字符串，格式 'YYYY-MM-DD'，空时为 '' */
  selectedDate: string;
  /** 设置日期字符串 */
  setSelectedDate: (date: string) => void;
  /** DatePicker 组件的 value 值（dayjs 对象或 null） */
  datePickerValue: Dayjs | null;
  /** DatePicker 的 onChange 处理函数 */
  handleDateChange: (date: Dayjs | null) => void;
  /**
   * 获取 UTC 时间范围字符串（用于 API 查询）
   * 将本地日期的 00:00:00 和 23:59:59 转换为 UTC 时间
   * @returns 格式: "UTC开始时间,UTC结束时间"，如 "2024-01-01 16:00:00,2024-01-02 15:59:59"
   *          如果未选择日期则返回 ''
   */
  getUTCDateRange: () => string;
  /**
   * 获取 dayjs 的 locale 配置
   * 根据 localStorage 中的 language 设置返回对应的 locale
   * @returns 'zh-cn' | 'en'
   */
  getDayjsLocale: () => string;
  /** 重置日期为空 */
  resetDate: () => void;
  /** 判断是否有选中的日期 */
  hasDate: boolean;
}

/**
 * 日期筛选 Hook
 * 提供日期选择器的状态管理、UTC 时间转换等功能
 */
export const useDateFilter = (
  options: UseDateFilterOptions = {}
): UseDateFilterReturn => {
  const {
    initialDate = '',
    utcFormat = 'YYYY-MM-DD HH:mm:ss',
    dateFormat = 'YYYY-MM-DD',
    useUTC = true,
    localFormat = 'YYYY-MM-DDTHH:mm:ss',
  } = options;

  // 日期状态（字符串格式）
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);

  // DatePicker 组件的 value 值
  const datePickerValue = useMemo(() => {
    return selectedDate ? dayjs(selectedDate) : null;
  }, [selectedDate]);

  // 是否有选中日期
  const hasDate = useMemo(() => !!selectedDate, [selectedDate]);

  // DatePicker onChange 处理
  const handleDateChange = useCallback(
    (date: Dayjs | null) => {
      setSelectedDate(date ? date.format(dateFormat) : '');
    },
    [dateFormat]
  );

  // 获取日期时间范围（用于 API 查询）
  const getUTCDateRange = useCallback(() => {
    if (!selectedDate) {
      return '';
    }

    const date = dayjs(selectedDate);
    // 获取当天的开始时间（00:00:00）和结束时间（23:59:59）
    const startOfDay = date.startOf('day');
    const endOfDay = date.endOf('day');

    if (useUTC) {
      // 转换为 UTC 时间
      const startUTC = startOfDay.utc().format(utcFormat);
      const endUTC = endOfDay.utc().format(utcFormat);
      return `${startUTC},${endUTC}`;
    } else {
      // 使用本地时间格式
      const startLocal = startOfDay.format(localFormat);
      const endLocal = endOfDay.format(localFormat);
      return `${startLocal},${endLocal}`;
    }
  }, [selectedDate, utcFormat, localFormat, useUTC]);

  // 获取 dayjs locale
  const getDayjsLocale = useCallback(() => {
    const lang = localStorage.getItem('language') || 'zh';
    return lang === 'zh' ? 'zh-cn' : 'en';
  }, []);

  // 重置日期
  const resetDate = useCallback(() => {
    setSelectedDate('');
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    datePickerValue,
    handleDateChange,
    getUTCDateRange,
    getDayjsLocale,
    resetDate,
    hasDate,
  };
};

export default useDateFilter;
