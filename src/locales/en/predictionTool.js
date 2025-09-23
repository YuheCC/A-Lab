export default {
    // Header
    title: "Battery Life Prediction",
    betaTag: "BETA",

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
        noDetailedData: "No detailed barcode data available"
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
        loadDetailFailed: "Failed to get detailed data"
    },

    // Error Messages
    errors: {
        loadHistoryFailed: "Failed to load history records",
        predictionFailed: "Prediction failed, please try again",
        uploadFailed: "File upload failed",
        fileFormatError: "File format not supported, please upload CSV or Excel file"
    },

    // Default Step
    default: {
        selectStep: "Please select operation step",
        selectStepDescription: "Please select the operation to execute from the steps above"
    }
};