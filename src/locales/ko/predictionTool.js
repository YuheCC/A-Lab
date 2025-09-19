export default {
    // Header
    title: "배터리 초기 수명 예측 도구",
    betaTag: "BETA",

    // Steps
    steps: {
        upload: "데이터 업로드",
        aiPredict: "AI 예측",
        results: "결과 표시"
    },

    // Upload Step
    upload: {
        selectFile: "파일 선택",
        clickToUpload: "배터리 데이터 파일을 클릭하여 업로드",
        uploading: "파일 업로드 중...",
        waitText: "잠시만 기다려 주세요",
        dataFormatTip: "📋 데이터 형식 요구사항",
        sampleData: "샘플 데이터",
        requiredFields: "필수 필드:",
        requiredFieldsValue: "barcode, cycle_id, current (A), voltage (V), time (s)",
        currentDirection: "전류 방향:",
        currentDirectionValue: "+는 충전, -는 방전",
        unitRequirement: "단위 요구사항:",
        unitRequirementValue: "전류 단위 A, 전압 단위 V, 시간 단위 s",
        dataRequirement: "데이터 요구사항:",
        dataRequirementValue: "업로드 데이터 ≥100 사이클, 데이터는 시간 순으로 정렬되어야 합니다"
    },

    // AI Prediction Step
    prediction: {
        uploadedData: "업로드된 데이터",
        changeFile: "파일 변경",
        fileSize: "파일 크기",
        fileType: "유형",
        startPrediction: "예측 시작",
        progressLabel: "분석 진행",
        uploadingFile: "파일을 업로드하고 예측 작업을 생성 중...",
        processing: "예측 작업이 백그라운드에서 처리되고 있습니다. 잠시만 기다려 주세요...",
        pleaseUploadFirst: "먼저 파일을 업로드해 주세요"
    },

    // Results Step
    results: {
        noResults: "예측 결과가 없습니다. 먼저 예측을 완료해 주세요",
        batteryCount: "배터리 수",
        batteryCountUnit: "개",
        avgCycleLife: "평균 사이클 수명",
        avgCycleLife1: "평균 사이클 수명",
        avgCycleLife2: "평균 사이클 수명2",
        cycleUnit: "회",
        predictionTime: "예측 시간",
        unknown: "알 수 없음",
        barcode: "바코드",
        cycleLife1: "사이클 수명",
        cycleLife2: "사이클 수명 2",
        noDetailedData: "상세한 바코드 데이터가 없습니다"
    },

    // History
    history: {
        title: "예측 기록",
        newPrediction: "새 예측",
        searchPlaceholder: "파일명으로 검색...",
        loading: "로딩 중...",
        deleteConfirm: "이 기록을 삭제하시겠습니까?",
        deleteSuccess: "삭제 성공",
        deleteFailed: "삭제 실패",
        view: "보기",
        delete: "삭제"
    },

    // Modal
    modal: {
        title: "예측 기록 상세 - 히스토리 데이터",
        uploadedData: "업로드된 데이터",
        predictionResults: "예측 결과",
        loadingDetail: "로딩 중...",
        loadDetailFailed: "상세 데이터 가져오기에 실패했습니다"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "히스토리 기록 로드에 실패했습니다",
        predictionFailed: "예측에 실패했습니다. 다시 시도해 주세요",
        uploadFailed: "파일 업로드에 실패했습니다",
        fileFormatError: "파일 형식이 지원되지 않습니다. CSV 또는 Excel 파일을 업로드해 주세요"
    },

    // Default Step
    default: {
        selectStep: "작업 단계를 선택해 주세요",
        selectStepDescription: "위의 단계에서 실행할 작업을 선택해 주세요"
    }
};