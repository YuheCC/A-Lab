export default {
    // List/Table columns
    list: {
        columns: {
            recordId: 'Record ID',
            smiles: 'SMILES',
            modelName: 'Model Name',
            totalPositive: 'Total Positive',
            temp25: '25°C Positive',
            temp45: '45°C Positive',
            created: 'Created Time',
            actions: 'Actions'
        }
    },
    // Create page
    create: {
        title: 'New Design'
    },
    // Train page
    train: {
        title: 'Train New Model',
        back: 'Back',
        startTraining: 'Start Training',
        submitting: 'Submitting...',
        success: 'Model training started successfully!',
        errors: {
            modelNameRequired: 'Please enter model name',
            baseModelRequired: 'Please select a base model',
            fileRequired: 'Please upload training dataset',
            fileFormat: 'Unsupported file format',
            duplicateFiles: 'Some duplicate files were skipped',
            unknown: 'Failed to start training'
        },
        instruction: {
            title: "MU-in-Box Design Function Instructions",
            functionality: {
                title: "1. Functionality",
                desc: "The MU-in-Box design function provides two major capabilities:",
                train: {
                    title: "1.1 Training and Evaluation",
                    input: "Input: “Customer table template for model tuning.xlsx”",
                    output: "Output: A trained model and evaluation metrics",
                    metrics1: "CR, CL task evaluation metrics: RMSE (Root Mean Square Error) and R² (Coefficient of Determination)",
                    metrics2: "CE task evaluation metrics: F1 score and AUC (area under curve)"
                },
                predict: {
                    title: "1.2 Prediction",
                    input: "Input: SMILES of the new additive",
                    output: "Output: Predicted performance change relative to the benchmark",
                    note: "Users may enter their own data to train models and perform predictions."
                }
            },
            structure: {
                title: "2. Table Structure",
                p1: "Part 1: Cell Information (Cathode / Anode / Electrolyte Code)",
                p2: "Part 2: Solvents",
                p3: "Part 3: Salts",
                p4: "Part 4: Additives",
                p5: "Part 5: Cell Performance"
            },
            filling: {
                title: "3. Table Filling Instructions",
                template: {
                    title: "3.1 Data Template — “Customer table template for model tuning.xlsx”",
                    row1: "Do not modify the first two rows of the template.",
                    row2: "Do not add or remove any columns."
                },
                requirements: {
                    title: "3.2 Data Requirements",
                    item1: "The third row of the table template is the benchmark electrolyte. The corresponding performance is marked as 1. Other electrolytes are based on the benchmark, and the performance is compared relatively.",
                    item2: "Please make sure at least one of the cell performances is filled",
                    item3: "Please make sure the total wt% of all components is 100%."
                }
            },
            notes: {
                title: "4. Notes for Each Table Section",
                p1: {
                    title: "Part 1: Cell Information",
                    item1: "Ensure cathode and anode types are consistent.",
                    item2: "Only the electrolyte code should vary."
                },
                p2: {
                    title: "Part 2: Solvents",
                    item1: "Provide SMILES and wt% for each solvent, up to Solvent 5.",
                    item2: "Ensure all SMILES are valid.",
                    item3: "Benchmark electrolyte must contain at least 3 solvents."
                },
                p3: {
                    title: "Part 3: Salts",
                    item1: "Provide SMILES and wt% for each salt, up to Salt 3.",
                    item2: "Ensure all SMILES are valid."
                },
                p4: {
                    title: "Part 4: Additives",
                    item1: "Provide SMILES and wt% for each additive, up to Additive 6.",
                    item2: "Benchmark electrolyte must not contain more than 3 additives."
                },
                p5: {
                    title: "Part 5: Cell Performance",
                    item1: "Cycle number (25°C)：The number of cycles for the cell capacity to decrease to 80% under 25°C and any cycling conditions.",
                    item2: "Average CE (25°C)：The average coulombic efficiency of all cycles up to the point where the cell capacity decreases to 80% under 25°C and any cycling conditions.",
                    item3: "Energy retention at high-rate discharge (25°C) ：The energy retention of the cell when discharged at the highest rate compared to the lowest rate under 25°C conditions.",
                    item4: "Cycle number (45°C) ：The number of cycles for the cell capacity to decrease to 80% under 45°C and any cycling conditions.",
                    item5: "Average CE (45°C) ：The average coulombic efficiency of all cycles up to the point where the cell capacity decreases to 80% under 45°C and any cycling conditions.",
                    note1: "You may train the model using any one performance type.",
                    note2: "If multiple cells were tested (e.g., 100,120,130), enter them into one cell separated by ASCII commas: 100,120,130",
                    note3: "Ensure the content in the excel is correct format."
                }
            },
            tips: {
                title: "5. Additional Tips",
                item1: "5.1 A weight-check column verifies the formulation totals 100 wt%."
            }
        },
        step1: {
            title: 'Model Information',
            name: 'Model Name',
            namePlaceholder: 'Enter model name',
            remarks: 'Remarks',
            remarksPlaceholder: 'Enter any additional notes or remarks'
        },
        step2: {
            title: 'Cell Specifications',
            cathode: 'Cathode',
            cathodePlaceholder: 'Polycrystal NCM811, 4 mAh/cm²',
            anode: 'Anode',
            anodePlaceholder: '12% SiC + Graphite',
            benchmarkElectrolyte: 'Benchmark Electrolyte',
            benchmarkElectrolytePlaceholder: 'Solvent EC/EMC/DEC (2:3:2) + Salt 1M LiPF6/LiFSI + Additive VC/LiDFP',
            cellDesign: 'Cell Design',
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity'
        },
        step3: {
            title: 'Base Model',
            loading: 'Loading models...',
            noModels: 'No base models available'
        },
        step4: {
            title: 'Training Dataset',
            upload: 'Upload Dataset',
            dragDrop: 'Drag and drop your file here, or click to browse',
            formats: 'Supported format: XLSX only',
            dragDropMultiple: 'Drag and drop your files here, or click to browse',
            formatsMultiple: 'Supported format: XLSX only',
            chooseFile: 'Choose File',
            chooseFiles: 'Choose Files',
            removeFile: 'Remove file',
            downloadSample: 'Download Sample'
        }
    },
    // Introduction
    introduction: {
        overview: '"Design" provides a semi-quantitative reference for how new electrolyte molecules may influence cell performance.',
        modelDescription: 'The foundation of the Design function is a data-driven AI model trained on SES\'s internal cell-testing datasets, all generated under consistent testing environments and benchmark conditions. This ensures high-quality data and enables strong predictive accuracy. To further enhance performance for specific systems or testing conditions, customers can fine-tune or retrain the model using their own data.',
        predictionProcess: 'During prediction, the model compares the performance of a benchmark cell with that of a hypothetical cell that has the same design but incorporates a new electrolyte additive (as specified by the user). The reported percentage changes are derived from SES internal testing platforms and conditions.',
        example: 'For example, when the molecule O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1 is evaluated, the system displays molecular information if it exists in the MU database. The prediction results then appear, where arrows indicate the direction of the impact and percentages are based on SES internal testing platforms. In this case, the model predicts that the new electrolyte additive positively affects room-temperature cycle life and Coulombic efficiency, but may slightly reduce rate performance, likely due to the formation of a more stable SEI.',
        // Figure 1
        figure1Label: 'Figure 1.',
        figure1Alt: 'Input SMILES of any molecules',
        figure1Caption: 'Input SMILES of any molecules',
        // Figure 2
        figure2Label: 'Figure 2.',
        figure2Alt: 'Molecular information if the input molecule is in MU database',
        figure2Caption: 'Molecular information if the input molecule is in MU database',
        // Figure 3
        figure3Label: 'Figure 3.',
        figure3Alt: 'Semi-quantitative prediction of molecular impacts on cell performance',
        figure3Caption: 'Semi-quantitative prediction of molecular impacts on cell performance. Arrows indicate positive or negative influence, and percentages are derived from SES testing platforms under respective conditions.',
        // Legacy keys
        figureAlt: 'Example of predicting a molecule on the cell performance by Design model',
        figureCaption: 'Figure. Example of predicting a molecule on the cell performance by Design model',
        accuracy: 'Based on internal validation, the current model achieves approximately 85% directional accuracy, meaning it can correctly judge the impact of about 8 out of 10 previously unseen molecules under defined conditions.',
        supportedSystems: 'The current Design module supports the NCM811 – 12% Si/graphite – carbonate electrolyte system, with predictions available for room-temperature cycling, 45 °C cycling, and room-temperature rate performance. Additional cell systems and testing conditions will be incorporated in future updates.',
        customization: 'Because cell chemistry, cell design, and application conditions vary widely, we enable customers to fine-tune or retrain the model using their own data to achieve the highest predictive accuracy for their specific systems. This capability is included with the MU Box, which is deployed on-premise to ensure 100% data privacy and zero data leakage.',
        automation: 'Data augmentation, model training, and model evaluation are fully automated. Customers only need to collect and upload datasets containing different additive molecules. Detailed instructions are available under the "Train" function.'
    },
    // Model Detail
    modelDetail: {
        title: "Model Information",
        modelId: "Model ID:",
        back: "Back",
        onlineModel: "Deploy Model",
        offlineModel: "Undeploy Model",
        deploying: "Deploying...",
        undeploying: "Undeploying...",
        creator: "Creator:",
        status: "Status:",
        statusOnline: "Online",
        statusTrained: "Trained",
        statusOffline: "Offline",
        statusTraining: "Training",
        statusFail: "Failed",
        created: "Created:",
        remarks: "Remarks:",
        baseModel: "Base Model",
        trainingDataset: "Training Dataset",
        datasetName: "Dataset Name:",
        fileSize: "File Size:",
        totalSamples: "Total Samples:",
        ratio: "Train-Test Ratio:",
        trainingResults: "Training Results",
        trainingFiles: "Training Dataset",
        trainingMetrics: "Training Results",
        accuracy: "Accuracy",
        loss: "Loss",
        epochs: "Epochs",
        trainingTime: "Training Time",
        validationScore: "Validation Score",
        baseRMSE: "Base Model RMSE",
        baseR2: "Base Model R²",
        trainRMSE: "New Model RMSE",
        trainR2: "New Model R²",
        rmse: "RMSE",
        r2: "R²",
        baseModelLabel: "Base Model",
        newModelLabel: "New Model",
        designRecords: "Design Records",
        recordId: "Record ID",
        smiles: "SMILES",
        temp25Count: "25°C Positive",
        temp45Count: "45°C Positive",
        actions: "Actions",
        viewDetails: "View Details",
        loadingText: "Loading...",
        error: "Error",
        noFiles: "No training files",
        noMetrics: "No training metrics",
        beforeTraining: "Before Training",
        afterTraining: "After Training",
        downloadingLog: "Downloading...",
        downloadTrainLog: "Download Train Log",
        confirmDeploy: "Are you sure you want to deploy this model?",
        confirmUndeploy: "Are you sure you want to undeploy this model?",
        deploySuccess: "Model deployed successfully!",
        undeploySuccess: "Model undeployed successfully!",
        errors: {
            noModelId: "No model ID provided",
            loadFailed: "Failed to load model detail",
            deployFailed: "Failed to deploy model",
            undeployFailed: "Failed to undeploy model",
            cannotDeployDemo: "Cannot deploy demo model",
            cannotUndeployDemo: "Cannot undeploy demo model",
            downloadLogFailed: "Failed to download train log"
        }
    },
    // Record Detail
    record: {
        title: "Record Details",
        missingId: "Missing record ID parameter",
        fetchError: "Failed to fetch record details",
        loading: "Loading...",
        createdAt: "Created",
        cellChemistry: "Design Setup",
        cellChemistryLabel: "Cell Chemistry",
        modelSelect: "Model Select",
        noModel: "No model information",
        weightPercentage: "Weight Percentage"
    }
};
