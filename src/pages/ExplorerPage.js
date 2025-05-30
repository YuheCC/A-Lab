import Sidebar from "../components/Sidebar";
import UMAPClusterPlot from "../components/UMAPClusterPlot";
import Slider from "../components/Slider";
import { useEffect, useState, useMemo } from "react";
import { usePlotDataStore } from "../providers/plotData";
import { useAuthStore } from "../providers/auth";
import UMAPClusterPlotDeck from "../components/UMAPClusterPlotDeck";

// Labels for filters
export const filterLabels = {
    molwt: "Molecular Weight",
    homo_eV: "HOMO (eV)",
    lumo_eV: "LUMO (eV)",
    esp_max_eV: "Max ESP (eV)",
    esp_min_eV: "Min ESP (eV)",
    predicted_mp: "Predicted Melting Point (°C)",
    predicted_bp: "Predicted Boiling Point (°C)"
};


const ExplorerPage = ({ handlePointClick }) => {

    const userPermissions = useAuthStore(state => state.userPermissions);
    const { data, loading, error } = usePlotDataStore(); 

    const [filteredGraphData, setFilteredGraphData] = useState(data);
    const [tempFilterRanges, setTempFilterRanges] = useState({});

    // New filter implementation with range values
    const [filterRanges, setFilterRanges] = useState({
        molwt: { min: 0, max: 1000, range: [0, 1000], active: false },
        homo_eV: { min: -10, max: 0, range: [-10, 0], active: false },
        lumo_eV: { min: -5, max: 5, range: [-5, 5], active: false },
        esp_max_eV: { min: -2, max: 2, range: [-2, 2], active: false },
        esp_min_eV: { min: -2, max: 0, range: [-2, 0], active: false },
        predicted_mp: { min: 0, max: 300, range: [0, 300], active: false },
        predicted_bp: { min: 0, max: 300, range: [0, 300], active: false }
    });

    // Count how many filters are active
    const activeFilterCount = Object.values(filterRanges).filter(range => range.active).length;

    // Add state for functional group filter
    const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState('');
    const [functionGroupValue, setFunctionalGroupValue] = useState('');

    useEffect(() => {
        setFilterRanges(oldFilterRanges => {
            const updatedRanges = { ...oldFilterRanges };
            for (const key in filterLabels) {
                const values = data
                    .map(node => node.properties[key])
                    .filter(v => v !== undefined && v !== null);
                if (values.length > 0) {
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    updatedRanges[key] = {
                        min: min,
                        max: max,
                        range: [min, max], // Initialize range to full data range (filter effectively off)
                        active: false
                    };
                }
            }
            return updatedRanges;
        });
    }, [data])

    // Apply filters based on range slider values and functional group
    useEffect(() => {
        if (data.length === 0) return;
        const filtered = data.filter(node => {
            // Check range filters
            for (const [property, range] of Object.entries(filterRanges)) {
                if (!range.active) continue;
                const nodeValue = node.properties[property];
                if (nodeValue !== undefined && nodeValue !== null &&
                    (nodeValue < range.range[0] || nodeValue > range.range[1])) {
                    return false;
                }
            }

            // Check functional group filter
            if (selectedFunctionalGroup) {
                if (!node.properties?.functional_groups ||
                    !node.properties.functional_groups.includes(selectedFunctionalGroup)) {
                    return false;
                }
            }

            return true;
        });
        setFilteredGraphData(filtered);
    }, [data, filterRanges, selectedFunctionalGroup]);

    // Handle filter slider change
    const handleFilterChange = (property, newValue, isCommitted) => {
        if (isCommitted) {
            // When dragging is complete, update the actual filter
            setFilterRanges(prev => ({
                ...prev,
                [property]: {
                    ...prev[property],
                    range: newValue,
                    active: true
                }
            }));
        } else {
            // During dragging, just update the temporary display
            setTempFilterRanges(prev => ({
                ...prev,
                [property]: newValue
            }));
        }
    };

    // Reset a specific filter
    const resetFilter = (property) => {
        setFilterRanges(prev => ({
            ...prev,
            [property]: {
                ...prev[property],
                range: [prev[property].min, prev[property].max],
                active: false
            }
        }));

        // Also clear any temporary values for this property
        setTempFilterRanges(prev => {
            const newTempRanges = { ...prev };
            delete newTempRanges[property];
            return newTempRanges;
        });
    };

    // Reset all filters
    const resetAllFilters = () => {
        setFilterRanges(prev => {
            const newRanges = {};
            for (const [key, range] of Object.entries(prev)) {
                newRanges[key] = {
                    ...range,
                    range: [range.min, range.max],
                    active: false
                };
            }
            return newRanges;
        });

        // Clear all temporary filter values
        setTempFilterRanges({});
    };

    // Memoize the plot to avoid unnecessary re-renders
    // - This prevents rerendering on tempFilterRanges changes
    const memoizedPlot = useMemo(() => {
        return (filteredGraphData.length > 0 ? (
            <UMAPClusterPlotDeck
                data={filteredGraphData}
                highlightedData={[]}
                highlightedSimilarData={[]}
                userPermissions={userPermissions}
                onClick={handlePointClick}
            />
        ) : (
            <div className="loading-message">
                {loading ? 'Loading Map of the Molecular Universe' : error ? 'Error loading data' : 'No data available'}
            </div>
        ))
    }, [filteredGraphData, loading, error, userPermissions, handlePointClick]);


    return (<Sidebar>
        <div className="search-umap-container">
            <div className="search-umap-section">
                <div className="graph-container search-graph">
                    {memoizedPlot}
                </div>
            </div>
            <div className="search-interface-section" style={{ flex: '0.8', padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '40px' }}>
                <h2>
                    Filters
                    {activeFilterCount > 0 && (
                        <button
                            className="reset-button"
                            onClick={resetAllFilters}
                            title="Reset all filters"
                        >
                            Reset All
                        </button>
                    )}
                </h2>
                <div className="sliders-container">
                    {Object.entries(filterRanges).map(([property, range]) => {
                        // Hide predicted_mp and predicted_bp sliders for users without proper permissions
                        if ((property === 'predicted_mp' || property === 'predicted_bp') &&
                            !(userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise')) {
                            return null;
                        }

                        // Use temporary range value if available during dragging
                        const displayValue = tempFilterRanges[property] || range.range;

                        return (
                            <div key={property} className="filter-wrapper">
                                <Slider
                                    property={property}
                                    value={displayValue}
                                    min={range.min}
                                    max={range.max}
                                    onChange={handleFilterChange}
                                    label={filterLabels[property]}
                                    active={range.active}
                                />
                                {range.active && (
                                    <button
                                        className="reset-filter-button"
                                        onClick={() => resetFilter(property)}
                                        title="Reset this filter"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <div className="functional-group-filter">
                        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
                            Functional Group Filter
                            <span
                                className="search-tooltip-marker"
                                title={`Functional Groups: Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.`}
                                style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
                            >
                                ?
                            </span>
                        </h3>
                        <div className="functional-group-input-container">
                            <select
                                className="functional-group-select"
                                value={functionGroupValue}
                                onChange={(e) => {
                                    setFunctionalGroupValue(e.target.value);
                                    setSelectedFunctionalGroup(e.target.options[e.target.selectedIndex].text);
                                }}
                                translate="no"
                            >
                                <option value="">Select a functional group</option>
                                <option value="C(=O)Cl">AcidChloride</option>
                                <option value="C(=O)[O;H,-]">CarboxylicAcid</option>
                                <option value="[$(S-!@[#6])](=O)(=O)(Cl)">SulfonylChloride</option>
                                <option value="[N;$(N-[#6]);!$(N-[!#6;!#1]);!$(N-C=[O,N,S])]">Amine</option>
                                <option value="[$(B-!@[#6])](O)(O)">BoronicAcid</option>
                                <option value="[$(N-!@[#6])](=!@C=!@O)">Isocyanate</option>
                                <option value="[O;H1;$(O-!@[#6;!$(C=!@[O,N,S])])]">Alcohol</option>
                                <option value="[CH;D2;!$(C-[!#6;!#1])]=O">Aldehyde</option>
                                <option value="[$([F,Cl,Br,I]-!@[#6]);!$([F,Cl,Br,I]-!@C-!@[F,Cl,Br,I]);!$([F,Cl,Br,I]-[C,S](=[O,S,N]))]">Halogen</option>
                                <option value="[N;H0;$(N-[#6]);D2]=[N;D2]=[N;D1]">Azide</option>
                                <option value="[N;H0;$(N-[#6]);D3](=[O;D1])~[O;D1]">Nitro</option>
                                <option value="[C;$(C#[CH])]">TerminalAlkyne</option>
                                <option value="[CX3](=O)[Cl,Br,I,F]">Acyl halide</option>
                                <option value="[CX3H](=[OX1])">Aldehyde</option>
                                <option value="[CX3]=[CX3]">Alkene</option>
                                <option value="[CX2]#[CX2]">Alkyne</option>
                                <option value="[N+]#[C-]">Isonitrile (isocyanide)</option>
                                <option value="[NX3][CX3](=O)[#6]">Amide</option>
                                <option value="[#6][NX2]=[#6][N]">Amidine</option>
                                <option value="[NX4]">Ammonium</option>
                                <option value="c1ccccc1">Arene</option>
                                <option value="[#6][N]=[N][#6]">Azo</option>
                                <option value="[NX3][CX3](=O)[OX2H0]">Carbamate</option>
                                <option value="[#6][OX2][CX3](=[OX1])[OX2][#6]">Carbonate</option>
                                <option value="[CX3](=O)[OX2H1]">CarboxylicAcid</option>
                                <option value="[CX3](=O)[OX2][CX3](=O)">CarboxylicAcidAnhydride</option>
                                <option value="[#6][OX2][CX2]#[NX1]">Cyanate</option>
                                <option value="[#6][SX2][SX2][#6]">Disulfide</option>
                                <option value="[CX3][NX3]=[CX3]">Enamine</option>
                                <option value="[CX3](=O)[OX2H0][#6]">Ester</option>
                                <option value="[OD2]([#6])[#6]">Ether</option>
                                <option value="[OX2r3]1[#6][#6]1">Epoxide</option>
                                <option value="[F][CX4]">FluoroAlkyl_SP3</option>
                                <option value="[F][CX3]">FluoroAlkyl_SP2</option>
                                <option value="[F][CX2]">FluoroAlkyl_SP</option>
                                <option value="[F][CX4][OX2]">FluoroEther</option>
                                <option value="[SX4](=O)(=O)([F])[#6]">FluoroSulfonyl</option>
                                <option value="[NX3][CX3](=[NX3])[NX3]">Guanidine</option>
                                <option value="[NX3][NX3]">Hydrazine</option>
                                <option value="[#6][NX3]([#6])[OX2][#6]">Hydroxylamines</option>
                                <option value="[C][Cl,Br,I,F]">Halide</option>
                                <option value="[CX3](=O)[NX3][CX3](=O)">Imide</option>
                                <option value="[CX2]=[NX3]">Imine</option>
                                <option value="[NX2]=[CX2]=[SX2]">Isothiocyanate</option>
                                <option value="[CX3;!$(C(=O)[N,O])](=O)[CX3;!$(C(=O)[N,O])]">Ketone</option>
                                <option value="[#6]([O][#6])([O][#6])">Ketal</option>
                                <option value="[CX2]#[NX1]">Nitrile</option>
                                <option value="[OX2][OX2]">Peroxide</option>
                                <option value="c1ccccc1[OH]">Phenol</option>
                                <option value="[#6][PX3]([#6])[#6]">Phosphino</option>
                                <option value="[#6][PX4](=[OX1])([OX2])[OX2]">Phosphono</option>
                                <option value="[OX2][PX4](=[OX1])([OX2])[OX2]">Phosphate</option>
                                <option value="[O]=[c]1[cH][cH][cH][cH][cH]1">Quinone</option>
                                <option value="[Se][#6]">Selenide</option>
                                <option value="[SeH]">Selenol</option>
                                <option value="[SX4](=O)(=O)([#6])[#6]">Sulfone</option>
                                <option value="[#6][SX4](=[OX1])(=[OX1])[OX2][#6]">Sulfonate ester</option>
                                <option value="[SX4](=O)([#6])[#6]">Sulfoxide</option>
                                <option value="[SX4](=O)(=O)(F)[#7]">NitroSulfonylFluoride</option>
                                <option value="[SX2H]">Thiol</option>
                                <option value="[#6](=[SX])[H]">Thial</option>
                                <option value="[#6](=[SX])[NX3]">Thioamide</option>
                                <option value="[#6](=[SX])[#6]">Thioketone</option>
                                <option value="[CX2]=[SX1]">Thione</option>
                                <option value="[SX2]([#6])[#6]">Thioether</option>
                                <option value="[SX2]=[CX2]=[NX1]">Thiocyanate</option>
                                <option value="[nH]1nccc1">Pyrazole-like Heterocycle</option>
                                <option value="[c]1[c][n][n][c]1">Heterocyclic-P-CN-1</option>
                                <option value="[n]1[c][n][n][c]1">Heterocyclic-P-CN-2</option>
                                <option value="[c]1[c][c][c][s]1">Heterocyclic-P-CS-1</option>
                                <option value="[c]1[c][c][o][c]1">Heterocyclic-P-CO-1</option>
                                <option value="c1ccccc1">Arene (aromatic)</option>
                            </select>
                            <button
                                className="reset-filter-button functional-group-reset"
                                onClick={() => {
                                    setFunctionalGroupValue('');
                                    setSelectedFunctionalGroup('');
                                    const dropdown = document.querySelector('.functional-group-select');
                                    if (dropdown) dropdown.selectedIndex = 0;
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Sidebar>)
}

export default ExplorerPage;