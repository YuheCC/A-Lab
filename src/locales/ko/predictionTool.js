export default {
    // Header
    title: "초기 사이클 데이터 업로드로 수명 예측",
    subtitle: "Predict는 SES에서 개발한 AI 모델로, 초기 사이클 성능 데이터를 사용하여 방전 용량이 80%로 감소하는 사이클 수로 정의되는 배터리 사이클 수명을 추정합니다. 이 모델은 입력으로 약 처음 100개의 유효 사이클을 사용하며, 유효 사이클은 급격한 용량 변화나 비정상적인 동작이 없는 사이클로 정의됩니다. Predict는 리튬 이온, 나트륨 이온 및 애노드프리 배터리를 포함하여 수명이 활성 이온 재고 손실에 의해 지배되는 시스템에서 가장 잘 작동합니다. 기계적 손상, 설계 관련 문제, 내부 단락, 가스 발생, 리튬 도금 또는 전해질 고갈과 같은 비전기화학적 열화 메커니즘의 존재는 예측 정확도에 영향을 미칠 수 있습니다.",
    betaTag: "BETA",
    disclaimerTitle: "면책 조항",
    disclaimer: "<strong>참고:</strong> 이 기능은 사용자가 제공한 초기 단계 사이클링 데이터만을 사용하여 셀 사이클 수명을 예측합니다. 셀 화학 또는 설계와 같은 추가 정보는 필요하지 않습니다. 이 모델은 현재 표준 사이클링 조건(실제 사용 프로파일이 아님) 하에서 활성 이온이 제한된 배터리 시스템에 적용됩니다. 사용자는 자체 테스트를 통해 예측을 검증하는 것이 좋습니다.",

    // Features
    features: {
        newPrediction: {
            title: "새 예측",
            description: "새 예측 실행"
        },
        train: {
            title: "학습",
            description: "사용자 지정 모델 학습"
        }
    },

    // Create page
    create: {
        title: "새 예측"
    },

    // Steps
    steps: {
        upload: "데이터 업로드",
        aiPredict: "AI 예측",
        results: "결과 표시"
    },

    // Model Selection
    modelSelection: {
        label: "모델 선택",
        placeholder: "모델을 선택해주세요",
        baseModel: "기본 모델",
        finetunedModels: "파인튜닝 모델",
        muModels: "MU 모델",
        columns: {
            modelName: "모델 이름",
            modelId: "모델 ID",
            baseModel: "기본 모델"
        }
    },

    // Upload Step
    upload: {
        title: "데이터 업로드",
        selectFile: "파일 선택",
        clickToUpload: "배터리 데이터 파일을 클릭하여 업로드",
        subtitle: "현재 CSV와 Neware 기본 파일 형식(NDA/NDAX)만 지원되며, 향후 더 많은 파일 형식을 지원할 예정입니다",
        uploading: "파일 업로드 중...",
        waitText: "잠시만 기다려 주세요",
        removeFile: "파일 삭제",
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
        tool: "예측 도구",
        introduction: "소개",
        records: "기록",
        models: "모델"
    },

    // List
    list: {
        columns: {
            recordId: "기록 ID",
            fileName: "파일명",
            batteryCount: "배터리 수",
            avgCycleLife: "사이클 수명",
            model: "모델",
            created: "생성 시간",
            actions: "작업"
        }
    },

    // Records
    records: {
        searchPlaceholder: "레코드 ID로 검색",
        modelFilter: "모델 필터",
        allModels: "모든 모델",
        clearFilters: "필터 지우기",
        showingRecords: "{{count}} / {{total}} 개의 레코드 표시"
    },

    // History
    history: {
        title: "예측 기록",
        newPrediction: "새 예측",
        train: "학습",
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
            viewResults: "결과 보기",
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
        capacity: "용량",
        capacityProcess: "용량 열화 (업로드된 데이터)",
        predictedCycleLife: "80% SOH에 도달하는 예측 사이클 수",
        xAxisName: "사이클 수",
        yAxisName: "방전 용량",
        xAxisLabel: "사이클 ID",
        yAxisLabel: "SOH (%)",
        originalSoh: "원본 SOH",
        originalSohUsed: "사용된 원본 SOH",
        originalSohUnused: "미사용 원본 SOH",
        estimatedSoh: "예측 SOH",
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
        backToList: "목록으로 돌아가기",
        back: "뒤로",
        newPrediction: "새 예측"
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
        point3: '已知사이클 수명을 가진 실제 셀(각 사이클의 용량 유지율 기준 1261 사이클, 또는 용량 확인 사이클의 용량 유지율 기준 1351 사이클)의 경우, 모델은 1321 사이클에서 EOL을 예측했습니다.',
        point3_sub1: '예측 오차는 4.7% 또는 2.2%에 불과하며, 단순 선형 외삽법(800 사이클)보다 훨씬 우수합니다.',
        point4: '예측 오차는 4.7% 또는 2.2%로, 단순 선형 외삽법(800 사이클)보다 훨씬 우수합니다.'
    },

    // Introduction Page
    introduction: {
        title: "소개",
        paragraph1: "이 도구는 내부 실험 데이터셋으로 학습된 AI 모델을 사용하여 방전 용량 유지율이 80%에 도달할 때까지의 사이클 수로 정의되는 배터리 사이클 수명을 예측합니다.",
        paragraph2: "기존의 외삽법과 달리, 이 모델은 비선형 노화 거동을 포착하고 제한된 사이클 정보를 기반으로 초기 데이터 기반 수명 종료 추정을 제공합니다.",
        inputRequirement: {
            title: "입력 요구사항",
            paragraph1: "초기 사이클 데이터(예: 처음 100개의 유효 사이클)만 필요합니다.",
            paragraph2: "유효 사이클은 목표 작동 조건에서의 정상적인 노화 거동을 나타내며, 다음과 같은 비대표 사이클을 제외합니다:",
            item1: "진단 또는 용량 확인(RPT) 사이클",
            item2: "장시간 휴식 또는 저율 테스트 사이클",
            item3: "실험적 교란 또는 비정상적인 용량 점프의 영향을 받은 사이클"
        },
        applicability: {
            title: "적용 범위",
            paragraph1: "이 모델은 활성 이온 인벤토리 손실에 의해 사이클 수명이 주로 지배되는 배터리 시스템(리튬 이온 배터리, 나트륨 이온 배터리 및 음극 없는 배터리 포함)에서 검증되었습니다. 활성 물질 손실이나 리튬 도금과 같은 다른 전기화학적 열화 메커니즘의 경우, 모델은 정확도가 낮은 추정을 제공할 수 있습니다. 탭 균열이나 내부 단락과 같은 기계적 요인에 의한 고장 모드는 모델 범위 밖이며 예측할 수 없습니다."
        },
        predictionAccuracy: {
            title: "예측 정확도",
            item1: "재료 시스템에 대한 사전 지식 없이 일반적으로 사용하는 경우, 일반적인 예측 오차는 ±15% 이내입니다.",
            item2: "특정 배터리 시스템에 맞게 모델을 미세 조정하면 오차를 약 ±5%로 줄일 수 있습니다."
        },
        example: {
            title: "예시",
            paragraph1: "한 예에서, 모델 기반 예측은 시간에 따른 SOH 열화 추세를 포착하여 배터리 수명 종료를 약 1308 사이클로 추정했습니다. 일정한 페이드 속도를 가정하는 대신, 예측은 비선형 노화 거동을 투영하여 측정된 SOH 변화와 일치하는 궤적을 생성했습니다. 이 경우, 모델은 수직 빨간 점선으로 표시된 사이클까지의 데이터(약 130 사이클)를 사용하고 비정상 사이클을 제외하여 예측을 위한 안정적인 열화 추세를 확립했습니다. 실제 수명 종료는 1396 사이클(용량 확인 사이클 제외)에서 관찰되었으며, 이는 약 6.3%의 예측 오차에 해당합니다.",
            paragraph2: "대신 단순 선형 외삽을 적용했다면, 수명은 약 1000 사이클로 과소평가되었을 것입니다. 이는 더 정확한 수명 추정을 제공하는 예측 접근법의 장점을 강조합니다."
        }
    },

    // Train
    train: {
        title: "새 모델 학습",
        back: "뒤로",
        step1: {
            title: "모델 정보",
            name: "모델 이름",
            namePlaceholder: "모델 이름 입력",
            remarks: "비고",
            remarksPlaceholder: "추가 메모나 비고 입력"
        },
        step2: {
            title: "기본 모델",
            modelName: "OSES-Base-v1",
            badge: "기본 모델",
            loading: "로딩 중...",
            noModels: "사용 가능한 기본 모델이 없습니다"
        },
        step3: {
            title: "학습 데이터셋",
            ratio: "학습-테스트 분할 비율:",
            ratioValue: "7 : 3",
            ratioDesc: "데이터셋의 70%는 학습에, 30%는 테스트에 사용됩니다",
            upload: "데이터셋 업로드",
            uploadNote: "최소 30개의 셀 데이터를 업로드하고 각 셀은 최소 SOH=80%까지 사이클하십시오",
            dragDrop: "파일을 여기에 드래그 앤 드롭하거나 클릭하여 찾아보기",
            formats: "지원 형식: CSV, NDA, NDAX",
            dragDropMultiple: "파일을 여기에 드래그 앤 드롭하거나 클릭하여 찾아보기",
            formatsMultiple: "지원 형식: CSV, NDA, NDAX (최대 {{max}}개 파일)",
            chooseFile: "파일 선택",
            chooseFiles: "파일 선택",
            downloadSample: "샘플 다운로드",
            removeFile: "파일 삭제"
        },
        startTraining: "학습 시작",
        errors: {
            fileFormat: "지원하지 않는 파일 형식",
            maxFiles: "최대 {{max}}개의 파일만 허용됩니다",
            duplicateFiles: "일부 중복 파일을 건너뛰었습니다",
            modelNameRequired: "모델 이름을 입력해주세요",
            baseModelRequired: "기본 모델을 선택해주세요",
            fileRequired: "학습 데이터셋을 업로드해주세요",
            failed: "학습 시작 실패"
        },
        success: "모델 학습이 성공적으로 시작되었습니다",
        submitting: "제출 중..."
    },

    // Models
    models: {
        loadingText: "로딩 중...",
        error: "오류",
        noResults: "모델을 찾을 수 없습니다",
        showingRecords: "{{count}} / {{total}} 개의 레코드 표시",
        statusOnline: "온라인",
        statusTrained: "학습 완료",
        statusTraining: "학습 중",
        statusOffline: "오프라인",
        statusFail: "실패",
        cannotDeleteDemo: "데모 모델을 삭제할 수 없습니다",
        deleteConfirm: "이 모델을 삭제하시겠습니까?",
        deleteFailed: "모델 삭제 실패",
        loading: {
            error: "모델 목록을 불러오지 못했습니다"
        },
        filters: {
            searchPlaceholder: "모델 ID 또는 이름 검색...",
            statusPlaceholder: "상태 선택",
            allStatus: "모든 상태",
            allBaseModels: "모든 기본 모델",
            selectDate: "날짜 선택",
            refresh: "새로 고침",
            clearFilters: "필터 지우기"
        },
        columns: {
            modelId: "모델 ID",
            modelName: "모델 이름",
            baseModel: "기본 모델",
            status: "상태",
            created: "생성 시간",
            createdBy: "생성자",
            actions: "작업"
        },
        actions: {
            viewDetails: "상세 보기",
            delete: "삭제"
        }
    },

    // Model Detail
    modelDetail: {
        title: "모델 정보",
        modelId: "모델 ID:",
        back: "뒤로",
        onlineModel: "모델 배포",
        offlineModel: "모델 오프라인",
        creator: "생성자:",
        status: "상태:",
        statusOnline: "온라인",
        statusTrained: "학습 완료",
        statusOffline: "오프라인",
        statusTraining: "학습 중",
        statusFail: "실패",
        created: "생성 시간:",
        remarks: "비고:",
        baseModel: "기본 모델",
        trainingDataset: "학습 데이터셋",
        datasetName: "데이터셋 이름:",
        fileSize: "파일 크기:",
        totalSamples: "총 샘플 수:",
        ratio: "학습-테스트 비율:",
        trainingResults: "학습 결과",
        accuracy: "정확도",
        loss: "손실",
        epochs: "에포크",
        trainingTime: "학습 시간",
        validationScore: "검증 점수",
        predictionRecords: "예측 기록",
        recordId: "ID",
        fileName: "파일명",
        batteryCount: "배터리 수",
        avgCycleLife: "평균 사이클 수명",
        actions: "작업",
        viewDetails: "상세 보기",
        trainingFiles: "학습 데이터셋",
        trainingMetrics: "학습 결과",
        baseRMSE: "기본 모델 RMSE",
        baseR2: "기본 모델 R²",
        trainRMSE: "새 모델 RMSE",
        trainR2: "새 모델 R²",
        rmse: "RMSE",
        r2: "R²",
        baseModelLabel: "기본 모델",
        newModelLabel: "새 모델",
        loadingText: "로딩 중...",
        noFiles: "학습 파일이 없습니다",
        noMetrics: "학습 지표가 없습니다",
        beforeTraining: "학습 전",
        afterTraining: "학습 후",
        downloadingLog: "다운로드 중...",
        downloadTrainLog: "학습 로그 다운로드",
        downloadLogSuccess: "학습 로그 다운로드 성공",
        downloadingFile: "파일 다운로드 중...",
        downloadFileSuccess: "파일 다운로드 성공",
        confirmDeploy: "배포 확인",
        confirmUndeploy: "오프라인 확인",
        confirmRemove: "삭제 확인",
        deployMessage: "이 모델을 배포하시겠습니까? 예측에 사용할 수 있게 됩니다.",
        undeployMessage: "이 모델을 오프라인 상태로 전환하시겠습니까?",
        removeMessage: "이 모델을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.",
        cancel: "취소",
        confirm: "확인",
        deploySuccess: "모델이 성공적으로 배포되었습니다",
        undeploySuccess: "모델이 성공적으로 오프라인 상태로 전환되었습니다",
        removeSuccess: "모델이 성공적으로 삭제되었습니다",
        errors: {
            noId: "모델 ID가 필요합니다",
            fetchFailed: "모델 상세 정보를 가져오는 데 실패했습니다",
            actionFailed: "작업 실패",
            mockModel: "데모 모델은 수정할 수 없습니다",
            notFound: "모델을 찾을 수 없습니다",
            downloadLogFailed: "학습 로그 다운로드 실패"
        },
        metricsInfo: {
            rmse: {
                name: "평균 제곱근 오차",
                description: "ŷᵢ는 예측 사이클 수, yᵢ는 실제 사이클 수, N은 테스트 세트 샘플 크기를 나타냅니다"
            },
            mae: {
                name: "평균 절대 오차",
                description: "ŷᵢ는 예측 사이클 수, yᵢ는 실제 사이클 수, N은 테스트 세트 샘플 크기를 나타냅니다"
            },
            mape: {
                name: "평균 절대 백분율 오차",
                description: "ŷᵢ는 예측 사이클 수, yᵢ는 실제 사이클 수, N은 테스트 세트 샘플 크기를 나타냅니다"
            },
            predictedValue: "예측 사이클 수",
            actualValue: "실제 사이클 수",
            sampleSize: "테스트 세트 샘플 크기"
        }
    },

    // Train disabled tip
    trainDisabledTip: "사용을 원하시면 이메일 <emailLink>mu.sales@ses.ai</emailLink>로 당사 팀에 문의해 주세요."
};