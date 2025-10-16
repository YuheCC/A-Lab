export const PUBLIC_SEARCH_LOCKED_VALUES = {
  organicInput: "EC, DTD, DMC",
  anionInput: "LiBF4, LiFSI",
  sse: {
    activeTab: "formula" as const,
    formulaInput: "Li6PS5Cl",
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
