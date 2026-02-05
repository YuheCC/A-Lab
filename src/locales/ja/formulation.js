export default {
  title: '塩と溶媒の構成',
  subtitle: '電解質を構成してカスタマイズ',
  comingSoon: 'MU2で導入予定',
  comingSoon2: 'MU2で導入予定',
  tabs: {
    introduction: '紹介',
    records: '記録'
  },
  introductionNew: {
    functionIntroTitle: '機能紹介',
    functionIntroDescription:
      'MU プラットフォームの分子動力学（MD）シミュレーションは、先進的な可極化力場と自動化ワークフローを組み合わせ、高い忠実度でイオンと溶媒の相互作用を捉えます。利用者は未知・既知を問わず任意の分子を含む電解液配合を MU ポータルから送信するだけで、数日以内に主要物性の定量予測を受け取ることができ、従来の試行錯誤や古典的モデリングより高速かつ高精度な知見を得られます。',
    functionIntroImageAlt: 'MD シミュレーションのワークフロー',
    functionIntroCaption: '電解液配合向け MU 独自の分子動力学（MD）サービス',
    benefitsParagraph1:
      'MU 独自の MD サービスは、Li⁺、陰イオン、溶媒分子が様々な塩濃度でどのように配列するかを分子レベルで可視化します。',
    benefitsParagraph2:
      '標準的なシミュレーションは配合の複雑さにもよりますが概ね 3 日程度で完了し、その後すぐに定量的な物性予測を提供します。これにより電解液設計と最適化が迅速かつ確実になり、多大なコストと時間を節約できます。',
    benefitsImageAlt: '濃度を跨いだ MD シミュレーション',
    benefitsImageCaption: '濃度全域の MD シミュレーションで電解液設計を加速',
    propertiesIntroTitle: '物性紹介',
    propertiesIntroNoteDescription:
      '標準物性として掲載されている項目は、MD シミュレーション完了後およそ 3 日で提供可能です。その他の物性については納期を調整するためチームまでお問い合わせください。',
    propertiesIntroNoteButton: 'チームに連絡',
    groupStandardProperties: '標準物性',
    standardRdfTitle: '動径分布関数（RDF）',
    standardRdfDescription:
      '基準粒子から一定距離に粒子が存在する確率を示し、電解液の局所構造を記述します。これは溶解度、相溶性、イオン伝導率、溶媒和構造、界面形成に直結します。',
    standardCnTitle: '配位数（CN）',
    standardCnDescription:
      '中心イオンの周囲に存在する近接原子／分子の平均個数。電導度、溶解度、界面構造に影響します。',
    standardSolvationClusterTitle: '溶媒和クラスター解析',
    standardSolvationClusterDescription: '電解液中で陽イオンと陰イオンがどのように会合するかを解析します。主な 3 タイプは次の通りです。',
    standardSolvationClusterSsipBadge: 'SSIP',
    standardSolvationClusterSsipName: 'Solvent-Separated Ion Pair',
    standardSolvationClusterSsipDescription:
      '陽イオンと陰イオンは関連していますが、その間に 1 つ以上の溶媒分子が介在します。高誘電率溶媒で優勢となり、Li⁺ 移動度と電導度の向上を支えます。',
    standardSolvationClusterCipBadge: 'CIP',
    standardSolvationClusterCipName: 'Contact Ion Pair',
    standardSolvationClusterCipDescription:
      '陽イオンと陰イオンが直接接触し、間に溶媒分子が存在しません。高塩濃度や低誘電率溶媒で多く見られ、イオン輸送を阻害して電導度を低下させる可能性があります。',
    standardSolvationClusterAggBadge: 'AGG',
    standardSolvationClusterAggName: 'Aggregate',
    standardSolvationClusterAggDescription:
      '複数の陽イオン・陰イオンが連結した大きなクラスターで、高濃度電解液で卓越し、一般に電導度を低下させます。',
    standardSolvationClusterImageAlt: '代表的な Li 溶媒和クラスター',
    standardSolvationClusterImageCaption: '代表的な Li 溶媒和クラスター',
    standardSolvationClusterSummary:
      'SSIP/CIP/AGG の比率は、溶媒和環境と粘度、イオン導電性、遷移数などの輸送特性を結びつける構造指標となります。',
    standardDiffusivityTitle: '拡散係数',
    standardDiffusivityDescription:
      '外部電場がない状態で粒子がランダムに移動する速度を示し、移動度などの輸送特性と密接に関係します。',
    standardConductivityTitle: '電気伝導率',
    standardConductivityDescription:
      '電場下でイオンや帯電粒子が電荷を運ぶ能力を表します。下図に予測値と実測値のベンチマークを示します。',
    standardConductivityImageAlt: 'MD シミュレーションの精度',
    standardConductivityImageCaption: 'MD シミュレーションの精度：予測値と測定値の比較',
    standardConductivityImageDescription1:
      '当社の分子動力学シミュレーション（青点）は、0–40 mS·cm⁻¹ をカバーする 100 以上の電解液配合で、実験的な電気伝導率測定と高い整合性を示します。サンプルにはスルホン、スルフィット、エーテル、エステル、カーボネート、ニトリル、シロキサン、ボレート、リン酸エステルなど多様な溶媒が含まれます。',
    standardConductivityImageDescription2:
      '一方、外部の機械学習力場（MLFF、空心丸）は、ごく一部のカーボネート系でしかベンチマークされていません。当社の力場はそれらの系で MLFF に匹敵する、あるいは上回る精度を示し、MLFF が未検証の広い化学空間でも高い予測性能を維持します。',
    standardConductivityImageDescription3:
      '黒い対角線（y = x）付近にプロットが並ぶことは、合成前のシミュレーションベースのスクリーニングが信頼できることを裏付けます。',
    standardViscosityTitle: '粘度',
    standardViscosityDescription: '流体が剪断応力に対して流動・変形を抵抗する性質です。',
    standardDensityTitle: '密度',
    standardDensityDescription: '単位体積あたりの質量で、系のコンパクトさを示します。',
    groupAdvancedAnalysis: '高度解析',
    advancedIonCorrelationTitle: 'イオン間相関',
    advancedIonCorrelationDescription: 'イオン種がランダム分布を超えてどの程度相関しているかを測定します。',
    advancedStructureFactorTitle: '構造因子（S(q)）',
    advancedStructureFactorDescription: '原子配置による散乱強度を定量化し、逆空間での秩序を明らかにします。',
    advancedDynamicStructureFactorTitle: '動的構造因子（S(q,ω)）',
    advancedDynamicStructureFactorDescription: '粒子の時空間相関を記述する関数です。',
    advancedResidenceTimeTitle: '滞在時間',
    advancedResidenceTimeDescription: 'イオン／分子が他の種の近傍にとどまる平均時間を示します。',
    groupCustomStudies: 'カスタム研究',
    customEdlTitle: 'EDL（電気二重層）',
    customEdlDescription:
      '帯電した表面や電極近傍で形成されるイオンの秩序領域を指し、SEI 形成や酸化還元反応の推定に役立ちます。',
    customEdlImageAlt: '電気二重層',
    customEdlImageCaption:
      '精密に制御された電位下で形成される電気二重層構造。MD シミュレーションのスナップショットでは、ユーザー指定配合の電解液が 2 枚の電極間に配置されます。仮想セルの電位を変化させることで、界面構造と化学分布を可視化でき、最終的な界面化学を規定します。',
    customSolubilityTitle: '溶解度',
    customSolubilityDescription:
      '平衡条件下で特定の塩または分子が均一に分散（溶解・混合）できる最大量を表します。',
    customSolubilityImageAlt: '溶解度予測',
    customSolubilityImageCaption:
      '当社の MD シミュレーションは、代表的なリチウム塩 LiFSI が 19 種の多様な化学構造・官能基を持つ溶媒において示す溶解度を高精度で予測します。対角線に近い点ほど予測精度が高く、合成前のシミュレーションスクリーニングに自信を与えます。',
    standardSolvationClusterTableName: '溶媒和クラスタータイプと分率解析',
    table: {
      headers: {
        no: '番号',
        property: '物性',
        type: 'タイプ',
        group: 'グループ',
        estimatedTime: '目安期間'
      },
      types: {
        structural: '構造物性',
        dynamic: '動的物性',
        structuralDynamic: '構造 + 動的',
        thermodynamic: '熱力学物性'
      },
      estimatedTimes: {
        short: '約3日',
        medium: '約1週間',
        long: '約1〜2週間'
      }
    }
  },
  actions: {
    backToList: 'リストに戻る'
  },
  create: {
    newConfiguration: '新規構成'
  },

  simulationParameters: {
    title: '分子シミュレーションパラメータ'
  },

  temperature: {
    label: '温度 (K)',
    validation: {
      empty: '温度を入力してください',
      invalid: '有効な温度値を入力してください',
      tooLow: '温度は238.15 K以上にしてください',
      tooHigh: '温度は378.15 K以下にしてください'
    }
  },

  saltConfiguration: {
    title: '塩の構成'
  },

  cationSelection: {
    label: '陽イオンの選択'
  },

  anionSelection: {
    label: '陰イオンの選択（最大2）'
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
    label: '分率（最小: 0.05）',
    validation: {
      empty: '分率を入力してください',
      invalid: '有効な分率を入力してください',
      tooLow: '分率は 0.05 未満にはできません',
      tooHigh: '分率は 1 を超えることはできません'
    }
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
    calculating: '入力を検証中、計算準備中'
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
    calculatingDesc: '偏極力場に基づく分子動力学シミュレーションには長時間を要します。予定時間後に結果を確認でき、システムが計算状況をお知らせします',
    notice2: 'このページを閉じても、バックグラウンド計算プロセスには影響しません'
  },
  filters: {
    searchPlaceholder: '解析IDを検索...',
    statusPlaceholder: 'ステータスを選択',
    clearFilters: 'フィルタークリア',
    refresh: '更新'
  },
  history: {
    title: '解析記録',
    newAnalysis: '新規解析',
    showingRecords: '{{count}} / {{total}} 件の記録を表示中',
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
      viewDetails: '結果を見る',
      delete: '削除',
      deleteConfirm: 'この記録を削除しますか？',
      deleteFailed: '記録の削除に失敗しました',
      retry: '再試行',
      retryConfirm: 'この記録を再試行しますか？',
      retrySuccess: '再試行に成功しました',
      retryFailed: '再試行に失敗しました'
    }
  },
  list: {
    columns: {
      analysisId: '解析ID',
      saltFraction: '塩（分率）',
      saltFractionType: '分率タイプ（塩）',
      solventFraction: '溶媒（分率）',
      solventFractionType: '分率タイプ（溶媒）',
      concentration: '塩濃度',
      created: '作成日時',
      status: 'ステータス',
      process: '進捗',
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
    SSIPTitle: 'Solvent-Separated Ion Pair',
    CIPTitle: 'Contact Ion Pair',
    AGGTitle: 'Ion Aggregate'
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
    configuration: '構成情報',
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


