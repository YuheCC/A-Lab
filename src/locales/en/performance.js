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
  
  // General UI text
  ui: {
    calculating: "Calculating...",
    analyzing: "Analyzing...",
    startingAnalysis: "Starting LLM analysis...",
    analysisPlaceholder: "Click \"LLM Analysis\" button to start generating analysis for your prediction results.",
    pleaseSelectBattery: "Please select a battery system",
    invalidBatterySystem: "Invalid battery system selected",
    calculationFailed: "Failed to calculate performance prediction. Please try again.",
    analysisFailed: "Failed to start LLM analysis. Please try again.",
    sessionNotInitialized: "Session not initialized. Please refresh the page and try again.",
    predictionFirst: "Please run prediction first before requesting LLM analysis"
  },
  
  // Analysis status
  analysisStatus: {
    noAnalysis: "No Analysis Available",
    available: "Available",
    notAvailable: "Not Available"
  },
  
  // Filter options
  filters: {
    smilesSearch: "SMILES Search",
    timeRange: "Time Range",
    status: "Status",
    clearFilters: "Clear Filters",
    timeOptions: {
      allTime: "All Time",
      today: "Today",
      thisWeek: "This Week",
      thisMonth: "This Month"
    },
    statusOptions: {
      allStatus: "All Status",
      completed: "Completed",
      pending: "Pending",
      failed: "Failed"
    }
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
      deleteConfirm: "Are you sure you want to delete this record?",
      deleteFailed: "Failed to delete record"
    },
    noResults: {
      message: "No prediction records found matching your filters.",
      clearFilters: "Clear all filters"
    },
    loading: {
      message: "Loading history data...",
      error: "Error",
      retry: "Retry",
      failedToLoad: "Failed to load history data"
    }
  },
  
  // Battery system fallback
  batterySystemFallback: "Battery System"
}