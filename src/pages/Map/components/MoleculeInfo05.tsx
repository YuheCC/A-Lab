import { useTranslation } from "react-i18next";

const MoleculeInfo05 = () => {
    const { t } = useTranslation();

    // Generate cluster descriptions dynamically for 05 version (25 clusters: 0-24)
    const renderClusterDescriptions = () => {
        const clusters = [];
        for (let i = 0; i <= 24; i++) {
            clusters.push(
                <p key={i} style={{ marginBottom: '10px' }}>
                    <strong>Cluster {i + 1}:</strong> {t(`map.clusters05.cluster${i}`)}
                </p>
            );
        }
        return clusters;
    };

    return (
        <div
            className="map-interface-section"
            style={{
                flex: '0.8',
                overflowY: 'auto',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '0px',
                height: 'calc(100vh - 140px)',
                overflow: 'scroll'
            }}
        >
            <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                {t('map.about05.title')}
            </h2>
            
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {t('map.about05.description1')}
            </p>

            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {t('map.about05.description2')}
            </p>

            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {t('map.about05.description3')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                <picture>
                    <source srcSet="/MU05_Cluster_Numbered.png" type="image/png" />
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

            <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>
                {t('map.about05.clusterTitle')}
            </h3>
            
            <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                {renderClusterDescriptions()}
            </div>
        </div>
    )
}

export default MoleculeInfo05;