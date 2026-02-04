export default {
    // Header
    title: "上传早期循环数据进行寿命预测",
    subtitle: "Predict 是 SES 开发的 AI 模型，利用早期循环性能数据估算电池循环寿命——即放电容量降至 80% 时的循环次数。该模型使用大约前 100 个有效循环作为输入，有效循环定义为无突然容量变化或异常行为的循环。Predict 对于寿命由活性离子损耗主导的系统表现最佳，包括锂离子电池、钠离子电池和无阳极电池。非电化学退化机制的存在——如机械损伤、设计相关问题、内部短路、产气、析锂或电解液耗尽——可能影响预测精度。",
    betaTag: "BETA",
    disclaimerTitle: "免责声明",
    disclaimer: "<strong>注意：</strong>此功能仅使用用户提供的早期阶段循环数据来预测电池循环寿命。不需要电池化学或设计等额外信息。该模型目前适用于在标准循环条件下（非实际使用场景）具有有限活性离子的电池系统。鼓励用户通过自己的测试来验证预测结果。",

    // Features
    features: {
        newPrediction: {
            title: "新增预测",
            description: "运行新预测"
        },
        train: {
            title: "训练",
            description: "训练您的自定义模型"
        }
    },

    // Create page
    create: {
        title: "新增预测"
    },

    // Steps
    steps: {
        upload: "数据上传",
        aiPredict: "AI预测",
        results: "结果展示"
    },

    // Model Selection
    modelSelection: {
        label: "选择模型",
        placeholder: "请选择模型",
        baseModel: "基础模型",
        finetunedModels: "微调模型",
        muModels: "MU模型",
        columns: {
            modelName: "模型名称",
            modelId: "模型ID",
            baseModel: "基础模型"
        }
    },

    // Upload Step
    upload: {
        title: "上传数据",
        selectFile: "选择文件",
        clickToUpload: "点击上传电池数据文件",
        subtitle: "目前仅支持CSV和Neware默认文件格式（NDA/NDAX），后续将支持更多文件类型",
        uploading: "正在上传文件...",
        waitText: "请稍候",
        removeFile: "移除文件",
        dataFormatTip: "📋 CSV数据格式要求",
        sampleData: "样例数据",
        requiredFields: "必需字段：",
        requiredFieldsValue: "barcode, cycle_id, current (A), voltage (V), time (s)",
        currentDirection: "电流方向：",
        currentDirectionValue: "+为充电，-为放电",
        unitRequirement: "单位要求：",
        unitRequirementValue: "电流单位A，电压单位V，时间单位s",
        dataRequirement: "数据要求：",
        dataRequirementValue: "上传数据≥100圈，数据需按时间顺序排列"
    },

    // AI Prediction Step
    prediction: {
        uploadedData: "已上传数据",
        changeFile: "更换文件",
        fileSize: "文件大小",
        fileType: "类型",
        startPrediction: "开始预测",
        progressLabel: "分析进度",
        uploadingFile: "正在上传文件并创建预测任务...",
        processing: "预测任务正在后台处理，请耐心等待...",
        pleaseUploadFirst: "请先上传文件"
    },

    // Results Step
    results: {
        noResults: "暂无预测结果，请先完成预测",
        batteryCount: "电芯数量",
        batteryCountUnit: "个",
        avgCycleLife: "平均循环寿命",
        avgCycleLife1: "平均循环寿命",
        avgCycleLife2: "平均循环寿命2",
        cycleUnit: "次",
        predictionTime: "预测时间",
        unknown: "未知",
        barcode: "Barcode",
        cycleLife1: "循环寿命",
        cycleLife2: "循环寿命2",
        noDetailedData: "暂无详细条形码数据",
        dataRequirementNotMet: "上传数据不符合要求。如需数据处理支持，请",
        contactSupport: "联系我们"
    },

    // Tabs
    tabs: {
        tool: "预测工具",
        introduction: "简介",
        records: "记录",
        models: "模型"
    },

    // List
    list: {
        columns: {
            recordId: "记录ID",
            fileName: "文件名",
            batteryCount: "电芯数量",
            avgCycleLife: "循环寿命",
            model: "模型",
            created: "创建时间",
            actions: "操作"
        }
    },

    // Records
    records: {
        searchPlaceholder: "搜索record ID",
        modelFilter: "模型筛选",
        allModels: "所有模型",
        clearFilters: "Clear Filters",
        showingRecords: "显示 {{count}} / {{total}} 条记录"
    },

    // History
    history: {
        title: "预测记录",
        newPrediction: "新增预测",
        train: "训练",
        searchPlaceholder: "按文件名搜索...",
        loadingText: "加载中...",
        error: "错误",
        noResults: "暂无预测记录",
        cannotDeleteDemo: "无法删除演示记录",
        deleteConfirm: "确定要删除这条记录吗？",
        deleteSuccess: "删除成功",
        deleteFailed: "删除失败",
        view: "查看",
        delete: "删除",
        loading: {
            error: "获取历史记录失败"
        },
        actions: {
            viewResults: "查看结果",
            delete: "删除"
        }
    },

    // Modal
    modal: {
        title: "预测记录详情 - 历史数据",
        uploadedData: "上传数据",
        predictionResults: "预测结果",
        loadingDetail: "加载中...",
        loadDetailFailed: "获取详细数据失败",
        download: "下载",
        downloading: "下载中...",
        downloadFile: "下载文件",
        downloadFailed: "下载文件失败",
        chartTitle: "电池容量变化图表"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "加载历史记录失败",
        predictionFailed: "预测失败，请重试",
        uploadFailed: "文件上传失败",
        fileFormatError: "文件格式不支持，请上传CSV或Excel文件"
    },

    // Chart
    chart: {
        title: "电池容量随循环次数变化",
        cycleCount: "循环数",
        capacity: "容量",
        capacityProcess: "容量衰减过程（上传数据）",
        predictedCycleLife: "预测达到80% SOH的循环次数",
        xAxisName: "循环数",
        yAxisName: "放电容量",
        originalSoh: "上传值",
        originalSohUsed: "上传值 (已使用)",
        originalSohUnused: "上传值 (未使用)",
        estimatedSoh: "预测值",
        predictedCapacityLine: "预测容量线",
        sohPredictionLine: "80% SOH 预测线",
        value: "值",
        noData: "无数据",
        xAxisLabel: "循环圈数",
        yAxisLabel: "容量保持率(%)"
    },

    // Detail
    detail: {
        actionTitle: "预测详情",
        loading: "正在加载预测详情...",
        missingId: "缺少预测ID参数",
        fetchError: "获取预测详情失败",
        downloadFailed: "下载文件失败"
    },

    // Actions
    actions: {
        backToList: "返回列表",
        back: "返回",
        newPrediction: "新增预测"
    },

    // Default Step
    default: {
        selectStep: "请选择操作步骤",
        selectStepDescription: "请从上方步骤中选择要执行的操作"
    },

    // Tutorial
    tutorial: {
        button: "教程",
        modalTitle: "使用教程",
        imageCaption: '预测输出与实际电芯性能对比',
        point1: '"预测"可以使用前100个循环的时序数据预测循环寿命。',
        point1_sub1: 'NCM811/12%Si.-石墨搭配碳酸盐电解液',
        point1_sub2: '1C/1C循环，每100个循环进行0.33C/0.33C容量检查',
        point2: '对于一般预测，准确度约为 ±15%。针对特定电池体系微调模型后，该体系的预测准确度可提升至 ±5% 左右。',
        point3: '对于已知循环寿命的真实电芯（基于每个循环的容量保持率为1261次循环，或基于容量检查循环的容量保持率为1351次循环），模型预测EOL在第1321次循环。',
        point3_sub1: '预测误差仅为4.7%或2.2%，远优于简单线性外推法（800次循环）。',
        point4: '预测误差仅为4.7%或2.2%，远优于简单线性外推法（800次循环）。'
    },

    // Introduction Page
    introduction: {
        title: "简介",
        paragraph1: "该工具使用基于内部实验数据集训练的AI模型，预测电池循环寿命，即放电容量保持率降至80%时的循环次数。",
        paragraph2: "与传统的外推方法不同，该模型能够捕捉非线性老化行为，并基于有限的循环信息提供早期的数据驱动的寿命终止估计。",
        inputRequirement: {
            title: "输入要求",
            paragraph1: "仅需要早期循环的数据（例如前100个有效循环）。",
            paragraph2: "有效循环代表目标工作条件下的正常老化行为，排除以下非代表性循环：",
            item1: "诊断或容量检查（RPT）循环",
            item2: "长时间静置或低倍率测试循环",
            item3: "受实验干扰或异常容量跳变影响的循环"
        },
        applicability: {
            title: "适用范围",
            paragraph1: "该模型已针对循环寿命主要由活性离子库存损失控制的电池系统进行验证，包括锂离子电池、钠离子电池和无阳极电池。对于其他电化学退化机制，如活性材料损失或锂沉积，模型可以提供估计，但精度会降低。由机械因素驱动的失效模式，如极耳开裂或内部短路，超出模型范围，无法预测。"
        },
        predictionAccuracy: {
            title: "预测精度",
            item1: "在没有材料体系先验知识的一般使用情况下，典型的预测误差在±15%以内。",
            item2: "针对特定电池体系微调模型后，误差可降低至约±5%。"
        },
        example: {
            title: "示例",
            paragraph1: "在一个示例中，基于模型的预测通过捕捉随时间演变的SOH退化趋势，估计电池寿命终止约在1308个循环。与假设恒定衰减率不同，预测投射出非线性老化行为，产生与测量的SOH演变一致的轨迹。在这种情况下，模型使用垂直红色虚线指示的循环之前的数据（约130个循环），并排除异常循环以建立稳定的退化趋势进行预测。实际寿命终止观察在1396个循环（不包括容量检查循环），对应约6.3%的预测误差。",
            paragraph2: "如果改用简单的线性外推，寿命将被低估在约1000个循环。这凸显了预测方法在提供更准确寿命估计方面的优势。"
        }
    },

    // Train
    train: {
        title: "训练新模型",
        back: "返回",
        step1: {
            title: "模型信息",
            name: "模型名称",
            namePlaceholder: "输入模型名称",
            remarks: "备注",
            remarksPlaceholder: "输入任何其他注释或备注"
        },
        step2: {
            title: "基础模型",
            modelName: "OSES-Base-v1",
            badge: "基础模型",
            loading: "加载中...",
            noModels: "暂无基础模型"
        },
        step3: {
            title: "训练数据集",
            ratio: "训练-测试分割比例：",
            ratioValue: "7 : 3",
            ratioDesc: "70% 的数据集将用于训练，30% 用于测试",
            upload: "上传数据集",
            uploadNote: "至少上传30颗电芯的数据且每颗电芯至少循环至SOH=80%",
            dragDrop: "将文件拖放到此处，或点击浏览",
            formats: "支持的格式：CSV, NDA, NDAX",
            dragDropMultiple: "将文件拖放到此处，或点击浏览",
            formatsMultiple: "支持的格式：CSV, NDA, NDAX（最多 {{max}} 个文件）",
            chooseFile: "选择文件",
            chooseFiles: "选择文件",
            downloadSample: "下载示例",
            removeFile: "移除文件"
        },
        startTraining: "开始训练",
        errors: {
            fileFormat: "不支持的文件格式",
            maxFiles: "最多允许 {{max}} 个文件",
            duplicateFiles: "部分重复文件已跳过",
            modelNameRequired: "请输入模型名称",
            baseModelRequired: "请选择基础模型",
            fileRequired: "请上传训练数据集",
            failed: "启动训练失败"
        },
        success: "模型训练已成功启动",
        submitting: "提交中..."
    },
    
    // Models
    models: {
        loadingText: "加载中...",
        error: "错误",
        noResults: "暂无模型",
        showingRecords: "显示 {{count}} / {{total}} 条记录",
        statusOnline: "上线",
        statusTrained: "训练完成",
        statusTraining: "训练中",
        statusOffline: "下线",
        statusFail: "失败",
        cannotDeleteDemo: "无法删除演示模型",
        deleteConfirm: "确定要删除此模型吗？",
        deleteFailed: "删除模型失败",
        loading: {
            error: "加载模型列表失败"
        },
        filters: {
            searchPlaceholder: "搜索模型ID或名称...",
            statusPlaceholder: "选择状态",
            allStatus: "所有状态",
            allBaseModels: "所有基础模型",
            selectDate: "选择日期",
            refresh: "刷新",
            clearFilters: "清除筛选"
        },
        columns: {
            modelId: "模型ID",
            modelName: "模型名称",
            baseModel: "基础模型",
            status: "状态",
            created: "创建时间",
            createdBy: "创建者",
            actions: "操作"
        },
        actions: {
            viewDetails: "查看详情",
            delete: "删除"
        }
    },

    // Model Detail
    modelDetail: {
        title: "模型信息",
        modelId: "模型 ID：",
        back: "返回",
        onlineModel: "上线模型",
        offlineModel: "下线模型",
        creator: "创建者：",
        status: "状态：",
        statusOnline: "上线",
        statusTrained: "训练完成",
        statusOffline: "下线",
        statusTraining: "训练中",
        statusFail: "失败",
        created: "创建时间：",
        remarks: "备注：",
        baseModel: "基础模型",
        trainingDataset: "训练数据集",
        trainingFiles: "训练数据集",
        trainingMetrics: "训练结果",
        datasetName: "数据集名称：",
        fileSize: "文件大小：",
        totalSamples: "总样本数：",
        ratio: "训练-测试比例：",
        trainingResults: "训练结果",
        accuracy: "准确率",
        loss: "损失",
        epochs: "轮数",
        trainingTime: "训练时长",
        validationScore: "验证分数",
        baseRMSE: "基础模型 RMSE",
        baseR2: "基础模型 R²",
        trainRMSE: "新模型 RMSE",
        trainR2: "新模型 R²",
        rmse: "RMSE",
        r2: "R²",
        baseModelLabel: "基础模型",
        newModelLabel: "新模型",
        predictionRecords: "预测记录",
        recordId: "ID",
        fileName: "文件名",
        batteryCount: "电芯数量",
        avgCycleLife: "平均循环寿命",
        actions: "操作",
        viewDetails: "查看详情",
        loadingText: "加载中...",
        noFiles: "暂无训练文件",
        noMetrics: "暂无训练指标",
        beforeTraining: "训练前",
        afterTraining: "训练后",
        downloadingLog: "下载中...",
        downloadTrainLog: "下载训练日志",
        downloadLogSuccess: "训练日志下载成功",
        downloadingFile: "文件下载中...",
        downloadFileSuccess: "文件下载成功",
        confirmDeploy: "确定要部署此模型吗？",
        confirmUndeploy: "确定要下线此模型吗？",
        confirmRemove: "确定要移除此模型吗？",
        deployMessage: "确定要部署此模型吗？这将使其可用于预测。",
        undeployMessage: "确定要下线此模型吗？这将使其变为下线状态。",
        removeMessage: "确定要移除此模型吗？此操作无法撤销。",
        cancel: "取消",
        confirm: "确认",
        deploySuccess: "模型部署成功",
        undeploySuccess: "模型下线成功",
        removeSuccess: "模型移除成功",
        errors: {
            noId: "需要模型 ID",
            fetchFailed: "获取模型详情失败",
            actionFailed: "操作失败",
            mockModel: "无法修改演示模型",
            notFound: "模型未找到",
            downloadLogFailed: "下载训练日志失败"
        },
        metricsInfo: {
            rmse: {
                name: "均方根误差",
                description: "ŷᵢ 表示预测循环数，yᵢ 表示真实循环数，N 代表测试集样本量"
            },
            mae: {
                name: "平均绝对误差",
                description: "ŷᵢ 表示预测循环数，yᵢ 表示真实循环数，N 代表测试集样本量"
            },
            mape: {
                name: "平均绝对百分比误差",
                description: "ŷᵢ 表示预测循环数，yᵢ 表示真实循环数，N 代表测试集样本量"
            },
            predictedValue: "预测循环数",
            actualValue: "真实循环数",
            sampleSize: "测试集样本量"
        }
    },

    // Train disabled tip
    trainDisabledTip: "如需使用，请通过邮箱 <emailLink>mu.sales@ses.ai</emailLink> 联系我们的团队。"
};