export type AdditiveCategoryType = 'mechanistic' | 'outcome';

export interface AdditiveOptionConfig {
  value: string;
  /**
   * Translation key suffix appended to the caller's base path, e.g.
   * `${base}.${labelKey}` → `search.moleculeTypes.additiveCategories.mechanisticOptions.seiStabilizer`.
   */
  labelKey: string;
}

export type AdditiveOptionsByCategory = Record<AdditiveCategoryType, AdditiveOptionConfig[]>;

export const ADDITIVE_CATEGORY_LABEL_KEYS: Record<AdditiveCategoryType, string> = {
  mechanistic: 'mechanistic',
  outcome: 'outcome',
};

export const ADDITIVE_OPTIONS_BY_CATEGORY: AdditiveOptionsByCategory = {
  mechanistic: [
    { value: 'A', labelKey: 'mechanisticOptions.seiStabilizer' },
    { value: 'B', labelKey: 'mechanisticOptions.ceiStabilizer' },
    { value: 'C1', labelKey: 'mechanisticOptions.hfNeutralizer' },
    { value: 'C3', labelKey: 'mechanisticOptions.tmDissolutionSuppressor' },
    { value: 'E1', labelKey: 'mechanisticOptions.desolvationOptimizer' },
    { value: 'E2', labelKey: 'mechanisticOptions.dendriteSuppressor' },
    { value: 'E3', labelKey: 'mechanisticOptions.polysulfideSuppressor' },
    { value: 'G2', labelKey: 'mechanisticOptions.gasSuppressor' },
    { value: 'G3', labelKey: 'mechanisticOptions.flameRetardant' },
  ],
  outcome: [
    { value: 'Fast charging', labelKey: 'outcomeOptions.fastCharging' },
    { value: 'High voltage', labelKey: 'outcomeOptions.highVoltage' },
    { value: 'HT cycling', labelKey: 'outcomeOptions.htCycling' },
    { value: 'HT storage', labelKey: 'outcomeOptions.htStorage' },
    { value: 'LT cycling', labelKey: 'outcomeOptions.ltCycling' },
    { value: 'RT cycling', labelKey: 'outcomeOptions.rtCycling' },
  ],
};

export const ANION_ADDITIVE_OPTIONS_BY_CATEGORY: AdditiveOptionsByCategory = {
  mechanistic: [
    { value: 'A', labelKey: 'mechanisticOptions.seiStabilizer' },
    { value: 'B', labelKey: 'mechanisticOptions.ceiStabilizer' },
    { value: 'C3', labelKey: 'mechanisticOptions.tmDissolutionSuppressor' },
    { value: 'E1', labelKey: 'mechanisticOptions.desolvationOptimizer' },
    { value: 'E2', labelKey: 'mechanisticOptions.dendriteSuppressor' },
  ],
  outcome: [
    { value: 'Fast charging', labelKey: 'outcomeOptions.fastCharging' },
    { value: 'High voltage', labelKey: 'outcomeOptions.highVoltage' },
    { value: 'HT cycling', labelKey: 'outcomeOptions.htCycling' },
    { value: 'LT cycling', labelKey: 'outcomeOptions.ltCycling' },
    { value: 'RT cycling', labelKey: 'outcomeOptions.rtCycling' },
  ],
};

export const DEFAULT_ADDITIVE_CATEGORY: AdditiveCategoryType = 'mechanistic';

export const DEFAULT_ADDITIVE_SUBTYPE: Record<AdditiveCategoryType, string> = {
  mechanistic: 'A',
  outcome: 'Fast charging',
};

export const isValidAdditiveSubtype = (
  category: AdditiveCategoryType,
  subtype: string,
  optionsByCategory: AdditiveOptionsByCategory = ADDITIVE_OPTIONS_BY_CATEGORY,
): boolean => optionsByCategory[category]?.some((option) => option.value === subtype) ?? false;

export const getDefaultSubtypeForCategory = (
  category: AdditiveCategoryType,
  defaults: Record<AdditiveCategoryType, string> = DEFAULT_ADDITIVE_SUBTYPE,
): string => defaults[category];
