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
  radarTab: '雷达',
  espTab: 'ESP',
  moTab: 'MO',
  
  // Search and Table
  searchPlaceholder: '搜索分子...',
  loadingImage: '加载中...',
  
  // Table Headers
  tableHeaders: {
    image: '图像',
    smiles: 'SMILES',
    molecularWeight: 'Molecular Weight',
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: 'MP (°C)',
    boilingPoint: 'BP (°C)',
    espMin: 'ESP Min (eV)',
    espMax: 'ESP Max (eV)',
    functionalGroups: 'Functional Groups',
    umapCoordinates: 'UMAP X/Y',
    addedDate: '添加日期',
    actions: '操作'
  },
  
  // Analysis View
  radarAnalysis: '雷达分析',
  espAnalysis: 'ESP分析',
  moAnalysis: 'MO分析',
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
  
  // Confirmation and Messages
  confirmRemove: '您确定要从收藏夹中删除这个分子吗？',
  moleculeRemoved: '分子已从收藏夹中移除',
  removeFailed: '从收藏夹删除失败。请重试。',
  removeFromFavorites: '从收藏夹删除',
  alreadyInFavorites: '此分子已在您的收藏夹中！',
  
  // Molecule structure alt text
  moleculeStructure: '分子结构',
  
  // Data Values
  notAvailable: '不可用',
  
  // Buttons
  buttons: {
    showAnalysis: '分析已选择的',
    closeButton: '×'
  }
}; 