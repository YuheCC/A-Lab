export default {
  nodePopup: {
    title: "분자 세부정보",
    smiles: "SMILES",
    umapCoordinates: "UMAP 좌표",
    properties: "속성",
    copyAllData: "모든 데이터 복사",
    addToFavorites: "즐겨찾기에 추가",
    saving: "저장 중...",
    copySuccess: "분자 정보가 클립보드에 복사되었습니다!",
    copyError: "분자 데이터 복사에 실패했습니다"
  },
  molCard: {
    moleculeInfo: "분자 정보",
    invalidData: "유효하지 않은 분자 데이터 구조입니다.",
    noMoleculeData: "사용 가능한 분자 데이터가 없습니다.",
    loading: "로딩 중...",
    clickForDetails: "자세한 내용을 보려면 분자를 클릭하세요.",
    notAvailable: "N/A",
    clickToCollapse: "클릭하여 접기",
    clickToExpand: "클릭하여 자세한 내용 확장"
  },
  moleculeModal: {
    original: "원래 분자",
    findSimilar: "유사 찾기",
    similarWithCount: "유사 분자 ({{count}})",
    functionalGroupsTitle: "작용기",
    functionalGroupList: "에테르, 케탈, 탄산에스터, 에스터",
    unknown: "알 수 없음",
    types: {
      all: "모든 유형",
      solvent: "용매",
      diluent: "희석제",
      additive: "첨가제"
    },
    properties: {
      predictedFp: "예상 인화점",
      combustionEnthalpy: "연소 엔탈피",
      commercialViability: "상업적 실현 가능성"
    }
  },
  umapPlot: {
    controls: {
      resetViewport: "뷰포트 재설정",
      zoomIn: "확대",
      zoomOut: "축소"
    },
    properties: {
      cluster: "클러스터",
      molWeight: "분자량",
      espMax: "ESP 최대값:",
      espMin: "ESP 최소값:",
      homo: "HOMO",
      lumo: "LUMO",
      predictedMp: "예상 녹는점",
      predictedBp: "예상 끓는점"
    },
    units: {
      gPerMol: " g/mol",
      eV: " eV",
      celsius: " °C"
    }
  }
}; 