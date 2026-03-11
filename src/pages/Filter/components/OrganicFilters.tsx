import Slider from "@/components/Slider";
import { useEffect, useState, useMemo, useRef, useDeferredValue } from "react";
import { usePlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from 'react-i18next';
import NodePopup from "@/components/NodePopup";

// 定义类型
interface Node {
    id: string;
    x: number;
    y: number;
    smiles: string;
    properties: {
        molwt: number;
        homo_eV: number;
        lumo_eV: number;
        esp_min_eV: number;
        esp_max_eV: number;
        functional_groups: string;
        predicted_mp: number;
        predicted_bp: number;
        predicted_fp: number;
        chemical_formula: string;
        combustion_enthalpy: number;
        commercial_score: number;
        commercial_link: string;
        CLUSTER: string;
        [key: string]: any; // 允许其他属性
    };
    rawData: any;
}

interface FilterRange {
    min: number;
    max: number;
    range: [number, number];
    active: boolean;
}

interface FilterRanges {
    [key: string]: FilterRange;
}

interface FunctionalGroupOption {
    label: string;
    value: string;
    count?: number;
}

interface NodePopupRef {
    open: () => void;
    show: () => void;
    hide: () => void;
}

// Labels for filters
export const filterLabels: { [key: string]: string } = {
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

export const functionGroupOptions: FunctionalGroupOption[] = [
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
];

const OrganicFilters = () => {
    const { t } = useTranslation();
    const [ node, setNode ] = useState<Node | null>(null);
    const nodePopupRef = useRef<NodePopupRef>(null);

    const { userPermissions, isAuthenticated } = useAuthStore();
    const { data, loading, error, propertyRanges, fetchData, fetchInitialData } = usePlotDataStore();

    // 组件挂载时获取数据
    useEffect(() => {
        if (data.length === 0) {
            fetchInitialData();
            fetchData();
        }
    }, [data.length, fetchData, fetchInitialData]);

    const [tempFilterRanges, setTempFilterRanges] = useState<{ [key: string]: [number, number] }>({});
    const [filterRanges, setFilterRanges] = useState<FilterRanges>({});

    // Count how many filters are active
    const activeFilterCount = Object.values(filterRanges as Record<string, FilterRange>).filter(range => range.active).length;

    // Add state for functional group filter
    const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState<string>('');
    const [functionGroupValue, setFunctionalGroupValue] = useState<FunctionalGroupOption | null>(null);

    // Get localized filter labels
    const getFilterLabel = (property: string): string => {
        return t(`explorer.filterLabels.${property}`, filterLabels[property]);
    };

    // Initialize filterRanges from store precomputed propertyRanges
    useEffect(() => {
        if (!propertyRanges || Object.keys(propertyRanges).length === 0) return;
        const updatedRanges: FilterRanges = {};
        for (const key in filterLabels) {
            if (key === 'chemical_formula' || key === 'functional_groups') continue;
            if (propertyRanges[key]) {
                updatedRanges[key] = {
                    min: propertyRanges[key].min,
                    max: propertyRanges[key].max,
                    range: [propertyRanges[key].min, propertyRanges[key].max],
                    active: false
                };
            }
        }
        setFilterRanges(updatedRanges);
    }, [propertyRanges]);

    const deferredFilterRanges = useDeferredValue(filterRanges);
    const deferredSelectedFunctionalGroup = useDeferredValue(selectedFunctionalGroup);

    // Single-pass: filter data + compute functional group options
    const { filteredGraphData, filteredFunctionalGroupOptions } = useMemo(() => {
        if (data.length === 0) return { filteredGraphData: [], filteredFunctionalGroupOptions: [] };

        const filtered: Node[] = [];
        const counts = new Map<string, number>();

        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            let pass = true;

            for (const [property, range] of Object.entries(deferredFilterRanges)) {
                if (!range.active) continue;
                const v = (node.properties as any)[property];
                if (v !== undefined && v !== null && (v < range.range[0] || v > range.range[1])) {
                    pass = false;
                    break;
                }
            }

            if (pass && deferredSelectedFunctionalGroup) {
                if (!node.properties._parsedFunctionalGroups.includes(deferredSelectedFunctionalGroup)) {
                    pass = false;
                }
            }

            if (pass) {
                filtered.push(node);
                node.properties._parsedFunctionalGroups.forEach(g =>
                    counts.set(g, (counts.get(g) ?? 0) + 1)
                );
            }
        }

        return {
            filteredGraphData: filtered,
            filteredFunctionalGroupOptions: Array.from(counts.entries()).map(([label, count]) => ({
                label, value: label, count
            }))
        };
    }, [data, deferredFilterRanges, deferredSelectedFunctionalGroup]);

    // Handle filter slider change
    const handleFilterChange = (property: string, newValue: [number, number], isCommitted: boolean) => {
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
    const resetFilter = (property: string) => {
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
            const newRanges: FilterRanges = {};
            for (const [key, range] of Object.entries(prev)) {
                newRanges[key] = { ...range, range: [range.min, range.max], active: false };
            }
            return newRanges;
        });
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
                isAuthenticated={isAuthenticated}
                molecularType="organic"
                onClick={(node: Node) => {
                    console.log(node);
                    setNode(node);
                    nodePopupRef.current?.show();
                }}
            />
        ) : (
            <div className="loading-message">
                {loading ? t('explorer.loadingMap') : error ? t('explorer.errorLoadingData') : t('explorer.noDataAvailable')}
            </div>
        ))
    }, [filteredGraphData, loading, error, userPermissions, isAuthenticated, t]);

    return (
        <>
            <div className="filter-umap-container">
                <div className="filter-umap-section">
                    <div className="graph-container filter-graph">
                        {memoizedPlot}
                    </div>
                </div>
                <div className="filter-interface-section" style={{ flex: '0.8', padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '40px' }}>
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
                        {Object.entries(filterRanges as Record<string, FilterRange>).map(([property, range]) => {
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
            <NodePopup
                node={node}
                ref={nodePopupRef}
                molecularType="organic"
            />
        </>
    );
};

export default OrganicFilters;
