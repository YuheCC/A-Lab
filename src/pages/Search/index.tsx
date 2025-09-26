import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganicSearch, InorganicSearch, ThirdSearch } from "./components";
import AnionsSearch from "./components/AnionsSearch";
import "./Search.css";
import { useNavigate } from '@umijs/max';

const Search = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'organic' | 'inorganic' | 'anions' | 'third'>('organic');
    const navigate = useNavigate();
    const handleGoToFavorites = () => {
        navigate('/favorites');
    };

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
                    {/* <button
                        onClick={() => setActiveTab('inorganic')}
                        className={`search-tab-button ${activeTab === 'inorganic' ? 'active' : ''}`}
                    >
                        {t('search.tabs.inorganic')}
                    </button> */}
                    <button
                        onClick={() => setActiveTab('anions')}
                        className={`search-tab-button ${activeTab === 'anions' ? 'active' : ''}`}
                    >
                        {t('search.tabs.anions')}
                    </button>
                    <button
                        onClick={() => setActiveTab('third')}
                        className={`search-tab-button ${activeTab === 'third' ? 'active' : ''}`}
                    >
                        {t('search.tabs.third')}
                    </button>
                </div>
                {
                    activeTab !== 'third' && (
                        <button
                            className="favorites-enter-button"
                            onClick={handleGoToFavorites}
                            title={t('search.favorites.goToFavorites')}
                        >
                            {t('search.favorites.favorites')}
                        </button>
                    )
                }
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'organic' ? (
                    <OrganicSearch />
                ) : activeTab === 'inorganic' ? (
                    <InorganicSearch />
                ) : activeTab === 'anions' ? (
                    <AnionsSearch />
                ) : (
                    <ThirdSearch />
                )}
            </div>
        </div>
    );
};

export default Search;