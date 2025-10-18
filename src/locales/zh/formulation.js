export default {
  title: '盐与溶剂配置',
  subtitle: '配置并自定义你的电解质',
  comingSoon: '将在MU1.5中推出',
  comingSoon2: '将在MU2中推出',
  tabs: {
    introduction: '介绍',
    records: '记录'
  },
  introductionNew: {
    functionIntroTitle: '功能介绍',
    functionIntroDescription:
      'MU 平台的分子动力学（MD）模拟将先进的可极化力场与自动化工作流相结合，高保真捕捉离子与溶剂的相互作用。用户只需通过 MU 门户提交任意已知或未知分子的电解质配方，在数日内即可获得关键性质的定量预测，相较传统试错或经典建模方式显著提速并提升准确度。',
    functionIntroImageAlt: 'MD 模拟工作流',
    functionIntroCaption: 'MU 专有的电解液配方分子动力学（MD）服务',
    benefitsParagraph1:
      'MU 的专有 MD 服务可在分子尺度呈现电解质配方的瞬时结构，揭示 Li⁺、阴离子与溶剂分子在不同盐浓度下的组织方式。',
    benefitsParagraph2:
      '标准模拟通常在约 3 天内完成，具体取决于配方复杂度。完成后即可生成定量性质预测，为电解质设计和优化提供快速可靠的决策依据，显著节省成本与时间。',
    benefitsImageAlt: '跨浓度的 MD 模拟',
    benefitsImageCaption: '通过跨浓度的 MD 模拟加速电解质设计',
    propertiesIntroTitle: '性质介绍',
    propertiesIntroNoteDescription:
      '列为标准性质的项目在 MD 模拟完成后约 3 天内即可提供结果。其他性质请联系团队确认交付周期。',
    propertiesIntroNoteButton: '联系团队',
    groupStandardProperties: '标准性质',
    standardRdfTitle: '径向分布函数（RDF）',
    standardRdfDescription:
      '描述在给定距离处找到粒子的概率，揭示电解质的局部结构，从而影响溶解度、相容性、离子电导率、溶剂化结构与界面。',
    standardCnTitle: '配位数（CN）',
    standardCnDescription:
      '衡量某一中心离子周围的邻近原子或分子数量，对电导率、溶解度及界面性质具有重要影响。',
    standardSolvationClusterTitle: '溶剂化簇分析',
    standardSolvationClusterDescription: '解析电解液中阳离子与阴离子的缔合情况，重点关注以下三类簇：',
    standardSolvationClusterSsipBadge: 'SSIP',
    standardSolvationClusterSsipName: 'Solvent-Separated Ion Pair',
    standardSolvationClusterSsipDescription:
      '阳离子与阴离子存在关联，但至少被一个溶剂分子隔开。常见于高介电常数溶剂，可支持更高的 Li⁺ 迁移率和电导率。',
    standardSolvationClusterCipBadge: 'CIP',
    standardSolvationClusterCipName: 'Contact Ion Pair',
    standardSolvationClusterCipDescription:
      '阳离子与阴离子直接接触，没有溶剂分子夹在其中。多出现于高盐浓度或低介电常数溶剂，可能降低离子传输效率。',
    standardSolvationClusterAggBadge: 'AGG',
    standardSolvationClusterAggName: 'Aggregate',
    standardSolvationClusterAggDescription:
      '由多个阳离子与阴离子相互连接形成的大型簇团，常见于高浓度电解液，通常会降低电导率。',
    standardSolvationClusterImageAlt: '典型的 Li 溶剂化簇',
    standardSolvationClusterImageCaption: '典型 Li 溶剂化簇示意',
    standardSolvationClusterSummary:
      'SSIP/CIP/AGG 的比例是连接溶剂化环境与黏度、离子电导率、离子转移数等传输行为的重要结构描述符。',
    standardDiffusivityTitle: '扩散系数',
    standardDiffusivityDescription:
      '在无外电场情况下粒子随机运动的速率，与迁移率等传输性质直接相关。',
    standardConductivityTitle: '电导率',
    standardConductivityDescription:
      '表示离子或其他带电粒子在电场作用下携带电荷的能力，下图展示预测值与实验值的对比基准。',
    standardConductivityImageAlt: 'MD 模拟准确性',
    standardConductivityImageCaption: 'MD 模拟准确性：预测与实测电导率对比',
    standardConductivityImageDescription1:
      '我们的分子动力学模拟（蓝点）在 0–40 mS·cm⁻¹ 范围内对 100 多种电解液配方的电导率预测与实验结果高度一致，覆盖砜、亚砜、醚、酯、碳酸酯、腈、硅氧烷、硼酸酯、磷酸酯等多类溶剂。',
    standardConductivityImageDescription2:
      '相比之下，外部机器学习力场（MLFF，空心点）仅在少量碳酸酯体系中完成验证。我们的力场在这些体系中的准确性可与 MLFF 持平甚至更优，并且在 MLFF 尚未验证的更广泛化学空间中依然保持高预测能力。',
    standardConductivityImageDescription3:
      '散点接近黑色对角线（y = x）验证了模拟驱动的合成前筛选具备可靠性。',
    standardViscosityTitle: '黏度',
    standardViscosityDescription: '描述流体在剪切应力下抵抗流动或形变的能力。',
    standardDensityTitle: '密度',
    standardDensityDescription: '单位体积的质量，反映体系的紧凑程度。',
    groupAdvancedAnalysis: '高级分析',
    advancedIonCorrelationTitle: '离子-离子相关性',
    advancedIonCorrelationDescription: '衡量离子物种在超越随机分布情况下的相关程度。',
    advancedStructureFactorTitle: '结构因子（S(q)）',
    advancedStructureFactorDescription: '定量描述原子排布对辐射的散射强度，揭示倒易空间中的有序程度。',
    advancedDynamicStructureFactorTitle: '动态结构因子（S(q,ω)）',
    advancedDynamicStructureFactorDescription: '表征粒子在时空上的相关性演化。',
    advancedResidenceTimeTitle: '驻留时间',
    advancedResidenceTimeDescription: '描述离子或分子保持结合或停留在另一物种邻近区域的平均时长。',
    groupCustomStudies: '定制研究',
    customEdlTitle: 'EDL（电双层）',
    customEdlDescription:
      '描述带电表面或电极附近的离子有序层，可用于推断 SEI 形成与氧化还原行为。',
    customEdlImageAlt: '电双层结构',
    customEdlImageCaption:
      '在严格控制的电势下形成的电双层结构示意。该 MD 模拟快照展示了用户给定配方的电解液在双电极之间的分布。通过模拟虚拟电池的电势变化，可直观呈现界面结构，其化学分布决定后续界面化学。',
    customSolubilityTitle: '溶解度',
    customSolubilityDescription:
      '指在平衡条件下某种盐或分子在特定介质中可均匀分散（溶解或混合）的最大量。',
    customSolubilityImageAlt: '溶解度预测',
    customSolubilityImageCaption:
      '我们的 MD 模拟精准预测典型锂盐 LiFSI 在 19 种不同化学结构与官能团溶剂中的溶解度。散点越接近对角线表示预测越准确，帮助在合成前建立模拟筛选信心。',
    standardSolvationClusterTableName: '离子缔合和微观分子簇结构分析',
    table: {
      headers: {
        no: '编号',
        property: '性质',
        type: '类型',
        group: '分组',
        estimatedTime: '预计时间'
      },
      types: {
        structural: '结构性质',
        dynamic: '动力学性质',
        structuralDynamic: '结构 + 动力学',
        thermodynamic: '热力学性质'
      },
      estimatedTimes: {
        short: '约 3 天',
        medium: '约 1 周',
        long: '约 1-2 周'
      }
    }
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
    label: '阴离子选择（最大2）'
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
    calculating: '验证输入中，准备计算'
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
    calculatingDesc: '基于极化力场的分子动力学模拟耗时较长，可在预计时间之后查看结果，系统会提醒您计算的状态',
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
      viewDetails: '查看结果',
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
      concentration: '盐浓度',
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
    clusterAnalysis: '溶剂化簇类型和分数分析',
    size: '第一溶剂化簇中阴离子的数量',
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
    diffusionCoefficient: '扩散系数（单位：10⁻¹⁰ m²/秒）所有组分',
    species: '组分',
    coefficient: '扩散系数（×10⁻¹⁰ m²/s）',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG',
    SSIPTitle: 'Solvent-Separated Ion Pair',
    CIPTitle: 'Contact Ion Pair',
    AGGTitle: 'Ion Aggregate'
  },
  guide: {
    help: '帮助',
    close: '关闭'
  },
  detail: {
    title: '分析结果',
    viewSubtitle: '查看详细分析结果',
    viewSubtitleWithId: '查看详细分析结果',
    actionTitle: '分析详情',
    loading: '正在加载分析详情...',
    missingId: '缺少分析ID参数',
    fetchError: '获取分析详情失败',
    configuration: '配置信息',
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
    clusterAnalysis: '溶剂化簇类型和分数分析',
    size: '第一溶剂化簇中阴离子的数量',
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
    AGG: 'AGG',
    SSIPTitle: 'SSIP：溶剂分离离子对*阳离子和阴离子虽有关联，但并不直接接触。相反，一个或多个溶剂分子位于它们之间。典型出现在中等极性溶剂中，溶剂化壳层使离子分离，但静电关联依然存在。例如：Li*-(溶剂)-PF₆⁻',
    CIPTitle: 'CIP：接触离子对 一个阳离子和一个阴离子直接接触，它们之间没有插入的溶剂分子。常见于低介电常数溶剂或高盐浓度下。比SSIP结合更强。例如：Li⁺·PF₆⁻直接接触。',
    AGGTitle: 'AGG：离子聚集体 涉及两个以上阳离子和阴离子组合直接接触的较大关联结构。可以是二聚体、三聚体或更大的簇团。通常出现在高浓度、较差溶剂或离子液体中。例如：(Li⁺·PF₆⁻)ₙ簇团，或Li⁺桥接多个阴离子。'
  }
};


