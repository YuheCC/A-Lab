import { useMemo } from 'react';
import {
  ModelSelectOption,
  ModelSelectGroup,
  GroupByLabelMapping,
} from '../types';

export const useGrouping = (
  options: ModelSelectOption[],
  groupBy?: string,
  groupByLabel?: GroupByLabelMapping,
  ungroupedLabel: string = '未分组'
): ModelSelectGroup[] | undefined => {
  return useMemo(() => {
    // 如果没有指定 groupBy，不进行分组
    if (!groupBy || options.length === 0) {
      return undefined;
    }

    // 按照 groupBy 字段进行分组
    const groupMap = new Map<string | undefined, ModelSelectOption[]>();

    options.forEach((option) => {
      const groupValue = option[groupBy];
      const key = groupValue ?? undefined; // null 和 undefined 统一为 undefined

      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(option);
    });

    // 转换为 ModelSelectGroup[] 格式
    const groups: ModelSelectGroup[] = [];

    // 先处理有值的分组
    Array.from(groupMap.entries())
      .filter(([key]) => key !== undefined)
      .forEach(([key, options]) => {
        let label: string;

        if (groupByLabel) {
          if (typeof groupByLabel === 'function') {
            // 函数映射
            label = groupByLabel(key as string);
          } else {
            // 对象映射
            label = groupByLabel[key as string] || (key as string);
          }
        } else {
          // 默认使用字段值作为标题
          label = String(key);
        }

        groups.push({
          label,
          options,
        });
      });

    // 最后处理未分组项（如果存在）
    const ungroupedOptions = groupMap.get(undefined);
    if (ungroupedOptions && ungroupedOptions.length > 0) {
      groups.push({
        label: ungroupedLabel,
        options: ungroupedOptions,
      });
    }

    return groups.length > 0 ? groups : undefined;
  }, [options, groupBy, groupByLabel, ungroupedLabel]);
};
