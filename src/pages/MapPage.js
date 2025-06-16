import Sidebar from "../components/Sidebar";
import { useState } from "react";
import { usePlotDataStore } from "../providers/plotData";
import { NavLink } from "react-router";
import { useAuthStore } from "../providers/auth";
import UMAPClusterPlotDeck from "../components/UMAPClusterPlotDeck";
import { useTranslation } from "react-i18next";

const MapPage = ({ handlePointClick }) => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);

    const { data, loading, error } = usePlotDataStore(); 

    const [showMapFooter, setShowMapFooter] = useState(true);

    return (
        <Sidebar>
            {/* UMAP Visualization in the middle (50%) */}
            <div className="search-umap-container">
                {/* UMAP Visualization in the middle (50%) */}
                <div className="search-umap-section">
                    <div className="graph-container search-graph">
                        {data.length > 0 ? (
                            <UMAPClusterPlotDeck
                                data={data}
                                userPermissions={userPermissions}
                                onClick={handlePointClick}
                            />
                        ) : (
                            <div className="loading-message">
                                {loading ? t('map.loading.message') : error ? t('map.loading.error') : t('map.loading.noData')}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right text content */}
                <div className="search-interface-section" style={{ flex: '0.8', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', height: 'calc(100vh - 250px)', overflow: 'scroll' }}>
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
                            <source srcSet="/MU_About_Cluster_Numbered.webp" type="image/webp" />
                            <img
                                loading="lazy"
                                src="/MU_About_Cluster_Numbered.jpg"
                                alt={t('map.imageAlt')}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </picture>
                    </div>

                    <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>{t('map.about.clusterTitle')}</h3>
                    <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 1:</strong> {t('map.clusters.cluster1')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 2:</strong> {t('map.clusters.cluster2')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 3:</strong> {t('map.clusters.cluster3')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 4:</strong> {t('map.clusters.cluster4')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 5:</strong> {t('map.clusters.cluster5')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 6:</strong> {t('map.clusters.cluster6')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 7:</strong> {t('map.clusters.cluster7')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 8:</strong> {t('map.clusters.cluster8')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 9:</strong> {t('map.clusters.cluster9')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 10:</strong> {t('map.clusters.cluster10')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 11:</strong> {t('map.clusters.cluster11')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 12:</strong> {t('map.clusters.cluster12')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 13:</strong> {t('map.clusters.cluster13')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 14:</strong> {t('map.clusters.cluster14')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 15:</strong> {t('map.clusters.cluster15')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 16:</strong> {t('map.clusters.cluster16')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 17:</strong> {t('map.clusters.cluster17')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 18:</strong> {t('map.clusters.cluster18')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 19:</strong> {t('map.clusters.cluster19')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 20:</strong> {t('map.clusters.cluster20')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 21:</strong> {t('map.clusters.cluster21')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 22:</strong> {t('map.clusters.cluster22')}</p>
                        <p style={{ marginBottom: '10px' }}><strong>Cluster 23:</strong> {t('map.clusters.cluster23')}</p>
                    </div>
                </div>
            </div>
            {showMapFooter && (
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
        </Sidebar>
    )
};

export default MapPage;