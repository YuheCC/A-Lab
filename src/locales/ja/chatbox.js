export default {
    systemMessage: {
        welcome: "Molecular Universeへようこそ。何かお手伝いできることはありますか？"
    },
    input: {
        placeholder: "バッテリー、バッテリー化学、または関連トピックに関するものなら何でも聞いてください。",
        sendButton: "送信"
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
        thinking: "考え中",
        searching: "検索中",
        searchingDatabase: "データベースを検索中",
        thinkingForSeconds: "{{seconds}}秒間考え中",
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
        addToFavoritesLoading: "保存中..."
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
        thankYou: "フィードバックありがとうございます！"
    },
    success: {
        addedToFavorites: "分子がお気に入りに正常に追加されました！",
        alreadyInFavorites: "分子はすでにお気に入りにあります",
        feedbackSubmitted: "フィードバックの送信に失敗しました。もう一度お試しください。"
    },
    errors: {
        networkError: "ネットワーク応答が正常ではありませんでした",
        batteryRelevance: "あなたの質問はバッテリーやバッテリー化学に関連していません。バッテリー関連の質問をしてください。",
        moleculeDetailsError: "分子詳細の取得エラー：",
        similarMoleculesError: "類似分子の検索エラー：",
        queryLimitError: "クエリ制限の取得に失敗しました",
        addToFavoritesError: "お気に入りへの追加に失敗しました",
        loginRequired: "お気に入りに追加するにはログインする必要があります",
        feedbackError: "フィードバック送信エラー：",
        copyError: "コピーに失敗しました："
    },
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