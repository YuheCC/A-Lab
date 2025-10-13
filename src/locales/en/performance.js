export default {
  // Page header
  title: "Impact of additive on cell performances",
  subtitle: "Predict impact of additive on cell performance metrics (cycle life, coulombic efficiency, rate performance) with an AI model trained on SES internal experimental data",
  beta: "BETA",
  disclaimer: "This function predicts the impact of new additives on cell performance based on specific benchmark electrolyte formulations and internally generated cell data. If users employ different cell designs or benchmark electrolytes, the prediction results may deviate from actual performance. Independent validation is recommended.",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "Cell Chemistry Selection",
    label: "Cell Chemistry",
    loading: "Loading...",
    systemSpecs: {
      title: "Cell Specifications",
      cathode: "Cathode:",
      anode: "Anode:",  
      benchmarkElectrolyte: "Benchmark Electrolyte:",
      cellDesign: "Cell Design:"
    }
  },
  
  // Additive input
  additive: {
    label: "SMILES of Additive",
    required: "*",
    placeholder: "Enter valid SMILES for additive of interest"
  },

  // Weight percentage
  weightPercentage: {
    label: "Weight Percentage (wt%)",
    tooltip: "Custom value to be launched in MU1.5"
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
  
  // Invalid SMILES
  invalidSmiles: {
    title: "Invalid SMILES Format",
    description: "The input does not appear to be a valid SMILES molecular formula.",
    suggestion: "Please enter a valid SMILES string or try this example:"
  },
  
  // Calculate button
  calculate: {
    button: "Calculate",
    calculated: "Calculated"
  },
  
  // Results
  results: {
    title: "Cell Performance Prediction",
    negativeTitle: "Negative",
    positiveTitle: "Positive",
    negativeTip: "After adding the specified additive, the cell will perform equally or worse than the cell with the benchmark electrolyte.",
    positiveTip: "After adding the specified additive, the cell will perform better than the cell with the benchmark electrolyte.",
    titleTip: "Negative means after adding the specified additive, the cell will perform equally or worse than the cell with the benchmark electrolyte.\nPositive means after adding the specified additive, the cell will perform better than the cell with the benchmark electrolyte.",
    badgeTitle: "Badge Color Indicators (for cycle life and rate performance only)",
    badgeDescriptions: {
      gainLabel: "Performance gain",
      lossLabel: "Performance loss",
      levelLow: "< 5%",
      levelMid: "5%～25%",
      levelHigh: "> 25%"
    },
    descriptions: {
      ceLabel: "Coulombic Efficiency",
      cycleLifeLabel: "Cycle life",
      ratePerformanceLabel: "Rate performance",
      ce: "Avrage CE of each cycle from BOL to EOL",
      cycleLife: "The number of cycles when the discharge capacity retenion rate reachs 80%",
      ratePerformance: "The capacity retention of the capacity under 5C dishcarge compared the  capacity under 0.5C discharge"
    },
    temperatureTabs: {
      temp25: "25°C Performance",
      temp45: "45°C Performance"
    },
    performance: {
      cycleLife25: "25°C Cycle Life",
      ce25: "25°C Coulombic Efficiency",
      ratePerformance25: "25°C Rate Performance",
      cycleLife45: "45°C Cycle Life",
      ce45: "45°C Coulombic Efficiency"
    },
    status: {
      positive: "POSITIVE",
      negative: "NEGATIVE",
      neutral: "NEUTRAL",
      restricted: "RESTRICTED"
    },
    confidence: "CONFIDENCE"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM Analysis",
    analyzed: "Analyzed",
    title: "LLM Analysis",
    sections: {
      nickelOptimization: "1. Nickel Dehydrogenation Optimization",
      cyclingOptimization: "2. 4°C Cycling Optimization",
      recommendations: "3. Comprehensive Recommendations"
    },
    references: "References"
  },

  // Analysis timing
  analysis: {
    analyzing: "Analyzing",
    analyzingForSeconds: "{{seconds}} s",
    analyzingForMinutesAndSeconds: "{{minutes}} min {{seconds}} s"
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
      viewDetails: "View",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this record?",
      deleteFailed: "Failed to delete record"
    },
    noResults: {
      message: "No prediction records found.",
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
