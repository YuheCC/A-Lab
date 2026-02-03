export default {
  title: '염 및 용매 구성',
  subtitle: '전해질을 구성하고 사용자 지정하세요',
  comingSoon: 'MU2에서 출시 예정',
  comingSoon2: 'MU2에서 출시 예정',
  tabs: {
    introduction: '소개',
    records: '기록'
  },
  introductionNew: {
    functionIntroTitle: '기능 소개',
    functionIntroDescription:
      'MU 플랫폼의 분자동역학(MD) 시뮬레이션은 고급 편극 가능(force field)과 자동화된 워크플로를 결합하여 높은 정확도로 이온과 용매의 상호작용을 포착합니다. 사용자는 알려진 분자뿐 아니라 미지의 분자를 포함한 전해질 조성식을 MU 포털로 제출하기만 하면 되며, 며칠 이내에 주요 물성에 대한 정량 예측을 받아 기존의 시행착오나 고전적 모델링보다 빠르고 정확한 인사이트를 얻을 수 있습니다.',
    functionIntroImageAlt: 'MD 시뮬레이션 워크플로',
    functionIntroCaption: '전해질 조성을 위한 MU 고유의 분자동역학(MD) 서비스',
    benefitsParagraph1:
      'MU 고유의 MD 서비스는 다양한 염 농도에서 Li⁺, 음이온, 용매 분자가 어떻게 배열되는지 분자 수준의 스냅샷으로 제공합니다.',
    benefitsParagraph2:
      '표준 시뮬레이션은 조성의 복잡도에 따라 약 3일 내로 완료되며, 이후 즉시 정량적 물성 예측을 제공해 전해질 설계 및 최적화를 빠르고 신뢰성 있게 지원하여 비용과 시간을 크게 절약합니다.',
    benefitsImageAlt: '농도 구간 전반에 걸친 MD 시뮬레이션',
    benefitsImageCaption: '농도 전 구간의 MD 시뮬레이션으로 전해질 설계를 가속화',
    propertiesIntroTitle: '물성 소개',
    propertiesIntroNoteDescription:
      '표준 물성으로 분류된 항목은 MD 시뮬레이션 완료 후 약 3일 이내에 제공됩니다. 그 외 물성은 납기 조정을 위해 팀에 문의해 주세요.',
    propertiesIntroNoteButton: '팀에 문의',
    groupStandardProperties: '표준 물성',
    standardRdfTitle: '방사형 분포 함수(RDF)',
    standardRdfDescription:
      '기준 입자에서 특정 거리에 입자가 존재할 확률을 나타내며, 전해질의 국소 구조를 설명합니다. 이는 용해도, 상용성, 이온 전도도, 용매화 구조, 계면 형성에 직접적인 영향을 미칩니다.',
    standardCnTitle: '배위수(CN)',
    standardCnDescription:
      '중심 이온을 둘러싼 인접 원자/분자의 평균 개수를 뜻하며, 전도도, 용해도, 계면 특성에 영향을 미칩니다.',
    standardSolvationClusterTitle: '용매화 클러스터 분석',
    standardSolvationClusterDescription: '전해질 용액에서 양이온과 음이온이 어떻게 결합하는지를 분석합니다. 대표적인 세 가지 유형은 다음과 같습니다.',
    standardSolvationClusterSsipBadge: 'SSIP',
    standardSolvationClusterSsipName: 'Solvent-Separated Ion Pair',
    standardSolvationClusterSsipDescription:
      '양이온과 음이온이 서로 연관되어 있지만 최소 한 개 이상의 용매 분자가 그 사이에 위치합니다. 고유전율 용매에서 지배적이며 Li⁺ 이동성과 전도도를 높이는 경향이 있습니다.',
    standardSolvationClusterCipBadge: 'CIP',
    standardSolvationClusterCipName: 'Contact Ion Pair',
    standardSolvationClusterCipDescription:
      '양이온과 음이온이 용매 없이 직접 접촉합니다. 고농도 염이나 저유전율 용매에서 자주 나타나며, 이온 전달 속도를 저하시켜 전도도를 낮출 수 있습니다.',
    standardSolvationClusterAggBadge: 'AGG',
    standardSolvationClusterAggName: 'Aggregate',
    standardSolvationClusterAggDescription:
      '여러 개의 양이온과 음이온이 연결된 큰 클러스터로, 농축 전해질에서 우세하며 전도도를 감소시키는 경우가 많습니다.',
    standardSolvationClusterImageAlt: '대표적인 Li 용매화 클러스터',
    standardSolvationClusterImageCaption: '대표적인 Li 용매화 클러스터',
    standardSolvationClusterSummary:
      'SSIP/CIP/AGG 비율은 용매화 환경과 점도, 이온 전도도, 전달수 등의 거동을 연계하는 중요한 구조 지표입니다.',
    standardDiffusivityTitle: '확산 계수',
    standardDiffusivityDescription:
      '외부 전기장이 없는 상태에서 입자가 무작위로 이동하는 속도이며, 이동도와 같은 수송 특성과 밀접하게 연관됩니다.',
    standardConductivityTitle: '전도도',
    standardConductivityDescription:
      '전기장 하에서 이온이나 다른 전하 입자가 전하를 운반하는 능력을 나타냅니다. 아래 그림은 예측된 이온 전도도가 실험값과 어떻게 비교되는지를 보여줍니다.',
    standardConductivityImageAlt: 'MD 시뮬레이션 정확도',
    standardConductivityImageCaption: 'MD 시뮬레이션 정확도: 예측 vs. 실측 이온 전도도',
    standardConductivityImageDescription1:
      '우리의 분자동역학 시뮬레이션(파란 점)은 0–40 mS·cm⁻¹ 범위의 100개 이상의 전해질 조성에서 실험적 이온 전도도 측정과 뛰어난 일치를 보입니다. 이 벤치마크에는 설폰, 설파이트, 에터, 에스터, 카보네이트, 니트릴, 실록산, 보레이트, 포스페이트 에스터 등 다양한 용매가 포함됩니다.',
    standardConductivityImageDescription2:
      '반면 외부 머신러닝 힘장(MLFF, 빈 원)은 소수의 카보네이트 시스템에서만 검증되었습니다. 우리의 힘장은 해당 시스템에서 MLFF에 상응하거나 더욱 우수한 정확도를 제공하며, MLFF 검증이 이루어지지 않은 보다 넓은 화학 공간에서도 높은 예측력을 유지합니다.',
    standardConductivityImageDescription3:
      '검은색 대각선(y = x) 부근에 데이터가 위치하는 것은 합성 전 시뮬레이션 기반 선별이 신뢰할 수 있음을 보여줍니다.',
    standardViscosityTitle: '점도',
    standardViscosityDescription: '유체가 전단 응력에 대해 흐름이나 변형을 저항하는 특성입니다.',
    standardDensityTitle: '밀도',
    standardDensityDescription: '단위 부피당 질량으로, 시스템의 치밀도를 반영합니다.',
    groupAdvancedAnalysis: '고급 분석',
    advancedIonCorrelationTitle: '이온-이온 상관',
    advancedIonCorrelationDescription: '이온 종 사이의 상관 관계가 무작위 분포를 넘어서는 정도를 측정합니다.',
    advancedStructureFactorTitle: '구조 인자(S(q))',
    advancedStructureFactorDescription: '원자 배열이 방사선을 산란시키는 방식을 정량화하여 역공간에서의 질서를 보여줍니다.',
    advancedDynamicStructureFactorTitle: '동적 구조 인자(S(q,ω))',
    advancedDynamicStructureFactorDescription: '입자의 시공간 상관을 기술하는 함수입니다.',
    advancedResidenceTimeTitle: '체류 시간',
    advancedResidenceTimeDescription: '이온 또는 분자가 다른 종의 근처에 머무는 평균 시간을 의미합니다.',
    groupCustomStudies: '맞춤 연구',
    customEdlTitle: 'EDL (전기 이중층)',
    customEdlDescription:
      '전하를 띤 표면 또는 전극 근처에 형성되는 이온 구조를 의미하며, SEI 형성 및 산화환원 반응을 추론하는 데 유용합니다.',
    customEdlImageAlt: '전기 이중층',
    customEdlImageCaption:
      '정밀하게 제어된 전위 하에서 형성된 전기 이중층 구조입니다. 이 MD 시뮬레이션 스냅샷은 사용자가 제공한 전해질 조성이 두 전극 사이에 위치하는 모습을 보여줍니다. 가상 셀의 전위를 변화시키면 전기 potential에 따른 계면 구조를 시각화할 수 있으며, 이는 최종 계면 화학을 좌우합니다.',
    customSolubilityTitle: '용해도',
    customSolubilityDescription:
      '평형 조건에서 특정 염 또는 분자가 주어진 매질에 균일하게 분산(용해 또는 혼합)될 수 있는 최대량을 나타냅니다.',
    customSolubilityImageAlt: '용해도 예측',
    customSolubilityImageCaption:
      '우리의 MD 시뮬레이션은 대표적인 리튬 염 LiFSI가 다양한 화학 구조와 작용기를 가진 19개 용매에서 보이는 용해도를 정확하게 예측합니다. 대각선에 가까운 점일수록 높은 예측 정확도를 의미하며, 합성 전 시뮬레이션 기반 선별에 대한 확신을 제공합니다.',
    standardSolvationClusterTableName: '용매화 클러스터 유형 및 분율 분석',
    table: {
      headers: {
        no: '번호',
        property: '물성',
        type: '유형',
        group: '그룹',
        estimatedTime: '예상 기간'
      },
      types: {
        structural: '구조 물성',
        dynamic: '동적 물성',
        structuralDynamic: '구조 + 동적',
        thermodynamic: '열역학 물성'
      },
      estimatedTimes: {
        short: '약 3일',
        medium: '약 1주',
        long: '약 1-2주'
      }
    }
  },
  actions: {
    backToList: '목록으로 돌아가기'
  },
  create: {
    newConfiguration: '새 구성'
  },

  simulationParameters: {
    title: '분자 시뮬레이션 매개변수'
  },

  temperature: {
    label: '온도 (K)',
    validation: {
      empty: '온도를 입력해 주세요',
      invalid: '유효한 온도 값을 입력해 주세요',
      tooLow: '온도는 238.15 K 이상이어야 합니다',
      tooHigh: '온도는 378.15 K 이하여야 합니다'
    }
  },

  saltConfiguration: {
    title: '염 구성'
  },

  cationSelection: {
    label: '양이온 선택'
  },

  anionSelection: {
    label: '음이온 선택 (최대 2)'
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
    calculating: '입력 검증 중, 계산 준비 중'
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

  tip: {
    calculating: '계산 중',
    calculatingDesc: '편극 역장 기반 분자동역학 시뮬레이션은 오랜 시간이 소요됩니다. 예상 시간 후에 결과를 확인할 수 있으며, 시스템에서 계산 상태를 알려드립니다',
    notice2: '이 페이지를 닫아도 백그라운드 계산 프로세스에는 영향을 주지 않습니다'
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
      viewDetails: '결과 보기',
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
      concentration: '염 농도',
      created: '생성일',
      status: '상태',
      process: '진행률',
      actions: '작업'
    }
  },

  status: {
    completed: '완료',
    success: '완료',
    running: '실행 중',
    failed: '실패',
    pending: '대기 중'
  }
  ,
  results: {
    analysisResults: '분석 결과',
    systemProperties: '시스템 속성',
    clusterAnalysis: '용매화 클러스터 유형 및 분율 분석',
    size: '첫 번째 용매화 클러스터의 음이온 수',
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
    diffusionCoefficient: '확산 계수（단위：10⁻¹⁰ m²/초）모든 성분',
    species: '성분',
    coefficient: '확산 계수（×10⁻¹⁰ m²/s）',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG',
    SSIPTitle: 'Solvent-Separated Ion Pair',
    CIPTitle: 'Contact Ion Pair',
    AGGTitle: 'Ion Aggregate'
  },
  guide: {
    help: '도움말',
    close: '닫기'
  },
  detail: {
    title: '분석 결과',
    viewSubtitle: '상세 분석 결과 보기',
    viewSubtitleWithId: '상세 분석 결과 보기',
    actionTitle: '분석 세부사항',
    loading: '분석 세부사항을 로딩 중...',
    missingId: '분석 ID 매개변수 누락',
    fetchError: '분석 세부사항 가져오기 실패',
    configuration: '구성 정보',
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
    clusterAnalysis: '용매화 클러스터 유형 및 분율 분석',
    size: '첫 번째 용매화 클러스터의 음이온 수',
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
    AGG: 'AGG',
    SSIPTitle: 'SSIP: 용매 분리 이온쌍 *양이온과 음이온이 연관되어 있지만 직접 접촉하지 않습니다. 대신 하나 이상의 용매 분자가 그들 사이에 위치합니다. 중간 극성 용매에서 전형적이며, 용매화 껍질이 이온을 분리시키지만 정전기적 상관관계는 유지됩니다. 예: Li⁺-(용매)-PF₆⁻',
    CIPTitle: 'CIP: 접촉 이온쌍 하나의 양이온과 하나의 음이온이 직접 접촉하며, 사이에 용매 분자가 끼어있지 않습니다. 낮은 유전율 용매나 높은 염 농도에서 일반적입니다. SSIP보다 강한 결합. 예: Li⁺·PF₆⁻ 직접 접촉.',
    AGGTitle: 'AGG: 이온 응집체 둘 이상의 양이온과 음이온의 조합이 직접 접촉하는 더 큰 연관 구조. 이량체, 삼량체 또는 더 큰 클러스터일 수 있습니다. 고농도, 불량 용매 또는 이온 액체에서 자주 나타납니다. 예: (Li⁺·PF₆⁻)ₙ 클러스터, 또는 Li⁺가 여러 음이온을 연결.'
  }
};


