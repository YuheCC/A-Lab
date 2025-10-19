import type { TFunction } from 'i18next';
import type { QueryLimitInfo } from '@/types/queryLimit';

export const normalizeLimitInfo = (info: any): QueryLimitInfo | undefined => {
  if (!info && info !== 0) {
    return undefined;
  }

  const limitValue =
    typeof info?.limit === 'number'
      ? info.limit
      : info?.limit === null
      ? null
      : undefined;

  const remainingValue =
    typeof info?.remaining === 'number'
      ? info.remaining
      : info?.remaining === 0
      ? 0
      : undefined;

  const usedValue =
    typeof info?.used === 'number'
      ? info.used
      : info?.used === 0
      ? 0
      : undefined;

  if (limitValue === undefined && remainingValue === undefined && usedValue === undefined) {
    return undefined;
  }

  return {
    limit: limitValue ?? null,
    remaining: remainingValue ?? null,
    used: usedValue ?? null,
  };
};

export const getRemainingFromLimitInfo = (info?: QueryLimitInfo): number | undefined => {
  if (!info) {
    return undefined;
  }

  if (typeof info.remaining === 'number') {
    return info.remaining;
  }

  if (typeof info.limit === 'number' && typeof info.used === 'number') {
    return Math.max(info.limit - info.used, 0);
  }

  return undefined;
};

export const formatQueryLimitLabel = (
  info: QueryLimitInfo | undefined,
  t: TFunction,
  translationKey: string,
): string | undefined => {
  if (!info) {
    return undefined;
  }

  const limitValue = typeof info.limit === 'number' ? info.limit : null;
  if (limitValue !== null && limitValue > 0) {
    const remainingValue = getRemainingFromLimitInfo(info);
    if (typeof remainingValue === 'number') {
      return t(translationKey, { remaining: remainingValue, limit: limitValue });
    }
  }

  return undefined;
};
