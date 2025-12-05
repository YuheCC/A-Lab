export default {
    // Search Tabs
    tabs: {
        organic: '溶媒、添加剤・希釈剤',
        inorganic: '無機溶媒、添加剤・希釈剤',
        anions: '塩アニオン',
        third: '固体電解質'
    },
    
    // Search Input
    searchPlaceholder: "SMILES文字列、分子名、または特性クエリを入力してください",
    searchButton: "検索",
    searchTooltip: '<p>有効なクエリは分子の任意の数値特性を検索できます。例：</p><p>- "HOMOが最大-8のすべての分子を検索"<br/>- "LUMOが最小-2で分子量が最大200のすべての分子を検索"</p><p>よりオープンなクエリについては、Askを使用してください。</p><p>SMILES文字列を描画して検索するには、このアイコンをクリックするか、<a>{{pubChemUrl}}</a>にアクセスしてください</p>',
    drawMolecule: "分子を描画",
    importSmilesTooltip: 'SMILES を描画ツールにインポート。',
    importSmilesErrorBanner: 'その分子を描画できませんでした。別の SMILES か分子名をお試しください。',
    similarityPrompt: '以下に構造が類似する分子を検索します:',
    similarityTooltip: {
        title: '検索',
        lines: [
            'Search アルゴリズムは入力した分子をデータベースで照合し、構造が類似する分子を探します。',
            'SMILES 文字列、分子名、一般的な略称による分子をいくつでも入力できます。',
            'バイアスのない検索結果が欲しい場合は、この入力欄を空のままにしてください。',
            '左側の描画アイコンをクリックすると、カスタム分子を描画して、その SMILES 文字列を自動入力できます。',
        ],
    },
    propertyConstraints: {
        intro: '次の物性制約を満たすこと:',
        tooltipTitle: 'カスタム物性制約',
        tooltipIntro: 'Search では、希望する分子構造や物性に合わせて検索結果を調整できる自然言語インターフェースを提供します。以下の内容を指定できます。',
        atomCounts: '各元素の希望する原子数',
        functionalGroups: '特定の官能基の有無',
        commercialAvailability: '商業的な入手可能性',
        valueRangeBullet: '{{properties}} の値の範囲または上下限',
    },
    
    // Search Options
    findFriendsLabel: '用途:',
    findFriendsDescription: '入力した分子と類似した構造を持ち、以下のバッテリー用途に理論的に適合する物理化学特性を備えた分子：',
    useCaseTooltipTitle: 'SES molecule property optimizer',
    useCaseTooltipDescription: "Enter what type of battery molecule you're looking for, and SES's molecule property optimizer will display results that are more likely to be compatible with your chosen use case.",

    searchRange: '検索範囲',
    nearbyFriends: '近くの友達',
    distantFriends: '遠くの友達',
    searchRangeTooltip: 'スライダーを左に動かすと、構造に関係なく用途に最も適した特性を持つ分子を優先します。右に動かすと、入力した分子と構造が最も似ている分子を優先します。',
    advancedOptions: '詳細オプション',
    intelligentCompute: 'インテリジェント友達検索計算',
    intelligentFindFriendsLabel: 'インテリジェント検索',
    intelligentFindFriendsTooltip: 'LLM を使って数百種類の分子を調べ、用途にさらに適した分子を見つけます。最良の結果を得るには、計算レベルを上げて（高度なオプション内の）電池システム情報を入力してください。',
    intelligentFindFriendsLimitLabel: '今月の残り: {{remaining}} / {{limit}}',
    showHypothetical: '仮想分子を表示',
    showHypotheticalTooltip: '公開カタログにないアルゴリズム生成候補を含めます。入手可能性と合成可能性は不確かです。',
    prioritizePublished: '公開済み分子を優先',
    publicationStatus: {
      label: 'ステータス',
      published: 'Published',
      novel: 'Novel Molecule',
    },
    computeDisabled: '無効',
    computeLow: '低',
    computeMedium: '中',
    computeHigh: '高',
    computeExtreme: '極限',
    cathode: 'カソード',
    anode: 'アノード',
    solvent: '電解液配合',
    cellDesign: 'セル設計',
    performanceMetric: '望ましい性能指標',
    extraRequests: 'カスタム分子制約（最良の結果のため、インテリジェント友達探しを有効化してください）：',
    extraRequestsPlaceholder: 'エーテル官能基を持つ分子のみを表示する。',
    custom: 'カスタム',
    upgradeEnterprise: 'エンタープライズアカウントにアップグレード',
    upgradeAccount: 'アカウントをアップグレード',
    computeWarning: 'インテリジェント友達検索の高性能には追加のコンテキストが必要です。計算能力は低に設定されました。',
    batteryInfoRecommendation: 'インテリジェント友達検索が最も関連性の高い分子を見つけるのに役立つ推奨バッテリー情報: カソード、アノード、電解液配合、セル設計、望ましい性能指標。',

    // Loading and Status Messages
    searching: "検索中...",
    loadingMap: "分子宇宙の地図を読み込み中",
    errorLoadingData: "データ読み込みエラー",
    noDataAvailable: "利用可能なデータがありません",
    tooManyRequests: "リクエストが多すぎます。しばらく待ってから再試行してください。",
    
    // Search Results
    searchedMolecules: "検索された分子",
    moleculeNumber: "分子 {{number}}",
    similarMolecules: "推奨分子",
    similarMoleculeNumber: "類似分子 #{{number}}",
    selectMolType: "最良の結果を得るために分子のタイプを選択してください",
    
    // Property Names (Professional terms - not translated according to rules)
    properties: {
        smiles: "SMILES",
        casrn: "CAS #",
        chemicalFormula: "Chemical Formula",
        molecularWeight: "Molecular Weight",
        overallScore: "Overall Score",
        homo: "HOMO",
        lumo: "LUMO",
        espMin: "ESP Min",
        espMax: "ESP Max",
        molecularVolume: "Molecular Volume",
        fluorideBondDissociationEnergy: "F Bond Dissociation Energy",
        predictedMp: "Predicted Melting Point",
        predictedBp: "Predicted Boiling Point",
        predictedFp: "Predicted Flash Point",
        combustionEnthalpy: "Combustion Enthalpy",
        commercialScore: "Commercial Score",
        functionalGroups: "Functional Groups",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },

    moleculeTypes: {
        selectMolType: "分子タイプ",
        solvent: "溶媒",
        cosolvent: "共溶媒",
        diluent: "希釈剤",
        primarySalt: "主要塩",
        additive: "添加剤",
        additiveSubtype: "添加剤サブカテゴリ",
        additiveCategory: "カテゴリ",
        additiveCategories: {
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
        }
    },
    
    // Buttons and Actions
    addToFavorites: "お気に入りに追加 ★",
    saving: "保存中...",

    // Favorites
    favorites: {
        favorites: "お気に入り",
        goToFavorites: "お気に入りページに移動"
    },
    
    // Warning and Error Messages
    multipleMoleculesWarning: "検索条件に一致する複数の分子が見つかりました。友達検索は無効です。",
    findFriendError: "類似分子の検索に失敗しました。再試行してください。",
    searchError: "分子の検索中にエラーが発生しました。再試行してください。",
    
    // Not Found Message
    moleculeNotFound: {
        title: "クエリから分子が返されませんでした。以下が考えられる原因です：",
        reasons: [
            "クエリがバッテリーに関連していないか、エラーがある可能性があります。確認してください。",
            "結果の分子はEnterpriseとJoint Developmentのプレミアムレベルに含まれています。アップグレードしてください。",
            "クエリが隠された宝の分子銀河の1つに当たりました。お問い合わせください。",
            "クエリが塩や陰イオン分子に関連している可能性がありますが、現在のデータベースではまだサポートされていません。今後のアップデートで陰イオンを追加予定です。"
        ],
        contactSales: "営業にお問い合わせ"
    },

    // Ambiguous Query Message
    ambiguousQuery: {
        message: "クエリが曖昧です。略語 {{query}} は以下の分子のいずれかに対応する可能性があります：{{options}}。クエリを絞り込んでください。"
    }
};
