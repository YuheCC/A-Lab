import { NavLink, useLocation } from "react-router";
import { useAuthStore } from "../providers/auth";

// Navigation bar component
const Navbar = () => {
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
        <a href="https://www.ses.ai/" className="navbar-link">Products</a>
        <a href="https://www.ses.ai/bw" target="_blank" rel="noopener noreferrer" className="navbar-link">Technology</a>
        <a href="https://www.ses.ai/about" target="_blank" rel="noopener noreferrer" className="navbar-link">Company</a>
        <a href="https://www.ses.ai/media-news" target="_blank" rel="noopener noreferrer" className="navbar-link">Media</a>
        <a
          href="/"
          className={`navbar-link ${(pathname === '/' || pathname === '/map' || pathname === '/filter' || pathname === '/about' || pathname === '/search' || pathname === '/ask' || pathname === '/enterprise' || pathname === '/favorites') && pathname !== '/reset-password' ? 'active' : ''}`}
        >
          Molecular Universe
        </a>
      </div>
      {isAuthenticated ? (
        <div className="navbar-user">
          <span className="username">{userName}</span>
          <div className="settings-dropdown">
            <button className="reset-password-button">Settings</button>
            <div className="settings-dropdown-content">
              <NavLink to="/reset-password">Change Password</NavLink>
              <a href="https://billing.stripe.com/p/login/aEU4iHc1QaDedtS5kk" target="_blank" rel="noopener noreferrer">Manage Subscription</a>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>
      ) : (
        <div className="navbar-user">
          <NavLink to={`/login?redirect=${encodeURI('/')}`} className="signin-button">Sign In</NavLink>
        </div>
      )}
    </nav>
  );
};

export default Navbar;