export default {
    // Search Input
    searchPlaceholder: "Enter SMILES string, molecule name, or query",
    searchButton: "Search",
    searchTooltip: `Valid queries can search over any numerical properties of molecules. For example:
 - "Find all molecules with HOMO at most -8"
 - "Find all molecules with LUMO at least -2 and molecular weight at most 200"
For more open-ended queries, use Ask.

To draw and look up SMILES strings, please click this icon or visit {{pubChemUrl}}`,
    
    // Search Options
    findFriendsLabel: 'Find "friends" (Molecules with similar physicochemical properties. "Friends" intentionally includes some molecules with similar structures and some molecules with diverse structures. The list is sorted by how similar physicochemical properties are to the query molecule.)',
    
    // Loading and Status Messages
    searching: "Searching...",
    loadingMap: "Loading Map of the Molecular Universe",
    errorLoadingData: "Error loading data",
    noDataAvailable: "No data available",
    
    // Search Results
    searchedMolecules: "Searched Molecules",
    moleculeNumber: "Molecule #{{number}}",
    similarMolecules: "Similar Molecules",
    similarMoleculeNumber: "Similar Molecule #{{number}}",
    
    // Property Names (Professional terms - not translated according to rules)
    properties: {
        smiles: "SMILES",
        chemicalFormula: "Chemical Formula",
        molecularWeight: "Molecular Weight",
        homo: "HOMO (eV)",
        lumo: "LUMO (eV)",
        espMin: "ESP Min (eV)",
        espMax: "ESP Max (eV)",
        predictedMp: "Predicted Melting Point (°C)",
        predictedBp: "Predicted Boiling Point (°C)",
        functionalGroups: "Functional Groups",
        umapX: "UMAP_X",
        umapY: "UMAP_Y"
    },
    
    // Buttons and Actions
    addToFavorites: "Add to Favorites ★",
    saving: "Saving...",
    
    // Warning and Error Messages
    multipleMoleculesWarning: "Multiple molecules found matching your search criterion. Find friends disabled.",
    findFriendError: "Failed to find similar molecules. Please try again.",
    searchError: "Error searching for molecules. Please try again.",
    
    // Not Found Message
    moleculeNotFound: {
        title: "Your query did not return any molecules. Here are several possibilities:",
        reasons: [
            "Your query may not be battery relevant or have errors. Please check.",
            "Your result molecules are included in premium levels Enterprise and Joint Development. Please upgrade.",
            "Your query hit one of our hidden galaxies of treasure molecules. Please contact us.",
            "Your query might involve salt or anion molecules, which our current database doesn't yet support. We'll be adding anions in an upcoming update."
        ],
        contactSales: "Contact Sales"
    }
}; 