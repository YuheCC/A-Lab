import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import InfoTooltip, { InfoTooltipContent } from '@/components/InfoTooltip';
import { type MoleculeProperties, type SimilarMolecule } from '@/services/chat/moleculeService';
import { authFetch, getAPIUrl, COMMERCIAL_SCORE_MAP } from '@/utils.js';
import { isColumnVisibleForUser } from '@/constants/columnAccess';
import { useAuthStore } from '@/models/useAuth';
import MolViewer2D from '@/components/NodePopup/MolViewer2D';
import type { MoleculeData } from '@/pages/Chat/hooks/useMoleculePanel';
import FindFriendAdvancedOptions from '@/components/FindFriendAdvancedOptions';
import { ReasoningButton, ReasoningModal } from '@/components/LlmGrade';
import { triggerLoginModal, triggerPricingModal } from '@/utils/authHelpers';
import { buildQueryString } from '@/services/buildQueryString';

import { FavoriteContext } from '@/layouts';
import type { Message } from '@/utils/messageUtils';
import { useChatContext } from '../../context/ChatContext';
import { formatQueryLimitLabel } from '@/utils/queryLimit';
import type { AdditiveCategoryType } from '@/constants/additiveCategories';
import {
    ADDITIVE_CATEGORY_LABEL_KEYS,
    ADDITIVE_OPTIONS_BY_CATEGORY,
    DEFAULT_ADDITIVE_CATEGORY,
    DEFAULT_ADDITIVE_SUBTYPE,
    getDefaultSubtypeForCategory,
    isValidAdditiveSubtype,
} from '@/constants/additiveCategories';

const inferIsAnionFromData = (
    input?: Partial<MoleculeData> | Record<string, any> | null
): boolean => {
    if (!input) {
        return false;
    }

    const rawFlag = (input as any).isAnion ?? (input as any).is_anion ?? (input as any).IS_ANION;
    if (typeof rawFlag === 'string') {
        const trimmed = rawFlag.trim();
        if (!trimmed) {
            return false;
        }
        const normalized = trimmed.toLowerCase();
        return normalized === 'true' || normalized === '1' || normalized === 'yes';
    }
    if (typeof rawFlag === 'number') {
        return rawFlag !== 0;
    }
    if (typeof rawFlag === 'boolean') {
        return rawFlag;
    }
    if (rawFlag != null) {
        return Boolean(rawFlag);
    }

    const rawCation = (input as any).cation ?? (input as any).CATION;
    if (rawCation === undefined || rawCation === null) {
        return false;
    }
    if (typeof rawCation === 'string') {
        const trimmed = rawCation.trim();
        if (!trimmed) {
            return false;
        }
        const normalized = trimmed.toLowerCase();
        if (normalized === 'none' || normalized === 'null' || normalized === 'n/a' || normalized === 'na') {
            return false;
        }
        return true;
    }

    return Boolean(rawCation);
};

interface MoleculeModalProps {
    moleculeName?: string;
    molecule?: MoleculeData | null;  // 新增：完整的分子对象，允许 null
    onClose?: () => void;
    onAddToFavorites?: (moleculeName: string) => void;
    onFindSimilar?: (molecule: MoleculeData) => void;  // 修改为接受完整分子对象
    onUpdateMoleculeType?: (moleculeName: string, type: string) => void;
    messages?: Message[];
}

