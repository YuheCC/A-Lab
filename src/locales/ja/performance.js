export default {
  // Page header
  title: "添加剤の電池性能への影響",
  subtitle: "SES社内実験データで訓練されたAIモデルを使用して、添加剤がセル性能指標（サイクル寿命、コロンビック効率、レート性能）に与える影響を予測します",
  beta: "ベータ",
  disclaimerTitle: "免責事項",
  disclaimer: "<strong>注意：</strong>この機能は、内部テストデータおよび定義されたベンチマーク電解液（溶媒：EC/EMC/DEC 比率 2:3:2；塩：1M LiPF6/LiFSI；添加剤：VC/LiDFP）を使用し、添加剤ありとなしのセル性能を比較することにより、新しい添加剤の影響を評価します。異なるセル設計またはベンチマーク電解液に適用する場合、結果は異なる可能性があります。今後のアップデートでは、カスタマイズ可能なベンチマーク電解液、複数添加剤評価、およびより広範な設計柔軟性を可能にする機能を拡張する予定です。",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "セル化学選択",
    label: "セル化学",
    loading: "読み込み中...",
    systemSpecs: {
      title: "セル仕様",
      cathode: "正極:",
      anode: "負極:",
      benchmarkElectrolyte: "ベンチマーク電解液:",
      cellDesign: "セル設計:"
    }
  },

  // Model Selection
  modelSelection: {
    label: "予測モデル選択",
    placeholder: "予測モデルを選択してください",
    baseModel: "ベースモデル",
    finetunedModels: "ファインチューニングモデル",
    muModels: "Mu モデル",
    columns: {
      modelName: "モデル名",
      modelId: "モデルID",
      baseModel: "ベースモデル"
    }
  },

  // Additive input
  additive: {
    label: "添加剤のSMILES",
    required: "*",
    placeholder: "有効なSMILESを入力してください"
  },

  // Weight percentage
  weightPercentage: {
    label: "重量パーセント (wt%)",
    tooltip: "カスタム値はMU1.5でリリース予定"
  },
  
  // Molecule information
  moleculeInfo: {
    title: "分子情報",
    loading: "分子詳細を照会中...",
    properties: {
      smiles: "SMILES:",
      espMin: "ESP MIN:",
      molecularWeight: "分子量:",
      predictedMp: "予測融点:",
      umapX: "UMAP X:",
      predictedBp: "予測沸点:",
      umapY: "UMAP Y:",
      predictedFp: "予測引火点:",
      homo: "HOMO:",
      combustionEnthalpy: "燃焼エンタルピー:",
      lumo: "LUMO:",
      commercialViability: "商業的実行可能性:",
      espMax: "ESP MAX:",
      functionalGroups: "機能グループ:"
    },
    structurePlaceholder: {
      line1: "分子",
      line2: "構造"
    }
  },
  
  // SMILES not found
  smilesNotFound: {
    title: "SMILESが見つかりません",
    description: "入力されたSMILES文字列がデータベースで見つかりません。",
    suggestion: "有効なSMILES文字列を再入力するか、次の例をお試しください：",
    examples: {
      ec: "エチレンカーボネート",
      water: "水"
    }
  },
  
  // Invalid SMILES
  invalidSmiles: {
    title: "無効なSMILESフォーマット",
    description: "入力された内容は有効なSMILES分子式ではありません。",
    suggestion: "有効なSMILES文字列を入力してください。または次の例をお試しください："
  },
  
  // Calculate button
  calculate: {
    button: "計算",
    calculated: "計算済み"
  },
  
  // Results
  results: {
    title: "セル性能予測",
    titleTip: "ネガティブは、指定された添加剤を添加した後、セルの性能がベンチマーク電解液を使用したセルと同等またはそれ以下になることを意味します。\nポジティブは、指定された添加剤を添加した後、セルの性能がベンチマーク電解液を使用したセルより優れることを意味します。",
    negativeTitle: "ネガティブ (Negative)",
    positiveTitle: "ポジティブ (Positive)",
    negativeTip: "指定された添加剤を添加した後、セルの性能がベンチマーク電解液を使用したセルと同等またはそれ以下になります。",
    positiveTip: "指定された添加剤を添加した後、セルの性能がベンチマーク電解液を使用したセルより優れます。",
    upgradeToViewMetrics: "25°Cおよび45°Cのより多くのメトリクスを表示するにはプランをアップグレードしてください",
    badgeTitle: "バッジカラー指標（サイクル寿命とレート性能のみ適用）",
    badgeDescriptions: {
      gainLabel: "性能向上",
      lossLabel: "性能低下",
      levelLow: "< 5%",
      levelMid: "5%～25%",
      levelHigh: "> 25%"
    },
    descriptions: {
      ceLabel: "コロンビック効率",
      cycleLifeLabel: "サイクル寿命",
      ratePerformanceLabel: "レート性能",
      ce: "BOLからEOLまでの各サイクルの平均CE",
      cycleLife: "放電容量保持率が80%に達するサイクル数",
      ratePerformance: "0.5C放電と比較した5C放電での容量保持率"
    },
    temperatureTabs: {
      temp25: "25°C性能",
      temp45: "45°C性能"
    },
    performance: {
      cycleLife25: "サイクル寿命",
      ce25: "コロンビック効率",
      ratePerformance25: "レート性能",
      cycleLife45: "サイクル寿命",
      ce45: "コロンビック効率"
    },
    status: {
      positive: "ポジティブ",
      negative: "ネガティブ",
      neutral: "ニュートラル",
      restricted: "制限あり"
    },
    confidence: "信頼度"
  },
  
  // LLM Analysis
  llmAnalysis: {
    button: "LLM分析",
    analyzed: "分析済み",
    title: "LLM分析",
    sections: {
      nickelOptimization: "1. ニッケル脱水素最適化",
      cyclingOptimization: "2. 4°Cサイクリング最適化",
      recommendations: "3. 包括的推奨事項"
    },
    references: "参考文献"
  },

  // Analysis timing
  analysis: {
    analyzing: "分析中",
    analyzingForSeconds: "{{seconds}}秒",
    analyzingForMinutesAndSeconds: "{{minutes}}分{{seconds}}秒"
  },
  
  // General UI text
  ui: {
    calculating: "計算中...",
    analyzing: "分析中...",
    startingAnalysis: "LLM分析を開始しています...",
    analysisPlaceholder: "予測結果の分析を開始するには\"LLM分析\"ボタンをクリックしてください。",
    pleaseSelectBattery: "バッテリーシステムを選択してください",
    invalidBatterySystem: "無効なバッテリーシステムが選択されました",
    calculationFailed: "性能予測の計算に失敗しました。再試行してください。",
    analysisFailed: "LLM分析の開始に失敗しました。再試行してください。",
    sessionNotInitialized: "セッションが初期化されていません。ページを更新して再試行してください。",
    predictionFirst: "LLM分析をリクエストする前に、まず予測を実行してください"
  },
  
  // Analysis status
  analysisStatus: {
    noAnalysis: "分析結果なし",
    available: "利用可能",
    notAvailable: "利用不可"
  },
  
  // Filter options
  filters: {
    smilesSearch: "SMILES検索",
    timeRange: "時間範囲",
    status: "ステータス",
    clearFilters: "フィルターをクリア",
    timeOptions: {
      allTime: "すべての時間",
      today: "今日",
      thisWeek: "今週",
      thisMonth: "今月"
    },
    statusOptions: {
      allStatus: "すべてのステータス",
      completed: "完了",
      pending: "保留中",
      failed: "失敗"
    }
  },
  
  // History
  history: {
    title: "予測記録",
    newDesign: "新しいデザイン",
    newPrediction: "新しい予測",
    train: "トレーニング",
    searchPlaceholder: "ファイル名で検索...",
    loadingText: "読み込み中...",
    error: "エラー",
    noResults: "デザイン記録がありません",
    cannotDeleteDemo: "デモ記録は削除できません",
    status: {
      completed: "完了"
    },
    actions: {
      viewDetails: "見る",
      delete: "削除",
      deleteConfirm: "この記録を削除してもよろしいですか？",
      deleteFailed: "記録の削除に失敗しました"
    },
    loading: {
      message: "履歴データを読み込み中...",
      error: "エラー",
      retry: "再試行",
      failedToLoad: "履歴データの読み込みに失敗しました"
    }
  },

  // Records
  records: {
    searchPlaceholder: "レコード名またはIDで検索",
    allModels: "すべてのモデル",
    clearFilters: "フィルターをクリア",
    showingRecords: "{{count}}件 / {{total}}件を表示中"
  },

  // Models
  models: {
    loadingText: "読み込み中...",
    error: "エラー",
    noResults: "モデルが見つかりません",
    showingRecords: "{{count}}件 / {{total}}件を表示中",
    statusOnline: "オンライン",
    statusTrained: "訓練済み",
    statusTraining: "訓練中",
    filters: {
      searchPlaceholder: "モデルIDまたは名前で検索...",
      allStatus: "すべてのステータス",
      allBaseModels: "すべてのベースモデル",
      selectStatus: "ステータスを選択",
      selectBaseModel: "ベースモデルを選択",
      clearFilters: "フィルターをクリア",
      selectDate: "日付を選択"
    },
    columns: {
      modelId: "モデルID",
      modelName: "モデル名",
      baseModel: "ベースモデル",
      status: "ステータス",
      created: "作成日",
      createdBy: "作成者",
      actions: "アクション"
    },
    actions: {
      viewDetails: "詳細を表示"
    }
  },

  // Battery system fallback
  batterySystemFallback: "バッテリーシステム"
}
