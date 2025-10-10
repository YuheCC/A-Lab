export const PUBLIC_SEARCH_LOCKED_VALUES = {
  organicInput: "EC, DTD",
  anionInput: "LiBF4, LiFSI",
  sse: {
    activeTab: "formula" as const,
    formulaInput: "Li31784La14883Mg31Zr9977Al74Ga967O60000",
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
