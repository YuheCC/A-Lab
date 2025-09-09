export default {
  // Page header
  title: "첨가제 분자를 이용한 셀 성능 예측",
  beta: "베타",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "배터리 시스템 선택",
    label: "배터리 시스템",
    loading: "로딩 중...",
    systemSpecs: {
      title: "시스템 사양",
      cathode: "양극:",
      anode: "음극:",
      benchmarkElectrolyte: "기준 전해액:",
      cellDesign: "셀 설계:"
    }
  },
  
  // Additive input
  additive: {
    label: "첨가제 (SMILES)",
    required: "*",
    placeholder: "SMILES 분자식을 입력하세요"
  },
  
  // Molecule information
  moleculeInfo: {
    title: "분자 정보",
    loading: "분자 세부정보를 조회하는 중...",
    properties: {
      smiles: "SMILES:",
      espMin: "ESP MIN:",
      molecularWeight: "분자량:",
      predictedMp: "예측 융점:",
      umapX: "UMAP X:",
      predictedBp: "예측 끓는점:",
      umapY: "UMAP Y:",
      predictedFp: "예측 인화점:",
      homo: "HOMO:",
      combustionEnthalpy: "연소 엔탈피:",
      lumo: "LUMO:",
      commercialViability: "상업적 실행가능성:",
      espMax: "ESP MAX:",
      functionalGroups: "기능기:"
    },
    structurePlaceholder: {
      line1: "분자",
      line2: "구조"
    }
  },
  
  // SMILES not found
  smilesNotFound: {
    title: "SMILES를 찾을 수 없음",
    description: "입력하신 SMILES 문자열이 데이터베이스에서 발견되지 않았습니다.",
    suggestion: "유효한 SMILES 문자열을 다시 입력하거나 다음 예시를 시도해보세요:",
    examples: {
      ec: "에틸렌 카보네이트",
      water: "물"
    }
  },
  
  // Calculate button
  calculate: {
    button: "계산",
    calculated: "계산됨"
  },
  
  // Results
  results: {
    title: "셀 성능 예측",
    temperatureTabs: {
      temp25: "25°C 성능",
      temp45: "45°C 성능"
    },
    performance: {
      cycleLife25: "25 °C 사이클 수명",
      ce25: "25 °C CE",
      ratePerformance25: "25 °C 비율 성능",
      cycleLife45: "45 °C 사이클 수명",
      ce45: "45 °C CE"
    },
    status: {
      positive: "긍정적",
      negative: "부정적",
      neutral: "중성"
    },
    confidence: "신뢰도"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM 분석",
    title: "LLM 분석",
    sections: {
      nickelOptimization: "1. 니켈 탈수소 최적화",
      cyclingOptimization: "2. 4°C 사이클 최적화",
      recommendations: "3. 종합 권장사항"
    },
    references: "참고문헌"
  },
  
  // History
  history: {
    title: "예측 기록",
    newPrediction: "새 예측",
    searchPlaceholder: "파일명으로 검색...",
    status: {
      completed: "완료됨"
    },
    actions: {
      viewDetails: "세부사항 보기",
      delete: "삭제",
      deleteConfirm: "이 기록을 삭제하시겠습니까?"
    },
    noResults: {
      message: "필터에 일치하는 예측 기록을 찾을 수 없습니다.",
      clearFilters: "모든 필터 지우기"
    }
  }
}