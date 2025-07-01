export default {
  analyzeSelected: 'Analyze Selected',
  analyzeMolecules: 'Analyze Molecules',
  
  // Loading and Error States
  loadingMessage: 'Loading your favorite molecules...',
  errorLoadingFavorites: 'Error loading favorites',
  tryAgain: 'Try Again',
  
  // No Favorites State
  noFavoriteMolecules: 'No Favorite Molecules',
  noFavoritesMessage: 'You haven\'t added any molecules to your favorites yet.',
  goToSearchPage: 'Go to the Search page to find and add molecules.',
  search: 'Search',
  
  // Analysis Tabs
  radarTab: 'Radar',
  espTab: 'ESP',
  moTab: 'MO',
  
  // Search and Table
  searchPlaceholder: 'Search molecules...',
  loadingImage: 'Loading...',
  
  // Table Headers
  tableHeaders: {
    image: 'Image',
    smiles: 'SMILES',
    molecularWeight: 'Molecular Weight',
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: 'MP (°C)',
    boilingPoint: 'BP (°C)',
    flashPoint: 'Predicted Flash Point (°C)',
    combustionEnthalpy: 'Combustion Enthalpy (eV)',
    commercialViability: 'Commercial Viability',
    espMin: 'ESP Min (eV)',
    espMax: 'ESP Max (eV)',
    functionalGroups: 'Functional Groups',
    umapCoordinates: 'UMAP X/Y',
    addedDate: 'Added Date',
    commercialLink: 'Commercial Link',
    actions: 'Actions'
  },
  
  // Bulk Operations
  bulkDelete: 'Delete Selected',
  bulkDeleting: 'Deleting...',
  bulkDeleteConfirm: 'Are you sure you want to remove {{count}} molecules from your favorites? This action cannot be undone.',
  bulkDeleteSuccess: 'Successfully removed {{count}} molecules from favorites',
  bulkDeletePartialError: 'Failed to remove {{failed}} out of {{total}} molecules. Please try again.',
  bulkDeleteError: 'Failed to remove molecules from favorites. Please try again.',
  
  // Analysis View
  radarAnalysis: 'Radar Analysis',
  espAnalysis: 'ESP Analysis',
  moAnalysis: 'MO Analysis',
  moleculesSelected: 'molecules selected',
  closeAnalysis: 'Close Analysis',
  
  // Chart Titles
  chartTitles: {
    radar: 'Radar Chart Properties',
    esp: 'ESP_MIN_EV vs ESP_MAX_EV with Solubility Regions',
    mo: 'HOMO_EV vs LUMO_EV'
  },
  
  // Chart Properties
  chartProperties: {
    homo: 'HOMO (eV)',
    lumo: 'LUMO (eV)',
    meltingPoint: 'MP (°C)',
    boilingPoint: 'BP (°C)',
    molecularWeight: 'Molecular Weight',
    espMin: 'esp_min (eV)',
    espMax: 'esp_max (eV)'
  },
  
  // Chart Labels
  chartLabels: {
    selectedMolecules: 'Selected Molecules',
    reference: 'Reference',
    highSolubility: 'high solubility',
    mediumSolubility: 'medium solubility',
    lowSolubility: 'low solubility',
    diluent: 'diluent',
    solubilityRegion: 'region'
  },
  
  // Confirmation and Messages
  confirmRemove: 'Are you sure you want to remove this molecule from your favorites?',
  moleculeRemoved: 'Molecule removed from favorites',
  removeFailed: 'Failed to remove from favorites. Please try again.',
  removeFromFavorites: 'Remove from favorites',
  alreadyInFavorites: 'This molecule is already in your favorites!',
  
  // Data Values
  notAvailable: 'N/A',
  viewLink: 'View Link',
  
  // Buttons
  buttons: {
    showAnalysis: 'Analyze Selected',
    closeButton: '×'
  },
  
  // Tooltips
  tooltips: {
    removeFromFavorites: 'Remove from favorites',
    selectAll: 'Select all molecules',
    viewCommercialLink: 'View commercial link'
  }
}; 