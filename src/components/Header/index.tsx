import { NavLink, useLocation } from "umi";
import { useTranslation } from 'react-i18next';
import userSvg from '@/assets/svg/user.svg';
import userCircleSvg from '@/assets/svg/userCircle.svg';
import { useState, useEffect, useRef, useContext } from "react";
import settingSvg from '@/assets/svg/setting.svg';
import logoutSvg from '@/assets/svg/logout.svg';
import feedbackSvg from '@/assets/svg/feedback.svg';
import { useAuthStore } from "@/models/useAuth";
import SettingModal from "@/components/SettingModal";
import UserFeedBackModal from "@/components/UserFeedBackModal";
import RoleRender from "../RoleRender";
import { PricingContext } from "@/layouts/index";

const Header = () => {
    const { t } = useTranslation();
    const { pathname, search } = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLAnchorElement>(null);
    const userFeedBackModalRef = useRef<any>(null);
    const { logout, userName, userPermissions: permissions } = useAuthStore();
    const settingModalRef = useRef<any>(null);
    const { setShowPricingOverlay } = useContext(PricingContext) || { setShowPricingOverlay: () => {} };

    // Helper function to check if a path is active
    const isPathActive = (path: string) => {
        return pathname === path;
    };

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

    // 处理受限链接点击，弹出升级确认框
    const handleRestrictedClick = (e: React.MouseEvent) => {
        if (isCommonUser) {
            e.preventDefault();
            e.stopPropagation();
            setShowUpgradeModal(true);
        }
    };

    // 处理升级确认
    const handleUpgradeConfirm = () => {
        setShowUpgradeModal(false);
        setShowPricingOverlay(true);
    };

    // 处理升级取消
    const handleUpgradeCancel = () => {
        setShowUpgradeModal(false);
    };

    // 渲染导航链接
    const renderNavLink = (to: string, text: string, isActive: boolean) => {
        if (isCommonUser) {
            return (
                <NavLink 
                    to={to} 
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={handleRestrictedClick}
                    style={{ display: 'inline-block' }}
                >
                    {text}
                </NavLink>
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
                <div className="nav-dropdown-container">
                    <NavLink 
                        to="/predict/performance" 
                        className={`nav-item ${pathname.startsWith('/predict') ? 'active' : ''}`}
                    >
                        {t('navigation.header.predict')}
                    </NavLink>
                    <div className="nav-dropdown">
                        <NavLink 
                            to="/predict/performance" 
                            className={`dropdown-item ${isPathActive('/predict/performance') ? 'active' : ''}`}
                        >
                            Cell performance prediction with additive molecules
                        </NavLink>
                        <NavLink 
                            to="/predict/prediction-tool" 
                            className={`dropdown-item ${isPathActive('/predict/prediction-tool') ? 'active' : ''}`}
                        >
                            电池早期生命预测工具
                        </NavLink>
                    </div>
                </div>
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
                        <a href="#" className="dropdown-item" id="feedbackButton" onClick={() => userFeedBackModalRef?.current?.show?.()}>
                            <img src={feedbackSvg} alt="Feedback" className="item-icon" />
                            {t('navigation.userDropdown.feedback')}
                        </a>
                        <a href="#" className="dropdown-item" id="logoutButton" onClick={logout}>
                            <img src={logoutSvg} alt="Logout" className="item-icon" />
                            {t('navigation.userDropdown.logout')}
                        </a>
                    </div>
                </div>
            </div>
            <SettingModal ref={settingModalRef} />
            <UserFeedBackModal ref={userFeedBackModalRef} />
            {/* 升级确认框 */}
            {showUpgradeModal && (
                <div className="upgrade-modal-overlay" onClick={handleUpgradeCancel}>
                    <div className="upgrade-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>{t('navigation.upgradeConfirmation.title')}</h3>
                        <p>{t('navigation.upgradeConfirmation.message')}</p>
                        <div className="upgrade-modal-buttons">
                            <button className="upgrade-btn-secondary" onClick={handleUpgradeCancel}>
                                {t('navigation.upgradeConfirmation.cancel')}
                            </button>
                            <button className="upgrade-btn-primary" onClick={handleUpgradeConfirm}>
                                {t('navigation.upgradeConfirmation.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header;