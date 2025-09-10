import MoleculeFeedbackBox from '@/components/MoleculeFeedbackBox';
import SearchInput from "@/components/Search";
import { useMemo, useState, useRef, useEffect, useContext } from "react";
import { authFetch, COMMERCIAL_SCORE_MAP,  getAPIUrl } from "@/utils";
import { findFriends } from "@/services/findFriends";
import { useInorganicPlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import MolCard from "@/components/MolCard";
import CustomButton from "@/components/CustomButton";
import { ExternalLink, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";
import { FavoriteContext } from "@/layouts";
import FindFriendOptions from "./FindFriendOptions";
import { buildQueryString } from "@/services/buildQueryString";
import { createLlmGradeProp, ReasoningModal } from "@/components/LlmGrade";

const API_URL = getAPIUrl();

// 定义无机分子数据类型
interface InorganicMoleculeData {
    smiles: string;
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
    cluster: number;
    // 无机分子特有的属性
    sulfur_content?: number;
    oxygen_content?: number;
    nitrogen_content?: number;
    halogen_content?: number;
}

const InorganicSearch = () => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);
    const { moleculeFavoriteStatus, setMoleculeFavoriteStatus, handleAddToFavorites } = useContext(FavoriteContext);
    
    // 使用无机分子数据源
    const { data, loading, error, fetchData } = useInorganicPlotDataStore();

    const [searchResults, setsearchResults] = useState<string[] | null>(null);
    const [lastSearch, setLastSearch] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchWarning, setSearchWarning] = useState<string | null>(null);
    const [searchedMolecules, setsearchedMolecules] = useState<InorganicMoleculeData[] | null>(null);
    const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState<InorganicSimilarMolecule[]>([]);
    const [similarMoleculeImages, setSimilarMoleculeImages] = useState<{[key: number]: string}>({});
    const [findClosestFriends, setFindClosestFriends] = useState(false);
    const [selectedMolType, setSelectedMolType] = useState('solvent');
    const [additiveSubtype, setAdditiveSubtype] = useState('A');
    const [structureWeight, setStructureWeight] = useState(0.75);
    const [extraRequests, setExtraRequests] = useState('');
    const defaultCompute = useMemo(() => 'Disabled', []);
    const [computeLevel, setComputeLevel] = useState<string>(defaultCompute);
    const [showHypothetical, setShowHypothetical] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [reasoningText, setReasoningText] = useState<string | null>(null);
    const buildGradeProp = (grade?: number, reasoning?: string) =>
        createLlmGradeProp(grade, reasoning, (text) => setReasoningText(text));
    const [cathode, setCathode] = useState('');
    const [anode, setAnode] = useState('');
    const [salt, setSalt] = useState('');
    const [solvent, setSolvent] = useState('');
    const [metric, setMetric] = useState('');

    useEffect(() => {
        switch (selectedMolType) {
            case 'diluent':
                setStructureWeight(0.5);
                break;
            case 'additive':
                setStructureWeight(1.0);
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
    const handleSearchedInorganicMolecules = async (response: Response, select_first = false): Promise<InorganicMoleculeData[] | null> => {
        let formattedMolecules: InorganicMoleculeData[] | null = null;
        let ambiguity = null;
        try {
            const data = await response.json();
            if (data.found) {
                if (data.molecule_details && data.molecule_details.length > 0) {
                    formattedMolecules = data.molecule_details.map((mol: any) => {
                        return {
                            smiles: mol.SMILES,
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
                                cluster: mol.cluster || 0,
                                // 无机分子特有的属性
                                sulfur_content: mol.sulfur_content,
                                oxygen_content: mol.oxygen_content,
                                nitrogen_content: mol.nitrogen_content,
                                halogen_content: mol.halogen_content
                            },
                            rawData: mol
                        };
                    });
                    if (select_first && formattedMolecules) {
                        const formattedMolecule = formattedMolecules[0];
                        setsearchedMolecules([formattedMolecule]);
                        setsearchResults([formattedMolecule.image || '']);
                        
                        if (formattedMolecule.x !== null && formattedMolecule.y !== null &&
                            formattedMolecule.x !== undefined && formattedMolecule.y !== undefined) {
                            setHighlightedMolecules([formattedMolecule]);
                        }
                    } else if (formattedMolecules) {
                        setsearchedMolecules(formattedMolecules);
                        setsearchResults(formattedMolecules.map((mol) => mol.image || ''));

                        if (formattedMolecules.length > 0) {
                            setHighlightedMolecules(formattedMolecules);
                        }
                    }
                }
            } else if (data.message === 'Ambiguous molecule abbreviation') {
                ambiguity = data.options;
            }
        } catch (error) {
            console.error('Error processing searched inorganic molecules:', error);
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
        setSimilarMoleculeImages({});
        setFindFriendError(null);
        setAmbiguousOptions(null);

        try {
            // 使用无机分子搜索接口
            let searchEndpoint = `${API_URL}/api/llm/search-inorganic`;

            // Fetch the searched inorganic molecule's properties 
            const moleculeResponse = await authFetch(`${searchEndpoint}?query=${encodeURIComponent(searchInput.trim())}`);

            // Ratelimit handling
            if (moleculeResponse.status === 429) {
                setSearchWarning(t('search.tooManyRequests'));
                setSearchLoading(false);
                return;
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
                    const optionsSpecified = [cathode, anode, salt, solvent, metric].some(Boolean);

                    let computeToSend = computeLevel;
                    if (computeEnabled && computeLevel !== 'Low' && !optionsSpecified && !extraRequests.trim()) {
                        setSearchWarning(t('search.computeWarning'));
                        computeToSend = 'Low';
                        setComputeLevel('Low');
                    }

                    const baseQuery = buildQueryString(cathode, anode, salt, solvent, metric);
                    const parts: string[] = [baseQuery];
                    if (selectedMolType) {
                        parts.push(`I am looking for ${selectedMolType} molecules.`);
                    }
                    if (extraRequests.trim()) {
                        parts.push(`I have the following requirements: ${extraRequests.trim()}`);
                    }
                    const queryString = parts.join(' ');
                    const includeQuery = optionsSpecified || !!extraRequests.trim() || !!selectedMolType;

                    const molTypeToSend = selectedMolType === 'additive' ? additiveSubtype : selectedMolType;

                    try {
                        const { molecules, imageMap } = await findFriends<InorganicSimilarMolecule>({
                            smiles: smilesArray,
                            use35m: isHighTier,
                            structureWeight,
                            molType: molTypeToSend,
                            computeLevel: computeToSend,
                            showHypothetical,
                            includeQuery,
                            queryString,
                            isInorganic: true,
                        });

                        if (molecules.length > 0) {
                            setHighlightedSimilarMolecules(molecules);
                        }

                        setSimilarMoleculeImages(imageMap);
                    } catch (friendError) {
                        console.error('Error finding similar inorganic molecules:', friendError);
                        setFindFriendError(t('search.findFriendError'));
                    }
                }
            }
        } catch (apiError) {
            console.error('Error searching inorganic molecules:', apiError);
            setSearchError(t('search.searchError'));
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
                                data={data}
                                highlightedData={highlightedMolecules}
                                highlightedSimilarData={highlightedSimilarMolecules}
                                userPermissions={userPermissions}
                                molecularType="inorganic"
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
                    className="search-interface-section" 
                    style={{
                        width: `calc((100% - 120px) * ${100 - leftPanelWidth} / 100)`,
                        flex: 'none',
                        overflowY: 'auto',
                        padding: '20px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px'
                    }}
                >
                    {/* Search bar container */}
                    <SearchInput
                        onSearch={handleSearch}
                        disabled={searchLoading}
                    />

                    {/* Add "Find closest friends" checkbox and mol type selector */}
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
                                                propGroups={[
                                                    { label: t('search.properties.smiles'), value: molecule.smiles, span: 4 },
                                                    buildGradeProp(molecule.grade, molecule.reasoning),
                                                    { label: t('search.properties.molecularWeight'), value: molecule.properties.molwt, span: 2, suffix: ' g/mol' },
                                                    { label: 'Cluster', value: molecule.properties.cluster, span: 2 },
                                                    { label: 'HOMO', value: molecule.properties.homo_eV, span: 2, suffix: ' eV' },
                                                    { label: 'LUMO', value: molecule.properties?.lumo_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Min', value: molecule.properties?.esp_min_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Max', value: molecule.properties?.esp_max_eV, span: 2, suffix: ' eV' },
                                                    // 无机分子特有的属性
                                                    { label: 'Sulfur Content', value: molecule.properties?.sulfur_content, span: 2, suffix: ' %' },
                                                    { label: 'Oxygen Content', value: molecule.properties?.oxygen_content, span: 2, suffix: ' %' },
                                                    { label: 'Nitrogen Content', value: molecule.properties?.nitrogen_content, span: 2, suffix: ' %' },
                                                    { label: 'Halogen Content', value: molecule.properties?.halogen_content, span: 2, suffix: ' %' }
                                                ]} foldPropGroups={[
                                                    { label: 'UMAP_X', value: molecule.x, span: 1 },
                                                    { label: 'UMAP_Y', value: molecule.y, span: 1 },
                                                    { label: 'Functional Groups', value: JSON.parse(molecule.properties?.functional_groups ?? "[]"), span: 4 }
                                                ]}>
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
                                                propGroups={[
                                                    { label: t('search.properties.smiles'), value: molecule.SMILES, span: 4 },
                                                    buildGradeProp(molecule.grade, molecule.reasoning),
                                                    { label: t('search.properties.molecularWeight'), value: molecule.molecular_weight, span: 2, suffix: ' g/mol' },
                                                    { label: 'Cluster', value: molecule.cluster, span: 2 },
                                                    { label: 'HOMO', value: molecule.HOMO_eV, span: 2, suffix: ' eV' },
                                                    { label: 'LUMO', value: molecule.LUMO_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Min', value: molecule.ESP_min_eV, span: 2, suffix: ' eV' },
                                                    { label: 'ESP Max', value: molecule.ESP_max_eV, span: 2, suffix: ' eV' },
                                                    // 无机分子特有的属性
                                                    { label: 'Sulfur Content', value: molecule.sulfur_content, span: 2, suffix: ' %' },
                                                    { label: 'Oxygen Content', value: molecule.oxygen_content, span: 2, suffix: ' %' },
                                                    { label: 'Nitrogen Content', value: molecule.nitrogen_content, span: 2, suffix: ' %' },
                                                    { label: 'Halogen Content', value: molecule.halogen_content, span: 2, suffix: ' %' }
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
                </div>
            </div>
            <NodePopup ref={nodePopupRef} node={node} molecularType="inorganic"/>
        </>
    );
};

export default InorganicSearch;
