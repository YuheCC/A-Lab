export default {
  title: '盐与溶剂配置',
  subtitle: '配置并自定义你的电解质',
  comingSoon: '即将提供',
  tabs: {
    introduction: '介绍',
    records: '记录'
  },
  actions: {
    backToList: '返回列表'
  },
  create: {
    newConfiguration: '新建配置'
  },

  saltConfiguration: {
    title: '盐配置'
  },

  cationSelection: {
    label: '阳离子选择'
  },

  anionSelection: {
    label: '阴离子选择（选择 1-2）'
  },

  totalSaltConcentration: {
    label: '总盐浓度（mol/kg）'
  },

  anionFraction: {
    label: 'BF₄⁻ 分数'
  },

  fractionType: {
    label: '分数类型',
    mole: '摩尔分数',
    weight: '质量分数'
  },

  saltSummary: {
    title: '盐配置概览',
    selected: '已选',
    totalConcentration: '总盐浓度',
    fractions: '分数',
    fractionType: '分数类型',
    totalFraction: '总分数'
  },

  solventConfiguration: {
    title: '溶剂配置'
  },

  smilesString: {
    label: 'SMILES 字符串',
    placeholder: '输入 SMILES 字符串'
  },

  fraction: {
    label: '分数（最小值：0.05）'
  },

  removeSolvent: '移除溶剂',
  addSmiles: '添加 SMILES（最多 3 个）',

  solventSummary: {
    title: '溶剂概览',
    solvent: '溶剂',
    fractionType: '分数类型',
    totalFraction: '总分数',
    emptyPlaceholder: '空 (0), 空 (0)'
  },

  submit: {
    button: '提交配置'
  },

  ui: {
    calculating: '计算中...'
  },

  result: {
    processing: '算法模型计算中',
    description: '系统正在处理您的模型参数，预计需要较长时间，请耐心等待',
    notice: '模型训练完成后，系统将自动向您发送消息通知',
    action: '您可以关闭此页面，不会影响后台计算进程',
    close: '返回配置'
  },
  resultTip: {
    close: '关闭'
  },

  tip: {
    calculating: '计算中',
    calculatingDesc: '基于极化力场的分子动力学模拟耗时较长（24-48小时），可在预计时间之后查看结果，系统会提醒您计算的状态',
    notice2: '您可以关闭此页面，不会影响后台计算进程'
  },
  history: {
    title: '分析记录',
    newAnalysis: '新建分析',
    loading: {
      message: '加载中...',
      error: '错误'
    },
    noResults: {
      message: '未找到分析记录'
    },
    salt: '盐',
    solvent: '溶剂',
    unit: {
      molPerKg: 'mol/kg'
    },
    actions: {
      viewDetails: '查看详情',
      delete: '删除',
      deleteConfirm: '确认删除该记录？',
      deleteFailed: '删除记录失败'
    }
  },
  list: {
    columns: {
      analysisId: '分析 ID',
      saltFraction: '盐（分数）',
      saltFractionType: '分数类型（盐）',
      solventFraction: '溶剂（分数）',
      solventFractionType: '分数类型（溶剂）',
      concentration: '浓度',
      created: '创建时间',
      status: '状态',
      actions: '操作'
    }
  },

  status: {
    completed: '已完成',
    success: '已完成',
    running: '运行中',
    failed: '失败',
    pending: '等待中'
  },
  results: {
    analysisResults: '分析结果',
    systemProperties: '体系性质',
    clusterAnalysis: '簇分析',
    size: '尺寸',
    category: '类别',
    fraction: '分数',
    analysisCharts: '分析图表',
    radialDistribution: '径向分布函数与配位数',
    radialDistributionSubtitle: '径向分布函数与配位数',
    meanSquareDisplacement: '均方位移',
    meanSquareDisplacementSubtitle: '均方位移',
    chartPlaceholder: '图表占位',
    analysisFile: '分析文件',
    downloadDescription: '以 JSON 格式下载完整分析结果',
    fileContains: '文件包含配置详情、分析参数与计算结果',
    downloadJSON: '下载 JSON',
    density: '密度 (g/cm³)',
    viscosity: '黏度 (cP)',
    conductivity: '电导率 (mS/cm)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG'
  }
  ,
  detail: {
    title: '分析结果',
    viewSubtitle: '查看详细分析结果',
    viewSubtitleWithId: '查看详细分析结果',
    actionTitle: '分析详情',
    loading: '正在加载分析详情...',
    saltSolventConfig: '盐与溶剂配置',
    saltSummary: '盐配置概览',
    solventSummary: '溶剂概览',
    selected: '已选',
    weightConcentration: '质量浓度',
    fractions: '分数：',
    fractionType: '分数类型：',
    totalFraction: '总分数：',
    solvent: '溶剂：',
    weightFraction: '质量分数',
    analysisResults: '分析结果',
    systemProperties: '体系性质',
    clusterAnalysis: '簇分析',
    size: '尺寸',
    category: '类别',
    fraction: '分数',
    analysisCharts: '分析图表',
    radialDistribution: '径向分布函数与配位数',
    radialDistributionSubtitle: '径向分布函数与配位数',
    meanSquareDisplacement: '均方位移',
    meanSquareDisplacementSubtitle: '均方位移',
    chartPlaceholder: '图表占位',
    analysisFile: '分析文件',
    downloadDescription: '以 JSON 格式下载完整分析结果',
    fileContains: '文件包含配置详情、分析参数与计算结果',
    downloadJSON: '下载 JSON',
    density: '密度 (g/cm³)',
    viscosity: '黏度 (cP)',
    conductivity: '电导率 (mS/cm)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG'
  }
};


