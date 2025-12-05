export default {
    // Train page
    train: {
        title: '新規モデルトレーニング',
        back: '戻る',
        startTraining: 'トレーニング開始',
        submitting: '送信中...',
        success: 'モデルトレーニングが正常に開始されました！',
        errors: {
            modelNameRequired: 'モデル名を入力してください',
            baseModelRequired: 'ベースモデルを選択してください',
            fileRequired: 'トレーニングデータセットをアップロードしてください',
            fileSize: 'ファイルサイズが 50MB を超えています',
            unknown: 'トレーニングの開始に失敗しました'
        },
        step1: {
            title: 'モデル情報',
            name: 'モデル名',
            namePlaceholder: 'モデル名を入力',
            remarks: '備考（オプション）',
            remarksPlaceholder: '追加のメモや備考を入力'
        },
        step2: {
            title: 'セル化学仕様',
            cathode: 'カソード',
            cathodePlaceholder: 'Polycrystal NCM811, 4 mAh/cm²',
            anode: 'アノード',
            anodePlaceholder: '12% SiC + Graphite',
            benchmarkElectrolyte: 'ベンチマーク電解液',
            benchmarkElectrolytePlaceholder: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/LiDFP',
            cellDesign: 'セル設計',
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
        },
        step3: {
            title: 'ベースモデル',
            loading: 'モデル読み込み中...',
            noModels: '利用可能なベースモデルがありません'
        },
        step4: {
            title: 'トレーニングデータセット',
            upload: 'データセットをアップロード',
            dragDrop: 'ここにファイルをドラッグアンドドロップ、またはクリックして参照',
            formats: 'サポート形式: CSV, XLSX（最大 50MB）',
            chooseFile: 'ファイルを選択',
            downloadSample: 'サンプルをダウンロード'
        }
    },
    // Introduction
    introduction: {
        overview: '"Design" は、新しい電解質分子がセル性能にどのような影響を与える可能性があるかについての半定量的な参考情報を提供します。',
        modelDescription: 'Design 機能は、SES 社内のセルテストデータセットで学習されたデータ駆動型 AI モデルによって動作します。すべてのデータは一貫したテスト環境とベンチマーク条件下で生成されています。これにより高いデータ品質が確保され、AI モデルは高い予測精度を達成できます。',
        predictionProcess: '予測時、モデルはベンチマークセルの性能と、同じ設計でユーザーが指定した新しい電解質添加剤を組み込んだ仮想セルの性能を比較します。報告されるパーセンテージ変化は、SES 社内のテストプラットフォームと条件から導出されています。',
        example: '例えば、分子 O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1 を評価する場合、MU データベースに存在すればシステムは分子情報を表示します。その後、予測結果が表示され、矢印は影響の方向を示し、パーセンテージは SES 社内テストプラットフォームに基づいています。この例では、モデルは新しい電解質添加剤が室温サイクル寿命とクーロン効率にプラスの影響を与えるが、より安定した SEI の形成により、レート性能がわずかに低下する可能性があると予測しています。',
        // Figure 1
        figure1Label: '図 1.',
        figure1Alt: '任意の分子の SMILES を入力',
        figure1Caption: '任意の分子の SMILES を入力',
        // Figure 2
        figure2Label: '図 2.',
        figure2Alt: '入力された分子が MU データベースに存在する場合、分子情報が表示されます',
        figure2Caption: '入力された分子が MU データベースに存在する場合、分子情報が表示されます',
        // Figure 3
        figure3Label: '図 3.',
        figure3Alt: '分子がセル性能に与える影響の半定量的予測',
        figure3Caption: '分子がセル性能に与える影響の半定量的予測。矢印はプラスまたはマイナスの影響を示し、パーセンテージは各条件下での SES テストプラットフォームから導出されています。',
        // レガシーキー
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
        offlineModel: "モデルをアンデプロイ",
        deploying: "デプロイ中...",
        undeploying: "アンデプロイ中...",
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
        trainingFiles: "トレーニングデータセット",
        trainingMetrics: "トレーニング結果",
        accuracy: "精度",
        loss: "損失",
        epochs: "エポック数",
        trainingTime: "トレーニング時間",
        validationScore: "検証スコア",
        baseRMSE: "ベースモデル RMSE",
        baseR2: "ベースモデル R²",
        trainRMSE: "新モデル RMSE",
        trainR2: "新モデル R²",
        rmse: "RMSE",
        r2: "R²",
        baseModelLabel: "ベースモデル",
        newModelLabel: "新モデル",
        designRecords: "デザイン記録",
        recordId: "記録ID",
        smiles: "SMILES",
        temp25Count: "25°C陽性",
        temp45Count: "45°C陽性",
        actions: "操作",
        viewDetails: "詳細を表示",
        loadingText: "読み込み中...",
        noFiles: "トレーニングファイルがありません",
        noMetrics: "トレーニング指標がありません",
        confirmDeploy: "このモデルをデプロイしてもよろしいですか？",
        confirmUndeploy: "このモデルをアンデプロイしてもよろしいですか？",
        deploySuccess: "モデルが正常にデプロイされました！",
        undeploySuccess: "モデルが正常にアンデプロイされました！",
        errors: {
            noModelId: "モデルIDが提供されていません",
            loadFailed: "モデル詳細の読み込みに失敗しました",
            deployFailed: "モデルのデプロイに失敗しました",
            undeployFailed: "モデルのアンデプロイに失敗しました",
            cannotDeployDemo: "デモモデルはデプロイできません",
            cannotUndeployDemo: "デモモデルはアンデプロイできません"
        }
    },
    // Record Detail
    record: {
        title: "記録詳細",
        missingId: "記録IDパラメータが不足しています",
        fetchError: "記録詳細の取得に失敗しました",
        loading: "読み込み中...",
        createdAt: "作成日時",
        cellChemistry: "セル化学選択",
        cellChemistryLabel: "セル化学",
        modelSelect: "モデル選択",
        noModel: "モデル情報なし",
        weightPercentage: "重量パーセンテージ"
    }
};
