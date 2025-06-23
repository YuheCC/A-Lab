export default {
    // Search Input
    searchPlaceholder: "SMILES 문자열, 분자명 또는 쿼리를 입력하세요",
    searchButton: "검색",
    searchTooltip: `<p>유효한 쿼리는 분자의 모든 수치 속성을 검색할 수 있습니다. 예를 들어:</p><p>- "HOMO가 -8 이하인 모든 분자 찾기"</p><p>- "LUMO가 -2 이상이고 분자량이 200 이하인 모든 분자 찾기"</p><p>더 열린 질문에 대해서는 Ask를 사용하세요.</p><p>SMILES 문자열을 그리고 조회하려면 이 아이콘을 클릭하거나 <a>{{pubChemUrl}}</a>를 방문하세요.</p>`,
    drawMolecule: "분자 그리기",
    
    // Search Options
    findFriendsLabel: '"친구들" 찾기',
    findFriendsDescription: '유사한 물리화학적 특성을 가진 분자들."친구들"에는 의도적으로 유사한 구조의 분자들과 다양한 구조의 분자들이 포함됩니다. 목록은 질의한 분자와 물리화학적 속성이 얼마나 유사한지에 따라 정렬됩니다.',
    
    // Loading and Status Messages
    searching: "검색 중...",
    loadingMap: "분자 우주 지도 로딩 중",
    errorLoadingData: "데이터 로딩 오류",
    noDataAvailable: "사용 가능한 데이터가 없습니다",
    tooManyRequests: "요청이 너무 많습니다. 잠시 기다린 후 다시 시도해주세요.",
    
    // Search Results
    searchedMolecules: "검색된 분자",
    moleculeNumber: "분자 {{number}}",
    similarMolecules: "유사 분자",
    similarMoleculeNumber: "유사 분자 번호 #{{number}}",
    
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
        functionalGroups: "Functional Groups",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },
    
    // Buttons and Actions
    addToFavorites: "즐겨찾기에 추가 ★",
    saving: "저장 중...",
    
    // Warning and Error Messages
    multipleMoleculesWarning: "검색 기준과 일치하는 여러 분자가 발견되었습니다. 친구 찾기가 비활성화되었습니다.",
    findFriendError: "유사한 분자를 찾는데 실패했습니다. 다시 시도해주세요.",
    searchError: "분자 검색 중 오류가 발생했습니다. 다시 시도해주세요.",
    
    // Not Found Message
    moleculeNotFound: {
        title: "쿼리가 어떤 분자도 반환하지 않았습니다. 다음과 같은 가능성이 있습니다:",
        reasons: [
            "쿼리가 배터리와 관련이 없거나 오류가 있을 수 있습니다. 확인해주세요.",
            "결과 분자들이 프리미엄 레벨인 Enterprise 및 Joint Development에 포함되어 있습니다. 업그레이드해주세요.",
            "쿼리가 저희의 숨겨진 보물 분자 은하 중 하나에 도달했습니다. 저희에게 연락해주세요.",
            "쿼리가 염 또는 음이온 분자와 관련이 있을 수 있는데, 현재 데이터베이스에서는 아직 지원하지 않습니다. 곧 있을 업데이트에서 음이온을 추가할 예정입니다."
        ],
        contactSales: "영업팀 연락"
    }
}; 