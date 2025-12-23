import MoleculeFeedbackBox from '@/components/MoleculeFeedbackBox';
import SearchInput from "@/components/Search";
import { useMemo, useState, useRef, useEffect, useContext, useCallback } from "react";
import { authFetch, COMMERCIAL_SCORE_MAP,  getAPIUrl } from "@/utils";
import { raiseResponseError } from '@/utils/errorHelpers';
import { buildAutoFetchURL } from "@/services/config/autoFetch";
import { findFriends } from "@/services/findFriends";
import { buildQueryString } from "@/services/buildQueryString";
import { usePlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import MolCard from "@/components/MolCard";
import OverallScoreValue from '@/components/OverallScoreValue';
import type { ScoreBreakdownItem } from '@/components/ScoreBreakdownValue';
import CustomButton from "@/components/CustomButton";
import { ExternalLink, Star, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";
import { FavoriteContext } from "@/layouts";
import FindFriendOptions from "./FindFriendOptions";
import { createLlmGradeProp, ReasoningModal } from "@/components/LlmGrade";
import { useQueryLimit } from '@/hooks/useQueryLimit';
import OrganicFilter, { OrganicFilterRef } from './OrganicFilter';
import '../index.css';
import { PUBLIC_SEARCH_LOCKED_VALUES } from '@/constants/publicDefaults';
import { useAccessModals } from '@/hooks/useAccessModals';
import { isColumnVisibleForUser } from '@/constants/columnAccess';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import { ENABLE_CASRN_DISPLAY } from '@/constants/featureFlags';
import type { AdditiveCategoryType } from '@/constants/additiveCategories';
import {
    DEFAULT_ADDITIVE_CATEGORY,
    DEFAULT_ADDITIVE_SUBTYPE,
    getAdditiveSubtypeLabelKey,
    getDefaultSubtypeForCategory,
    isValidAdditiveSubtype,
} from '@/constants/additiveCategories';

const API_URL = getAPIUrl();

// 定义类型
interface MoleculeData {
    smiles: string;
    cation?: string;
    casrn?: string;
    x: number;
    y: number;
    image?: string;
    grade?: number;
    reasoning?: string;
    properties: {
        molwt: number;
        homo_eV: number;
        lumo_eV: number;
        esp_min_eV: number;
        esp_max_eV: number;
        functional_groups: string;
        predicted_mp?: number;
        predicted_bp?: number;
        predicted_fp_celsius?: number;
        combustion_enthalpy_ev?: number;
        commercial_score: number;
        commercial_link?: string;
    };
    rawData: any;
}

interface SimilarMolecule {
    SMILES: string;
    cation?: string;
    CASRN?: string;
    molecular_weight: number;
    HOMO_eV: number;
    LUMO_eV: number;
    ESP_min_eV: number;
    ESP_max_eV: number;
    predicted_MP_celsius?: number;
    predicted_BP_celsius?: number;
    predicted_FP_celsius?: number;
    COMBUSTION_ENTHALPY_EV?: number;
    COMMERCIAL_SCORE: number;
    COMMERCIAL_LINK?: string;
    functional_groups?: string;
    UMAP_0: number;
    UMAP_1: number;
    image?: string;
    grade?: number;
    reasoning?: string;
}

type SearchResultItem =
    | { type: 'molecule'; molecule: MoleculeData }
    | { type: 'warning'; message: string };

const ORGANIC_PROPERTY_DEFINITIONS = [
    { columnId: 'HOMO_eV', labelKey: 'search.properties.homo', fallback: 'HOMO' },
    { columnId: 'LUMO_eV', labelKey: 'search.properties.lumo', fallback: 'LUMO' },
    { columnId: 'ESP_min_eV', labelKey: 'search.properties.espMin', fallback: 'ESP Min' },
    { columnId: 'ESP_max_eV', labelKey: 'search.properties.espMax', fallback: 'ESP Max' },
    { columnId: 'molecular_weight', labelKey: 'search.properties.molecularWeight', fallback: 'Molecular Weight' },
    { columnId: 'combustion_enthalpy_ev', labelKey: 'search.properties.combustionEnthalpy', fallback: 'Combustion Enthalpy' },
    { columnId: 'predicted_MP_celsius', labelKey: 'search.properties.predictedMp', fallback: 'Predicted Melting Point' },
    { columnId: 'predicted_BP_celsius', labelKey: 'search.properties.predictedBp', fallback: 'Predicted Boiling Point' },
    { columnId: 'predicted_FP_celsius', labelKey: 'search.properties.predictedFp', fallback: 'Predicted Flash Point' },
];

const ORGANIC_SEARCH_PLACEHOLDER = 'fluoroethylene carbonate, DTD, CCOC(=O)OCC, 96-49-1';
const REMOVED_FILTER_WARNING_PREFIX = 'Removed property filters due to empty results';
const MASKED_FILTER_WARNING_MESSAGE = 'Disabled some property filters due to empty results.';

const OrganicSearch = ({ isPublicUser = false }: { isPublicUser?: boolean }) => {
    const { t, i18n } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const initialAuthLoaded = useAuthStore(state => state.initialAuthLoaded);
    const isPublic = isPublicUser || (initialAuthLoaded && (!isAuthenticated || userPermissions === 'common'));
    const isAdminTierUser = userPermissions === 'admin';
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);
    const { moleculeFavoriteStatus, setMoleculeFavoriteStatus, handleAddToFavorites } = useContext(FavoriteContext);

    const { data, loading, error } = usePlotDataStore();

    const searchInputRef = useRef<any>(null);

    const [searchResults, setsearchResults] = useState<string[] | null>(null);
    const [lastSearch, setLastSearch] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchWarning, setSearchWarning] = useState<string | null>(null);
    const [searchedMolecules, setsearchedMolecules] = useState<MoleculeData[] | null>(null);
    const [searchedResultItems, setSearchedResultItems] = useState<SearchResultItem[] | null>(null);
    const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState<SimilarMolecule[]>([]);
    const [similarMoleculeImages, setSimilarMoleculeImages] = useState<{[key: number]: string}>({}); // Add state for similar molecule images
    const [findFriendMessages, setFindFriendMessages] = useState<string[]>([]);
    const findClosestFriends = true;
    const [findFriendsLoading, setFindFriendsLoading] = useState(false);
    const [structureWeight, setStructureWeight] = useState(0.5);
    const [numResults, setNumResults] = useState(30);
    const [selectedMolType, setSelectedMolType] = useState('solvent');
    const [additiveCategory, setAdditiveCategory] = useState<AdditiveCategoryType>(DEFAULT_ADDITIVE_CATEGORY);
    const [additiveSubtype, setAdditiveSubtype] = useState<string>(DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY]);
    const [extraRequests, setExtraRequests] = useState('');
    const defaultCompute = useMemo(() => 'Disabled', []);
    const [computeLevel, setComputeLevel] = useState<string>(defaultCompute);
    const [showHypothetical, setShowHypothetical] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [reasoningText, setReasoningText] = useState<string | null>(null);
    const { limits: queryLimits } = useQueryLimit();
    const triggerAccessModal = useAccessModals();

    const canShowColumn = useCallback(
        (columnId?: string | null) => isColumnVisibleForUser(columnId, userPermissions),
        [userPermissions]
    );

    const formatListForLocale = useCallback(
        (items: string[]) => {
            if (items.length === 0) {
                return '';
            }
            try {
                const formatter = new Intl.ListFormat(i18n.language, { style: 'long', type: 'conjunction' });
                return formatter.format(items);
            } catch (_error) {
                return items.join(', ');
            }
        },
        [i18n.language]
    );

    const accessiblePropertyLabels = useMemo(
        () => ORGANIC_PROPERTY_DEFINITIONS
            .filter(({ columnId }) => canShowColumn(columnId))
            .map(({ labelKey, fallback }) => t(labelKey, fallback)),
        [canShowColumn, t]
    );

    const propertyRangeBullet = useMemo(() => {
        if (accessiblePropertyLabels.length === 0) {
            return null;
        }
        const formatted = formatListForLocale(accessiblePropertyLabels);
        return t('search.propertyConstraints.valueRangeBullet', { properties: formatted });
    }, [accessiblePropertyLabels, formatListForLocale, t]);

    const propertyConstraintBullets = useMemo(() => {
        const bullets = [
            t('search.propertyConstraints.atomCounts'),
            canShowColumn('functional_groups') ? t('search.propertyConstraints.functionalGroups') : null,
            canShowColumn('commercial_score') ? t('search.propertyConstraints.commercialAvailability') : null,
            propertyRangeBullet,
        ];
        return bullets.filter(Boolean) as string[];
    }, [t, canShowColumn, propertyRangeBullet]);

    const searchTooltipLines = useMemo(() => {
        const lines = t('search.similarityTooltip.lines', { returnObjects: true });
        if (Array.isArray(lines)) {
            return lines;
        }
        if (lines == null) {
            return [];
        }
        return [String(lines)];
    }, [t]);

    const propertyTooltipDescription = useMemo(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0 }}>{t('search.propertyConstraints.tooltipIntro')}</p>
            {propertyConstraintBullets.length > 0 && (
                <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {propertyConstraintBullets.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            )}
        </div>
    ), [propertyConstraintBullets, t]);

    const searchTooltipDescription = useMemo(() => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchTooltipLines.map((line, index) => (
                <p key={`${line}-${index}`} style={{ margin: 0 }}>{line}</p>
            ))}
        </div>
    ), [searchTooltipLines]);

    const getFindFriendDisplayMessage = useCallback(
        (message: string) => {
            if (!isAdminTierUser && message.includes(REMOVED_FILTER_WARNING_PREFIX)) {
                return MASKED_FILTER_WARNING_MESSAGE;
            }
            return message;
        },
        [isAdminTierUser]
    );

    // 界面模式切换状态
    const [interfaceMode, setInterfaceMode] = useState<'search' | 'filter'>('search');
    const [filteredPlotData, setFilteredPlotData] = useState<any[]>([]);
    const organicFilterRef = useRef<OrganicFilterRef>(null);
    const [cathode, setCathode] = useState('');
    const [anode, setAnode] = useState('');
    const [solvent, setSolvent] = useState('');
    const [cellDesign, setCellDesign] = useState('');
    const [metric, setMetric] = useState('');

    useEffect(() => {
        setComputeLevel(defaultCompute);
    }, [defaultCompute]);

    useEffect(() => {
        if (!isPublic) return;
        setSelectedMolType(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.moleculeType);
        setAdditiveCategory(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.additiveCategory);
        setAdditiveSubtype(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.additiveSubtype);
        setComputeLevel(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.computeLevel);
        setShowHypothetical(false);
        setShowAdvanced(false);
        setExtraRequests('');
        setCathode('');
        setAnode('');
        setSolvent('');
        setCellDesign('');
        setMetric('');
        setNumResults(30);
    }, [isPublic]);

    // Add state for find-friend error message
    const [findFriendError, setFindFriendError] = useState<string | null>(null);

    // Add new state for highlighted molecule
    const [highlightedMolecules, setHighlightedMolecules] = useState<MoleculeData[]>([]);

    useEffect(() => {
        if (!isValidAdditiveSubtype(additiveCategory, additiveSubtype)) {
            setAdditiveSubtype(getDefaultSubtypeForCategory(additiveCategory));
        }
    }, [additiveCategory, additiveSubtype]);

    const getRecordField = (record: any, key: string) => {
        if (!record || !key) return undefined;
        const direct = record[key];
        if (direct !== undefined && direct !== null) {
            return direct;
        }
        const upperKey = key.toUpperCase();
        if (upperKey) {
            const upperValue = record[upperKey];
            if (upperValue !== undefined && upperValue !== null) {
                return upperValue;
            }
        }
        return undefined;
    };

    const extractScoreValue = (record: any, key: string): number | null => {
        const value = getRecordField(record, key);
        if (value === undefined) return null;
        const numeric = Number(value);
        return Number.isNaN(numeric) ? null : numeric;
    };

    const scaleScoreToTen = (value: number | null): number | null => {
        if (value === null) return null;
        const clamped = Math.min(Math.max(value, 0), 1);
        return parseFloat((clamped * 10).toFixed(2));
    };

    const getScoreColor = (scaled: number): string => {
        const normalized = Math.min(Math.max(scaled / 10, 0), 1);
        const hue = normalized * 120;
        return `hsl(${Math.round(hue)}, 70%, 45%)`;
    };

    const buildSubscoreItems = (record: any, key: string): ScoreBreakdownItem[] => {
        const source = getRecordField(record, key);
        if (!source) return [];

        type NormalizedSubscore = { label: string; scaled: number };
        const normalized: NormalizedSubscore[] = [];

        const addSubscore = (labelCandidate: unknown, valueCandidate: unknown) => {
            if (valueCandidate === null || valueCandidate === undefined || valueCandidate === '') {
                return;
            }
            const numeric = Number(valueCandidate);
            if (Number.isNaN(numeric)) {
                return;
            }
            const scaled = scaleScoreToTen(numeric);
            if (scaled === null) {
                return;
            }
            const labelString =
                typeof labelCandidate === 'string' && labelCandidate.trim().length > 0
                    ? labelCandidate
                    : `Subscore ${normalized.length + 1}`;
            normalized.push({ label: labelString, scaled });
        };

        const processEntry = (entry: unknown, fallbackLabel?: string) => {
            if (entry === null || entry === undefined) {
                return;
            }
            if (typeof entry === 'number' || typeof entry === 'string') {
                addSubscore(fallbackLabel, entry);
                return;
            }
            if (Array.isArray(entry)) {
                if (entry.length === 0) return;
                const [labelCandidate, valueCandidate] = entry;
                addSubscore(
                    typeof labelCandidate === 'string' ? labelCandidate : fallbackLabel,
                    valueCandidate,
                );
                return;
            }
            if (typeof entry === 'object') {
                const obj = entry as Record<string, unknown>;
                const labelCandidate =
                    obj.label ?? obj.name ?? obj.metric ?? obj.key ?? fallbackLabel;
                const valueCandidate =
                    obj.value ?? obj.score ?? obj.subscore ?? obj.result ?? obj.amount ?? obj.raw;

                if (valueCandidate !== undefined) {
                    addSubscore(labelCandidate, valueCandidate);
                    return;
                }

                Object.entries(obj).forEach(([nestedLabel, nestedValue]) => {
                    processEntry(nestedValue, nestedLabel);
                });
                return;
            }
        };

        if (Array.isArray(source)) {
            source.forEach((item, index) => {
                processEntry(item, `Subscore ${index + 1}`);
            });
        } else if (typeof source === 'object') {
            Object.entries(source as Record<string, unknown>).forEach(([label, value]) => {
                processEntry(value, label);
            });
        } else {
            processEntry(source);
        }

        return normalized.map((item, index) => ({
            key: `${key}-${index}-${item.label}`,
            label: item.label,
            displayValue: `${item.scaled.toFixed(2)}/10`,
            color: getScoreColor(item.scaled),
        }));
    };

    type ScoreSummary = {
        label: string;
        displayValue: string;
        color: string;
        subscores: ScoreBreakdownItem[];
    };

    const buildScoreSummary = (label: string, record: any, key: string, subscoreKey?: string): ScoreSummary | null => {
        const rawValue = extractScoreValue(record, key);
        const scaled = scaleScoreToTen(rawValue);
        if (scaled === null) {
            return null;
        }

        const displayValue = `${scaled.toFixed(2)}/10`;
        const color = getScoreColor(scaled);
        const subscores = subscoreKey ? buildSubscoreItems(record, subscoreKey) : [];

        return {
            label,
            displayValue,
            color,
            subscores,
        };
    };

    const buildOverallScoreProp = (
        record: any,
        label: string,
        propertySummary: ScoreSummary | null,
        structureSummary: ScoreSummary | null,
        gradeDetails: ReturnType<typeof createLlmGradeProp> | null
    ) => {
        const overallCandidates: Array<{ key: string; label?: string }> = [
            { key: 'overall_score', label },
            { key: 'combined_score', label: t('search.properties.combinedScore', 'Combined Score') },
            { key: 'property_suitability', label: t('search.properties.propertySuitability', 'Property Suitability') },
        ];

        let rawValue: number | null = null;
        let resolvedLabel = label;

        for (const candidate of overallCandidates) {
            const candidateValue = extractScoreValue(record, candidate.key);
            if (candidateValue !== null) {
                rawValue = candidateValue;
                resolvedLabel = candidate.label ?? label;
                break;
            }
        }

        if (rawValue === null) {
            return null;
        }

        const scaled = scaleScoreToTen(rawValue);
        if (scaled === null) {
            return null;
        }

        const displayValue = `${scaled.toFixed(2)}/10`;
        const color = getScoreColor(scaled);

        const gradeSummary = gradeDetails && gradeDetails.show !== false ? {
            label: gradeDetails.label,
            displayValue: `${gradeDetails.value}${gradeDetails.suffix ?? ''}`,
            color: gradeDetails.color,
            action: gradeDetails.action,
        } : null;

        return {
            label: resolvedLabel,
            value: displayValue,
            span: 2,
            color,
            disableAutoTooltip: true,
            valueNode: (
                <OverallScoreValue
                    label={resolvedLabel}
                    value={displayValue}
                    valueColor={color}
                    propertyScore={propertySummary || undefined}
                    structureScore={structureSummary || undefined}
                    llmGrade={gradeSummary || undefined}
                />
            ),
        };
    };

    // 处理界面模式切换
    const handleModeSwitch = (mode: 'search' | 'filter') => {
        if (mode !== interfaceMode) {
            // 重置当前模式的状态
            if (interfaceMode === 'search') {
                // 重置搜索状态
                setsearchResults(null);
                setsearchedMolecules(null);
                setSearchedResultItems(null);
                setHighlightedMolecules([]);
                setHighlightedSimilarMolecules([]);
                setSimilarMoleculeImages({});
                setFindFriendMessages([]);
                setSearchError(null);
                setSearchWarning(null);
                setFindFriendError(null);
                setAmbiguousOptions(null);
            } else {
                // 重置过滤状态
                organicFilterRef.current?.resetFilters();
            }
            setInterfaceMode(mode);
        }
    };

    // 添加拖拽分隔条的状态
    const [leftPanelWidth, setLeftPanelWidth] = useState(60); // 左侧面板宽度百分比
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    // 处理拖拽事件
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        isDraggingRef.current = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.classList.add('dragging');
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !containerRef.current) return;
        
        e.preventDefault();
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const mouseX = e.clientX - containerRect.left;
        const newLeftPanelWidth = (mouseX / containerWidth) * 100;
        
        // 限制拖拽范围在20%到80%之间
        if (newLeftPanelWidth >= 20 && newLeftPanelWidth <= 80) {
            setLeftPanelWidth(newLeftPanelWidth);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        isDraggingRef.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.classList.remove('dragging');
    };

    // 清理事件监听器
    useEffect(() => {
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove('dragging');
        };
    }, []);

    // Store ambiguous search options when backend indicates ambiguity
    const [ambiguousOptions, setAmbiguousOptions] = useState(null);
    const hasSearchedResultItems = Boolean(searchedResultItems && searchedResultItems.length > 0);

    // Update handleSearch function
    const handleSearchedMolecules = async (
        response: Response,
        select_first = false
    ): Promise<{ formattedMolecules: MoleculeData[] | null; ambiguity: any }> => {
        let formattedMolecules: MoleculeData[] | null = null;
        let ambiguity: any = null;
        try {
            const data = await response.json();

            // Normalize to an array of result envelopes
            const envelopes: any[] = Array.isArray(data) ? data : [data];

            // If any envelope reports ambiguity, capture it
            const ambiguousEnv = envelopes.find((env) => env && env.message === 'Ambiguous molecule abbreviation');
            if (ambiguousEnv) {
                ambiguity = ambiguousEnv.options ?? null;
            }

            const resultItems: SearchResultItem[] = [];
            const mappedMolecules: MoleculeData[] = [];

            const mapDetailToMolecule = (mol: any): MoleculeData => ({
                smiles: mol.SMILES,
                cation: mol.cation ?? mol.CATION,
                casrn: mol.CASRN ?? mol.casrn,
                x: mol.UMAP_0,
                y: mol.UMAP_1,
                image: mol.image,
                grade: mol.grade,
                reasoning: mol.reasoning,
                properties: {
                    molwt: mol.molecular_weight,
                    homo_eV: mol.HOMO_eV,
                    lumo_eV: mol.LUMO_eV,
                    esp_min_eV: mol.ESP_min_eV,
                    esp_max_eV: mol.ESP_max_eV,
                    functional_groups: mol.functional_groups,
                    predicted_mp: mol.predicted_MP_celsius,
                    predicted_bp: mol.predicted_BP_celsius,
                    predicted_fp_celsius: mol.predicted_FP_celsius,
                    combustion_enthalpy_ev: mol.COMBUSTION_ENTHALPY_EV,
                    commercial_score: mol.COMMERCIAL_SCORE,
                    commercial_link: mol.COMMERCIAL_LINK,
                },
                rawData: mol,
            });

            envelopes.forEach((env) => {
                if (env && env.found && Array.isArray(env.molecule_details) && env.molecule_details.length > 0) {
                    env.molecule_details.forEach((mol: any) => {
                        const mapped = mapDetailToMolecule(mol);
                        mappedMolecules.push(mapped);
                        resultItems.push({ type: 'molecule', molecule: mapped });
                    });
                } else if (env && env.found === false) {
                    if (env.message === 'Ambiguous molecule abbreviation') {
                        return;
                    }
                    const warningMessage = env.message ? String(env.message) : t('search.moleculeNotFound.title');
                    resultItems.push({ type: 'warning', message: warningMessage });
                }
            });

            if (mappedMolecules.length > 0) {
                if (select_first) {
                    const first = mappedMolecules[0];
                    setsearchedMolecules([first]);
                    setsearchResults([first.image || '']);
                    if (
                        first.x !== null &&
                        first.y !== null &&
                        first.x !== undefined &&
                        first.y !== undefined
                    ) {
                        setHighlightedMolecules([first]);
                    }
                } else {
                    setsearchedMolecules(mappedMolecules);
                    setsearchResults(mappedMolecules.map((m) => m.image || ''));
                    setHighlightedMolecules(mappedMolecules);
                }

                formattedMolecules = mappedMolecules;
            } else {
                setsearchedMolecules([]);
                setsearchResults([]);
                setHighlightedMolecules([]);
            }

            setSearchedResultItems(resultItems);
        } catch (error) {
            console.error('Error processing searched molecules:', error);
            setSearchedResultItems([]);
        }

        return { formattedMolecules, ambiguity };
    };

    const runFindFriends = async (seedSmiles: string[], allowEmptySeeds = false) => {
        if (seedSmiles.length === 0 && !allowEmptySeeds) {
            setSearchWarning(t('search.moleculeNotFound.title'));
            return;
        }

        setFindFriendsLoading(true);
        setFindFriendError(null);
        setFindFriendMessages([]);

        const isHighTier = ["admin", "enterprise", "joint"].includes(userPermissions || '');
        const computeEnabled = computeLevel !== 'Disabled';
        const optionsSpecified = [cathode, anode, solvent, cellDesign, metric].some(Boolean);

        let computeToSend = computeLevel;
        if (computeEnabled && computeLevel !== 'Low' && !optionsSpecified && !extraRequests.trim()) {
            setSearchWarning(t('search.computeWarning'));
            computeToSend = 'Low';
            setComputeLevel('Low');
        }

        const baseQuery = buildQueryString(cathode, anode, solvent, cellDesign, metric);
        const parts: string[] = [];
        if (baseQuery) {
            parts.push(baseQuery);
        }
        if (selectedMolType) {
            if (selectedMolType === 'additive') {
                const additiveLabelKey = getAdditiveSubtypeLabelKey(additiveCategory, additiveSubtype);
                const additiveLabel = additiveLabelKey
                    ? t(`search.moleculeTypes.additiveCategories.${additiveLabelKey}`)
                    : additiveSubtype;
                const trimmedLabel = additiveLabel.trim();
                const normalizedLabel = trimmedLabel
                    ? trimmedLabel.charAt(0).toLowerCase() + trimmedLabel.slice(1)
                    : trimmedLabel;
                const additiveQuery = normalizedLabel
                    ? `I am looking for additive molecules for ${normalizedLabel}.`
                    : 'I am looking for additive molecules.';
                parts.push(additiveQuery);
            } else {
                parts.push(`I am looking for ${selectedMolType} molecules.`);
            }
        }
        if (extraRequests.trim()) {
            parts.push(`I have the following requirements: ${extraRequests.trim()}`);
        }
        const queryString = parts.join(' ').trim();
        const includeQuery = optionsSpecified || !!extraRequests.trim() || !!selectedMolType;

        const molTypeToSend = selectedMolType === 'additive' ? additiveSubtype : selectedMolType;

        try {
            const { molecules, imageMap, messages } = await findFriends<SimilarMolecule>({
                smiles: seedSmiles,
                use35m: isHighTier,
                structureWeight: allowEmptySeeds && seedSmiles.length === 0 ? 0 : structureWeight,
                molType: molTypeToSend,
                computeLevel: computeToSend,
                showHypothetical,
                includeQuery,
                queryString,
                numResults,
            });

            setHighlightedSimilarMolecules(molecules);
            setSimilarMoleculeImages(imageMap);
            setFindFriendMessages(messages);
        } catch (friendError) {
            console.error('Error finding similar molecules:', friendError);
            setFindFriendError(t('search.findFriendError'));
            setFindFriendMessages([]);
        } finally {
            setFindFriendsLoading(false);
        }
    };

    const handleSearch = async (searchInput: string) => {
        const trimmedInput = searchInput.trim();
        const shouldRunFindFriendsOnly = trimmedInput.length === 0 && findClosestFriends;

        if (!trimmedInput && !findClosestFriends) {
            return;
        }

        setSearchLoading(!shouldRunFindFriendsOnly);
        setSearchWarning(null);
        setSearchError(null);
        setsearchResults(null);
        setsearchedMolecules(null);
        setSearchedResultItems(null);
        setHighlightedMolecules([]);
        setHighlightedSimilarMolecules([]);
        setSimilarMoleculeImages({}); // Reset similar molecule images
        setFindFriendMessages([]);
        setFindFriendError(null); // Reset find friend error
        setAmbiguousOptions(null); // Reset ambiguous search info
        setFindFriendsLoading(false);

        try {
            if (shouldRunFindFriendsOnly) {
                setsearchResults([]);
                await runFindFriends([], true);
            } else {
                // Determine which endpoint to use based on user permissions
                const searchEndpoint = buildAutoFetchURL('search');
                const molTypeToSend = selectedMolType === 'additive' ? additiveSubtype : selectedMolType;
                const molTypeParam = molTypeToSend ? `&mol_type=${encodeURIComponent(molTypeToSend)}` : '';

                // Fetch the searched molecule's properties 
                const moleculeResponse = await authFetch(
                    `${searchEndpoint}?query=${encodeURIComponent(trimmedInput)}&umap_type=organic${molTypeParam}`
                );

                // Ratelimit handling
                if (moleculeResponse.status === 429) {
                    setSearchWarning(t('search.tooManyRequests'));
                    setSearchLoading(false);
                    return;
                }
                if (!moleculeResponse.ok) {
                    await raiseResponseError(moleculeResponse, t('search.searchError'));
                }

                const { formattedMolecules, ambiguity } = await handleSearchedMolecules(moleculeResponse);

                if (ambiguity) {
                    setAmbiguousOptions(ambiguity);
                    return;
                }

                if (formattedMolecules && findClosestFriends) {
                    // Build an array of seed SMILES from all returned molecules
                    const smilesArray = formattedMolecules
                        .map((m) => (m.smiles ? m.smiles.trim() : ''))
                        .filter((s) => !!s);

                    setSearchLoading(false);
                    await runFindFriends(smilesArray);
                    return;
                }
            }
        } catch (apiError: any) {
            console.error('Error checking Snowflake database:', apiError);

            // 检查是否是未登录错误（401）或者token不存在
            const token = localStorage.getItem('token');
            const isUnauthorized = apiError?.response?.status === 401 || apiError?.status === 401;

            if (!token || isUnauthorized) {
                // 未登录或401错误时不显示错误信息
                setSearchError(null);
            } else {
                // 已登录且非401错误时显示错误信息
                const fallbackMessage = t('search.searchError');
                setSearchError(apiError instanceof Error && apiError.message ? apiError.message : fallbackMessage);
            }
        } finally {
            setSearchLoading(false);
            setLastSearch(searchInput);
        }
    };

    return (
        // SEARCH PAGE CONTENT:
        <>
            <ReasoningModal text={reasoningText} onClose={() => setReasoningText(null)} />
            <div
                className="search-umap-container"
                ref={containerRef}
            >
                {/* UMAP Visualization on the left */}
                <div
                    className="search-umap-section"
                    style={{
                        flex: `0 0 ${leftPanelWidth}%`
                    }}
                >
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        position: 'relative',
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                    }}>
                        {data.length > 0 ? (
                            <UMAPClusterPlotDeck
                                zoomOffset={-0.3}
                                data={interfaceMode === 'filter' ? filteredPlotData : data}
                                highlightedData={interfaceMode === 'search' ? highlightedMolecules : []}
                                highlightedSimilarData={interfaceMode === 'search' ? highlightedSimilarMolecules : []}
                                userPermissions={userPermissions}
                                isAuthenticated={isAuthenticated}
                                molecularType="organic"
                                enableAutoHover={false}
                                onClick={(node: any) => {
                                    setNode(node);
                                    nodePopupRef.current?.show();
                                }}
                            />
                        ) : (
                            <div className="loading-message">
                                {loading ? t('search.loadingMap') : error ? t('search.errorLoadingData') : t('search.noDataAvailable')}
                            </div>
                        )}
                    </div>
                </div>

                {/* 可拖拽的分隔条 */}
                <div 
                    className="resize-divider"
                    onMouseDown={handleMouseDown}
                    style={{
                        transition: isDragging ? 'none' : 'background-color 0.2s ease'
                    }}
                />

                {/* Search interface on the right */}
                <div
                    className={`search-interface-section ${interfaceMode === 'filter' ? 'filter-mode' : ''}`}
                    style={{
                        flex: 1,
                        minWidth: 0
                    }}
                >
                    {/* 模式切换按钮 */}
                    <div className="mode-switch-container" style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '20px',
                        justifyContent: 'flex-end'
                    }}>
                        <button
                            className={`mode-switch-btn ${interfaceMode === 'search' ? 'active' : ''}`}
                            onClick={() => handleModeSwitch('search')}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: interfaceMode === 'search' ? '#4CAF50' : '#fff',
                                color: interfaceMode === 'search' ? '#fff' : '#666',
                                borderColor: interfaceMode === 'search' ? '#4CAF50' : '#d1d5db'
                            }}
                        >
                            {t('navigation.header.search', '搜索')}
                        </button>
                        <button
                            className={`mode-switch-btn ${interfaceMode === 'filter' ? 'active' : ''}`}
                            onClick={() => handleModeSwitch('filter')}
                            style={{
                                padding: '6px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: interfaceMode === 'filter' ? '#4CAF50' : '#fff',
                                color: interfaceMode === 'filter' ? '#fff' : '#666',
                                borderColor: interfaceMode === 'filter' ? '#4CAF50' : '#d1d5db'
                            }}
                        >
                            {t('navigation.header.filter', '过滤')}
                        </button>
                    </div>

                    {/* 根据模式显示不同的界面 */}
                    {interfaceMode === 'search' ? (
                        <>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                    marginBottom: '12px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                }}
                            >
                                <span>{t('search.similarityPrompt')}</span>
                                <InfoTooltip
                                    title={(
                                        <InfoTooltipContent
                                            title={t('search.similarityTooltip.title')}
                                            description={searchTooltipDescription}
                                        />
                                    )}
                                    placement="top"
                                >
                                    <Info size={16} className="ff-info-icon" />
                                </InfoTooltip>
                            </div>

                            <SearchInput
                                ref={searchInputRef}
                                onSearch={handleSearch}
                                disabled={searchLoading || findFriendsLoading}
                                initialValue={isPublic ? PUBLIC_SEARCH_LOCKED_VALUES.organicInput : ''}
                                lockInput={isPublic}
                                initialEditorOpen={false}
                                lockMolEditorToggle={isPublic}
                                allowSubmitWhenLocked={isPublic}
                                onLockedClick={triggerAccessModal}
                                placeholder={ORGANIC_SEARCH_PLACEHOLDER}
                                showSubmitButton={false}
                            />

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                    margin: '12px 0',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                }}
                            >
                                <span>{t('search.propertyConstraints.intro')}</span>
                                <InfoTooltip
                                    title={(
                                        <InfoTooltipContent
                                            title={t('search.propertyConstraints.tooltipTitle')}
                                            description={propertyTooltipDescription}
                                        />
                                    )}
                                    placement="top"
                                >
                                    <Info size={16} className="ff-info-icon" />
                                </InfoTooltip>
                            </div>

                            <FindFriendOptions
                                extraRequests={extraRequests}
                                setExtraRequests={setExtraRequests}
                                showAdvanced={showAdvanced}
                                setShowAdvanced={setShowAdvanced}
                                selectedMolType={selectedMolType}
                                setSelectedMolType={setSelectedMolType}
                                additiveCategory={additiveCategory}
                                setAdditiveCategory={setAdditiveCategory}
                                additiveSubtype={additiveSubtype}
                                setAdditiveSubtype={setAdditiveSubtype}
                                computeLevel={computeLevel}
                                setComputeLevel={setComputeLevel}
                                structureWeight={structureWeight}
                                setStructureWeight={setStructureWeight}
                                showHypothetical={showHypothetical}
                                setShowHypothetical={setShowHypothetical}
                                numResults={numResults}
                                setNumResults={setNumResults}
                                cathode={cathode}
                                setCathode={setCathode}
                                anode={anode}
                                setAnode={setAnode}
                                solvent={solvent}
                                setSolvent={setSolvent}
                                cellDesign={cellDesign}
                                setCellDesign={setCellDesign}
                                metric={metric}
                                setMetric={setMetric}
                                userPermissions={userPermissions}
                                findFriendLimitInfo={queryLimits.findFriendLLM}
                                readOnly={isPublic}
                                onLockedClick={triggerAccessModal}
                                onSubmitSearch={() => searchInputRef.current?.submit?.()}
                                submitDisabled={searchLoading || findFriendsLoading}
                            />

                    <div className="search-results">
                        {searchLoading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>{t('search.searching')}</p>
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

                        {!searchLoading && !searchError && hasSearchedResultItems && (
                            <div className="molecule-properties">
                                <h3>{t('search.searchedMolecules')}</h3>
                                {(() => {
                                     let moleculeDisplayIndex = 0;
                                    const items = searchedResultItems ?? [];
                                    return items.map((item, index) => {
                                        if (item.type === 'warning') {
                                            return (
                                                <div key={`searched-warning-${index}`} className="warning-message">
                                                    <p>{item.message}</p>
                                                </div>
                                            );
                                        }

                                        const molecule = item.molecule;
                                        moleculeDisplayIndex += 1;

                                        const casCandidate = molecule.casrn ?? molecule.rawData?.CASRN ?? molecule.rawData?.casrn ?? molecule.rawData?.cas ?? molecule.rawData?.CAS;
                                        const includeCas = Boolean(ENABLE_CASRN_DISPLAY && canShowColumn('casrn') && casCandidate);
                                        const casFoldProp = includeCas
                                            ? {
                                                label: t('search.properties.casrn', 'CAS #'),
                                                value: String(casCandidate),
                                                span: 2,
                                                show: true,
                                            }
                                            : null;

                                        const scoreSource = molecule.rawData ?? molecule;
                                        const propertyScoreSummary = buildScoreSummary(
                                            t('search.properties.propertySuitability', 'Property Suitability'),
                                            scoreSource,
                                            'property_suitability',
                                            'property_subscores',
                                        );
                                        const structureScoreSummary = buildScoreSummary(
                                            t('search.properties.structureSimilarity', 'Structure Similarity'),
                                            scoreSource,
                                            'structure_similarity',
                                            'structure_subscores',
                                        );
                                        const gradeDetails = createLlmGradeProp(
                                            molecule.grade,
                                            molecule.reasoning,
                                            (text) => setReasoningText(text)
                                        );
                                        const overallScoreProp = buildOverallScoreProp(
                                            scoreSource,
                                            t('search.properties.overallScore', 'Overall Score'),
                                            propertyScoreSummary,
                                            structureScoreSummary,
                                            gradeDetails
                                        );
                                        const gradeProp = !overallScoreProp && gradeDetails?.show ? gradeDetails : null;

                                        const propGroups = [
                                            { label: t('search.properties.smiles'), value: molecule.smiles, span: 4, show: canShowColumn('smiles') },
                                            ...(overallScoreProp ? [overallScoreProp] : gradeProp ? [gradeProp] : []),
                                            { label: t('search.properties.molecularWeight'), value: molecule.properties.molwt, span: 2, suffix: ' g/mol', show: canShowColumn('molecular_weight') },
                                            { label: t('search.properties.predictedMp'), value: molecule.properties?.predicted_mp, suffix: '°C', span: 2,
                                                show: canShowColumn('predicted_MP_celsius')
                                             },
                                            { label: t('search.properties.predictedBp'), value: molecule.properties?.predicted_bp, suffix: '°C', span: 2,
                                                show: canShowColumn('predicted_BP_celsius')},
                                            { label: t('search.properties.predictedFp'), value: molecule.properties?.predicted_fp_celsius, suffix: '°C', span: 2,
                                                show: canShowColumn('predicted_FP_celsius')
                                            },
                                            {
                                                label: t('search.properties.combustionEnthalpy'),
                                                value: molecule.properties?.combustion_enthalpy_ev || '0.00',
                                                span: 2,
                                                suffix: ' eV',
                                                show: canShowColumn('combustion_enthalpy_ev')
                                            },
                                            { label: 'HOMO', value: molecule.properties.homo_eV, span: 2, suffix: ' eV', show: canShowColumn('HOMO_eV') },
                                            { label: 'LUMO', value: molecule.properties?.lumo_eV, span: 2, suffix: ' eV', show: canShowColumn('LUMO_eV') },
                                            { label: 'ESP Min', value: molecule.properties?.esp_min_eV, span: 2, suffix: ' eV', show: canShowColumn('ESP_min_eV') },
                                            { label: 'ESP Max', value: molecule.properties?.esp_max_eV, span: 2, suffix: ' eV', show: canShowColumn('ESP_max_eV') },
                                            { label: 'Commercial Viability', value: COMMERCIAL_SCORE_MAP[molecule.properties?.commercial_score as keyof typeof COMMERCIAL_SCORE_MAP], span: 4, wrap: true, show: canShowColumn('commercial_score')}
                                        ].filter(Boolean);

                                        const foldPropGroups = [
                                            ...(casFoldProp ? [casFoldProp] : []),
                                            { label: 'UMAP_X', value: molecule.x, span: 1, show: canShowColumn('umap_0') },
                                            { label: 'UMAP_Y', value: molecule.y, span: 1, show: canShowColumn('umap_1') },
                                            { label: 'Functional Groups', value: JSON.parse(molecule.properties?.functional_groups ?? "[]"), span: 4, show: canShowColumn('functional_groups') }
                                        ];

                                        return (
                                            <MolCard
                                                key={`searched-molecule-${molecule.smiles ?? index}`}
                                                name={t('search.moleculeNumber', { number: moleculeDisplayIndex })}
                                                showMoreDetails={false}
                                                large={true}
                                                cation={molecule.cation ?? molecule.rawData?.cation ?? molecule.rawData?.CATION}
                                                propGroups={propGroups}
                                                foldPropGroups={foldPropGroups}>
                                                {
                                                    isAuthenticated && (
                                                        <div style={{ display: 'flex', flexFlow: 'column', textAlign: 'center', width: '100%' }}>
                                                            <div style={{ display: 'flex', flexFlow: 'row', gap: '5px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                <CustomButton
                                                                    Icon={Star}
                                                                    style={{
                                                                        flexGrow: 1,
                                                                    }}
                                                                    onClick={() => {
                                                                        console.log('Add to Favorites payload (search):', molecule);
                                                                        handleAddToFavorites(molecule);
                                                                    }}
                                                                    loading={moleculeFavoriteStatus[molecule.smiles]?.loading}
                                                                    loadingText="Saving..."
                                                                    successMessage={moleculeFavoriteStatus[molecule.smiles]?.success}
                                                                    errorMessage={moleculeFavoriteStatus[molecule.smiles]?.error}
                                                                >
                                                                    {t("chatbox.buttons.addToFavorites")}
                                                                </CustomButton>
                                                                {
                                                                false && molecule.properties.commercial_link && <CustomButton Icon={ExternalLink} size="small" variant="outlined" onClick={() => {
                                                                    window.open(molecule.properties.commercial_link, '_blank', 'noopener,noreferrer');
                                                                    }}>
                                                                        {t("chatbox.buttons.viewInMolPort")}
                                                                    </CustomButton>
                                                                }
                                                            </div>

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
                                                    )
                                                }
                                            </MolCard>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                        {findClosestFriends && findFriendsLoading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>{t('search.searching')}</p>
                            </div>
                        )}
                        {!searchLoading && !searchError && findClosestFriends && (findFriendMessages.length > 0 || (highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0)) && (
                            <div className="similar-molecules">
                                <h3>{t('search.similarMolecules')}</h3>
                                {findFriendMessages.map((message, messageIndex) => (
                                    <div key={`find-friend-warning-${messageIndex}`} className="warning-message">
                                        <p>{getFindFriendDisplayMessage(message)}</p>
                                    </div>
                                ))}
                                {highlightedSimilarMolecules.map((molecule, index) => {
                                            const propertyScoreSummary = buildScoreSummary(
                                                t('search.properties.propertySuitability', 'Property Suitability'),
                                                molecule,
                                                'property_suitability',
                                                'property_subscores',
                                            );
                                            const structureScoreSummary = buildScoreSummary(
                                                t('search.properties.structureSimilarity', 'Structure Similarity'),
                                                molecule,
                                                'structure_similarity',
                                                'structure_subscores',
                                            );

                                            const casCandidate = molecule.CASRN ?? (molecule as any)?.casrn ?? (molecule as any)?.cas ?? (molecule as any)?.CAS;
                                            const includeCas = Boolean(ENABLE_CASRN_DISPLAY && canShowColumn('casrn') && casCandidate);
                                            const casFoldProp = includeCas
                                                ? {
                                                    label: t('search.properties.casrn', 'CAS #'),
                                                    value: String(casCandidate),
                                                    span: 2,
                                                    show: true,
                                                }
                                                : null;

                                            const gradeDetails = createLlmGradeProp(
                                                molecule.grade,
                                                molecule.reasoning,
                                                (text) => setReasoningText(text)
                                            );

                                            const overallScoreProp = buildOverallScoreProp(
                                                molecule,
                                                t('search.properties.overallScore', 'Overall Score'),
                                                propertyScoreSummary,
                                                structureScoreSummary,
                                                gradeDetails
                                            );

                                            const propGroups = [
                                                { label: t('search.properties.smiles'), value: molecule.SMILES, span: 4, show: canShowColumn('smiles') },
                                                ...(overallScoreProp ? [overallScoreProp] : []),
                                                { label: t('search.properties.molecularWeight'), value: molecule.molecular_weight, span: 2, suffix: ' g/mol', show: canShowColumn('molecular_weight') },
                                                { label: t('search.properties.predictedMp'), value: molecule.predicted_MP_celsius, suffix: '°C', span: 2,
                                                    show: canShowColumn('predicted_MP_celsius')
                                                 },
                                                { label: t('search.properties.predictedBp'), value: molecule.predicted_BP_celsius, suffix: '°C', span: 2,
                                                    show: canShowColumn('predicted_BP_celsius')
                                                 },
                                                { label: t('search.properties.predictedFp'), value: molecule.predicted_FP_celsius, suffix: '°C', span: 2,
                                                    show: canShowColumn('predicted_FP_celsius')
                                                 },
                                                { label: t('search.properties.combustionEnthalpy'),
                                                    value: molecule.COMBUSTION_ENTHALPY_EV || '0.00',
                                                    span: 2,
                                                    suffix: ' eV',
                                                    show: canShowColumn('combustion_enthalpy_ev')
                                                },
                                                { label: 'HOMO', value: molecule.HOMO_eV, span: 2, suffix: ' eV', show: canShowColumn('HOMO_eV') },
                                                { label: 'LUMO', value: molecule.LUMO_eV, span: 2, suffix: ' eV', show: canShowColumn('LUMO_eV') },
                                                { label: 'ESP Min', value: molecule.ESP_min_eV, span: 2, suffix: ' eV', show: canShowColumn('ESP_min_eV') },
                                                { label: 'ESP Max', value: molecule.ESP_max_eV, span: 2, suffix: ' eV', show: canShowColumn('ESP_max_eV') },
                                                { label: 'Commercial Viability', value: COMMERCIAL_SCORE_MAP[molecule.COMMERCIAL_SCORE as keyof typeof COMMERCIAL_SCORE_MAP], span:4, wrap: true, show: canShowColumn('commercial_score')}
                                            ].filter(Boolean);

                                            return (
                                                <MolCard
                                                    style={{ marginBottom: '20px' }}
                                                    key={index}
                                                    name={t('search.similarMoleculeNumber', { number: index + 1 })}
                                                    showMoreDetails={false}
                                                    large={true}
                                                cation={molecule.cation ?? (molecule as any)?.CATION}
                                                propGroups={propGroups}
                                                foldPropGroups={[
                                                    ...(casFoldProp ? [casFoldProp] : []),
                                                    { label: 'UMAP_X', value: molecule.UMAP_0, span: 1, show: canShowColumn('umap_0') },
                                                    { label: 'UMAP_Y', value: molecule.UMAP_1, span: 1, show: canShowColumn('umap_1') },
                                                    { label: 'Functional Groups', value: JSON.parse(molecule?.functional_groups ?? "[]") || 'N/A', span: 4, show: canShowColumn('functional_groups') },
                                                ]}
                                            >
                                                <div className="molecule-actions">
                                                    <CustomButton
                                                        Icon={Star}
                                                        style={{
                                                            flexGrow: 1,
                                                        }}
                                                        onClick={() => {
                                                            console.log('Add to Favorites payload (search):', molecule);
                                                            
                                                            // Get the raw commercial score (numeric 0-3)
                                                            const rawCommercialScore = molecule.COMMERCIAL_SCORE;
                                                            
                                                            // Convert commercial score from numeric to descriptive text
                                                            const commercialScoreText = rawCommercialScore !== null && rawCommercialScore !== undefined 
                                                                ? COMMERCIAL_SCORE_MAP[rawCommercialScore as keyof typeof COMMERCIAL_SCORE_MAP] || null
                                                                : null;
                                                            
                                                            handleAddToFavorites({
                                                                smiles: molecule.SMILES,
                                                                properties: {
                                                                    molwt: molecule.molecular_weight,
                                                                    homo_eV: molecule.HOMO_eV,
                                                                    lumo_eV: molecule.LUMO_eV,
                                                                    esp_min_eV: molecule.ESP_min_eV,
                                                                    esp_max_eV: molecule.ESP_max_eV,
                                                                    predicted_mp: molecule.predicted_MP_celsius,
                                                                    predicted_bp: molecule.predicted_BP_celsius,
                                                                    predicted_fp_celsius: molecule.predicted_FP_celsius,
                                                                    combustion_enthalpy_ev: molecule.COMBUSTION_ENTHALPY_EV,
                                                                    commercial_score: commercialScoreText,
                                                                    functional_groups: molecule.functional_groups,
                                                                    commercial_link: molecule.COMMERCIAL_LINK || null
                                                                },
                                                                x: molecule.UMAP_0,
                                                                y: molecule.UMAP_1
                                                            });
                                                        }}
                                                        loading={moleculeFavoriteStatus[molecule.SMILES]?.loading}
                                                        loadingText={t('chatbox.buttons.addToFavoritesLoading')}
                                                        successMessage={moleculeFavoriteStatus[molecule.SMILES]?.success}
                                                        errorMessage={moleculeFavoriteStatus[molecule.SMILES]?.error}
                                                    >
                                                        {t('chatbox.buttons.addToFavorites')}
                                                    </CustomButton>
                                                    {
                                                        userPermissions === 'admin' && (
                                                            <MoleculeFeedbackBox
                                                                molecule={molecule}
                                                                lastSearch={lastSearch}
                                                                queryType="normal_ask"
                                                                onClose={() => { }}
                                                            />
                                                        )
                                                    }
                                                </div>
                                                </MolCard>
                                            );
                                        })}
                                    </div>
                        )}
                        {(lastSearch && !searchLoading && !searchError && (searchedMolecules === null || searchedMolecules.length === 0)) && (
                            ambiguousOptions ? (
                                <div className="molecule-not-found">
                                    <p>{t('search.ambiguousQuery.message', { query: lastSearch, options: ambiguousOptions })}</p>
                                </div>
                            ) : (
                                <div className="molecule-not-found">
                                    <p>{t('search.moleculeNotFound.title')}</p>
                                    <br />
                                    <br />
                                    {(t('search.moleculeNotFound.reasons', { returnObjects: true }) as string[]).map((reason: string, index: number) => (
                                        <div key={index}>
                                            {index + 1}. {reason}
                                            <br />
                                        </div>
                                    ))}
                                    <br />
                                    <button
                                        className="pricing-cta strategic"
                                        onClick={() => window.location.href = 'mailto:partnership@ses.ai?subject=Joint Development Inquiry'}
                                    >
                                        {t('search.moleculeNotFound.contactSales')}
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                        </>
                    ) : (
                        <OrganicFilter
                            ref={organicFilterRef}
                            onDataFiltered={setFilteredPlotData}
                        />
                    )}
                </div>
            </div>
            <NodePopup key="organicNodePopup" ref={nodePopupRef} node={node} molecularType="organic"/>
        </>
    )
};

export default OrganicSearch;
