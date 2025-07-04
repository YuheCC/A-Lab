export default {
    systemMessage: {
        welcome: "Molecular Universe에 오신 것을 환영합니다. 무엇을 도와드릴까요?"
    },
    input: {
        placeholder: "배터리, 배터리 화학 또는 관련 주제에 대한 질문이라면 무엇이든 물어보세요.",
        sendButton: "전송"
    },
    checkboxes: {
        ignoreChatHistory: "채팅 기록 무시",
        disableLiteratureSearch: "문헌 검색 비활성화",
        enterDeepSpace: "딥 스페이스 진입 (BETA)",
        deepSpaceTooltip: "배터리 질문을 분석하고 문헌과 분자 데이터베이스를 검색한 후 협력하여 연구급 답변을 작성하는 LLM 에이전트 팀입니다. 응답 시간은 10-20분입니다.",
        admin: "관리자"
    },
    queryLimit: {
        queriesRemaining: "이번 달 남은 쿼리:",
        reachedLimit: "월간 쿼리 한도에 도달했습니다. 도움이 필요하시면 관리자에게 문의하세요."
    },
    status: {
        thinking: "사고 중",
        searching: "검색 중",
        searchingDatabase: "데이터베이스 검색 중",
        thinkingForSeconds: "{{seconds}}초 동안 생각 중…",
        noMoleculesFound: "분자를 찾을 수 없습니다.",
        findMoleculesFailed: "분자 찾기에 실패했습니다. 나중에 다시 시도해주세요.",
        clarifyingQuestions: "곧 몇 가지 명확한 질문에 답변을 요청할 수 있습니다.",
        deepSpaceWorking: "딥 스페이스 멀티 에이전트 LLM이 작업 중입니다. 질문의 복잡성에 따라 응답하는 데 10-20분이 걸릴 수 있습니다."
    },
    buttons: {
        findMolecules: "분자 찾기",
        findSimilarMolecules: "유사한 분자 찾기",
        addToFavorites: "즐겨찾기에 추가",
        copy: "복사",
        cancel: "취소",
        submit: "제출",
        viewInMolPort: "MolPort에서 보기",
        findSimilarMoleculesLoading: "유사한 분자 검색 중...",
        addToFavoritesLoading: "저장 중..."
    },
    molecules: {
        llmFoundMolecules: "LLM이 찾은 분자",
        friendsRankedBy: "대체 가능성에 따라 순위가 매겨진 친구들:",
        name: "이름",
        smiles: "SMILES",
        molecularWeight: "분자량",
        homo: "HOMO",
        lumo: "LUMO",
        espMax: "ESP Max",
        espMin: "ESP Min",
        functionalGroups: "기능기",
        predictedMP: "예측 MP",
        predictedBP: "예측 BP",
        llmGrade: "LLM 등급",
        saving: "저장 중...",
        rateMatch: "이 결과를 평가해주세요",
        detectedChemicalKeywords: "LLM 응답에서 탐지된 화학 키워드:",
        searchingForFriends: "친구들 검색 중"
    },
    feedback: {
        goodMatch: "이것이 좋은 매치인 이유는 무엇인가요?",
        badMatch: "이것이 좋은 매치가 아닌 이유는 무엇인가요?",
        placeholder: "귀하의 피드백은 분자 매칭 개선에 도움이 됩니다",
        thankYou: "피드백을 주셔서 감사합니다!"
    },
    success: {
        addedToFavorites: "분자가 즐겨찾기에 추가되었습니다!",
        alreadyInFavorites: "분자가 이미 즐겨찾기에 있습니다",
        feedbackSubmitted: "피드백 제출에 실패했습니다. 다시 시도해주세요."
    },
    errors: {
        networkError: "네트워크 응답이 정상적이지 않습니다",
        batteryRelevance: "귀하의 질문은 배터리나 배터리 화학과 관련이 없습니다. 배터리 관련 질문을 해주세요.",
        moleculeDetailsError: "분자 세부정보 가져오기 오류:",
        similarMoleculesError: "유사한 분자 찾기 오류:",
        queryLimitError: "쿼리 한도 가져오기 실패",
        addToFavoritesError: "즐겨찾기 추가 실패",
        loginRequired: "즐겨찾기를 추가하려면 로그인해야 합니다",
        feedbackError: "피드백 제출 오류:",
        copyError: "복사 실패:"
    },
    history: {
        title: "채팅 목록",
        createNewChat: "새 채팅 만들기",
        newChat: "새 채팅",
        confirmDelete: "정말로 이 채팅을 삭제하시겠습니까?",
        cancel: "취소",
        delete: "삭제",
        footer: "채팅 기록은 최근 20개의 채팅을 보여줍니다."
    }
}; 