export default {
  title: 'Salt & Solvent Configuration',
  subtitle: 'Configure and customize your electrolytes',
  comingSoon: 'to be launched in MU2',
  comingSoon2: 'to be launched in MU2',
  tabs: {
    introduction: 'Introduction',
    records: 'Records'
  },
  introductionNew: {
    functionIntroTitle: 'Function Introduction',
    functionIntroDescription:
      "Molecular dynamics (MD) simulations in MU's platform uniquely combine advanced polarizable force fields with an automated workflow, capturing ion–solvent interactions with high fidelity. Users simply submit desired electrolyte formulations through the MU portal containing any known or unknown molecules, and within days will receive quantitative predictions of key properties—delivering faster and more accurate insights than conventional trial-and-error or classical modeling approaches.",
    functionIntroImageAlt: 'MD simulation workflow',
    functionIntroCaption: 'Our proprietary Molecular Dynamics (MD) service for electrolyte formulation',
    benefitsParagraph1:
      "MU's proprietary MD service provides molecular-level snapshots of electrolyte formulations, capturing how Li⁺, anions, and solvent molecules organize at different salt concentrations.",
    benefitsParagraph2:
      'Each standard simulation run completes in ~3 days depending on the complexity of the formulation, after which customers receive quantitative property predictions—delivering fast and reliable insights to guide electrolyte design and optimization, which saves tremendous cost and time.',
    benefitsImageAlt: 'MD simulation across concentrations',
    benefitsImageCaption: 'Accelerating electrolyte design with MD simulations across concentrations',
    propertiesIntroTitle: 'Properties Introduction',
    propertiesIntroNoteDescription:
      'Properties listed as Standard Properties will be available in about 3 days as soon as the MD simulations are complete. For other properties, please contact our team.',
    propertiesIntroNoteButton: 'Contact Team',
    groupStandardProperties: 'Standard Properties',
    standardRdfTitle: 'Radial distribution function (RDF)',
    standardRdfDescription:
      'Probability of finding a particle at a given distance from a reference particle. RDF describes local structure of electrolytes, which directly impacts solubility, miscibility, ion conductivity, solvation structure and interphases.',
    standardCnTitle: 'Coordination number (CN)',
    standardCnDescription:
      'Average number of neighboring atoms/molecules surrounding a central ion. This has impact on conductivity, solubility and interphases.',
    standardSolvationClusterTitle: 'Solvation cluster analysis',
    standardSolvationClusterDescription: 'Analyzes how cations and anions associate in electrolyte solutions. Three major cluster types:',
    standardSolvationClusterSsipBadge: 'SSIP',
    standardSolvationClusterSsipName: 'Solvent-Separated Ion Pair',
    standardSolvationClusterSsipDescription:
      'Cation-anion associated but with at least one solvent molecule sits between them. Such species prevail in high-dielectric solvents; supports higher Li⁺ mobility and typically higher conductivity.',
    standardSolvationClusterCipBadge: 'CIP',
    standardSolvationClusterCipName: 'Contact Ion Pair',
    standardSolvationClusterCipDescription:
      'Cation–anion forms direct contact with no solvent molecules in between. Such species are more common at higher salt concentration or in solvents of low dielectric constants; their existence can slow down ion transport, leading to typically lower conductivity.',
    standardSolvationClusterAggBadge: 'AGG',
    standardSolvationClusterAggName: 'Aggregate',
    standardSolvationClusterAggDescription:
      'Larger clusters with multiple cations/anions linked together. Dominant in concentrated electrolytes; often reduces conductivity.',
    standardSolvationClusterImageAlt: 'Representative Li solvate clusters',
    standardSolvationClusterImageCaption: 'Representative Li solvate clusters',
    standardSolvationClusterSummary:
      'The fraction of SSIP/CIP/AGG provides a structural descriptor linking solvation environment to viscosity, and Li⁺ transport behavior such as ion conductivity, transference number.',
    standardDiffusivityTitle: 'Diffusivity',
    standardDiffusivityDescription:
      'Rate at which particles move randomly in the absence of an electric field, closely related to migration properties like mobility.',
    standardConductivityTitle: 'Conductivity',
    standardConductivityDescription:
      'Ability of ions or other charged particles to carry charges through a medium under the action of electric field. Benchmark of predicted ionic conductivity against experimental values can be seen in the following figure.',
    standardConductivityImageAlt: 'MD Simulation Accuracy',
    standardConductivityImageCaption: 'MD Simulation Accuracy: Predicted vs. Measured Ionic Conductivity',
    standardConductivityImageDescription1:
      'Our molecular dynamics simulations (blue points) show excellent agreement with experimental ionic conductivity measurements across more than 100 electrolyte formulations spanning 0–40 mS cm⁻¹. The benchmark includes a wide variety of common and novel solvents— sulfone, sulfite, ether, ester, carbonate, nitrile, siloxane, borate, phosphate ester.',
    standardConductivityImageDescription2:
      "In contrast, the external machine-learning force field (MLFF, open circles) has been benchmarked only on a small subset of carbonate systems. Our force field achieves accuracy on par with, and in many cases exceeding, the MLFF in those carbonate systems, while also demonstrating high predictive power across a far broader chemical space where the MLFF's performance remains untested.",
    standardConductivityImageDescription3:
      'Points lying near the black diagonal (y = x) confirm the reliability of our simulation-based screening before synthesis.',
    standardViscosityTitle: 'Viscosity',
    standardViscosityDescription: 'Resistance of a fluid to flow or deformation under shear stress.',
    standardDensityTitle: 'Density',
    standardDensityDescription: 'Mass per unit volume, reflecting system compactness.',
    groupAdvancedAnalysis: 'Advanced Analysis',
    advancedIonCorrelationTitle: 'Ion–ion correlation',
    advancedIonCorrelationDescription: 'Measure of how ionic species are correlated beyond random distribution.',
    advancedStructureFactorTitle: 'Structure factor (S(q))',
    advancedStructureFactorDescription: 'Quantifies how atomic arrangements scatter radiation, revealing ordering in reciprocal space.',
    advancedDynamicStructureFactorTitle: 'Dynamic structure factor (S(q,ω))',
    advancedDynamicStructureFactorDescription: 'Function describing the space-time correlations of particles.',
    advancedResidenceTimeTitle: 'Residence time',
    advancedResidenceTimeDescription: 'Average time an ion/molecule stays bound or in the vicinity of another species.',
    groupCustomStudies: 'Custom Studies',
    customEdlTitle: 'EDL (Electric Double Layer)',
    customEdlDescription:
      'Structured region of ions near a charged surface or electrode. Inferring the formation of SEI compound and redox reactions.',
    customEdlImageAlt: 'Electric Double Layer',
    customEdlImageCaption:
      'Electric double layer structure under well-controlled electrostatic potential. In this snapshot of MD simulation, electrolyte of given formulation from the user is placed between two electrodes. By mimicking the potential change across the virtual cell, surface structure under electrostatic potential can be visualized, whose chemical distribution predetermines the eventual interphasial chemistries.',
    customSolubilityTitle: 'Solubility',
    customSolubilityDescription:
      'Maximum amount of a salt or a molecular species that can be homogenously distributed (i.e., dissolved or blended) in a given medium under equilibrium conditions.',
    customSolubilityImageAlt: 'Solubility Prediction',
    customSolubilityImageCaption:
      'Our MD simulations accurately predict the solubility of a typical lithium salt LiFSI in 19 solvents of diverse chemical structures and functional groups. Points close to the diagonal line indicate high prediction accuracy, giving you confidence in simulation-based screening before synthesis.',
    standardSolvationClusterTableName: 'Solvation cluster type and fraction analysis',
    table: {
      headers: {
        no: 'No.',
        property: 'Property',
        type: 'Type',
        group: 'Group',
        estimatedTime: 'Estimated Time'
      },
      types: {
        structural: 'Structural',
        dynamic: 'Dynamic',
        structuralDynamic: 'Structural + Dynamic',
        thermodynamic: 'Thermodynamic'
      },
      estimatedTimes: {
        short: '3 Days',
        medium: '1 Week',
        long: '1-2 Weeks'
      }
    }
  },
  actions: {
    backToList: 'Back to List'
  },
  create: {
    newConfiguration: 'New Configuration'
  },

  saltConfiguration: {
    title: 'Salts Configuration'
  },

  cationSelection: {
    label: 'Cation Selection'
  },

  anionSelection: {
    label: 'Anion Selection (Max 2)'
  },

  totalSaltConcentration: {
    label: 'Total Salt Concentration (mol/kg)'
  },

  anionFraction: {
    label: 'BF₄⁻ Fraction'
  },

  fractionType: {
    label: 'Fraction Type',
    mole: 'Mole fraction',
    weight: 'Weight fraction'
  },

  saltSummary: {
    title: 'Salt Summary',
    selected: 'Selected',
    totalConcentration: 'Total salt concentration',
    fractions: 'Fractions',
    fractionType: 'Fraction type',
    totalFraction: 'Total fraction'
  },

  solventConfiguration: {
    title: 'Solvents Configuration'
  },

  smilesString: {
    label: 'SMILES String',
    placeholder: 'Enter SMILES string'
  },

  fraction: {
    label: 'Fraction (min: 0.05)'
  },

  removeSolvent: 'Remove solvent',
  addSmiles: 'Add SMILES (Max 3)',

  solventSummary: {
    title: 'Solvent Summary',
    solvent: 'Solvent',
    fractionType: 'Fraction type',
    totalFraction: 'Total fraction',
    emptyPlaceholder: 'Empty (0), Empty (0)'
  },

  submit: {
    button: 'Submit Configuration'
  },

  ui: {
    calculating: 'validating inputs, prepare calculations'
  },

  result: {
    processing: 'Algorithm Model Computing',
    description: 'System is processing your model parameters, this may take a while, please be patient',
    notice: 'The system will automatically send you a notification when model training is complete',
    action: 'You can close this page, it will not affect the background calculation process',
    close: 'Back to Configuration'
  },
  resultTip: {
    close: 'Close'
  },

  tip: {
    calculating: 'Computing',
    calculatingDesc: 'MD simulation using polarizable force field is time consuming. The system will notify you regarding the job status.',
    notice2: 'You can close this page without affecting the background calculation process'
  },
  history: {
    title: 'Analysis Records',
    newAnalysis: 'New Analysis',
    loading: {
      message: 'Loading...',
      error: 'Error'
    },
    noResults: {
      message: 'No analysis records found.'
    },
    salt: 'Salt',
    solvent: 'Solvent',
    unit: {
      molPerKg: 'mol/kg'
    },
    actions: {
      viewDetails: 'View Result',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this record?',
      deleteFailed: 'Failed to delete record'
    }
  },
  list: {
    columns: {
      analysisId: 'Analysis ID',
      saltFraction: 'Salt (Fraction)',
      saltFractionType: 'Fraction Type (Salt)',
      solventFraction: 'Solvent (Fraction)',
      solventFractionType: 'Fraction Type (Solvent)',
      concentration: 'Salt Concentration',
      created: 'Created',
      status: 'Status',
      actions: 'Actions'
    }
  },

  status: {
    completed: 'Completed',
    success: 'Completed',
    running: 'Running',
    failed: 'Failed',
    pending: 'Pending'
  },
  results: {
    analysisResults: 'Analysis Results',
    systemProperties: 'System Properties',
    clusterAnalysis: 'Solvation Cluster Type and Fraction Analysis',
    size: 'Number of Anions in the First Solvation Cluster',
    category: 'Category',
    fraction: 'Fraction',
    analysisCharts: 'Analysis Charts',
    radialDistribution: 'Radial Distribution Function and Coordination Number',
    radialDistributionSubtitle: 'Radial Distribution Function and Coordination Number',
    meanSquareDisplacement: 'Mean Square Displacement',
    meanSquareDisplacementSubtitle: 'Mean Square Displacement',
    chartPlaceholder: 'Chart placeholder',
    analysisFile: 'Analysis File',
    downloadDescription: 'Download the complete analysis results in JSON format',
    fileContains: 'File contains configuration details, analysis parameters, and computed results',
    downloadJSON: 'Download JSON',
    density: 'Density (g/cm³)',
    viscosity: 'Viscosity (cP)',
    conductivity: 'Conductivity (mS/cm)',
    diffusionCoefficient: 'Diffusion Coefficient (Unit: 10⁻¹⁰ m²/second) for all species',
    species: 'Species',
    coefficient: 'Diffusion Coefficient (×10⁻¹⁰ m²/s)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG',
    SSIPTitle: 'Solvent-Separated Ion Pair',
    CIPTitle: 'Contact Ion Pair',
    AGGTitle: 'Ion Aggregate'
  },
  guide: {
    help: 'Help',
    close: 'Close'
  },
  detail: {
    title: 'Analysis Results',
    viewSubtitle: 'View detailed analysis results',
    viewSubtitleWithId: 'View detailed analysis results',
    actionTitle: 'Analysis Details',
    loading: 'Loading analysis details...',
    missingId: 'Missing analysis ID parameter',
    fetchError: 'Failed to fetch analysis details',
    configuration: 'Configuration',
    saltSolventConfig: 'Salt & Solvent Configuration',
    saltSummary: 'Salt Summary',
    solventSummary: 'Solvent Summary',
    selected: 'Selected',
    weightConcentration: 'Weight concentration',
    fractions: 'Fractions:',
    fractionType: 'Fraction type:',
    totalFraction: 'Total fraction:',
    solvent: 'Solvent:',
    weightFraction: 'Weight fraction',
    analysisResults: 'Analysis Results',
    systemProperties: 'System Properties',
    clusterAnalysis: 'Solvation Cluster Type and Fraction Analysis',
    size: 'Number of Anions in the First Solvation Cluster',
    category: 'Category',
    fraction: 'Fraction',
    analysisCharts: 'Analysis Charts',
    radialDistribution: 'Radial Distribution Function and Coordination Number',
    radialDistributionSubtitle: 'Radial Distribution Function and Coordination Number',
    meanSquareDisplacement: 'Mean Square Displacement',
    meanSquareDisplacementSubtitle: 'Mean Square Displacement',
    chartPlaceholder: 'Chart placeholder',
    analysisFile: 'Analysis File',
    downloadDescription: 'Download the complete analysis results in JSON format',
    fileContains: 'File contains configuration details, analysis parameters, and computed results',
    downloadJSON: 'Download JSON',
    density: 'Density (g/cm³)',
    viscosity: 'Viscosity (cP)',
    conductivity: 'Conductivity (mS/cm)',
    SSIP: 'SSIP',
    CIP: 'CIP',
    AGG: 'AGG',
    SSIPTitle: 'SSIP:Solvent-Separated lon Pair*The cation and anion are associated, but not in direct contact."Instead, one or more solvent molecules sit between them."Typical in moderately polar solvents, where solvation shells keeplons apart, but eleetrostatic correlation remains.Example: Li*-(solvent)-PF.',
    CIPTitle: 'CIP: Contact lon Pair One cation and one anion are directly in contact, sharing no interceptingsolvent molecules.Common in low-dielectric solvents or at high salt concentration.Strongerassoclation than sSIPExample: Li.PF, directly touching.',
    AGGTitle: 'AGG: lon Aggregate "Largerassoclated structures involving direct contact of more than twocations and anions in combination.Can be dimers, trimers, orlarger clusters.Often appearat high concentration, poor solvent, or in ionic liquids.*Example: (Li* PF.),cluster, or Li* bridging multiple anions.'
  }
};


