export default {
    // Introduction
    introduction: {
        overview: '"Design" provides a semi-quantitative reference for how new electrolyte molecules may influence cell performance.',
        modelDescription: 'The Design function is powered by a data-driven AI model trained on SES internal cell-testing datasets, all generated under consistent testing environments and benchmark conditions. This ensures high data quality and enables the AI model to achieve strong predictive accuracy.',
        predictionProcess: 'During prediction, the model compares the performance of a benchmark cell with that of a hypothetical cell that has the same design but incorporates a new electrolyte additive (as specified by the user). The reported percentage changes are derived from SES internal testing platforms and conditions.',
        example: 'For example, when the molecule O=C1OC(C2COS(=O)(=O)O2)C(C2COS(=O)(=O)O2)O1 is evaluated, the system displays molecular information if it exists in the MU database. The prediction results then appear, where arrows indicate the direction of the impact and percentages are based on SES internal testing platforms. In this case, the model predicts that the new electrolyte additive positively affects room-temperature cycle life and Coulombic efficiency, but may slightly reduce rate performance, likely due to the formation of a more stable SEI.',
        figureAlt: 'Example of predicting a molecule on the cell performance by Design model',
        figureCaption: 'Figure. Example of predicting a molecule on the cell performance by Design model',
        accuracy: 'Based on internal validation, the current model achieves approximately 85% directional accuracy, meaning it can correctly judge the impact of about 8 out of 10 previously unseen molecules under defined conditions.',
        supportedSystems: 'The current Design module supports the NCM811 – 12% Si/graphite – carbonate electrolyte system, with predictions available for room-temperature cycling, 45 °C cycling, and room-temperature rate performance. Additional cell systems and testing conditions will be incorporated in future updates.'
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
        statusTraining: "Training",
        created: "Created:",
        remarks: "Remarks:",
        baseModel: "Base Model",
        trainingDataset: "Training Dataset",
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
        designRecords: "Design Records",
        recordId: "Record ID",
        smiles: "SMILES",
        temp25Count: "25°C Positive",
        temp45Count: "45°C Positive",
        actions: "Actions",
        viewDetails: "View Details"
    }
};
