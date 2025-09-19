export default {
    // Search Tabs
    tabs: {
        organic: '유기 분자',
        inorganic: '무기 분자',
        third: '고체 전해질'
    },
    
    // Search Input
    searchPlaceholder: "SMILES 문자열, 분자명 또는 특성 쿼리를 입력하세요",
    searchButton: "검색",
    searchTooltip: '<p>유효한 쿼리는 분자의 모든 수치적 특성을 검색할 수 있습니다. 예시:</p><p>- "HOMO가 최대 -8인 모든 분자 찾기"<br/>- "LUMO가 최소 -2이고 분자량이 최대 200인 모든 분자 찾기"</p><p>더 개방적인 쿼리의 경우 Ask를 사용하세요.</p><p>SMILES 문자열을 그리거나 찾으려면 이 아이콘을 클릭하거나 <a>{{pubChemUrl}}</a>을 방문하세요</p>',
    drawMolecule: "분자 그리기",
    
    // Search Options
    findFriendsLabel: '"친구" 찾기',
    findFriendsDescription: '입력한 분자와 유사한 구조를 가지며, 아래의 배터리 사용 사례에 이론적으로 호환되는 물리화학적 특성을 가진 분자:',
    
    searchRange: '검색 범위',
    nearbyFriends: '가까운 친구들',
    distantFriends: '먼 친구들',
    advancedOptions: '고급 옵션',
    intelligentCompute: '지능형 친구 찾기 연산',
    intelligentFindFriendsLabel: '지능형 "친구" 찾기',
    intelligentFindFriendsTooltip: 'LLM으로 수백 개의 분자를 살펴보고, 사용 사례에 더 적합한 분자를 찾아보세요. 최상의 결과를 위해 계산 성능을 높이고 (고급 옵션)에서 배터리 시스템 정보를 입력하세요.',
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
    solvent: '주요 용매',
    performanceMetric: '원하는 성능 지표',
    extraRequests: '사용자 지정 분자 제약(최상의 결과를 위해 지능형 친구 찾기를 활성화하세요):',
    extraRequestsPlaceholder: '에테르 작용기를 가진 분자만 표시합니다.',
    custom: '사용자 정의',
    upgradeEnterprise: '엔터프라이즈 계정으로 업그레이드',
    upgradeAccount: '계정을 업그레이드',
    computeWarning: '지능형 친구 찾기의 높은 성능에는 추가 컨텍스트가 필요합니다. 계산 파워가 낮음으로 설정되었습니다.',
    batteryInfoRecommendation: '지능형 친구 찾기가 가장 관련성 높은 분자를 찾도록 돕는 추천 배터리 정보:',

    
    searchRange: '검색 범위',
    nearbyFriends: '가까운 친구들',
    distantFriends: '먼 친구들',
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
    solvent: '주요 용매',
    performanceMetric: '원하는 성능 지표',
    extraRequests: '사용자 지정 분자 제약(최상의 결과를 위해 지능형 친구 찾기를 활성화하세요):',
    extraRequestsPlaceholder: '에테르 작용기를 가진 분자만 표시합니다.',
    custom: '사용자 정의',
    upgradeEnterprise: '엔터프라이즈 계정으로 업그레이드',
    upgradeAccount: '계정을 업그레이드',
    computeWarning: '지능형 친구 찾기의 높은 성능에는 추가 컨텍스트가 필요합니다. 계산 파워가 낮음으로 설정되었습니다.',

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
        chemicalFormula: "Chemical Formula",
        molecularWeight: "Molecular Weight",
        homo: "HOMO",
        lumo: "LUMO",
        espMin: "ESP Min",
        espMax: "ESP Max",
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
        additive: "첨가제",
        additiveSubtype: "첨가제 서브카테고리",
        additiveOptions: {
            seiPromoter: "SEI 활성화제",
            sideReactionSuppressor: "부사상 반응 억제제",
            dendriteSuppressor: "덴드리트 억제제",
            interfacialStabilityImprover: "표면 안정성 향상제"
        }
    },
    
    // Buttons and Actions
    addToFavorites: "즐겨찾기에 추가 ★",
    saving: "저장 중...",
    
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
