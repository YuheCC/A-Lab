import Sidebar from "../components/Sidebar";
import Slider from "../components/Slider";
import { useEffect, useState, useMemo } from "react";
import { usePlotDataStore } from "../providers/plotData";
import { useAuthStore } from "../providers/auth";
import UMAPClusterPlotDeck from "../components/UMAPClusterPlotDeck";
import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from 'react-i18next';

// Labels for filters
export const filterLabels = {
    molwt: "Molecular Weight",
    homo_eV: "HOMO (eV)",
    lumo_eV: "LUMO (eV)",
    esp_max_eV: "Max ESP (eV)",
    esp_min_eV: "Min ESP (eV)",
    predicted_mp: "Predicted Melting Point (°C)",
    predicted_bp: "Predicted Boiling Point (°C)",
    predicted_fp: "Predicted Flash Point (°C)",
    combustion_enthalpy: "Combustion Enthalpy (eV)",
    commercial_score: "Commercial Viability",
    CLUSTER: "Cluster",
    functional_groups: "Functional Groups",
    chemical_formula: "Chemical Formula"
};

export const functionGroupOptions = [
    { label: "AcidChloride", value: "C(=O)Cl" },
    { label: "SulfonylChloride", value: "[$(S-!@[#6])](=O)(=O)(Cl)" },
    { label: "Amine", value: "[N;$(N-[#6]);!$(N-[!#6;!#1]);!$(N-C=[O,N,S])]" },
    { label: "BoronicAcid", value: "[$(B-!@[#6])](O)(O)" },
    { label: "Isocyanate", value: "[$(N-!@[#6])](=!@C=!@O)" },
    { label: "Alcohol", value: "[O;H1;$(O-!@[#6;!$(C=!@[O,N,S])])]" },
    { label: "Halogen", value: "[$([F,Cl,Br,I]-!@[#6]);!$([F,Cl,Br,I]-!@C-!@[F,Cl,Br,I]);!$([F,Cl,Br,I]-[C,S](=[O,S,N]))]" },
    { label: "Azide", value: "[N;H0;$(N-[#6]);D2]=[N;D2]=[N;D1]" },
    { label: "Nitro", value: "[N;H0;$(N-[#6]);D3](=[O;D1])~[O;D1]" },
    { label: "TerminalAlkyne", value: "[C;$(C#[CH])]" },
    { label: "Acyl halide", value: "[CX3](=O)[Cl,Br,I,F]" },
    { label: "Aldehyde", value: "[CX3H](=[OX1])" },
    { label: "Alkene", value: "[CX3]=[CX3]" },
    { label: "Alkyne", value: "[CX2]#[CX2]" },
    { label: "Isonitrile (isocyanide)", value: "[N+]#[C-]" },
    { label: "Amide", value: "[NX3][CX3](=O)[#6]" },
    { label: "Amidine", value: "[#6][NX2]=[#6][N]" },
    { label: "Ammonium", value: "[NX4]" },
    { label: "Arene", value: "c1ccccc1" },
    { label: "Azo", value: "[#6][N]=[N][#6]" },
    { label: "Carbamate", value: "[NX3][CX3](=O)[OX2H0]" },
    { label: "Carbonate", value: "[#6][OX2][CX3](=[OX1])[OX2][#6]" },
    { label: "CarboxylicAcid", value: "[CX3](=O)[OX2H1]" },
    { label: "CarboxylicAcidAnhydride", value: "[CX3](=O)[OX2][CX3](=O)" },
    { label: "Cyanate", value: "[#6][OX2][CX2]#[NX1]" },
    { label: "Disulfide", value: "[#6][SX2][SX2][#6]" },
    { label: "Enamine", value: "[CX3][NX3]=[CX3]" },
    { label: "Ester", value: "[CX3](=O)[OX2H0][#6]" },
    { label: "Ether", value: "[OD2]([#6])[#6]" },
    { label: "Epoxide", value: "[OX2r3]1[#6][#6]1" },
    { label: "FluoroAlkyl_SP3", value: "[F][CX4]" },
    { label: "FluoroAlkyl_SP2", value: "[F][CX3]" },
    { label: "FluoroAlkyl_SP", value: "[F][CX2]" },
    { label: "FluoroEther", value: "[F][CX4][OX2]" },
    { label: "FluoroSulfonyl", value: "[SX4](=O)(=O)([F])[#6]" },
    { label: "Guanidine", value: "[NX3][CX3](=[NX3])[NX3]" },
    { label: "Hydrazine", value: "[NX3][NX3]" },
    { label: "Hydroxylamines", value: "[#6][NX3]([#6])[OX2][#6]" },
    { label: "Halide", value: "[C][Cl,Br,I,F]" },
    { label: "Imide", value: "[CX3](=O)[NX3][CX3](=O)" },
    { label: "Imine", value: "[CX2]=[NX3]" },
    { label: "Isothiocyanate", value: "[NX2]=[CX2]=[SX2]" },
    { label: "Ketone", value: "[CX3;!$(C(=O)[N,O])](=O)[CX3;!$(C(=O)[N,O])]" },
    { label: "Ketal", value: "[#6]([O][#6])([O][#6])" },
    { label: "Nitrile", value: "[CX2]#[NX1]" },
    { label: "Peroxide", value: "[OX2][OX2]" },
    { label: "Phenol", value: "c1ccccc1[OH]" },
    { label: "Phosphino", value: "[#6][PX3]([#6])[#6]" },
    { label: "Phosphono", value: "[#6][PX4](=[OX1])([OX2])[OX2]" },
    { label: "Phosphate", value: "[OX2][PX4](=[OX1])([OX2])[OX2]" },
    { label: "Quinone", value: "[O]=[c]1[cH][cH][cH][cH][cH]1" },
    { label: "Selenide", value: "[Se][#6]" },
    { label: "Selenol", value: "[SeH]" },
    { label: "Sulfone", value: "[SX4](=O)(=O)([#6])[#6]" },
    { label: "Sulfonate ester", value: "[#6][SX4](=[OX1])(=[OX1])[OX2][#6]" },
    { label: "Sulfoxide", value: "[SX4](=O)([#6])[#6]" },
    { label: "NitroSulfonylFluoride", value: "[SX4](=O)(=O)(F)[#7]" },
    { label: "Thiol", value: "[SX2H]" },
    { label: "Thial", value: "[#6](=[SX])[H]" },
    { label: "Thioamide", value: "[#6](=[SX])[NX3]" },
    { label: "Thioketone", value: "[#6](=[SX])[#6]" },
    { label: "Thione", value: "[CX2]=[SX1]" },
    { label: "Thioether", value: "[SX2]([#6])[#6]" },
    { label: "Thiocyanate", value: "[SX2]=[CX2]=[NX1]" },
    { label: "Pyrazole-like Heterocycle", value: "[nH]1nccc1" },
    { label: "Heterocyclic-P-CN-1", value: "[c]1[c][n][n][c]1" },
    { label: "Heterocyclic-P-CN-2", value: "[n]1[c][n][n][c]1" },
    { label: "Heterocyclic-P-CS-1", value: "[c]1[c][c][c][s]1" },
    { label: "Heterocyclic-P-CO-1", value: "[c]1[c][c][o][c]1" }
]


