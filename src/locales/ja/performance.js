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
    placeholder: "SMILES分子式を入力してください"
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
      espMax: "ESP MAX:"
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
    title: "LLM分析",
    sections: {
      nickelOptimization: "1. ニッケル脱水素最適化",
      cyclingOptimization: "2. 4°Cサイクリング最適化",
      recommendations: "3. 包括的推奨事項"
    },
    references: "参考文献"
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
      viewDetails: "詳細を見る",
      delete: "削除"
    }
  }
}