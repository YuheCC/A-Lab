import { NavLink, useLocation } from "react-router";
import { useTranslation } from 'react-i18next';
import { useAuthStore } from "../providers/auth";
import LanguageSwitcher from "./LanguageSwitcher";

// Navigation bar component
const Navbar = () => {
  const { t } = useTranslation();
  const { isAuthenticated, userName, logout } = useAuthStore();

  const { pathname } = useLocation();

  // Use the logo from the public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <img src={logo} alt="SES AI Logo" className="navbar-logo" />
      </div>
      <div className="navbar-links">
        <a href="https://www.ses.ai/" className="navbar-link">{t('navigation.navbar.products')}</a>
        <a href="https://www.ses.ai/bw" target="_blank" rel="noopener noreferrer" className="navbar-link">{t('navigation.navbar.technology')}</a>
        <a href="https://www.ses.ai/about" target="_blank" rel="noopener noreferrer" className="navbar-link">{t('navigation.navbar.company')}</a>
        <a href="https://www.ses.ai/media-news" target="_blank" rel="noopener noreferrer" className="navbar-link">{t('navigation.navbar.media')}</a>
        <a
          href="/"
          className={`navbar-link ${(pathname === '/' || pathname === '/map' || pathname === '/filter' || pathname === '/about' || pathname === '/search' || pathname === '/ask' || pathname === '/enterprise' || pathname === '/favorites') && pathname !== '/reset-password' ? 'active' : ''}`}
        >
          {t('navigation.navbar.molecularUniverse')}
        </a>
      </div>
      <div className="navbar-actions">
        <LanguageSwitcher />
        {isAuthenticated ? (
          <div className="navbar-user">
            <span className="username">{userName}</span>
            <div className="settings-dropdown">
              <button className="reset-password-button">{t('navigation.navbar.settings')}</button>
              <div className="settings-dropdown-content">
                <NavLink to="/reset-password">{t('navigation.navbar.changePassword')}</NavLink>
                <a href="https://billing.stripe.com/p/login/aEU4iHc1QaDedtS5kk" target="_blank" rel="noopener noreferrer">{t('navigation.navbar.manageSubscription')}</a>
              </div>
            </div>
            <button className="logout-button" onClick={logout}>{t('navigation.navbar.logout')}</button>
          </div>
        ) : (
          <div className="navbar-user">
            <NavLink to={`/login?redirect=${encodeURI('/')}`} className="signin-button">{t('navigation.navbar.signIn')}</NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;