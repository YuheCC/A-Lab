import { useState, useMemo } from 'react';
import { ModelSelectOption, ColumnConfig } from '../types';

/**
 * 搜索功能 Hook
 * @param options 选项列表
 * @param columns 列配置
 * @param filter 过滤函数
 * @param hasRequest 是否配置了 request（决定是服务端搜索还是客户端搜索）
 */
export const useSearch = (
  options: ModelSelectOption[],
  columns: ColumnConfig[],
  filter?: boolean | ((input: string, option: ModelSelectOption) => boolean),
  hasRequest?: boolean
) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredOptions = useMemo(() => {
    // 如果有 request，不进行客户端过滤（由服务端返回过滤后的数据）
    if (hasRequest) {
      return options;
    }

    // 客户端搜索
    if (!searchValue.trim()) return options;

    // 自定义过滤函数
    if (typeof filter === 'function') {
      return options.filter((opt) => filter(searchValue, opt));
    }

    // 默认过滤：搜索所有可见列
    if (filter !== false) {
      return options.filter((option) => {
        return columns.some((col) => {
          const value = option[col.key];
          return String(value || '')
            .toLowerCase()
            .includes(searchValue.toLowerCase());
        });
      });
    }

    return options;
  }, [options, searchValue, columns, filter, hasRequest]);

  return { searchValue, setSearchValue, filteredOptions };
};
