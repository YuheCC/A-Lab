export default {
  // Page header
  title: "Cell performance prediction with additive molecules",
  beta: "BETA",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "Battery System Selection",
    label: "Battery System",
    loading: "Loading...",
    systemSpecs: {
      title: "System Specifications",
      cathode: "Cathode:",
      anode: "Anode:",
      benchmarkElectrolyte: "Benchmark Electrolyte:",
      cellDesign: "Cell design:"
    }
  },
  
  // Additive input
  additive: {
    label: "Additive (SMILES)",
    required: "*",
    placeholder: "Enter SMILES molecular formula"
  },
  
  // Molecule information
  moleculeInfo: {
    title: "Molecule Information",
    loading: "Querying molecule details...",
    properties: {
      smiles: "SMILES:",
      espMin: "ESP MIN:",
      molecularWeight: "MOL WEIGHT:",
      predictedMp: "PREDICTED MP:",
      umapX: "UMAP X:",
      predictedBp: "PREDICTED BP:",
      umapY: "UMAP Y:",
      predictedFp: "PREDICTED FP:",
      homo: "HOMO:",
      combustionEnthalpy: "COMBUSTION ENTHALPY:",
      lumo: "LUMO:",
      commercialViability: "COMMERCIAL VIABILITY:",
      espMax: "ESP MAX:",
      functionalGroups: "FUNCTIONAL GROUPS:"
    },
    structurePlaceholder: {
      line1: "Molecule",
      line2: "Structure"
    }
  },
  
  // SMILES not found
  smilesNotFound: {
    title: "SMILES Not Found",
    description: "The SMILES string you entered is not found in our database.",
    suggestion: "Please re-enter a valid SMILES string or try this example:",
    examples: {
      ec: "ethylene carbonate",
      water: "water"
    }
  },
  
  // Calculate button
  calculate: {
    button: "Calculate",
    calculated: "Calculated"
  },
  
  // Results
  results: {
    title: "Cell Performance Prediction",
    temperatureTabs: {
      temp25: "25°C Performance",
      temp45: "45°C Performance"
    },
    performance: {
      cycleLife25: "25 °C Cycle life",
      ce25: "25 °C CE",
      ratePerformance25: "25 °C Rate performance",
      cycleLife45: "45 °C Cycle Life",
      ce45: "45 °C CE"
    },
    status: {
      positive: "POSITIVE",
      negative: "NEGATIVE",
      neutral: "NEUTRAL"
    },
    confidence: "CONFIDENCE"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM Analysis",
    title: "LLM Analysis",
    sections: {
      nickelOptimization: "1. Nickel Dehydrogenation Optimization",
      cyclingOptimization: "2. 4°C Cycling Optimization", 
      recommendations: "3. Comprehensive Recommendations"
    },
    references: "References"
  },
  
  // History
  history: {
    title: "Prediction Records",
    newPrediction: "New Prediction",
    searchPlaceholder: "Search by file name...",
    status: {
      completed: "Completed"
    },
    actions: {
      viewDetails: "View Details",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this record?"
    },
    noResults: {
      message: "No prediction records found matching your filters.",
      clearFilters: "Clear all filters"
    }
  }
}