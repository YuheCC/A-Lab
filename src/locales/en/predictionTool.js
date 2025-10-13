export default {
    // Header
    title: "Upload early cycle data for life prediction",
    subtitle: "Predict cycle life (number of cycles when discharge capacity retention reaches 80%) with an AI model trained on internal experimental data. Only the first 100 cycles (effective cycle so the real number may be higher) are needed. The prediction is accurate for battery systems  with limited active ion inventories, such as Li-ion, Na-ion, or anode free batteries.",
    betaTag: "BETA",
    disclaimerTitle: "Disclaimer",
    disclaimer: "This function predicts cell cycle life based on early-stage cycling data provided by the user. It is currently applicable only to specific cell types and standard cycling conditions. Users are advised to validate the predictions with their own testing.",

    // Steps
    steps: {
        upload: "Data Upload",
        aiPredict: "AI Prediction",
        results: "Results Display"
    },

    // Upload Step
    upload: {
        selectFile: "Select File",
        clickToUpload: "Click to upload battery data file",
        subtitle: "Currently only supports CSV format files, more file types will be supported in the future",
        uploading: "Uploading file...",
        waitText: "Please wait",
        dataFormatTip: "📋 Data Format Requirements",
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

    // History
    history: {
        title: "Prediction Records",
        newPrediction: "New Prediction",
        searchPlaceholder: "Search by file name...",
        loading: "Loading...",
        deleteConfirm: "Are you sure you want to delete this record?",
        deleteSuccess: "Delete successful",
        deleteFailed: "Delete failed",
        view: "View",
        delete: "Delete"
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
        capacityProcess: "Capacity degradation (uploaded data)",
        predictedCycleLife: "Predicted cycle number to reach 80% SOH",
        xAxisName: "Cycle Number",
        yAxisName: "Discharge Capacity"
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
        point2: 'For Li-ion batteries, the prediction accuracy can achieve ±5%.',
        point3: 'For a real cell with known cycle-life, the model predicted EOL at the 1321 cycle.',
        point3_sub1: 'The ground truth is 1261 cycles (based on the capacity retention of each cycle) or 1351 cycles (based on the capacity retention of capacity check cycles).',
        point4: 'The prediction has a minor error of 4.7% or 2.2%. Which is much better than simple linear extrapolation (800 cycles).'
    }
};