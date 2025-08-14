import { useEffect, useMemo, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { type MoleculeProperties, type SimilarMolecule } from '@/services/chat/moleculeService';
import { authFetch, getAPIUrl, COMMERCIAL_SCORE_MAP } from '@/utils.js';
import { useAuthStore } from '@/models/useAuth';
import MolViewer2D from '@/components/NodePopup/MolViewer2D';
import { FavoriteContext } from '@/layouts';

interface MoleculeModalProps {
    moleculeName?: string;
    onClose?: () => void;
    onAddToFavorites?: (moleculeName: string) => void;
    onFindSimilar?: (moleculeName: string) => void;
    onUpdateMoleculeType?: (moleculeName: string, type: string) => void;
}

const MoleculeModal: React.FC<MoleculeModalProps> = ({
    moleculeName = 'LiPF6',
    onClose,
    onAddToFavorites,
    onFindSimilar,
    onUpdateMoleculeType
}) => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const isHighTier = ['admin', 'enterprise', 'joint'].includes(userPermissions || '');
    const API_URL = getAPIUrl();
    const [isFunctionalGroupsExpanded, setIsFunctionalGroupsExpanded] = useState(false);
    const [selectedMoleculeType, setSelectedMoleculeType] = useState('solvent');
    const [similarMolecules, setSimilarMolecules] = useState<SimilarMolecule[]>([]);
    const [similarRawList, setSimilarRawList] = useState<any[]>([]);
    const [originalMoleculeProps, setOriginalMoleculeProps] = useState<MoleculeProperties | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [currentSmiles, setCurrentSmiles] = useState<string | undefined>(undefined);
    const [rawOriginal, setRawOriginal] = useState<any | undefined>(undefined);
    const [showSimilar, setShowSimilar] = useState(false);

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
        onFindSimilar?.(name);
        try {
            setIsLoading(true);
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
            setIsLoading(false);
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
            <MolViewer2D smile={smiles} width={200} height={200} />
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
                    <button 
                        className="molecule-card-favorite-btn" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavoritesByRaw(raw, properties);
                        }} 
                        title={t('molecular.nodePopup.addToFavorites')}
                    >
                        <svg t="1755154990581" className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <path d="M912 208H427.872l-50.368-94.176A63.936 63.936 0 0 0 321.056 80H112c-35.296 0-64 28.704-64 64v736c0 35.296 28.704 64 64 64h800c35.296 0 64-28.704 64-64v-608c0-35.296-28.704-64-64-64z m-800-64h209.056l68.448 128H912v97.984c-0.416 0-0.8-0.128-1.216-0.128H113.248c-0.416 0-0.8 0.128-1.248 0.128V144z m0 736v-96l1.248-350.144 798.752 1.216V784h0.064v96H112z" fill="#020202"></path>
                        </svg>
                    </button>
                </div>
                <div className="molecule-card-structure">
                    <div className="molecule-structure-diagram">
                        {renderMoleculeStructure((properties as MoleculeProperties).smiles)}
                    </div>
                </div>
                <div className="molecule-card-properties">
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
                    <div className="molecule-card-actions">
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
                            className="molecule-card-btn find-similar" 
                            onClick={() => handleFindSimilar(name)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                            </svg>
                            <span>{t('molecular.moleculeModal.findSimilar')}</span>
                        </button>
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
            use_35m: isHighTier
        };
        if (molType && molType !== 'all') {
            payload.mol_type = molType;
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

    // 仅加载原始分子详情；相似分子改为点击后再请求
    useEffect(() => {
        let isCancelled = false;
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
        return () => { isCancelled = true; };
    }, [moleculeName]);

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
                            <h3 className="section-title">{t('molecular.moleculeModal.original')}</h3>
                            {renderMoleculeCard(moleculeName, originalMoleculeProps || {}, true, rawOriginal)}
                        </div>
                {showSimilar && (
                    <div className="similar-molecules-section">
                        <h3 className="section-title">{similarCountText}</h3>
                        {isLoading ? (
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