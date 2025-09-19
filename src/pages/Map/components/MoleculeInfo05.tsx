import { useTranslation } from "react-i18next";

const MoleculeInfo05 = () => {
    const { t } = useTranslation();

    // Generate cluster descriptions dynamically for 05 version (25 clusters: 0-24)
    const renderOrganicClusterDescriptions = () => {
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

    // Generate anions cluster descriptions dynamically (19 clusters: 0-18)
    const renderAnionsClusterDescriptions = () => {
        const clusters = [];
        for (let i = 0; i <= 18; i++) {
            clusters.push(
                <p key={i} style={{ marginBottom: '10px' }}>
                    <strong>Cluster {i + 1}:</strong> {t(`map.anionsClusters.cluster${i}`)}
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
            {/* Organic Molecules Section */}
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

            <div style={{ marginBottom: '40px', lineHeight: '1.6', fontSize: '14px' }}>
                {renderOrganicClusterDescriptions()}
            </div>

            {/* Anions Molecules Section */}
            <h2 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '40px' }}>
                {t('map.anionsClusters.title')}
            </h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                <picture>
                    <source srcSet="/anions.png" type="image/png" />
                    <img
                        loading="lazy"
                        src="/anions.png"
                        alt={t('map.anionsClusters.title')}
                        style={{
                            maxWidth: '100%',
                            height: 'auto'
                        }}
                    />
                </picture>
            </div>

            <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>
                {t('map.anionsClusters.title')} - {t('map.about05.clusterTitle')}
            </h3>

            <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                {renderAnionsClusterDescriptions()}
            </div>
        </div>
    )
}

export default MoleculeInfo05;