export default {
    // Header
    title: "バッテリー初期寿命予測ツール",
    betaTag: "BETA",

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
        cycleUnit: "回",
        predictionTime: "予測時間",
        unknown: "不明",
        barcode: "バーコード",
        cycleLife1: "サイクル寿命 1",
        cycleLife2: "サイクル寿命 2",
        noDetailedData: "詳細なバーコードデータがありません"
    },

    // History
    history: {
        title: "予測記録",
        newPrediction: "新しい予測",
        searchPlaceholder: "ファイル名で検索...",
        loading: "読み込み中...",
        deleteConfirm: "この記録を削除してもよろしいですか？",
        deleteSuccess: "削除成功",
        deleteFailed: "削除失敗",
        view: "表示",
        delete: "削除"
    },

    // Modal
    modal: {
        title: "予測記録詳細 - 履歴データ",
        uploadedData: "アップロード済みデータ",
        predictionResults: "予測結果",
        loadingDetail: "読み込み中...",
        loadDetailFailed: "詳細データの取得に失敗しました"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "履歴記録の読み込みに失敗しました",
        predictionFailed: "予測に失敗しました、再試行してください",
        uploadFailed: "ファイルアップロードに失敗しました",
        fileFormatError: "ファイル形式がサポートされていません、CSVまたはExcelファイルをアップロードしてください"
    },

    // Default Step
    default: {
        selectStep: "操作ステップを選択してください",
        selectStepDescription: "上記のステップから実行する操作を選択してください"
    }
};