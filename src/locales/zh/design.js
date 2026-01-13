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
        instruction: {
            title: "MU-in-Box 设计功能说明",
            functionality: {
                title: "1. 功能说明",
                desc: "MU-in-Box 包含两个主要功能：",
                train: {
                    title: "1.1 模型训练与评估",
                    input: "输入：“Customer table template for model tuning.xlsx”",
                    output: "输出：训练后的模型及评估指标结果",
                    metrics1: "其中CR, CL任务评估指标为 RMSE (Root Mean Square Error) and R² (Coefficient of Determination)",
                    metrics2: "CE任务的评估指标为 F1 score and AUC (area under curve)"
                },
                predict: {
                    title: "1.2 性能预测",
                    input: "输入：新添加剂的 SMILES",
                    output: "输出：新添加剂相对于基准电解液的性能变化预测结果",
                    note: "用户可通过填写数据来自定义训练模型并进行预测。"
                }
            },
            structure: {
                title: "2. 表格结构",
                p1: "第 1 部分：电芯信息（正极 / 负极 / 电解液编码）",
                p2: "第 2 部分：溶剂",
                p3: "第 3 部分：锂盐",
                p4: "第 4 部分：添加剂",
                p5: "第 5 部分：电芯性能"
            },
            filling: {
                title: "3. 表格填写说明",
                template: {
                    title: "3.1 数据模板要求 —— “Customer table template for model tuning.xlsx”",
                    row1: "请不要更改模板的前两行。",
                    row2: "请不要增删任何列。"
                },
                requirements: {
                    title: "3.2 数据填写要求",
                    item1: "表格第3行为基准电解液，其对应所有的任务数值为1，其他电解液数值为基准电解液的相对比值",
                    item2: "确保每个电解液中至少一个任务的数值非空",
                    item3: "确保每个电解液配方得总和加起来为100%"
                }
            },
            notes: {
                title: "4. 各部分填写注意事项",
                p1: {
                    title: "第 1 部分：电芯信息",
                    item1: "请确保所有条目的正极与负极类型保持一致。",
                    item2: "只有电解液编码可以变化。"
                },
                p2: {
                    title: "第 2 部分：溶剂",
                    item1: "请填写每个溶剂的 SMILES 与 wt%，最多至 Solvent 5。",
                    item2: "请确保所有 SMILES 合法有效。",
                    item3: "基准电解液必须包含至少 3 个溶剂。"
                },
                p3: {
                    title: "第 3 部分：锂盐",
                    item1: "请填写各锂盐的 SMILES 与 wt%，最多至 Salt 3。",
                    item2: "请确保 SMILES 合法有效。"
                },
                p4: {
                    title: "第 4 部分：添加剂",
                    item1: "请填写每个添加剂的 SMILES 与 wt%，最多至 Additive 6。",
                    item2: "基准电解液的添加剂数量不得超过 3 个。"
                },
                p5: {
                    title: "第 5 部分：电芯性能数据",
                    item1: "循环寿命（25°C）：在 25°C 及任意循环条件下，电池容量衰减至 80% 所对应的循环次数",
                    item2: "平均库仑效率（25°C）：在 25°C 及任意循环条件下，电池容量衰减至 80% 时，各循环库仑效率的平均值。",
                    item3: "高倍率放电能量保持率（25°C）：在 25°C 条件下，以最高倍率放电相比最低倍率放电时的能量保持率。",
                    item4: "循环寿命（45°C）：在 45°C 及任意循环条件下，电池容量衰减至 80% 所对应的循环次数。",
                    item5: "平均库仑效率（45°C）：在 45°C 及任意循环条件下，电池容量衰减至 80% 时，各循环库仑效率的平均值。",
                    note1: "您可使用任意一种性能数据进行模型训练。",
                    note2: "若同一配方对应多颗电芯（如 100,120,130），请在同一单元格内以半角逗号分隔填写：100,120,130",
                    note3: "请确保单元格格式设置正确。"
                }
            },
            tips: {
                title: "5. 其他提示",
                item1: "5.1重量检查列可用于验证配方是否加总为 100 wt%。"
            }
        },
        step1: {
            title: '模型信息',
            name: '模型名称',
            namePlaceholder: '输入模型名称',
            remarks: '备注',
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
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity',
            // Note: solventPlaceholder, saltPlaceholder, additivePlaceholder 保持专业术语原文，不进行翻译
            solventPlaceholder: 'EC/EMC/DEC',
            saltPlaceholder: '1M LiPF6/LiFSI',
            additivePlaceholder: 'VC/LiDFP'
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
            formats: '支持格式: XLSX 格式',
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
        statusOffline: "下线",
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
        f1ScoreTooltip: {
            description: "精确率和召回率的调和平均数，用于平衡二者之间的权衡。",
            precision: "精确率",
            recall: "召回率"
        },
        aucTooltip: {
            description: "特指 ROC 曲线下的面积。它衡量模型区分不同类别的能力。AUC 值越高，表示分类性能越好。"
        },
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
    // History
    history: {
        newDesign: "新增设计",
        train: "训练",
        loadingText: "加载中...",
        error: "错误",
        noResults: "暂无设计记录",
        deleteConfirm: "确定要删除这条记录吗？",
        deleteFailed: "删除记录失败",
        loading: {
            error: "加载历史数据失败"
        },
        actions: {
            viewResults: "查看结果",
            delete: "删除"
        }
    },
    // Actions
    actions: {
        backToList: "返回列表"
    },
    // Tabs
    tabs: {
        introduction: "简介",
        records: "记录",
        models: "模型"
    },
    // Models
    models: {
        loadingText: "加载中...",
        loadingError: "加载模型失败",
        error: "错误",
        deleteConfirm: "确定要删除此模型吗?",
        deleteFailed: "删除模型失败",
        actions: {
            delete: "删除"
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
    },
    // Electrode Module
    electrode: {
        title: "电极对电池性能的影响",
        subtitle: "通过在SES内部实验数据上训练的AI模型，预测电极材料对电池性能指标（循环寿命、库仑效率、倍率性能）的影响",
        features: {
            resultPrediction: {
                title: "结果预测",
                description: "预测电池性能"
            },
            trendAnalysis: {
                title: "趋势分析",
                description: "预测参数趋势"
            },
            optimize: {
                title: "逆向设计",
                description: "优化电极参数"
            },
            train: {
                title: "训练",
                description: "训练自定义模型"
            }
        },
        tabs: {
            introduction: "简介",
            records: "记录",
            models: "模型"
        },
        introduction: {
            overview: "电极模块包含四个主要功能：",
            function1: "1. 结果预测：基于电极材料选择和参数设置预测电池性能",
            function2: "2. 趋势分析：预设电极配方信息，将一个或多个参数设为变量，预测随这些参数变化电池性能的变化趋势",
            function3: "3. 优化：通过定义目标电池性能指标，反向推导并推荐合适的电极材料选择和参数",
            function4: "4. 训练：允许用户训练自定义模型"
        },
        predict: {
            title: "性能预测",
            back: "返回",
            electrodeDesign: "电极设计",
            cellDesign: "电池类型",    
            selectCellDesign: "选择电池类型",
            anodeActiveMaterial: "阳极活性材料",
            cathodeActiveMaterial: "阴极活性材料",
            selectMaterial: "请选择材料",
            anodeParameters: "阳极参数",
            cathodeParameters: "阴极参数",
            binder1: "粘结剂 1 (wt.%)",
            binder2: "粘结剂 2 (wt.%)",
            binder3: "粘结剂 3 (wt.%)",
            conductiveCarbon: "导电碳 (wt.%)",
            cnt: "碳纳米管 (wt.%)",
            pressDensity: "Press Density (g/cc)",
            arealLoading: "Areal Loading (mAh/cm²)",
            dimension: "正极尺寸",
            width: "宽度 (mm)",
            length: "长度 (mm)",
            layers: "层数",
            enterWidth: "请输入宽度",
            enterLength: "请输入长度",
            enterLayers: "请输入层数",
            calculate: "计算",
            cellPerformance: "电池性能预测",
            designCapacity: "设计容量",
            specificED: "重量能量密度",
            jellyRollThickness: "卷芯厚度",
            volumetricED: "体积能量密度",
            calculateError: "计算预测失败",
            npRatio: "N/P 比",
            enterNpRatio: "请输入 N/P 比",
            activeMaterial1: "Active Material SiC (wt.%)",
            activeMaterial2: "Active Material Graphite (wt.%)",
            anodeArealLoading: "Areal Loading (mAh/cm²)",
            cathodeActiveMaterialLabel: "Active material (wt.%)",
            kf9700: "PVDF (wt.%)",
            cn01y: "CNT (wt.%)",
            superC65: "Carbon Black (wt.%)",
            cmc: "CMC (wt.%)",
            sbr: "SBR (wt.%)",
            paa: "PAA (wt.%)",
            superP: "Carbon Black (wt.%)",
            swcnt: "CNT (wt.%)",
            rateCapability: "倍率性能 (1C-5C)"
        },
        optimize: {
            title: "逆向设计",
            back: "返回",
            designTargets: "设计目标",
            cellDesign: "电池类型",
            selectCellDesign: "选择电池类型",
            anodeActiveMaterial: "负极活性材料",
            cathodeActiveMaterial: "正极活性材料",
            selectMaterial: "选择材料",
            designCapacity: "设计容量",
            specificEnergy: "重量能量密度",
            thickness: "厚度",
            volumetricEnergyDensity: "体积能量密度",
            calculate: "计算",
            designRecommendations: "设计推荐",
            rank: "排名",
            actions: "操作",
            details: "详情",
            designDetails: "设计详情",
            npRatio: "N/P 比",
            cathodeParameters: "正极参数",
            anodeParameters: "负极参数",
            messages: {
                fillAllFields: "请填写所有必填字段",
                calculateSuccess: "推荐计算成功",
                calculateError: "推荐计算失败",
                loadDetailsError: "加载详情失败"
            }
        },
        records: {
            resultPrediction: "性能预测",
            trendAnalysis: "趋势分析",
            inverseDesign: "逆向设计",
            searchPlaceholder: "搜索记录 ID",
            selectDate: "年/月/日",
            showing: "显示 {{count}} / {{total}} 条记录",
            refresh: "刷新",
            reset: "重置",
            recordId: "记录 ID",
            cellDesign: "电池类型",
            cathode: "阴极活性材料",
            anode: "阳极活性材料",
            createdTime: "创建时间",
            actions: "操作",
            viewResults: "查看结果",
            delete: "删除",
            deleteConfirm: "确定要删除这条记录吗？",
            deleteSuccess: "记录删除成功",
            deleteError: "删除记录失败",
            loadError: "加载记录失败",
            noRecords: "暂无记录"
        },
        validation: {
            parameterRange: "{{label}} 必须在 {{min}} 到 {{max}} 之间",
            selectCathodeMaterial: "请选择阴极活性材料",
            selectAnodeMaterial: "请选择阳极活性材料",
            cathodeConductiveSum: "Carbon Black + CNT 的总和必须大于 0.8",
            cmcGreaterThanSwcnt: "CMC 必须大于 CNT",
            anodeConductiveSum: "Carbon Black + CNT 的总和必须大于 0.005",
            fillAllDimensions: "请填写所有尺寸参数",
            ratioSmallWidth: "宽度不超过 100 时，长宽比必须在 0.2 到 1 之间。",
            ratioLargeWidth: "宽度在 100 到 1000 之间时，长宽比必须保持在 0.1 到 0.5 之间。"
        }
    }
};
