export default {
    // List/Table columns
    list: {
        columns: {
            recordId: 'Record ID',
            smiles: 'SMILES',
            modelName: '모델 이름',
            totalPositive: 'Total Positive',
            temp25: '25°C Positive',
            temp45: '45°C Positive',
            created: '생성일',
            actions: '작업'
        }
    },
    // Create page
    create: {
        title: '새 설계'
    },
    // Train page
    train: {
        title: '새 모델 학습',
        back: '뒤로',
        startTraining: '학습 시작',
        submitting: '제출 중...',
        success: '모델 학습이 성공적으로 시작되었습니다!',
        errors: {
            modelNameRequired: '모델 이름을 입력하세요',
            baseModelRequired: '기본 모델을 선택하세요',
            fileRequired: '학습 데이터셋을 업로드하세요',
            fileFormat: '지원되지 않는 파일 형식',
            duplicateFiles: '일부 중복 파일이 건너뛰어졌습니다',
            unknown: '학습 시작에 실패했습니다'
        },
        step1: {
            title: '모델 정보',
            name: '모델 이름',
            namePlaceholder: '모델 이름 입력',
            remarks: '비고 (선택사항)',
            remarksPlaceholder: '추가 메모 또는 비고 입력'
        },
        step2: {
            title: '셀 사양',
            cathode: '양극',
            cathodePlaceholder: 'Polycrystal NCM811, 4 mAh/cm²',
            anode: '음극',
            anodePlaceholder: '12% SiC + Graphite',
            benchmarkElectrolyte: '벤치마크 전해질',
            benchmarkElectrolytePlaceholder: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/LiDFP',
            cellDesign: '셀 설계',
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
        },
        step3: {
            title: '기본 모델',
            loading: '모델 로딩 중...',
            noModels: '사용 가능한 기본 모델이 없습니다'
        },
        step4: {
            title: '학습 데이터셋',
            upload: '데이터셋 업로드',
            dragDrop: '파일을 여기에 끌어다 놓거나 클릭하여 찾아보기',
            formats: '지원 형식: CSV, XLSX (최대 50MB)',
            dragDropMultiple: '파일을 여기에 끌어다 놓거나 클릭하여 찾아보기',
            formatsMultiple: '지원 형식: XLSX만 가능',
            chooseFile: '파일 선택',
            chooseFiles: '파일 선택',
            removeFile: '파일 제거',
            downloadSample: '샘플 다운로드'
        }
    },
    // Introduction
    introduction: {
        overview: '"Design"은 새로운 전해질 분자가 셀 성능에 어떤 영향을 미칠 수 있는지에 대한 반정량적 참고 자료를 제공합니다.',
        modelDescription: 'Design 기능의 기반은 SES 내부 셀 테스트 데이터셋에서 학습된 데이터 기반 AI 모델입니다. 모든 데이터는 일관된 테스트 환경과 벤치마크 조건에서 생성됩니다. 이는 고품질 데이터를 보장하고 강력한 예측 정확도를 달성할 수 있게 합니다. 특정 시스템이나 테스트 조건에서의 성능을 더욱 향상시키기 위해 고객은 자체 데이터를 사용하여 모델을 미세 조정하거나 재학습할 수 있습니다.',
        predictionProcess: '예측 중 모델은 벤치마크 셀의 성능과 동일한 설계이지만 사용자가 지정한 새로운 전해질 첨가제가 포함된 가상 셀의 성능을 비교합니다. 보고된 백분율 변화는 SES 내부 테스트 플랫폼과 조건에서 도출됩니다.',
        example: '예를 들어, 분자 O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1을 평가할 때, MU 데이터베이스에 존재하면 시스템은 분자 정보를 표시합니다. 그런 다음 예측 결과가 나타나며, 화살표는 영향의 방향을 나타내고 백분율은 SES 내부 테스트 플랫폼을 기반으로 합니다. 이 경우, 모델은 새로운 전해질 첨가제가 상온 사이클 수명과 쿨롱 효율에 긍정적인 영향을 미치지만, 더 안정적인 SEI 형성으로 인해 레이트 성능이 약간 감소할 수 있다고 예측합니다.',
        // Figure 1
        figure1Label: '그림 1.',
        figure1Alt: '임의의 분자 SMILES 입력',
        figure1Caption: '임의의 분자 SMILES 입력',
        // Figure 2
        figure2Label: '그림 2.',
        figure2Alt: '입력된 분자가 MU 데이터베이스에 있는 경우 분자 정보 표시',
        figure2Caption: '입력된 분자가 MU 데이터베이스에 있는 경우 분자 정보 표시',
        // Figure 3
        figure3Label: '그림 3.',
        figure3Alt: '분자가 셀 성능에 미치는 영향의 반정량적 예측',
        figure3Caption: '분자가 셀 성능에 미치는 영향의 반정량적 예측. 화살표는 긍정적 또는 부정적 영향을 나타내며, 백분율은 각 조건에서 SES 테스트 플랫폼에서 도출되었습니다.',
        // 레거시 키
        figureAlt: 'Design 모델에 의한 분자의 셀 성능 예측 예시',
        figureCaption: '그림. Design 모델에 의한 분자의 셀 성능 예측 예시',
        accuracy: '내부 검증에 따르면, 현재 모델은 약 85%의 방향 정확도를 달성하며, 이는 정의된 조건에서 이전에 보지 못한 약 10개의 분자 중 8개의 영향을 올바르게 판단할 수 있음을 의미합니다.',
        supportedSystems: '현재 Design 모듈은 NCM811 – 12% Si/흑연 – 카보네이트 전해질 시스템을 지원하며, 상온 사이클링, 45 °C 사이클링 및 상온 레이트 성능에 대한 예측이 가능합니다. 추가 셀 시스템과 테스트 조건은 향후 업데이트에 포함될 예정입니다.',
        customization: '셀 화학, 셀 설계 및 애플리케이션 조건은 매우 다양하므로, 고객은 자체 데이터를 사용하여 모델을 미세 조정하거나 재학습하여 특정 시스템에 대한 최고의 예측 정확도를 달성할 수 있습니다. 이 기능은 100% 데이터 프라이버시와 제로 데이터 유출을 보장하는 온프레미스 배포 MU Box에 포함되어 있습니다.',
        automation: '데이터 증강, 모델 학습 및 모델 평가는 완전히 자동화되어 있습니다. 고객은 다양한 첨가제 분자가 포함된 데이터셋을 수집하고 업로드하기만 하면 됩니다. 자세한 지침은 "Train" 기능에서 확인할 수 있습니다.'
    },
    // Model Detail
    modelDetail: {
        title: "모델 정보",
        modelId: "모델 ID:",
        back: "뒤로",
        onlineModel: "모델 배포",
        offlineModel: "모델 배포 취소",
        deploying: "배포 중...",
        undeploying: "배포 취소 중...",
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
        trainingFiles: "학습 데이터셋",
        trainingMetrics: "학습 결과",
        accuracy: "정확도",
        loss: "손실",
        epochs: "에포크",
        trainingTime: "학습 시간",
        validationScore: "검증 점수",
        baseRMSE: "기본 모델 RMSE",
        baseR2: "기본 모델 R²",
        trainRMSE: "새 모델 RMSE",
        trainR2: "새 모델 R²",
        rmse: "RMSE",
        r2: "R²",
        baseModelLabel: "기본 모델",
        newModelLabel: "새 모델",
        designRecords: "설계 기록",
        recordId: "기록 ID",
        smiles: "SMILES",
        temp25Count: "25°C 양성",
        temp45Count: "45°C 양성",
        actions: "작업",
        viewDetails: "상세 보기",
        loadingText: "로딩 중...",
        error: "오류",
        noFiles: "학습 파일이 없습니다",
        noMetrics: "학습 지표가 없습니다",
        beforeTraining: "학습 전",
        afterTraining: "학습 후",
        downloadingLog: "다운로드 중...",
        downloadTrainLog: "학습 로그 다운로드",
        confirmDeploy: "이 모델을 배포하시겠습니까?",
        confirmUndeploy: "이 모델 배포를 취소하시겠습니까?",
        deploySuccess: "모델이 성공적으로 배포되었습니다!",
        undeploySuccess: "모델 배포가 성공적으로 취소되었습니다!",
        errors: {
            noModelId: "모델 ID가 제공되지 않았습니다",
            loadFailed: "모델 상세 정보 로드 실패",
            deployFailed: "모델 배포 실패",
            undeployFailed: "모델 배포 취소 실패",
            cannotDeployDemo: "데모 모델은 배포할 수 없습니다",
            cannotUndeployDemo: "데모 모델은 배포 취소할 수 없습니다",
            downloadLogFailed: "학습 로그 다운로드 실패"
        }
    },
    // Record Detail
    record: {
        title: "기록 상세",
        missingId: "기록 ID 매개변수 누락",
        fetchError: "기록 상세 정보 가져오기 실패",
        loading: "로딩 중...",
        createdAt: "생성 시간",
        cellChemistry: "설계 설정",
        cellChemistryLabel: "셀 화학",
        modelSelect: "모델 선택",
        noModel: "모델 정보 없음",
        weightPercentage: "중량 백분율"
    }
};
