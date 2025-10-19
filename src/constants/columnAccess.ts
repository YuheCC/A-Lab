const RAW_HIGH_TIER_PERMISSIONS = [
  'admin',
  'enterprise',
  'enterprise1',
  'enterprise2',
  'enterprise3',
  // 'joint',
] as const;

const RAW_LOW_TIER_BLOCKED_COLUMNS = [
  'predicted_MP_celsius',
  'predicted_BP_celsius',
  'predicted_FP_celsius',
  'combustion_enthalpy_ev',
  // 'fluoride_bde_ev',
] as const;

const COLUMN_ALIASES: Record<string, string> = {
  molwt: 'molecular_weight',
  molecularweight: 'molecular_weight',
  molecular_weight: 'molecular_weight',
  smiles: 'smiles',
  homo_ev: 'homo_ev',
  lumo_ev: 'lumo_ev',
  esp_min_ev: 'esp_min_ev',
  esp_max_ev: 'esp_max_ev',
  espmin_ev: 'esp_min_ev',
  espmax_ev: 'esp_max_ev',
  predicted_mp: 'predicted_mp_celsius',
  predicted_mp_celsius: 'predicted_mp_celsius',
  predicted_bp: 'predicted_bp_celsius',
  predicted_bp_celsius: 'predicted_bp_celsius',
  predicted_fp: 'predicted_fp_celsius',
  predicted_fp_celsius: 'predicted_fp_celsius',
  combustion_enthalpy: 'combustion_enthalpy_ev',
  combustion_enthalpy_ev: 'combustion_enthalpy_ev',
  combustionenthalpyev: 'combustion_enthalpy_ev',
  commercial_score: 'commercial_score',
  commercial_viability: 'commercial_score',
  commercialscore: 'commercial_score',
  commercial_link: 'commercial_link',
  commerciallink: 'commercial_link',
  functional_groups: 'functional_groups',
  functionalgroups: 'functional_groups',
  umap_0: 'umap_0',
  umap_x: 'umap_0',
  umap_1: 'umap_1',
  umap_y: 'umap_1',
  vdw_volume_angstroms3: 'vdw_volume_angstroms3',
  fluoride_bde_ev: 'fluoride_bde_ev',
};

const canonicalizePermission = (permission?: string | null) => (permission ?? '').trim().toLowerCase();

const canonicalizeColumnId = (columnId?: string | null): string | null => {
  if (columnId == null) {
    return null;
  }
  const trimmed = `${columnId}`.trim();
  if (!trimmed) {
    return null;
  }
  const lowered = trimmed.toLowerCase();
  const alias = COLUMN_ALIASES[lowered];
  return alias ?? lowered;
};

export const HIGH_TIER_PERMISSIONS = new Set<string>(
  RAW_HIGH_TIER_PERMISSIONS.map(canonicalizePermission)
);

export const LOW_TIER_BLOCKED_COLUMNS = new Set<string>(RAW_LOW_TIER_BLOCKED_COLUMNS);

const LOW_TIER_BLOCKED_COLUMNS_CANONICAL = new Set<string>(
  Array.from(LOW_TIER_BLOCKED_COLUMNS)
    .map(canonicalizeColumnId)
    .filter((value): value is string => value != null)
);

export const isColumnBlockedForLowTier = (columnId?: string | null): boolean => {
  const canonical = canonicalizeColumnId(columnId);
  if (!canonical) {
    return false;
  }
  return LOW_TIER_BLOCKED_COLUMNS_CANONICAL.has(canonical);
};

export const isHighTierUser = (permission?: string | null): boolean => {
  return HIGH_TIER_PERMISSIONS.has(canonicalizePermission(permission));
};

export const isLowTierUser = (permission?: string | null): boolean => {
  return !isHighTierUser(permission);
};

export const isColumnVisibleForUser = (columnId?: string | null, permission?: string | null): boolean => {
  if (!isColumnBlockedForLowTier(columnId)) {
    return true;
  }
  return isHighTierUser(permission);
};

