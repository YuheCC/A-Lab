export default {
    systemMessage: {
        welcome: "Molecular Universeへようこそ。何かお手伝いできることはありますか？"
    },
    input: {
        placeholder: "バッテリー、バッテリー化学、または関連トピックに関するものなら何でも聞いてください。",
        sendButton: "送信"
    },
    chat: {
        newChat: "新しいチャット",
        newExpoler: "新しい探索",
        newChatSubtitle: "新しい会話を始めて、分子宇宙の神秘を探求しましょう",
        searchChat: "チャット検索",
        historyTitle: "チャット履歴",
        askTitle: "ASK",
        refreshQuestions: "更新",
        sendMessage: "メッセージを送信",
        editQuestion: "質問を編集",
        copy: "コピー",
        regenerate: "再生成",
        sendFailed: "メッセージの送信に失敗しました。後でもう一度お試しください。",
        regenerateFailed: "再生成に失敗しました。後でもう一度お試しください。",
        loadChatFailed: "チャットデータの読み込みに失敗しました",
        loadHistoryFailed: "チャット履歴の読み込みに失敗しました",
        modes: {
            regular: "通常の質問",
            deepSpace: "ディープスペース",
            lightning: "ライトニング",
            fast: "高速",
            ask: "Ask",
            fastDeepSpace: "高速ディープスペース",
            regularDescription: "基本的なQ&Aモード。日常的なバッテリー関連の質問に適しています。正確で簡潔な回答を提供します。",
            deepSpaceDescription: "LLMエージェントのチームがあなたのバッテリーに関する質問を分析し、文献と分子データベースを精査し、協力して研究レベルの回答を作成します。応答時間は10〜20分かかります。",
            lightningDescription: "最低計算量で素早い回答。",
            fastDescription: "中程度の計算量で速度と精度のバランス。",
            askDescription: "最大計算量で最高品質の回答。",
            fastDeepSpaceDescription: "低計算量のマルチエージェント研究モード。",
            regularRemaining: "今日の残り: {{count}}回",
            deepSpaceRemaining: "今月の残り: {{count}}回",
            betaBadge: "ベータ"
        },
        recommendedQuestions: [
            "リチウムイオン電池の電解質溶媒選択における主要な考慮事項は何ですか？",
            "次世代電池技術における固体電解質の利点と応用の見通しはどうですか？",
            "SEI層の形成メカニズムと電池性能への影響は何ですか？",
            "高ニッケル正極材料の安定性問題と解決策は何ですか？",
            "リチウムデンドライトの形成原因と抑制方法は何ですか？",
            "ナトリウムイオン電池とリチウムイオン電池の性能比較はどうですか？",
            "全固体電池の技術的課題と開発の見通しはどうですか？",
            "電池熱管理システムの設計原理と主要技術は何ですか？",
            "急速充電技術が電池寿命に与える影響と最適化戦略は？",
            "電池リサイクル利用の技術ルートと経済性分析は？",
            "リチウムイオン電池で無秩序岩塩（DRX）を使用する際の電圧低下の主要な陰極関連原因は何ですか？",
            "リチウムイオン電池で無秩序岩塩（DRX）を使用するための電解質配合の一般的な設計ルールは何ですか？",
            "金属陽極固体電池におけるデンドライト成長を抑制する効果的な戦略は何ですか？",
            "低温環境用のグラファイト陽極を設計する際、グラファイト材料はどのように選択すべきですか？人造グラファイト（AG）と天然グラファイト（NG）のどちらが適していますか？",
            "エネルギー密度とサイクル性能のバランスを取るためのSi陽極の最適なシリコン含有量は何ですか？",
            "Li-Al、Li-Mg、Li-Siなどのリチウム合金が高温熱電池で一般的に使用されるのはなぜですか？",
            "リチウム金属陽極の理想的なSEIまたは保護層の設計原理または内在要件は何ですか？",
            "グラファイト、シリコン、リチウム金属陽極のSEIの違いは何ですか？",
            "グラファイト、シリコン、リチウム金属ベースの電池間の平均電圧差は何ですか？",
            "シリコン陽極の初期クーロン効率（ICE）が通常グラファイトよりも低いのはなぜですか？",
            "電化学データと材料特性評価に基づいて、リチウムイオン電池の容量低下に対する異なる劣化メカニズムの寄与をどのように分離できますか？",
            "電極材料と電解質を変更せずに機械設計によって電池の電力密度をどのように改善できますか？",
            "電池容量低下の根本的な原因は何ですか？劣化なしで数十年持続する電池を作ることができますか？",
            "電子とイオンは陰極、陽極、電解質でどのように移動しますか？",
            "電解質の体積特性、特に導電率、粘度、拡散係数、移動数は、電池性能にどのように影響しますか？",
            "デンドライトが固体電解質を通過して成長する際、スタック圧力は固体電解質の破壊力学をどのように変化させますか？"
        ],
        searchModal: {
            placeholder: "チャットを検索...",
            recentChats: "最近のチャット"
        },
        historyItem: {
            rename: "名前を変更",
            pin: "ピン留め",
            unpin: "ピン留め解除",
            delete: "チャットを削除"
        }
    },
    checkboxes: {
        ignoreChatHistory: "チャット履歴を無視する",
        disableLiteratureSearch: "文献検索を無効にする",
        enterDeepSpace: "ディープスペースに入る (ベータ版)",
        deepSpaceTooltip: "LLMエージェントのチームがあなたのバッテリーに関する質問を分析し、文献と分子データベースを精査し、協力して研究レベルの回答を作成します。応答時間は10〜20分かかります。",
        admin: "管理者",
        fullDeepSpace: "フルディープスペース"
    },
    queryLimit: {
        queriesRemaining: "今日の残りクエリ数：",
        deepSpaceQueriesRemaining: "今月の残りディープスペースクエリ数：",
        reachedLimit: "月間クエリ上限に達しました。サポートが必要な場合は管理者に連絡してください。"
    },
    status: {
        connectingToServer: "サーバーに接続しています...",
        thinking: "考え中",
        searching: "検索中",
        searchingDatabase: "データベースを検索中",
        thinkingForSeconds: "{{seconds}}秒間考え中",
        thinkingForMinutesAndSeconds: "{{minutes}}分{{seconds}}秒間考え中",
        noMoleculesFound: "分子が見つかりませんでした。",
        findMoleculesFailed: "分子の検索に失敗しました。後でもう一度お試しください。",
        clarifyingQuestions: "まもなく、いくつかの明確化のための質問に返信していただく場合があります。",
        deepSpaceWorking: "ディープスペース・マルチエージェントLLMが現在稼働中です。質問の複雑さに応じて、応答に10〜20分かかる場合があります。"
    },
    buttons: {
        findMolecules: "分子を探す",
        findSimilarMolecules: "類似の分子を探す",
        addToFavorites: "お気に入りに追加",
        copy: "コピー",
        cancel: "キャンセル",
        submit: "送信",
        viewInMolPort: "MolPortで表示",
        findSimilarMoleculesLoading: "友達を検索中",
        addToFavoritesLoading: "保存中...",
        favorites: "お気に入り"
    },
    molecules: {
        llmFoundMolecules: "LLMが見つけた分子",
        friendsRankedBy: "置換可能性の高さでランク付けされた友達：",
        name: "名前",
        smiles: "SMILES",
        molecularWeight: "分子量",
        homo: "HOMO",
        lumo: "LUMO",
        espMax: "ESP最大値",
        espMin: "ESP最小値",
        functionalGroups: "官能基",
        predictedMP: "予測融点",
        predictedBP: "予測沸点",
        llmGrade: "LLM評価",
        saving: "保存中...",
        rateMatch: "この一致を評価：",
        detectedChemicalKeywords: "LLMの応答で検出された化学キーワード：",
        searchingForFriends: "友達を検索中"
    },
    feedback: {
        goodMatch: "なぜこれが良い一致なのですか？",
        badMatch: "なぜこれが良い一致ではないのですか？",
        placeholder: "あなたのフィードバックは分子マッチングの改善に役立ちます",
        thankYou: "フィードバックありがとうございます！",
        selectFirst: "最初にいいねまたはよくないねを選択してください",
        submitting: "送信中..."
    },
    success: {
        addedToFavorites: "分子がお気に入りに正常に追加されました！",
        alreadyInFavorites: "分子はすでにお気に入りにあります",
        feedbackSubmitted: "フィードバックの送信に失敗しました。もう一度お試しください。"
    },
    errors: {
        networkError: "ネットワーク応答が正常ではありませんでした",
        connectionTimeout: "接続がタイムアウトしました。ネットワーク状態を確認するか、後でもう一度お試しください。",
        serverConnectionFailed: "サーバーへの接続に失敗しました。ネットワーク接続を確認してください。",
        networkIssueCheck: "申し訳ありませんが、ネットワーク接続の問題が発生しました。ネットワークを確認してからもう一度お試しください。",
        networkIssueRetry: "申し訳ありませんが、ネットワーク接続の問題が発生しました。後でもう一度お試しください。",
        batteryRelevance: "あなたの質問はバッテリーやバッテリー化学に関連していません。バッテリー関連の質問をしてください。",
        moleculeDetailsError: "分子詳細の取得エラー：",
        similarMoleculesError: "類似分子の検索エラー：",
        queryLimitError: "クエリ制限の取得に失敗しました",
        addToFavoritesError: "お気に入りへの追加に失敗しました",
        loginRequired: "お気に入りに追加するにはログインする必要があります",
        feedbackError: "フィードバック送信エラー：",
        copyError: "コピーに失敗しました：",
        generalError: "エラー"
    },
    supplementalData: "補足データ",
    history: {
        title: "あなたのチャット",
        createNewChat: "新しいチャットを作成",
        newChat: "新しいチャット",
        confirmDelete: "このチャットを本当に削除しますか？",
        cancel: "キャンセル",
        delete: "削除",
        footer: "チャット履歴には、過去20件のチャットが表示されます。"
    }
}; 