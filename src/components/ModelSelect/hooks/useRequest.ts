import { useState, useEffect } from 'react';
import { ModelSelectOption, ModelSelectGroup } from '../types';
import { useDebounce } from './useDebounce';

/**
 * 异步数据加载 Hook
 * @param request 异步加载函数
 * @param staticOptions 静态选项数据
 * @param staticGroups 静态分组数据
 * @param searchValue 搜索值
 */
export const useRequest = (
  request?: (searchValue?: string) => Promise<ModelSelectOption[] | ModelSelectGroup[]>,
  staticOptions?: ModelSelectOption[],
  staticGroups?: ModelSelectGroup[],
  searchValue?: string
) => {
  const [data, setData] = useState<{
    options: ModelSelectOption[];
    groups?: ModelSelectGroup[];
  }>({
    options: staticOptions || [],
    groups: staticGroups,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 防抖搜索
  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    if (!request) {
      setData({
        options: staticOptions || [],
        groups: staticGroups,
      });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await request(debouncedSearchValue);

        // 判断返回的是分组数据还是普通数据
        if (Array.isArray(result) && result.length > 0) {
          if ('label' in result[0] && 'options' in result[0]) {
            // 分组数据
            setData({ options: [], groups: result as ModelSelectGroup[] });
          } else {
            // 普通数据
            setData({ options: result as ModelSelectOption[], groups: undefined });
          }
        } else {
          setData({ options: [], groups: undefined });
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request, staticOptions, staticGroups, debouncedSearchValue]);

  return { data, loading, error };
};
