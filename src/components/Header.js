import { NavLink, useLocation } from "react-router";
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    
    return (
        <header className="App-header">
            <div className="header-content">
                <div className="header-links">
                    <NavLink className='header-link' to="/">{t('navigation.header.map')}</NavLink>
                    <NavLink className='header-link' to="/ask">{t('navigation.header.ask')}</NavLink>
                    <NavLink className='header-link' to="/search">{t('navigation.header.search')}</NavLink>
                    <NavLink className='header-link' to="/filter">{t('navigation.header.filter')}</NavLink>
                    <NavLink className='header-link' to="/favorites">{t('navigation.header.favorites')}</NavLink>
                </div>
            </div>
            <div className="stats-container">
                {pathname === '/explorer' && (
                    <>
                        {/* <div>Showing: {filteredGraphData.length} of {graphData.length} nodes</div> */}
                        {/* <div>Filters: {activeFilterCount} active</div> */}
                        {/* {loading && <div>Loading...</div>} */}
                    </>
                )}
            </div>
        </header>
    )
}

export default Header;