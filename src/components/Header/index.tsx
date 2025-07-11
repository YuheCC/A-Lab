import { NavLink, useLocation } from "umi";
import { useTranslation } from 'react-i18next';
import userSvg from '@/assets/svg/user.svg';
import userCircleSvg from '@/assets/svg/userCircle.svg';
import { useState, useEffect, useRef } from "react";
import settingSvg from '@/assets/svg/setting.svg';
import logoutSvg from '@/assets/svg/logout.svg';
import { useAuthStore } from "@/models/useAuth";
import SettingModal from "@/components/SettingModal";

const Header = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLAnchorElement>(null);
    const { logout } = useAuthStore();
    const settingModalRef = useRef<any>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                avatarRef.current &&
                !avatarRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
            <header className="main-header">
            <div className="logo-container">
                <img src="/logo.png" alt="SES Logo" className="logo-img" />
            </div>
            <nav className="main-nav">
                <NavLink 
                    to="/map" 
                    className={`nav-item ${pathname === '/map' ? 'active' : ''}`}
                >
                    {t('navigation.header.map')}
                </NavLink>
                <NavLink 
                    to="/ask" 
                    className={`nav-item ${pathname === '/ask' ? 'active' : ''}`}
                >
                    {t('navigation.header.ask')}
                </NavLink>
                <NavLink 
                    to="/search" 
                    className={`nav-item ${pathname === '/search' ? 'active' : ''}`}
                >
                    {t('navigation.header.search')}
                </NavLink>
                <NavLink 
                    to="/filter" 
                    className={`nav-item ${pathname === '/filter' ? 'active' : ''}`}
                >
                    {t('navigation.header.filter')}
                </NavLink>
                <NavLink 
                    to="/favorites" 
                    className={`nav-item ${pathname === '/favorites' ? 'active' : ''}`}
                >
                    {t('navigation.header.favorites')}
                </NavLink>
            </nav>
            <div className="user-actions">
                <NavLink to="/about" className="nav-item" target="_blank" rel="noopener noreferrer">{t('navigation.header.about')} ↗</NavLink>
                <div className="user-avatar-container">
                    <a href="#" className="action-icon user-avatar" id="userAvatar" onClick={() => setIsDropdownOpen(!isDropdownOpen)} ref={avatarRef}>
                        <img src={userSvg} alt="User Avatar" className="user-avatar-img" />
                    </a>
                    <div className={`user-dropdown ${isDropdownOpen ? 'show' : ''}`} id="userDropdown" ref={dropdownRef}>
                        <div className="user-info">
                            <div className="user-avatar-large">
                                <img src={userCircleSvg} alt="User Avatar" className="user-avatar-img" />
                            </div>
                            <div className="user-details">
                                <div className="user-name-container">
                                    <div className="user-email">Yuhe.Chen@ses.ai</div>
                                    <span className="subscription-badge">Explorer</span>
                                </div>
                            </div>
                        </div>
                        <a href="#" className="dropdown-item" onClick={() => settingModalRef?.current?.show?.()}>
                            <img src={settingSvg} alt="Setting" className="item-icon" />
                            {t('navigation.userDropdown.accountSettings')}
                        </a>
                        <a href="#" className="dropdown-item" id="logoutButton" onClick={logout}>
                            <img src={logoutSvg} alt="Logout" className="item-icon" />
                            {t('navigation.userDropdown.logout')}
                        </a>
                    </div>
                </div>
            </div>
            <SettingModal ref={settingModalRef} />
        </header>
    )
}

export default Header;