export interface QueryLimitInfo {
  limit?: number | null;
  remaining?: number | null;
  used?: number | null;
}

export interface QueryLimitsSummary {
  lightning?: QueryLimitInfo;
  pro?: QueryLimitInfo;
  deepSpace?: QueryLimitInfo;
  findFriendLLM?: QueryLimitInfo;
}
