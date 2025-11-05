export default {
    // Search Tabs
    tabs: {
        organic: '溶剂、添加剂和稀释剂',
        inorganic: '无机溶剂、添加剂和稀释剂',
        anions: '盐阴离子',
        third: '固态电解质'
    },
    
    // Search Input
    searchPlaceholder: "输入SMILES字符串、分子名称或性质查询",
    searchButton: "搜索",
    searchTooltip: '<p>有效查询可以搜索分子的任何数值属性。例如：</p><p>- "查找HOMO最多为-8的所有分子"<br/>- "查找LUMO至少为-2且分子量最多为200的所有分子"</p><p>对于更开放式的查询，请使用智能问答功能。</p><p>要绘制和查找SMILES字符串，请点击此图标或访问 <a>{{pubChemUrl}}</a></p>',
    drawMolecule: "绘制分子",
    importSmilesTooltip: '导入 SMILES 到绘图工具。',
    similarityPrompt: '搜索与下列分子在结构上相似的分子：',
    similarityTooltip: {
        title: '搜索',
        lines: [
            'Search 算法会在我们的数据库中查找你的分子，并找到与之相似的分子。',
            '可以输入任意数量的分子，支持 SMILES 字符串、分子名称或常用缩写。',
            '如果希望获得不带偏向的搜索结果，请将此输入框留空。',
            '点击左侧的绘图图标，可以绘制自定义分子并自动将其 SMILES 字符串填入该输入框。',
        ],
    },
    propertyConstraints: {
        intro: '满足以下物性约束：',
        tooltipTitle: '自定义物性约束',
        tooltipIntro: 'Search 支持通过自然语言来调整搜索结果，以满足你对分子结构和物性的需求。你可以请求以下内容：',
        atomCounts: '指定各元素的原子数',
        functionalGroups: '指定某些官能团的存在或缺失',
        commercialAvailability: '商业可得性',
        valueRangeBullet: '{{properties}} 的数值范围或界限',
    },
    
    // Search Options
    findFriendsLabel: '计划用途：',
    findFriendsDescription: '与您输入的分子具有相似结构，并且在理论上与以下电池使用场景相兼容的物理化学性质的分子：',
    useCaseTooltipTitle: 'SES molecule property optimizer',
    useCaseTooltipDescription: "Enter what type of battery molecule you're looking for, and SES's molecule property optimizer will display results that are more likely to be compatible with your chosen use case.",

    searchRange: '搜索范围',
    nearbyFriends: '附近的朋友',
    distantFriends: '远处的朋友',
    searchRangeTooltip: '将滑块向左拖动，可优先考虑与您的使用场景在性能上最兼容的分子，即便它们的结构不同。将滑块向右拖动，可优先考虑与您输入分子结构最相似的分子。',
    advancedOptions: '高级选项',
    intelligentCompute: '智能找朋友计算',
    intelligentFindFriendsLabel: '智能找"朋友"',
    intelligentFindFriendsTooltip: '使用大型语言模型检查数百种分子，为您的应用寻找更相关的候选。提高计算能力，并填写（高级选项中的）电池系统信息，以获得最佳效果。',
    intelligentFindFriendsLimitLabel: '本月剩余：{{remaining}} / {{limit}}',
    showHypothetical: '显示假想分子',
    showHypotheticalTooltip: '包括由我们的算法生成但未收录于公开目录的候选分子；其可用性和可合成性无法确定。',
    computeDisabled: '禁用',
    computeLow: '低',
    computeMedium: '中',
    computeHigh: '高',
    computeExtreme: '极致',
    cathode: '正极',
    anode: '负极',
    salt: '盐',
    solvent: '主要溶剂',
    performanceMetric: '期望性能指标',
    extraRequests: '自定义分子约束（为了获得最佳结果，请启用智能找朋友）：',
    extraRequestsPlaceholder: '仅显示含醚官能团的分子。',
    custom: '自定义',
    upgradeEnterprise: '升级到企业级账户',
    upgradeAccount: '升级账户',
    computeWarning: '智能找朋友的高性能需要更多上下文。已将计算能力设置为低。',
    batteryInfoRecommendation: '推荐的电池信息可帮助智能找朋友为您找到最相关的分子：',
    
    searchRange: '搜索范围',
    nearbyFriends: '附近的朋友',
    distantFriends: '远处的朋友',
    searchRangeTooltip: '将滑块向左拖动，可优先考虑与您的使用场景在性能上最兼容的分子，即便它们的结构不同。将滑块向右拖动，可优先考虑与您输入分子结构最相似的分子。',
    advancedOptions: '高级选项',
    intelligentCompute: '智能找朋友计算',
    computeDisabled: '禁用',
    computeLow: '低',
    computeMedium: '中',
    computeHigh: '高',
    computeExtreme: '极致',
    cathode: '正极',
    anode: '负极',
    salt: '盐',
    solvent: '主要溶剂',
    performanceMetric: '期望性能指标',
    extraRequests: '自定义分子约束（为了获得最佳结果，请启用智能找朋友）：',
    extraRequestsPlaceholder: '仅显示含醚官能团的分子。',
    custom: '自定义',
    upgradeEnterprise: '升级到企业级账户',
    upgradeAccount: '升级账户',
    computeWarning: '智能找朋友的高性能需要更多上下文。已将计算能力设置为低。',
    intelligentFindFriendsLimitLabel: '本月剩余：{{remaining}} / {{limit}}',
    
    // Loading and Status Messages
    searching: "搜索中...",
    loadingMap: "正在加载分子宇宙地图",
    errorLoadingData: "数据加载错误",
    noDataAvailable: "无可用数据",
    tooManyRequests: "请求过多。请稍等片刻再重试。",
    
    // Search Results
    searchedMolecules: "搜索结果分子",
    moleculeNumber: "分子 {{number}}",
    similarMolecules: "相似分子",
    similarMoleculeNumber: "相似分子 #{{number}}",
    selectMolType: "选择最适合的分子类型以获得最佳结果",
    
    // Property Names (Professional terms - not translated according to rules)
    properties: {
        smiles: "SMILES",
        chemicalFormula: "Chemical Formula",
        molecularWeight: "Molecular Weight",
        homo: "HOMO",
        lumo: "LUMO",
        espMin: "ESP Min",
        espMax: "ESP Max",
        molecularVolume: "Molecular Volume",
        fluorideBondDissociationEnergy: "F Bond Dissociation Energy",
        predictedMp: "Predicted Melting Point",
        predictedBp: "Predicted Boiling Point",
        predictedFp: "Predicted Flash Point",
        combustionEnthalpy: "Combustion Enthalpy",
        commercialScore: "Commercial Score",
        functionalGroups: "Functional Groups",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },

    moleculeTypes: {
        selectMolType: "分子类型",
        solvent: "溶剂",
        cosolvent: "共溶剂",
        diluent: "稀释剂",
        primarySalt: "主盐",
        additive: "添加剂",
        additiveSubtype: "添加剂子类别",
        additiveCategory: "类别",
        additiveCategories: {
            mechanistic: "机理",
            outcome: "结果",
            mechanisticOptions: {
                seiStabilizer: "SEI 稳定剂",
                ceiStabilizer: "CEI 稳定剂",
                hfNeutralizer: "HF 中和剂",
                tmDissolutionSuppressor: "TM 溶解抑制剂",
                desolvationOptimizer: "脱溶优化剂",
                dendriteSuppressor: "枝晶抑制剂",
                polysulfideSuppressor: "多硫化物抑制剂",
                gasSuppressor: "气体抑制剂",
                flameRetardant: "阻燃剂"
            },
            outcomeOptions: {
                fastCharging: "快速充电",
                highVoltage: "高电压",
                hotboxThermal: "Hotbox（热处理）",
                htCycling: "高温循环",
                htStorage: "高温存储",
                ltCycling: "低温循环",
                rtCycling: "室温循环"
            }
        }
    },
    
    // Buttons and Actions
    addToFavorites: "添加到收藏 ★",
    saving: "保存中...",

    // Favorites
    favorites: {
        favorites: "收藏",
        goToFavorites: "进入收藏页面"
    },
    
    // Warning and Error Messages
    multipleMoleculesWarning: "找到多个匹配您搜索条件的分子。查找朋友功能已禁用。",
    findFriendError: "查找相似分子失败。请重试。",
    searchError: "搜索分子时出错。请重试。",
    
    // Not Found Message
    moleculeNotFound: {
        title: "您的查询没有返回任何分子。以下是几种可能的原因：",
        reasons: [
            "您的查询可能与电池不相关或存在错误。请检查。",
            "您的结果分子包含在企业版和联合开发的高级级别中。请升级。",
            "您的查询触及了我们隐藏的宝藏分子星系。请联系我们。",
            "您的查询可能涉及盐或阴离子分子，我们当前的数据库尚不支持。我们将在即将到来的更新中添加阴离子。"
        ],
        contactSales: "联系销售"
    },

    // Ambiguous Query Message
    ambiguousQuery: {
        message: "您的查询存在歧义。缩写 {{query}} 可能对应以下任一分子：{{options}}。请细化您的查询。"
    }
};
