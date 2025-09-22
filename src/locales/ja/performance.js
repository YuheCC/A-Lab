export default {
  // Page header
  title: "添加剤分子を用いた電池性能予測",
  beta: "ベータ",
  
  // Battery System Selection
  batterySystemSelection: {
    title: "バッテリーシステム選択",
    label: "バッテリーシステム",
    loading: "読み込み中...",
    systemSpecs: {
      title: "システム仕様",
      cathode: "正極:",
      anode: "負極:",
      benchmarkElectrolyte: "ベンチマーク電解液:",
      cellDesign: "セル設計:"
    }
  },
  
  // Additive input
  additive: {
    label: "添加剤 (SMILES)",
    required: "*",
    placeholder: "有効なSMILESを入力してください"
  },

  // Weight percentage
  weightPercentage: {
    label: "重量パーセント (wt%)",
    tooltip: "カスタム値のサポートは近日公開予定"
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
    temperatureTabs: {
      temp25: "25°C性能",
      temp45: "45°C性能"
    },
    performance: {
      cycleLife25: "25 °C サイクル寿命",
      ce25: "25 °C CE",
      ratePerformance25: "25 °C レート性能",
      cycleLife45: "45 °C サイクル寿命",
      ce45: "45 °C CE"
    },
    status: {
      positive: "ポジティブ",
      negative: "ネガティブ",
      neutral: "ニュートラル"
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
    newPrediction: "新しい予測",
    searchPlaceholder: "ファイル名で検索...",
    status: {
      completed: "完了"
    },
    actions: {
      viewDetails: "見る",
      delete: "削除",
      deleteConfirm: "この記録を削除してもよろしいですか？",
      deleteFailed: "記録の削除に失敗しました"
    },
    noResults: {
      message: "予測記録がありません。",
      clearFilters: "すべてのフィルターをクリア"
    },
    loading: {
      message: "履歴データを読み込み中...",
      error: "エラー",
      retry: "再試行",
      failedToLoad: "履歴データの読み込みに失敗しました"
    }
  },
  
  // Battery system fallback
  batterySystemFallback: "バッテリーシステム"
}