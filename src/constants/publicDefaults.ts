export const PUBLIC_SEARCH_LOCKED_VALUES = {
  organicInput: "EC, DTD, DMC",
  anionInput: "LiBF4, LiFSI",
  sse: {
    activeTab: "formula" as const,
    formulaInput: "Li11P2(S3Cl)3",
  },
  findFriends: {
    moleculeType: "additive",
    additiveSubtype: "A",
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
