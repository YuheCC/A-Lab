export default {
    // Header
    title: "上传早期循环数据进行寿命预测",
    subtitle: "使用基于SES内部实验数据训练的AI模型预测锂离子电池的循环寿命（达到80% SOH的循环次数）。仅需前100个循环（有效循环，因此实际数量可能更多）即可。",
    betaTag: "BETA",
    disclaimerTitle: "免责声明",
    disclaimer: "<strong>注意：</strong>此功能仅使用用户提供的早期阶段循环数据来预测电池循环寿命。不需要电池化学或设计等额外信息。该模型目前适用于在标准循环条件下（非实际使用场景）具有有限活性离子的电池系统。鼓励用户通过自己的测试来验证预测结果。",

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
        subtitle: "目前仅支持CSV格式文件，后续将支持更多文件类型",
        uploading: "正在上传文件...",
        waitText: "请稍候",
        removeFile: "移除文件",
        dataFormatTip: "📋 数据格式要求",
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
            avgCycleLife: "平均循环寿命",
            model: "模型",
            created: "创建时间",
            actions: "操作"
        }
    },

    // Records
    records: {
        searchPlaceholder: "搜索record名称或ID",
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
            viewDetails: "查看详情",
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
        capacityProcess: "容量衰减过程（上传数据）",
        predictedCycleLife: "预测达到80% SOH的循环次数",
        xAxisName: "循环数",
        yAxisName: "放电容量",
        predictedCapacityLine: "预测容量线",
        sohPredictionLine: "80% SOH 预测线",
        value: "值",
        noData: "无数据"
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
        backToList: "返回列表"
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
        point2: '对于锂离子电池，预测精度可达到±5%。',
        point3: '对于已知循环寿命的真实电芯，模型预测EOL在1321次循环时。',
        point3_sub1: '实际值为1261次循环（基于每个循环的容量保持率）或1351次循环（基于容量检查循环的容量保持率）。',
        point4: '预测误差仅为4.7%或2.2%，远优于简单线性外推法（800次循环）。'
    },

    // Train
    train: {
        title: "训练新模型",
        back: "返回",
        step1: {
            title: "模型信息",
            name: "模型名称",
            namePlaceholder: "输入模型名称",
            remarks: "备注（可选）",
            remarksPlaceholder: "输入任何其他注释或备注"
        },
        step2: {
            title: "基础模型",
            modelName: "OSES-Base-v1",
            badge: "基础模型"
        },
        step3: {
            title: "训练数据集",
            ratio: "训练-测试分割比例：",
            ratioValue: "7 : 3",
            ratioDesc: "70% 的数据集将用于训练，30% 用于测试",
            upload: "上传数据集",
            dragDrop: "将文件拖放到此处，或点击浏览",
            formats: "支持的格式：CSV、XLSX（最大 50MB）",
            chooseFile: "选择文件",
            downloadSample: "下载示例"
        },
        startTraining: "开始训练",
        errors: {
            fileSize: "文件大小超过 50MB"
        }
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
        filters: {
            searchPlaceholder: "搜索模型ID或名称...",
            allStatus: "所有状态",
            allBaseModels: "所有基础模型",
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
            viewDetails: "查看详情"
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
        statusTraining: "训练中",
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
        confirmDeploy: "确定要部署此模型吗？",
        confirmRemove: "确定要移除此模型吗？",
        deployMessage: "确定要部署此模型吗？这将使其可用于预测。",
        removeMessage: "确定要移除此模型吗？此操作无法撤销。",
        cancel: "取消",
        confirm: "确认",
        deploySuccess: "模型部署成功",
        removeSuccess: "模型移除成功",
        errors: {
            noId: "需要模型 ID",
            fetchFailed: "获取模型详情失败",
            actionFailed: "操作失败",
            mockModel: "无法修改演示模型",
            notFound: "模型未找到"
        }
    }
};