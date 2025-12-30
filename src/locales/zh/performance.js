export default {
  // Page header
  title: "添加剂对电池性能的影响",
  subtitle: "使用基于SES内部实验数据训练的基础AI模型，或由用户数据微调的模型，来预测添加剂对电池性能指标（循环寿命、库伦效率、倍率性能）的影响",
  beta: "测试版",
  disclaimerTitle: "免责声明",
  disclaimer: "<strong>注意：</strong>此功能通过使用用户定义的基准电解液，比较添加和不添加添加剂的电池性能来评估新添加剂的影响。应用于不同的电池设计或基准电解液时，结果可能有所不同。",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "设计设置",
    label: "电池化学",
    loading: "加载中...",
    systemSpecs: {
      title: "电池规格",
      cathode: "正极:",
      anode: "负极:",
      benchmarkElectrolyte: "基准电解液:",
      cellDesign: "电池设计:"
    }
  },

  // Model Selection
  modelSelection: {
    label: "模型选择",
    placeholder: "请选择预测模型",
    baseModel: "基础模型",
    finetunedModels: "微调模型",
    muModels: "MU 模型",
    columns: {
      modelName: "模型名称",
      modelId: "模型ID",
      baseModel: "基础模型"
    }
  },

  // Additive input
  additive: {
    label: "添加剂的SMILES",
    required: "*",
    placeholder: "输入有效的SMILES添加剂"
  },

  // Weight percentage
  weightPercentage: {
    label: "重量百分比 (wt%)",
    tooltip: "自定义数值将在MU2中推出"
  },
  
  // Molecule information
  moleculeInfo: {
    title: "分子信息",
    loading: "正在查询分子详情...",
    properties: {
      smiles: "SMILES:",
      espMin: "ESP MIN:",
      molecularWeight: "分子量:",
      predictedMp: "预测熔点:",
      umapX: "UMAP X:",
      predictedBp: "预测沸点:",
      umapY: "UMAP Y:",
      predictedFp: "预测闪点:",
      homo: "HOMO:",
      combustionEnthalpy: "燃烧焓:",
      lumo: "LUMO:",
      commercialViability: "商业可行性:",
      espMax: "ESP MAX:",
      functionalGroups: "功能性基团:"
    },
    structurePlaceholder: {
      line1: "分子",
      line2: "结构"
    }
  },
  
  // SMILES not found
  smilesNotFound: {
    title: "SMILES 未找到",
    description: "查询的 SMILES 字符串在我们的数据库中未找到。",
    suggestion: "请重新输入有效的 SMILES 字符串或尝试以下示例:",
    examples: {
      ec: "碳酸乙烯酯",
      water: "水"
    }
  },
  
  // Invalid SMILES
  invalidSmiles: {
    title: "无效的 SMILES 格式",
    description: "输入的内容不是有效的 SMILES 分子式。",
    suggestion: "请输入有效的 SMILES 字符串或尝试以下示例:"
  },
  
  // Calculate button
  calculate: {
    button: "计算",
    calculated: "已计算"
  },
  
  // Results
  results: {
    title: "电池性能预测",
    titleTip: "负面（Negative）表示添加指定添加剂后，电池性能等于或差于使用基准电解液的电池。\n正面（Positive）表示添加指定添加剂后，电池性能优于使用基准电解液的电池。",
    negativeTitle: "负面 (Negative)",
    positiveTitle: "正面 (Positive)",
    negativeTip: "添加指定添加剂后，电池性能等于或差于使用基准电解液的电池。",
    positiveTip: "添加指定添加剂后，电池性能优于使用基准电解液的电池。",
    upgradeToViewMetrics: "升级套餐以查看25°C和45°C的更多指标",
    badgeTitle: "Badge Color indicators（仅适用于循环寿命与倍率性能）",
    badgeDescriptions: {
      gainLabel: "性能提升",
      lossLabel: "性能下降",
      levelLow: "< 5%",
      levelMid: "5%～25%",
      levelHigh: "> 25%"
    },
    descriptions: {
      ceLabel: "库伦效率",
      cycleLifeLabel: "循环寿命",
      ratePerformanceLabel: "倍率性能",
      ce: "从BOL到EOL各个循环的平均库伦效率",
      cycleLife: "放电容量保持率达到80%时的循环次数",
      ratePerformance: "5C放电容量相对于0.5C放电容量的保持率"
    },
    temperatureTabs: {
      temp25: "25°C 性能",
      temp45: "45°C 性能"
    },
    performance: {
      cycleLife25: "循环寿命",
      ce25: "库伦效率",
      ratePerformance25: "倍率性能",
      cycleLife45: "循环寿命",
      ce45: "库伦效率"
    },
    status: {
      positive: "正面",
      negative: "负面",
      neutral: "中性",
      restricted: "受限"
    },
    confidence: "置信度"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM 分析",
    analyzed: "已分析",
    title: "LLM 分析",
    sections: {
      nickelOptimization: "1. 镍脱氢优化",
      cyclingOptimization: "2. 4°C 循环优化",
      recommendations: "3. 综合建议"
    },
    references: "参考文献"
  },

  // Analysis timing
  analysis: {
    analyzing: "LLM分析中",
    analyzingForSeconds: "{{seconds}}秒",
    analyzingForMinutesAndSeconds: "{{minutes}}分{{seconds}}秒"
  },
  
  // General UI text
  ui: {
    calculating: "计算中...",
    analyzing: "分析中...",
    startingAnalysis: "开始LLM分析...",
    analysisPlaceholder: "点击 \"LLM 分析\" 按钮开始为您的预测结果生成分析。",
    pleaseSelectBattery: "请选择一个电池系统",
    invalidBatterySystem: "选择的电池系统无效",
    calculationFailed: "性能预测计算失败。请重试。",
    analysisFailed: "启动LLM分析失败。请重试。",
    sessionNotInitialized: "会话未初始化。请刷新页面后重试。",
    predictionFirst: "请先运行预测，然后再请求LLM分析"
  },
  
  // Analysis status
  analysisStatus: {
    noAnalysis: "无可用分析",
    available: "可用",
    notAvailable: "不可用"
  },
  
  // Filter options
  filters: {
    smilesSearch: "SMILES 搜索",
    timeRange: "时间范围",
    status: "状态",
    clearFilters: "清除筛选条件",
    timeOptions: {
      allTime: "所有时间",
      today: "今天",
      thisWeek: "本周",
      thisMonth: "本月"
    },
    statusOptions: {
      allStatus: "所有状态",
      completed: "已完成",
      pending: "进行中",
      failed: "失败"
    }
  },
  
  // History
  history: {
    title: "预测记录",
    newDesign: "新增设计",
    newPrediction: "新预测",
    train: "训练",
    searchPlaceholder: "按文件名搜索...",
    loadingText: "加载中...",
    error: "错误",
    noResults: "暂无设计记录",
    cannotDeleteDemo: "无法删除演示记录",
    status: {
      completed: "已完成"
    },
    actions: {
      viewResults: "查看结果",
      delete: "删除",
      deleteConfirm: "确定要删除这条记录吗？",
      deleteFailed: "删除记录失败"
    },
    loading: {
      message: "正在加载历史数据...",
      error: "错误",
      retry: "重试",
      failedToLoad: "加载历史数据失败"
    }
  },

  // Records
  records: {
    searchPlaceholder: "搜索record ID",
    allModels: "所有模型",
    clearFilters: "清除筛选",
    showingRecords: "显示 {{count}} / {{total}} 条记录"
  },

  // Models
  models: {
    loadingText: "加载中...",
    error: "错误",
    noResults: "暂无模型",
    showingRecords: "显示 {{count}} / {{total}} 条记录",
    statusOnline: "上线",
    statusTrained: "训练完成",
    statusOffline: "下线",
    statusTraining: "训练中",
    statusFail: "失败",
    filters: {
      searchPlaceholder: "搜索模型ID或名称...",
      allStatus: "所有状态",
      allBaseModels: "所有基础模型",
      selectStatus: "选择状态",
      selectBaseModel: "选择基础模型",
      clearFilters: "清除筛选",
      selectDate: "选择日期",
      refresh: "刷新"
    },
    columns: {
      modelId: "模型ID",
      modelName: "模型名称",
      baseModel: "基础模型",
      status: "状态",
      created: "创建时间",
      createdBy: "创建者",
      actions: "操作"
    },
    actions: {
      viewDetails: "查看详情"
    }
  },

  // Battery system fallback
  batterySystemFallback: "电池系统"
}
