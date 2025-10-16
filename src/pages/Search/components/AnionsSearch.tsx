import MoleculeFeedbackBox from '@/components/MoleculeFeedbackBox';
import SearchInput from "@/components/Search";
import { useMemo, useState, useRef, useEffect, useContext } from "react";
import { authFetch, COMMERCIAL_SCORE_MAP, getAPIUrl } from "@/utils";
import { findFriends } from "@/services/findFriends";
import { buildQueryString } from "@/services/buildQueryString";
import { useAnionsPlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import MolCard from "@/components/MolCard";
import CustomButton from "@/components/CustomButton";
import { ExternalLink, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";
import { FavoriteContext } from "@/layouts";
import FindFriendOptions from "./FindFriendOptions";
import { createLlmGradeProp, ReasoningModal } from "@/components/LlmGrade";
import AnionsFilter, { AnionsFilterRef } from './AnionsFilter';
import '../index.css';
import { useQueryLimit } from '@/hooks/useQueryLimit';
import { PUBLIC_SEARCH_LOCKED_VALUES } from '@/constants/publicDefaults';
import { useAccessModals } from '@/hooks/useAccessModals';

const API_URL = getAPIUrl();

const renderAnionCommercialScore = (score?: number | string | null) => {
    if (score === null || score === undefined) {
        return undefined;
    }

    const numericScore = typeof score === 'number' ? score : Number(score);
    const mapped = (COMMERCIAL_SCORE_MAP as Record<number, string | undefined>)[numericScore];

    if (mapped) {
        return mapped;
    }

    if (!Number.isNaN(numericScore)) {
        return numericScore.toString();
    }

    if (typeof score === 'string' && score.trim() !== '') {
        return score;
    }

    return undefined;
};

// 定义类型
interface MoleculeData {
    smiles: string;
    cation?: string;
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
        vdw_volume_angstroms3?: number;
        fluoride_bde_ev?: number;
    };
    rawData: any;
}

interface SimilarMolecule {
    SMILES: string;
    cation?: string;
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
    VDW_VOLUME_ANGSTROMS3?: number;
    FLUORIDE_BDE_EV?: number;
    UMAP_0: number;
    UMAP_1: number;
    image?: string;
    grade?: number;
    reasoning?: string;
}

const AnionsSearch = ({ isPublicUser = false }: { isPublicUser?: boolean }) => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const initialAuthLoaded = useAuthStore(state => state.initialAuthLoaded);
    const isPublic = isPublicUser || (initialAuthLoaded && (!isAuthenticated || userPermissions === 'common'));
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);
    const { moleculeFavoriteStatus, handleAddToFavorites } = useContext(FavoriteContext);

    const { data, loading, error, fetchData } = useAnionsPlotDataStore();

    // 组件挂载时获取数据
    useEffect(() => {
        if (data.length === 0) {
            fetchData();
        }
    }, [data.length, fetchData]);

    const [searchResults, setsearchResults] = useState<string[] | null>(null);
    const [lastSearch, setLastSearch] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchWarning, setSearchWarning] = useState<string | null>(null);
    const [searchedMolecules, setsearchedMolecules] = useState<MoleculeData[] | null>(null);
    const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState<SimilarMolecule[]>([]);
    const [, setSimilarMoleculeImages] = useState<{[key: number]: string}>({}); // Add state for similar molecule images
    const [findClosestFriends, setFindClosestFriends] = useState(false);
    const [structureWeight, setStructureWeight] = useState(1);
    const [selectedMolType, setSelectedMolType] = useState('solvent');
    const [additiveSubtype, setAdditiveSubtype] = useState('A');
    const [extraRequests, setExtraRequests] = useState('');
    const defaultCompute = useMemo(() => 'Disabled', []);
    const [computeLevel, setComputeLevel] = useState<string>(defaultCompute);
    const [showHypothetical, setShowHypothetical] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [reasoningText, setReasoningText] = useState<string | null>(null);
    const buildGradeProp = (grade?: number, reasoning?: string) =>
        createLlmGradeProp(grade, reasoning, (text) => setReasoningText(text));
    const { limits: queryLimits } = useQueryLimit();
    const triggerAccessModal = useAccessModals();

    // 界面模式切换状态
    const [interfaceMode, setInterfaceMode] = useState<'search' | 'filter'>('search');
    const [filteredPlotData, setFilteredPlotData] = useState<any[]>([]);
    const anionsFilterRef = useRef<AnionsFilterRef>(null);
    const [cathode, setCathode] = useState('');
    const [cathodeCustom, setCathodeCustom] = useState('');
    const [anode, setAnode] = useState('');
    const [anodeCustom, setAnodeCustom] = useState('');
    const [salt, setSalt] = useState('');
    const [saltCustom, setSaltCustom] = useState('');
    const [solvent, setSolvent] = useState('');
    const [solventCustom, setSolventCustom] = useState('');
    const [metric, setMetric] = useState('');
    const [metricCustom, setMetricCustom] = useState('');

    const cathodeOptions = ['LFP', 'NMC', 'NCA', 'LCO', 'LMO'];
    const anodeOptions = ['Graphite', 'Graphite/Si', 'Silicon', 'LTO', 'Li metal'];
    const saltOptions = ['LiPF6', 'LiBF4', 'LiTFSI', 'LiFSI', 'LiClO4'];
    const solventOptions = ['EC', 'DMC', 'DEC', 'EMC', 'PC'];
    const performanceOptions = ['Cycle life', 'Energy density', 'Power density', 'Safety', 'Cost'];

    useEffect(() => {
        setComputeLevel(defaultCompute);
    }, [defaultCompute]);

    useEffect(() => {
        if (!isPublic) return;
        setFindClosestFriends(false);
        setSelectedMolType(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.moleculeType);
        setAdditiveSubtype(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.additiveSubtype);
        setComputeLevel(PUBLIC_SEARCH_LOCKED_VALUES.findFriends.computeLevel);
        setShowHypothetical(true);
        setShowAdvanced(false);
        setExtraRequests('');
        setCathode('');
        setCathodeCustom('');
        setAnode('');
        setAnodeCustom('');
        setSalt('');
        setSaltCustom('');
        setSolvent('');
        setSolventCustom('');
        setMetric('');
        setMetricCustom('');
    }, [isPublic]);

    // Add state for find-friend error message
    const [findFriendError, setFindFriendError] = useState<string | null>(null);

    // Add new state for highlighted molecule
    const [highlightedMolecules, setHighlightedMolecules] = useState<MoleculeData[]>([]);

    // 处理界面模式切换
    const handleModeSwitch = (mode: 'search' | 'filter') => {
        if (mode !== interfaceMode) {
            // 重置当前模式的状态
            if (interfaceMode === 'search') {
                // 重置搜索状态
                setsearchResults(null);
                setsearchedMolecules(null);
                setHighlightedMolecules([]);
                setHighlightedSimilarMolecules([]);
                setSimilarMoleculeImages({});
                setSearchError(null);
                setSearchWarning(null);
                setFindFriendError(null);
                setAmbiguousOptions(null);
            } else {
                // 重置过滤状态
                anionsFilterRef.current?.resetFilters();
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

            // Collect all molecule_details from all successful envelopes
            const allDetails: any[] = envelopes
                .filter((env) => env && env.found && Array.isArray(env.molecule_details) && env.molecule_details.length > 0)
                .flatMap((env) => env.molecule_details);

            if (allDetails.length > 0) {
                const mapped: MoleculeData[] = allDetails.map((mol: any) => ({
                    smiles: mol.SMILES,
                    cation: mol.cation ?? mol.CATION,
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
                        vdw_volume_angstroms3: mol.vdw_volume_angstroms3 ?? mol.VDW_VOLUME_ANGSTROMS3,
                        fluoride_bde_ev: mol.fluoride_bde_ev ?? mol.FLUORIDE_BDE_EV,
                        commercial_score: mol.COMMERCIAL_SCORE,
                        commercial_link: mol.COMMERCIAL_LINK,
                    },
                    rawData: mol,
                }));

                if (select_first) {
                    const first = mapped[0];
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
                    setsearchedMolecules(mapped);
                    setsearchResults(mapped.map((m) => m.image || ''));
                    if (mapped.length > 0) {
                        setHighlightedMolecules(mapped);
                    }
                }

                formattedMolecules = mapped;
            }
        } catch (error) {
            console.error('Error processing searched molecules:', error);
        }

        return { formattedMolecules, ambiguity };
    };

    const handleSearch = async (searchInput: string) => {
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
        setAmbiguousOptions(null); // Reset ambiguous search info

        try {
            // Determine which endpoint to use based on user permissions
            let searchEndpoint = `${API_URL}/api/llm/search-new`;

            // Fetch the searched molecule's properties
            const moleculeResponse = await authFetch(`${searchEndpoint}?query=${encodeURIComponent(searchInput.trim())}&umap_type=anions`);

            // Ratelimit handling
            if (moleculeResponse.status === 429) {
                setSearchWarning(t('search.tooManyRequests'));
                setSearchLoading(false);
                return;
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

                if (smilesArray.length === 0) {
                    setSearchWarning(t('search.moleculeNotFound.title'));
                } else {
                    const isHighTier = ["admin", "enterprise", "joint"].includes(userPermissions || '');

                    const cVal = cathode === 'custom' ? cathodeCustom : cathode;
                    const aVal = anode === 'custom' ? anodeCustom : anode;
                    const sVal = salt === 'custom' ? saltCustom : salt;
                    const svVal = solvent === 'custom' ? solventCustom : solvent;
                    const mVal = metric === 'custom' ? metricCustom : metric;
                    const computeEnabled = computeLevel !== 'Disabled';
                    const optionsSpecified = [cVal, aVal, sVal, svVal, mVal].some(Boolean);

                    let computeToSend = computeLevel;
                    if (computeEnabled && computeLevel !== 'Low' && !optionsSpecified && !extraRequests.trim()) {
                        setSearchWarning(t('search.computeWarning'));
                        computeToSend = 'Low';
                        setComputeLevel('Low');
                    }

                    const baseQuery = buildQueryString(cVal, aVal, sVal, svVal, mVal);
                    const parts: string[] = [baseQuery];
                    if (extraRequests.trim()) {
                        parts.push(`I have the following requirements: ${extraRequests.trim()}`);
                    }
                    const queryString = parts.join(' ');
                    const includeQuery = optionsSpecified || !!extraRequests.trim();

                    try {
                        const { molecules, imageMap } = await findFriends<SimilarMolecule>({
                            smiles: smilesArray,
                            use35m: isHighTier,
                            structureWeight,
                            computeLevel: computeToSend,
                            showHypothetical,
                            includeQuery,
                            queryString,
                            isAnion: true,
                        });

                        if (molecules.length > 0) {
                            setHighlightedSimilarMolecules(molecules);
                        }

                        setSimilarMoleculeImages(imageMap);
                    } catch (friendError) {
                        console.error('Error finding similar molecules:', friendError);
                        setFindFriendError(t('search.findFriendError'));
                    }
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
                setSearchError(t('search.searchError'));
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
                                zoomOffset={-0.2}
                                data={interfaceMode === 'filter' ? filteredPlotData : data}
                                highlightedData={interfaceMode === 'search' ? highlightedMolecules : []}
                                highlightedSimilarData={interfaceMode === 'search' ? highlightedSimilarMolecules : []}
                                userPermissions={userPermissions}
                                isAuthenticated={isAuthenticated}
                                molecularType="anions"
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
                            {/* Search bar container */}
                            <SearchInput
                                onSearch={handleSearch}
                                disabled={searchLoading}
                                initialValue={isPublic ? PUBLIC_SEARCH_LOCKED_VALUES.anionInput : ''}
                                lockInput={isPublic}
                                initialEditorOpen={!isPublic}
                                lockMolEditorToggle={isPublic}
                                allowSubmitWhenLocked={isPublic}
                                onLockedClick={triggerAccessModal}
                            />

                            <FindFriendOptions
                                findClosestFriends={findClosestFriends}
                                setFindClosestFriends={setFindClosestFriends}
                                extraRequests={extraRequests}
                                setExtraRequests={setExtraRequests}
                                showAdvanced={showAdvanced}
                                setShowAdvanced={setShowAdvanced}
                                selectedMolType={selectedMolType}
                                setSelectedMolType={setSelectedMolType}
                                additiveSubtype={additiveSubtype}
                                setAdditiveSubtype={setAdditiveSubtype}
                                computeLevel={computeLevel}
                                setComputeLevel={setComputeLevel}
                                structureWeight={structureWeight}
                                setStructureWeight={setStructureWeight}
                                showHypothetical={showHypothetical}
                                setShowHypothetical={setShowHypothetical}
                                cathode={cathode}
                                setCathode={setCathode}
                                anode={anode}
                                setAnode={setAnode}
                                salt={salt}
                                setSalt={setSalt}
                                solvent={solvent}
                                setSolvent={setSolvent}
                                metric={metric}
                                setMetric={setMetric}
                                userPermissions={userPermissions}
                                enableMolTypeSelector={isPublic ? true : false}
                                showStructureSlider={false}
                                findFriendLimitInfo={queryLimits.findFriendLLM}
                                readOnly={isPublic}
                                allowFindFriendsToggleWhenReadOnly={isPublic}
                                onLockedClick={triggerAccessModal}
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

                        {!searchLoading && !searchError && searchResults && (
                            <div>
                                {searchedMolecules && searchedMolecules.length > 0 && (
                                    <div className="molecule-properties">
                                        <h3>{t('search.searchedMolecules')}</h3>
                                        {searchedMolecules.map((molecule, index) => (
                                            <MolCard
                                                key={index}
                                                name={t('search.moleculeNumber', { number: index + 1 })}
                                                showMoreDetails={false}
                                                large={true}
                                                cation={molecule.cation ?? molecule.rawData?.cation ?? molecule.rawData?.CATION}
                                                propGroups={[
                                                    { label: t('search.properties.smiles'), value: molecule.smiles, span: 4 },
                                                    buildGradeProp(molecule.grade, molecule.reasoning),
                                                    { label: t('search.properties.molecularWeight'), value: molecule.properties.molwt, span: 2, suffix: ' g/mol' },
                                                    { label: 'Molecular Volume', value: molecule.properties?.vdw_volume_angstroms3, suffix: ' Å³', span: 2 },
                                                    { label: 'F Dissociation Energy', value: molecule.properties?.fluoride_bde_ev, suffix: ' eV', span: 2 },
                                                    { label: 'HOMO', value: molecule.properties.homo_eV, span: 2, suffix: ' eV' },
                                                    { label: 'LUMO', value: molecule.properties?.lumo_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Min', value: molecule.properties?.esp_min_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Max', value: molecule.properties?.esp_max_eV, span: 2, suffix: ' eV' },
                                                    { label: 'Commercial Viability', value: renderAnionCommercialScore(molecule.properties?.commercial_score), span: 4, wrap: true}
                                                ]} foldPropGroups={[
                                                    { label: 'UMAP_X', value: molecule.x, span: 1 },
                                                    { label: 'UMAP_Y', value: molecule.y, span: 1 },
                                                    { label: 'Functional Groups', value: JSON.parse(molecule.properties?.functional_groups ?? "[]"), span: 4 }
                                                ]}>
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
                                        ))}
                                    </div>
                                )}
                                {findClosestFriends && highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0 && (
                                    <div className="similar-molecules">
                                        <h3>{t('search.similarMolecules')}</h3>
                                        {highlightedSimilarMolecules.map((molecule, index) => (
                                            <MolCard
                                                style={{ marginBottom: '20px' }}
                                                key={index}
                                                name={t('search.similarMoleculeNumber', { number: index + 1 })}
                                                showMoreDetails={false}
                                                large={true}
                                                cation={molecule.cation ?? (molecule as any)?.CATION}
                                                propGroups={[
                                                    { label: t('search.properties.smiles'), value: molecule.SMILES, span: 4 },
                                                    buildGradeProp(molecule.grade, molecule.reasoning),
                                                    { label: t('search.properties.molecularWeight'), value: molecule.molecular_weight, span: 2, suffix: ' g/mol' },
                                                    { label: 'Molecular Volume', value: molecule.VDW_VOLUME_ANGSTROMS3, span: 2, suffix: ' Å³' },
                                                    { label: 'F Dissociation Energy', value: molecule.FLUORIDE_BDE_EV, span: 2, suffix: ' eV' },
                                                    { label: 'HOMO', value: molecule.HOMO_eV, span: 2, suffix: ' eV' },
                                                    { label: 'LUMO', value: molecule.LUMO_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Min', value: molecule.ESP_min_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Max', value: molecule.ESP_max_eV, span: 2, suffix: ' eV' },
                                                    { label: 'Commercial Viability', value: renderAnionCommercialScore(molecule.COMMERCIAL_SCORE), span:4, wrap: true}
                                                ]}
                                                foldPropGroups={[
                                                    { label: 'Functional Groups', value: JSON.parse(molecule?.functional_groups ?? "[]") || 'N/A', span: 4 },
                                                    { label: 'UMAP_X', value: molecule.UMAP_0, span: 1 },
                                                    { label: 'UMAP_Y', value: molecule.UMAP_1, span: 1 },
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
                                                            const commercialScoreText = renderAnionCommercialScore(rawCommercialScore) ?? null;

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
                                                                fullWidth={false}
                                                                molecule={molecule}
                                                                lastSearch={lastSearch}
                                                                queryType="normal_ask"
                                                                contextContent1={''}
                                                                contextContent2={''}
                                                                contextContent3={''}
                                                                useMultiAgent={false}
                                                                onClose={() => { }}
                                                            />
                                                        )
                                                    }
                                                </div>
                                            </MolCard>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {(lastSearch && !searchLoading && (searchedMolecules === null || searchedMolecules.length === 0)) && (
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
                        <AnionsFilter
                            ref={anionsFilterRef}
                            onDataFiltered={setFilteredPlotData}
                        />
                    )}
                </div>
            </div>
            <NodePopup key="anionsNodePopup" ref={nodePopupRef} node={node} molecularType="anions"/>
        </>
    )
};

export default AnionsSearch;
