import { useState } from 'react';

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
    const [isFunctionalGroupsExpanded, setIsFunctionalGroupsExpanded] = useState(false);
    const [selectedMoleculeType, setSelectedMoleculeType] = useState('solvent');

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

    const renderMoleculeCard = (name: string, properties: any, isOriginal = false) => {
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
                        title="收藏"
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
                        <span className="molecule-card-property-label">SMILES:</span>
                        <span className="molecule-card-property-value">{properties.smiles || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">Molecular Weight:</span>
                        <span className="molecule-card-property-value">{properties.molecularWeight || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">Predicted Melting Point:</span>
                        <span className="molecule-card-property-value">{properties.meltingPoint || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">Predicted Boiling Point:</span>
                        <span className="molecule-card-property-value">{properties.boilingPoint || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">Predicted Flash Point:</span>
                        <span className="molecule-card-property-value">{properties.flashPoint || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">Combustion Enthalpy:</span>
                        <span className="molecule-card-property-value">{properties.combustionEnthalpy || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">HOMO:</span>
                        <span className="molecule-card-property-value">{properties.homo || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">LUMO:</span>
                        <span className="molecule-card-property-value">{properties.lumo || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">ESP Max:</span>
                        <span className="molecule-card-property-value">{properties.espMax || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item">
                        <span className="molecule-card-property-label">ESP Min:</span>
                        <span className="molecule-card-property-value">{properties.espMin || '-'}</span>
                    </div>
                    <div className="molecule-card-property-item commercial-viability">
                        <span className="molecule-card-property-label">Commercial Viability:</span>
                        <span className="molecule-card-property-value">{properties.commercialViability || 'Unknown'}</span>
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
                        <span className="functional-groups-title">点击展开查看更多详情</span>
                    </div>
                    {isFunctionalGroupsExpanded && (
                        <div className="functional-groups-content">
                            <h4>功能基团</h4>
                            <p>醚、缩酮、碳酸酯、酯</p>
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
                            <option value="all">所有类型</option>
                            <option value="solvent">溶剂</option>
                            <option value="diluent">稀释剂</option>
                            <option value="additive">添加剂</option>
                        </select>
                        <button 
                            className="molecule-card-btn find-similar" 
                            onClick={() => handleFindSimilar(name)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"></path>
                            </svg>
                            <span>查找相似</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // 相似分子数据
    const similarMolecules = [
        {
            name: 'Similar 1',
            properties: {
                smiles: 'CCO',
                molecularWeight: '150.0 g/mol',
                meltingPoint: '25°C',
                boilingPoint: '150°C',
                flashPoint: '45°C',
                combustionEnthalpy: '-65.0 eV',
                homo: '-7.0 eV',
                lumo: '0.5 eV',
                espMax: '0.8 eV',
                espMin: '-1.5 eV',
                commercialViability: 'Commercially available'
            }
        },
        {
            name: 'Similar 2',
            properties: {
                smiles: 'CCCO',
                molecularWeight: '160.0 g/mol',
                meltingPoint: '30°C',
                boilingPoint: '160°C',
                flashPoint: '50°C',
                combustionEnthalpy: '-68.0 eV',
                homo: '-7.2 eV',
                lumo: '0.4 eV',
                espMax: '0.7 eV',
                espMin: '-1.6 eV',
                commercialViability: 'Commercially available'
            }
        },
        {
            name: 'Similar 3',
            properties: {
                smiles: 'CCCCO',
                molecularWeight: '170.0 g/mol',
                meltingPoint: '35°C',
                boilingPoint: '170°C',
                flashPoint: '55°C',
                combustionEnthalpy: '-71.0 eV',
                homo: '-7.4 eV',
                lumo: '0.3 eV',
                espMax: '0.6 eV',
                espMin: '-1.7 eV',
                commercialViability: 'Limited commercial availability'
            }
        },
        {
            name: 'Similar 4',
            properties: {
                smiles: 'CCCCCO',
                molecularWeight: '180.0 g/mol',
                meltingPoint: '40°C',
                boilingPoint: '180°C',
                flashPoint: '60°C',
                combustionEnthalpy: '-74.0 eV',
                homo: '-7.6 eV',
                lumo: '0.2 eV',
                espMax: '0.5 eV',
                espMin: '-1.8 eV',
                commercialViability: 'Limited commercial availability'
            }
        },
        {
            name: 'Similar 5',
            properties: {
                smiles: 'CCCCCCO',
                molecularWeight: '190.0 g/mol',
                meltingPoint: '45°C',
                boilingPoint: '190°C',
                flashPoint: '65°C',
                combustionEnthalpy: '-77.0 eV',
                homo: '-7.8 eV',
                lumo: '0.1 eV',
                espMax: '0.4 eV',
                espMin: '-1.9 eV',
                commercialViability: 'Limited commercial availability'
            }
        }
    ];

    return (
        <div className="molecule-panel expanded" style={{ display: 'block', opacity: 1, transform: 'translateX(0px)', transition: '0.3s' }}>
            <div className="molecule-panel-header">
                <div className="molecule-panel-title">
                    <span>分子详情</span>
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
                            <h3 className="section-title">原始分子</h3>
                            {renderMoleculeCard(moleculeName, {}, true)}
                        </div>
                        <div className="similar-molecules-section">
                            <h3 className="section-title">相似分子 ({similarMolecules.length})</h3>
                            <div className="similar-molecules-grid">
                                {similarMolecules.map((molecule, index) => (
                                    <div key={index}>
                                        {renderMoleculeCard(molecule.name, molecule.properties)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoleculeModal;