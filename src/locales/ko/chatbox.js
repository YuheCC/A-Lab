export default {
    systemMessage: {
        welcome: "Molecular Universe에 오신 것을 환영합니다. 무엇을 도와드릴까요?"
    },
    input: {
        placeholder: "배터리, 배터리 화학 또는 관련 주제에 대한 질문이라면 무엇이든 물어보세요.",
        sendButton: "전송"
    },
    chat: {
        newChat: "새 채팅",
        newExpoler: "새 탐험",
        newChatSubtitle: "새로운 대화를 시작하고 분자 우주의 신비를 탐험해보세요",
        searchChat: "채팅 검색",
        historyTitle: "채팅 기록",
        askTitle: "ASK",
        refreshQuestions: "새로고침",
        sendMessage: "메시지 전송",
        editQuestion: "질문 편집",
        copy: "복사",
        regenerate: "재생성",
        sendFailed: "메시지 전송에 실패했습니다. 나중에 다시 시도해주세요.",
        regenerateFailed: "재생성에 실패했습니다. 나중에 다시 시도해주세요.",
        loadChatFailed: "채팅 데이터 로드 실패",
        loadHistoryFailed: "채팅 기록 로드 실패",
        modes: {
            regular: "일반 문답",
            deepSpace: "딥 스페이스",
            regularDescription: "기본 Q&A 모드로, 일상적인 배터리 관련 질문에 적합합니다. 정확하고 간결한 답변을 제공합니다.",
            deepSpaceDescription: "배터리 질문을 분석하고 문헌과 분자 데이터베이스를 검색한 후 협력하여 연구급 답변을 작성하는 LLM 에이전트 팀입니다. 응답 시간은 10-20분입니다.",
            regularRemaining: "오늘 남은 횟수: {{count}}회",
            deepSpaceRemaining: "이번 달 남은 횟수: {{count}}회",
            betaBadge: "베타"
        },
        recommendedQuestions: [
            "리튬이온 배터리의 전해질 용매 선택에서 주요 고려사항은 무엇인가요?",
            "차세대 배터리 기술에서 고체 전해질의 장점과 응용 전망은 어떤가요?",
            "SEI층의 형성 메커니즘과 배터리 성능에 미치는 영향은 무엇인가요?",
            "고니켈 양극 소재의 안정성 문제와 해결책은 무엇인가요?",
            "리튬 덴드라이트 형성 원인과 억제 방법은 무엇인가요?",
            "나트륨이온 배터리와 리튬이온 배터리의 성능 비교는 어떤가요?",
            "전고체 배터리의 기술적 도전과 개발 전망은 어떤가요?",
            "배터리 열관리 시스템의 설계 원리와 핵심 기술은 무엇인가요?",
            "급속 충전 기술이 배터리 수명에 미치는 영향과 최적화 전략은?",
            "배터리 재활용 이용의 기술 경로와 경제성 분석은?",
            "리튬이온 배터리에서 무질서 암염(DRX)을 사용할 때 전압 감소의 주요 음극 관련 원인은 무엇인가요?",
            "리튬이온 배터리에서 무질서 암염(DRX)을 사용하기 위한 전해질 조성의 일반적인 설계 규칙은 무엇인가요?",
            "금속 음극 고체 배터리에서 덴드라이트 성장을 억제하는 효과적인 전략은 무엇인가요?",
            "저온 환경용 흑연 음극을 설계할 때 흑연 재료는 어떻게 선택해야 하나요? 인공 흑연(AG)과 천연 흑연(NG) 중 어느 것이 더 적합한가요?",
            "에너지 밀도와 사이클링 성능의 균형을 맞추기 위한 Si 음극의 최적 실리콘 함량은 얼마인가요?",
            "Li-Al, Li-Mg, Li-Si와 같은 리튬 합금이 고온 열 배터리에서 일반적으로 사용되는 이유는 무엇인가요?",
            "리튬 금속 음극을 위한 이상적인 SEI 또는 보호층의 설계 원리 또는 내재적 요구사항은 무엇인가요?",
            "흑연, 실리콘, 리튬 금속 음극의 SEI 차이점은 무엇인가요?",
            "흑연, 실리콘, 리튬 금속 기반 배터리 간의 평균 전압 차이는 얼마인가요?",
            "실리콘 음극의 초기 쿨롱 효율(ICE)이 일반적으로 흑연보다 낮은 이유는 무엇인가요?",
            "전기화학 데이터와 재료 특성 평가를 기반으로 리튬이온 배터리의 용량 감소에 대한 다양한 열화 메커니즘의 기여를 어떻게 분리할 수 있나요?",
            "전극 재료와 전해질을 변경하지 않고 기계적 설계를 통해 배터리 전력 밀도를 어떻게 개선할 수 있나요?",
            "배터리 용량 감소의 근본적인 원인은 무엇인가요? 열화 없이 수십 년 지속할 수 있는 배터리를 만들 수 있나요?",
            "전자와 이온은 음극, 양극, 전해질에서 어떻게 전달되나요?",
            "전해질 벌크 특성, 특히 전도도, 점도, 확산 계수, 전달 수는 배터리 성능에 어떻게 영향을 미치나요?",
            "덴드라이트가 고체 전해질을 통해 성장할 때 스택 압력은 고체 전해질의 파괴 역학을 어떻게 변화시키나요?"
        ],
        searchModal: {
            placeholder: "채팅 검색...",
            recentChats: "최근 채팅"
        },
        historyItem: {
            rename: "이름 변경",
            pin: "고정",
            unpin: "고정 해제",
            delete: "채팅 삭제"
        }
    },
    checkboxes: {
        ignoreChatHistory: "채팅 기록 무시",
        disableLiteratureSearch: "문헌 검색 비활성화",
        enterDeepSpace: "딥 스페이스 진입 (BETA)",
        deepSpaceTooltip: "배터리 질문을 분석하고 문헌과 분자 데이터베이스를 검색한 후 협력하여 연구급 답변을 작성하는 LLM 에이전트 팀입니다. 응답 시간은 10-20분입니다.",
        admin: "관리자",
        fullDeepSpace: "전체 딥 스페이스",
        disableTools: "Disable tools"
    },
    queryLimit: {
        queriesRemaining: "오늘 조회 횟수:",
        deepSpaceQueriesRemaining: "이번 달 남은 딥 스페이스 쿼리:",
        reachedLimit: "월간 쿼리 한도에 도달했습니다. 도움이 필요하시면 관리자에게 문의하세요."
    },
    status: {
        thinking: "사고 중",
        searching: "검색 중",
        searchingDatabase: "데이터베이스 검색 중",
        thinkingForSeconds: "{{seconds}}초 동안 생각 중…",
        thinkingForMinutesAndSeconds: "{{minutes}}분 {{seconds}}초 동안 생각 중…",
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
        addToFavoritesLoading: "저장 중...",
        favorites: "즐겨찾기"
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
        thankYou: "피드백을 주셔서 감사합니다!",
        selectFirst: "먼저 좋아요 또는 싫어요를 선택해주세요",
        submitting: "제출 중..."
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
        copyError: "복사 실패:",
        generalError: "오류"
    },
    supplementalData: "보충 데이터",
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