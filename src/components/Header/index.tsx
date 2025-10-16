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
import { useLoginModalContext } from "@/components/LoginModal/context";
import HeaderLanguageSwitcher from "@/components/HeaderLanguageSwitcher";

const Header = () => {
    const { t } = useTranslation();
    const { pathname, search } = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNavDropdownHovered, setIsNavDropdownHovered] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const avatarRef = useRef<HTMLAnchorElement>(null);
    const navDropdownRef = useRef<HTMLDivElement>(null);
    const userFeedBackModalRef = useRef<any>(null);
    const { logout, userName, userPermissions: permissions, isAuthenticated } = useAuthStore();
    const settingModalRef = useRef<any>(null);
    const pricingContext = useContext(PricingContext);
    const {
        setShowPricingOverlay = () => {},
        showUpgradeModal = false,
        setShowUpgradeModal = () => {},
    } = pricingContext || {};
    const { openLoginModal } = useLoginModalContext();

    // Helper function to check if a path is active
    const isPathActive = (path: string) => {
        return pathname === path;
    };

    // 检查是否为common用户
    // Common users have since gained access to all features, so this is set to false even for common / logged out users
    // It should be removed in a future update but is kept temporarily in case we need to revert
    const isCommonUser = false; //permissions === 'common';
    const isEducationalUser = permissions === 'research';
    const displayName = isAuthenticated && userName ? userName : 'public';
    const displayRole = isAuthenticated && permissions ? permissions : 'public';

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
        e.preventDefault();
        e.stopPropagation();
        setShowUpgradeModal(true);
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

    // 处理导航下拉菜单hover
    const handleNavDropdownMouseEnter = () => {
        setIsNavDropdownHovered(true);
    };

    const handleNavDropdownMouseLeave = () => {
        setIsNavDropdownHovered(false);
    };

    // 渲染导航链接
    const renderNavLink = (to: string, text: string, isActive: boolean, isDisabled: boolean = false) => {
        if (isDisabled) {
            return (
                <NavLink 
                    to={to} 
                    className={`nav-item ${isActive ? 'active' : ''} disabled`}
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

    // 渲染下拉菜单项
    const renderDropdownItem = (to: string, text: string, isActive: boolean, isDisabled: boolean = false) => {
        if (isDisabled) {
            return (
                <NavLink 
                    to={to} 
                    className={`dropdown-item ${isActive ? 'active' : ''} disabled`}
                    onClick={handleRestrictedClick}
                >
                    {text}
                </NavLink>
            );
        }

        return (
            <NavLink 
                to={to} 
                className={`dropdown-item ${isActive ? 'active' : ''}`}
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
                    className={`nav-item nav-item-separated ${pathname === '/map' ? 'active' : ''}`}
                >
                    {t('navigation.header.map')}
                </NavLink>
                {renderNavLink('/ask', t('navigation.header.ask'), pathname === '/ask', isCommonUser)}
                {renderNavLink('/search', t('navigation.header.search'), pathname === '/search', isCommonUser)}
                {/* {renderNavLink('/filter', t('navigation.header.filter'), pathname === '/filter', isCommonUser)} */}
                {renderNavLink('/formulate', t('navigation.header.formulation'), pathname === '/formulate', isCommonUser)}
                {renderNavLink('/design', t('navigation.header.design'), pathname === '/design', isCommonUser)}
                {renderNavLink('/predict', t('navigation.header.predict'), pathname === '/predict', isCommonUser)}
                {/* <div 
                    className={`nav-dropdown-container ${isCommonUser ? 'disabled' : ''} ${isNavDropdownHovered ? 'hovered' : ''}`}
                    onMouseEnter={handleNavDropdownMouseEnter}
                    onMouseLeave={handleNavDropdownMouseLeave}
                    ref={navDropdownRef}
                >
                    {renderNavLink('/predict/performance', t('navigation.header.predict'), pathname.startsWith('/predict'), isCommonUser)}
                    <div 
                        className="nav-dropdown"
                        onMouseEnter={handleNavDropdownMouseEnter}
                        onMouseLeave={handleNavDropdownMouseLeave}
                    >
                        {renderDropdownItem('/predict/performance', t('navigation.header.predictPerformance'), isPathActive('/predict/performance'), isCommonUser)}
                        {renderDropdownItem('/predict', t('navigation.header.predictionTool'), isPathActive('/predict'), isCommonUser)}
                    </div>
                </div> */}
                {/* {renderNavLink('/favorites', t('navigation.header.favorites'), pathname === '/favorites', isCommonUser)} */}
            </nav>
            <div className="user-actions">
                <NavLink to="/about" className="nav-item" target="_blank" rel="noopener noreferrer">{t('navigation.header.about')} ↗</NavLink>
                <HeaderLanguageSwitcher />
                {isAuthenticated ? (
                    <div className="user-avatar-container">
                        <a href="#" className="action-icon user-avatar" id="userAvatar" onClick={(e) => { e.preventDefault(); setIsDropdownOpen(!isDropdownOpen); }} ref={avatarRef}>
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
                            <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); settingModalRef?.current?.show?.(); }}>
                                <img src={settingSvg} alt="Setting" className="item-icon" />
                                {t('navigation.userDropdown.accountSettings')}
                            </a>
                            <a href="#" className="dropdown-item" id="feedbackButton" onClick={(e) => { e.preventDefault(); userFeedBackModalRef?.current?.show?.(); }}>
                                <img src={feedbackSvg} alt="Feedback" className="item-icon" />
                                {t('navigation.userDropdown.feedback')}
                            </a>
                            <a href="#" className="dropdown-item" id="logoutButton" onClick={(e) => { e.preventDefault(); logout(); }}>
                                <img src={logoutSvg} alt="Logout" className="item-icon" />
                                {t('navigation.userDropdown.logout')}
                            </a>
                        </div>
                    </div>
                ) : (
                    <span
                        className="nav-item login-text"
                        onClick={() => openLoginModal()}
                        style={{ cursor: 'pointer' }}
                    >
                        {t('auth.form.signIn', '登录')}
                    </span>
                )}
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
