export default {
    // Header
    title: "초기 사이클 데이터 업로드로 수명 예측",
    subtitle: "SES 내부 실험 데이터로 훈련된 AI 모델을 사용하여 리튬이온 배터리의 사이클 수명(80% SOH까지의 사이클 수)을 예측합니다. 첫 100 사이클만(실효 사이클이므로 실제 숫자는 더 많을 수 있습니다) 필요합니다.",
    betaTag: "BETA",
    disclaimerTitle: "면책 조항",
    disclaimer: "<strong>참고:</strong> 이 기능은 사용자가 제공한 초기 단계 사이클링 데이터만을 사용하여 셀 사이클 수명을 예측합니다. 셀 화학 또는 설계와 같은 추가 정보는 필요하지 않습니다. 이 모델은 현재 표준 사이클링 조건(실제 사용 프로파일이 아님) 하에서 활성 이온이 제한된 배터리 시스템에 적용됩니다. 사용자는 자체 테스트를 통해 예측을 검증하는 것이 좋습니다.",

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
        subtitle: "현재 CSV와 Neware 기본 파일 형식(NDA/NDAX)만 지원되며, 향후 더 많은 파일 형식을 지원할 예정입니다",
        uploading: "파일 업로드 중...",
        waitText: "잠시만 기다려 주세요",
        dataFormatTip: "📋 CSV 데이터 형식 요구사항",
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
        noDetailedData: "상세한 바코드 데이터가 없습니다",
        dataRequirementNotMet: "업로드된 데이터가 요구 사항을 충족하지 않습니다. 데이터 처리 지원을 받으려면 ",
        contactSupport: "문의하십시오"
    },

    // Tabs
    tabs: {
        introduction: "소개",
        records: "기록"
    },

    // List
    list: {
        columns: {
            recordId: "기록 ID",
            fileName: "파일명",
            batteryCount: "배터리 수",
            avgCycleLife: "평균 사이클 수명",
            created: "생성 시간",
            actions: "작업"
        }
    },

    // History
    history: {
        title: "예측 기록",
        newPrediction: "새 예측",
        searchPlaceholder: "파일명으로 검색...",
        loadingText: "로딩 중...",
        error: "오류",
        noResults: "예측 기록이 없습니다",
        cannotDeleteDemo: "데모 기록을 삭제할 수 없습니다",
        deleteConfirm: "이 기록을 삭제하시겠습니까?",
        deleteSuccess: "삭제 성공",
        deleteFailed: "삭제 실패",
        view: "보기",
        delete: "삭제",
        loading: {
            error: "히스토리 기록을 가져오지 못했습니다"
        },
        actions: {
            viewDetails: "상세 보기",
            delete: "삭제"
        }
    },

    // Modal
    modal: {
        title: "예측 기록 상세 - 히스토리 데이터",
        uploadedData: "업로드된 데이터",
        predictionResults: "예측 결과",
        loadingDetail: "로딩 중...",
        loadDetailFailed: "상세 데이터 가져오기에 실패했습니다",
        download: "다운로드",
        downloading: "다운로드 중...",
        downloadFile: "파일 다운로드",
        downloadFailed: "파일 다운로드에 실패했습니다",
        chartTitle: "배터리 용량 변화 차트"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "히스토리 기록 로드에 실패했습니다",
        predictionFailed: "예측에 실패했습니다. 다시 시도해 주세요",
        uploadFailed: "파일 업로드에 실패했습니다",
        fileFormatError: "파일 형식이 지원되지 않습니다. CSV 또는 Excel 파일을 업로드해 주세요"
    },

    // Chart
    chart: {
        title: "배터리 용량 대 사이클 수",
        cycleCount: "사이클 수",
        capacityProcess: "용량 열화 (업로드된 데이터)",
        predictedCycleLife: "80% SOH에 도달하는 예측 사이클 수",
        xAxisName: "사이클 수",
        yAxisName: "방전 용량",
        predictedCapacityLine: "예측 용량선",
        sohPredictionLine: "80% SOH 예측선",
        value: "값",
        noData: "데이터 없음"
    },

    // Detail
    detail: {
        actionTitle: "예측 상세",
        loading: "예측 상세 정보를 불러오는 중...",
        missingId: "예측 ID 매개변수가 없습니다",
        fetchError: "예측 상세 정보 가져오기 실패",
        downloadFailed: "파일 다운로드 실패"
    },

    // Actions
    actions: {
        backToList: "목록으로 돌아가기"
    },

    // Default Step
    default: {
        selectStep: "작업 단계를 선택해 주세요",
        selectStepDescription: "위의 단계에서 실행할 작업을 선택해 주세요"
    },

    // Tutorial
    tutorial: {
        button: "튜토리얼",
        modalTitle: "사용 가이드",
        imageCaption: '예측 출력과 실제 셀 성능 비교',
        point1: '"예측"은 처음 100 사이클의 시계열 데이터로 사이클 수명을 예측할 수 있습니다.',
        point1_sub1: 'NCM811/12%Si.-흑연과 탄산염 전해질',
        point1_sub2: '1C/1C 사이클링, 100 사이클마다 0.33C/0.33C 용량 확인',
        point2: '일반적인 예측의 경우 정확도는 약 ±15%입니다. 특정 배터리 시스템에 맞춰 모델을 미세 조정하면, 해당 시스템에 대한 예측 정확도가 약 ±5%까지 향상될 수 있습니다.',
        point3: '사이클 수명이 알려진 실제 셀의 경우 모델은 1321 사이클에서 EOL을 예측했습니다.',
        point3_sub1: '실측값은 1261 사이클(각 사이클의 용량 유지율 기준) 또는 1351 사이클(용량 확인 사이클의 용량 유지율 기준)입니다.',
        point4: '예측 오차는 4.7% 또는 2.2%로, 단순 선형 외삽법(800 사이클)보다 훨씬 우수합니다.'
    }
};