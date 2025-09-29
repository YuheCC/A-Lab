import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

interface MoleculeInfo10Props {
    activeTab: 'organic' | 'anions';
}

const MoleculeInfo10 = ({ activeTab }: MoleculeInfo10Props) => {
    const { t } = useTranslation();
    const organicSectionRef = useRef<HTMLDivElement>(null);
    const anionsSectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll to corresponding section when tab changes
    useEffect(() => {
        const scrollToSection = () => {
            if (!containerRef.current) return;

            let targetElement: HTMLElement | null = null;
            if (activeTab === 'organic' && organicSectionRef.current) {
                targetElement = organicSectionRef.current;
            } else if (activeTab === 'anions' && anionsSectionRef.current) {
                targetElement = anionsSectionRef.current;
            }

            if (targetElement) {
                const container = containerRef.current;
                const targetTop = targetElement.offsetTop;
                const containerTop = container.offsetTop;
                const scrollTop = targetTop - containerTop;

                container.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                });
            }
        };

        // Add a small delay to ensure the DOM is updated
        const timeoutId = setTimeout(scrollToSection, 100);

        return () => clearTimeout(timeoutId);
    }, [activeTab]);

    // Generate organic cluster descriptions dynamically for 05 version (25 clusters: 0-24)
    const renderOrganicClusterDescriptions = () => {
        const clusters = [];
        for (let i = 0; i <= 18; i++) {
            clusters.push(
                <p key={i} style={{ marginBottom: '10px' }}>
                    <strong>Cluster {i + 1}:</strong> {t(`map.clusters.cluster${i}`)}
                </p>
            );
        }
        return clusters;
    };

    // Generate anions cluster descriptions dynamically (19 clusters: 0-18)
    const renderAnionsClusterDescriptions = () => {
        const clusters = [];
        for (let i = 0; i <= 12; i++) {
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
            ref={containerRef}
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
            <div ref={organicSectionRef}>
                <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    {t('map.about.title')}
                </h2>

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

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                    <picture>
                        <source srcSet="/organic.png" type="image/png" />
                        <img
                            loading="lazy"
                            src="/organic.png"
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
            </div>

            {/* Anions Molecules Section */}
            <div ref={anionsSectionRef}>
                <h2 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '40px' }}>
                    {t('map.anionsClusters.title')}
                </h2>

                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                    {t('map.anionsClusters.description')}
                </p>

                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                    {t('map.anionsClusters.description2')}
                </p>

                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                    {t('map.anionsClusters.description3')}
                </p>

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
                    {t('map.about05.clusterTitle')}
                </h3>

                <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
                    {renderAnionsClusterDescriptions()}
                </div>
            </div>
        </div>
    )
}

export default MoleculeInfo10;