export default {
    // Search Input
    searchPlaceholder: "输入SMILES字符串、分子名称或查询条件",
    searchButton: "搜索",
    searchTooltip: `有效查询可以搜索分子的任何数值属性。例如：
 - "查找HOMO最多为-8的所有分子"
 - "查找LUMO至少为-2且分子量最多为200的所有分子"
对于更开放式的查询，请使用智能问答功能。

要绘制和查找SMILES字符串，请点击此图标或访问 {{pubChemUrl}}`,
    
    // Search Options
    findFriendsLabel: '查找"朋友"（具有相似物理化学性质的分子。"朋友"有意包括一些具有相似结构的分子和一些具有不同结构的分子。列表按与查询分子物理化学性质的相似程度排序。）',
    
    // Loading and Status Messages
    searching: "搜索中...",
    loadingMap: "正在加载分子宇宙地图",
    errorLoadingData: "数据加载错误",
    noDataAvailable: "无可用数据",
    
    // Search Results
    searchedMolecules: "搜索结果分子",
    moleculeNumber: "分子 #{{number}}",
    similarMolecules: "相似分子",
    similarMoleculeNumber: "相似分子 #{{number}}",
    
    // Property Names (Professional terms - not translated according to rules)
    properties: {
        smiles: "SMILES",
        chemicalFormula: "Chemical Formula",
        molecularWeight: "Molecular Weight",
        homo: "HOMO (eV)",
        lumo: "LUMO (eV)",
        espMin: "ESP Min (eV)",
        espMax: "ESP Max (eV)",
        predictedMp: "Predicted Melting Point (°C)",
        predictedBp: "Predicted Boiling Point (°C)",
        functionalGroups: "Functional Groups",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },
    
    // Buttons and Actions
    addToFavorites: "添加到收藏 ★",
    saving: "保存中...",
    
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
    }
}; 