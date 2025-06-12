import Sidebar from "../components/Sidebar";
import SearchInput from "../components/Search";
import MoleculeFeedbackBox from "../components/MoleculeFeedbackBox";
import { useMemo, useState } from "react";
import { authFetch, getAPIUrl } from "../utils";
import { usePlotDataStore } from "../providers/plotData";
import { useAuthStore } from "../providers/auth";
import UMAPClusterPlotDeck from "../components/UMAPClusterPlotDeck";
import { MolCard } from "../components/MolCard";

const API_URL = getAPIUrl();

const SearchPage = ({ handlePointClick, moleculeFavoriteStatus, handleAddToFavorites }) => {

    const userPermissions = useAuthStore(state => state.userPermissions);

    const { data, loading, error } = usePlotDataStore();

    const [searchResults, setsearchResults] = useState(null);
    const [lastSearch, setLastSearch] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [searchWarning, setSearchWarning] = useState(null);
    const [searchedMolecules, setsearchedMolecules] = useState(null);
    const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState([]);
    const [similarMoleculeImages, setSimilarMoleculeImages] = useState({}); // Add state for similar molecule images
    const [findClosestFriends, setFindClosestFriends] = useState(false);

    // Add state for find-friend error message
    const [findFriendError, setFindFriendError] = useState(null);

    // Add new state for highlighted molecule
    const [highlightedMolecules, setHighlightedMolecules] = useState([]);

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
                                molwt: mol.molecular_weight,
                                homo_eV: mol.HOMO_eV,
                                lumo_eV: mol.LUMO_eV,
                                esp_min_eV: mol.ESP_min_eV,
                                esp_max_eV: mol.ESP_max_eV,
                                functional_groups: mol.functional_groups,
                                predicted_mp: mol.predicted_MP_celsius,
                                predicted_bp: mol.predicted_BP_celsius
                            },
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

                        // Don't filter out null values for highlightedMolecules as that messes up indexing
                        // - deckgl handles null values gracefully
                        if (formattedMolecules && formattedMolecules.length > 0) {
                            setHighlightedMolecules(formattedMolecules);
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
        setHighlightedMolecules([]);
        setHighlightedSimilarMolecules([]);
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

            // Ratelimit handling
            if (moleculeResponse.status === 429) {
                setSearchWarning('Too many requests. Please wait a moment before trying again.');
                setSearchLoading(false);
                return;
            }

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

                        if (molecules.length > 0) {
                            setHighlightedSimilarMolecules(molecules);
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
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                                    <input
                                        type="checkbox"
                                        checked={findClosestFriends}
                                        onChange={(e) => setFindClosestFriends(e.target.checked)}
                                    />
                                    <div>Find "friends"</div>
                                </div>
                                <div style={{
                                    color: '#555',
                                    fontSize: '14px',
                                }}>Molecules with similar physicochemical properties. "Friends" intentionally includes some molecules with similar structures and some molecules with diverse structures. The list is sorted by how similar physicochemical properties are to the query molecule.</div>
                            </div>
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
                                            <MolCard
                                                key={index}
                                                name={`Molecule ${index + 1}`}
                                                showMoreDetails={false}
                                                large={true}
                                                propGroups={[
                                                    { label: 'SMILES', value: molecule.smiles, span: 4 },
                                                    { label: 'Molecular Weight', value: molecule.properties.molwt, span: 2, suffix: ' g/mol' },
                                                    { label: 'Predicted Melting Point', value: molecule.properties?.predicted_mp, suffix: '°C', span: 2,
                                                        show: userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise'
                                                     },
                                                    { label: 'Predicted Boiling Point', value: molecule.properties?.predicted_bp, suffix: '°C', span: 2,
                                                        show: userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise'},
                                                    { label: 'HOMO', value: molecule.properties.homo_eV, span: 1, suffix: ' eV' },
                                                    { label: 'LUMO', value: molecule.properties?.lumo_eV, span: 1, suffix: ' eV' },
                                                    { label: 'ESP Min', value: molecule.properties?.esp_min_eV, span: 1, suffix: ' eV' },
                                                    { label: 'ESP Max', value: molecule.properties?.esp_max_eV, span: 1, suffix: ' eV' },
                                                ]} foldPropGroups={[
                                                    { label: 'UMAP_X', value: molecule.x, span: 1 },
                                                    { label: 'UMAP_Y', value: molecule.y, span: 1 },
                                                    { label: 'Functional Groups', value: JSON.parse(molecule.properties?.functional_groups ?? "[]"), span: 4 }
                                                ]}>
                                                <div style={{ display: 'flex', flexFlow: 'column', textAlign: 'center', width: '100%' }}>
                                                    <button
                                                        className="favorites-button"
                                                        onClick={() => handleAddToFavorites(molecule)}
                                                        disabled={moleculeFavoriteStatus[molecule.smiles]?.loading}
                                                        style={{
                                                            width: '100%',
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
                                            </MolCard>
                                        ))}
                                    </div>
                                )}
                                {findClosestFriends && highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0 && (
                                    <div className="similar-molecules">
                                        <h3>Similar Molecules</h3>
                                        {highlightedSimilarMolecules.map((molecule, index) => (
                                            <MolCard
                                                style={{ marginBottom: '20px' }}
                                                key={index}
                                                name={`Similar Molecule #${index + 1}`}
                                                showMoreDetails={false}
                                                large={true}
                                                propGroups={[
                                                    { label: 'SMILES', value: molecule.SMILES, span: 4 },
                                                    { label: 'Molecular Weight', value: molecule.molecular_weight, span: 2, suffix: ' g/mol' },
                                                    { label: 'Predicted Melting Point', value: molecule.predicted_MP_celsius, suffix: '°C', span: 2,
                                                        show: userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise'
                                                     },
                                                    { label: 'Predicted Boiling Point', value: molecule.predicted_BP_celsius, suffix: '°C', span: 2,
                                                        show: userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise'
                                                     },
                                                    { label: 'HOMO', value: molecule.HOMO_eV, span: 1, suffix: ' eV' },
                                                    { label: 'LUMO', value: molecule.LUMO_eV, span: 1, suffix: ' eV' },
                                                    { label: 'ESP Min', value: molecule.ESP_min_eV, span: 1, suffix: ' eV' },
                                                    { label: 'ESP Max', value: molecule.ESP_max_eV, span: 1, suffix: ' eV' },
                                                ]} 
                                                foldPropGroups={[
                                                    { label: 'Functional Groups', value: JSON.parse(molecule?.functional_groups ?? "[]") || 'N/A', span: 4 },
                                                    { label: 'UMAP_X', value: molecule.UMAP_0, span: 1 },
                                                    { label: 'UMAP_Y', value: molecule.UMAP_1, span: 1 },
                                                ]}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                                                 <div style={{ position: 'relative', minWidth: '300px', width: '100%' }}>
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
                                                            width: '100%',
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
                                                <MoleculeFeedbackBox
                                                    molecule={molecule}
                                                    lastSearch={lastSearch}
                                                    onClose={() => { }}
                                                />
                                                </div>
                                            </MolCard>
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