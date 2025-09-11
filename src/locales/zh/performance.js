export default {
  // Page header
  title: "含添加剂分子的电池性能预测",
  beta: "测试版",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "电池系统选择",
    label: "电池系统",
    loading: "加载中...",
    systemSpecs: {
      title: "系统规格",
      cathode: "正极:",
      anode: "负极:",
      benchmarkElectrolyte: "基准电解液:",
      cellDesign: "电池设计:"
    }
  },
  
  // Additive input
  additive: {
    label: "添加剂 (SMILES)",
    required: "*",
    placeholder: "输入SMILES分子式"
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
    suggestion: "请输入有效的 SMILES 字符串。"
  },
  
  // Calculate button
  calculate: {
    button: "计算",
    calculated: "已计算"
  },
  
  // Results
  results: {
    title: "电池性能预测",
    temperatureTabs: {
      temp25: "25°C 性能",
      temp45: "45°C 性能"
    },
    performance: {
      cycleLife25: "25 °C 循环寿命",
      ce25: "25 °C CE",
      ratePerformance25: "25 °C 倍率性能",
      cycleLife45: "45 °C 循环寿命",
      ce45: "45 °C CE"
    },
    status: {
      positive: "正面",
      negative: "负面",
      neutral: "中性"
    },
    confidence: "置信度"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM 分析",
    title: "LLM 分析",
    sections: {
      nickelOptimization: "1. 镍脱氢优化",
      cyclingOptimization: "2. 4°C 循环优化",
      recommendations: "3. 综合建议"
    },
    references: "参考文献"
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
    newPrediction: "新预测",
    searchPlaceholder: "按文件名搜索...",
    status: {
      completed: "已完成"
    },
    actions: {
      viewDetails: "查看详情",
      delete: "删除",
      deleteConfirm: "确定要删除这条记录吗？",
      deleteFailed: "删除记录失败"
    },
    noResults: {
      message: "未找到符合筛选条件的预测记录。",
      clearFilters: "清除所有筛选条件"
    },
    loading: {
      message: "正在加载历史数据...",
      error: "错误",
      retry: "重试",
      failedToLoad: "加载历史数据失败"
    }
  },
  
  // Battery system fallback
  batterySystemFallback: "电池系统"
}