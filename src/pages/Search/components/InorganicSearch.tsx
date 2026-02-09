import MoleculeFeedbackBox from '@/components/MoleculeFeedbackBox';
import SearchInput from "@/components/Search";
import { useMemo, useState, useRef, useEffect, useContext, useCallback } from "react";
import { authFetch, COMMERCIAL_SCORE_MAP,  getAPIUrl } from "@/utils";
import { extractIsPublished, buildPublicationProp, insertPublicationProp } from '@/utils/publicationStatus';
import { raiseResponseError } from '@/utils/errorHelpers';
import { buildAutoFetchURL } from "@/services/config/autoFetch";
import { findFriends } from "@/services/findFriends";
import { useInorganicPlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import MolCard from "@/components/MolCard";
import OverallScoreValue from '@/components/OverallScoreValue';
import CustomButton from "@/components/CustomButton";
import { ExternalLink, Star, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";
import { FavoriteContext } from "@/layouts";
import FindFriendOptions from "./FindFriendOptions";
import { buildQueryString } from "@/services/buildQueryString";
import { createLlmGradeProp, ReasoningModal } from "@/components/LlmGrade";
import { useQueryLimit } from '@/hooks/useQueryLimit';
import InorganicFilter, { InorganicFilterRef } from './InorganicFilter';
import type { AdditiveCategoryType } from '@/constants/additiveCategories';
import {
    DEFAULT_ADDITIVE_CATEGORY,
    DEFAULT_ADDITIVE_SUBTYPE,
    getAdditiveSubtypeLabelKey,
    getDefaultSubtypeForCategory,
    isValidAdditiveSubtype,
} from '@/constants/additiveCategories';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import { isColumnVisibleForUser } from '@/constants/columnAccess';
import { ENABLE_CASRN_DISPLAY } from '@/constants/featureFlags';
import type { ScoreBreakdownItem } from '@/components/ScoreBreakdownValue';

const API_URL = getAPIUrl();

// 定义无机分子数据类型
interface InorganicMoleculeData {
    smiles: string;
    cation?: string;
    casrn?: string;
    x: number;
    y: number;
    image?: string;
    grade?: number;
    reasoning?: string;
    is_published?: boolean;
    properties: {
        molwt: number;
        homo_eV: number;
        lumo_eV: number;
        esp_min_eV: number;
        esp_max_eV: number;
        functional_groups: string;
        cluster: number;
        // 无机分子特有的属性
        sulfur_content?: number;
        oxygen_content?: number;
        nitrogen_content?: number;
        halogen_content?: number;
    };
    rawData: any;
}

interface InorganicSimilarMolecule {
    SMILES: string;
    cation?: string;
    CASRN?: string;
    molecular_weight: number;
    HOMO_eV: number;
    LUMO_eV: number;
    ESP_min_eV: number;
    ESP_max_eV: number;
    functional_groups?: string;
    UMAP_0: number;
    UMAP_1: number;
    image?: string;
    grade?: number;
    reasoning?: string;
    is_published?: boolean;
    cluster: number;
    // 无机分子特有的属性
    sulfur_content?: number;
    oxygen_content?: number;
    nitrogen_content?: number;
    halogen_content?: number;
}

type SearchResultItem =
    | { type: 'molecule'; molecule: InorganicMoleculeData }
    | { type: 'warning'; message: string };

const INORGANIC_PROPERTY_DEFINITIONS = [
    { columnId: 'HOMO_eV', labelKey: 'search.properties.homo', fallback: 'HOMO' },
    { columnId: 'LUMO_eV', labelKey: 'search.properties.lumo', fallback: 'LUMO' },
    { columnId: 'ESP_min_eV', labelKey: 'search.properties.espMin', fallback: 'ESP Min' },
    { columnId: 'ESP_max_eV', labelKey: 'search.properties.espMax', fallback: 'ESP Max' },
    { columnId: 'molecular_weight', labelKey: 'search.properties.molecularWeight', fallback: 'Molecular Weight' },
];

const INORGANIC_SEARCH_PLACEHOLDER = 'ethylene carbonate, DTD, CCOC(=O)OCC';
const REMOVED_FILTER_WARNING_PREFIX = 'Removed property filters due to empty results';
const MASKED_FILTER_WARNING_MESSAGE = 'Disabled some property filters due to empty results.';

const InorganicSearch = () => {
    const { t, i18n } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isAdminTierUser = userPermissions === 'admin';
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);
    const { moleculeFavoriteStatus, setMoleculeFavoriteStatus, handleAddToFavorites } = useContext(FavoriteContext);
    
    // 使用无机分子数据源
    const { data, loading, error, fetchData } = useInorganicPlotDataStore();

    const searchInputRef = useRef<any>(null);

    const [searchResults, setsearchResults] = useState<string[] | null>(null);
    const [lastSearch, setLastSearch] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchWarning, setSearchWarning] = useState<string | null>(null);
    const [searchedMolecules, setsearchedMolecules] = useState<InorganicMoleculeData[] | null>(null);
    const [searchedResultItems, setSearchedResultItems] = useState<SearchResultItem[] | null>(null);
    const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState<InorganicSimilarMolecule[]>([]);
    const [similarMoleculeImages, setSimilarMoleculeImages] = useState<{[key: number]: string}>({});
    const [findFriendMessages, setFindFriendMessages] = useState<string[]>([]);
    const findClosestFriends = true;
    const [selectedMolType, setSelectedMolType] = useState('solvent');
    const [additiveCategory, setAdditiveCategory] = useState<AdditiveCategoryType>(DEFAULT_ADDITIVE_CATEGORY);
    const [additiveSubtype, setAdditiveSubtype] = useState<string>(DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY]);
    const [structureWeight, setStructureWeight] = useState(0.75);
    const [numResults, setNumResults] = useState(30);
    const [extraRequests, setExtraRequests] = useState('');
    const defaultCompute = useMemo(() => 'Disabled', []);
    const [computeLevel, setComputeLevel] = useState<string>(defaultCompute);
    const [showHypothetical, setShowHypothetical] = useState(false);
    const [prioritizePublished, setPrioritizePublished] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [reasoningText, setReasoningText] = useState<string | null>(null);

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
    const { limits: queryLimits } = useQueryLimit();

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
        () => INORGANIC_PROPERTY_DEFINITIONS
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
    const inorganicFilterRef = useRef<InorganicFilterRef>(null);
    const [cathode, setCathode] = useState('');
    const [anode, setAnode] = useState('');
    const [solvent, setSolvent] = useState('');
    const [cellDesign, setCellDesign] = useState('');
    const [metric, setMetric] = useState('');

    useEffect(() => {
        switch (selectedMolType) {
            case 'diluent':
                setStructureWeight(0.5);
                break;
            case 'additive':
                setStructureWeight(0.9);
                break;
            case 'solvent':
            case 'cosolvent':
            default:
                setStructureWeight(0.75);
        }
    }, [selectedMolType]);

    useEffect(() => {
        setComputeLevel(defaultCompute);
    }, [defaultCompute]);

    // Add state for find-friend error message
    const [findFriendError, setFindFriendError] = useState<string | null>(null);

    // Add new state for highlighted molecule
    const [highlightedMolecules, setHighlightedMolecules] = useState<InorganicMoleculeData[]>([]);

    useEffect(() => {
        if (!isValidAdditiveSubtype(additiveCategory, additiveSubtype)) {
            setAdditiveSubtype(getDefaultSubtypeForCategory(additiveCategory));
        }
    }, [additiveCategory, additiveSubtype]);

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
                inorganicFilterRef.current?.resetFilters();
            }
            setInterfaceMode(mode);
        }
    };

    // 添加拖拽分隔条的状态
    const [leftPanelWidth, setLeftPanelWidth] = useState(60);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);

    // 组件挂载时获取数据
    useEffect(() => {
        if (data.length === 0) {
            fetchData();
        }
    }, [data.length, fetchData]);

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

    // 处理无机分子搜索结果
    const handleSearchedInorganicMolecules = async (response: Response, select_first = false): Promise<{ formattedMolecules: InorganicMoleculeData[] | null; ambiguity: any }> => {
        let formattedMolecules: InorganicMoleculeData[] | null = null;
        let ambiguity = null;
        try {
            const data = await response.json();
            const envelopes: any[] = Array.isArray(data) ? data : [data];
            const resultItems: SearchResultItem[] = [];
            const mappedMolecules: InorganicMoleculeData[] = [];

            const mapDetailToMolecule = (mol: any): InorganicMoleculeData => ({
                smiles: mol.SMILES,
                cation: mol.cation ?? mol.CATION,
                casrn: mol.CASRN ?? mol.casrn,
                x: mol.UMAP_0,
                y: mol.UMAP_1,
                image: mol.image,
                grade: mol.grade,
                reasoning: mol.reasoning,
                is_published: extractIsPublished(mol),
                properties: {
                    molwt: mol.molecular_weight,
                    homo_eV: mol.HOMO_eV,
                    lumo_eV: mol.LUMO_eV,
                    esp_min_eV: mol.ESP_min_eV,
                    esp_max_eV: mol.ESP_max_eV,
                    functional_groups: mol.functional_groups,
                    cluster: mol.cluster || 0,
                    sulfur_content: mol.sulfur_content,
                    oxygen_content: mol.oxygen_content,
                    nitrogen_content: mol.nitrogen_content,
                    halogen_content: mol.halogen_content,
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
                        ambiguity = env.options ?? null;
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
                    setsearchResults(mappedMolecules.map((mol) => mol.image || ''));
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
            console.error('Error processing searched inorganic molecules:', error);
            setSearchedResultItems([]);
        }
        return { formattedMolecules, ambiguity };
    };

    const handleSearch = async (searchInput: string) => {
        const trimmedInput = searchInput.trim();
        if (!trimmedInput) return;

        setSearchLoading(true);
        setSearchWarning(null);
        setSearchError(null);
        setsearchResults(null);
        setsearchedMolecules(null);
        setSearchedResultItems(null);
        setHighlightedMolecules([]);
        setHighlightedSimilarMolecules([]);
        setSimilarMoleculeImages({});
        setFindFriendMessages([]);
        setFindFriendError(null);
        setAmbiguousOptions(null);

        try {
            // 使用无机分子搜索接口
            const searchEndpoint = buildAutoFetchURL('search');
            const molTypeToSend = selectedMolType === 'additive' ? additiveSubtype : selectedMolType;
            const molTypeParam = molTypeToSend ? `&mol_type=${encodeURIComponent(molTypeToSend)}` : '';

            // Fetch the searched inorganic molecule's properties 
            const moleculeResponse = await authFetch(
                `${searchEndpoint}?query=${encodeURIComponent(trimmedInput)}&umap_type=inorganic${molTypeParam}`
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

            const { formattedMolecules, ambiguity } = await handleSearchedInorganicMolecules(moleculeResponse);

            if (ambiguity) {
                setAmbiguousOptions(ambiguity);
                return;
            }

            if (formattedMolecules && findClosestFriends) {
                if (formattedMolecules.length > 1) {
                    setSearchWarning(t('search.multipleMoleculesWarning'));
                } else {
                    const smilesArray = formattedMolecules
                        .map((m) => (m.smiles ? m.smiles.trim() : ''))
                        .filter((s) => !!s);
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
                        setFindFriendMessages([]);
                        const { molecules, imageMap, messages } = await findFriends<InorganicSimilarMolecule>({
                            smiles: smilesArray,
                            use35m: isHighTier,
                            structureWeight,
                            molType: molTypeToSend,
                            computeLevel: computeToSend,
                            showHypothetical,
                            prioritizePublished,
                            includeQuery,
                            queryString,
                            isInorganic: true,
                            numResults,
                        });

                        if (molecules.length > 0) {
                            setHighlightedSimilarMolecules(molecules);
                        }

                        setSimilarMoleculeImages(imageMap);
                        setFindFriendMessages(messages);
                    } catch (friendError) {
                        console.error('Error finding similar inorganic molecules:', friendError);
                        setFindFriendError(t('search.findFriendError'));
                        setFindFriendMessages([]);
                    }
                }
            }
        } catch (apiError: any) {
            console.error('Error searching inorganic molecules:', apiError);

            const token = localStorage.getItem('token');
            const isUnauthorized = apiError?.response?.status === 401 || apiError?.status === 401;

            if (!token || isUnauthorized) {
                setSearchError(null);
            } else {
                const fallbackMessage = t('search.searchError');
                setSearchError(apiError instanceof Error && apiError.message ? apiError.message : fallbackMessage);
            }
        } finally {
            setSearchLoading(false);
            setLastSearch(searchInput);
        }
    };

    return (
        <>
            <ReasoningModal text={reasoningText} onClose={() => setReasoningText(null)} />
            <div
                className="search-umap-container"
                style={{ paddingLeft: '0', marginLeft: '0' }}
                ref={containerRef}
            >
                {/* UMAP Visualization on the left */}
                <div 
                    className="search-umap-section"
                    style={{
                        width: `calc((100% - 120px) * ${leftPanelWidth} / 100)`,
                        flex: 'none'
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
                                data={interfaceMode === 'filter' ? filteredPlotData : data}
                                highlightedData={interfaceMode === 'search' ? highlightedMolecules : []}
                                highlightedSimilarData={interfaceMode === 'search' ? highlightedSimilarMolecules : []}
                                userPermissions={userPermissions}
                                isAuthenticated={isAuthenticated}
                                molecularType="inorganic"
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
                        width: `calc((100% - 120px) * ${100 - leftPanelWidth} / 100)`,
                        flex: 'none',
                        overflowY: 'auto',
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px'
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
                                disabled={searchLoading}
                                initialEditorOpen={false}
                                placeholder={INORGANIC_SEARCH_PLACEHOLDER}
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
                                prioritizePublished={prioritizePublished}
                                setPrioritizePublished={setPrioritizePublished}
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
                                onSubmitSearch={() => searchInputRef.current?.submit?.()}
                                submitDisabled={searchLoading}
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

                        {!searchLoading && !searchError && searchedResultItems && searchedResultItems.length > 0 && (
                            <div>
                                <div className="molecule-properties">
                                    <h3>{t('search.searchedMolecules')}</h3>
                                    {(() => {
                                        let moleculeDisplayIndex = 0;
                                        return searchedResultItems.map((item, index) => {
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
                                            const casFoldProp = ENABLE_CASRN_DISPLAY && casCandidate
                                                ? {
                                                    label: t('search.properties.casrn', 'CAS #'),
                                                    value: String(casCandidate),
                                                    span: 2,
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
                                            const isPublished = extractIsPublished(molecule, molecule.rawData, molecule.properties);
                                            const publicationProp = buildPublicationProp(isPublished, t);

                                            const basePropGroups = [
                                                { label: t('search.properties.smiles'), value: molecule.smiles, span: 4 },
                                                ...(overallScoreProp ? [overallScoreProp] : gradeProp ? [gradeProp] : []),
                                                { label: t('search.properties.molecularWeight'), value: molecule.properties.molwt, span: 2, suffix: ' g/mol' },
                                                { label: 'Cluster', value: molecule.properties.cluster, span: 2 },
                                                { label: 'HOMO', value: molecule.properties.homo_eV, span: 2, suffix: ' eV' },
                                                { label: 'LUMO', value: molecule.properties?.lumo_eV, span: 2, suffix: ' eV' },
                                                { label: 'ESP Min', value: molecule.properties?.esp_min_eV, span: 2, suffix: ' eV' },
                                                { label: 'ESP Max', value: molecule.properties?.esp_max_eV, span: 2, suffix: ' eV' },
                                                { label: 'Sulfur Content', value: molecule.properties?.sulfur_content, span: 2, suffix: ' %' },
                                                { label: 'Oxygen Content', value: molecule.properties?.oxygen_content, span: 2, suffix: ' %' },
                                                { label: 'Nitrogen Content', value: molecule.properties?.nitrogen_content, span: 2, suffix: ' %' },
                                                { label: 'Halogen Content', value: molecule.properties?.halogen_content, span: 2, suffix: ' %' }
                                            ].filter(Boolean);
                                            const propGroups = insertPublicationProp(basePropGroups, publicationProp);

                                            const foldPropGroups = [
                                                ...(casFoldProp ? [casFoldProp] : []),
                                                { label: 'UMAP_X', value: molecule.x, span: 1 },
                                                { label: 'UMAP_Y', value: molecule.y, span: 1 },
                                                { label: 'Functional Groups', value: JSON.parse(molecule.properties?.functional_groups ?? "[]"), span: 4 }
                                            ];

                                            return (
                                                <MolCard
                                                    key={`searched-molecule-${molecule.smiles ?? index}`}
                                                    name={t('search.moleculeNumber', { number: moleculeDisplayIndex })}
                                                    showMoreDetails={false}
                                                    large={true}
                                                    cation={molecule.cation ?? molecule.rawData?.cation ?? molecule.rawData?.CATION}
                                                    publicationStatus={isPublished}
                                                    propGroups={propGroups} foldPropGroups={foldPropGroups}>
                                                    <div style={{ display: 'flex', flexFlow: 'column', textAlign: 'center', width: '100%' }}>
                                                        <div style={{ display: 'flex', flexFlow: 'row', gap: '5px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <CustomButton
                                                                Icon={Star}
                                                                style={{
                                                                    flexGrow: 1,
                                                                }}
                                                                onClick={() => {
                                                                    console.log('Add to Favorites payload (inorganic search):', molecule);
                                                                    handleAddToFavorites(molecule);
                                                                }}
                                                                loading={moleculeFavoriteStatus[molecule.smiles]?.loading}
                                                                loadingText="Saving..."
                                                                successMessage={moleculeFavoriteStatus[molecule.smiles]?.success}
                                                                errorMessage={moleculeFavoriteStatus[molecule.smiles]?.error}
                                                            >
                                                                {t("chatbox.buttons.addToFavorites")}
                                                            </CustomButton>
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
                                                </MolCard>
                                            );
                                        });
                                    })()}
                                </div>
                                {findClosestFriends && (findFriendMessages.length > 0 || (highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0)) && (
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
                                                'property_subscores'
                                            );
                                            const structureScoreSummary = buildScoreSummary(
                                                t('search.properties.structureSimilarity', 'Structure Similarity'),
                                                molecule,
                                                'structure_similarity',
                                                'structure_subscores'
                                            );
                                            const casCandidate = molecule.CASRN ?? (molecule as any)?.casrn ?? (molecule as any)?.cas ?? (molecule as any)?.CAS;
                                            const casFoldProp = ENABLE_CASRN_DISPLAY && casCandidate
                                                ? {
                                                    label: t('search.properties.casrn', 'CAS #'),
                                                    value: String(casCandidate),
                                                    span: 2,
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
                                            const isPublished = extractIsPublished(molecule);
                                            const publicationProp = buildPublicationProp(isPublished, t);

                                            const basePropGroups = [
                                                { label: t('search.properties.smiles'), value: molecule.SMILES, span: 4 },
                                                ...(overallScoreProp ? [overallScoreProp] : []),
                                                { label: t('search.properties.molecularWeight'), value: molecule.molecular_weight, span: 2, suffix: ' g/mol' },
                                                { label: 'Cluster', value: molecule.cluster, span: 2 },
                                                { label: 'HOMO', value: molecule.HOMO_eV, span: 2, suffix: ' eV' },
                                                { label: 'LUMO', value: molecule.LUMO_eV, span: 2, suffix: ' eV' },
                                                { label: 'ESP Min', value: molecule.ESP_min_eV, span: 2, suffix: ' eV' },
                                                { label: 'ESP Max', value: molecule.ESP_max_eV, span: 2, suffix: ' eV' },
                                                { label: 'Sulfur Content', value: molecule.sulfur_content, span: 2, suffix: ' %' },
                                                { label: 'Oxygen Content', value: molecule.oxygen_content, span: 2, suffix: ' %' },
                                                { label: 'Nitrogen Content', value: molecule.nitrogen_content, span: 2, suffix: ' %' },
                                                { label: 'Halogen Content', value: molecule.halogen_content, span: 2, suffix: ' %' }
                                            ].filter(Boolean);
                                            const propGroups = insertPublicationProp(basePropGroups, publicationProp);

                                            return (
                                                <MolCard
                                                    style={{ marginBottom: '20px' }}
                                                    key={index}
                                                    name={t('search.similarMoleculeNumber', { number: index + 1 })}
                                                    showMoreDetails={false}
                                                    large={true}
                                                    cation={molecule.cation ?? (molecule as any)?.CATION}
                                                    publicationStatus={isPublished}
                                                    propGroups={propGroups} 
                                                    foldPropGroups={[
                                                        ...(casFoldProp ? [casFoldProp] : []),
                                                        { label: 'UMAP_X', value: molecule.UMAP_0, span: 1 },
                                                        { label: 'UMAP_Y', value: molecule.UMAP_1, span: 1 },
                                                        { label: 'Functional Groups', value: JSON.parse(molecule?.functional_groups ?? "[]") || 'N/A', span: 4 },
                                                    ]}
                                                >
                                                    <div className="molecule-actions">
                                                        <CustomButton
                                                            Icon={Star}
                                                            style={{
                                                                flexGrow: 1,
                                                            }}
                                                            onClick={() => {
                                                                console.log('Add to Favorites payload (inorganic search):', molecule);
                                                                
                                                                handleAddToFavorites({
                                                                    smiles: molecule.SMILES,
                                                                    properties: {
                                                                        molwt: molecule.molecular_weight,
                                                                        homo_eV: molecule.HOMO_eV,
                                                                        lumo_eV: molecule.LUMO_eV,
                                                                        esp_min_eV: molecule.ESP_min_eV,
                                                                        esp_max_eV: molecule.ESP_max_eV,
                                                                        functional_groups: molecule.functional_groups,
                                                                        cluster: molecule.cluster,
                                                                        sulfur_content: molecule.sulfur_content,
                                                                        oxygen_content: molecule.oxygen_content,
                                                                        nitrogen_content: molecule.nitrogen_content,
                                                                        halogen_content: molecule.halogen_content
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
                        <InorganicFilter
                            ref={inorganicFilterRef}
                            onDataFiltered={setFilteredPlotData}
                        />
                    )}
                </div>
            </div>
            <NodePopup key="inorganicNodePopup" ref={nodePopupRef} node={node} molecularType="inorganic"/>
        </>
    );
};

export default InorganicSearch;
