export default {
  title: 'Salt & Solvent Configuration',
  subtitle: 'Configure and customize your electrolytes',
  comingSoon: 'To be launched in MU1.5',
  tabs: {
    introduction: 'Introduction',
    records: 'Records'
  },
  actions: {
    backToList: 'Back to List'
  },
  create: {
    newConfiguration: 'New Configuration'
  },

  saltConfiguration: {
    title: 'Salt Configuration'
  },

  cationSelection: {
    label: 'Cation Selection'
  },

  anionSelection: {
    label: 'Anion Selection (Select 1-2)'
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
    title: 'Solvent Configuration'
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
    calculating: 'validating inputs, prepare calculations…'
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
      viewDetails: 'View Details',
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
      concentration: 'Concentration',
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
    SSIPTitle: 'SSIP:Solvent-Separated lon Pair*The cation and anion are associated, but not in direct contact."Instead, one or more solvent molecules sit between them."Typical in moderately polar solvents, where solvation shells keeplons apart, but eleetrostatic correlation remains.Example: Li*-(solvent)-PF.',
    CIPTitle: 'CIP: Contact lon Pair One cation and one anion are directly in contact, sharing no interceptingsolvent molecules.Common in low-dielectric solvents or at high salt concentration.Strongerassoclation than sSIPExample: Li.PF, directly touching.',
    AGGTitle: 'AGG: lon Aggregate "Largerassoclated structures involving direct contact of more than twocations and anions in combination.Can be dimers, trimers, orlarger clusters.Often appearat high concentration, poor solvent, or in ionic liquids.*Example: (Li* PF.),cluster, or Li* bridging multiple anions.'
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


