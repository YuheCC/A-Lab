import { NavLink, useLocation } from "umi";
import { useTranslation } from 'react-i18next';
import userSvg from '@/assets/svg/user.svg';
import userCircleSvg from '@/assets/svg/userCircle.svg';
import { useState, useEffect, useRef } from "react";
import settingSvg from '@/assets/svg/setting.svg';
import logoutSvg from '@/assets/svg/logout.svg';
import { useAuthStore } from "@/models/useAuth";
import SettingModal from "@/components/SettingModal";
import RoleRender from "../RoleRender";
import { Tooltip } from '@mui/material';

const Header = () => {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLAnchorElement>(null);
    const { logout, userName, userPermissions: permissions } = useAuthStore();
    const settingModalRef = useRef<any>(null);

    // 检查是否为common用户
    const isCommonUser = permissions === 'common';

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

    // 处理受限链接点击
    const handleRestrictedClick = (e: React.MouseEvent) => {
        if (isCommonUser) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    // 渲染导航链接，根据权限决定是否包装Tooltip
    const renderNavLink = (to: string, text: string, isActive: boolean) => {
        if (isCommonUser) {
            return (
                <Tooltip 
                    title={t('navigation.upgradePrompt')} 
                    arrow 
                    placement="top"
                    componentsProps={{
                        tooltip: {
                            sx: {
                                marginBottom: '8px !important',
                                fontSize: '12px',
                                backgroundColor: '#374151',
                                color: '#fff'
                            }
                        },
                        arrow: {
                            sx: {
                                color: '#374151'
                            }
                        }
                    }}
                >
                    <NavLink 
                        to={to} 
                        className={`nav-item ${isActive ? 'active' : ''} disabled`}
                        onClick={handleRestrictedClick}
                        style={{ display: 'inline-block' }}
                    >
                        {text}
                    </NavLink>
                </Tooltip>
            );
        }

        return (
            <NavLink 
                to={to} 
                className={`nav-item ${isActive ? 'active' : ''}`}
            >
                {text}
            </NavLink>
        );
    };

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
                {renderNavLink('/ask', t('navigation.header.ask'), pathname === '/ask')}
                {renderNavLink('/search', t('navigation.header.search'), pathname === '/search')}
                {renderNavLink('/filter', t('navigation.header.filter'), pathname === '/filter')}
                {renderNavLink('/favorites', t('navigation.header.favorites'), pathname === '/favorites')}
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
                                    <div className="user-email">{userName}</div>
                                    <RoleRender role={permissions} />
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