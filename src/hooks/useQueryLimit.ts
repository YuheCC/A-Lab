import { useCallback, useEffect, useState } from 'react';
import { authFetch, getAPIUrl } from '@/utils';
import type { QueryLimitsSummary, QueryLimitInfo } from '@/types/queryLimit';
import { normalizeLimitInfo } from '@/utils/queryLimit';

interface UseQueryLimitResult {
  limits: QueryLimitsSummary;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const extractDeepSpaceInfo = (data: any): QueryLimitInfo | undefined => {
  const possibleContainers = [data?.deep_space_limits, data?.ds_limits, data?.deep_space_limit];
  let deepLimit: number | null | undefined;
  let deepRemaining: number | null | undefined;

  for (const container of possibleContainers) {
    if (deepLimit === undefined && container && typeof container?.limit === 'number') {
      deepLimit = container.limit;
    } else if (deepLimit === undefined && container && container?.limit === null) {
      deepLimit = null;
    }
    if (deepRemaining === undefined && container && typeof container?.remaining === 'number') {
      deepRemaining = container.remaining;
    }
  }

  if (deepRemaining === undefined && typeof data?.ds_limit === 'number') {
    deepRemaining = data.ds_limit;
  } else if (deepRemaining === undefined && data?.ds_limit === null) {
    deepRemaining = null;
  }

  if (deepLimit === undefined && typeof data?.ds_limit_total === 'number') {
    deepLimit = data.ds_limit_total;
  }

  if (deepLimit === undefined && deepRemaining === undefined) {
    return undefined;
  }

  return {
    limit: deepLimit ?? null,
    remaining: deepRemaining ?? null,
  };
};

export const useQueryLimit = (): UseQueryLimitResult => {
  const [limits, setLimits] = useState<QueryLimitsSummary>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLimits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = getAPIUrl();
      const response = await authFetch(`${API_URL}/query_limit`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch query limit');
      }

      const data = await response.json();
      const lightning = normalizeLimitInfo(data?.ask_limits?.low);
      const pro = normalizeLimitInfo(data?.ask_limits?.high);
      const deepSpace = extractDeepSpaceInfo(data);
      const findFriendLLM = normalizeLimitInfo(data?.find_friend_llm);

      setLimits({ lightning, pro, deepSpace, findFriendLLM });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch query limit'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  return {
    limits,
    loading,
    error,
    refresh: fetchLimits,
  };
};
