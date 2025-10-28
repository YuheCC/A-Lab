import { DEFAULT_ADDITIVE_CATEGORY, DEFAULT_ADDITIVE_SUBTYPE } from './additiveCategories';

export const PUBLIC_SEARCH_LOCKED_VALUES = {
  organicInput: "EC, DTD, DMC",
  anionInput: "LiBF4, LiFSI",
  sse: {
    activeTab: "formula" as const,
    formulaInput: "Li6PS5Cl",
  },
  findFriends: {
    moleculeType: "additive",
    additiveCategory: DEFAULT_ADDITIVE_CATEGORY,
    additiveSubtype: DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY],
    computeLevel: "Disabled",
  },
} as const;

export const PUBLIC_CHAT_LOCKED_STATE = {
  allowInput: false,
} as const;

export const PUBLIC_CHAT_MODEL_DEFAULTS: Record<number, 'lightning' | 'ask' | 'deep-space'> = {
  1: 'lightning',
  2: 'lightning',
  3: 'ask',
  4: 'deep-space',
} as const;
