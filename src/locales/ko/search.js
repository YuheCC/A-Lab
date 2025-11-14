export default {
    // Search Tabs
    tabs: {
        organic: '용매, 첨가제 및 희석제',
        inorganic: '무기 용매, 첨가제 및 희석제',
        anions: '염 음이온',
        third: '고체 전해질'
    },
    
    // Search Input
    searchPlaceholder: "SMILES 문자열, 분자명 또는 특성 쿼리를 입력하세요",
    searchButton: "검색",
    searchTooltip: '<p>유효한 쿼리는 분자의 모든 수치적 특성을 검색할 수 있습니다. 예시:</p><p>- "HOMO가 최대 -8인 모든 분자 찾기"<br/>- "LUMO가 최소 -2이고 분자량이 최대 200인 모든 분자 찾기"</p><p>더 개방적인 쿼리의 경우 Ask를 사용하세요.</p><p>SMILES 문자열을 그리거나 찾으려면 이 아이콘을 클릭하거나 <a>{{pubChemUrl}}</a>을 방문하세요</p>',
    drawMolecule: "분자 그리기",
    importSmilesTooltip: 'SMILES를 그리기 도구로 가져오기.',
    similarityPrompt: '다음과 구조적으로 유사한 분자를 검색하세요:',
    similarityTooltip: {
        title: '검색',
        lines: [
            '검색 알고리즘은 입력한 분자를 데이터베이스에서 조회하여 유사한 분자를 찾아줍니다.',
            'SMILES 문자열, 분자명 또는 일반적인 약어로 된 분자 목록을 얼마든지 입력하세요.',
            '편향되지 않은 검색을 원한다면 이 상자를 비워 두세요.',
            '왼쪽의 그리기 아이콘을 클릭하면 원하는 분자를 그려 SMILES 문자열을 자동으로 입력할 수 있습니다.',
        ],
    },
    propertyConstraints: {
        intro: '다음과 같은 물성 제약 조건을 적용합니다:',
        tooltipTitle: '사용자 지정 물성 제약 조건',
        tooltipIntro: 'Search는 원하는 분자 구조와 물성에 맞춰 결과를 조정할 수 있는 자연어 인터페이스를 지원합니다. 다음 항목을 요청할 수 있습니다:',
        atomCounts: '원소별 원하는 원자 수',
        functionalGroups: '특정 작용기의 존재 또는 부재',
        commercialAvailability: '상용화 가능 여부',
        valueRangeBullet: '{{properties}}에 대한 값 범위 또는 경계',
    },
    
    // Search Options
    findFriendsLabel: '의도된 용도:',
    findFriendsDescription: '입력한 분자와 유사한 구조를 가지며, 아래의 배터리 사용 사례에 이론적으로 호환되는 물리화학적 특성을 가진 분자:',
    useCaseTooltipTitle: 'SES molecule property optimizer',
    useCaseTooltipDescription: "Enter what type of battery molecule you're looking for, and SES's molecule property optimizer will display results that are more likely to be compatible with your chosen use case.",
    
    searchRange: '검색 범위',
    nearbyFriends: '가까운 친구들',
    distantFriends: '먼 친구들',
    searchRangeTooltip: '슬라이더를 왼쪽으로 이동하면 구조와 관계없이 사용 사례에 가장 적합한 물성의 분자를 우선합니다. 오른쪽으로 이동하면 입력한 분자와 구조가 가장 유사한 분자를 우선합니다.',
    advancedOptions: '고급 옵션',
    intelligentCompute: '지능형 친구 찾기 연산',
    intelligentFindFriendsLabel: '지능형 "친구" 찾기',
    intelligentFindFriendsTooltip: 'LLM으로 수백 개의 분자를 살펴보고, 사용 사례에 더 적합한 분자를 찾아보세요. 최상의 결과를 위해 계산 성능을 높이고 (고급 옵션)에서 배터리 시스템 정보를 입력하세요.',
    intelligentFindFriendsLimitLabel: '이번 달 남은 횟수: {{remaining}} / {{limit}}',
    showHypothetical: '가상 분자 표시',
    showHypotheticalTooltip: '공개 카탈로그에 없는 알고리즘 생성 후보를 포함합니다. 이용 가능성과 합성 가능성은 불확실합니다.',
    computeDisabled: '비활성화',
    computeLow: '낮음',
    computeMedium: '중간',
    computeHigh: '높음',
    computeExtreme: '극대',
    cathode: '양극',
    anode: '음극',
    salt: '염',
    solvent: '전해질 조성',
    cellDesign: '셀 설계',
    performanceMetric: '원하는 성능 지표',
    extraRequests: '사용자 지정 분자 제약(최상의 결과를 위해 지능형 친구 찾기를 활성화하세요):',
    extraRequestsPlaceholder: '에테르 작용기를 가진 분자만 표시합니다.',
    custom: '사용자 정의',
    upgradeEnterprise: '엔터프라이즈 계정으로 업그레이드',
    upgradeAccount: '계정을 업그레이드',
    computeWarning: '지능형 친구 찾기의 높은 성능에는 추가 컨텍스트가 필요합니다. 계산 파워가 낮음으로 설정되었습니다.',
    batteryInfoRecommendation: '지능형 친구 찾기가 가장 관련성 높은 분자를 찾도록 돕는 추천 배터리 정보: 양극, 음극, 염, 전해질 조성, 셀 설계, 원하는 성능 지표.',

    
    searchRange: '검색 범위',
    nearbyFriends: '가까운 친구들',
    distantFriends: '먼 친구들',
    searchRangeTooltip: '슬라이더를 왼쪽으로 이동하면 구조와 관계없이 사용 사례에 가장 적합한 물성의 분자를 우선합니다. 오른쪽으로 이동하면 입력한 분자와 구조가 가장 유사한 분자를 우선합니다.',
    advancedOptions: '고급 옵션',
    intelligentCompute: '지능형 친구 찾기 연산',
    computeDisabled: '비활성화',
    computeLow: '낮음',
    computeMedium: '중간',
    computeHigh: '높음',
    computeExtreme: '극대',
    cathode: '양극',
    anode: '음극',
    salt: '염',
    solvent: '전해질 조성',
    cellDesign: '셀 설계',
    performanceMetric: '원하는 성능 지표',
    extraRequests: '사용자 지정 분자 제약(최상의 결과를 위해 지능형 친구 찾기를 활성화하세요):',
    extraRequestsPlaceholder: '에테르 작용기를 가진 분자만 표시합니다.',
    custom: '사용자 정의',
    upgradeEnterprise: '엔터프라이즈 계정으로 업그레이드',
    upgradeAccount: '계정을 업그레이드',
    computeWarning: '지능형 친구 찾기의 높은 성능에는 추가 컨텍스트가 필요합니다. 계산 파워가 낮음으로 설정되었습니다.',
    intelligentFindFriendsLimitLabel: '이번 달 남은 횟수: {{remaining}} / {{limit}}',

    // Loading and Status Messages
    searching: "검색 중...",
    loadingMap: "분자 우주의 지도를 로딩 중",
    errorLoadingData: "데이터 로딩 오류",
    noDataAvailable: "사용 가능한 데이터가 없습니다",
    tooManyRequests: "요청이 너무 많습니다. 잠시 기다린 후 다시 시도하세요.",
    
    // Search Results
    searchedMolecules: "검색된 분자",
    moleculeNumber: "분자 {{number}}",
    similarMolecules: "유사한 분자",
    similarMoleculeNumber: "유사한 분자 #{{number}}",
    selectMolType: "최상의 결과를 위해 분자 유형을 선택하세요",
    
    // Property Names (Professional terms - not translated according to rules)
    properties: {
        smiles: "SMILES",
        casrn: "CAS #",
        chemicalFormula: "Chemical Formula",
        molecularWeight: "Molecular Weight",
        overallScore: "Overall Score",
        homo: "HOMO",
        lumo: "LUMO",
        espMin: "ESP Min",
        espMax: "ESP Max",
        molecularVolume: "Molecular Volume",
        fluorideBondDissociationEnergy: "F Bond Dissociation Energy",
        predictedMp: "Predicted Melting Point",
        predictedBp: "Predicted Boiling Point",
        predictedFp: "Predicted Flash Point",
        combustionEnthalpy: "Combustion Enthalpy",
        commercialScore: "Commercial Score",
        functionalGroups: "Functional Groups",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },

    moleculeTypes: {
        selectMolType: "분자 유형",
        solvent: "용매",
        cosolvent: "공용매",
        diluent: "희석제",
        primarySalt: "Primary Salt",
        additive: "첨가제",
        additiveSubtype: "첨가제 서브카테고리",
        additiveCategory: "카테고리",
        additiveCategories: {
            mechanistic: "메커니즘",
            outcome: "결과",
            mechanisticOptions: {
                seiStabilizer: "SEI 안정화제",
                ceiStabilizer: "CEI 안정화제",
                hfNeutralizer: "HF 중화제",
                tmDissolutionSuppressor: "전이금속 용출 억제제",
                desolvationOptimizer: "탈용매 최적화제",
                dendriteSuppressor: "덴드라이트 억제제",
                polysulfideSuppressor: "폴리설파이드 억제제",
                gasSuppressor: "가스 억제제",
                flameRetardant: "난연제"
            },
            outcomeOptions: {
                fastCharging: "고속 충전",
                highVoltage: "고전압",
                hotboxThermal: "핫박스(열 처리)",
                htCycling: "고온 사이클링",
                htStorage: "고온 저장",
                ltCycling: "저온 사이클링",
                rtCycling: "상온 사이클링"
            }
        }
    },
    
    // Buttons and Actions
    addToFavorites: "즐겨찾기에 추가 ★",
    saving: "저장 중...",

    // Favorites
    favorites: {
        favorites: "즐겨찾기",
        goToFavorites: "즐겨찾기 페이지로 이동"
    },
    
    // Warning and Error Messages
    multipleMoleculesWarning: "검색 조건과 일치하는 여러 분자가 발견되었습니다. 친구 찾기 기능이 비활성화되었습니다.",
    findFriendError: "유사한 분자 찾기에 실패했습니다. 다시 시도하세요.",
    searchError: "분자 검색 중 오류가 발생했습니다. 다시 시도하세요.",
    
    // Not Found Message
    moleculeNotFound: {
        title: "쿼리에서 분자가 반환되지 않았습니다. 다음과 같은 가능성이 있습니다:",
        reasons: [
            "쿼리가 배터리와 관련이 없거나 오류가 있을 수 있습니다. 확인해보세요.",
            "결과 분자가 Enterprise와 Joint Development의 프리미엄 레벨에 포함되어 있습니다. 업그레이드하세요.",
            "쿼리가 숨겨진 보물 분자 은하 중 하나에 도달했습니다. 문의해주세요.",
            "쿼리에 염이나 음이온 분자가 포함되어 있을 수 있지만, 현재 데이터베이스에서는 아직 지원하지 않습니다. 향후 업데이트에서 음이온을 추가할 예정입니다."
        ],
        contactSales: "영업팀에 문의"
    },

    // Ambiguous Query Message
    ambiguousQuery: {
        message: "쿼리가 모호합니다. 약어 {{query}}는 다음 분자 중 하나에 해당할 수 있습니다: {{options}}. 쿼리를 구체화해주세요."
    }
};
