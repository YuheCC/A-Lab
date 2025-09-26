export default {
  title: '塩と溶媒の構成',
  subtitle: '電解質を構成してカスタマイズ',
  comingSoon: 'MU1.5で導入予定',
  actions: {
    backToList: 'リストに戻る'
  },
  create: {
    newConfiguration: '新規構成'
  },

  saltConfiguration: {
    title: '塩の構成'
  },

  cationSelection: {
    label: '陽イオンの選択'
  },

  anionSelection: {
    label: '陰イオンの選択（1〜2を選択）'
  },

  totalSaltConcentration: {
    label: '総塩濃度（mol/kg）'
  },

  anionFraction: {
    label: 'BF₄⁻ 分率'
  },

  fractionType: {
    label: '分率の種類',
    mole: 'モル分率',
    weight: '重量分率'
  },

  saltSummary: {
    title: '塩のサマリー',
    selected: '選択済み',
    totalConcentration: '総塩濃度',
    fractions: '分率',
    fractionType: '分率の種類',
    totalFraction: '総分率'
  },

  solventConfiguration: {
    title: '溶媒の構成'
  },

  smilesString: {
    label: 'SMILES 文字列',
    placeholder: 'SMILES 文字列を入力'
  },

  fraction: {
    label: '分率（最小: 0.05）'
  },

  removeSolvent: '溶媒を削除',
  addSmiles: 'SMILES を追加（最大 3）',

  solventSummary: {
    title: '溶媒サマリー',
    solvent: '溶媒',
    fractionType: '分率の種類',
    totalFraction: '総分率',
    emptyPlaceholder: '空 (0), 空 (0)'
  },

  submit: {
    button: '構成を送信'
  },

  ui: {
    calculating: '入力を検証中、計算準備中…'
  },

  result: {
    processing: 'アルゴリズムモデル計算中',
    description: 'システムがモデルパラメータを処理しています。時間がかかる場合がありますので、しばらくお待ちください',
    notice: 'モデルトレーニングが完了すると、システムが自動的に通知を送信します',
    action: 'このページを閉じても、バックグラウンド計算プロセスには影響しません',
    close: '設定に戻る'
  },
  resultTip: {
    close: '閉じる'
  },

  tip: {
    calculating: '計算中',
    calculatingDesc: '偏極力場に基づく分子動力学シミュレーションには長時間（24〜48時間）を要します。予定時間後に結果を確認でき、システムが計算状況をお知らせします',
    notice2: 'このページを閉じても、バックグラウンド計算プロセスには影響しません'
  },
  history: {
    title: '解析記録',
    newAnalysis: '新規解析',
    loading: {
      message: '読み込み中...',
      error: 'エラー'
    },
    noResults: {
      message: '解析記録が見つかりません'
    },
    salt: '塩',
    solvent: '溶媒',
    unit: {
      molPerKg: 'mol/kg'
    },
    actions: {
      viewDetails: '詳細を見る',
      delete: '削除',
      deleteConfirm: 'この記録を削除しますか？',
      deleteFailed: '記録の削除に失敗しました'
    }
  },
  list: {
    columns: {
      analysisId: '解析ID',
      saltFraction: '塩（分率）',
      saltFractionType: '分率タイプ（塩）',
      solventFraction: '溶媒（分率）',
      solventFractionType: '分率タイプ（溶媒）',
      concentration: '濃度',
      created: '作成日時',
      status: 'ステータス',
      actions: '操作'
    }
  },

  status: {
    completed: '完了',
    success: '完了',
    running: '実行中',
    failed: '失敗',
    pending: '待機中'
  }
  ,
  results: {
    analysisResults: '解析結果',
    systemProperties: '系の物性',
    clusterAnalysis: '溶媒和クラスタータイプと分率解析',
    size: '第一溶媒和クラスター中のアニオン数',
    category: 'カテゴリ',
    fraction: '分率',
    analysisCharts: '解析チャート',
    radialDistribution: '動径分布関数と配位数',
    radialDistributionSubtitle: '動径分布関数と配位数',
    meanSquareDisplacement: '平均二乗変位',
    meanSquareDisplacementSubtitle: '平均二乗変位',
    chartPlaceholder: 'チャートプレースホルダー',
    analysisFile: '解析ファイル',
    downloadDescription: 'JSON 形式で解析結果をダウンロード',
    fileContains: '構成詳細、解析パラメータ、計算結果を含む',
    downloadJSON: 'JSON をダウンロード',
    density: '密度 (g/cm³)',
    viscosity: '粘度 (cP)',
    conductivity: '電気伝導率 (mS/cm)',
    diffusionCoefficient: '拡散係数（単位：10⁻¹⁰ m²/秒）全成分',
    species: '成分',
    coefficient: '拡散係数（×10⁻¹⁰ m²/s）',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG',
    SSIPTitle: 'SSIP：溶媒分離イオンペア カチオンとアニオンは関連しているが、直接接触していない。代わりに、1つ以上の溶媒分子がそれらの間に位置している。中程度の極性溶媒に典型的で、溶媒和殻がイオンを分離させるが、静電相関は残る。例：Li⁺-(溶媒)-PF₆⁻',
    CIPTitle: 'CIP：接触イオンペア 1つのカチオンと1つのアニオンが直接接触し、間に溶媒分子を挟まない。低誘電率溶媒や高塩濃度で一般的。SSIPより強い結合。例：Li⁺·PF₆⁻が直接接触。',
    AGGTitle: 'AGG：イオン凝集体 2つ以上のカチオンとアニオンの組み合わせによる直接接触を含む、より大きな関連構造。二量体、三量体、またはより大きなクラスターであり得る。高濃度、不良溶媒、またはイオン液体でしばしば現れる。例：(Li⁺·PF₆⁻)ₙクラスター、またはLi⁺が複数のアニオンを架橋。'
  },
  guide: {
    help: 'ヘルプ',
    close: '閉じる'
  },
  detail: {
    title: '解析結果',
    viewSubtitle: '詳細な解析結果を表示',
    viewSubtitleWithId: '詳細な解析結果を表示',
    actionTitle: '解析詳細',
    loading: '解析詳細を読み込み中...',
    missingId: '解析IDパラメータが不足',
    fetchError: '解析詳細の取得に失敗',
    saltSolventConfig: '塩と溶媒の構成',
    saltSummary: '塩のサマリー',
    solventSummary: '溶媒サマリー',
    selected: '選択済み',
    weightConcentration: '重量濃度',
    fractions: '分率：',
    fractionType: '分率の種類：',
    totalFraction: '総分率：',
    solvent: '溶媒：',
    weightFraction: '重量分率',
    analysisResults: '解析結果',
    systemProperties: '系の物性',
    clusterAnalysis: '溶媒和クラスタータイプと分率解析',
    size: '第一溶媒和クラスター中のアニオン数',
    category: 'カテゴリ',
    fraction: '分率',
    analysisCharts: '解析チャート',
    radialDistribution: '動径分布関数と配位数',
    radialDistributionSubtitle: '動径分布関数と配位数',
    meanSquareDisplacement: '平均二乗変位',
    meanSquareDisplacementSubtitle: '平均二乗変位',
    chartPlaceholder: 'チャートプレースホルダー',
    analysisFile: '解析ファイル',
    downloadDescription: 'JSON 形式で解析結果をダウンロード',
    fileContains: '構成詳細、解析パラメータ、計算結果を含む',
    downloadJSON: 'JSON をダウンロード',
    density: '密度 (g/cm³)',
    viscosity: '粘度 (cP)',
    conductivity: '電気伝導率 (mS/cm)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG',
    SSIPTitle: 'SSIP：溶媒分離イオンペア カチオンとアニオンは関連しているが、直接接触していない。代わりに、1つ以上の溶媒分子がそれらの間に位置している。中程度の極性溶媒に典型的で、溶媒和殻がイオンを分離させるが、静電相関は残る。例：Li⁺-(溶媒)-PF₆⁻',
    CIPTitle: 'CIP：接触イオンペア 1つのカチオンと1つのアニオンが直接接触し、間に溶媒分子を挟まない。低誘電率溶媒や高塩濃度で一般的。SSIPより強い結合。例：Li⁺·PF₆⁻が直接接触。',
    AGGTitle: 'AGG：イオン凝集体 2つ以上のカチオンとアニオンの組み合わせによる直接接触を含む、より大きな関連構造。二量体、三量体、またはより大きなクラスターであり得る。高濃度、不良溶媒、またはイオン液体でしばしば現れる。例：(Li⁺·PF₆⁻)ₙクラスター、またはLi⁺が複数のアニオンを架橋。'
  }
};


