export const HIGH_TIER_PERMISSIONS = new Set(['admin', 'enterprise1', 'enterprise2', 'enterprise3', 'joint']);

export const LOW_TIER_BLOCKED_COLUMNS = new Set([
  'predicted_MP_celsius',
  'predicted_BP_celsius',
  'predicted_FP_celsius',
]);

const normalizePermission = (permission?: string | null) => (permission ?? '').toLowerCase();

export const isHighTierUser = (permission?: string | null): boolean => {
  return HIGH_TIER_PERMISSIONS.has(normalizePermission(permission));
};

export const isLowTierUser = (permission?: string | null): boolean => {
  return !isHighTierUser(permission);
};

export const isColumnVisibleForUser = (columnId: string, permission?: string | null): boolean => {
  if (!LOW_TIER_BLOCKED_COLUMNS.has(columnId)) {
    return true;
  }
  return isHighTierUser(permission);
};

