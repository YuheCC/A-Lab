import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganicMolecules, InorganicMolecules } from "./components";
import "./Map.css";

const Map = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'organic' | 'inorganic'>('organic');

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
                    <button
                        onClick={() => setActiveTab('inorganic')}
                        className={`map-tab-button ${activeTab === 'inorganic' ? 'active' : ''}`}
                    >
                        {t('map.tabs.inorganic')}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'organic' ? (
                    <OrganicMolecules />
                ) : (
                    <InorganicMolecules />
                )}
            </div>
        </div>
    );
};

export default Map;