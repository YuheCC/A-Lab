import Slider from "@/components/Slider";
import { useEffect, useState, useMemo, useRef } from "react";
import { useInorganicPlotDataStore } from "@/models/usePlotData";
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

// Labels for inorganic filters
export const inorganicFilterLabels: { [key: string]: string } = {
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

export const inorganicFunctionGroupOptions: FunctionalGroupOption[] = [
    { label: "Halide", value: "[F,Cl,Br,I]" },
    { label: "Oxide", value: "[O-2]" },
    { label: "Sulfide", value: "[S-2]" },
    { label: "Nitride", value: "[N-3]" },
    { label: "Phosphide", value: "[P-3]" },
    { label: "Carbide", value: "[C-4]" },
    { label: "Silicate", value: "[Si]([O-])[O-]" },
    { label: "Phosphate", value: "[P]([O-])([O-])[O-]" },
    { label: "Sulfate", value: "[S]([O-])([O-])([O-])[O-]" },
    { label: "Carbonate", value: "[C]([O-])([O-])[O-]" },
    { label: "Nitrate", value: "[N]([O-])([O-])[O-]" },
    { label: "Chlorate", value: "[Cl]([O-])([O-])[O-]" },
    { label: "Bromate", value: "[Br]([O-])([O-])[O-]" },
    { label: "Iodate", value: "[I]([O-])([O-])[O-]" },
    { label: "Perchlorate", value: "[Cl]([O-])([O-])([O-])[O-]" },
    { label: "Permanganate", value: "[Mn]([O-])([O-])([O-])[O-]" },
    { label: "Chromate", value: "[Cr]([O-])([O-])([O-])[O-]" },
    { label: "Dichromate", value: "[Cr2]([O-])([O-])([O-])([O-])([O-])([O-])([O-])" },
    { label: "Molybdate", value: "[Mo]([O-])([O-])([O-])[O-]" },
    { label: "Tungstate", value: "[W]([O-])([O-])([O-])[O-]" }
];

const InorganicFilters = () => {
    const { t } = useTranslation();
    const [ node, setNode ] = useState<Node | null>(null);
    const nodePopupRef = useRef<NodePopupRef>(null);

    const { userPermissions, isAuthenticated } = useAuthStore();
    const { data, loading, error, fetchData } = useInorganicPlotDataStore(); 

    const [filteredGraphData, setFilteredGraphData] = useState<Node[]>(data);
    const [tempFilterRanges, setTempFilterRanges] = useState<{ [key: string]: [number, number] }>({});

    const [filteredFunctionalGroupOptions, setFilteredFunctionalGroupOptions] = useState<FunctionalGroupOption[]>(inorganicFunctionGroupOptions);

    // 组件挂载时获取数据
    useEffect(() => {
        if (data.length === 0) {
            fetchData();
        }
    }, [data.length, fetchData]);

    // New filter implementation with range values
    const [filterRanges, setFilterRanges] = useState<FilterRanges>({
        molwt: { min: 0, max: 1000, range: [0, 1000], active: false },
        homo_eV: { min: -10, max: 0, range: [-10, 0], active: false },
        lumo_eV: { min: -5, max: 5, range: [-5, 5], active: false },
        esp_max_eV: { min: -2, max: 2, range: [-2, 2], active: false },
        esp_min_eV: { min: -2, max: 0, range: [-2, 0], active: false },
        predicted_mp: { min: 0, max: 300, range: [0, 300], active: false },
        predicted_bp: { min: 0, max: 300, range: [0, 300], active: false }
    });

    // Count how many filters are active
    const activeFilterCount = Object.values(filterRanges as Record<string, FilterRange>).filter(range => range.active).length;

    // Add state for functional group filter
    const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState<string>('');
    const [functionGroupValue, setFunctionalGroupValue] = useState<FunctionalGroupOption | null>(null);

    // Get localized filter labels
    const getFilterLabel = (property: string): string => {
        return t(`explorer.filterLabels.${property}`, inorganicFilterLabels[property]);
    };
    
    // Clean up any stale filter entries when component mounts
    useEffect(() => {
        setFilterRanges(prev => {
            const cleanedRanges: FilterRanges = {};
            // Only keep entries that are in inorganicFilterLabels
            for (const [key, range] of Object.entries(prev)) {
                if (inorganicFilterLabels[key as keyof typeof inorganicFilterLabels]) {
                    cleanedRanges[key] = range;
                }
            }
            return cleanedRanges;
        });
    }, []); // Run only on mount

    useEffect(() => {
        setFilterRanges(oldFilterRanges => {
            const updatedRanges: FilterRanges = {};
            // Only include properties that are in inorganicFilterLabels
            for (const key in inorganicFilterLabels) {
                if(key === 'chemical_formula' || key === 'functional_groups') continue;
                const values = data
                    .map(node => (node.properties as any)[key])
                    .filter(v => v !== undefined && v !== null);
                if (values.length > 0) {
                    // Use reduce to avoid stack overflow with large arrays
                    const min = values.reduce((a, b) => Math.min(a, b));
                    const max = values.reduce((a, b) => Math.max(a, b));
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
        const newFunctionalGroupOptions = inorganicFunctionGroupOptions.map(option => {
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
                const nodeValue = (node.properties as any)[property];
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
            // Only reset filters that are in inorganicFilterLabels
            for (const [key, range] of Object.entries(prev)) {
                if (inorganicFilterLabels[key as keyof typeof inorganicFilterLabels]) {
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
                molecularType="inorganic"
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
    }, [filteredGraphData, loading, error, userPermissions, t]);

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
                        {/* <div className="functional-group-filter">
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
                        </div> */}
                    </div>
                </div>
            </div>
            <NodePopup
                node={node}
                ref={nodePopupRef}
                molecularType="inorganic"
            />
        </>
    );
};

export default InorganicFilters;
