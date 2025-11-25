import MoleculeFeedbackBox from '@/components/MoleculeFeedbackBox';
import SearchInput from "@/components/Search";
import { useState, useRef, useEffect, useContext } from "react";
import { authFetch, COMMERCIAL_SCORE_MAP,  getAPIUrl } from "@/utils";
import { useInorganicPlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import MolCard from "@/components/MolCard";
import CustomButton from "@/components/CustomButton";
import { ExternalLink, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";
import { FavoriteContext } from "@/layouts";
import { createLlmGradeProp, ReasoningModal } from "@/components/LlmGrade";
import InorganicFilter, { InorganicFilterRef } from './InorganicFilter';

const API_URL = getAPIUrl();

// 定义无机分子数据类型
interface InorganicMoleculeData {
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
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
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
    const [reasoningText, setReasoningText] = useState<string | null>(null);
    const buildGradeProp = (grade?: number, reasoning?: string) =>
        createLlmGradeProp(grade, reasoning, (text) => setReasoningText(text));

    // 界面模式切换状态
    const [interfaceMode, setInterfaceMode] = useState<'search' | 'filter'>('search');
    const [filteredPlotData, setFilteredPlotData] = useState<any[]>([]);
    const inorganicFilterRef = useRef<InorganicFilterRef>(null);

    // Add new state for highlighted molecule
    const [highlightedMolecules, setHighlightedMolecules] = useState<InorganicMoleculeData[]>([]);

    // 处理界面模式切换
    const handleModeSwitch = (mode: 'search' | 'filter') => {
        if (mode !== interfaceMode) {
            // 重置当前模式的状态
            if (interfaceMode === 'search') {
                // 重置搜索状态
                setsearchResults(null);
                setsearchedMolecules(null);
                setHighlightedMolecules([]);
                setSearchError(null);
                setSearchWarning(null);
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
            if (data.found) {
                if (data.molecule_details && data.molecule_details.length > 0) {
                    formattedMolecules = data.molecule_details.map((mol: any) => {
                        return {
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
        setAmbiguousOptions(null);

        try {
            // 使用无机分子搜索接口
            let searchEndpoint = `${API_URL}/api/search/search-new`;

            // Fetch the searched inorganic molecule's properties
            const moleculeResponse = await authFetch(`${searchEndpoint}?query=${encodeURIComponent(searchInput.trim())}&umap_type=inorganic`);

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
                                data={interfaceMode === 'filter' ? filteredPlotData : data}
                                highlightedData={interfaceMode === 'search' ? highlightedMolecules : []}
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
                            {/* Search bar container */}
                            <SearchInput
                                onSearch={handleSearch}
                                disabled={searchLoading}
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
