/**
 * 日期时间工具函数
 * 处理 UTC 时间的格式化显示
 */

import { normalizeServerDate } from './messageUtils';

/**
 * 格式化选项接口
 */
export interface FormatDateTimeOptions {
  /** 是否显示秒，默认 false */
  showSeconds?: boolean;
  /** 区域设置，默认 'zh-CN' */
  locale?: string;
}

/**
 * 格式化 UTC 时间为本地时间显示
 * 将服务端返回的 UTC 时间字符串转换为用户友好的本地时间格式
 *
 * @param input - 时间输入，支持字符串、Date 对象、null 或 undefined
 * @param options - 格式化选项
 * @returns 格式化后的时间字符串，如果输入为空则返回空字符串
 *
 * @example
 * // 基本用法
 * formatUTCDateTime('2024-12-08T10:30:00Z') // '2024/12/08 18:30'
 *
 * // 显示秒
 * formatUTCDateTime('2024-12-08T10:30:00Z', { showSeconds: true }) // '2024/12/08 18:30:00'
 *
 * // 空值处理
 * formatUTCDateTime(null) // ''
 * formatUTCDateTime(undefined) // ''
 * formatUTCDateTime('') // ''
 */
export const formatUTCDateTime = (
  input?: string | Date | null,
  options: FormatDateTimeOptions = {}
): string => {
  // 空值检查
  if (!input || (typeof input === 'string' && input.trim() === '')) {
    return '';
  }

  const { showSeconds = false, locale = 'zh-CN' } = options;

  try {
    const date = normalizeServerDate(input);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '';
    }

    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
    };

    return date.toLocaleString(locale, formatOptions);
  } catch {
    return '';
  }
};

/**
 * 格式化 UTC 日期为本地日期显示（不含时间）
 *
 * @param input - 时间输入，支持字符串、Date 对象、null 或 undefined
 * @param locale - 区域设置，默认 'zh-CN'
 * @returns 格式化后的日期字符串，如果输入为空则返回空字符串
 *
 * @example
 * formatUTCDate('2024-12-08T10:30:00Z') // '2024/12/08'
 */
export const formatUTCDate = (
  input?: string | Date | null,
  locale: string = 'zh-CN'
): string => {
  // 空值检查
  if (!input || (typeof input === 'string' && input.trim() === '')) {
    return '';
  }

  try {
    const date = normalizeServerDate(input);

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '';
  }
};

/**
 * 检查时间值是否有效（非空且可解析）
 *
 * @param input - 时间输入
 * @returns 是否有效
 */
export const isValidDateTime = (input?: string | Date | null): boolean => {
  if (!input || (typeof input === 'string' && input.trim() === '')) {
    return false;
  }

  try {
    const date = normalizeServerDate(input);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};