const ExplorerPage = ({ handlePointClick }) => {
    const { t } = useTranslation();

    const { userPermissions, isAuthenticated } = useAuthStore();
    const { data, loading, error } = usePlotDataStore(); 

    const [filteredGraphData, setFilteredGraphData] = useState(data);
    const [tempFilterRanges, setTempFilterRanges] = useState({});

    const [filteredFunctionalGroupOptions, setFilteredFunctionalGroupOptions] = useState(functionGroupOptions);

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

    // Get localized filter labels
    const getFilterLabel = (property) => {
        return t(`explorer.filterLabels.${property}`, filterLabels[property]);
    };
    // Clean up any stale filter entries when component mounts
    useEffect(() => {
        setFilterRanges(prev => {
            const cleanedRanges = {};
            // Only keep entries that are in filterLabels
            for (const [key, range] of Object.entries(prev)) {
                if (filterLabels[key]) {
                    cleanedRanges[key] = range;
                }
            }
            return cleanedRanges;
        });
    }, []); // Run only on mount

    useEffect(() => {
        setFilterRanges(oldFilterRanges => {
            const updatedRanges = {};
            // Only include properties that are in filterLabels
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
    }, [data]);

    useEffect(() => {
        // Update functional group options based on data
        const newFunctionalGroupOptions = functionGroupOptions.map(option => {
            const matches = filteredGraphData.filter(node => 
                node.properties?.functional_groups?.includes(option.label)
            ).length;
            return {
                ...option,
                count: matches
            };
        }).filter(option => option.count > 0); // Only keep options with matches
        setFilteredFunctionalGroupOptions(newFunctionalGroupOptions);
    }, [filteredGraphData])

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
            // Only reset filters that are in filterLabels
            for (const [key, range] of Object.entries(prev)) {
                if (filterLabels[key]) {
                    newRanges[key] = {
                        ...range,
                        range: [range.min, range.max],
                        active: false
                    };
                }
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
                {loading ? t('explorer.loadingMap') : error ? t('explorer.errorLoadingData') : t('explorer.noDataAvailable')}
            </div>
        ))
    }, [filteredGraphData, loading, error, userPermissions, handlePointClick, t]);


    return (<Sidebar>
        <div className="search-umap-container">
            <div className="search-umap-section">
                <div className="graph-container search-graph">
                    {memoizedPlot}
                </div>
            </div>
            <div className="search-interface-section" style={{ flex: '0.8', padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '40px' }}>
                <h2>
                    {t('explorer.filtersTitle')}
                    {activeFilterCount > 0 && (
                        <button
                            className="reset-button"
                            onClick={resetAllFilters}
                            title={t('explorer.resetAllButton')}
                        >
                            {t('explorer.resetAllButton')}
                        </button>
                    )}
                </h2>
                <div className="sliders-container">
                    {Object.entries(filterRanges).map(([property, range]) => {
                        // Hide predicted properties sliders for users without proper permissions
                        if ((property === 'predicted_mp' || property === 'predicted_bp' || property === 'predicted_fp') &&
                            !(isAuthenticated && (userPermissions === 'admin' || userPermissions === 'enterprise'))) {
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
                                    label={getFilterLabel(property)}
                                    active={range.active}
                                />
                                {range.active && (
                                    <button
                                        className="reset-filter-button"
                                        onClick={() => resetFilter(property)}
                                        title={t('explorer.resetFilterButton')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    <div className="functional-group-filter">
                        <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
                            {t('explorer.functionalGroupFilter.title')}
                            <span
                                className="search-tooltip-marker"
                                title={t('explorer.functionalGroupFilter.tooltip')}
                                style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
                            >
                                ?
                            </span>
                        </h3>
                        <div className="functional-group-input-container">
                            <Autocomplete
                                style={{ backgroundColor: '#fff' }}
                                options={filteredFunctionalGroupOptions}
                                value={functionGroupValue}
                                onChange={(event, newValue) => {
                                    setFunctionalGroupValue(newValue);
                                    setSelectedFunctionalGroup(newValue?.label || '');
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label={t('explorer.functionalGroupFilter.searchLabel')} variant="outlined" fullWidth />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.value}>
                                        <span style={{ fontSize: '14px' }}>{option.label}</span>
                                        <span style={{ fontSize: '12px', color: '#888', marginLeft: '8px' }}>{option.count} matches</span>
                                    </li>
                                )}
                                clearText="Reset Filter"
                                sx={{
                                    '& .MuiInputBase-input': {
                                        fontSize: '14px', // Adjust this value
                                    },
                                    '& .MuiInputLabel-root': {
                                        fontSize: '14px', // Label font size
                                    },
                                    '& .MuiAutocomplete-option': {
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Sidebar>)
}

export default ExplorerPage;