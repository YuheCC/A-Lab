import { useRef, useState } from "react";
import { usePlotDataStore } from "@/models/usePlotData";
import { NavLink } from "umi";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";

const Map = () => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);

    const { data, loading, error } = usePlotDataStore(); 

    const [showMapFooter, setShowMapFooter] = useState(true);

    // Generate cluster descriptions dynamically
    const renderClusterDescriptions = () => {
        const clusters = [];
        for (let i = 0; i <= 24; i++) {
            clusters.push(
                <p key={i} style={{ marginBottom: '10px' }}>
                    <strong>Cluster {i}:</strong> {t(`map.clusters.cluster${i}`)}
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
                <div className="search-umap-section">
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
                    <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>{t('map.about.title')}</h2>
                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        {t('map.about.description1')}
                    </p>

                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        {t('map.about.description2')}
                    </p>

                    <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        {t('map.about.description3')}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                        <picture>
                            <source srcSet="/MU05_Cluster_Numbered.webp" type="image/webp" />
                            <img
                                loading="lazy"
                                src="/MU05_Cluster_Numbered.png"
                                alt={t('map.imageAlt')}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto'
                                }}
                            />
                        </picture>
                    </div>

                    <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>{t('map.about.clusterTitle')}</h3>
                    <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                        {renderClusterDescriptions()}
                    </div>
                </div>
            </div>
            {false && showMapFooter && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    fontSize: '14px',
                    color: '#333',
                    textAlign: 'center',
                    padding: '10px 0',
                    backgroundColor: '#f1f1f1'
                }}>
                    <button
                        onClick={() => setShowMapFooter(false)}
                        style={{
                            position: 'absolute',
                            top: '5px',
                            right: '10px',
                            background: 'none',
                            border: 'none',
                            fontSize: '16px',
                            color: '#666',
                            cursor: 'pointer',
                            padding: '0',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title={t('map.footer.closeButton')}
                    >
                        ×
                    </button>
                    {t('map.footer.agreement')} <NavLink to="/terms" style={{ color: '#0066cc', textDecoration: 'underline' }}>{t('map.footer.termsLink')}</NavLink>
                    <p style={{ fontSize: '10.5px', marginTop: '8px', marginBottom: '0' }}>
                        {t('map.footer.systemRequirements')} <br></br>
                        {t('map.footer.citation')} <a href="https://pubs.acs.org/doi/10.1021/acs.jcim.7b00425">10.1021/acs.jcim.7b00425</a>
                    </p>
                </div>
            )}
            <NodePopup node={node} ref={nodePopupRef}/>
        </>
    )
};

export default Map;