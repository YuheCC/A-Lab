export default {
    // Search Input
    searchPlaceholder: "SMILES文字列、分子名、またはクエリを入力",
    searchButton: "検索",
    searchTooltip: '<p>有効なクエリは、分子の任意の数値プロパティで検索できます。例：</p><p>- "HOMOが-8以下のすべての分子を検索"<br/>- "LUMOが-2以上で分子量が200以下のすべての分子を検索"</p><p>より自由な形式のクエリについては、「尋ねる」を使用してください。</p><p>SMILES文字列を描画して検索するには、このアイコンをクリックするか、<a>{{pubChemUrl}}</a>にアクセスしてください。</p>',
    drawMolecule: "分子を描画",

    // Search Options
    findFriendsLabel: '"友達"を探す',
    findFriendsDescription: '類似の物理化学的特性を持つ分子。"友達"には、意図的に類似した構造を持つ分子と多様な構造を持つ分子の両方が含まれています。リストは、クエリ分子との物理化学的特性の類似度順にソートされています。',

    searchRange: '検索範囲',
    nearbyFriends: '近くの友達',
    distantFriends: '遠くの友達',
    advancedOptions: '詳細オプション',
    intelligentCompute: 'インテリジェント友達検索計算',
    computeDisabled: '無効',
    computeLow: '低',
    computeMedium: '中',
    computeHigh: '高',
    computeExtreme: '極限',
    cathode: 'カソード',
    anode: 'アノード',
    salt: '塩',
    solvent: '主要溶媒',
    performanceMetric: '望ましい性能指標',
    extraRequests: '追加のリクエスト',
    extraRequestsPlaceholder: 'LLMへのその他のリクエスト',
    custom: 'カスタム',
    upgradeEnterprise: 'エンタープライズアカウントにアップグレード',
    upgradeAccount: 'アカウントをアップグレード',
    computeWarning: 'インテリジェント友達検索の高性能には追加のコンテキストが必要です。計算能力は低に設定されました。',

    // Loading and Status Messages
    searching: "検索中...",
    loadingMap: "Molecular Universeのマップを読み込み中",
    errorLoadingData: "データの読み込みエラー",
    noDataAvailable: "利用可能なデータがありません",
    tooManyRequests: "リクエストが多すぎます。しばらく待ってからもう一度お試しください。",

    // Search Results
    searchedMolecules: "検索された分子",
    moleculeNumber: "分子 {{number}}",
    similarMolecules: "類似の分子",
    similarMoleculeNumber: "類似分子 #{{number}}",
    selectMolType: "最適な結果を得るために、分子のタイプを選択してください",

    // Property Names (Professional terms - not translated according to rules)
    properties: {
        smiles: "SMILES",
        chemicalFormula: "化学式",
        molecularWeight: "分子量",
        homo: "HOMO",
        lumo: "LUMO",
        espMin: "ESP 最小",
        espMax: "ESP 最大",
        predictedMp: "予測融点",
        predictedBp: "予測沸点",
        predictedFp: "予測着火点",
        combustionEnthalpy: "燃焼エンタルピー",
        commercialScore: "商業価値",
        functionalGroups: "官能基",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },

    moleculeTypes: {
        selectMolType: "分子タイプ",
        solvent: "溶媒",
        cosolvent: "共溶媒",
        diluent: "希釈剤",
        additive: "添加剤",
        additiveSubtype: "添加剤サブカテゴリ",
        additiveOptions: {
            seiPromoter: "SEI促進剤",
            sideReactionSuppressor: "副反応抑制剤",
            dendriteSuppressor: "デンドライト抑制剤",
            interfacialStabilityImprover: "界面安定性向上剤"
        }
    },

    // Buttons and Actions
    addToFavorites: "お気に入りに追加 ★",
    saving: "保存中...",

    // Warning and Error Messages
    multipleMoleculesWarning: "検索条件に一致する分子が複数見つかりました。「友達を探す」は無効になっています。",
    findFriendError: "類似の分子の検索に失敗しました。もう一度お試しください。",
    searchError: "分子の検索中にエラーが発生しました。もう一度お試しください。",

    // Not Found Message
    moleculeNotFound: {
        title: "クエリに一致する分子は見つかりませんでした。いくつかの可能性が考えられます：",
        reasons: [
            "クエリがバッテリーに関連していないか、エラーがある可能性があります。確認してください。",
            "検索結果の分子は、プレミアムレベルのエンタープライズおよび共同開発に含まれています。アップグレードしてください。",
            "クエリが、宝の分子が隠された銀河の1つにヒットしました。お問い合わせください。",
            "クエリに塩またはアニオン分子が含まれている可能性がありますが、現在のデータベースではまだサポートされていません。今後のアップデートでアニオンを追加する予定です。"
        ],
        contactSales: "営業担当者へのお問い合わせ"
    },

    // Ambiguous Query Message
    ambiguousQuery: {
        message: "クエリが曖昧です。略語 {{query}} は次のいずれかの分子に対応する可能性があります：{{options}}。クエリを絞り込んでください。"
    }
}; 