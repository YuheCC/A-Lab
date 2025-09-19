export default {
  title: '염 및 용매 구성',
  subtitle: '전해질을 구성하고 사용자 지정하세요',
  comingSoon: '곧 제공 예정',
  actions: {
    backToList: '목록으로 돌아가기'
  },
  create: {
    newConfiguration: '새 구성'
  },

  saltConfiguration: {
    title: '염 구성'
  },

  cationSelection: {
    label: '양이온 선택'
  },

  anionSelection: {
    label: '음이온 선택 (1-2 선택)'
  },

  totalSaltConcentration: {
    label: '총 염 농도 (mol/kg)'
  },

  anionFraction: {
    label: 'BF₄⁻ 분율'
  },

  fractionType: {
    label: '분율 유형',
    mole: '몰 분율',
    weight: '질량 분율'
  },

  saltSummary: {
    title: '염 요약',
    selected: '선택됨',
    totalConcentration: '총 염 농도',
    fractions: '분율',
    fractionType: '분율 유형',
    totalFraction: '총 분율'
  },

  solventConfiguration: {
    title: '용매 구성'
  },

  smilesString: {
    label: 'SMILES 문자열',
    placeholder: 'SMILES 문자열을 입력하세요'
  },

  fraction: {
    label: '분율 (최소: 0.05)'
  },

  removeSolvent: '용매 제거',
  addSmiles: 'SMILES 추가 (최대 3)',

  solventSummary: {
    title: '용매 요약',
    solvent: '용매',
    fractionType: '분율 유형',
    totalFraction: '총 분율',
    emptyPlaceholder: '비어 있음 (0), 비어 있음 (0)'
  },

  submit: {
    button: '구성 제출'
  },

  ui: {
    calculating: '계산 중...'
  },

  result: {
    processing: '알고리즘 모델 계산 중',
    description: '시스템이 모델 매개변수를 처리하고 있습니다. 시간이 걸릴 수 있으니 잠시 기다려 주세요',
    notice: '모델 훈련이 완료되면 시스템에서 자동으로 알림을 보내드립니다',
    action: '이 페이지를 닫아도 백그라운드 계산 프로세스에는 영향을 주지 않습니다',
    close: '구성으로 돌아가기'
  },
  resultTip: {
    close: '닫기'
  },
  history: {
    title: '분석 기록',
    newAnalysis: '새 분석',
    loading: {
      message: '로딩 중...',
      error: '오류'
    },
    noResults: {
      message: '분석 기록이 없습니다.'
    },
    salt: '염',
    solvent: '용매',
    unit: {
      molPerKg: 'mol/kg'
    },
    actions: {
      viewDetails: '상세 보기',
      delete: '삭제',
      deleteConfirm: '이 기록을 삭제하시겠습니까?',
      deleteFailed: '기록 삭제에 실패했습니다'
    }
  },
  list: {
    columns: {
      analysisId: '분석 ID',
      saltFraction: '염 (분율)',
      saltFractionType: '분율 유형 (염)',
      solventFraction: '용매 (분율)',
      solventFractionType: '분율 유형 (용매)',
      concentration: '농도',
      created: '생성일',
      status: '상태',
      actions: '작업'
    }
  }
  ,
  results: {
    analysisResults: '분석 결과',
    systemProperties: '시스템 속성',
    clusterAnalysis: '클러스터 분석',
    size: '크기',
    category: '범주',
    fraction: '분율',
    analysisCharts: '분석 차트',
    radialDistribution: '방사형 분포 함수 및 배위수',
    radialDistributionSubtitle: '방사형 분포 함수 및 배위수',
    meanSquareDisplacement: '평균 제곱 변위',
    meanSquareDisplacementSubtitle: '평균 제곱 변위',
    chartPlaceholder: '차트 플레이스홀더',
    analysisFile: '분석 파일',
    downloadDescription: 'JSON 형식으로 전체 분석 결과 다운로드',
    fileContains: '파일에는 구성 세부정보, 분석 매개변수 및 계산 결과 포함',
    downloadJSON: 'JSON 다운로드',
    density: '밀도 (g/cm³)',
    viscosity: '점도 (cP)',
    conductivity: '전도도 (mS/cm)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG'
  }
  ,
  detail: {
    title: '분석 결과',
    viewSubtitle: '상세 분석 결과 보기',
    viewSubtitleWithId: '상세 분석 결과 보기',
    actionTitle: '분석 세부사항',
    loading: '분석 세부사항을 로딩 중...',
    saltSolventConfig: '염 및 용매 구성',
    saltSummary: '염 요약',
    solventSummary: '용매 요약',
    selected: '선택됨',
    weightConcentration: '질량 농도',
    fractions: '분율:',
    fractionType: '분율 유형:',
    totalFraction: '총 분율:',
    solvent: '용매:',
    weightFraction: '질량 분율',
    analysisResults: '분석 결과',
    systemProperties: '시스템 속성',
    clusterAnalysis: '클러스터 분석',
    size: '크기',
    category: '범주',
    fraction: '분율',
    analysisCharts: '분석 차트',
    radialDistribution: '방사형 분포 함수 및 배위수',
    radialDistributionSubtitle: '방사형 분포 함수 및 배위수',
    meanSquareDisplacement: '평균 제곱 변위',
    meanSquareDisplacementSubtitle: '평균 제곱 변위',
    chartPlaceholder: '차트 플레이스홀더',
    analysisFile: '분석 파일',
    downloadDescription: 'JSON 형식으로 전체 분석 결과 다운로드',
    fileContains: '파일에는 구성 세부정보, 분석 매개변수 및 계산 결과 포함',
    downloadJSON: 'JSON 다운로드',
    density: '밀도 (g/cm³)',
    viscosity: '점도 (cP)',
    conductivity: '전도도 (mS/cm)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG'
  }
};


