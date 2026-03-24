export default {
  // Page header
  title: "첨가제가 셀 성능에 미치는 영향",
  subtitle: "SES 내부 실험 데이터로 훈련된 기본 AI 모델 또는 사용자 데이터로 미세 조정된 모델을 사용하여 첨가제가 셀 성능 지표(사이클 수명, 쿨롱 효율, 속도 성능)에 미치는 영향을 예측합니다",
  beta: "베타",
  disclaimerTitle: "면책 조항",
  disclaimer: "<strong>참고:</strong> 이 기능은 사용자 정의 벤치마크 전해액을 사용하여 첨가제가 있는 셀과 없는 셀의 성능을 비교함으로써 새로운 첨가제의 영향을 평가합니다. 다른 셀 설계 또는 벤치마크 전해액에 적용할 경우 결과가 달라질 수 있습니다.",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "설계 설정",
    label: "셀 화학",
    loading: "로딩 중...",
    systemSpecs: {
      title: "셀 사양",
      cathode: "양극:",
      anode: "음극:",
      benchmarkElectrolyte: "기준 전해액:",
      cellDesign: "셀 설계:"
    }
  },

  // Model Selection
  modelSelection: {
    label: "모델 선택",
    placeholder: "예측 모델을 선택하세요",
    baseModel: "기본 모델",
    finetunedModels: "미세 조정 모델",
    muModels: "MU 모델",
    columns: {
      modelName: "모델 이름",
      modelId: "모델 ID",
      baseModel: "기본 모델"
    },
    sectionTitle: "1. 모델 선택"
  },
  formulas: {
    sectionTitle: "2. 첨가제 배합 구성",
    sectionTitleTooltip: "첨가제 선택은 선택 사항입니다. 하나의 포뮬레이션에는 1개, 2개, 3개 또는 4개의 첨가제를 포함할 수 있습니다.",
    formulaA: "포뮬레이션 A",
    formulaB: "포뮬레이션 B",
    additive1Label: "공통 첨가제 1",
    additive2Label: "공통 첨가제 2",
    additive3Label: "공통 첨가제 3",
    newAdditiveSmiles: "새 첨가제 SMILES",
    weightPercentageLabel: "중량 백분율 (wt%)"
  },

  // Additive input
  additive: {
    label: "첨가제의 SMILES",
    required: "*",
    placeholder: "유효한 SMILES 첨가제를 입력하세요"
  },

  // Weight percentage
  weightPercentage: {
    label: "중량 백분율 (wt%)",
    tooltip: "사용자 정의 값은 MU2에서 출시될 예정입니다"
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
  
  // Invalid SMILES
  invalidSmiles: {
    title: "잘못된 SMILES 형식",
    description: "입력된 내용이 유효한 SMILES 분자식이 아닌 것 같습니다.",
    suggestion: "유효한 SMILES 문자열을 입력해주세요. 또는 다음 예시를 시도해보세요:"
  },
  
  // Calculate button
  calculate: {
    button: "계산",
    calculated: "계산됨"
  },
  
  // Results
  results: {
    title: "셀 성능 예측",
    improvementHint: "포뮬레이션 A 대비 포뮬레이션 B의 성능",
    titleTip: "부정적(Negative)은 지정된 첨가제를 추가한 후 셀의 성능이 벤치마크 전해질을 사용한 셀과 동등하거나 더 나쁘다는 것을 의미합니다.\n긍정적(Positive)은 지정된 첨가제를 추가한 후 셀의 성능이 벤치마크 전해질을 사용한 셀보다 더 좋다는 것을 의미합니다.",
    negativeTitle: "부정적 (Negative)",
    positiveTitle: "긍정적 (Positive)",
    negativeTip: "지정된 첨가제를 추가한 후 셀의 성능이 벤치마크 전해질을 사용한 셀과 동등하거나 더 나쁩니다.",
    positiveTip: "지정된 첨가제를 추가한 후 셀의 성능이 벤치마크 전해질을 사용한 셀보다 더 좋습니다.",
    upgradeToViewMetrics: "25°C 및 45°C에서 더 많은 메트릭을 보려면 플랜을 업그레이드하세요",
    badgeTitle: "배지 색상 지표 (사이클 수명 및 비율 성능만 적용)",
    badgeDescriptions: {
      gainLabel: "성능 향상",
      lossLabel: "성능 저하",
      levelLow: "< 5%",
      levelMid: "5%～25%",
      levelHigh: "> 25%"
    },
    descriptions: {
      ceLabel: "코로나빅 효율",
      cycleLifeLabel: "사이클 수명",
      ratePerformanceLabel: "비율 성능",
      ce: "BOL에서 EOL까지 각 사이클의 평균 CE",
      cycleLife: "방전 용량 유지율이 80%에 도달하는 사이클 수",
      ratePerformance: "0.5C 방전 대비 5C 방전 시 용량 유지율"
    },
    temperatureTabs: {
      temp25: "25°C 성능",
      temp45: "45°C 성능"
    },
    performance: {
      cycleLife25: "사이클 수명",
      ce25: "코로나빅 효율",
      ratePerformance25: "비율 성능",
      cycleLife45: "사이클 수명",
      ce45: "코로나빅 효율"
    },
    status: {
      positive: "긍정적",
      negative: "부정적",
      neutral: "중성",
      restricted: "제한됨"
    },
    confidence: "신뢰도"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM 분석",
    analyzed: "분석됨",
    title: "LLM 분석",
    sections: {
      nickelOptimization: "1. 니켈 탈수소 최적화",
      cyclingOptimization: "2. 4°C 사이클 최적화",
      recommendations: "3. 종합 권장사항"
    },
    references: "참고문헌"
  },

  // Analysis timing
  analysis: {
    analyzing: "분석 중",
      analyzingForSeconds: "{{seconds}}초",
    analyzingForMinutesAndSeconds: "{{minutes}}분 {{seconds}}초"
  },
  
  // General UI text
  ui: {
    calculating: "계산 중...",
    analyzing: "분석 중...",
    startingAnalysis: "LLM 분석을 시작하고 있습니다...",
    analysisPlaceholder: "예측 결과에 대한 분석을 시작하려면 \"LLM 분석\" 버튼을 클릭하세요.",
    pleaseSelectBattery: "배터리 시스템을 선택해주세요",
    invalidBatterySystem: "잘못된 배터리 시스템이 선택되었습니다",
    calculationFailed: "성능 예측 계산에 실패했습니다. 다시 시도해주세요.",
    analysisFailed: "LLM 분석 시작에 실패했습니다. 다시 시도해주세요.",
    sessionNotInitialized: "세션이 초기화되지 않았습니다. 페이지를 새로고침한 후 다시 시도해주세요.",
    predictionFirst: "LLM 분석을 요청하기 전에 먼저 예측을 실행해주세요"
  },
  
  // Analysis status
  analysisStatus: {
    noAnalysis: "분석 결과 없음",
    available: "사용 가능",
    notAvailable: "사용 불가"
  },
  
  // Filter options
  filters: {
    smilesSearch: "SMILES 검색",
    timeRange: "시간 범위",
    status: "상태",
    clearFilters: "필터 지우기",
    timeOptions: {
      allTime: "모든 시간",
      today: "오늘",
      thisWeek: "이번 주",
      thisMonth: "이번 달"
    },
    statusOptions: {
      allStatus: "모든 상태",
      completed: "완료",
      pending: "대기 중",
      failed: "실패"
    }
  },
  
  // History
  history: {
    title: "예측 기록",
    newDesign: "새 디자인",
    newPrediction: "새 예측",
    train: "훈련",
    searchPlaceholder: "파일명으로 검색...",
    loadingText: "로딩 중...",
    error: "오류",
    noResults: "디자인 기록이 없습니다",
    cannotDeleteDemo: "데모 기록을 삭제할 수 없습니다",
    status: {
      completed: "완료됨"
    },
    actions: {
      viewResults: "결과 보기",
      delete: "삭제",
      deleteConfirm: "이 기록을 삭제하시겠습니까?",
      deleteFailed: "기록 삭제에 실패했습니다"
    },
    loading: {
      message: "히스토리 데이터 로딩 중...",
      error: "오류",
      retry: "재시도",
      failedToLoad: "히스토리 데이터 로드에 실패했습니다"
    }
  },

  // Records
  records: {
    searchPlaceholder: "레코드 ID로 검색",
    allModels: "모든 모델",
    clearFilters: "필터 지우기",
    showingRecords: "{{count}}개 / {{total}}개 표시 중"
  },

  // Models
  models: {
    loadingText: "로딩 중...",
    error: "오류",
    noResults: "모델을 찾을 수 없습니다",
    showingRecords: "{{count}}개 / {{total}}개 표시 중",
    statusOnline: "온라인",
    statusTrained: "훈련됨",
    statusOffline: "오프라인",
    statusTraining: "훈련 중",
    statusFail: "실패",
    filters: {
      searchPlaceholder: "모델 ID 또는 이름으로 검색...",
      allStatus: "모든 상태",
      allBaseModels: "모든 기본 모델",
      selectStatus: "상태 선택",
      selectBaseModel: "기본 모델 선택",
      clearFilters: "필터 지우기",
      selectDate: "날짜 선택",
      refresh: "새로 고침"
    },
    columns: {
      modelId: "모델 ID",
      modelName: "모델 이름",
      baseModel: "기본 모델",
      status: "상태",
      created: "생성됨",
      createdBy: "작성자",
      actions: "작업"
    },
    actions: {
      viewDetails: "세부 정보 보기"
    }
  },

  // Form validation messages
  validation: {
    selectModel: "예측 모델을 선택해 주세요",
    atLeastOneAdditive: "포뮬레이션 A 또는 포뮬레이션 B 중 하나 이상에 완전한 첨가제 항목(이름/SMILES 및 0보다 큰 Weight Percentage 모두 필수)을 입력해 주세요",
    invalidSmiles: "{{formulas}}에 입력된 SMILES가 유효하지 않습니다. 수정 후 계산하세요.",
    duplicateAdditive: "{{formulas}} 에 중복된 첨가제가 있습니다. 확인해 주세요",
    invalidWeightRange: "{{fieldLabel}}의 Weight Percentage는 0보다 크고 {{max}} 이하여야 합니다.",
  },

  // Battery system fallback
  batterySystemFallback: "배터리 시스템",

  // Train disabled tip
  trainDisabledTip: "사용을 원하시면 이메일 <emailLink>mu.sales@ses.ai</emailLink>로 당사 팀에 문의해 주세요."
}
