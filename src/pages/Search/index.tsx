import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganicSearch, InorganicSearch } from "./components";
import "./Search.css";

const Search = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'organic' | 'inorganic'>('organic');

    return (
        <div>
            {/* Tab Navigation */}
            <div className="search-tabs-container">
                <div className="search-tabs-wrapper">
                    <button
                        onClick={() => setActiveTab('organic')}
                        className={`search-tab-button ${activeTab === 'organic' ? 'active' : ''}`}
                    >
                        {t('search.tabs.organic')}
                    </button>
                    <button
                        onClick={() => setActiveTab('inorganic')}
                        className={`search-tab-button ${activeTab === 'inorganic' ? 'active' : ''}`}
                    >
                        {t('search.tabs.inorganic')}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'organic' ? (
                    <OrganicSearch />
                ) : (
                    <InorganicSearch />
                )}
            </div>
        </div>
    );
};

export default Search;