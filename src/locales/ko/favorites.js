export default {
  analyzeSelected: '선택된 분자 분석',
  analyzeMolecules: '분자 분석',
  
  // Loading and Error States
  loadingMessage: '즐겨찾기 분자를 로딩 중...',
  errorLoadingFavorites: '즐겨찾기 로딩 오류',
  tryAgain: '다시 시도',
  
  // No Favorites State
  noFavoriteMolecules: '즐겨찾기 분자 없음',
  noFavoritesMessage: '아직 즐겨찾기에 분자를 추가하지 않았습니다.',
  goToSearchPage: '검색 페이지로 가서 분자를 찾고 추가하세요.',
  search: '검색',
  
  // Analysis Tabs
  radarTab: '레이더',
  espTab: 'ESP',
  moTab: 'MO',
  
  // Search and Table
  searchPlaceholder: '분자 검색...',
  loadingImage: '로딩 중...',
  
  // Table Headers
  tableHeaders: {
    image: '이미지',
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
    addedDate: '추가 날짜',
    actions: '삭제'
  },
  
  // Analysis View
  radarAnalysis: '레이더 분석',
  espAnalysis: 'ESP 분석',
  moAnalysis: 'MO 분석',
  moleculesSelected: '개 분자 선택됨',
  closeAnalysis: '분석 닫기',
  
  // Chart Titles
  chartTitles: {
    radar: '레이더 차트 속성',
    esp: 'ESP_MIN_EV vs ESP_MAX_EV 용해도 영역',
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
  confirmRemove: '이 분자를 즐겨찾기에서 제거하시겠습니까?',
  moleculeRemoved: '분자가 즐겨찾기에서 제거됨',
  removeFailed: '즐겨찾기에서 제거 실패. 다시 시도하세요.',
  removeFromFavorites: '즐겨찾기에서 제거',
  alreadyInFavorites: '이 분자는 이미 즐겨찾기에 있습니다!',
  
  // Molecule structure alt text
  moleculeStructure: '분자 구조',
  
  // Data Values
  notAvailable: '사용할 수 없음',
  
  // Buttons
  buttons: {
    showAnalysis: '선택된 분자 분석',
    closeButton: '×'
  }
}; 