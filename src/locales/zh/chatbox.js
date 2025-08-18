export default {
    systemMessage: {
        welcome: "欢迎来到分子宇宙。今天我可以为您做些什么？"
    },
    input: {
        placeholder: "随便问我关于电池、电池化学或相关主题的任何问题。",
        sendButton: "发送"
    },
    chat: {
        newChat: "新探索",
        newExpoler: "新探索",
        newChatSubtitle: "开始一段新的对话，探索分子宇宙的奥秘",
        searchChat: "搜索对话",
        historyTitle: "历史对话",
        askTitle: "ASK",
        refreshQuestions: "换一换",
        sendMessage: "发送消息",
        like: "点赞",
        dislike: "点踩",
        editQuestion: "编辑问题",
        copy: "复制",
        regenerate: "重新生成",
        sendFailed: "发送消息失败，请稍后重试。",
        regenerateFailed: "重新生成失败，请稍后重试。",
        loadChatFailed: "加载聊天记录失败",
        loadHistoryFailed: "加载聊天历史失败",
        modes: {
            regular: "Regular Ask",
            deepSpace: "Deep Space",
            regularDescription: "基础问答模式，适合日常电池相关问题咨询。提供准确、简洁的回答。",
            deepSpaceDescription: "由大型语言模型智能体团队分析您的电池问题，搜索文献和我们的分子数据库，然后协作制作研究级答案。预计响应时间为10-20分钟。",
            regularRemaining: "今日剩余: {{count}}次",
            deepSpaceRemaining: "本月剩余: {{count}}次",
            betaBadge: "Beta"
        },
        recommendedQuestions: [
            "锂离子电池的电解质溶剂选择有哪些关键考虑因素？",
            "固态电解质在下一代电池技术中的优势和应用前景如何？",
            "SEI层的形成机制及其对电池性能的影响是什么？",
            "高镍正极材料的稳定性问题及解决方案有哪些？",
            "锂枝晶的形成原因及抑制方法有哪些？",
            "钠离子电池与锂离子电池的性能对比如何？",
            "全固态电池的技术挑战和发展前景如何？",
            "电池热管理系统的设计原理和关键技术有哪些？",
            "快充技术对电池寿命的影响及优化策略？",
            "电池回收利用的技术路线和经济性分析？",
            "无序岩盐(DRX)在锂离子电池中使用时电压衰减的主要阴极相关原因是什么？",
            "使用无序岩盐(DRX)的锂离子电池电解质配方有哪些常见设计规则？",
            "抑制金属阳极固态电池中枝晶生长的有效策略有哪些？",
            "为低温环境设计石墨阳极时，应如何选择石墨材料？人造石墨(AG)还是天然石墨(NG)更合适？",
            "硅阳极的最佳硅含量是多少，以平衡能量密度和循环性能？",
            "为什么锂合金如Li-Al、Li-Mg和Li-Si通常用于高温热电池？",
            "锂金属阳极理想SEI或保护层的设计原理或内在要求是什么？",
            "石墨、硅和锂金属阳极的SEI有什么区别？",
            "基于石墨、硅和锂金属的电池之间的平均电压差是多少？",
            "为什么硅阳极的初始库仑效率(ICE)通常低于石墨？",
            "如何基于电化学数据和材料表征来分离不同降解机制对锂离子电池容量衰减的贡献？",
            "如何通过机械设计在不改变电极材料和电解质的情况下提高电池功率密度？",
            "电池容量衰减的根本原因是什么？我们能否制造出可以持续数十年而不降解的电池？",
            "电子和离子如何在阴极、阳极和电解质中转移？",
            "电解质体相性质，特别是电导率、粘度、扩散系数和迁移数，如何影响电池性能？",
            "堆叠压力如何改变固体电解质的断裂力学，因为枝晶通过固体电解质生长？"
        ],
        searchModal: {
            placeholder: "搜索对话...",
            recentChats: "最近对话"
        },
        historyItem: {
            rename: "修改名称",
            pin: "置顶",
            unpin: "取消置顶",
            delete: "删除对话"
        }
    },
    checkboxes: {
        ignoreChatHistory: "忽略聊天历史",
        disableLiteratureSearch: "禁用文献搜索",
        enterDeepSpace: "进入深度搜索 (BETA)",
        deepSpaceTooltip: "由大型语言模型智能体团队分析您的电池问题，搜索文献和我们的分子数据库，然后协作制作研究级答案。预计响应时间为10-20分钟。",
        admin: "管理员",
        fullDeepSpace: "全深度搜索"
    },
    queryLimit: {
        queriesRemaining: "今日剩余查询次数：",
        deepSpaceQueriesRemaining: "本月剩余深度搜索查询次数：",
        reachedLimit: "您已达到本月查询限制。请联系管理员寻求帮助。"
    },
    status: {
        thinking: "思考中",
        searching: "搜索中",
        searchingDatabase: "搜索我们的数据库",
        thinkingForSeconds: "思考了{{seconds}}秒",
        thinkingForMinutesAndSeconds: "思考了{{minutes}}分{{seconds}}秒",
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
        viewInMolPort: "在MolPort中查看",
        findSimilarMoleculesLoading: "搜索相似分子...",
        addToFavoritesLoading: "保存中..."
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
        thankYou: "感谢您的反馈！",
        selectFirst: "请先选择点赞或点踩",
        submitting: "提交中..."
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
        copyError: "复制失败：",
        generalError: "错误"
    },
    history: {
        title: "您的聊天",
        createNewChat: "创建新聊天",
        newChat: "新聊天",
        confirmDelete: "您确定要删除这个聊天吗？",
        cancel: "取消",
        delete: "删除",
        footer: "聊天历史显示您最近的20次聊天记录。"
    }
}; 