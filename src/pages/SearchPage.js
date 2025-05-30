import Sidebar from "../components/Sidebar";
import UMAPClusterPlot from "../components/UMAPClusterPlot";
import SearchInput from "../Search";
import MoleculeFeedbackBox from "../components/MoleculeFeedbackBox";
import { useMemo, useState } from "react";
import API_URL from "../Constants";
import { authFetch } from "../utils";
import { usePlotDataStore } from "../providers/plotData";
import { useAuthStore } from "../providers/auth";
import UMAPClusterPlotDeck from "../components/UMAPClusterPlotDeck";

const SearchPage = ({ handlePointClick, moleculeFavoriteStatus, handleAddToFavorites }) => {

    const userPermissions = useAuthStore(state => state.userPermissions);

    const { data, loading, error } = usePlotDataStore();

    const [searchResults, setsearchResults] = useState(null);
    const [lastSearch, setLastSearch] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searchWarning, setSearchWarning] = useState(null);
    const [searchedMolecules, setsearchedMolecules] = useState(null);
    const [similarMolecules, setSimilarMolecules] = useState(null);
    const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState(null);
    const [similarMoleculeImages, setSimilarMoleculeImages] = useState({}); // Add state for similar molecule images
    const [findClosestFriends, setFindClosestFriends] = useState(false);

    // Add state for find-friend error message
    const [findFriendError, setFindFriendError] = useState(null);

    // Add new state for highlighted molecule
    const [highlightedMolecules, setHighlightedMolecules] = useState(null);

    // Update handleSearch function
    const handleSearchedMolecules = async (response, select_first = false) => {
        let formattedMolecules = null;
        try {
            const data = await response.json();
            if (data.found) {
                if (data.molecule_details && data.molecule_details.length > 0) {
                    formattedMolecules = data.molecule_details.map((mol) => {
                        return {
                            smiles: mol.SMILES,
                            x: mol.UMAP_0,
                            y: mol.UMAP_1,
                            properties: {
                                molwt: mol.MOLECULAR_WEIGHT,
                                homo_eV: mol.HOMO,
                                lumo_eV: mol.LUMO,
                                esp_min_eV: mol.ESP_MIN,
                                esp_max_eV: mol.ESP_MAX,
                                functional_groups: mol.FUNCTIONAL_GROUPS,
                                predicted_mp: mol.PREDICTED_MP,
                                predicted_bp: mol.PREDICTED_BP,
                                chemical_formula: mol.CHEMICAL_FORMULA,
                                CLUSTER: mol.CLUSTER
                            },
                            image: mol.image,
                            rawData: mol
                        };
                    });
                    if (select_first) {
                        // Only store the first molecule (as a list of one) and its image
                        const formattedMolecule = formattedMolecules[0];
                        setsearchedMolecules([formattedMolecule]);
                        setsearchResults([formattedMolecule.image]);
                        if (formattedMolecule.x !== null && formattedMolecule.y !== null &&
                            formattedMolecule.x !== undefined && formattedMolecule.y !== undefined) {
                            setHighlightedMolecules([formattedMolecule]);
                        }
                    } else {
                        // Store all molecules and their images
                        setsearchedMolecules(formattedMolecules);
                        setsearchResults(formattedMolecules.map((mol) => mol.image));
                        // Filter molecules to only include those with x and y values defined and not null
                        const highlighted = formattedMolecules.filter(
                            (mol) => mol.x !== null && mol.y !== null &&
                                mol.x !== undefined && mol.y !== undefined
                        );
                        if (highlighted && highlighted.length > 0) {
                            setHighlightedMolecules(highlighted);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing searched molecules:', error);
        }
        return formattedMolecules;
    };

    const handleSearch = async (searchInput) => {
        if (!searchInput.trim()) return;

        setSearchLoading(true);
        setSearchWarning(null);
        setSearchError(null);
        setsearchResults(null);
        setsearchedMolecules(null);
        setHighlightedMolecules(null);
        setSimilarMolecules(null);
        setHighlightedSimilarMolecules(null);
        setSimilarMoleculeImages({}); // Reset similar molecule images
        setFindFriendError(null); // Reset find friend error

        try {
            // Determine which endpoint to use based on user permissions
            let searchEndpoint = `${API_URL}/search`;
            if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
                searchEndpoint = `${API_URL}/search-35`;
            }

            // Fetch the searched molecule's properties 
            const moleculeResponse = await authFetch(`${searchEndpoint}?query=${encodeURIComponent(searchInput.trim())}`);

            console.log(moleculeResponse);
            const formattedMolecules = await handleSearchedMolecules(moleculeResponse);
            console.log(formattedMolecules);
            console.log(searchedMolecules);
            if (formattedMolecules && findClosestFriends) {
                // check if formattedMolecules has length > 1 - if so display warning
                if (formattedMolecules.length > 1) {
                    setSearchWarning('Multiple molecules found matching your search criterion. Find friends disabled.');
                } else {
                    const formattedMolecule = formattedMolecules[0];

                    // Then fetch similar molecules
                    // Prepare JSON payload for finding friends (default version, no extra params)
                    const isHighTier = ["admin", "enterprise", "joint"].includes(userPermissions);

                    const payload = {
                        smiles: formattedMolecule.smiles.trim(),
                        use_35m: isHighTier
                    };

                    try {
                        const response = await authFetch(`${API_URL}/find-friend-with-image`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        if (!response.ok) {
                            throw new Error(`Failed to fetch similar molecules: ${response.statusText}`);
                        }
                        const data = await response.json();
                        const molecules = data.similar_molecules;
                        setSimilarMolecules(molecules);

                        const highlighted = molecules.filter(
                            (mol) => mol.UMAP_0 !== undefined && mol.UMAP_1 !== undefined
                        );
                        if (highlighted.length > 0) {
                            setHighlightedSimilarMolecules(highlighted);
                        }

                        // Fetch molecule visualizations for all similar molecules
                        const imageResults = molecules.map((molecule, index) => {
                            const moleculeImageUrl = molecule.image;
                            return { index, imageUrl: moleculeImageUrl };
                        });

                        // Create a map of molecule index to image URL
                        const imageMap = {};
                        imageResults.forEach(result => {
                            if (result.imageUrl) {
                                imageMap[result.index] = result.imageUrl;
                            }
                        });

                        setSimilarMoleculeImages(imageMap);
                    } catch (friendError) {
                        console.error('Error finding similar molecules:', friendError);
                        setFindFriendError('Failed to find similar molecules. Please try again.');
                    }
                }
            }
        } catch (apiError) {
            console.error('Error checking Snowflake database:', apiError);
            setSearchError('Error searching for molecules. Please try again.');
        } finally {
            setSearchLoading(false);
            setLastSearch(searchInput);
        }
    };

    return (
        // SEARCH PAGE CONTENT:
        <Sidebar>
            <div className="search-umap-container" style={{ paddingLeft: '0', marginLeft: '0' }}>
                {/* UMAP Visualization on the left */}
                <div className="search-umap-section">
                    <div className="graph-container search-graph">
                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {data.length > 0 ? (
                                <UMAPClusterPlotDeck
                                    data={data}
                                    highlightedData={highlightedMolecules}
                                    highlightedSimilarData={highlightedSimilarMolecules}
                                    userPermissions={userPermissions}
                                    onClick={handlePointClick}
                                />
                            ) : (
                                <div className="loading-message">
                                    {loading ? 'Loading Map of the Molecular Universe' : error ? 'Error loading data' : 'No data available'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search interface on the right */}
                <div className="search-interface-section" style={{
                    overflowY: 'auto',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    flex: '0.8'
                }}>
                    {/* Search bar container */}

                    <SearchInput
                        onSearch={handleSearch}
                        disabled={searchLoading}
                    />

                    {/* Add "Find closest friends" checkbox */}
                    <div className="search-options">
                        <label className="search-option">
                            <input
                                type="checkbox"
                                checked={findClosestFriends}
                                onChange={(e) => setFindClosestFriends(e.target.checked)}
                            />
                            <span>Find "friends" (Molecules with similar physicochemical properties. "Friends" intentionally includes some molecules with similar structures and some molecules with diverse structures. The list is sorted by how similar physicochemical properties are to the query molecule.)</span>
                        </label>
                    </div>

                    <div className="search-results">
                        {searchLoading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Searching...</p>
                            </div>
                        )}

                        {searchError && (
                            <div className="error-message">
                                <p>{searchError}</p>
                            </div>
                        )}

                        {searchWarning && (
                            <div className="warning-message">
                                <p>{searchWarning}</p>
                            </div>
                        )}

                        {!searchLoading && !searchError && searchResults && (
                            <div>
                                {searchedMolecules && searchedMolecules.length > 0 && (
                                    <div className="molecule-properties">
                                        <h3>Searched Molecules</h3>
                                        {searchedMolecules.map((molecule, index) => (
                                            <div key={index} className="molecule-entry">
                                                <h4>Molecule #{index + 1}</h4>
                                                <table className="property-table">
                                                    <tbody>
                                                        <tr>
                                                            <td className="property-name">SMILES</td>
                                                            <td className="property-value">{molecule.smiles}</td>
                                                        </tr>
                                                        {molecule.properties?.chemical_formula && (
                                                            <tr>
                                                                <td className="property-name">Chemical Formula</td>
                                                                <td className="property-value">{molecule.properties.chemical_formula}</td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td className="property-name">Molecular Weight</td>
                                                            <td className="property-value">{molecule.properties?.molwt ? molecule.properties.molwt.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="property-name"></td>
                                                            <td className="property-value">{molecule.properties?.homo_eV ? molecule.properties.homo_eV.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="property-name">LUMO (eV)</td>
                                                            <td className="property-value">{molecule.properties?.lumo_eV ? molecule.properties.lumo_eV.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="property-name">ESP Min (eV)</td>
                                                            <td className="property-value">{molecule.properties?.esp_min_eV ? molecule.properties.esp_min_eV.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="property-name">ESP Max (eV)</td>
                                                            <td className="property-value">{molecule.properties?.esp_max_eV ? molecule.properties.esp_max_eV.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                        {molecule.properties?.predicted_mp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                                                            <tr>
                                                                <td className="property-name">Predicted Melting Point (°C)</td>
                                                                <td className="property-value">{molecule.properties.predicted_mp.toFixed(2)}</td>
                                                            </tr>
                                                        )}
                                                        {molecule.properties?.predicted_bp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                                                            <tr>
                                                                <td className="property-name">Predicted Boiling Point (°C)</td>
                                                                <td className="property-value">{molecule.properties.predicted_bp.toFixed(2)}</td>
                                                            </tr>
                                                        )}
                                                        {molecule.properties?.functional_groups && (
                                                            <tr>
                                                                <td className="property-name">Functional Groups</td>
                                                                <td className="property-value">{molecule.properties.functional_groups}</td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td className="property-name">UMAP_X</td>
                                                            <td className="property-value">{molecule.x !== undefined && molecule.x !== null ? molecule.x.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="property-name">UMAP_Y</td>
                                                            <td className="property-value">{molecule.y !== undefined && molecule.y !== null ? molecule.y.toFixed(2) : 'N/A'}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div className="molecule-image-container">
                                                    <img
                                                        src={molecule.image}
                                                        alt={`Molecule ${index + 1} visualization`}
                                                        className="molecule-image"
                                                    />
                                                </div>

                                                {/* Add Favorites button */}
                                                <div className="favorites-container" style={{ textAlign: 'center' }}>
                                                    <button
                                                        className="favorites-button"
                                                        onClick={() => handleAddToFavorites(molecule)}
                                                        disabled={moleculeFavoriteStatus[molecule.smiles]?.loading}
                                                        style={{
                                                            backgroundColor: '#0080ff',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '8px 15px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            transition: 'background-color 0.3s',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0080ff'}
                                                    >
                                                        {moleculeFavoriteStatus[molecule.smiles]?.loading ? 'Saving...' : 'Add to Favorites ★'}
                                                    </button>

                                                    {moleculeFavoriteStatus[molecule.smiles]?.success && (
                                                        <div className="success-message" style={{
                                                            marginTop: '8px',
                                                            color: 'green',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {moleculeFavoriteStatus[molecule.smiles].success}
                                                        </div>
                                                    )}

                                                    {moleculeFavoriteStatus[molecule.smiles]?.error && (
                                                        <div className="error-message" style={{
                                                            marginTop: '8px',
                                                            color: 'red',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {moleculeFavoriteStatus[molecule.smiles].error}
                                                        </div>
                                                    )}

                                                    {/* Display find-friend error below favorites button if it exists */}
                                                    {findClosestFriends && findFriendError && (
                                                        <div className="error-message" style={{
                                                            marginTop: '8px',
                                                            color: 'red',
                                                            fontSize: '14px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {findFriendError}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {findClosestFriends && similarMolecules && similarMolecules.length > 0 && (
                                    <div className="similar-molecules">
                                        <h3>Similar Molecules</h3>
                                        {similarMolecules.map((molecule, index) => (
                                            <div key={index} className="similar-molecule">
                                                <h4>Similar Molecule #{index + 1}</h4>
                                                <div className="similar-molecule-content">
                                                    <table className="property-table">
                                                        <tbody>
                                                            <tr>
                                                                <td className="property-name">SMILES</td>
                                                                <td className="property-value">{molecule.SMILES}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">HOMO (eV)</td>
                                                                <td className="property-value">
                                                                    {molecule.HOMO_eV !== null && molecule.HOMO_eV !== undefined
                                                                        ? molecule.HOMO_eV.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">LUMO (eV)</td>
                                                                <td className="property-value">
                                                                    {molecule.LUMO_eV !== null && molecule.LUMO_eV !== undefined
                                                                        ? molecule.LUMO_eV.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">ESP Min (eV)</td>
                                                                <td className="property-value">
                                                                    {molecule.ESP_min_eV !== null && molecule.ESP_min_eV !== undefined
                                                                        ? molecule.ESP_min_eV.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">ESP Max (eV)</td>
                                                                <td className="property-value">
                                                                    {molecule.ESP_max_eV !== null && molecule.ESP_max_eV !== undefined
                                                                        ? molecule.ESP_max_eV.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            {(userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise') &&
                                                                molecule.predicted_MP_celsius !== null && molecule.predicted_MP_celsius !== undefined && (
                                                                    <tr>
                                                                        <td className="property-name">Predicted Melting Point (°C)</td>
                                                                        <td className="property-value">
                                                                            {molecule.predicted_MP_celsius.toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            {(userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise') &&
                                                                molecule.predicted_BP_celsius !== null && molecule.predicted_BP_celsius !== undefined && (
                                                                    <tr>
                                                                        <td className="property-name">Predicted Boiling Point (°C)</td>
                                                                        <td className="property-value">
                                                                            {molecule.predicted_BP_celsius.toFixed(2)}
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            <tr>
                                                                <td className="property-name">Molecular Weight</td>
                                                                <td className="property-value">
                                                                    {molecule.molecular_weight !== null && molecule.molecular_weight !== undefined
                                                                        ? molecule.molecular_weight.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">Functional Groups</td>
                                                                <td className="property-value">{molecule.functional_groups || 'N/A'}</td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">UMAP_X</td>
                                                                <td className="property-value">
                                                                    {molecule.UMAP_0 !== null && molecule.UMAP_0 !== undefined
                                                                        ? molecule.UMAP_0.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td className="property-name">UMAP_Y</td>
                                                                <td className="property-value">
                                                                    {molecule.UMAP_1 !== null && molecule.UMAP_1 !== undefined
                                                                        ? molecule.UMAP_1.toFixed(2)
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                            {similarMoleculeImages[index] && (
                                                                <tr>
                                                                    <td colSpan="2">
                                                                        <div className="similar-molecule-image-container">
                                                                            <img
                                                                                src={similarMoleculeImages[index]}
                                                                                alt={`Molecule ${index + 1} visualization`}
                                                                                className="similar-molecule-image"
                                                                            />
                                                                        </div>

                                                                        {/* Add Favorites button for similar molecules */}
                                                                        <div className="favorites-container" style={{ textAlign: 'center' }}>
                                                                            <button
                                                                                className="favorites-button"
                                                                                onClick={() => handleAddToFavorites({
                                                                                    smiles: molecule.SMILES,
                                                                                    properties: {
                                                                                        molwt: molecule.molecular_weight,
                                                                                        homo_eV: molecule.HOMO_eV,
                                                                                        lumo_eV: molecule.LUMO_eV,
                                                                                        esp_min_eV: molecule.ESP_min_eV,
                                                                                        esp_max_eV: molecule.ESP_max_eV,
                                                                                        predicted_mp: molecule.predicted_MP_celsius,
                                                                                        predicted_bp: molecule.predicted_BP_celsius,
                                                                                        functional_groups: molecule.functional_groups
                                                                                    },
                                                                                    x: molecule.UMAP_0,
                                                                                    y: molecule.UMAP_1
                                                                                })}
                                                                                disabled={moleculeFavoriteStatus[molecule.SMILES]?.loading}
                                                                                style={{
                                                                                    backgroundColor: '#0080ff',
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    padding: '8px 15px',
                                                                                    cursor: 'pointer',
                                                                                    fontWeight: 'bold',
                                                                                    transition: 'background-color 0.3s',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center'
                                                                                }}
                                                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                                                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0080ff'}
                                                                            >
                                                                                {moleculeFavoriteStatus[molecule.SMILES]?.loading ? 'Saving...' : 'Add to Favorites ★'}
                                                                            </button>

                                                                            {moleculeFavoriteStatus[molecule.SMILES]?.success && (
                                                                                <div className="success-message" style={{
                                                                                    marginTop: '8px',
                                                                                    color: 'green',
                                                                                    fontSize: '14px',
                                                                                    fontWeight: 'bold'
                                                                                }}>
                                                                                    {moleculeFavoriteStatus[molecule.SMILES].success}
                                                                                </div>
                                                                            )}

                                                                            {moleculeFavoriteStatus[molecule.SMILES]?.error && (
                                                                                <div className="error-message" style={{
                                                                                    marginTop: '8px',
                                                                                    color: 'red',
                                                                                    fontSize: '14px',
                                                                                    fontWeight: 'bold'
                                                                                }}>
                                                                                    {moleculeFavoriteStatus[molecule.SMILES].error}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            <tr>
                                                                <td colSpan={2}>
                                                                    <MoleculeFeedbackBox
                                                                        molecule={molecule}
                                                                        lastSearch={lastSearch}
                                                                        onClose={() => { }}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    {/* Add thumbs up/down buttons here */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {(lastSearch && !searchLoading && (searchedMolecules === null || searchedMolecules.length === 0)) && (
                            <div className="molecule-not-found">
                                <p>Your query did not return any molecules. Here are several possibilities:
                                    <br />
                                    <br />
                                    1.      Your query may not be battery relevant or have errors. Please check.
                                    <br />
                                    2.      Your result molecules are included in premium levels Enterprise and Joint Development. Please upgrade.
                                    <br />
                                    3.      Your query hit one of our hidden galaxies of treasure molecules. Please contact us.
                                    <br />
                                    4.      Your query might involve salt or anion molecules, which our current database doesn't yet support. We'll be adding anions in an upcoming update.</p>
                                <br />
                                <button
                                    className="pricing-cta strategic"
                                    onClick={() => window.location.href = 'mailto:partnership@ses.ai?subject=Joint Development Inquiry'}
                                >
                                    Contact Sales
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>)
};

export default SearchPage;