export default {
    // Header
    title: "Upload early cycle data for life prediction",
    subtitle: "Predict is an SES-developed AI model that estimates battery cycle life—defined as the cycle count at which discharge capacity falls to 80%—using early-cycle performance data. The model uses approximately the first 100 effective cycles as input, with effective cycles defined as those free from sudden capacity shifts or abnormal behavior. Predict performs best for systems where lifetime is governed by active-ion inventory loss, including Li-ion, Na-ion, and anode-free batteries. The presence of non-electrochemical degradation mechanisms—such as mechanical damage, design-related issues, internal shorts, gassing, lithium plating, or electrolyte depletion—can impact prediction accuracy.",
    betaTag: "BETA",
    disclaimerTitle: "Disclaimer",
    disclaimer: "<strong>Note:</strong> This function predicts cell cycle life using only early-stage cycling data provided by the user. No additional information, such as cell chemistry or design, is required. The model is currently applicable to battery systems with limited active ions under standard cycling conditions (not real-world usage profiles). Users are encouraged to validate the predictions through their own testing.",

    // Features
    features: {
        newPrediction: {
            title: "New Prediction",
            description: "Run a new prediction"
        },
        train: {
            title: "Train",
            description: "Train your custom model"
        }
    },

    // Create page
    create: {
        title: "New Prediction"
    },

    // Steps
    steps: {
        upload: "Data Upload",
        aiPredict: "AI Prediction",
        results: "Results Display"
    },

    // Model Selection
    modelSelection: {
        label: "Select a Model",
        placeholder: "Choose a model",
        baseModel: "Base Model",
        finetunedModels: "Fine-tuned Models",
        muModels: "MU Models",
        columns: {
            modelName: "Model Name",
            modelId: "Model ID",
            baseModel: "Base Model"
        }
    },

    // Upload Step
    upload: {
        title: "Upload Data",
        selectFile: "Select File",
        clickToUpload: "Click to upload battery data file",
        subtitle: "Currently only support CSV and the default file format of Neware (NDA/NDAX). More file types will be supported in the future",
        uploading: "Uploading file...",
        waitText: "Please wait",
        removeFile: "Remove file",
        dataFormatTip: "📋 CSV Data Format Requirements",
        sampleData: "Sample Data",
        requiredFields: "Required Fields:",
        requiredFieldsValue: "barcode, cycle_id, current (A), voltage (V), time (s)",
        currentDirection: "Current Direction:",
        currentDirectionValue: "+ for charging, - for discharging",
        unitRequirement: "Unit Requirements:",
        unitRequirementValue: "Current in A, Voltage in V, Time in s",
        dataRequirement: "Data Requirements:",
        dataRequirementValue: "Upload data ≥100 cycles, data must be sorted by time"
    },

    // AI Prediction Step
    prediction: {
        uploadedData: "Uploaded Data",
        changeFile: "Change File",
        fileSize: "File Size",
        fileType: "Type",
        startPrediction: "Start Prediction",
        progressLabel: "Analysis Progress",
        uploadingFile: "Uploading file and creating prediction task...",
        processing: "Prediction task is being processed in background, please be patient...",
        pleaseUploadFirst: "Please upload file first"
    },

    // Results Step
    results: {
        noResults: "No prediction results available, please complete prediction first",
        batteryCount: "Battery Count",
        batteryCountUnit: "pcs",
        avgCycleLife: "Average Cycle Life",
        avgCycleLife1: "Average Cycle Life",
        avgCycleLife2: "Average Cycle Life 2",
        cycleUnit: "cycles",
        predictionTime: "Prediction Time",
        unknown: "Unknown",
        barcode: "Barcode",
        cycleLife1: "Cycle Life",
        cycleLife2: "Cycle Life 2",
        noDetailedData: "No detailed barcode data available",
        dataRequirementNotMet: "Uploaded data does not meet requirements. For data processing support, please ",
        contactSupport: "contact us"
    },

    // Tabs
    tabs: {
        tool: "Prediction Tool",
        introduction: "Introduction",
        records: "Records",
        models: "Models"
    },

    // List
    list: {
        columns: {
            recordId: "Record ID",
            fileName: "File Name",
            batteryCount: "Battery Count",
            avgCycleLife: "Cycle Life",
            model: "Model",
            created: "Created Time",
            actions: "Actions"
        }
    },

    // Records
    records: {
        searchPlaceholder: "Search record ID",
        modelFilter: "Model filter",
        allModels: "All Models",
        clearFilters: "Clear Filters",
        showingRecords: "Showing {{count}} of {{total}} records"
    },

    // History
    history: {
        title: "Prediction Records",
        newPrediction: "New Prediction",
        train: "Train",
        searchPlaceholder: "Search by file name...",
        loadingText: "Loading...",
        error: "Error",
        noResults: "No prediction records found",
        cannotDeleteDemo: "Cannot delete demo records",
        deleteConfirm: "Are you sure you want to delete this record?",
        deleteSuccess: "Delete successful",
        deleteFailed: "Delete failed",
        view: "View",
        delete: "Delete",
        loading: {
            error: "Failed to load history records"
        },
        actions: {
            viewResults: "View Results",
            delete: "Delete"
        }
    },

    // Modal
    modal: {
        title: "Prediction Record Details - Historical Data",
        uploadedData: "Uploaded Data",
        predictionResults: "Prediction Results",
        loadingDetail: "Loading...",
        loadDetailFailed: "Failed to get detailed data",
        download: "Download",
        downloading: "Downloading...",
        downloadFile: "Download File",
        downloadFailed: "Download file failed",
        chartTitle: "Battery Capacity Change Chart"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "Failed to load history records",
        predictionFailed: "Prediction failed, please try again",
        uploadFailed: "File upload failed",
        fileFormatError: "File format not supported, please upload CSV or Excel file"
    },

    // Chart
    chart: {
        title: "Battery Capacity vs Cycle Count",
        cycleCount: "Cycle Number",
        capacity: "Capacity",
        capacityProcess: "Capacity degradation (uploaded data)",
        predictedCycleLife: "Predicted cycle number to reach 80% SOH",
        xAxisName: "Cycle Number",
        yAxisName: "Discharge Capacity",
        xAxisLabel: "Cycle ID",
        yAxisLabel: "Capacity Retention(%)",
        originalSoh: "Uploaded Value",
        originalSohUsed: "Uploaded Value (Used)",
        originalSohUnused: "Uploaded Value (Unused)",
        estimatedSoh: "Predicted Value",
        predictedCapacityLine: "Predicted Capacity Line",
        sohPredictionLine: "80% SOH Prediction Line",
        value: "Value",
        noData: "No Data"
    },

    // Detail
    detail: {
        actionTitle: "Prediction Details",
        loading: "Loading prediction details...",
        missingId: "Missing prediction ID parameter",
        fetchError: "Failed to fetch prediction details",
        downloadFailed: "Download file failed"
    },

    // Actions
    actions: {
        backToList: "Back to List",
        back: "Back",
        newPrediction: "New Prediction"
    },

    // Default Step
    default: {
        selectStep: "Please select operation step",
        selectStepDescription: "Please select the operation to execute from the steps above"
    },

    // Tutorial
    tutorial: {
        button: "Tutorial",
        modalTitle: "Tutorial Guide",
        imageCaption: 'Comparison between "Prediction Output" and Actual Cell Performance',
        point1: '"Predict" can predict cycle-life with the time-series data of the first 100 cycle.',
        point1_sub1: 'NCM811/12%Si.-Graphite with carbonate electrolyte',
        point1_sub2: '1C/1C cycling with 0.33C/0.33C capacity check every 100 cycles',
        point2: 'For general predictions, the accuracy is approximately ±15%. After fine-tuning the model for a specific battery system, the prediction accuracy can improve to approximately ±5% for that system.',
        point3: 'For a real cell with known cycle-life (1261 cycles based on the capacity retention of each cycle, or 1351 cycles based on the capacity retention of capacity check cycles), the model predicted EOL at the 1321 cycle.',
        point3_sub1: 'The prediction has a minor error of 4.7% or 2.2%, which is much better than simple linear extrapolation (800 cycles).',
        point4: 'The prediction has a minor error of 4.7% or 2.2%. Which is much better than simple linear extrapolation (800 cycles).'
    },

    // Introduction Page
    introduction: {
        title: "Introduction",
        paragraph1: "This tool predicts battery cycle life, defined as the number of cycles until discharge capacity retention reaches 80%, using an AI model trained on internal experimental datasets.",
        paragraph2: "Unlike traditional extrapolation methods, the model captures non-linear aging behavior and provides an early, data-driven estimate of end-of-life based on limited cycling information.",
        inputRequirement: {
            title: "Input Requirement",
            paragraph1: "Only data from the early cycles (for instance first 100 effective cycles) is required.",
            paragraph2: "Effective cycles represent normal aging behavior under the target operating conditions and exclude non-representative cycles, such as:",
            item1: "Diagnostic or capacity check (RPT) cycles",
            item2: "Long rest or low-rate test cycles",
            item3: "Cycles affected by experimental disturbances or abnormal capacity jumps"
        },
        applicability: {
            title: "Applicability",
            paragraph1: "The model is validated for battery systems in which cycle life is primarily governed by active ion inventory loss, including lithium-ion batteries, sodium-ion batteries, and anode-free batteries. For other electrochemical degradation mechanisms, such as active material loss or lithium plating, the model can provide estimates with reduced accuracy. Failure modes driven by mechanical factors, such as tab cracking or internal shorting, are outside the scope of the model and cannot be predicted."
        },
        predictionAccuracy: {
            title: "Prediction Accuracy",
            item1: "For general use without prior knowledge of the materials system, the typical prediction error is within ±15%.",
            item2: "After fine-tuning the model for a specific battery system, the error can be reduced to approximately ±5%."
        },
        example: {
            title: "Example",
            paragraph1: "In one example, the model-based prediction estimates the battery end-of-life at approximately 1308 cycles by capturing the evolving SOH degradation trend over time. Rather than assuming a constant fade rate, the prediction projects a non-linear aging behavior, resulting in a trajectory that is consistent with the measured SOH evolution. In this case, the model uses data up to the cycle indicated by the vertical red dashed line (around 130 cycles) and excludes abnormal cycles to establish a stable degradation trend for prediction. The actual end-of-life is observed at 1396 cycles (excluding capacity check cycles), corresponding to a prediction error of approximately 6.3%.",
            paragraph2: "If a simple linear extrapolation were applied instead, the lifetime would be underestimated at around 1000 cycles. This highlights the advantage of the prediction approach in providing a more accurate lifetime estimate."
        }
    },

    // Train
    train: {
        title: "Train New Model",
        back: "Back",
        step1: {
            title: "Model Information",
            name: "Model Name",
            namePlaceholder: "Enter model name",
            remarks: "Remarks",
            remarksPlaceholder: "Enter any additional notes or remarks"
        },
        step2: {
            title: "Base Model",
            modelName: "OSES-Base-v1",
            badge: "Base Model",
            loading: "Loading models...",
            noModels: "No base models available"
        },
        step3: {
            title: "Training Dataset",
            ratio: "Train-Test Split Ratio:",
            ratioValue: "7 : 3",
            ratioDesc: "70% of your dataset will be used for training, 30% for testing",
            upload: "Upload Dataset",
            uploadNote: "Upload data for at least 30 cells with each cell cycled to at least SOH=80%",
            dragDrop: "Drag and drop your file here, or click to browse",
            formats: "Supported formats: CSV, NDA, NDAX",
            dragDropMultiple: "Drag and drop your files here, or click to browse",
            formatsMultiple: "Supported formats: CSV, NDA, NDAX (up to {{max}} files)",
            chooseFile: "Choose File",
            chooseFiles: "Choose Files",
            downloadSample: "Download Sample",
            removeFile: "Remove file"
        },
        startTraining: "Start Training",
        errors: {
            fileFormat: "Unsupported file format",
            maxFiles: "Maximum {{max}} files allowed",
            duplicateFiles: "Some duplicate files were skipped",
            modelNameRequired: "Please enter model name",
            baseModelRequired: "Please select a base model",
            fileRequired: "Please upload training dataset",
            failed: "Failed to start training"
        },
        success: "Model training started successfully",
        submitting: "Submitting..."
    },

    // Models
    models: {
        loadingText: "Loading models...",
        error: "Error",
        noResults: "No models found.",
        showingRecords: "Showing {{count}} of {{total}} records",
        statusOnline: "Online",
        statusTrained: "Trained",
        statusTraining: "Training",
        statusOffline: "Offline",
        statusFail: "Failed",
        cannotDeleteDemo: "Cannot delete demo models",
        deleteConfirm: "Are you sure you want to delete this model?",
        deleteFailed: "Failed to delete model",
        loading: {
            error: "Failed to load models"
        },
        filters: {
            searchPlaceholder: "Search Model ID or Name...",
            statusPlaceholder: "Select Status",
            allStatus: "All Status",
            allBaseModels: "All Base Models",
            selectDate: "Select date",
            refresh: "Refresh",
            clearFilters: "Clear Filters"
        },
        columns: {
            modelId: "Model ID",
            modelName: "Model Name",
            baseModel: "Base Model",
            status: "Status",
            created: "Created Time",
            createdBy: "Created By",
            actions: "Actions"
        },
        actions: {
            viewDetails: "View Details",
            delete: "Delete"
        }
    },

    // Model Detail
    modelDetail: {
        title: "Model Information",
        modelId: "Model ID:",
        back: "Back",
        onlineModel: "Deploy Model",
        offlineModel: "Offline Model",
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
        trainingFiles: "Training Dataset",
        trainingMetrics: "Training Results",
        datasetName: "Dataset Name:",
        fileSize: "File Size:",
        totalSamples: "Total Samples:",
        ratio: "Train-Test Ratio:",
        trainingResults: "Training Results",
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
        predictionRecords: "Prediction Records",
        recordId: "ID",
        fileName: "File Name",
        batteryCount: "Battery Count",
        avgCycleLife: "Avg Cycle Life",
        actions: "Actions",
        viewDetails: "View Details",
        loadingText: "Loading...",
        noFiles: "No training files",
        noMetrics: "No training metrics",
        beforeTraining: "Before Training",
        afterTraining: "After Training",
        downloadingLog: "Downloading...",
        downloadTrainLog: "Download Train Log",
        downloadLogSuccess: "Train log downloaded successfully",
        downloadingFile: "Downloading file...",
        downloadFileSuccess: "File downloaded successfully",
        confirmDeploy: "Confirm Deploy",
        confirmUndeploy: "Confirm Undeploy",
        confirmRemove: "Confirm Remove",
        deployMessage: "Are you sure you want to deploy this model? This will make it available for predictions.",
        undeployMessage: "Are you sure you want to undeploy this model? This will make it offline.",
        removeMessage: "Are you sure you want to remove this model? This action cannot be undone.",
        cancel: "Cancel",
        confirm: "Confirm",
        deploySuccess: "Model deployed successfully",
        undeploySuccess: "Model undeployed successfully",
        removeSuccess: "Model removed successfully",
        errors: {
            noId: "Model ID is required",
            fetchFailed: "Failed to fetch model details",
            actionFailed: "Action failed",
            mockModel: "Cannot modify demo model",
            notFound: "Model not found",
            downloadLogFailed: "Failed to download train log"
        },
        metricsInfo: {
            rmse: {
                name: "Root Mean Square Error",
                description: "ŷᵢ represents predicted cycles, yᵢ represents actual cycles, N represents test set sample size"
            },
            mae: {
                name: "Mean Absolute Error",
                description: "ŷᵢ represents predicted cycles, yᵢ represents actual cycles, N represents test set sample size"
            },
            mape: {
                name: "Mean Absolute Percentage Error",
                description: "ŷᵢ represents predicted cycles, yᵢ represents actual cycles, N represents test set sample size"
            },
            predictedValue: "Predicted Cycles",
            actualValue: "Actual Cycles",
            sampleSize: "Test Set Sample Size"
        }
    },

    // Train disabled tip
    trainDisabledTip: "For usage, please contact our team via email <emailLink>mu.sales@ses.ai</emailLink>."
};