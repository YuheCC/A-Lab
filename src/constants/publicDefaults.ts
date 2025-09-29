export const PUBLIC_SEARCH_LOCKED_VALUES = {
  organicInput: "EC, DTD",
  anionInput: "LiBF4, LiFSI",
  sse: {
    activeTab: "formula" as const,
    formulaInput: "Na3.45Zr1.85(ZnMgSc)0.05Si2.2P0.8O12",
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
