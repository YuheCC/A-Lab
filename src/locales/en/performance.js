export default {
  // Page header
  title: "Impact of additive on cell performances",
  subtitle: "Predict impact of additive on cell performance metrics (cycle life, coulombic efficiency, rate performance) with base AI models trained on SES internal experimental data, or models finetuned by user data",
  beta: "BETA",
  disclaimerTitle: "Disclaimer",
  disclaimer: "<strong>Note:</strong> This function evaluates the impact of new additives by comparing the performance of cells with and without the additive, using user defined benchmark electrolyte. Results may differ when applied to different cell designs or benchmark electrolytes.",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "Design Setup",
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

  // Model Selection
  modelSelection: {
    label: "Model Selection",
    placeholder: "Please select a prediction model",
    baseModel: "Base Model",
    finetunedModels: "Fine-tuned Models",
    muModels: "MU Models",
    columns: {
      modelName: "Model Name",
      modelId: "Model ID",
      baseModel: "Base Model"
    },
    sectionTitle: "1. Model Selection"
  },
  formulas: {
    sectionTitle: "2. Additive Formulations Configuration",
    formulaA: "Formula A",
    formulaB: "Formula B",
    additive1Label: "Additive 1",
    additive2Label: "Additive 2",
    additive3Label: "Additive 3",
    newAdditiveSmiles: "New Additive SMILES",
    weightPercentageLabel: "Weight Percentage (wt%)"
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
    tooltip: "Custom value to be launched in MU2"
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
    improvementHint: "Improvement of Formula B compared with Formula A",
    negativeTitle: "Negative",
    positiveTitle: "Positive",
    negativeTip: "After adding the specified additive, the cell will perform equally or worse than the cell with the benchmark electrolyte.",
    positiveTip: "After adding the specified additive, the cell will perform better than the cell with the benchmark electrolyte.",
    titleTip: "Negative means after adding the specified additive, the cell will perform equally or worse than the cell with the benchmark electrolyte.\nPositive means after adding the specified additive, the cell will perform better than the cell with the benchmark electrolyte.",
    upgradeToViewMetrics: "Upgrade to view more metrics at 25°C & 45°C",
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
      cycleLife25: "Cycle Life",
      ce25: "Coulombic Efficiency",
      ratePerformance25: "Rate Performance",
      cycleLife45: "Cycle Life",
      ce45: "Coulombic Efficiency"
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
    newDesign: "New Design",
    newPrediction: "New Prediction",
    train: "Train",
    searchPlaceholder: "Search by file name...",
    loadingText: "Loading...",
    error: "Error",
    noResults: "No design records found",
    cannotDeleteDemo: "Cannot delete demo records",
    status: {
      completed: "Completed"
    },
    actions: {
      viewResults: "View Results",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this record?",
      deleteFailed: "Failed to delete record"
    },
    loading: {
      message: "Loading history data...",
      error: "Error",
      retry: "Retry",
      failedToLoad: "Failed to load history data"
    }
  },

  // Records
  records: {
    searchPlaceholder: "Search record ID",
    allModels: "All Models",
    clearFilters: "Clear Filters",
    showingRecords: "Showing {{count}} of {{total}} records"
  },

  // Models
  models: {
    loadingText: "Loading...",
    error: "Error",
    noResults: "No models found",
    showingRecords: "Showing {{count}} of {{total}} records",
    statusOnline: "Online",
    statusTrained: "Trained",
    statusOffline: "Offline",
    statusTraining: "Training",
    statusFail: "Failed",
    filters: {
      searchPlaceholder: "Search Model ID or Name...",
      allStatus: "All Status",
      allBaseModels: "All Base Models",
      selectStatus: "Select Status",
      selectBaseModel: "Select Base Model",
      clearFilters: "Clear Filters",
      selectDate: "Select date",
      refresh: "Refresh"
    },
    columns: {
      modelId: "Model ID",
      modelName: "Model Name",
      baseModel: "Base Model",
      status: "Status",
      created: "Created Time",
      createdBy: "Created By",
      actions: "Actions"
    },
    actions: {
      viewDetails: "View Details"
    }
  },

  // Form validation messages
  validation: {
    selectModel: "Please select a prediction model",
    atLeastOneAdditive: "Both Formula A and Formula B must have at least one additive filled in",
    invalidSmiles: "The SMILES entered for {{formulas}} is invalid. Please correct it before calculating.",
  },

  // Battery system fallback
  batterySystemFallback: "Battery System",

  // Train disabled tip
  trainDisabledTip: "For usage, please contact our team via email <emailLink>mu.sales@ses.ai</emailLink>."
}
