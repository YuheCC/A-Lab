export default {
  analyzeSelected: '分析已选择的',
  analyzeMolecules: '分析分子',
  
  // Loading and Error States
  loadingMessage: '正在加载您收藏的分子...',
  errorLoadingFavorites: '加载收藏夹出错',
  tryAgain: '重试',
  
  // No Favorites State
  noFavoriteMolecules: '没有收藏的分子',
  noFavoritesMessage: '您还没有将任何分子添加到收藏夹。',
  goToSearchPage: '前往搜索页面查找并添加分子。',
  search: '搜索',
  
  // Analysis Tabs
  radarTab: '雷达图',
  espTab: 'ESP',
  moTab: 'MO',
  
  // Search and Table
  searchPlaceholder: '搜索分子...',
  loadingImage: '加载中...',
  
  // Table Headers
  tableHeaders: {
    image: '图像',
    smiles: 'SMILES',
    molecularWeight: '分子量',
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: '熔点 (°C)',
    boilingPoint: '沸点 (°C)',
    flashPoint: '闪点 (°C)',
    combustionEnthalpy: '燃烧焓 (eV)',
    commercialViability: '商业可行性',
    espMin: 'ESP Min (eV)',
    espMax: 'ESP Max (eV)',
    functionalGroups: '功能基团',
    umapCoordinates: 'UMAP X/Y',
    addedDate: '添加日期',
    commercialLink: '商业链接',
    actions: '操作'
  },
  
  // Bulk Operations
  bulkDelete: '删除已选择的',
  bulkDeleting: '删除中...',
  bulkDeleteConfirm: '您确定要从收藏夹中删除 {{count}} 个分子吗？此操作无法撤销。',
  bulkDeleteSuccess: '成功从收藏夹中删除了 {{count}} 个分子',
  bulkDeletePartialError: '删除失败 {{failed}} 个（共 {{total}} 个）分子。请重试。',
  bulkDeleteError: '从收藏夹删除分子失败。请重试。',
  
  // Analysis View
  radarAnalysis: '雷达图分析',
  espAnalysis: 'ESP 分析',
  moAnalysis: 'MO 分析',
  moleculesSelected: '个分子已选择',
  closeAnalysis: '关闭分析',
  
  // Chart Titles
  chartTitles: {
    radar: '雷达图属性',
    esp: 'ESP_MIN_EV vs ESP_MAX_EV 溶解度区域图',
    mo: 'HOMO_EV vs LUMO_EV'
  },
  
  // Chart Properties
  chartProperties: {
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: 'MP (°C)',
    boilingPoint: 'BP (°C)',
    molecularWeight: 'Molecular Weight',
    espMin: 'esp_min (eV)',
    espMax: 'esp_max (eV)'
  },
  
  // Chart Labels
  chartLabels: {
    selectedMolecules: '已选择的分子',
    reference: '参考',
    highSolubility: '高溶解度',
    mediumSolubility: '中等溶解度',
    lowSolubility: '低溶解度',
    diluent: '稀释剂',
    solubilityRegion: '区域'
  },
  
  // Confirmation and Messages
  confirmRemove: '您确定要从收藏夹中删除这个分子吗？',
  moleculeRemoved: '分子已从收藏夹中移除',
  removeFailed: '从收藏夹删除失败。请重试。',
  removeFromFavorites: '从收藏夹删除',
  alreadyInFavorites: '此分子已在您的收藏夹中！',
  
  // Data Values
  notAvailable: 'N/A',
  viewLink: '查看链接',
  
  // Buttons
  buttons: {
    showAnalysis: '分析已选择的',
    closeButton: '×'
  },
  
  // Tooltips
  tooltips: {
    removeFromFavorites: '从收藏夹删除',
    selectAll: '选择所有分子',
    viewCommercialLink: '查看商业链接'
  }
}; 