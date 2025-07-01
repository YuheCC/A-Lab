export default {
    systemMessage: {
        welcome: "欢迎来到分子宇宙。今天我可以为您做些什么？"
    },
    input: {
        placeholder: "随便问我关于电池、电池化学或相关主题的任何问题。",
        sendButton: "发送"
    },
    checkboxes: {
        ignoreChatHistory: "忽略聊天历史",
        disableLiteratureSearch: "禁用文献搜索",
        enterDeepSpace: "进入深度搜索 (BETA)",
        deepSpaceTooltip: "由大型语言模型智能体团队分析您的电池问题，搜索文献和我们的分子数据库，然后协作制作研究级答案。预计响应时间为10-20分钟。",
        admin: "管理员"
    },
    queryLimit: {
        queriesRemaining: "本月剩余查询次数：",
        reachedLimit: "您已达到本月查询限制。请联系管理员寻求帮助。"
    },
    status: {
        thinking: "思考中",
        searching: "搜索中",
        searchingDatabase: "搜索我们的数据库",
        thinkingForSeconds: "思考了{{seconds}}秒",
        noMoleculesFound: "未找到分子。",
        findMoleculesFailed: "查找分子失败。请稍后再试。",
        clarifyingQuestions: "我们可能会要求您稍后回答一些澄清问题。",
        deepSpaceWorking: "深空多智能体LLM现在正在工作，根据您问题的复杂程度，可能需要10-20分钟才能响应。"
    },
    buttons: {
        findMolecules: "查找分子",
        findSimilarMolecules: "查找相似分子",
        addToFavorites: "添加到收藏夹",
        copy: "复制",
        cancel: "取消",
        submit: "提交",
        viewInMolPort: "在MolPort中查看"
    },
    molecules: {
        llmFoundMolecules: "LLM 分析出的分子",
        friendsRankedBy: "按替代可能性排序的朋友：",
        name: "名称",
        smiles: "SMILES",
        molecularWeight: "分子量",
        homo: "HOMO",
        lumo: "LUMO",
        espMax: "ESP Max",
        espMin: "ESP Min",
        functionalGroups: "官能团",
        predictedMP: "预测熔点",
        predictedBP: "预测沸点",
        llmGrade: "LLM 评分",
        saving: "保存中...",
        rateMatch: "评价此匹配：",
        detectedChemicalKeywords: "LLM 分析出的化学关键词：",
        searchingForFriends: "搜索相关分子"
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