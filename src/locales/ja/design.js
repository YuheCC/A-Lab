export default {
    // Introduction
    introduction: {
        overview: '"Design" は、新しい電解質分子がセル性能にどのような影響を与える可能性があるかについての半定量的な参考情報を提供します。',
        modelDescription: 'Design 機能は、SES 社内のセルテストデータセットで学習されたデータ駆動型 AI モデルによって動作します。すべてのデータは一貫したテスト環境とベンチマーク条件下で生成されています。これにより高いデータ品質が確保され、AI モデルは高い予測精度を達成できます。',
        predictionProcess: '予測時、モデルはベンチマークセルの性能と、同じ設計でユーザーが指定した新しい電解質添加剤を組み込んだ仮想セルの性能を比較します。報告されるパーセンテージ変化は、SES 社内のテストプラットフォームと条件から導出されています。',
        example: '例えば、分子 O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1 を評価する場合、MU データベースに存在すればシステムは分子情報を表示します。その後、予測結果が表示され、矢印は影響の方向を示し、パーセンテージは SES 社内テストプラットフォームに基づいています。この例では、モデルは新しい電解質添加剤が室温サイクル寿命とクーロン効率にプラスの影響を与えるが、より安定した SEI の形成により、レート性能がわずかに低下する可能性があると予測しています。',
        figureAlt: 'Design モデルによる分子のセル性能予測の例',
        figureCaption: '図. Design モデルによる分子のセル性能予測の例',
        accuracy: '社内検証に基づくと、現在のモデルは約 85% の方向精度を達成しており、定義された条件下で以前に見たことのない約 10 個の分子のうち 8 個の影響を正しく判断できることを意味します。',
        supportedSystems: '現在の Design モジュールは NCM811 – 12% Si/グラファイト – カーボネート電解質システムをサポートしており、室温サイクル、45 °C サイクル、室温レート性能の予測が可能です。追加のセルシステムとテスト条件は今後のアップデートで組み込まれる予定です。'
    },
    // Model Detail
    modelDetail: {
        title: "モデル情報",
        modelId: "モデルID：",
        back: "戻る",
        onlineModel: "モデルをデプロイ",
        offlineModel: "モデルをオフライン",
        creator: "作成者：",
        status: "ステータス：",
        statusOnline: "オンライン",
        statusTrained: "トレーニング済み",
        statusTraining: "トレーニング中",
        created: "作成日時：",
        remarks: "備考：",
        baseModel: "ベースモデル",
        trainingDataset: "トレーニングデータセット",
        datasetName: "データセット名：",
        fileSize: "ファイルサイズ：",
        totalSamples: "総サンプル数：",
        ratio: "トレーニング-テスト比：",
        trainingResults: "トレーニング結果",
        accuracy: "精度",
        loss: "損失",
        epochs: "エポック数",
        trainingTime: "トレーニング時間",
        validationScore: "検証スコア",
        designRecords: "デザイン記録",
        recordId: "記録ID",
        smiles: "SMILES",
        temp25Count: "25°C陽性",
        temp45Count: "45°C陽性",
        actions: "操作",
        viewDetails: "詳細を表示"
    }
};
