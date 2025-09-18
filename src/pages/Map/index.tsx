import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganicMolecules, InorganicMolecules, AnionsMolecules, MoleculeInfo } from "./components";
import "./Map.css";
import MoleculeInfo05 from "./components/MoleculeInfo05";

const Map = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'organic' | 'inorganic' | 'anions'>('organic');

    return (
        <div>
            {/* Tab Navigation */}
            <div className="map-tabs-container">
                <div className="map-tabs-wrapper">
                    <button
                        onClick={() => setActiveTab('organic')}
                        className={`map-tab-button ${activeTab === 'organic' ? 'active' : ''}`}
                    >
                        {t('map.tabs.organic')}
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('inorganic')}
                        className={`map-tab-button ${activeTab === 'inorganic' ? 'active' : ''}`}
                    >
                        {t('map.tabs.inorganic')}
                    </button> */}
                    <button
                        onClick={() => setActiveTab('anions')}
                        className={`map-tab-button ${activeTab === 'anions' ? 'active' : ''}`}
                    >
                        {t('map.tabs.anions')}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                <div className="map-umap-container">
                    {activeTab === 'organic' ? (
                        <OrganicMolecules />
                    ) : activeTab === 'inorganic' ? (
                        <InorganicMolecules />
                    ) : (
                        <AnionsMolecules />
                    )}
                    <MoleculeInfo05 />
                </div>
                
            </div>
        </div>
    );
};

export default Map;