export default {
    // Header
    title: "电池寿命预测",
    betaTag: "BETA",

    // Steps
    steps: {
        upload: "数据上传",
        aiPredict: "AI预测",
        results: "结果展示"
    },

    // Upload Step
    upload: {
        selectFile: "选择文件",
        clickToUpload: "点击上传电池数据文件",
        subtitle: "目前仅支持CSV格式文件，后续将支持更多文件类型",
        uploading: "正在上传文件...",
        waitText: "请稍候",
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

    // History
    history: {
        title: "预测记录",
        newPrediction: "新增预测",
        searchPlaceholder: "Search by file name...",
        loading: "加载中...",
        deleteConfirm: "确定要删除这条记录吗？",
        deleteSuccess: "删除成功",
        deleteFailed: "删除失败",
        view: "查看",
        delete: "删除"
    },

    // Modal
    modal: {
        title: "预测记录详情 - 历史数据",
        uploadedData: "上传数据",
        predictionResults: "预测结果",
        loadingDetail: "加载中...",
        loadDetailFailed: "获取详细数据失败"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "加载历史记录失败",
        predictionFailed: "预测失败，请重试",
        uploadFailed: "文件上传失败",
        fileFormatError: "文件格式不支持，请上传CSV或Excel文件"
    },

    // Default Step
    default: {
        selectStep: "请选择操作步骤",
        selectStepDescription: "请从上方步骤中选择要执行的操作"
    }
};