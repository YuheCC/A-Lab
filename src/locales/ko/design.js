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
        instruction: {
            title: "MU-in-Box 설계 기능 설명",
            functionality: {
                title: "1. 기능 설명",
                desc: "MU-in-Box는 두 가지 주요 기능을 제공합니다:",
                train: {
                    title: "1.1 모델 학습 및 평가",
                    input: "입력: “Customer table template for model tuning.xlsx”",
                    output: "출력: 학습된 모델 및 평가 지표 결과",
                    metrics1: "CR, CL 작업 평가 지표: RMSE (Root Mean Square Error) 및 R² (Coefficient of Determination)",
                    metrics2: "CE 작업 평가 지표: F1 score 및 AUC (area under curve)"
                },
                predict: {
                    title: "1.2 성능 예측",
                    input: "입력: 새 첨가제의 SMILES",
                    output: "출력: 기준 전해액 대비 새 첨가제의 성능 변화 예측 결과",
                    note: "사용자는 데이터를 입력하여 모델을 학습시키고 예측을 수행할 수 있습니다."
                }
            },
            structure: {
                title: "2. 테이블 구조",
                p1: "1부: 셀 정보 (양극 / 음극 / 전해액 코드)",
                p2: "2부: 용매",
                p3: "3부: 리튬 염",
                p4: "4부: 첨가제",
                p5: "5부: 셀 성능"
            },
            filling: {
                title: "3. 테이블 작성 설명",
                template: {
                    title: "3.1 데이터 템플릿 요구 사항 — “Customer table template for model tuning.xlsx”",
                    row1: "템플릿의 처음 두 행은 수정하지 마십시오.",
                    row2: "열을 추가하거나 제거하지 마십시오."
                },
                requirements: {
                    title: "3.2 데이터 작성 요구 사항",
                    item1: "테이블의 3번째 행은 기준 전해액이며, 모든 작업 값은 1입니다. 다른 전해액 값은 기준 전해액에 대한 상대 비율입니다.",
                    item2: "각 전해액에 대해 하나 이상의 작업 값이 비어 있지 않은지 확인하십시오.",
                    item3: "각 전해액 배합의 합계가 100%가 되도록 하십시오."
                }
            },
            notes: {
                title: "4. 각 부분 작성 주의 사항",
                p1: {
                    title: "1부: 셀 정보",
                    item1: "모든 항목의 양극 및 음극 유형이 일치하는지 확인하십시오.",
                    item2: "전해액 코드만 변경할 수 있습니다."
                },
                p2: {
                    title: "2부: 용매",
                    item1: "각 용매의 SMILES 및 wt%를 입력하십시오 (최대 Solvent 5까지).",
                    item2: "모든 SMILES가 유효한지 확인하십시오.",
                    item3: "기준 전해액에는 최소 3개의 용매가 포함되어야 합니다."
                },
                p3: {
                    title: "3부: 리튬 염",
                    item1: "각 리튬 염의 SMILES 및 wt%를 입력하십시오 (최대 Salt 3까지).",
                    item2: "SMILES가 유효한지 확인하십시오."
                },
                p4: {
                    title: "4부: 첨가제",
                    item1: "각 첨가제의 SMILES 및 wt%를 입력하십시오 (최대 Additive 6까지).",
                    item2: "기준 전해액의 첨가제 수는 3개를 초과해서는 안 됩니다."
                },
                p5: {
                    title: "5부: 셀 성능 데이터",
                    item1: "사이클 수명 (25°C): 25°C 및 임의의 사이클 조건에서 배터리 용량이 80%로 감소할 때까지의 사이클 수.",
                    item2: "평균 쿨롱 효율 (25°C): 25°C 및 임의의 사이클 조건에서 배터리 용량이 80%로 감소할 때까지 각 사이클 쿨롱 효율의 평균값.",
                    item3: "고배율 방전 에너지 유지율 (25°C): 25°C 조건에서 최고 배율로 방전했을 때와 최저 배율로 방전했을 때를 비교한 에너지 유지율.",
                    item4: "사이클 수명 (45°C): 45°C 및 임의의 사이클 조건에서 배터리 용량이 80%로 감소할 때까지의 사이클 수.",
                    item5: "평균 쿨롱 효율 (45°C): 45°C 및 임의의 사이클 조건에서 배터리 용량이 80%로 감소할 때까지 각 사이클 쿨롱 효율의 평균값.",
                    note1: "임의의 성능 데이터를 사용하여 모델을 학습시킬 수 있습니다.",
                    note2: "동일한 배합이 여러 셀(예: 100, 120, 130)에 해당하는 경우, 동일한 셀 내에 반각 쉼표로 구분하여 입력하십시오: 100,120,130",
                    note3: "엑셀 셀 서식이 올바른지 확인하십시오."
                }
            },
            tips: {
                title: "5. 기타 팁",
                item1: "5.1 중량 확인 열을 사용하여 배합 합계가 100 wt%인지 확인할 수 있습니다."
            }
        },
        step1: {
            title: '모델 정보',
            name: '모델 이름',
            namePlaceholder: '모델 이름 입력',
            remarks: '비고',
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
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity',
            // Note: 전문 용어는 영어 원문 유지
            solventPlaceholder: 'EC/EMC/DEC',
            saltPlaceholder: '1M LiPF6/LiFSI',
            additivePlaceholder: 'VC/LiDFP'
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
            formats: '지원 형식: XLSX 格式',
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
        f1ScoreTooltip: {
            description: "정밀도와 재현율의 조화 평균입니다. 둘 사이의 균형을 맞춥니다.",
            precision: "정밀도",
            recall: "재현율"
        },
        aucTooltip: {
            description: "ROC 곡선 아래 면적을 나타냅니다. 모델이 클래스를 구분하는 능력을 측정합니다. AUC가 높을수록 분류 성능이 우수함을 나타냅니다."
        },
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
    // History
    history: {
        newDesign: "새 디자인",
        train: "훈련",
        loadingText: "로딩 중...",
        error: "오류",
        noResults: "디자인 기록을 찾을 수 없습니다",
        deleteConfirm: "이 기록을 삭제하시겠습니까?",
        deleteFailed: "기록 삭제 실패",
        loading: {
            error: "히스토리 로드 실패"
        },
        actions: {
            viewResults: "결과 보기",
            delete: "삭제"
        }
    },
    // Actions
    actions: {
        backToList: "목록으로 돌아가기",
        back: "뒤로",
        newDesign: "새 설계",
        newPrediction: "새 예측"
    },
    // Tabs
    tabs: {
        introduction: "소개",
        records: "기록",
        models: "모델"
    },
    // Models
    models: {
        loadingText: "로딩 중...",
        loadingError: "모델 로드 실패",
        error: "오류",
        deleteConfirm: "이 모델을 삭제하시겠습니까?",
        deleteFailed: "모델 삭제 실패",
        actions: {
            delete: "삭제"
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
    },
    // Electrolyte Module
    electrolyte: {
        features: {
            newDesign: {
                description: "새 전해질 설계 생성"
            },
            train: {
                description: "사용자 정의 모델 학습"
            }
        }
    },
    // Electrode Module
    electrode: {
        title: "전극이 배터리 성능에 미치는 영향",
        // Material Description (shared across electrode pages)
        materialDescription: {
            title: "SiC 재료 설명",
            silicon: "실리콘 (Si):",
            carbon: "탄소 (C):",
            description: "이 Si-C 복합재는 최대 1937.9 mAh/g의 탈리튬화 용량과 93.8%의 초기 쿨롱 효율(ICE)을 나타냅니다. D50 입자 크기는 8.58 μm로 제어되며, 탭 밀도는 0.79 g/cm³입니다."
        },
        subtitle: "전극 재료가 배터리 성능에 미치는 영향을 예측, 분석 및 최적화하도록 설계된 데이터 기반 AI 모델입니다. 이 모델은 재료 및 배터리 모두의 트렌드 분석과 역설계를 지원하며, 전문적인 배터리 연구 개발을 위해 고객 제공 데이터셋으로 미세 조정할 수 있습니다.",
        features: {
            resultPrediction: {
                title: "성능 예측",
                description: "배터리 성능 예측"
            },
            trendAnalysis: {
                title: "트렌드 분석",
                description: "매개변수 트렌드 예측"
            },
            optimize: {
                title: "역설계",
                description: "전극 매개변수 최적화"
            },
            train: {
                title: "학습",
                description: "사용자 정의 모델 학습"
            }
        },
        tabs: {
            introduction: "소개",
            records: "기록",
            models: "모델"
        },
        introduction: {
            overview: "전극 모듈에는 네 가지 주요 기능이 포함되어 있습니다:",
            function1: "1. 결과 예측: 전극 재료 선택 및 매개변수 설정을 기반으로 배터리 성능 예측",
            function2: "2. 트렌드 분석: 전극 배합 정보를 사전 설정하고 하나 이상의 매개변수를 변수로 설정하여 이러한 매개변수 변화에 따른 배터리 성능 변화 추세 예측",
            function3: "3. 최적화: 목표 배터리 성능 지표를 정의하여 역으로 적절한 전극 재료 선택 및 매개변수 추천",
            function4: "4. 학습: 사용자가 사용자 정의 모델을 학습할 수 있도록 함",
            // 새로운 상세 소개 콘텐츠
            resultPrediction: {
                title: "1. 성능 예측",
                description1: "성능 예측은 정의된 셀 설계 내에서 전극 재료 선택 및 배합 매개변수를 기반으로 젤리롤 두께, 체적 에너지 밀도(Wh/L), 중량 비에너지(Wh/kg), 속도 성능 및 사이클 수명(향후 개발)을 포함한 셀 수준 성능에 대한 데이터 기반 예측을 제공합니다.",
                description2: "SES의 독점 실험 데이터베이스에서 학습된 AI 모델로 구동되는 이 기능은 물리적 프로토타이핑 없이도 특정 설계 구성을 신속하고 확장 가능하게 평가할 수 있게 합니다. 엔지니어가 주어진 셀 설계 및 배합의 예상 성능 결과를 평가하여 후보 설계의 효율적인 스크리닝 및 비교를 지원합니다.",
                exampleTitle: "예",
                example: "특정 양극 및 음극 배합과 결합된 주어진 셀 설계의 용량, 체적 에너지 밀도(Wh/L), 중량 비에너지(Wh/kg), 젤리롤 두께를 예측합니다.",
                image1Caption: "전극 설계",
                image2Caption: "성능 예측"
            },
            inverseDesign: {
                title: "2. 역설계",
                description1: "역설계는 사용자 정의 성능 목표를 충족하는 전극 재료의 잠재적 배합을 자동으로 생성합니다. 설계 공간을 수동으로 반복하는 대신, 이 기능은 현실적인 물리적 및 제조 제약 내에서 생성하여 유효한 설계 후보를 식별합니다. 이 접근 방식은 셀 설계와 성능 간의 절충안을 밝혀 다목적 의사 결정을 지원하면서 비현실적이거나 불안정한 솔루션을 피합니다.",
                description2: "",
                exampleTitle: "예",
                example: "셀 용량이 2.6~4.6 Ah 사이이고 최소 290 Wh/kg 및 960 Wh/L를 달성할 수 있는 전극 배합을 설계합니다.",
                image1Caption: "목표 설정",
                image2Caption: "설계 추천",
                image3Caption: "설계 세부정보"
            }
        },
        predict: {
            title: "성능 예측",
            back: "뒤로",
            electrodeDesign: "전극 설계",
            cellDesign: "셀 타입",    
            selectCellDesign: "셀 타입 선택",
            anodeActiveMaterial: "음극 활물질",
            cathodeActiveMaterial: "양극 활물질",
            selectMaterial: "재료 선택",
            anodeParameters: "음극 매개변수",
            cathodeParameters: "양극 매개변수",
            binder1: "바인더 1 (wt.%)",
            binder2: "바인더 2 (wt.%)",
            binder3: "바인더 3 (wt.%)",
            conductiveCarbon: "도전재 (wt.%)",
            cnt: "CNT (wt.%)",
            pressDensity: "Press Density (g/cc)",
            arealLoading: "Areal Loading (mAh/cm²)",
            dimension: "양극 치수",
            width: "너비 (mm)",
            length: "길이 (mm)",
            layers: "층수",
            enterWidth: "너비 입력",
            enterLength: "길이 입력",
            enterLayers: "층수 입력",
            calculate: "계산",
            cellPerformance: "배터리 성능 예측",
            designCapacity: "설계 용량",
            specificED: "중량 에너지 밀도",
            specificEDTooltip: "파우치 재료, 전해액 및 보조 비활성 구성요소를 포함한 전체 배터리 질량을 기준으로 계산된 에너지 밀도입니다. 전해액 충전량은 활성 영역 대비 약 41% 과잉입니다.",
            jellyRollThickness: "젤리롤 두께",
            volumetricED: "체적 에너지 밀도",
            volumetricEDTooltip: "젤리롤 부피를 기준으로 계산된 에너지 밀도입니다.",
            calculateError: "예측 계산 실패",
            npRatio: "NP 비율",
            enterNpRatio: "NP 비율 입력",
            activeMaterial1: "Active Material SiC (wt.%)",
            activeMaterial2: "Active Material Graphite (wt.%)",
            anodeArealLoading: "Areal Loading (mAh/cm²)",
            cathodeActiveMaterialLabel: "Active material (wt.%)",
            kf9700: "PVDF (wt.%)",
            cn01y: "CNT (wt.%)",
            superC65: "Carbon Black (wt.%)",
            cmc: "CMC (wt.%)",
            sbr: "SBR (wt.%)",
            paa: "PAA (wt.%)",
            superP: "Carbon Black (wt.%)",
            swcnt: "CNT (wt.%)",
            rateCapability: "속도 성능 (1C-5C)",
            electrolyteParameters: "전해액 매개변수",
            electrolyteContent: "전해액 함량 (g/Ah)"
        },
        optimize: {
            title: "역설계",
            back: "뒤로",
            performanceTargets: "성능 목표",
            cellInformation: "셀 정보",
            cellType: "셀 타입",
            selectCellDesign: "셀 설계 선택",
            npRatio: "NP 비율",
            anodeActiveMaterial: "음극 활물질",
            cathodeActiveMaterial: "양극 활물질",
            selectMaterial: "음극 재료 선택",
            cathodeDimension: "양극 치수",
            width: "폭 (mm)",
            length: "길이 (mm)",
            layers: "층수",
            enterWidth: "폭 입력",
            enterLength: "길이 입력",
            enterLayers: "층수 입력",
            targets: "목표",
            designCapacity: "설계 용량",
            specificEnergy: "중량 에너지 밀도",
            jellyRollThickness: "권취 두께",
            volumetricEnergyDensity: "체적 에너지 밀도",
            calculate: "계산",
            designRecommendations: "설계 추천",
            no: "No.",
            actions: "작업",
            details: "세부정보",
            designDetails: "설계 세부정보",
            cathodeParameters: "양극 매개변수",
            anodeParameters: "음극 매개변수",
            messages: {
                fillAllFields: "모든 필수 필드를 입력하세요",
                fillAllDimensions: "모든 치수 매개변수를 입력하세요",
                calculateSuccess: "추천이 성공적으로 계산되었습니다",
                calculateError: "추천 계산에 실패했습니다",
                loadDetailsError: "세부정보 로드에 실패했습니다"
            },
            additionalPrompt: "다른 추천 결과를 보시겠습니까? (목표 값에 약간의 편차가 있을 수 있습니다)",
            additionalRecommendations: "추가 추천 (약간의 편차 있음)",
            expand: "펼치기",
            collapse: "접기",
            emptyState: {
                title: "일치하는 설계를 찾을 수 없습니다",
                description: "현재 조건에 맞는 설계를 찾을 수 없습니다. 목표 값을 조정해 보세요.",
                descriptionWithRecommendation: "현재 조건에 맞는 설계를 찾을 수 없습니다. 목표 값을 조정하거나 아래의 다른 추천을 확인해 보세요."
            }
        },
        records: {
            resultPrediction: "성능 예측",
            trendAnalysis: "트렌드 분석",
            inverseDesign: "역설계",
            searchPlaceholder: "기록 ID 검색",
            selectDate: "날짜 선택",
            showing: "{{count}} / {{total}} 건의 기록 표시",
            refresh: "새로고침",
            reset: "초기화",
            recordId: "기록 ID",
            cellDesign: "셀 타입",
            cathode: "양극 활물질",
            anode: "음극 활물질",
            createdTime: "생성 시간",
            actions: "작업",
            viewResults: "결과 보기",
            delete: "삭제",
            deleteConfirm: "이 기록을 삭제하시겠습니까?",
            deleteSuccess: "기록이 성공적으로 삭제되었습니다",
            deleteError: "기록 삭제에 실패했습니다",
            loadError: "기록 로드에 실패했습니다",
            noRecords: "기록을 찾을 수 없습니다"
        },
        validation: {
            parameterRange: "{{label}}은(는) {{min}}에서 {{max}} 사이여야 합니다",
            selectCathodeMaterial: "양극 활물질을 선택하세요",
            selectAnodeMaterial: "음극 활물질을 선택하세요",
            cathodeConductiveSum: "Carbon Black + CNT의 합계는 0.8보다 커야 합니다",
            cmcGreaterThanSwcnt: "CMC는 CNT보다 커야 합니다",
            anodeConductiveSum: "Carbon Black + CNT의 합계는 0.005보다 커야 합니다",
            fillAllDimensions: "모든 치수 매개변수를 입력하세요",
            ratioSmallWidth: "폭이 100을 초과하지 않는 경우, 종횡비는 0.2에서 1 범위 내에 있어야 합니다.",
            ratioLargeWidth: "폭이 100에서 1000 사이인 경우, 종횡비는 0.1에서 0.5 사이를 유지해야 합니다."
        }
    }
};
