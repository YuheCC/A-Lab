import Slider from "@/components/Slider";
import { useEffect, useState, useMemo, useRef, forwardRef, useImperativeHandle, useDeferredValue } from "react";
import { usePlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import { Autocomplete, TextField } from "@mui/material";
import { useTranslation } from 'react-i18next';

// 复用Filter页面的类型和选项
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

export interface OrganicFilterRef {
    resetFilters: () => void;
    getFilteredData: () => any[];
}

interface OrganicFilterProps {
    onDataFiltered: (data: any[]) => void;
}

// Filter labels
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
    // ... 其他功能组选项可以根据需要添加
];

const OrganicFilter = forwardRef<OrganicFilterRef, OrganicFilterProps>(({ onDataFiltered }, ref) => {
    const { t } = useTranslation();
    const { userPermissions, isAuthenticated } = useAuthStore();
    const { data, propertyRanges } = usePlotDataStore();

    const [tempFilterRanges, setTempFilterRanges] = useState<{ [key: string]: [number, number] }>({});
    const [filterRanges, setFilterRanges] = useState<FilterRanges>({});

    const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState<string>('');
    const [functionGroupValue, setFunctionalGroupValue] = useState<FunctionalGroupOption | null>(null);

    // Count active filters
    const activeFilterCount = Object.values(filterRanges as Record<string, FilterRange>).filter(range => range.active).length;

    // Get localized filter labels
    const getFilterLabel = (property: string): string => {
        return t(`explorer.filterLabels.${property}`, filterLabels[property]);
    };

    // Reset filters function
    const resetFilters = () => {
        setFilterRanges(prev => {
            const newRanges: FilterRanges = {};
            for (const [key, range] of Object.entries(prev)) {
                newRanges[key] = { ...range, range: [range.min, range.max], active: false };
            }
            return newRanges;
        });
        setTempFilterRanges({});
        setSelectedFunctionalGroup('');
        setFunctionalGroupValue(null);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        resetFilters,
        getFilteredData: () => filteredGraphData
    }));

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

        const filtered: any[] = [];
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
                node.properties._parsedFunctionalGroups.forEach((g: string) =>
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

    // Notify parent when filtered data changes
    useEffect(() => {
        onDataFiltered(filteredGraphData);
    }, [filteredGraphData, onDataFiltered]);

    // Handle filter change
    const handleFilterChange = (property: string, newValue: [number, number], isCommitted: boolean) => {
        if (isCommitted) {
            setFilterRanges(prev => ({
                ...prev,
                [property]: {
                    ...prev[property],
                    range: newValue,
                    active: true
                }
            }));
        } else {
            setTempFilterRanges(prev => ({
                ...prev,
                [property]: newValue
            }));
        }
    };

    // Reset specific filter
    const resetFilter = (property: string) => {
        setFilterRanges(prev => ({
            ...prev,
            [property]: {
                ...prev[property],
                range: [prev[property].min, prev[property].max],
                active: false
            }
        }));

        setTempFilterRanges(prev => {
            const newTempRanges = { ...prev };
            delete newTempRanges[property];
            return newTempRanges;
        });
    };

    return (
        <div style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <h2>
                {t('explorer.filtersTitle')}
                {activeFilterCount > 0 && (
                    <button
                        className="reset-button"
                        onClick={resetFilters}
                        title={t('explorer.resetAllButton')}
                    >
                        {t('explorer.resetAllButton')}
                    </button>
                )}
            </h2>
            <div className="sliders-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
                {Object.entries(filterRanges as Record<string, FilterRange>).map(([property, range]) => {
                    // Hide predicted properties sliders for users without proper permissions
                    if ((property === 'predicted_mp' || property === 'predicted_bp' || property === 'predicted_fp') &&
                        !(isAuthenticated && (userPermissions === 'admin' || userPermissions === 'enterprise'))) {
                        return null;
                    }

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
                                    fontSize: '14px',
                                },
                                '& .MuiInputLabel-root': {
                                    fontSize: '14px',
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
    );
});

OrganicFilter.displayName = 'OrganicFilter';

export default OrganicFilter;