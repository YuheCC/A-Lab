export default {
  nodePopup: {
    title: "Molecule Details",
    smiles: "SMILES",
    casrn: "CAS #",
    umapCoordinates: "UMAP Coordinates",
    properties: "Properties",
    copyAllData: "Copy All Data",
    addToFavorites: "Add to Favorites",
    saving: "Saving...",
    copySuccess: "Molecule information copied to clipboard!",
    copyError: "Failed to copy molecule data"
  },
  molCard: {
    moleculeInfo: "Molecule Information",
    invalidData: "Invalid molecule data structure.",
    noMoleculeData: "No molecule data available.",
    loading: "Loading...",
    clickForDetails: "Click on the molecule to view more details.",
    notAvailable: "N/A",
    clickToCollapse: "Click to collapse",
    clickToExpand: "Click to expand for more details"
  },
  moleculeModal: {
    original: "Original Molecule",
    findSimilar: "Find Similar",
    similarWithCount: "Similar Molecules ({{count}})",
    functionalGroupsTitle: "Functional Groups",
    functionalGroupList: "Ether, ketal, carbonate, ester",
    unknown: "Unknown",
    types: {
      solvent: "Solvent",
      cosolvent: "Cosolvent",
      diluent: "Diluent",
      additive: "Additive",
      salt: "Salt"
    },
    additiveSubtypes: {
      title: "Additive subcategory",
      categoryLabel: "Category",
      mechanistic: "Mechanistic",
      outcome: "Outcome",
      mechanisticOptions: {
        seiStabilizer: "SEI Stabilizer",
        ceiStabilizer: "CEI Stabilizer",
        hfNeutralizer: "HF Neutralizer",
        tmDissolutionSuppressor: "TM Dissolution Suppressor",
        desolvationOptimizer: "Desolvation Optimizer",
        dendriteSuppressor: "Dendrite suppressor",
        polysulfideSuppressor: "Polysulfide suppressor",
        gasSuppressor: "Gas suppressor",
        flameRetardant: "Flame retardant"
      },
      outcomeOptions: {
        fastCharging: "Fast charging",
        highVoltage: "High voltage",
        hotboxThermal: "Inflammability",
        htCycling: "High temp cycling",
        htStorage: "High temp storage",
        ltCycling: "Low temp cycling",
        rtCycling: "Room temp cycling"
      }
    },
    properties: {
      predictedFp: "Predicted Flash Point",
      combustionEnthalpy: "Combustion Enthalpy",
      commercialViability: "Commercial Viability"
    }
  },
  umapPlot: {
    controls: {
      resetViewport: "Reset Viewport",
      zoomIn: "Zoom In",
      zoomOut: "Zoom Out"
    },
    properties: {
      cluster: "Cluster",
      molWeight: "Mol Weight",
      espMax: "Esp Max",
      espMin: "Esp Min",
      homo: "HOMO",
      lumo: "LUMO",
      predictedMp: "Predicted MP",
      predictedBp: "Predicted BP",
      llmGrade: "LLM Grade"
    },
    units: {
      gPerMol: " g/mol",
      eV: " eV",
      celsius: " °C"
    }
  }
}; 
