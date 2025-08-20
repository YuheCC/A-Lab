import { useRef, useState, useEffect } from "react";
import { useInorganicPlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";

const InorganicMolecules = () => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);

    const { data, loading, error, fetchData } = useInorganicPlotDataStore(); 

    const [showMapFooter, setShowMapFooter] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);

    // 组件挂载时获取数据
    useEffect(() => {
        if (data.length === 0) {
            fetchData();
        }
    }, [data.length, fetchData]);

    // Generate cluster descriptions dynamically
    const renderClusterDescriptions = () => {
        const clusters = [];
        for (let i = 0; i <= 24; i++) {
            clusters.push(
                <p key={i} style={{ marginBottom: '10px' }}>
                    <strong>Cluster {i + 1}:</strong> {t(`map.clusters.cluster${i}`)}
                </p>
            );
        }
        return clusters;
    };

    return (
        <>
            {/* UMAP Visualization in the middle (50%) */}
            <div className="search-umap-container">
                {/* UMAP Visualization in the middle (50%) */}
                <div className="search-umap-section" style={{ position: 'relative' }}>
                    {/* Info icon with tooltip */}
                    <div 
                        style={{
                            position: 'absolute',
                            top: '15px',
                            left: '15px',
                            zIndex: 1000,
                            cursor: 'pointer'
                        }}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                    >
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24"
                            style={{
                                fill: '#0066cc',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }}
                        >
                            <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="#0066cc" strokeWidth="2"/>
                            <text x="12" y="16" textAnchor="middle" fontSize="12" fill="#0066cc" fontWeight="bold">i</text>
                        </svg>
                        
                        {/* Tooltip */}
                        {showTooltip && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '30px',
                                    left: '0',
                                    backgroundColor: '#333',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap',
                                    zIndex: 1001,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    maxWidth: '300px'
                                }}
                            >
                                {
                                    <p style={{ width: '300px', fontSize: '10.5px', marginTop: '8px', marginBottom: '0', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                                        {t('map.footer.systemRequirements')} <br></br>
                                        {t('map.footer.citation')} <a className="terms-link" style={{color: '#0066cc', textDecoration: 'underline'}} href="https://pubs.acs.org/doi/10.1021/acs.jcim.7b00425">10.1021/acs.jcim.7b00425</a>
                                    </p>
                                }
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '-5px',
                                        left: '10px',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '5px solid transparent',
                                        borderRight: '5px solid transparent',
                                        borderBottom: '5px solid #333'
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="graph-container search-graph">
                        {data.length > 0 ? (
                            <UMAPClusterPlotDeck
                                data={data}
                                userPermissions={userPermissions}
                                onClick={(node: any) => {
                                    setNode(node);
                                    nodePopupRef.current?.show();
                                }}
                            />
                        ) : (
                            <div className="loading-message">
                                {loading ? t('map.loading.message') : error ? t('map.loading.error') : t('map.loading.noData')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right text content */}
                <div className="search-interface-section" style={{ flex: '0.8', overflowY: 'auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', height: 'calc(100vh - 140px)', overflow: 'scroll' }}>
                    <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>{t('map.inorganic.title')}</h2>
                    
                    {/* Motivation Section */}
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>{t('map.inorganic.motivation.title')}</h3>
                        <p style={{ marginBottom: '15px', lineHeight: '1.6', fontSize: '14px' }}>
                            {t('map.inorganic.motivation.content')}
                        </p>
                    </div>

                    {/* Dataset Generation Section */}
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>{t('map.inorganic.datasetGeneration.title')}</h3>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#555' }}>{t('map.inorganic.datasetGeneration.generativeAlgorithm.title')}</h4>
                            <p style={{ marginBottom: '10px', lineHeight: '1.6', fontSize: '14px' }}>
                                {t('map.inorganic.datasetGeneration.generativeAlgorithm.content')}
                            </p>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#555' }}>{t('map.inorganic.datasetGeneration.dftCalculations.title')}</h4>
                            
                            <div style={{ marginBottom: '10px' }}>
                                <h5 style={{ fontWeight: '500', marginBottom: '5px', color: '#666' }}>{t('map.inorganic.datasetGeneration.dftCalculations.initialConvergence.title')}</h5>
                                <p style={{ marginBottom: '8px', lineHeight: '1.6', fontSize: '14px' }}>
                                    {t('map.inorganic.datasetGeneration.dftCalculations.initialConvergence.content')}
                                </p>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <h5 style={{ fontWeight: '500', marginBottom: '5px', color: '#666' }}>{t('map.inorganic.datasetGeneration.dftCalculations.geometryChecking.title')}</h5>
                                <p style={{ marginBottom: '8px', lineHeight: '1.6', fontSize: '14px' }}>
                                    {t('map.inorganic.datasetGeneration.dftCalculations.geometryChecking.content')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Visualization Section */}
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>{t('map.inorganic.visualization.title')}</h3>
                        
                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#555' }}>{t('map.inorganic.visualization.preprocessing.title')}</h4>
                            <p style={{ marginBottom: '10px', lineHeight: '1.6', fontSize: '14px' }}>
                                {t('map.inorganic.visualization.preprocessing.content')}
                            </p>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#555' }}>{t('map.inorganic.visualization.dimensionalityReduction.title')}</h4>
                            <p style={{ marginBottom: '10px', lineHeight: '1.6', fontSize: '14px' }}>
                                {t('map.inorganic.visualization.dimensionalityReduction.content')}
                            </p>
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#555' }}>{t('map.inorganic.visualization.clusterLabeling.title')}</h4>
                            <p style={{ marginBottom: '10px', lineHeight: '1.6', fontSize: '14px' }}>
                                {t('map.inorganic.visualization.clusterLabeling.content')}
                            </p>
                        </div>
                    </div>

                    {/* Result Section */}
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>{t('map.inorganic.result.title')}</h3>
                        <p style={{ marginBottom: '15px', lineHeight: '1.6', fontSize: '14px' }}>
                            {t('map.inorganic.result.content')}
                        </p>
                    </div>

                    {/* Image Section */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                        <img 
                            src="/Inorganic.png" 
                            alt="Inorganic Molecules UMAP Visualization"
                            style={{
                                maxWidth: '100%',
                                height: 'auto'
                            }}
                        />
                    </div>

                    {/* Cluster Analysis Section */}
                    <div style={{ marginBottom: '25px' }}>
                        <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>{t('map.inorganic.clusters.title')}</h3>
                        <p style={{ marginBottom: '15px', lineHeight: '1.6', fontSize: '14px' }}>
                            {t('map.inorganic.clusters.description')}
                        </p>
                        
                        <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ marginBottom: '10px' }}>
                                    <strong>Cluster 1:</strong> {t('map.inorganic.clusters.cluster1')}
                                </p>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ marginBottom: '10px' }}>
                                    <strong>Cluster 2:</strong> {t('map.inorganic.clusters.cluster2')}
                                </p>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ marginBottom: '10px' }}>
                                    <strong>Cluster 3:</strong> {t('map.inorganic.clusters.cluster3')}
                                </p>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ marginBottom: '10px' }}>
                                    <strong>Cluster 4:</strong> {t('map.inorganic.clusters.cluster4')}
                                </p>
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                                <p style={{ marginBottom: '10px' }}>
                                    <strong>Cluster 5:</strong> {t('map.inorganic.clusters.cluster5')}
                                </p>
                            </div>
                            
                            <div style={{ marginBottom: '0' }}>
                                <p style={{ marginBottom: '10px' }}>
                                    <strong>Cluster 6:</strong> {t('map.inorganic.clusters.cluster6')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NodePopup node={node} ref={nodePopupRef}/>
        </>
    )
};

export default InorganicMolecules;
