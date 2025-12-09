export default {
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
            fileSize: 'File size exceeds 50MB',
            unknown: 'Failed to start training'
        },
        step1: {
            title: 'Model Information',
            name: 'Model Name',
            namePlaceholder: 'Enter model name',
            remarks: 'Remarks (Optional)',
            remarksPlaceholder: 'Enter any additional notes or remarks'
        },
        step2: {
            title: 'Cell Chemistry Specifications',
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
            formats: 'Supported formats: CSV, XLSX (Max 50MB)',
            chooseFile: 'Choose File',
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
        cellChemistry: "Cell Chemistry Selection",
        cellChemistryLabel: "Cell Chemistry",
        modelSelect: "Model Select",
        noModel: "No model information",
        weightPercentage: "Weight Percentage"
    }
};
