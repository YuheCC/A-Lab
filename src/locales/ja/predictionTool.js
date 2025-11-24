export default {
    // Header
    title: "早期サイクルデータをアップロードして寿命予測",
    subtitle: "SES社内実験データで訓練されたAIモデルを使用して、リチウムイオン電池のサイクル寿命（80% SOHまでのサイクル数）を予測します。最初の100サイクル（実効サイクルなので実際の数はこれより多くなる可能性があります）のみが必要です。",
    betaTag: "BETA",
    disclaimerTitle: "免責事項",
    disclaimer: "<strong>注意：</strong>この機能は、ユーザーが提供する初期段階のサイクリングデータのみを使用してセルサイクル寿命を予測します。セル化学や設計などの追加情報は必要ありません。このモデルは現在、標準的なサイクリング条件（実際の使用プロファイルではない）下で活性イオンが限られたバッテリーシステムに適用可能です。ユーザーは自身のテストを通じて予測を検証することをお勧めします。",

    // Steps
    steps: {
        upload: "データアップロード",
        aiPredict: "AI予測",
        results: "結果表示"
    },

    // Upload Step
    upload: {
        selectFile: "ファイル選択",
        clickToUpload: "バッテリーデータファイルをクリックしてアップロード",
        subtitle: "現在はCSV形式ファイルのみサポートしており、今後より多くのファイル形式をサポート予定です",
        uploading: "ファイルをアップロード中...",
        waitText: "お待ちください",
        dataFormatTip: "📋 データフォーマット要件",
        sampleData: "サンプルデータ",
        requiredFields: "必須フィールド：",
        requiredFieldsValue: "barcode, cycle_id, current (A), voltage (V), time (s)",
        currentDirection: "電流方向：",
        currentDirectionValue: "+は充電、-は放電",
        unitRequirement: "単位要件：",
        unitRequirementValue: "電流単位A、電圧単位V、時間単位s",
        dataRequirement: "データ要件：",
        dataRequirementValue: "アップロードデータ≥100サイクル、データは時間順に並べる必要があります"
    },

    // AI Prediction Step
    prediction: {
        uploadedData: "アップロード済みデータ",
        changeFile: "ファイル変更",
        fileSize: "ファイルサイズ",
        fileType: "タイプ",
        startPrediction: "予測開始",
        progressLabel: "分析進行",
        uploadingFile: "ファイルをアップロードし、予測タスクを作成中...",
        processing: "予測タスクがバックグラウンドで処理されています、しばらくお待ちください...",
        pleaseUploadFirst: "まずファイルをアップロードしてください"
    },

    // Results Step
    results: {
        noResults: "予測結果がありません、まず予測を完了してください",
        batteryCount: "バッテリー数",
        batteryCountUnit: "個",
        avgCycleLife: "平均サイクル寿命",
        avgCycleLife1: "平均サイクル寿命",
        avgCycleLife2: "平均サイクル寿命2",
        cycleUnit: "回",
        predictionTime: "予測時間",
        unknown: "不明",
        barcode: "バーコード",
        cycleLife1: "サイクル寿命",
        cycleLife2: "サイクル寿命 2",
        noDetailedData: "詳細なバーコードデータがありません",
        dataRequirementNotMet: "アップロードされたデータが要件を満たしていません。データ処理サポートについては、",
        contactSupport: "お問い合わせください"
    },

    // Tabs
    tabs: {
        introduction: "紹介",
        records: "記録",
        models: "モデル"
    },

    // List
    list: {
        columns: {
            recordId: "記録ID",
            fileName: "ファイル名",
            batteryCount: "バッテリー数",
            avgCycleLife: "平均サイクル寿命",
            model: "モデル",
            created: "作成日時",
            actions: "操作"
        }
    },

    // History
    history: {
        title: "予測記録",
        newPrediction: "新しい予測",
        train: "トレーニング",
        searchPlaceholder: "ファイル名で検索...",
        loadingText: "読み込み中...",
        error: "エラー",
        noResults: "予測記録がありません",
        cannotDeleteDemo: "デモ記録は削除できません",
        deleteConfirm: "この記録を削除してもよろしいですか？",
        deleteSuccess: "削除成功",
        deleteFailed: "削除失敗",
        view: "表示",
        delete: "削除",
        loading: {
            error: "履歴記録の取得に失敗しました"
        },
        actions: {
            viewDetails: "詳細を表示",
            delete: "削除"
        }
    },

    // Modal
    modal: {
        title: "予測記録詳細 - 履歴データ",
        uploadedData: "アップロード済みデータ",
        predictionResults: "予測結果",
        loadingDetail: "読み込み中...",
        loadDetailFailed: "詳細データの取得に失敗しました",
        download: "ダウンロード",
        downloading: "ダウンロード中...",
        downloadFile: "ファイルダウンロード",
        downloadFailed: "ファイルダウンロードに失敗しました",
        chartTitle: "バッテリー容量変化チャート"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "履歴記録の読み込みに失敗しました",
        predictionFailed: "予測に失敗しました、再試行してください",
        uploadFailed: "ファイルアップロードに失敗しました",
        fileFormatError: "ファイル形式がサポートされていません、CSVまたはExcelファイルをアップロードしてください"
    },

    // Chart
    chart: {
        title: "バッテリー容量対サイクル数",
        cycleCount: "サイクル数",
        capacityProcess: "容量劣化（アップロードデータ）",
        predictedCycleLife: "80% SOHに達するまでの予測サイクル数",
        xAxisName: "サイクル数",
        yAxisName: "放電容量",
        predictedCapacityLine: "予測容量線",
        sohPredictionLine: "80% SOH 予測線",
        value: "値",
        noData: "データなし"
    },

    // Detail
    detail: {
        actionTitle: "予測詳細",
        loading: "予測詳細を読み込み中...",
        missingId: "予測IDパラメータがありません",
        fetchError: "予測詳細の取得に失敗しました",
        downloadFailed: "ファイルダウンロードに失敗しました"
    },

    // Actions
    actions: {
        backToList: "リストに戻る"
    },

    // Default Step
    default: {
        selectStep: "操作ステップを選択してください",
        selectStepDescription: "上記のステップから実行する操作を選択してください"
    },

    // Tutorial
    tutorial: {
        button: "チュートリアル",
        modalTitle: "使用ガイド",
        imageCaption: '予測出力と実際のセル性能の比較',
        point1: '"予測"は、最初の100サイクルの時系列データでサイクル寿命を予測できます。',
        point1_sub1: 'NCM811/12%Si.-グラファイトと炭酸塩電解液',
        point1_sub2: '1C/1Cサイクリング、100サイクルごとに0.33C/0.33C容量チェック',
        point2: 'リチウムイオン電池の場合、予測精度は±5%を達成できます。',
        point3: 'サイクル寿命が既知の実際のセルの場合、モデルは1321サイクル時にEOLを予測しました。',
        point3_sub1: '実測値は1261サイクル（各サイクルの容量保持率に基づく）または1351サイクル（容量チェックサイクルの容量保持率に基づく）です。',
        point4: '予測誤差は4.7%または2.2%であり、単純な線形外挿法（800サイクル）よりもはるかに優れています。'
    }
};