export default {
  analyzeSelected: '選択項目を分析',
  analyzeMolecules: '分子を分析',

  // Loading and Error States
  loadingMessage: 'お気に入りの分子を読み込み中...',
  errorLoadingFavorites: 'お気に入りの読み込みエラー',
  tryAgain: '再試行',

  // No Favorites State
  noFavoriteMolecules: 'お気に入りの分子がありません',
  noFavoritesMessage: 'まだお気に入りに分子を追加していません。',
  goToSearchPage: '検索ページに移動して分子を見つけて追加してください。',
  search: '検索',

  // Analysis Tabs
  radarTab: 'レーダー',
  espTab: 'ESP',
  moTab: 'MO',

  // Search and Table
  searchPlaceholder: '分子を検索...',
  loadingImage: '読み込み中...',

  // Table Headers
  tableHeaders: {
    image: '画像',
    smiles: 'SMILES',
    molecularWeight: '分子量',
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: '融点 (°C)',
    boilingPoint: '沸点 (°C)',
    flashPoint: '引火点(°C)',
    combustionEnthalpy: '燃焼エンタルピー (eV)',
    commercialViability: '商業的実行可能性',
    espMin: 'ESP 最小 (eV)',
    espMax: 'ESP 最大 (eV)',
    functionalGroups: '官能基',
    umapCoordinates: 'UMAP X/Y',
    addedDate: '追加日',
    commercialLink: '商用リンク',
    actions: 'アクション'
  },

  // Bulk Operations
  bulkDelete: '選択項目を削除',
  bulkDeleting: '削除中...',
  bulkDeleteConfirm: 'お気に入りから{{count}}個の分子を削除してもよろしいですか？この操作は元に戻せません。',
  bulkDeleteSuccess: 'お気に入りから{{count}}個の分子を正常に削除しました',
  bulkDeletePartialError: '{{total}}個の分子のうち{{failed}}個の削除に失敗しました。もう一度お試しください。',
  bulkDeleteError: 'お気に入りからの分子の削除に失敗しました。もう一度お試しください。',

  // Analysis View
  radarAnalysis: 'レーダー分析',
  espAnalysis: 'ESP分析',
  moAnalysis: 'MO分析',
  moleculesSelected: '個の分子が選択されました',
  closeAnalysis: '分析を閉じる',

  // Chart Titles
  chartTitles: {
    radar: 'レーダーチャートプロパティ',
    esp: 'ESP_MIN_EV vs ESP_MAX_EV と溶解度領域',
    mo: 'HOMO_EV vs LUMO_EV'
  },

  // Chart Properties
  chartProperties: {
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: '融点 (°C)',
    boilingPoint: '沸点 (°C)',
    molecularWeight: '分子量',
    espMin: 'esp_min (eV)',
    espMax: 'esp_max (eV)'
  },

  // Chart Labels
  chartLabels: {
    selectedMolecules: '選択された分子',
    reference: '参照',
    highSolubility: '高溶解度',
    mediumSolubility: '中溶解度',
    lowSolubility: '低溶解度',
    diluent: '希釈剤',
    solubilityRegion: '領域'
  },

  // Confirmation and Messages
  confirmRemove: 'この分子をお気に入りから削除してもよろしいですか？',
  moleculeRemoved: '分子がお気に入りから削除されました',
  removeFailed: 'お気に入りからの削除に失敗しました。もう一度お試しください。',
  removeFromFavorites: 'お気に入りから削除',
  alreadyInFavorites: 'この分子はすでにお気に入りにあります！',

  // Data Values
  notAvailable: 'N/A',
  viewLink: 'リンクを表示',

  // Buttons
  buttons: {
    showAnalysis: '選択項目を分析',
    closeButton: '×'
  },

  // Tooltips
  tooltips: {
    removeFromFavorites: 'お気に入りから削除',
    selectAll: 'すべての分子を選択',
    viewCommercialLink: '商用リンクを表示'
  }
}; 