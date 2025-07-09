import { NavLink } from "umi";
import { useTranslation } from 'react-i18next';

const Header = () => {
    const { t } = useTranslation();
    
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
        </header>
    )
}

export default Header;