import { useRef, useState, useEffect } from "react";
import { useAnionsPlotDataStore } from "@/models/usePlotData";
import { useAuthStore } from "@/models/useAuth";
import UMAPClusterPlotDeck from "@/components/UMAPClusterPlotDeck";
import { useTranslation } from "react-i18next";
import NodePopup from "@/components/NodePopup";

const AnionsMolecules = () => {
    const { t } = useTranslation();
    const userPermissions = useAuthStore(state => state.userPermissions);
    const nodePopupRef = useRef<any>(null);
    const [node, setNode] = useState<any>(null);

    const { data, loading, error, fetchData } = useAnionsPlotDataStore();

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
            <div className="map-umap-section" style={{ position: 'relative' }}>
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
                            molecularType="anions"
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
            <NodePopup node={node} ref={nodePopupRef} molecularType="anions"/>
        </>
    )
};

export default AnionsMolecules;