const MoleculeModal: React.FC<MoleculeModalProps> = ({
    moleculeName = 'LiPF6',
    molecule,
    onClose,
    onAddToFavorites,
    onFindSimilar,
    onUpdateMoleculeType,
    messages = []
}) => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const { modeLimits } = useChatContext();
    const isHighTier = ['admin', 'enterprise', 'joint'].includes(userPermissions || '');
    const API_URL = getAPIUrl();
    const normalizedPermissions = (userPermissions || '').toLowerCase();
    const isFindFriendsLocked = !isAuthenticated || ['common', 'public', 'basic'].includes(normalizedPermissions);
    const [isFunctionalGroupsExpanded, setIsFunctionalGroupsExpanded] = useState(false);
    const [selectedMoleculeType, setSelectedMoleculeType] = useState('solvent');
    const prevMoleculeTypeRef = useRef('solvent');
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [additiveCategory, setAdditiveCategory] = useState<AdditiveCategoryType>(DEFAULT_ADDITIVE_CATEGORY);
    const [selectedAdditiveSubtype, setSelectedAdditiveSubtype] = useState<string>(DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY]);
    const [similarMolecules, setSimilarMolecules] = useState<SimilarMolecule[]>([]);
    const [similarRawList, setSimilarRawList] = useState<any[]>([]);
    const [originalMoleculeProps, setOriginalMoleculeProps] = useState<MoleculeProperties | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSimilarLoading, setIsSimilarLoading] = useState(false);
    const [currentSmiles, setCurrentSmiles] = useState<string | undefined>(undefined);
    const [rawOriginal, setRawOriginal] = useState<any | undefined>(undefined);
    const [showSimilar, setShowSimilar] = useState(false);
    const [useAnionDatabase, setUseAnionDatabase] = useState<boolean>(() => inferIsAnionFromData(molecule));
    const isAnionFindFriend = useAnionDatabase;
    const [structureWeight, setStructureWeight] = useState(0.75);
    const [extraRequests, setExtraRequests] = useState('');
    const defaultCompute = useMemo(() => {
        if (["admin", "enterprise", "joint"].includes(userPermissions || '')) return 'High';
        if (["team", "explorer"].includes(userPermissions || '')) return 'Medium';
        return 'Low';
    }, [userPermissions]);
    const [computeLevel, setComputeLevel] = useState<string>(defaultCompute);
    const [showHypothetical, setShowHypothetical] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [reasoningText, setReasoningText] = useState<string | null>(null);
    const additiveOptionList = useMemo(
        () => ADDITIVE_OPTIONS_BY_CATEGORY[additiveCategory],
        [additiveCategory],
    );
    const handleLockedAction = useCallback(() => {
        if (!isAuthenticated) {
            if (typeof window !== 'undefined') {
                triggerLoginModal(window.location.pathname + window.location.search);
            } else {
                triggerLoginModal();
            }
            return;
        }
        triggerPricingModal(userPermissions);
    }, [isAuthenticated, userPermissions]);

    const toggleAdvancedOptions = () => {
        setShowAdvanced(prev => !prev);
    };

    const handleAdvancedToggle = useCallback(() => {
        if (isFindFriendsLocked) {
            handleLockedAction();
            return;
        }
        toggleAdvancedOptions();
    }, [handleLockedAction, isFindFriendsLocked]);

    const handleAdvancedToggleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (isFindFriendsLocked) {
                handleLockedAction();
                return;
            }
            toggleAdvancedOptions();
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    useEffect(() => {
        switch (selectedMoleculeType) {
            case 'diluent':
                setStructureWeight(0.5);
                break;
            case 'additive':
                setStructureWeight(0.9);
                break;
            case 'salt':
                setStructureWeight(1.0);
                break;
            case 'solvent':
            case 'cosolvent':
            default:
                setStructureWeight(0.75);
        }
    }, [selectedMoleculeType]);

    useEffect(() => {
        setComputeLevel(defaultCompute);
    }, [defaultCompute]);

    useEffect(() => {
        if (!isValidAdditiveSubtype(additiveCategory, selectedAdditiveSubtype)) {
            setSelectedAdditiveSubtype(getDefaultSubtypeForCategory(additiveCategory));
        }
    }, [additiveCategory, selectedAdditiveSubtype]);

    useEffect(() => {
        if (isAnionFindFriend) {
            if (selectedMoleculeType !== 'salt') {
                prevMoleculeTypeRef.current = selectedMoleculeType;
                setSelectedMoleculeType('salt');
                onUpdateMoleculeType?.(moleculeName, 'salt');
            }
            setStructureWeight(1.0);
            if (!showHypothetical) {
                setShowHypothetical(true);
            }
        } else if (selectedMoleculeType === 'salt') {
            const fallbackType = prevMoleculeTypeRef.current || 'solvent';
            setSelectedMoleculeType(fallbackType);
            onUpdateMoleculeType?.(moleculeName, fallbackType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAnionFindFriend]);

    useEffect(() => {
        if (molecule) {
            setUseAnionDatabase(inferIsAnionFromData(molecule));
        }
    }, [molecule]);

    const favoriteCtx = useContext(FavoriteContext);
    const handleAddToFavoritesByRaw = (raw: any, props?: MoleculeProperties | Record<string, unknown>) => {
        // 构建与 Ask/Favorites 一致的数据结构
        const smiles = raw?.SMILES || raw?.smiles || (props as MoleculeProperties | undefined)?.smiles;
        const properties = raw || {};
        const mappedNode = {
            smiles,
            properties: {
                molwt: properties?.molecular_weight ?? properties?.molecularWeight ?? null,
                homo_eV: properties?.HOMO_eV ?? properties?.HOMO ?? properties?.homo ?? null,
                lumo_eV: properties?.LUMO_eV ?? properties?.LUMO ?? properties?.lumo ?? null,
                esp_min_eV: properties?.ESP_min_eV ?? properties?.ESP_MIN ?? null,
                esp_max_eV: properties?.ESP_max_eV ?? properties?.ESP_MAX ?? null,
                predicted_mp: properties?.predicted_MP_celsius ?? properties?.predicted_mp_celsius ?? properties?.predicted_MP ?? properties?.predicted_mp ?? null,
                predicted_bp: properties?.predicted_BP_celsius ?? properties?.predicted_bp_celsius ?? properties?.predicted_BP ?? properties?.predicted_bp ?? null,
                predicted_fp_celsius: properties?.PREDICTED_FP_CELSIUS ?? properties?.predicted_FP_celsius ?? properties?.predicted_fp_celsius ?? null,
                predicted_fp: properties?.predicted_fp_celsius ?? properties?.predicted_fp ?? null,
                combustion_enthalpy_ev: properties?.combustion_enthalpy_ev ?? properties?.combustion_enthalpy ?? null,
                commercial_score: properties?.commercial_score ?? properties?.COMMERCIAL_SCORE ?? null,
                commercial_link: properties?.commercial_link ?? properties?.COMMERCIAL_LINK ?? null,
                functional_groups: properties?.functional_groups ?? null,
            },
            x: properties?.x ?? null,
            y: properties?.y ?? null,
        };

        if (onAddToFavorites) {
            // 兼容旧用法：若父级传入，则回调 name；否则用全局收藏
            onAddToFavorites(smiles);
            return;
        }
        favoriteCtx?.handleAddToFavorites?.(mappedNode);
    };

    const handleFindSimilar = async (name: string) => {
        // 如果已经在loading状态，防止重复请求
        if (isSimilarLoading) {
            return;
        }
        
        // 构造分子对象传递给上层处理函数
        if (onFindSimilar && (molecule || rawOriginal)) {
            const inferredAnion = useAnionDatabase || inferIsAnionFromData(rawOriginal);
            const moleculeForCallback: MoleculeData = molecule
                ? {
                    ...molecule,
                    isAnion: molecule.isAnion ?? inferredAnion,
                }
                : {
                    name,
                    SMILES: currentSmiles || '',
                    isAnion: inferredAnion,
                    ...(rawOriginal || {}),
                } as MoleculeData;
            onFindSimilar(moleculeForCallback);
        }

        try {
            setIsSimilarLoading(true);
            let smilesToUse = currentSmiles;
            let raw = rawOriginal;
            if (!smilesToUse) {
                const original = await fetchOriginalDetails(name);
                setOriginalMoleculeProps(original?.props);
                setCurrentSmiles(original?.smiles);
                setRawOriginal(original?.raw);
                smilesToUse = original?.smiles;
                raw = original?.raw;
            }
            if (smilesToUse) {
                const molType = selectedMoleculeType === 'additive' ? selectedAdditiveSubtype : selectedMoleculeType;
                const { list, raws } = await fetchSimilarBySmiles(smilesToUse, raw, molType);
                setSimilarMolecules(list);
                setSimilarRawList(raws);
                setShowSimilar(true);
            }
        } finally {
            setIsSimilarLoading(false);
        }
    };

    const handleMoleculeTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = event.target.value;
        setSelectedMoleculeType(newType);
        if (selectedMoleculeType !== 'additive' && newType === 'additive') {
            setAdditiveCategory(DEFAULT_ADDITIVE_CATEGORY);
            setSelectedAdditiveSubtype(DEFAULT_ADDITIVE_SUBTYPE[DEFAULT_ADDITIVE_CATEGORY]);
        }
        onUpdateMoleculeType?.(moleculeName, newType);
    };

    const handleAdditiveSubtypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAdditiveSubtype(event.target.value);
    };

    const handleAdditiveCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCategory = event.target.value as AdditiveCategoryType;
        setAdditiveCategory(newCategory);
        setSelectedAdditiveSubtype(getDefaultSubtypeForCategory(newCategory));
    };

    const toggleFunctionalGroups = (cardId: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const renderMoleculeStructure = (smiles?: string, cation?: string) => {
        return smiles ? (
            <MolViewer2D smile={smiles} cation={cation} />
        ) : (
            <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {t('molecular.molCard.loading')}
            </div>
        );
    };

    const extractFunctionalGroups = (raw?: any, props?: any): string[] => {
        let fg: any = raw?.functional_groups ?? raw?.FUNCTIONAL_GROUPS ?? props?.functional_groups ?? props?.FUNCTIONAL_GROUPS;
        if (Array.isArray(fg)) return fg as string[];
        if (typeof fg === 'string') {
            try { return JSON.parse(fg || '[]'); } catch { return []; }
        }
        return [];
    };

    const canShowColumn = useCallback(
        (columnId?: string | null) => isColumnVisibleForUser(columnId, userPermissions),
        [userPermissions]
    );

    const renderMoleculeCard = (
        name: string,
        properties: MoleculeProperties | Record<string, unknown>,
        isOriginal = false,
        raw?: any,
        grade?: number,
        reasoning?: string,
        cardId?: string
    ) => {
        const cardProperties = properties as MoleculeProperties;
        const cardHasCation = typeof cardProperties.cation === 'string'
            ? cardProperties.cation.trim().length > 0
            : Boolean(cardProperties.cation);
        const cardIsAnion = Boolean(
            inferIsAnionFromData(raw) ||
            inferIsAnionFromData(cardProperties) ||
            cardHasCation ||
            useAnionDatabase
        );
        const fallbackValue = t('molecular.molCard.notAvailable');
        const showSmiles = canShowColumn('smiles');
        const showMolWeight = canShowColumn('molecular_weight');
        const showPredictedMp = !cardIsAnion && canShowColumn('predicted_MP_celsius');
        const showPredictedBp = !cardIsAnion && canShowColumn('predicted_BP_celsius');
        const showPredictedFp = !cardIsAnion && canShowColumn('predicted_FP_celsius');
        const showCombustion = !cardIsAnion && canShowColumn('combustion_enthalpy_ev');
        const showHomo = canShowColumn('HOMO_eV');
        const showLumo = canShowColumn('LUMO_eV');
        const showEspMax = canShowColumn('ESP_max_eV');
        const showEspMin = canShowColumn('ESP_min_eV');
        const showCommercial = canShowColumn('commercial_score');
        const showFunctionalGroups = canShowColumn('functional_groups');
        const showMolecularVolume = cardIsAnion && canShowColumn('vdw_volume_angstroms3');
        const showFluorideBde = cardIsAnion && canShowColumn('fluoride_bde_ev');
        const molecularVolumeDisplay = cardProperties.molecularVolume === undefined || cardProperties.molecularVolume === null || cardProperties.molecularVolume === ''
            ? fallbackValue
            : cardProperties.molecularVolume;
        const fluorideBdeDisplay = cardProperties.fluorineBondDissociationEnergy === undefined || cardProperties.fluorineBondDissociationEnergy === null || cardProperties.fluorineBondDissociationEnergy === ''
            ? fallbackValue
            : cardProperties.fluorineBondDissociationEnergy;
        const uniqueCardId = cardId || (isOriginal ? 'original' : `${name}-${cardProperties.smiles || Math.random()}`);
        const isFunctionalGroupsExpanded = expandedCards[uniqueCardId] || false;
        return (
            <div className="molecule-card">
                <div className="molecule-card-header">
                    <h3 className="molecule-card-name">{name}</h3>
                    <div className="custom-button-group">
                        <button 
                            onClick={(e: any) => {
                                e.stopPropagation();
                                handleAddToFavoritesByRaw(raw, properties);
                            }}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                border: '1px solid #f59e0b',
                                borderRadius: '8px',
                                background: '#fef3c7',
                                color: '#f59e0b',
                                cursor: 'pointer',
                                fontSize: '10px',
                                fontWeight: '500',
                                minWidth: 'auto',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f59e0b';
                                e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fef3c7';
                                e.currentTarget.style.color = '#f59e0b';
                            }}
                        >
                            <Plus size={14} />
                            {t('chatbox.buttons.favorites')}
                        </button>
                    </div>
                </div>
                <div className="molecule-card-structure">
                    <div className="molecule-structure-diagram">
                        {renderMoleculeStructure(cardProperties.smiles, cardProperties.cation)}
                    </div>
                </div>
                <div className="molecule-card-properties">
                    {grade !== undefined && grade !== null && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">LLM Grade:</span>
                            <span className="molecule-card-property-value">
                                {grade}
                                <ReasoningButton reasoning={reasoning} onShow={setReasoningText} />
                            </span>
                        </div>
                    )}
                    {showSmiles && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.nodePopup.smiles')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.smiles || '-'}</span>
                        </div>
                    )}
                    {showMolWeight && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.molWeight')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.molecularWeight || '-'}</span>
                        </div>
                    )}
                    {showPredictedMp && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.predictedMp')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.meltingPoint || '-'}</span>
                        </div>
                    )}
                    {showPredictedBp && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.predictedBp')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.boilingPoint || '-'}</span>
                        </div>
                    )}
                    {showPredictedFp && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.moleculeModal.properties.predictedFp')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.flashPoint || '-'}</span>
                        </div>
                    )}
                    {showMolecularVolume && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">Molecular Volume:</span>
                            <span className="molecule-card-property-value">{molecularVolumeDisplay}</span>
                        </div>
                    )}
                    {showFluorideBde && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">F Dissociation Energy:</span>
                            <span className="molecule-card-property-value">{fluorideBdeDisplay}</span>
                        </div>
                    )}
                    {showCombustion && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.moleculeModal.properties.combustionEnthalpy')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.combustionEnthalpy || '-'}</span>
                        </div>
                    )}
                    {showHomo && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.homo')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.homo || '-'}</span>
                        </div>
                    )}
                    {showLumo && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.lumo')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.lumo || '-'}</span>
                        </div>
                    )}
                    {showEspMax && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.espMax')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.espMax || '-'}</span>
                        </div>
                    )}
                    {showEspMin && (
                        <div className="molecule-card-property-item">
                            <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.espMin')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.espMin || '-'}</span>
                        </div>
                    )}
                    {showCommercial && (
                        <div className="molecule-card-property-item commercial-viability">
                            <span className="molecule-card-property-label">{t('molecular.moleculeModal.properties.commercialViability')}:</span>
                            <span className="molecule-card-property-value">{cardProperties.commercialViability || t('molecular.moleculeModal.unknown')}</span>
                        </div>
                    )}
                </div>
                
                {/* 功能组：默认折叠，字段按 Ask 填充 */}
                {showFunctionalGroups && (
                <div className="functional-groups-section">
                    <div 
                        className={`functional-groups-header ${isFunctionalGroupsExpanded ? 'expanded' : 'collapsed'}`} 
                        onClick={() => toggleFunctionalGroups(uniqueCardId)}
                    >
                        <svg className={`chevron-icon ${isFunctionalGroupsExpanded ? 'rotated' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                        </svg>
                        <span className="functional-groups-title">{t('molecular.molCard.clickToExpand')}</span>
                    </div>
                    {isFunctionalGroupsExpanded && (
                        <div className="functional-groups-content-new">
                            <h4>{t('molecular.moleculeModal.functionalGroupsTitle')}</h4>
                            {(() => {
                                const groups = extractFunctionalGroups(raw, properties);
                                return groups && groups.length > 0 ? (
                                    <ul className="functional-groups-list">
                                        {groups.map((g: any, idx: number) => (
                                            <li key={idx}>{String(g)}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{t('molecular.molCard.notAvailable')}</p>
                                );
                            })()}
                        </div>
                    )}
                </div>
                )}
                
                {isOriginal && (
                    <>
                    <div className="molecule-card-actions">
                        <select
                            className="molecule-type-select"
                            value={selectedMoleculeType}
                            onChange={(event) => {
                                if (isFindFriendsLocked) {
                                    event.preventDefault();
                                    handleLockedAction();
                                    return;
                                }
                                if (isAnionFindFriend) {
                                    event.preventDefault();
                                    return;
                                }
                                handleMoleculeTypeChange(event);
                            }}
                            onMouseDown={(event) => {
                                if (isFindFriendsLocked) {
                                    event.preventDefault();
                                    handleLockedAction();
                                    return;
                                }
                                if (isAnionFindFriend) {
                                    event.preventDefault();
                                }
                            }}
                            aria-disabled={isFindFriendsLocked || isAnionFindFriend}
                            style={{
                                cursor: isFindFriendsLocked || isAnionFindFriend ? 'not-allowed' : 'pointer',
                                opacity: isFindFriendsLocked || isAnionFindFriend ? 0.6 : 1,
                            }}
                        >
                            {isAnionFindFriend ? (
                                <option value="salt">{t('molecular.moleculeModal.types.salt', 'Salt')}</option>
                            ) : (
                                <>
                                    <option value="solvent">{t('molecular.moleculeModal.types.solvent')}</option>
                                    <option value="cosolvent">{t('molecular.moleculeModal.types.cosolvent')}</option>
                                    <option value="diluent">{t('molecular.moleculeModal.types.diluent')}</option>
                                    <option value="additive">{t('molecular.moleculeModal.types.additive')}</option>
                                </>
                            )}
                        </select>
                        <button
                            className={`molecule-card-btn find-similar ${isSimilarLoading ? 'loading' : ''}`}
                            onClick={() => {
                                if (isFindFriendsLocked) {
                                    handleLockedAction();
                                    return;
                                }
                                handleFindSimilar(name);
                            }}
                            disabled={isSimilarLoading}
                            style={{
                                cursor: isSimilarLoading ? 'wait' : isFindFriendsLocked ? 'not-allowed' : 'pointer',
                                opacity: isFindFriendsLocked ? 0.5 : 1,
                            }}
                        >
                            {isSimilarLoading ? (
                                <div className="loading-spinner-small"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                                </svg>
                            )}
                            <span>{isSimilarLoading ? t('molecular.molCard.loading') : t('molecular.moleculeModal.findSimilar')}</span>
                        </button>
                    </div>
                    {selectedMoleculeType === 'additive' && (
                        <div style={{ marginTop: '8px' }}>
                            <label style={{ marginRight: '4px' }}>{t('molecular.moleculeModal.additiveSubtypes.title')}</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                <select
                                    value={additiveCategory}
                                    onChange={handleAdditiveCategoryChange}
                                    style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                                    aria-label={t('molecular.moleculeModal.additiveSubtypes.categoryLabel')}
                                >
                                    {Object.keys(ADDITIVE_CATEGORY_LABEL_KEYS).map((categoryKey) => (
                                        <option key={categoryKey} value={categoryKey}>
                                            {t(
                                                `molecular.moleculeModal.additiveSubtypes.${ADDITIVE_CATEGORY_LABEL_KEYS[categoryKey as AdditiveCategoryType]}`,
                                            )}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedAdditiveSubtype}
                                    onChange={handleAdditiveSubtypeChange}
                                    style={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                                >
                                    {additiveOptionList.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {t(
                                                `molecular.moleculeModal.additiveSubtypes.${option.labelKey}`,
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ whiteSpace: 'nowrap' }}>{t('search.intelligentFindFriendsLabel')}</span>
                        <InfoTooltip
                            title={(
                                <InfoTooltipContent
                                    title={t('search.intelligentFindFriendsLabel')}
                                    description={t('search.intelligentFindFriendsTooltip')}
                                    remainingLabel={formatQueryLimitLabel(modeLimits.findFriendLLM, t, 'search.intelligentFindFriendsLimitLabel')}
                                />
                            )}
                            placement="top"
                        >
                            <Info size={16} className="ff-info-icon" />
                        </InfoTooltip>
                        <select
                            value={computeLevel}
                            onChange={(event) => {
                                if (isFindFriendsLocked) {
                                    event.preventDefault();
                                    handleLockedAction();
                                    return;
                                }
                                setComputeLevel(event.target.value);
                            }}
                            onMouseDown={(event) => {
                                if (isFindFriendsLocked) {
                                    event.preventDefault();
                                    handleLockedAction();
                                }
                            }}
                            aria-disabled={isFindFriendsLocked}
                            style={{
                                backgroundColor: isFindFriendsLocked ? '#f1f5f9' : 'white',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                padding: '4px',
                                color: isFindFriendsLocked ? '#94a3b8' : undefined,
                                cursor: isFindFriendsLocked ? 'not-allowed' : 'pointer',
                                opacity: isFindFriendsLocked ? 0.6 : 1,
                            }}
                        >
                            <option value="Disabled">{t('search.computeDisabled')}</option>
                            <option value="Low">{t('search.computeLow')}</option>
                            <option
                                value="Medium"
                                disabled={userPermissions === 'research'}
                                title={userPermissions === 'research' ? t('search.upgradeAccount') : ''}
                            >
                                {t('search.computeMedium')}
                                {userPermissions === 'research' ? ' 🔒' : ''}
                            </option>
                            <option
                                value="High"
                                disabled={['research', 'explorer', 'team'].includes(userPermissions || '')}
                                title={['research', 'explorer', 'team'].includes(userPermissions || '') ? t('search.upgradeEnterprise') : ''}
                            >
                                {t('search.computeHigh')}
                                {['research', 'explorer', 'team'].includes(userPermissions || '') ? ' 🔒' : ''}
                            </option>
                            {userPermissions === 'admin' && <option value="Extreme">{t('search.computeExtreme')}</option>}
                        </select>
                    </div>
                    <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={showAdvanced}
                        onClick={handleAdvancedToggle}
                        onKeyDown={handleAdvancedToggleKeyDown}
                        style={{
                            marginTop: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: isFindFriendsLocked ? 'not-allowed' : 'pointer',
                            color: '#2563eb',
                            fontWeight: 500,
                            fontSize: '13px',
                            border: '1px solid #2563eb',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            backgroundColor: showAdvanced ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                            transition: 'background-color 0.2s',
                            opacity: isFindFriendsLocked ? 0.5 : 1,
                        }}
                    >
                        <span>{t('search.advancedOptions')}</span>
                        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                    {showAdvanced && (
                        <FindFriendAdvancedOptions
                            extraRequests={extraRequests}
                            setExtraRequests={setExtraRequests}
                            selectedMolType={selectedMoleculeType}
                            setSelectedMolType={setSelectedMoleculeType}
                            additiveSubtype={selectedAdditiveSubtype}
                            setAdditiveSubtype={setSelectedAdditiveSubtype}
                            computeLevel={computeLevel}
                            structureWeight={structureWeight}
                            setStructureWeight={setStructureWeight}
                            showHypothetical={showHypothetical}
                            setShowHypothetical={setShowHypothetical}
                            userPermissions={userPermissions || undefined}
                            showBatteryFields={false}
                            showStructureSlider={!isAnionFindFriend}
                            readOnly={isFindFriendsLocked}
                            onLockedClick={handleLockedAction}
                        />
                    )}
                    </>
                )}
            </div>
        );
    };

    // 将后端字段映射到面板展示字段
    const mapDetailsToProperties = (raw: any): MoleculeProperties => {
        const smiles = raw?.SMILES || raw?.smiles || '';
        const cation = raw?.cation ?? raw?.CATION;
        const molecularWeight = raw?.molecular_weight != null ? String(raw.molecular_weight) : raw?.molecularWeight;
        const predictedMp = raw?.predicted_MP_celsius ?? raw?.predicted_mp_celsius ?? raw?.predicted_MP ?? raw?.predictedMp;
        const predictedBp = raw?.predicted_BP_celsius ?? raw?.predicted_bp_celsius ?? raw?.predicted_BP ?? raw?.predictedBp;
        const predictedFp = raw?.PREDICTED_FP_CELSIUS ?? raw?.predicted_FP_celsius ?? raw?.predicted_fp_celsius ?? raw?.predictedFp;
        const combustionEnthalpy = raw?.COMBUSTION_ENTHALPY_EV ?? raw?.combustion_enthalpy_ev ?? raw?.combustionEnthalpy;
        const vdwVolume = raw?.vdw_volume_angstroms3 ?? raw?.VDW_VOLUME_ANGSTROMS3 ?? raw?.vdwVolumeAngstroms3;
        const fluorideBde = raw?.fluoride_bde_ev ?? raw?.FLUORIDE_BDE_EV ?? raw?.fluorideBdeEv;
        const homo = raw?.HOMO_eV ?? raw?.HOMO ?? raw?.homo;
        const lumo = raw?.LUMO_eV ?? raw?.LUMO ?? raw?.lumo;
        const espMax = raw?.ESP_max_eV ?? raw?.ESP_MAX ?? raw?.espMax;
        const espMin = raw?.ESP_min_eV ?? raw?.ESP_MIN ?? raw?.espMin;
        const commercialScore = raw?.commercial_score ?? raw?.COMMERCIAL_SCORE;
        const commercialViability = commercialScore != null ? COMMERCIAL_SCORE_MAP[commercialScore as keyof typeof COMMERCIAL_SCORE_MAP] : undefined;

        return {
            smiles,
            cation,
            molecularWeight: molecularWeight ? `${molecularWeight} g/mol` : undefined,
            meltingPoint: predictedMp != null ? `${predictedMp} °C` : undefined,
            boilingPoint: predictedBp != null ? `${predictedBp} °C` : undefined,
            flashPoint: predictedFp != null ? `${predictedFp} °C` : undefined,
            combustionEnthalpy: combustionEnthalpy != null ? String(combustionEnthalpy) : undefined,
            molecularVolume: vdwVolume != null ? `${vdwVolume} Å³` : undefined,
            fluorineBondDissociationEnergy: fluorideBde != null ? `${fluorideBde} eV` : undefined,
            homo: homo != null ? String(homo) : undefined,
            lumo: lumo != null ? String(lumo) : undefined,
            espMax: espMax != null ? String(espMax) : undefined,
            espMin: espMin != null ? String(espMin) : undefined,
            commercialViability
        };
    };

    // 将 MoleculeData 转换为 MoleculeProperties（用于直接传入的完整分子对象）
    const convertMoleculeDataToProperties = (moleculeData: MoleculeData): MoleculeProperties => {
        const commercialScore = moleculeData?.COMMERCIAL_SCORE;
        const commercialViability = commercialScore != null ? COMMERCIAL_SCORE_MAP[commercialScore as keyof typeof COMMERCIAL_SCORE_MAP] : undefined;
        const vdwVolume = (moleculeData as any).vdw_volume_angstroms3 ?? (moleculeData as any).VDW_VOLUME_ANGSTROMS3;
        const fluorideBde = (moleculeData as any).fluoride_bde_ev ?? (moleculeData as any).FLUORIDE_BDE_EV;

        return {
            smiles: moleculeData.SMILES,
            cation: moleculeData.cation,
            molecularWeight: moleculeData.molecular_weight != null ? `${moleculeData.molecular_weight} g/mol` : undefined,
            meltingPoint: moleculeData.predicted_MP_celsius != null ? `${moleculeData.predicted_MP_celsius} °C` : undefined,
            boilingPoint: moleculeData.predicted_BP_celsius != null ? `${moleculeData.predicted_BP_celsius} °C` : undefined,
            flashPoint: moleculeData.predicted_FP_celsius != null ? `${moleculeData.predicted_FP_celsius} °C` : undefined,
            combustionEnthalpy: moleculeData.COMBUSTION_ENTHALPY_EV != null ? String(moleculeData.COMBUSTION_ENTHALPY_EV) : undefined,
            molecularVolume: vdwVolume != null ? `${vdwVolume} Å³` : undefined,
            fluorineBondDissociationEnergy: fluorideBde != null ? `${fluorideBde} eV` : undefined,
            homo: moleculeData.HOMO_eV != null ? String(moleculeData.HOMO_eV) : undefined,
            lumo: moleculeData.LUMO_eV != null ? String(moleculeData.LUMO_eV) : undefined,
            espMax: moleculeData.ESP_max_eV != null ? String(moleculeData.ESP_max_eV) : undefined,
            espMin: moleculeData.ESP_min_eV != null ? String(moleculeData.ESP_min_eV) : undefined,
            commercialViability
        };
    };

    const fetchOriginalDetails = async (name: string): Promise<{ props?: MoleculeProperties; smiles?: string; raw?: any; }> => {
        const params = new URLSearchParams();
        params.set('molecule', name);
        if (isHighTier) {
            params.set('query_type', 'molecule');
            params.set('use_35m', 'true');
        }
        if (useAnionDatabase) {
            params.set('is_anion', 'true');
            params.set('umap_type', 'anions');
        }

        const queryUrl = `${API_URL}/api/molecule_details?${params.toString()}`;
        const resp = await authFetch(queryUrl, { method: 'GET' });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.detail || 'Failed to fetch molecule details');
        const list = Array.isArray(data?.molecule_details) ? data.molecule_details : [];
        const first = list[0] || {};
        const props = mapDetailsToProperties(first);
        return { props, smiles: props.smiles, raw: first };
    };

    const fetchSimilarBySmiles = async (smiles: string, rawOriginal?: any, molType?: string): Promise<{ list: SimilarMolecule[]; raws: any[] }> => {
        const payload: any = {
            smiles,
            use_35m: isHighTier,
            structure_weight: structureWeight,
            commercial_scores: showHypothetical ? [0, 1, 2, 3] : [1, 2, 3]
        };
        if (molType) {
            payload.mol_type = molType;
        }

        const baseQuery = buildQueryString('', '', '', '', '');
        const queryParts: string[] = baseQuery ? [baseQuery] : [];

        if (selectedMoleculeType) {
            const molTypeLabel = selectedMoleculeType;
            queryParts.push(`I am looking for ${molTypeLabel} molecules.`);
        }
        if (extraRequests.trim()) {
            queryParts.push(`I have the following requirements: ${extraRequests.trim()}`);
        }

        const queryString = queryParts.join(' ').trim();
        if (queryString) {
            payload.query = queryString;
        }

        const computePowerEnabled = computeLevel !== 'Disabled';
        if (computePowerEnabled) {
            payload.llm_compute_power = computeLevel.toLowerCase();
            const conversationLog = messages
                .filter((message) => message.role === 'user' || message.role === 'assistant')
                .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content ?? ''}`)
                .join('\n\n');
            if (conversationLog) {
                payload.response = conversationLog;
            }
        }

        if (extraRequests.trim()) {
            payload.extra_requests = extraRequests;
        }
        if (useAnionDatabase) {
            payload.is_anion = true;
        }
        if (isHighTier && rawOriginal) {
            const selectedMoleculeStr = [
                `Name: ${rawOriginal?.name || 'N/A'}`,
                `SMILES: ${rawOriginal?.SMILES || smiles}`,
                `Molecular weight: ${rawOriginal?.molecular_weight ?? 'N/A'}`,
                `HOMO eV: ${rawOriginal?.HOMO_eV ?? 'N/A'}`,
                `LUMO eV: ${rawOriginal?.LUMO_eV ?? 'N/A'}`,
                `ESP Max: ${rawOriginal?.ESP_max_eV ?? 'N/A'}`,
                `ESP Min: ${rawOriginal?.ESP_min_eV ?? 'N/A'}`,
                `Functional groups: ${JSON.stringify(rawOriginal?.functional_groups || [])}`,
                `Predicted MP: ${rawOriginal?.predicted_MP_celsius ?? 'N/A'} °C`,
                `Predicted BP: ${rawOriginal?.predicted_BP_celsius ?? 'N/A'} °C`
            ].join('\n');
            payload.selected_molecule_str = selectedMoleculeStr;
        }

        const resp = await authFetch(`${API_URL}/api/llm/find-friend-with-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.detail || 'Failed to find similar molecules');
        const items = Array.isArray(data?.similar_molecules) ? data.similar_molecules : [];
        const mapped: SimilarMolecule[] = items.map((it: any) => ({
            name: it?.name || it?.SMILES || 'Unknown',
            properties: mapDetailsToProperties(it),
            grade: it?.grade,
            reasoning: it?.reasoning,
        }));
        return { list: mapped, raws: items };
    };

    // 加载原始分子详情：如果有完整分子对象则直接使用，否则从API获取
    useEffect(() => {
        let isCancelled = false;
        
        if (molecule) {
            // 直接使用传入的完整分子对象，避免API请求
            if (!isCancelled) {
                const properties = convertMoleculeDataToProperties(molecule);
                setOriginalMoleculeProps(properties);
                setCurrentSmiles(molecule.SMILES);
                setRawOriginal(molecule);
                setSimilarMolecules([]);
                setSimilarRawList([]);
                setShowSimilar(false);
                setUseAnionDatabase(inferIsAnionFromData(molecule));
                setIsLoading(false);
            }
        } else {
            // 如果没有完整分子对象，则从API获取（向后兼容）
            const loadData = async () => {
                setIsLoading(true);
                try {
                    const original = await fetchOriginalDetails(moleculeName);
                    if (isCancelled) return;
                    setOriginalMoleculeProps(original?.props);
                    setCurrentSmiles(original?.smiles);
                    setRawOriginal(original?.raw);
                    setSimilarMolecules([]);
                    setSimilarRawList([]);
                    setShowSimilar(false);
                    setUseAnionDatabase(inferIsAnionFromData(original?.raw));
                } catch (err) {
                    if (!isCancelled) {
                        setSimilarMolecules([]);
                        setSimilarRawList([]);
                    }
                } finally {
                    if (!isCancelled) setIsLoading(false);
                }
            };
            loadData();
        }
        
        return () => { isCancelled = true; };
    }, [moleculeName, molecule]);

    const similarCountText = useMemo(() => t('molecular.moleculeModal.similarWithCount', { count: similarMolecules.length }), [t, similarMolecules.length]);

    return (
        <>
        <div className="molecule-panel expanded" style={{ display: 'block', opacity: 1, transform: 'translateX(0px)', transition: '0.3s' }}>
            <div className="molecule-panel-header">
                <div className="molecule-panel-title">
                    <span>{t('molecular.nodePopup.title')}</span>
                </div>
                <button className="molecule-panel-close" onClick={handleClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div className="molecule-panel-content">
                <div className="molecule-panel-main" id="moleculePanelMain">
                    <div className="similar-molecules-comparison">
                        <div className="original-molecule-section">
                            <h4 style={{fontWeight: '400'}} className="section-title">{t('molecular.moleculeModal.original')}</h4>
                            {renderMoleculeCard(molecule?.name || moleculeName, originalMoleculeProps || {}, true, rawOriginal, molecule?.grade, molecule?.reasoning)}
                        </div>
                {showSimilar && (
                    <div className="similar-molecules-section">
                        <h4 style={{fontWeight: '400'}} className="section-title">{similarCountText}</h4>
                        {isSimilarLoading ? (
                            <div className="similar-molecules-grid">
                                {t('molecular.molCard.loading')}
                            </div>
                        ) : (
                            <div className="similar-molecules-grid">
                                {similarMolecules.map((molecule, index) => (
                                    <div key={index}>
                                        {renderMoleculeCard(molecule.name, molecule.properties, false, similarRawList[index], (molecule as any).grade, (molecule as any).reasoning, `similar-${index}`)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                    </div>
                </div>
            </div>
        </div>
        <ReasoningModal text={reasoningText} onClose={() => setReasoningText(null)} />
        </>
    );
};

export default MoleculeModal;
