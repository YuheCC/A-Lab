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
    // Model
    model: {
        toLaunchInMU2: '(to be launched in MU2)'
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
            cellDesignPlaceholder: '4/5 layer pouch cell, 1.07 NP ratio, 1 Ah capacity',
            // Note: Keep professional terms in original English
            solventPlaceholder: 'EC/EMC/DEC',
            saltPlaceholder: '1M LiPF6/LiFSI',
            additivePlaceholder: 'VC/LiDFP'
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
        f1ScoreTooltip: {
            description: "The harmonic mean of precision and recall. It balances the trade-off between them.",
            precision: "Precision",
            recall: "Recall"
        },
        aucTooltip: {
            description: "Specifically refers to the Area Under the ROC Curve. It measures the model's ability to distinguish between classes. A higher AUC indicates better classification performance."
        },
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
    // History
    history: {
        newDesign: "New Design",
        train: "Train",
        loadingText: "Loading...",
        error: "Error",
        noResults: "No design records found",
        deleteConfirm: "Are you sure you want to delete this record?",
        deleteFailed: "Failed to delete record",
        loading: {
            error: "Failed to load history"
        },
        actions: {
            viewResults: "View Results",
            delete: "Delete"
        }
    },
    // Actions
    actions: {
        backToList: "Back to List",
        back: "Back",
        newDesign: "New Design",
        newPrediction: "New Prediction",
        download: "Download"
    },
    // Tabs
    tabs: {
        introduction: "Introduction",
        records: "Records",
        models: "Models"
    },
    // Models
    models: {
        loadingText: "Loading...",
        loadingError: "Failed to load models",
        error: "Error",
        deleteConfirm: "Are you sure you want to delete this model?",
        deleteFailed: "Failed to delete model",
        actions: {
            delete: "Delete"
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
    },
    // Electrolyte Module
    electrolyte: {
        features: {
            newDesign: {
                description: "Create a new electrolyte design"
            },
            train: {
                description: "Train your custom model"
            }
        }
    },
    // Electrode Module
    electrode: {
        title: "Impact of electrode on cell performances",
        // Material Description (shared across electrode pages)
        materialDescription: {
            title: "Description for SiC",
            silicon: "Silicon (Si):",
            carbon: "Carbon (C):",
            description: "This Si-C composite exhibits a delithiation capacity of up to 1937.9 mAh/g with an initial coulombic efficiency (ICE) of 93.8%. The D50 particle size is controlled at 8.58 μm, with a tap density of 0.79 g/cm³."
        },
        subtitle: "A data-driven AI model designed to predict, analyze, and optimize the impact of electrode materials on cell performance. The model supports trend analysis and inverse design for both materials and cells, and can be fine-tuned using customer-provided datasets for specialized battery research and development.",
        features: {
            resultPrediction: {
                title: "Performance Prediction",
                description: "Predict cell performance"
            },
            trendAnalysis: {
                title: "Trend Analysis",
                description: "Predict parameter trends"
            },
            optimize: {
                title: "Inverse Design",
                description: "Optimize electrode parameters",
                disabledTip: "To be launched in MU2"
            },
            train: {
                title: "Train",
                description: "Train your custom model"
            }
        },
        tabs: {
            introduction: "Introduction",
            records: "Records",
            models: "Models"
        },
        introduction: {
            overview: "The electrode module includes four main functions:",
            function1: "1. Result Prediction: Predict battery performance based on electrode material selection and parameter settings",
            function2: "2. Trend Analysis: Preset electrode formulation information, set one or more parameters as variables, and predict how battery performance changes as these parameters vary",
            function3: "3. Optimize: By defining target battery performance metrics, reverse-engineer and recommend appropriate electrode material selections and parameters",
            function4: "4. Train: Enable users to train custom models",
            // New detailed introduction content
            resultPrediction: {
                title: "1. Performance prediction",
                description1: "Performance prediction delivers data-driven predictions of cell-level performance including jelly roll thickness, volumetric energy density (Wh/L), gravimetric specific energy (Wh/kg), rate capability, and cycle life (future development)—based on electrode material choices and formulation parameters within a defined cell design.",
                description2: "Powered by AI models trained on SES's proprietary experimental database, this function enables rapid and scalable evaluation of specific design configurations without requiring physical prototyping. It allows engineers to assess the expected performance outcomes of a given cell design and formulation, supporting efficient screening and comparison of candidate designs.",
                exampleTitle: "Example",
                example: "Predict capacity, volumetric energy density (Wh/L), gravimetric specific energy (Wh/kg), and jelly roll thickness for a given cell design combined with a specific cathode and anode formulation.",
                image1Caption: "Electrode Design",
                image2Caption: "Performance Prediction"
            },
            inverseDesign: {
                title: "2. Inverse Design",
                description1: "Inverse Design automatically generates potential formulations of electrode materials that satisfy user-defined performance targets. Rather than manually iterating through the design space, this function generates within realistic physical and manufacturing constraints to identify valid design candidates. This approach supports multi-objective decision-making by revealing trade-offs between cell design and performance, while avoiding solutions that are impractical or unstable.",
                description2: "",
                exampleTitle: "Example",
                example: "Design an electrode formulation that enables a cell capacity between 2.6-4.6 Ah and can achieves at least 290 Wh/kg and 960 Wh/L.",
                image1Caption: "Target Setting",
                image2Caption: "Design Recommendations",
                image3Caption: "Design Details"
            }
        },
        predict: {
            title: "Performance Prediction",
            back: "Back",
            electrodeDesign: "Electrode Design",
            cellDesign: "Cell Type",    
            selectCellDesign: "Select cell type",
            anodeActiveMaterial: "Anode Active Material",
            cathodeActiveMaterial: "Cathode Active Material",
            selectMaterial: "Select material",
            anodeParameters: "Anode Parameters",
            cathodeParameters: "Cathode Parameters",
            binder1: "Binder 1 (wt.%)",
            binder2: "Binder 2 (wt.%)",
            binder3: "Binder 3 (wt.%)",
            conductiveCarbon: "Conductive Carbon (wt.%)",
            cnt: "CNT (wt.%)",
            pressDensity: "Press Density (g/cc)",
            arealLoading: "Areal Loading (mAh/cm²)",
            dimension: "Cathode Dimensions",
            width: "Width (mm)",
            length: "Length (mm)",
            layers: "Layers",
            enterWidth: "Enter width",
            enterLength: "Enter length",
            enterLayers: "Enter layers",
            calculate: "Calculate",
            cellPerformance: "Cell Performance Prediction",
            designCapacity: "Design Capacity",
            specificED: "Gravimetric Energy Density",
            specificEDTooltip: "Energy density calculated based on total cell mass, including pouch materials, electrolyte, and auxiliary inactive components. Electrolyte loading is ~41% excessive relative to the active area.",
            jellyRollThickness: "Jelly Roll Thickness",
            volumetricED: "Volumetric Energy Density",
            volumetricEDTooltip: "Energy density calculated based on the jelly roll volume.",
            calculateError: "Failed to calculate prediction",
            npRatio: "NP Ratio",
            enterNpRatio: "Enter NP ratio (1.05 - 1.2)",
            anodeActiveMaterialGraphite: "Weight Percentage (%) of Graphite in the Anode Active Material (Graphite + SiC)",
            enterGraphitePercent: "Enter graphite content (85 - 100)",
            activeMaterial1: "Active Material SiC (wt.%)",
            activeMaterial2: "Active Material Graphite (wt.%)",
            anodeArealLoading: "Areal Loading (mAh/cm²)",
            cathodeActiveMaterialLabel: "Active Material (wt.%)",
            kf9700: "Polyvinylidene Fluoride (PVDF) (wt.%)",
            cn01y: "Carbon Nano Tube (CNT) (wt.%)",
            superC65: "Carbon Black (wt.%)",
            cmc: "Carboxymethyl Cellulose (CMC) (wt.%)",
            sbr: "Styrene-Butadiene Rubber (SBR) (wt.%)",
            paa: "Poly(acrylic acid) (PAA) (wt.%)",
            superP: "Carbon Black (wt.%)",
            swcnt: "Carbon Nano Tube (CNT) (wt.%)",
            rateCapability: "Rate Capability (1C-5C)",
            cRate: "Rate",
            capacityRetention: "Capacity Retention",
            capacityRetentionAxis: "Capacity Retention (%)",
            temperature: "Temperature",
            temperatureAxis: "Temperature (°C)",
            electrolyteParameters: "Electrolyte Parameters",
            electrolyteContent: "Electrolyte Content (g/Ah)"
        },
        optimize: {
            title: "Inverse Design",
            back: "Back",
            performanceTargets: "Performance Targets",
            cellInformation: "Cell Information",
            cellType: "Cell Type",
            selectCellDesign: "Select a cell design",
            npRatio: "NP Ratio",
            anodeActiveMaterial: "Anode Active Material",
            cathodeActiveMaterial: "Cathode Active Material",
            selectMaterial: "Select an anode material",
            cathodeDimension: "Cathode Dimensions",
            width: "Width (mm)",
            length: "Length (mm)",
            layers: "Layers",
            enterWidth: "Enter width",
            enterLength: "Enter length",
            enterLayers: "Enter layers",
            targets: "Targets",
            designCapacity: "Design Capacity",
            specificEnergy: "Gravimetric Energy Density",
            jellyRollThickness: "Jelly Roll Thickness",
            volumetricEnergyDensity: "Volumetric Energy Density",
            calculate: "Calculate",
            designRecommendations: "Design Recommendations",
            trendChartTitle: "Recommendation Trend Chart",
            xAxisLabel: "X-Axis",
            yAxisLabel: "Y-Axis",
            yAxisMaxTwo: "Y-axis supports up to 2 selections",
            trendChartEmpty: "No data available for trend chart",
            no: "No.",
            actions: "Actions",
            details: "Details",
            designDetails: "Design Details",
            cathodeParameters: "Cathode Parameters",
            anodeParameters: "Anode Parameters",
            messages: {
                fillAllFields: "Please fill in all required fields",
                fillAllDimensions: "Please fill in all dimension parameters",
                calculateSuccess: "Recommendations calculated successfully",
                calculateError: "Failed to calculate recommendations",
                loadDetailsError: "Failed to load design details"
            },
            additionalPrompt: "Would you like to view other recommendations? (Target values may have slight deviations)",
            additionalRecommendations: "Additional Recommendations (with slight deviations)",
            expand: "Expand",
            collapse: "Collapse",
            emptyState: {
                title: "No Matching Designs Found",
                description: "We couldn't find any designs that match your current criteria. Try adjusting your target values.",
                descriptionWithRecommendation: "We couldn't find any designs that match your current criteria. Try adjusting your target values or check out other recommendations below."
            }
        },
        records: {
            resultPrediction: "Performance Prediction",
            trendAnalysis: "Trend Analysis",
            inverseDesign: "Inverse Design",
            searchPlaceholder: "Search record ID",
            selectDate: "Select Date",
            showing: "Showing {{count}} of {{total}} records",
            refresh: "Refresh",
            reset: "Reset",
            recordId: "Record ID",
            cellDesign: "Cell Type",
            cathode: "Cathode Active Material",
            anode: "Anode Active Material- Graphite Content (%)",
            createdTime: "Created Time",
            actions: "Actions",
            viewResults: "View Results",
            delete: "Delete",
            deleteConfirm: "Are you sure you want to delete this record?",
            deleteSuccess: "Record deleted successfully",
            deleteError: "Failed to delete record",
            loadError: "Failed to load records",
            noRecords: "No records found."
        },
        validation: {
            parameterRange: "{{label}} must be between {{min}} and {{max}}",
            selectCathodeMaterial: "Please select cathode active material",
            selectAnodeMaterial: "Please select anode active material",
            cathodeConductiveSum: "The sum of Carbon Black + CNT must be greater than 0.8",
            cmcGreaterThanSwcnt: "CMC must be greater than CNT",
            anodeConductiveSum: "The sum of Carbon Black + CNT must be greater than 0.005",
            fillAllDimensions: "Please fill in all dimension parameters",
            ratioSmallWidth: "For widths not exceeding 100, the aspect ratio must range from 0.2 to 1.",
            ratioLargeWidth: "For widths between 100 and 1000, the aspect ratio must be maintained between 0.1 and 0.5.",
            npRatioRequired: "NP Ratio is required",
            npRatioRange: "NP Ratio must be between 1.05 and 1.2",
            graphitePercentRange: "Graphite content must be an integer between 85 and 100"
        }
    }
};
