export default {
    // Introduction
    introduction: {
        overview: '"Design"은 새로운 전해질 분자가 셀 성능에 어떤 영향을 미칠 수 있는지에 대한 반정량적 참고 자료를 제공합니다.',
        modelDescription: 'Design 기능은 SES 내부 셀 테스트 데이터셋에서 학습된 데이터 기반 AI 모델에 의해 구동됩니다. 모든 데이터는 일관된 테스트 환경과 벤치마크 조건에서 생성됩니다. 이는 높은 데이터 품질을 보장하고 AI 모델이 강력한 예측 정확도를 달성할 수 있게 합니다.',
        predictionProcess: '예측 중 모델은 벤치마크 셀의 성능과 동일한 설계이지만 사용자가 지정한 새로운 전해질 첨가제가 포함된 가상 셀의 성능을 비교합니다. 보고된 백분율 변화는 SES 내부 테스트 플랫폼과 조건에서 도출됩니다.',
        example: '예를 들어, 분자 O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1을 평가할 때, MU 데이터베이스에 존재하면 시스템은 분자 정보를 표시합니다. 그런 다음 예측 결과가 나타나며, 화살표는 영향의 방향을 나타내고 백분율은 SES 내부 테스트 플랫폼을 기반으로 합니다. 이 경우, 모델은 새로운 전해질 첨가제가 상온 사이클 수명과 쿨롱 효율에 긍정적인 영향을 미치지만, 더 안정적인 SEI 형성으로 인해 레이트 성능이 약간 감소할 수 있다고 예측합니다.',
        figureAlt: 'Design 모델에 의한 분자의 셀 성능 예측 예시',
        figureCaption: '그림. Design 모델에 의한 분자의 셀 성능 예측 예시',
        accuracy: '내부 검증에 따르면, 현재 모델은 약 85%의 방향 정확도를 달성하며, 이는 정의된 조건에서 이전에 보지 못한 약 10개의 분자 중 8개의 영향을 올바르게 판단할 수 있음을 의미합니다.',
        supportedSystems: '현재 Design 모듈은 NCM811 – 12% Si/흑연 – 카보네이트 전해질 시스템을 지원하며, 상온 사이클링, 45 °C 사이클링 및 상온 레이트 성능에 대한 예측이 가능합니다. 추가 셀 시스템과 테스트 조건은 향후 업데이트에 포함될 예정입니다.'
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
        statusTraining: "학습 중",
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
        designRecords: "설계 기록",
        recordId: "기록 ID",
        smiles: "SMILES",
        temp25Count: "25°C 양성",
        temp45Count: "45°C 양성",
        actions: "작업",
        viewDetails: "상세 보기"
    }
};
