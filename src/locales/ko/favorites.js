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
  backToSearch: '검색으로 돌아가기',
  
  // Table Headers
  tableHeaders: {
    image: '이미지',
    smiles: 'SMILES',
    molecularWeight: '분자량',
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: '녹는점 (°C)',
    boilingPoint: '끓는점 (°C)',
    flashPoint: '예측 인화점 (°C)',
    combustionEnthalpy: '연소 엔탈피 (eV)',
    commercialViability: '상용 가능성',
    espMin: 'ESP 최소값 (eV)',
    espMax: 'ESP 최대값 (eV)',
    functionalGroups: '작용기',
    umapCoordinates: 'UMAP X/Y',
    addedDate: '추가 날짜',
    commercialLink: '상업적 링크',
    actions: '삭제'
  },
  
  // Bulk Operations
  bulkDelete: '선택된 항목 삭제',
  bulkDeleting: '삭제 중...',
  bulkDeleteConfirm: '즐겨찾기에서 {{count}}개의 분자를 제거하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  bulkDeleteSuccess: '즐겨찾기에서 {{count}}개의 분자를 성공적으로 제거했습니다',
  bulkDeletePartialError: '{{total}}개 중 {{failed}}개 분자 제거에 실패했습니다. 다시 시도해주세요.',
  bulkDeleteError: '즐겨찾기에서 분자 제거에 실패했습니다. 다시 시도해주세요.',
  
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
    meltingPoint: '녹는점 (°C)',
    boilingPoint: '끓는점 (°C)',
    molecularWeight: '분자량',
    espMin: 'ESP 최소값 (eV)',
    espMax: 'ESP 최대값 (eV)'
  },
  
  // Chart Labels
  chartLabels: {
    selectedMolecules: '선택된 분자',
    reference: '참조',
    highSolubility: '높은 용해도',
    mediumSolubility: '중간 용해도',
    lowSolubility: '낮은 용해도',
    diluent: '희석제',
    solubilityRegion: '영역'
  },
  
  // Confirmation and Messages
  confirmRemove: '이 분자를 즐겨찾기에서 제거하시겠습니까?',
  moleculeRemoved: '분자가 즐겨찾기에서 제거됨',
  removeFailed: '즐겨찾기에서 제거 실패. 다시 시도하세요.',
  removeFromFavorites: '즐겨찾기에서 제거',
  alreadyInFavorites: '이 분자는 이미 즐겨찾기에 있습니다!',
  
  // Data Values
  notAvailable: 'N/A',
  viewLink: '링크 보기',
  
  // Buttons
  buttons: {
    showAnalysis: '선택된 분자 분석',
    closeButton: '×'
  },
  
  // Tooltips
  tooltips: {
    removeFromFavorites: '즐겨찾기에서 제거',
    selectAll: '모든 분자 선택',
    viewCommercialLink: '상업적 링크 보기'
  }
}; 