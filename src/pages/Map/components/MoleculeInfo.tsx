import { useTranslation } from "react-i18next";

const MoleculeInfo = () => {
    const { t } = useTranslation();

    // Generate organic cluster descriptions dynamically
    const renderOrganicClusterDescriptions = () => {
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

    // Generate inorganic cluster descriptions dynamically
    const renderInorganicClusterDescriptions = () => {
        const clusters = [];
        for (let i = 1; i <= 7; i++) {
            clusters.push(
                <p key={i} style={{ marginBottom: '10px' }}>
                    <strong>Cluster {i}:</strong> {t(`map.inorganicClusters.cluster${i}`)}
                </p>
            );
        }
        return clusters;
    };

    return (
        <div className="search-interface-section" style={{ flex: '0.8', overflowY: 'auto', padding: '20px', backgroundColor: '#fff', borderRadius: '0px', height: 'calc(100vh - 140px)', overflow: 'scroll' }}>
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

            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {t('map.about.description4')}
            </p>

            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {t('map.about.description5')}
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

            <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>{t('map.about.organicTitle')}</h3>
            <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                {renderOrganicClusterDescriptions()}
            </div>

            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                {t('map.about.description6')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                <picture>
                    <source srcSet="/Inorganic.png" type="image/png" />
                    <img
                        loading="lazy"
                        src="/Inorganic.png"
                        alt={t('map.imageAlt')}
                        style={{
                            maxWidth: '100%',
                            height: 'auto'
                        }}
                    />
                </picture>
            </div>

            <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>{t('map.about.inorganicTitle')}</h3>
            <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                {renderInorganicClusterDescriptions()}
            </div>
        </div>
    )
}

export default MoleculeInfo;