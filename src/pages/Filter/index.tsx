import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganicFilters, InorganicFilters } from "./components";
import "./Filter.css";

const Filter = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'organic' | 'inorganic'>('organic');

    return (
        <div>
            {/* Tab Navigation */}
            <div className="filter-tabs-container">
                <div className="filter-tabs-wrapper">
                    <button
                        onClick={() => setActiveTab('organic')}
                        className={`filter-tab-button ${activeTab === 'organic' ? 'active' : ''}`}
                    >
                        {t('explorer.filterTabs.organic')}
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('inorganic')}
                        className={`filter-tab-button ${activeTab === 'inorganic' ? 'active' : ''}`}
                    >
                        {t('explorer.filterTabs.inorganic')}
                    </button> */}
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'organic' ? (
                    <OrganicFilters />
                ) : (
                    <InorganicFilters />
                )}
            </div>
        </div>
    );
};

export default Filter;