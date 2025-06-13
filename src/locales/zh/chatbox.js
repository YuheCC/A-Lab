export default {
    systemMessage: {
        welcome: "欢迎来到分子宇宙。今天我可以为您做些什么？"
    },
    input: {
        placeholder: "请随便问我关于电池的任何问题，我们会返回回答您问题的分子，并为您推荐进一步探索的相关分子。",
        sendButton: "发送"
    },
    checkboxes: {
        ignoreChatHistory: "忽略聊天历史",
        disableLiteratureSearch: "禁用文献搜索"
    },
    queryLimit: {
        queriesRemaining: "本月剩余查询次数：",
        reachedLimit: "您已达到本月查询限制。请联系管理员寻求帮助。"
    },
    status: {
        thinking: "思考中",
        searching: "搜索中",
        searchingDatabase: "搜索我们的数据库"
    },
    buttons: {
        findMolecules: "查找分子",
        findSimilarMolecules: "查找相似分子",
        addToFavorites: "添加到收藏夹 ★",
        copy: "📋",
        cancel: "取消",
        submit: "提交"
    },
    molecules: {
        llmFoundMolecules: "LLM 分析出的分子",
        friendsRankedBy: "按替代可能性排序的朋友",
        name: "名称",
        smiles: "SMILES",
        molecularWeight: "Molecular weight",
        homo: "HOMO",
        lumo: "LUMO",
        espMax: "ESP Max",
        espMin: "ESP Min",
        functionalGroups: "Functional groups",
        predictedMP: "Predicted MP",
        predictedBP: "Predicted BP",
        llmGrade: "LLM Grade",
        saving: "保存中...",
        rateMatch: "评价此匹配："
    },
    feedback: {
        goodMatch: "什么使这成为一个好的匹配？",
        badMatch: "为什么这不是一个好的匹配？",
        placeholder: "您的反馈有助于我们改进分子匹配",
        thankYou: "感谢您的反馈！"
    },
    success: {
        addedToFavorites: "分子已成功添加到收藏夹！",
        alreadyInFavorites: "分子已在收藏夹中",
        feedbackSubmitted: "反馈提交失败。请重试。"
    },
    errors: {
        networkError: "网络响应异常",
        batteryRelevance: "您的问题与电池或电池化学不相关。请询问与电池相关的问题。",
        moleculeDetailsError: "获取分子详情时出错：",
        similarMoleculesError: "查找相似分子时出错：",
        queryLimitError: "获取查询限制时失败",
        addToFavoritesError: "添加到收藏夹失败",
        loginRequired: "您必须登录才能添加收藏夹",
        feedbackError: "提交反馈时出错：",
        copyError: "复制失败："
    }
}; 