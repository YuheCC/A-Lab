import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OrganicSearch, InorganicSearch, ThirdSearch } from "./components";
import AnionsSearch from "./components/AnionsSearch";
import "./Search.css";
import { useNavigate } from '@umijs/max';
import { useAuthStore } from '@/models/useAuth';

const Search = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'organic' | 'inorganic' | 'anions' | 'third'>('organic');
    const navigate = useNavigate();

    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const initialAuthLoaded = useAuthStore(state => state.initialAuthLoaded);
    const isPublicUser = initialAuthLoaded && !isAuthenticated;
    const handleGoToFavorites = () => {
        navigate('/favorites');
    };

    console.log('isPublicUser', isPublicUser);

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
                <button
                    className="favorites-enter-button"
                    onClick={handleGoToFavorites}
                    title={t('search.favorites.goToFavorites')}
                >
                    ⭐ {t('search.favorites.favorites')}
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'organic' ? (
                    <OrganicSearch isPublicUser={isPublicUser} />
                ) : activeTab === 'inorganic' ? (
                    <InorganicSearch />
                ) : activeTab === 'anions' ? (
                    <AnionsSearch isPublicUser={isPublicUser} />
                ) : (
                    <ThirdSearch isPublicUser={isPublicUser} />
                )}
            </div>
        </div>
    );
};

export default Search;
