import { useEffect, useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { type MoleculeProperties, type SimilarMolecule } from '@/services/chat/moleculeService';
import { authFetch, getAPIUrl, COMMERCIAL_SCORE_MAP } from '@/utils.js';
import { useAuthStore } from '@/models/useAuth';
import MolViewer2D from '@/components/NodePopup/MolViewer2D';
import type { MoleculeData } from '@/pages/Chat/hooks/useMoleculePanel';

import { FavoriteContext } from '@/layouts';
import type { Message } from '@/utils/messageUtils';

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
    const isHighTier = ['admin', 'enterprise', 'joint'].includes(userPermissions || '');
    const API_URL = getAPIUrl();
    const [isFunctionalGroupsExpanded, setIsFunctionalGroupsExpanded] = useState(false);
    const [selectedMoleculeType, setSelectedMoleculeType] = useState('all');
    const [similarMolecules, setSimilarMolecules] = useState<SimilarMolecule[]>([]);
    const [similarRawList, setSimilarRawList] = useState<any[]>([]);
    const [originalMoleculeProps, setOriginalMoleculeProps] = useState<MoleculeProperties | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSimilarLoading, setIsSimilarLoading] = useState(false);
    const [currentSmiles, setCurrentSmiles] = useState<string | undefined>(undefined);
    const [rawOriginal, setRawOriginal] = useState<any | undefined>(undefined);
    const [showSimilar, setShowSimilar] = useState(false);
    const [structureWeight, setStructureWeight] = useState(0.5);
    const defaultCompute = useMemo(() => (
        ['research', 'explorer', 'team'].includes(userPermissions || '') ? 'Low' : 'High'
    ), [userPermissions]);
    const [computeLevel, setComputeLevel] = useState(defaultCompute);
    useEffect(() => {
        setComputeLevel(defaultCompute);
    }, [defaultCompute]);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    const handleClose = () => {
        onClose?.();
    };

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
            const moleculeForCallback = molecule || {
                name: name,
                SMILES: currentSmiles || '',
                ...rawOriginal
            };
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
                const { list, raws } = await fetchSimilarBySmiles(smilesToUse, raw, selectedMoleculeType);
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
        onUpdateMoleculeType?.(moleculeName, newType);
    };

    const toggleFunctionalGroups = () => {
        setIsFunctionalGroupsExpanded(!isFunctionalGroupsExpanded);
    };

    const renderMoleculeStructure = (smiles?: string) => {
        return smiles ? (
            <MolViewer2D smile={smiles} />
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

    const renderMoleculeCard = (name: string, properties: MoleculeProperties | Record<string, unknown>, isOriginal = false, raw?: any) => {
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
                        {renderMoleculeStructure((properties as MoleculeProperties).smiles)}
                    </div>
                </div>
                <div className="molecule-card-properties">
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('chatbox.llmGrade')}:</span>
                        <span className="molecule-card-property-value">
                            {raw?.grade ?? raw?.GRADE ?? '-'}{raw?.grade != null || raw?.GRADE != null ? '/10' : ''}
                            {(raw?.reasoning || raw?.REASONING) && (
                                <Info size={14} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => alert(raw?.reasoning || raw?.REASONING)} />
                            )}
                        </span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.nodePopup.smiles')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).smiles || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.molWeight')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).molecularWeight || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.predictedMp')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).meltingPoint || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.predictedBp')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).boilingPoint || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.moleculeModal.properties.predictedFp')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).flashPoint || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.moleculeModal.properties.combustionEnthalpy')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).combustionEnthalpy || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.homo')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).homo || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.lumo')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).lumo || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.espMax')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).espMax || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">{t('molecular.umapPlot.properties.espMin')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).espMin || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item commercial-viability">
                        <span className="molecule-card-property-label">{t('molecular.moleculeModal.properties.commercialViability')}:</span>
                        <span className="molecule-card-property-value">{(properties as MoleculeProperties).commercialViability || t('molecular.moleculeModal.unknown')}</span>
                    </div>
                </div>
                
                {/* 功能组：默认折叠，字段按 Ask 填充 */}
                <div className="functional-groups-section">
                    <div 
                        className={`functional-groups-header ${isFunctionalGroupsExpanded ? 'expanded' : 'collapsed'}`} 
                        onClick={toggleFunctionalGroups}
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
                
                {isOriginal && (
                    <div
                        className="molecule-card-actions"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}
                    >
                        <div
                            className="molecule-actions-row"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}
                        >
                            <select
                                className="molecule-type-select"
                                value={selectedMoleculeType}
                                onChange={handleMoleculeTypeChange}
                            >
                                <option value="all">{t('molecular.moleculeModal.types.all')}</option>
                                <option value="solvent">{t('molecular.moleculeModal.types.solvent')}</option>
                                <option value="diluent">{t('molecular.moleculeModal.types.diluent')}</option>
                                <option value="additive">{t('molecular.moleculeModal.types.additive')}</option>
                            </select>
                            <button
                                className={`molecule-card-btn find-similar ${isSimilarLoading ? 'loading' : ''}`}
                                onClick={() => handleFindSimilar(name)}
                                disabled={isSimilarLoading}
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
                        <div
                            style={{ display: 'flex', alignItems: 'center', marginTop: '5px', cursor: 'pointer' }}
                            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        >
                            <span style={{ fontSize: '12px' }}>{t('search.advancedOptions')}</span>
                            {showAdvancedOptions ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
                        </div>
                        {showAdvancedOptions && (
                            <div style={{ width: '100%', marginTop: '8px', display: 'block' }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '10px', marginRight: '8px' }}>{t('search.searchRange')}:</span>
                                    <span style={{ fontSize: '10px' }}>{t('search.distantFriends')}</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={structureWeight}
                                        onChange={(e) => setStructureWeight(parseFloat(e.target.value))}
                                        style={{ margin: '0 4px' }}
                                    />
                                    <span style={{ fontSize: '10px' }}>{t('search.nearbyFriends')}</span>
                                    <span style={{ fontSize: '10px', marginLeft: '4px' }}>{structureWeight.toFixed(2)}</span>
                                </div>
                                <div className='checkbox-item'>
                                    <label>{t('search.intelligentCompute')}:</label>
                                    <select
                                        value={computeLevel}
                                        onChange={e => setComputeLevel(e.target.value)}
                                        style={{ marginLeft: '8px' }}
                                    >
                                        <option value="Disabled">{t('search.computeDisabled')}</option>
                                        <option value="Low">{t('search.computeLow')}</option>
                                        <option value="Medium" disabled={userPermissions === 'research'} title={userPermissions === 'research' ? t('search.upgradeAccount') : ''}>{t('search.computeMedium')}{userPermissions === 'research' ? ' 🔒' : ''}</option>
                                        <option value="High" disabled={["research", "explorer", "team"].includes(userPermissions || '')} title={["research", "explorer", "team"].includes(userPermissions || '') ? t('search.upgradeEnterprise') : ''}>{t('search.computeHigh')}{["research", "explorer", "team"].includes(userPermissions || '') ? ' 🔒' : ''}</option>
                                        {userPermissions === 'admin' && <option value="Extreme">{t('search.computeExtreme')}</option>}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // 将后端字段映射到面板展示字段
    const mapDetailsToProperties = (raw: any): MoleculeProperties => {
        const smiles = raw?.SMILES || raw?.smiles || '';
        const molecularWeight = raw?.molecular_weight != null ? String(raw.molecular_weight) : raw?.molecularWeight;
        const predictedMp = raw?.predicted_MP_celsius ?? raw?.predicted_mp_celsius ?? raw?.predicted_MP ?? raw?.predictedMp;
        const predictedBp = raw?.predicted_BP_celsius ?? raw?.predicted_bp_celsius ?? raw?.predicted_BP ?? raw?.predictedBp;
        const predictedFp = raw?.PREDICTED_FP_CELSIUS ?? raw?.predicted_FP_celsius ?? raw?.predicted_fp_celsius ?? raw?.predictedFp;
        const combustionEnthalpy = raw?.combustion_enthalpy_ev ?? raw?.combustionEnthalpy;
        const homo = raw?.HOMO_eV ?? raw?.HOMO ?? raw?.homo;
        const lumo = raw?.LUMO_eV ?? raw?.LUMO ?? raw?.lumo;
        const espMax = raw?.ESP_max_eV ?? raw?.ESP_MAX ?? raw?.espMax;
        const espMin = raw?.ESP_min_eV ?? raw?.ESP_MIN ?? raw?.espMin;
        const commercialScore = raw?.commercial_score ?? raw?.COMMERCIAL_SCORE;
        const commercialViability = commercialScore != null ? COMMERCIAL_SCORE_MAP[commercialScore as keyof typeof COMMERCIAL_SCORE_MAP] : undefined;

        return {
            smiles,
            molecularWeight: molecularWeight ? `${molecularWeight} g/mol` : undefined,
            meltingPoint: predictedMp != null ? `${predictedMp} °C` : undefined,
            boilingPoint: predictedBp != null ? `${predictedBp} °C` : undefined,
            flashPoint: predictedFp != null ? `${predictedFp} °C` : undefined,
            combustionEnthalpy: combustionEnthalpy != null ? String(combustionEnthalpy) : undefined,
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

        return {
            smiles: moleculeData.SMILES,
            molecularWeight: moleculeData.molecular_weight != null ? `${moleculeData.molecular_weight} g/mol` : undefined,
            meltingPoint: moleculeData.predicted_MP_celsius != null ? `${moleculeData.predicted_MP_celsius} °C` : undefined,
            boilingPoint: moleculeData.predicted_BP_celsius != null ? `${moleculeData.predicted_BP_celsius} °C` : undefined,
            flashPoint: moleculeData.predicted_FP_celsius != null ? `${moleculeData.predicted_FP_celsius} °C` : undefined,
            combustionEnthalpy: moleculeData.COMBUSTION_ENTHALPY_EV != null ? String(moleculeData.COMBUSTION_ENTHALPY_EV) : undefined,
            homo: moleculeData.HOMO_eV != null ? String(moleculeData.HOMO_eV) : undefined,
            lumo: moleculeData.LUMO_eV != null ? String(moleculeData.LUMO_eV) : undefined,
            espMax: moleculeData.ESP_max_eV != null ? String(moleculeData.ESP_max_eV) : undefined,
            espMin: moleculeData.ESP_min_eV != null ? String(moleculeData.ESP_min_eV) : undefined,
            commercialViability
        };
    };

    const fetchOriginalDetails = async (name: string): Promise<{ props?: MoleculeProperties; smiles?: string; raw?: any; }> => {
        let queryUrl = `${API_URL}/api/molecule_details?molecule=${encodeURIComponent(name)}`;
        if (isHighTier) {
            queryUrl += '&query_type=molecule&use_35m=true';
        }
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
            structure_weight: structureWeight
        };
        if (molType && molType !== 'all') {
            payload.mol_type = molType;
        }
        if (computeLevel !== 'Disabled') {
            payload.llm_compute_power = computeLevel.toLowerCase();
        }
        if (isHighTier && rawOriginal) {
            // 从 messages 中提取 query 和 response，参考 Ask 页面的逻辑
            let originalQuery: string | undefined = undefined;
            let llmResponse: string | undefined = undefined;
            
            if (messages.length > 0) {
                // 获取最新的用户消息和助手回复
                for (let i = messages.length - 1; i >= 0; i--) {
                    if (messages[i].role === 'assistant' && !llmResponse) {
                        llmResponse = messages[i].content;
                    } else if (messages[i].role === 'user' && !originalQuery) {
                        originalQuery = messages[i].content;
                    }
                    
                    // 一旦找到两个就停止
                    if (originalQuery && llmResponse) {
                        break;
                    }
                }
            }

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
            payload.query = originalQuery;
            payload.response = llmResponse;
        }

        const resp = await authFetch(`${API_URL}/find-friend-with-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.detail || 'Failed to find similar molecules');
        const items = Array.isArray(data?.similar_molecules) ? data.similar_molecules : [];
        const mapped: SimilarMolecule[] = items.map((it: any) => ({
            name: it?.name || it?.SMILES || 'Unknown',
            properties: mapDetailsToProperties(it)
        }));
        return { list: mapped, raws: items };
    };

    // 加载原始分子详情：如果有完整分子对象则直接使用，否则从API获取
    useEffect(() => {
        let isCancelled = false;
        
        if (molecule) {
            // 直接使用传入的完整分子对象，避免API请求
            const properties = convertMoleculeDataToProperties(molecule);
            setOriginalMoleculeProps(properties);
            setCurrentSmiles(molecule.SMILES);
            setRawOriginal(molecule);
            setSimilarMolecules([]);
            setSimilarRawList([]);
            setShowSimilar(false);
            setIsLoading(false);
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
                            {renderMoleculeCard(molecule?.name || moleculeName, originalMoleculeProps || {}, true, rawOriginal)}
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
                                        {renderMoleculeCard(molecule.name, molecule.properties, false, similarRawList[index])}
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
    );
};

export default MoleculeModal;