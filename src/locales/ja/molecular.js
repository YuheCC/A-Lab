export default {
  nodePopup: {
    title: "分子の詳細",
    smiles: "SMILES",
    umapCoordinates: "UMAP座標",
    properties: "プロパティ",
    copyAllData: "すべてのデータをコピー",
    addToFavorites: "お気に入りに追加",
    saving: "保存中...",
    copySuccess: "分子情報がクリップボードにコピーされました！",
    copyError: "分子データのコピーに失敗しました"
  },
  molCard: {
    moleculeInfo: "分子情報",
    invalidData: "無効な分子データ構造です。",
    noMoleculeData: "利用可能な分子データがありません。",
    loading: "読み込み中...",
    clickForDetails: "詳細を表示するには分子をクリックしてください。",
    notAvailable: "N/A",
    clickToCollapse: "クリックして折りたたむ",
    clickToExpand: "クリックして詳細を展開"
  },
  moleculeModal: {
    original: "元の分子",
    findSimilar: "類似を検索",
    similarWithCount: "類似分子 ({{count}})",
    functionalGroupsTitle: "官能基",
    functionalGroupList: "エーテル、ケタール、炭酸エステル、エステル",
    unknown: "不明",
    types: {
      solvent: "溶媒",
      cosolvent: "共溶媒",
      diluent: "希釈剤",
      additive: "添加剤",
      salt: "Salt"
    },
    additiveSubtypes: {
      title: "添加剤サブカテゴリ",
      categoryLabel: "カテゴリ",
      mechanistic: "メカニズム",
      outcome: "成果",
      mechanisticOptions: {
        seiStabilizer: "SEI安定化剤",
        ceiStabilizer: "CEI安定化剤",
        hfNeutralizer: "HF中和剤",
        tmDissolutionSuppressor: "遷移金属溶出抑制剤",
        desolvationOptimizer: "脱溶媒化最適化剤",
        dendriteSuppressor: "デンドライト抑制剤",
        polysulfideSuppressor: "ポリスルフィド抑制剤",
        gasSuppressor: "ガス抑制剤",
        flameRetardant: "難燃剤"
      },
      outcomeOptions: {
        fastCharging: "急速充電",
        highVoltage: "高電圧",
        hotboxThermal: "ホットボックス（熱処理）",
        htCycling: "高温サイクル",
        htStorage: "高温保存",
        ltCycling: "低温サイクル",
        rtCycling: "室温サイクル"
      }
    },
    properties: {
      predictedFp: "予測引火点",
      combustionEnthalpy: "燃焼エンタルピー",
      commercialViability: "商業的実現可能性"
    }
  },
  umapPlot: {
    controls: {
      resetViewport: "ビューポートをリセット",
      zoomIn: "ズームイン",
      zoomOut: "ズームアウト"
    },
    properties: {
      cluster: "クラスター",
      molWeight: "分子量",
      espMax: "Esp 最大",
      espMin: "Esp 最小",
      homo: "HOMO",
      lumo: "LUMO",
      predictedMp: "予測融点",
      predictedBp: "予測沸点",
      llmGrade: "LLM Grade"
    },
    units: {
      gPerMol: " g/mol",
      eV: " eV",
      celsius: " °C"
    }
  }
}; 
