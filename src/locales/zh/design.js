export default {
    // List/Table columns
    list: {
        columns: {
            recordId: 'Record ID',
            smiles: 'SMILES',
            modelName: '模型名称',
            totalPositive: 'Total Positive',
            temp25: '25°C Positive',
            temp45: '45°C Positive',
            created: '创建时间',
            actions: '操作'
        }
    },
    // Create page
    create: {
        title: '新建设计'
    },
    // Train page
    train: {
        title: '训练新模型',
        back: '返回',
        startTraining: '开始训练',
        submitting: '提交中...',
        success: '模型训练已成功启动！',
        errors: {
            modelNameRequired: '请输入模型名称',
            baseModelRequired: '请选择基础模型',
            fileRequired: '请上传训练数据集',
            fileFormat: '不支持的文件格式',
            duplicateFiles: '部分重复文件已跳过',
            unknown: '训练启动失败'
        },
        step1: {
            title: '模型信息',
            name: '模型名称',
            namePlaceholder: '输入模型名称',
            remarks: '备注（可选）',
            remarksPlaceholder: '输入任何补充说明或备注'
        },
        step2: {
            title: '电池规格',
            cathode: '正极',
            cathodePlaceholder: 'Polycrystal NCM811, 4 mAh/cm²',
            anode: '负极',
            anodePlaceholder: '12% SiC + Graphite',
            benchmarkElectrolyte: '基准电解液',
            benchmarkElectrolytePlaceholder: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/LiDFP',
            cellDesign: '电池设计',
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
        },
        step3: {
            title: '基础模型',
            loading: '加载模型中...',
            noModels: '暂无可用的基础模型'
        },
        step4: {
            title: '训练数据集',
            upload: '上传数据集',
            dragDrop: '将文件拖放到此处，或点击浏览',
            formats: '支持格式: CSV, XLSX (最大 50MB)',
            dragDropMultiple: '将文件拖放到此处，或点击浏览',
            formatsMultiple: '仅支持 XLSX 格式',
            chooseFile: '选择文件',
            chooseFiles: '选择文件',
            removeFile: '移除文件',
            downloadSample: '下载样例'
        }
    },
    // Introduction
    introduction: {
        overview: '"Design" 功能提供了一个半定量参考，用于评估新电解质分子对电池性能的潜在影响。',
        modelDescription: 'Design 功能的基础是一个数据驱动的 AI 模型，该模型基于 SES 内部电池测试数据集进行训练，所有数据均在一致的测试环境和基准条件下生成。这确保了高质量的数据，并使模型能够达到较高的预测准确度。为了进一步提升特定系统或测试条件下的性能，客户可以使用自己的数据对模型进行微调或重新训练。',
        predictionProcess: '在预测过程中，模型会比较基准电池与假设电池（具有相同设计但加入了用户指定的新电解质添加剂）的性能。报告中的百分比变化均来源于 SES 内部测试平台和条件。',
        example: '例如，当评估分子 O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1 时，如果该分子存在于 MU 数据库中，系统将显示其分子信息。随后显示预测结果，箭头表示影响方向，百分比基于 SES 内部测试平台。在此例中，模型预测该新电解质添加剂对室温循环寿命和库仑效率有正面影响，但可能会略微降低倍率性能，这可能是由于形成了更稳定的 SEI。',
        // Figure 1
        figure1Label: '图 1.',
        figure1Alt: '输入任意分子的 SMILES',
        figure1Caption: '输入任意分子的 SMILES',
        // Figure 2
        figure2Label: '图 2.',
        figure2Alt: '如果输入分子存在于 MU 数据库中，将显示分子信息',
        figure2Caption: '如果输入分子存在于 MU 数据库中，将显示分子信息',
        // Figure 3
        figure3Label: '图 3.',
        figure3Alt: '分子对电池性能影响的半定量预测',
        figure3Caption: '分子对电池性能影响的半定量预测。箭头表示正面或负面影响，百分比数据来源于 SES 测试平台在相应条件下的结果。',
        // 遗留键
        figureAlt: 'Design 模型预测分子对电池性能影响的示例',
        figureCaption: '图. Design 模型预测分子对电池性能影响的示例',
        accuracy: '根据内部验证，当前模型的方向准确率约为 85%，即在定义条件下，它可以正确判断约 10 个之前未见分子中 8 个的影响方向。',
        supportedSystems: '当前 Design 模块支持 NCM811 – 12% Si/石墨 – 碳酸酯电解质体系，可预测室温循环、45 °C 循环和室温倍率性能。未来更新将纳入更多电池体系和测试条件。',
        customization: '由于电池化学、电池设计和应用条件的差异很大，我们允许客户使用自己的数据对模型进行微调或重新训练，以实现针对其特定系统的最高预测准确度。此功能包含在本地部署的 MU Box 中，确保 100% 的数据隐私和零数据泄露。',
        automation: '数据增强、模型训练和模型评估均已完全自动化。客户只需收集并上传包含不同添加剂分子的数据集。详细说明可在 "Train" 功能下查看。'
    },
    // Model Detail
    modelDetail: {
        title: "模型信息",
        modelId: "模型 ID：",
        back: "返回",
        onlineModel: "上线模型",
        offlineModel: "下线模型",
        deploying: "部署中...",
        undeploying: "下线中...",
        creator: "创建者：",
        status: "状态：",
        statusOnline: "上线",
        statusTrained: "训练完成",
        statusOffline: "离线",
        statusTraining: "训练中",
        statusFail: "失败",
        created: "创建时间：",
        remarks: "备注：",
        baseModel: "基础模型",
        trainingDataset: "训练数据集",
        datasetName: "数据集名称：",
        fileSize: "文件大小：",
        totalSamples: "总样本数：",
        ratio: "训练-测试比例：",
        trainingResults: "训练结果",
        trainingFiles: "训练数据集",
        trainingMetrics: "训练结果",
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
        designRecords: "设计记录",
        recordId: "记录ID",
        smiles: "SMILES",
        temp25Count: "25°C正样本",
        temp45Count: "45°C正样本",
        actions: "操作",
        viewDetails: "查看详情",
        loadingText: "加载中...",
        error: "错误",
        noFiles: "暂无训练文件",
        noMetrics: "暂无训练指标",
        beforeTraining: "训练前",
        afterTraining: "训练后",
        downloadingLog: "下载中...",
        downloadTrainLog: "下载训练日志",
        confirmDeploy: "确定要部署此模型吗？",
        confirmUndeploy: "确定要下线此模型吗？",
        deploySuccess: "模型部署成功！",
        undeploySuccess: "模型下线成功！",
        errors: {
            noModelId: "缺少模型 ID",
            loadFailed: "加载模型详情失败",
            deployFailed: "部署模型失败",
            undeployFailed: "下线模型失败",
            cannotDeployDemo: "无法部署演示模型",
            cannotUndeployDemo: "无法下线演示模型",
            downloadLogFailed: "下载训练日志失败"
        }
    },
    // Record Detail
    record: {
        title: "记录详情",
        missingId: "缺少记录 ID 参数",
        fetchError: "获取记录详情失败",
        loading: "加载中...",
        createdAt: "创建时间",
        cellChemistry: "设计设置",
        cellChemistryLabel: "电池化学",
        modelSelect: "模型选择",
        noModel: "无模型信息",
        weightPercentage: "重量百分比"
    }
};
