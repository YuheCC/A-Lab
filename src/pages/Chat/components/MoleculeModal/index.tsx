import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { moleculeService, type MoleculeProperties, type SimilarMolecule } from '@/pages/Chat/services/moleculeService';

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
    const [isFunctionalGroupsExpanded, setIsFunctionalGroupsExpanded] = useState(false);
    const [selectedMoleculeType, setSelectedMoleculeType] = useState('solvent');
    const [similarMolecules, setSimilarMolecules] = useState<SimilarMolecule[]>([]);
    const [originalMoleculeProps, setOriginalMoleculeProps] = useState<MoleculeProperties | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        onClose?.();
    };

    const handleAddToFavorites = (name: string) => {
        onAddToFavorites?.(name);
    };

    const handleFindSimilar = (name: string) => {
        onFindSimilar?.(name);
    };

    const handleMoleculeTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = event.target.value;
        setSelectedMoleculeType(newType);
        onUpdateMoleculeType?.(moleculeName, newType);
    };

    const toggleFunctionalGroups = () => {
        setIsFunctionalGroupsExpanded(!isFunctionalGroupsExpanded);
    };

    const renderMoleculeStructure = (name: string) => {
        return (
            <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style>
                        {`
                            .atom { font-family: Arial, sans-serif; font-weight: bold; }
                            .carbon { fill: #000; font-size: 14px; }
                            .oxygen { fill: #ff0000; font-size: 14px; }
                            .fluorine { fill: #00ff00; font-size: 14px; }
                            .nitrogen { fill: #0000ff; font-size: 14px; }
                            .hydrogen { fill: #666; font-size: 12px; }
                            .bond { stroke: #000; stroke-width: 2; fill: none; }
                            .double-bond { stroke: #000; stroke-width: 3; fill: none; }
                            .ring { stroke: #000; stroke-width: 2; fill: none; }
                        `}
                    </style>
                </defs>
                
                {/* 根据分子名称显示不同的结构图 */}
                <text x="100" y="60" className="atom carbon">C</text>
                <text x="80" y="70" className="atom hydrogen">H</text>
                <text x="120" y="70" className="atom hydrogen">H</text>
                <text x="100" y="80" className="atom hydrogen">H</text>
                <text x="100" y="90" className="atom hydrogen">H</text>
                {/* 键 */}
                <path className="bond" d="M100,60 L80,70"></path>
                <path className="bond" d="M100,60 L120,70"></path>
                <path className="bond" d="M100,60 L100,80"></path>
                <path className="bond" d="M100,60 L100,90"></path>
            </svg>
        );
    };

    const renderMoleculeCard = (name: string, properties: MoleculeProperties | Record<string, unknown>, isOriginal = false) => {
        return (
            <div className="molecule-card">
                <div className="molecule-card-header">
                    <h3 className="molecule-card-name">{name}</h3>
                    <button 
                        className="molecule-card-favorite-btn" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites(name);
                        }} 
                        title={t('molecular.nodePopup.addToFavorites')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"></path>
                        </svg>
                    </button>
                </div>
                <div className="molecule-card-structure">
                    <div className="molecule-structure-diagram">
                        {renderMoleculeStructure(name)}
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
                
                {/* 可展开/收起的功能组信息栏 */}
                <div className="functional-groups-section">
                    <div 
                        className={`functional-groups-header ${isFunctionalGroupsExpanded ? 'expanded' : 'collapsed'}`} 
                        onClick={toggleFunctionalGroups}
                    >
                        <svg className="chevron-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"></path>
                        </svg>
                        <span className="functional-groups-title">{t('molecular.molCard.clickToExpand')}</span>
                    </div>
                    {isFunctionalGroupsExpanded && (
                        <div className="functional-groups-content">
                            <h4>{t('molecular.moleculeModal.functionalGroupsTitle')}</h4>
                            <p>{t('molecular.moleculeModal.functionalGroupList')}</p>
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

    // 加载原始与相似分子数据（接口优先，失败走mock）
    useEffect(() => {
        let isCancelled = false;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [original, similars] = await Promise.all([
                    moleculeService.getMoleculeDetails(moleculeName),
                    moleculeService.getSimilarMolecules(moleculeName, selectedMoleculeType)
                ]);
                if (!isCancelled) {
                    setOriginalMoleculeProps(original?.properties);
                    setSimilarMolecules(similars);
                }
            } catch (err) {
                if (!isCancelled) {
                    setSimilarMolecules([]);
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        };
        loadData();
        return () => { isCancelled = true; };
    }, [moleculeName, selectedMoleculeType]);

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
                            {renderMoleculeCard(moleculeName, originalMoleculeProps || {}, true)}
                        </div>
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
                                            {renderMoleculeCard(molecule.name, molecule.properties)}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoleculeModal;