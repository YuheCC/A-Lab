import React, { useState, useEffect, useRef, useMemo } from 'react';
import ChatbotInterface from './Chatbox';
import SearchInput from './Search';
import Papa from 'papaparse';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import Box from '@mui/material/Box';
import MuiSlider from '@mui/material/Slider';
// import logo from the public folder
import './App.css';
import API_URL from './Constants.js'; // Contains API URL and any other constants

// ---------------------------------------------------------------------------
// Global fetch wrapper that (1) attaches JWT to backend requests and (2) logs the user out on 401 Unauthorized responses
const redirectToLogin = () => {
  console.log("Redirecting to login page...");
  // Already on an auth route?   → do **nothing** to avoid redirect loops.
  if (/^\/(login|password-reset)/.test(window.location.pathname)) return;

  const current = window.location.pathname + window.location.search;
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('permissions');

  // Send them to the sign‑in screen **once**, carrying the original target.
  window.history.pushState(
    {},
    '',
    `/login?redirect=${encodeURIComponent(current)}`,
  );
  window.location.reload();
};

const _origFetch = window.fetch.bind(window);
window.fetch = (input, init = {}) => {
  // -------------------------------------------------------------------
  // 1) Transparently attach JWT to **any** request going to our backend
  //    so that all parts of the app stay authenticated even when they
  //    use plain `fetch()` instead of `authFetch()`.
  // -------------------------------------------------------------------
  const token = localStorage.getItem('token');
  let url = typeof input === 'string' ? input : input?.url || '';

  // Treat bare " /api"‑style paths as same‑origin
  const sameOrigin = url.startsWith('/') && !url.startsWith('//');
  const isBackend   = url.startsWith(API_URL) || sameOrigin;

  if (token && isBackend) {
    // Normalise existing headers then merge
    const hdrs = new Headers(init.headers || {});
    if (!hdrs.has('Authorization')) {
      hdrs.set('Authorization', `Bearer ${token}`);
    }
    init = { ...init, headers: hdrs };
  }

  // -------------------------------------------------------------------
  // 2) Perform the request
  // -------------------------------------------------------------------
  return _origFetch(input, init).then((response) => {
    // 401? → log the user out **unless** we're on an auth page already
    if (
      response.status === 401 &&
      !/^\/(login|signin)/.test(window.location.pathname)
    ) {
      redirectToLogin();
    }
    return response;
  });
};
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Auth‑aware fetch: automatically sends the JWT if we have one
export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...(options.headers || {}),
    },
  });
};
// ---------------------------------------------------------------------------

// Create a Plotly Component using the plotly.js factory
const Plot = createPlotlyComponent(Plotly);

// Navigation bar component
const Navbar = ({ activePage, isAuthenticated, username, onLogout, onSignIn, onPasswordReset, onNavigation }) => {
  // Use the logo from the public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <img src={logo} alt="SES AI Logo" className="navbar-logo" />
      </div>
      <div className="navbar-links">
        <a href="https://www.ses.ai/molecular-universe" target="_blank" rel="noopener noreferrer" className="navbar-link">Products</a>
        <a href="https://www.ses.ai/bw" target="_blank" rel="noopener noreferrer" className="navbar-link">Technology</a>
        <a href="https://www.ses.ai/about" target="_blank" rel="noopener noreferrer" className="navbar-link">Company</a>
        <a href="https://www.ses.ai/media-news" target="_blank" rel="noopener noreferrer" className="navbar-link">Media</a>
        <a
          href="/"
          className={`navbar-link ${(activePage === 'map' || activePage === 'explorer' || activePage === 'about' || activePage === 'search' || activePage === 'chatbot' || activePage === 'enterprise') && window.location.pathname !== '/reset-password' ? 'active' : ''}`}
        >
          Molecular Universe
        </a>

      </div>
      {isAuthenticated ? (
        <div className="navbar-user">
          <span className="username">{username}</span>
          <button className="reset-password-button" onClick={onPasswordReset}>Settings</button>
          <button className="logout-button" onClick={onLogout}>Logout</button>
        </div>
      ) : (
        <div className="navbar-user">
          <button className="signin-button" onClick={onSignIn}>Sign In</button>
        </div>
      )}
    </nav>
  );
};

// Login component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // signin redirect logic
  const [redirectPath, setRedirectPath] = useState('/');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dest = params.get('redirect');
    if (dest) setRedirectPath(dest);
  }, []);

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  // Use explicit URL for authentication endpoint without redeclaring API_URL
  // var API_URL = 'http://0.0.0.0:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // sign‑up validation: no password, still only .edu
      // if (!isLogin && !email.endsWith('.edu')) {
      //   throw new Error('Only .edu e‑mail addresses are allowed for registration');
      // }

      const formData = new FormData();
      formData.append('username', username);

      if (isLogin) {
        formData.append('password', password);          // login path unchanged
      } else {
        // sign‑up: DO NOT send a password
        formData.append('email', email);
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('organization_name', organizationName);
      }

      const response = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        body: formData,
      });
 
      // --- richer error handling ---
      if (!response.ok) {
        let errorMsg = 'Authentication failed';
        try {
          // Most FastAPI errors are JSON { detail: "…" }
          const dataErr = await response.clone().json();
          if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
        } catch {
          try {
            // Fallback: plain‑text body
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch { /* ignore */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      if (isLogin) {
        // Store token and user info in localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('permissions', data.permissions);

        console.log("Stored local credentials.")
        
        // Navigate to the map page instead of just reloading
        window.location.replace(redirectPath); 
      }
      else {
        alert(data.message || 'Verification e‑mail sent.');
        setIsLogin(true);             // return to Sign‑In view
        return;    
      }
    }
    catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }               // nothing else to do
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to access the Molecular Universe' : 'Join the Molecular Universe community'}</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="organizationName">Organization Name</label>
                <input
                  type="text"
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Organization Name"
                  required
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email Address (.edu only)</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Academic email address"
                required
              />
            </div>
          )}
          
          {isLogin && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? (
            <>
              <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
              <p><a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/redeem'); window.location.reload(); }}>Redeem code for team members</a></p>
              <p>Forgot password? <a href="#" onClick={(e) => { e.preventDefault(); window.location.href = '/password-reset'; }}><strong>Reset</strong></a></p>
            </>
          ) : (
            <>
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign In</button></p>
              <p className="terms-text">
                By using Molecular Universe, you agree to SES AI's <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/terms'); window.location.reload(); }} className="terms-link">Terms and Conditions</a>.
              </p>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
};

// Popup component to display node data
// const NodePopup = ({ node, onClose, filterLabels }) => {
//   if (!node) return null;
  
//   return (
//     <div className="popup-overlay" onClick={onClose}>
//       <div className="popup-content black-bg" onClick={e => e.stopPropagation()}>
//         <button className="close-button white-text" onClick={onClose}>×</button>
//         <h2 className="white-text">Node Details</h2>
//         <div className="popup-data">
//           <h3 className="white-text">SMILES</h3>
//           <p className="dark-field">{node.smiles}</p>
          
//           <h3 className="white-text">UMAP Coordinates</h3>
//           <p className="dark-field">X: {node.x.toFixed(6)}, Y: {node.y.toFixed(6)}</p>
          
//           <h3 className="white-text">Properties</h3>
//           <table className="property-table dark-table">
//             <tbody>
//               {Object.entries(node.properties || {}).map(([key, value]) => (
//                 <tr key={key}>
//                   <td className="property-name white-text">{filterLabels[key] || key}</td>
//                   <td className="property-value white-text">
//                     {value !== null && value !== undefined 
//                       ? typeof value === 'number' 
//                         ? value.toFixed(6) 
//                         : value.toString()
//                       : 'N/A'}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
          
//           <h3 className="white-text">All Data</h3>
//           <pre className="raw-data dark-field">
//             {JSON.stringify(node.rawData, null, 2)}
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// };

// Material UI Slider component
const Slider = ({ property, value, min, max, onChange, label, active }) => {
  const handleChange = (event, newValue) => {
    onChange(property, newValue);
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <div className={`slider-container ${active ? 'active-filter' : 'inactive-filter'}`}>
      <div className="slider-header">
        <span className="slider-label">
          {label}
          {label === "HOMO (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`HOMO / LUMO: These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
            >
              ?
            </span>
          )}
          {label === "LUMO (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`HOMO / LUMO: These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
            >
              ?
            </span>
          )}
          {label === "Max ESP (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`ESP Min / Max: Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
            >
              ?
            </span>
          )}
          {label === "Min ESP (eV)" && (
            <span
              className="search-tooltip-marker"
              title={`ESP Min / Max: Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.`}
              style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
            >
              ?
            </span>
          )}
        </span>
        <span className="slider-value">
          {active 
            ? `${formatValue(value[0])} - ${formatValue(value[1])}` 
            : "Off"}
        </span>
      </div>
      <Box sx={{ width: '100%', padding: '5px 0' }}>
        <MuiSlider
          size="small"
          value={value}
          min={min}
          max={max}
          step={(max - min) / 100}
          onChange={handleChange}
          valueLabelDisplay="auto"
          disableSwap
          sx={{
            color: '#0080ff',
            '& .MuiSlider-thumb': {
              backgroundColor: active ? '#0080ff' : '#a0a0a0',
            },
            '& .MuiSlider-track': {
              backgroundColor: active ? '#0080ff' : '#a0a0a0',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
            }
          }}
        />
      </Box>
    </div>
  );
};



// Password Reset component
const PasswordReset = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('current_password', currentPassword);
      formData.append('new_password', newPassword);
      
      const response = await authFetch(`${API_URL}/reset-password`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Password reset failed';
        try {
          const dataErr = await response.clone().json();
          if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
        } catch {
          try {
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch { /* ignore */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuccess(data.message || 'Password reset successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ overflow: 'auto', padding: '40px 0' }}>
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
          <h2>Reset Password</h2>
          <p>Please enter your current password and a new password</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Pricing Page component
const PricingPage = ({ onSignIn, handleNavigation, activePage }) => {
  return (
    <div className="pricing-container" style={{ display: 'flex', width: '100%', padding: '0' }}>
      <div className="pricing-cards" style={{ width: '100%' }}>
        <div className="pricing-card">
          {/* <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm4-9H8v2h8Z"/>
            </svg>
          </div> */}
          <h2>Research (academia only)</h2>
          <p className="pricing-description">
            Access to Partial Molecular Universe (1M)
          </p>
          <div className="pricing-price">
            <span className="price-amount">$0</span>
            <span className="price-period">/ month</span>
          </div>
          <button 
            className="pricing-cta research" 
            onClick={onSignIn}
          >
            Get Started
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (≤ 100 queries/month)</li>
            </ul>
          </div>
        </div>
        
        <div className="pricing-card">
          <h2>Explorer</h2>
          <p className="pricing-description">
            Access to Partial Molecular Universe (1M)
          </p>
          <div className="pricing-price">
            <span className="price-amount">$150</span>
            <span className="price-period">/ month</span>
          </div>
          <button 
            className="pricing-cta professional"
            onClick={() => window.open('https://buy.stripe.com/test_8wMbKFgsJ7hU04o5km', '_blank')}
          >
            Get Started
          </button>
          <div className="pricing-details">
          <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap)</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Team</h2>
          <p className="pricing-description">
            Access to Partial Molecular Universe (1M)
          </p>
          <div className="pricing-price">
            <span className="price-amount">$1,000</span>
            <span className="price-period">/ month (Up to 10 users)</span>
          </div>
          <button className="pricing-cta unlimited"
            onClick={() => window.open('https://buy.stripe.com/test_cN25mha4l9q218seUV', '_blank')}
          >
            Get Started
          </button>
          <div className="pricing-details">
            <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap)</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Enterprise</h2>
          <p className="pricing-description">
            Access to Whole Molecular Universe (100M)
          </p>
          <div className="pricing-price">
            <span className="price-amount"></span>
            <span className="price-period"></span>
          </div>
          <button 
            className="pricing-cta strategic"
            onClick={() => window.location.href = 'mailto:partnership@ses.ai?subject=Joint Development Inquiry'}
          >
            Contact Sales
          </button>
          <div className="pricing-details">
          <ul>
              <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap, battery-specific LLM)</li>
              <li>More molecule properties (inc. melting and boiling point predictions)</li>
              <li>Expert consulting</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card">
          <h2>Joint Development</h2>
          <p className="pricing-description">
            Access to Whole Molecular Universe (100M)
          </p>
          <div className="pricing-price">
            <span className="price-amount"></span>
            <span className="price-period"></span>
          </div>
          <button 
            className="pricing-cta joint"
            onClick={() => window.location.href = 'mailto:Yumin.Zhang@ses.ai?subject=Joint Development Inquiry'}
          >
            Contact Sales
          </button>
          <div className="pricing-details">
            <ul>
            <li>Map</li>
              <li>Filter</li>
              <li>Search</li>
              <li>Ask (no cap, battery-specific LLM)</li>
              <li>More molecule properties (inc. melting and boiling point predictions)</li>
              <li>Customized statement-of-work (inc. molecule synthesis, electrolyte formulation development and cell validation)</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

// Terms Page component
const TermsPage = ({handleNavigation, activePage}) => {
  const [currentDate, setCurrentDate] = useState('');
  
  useEffect(() => {
    // Set the current date in MM/DD/YYYY format
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() is zero-indexed
    const day = now.getDate();
    const year = now.getFullYear();
    setCurrentDate(`${month}/${day}/${year}`);
  }, []);

  return (
    <div className="terms-container" style={{ display: 'flex', width: '93%', paddingLeft: '0' }}>
      <div className="about-text-section left-text" style={{ width: '7%', overflowY: 'auto', padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '0 8px 8px 0', marginLeft: '8px', marginRight: '20px' }}>
        <h1 
          style={{ 
            textDecoration: 'none',
            color: 'rgb(51, 51, 51)',
            fontSize: '9.5px',
            transition: 'font-size 0.3s',
            cursor: 'pointer',
            marginBottom: '12px',
            fontWeight: 'normal'
          }}
          onClick={() => {
            if (activePage === 'about') {
              // Already on the about page, just scroll to the top
              const contentWrapper = document.querySelector('.about-content-wrapper');
              if (contentWrapper) {
                contentWrapper.scrollTop = 0;
              }
            } else {
              // Navigate to about page first, then scroll
              handleNavigation('about');
              setTimeout(() => {
                const contentWrapper = document.querySelector('.about-content-wrapper');
                if (contentWrapper) {
                  contentWrapper.scrollTop = 0;
                }
              }, 100);
            }
          }}
          onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
          onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
        >
          Motivation
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <a 
            href="#features" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '9.5px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
            onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('about');
            }}
          >
            Features
          </a>
          <a 
            href="#pricing" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '9.5px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
            onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('pricing');
            }}
          >
            Pricing
          </a>
          <a 
            href="#news" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '9.5px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
            onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('about');
              setTimeout(() => {
                const newsfeedSection = document.getElementById('newsfeed');
                if (newsfeedSection) {
                  newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
          >
            News Feed
          </a>
        </div>
      </div>
      <div className="terms-content" style={{ 
        width: '100%', 
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        lineHeight: '1.6',
        color: '#333',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>Terms of Use</h1>
        <p style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>Last Modified: {currentDate}</p>
        
        <p style={{ marginBottom: '15px' }}>
          These Terms of Use (this "Agreement") are a binding contract between you or the entity you represent ("Customer," "you," or "your") and SES AI Corporation ("Provider," "we," or "us"). This Agreement governs your access to and use of the Services. Services provided under this Agreement are for business, academic or commercial, and not personal or consumer, use. YOU HEREBY REPRESENT AND WARRANT THAT YOU ARE AN AUTHORIZED REPRESENTATIVE OF A LEGAL ENTITY, INCLUDING CORPORATIONS, LIMITED LIABILITY COMPANIES, ACADEMIC INSTITUTIONS, AND OTHER ORGANIZATIONS. INDIVIDUALS MAY NOT USE THE SERVICES.
        </p>
        
        <p style={{ marginBottom: '15px' }}>
          THIS AGREEMENT TAKES EFFECT AT THE EARLIEST OF WHEN YOU EXECUTE AN ORDER THAT INCORPORATES THIS AGREEMENT BY REFERENCE, OR ACCESS OR USE THE SERVICES (the "Effective Date"). BYEXECUTING AN ORDER THAT INCORPORATES THIS AGREEMENT BY REFERENCE, OR ACCESSING OR USING THE SERVICES YOU (A) ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTAND THIS AGREEMENT; (B) REPRESENT AND WARRANT THAT YOU HAVE THE RIGHT, POWER, AND AUTHORITY TO ENTER INTO THIS AGREEMENT AND IF ENTERING INTO THIS AGREEMENT FOR AN ENTITY, THAT YOU HAVE THE LEGAL AUTHORITY TO BIND THAT ENTITY; AND (C) ACCEPT THIS AGREEMENT ON YOUR BEHALF OR ON BEHALF OF THE ENTITY YOU REPRESENT IF YOU ARE ENTERING INTO THIS AGREEMENT FOR AN ENTITY AND AGREE THAT YOU OR SUCH ENTITY, AS APPLICABLE, ARE LEGALLY BOUND BY ITS TERMS.
        </p>
        
        <p style={{ marginBottom: '15px' }}>
          IF YOU DO NOT ACCEPT THESE TERMS, YOU MAY NOT ACCESS OR USE THE SERVICES.
        </p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>1. Definitions.</h2>
        
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Aggregated Statistics"</span> has the meaning set out in Section 2(d).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"AI Technology"</span> means any and all machine learning, deep learning, and other artificial intelligence technologies, including statistical learning algorithms, models (including large language models), neural networks, and other artificial intelligence tools or methodologies, all software implementations of any of the foregoing, and related hardware or equipment capable of generating various types of content (including text, images, video, audio, or computer code) based on user-supplied prompts.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"AUP"</span> has the meaning set out in Section 3(a).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Authorized User"</span> means Customer and Customer's employees, consultants, contractors, and agents (i) who are authorized by Customer to access and use the Services under the rights granted to Customer under this Agreement and (ii) for whom access to the Services has been purchased hereunder.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"BIS"</span> has the meaning set out in Section 14.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Confidential Information"</span> has the meaning set out in Section 6.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Customer Data"</span> means information, data, materials, text, prompts, images, works, code, or other content, in any form or medium, that is input, uploaded, transferred, submitted, entered, posted, or otherwise transmitted by or on behalf of Customer or any other Authorized User through the Services. Customer Data does not include Aggregated Statistics.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"EAR"</span> has the meaning set out in Section 14.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Export Controls"</span> has the meaning set out in Section 14.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Feedback"</span> has the meaning set out in Section 8(d).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Fees"</span> means the fees described in an Order or the payment page of <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a> that are required to be paid by the Customer for the Services.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Losses"</span> has the meaning set out in Section 10(a)(i).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Order"</span> means an ordering document or online order entered into between you and us that references this Agreement and describes the Services you are subscribing to.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Output"</span> means information, data, materials, text, images, code, works, or other content generated by or otherwise output from the Services in response to a Customer Data.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Personal Information"</span> means information that: (a) identifies or can be used to identify an individual (including, without limitation, names, signatures, addresses, telephone numbers, email addresses, and other unique identifiers); or (b) can be used to authenticate an individual (including, without limitation, employee identification numbers, government-issued identification numbers, passwords or PINs, financial account numbers, credit report information, student information, biometric, health, genetic, medical, or medical insurance data, answers to security questions, an individual's internet activity or similar interaction history, inferences drawn from other personal information to create consumer profiles, geolocation data, an individual's commercial, employment, or education history, and other personal characteristics and identifiers. Customer's business contact information is not by itself deemed to be Personal Information.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Privacy Policy"</span> has the meaning set out in Section 7.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Process"</span> means to take any action or perform any operation or set of operations that the Services are capable of taking or performing on any data, information, or other content, including to collect, receive, input, upload, download, record, reproduce, store, organize, combine, log, catalog, cross-reference, manage, maintain, copy, adapt, alter, translate, or make other improvements or derivative works, process, weigh, perform statistical analysis, retrieve, output, consult, use, perform, display, disseminate, transmit, submit, post, transfer, disclose, or otherwise provide or make available, or block, erase, or destroy. "Processing" and "Processed" have correlative meanings.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Provider IP"</span> means the Services, Output, and all intellectual property provided to Customer or any other Authorized User in connection with the foregoing. For the avoidance of doubt, Provider IP includes Aggregated Statistics and any information, data, or other content derived from Provider's monitoring of Customer's access to or use of the Services, but does not include Customer Data. Provider IP includes all modifications, enhancements, refinements, adaptations, customizations, improvements, and derivative works of the Services.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Sanctions"</span> has the meaning set out in Section 14.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Services"</span> means the services provided by Provider under this Agreement that are detailed on Provider's website available at <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a> or reflected in the applicable Order.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Service Suspension"</span> has the meaning set out in Section 2(f).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Term"</span> has the meaning set out in Section 12(a).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Third-Party Claim"</span> has the meaning set out in Section 10(a)(i).</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Third-Party Products"</span> means any products, technology, content, data, services, information, websites, or other materials that are owned by third parties and are included in, incorporated into, or accessible through the Services, including any third-party AI Technology.</p>
        <p style={{ marginBottom: '10px' }}><span style={{ fontWeight: 'bold' }}>"Training Data"</span> means any and all information, data, materials, text, prompts, images, code, and other content that is used by or on behalf of Provider to train, validate, test, retrain, or improve any AI Technology incorporated into or used with, in connection with, or in support of, the Services.</p>

        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>2. Access and Use.</h2>
        <p style={{ marginBottom: '15px' }}><strong>(a)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Provision of Services. Subject to and conditioned on your payment of Fees and compliance with all the terms and conditions of this Agreement, Provider will provide you with the online software-as-a-service products and services on a subscription basis for the Term, and such other products and services, as set forth on an applicable Order. Each Order will be incorporated into, and is fully governed by, this Agreement upon execution of the Order by both parties. In the event of any conflict or inconsistency between this Agreement and an Order, this Agreement shall control, unless expressly stated in the Order.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(b)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Provision of Access. Provider hereby grants you a non-exclusive, non-transferable, non-sublicensable limited right to access and use the Services during the Term, solely for your internal business operations by Authorized Users under these terms and conditions. Provider shall provide you the necessary passwords and access credentials to allow you access to the Services.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(c)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Use Restrictions. You shall not use the Services for any purposes beyond the scope of the access granted in this Agreement. You shall not at any time, directly or indirectly, and shall not permit any Authorized Users to: (i) copy, modify, prepare or create derivative works of the Services, in whole or in part; (ii) rent, lease, lend, sell, license, sublicense, assign, distribute, publish, transfer, or otherwise make available the Services; (iii) reverse engineer, disassemble, decompile, decode, or duplicate the Services, reproduce Training Data other than Customer Data, engage in model extraction, or otherwise attempt to derive or gain access to any source code, algorithm, model, model weights and parameters, or other underlying AI Technology or component of the Services, in whole or in part; (iv) access or use the Services or any Output to develop, train, or improve a competing or similar product or service; (v) use web scraping, web harvesting, web data extraction or any other method to extract data from the Services or any Output; (vi) alter or remove any proprietary notices from the Services; (vii) use the Services to create or generate Output, or use Output in a manner, that you know or should know infringes, misappropriates, or otherwise violates any intellectual property right or other right of any person, or that violates any applicable law, regulation, or rule; or (viii) submit, enter, post, or otherwise transmit or Process any Personal Information through the Services.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(d)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Aggregated Statistics. Notwithstanding anything to the contrary in this Agreement, Provider may monitor Customer's use of the Services and collect and compile data and information related to Customer's use of the Services to be used by Provider in an aggregated and anonymized manner, including to compile statistical and performance information related to the provision and operation of the Services ("Aggregated Statistics"). As between Provider and Customer, all right, title, and interest in Aggregated Statistics, and all intellectual property rights therein, belong to and are retained solely by Provider. You agree that Provider may use and make publicly available Aggregated Statistics to the extent and in the manner permitted under applicable law; provided that such Aggregated Statistics do not identify Customer or Customer's Confidential Information.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(e)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Reservation of Rights. Provider reserves all rights not expressly granted to Customer in this Agreement. Except for the limited rights and licenses expressly granted under this Agreement, nothing in this Agreement grants, by implication, waiver, estoppel, or otherwise, to Customer or any third party, any intellectual property rights or other right, title, or interest in or to the Provider IP or Third-Party Products.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(f)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Suspension. Notwithstanding anything to the contrary in this Agreement, Provider may temporarily suspend Customer's and any other Authorized User's access to any portion or all of the Services if: (i) Provider reasonably determines that (A) there is a threat or attack on any of the Provider IP; (B) Customer's or any other Authorized User's use of the Provider IP disrupts or poses a security risk to the Provider IP, to Provider, or to any other customer or vendor of Provider; (C) Customer or any other Authorized User is using the Provider IP for fraudulent or illegal activities; (D) subject to applicable law, Customer has ceased to continue its business in the ordinary course, made an assignment for the benefit of creditors or similar disposition of its assets, or become the subject of any bankruptcy, reorganization, liquidation, dissolution, or similar proceeding; (E) Provider's provision of the Services to Customer or any other Authorized User is prohibited by applicable law; or (F) Customer is using the Services in material violation of Section Error! Reference source not found.(c) or the AUP; (ii) any vendor of Provider has suspended or terminated Provider's access to or use of any third-party services or products required to enable Customer to access and use the Services; or (iii) in accordance with Section Error! Reference source not found. (any such suspension described in subclause (i), (ii), or (iii), a "Service Suspension"). Provider shall use commercially reasonable efforts to provide written notice of any Service Suspension to Customer and to provide updates regarding resumption of access to the Services following any Service Suspension. Provider shall use commercially reasonable efforts to resume providing access to the Services as soon as reasonably possible after the event giving rise to the Services Suspension is cured. Provider will have no liability for any damage, liabilities, losses (including any loss of data or profits), or any other consequences that Customer or any other Authorized User may incur as a result of a Service Suspension.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>3. Customer Responsibilities.</h2>
        <p style={{ marginBottom: '15px' }}><strong>(a)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Acceptable Use Policy; Provider Policies. The Services may not be used for unlawful, fraudulent, offensive, or obscene activity, as further described and set out in Provider's acceptable use policy (<span style={{ fontWeight: 'bold' }}>"AUP"</span>) located at <a href='https://molecular-universe.ses.ai/terms'>https://molecular-universe.ses.ai/terms</a>, as may be amended from time to time, which is hereby incorporated herein by reference. You shall comply with all terms and conditions of this Agreement, all applicable laws, rules, and regulations, and all guidelines, standards, requirements, and policies that may be posted on <a href="https://molecular-universe.ses.ai/terms">https://molecular-universe.ses.ai/terms</a> from time to time, which are hereby incorporated herein by reference, including the AUP.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(b)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Account Use. You are responsible and liable for all uses of the Services resulting from access provided by you, directly or indirectly, whether that access or use is permitted by or in violation of this Agreement. Without limiting the generality of the foregoing, you are responsible for all acts and omissions of Authorized Users, and any act or omission by an Authorized User that would constitute a breach of this Agreement if taken by you will be deemed a breach of this Agreement by you. You shall use reasonable efforts to make all Authorized Users aware of this Agreement's provisions as applicable to such Authorized User's use of the Services and shall cause Authorized Users to comply with such provisions.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(c)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Use of Output. Provider hereby grants you a non-exclusive, non-transferable, non-sublicensable right to use the Output during the Term, solely for your internal business operations by Authorized Users under these terms and conditions. You are solely responsible for (i) evaluating (including by human review) Output for accuracy, completeness, and other factors relevant to your use before using or relying on the Output and (ii) your decisions, actions, and omissions in reliance or based on the Output.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(d)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Passwords and Access Credentials. You are responsible for keeping your passwords and access credentials associated with the Services confidential. You shall not sell or transfer them to any other person or entity. You shall promptly notify us about any unauthorized access to your passwords or access credentials.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(e)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Third-Party Products. The Services may permit access to Third-Party Products. For purposes of this Agreement, these Third-Party Products are subject to their own terms and conditions which may be presented to you for acceptance by website link or otherwise. You must comply with the applicable terms of use when using the Third-Party Products and the Services. Provider does not endorse, and hereby disclaims all liability or responsibility to you or any other person for, any Third-Party Products. We may add or remove Third-Party Products from time to time. If you do not agree to abide by the applicable terms for any Third-Party Products, then you should not install, access, or use these Third-Party Products or any Services that include or incorporate these Third-Party Products. NOTWITHSTANDING ANYTHING IN THIS AGREEMENT TO THE CONTRARY, ALL THIRD-PARTY PRODUCTS ARE MADE AVAILABLE ON AN "AS IS" BASIS WITHOUT WARRANTY OF ANY KIND. IF CUSTOMER USES ANY THIRD-PARTY PRODUCTS, PROVIDER WILL NOT BE RESPONSIBLE FOR ANY ACT OR OMISSION OF ANY PROVIDER OF SUCH THIRD-PARTY PRODUCTS. PROVIDER DOES NOT WARRANT OR PROVIDE DIRECT SUPPORT FOR ANY THIRD-PARTY SERVICES. CUSTOMER ACKNOWLEDGES AND AGREES THAT PROVIDER WILL HAVE NO RESPONSIBILITY OR LIABILITY FOR THE ACTS OR OMISSIONS OF ANY PERMITTED USERS IN CONNECTION WITH ANY THIRD-PARTY PRODUCTS.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>4. De-identified Data and Data Retention.</h2>
        <p style={{ marginBottom: '15px' }}>Provider may create and use de-identified or desensitized data related to Customer's use of the Services to improve Provider's products and services, to develop new products and services, and for its other business purposes (and such de-identified or desensitized data will be owned by Provider). All Customer Data is automatically deleted within [X days], unless (a) otherwise agreed in an Order; (b) Provider is legally required to retain them; or (c) they are flagged as potentially violating this Agreement or the AUP.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>5. Fees and Payment.</h2>
        <p style={{ marginBottom: '15px' }}>If you purchase any aspect of the Service from our website <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a>, you must provide complete and accurate billing information, including a valid payment method. For paid subscriptions, we will automatically charge your payment method on each periodic renewal until you terminate our Services in accordance with Section 12(b)(i). If you received an invoice from Provider, you shall pay Provider the <span style={{ fontWeight: 'bold' }}>Fees</span> within thirty (30) days from the invoice date without offset or deduction. Customer shall make all payments hereunder in US dollars on or before the due date. Except as otherwise set forth in the applicable Order Form, all fees are due and payable in advance at the start of the applicable Term. If Customer fails to make any payment when due, without limiting Provider's other rights and remedies: (i) Provider may charge interest on the past due amount at the rate of [1.5% per month/[OTHER INTEREST RATE]] calculated daily and compounded monthly or, if lower, the highest rate permitted under applicable law; (ii) Customer shall reimburse Provider for all reasonable costs incurred by Provider in collecting any late payments or interest, including attorneys' fees, court costs, and collection agency fees; and (iii) if the failure continues for thirty (30) days or more, Provider may suspend, under Section 2(f), Customer's and all other Authorized Users' access to any portion or all of the Services until such amounts are paid in full. All Fees and other amounts payable by Customer under this Agreement are non-refundable and exclusive of taxes and similar assessments. Customer is responsible for all sales, use, and excise taxes, and any other similar taxes, duties, and charges of any kind imposed by any federal, state, or local governmental or regulatory authority on any amounts payable by Customer hereunder, other than any taxes imposed on Provider's income.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>6. Confidential Information.</h2>
        <p style={{ marginBottom: '15px' }}>From time to time during the Term, Provider and Customer may disclose or make available to the other party information about its business affairs, products, confidential intellectual property, trade secrets, third-party confidential information, and other sensitive or proprietary information, whether orally or in written, electronic, or other form or media/in written or electronic form or media, that is marked, designated, or otherwise identified as "confidential" at the time of disclosure, or that ought reasonably to be understood as confidential or proprietary (collectively, <span style={{ fontWeight: 'bold' }}>"Confidential Information"</span>). Without limiting the foregoing, Provider IP is Provider's Confidential Information and Customer Data is Customer's Confidential Information. Confidential Information does not include information that, at the time of disclosure is: (a) in the public domain; (b) known to the receiving party; (c) rightfully obtained by the receiving party on a non-confidential basis from a third party; or (d) independently developed without any reference to or use of the disclosing party's Confidential Information by the receiving party. The receiving party shall not disclose the disclosing party's Confidential Information to any person or entity, except to the receiving party's employees, agents, or subcontractors who have a need to know the Confidential Information for the receiving party to exercise its rights or perform its obligations hereunder and who are required to protect the Confidential Information in a manner no less stringent than required under this Agreement. Notwithstanding the foregoing, each party may disclose Confidential Information to the limited extent required (i) to comply with the order of a court or other governmental body, or as otherwise necessary to comply with applicable law, provided that the party making the disclosure pursuant to the order shall first have given written notice to the other party and made a reasonable effort to obtain a protective order; or (ii) to establish a party's rights under this Agreement, including to make required court filings. Each party's obligations of non-disclosure regarding Confidential Information are effective as of the date the Confidential Information is first disclosed to the receiving party and will continue as long as permitted by applicable law; provided, however, for any Confidential Information that constitutes a trade secret (as determined under applicable law), those obligations of non-disclosure will survive the termination or expiration of this Agreement for as long as the Confidential Information remains subject to trade secret protection under applicable law. Unauthorized disclosure of Confidential Information may cause harm not compensable by damages, and the disclosing party may seek injunctive or equitable relief in a court of competent jurisdiction, without posting a bond, to protect its Confidential Information.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>7. Privacy Policy.</h2>
        <p style={{ marginBottom: '15px' }}>Provider complies with its <span style={{ fontWeight: 'bold' }}>Privacy Policy</span>, available at https://www.ses.ai/privacy ("Privacy Policy"), in providing the Services. The Privacy Policy is subject to change as described therein. By accessing, using, and providing information to or through the Services, you acknowledge that you have reviewed and accepted our Privacy Policy, and you consent to all actions taken by us with respect to your information in compliance with the then-current version of our Privacy Policy.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>8. Intellectual Property Ownership; Feedback.</h2>
        <p style={{ marginBottom: '15px' }}><strong>(a)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Provider IP. Customer acknowledges that, as between Customer and Provider, Provider owns all right, title, and interest, including all intellectual property rights, in and to the <span style={{ fontWeight: 'bold' }}>Provider IP</span> and, for <span style={{ fontWeight: 'bold' }}>Third-Party Products</span>, the applicable third-party providers own all right, title, and interest, including all intellectual property rights, in and to the Third-Party Products.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(b)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Customer Data. Provider acknowledges that, as between Provider and Customer, Customer owns all right, title, and interest, including all intellectual property rights, in and to the <span style={{ fontWeight: 'bold' }}>Customer Data</span>. Customer hereby grants to Provider a non-exclusive, royalty-free, worldwide license to (i) reproduce, distribute, and otherwise use and display the Customer Data and Process the Customer Data as may be necessary for Provider to provide the Services to Customer and (ii) use, modify, and adapt only aggregated and anonymized Customer Data to train, develop, adapt, modify, enhance, or improve the Services and other products or services. Notwithstanding anything in this Agreement to the contrary, unless prohibited by applicable law, we may delete Customer Data at any time if we determine that Customer Data violates the terms of this Agreement or that deletion is necessary to comply with applicable law.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(c)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Feedback. If you or any other <span style={{ fontWeight: 'bold' }}>Authorized User</span> sends or transmits any communications or materials to us by mail, email, telephone, or otherwise, suggesting or recommending changes to the Services, including without limitation, new features or functionality relating thereto, or any comments, questions, suggestions, or the like (<span style={{ fontWeight: 'bold' }}>"Feedback"</span>), we are free to use that Feedback. All Feedback is and will be treated as non-confidential. You hereby assign to us on your behalf, and shall cause your Authorized Users to assign to us, all right, title, and interest in, and we are free to use, without any attribution or compensation to you or any third party, any ideas, know-how, concepts, techniques, or other intellectual property rights contained in the Feedback, for any purpose whatsoever, although we are have no obligation to acknowledge receipt of or use any Feedback.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>9. Limited Warranty and Warranty Disclaimer.</h2>
        <p style={{ marginBottom: '15px' }}><strong>(a)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Customer Warranty. You represent, warrant, and covenant that (i) you own or otherwise have and will have all necessary rights, permissions, and consents in and relating to the Customer Data so that, as received by Provider and Processed in accordance with this Agreement, it does not and will not infringe, misappropriate, or otherwise violate any intellectual property rights, or any privacy or other rights of any third party or violate any applicable law (including but not limited to government laws and regulations relating to the export or re-export of Customer Data from the jurisdiction you operate or use the Services in), and (ii) no Customer Data contains or will contain any <span style={{ fontWeight: 'bold' }}>Personal Information</span>.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(b)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;THE SERVICES AND OUTPUT ARE PROVIDED "AS IS" AND PROVIDER SPECIFICALLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. PROVIDER SPECIFICALLY DISCLAIMS ALL IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT, AND ALL WARRANTIES ARISING FROM COURSE OF DEALING, USAGE, OR TRADE PRACTICE. PROVIDER MAKES NO WARRANTY OF ANY KIND THAT THE SERVICES, OR ANY PRODUCTS OR RESULTS OF THE USE THEREOF, INCLUDING ANY AI OUTPUTS, WILL MEET YOUR OR ANY OTHER PERSON'S OR ENTITY'S REQUIREMENTS, OPERATE WITHOUT INTERRUPTION, ACHIEVE ANY INTENDED RESULT, BE COMPATIBLE OR WORK WITH ANY OF YOUR OR ANY THIRD PARTY'S SOFTWARE, SYSTEM, OR OTHER SERVICES, OR BE SECURE, ACCURATE, COMPLETE, FREE OF HARMFUL CODE, OR ERROR-FREE, OR THAT ANY ERRORS OR DEFECTS CAN OR WILL BE CORRECTED. YOU ACKNOWLEDGE THAT, GIVEN THE NATURE OF THE SERVICES AND AI TECHNOLOGY, <span style={{ fontWeight: 'bold' }}>Output</span> (I) MAY BE INACCURATE, MISLEADING, OR BIASED, (II) MAY BE THE SAME AS OR SIMILAR TO OUTPUT THE SERVICES GENERATE FOR OTHER CUSTOMERS, (III) MAY NOT QUALIFY FOR INTELLECTUAL PROPERTY PROTECTION, AND (IV) MAY BE SUBJECT TO THIRD PARTY TERMS, INCLUDING, AS APPLICABLE, OPEN SOURCE LICENSES, AND (V) DO NOT NECESSARILY REFLECT, AND MAY BE INCONSISTENT WITH, PROVIDER'S AND THIRD-PARTY PROVIDERS' VIEWS.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>10. Indemnification.</h2>
        <p style={{ marginBottom: '15px' }}><strong>(a)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Provider Indemnification.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(i)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Provider shall indemnify, defend, and hold Customer harmless from and against any and all losses, damages, liabilities, deficiencies, claims, actions, judgments, settlements, interest, awards, penalties, fines, costs, or expenses of whatever kind, including reasonable attorneys' fees (<span style={{ fontWeight: 'bold' }}>"Losses"</span>), incurred by Customer resulting from any third-party claim, suit, action, or proceeding (<span style={{ fontWeight: 'bold' }}>"Third-Party Claim"</span>) that the Services, or Customer's or any Authorized User's use thereof in accordance with this Agreement, infringes or misappropriates such third party's intellectual property rights, provided that Customer promptly notifies Provider in writing of the Third-Party Claim, cooperates with Provider, provides Provider with all related documentation in Customer's possession or control relating to such Third-Party Claim and allows Provider sole authority to control the defense and settlement of such Third-Party Claim.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(ii)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;If such a Third-Party Claim is made or either party reasonably anticipates such a Third-Party Claim will be made, Customer agrees to permit Provider, at Provider's sole discretion, to (A) modify or replace the Services, or component or part thereof, to make it non-infringing, or (B) obtain the right for Customer to continue use. If Provider determines that neither alternative is reasonably available, Provider may terminate this Agreement, in its entirety or with respect to the affected component or part, effective immediately on written notice to Customer.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(iii)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This Section 10(a) will not apply to the extent that any such Third-Party Claim arises from (A) Customer's or any other Authorized User's use of the Services or Output in combination with any products, services, or software not provided by or on behalf of Provider; (B) modifications to the Services or Output other than by or on behalf of Provider; (C) Customer Data; (D) Third-Party Products; (E) Customer's disablement or circumvention of any applicable source citation, filtering, or safety tools or functions of the Services; (F) Customer's violation of this Agreement or the AUP or applicable laws; or (G) <span style={{ fontWeight: 'bold' }}>Training Data</span> or Output.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(b)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Customer Indemnification. Customer shall indemnify, hold harmless, and, at Provider's option, defend Provider and its officers, directors, employees, agents, affiliates, successors, and assigns from and against any and all Losses arising from or relating to any Third-Party Claim (i) that the other Customer Data, or Processing or any other use thereof in accordance with this Agreement, infringes or misappropriates such third party's intellectual property rights; (ii) based on Customer's or any Authorized User's negligence or willful misconduct or use of the Services or applicable laws; provided that Customer may not settle any Third-Party Claim against Provider unless Provider consents to such settlement, and further provided that Provider will have the right, at its option, to defend itself against any such Third-Party Claim or to participate in the defense thereof by counsel of its own choice.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(c)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sole Remedy. THIS SECTION 10 SETS OUT CUSTOMER'S SOLE REMEDIES AND PROVIDER'S SOLE LIABILITY AND OBLIGATION FOR ANY ACTUAL, THREATENED, OR ALLEGED CLAIMS THAT THE SERVICES OR OUTPUT INFRINGE, MISAPPROPRIATE, OR OTHERWISE VIOLATE ANY INTELLECTUAL PROPERTY RIGHTS OF ANY THIRD PARTY. IN NO EVENT WILL PROVIDER'S LIABILITY UNDER THIS SECTION 10 EXCEED US$100.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>11. Limitations of Liability.</h2>
        <p style={{ marginBottom: '15px' }}>EXCEPT AS PROHIBITED BY LAW, IN NO EVENT WILL PROVIDER BE LIABLE UNDER OR IN CONNECTION WITH THIS AGREEMENT UNDER ANY LEGAL OR EQUITABLE THEORY, INCLUDING BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, FOR ANY: (a) CONSEQUENTIAL, INCIDENTAL, INDIRECT, EXEMPLARY, SPECIAL, ENHANCED, OR PUNITIVE DAMAGES; (b) INCREASED COSTS, DIMINUTION IN VALUE OR LOST BUSINESS, PRODUCTION, REVENUES, OR PROFITS; (c) LOSS OF GOODWILL OR REPUTATION; (d) USE, INABILITY TO USE, LOSS, INTERRUPTION, DELAY OR RECOVERY OF ANY DATA, OR BREACH OF DATA OR SYSTEM SECURITY; OR (e) COST OF REPLACEMENT GOODS OR SERVICES, IN EACH CASE REGARDLESS OF WHETHER PROVIDER WAS ADVISED OF THE POSSIBILITY OF SUCH LOSSES OR DAMAGES OR SUCH LOSSES OR DAMAGES WERE OTHERWISE FORESEEABLE. EXCEPT AS PROHIBITED BY LAW, IN NO EVENT WILL PROVIDER'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT UNDER ANY LEGAL OR EQUITABLE THEORY, INCLUDING BREACH OF CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE EXCEED THE TOTAL AMOUNTS PAID TO PROVIDER UNDER THIS AGREEMENT IN THE TWELVE (12) MONTH PERIOD PRECEDING THE EVENT GIVING RISE TO THE CLAIM OR US$100, WHICHEVER IS LESS.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>12. Term and Termination.</h2>
        <p style={{ marginBottom: '15px' }}><strong>(a)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Term. The term of this Agreement begins on the Effective Date and will continue for effect until terminated as set forth below (the <span style={{ fontWeight: 'bold' }}>"Term"</span>).</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(b)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Termination. In addition to any other express termination right set out in this Agreement:</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(i)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unless the Term is for a specific period as set out in the <span style={{ fontWeight: 'bold' }}>Order</span>, each party may terminate this Agreement for any reason upon thirty (30) days' advance written notice.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(ii)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Either party may terminate this Agreement, effective on written notice to the other party, if the other party materially breaches this Agreement, and such breach: (A) is incapable of cure; or (B) being capable of cure, remains uncured thirty (30) days after the non-breaching party provides the breaching party with written notice of such breach.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(iii)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Either party may terminate this Agreement, effective immediately upon written notice to the other party, if the other party: (A) becomes insolvent or is generally unable to pay, or fails to pay, its debts as they become due; (B) files, or has filed against it, a petition for voluntary or involuntary bankruptcy or otherwise becomes subject, voluntarily or involuntarily, to any proceeding under any domestic or foreign bankruptcy or insolvency law; (C) makes or seeks to make a general assignment for the benefit of its creditors; or (D) applies for or has appointed a receiver, trustee, custodian, or similar agent appointed by order of any court of competent jurisdiction to take charge of or sell any material portion of its property or business.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(iv)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;For clarity, termination of this Agreement will automatically terminate all Orders.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(c)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Effect of Expiration or Termination. Upon expiration or termination of this Agreement, Customer shall immediately discontinue use of the Provider IP and cease all use of the Services. No expiration or termination of this Agreement will affect Customer's obligation to pay all Fees that may have become due before that expiration or termination, or entitle Customer to any refund. Following expiration or termination of this Agreement, Provider may permanently delete Customer Data and from the Services and all systems Provider controls, unless otherwise required by applicable law. Notwithstanding the foregoing and for the avoidance of doubt, Provider shall not be obligated to delete, destroy, or disable any modifications, developments, or improvements to the Services or any other products or services resulting from Provider's use of Customer Data pursuant to Section 4 and Section 8(b)(ii). Except as otherwise set forth herein, termination of this Agreement is not an exclusive remedy and the exercise by either party of any remedy under this Agreement will be without prejudice to any other remedies it may have under this Agreement, by law, or otherwise.</p>
        
        <p style={{ marginBottom: '15px' }}><strong>(d)</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Survival. Sections 4, 5, 6, 8, 10, 11, 12, 14, 15, 16, and 17, and any right, obligation, or required performance of the parties in this Agreement which, by its express terms or nature and context is intended to survive termination or expiration of this Agreement, will survive termination or expiration.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>13. Modifications.</h2>
        <p style={{ marginBottom: '15px' }}>You acknowledge and agree that we have the right, in our sole discretion, to modify this Agreement from time to time, and that modified terms become effective on posting. You will be notified of modifications through notifications or posts on <a href='molecular-universe.ses.ai/terms'>molecular-universe.ses.ai/terms</a>. You are responsible for reviewing and becoming familiar with any modifications. Your continued use of the Services after the effective date of the modifications will be deemed acceptance of the modified terms.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>14. Export Regulation.</h2>
        <p style={{ marginBottom: '15px' }}>In connection with this Agreement, you warrant that you have complied and will comply with (i) all applicable export control laws including, without limitation, the US Export Administration Act and its associated regulations (<span style={{ fontWeight: 'bold' }}>"EAR"</span>) administered by the US Department of Commerce, Bureau of Industry and Security (<span style={{ fontWeight: 'bold' }}>"BIS"</span>) the Foreign Trade Act of Korea, and export control laws and regulations of other countries (collectively, <span style={{ fontWeight: 'bold' }}>"Export Controls"</span>); (ii) economic, financial or trade sanctions administered or enforced by the US (including, without limitation, the US Department of the Treasury's Office of Foreign Assets Control, the US Department of State and US Department of Commerce), which includes, without limitation, the International Traffic in Arms Regulations, the European Union or any member state thereof, the United Kingdom, the UN Security Council, or Singapore (<span style={{ fontWeight: 'bold' }}>"Sanctions"</span>); and (iii) applicable anti-corruption and anti-bribery laws including, without limitation, the US Foreign Corrupt Practices Act, as amended. You warrant that neither you nor any party owning 50% or more of your securities or other equivalent voting interests; nor any director, officer, employee or any person acting on behalf of you, is (a) the target of Sanctions; (b) designated under any list maintained under Export Controls, including, without limitation, to BIS's Entity List, Unverified List, or Denied Persons List; (c) owned or controlled by any person or entity that are described in (a) and/or (b); or (d) is a national resident of, or a segment of the government of, any country or territory for which the US has embargoed goods or imposed trade sanctions. Notwithstanding anything in this Agreement to the contrary, for the purpose of this Section 14 and Section 15, references to "you" and "yours" include your affiliates.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>15. Compliance.</h2>
        <p style={{ marginBottom: '15px' }}>Without limiting the requirements set forth in Section 14, you shall comply with all applicable federal laws, regulations, and rules, and complete all required undertakings (including obtaining any necessary export license or other governmental approval), prior to exporting, re-exporting, releasing, or otherwise making the <span style={{ fontWeight: 'bold' }}>Services</span> or the software or technology included in the Services available outside the US. You shall not, directly or indirectly, export, re-export, or release the Services or the software or technology included in the Services to, or make the Services or the software or technology included in the Services accessible from (i) any jurisdiction or country to which export, re-export, or release is prohibited by law, regulation, or rule, including but not limited to the countries that have been designated by the US Government as a terrorist-supporting country; or (ii) any other person or entity for use in activities directly or indirectly related to the proliferation of nuclear, biological or chemical weapons, or missiles, rocket systems or unmanned aerial vehicles, as provided in Part 744 of the EAR. You further certify that you are not a military end-user, nor are you engaged in any actions or functions that are intended to support any military end-use or any military intelligence end-use, and will not use, or permit any other person or entity to use, any of the Services provided by us in any such military end-use or military intelligence end-use. For purpose of this certificate, the term "military end-user" as defined in Section 744.21(g) of the EAR, means and includes the national armed services, the national guard and national police, government intelligence and reconnaissance organizations, and any person or entity whose actions or functions are intended to support military end-uses. A "military end-use", as defined in Section 744.21(f) of the EAR, means the incorporation of any product into a military item or defense article or any item that supports or contributes to the military item or a defense article. A "military intelligence end-use" means the design, development, production, use, operation, installation (including on-site installation), maintenance (checking), repair, overhaul, or refurbishing of, or incorporation into, military items or defense articles which are intended to support the actions or functions of an intelligence or reconnaissance organization of the armed forces or the national guard. You further acknowledge that Section 736.2(b)(3)(vi) of the EAR prohibits the use of our commodities and technologies in the development or production of any products that are intended for, or to be supplied to Huawei Technologies Co. Ltd. or any of its affiliates unless an export license for that transaction has been obtained from the BIS.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>16. Governing Law and Jurisdiction.</h2>
        <p style={{ marginBottom: '15px' }}>This Agreement is governed by and construed in accordance with the internal laws of the State of Delaware without giving effect to any choice or conflict of law provision. Any dispute, controversy or claim arising out of or relating to this contract, or the breach, termination or invalidity thereof, shall be settled by arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules, and judgment on the award rendered by the arbitrator(s) may be entered in any court having jurisdiction thereof. The place of arbitration shall be New York, New York. The number of arbitrators shall be one. The language to be used in the arbitral proceedings shall be English.</p>
        
        <h2 style={{ fontSize: '20px', marginTop: '30px', marginBottom: '15px' }}>17. Miscellaneous.</h2>
        <p style={{ marginBottom: '15px' }}>This Agreement, including the Order and all documents referenced herein, constitutes the entire agreement and understanding between the parties hereto with respect to the subject matter hereof and supersedes all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral, with respect to such subject matter. In the event of any inconsistency between the body of this Agreement and the Order, the body of this Agreement controls unless the parties expressly indicate in the Order an intent to deviate from the terms of this Agreement. Any notices to us must be sent to legaldept@ses.ai or our US corporate headquarters address available at https://www.ses.ai/contact-us and must be delivered either in person, by email, certified or registered mail, return receipt requested and postage prepaid, or by recognized overnight courier service, and are deemed given upon receipt by us. Notwithstanding the foregoing, you hereby consent to receiving electronic communications from us. These electronic communications may include notices about applicable fees and charges, transactional information, and other information concerning or related to the Services. You agree that any notices, agreements, disclosures, or other communications that we send to you electronically will satisfy any legal communication requirements, including that such communications be in writing. The invalidity, illegality, or unenforceability of any provision herein does not affect any other provision herein or the validity, legality, or enforceability of such provision in any other jurisdiction. Any failure to act by us with respect to a breach of this Agreement by you or others does not constitute a waiver and will not limit our rights with respect to such breach or any subsequent breaches. This Agreement is personal to you and may not be assigned or transferred for any reason whatsoever without our prior written consent and any action or conduct in violation of the foregoing will be void and without effect. We expressly reserve the right to assign this Agreement and to delegate any of its obligations hereunder.</p>
        
        <div style={{ marginTop: '40px', borderTop: '1px solid #ddd', paddingTop: '30px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>Acceptable Use Policy</h1>
          <p style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>Effective: {currentDate}</p>
          
          <p style={{ marginBottom: '15px' }}>
            SES AI's Acceptable Use Policy ("AUP") applies to anyone using our Service, including academic institutions, organizations and businesses. We aim to maximize your control over how you use our Service while also ensuring that you do so in a way that is compliant with the law, responsible and safe for humanity. Our policies will evolve over time as our Service and user base change, as well as based on what we learn over time.
          </p>
          
          <p style={{ marginBottom: '15px' }}>
            By using our Service, you agree to comply with our policies. Violating our policies could result in action against your account, up to suspension or termination. Capitalized terms used and not defined herein are defined in the <a href="https://molecular-universe.ses.ai/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>Terms of Use</a>.
          </p>
          
          <p style={{ marginBottom: '15px' }}>
            You are free to use our Service as you see fit so long as you use it to be a good human, act safely and responsibly, comply with the law, do not harm people, and respect our guardrails:
          </p>
          
          <p style={{ marginBottom: '10px' }}><strong>1. Comply with the law.</strong> For example, don't use our Service or Outputs to promote or engage in illegal activities, including:</p>
          <div style={{ marginLeft: '25px', marginBottom: '15px' }}>
            <p style={{ marginBottom: '5px' }}><strong>1.1.</strong> Violating patent, trademark, or other intellectual property law</p>
            <p style={{ marginBottom: '5px' }}><strong>1.2.</strong> Violating a person's privacy or their right to publicity</p>
            <p style={{ marginBottom: '5px' }}><strong>1.3.</strong> Operating in a regulated industry or region without complying with those regulations</p>
            <p style={{ marginBottom: '5px' }}><strong>1.4.</strong> Defrauding, defaming, scamming, or spamming</p>
            <p style={{ marginBottom: '5px' }}><strong>1.5.</strong> Espionage, spying, stalking, hacking, doxing, or phishing</p>
          </div>
          
          <p style={{ marginBottom: '10px' }}><strong>2. Do not harm people or property.</strong> This prohibition includes things like using our Service or Outputs to:</p>
          <div style={{ marginLeft: '25px', marginBottom: '15px' }}>
            <p style={{ marginBottom: '5px' }}><strong>2.1.</strong> Critically harm or promoting critically harming human life (yours or anyone else's)</p>
            <p style={{ marginBottom: '5px' }}><strong>2.2.</strong> Take unauthorized actions on behalf of others</p>
            <p style={{ marginBottom: '5px' }}><strong>2.3.</strong> Develop bioweapons, chemical weapons, or weapons of mass destruction</p>
            <p style={{ marginBottom: '5px' }}><strong>2.4.</strong> Destroy property</p>
          </div>
          
          <p style={{ marginBottom: '15px' }}><strong>3. Respect guardrails and don't mislead.</strong> Don't circumvent safeguards. Don't mislead people as to the nature and source of Outputs. You should be transparent and disclose your use of AI assistance and potential limitations, as applicable.</p>
          
          <h1 style={{ fontSize: '28px', marginTop: '40px', marginBottom: '20px', textAlign: 'center' }}>Privacy Notice</h1>
          <p style={{ fontSize: '16px', marginBottom: '30px', textAlign: 'center' }}>Last Modified: {currentDate}</p>
          
          <p style={{ marginBottom: '15px' }}>This Privacy Notice discloses the privacy practices for SES AI Corporation and its affiliates ("SES," "we," "us," "our"). It describes how we collect, use, and disclose information in connection with your access and use of all websites and other online products and services provided by us that link to this Privacy Notice, including https://ses.ai (and all related subdomains) (the "Sites") and related online and offline services thereto (collectively the "Services"). SES is the data controller of your information. This notice will inform you of the following:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>What information we collect;</li>
            <li>How we use it;</li>
            <li>With whom it is shared;</li>
            <li>How it can be corrected;</li>
            <li>How it is secured;</li>
            <li>How long it will be stored;</li>
            <li>How notice changes will be communicated;</li>
            <li>How to address concerns over misuse of your information.</li>
          </ul>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Information We Collect</h3>
          <p style={{ marginBottom: '15px' }}>We ask that you do NOT include personal information in your prompts and inputs into our services on <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a>; however, we cannot control what you provide to us.</p>
          <p style={{ marginBottom: '15px' }}>We collect information in three main ways: (1) information collected directly from you; (2) information collected through automated means; and (3) information collected directly from others. We may combine the information you give us with other information sources (both online and offline), including third-party sources, and use it for the purposes identified in this Privacy Notice.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Information Collected Directly from You</h3>
          <p style={{ marginBottom: '15px' }}>The general categories of your information that we collect directly from you (for example, if you fill out the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form on our Sites, subscribe for our services on <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a> or seek customer service) may include, but are not limited to:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Commercial information, including your interest in SES products and Services and transaction information;</li>
            <li>Personal identifiers, including your contact information (name, address, telephone number, email address, business information, and candidate information (for job applicants);</li>
            <li>Payment data such as your credit/debit card information, billing information and bank account information that you may provide to us for the purposes of subscribing to our services on <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a>. We use Stripe, Inc. ("Stripe") to process payments securely. Stripe acts as a data processor on our behalf for the purposes of handling and storing your payment details, including your credit/debit card number, expiration data, and billing address. In certain cases, Stripe may act as an independent data controller (e.g., for anti-fraud checks or regulatory compliance). In such cases, your data is processed according to Stripe's Privacy Policy (https://stripe.com/en-sg/privacy). When you make a payment for our services on <a href="https://molecular-universe.ses.ai">https://molecular-universe.ses.ai</a>, Stripe receives your name, email address, billing address, organization, payment card information and transaction details. These data are shared solely for the purpose of payment processing and fraud prevention. The legal basis for processing these data are: 
              <ul style={{ marginLeft: '20px', marginBottom: '5px' }}>
                <li>GDPR: Article 6(1)(b) (contract performance) and Article 6(1)(f) (legitimate interests)</li>
                <li>CCPA/CPRA: Stripe is a service provider acting on our behalf and is contractually restricted from using your personal information for purposes other than those stated in <a href="https://stripe.com/en-sg/legal/dpa" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>Stripe's Data Processing Agreement</a>.</li>
              </ul>
            </li>
            <li>Stripe may transfer and process your personal data outside your country of residence, including to the United States. These transfers are protected by Standard Contractual Clauses and other safeguards included in <a href="https://stripe.com/en-sg/legal/dpa" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>Stripe's Data Processing Agreement</a>.</li>
            <li>Demographic information, including your gender, age, and interests;</li>
            <li>Other data collected that could directly or indirectly identify you.</li>
          </ul>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Information Collected Through Automated Means</h3>
          <p style={{ marginBottom: '15px' }}>As discussed further below in the "Analytics/Cookies/Tracking Technologies" section, we, and our service providers, may use a variety of technologies, including cookies, to assist in this information collection. The general categories of your information that we collect through automated means may include, but are not limited to:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Information about your access to and use of the Sites and emails, such as your IP address, browser language, the state or country from which you accessed the Services, software and hardware attributes (including device IDs, operating system, and browser type), referring and exit URLs, the links you click and files you download, pages viewed and the order of those pages, the amount of time spent on particular pages, the terms you use in searches on our websites, the date and time you accessed our websites or opened our emails, and other similar information;</li>
            <li>Internet or other electronic network activity information;</li>
            <li>Information when you use our Services;</li>
            <li>Information about your location, including general location information (such as your IP address and ZIP code).</li>
          </ul>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Information Collected Directly from Other Sources</h3>
          <p style={{ marginBottom: '15px' }}>The general categories of your information that we collect directly from others may include, but are not limited to:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Information you make public: We collect or obtain your information that you manifestly choose to make public, including via social media (e.g., hashtags, contents, communications, comments, photos, video);</li>
            <li>Interaction information: If you interact with any third-party content on a Site (including third party plugins and cookies), we may receive your information from the relevant third-party provider of that content;</li>
            <li>Third party information: We collect or obtain your information from third parties who provide it to us (e.g., credit reference agencies; law enforcement authorities; etc.);</li>
            <li>Other sources: we may receive information about you from other sources, such as business partners, marketers, researchers, analysts, social network services, and other parties to help us supplement our records.</li>
          </ul>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Analytics/Cookies/Tracking Technologies</h3>
          <p style={{ marginBottom: '15px' }}>We may use third-party web analytics services on the Services, such as those of Google Analytics. These service providers use the sort of technology described in this section to help us analyze how individuals use the Services, including by noting the third-party website from which you arrive. The information collected by the technology will be disclosed to or collected directly by these service providers, who use the information to evaluate your use of the Service.</p>
          
          <p style={{ marginBottom: '15px' }}>We may use cookies, web beacons, IP addresses, browser/canvas fingerprinting and other tracking technologies on our Sites and in our emails. Using tracking technologies allows us to provide benefits to you such as using cookies to identify you so we can suggest content that is likely more relevant to you, thereby saving you time while on our Sites. Tracking technologies can also enable us to track and target the interests of our users to enhance their experience on our Sites. Usage of tracking technologies is in no way linked to any personally identifiable information on our Sites. We also automatically collect data to measure website performance including metadata, log files, page load time, page linger time, click throughs and abandonments, network routing and server configurations. Much of the data collected is aggregated or statistical data about how visitors use our Sites and is not linked to your information.</p>
          
          <p style={{ marginBottom: '15px' }}>Do Not Track ("DNT") is a privacy preference that users can set in certain web browsers. We are committed to providing you with meaningful choices about the information collected on our websites for third-party purposes, and that is why we provide the variety of opt-out mechanisms listed below. Some web browsers offer users a "Do Not Track" privacy preference setting in the web browser. We do not currently recognize or respond to browser-initiated Do Not Track signals. <a href="https://fpf.org/thank-you-for-visiting-allaboutdnt-com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc', textDecoration: 'underline' }}>Learn more about Do Not Track.</a></p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>How We Use the Information We Collect</h3>
          <p style={{ marginBottom: '15px' }}>We may use the categories of your information described above for the following business or commercial purposes:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Maintain or service customer accounts;</li>
            <li>Provide customer service;</li>
            <li>Audit customer activity;</li>
            <li>Process or fulfill orders and transactions;</li>
            <li>Verify customer information;</li>
            <li>Provide advertising or marketing Services;</li>
            <li>Contact you about new products or Services and offers, promotional information, and other information we believe will be of interest to you (in accordance with any privacy preferences you have expressed to us);</li>
            <li>Provide products or Services updates;</li>
            <li>Improve the Services, including customization and personalization;</li>
            <li>Invite you to participate in promotions, sweepstakes, surveys, and provide feedback to us;</li>
            <li>Communicate with investors;</li>
            <li>Communicate with you about changes to legal policies;</li>
            <li>Secure the Services and investigate and help prevent fraud, security issues, and abuse;</li>
            <li>Understand, detect, and resolve problems with the Services and other issues being reported;</li>
            <li>Comply with contractual obligations;</li>
            <li>Comply with any procedures, laws, and regulations where necessary for our legitimate interests or legitimate interests of others;</li>
            <li>Establish, exercise, or defend our legal rights where necessary for our legitimate interests or the legitimate interests of others, including the enforcement of our legal and contractual rights, other usage policies and agreements, and other legal terms or controls, or to engage in other legal matters;</li>
            <li>Fulfill other requests with your consent and for any other purposes disclosed at the time you provide personal information.</li>
          </ul>
          <p style={{ marginBottom: '15px' }}>We may aggregate and/or de-identify any information collected through the Services so that such information can no longer be linked to you or your device ("Aggregated/De-Identified Information"). We may use Aggregated/De-Identified Information for any purpose, including without limitation for research and marketing purposes, and may also share such data with any third parties, including advertisers, promotional partners, and sponsors, in our sole discretion.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>With Whom We Share Information</h3>
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Affiliated entities</h4>
          <p style={{ marginBottom: '15px' }}>Your information may be shared with affiliated entities to deliver the Services, provide customer service, and operate our business.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Service providers</h4>
          <p style={{ marginBottom: '15px' }}>We use select third-party vendors to help us provide our Services and operate our business, and we may provide access to, or share your information with, these vendors. They provide a variety of services to us, including customer service, payment processing, shipping, sales and marketing, product design and development, data storage, security, fraud prevention, research, and legal services. These service providers are permitted to access and use your information for purposes of performing services for SES or to comply with applicable legal requirements.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Partners</h4>
          <p style={{ marginBottom: '15px' }}>We may share information about your interaction with our Services with our partners in relation to past or potential transactions and integrations.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Protection of SES and others</h4>
          <p style={{ marginBottom: '15px' }}>We may disclose the information we collect about you if required to do so by law or in a good faith belief that such disclosure is reasonably necessary to: (a) comply with legal process (for example, a subpoena or court order); (b) enforce our terms of service or sale, this Privacy Notice, or other contracts with you, including investigation of potential violations; (c) respond to claims that any content violates the rights of third parties; or (d) protect the rights, property, or personal safety of SES or others.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Business transfers</h4>
          <p style={{ marginBottom: '15px' }}>As we continue to develop our business, we may buy, merge, or partner with other companies. In such transactions, including in contemplation of such transactions, your information may be among the transferred assets. If a portion or all of SES's assets are sold or transferred to a third party, we may share or transfer your information as part of the transaction.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>With Your Consent or At Your Direction</h4>
          <p style={{ marginBottom: '15px' }}>We may share information with third parties when you direct us to do so or if you have consented to additional sharing of your information (including as set out in this Privacy Notice).</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>International Transfers</h4>
          <p style={{ marginBottom: '15px' }}>Your information may be transferred to, stored in, accessed from, or processed in the United States or other jurisdictions in which we or our service providers maintain facilities. You understand that these jurisdictions may have different data protection regimes than in the country in which you are located.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Legal Bases for Use of Your Information</h3>
          <p style={{ marginBottom: '15px' }}>The laws of some jurisdictions, including the European Economic Area and the United Kingdom, require that companies only process your "Personal Data" (as that term is defined in the applicable law, like the EU General Data Protection Regulation) if they have a legal basis (or justifiable need) for processing your Personal Data. To the extent those laws apply, our legal bases for processing Personal Data are as follows:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>To perform our obligations pursuant to a contract (or pending contract) with you. For example, we will process your Personal Data to enter into a contract with you, and to honor our commitments in any contracts that we have with you;</li>
            <li>For our legitimate interests or the legitimate interests of others. For example, we will process your Personal Data to: operate our business and our Services; identify and fix any issues with our Services; secure the Services; learn more about how our customers use the Services; perform internal analytics; improve the Services and users' experiences; conduct marketing; provide you with certain information about new products, special offers or other information that we think you may find interesting using the email address which you have provided in accordance with applicable law; make and receive payments; comply with legal requirements and defend our legal rights; prevent fraud; engage in a business change (e.g., sale, merger); and know the customer to whom we are providing Services;</li>
            <li>To comply with our legal obligations, such as our obligation to share data with tax authorities;</li>
            <li>With your consent. Where we rely on this basis, you have the right to withdraw your consent at any time as described in the "Your Access to, Choices and Rights with Respect to Your Information" section below.</li>
          </ul>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Your Access to, Choices and Rights with Respect to Your Information</h3>
          <p style={{ marginBottom: '15px' }}>You may instruct us not to use your information to contact you by email, postal mail, or phone regarding products, services, promotions, and special events that might appeal to your interests by contacting us by submitting your request via the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form. In commercial email messages, you can opt out by following the instructions located at the bottom of such emails. Removing your name from the email list may take a reasonable amount of time. Please note that, regardless of your request, we may still use and share certain information as permitted by this Privacy Notice or as required by applicable law. For example, you may not opt out of certain operational emails, such as those reflecting our relationship or transactions with you.</p>
          
          <p style={{ marginBottom: '15px' }}>Depending on where you live, you may have certain rights with respect to your information. For example, under local laws, including in the European Economic Area and the United Kingdom, and Canada, you may have some or all of the following rights:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>The right to access personal information we hold about you;</li>
            <li>The right to have any inaccurate personal information we hold about you corrected or updated;</li>
            <li>The right to object to our processing of your personal information or prevent the processing of your personal information for direct-marketing purposes;</li>
            <li>The right to withdraw your consent at any time if and to the extent we are relying on consent as the basis for processing your personal information;</li>
            <li>The right to restrict the use of your personal information;</li>
            <li>The right to have the personal information we hold about you deleted in certain circumstances; and</li>
            <li>The right to receive a copy of the personal information we hold about you and to request that we transfer it to a third party, with certain exceptions.</li>
          </ul>
          
          <p style={{ marginBottom: '15px' }}>To exercise your data protection rights or to receive more details in connection with them, you can submit requests via the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form. You may be required to provide additional information necessary to confirm your identity before we can respond to your request.</p>
          
          <p style={{ marginBottom: '15px' }}>We will consider all such requests and provide our response within the time period required by applicable law. Please note, however, that certain information may be exempt from such requests, for example if we need to keep the information to comply with our own legal obligations or to establish, exercise, or defend legal claims. Your rights and our responses will vary based on your state or country of residency. Please note that you may be in a jurisdiction where we are not obligated, or are unable, to fulfill a request. In such a case, your request may not be fulfilled. If you are a California resident (i.e., a "Consumer"), please see the "Privacy Information for California Residents" section below for information about your specific rights under California law.</p>
          
          <p style={{ marginBottom: '15px' }}>If applicable, you may make a complaint to your local data protection supervisory authority in the country where you are based. Alternatively, you may seek a remedy through local courts if you believe your rights have been breached.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Security</h3>
          <p style={{ marginBottom: '15px' }}>We take a variety of physical, technical, administrative, and organizational security measures to protect your information against accidental or unlawful destruction or accidental loss, alteration, unauthorized disclosure or access. However, no method of transmission over the Internet, and no means of electronic or physical storage, is absolutely secure. As such, you acknowledge and accept that we cannot guarantee the security of your information transmitted to, through, or on our Services or via the Internet and that any such transmission is at your own risk.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>How Long We Retain Your Information</h3>
          <p style={{ marginBottom: '15px' }}>We may retain your information we collect for as long as necessary to provide products or Services to you, to operate our business, to enable us to communicate with you, or to satisfy our legal or contractual obligations. The length of time for which we retain information depends on the purposes for which we collected and used it and/or as required to comply with applicable laws. Where required, we may anonymize or dispose of the information we collect.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Third Party Links and Features</h3>
          <p style={{ marginBottom: '15px' }}>Please be aware that third-party websites accessible or recommended through our Services may have their own privacy and data collection policies and practices. These links and features are provided for your reference and convenience only and do not imply any endorsement of information provided through these third-party links and features, nor any association with their operators. We are not responsible for any actions, content of websites, or privacy policies of such third parties. We urge you to read the privacy and security policies of these third parties.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Notification of Changes</h3>
          <p style={{ marginBottom: '15px' }}>Whenever material changes are made to our Privacy Notice, this page will be updated.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Contact Us</h3>
          <p style={{ marginBottom: '15px' }}>If you have any questions about this Privacy Notice, you should submit your request through the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Privacy Information for California Residents</h3>
          <p style={{ marginBottom: '15px' }}>Terms used in this section and not otherwise defined have the meaning given to them under the California Consumer Privacy Act ("CCPA"). Consistent with the requirements of the CCPA, this section provides additional information about our collection and use of your "personal information" and your choices with respect to such information. The information collected, the sources of that information, the purposes of use and the categories which we disclose for business purposes are set forth in the "Information We Collect", "How We Use the Information We Collect", and "With Whom We Share Information" sections above. We do not sell (as that term is defined under the CCPA) California residents' personal information. We do not sell the personal information of minors under 16 years of age. In the preceding 12 months, we may have disclosed the following categories of personal information to the following categories of recipients: Vendors (including data storage and hosting providers, email providers, payment processors, shipping vendors, marketing vendors, IT support providers, CRM providers) may receive:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Personal Identifiers;</li>
            <li>Demographic Information;</li>
            <li>Commercial Information;</li>
            <li>Internet or other electronic network activity information;</li>
            <li>Inferences for use in creating a consumer profile.</li>
          </ul>
          
          <p style={{ marginBottom: '15px' }}>Partners (including sales and integration partners) may receive:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Personal Identifiers;</li>
            <li>Demographic Information;</li>
            <li>Commercial Information;</li>
            <li>Internet or other electronic network activity information;</li>
            <li>Inferences for use in creating a consumer profile.</li>
          </ul>
          
          <p style={{ marginBottom: '15px' }}>Consistent with the CCPA, we allow individuals to make requests about their personal information. Specifically, unless certain exceptions apply, you may request that we:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Inform you about the categories of personal information we collect or disclose about you; the categories of sources of such information; the business or commercial purpose for collecting your personal information; and the categories of third parties with whom we share/disclose personal information;</li>
            <li>Provide access to and/or a copy of certain personal information we hold about you;</li>
            <li>Delete certain personal information we have about you;</li>
            <li>Provide you with information about certain financial incentives that we offer to you, if any;</li>
            <li>We also do not discriminate or take adverse action against individuals who make requests about their personal information.</li>
          </ul>
          
          <p style={{ marginBottom: '15px' }}>We reserve the right to verify your identity before responding to a request, which may include, at a minimum, depending on the sensitivity of the information you are requesting and the type of request you are making, verifying your name, email address, phone number, or other information. You are also permitted to designate an authorized agent to submit certain requests on your behalf. In order for an authorized agent to be verified, you must provide the authorized agent with signed, written permission to make such requests or a power of attorney. We may also follow up with you to verify your identity before processing the authorized agent's request. Please note that certain information may be exempt from such requests, consistent with California law. For example, we must retain certain information in order to provide the Services to you or to comply with legal obligations. If you would like further information regarding requests for personal information or would like to make such a request, please submit your request through the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form.</p>
          
          <p style={{ marginBottom: '15px' }}>California "Shine the Light" Disclosure.
The California "Shine the Light" law gives residents of California the right under certain circumstances to opt out of the sharing of certain categories of personal information (as defined in the Shine the Light law) with third parties for their direct marketing purposes. We do not share your personal information with third parties for their own direct marketing purposes within the meaning of that law.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Privacy Information for Nevada Residents</h3>
          <p style={{ marginBottom: '15px' }}>Under Nevada law, certain Nevada consumers may opt out of the sale of "Personally Identifiable Information" for "Monetary Consideration" (as such terms are defined under Nevada law) to a person for that person to license or sell such information to others. We do not engage in such activity; however, if you are a Nevada resident who has purchased goods or services from us, you may submit a request to opt out of any future sales under Nevada law by submitting your request through the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form. Please note we may take reasonable steps to verify your identity and the authenticity of the request.</p>
          
          <h3 style={{ fontSize: '18px', marginTop: '20px', marginBottom: '10px' }}>Supplemental Privacy Notice for South Korea Residents</h3>
          <p style={{ marginBottom: '15px' }}>Pursuant to the Personal Information Protection Act of Korea ("PIPA"), this Supplemental Privacy Notice for South Korea Residents sets forth the matters on (i) third-party provision of personal information, (ii) outsourcing of personal information processing, (iii) personal information destruction procedure and methods, and (iv) privacy officers. This Supplemental Privacy Notice only applies to our processing of personal information of users in South Korea.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Provision of Personal Information to Third Parties</h4>
          <p style={{ marginBottom: '15px' }}>We process your personal information only within the scope of the disclosed purpose of personal information processing. In the event that we use a third party to process your personal information, we will obtain your consent or where permitted or required under law, statute, or regulation, including Articles 17 or 18 of the PIPA. Your personal information will not otherwise disclosed to a third party.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Outsourcing of Personal Information Processing</h4>
          <p style={{ marginBottom: '15px' }}>Unless otherwise stated in this Privacy Policy, we do not outsource the processing of your personal information to third-party service providers.</p>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Personal Information Destruction Process and Methods</h4>
          <p style={{ marginBottom: '15px' }}>We destroy your personal information without delay when your personal information becomes no longer necessary either because the retention period has expired or the disclosed purpose for personal information processing has been achieved. If the retention period expired or the disclosed purpose for processing has been achieved but we must continue to retain your personal information due to applicable laws, statutes, or regulations, we store and manage your personal information as a separate database.</p>
          
          <p style={{ marginBottom: '15px' }}>The destruction process and method is as follows:</p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>We select personal information for which the grounds of destruction have been met and destroy such selected information pursuant to the approval of our privacy officer.</li>
            <li>We destroy personal information recorded and stored in the form of electronic files so that records cannot be reproduced, and the personal information printed on paper is either shredded or incinerated.</li>
          </ul>
          
          <h4 style={{ fontSize: '16px', marginTop: '15px', marginBottom: '10px' }}>Privacy Officer</h4>
          <p style={{ marginBottom: '15px' }}>We have a designated privacy officer to oversee data privacy-related issues and to handle complaints and requests related to the processing of the personal information of users. If you have any questions, requests or complaints arising out of our services, you can contact our privacy officer through the <a href="https://www.ses.ai/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a> form.</p>
        </div>
      </div>
    </div>
  );
};

// About Page component
const AboutPage = ({ handleNavigation, activePage }) => {
  
  // Add useEffect to set up smooth scrolling
  useEffect(() => {
    // Get the content wrapper element
    const contentWrapper = document.querySelector('.about-content-wrapper');
    if (contentWrapper) {
      // Set initial scroll position to top
      contentWrapper.scrollTop = 0;
    }
  }, []);

  return (
    <div className="about-container" style={{ display: 'flex', width: '93%', paddingLeft: '0' }}>
      {/* Left navigation column */}
      <div className="about-text-section left-text" style={{ width: '7%', overflowY: 'auto', padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '0 8px 8px 0', marginLeft: '8px', marginRight: '20px' }}>
        <h1 
          style={{ 
            textDecoration: 'none',
            color: 'rgb(51, 51, 51)',
            fontSize: '9.5px',
            transition: 'font-size 0.3s',
            cursor: 'pointer',
            marginBottom: '12px',
            fontWeight: 'normal'
          }}
          onClick={() => {
            if (activePage === 'about') {
              // Already on the about page, just scroll to the top
              const contentWrapper = document.querySelector('.about-content-wrapper');
              if (contentWrapper) {
                contentWrapper.scrollTop = 0;
              }
            } else {
              // Navigate to about page first, then scroll
              handleNavigation('about');
              setTimeout(() => {
                const contentWrapper = document.querySelector('.about-content-wrapper');
                if (contentWrapper) {
                  contentWrapper.scrollTop = 0;
                }
              }, 100);
            }
          }}
          onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
          onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
        >
          Motivation
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          <a 
            href="#features" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '9.5px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
            onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('about');
              setTimeout(() => {
                const featuresSection = document.getElementById('features-section');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
          >
            Features
          </a>
          <a 
            href="#pricing" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '9.5px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
            onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('pricing');
            }}
          >
            Pricing
          </a>
          <a 
            href="#news" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '9.5px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
            onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('about');
              setTimeout(() => {
                const newsfeedSection = document.getElementById('newsfeed');
                if (newsfeedSection) {
                  newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
          >
            News Feed
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="about-content-wrapper" style={{ width: '85%' }}>
        <div className="about-content">
          <img src="/MakeContact.png" alt="Make Contact" style={{ width: '100%', marginBottom: '20px' }} />
          
          <p style={{ fontStyle: 'italic', marginBottom: '5px' }}>"If it's just us, it seems like an awful waste of space."</p>
          <p style={{ fontStyle: 'italic', marginBottom: '50px' }}>Contact, 1997</p>
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontWeight: 'bold' }}>What is Molecular Universe?</p>
            <p>Much like Magellan first made contact with the stars as navigation tools;</p>
            <p>Or how the Hubble Telescope made contact with galaxies far, far away;</p>
            <p>Or the Human Genome Project looked deep inside our DNA and made contact with every microscopic amino acid that defines our genetic code;</p>
            <p>SES AI has made contact with a never-before-seen 512-dimensional universe of small molecules - mapped into a 2-dimensional searchable tool - the Molecular Universe. The intent of this new map is to help battery researchers and accelerate the discovery of new materials for their next big ideas.</p>
            
            <p>The unique and fundamental advantages of Molecular Universe include:</p>
            <ol style={{ paddingLeft: '20px' }}>
              <li><strong>The Map:</strong> A vast and constantly growing database of small molecules suitable for battery applications and their properties, both experimentally measured and computationally predicted.</li>
              <li><strong>The Navigation System:</strong> A proprietary, battery-specific LLM, carefully trained on thoroughly curated battery literature and teachings from world-class battery experts.</li>
              <li><strong>The Interface:</strong> An intuitive user interface linking the Map and Navigation System, making battery material discovery straightforward and simple.</li>
            </ol>
            
            <p>Currently at 10<sup>8</sup> small molecules, Molecular Universe is still in its infancy but expanding rapidly towards its target of 10<sup>11</sup> in size (in terms of actual numbers, that's 100 billion versus 100 million). The Navigation System is also undergoing consistent QA and upgrades, so it can perform as an almost living, breathing partner focused on accurately helping you find the perfect molecules for your vision.</p>
            <p>And like all AI-based technologies, with your help, we can improve Molecular Universe together, faster.</p>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <p style={{ fontWeight: 'bold' }}>Why are we building Molecular Universe?</p>
            <p>There's one simple, undeniable truth: There is no such thing as the perfect, one-size-fits-all battery. Especially not with the advent of an all-electric future.</p>
            <p>That's why at SES AI, we've always sought to develop electrolytes for various practical battery chemistries including Li-Metal, high silicon Li-ion, and LFP Li-ion - for use across everything from drones to robotics, electric cars to urban air mobility, and grid storage to consumer electronics.</p>

            <p style={{ fontWeight: 'bold' }}>Battery Technology Starts with Small Molecules</p>
            <img src="/funnel.png" alt="Molecule Funnel" style={{ width: '100%', marginBottom: '20px' }} />
            <p>In the battery world, it all comes down to small molecules.</p>
            <p>While the universe of molecules is infinite, the universe of small molecules is not. It's measurable. In fact, we know that there are 10<sup>60</sup> possible small molecules in the universe. Of these, 10<sup>11</sup> could be used for batteries. And of those, less than 1,000 have been studied for batteries in the past 30 years.</p>
            <p>So, we have only mapped one hundred millionth of the possible database. If that's all we need, it seems like an awful waste of molecules.</p>
            <p>Do we not want to know what's out there that could double, triple, or even quadruple the cycle life of LFP Li-ion, high silicon Li-ion, Li-Metal, and more?</p>
            
            <p style={{ fontWeight: 'bold' }}>The Target is Set: 10<sup>11</sup> Small Molecules</p>
            <p>The mission is clear: Map the physical and chemical properties of our database of 10<sup>11</sup>.</p>
            <p>Arriving at this goal required intense computational power. Originally, we considered establishing a non-profit organization <a href="https://www.molecularuniverse.org/" target="_blank" rel="noopener noreferrer">Molecular Universe</a> to crowdsource public computing resources and eventually open-source the database. However, we found a better solution.</p>
            <p>It was far more efficient to commercially procure GPUs and collaborate with Nvidia on GPU-accelerated computation chemistry software. While we will not open-source our proprietary database, we will make Molecular Universe free to academic researchers and open-source certain aspects of our models wherever appropriate.</p>
            
            <p style={{ fontWeight: 'bold' }}>More About Molecular Universe, MU-0</p>
            <p>In our launch version of Molecular Universe, the Map consists of 10<sup>8</sup> molecules and their molecular properties, including both actual experimental data and computational prediction based on Density Function Theory and Molecular Dynamics simulations.</p>
            <p>This is the world's largest database of small molecule properties. And it will continue to grow to include more organic and inorganic molecules and more bulk and interphasial properties, suitable for additives, or salts, or solvents.</p>
            <p>The molecules are represented on a map through a dimension-reduction data visualization technique called UMAP (Uniform Manifold Approximation and Projection). AI sees each molecule in 512 dimensions, but for us mere mortals, UMAP reduces them to a more navigable 2 Dimensions.</p>
            <p>The Navigation System consists of an LLM that was based on the LLaMa 3 70B (largest open source LLM at the time) but trained using our proprietary database of literature and domain expert knowledge. While LLaMa 3 70B may not be the highest ranked model for scientific questions, once trained, our battery specific LLM ranks just as high and even higher in certain categories compared to much larger models. This improvement delta is very exciting, and in future MU versions, we expect to release newer battery-specific LLM trained on more advanced and larger open-source models.</p>
            
            <p>We invite you to join us on this journey and be part of the mission.</p>
            <p><strong>Make contact with the Molecular Universe.</strong></p>
          </div>
                    
          <h2 id="features-section">Features of Molecular Universe</h2>
          
          <h3>Map</h3>
          
          <p>
            Visualize millions of molecules on an interactive 2D map built using UMAP (Uniform Manifold Approximation and Projection)—a machine learning algorithm that turns high-dimensional chemical structure data into an intuitive, searchable map. Each point is a molecule embedded by its structure, and clusters represent chemical families. It's like Google Maps, but for chemistry: zoom into "neighborhoods" of similar molecules and uncover hidden gems. The MU-0 map features 23 molecular clusters and counting, and is the world's largest database of small molecules and battery-related properties.
          </p>

          <h3>Ask</h3>
          
          <p>
            Now that you have the map, you need a navigation system. Ask is the navigation system that allows you to ask your questions in natural language. You can be general such as "recommend an electrolyte for LiFePO4 and graphite cell" or be specific such as "recommend an electrolyte that is nonflammable and stable at high voltage 4.55V and can do 6C fast charge in a Li-ion cell with NCM811 cathode and silicon anode".
          </p>
          
          <p>
            It answers by recommending novel approaches that can address your challenge. The answer includes relevant formulations and molecules (solvents, additives and salts). It then searches these molecules in the Map and finds molecules with similar properties. Ask links cell-level, formualtion-level and molecule-level intelligence.
          </p>

          <h3>Search</h3>
          
          <p>
            You can enter a "molecules-of-interest", it finds its location on the map, and recommends its "friends", which are other molecules with similar properties but might be located nearby or faraway on the map. This helps users broaden their horizon for possible molecules with similar properties. Search molecules in two powerful ways:
          </p>
          <ol style={{paddingLeft: '20px'}}>
            <li>By SMILES – Input a canonical SMILES string and instantly retrieve all key info.</li>
            <li style={{color: 'black'}}>By molecule's name – input a molecule name such as "ethylene carbonate".</li>
            <li>By natural language – Ask questions like: "Find 5 molecules with LUMO above -1 eV and HOMO below -7 eV."</li>
          </ol>
          <p style={{color: 'black'}}>
            Each result comes with a Molecule Info Card. Molecule's friends will be displayed checking the "Find Friends" <a>box</a> :
          </p>
          <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
            <li>Discover molecules that are structurally similar with similar properties (great for refinement),</li>
            <li>Or find structurally diverse options that still have similar properties (great for exploration).</li>
          </ul>
          <p>
            <span style={{color: 'black'}}>The "friend" molecules will be displayed in order of similarity—based specifically on their chemical and physical properties—from most to least similar.</span> This balances exploration and exploitation—helping you expand possibilities while staying grounded in what works.
          </p>
          
          <h3>Filter</h3>
          
          <p>
            Need molecules with specific traits? Our property filters let you zero in on candidates with desirable features. All property values have been either measured in the lab or computed using traditional methods or predicted using AI/ML.
          </p>
          <ul style={{listStyleType: 'disc', paddingLeft: '20px'}}>
            <li><strong>HOMO / LUMO:</strong> These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.</li>
            <li><strong>ESP Min / Max:</strong> Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.</li>
            <li><strong>Functional Groups:</strong> Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.</li>
          </ul>
          <p>
            You can even overlay your filtered molecules directly on the UMAP to visually explore chemical regions (molecular ) that meet your criteria.
          </p>
          
          <div id="newsfeed" className="feature-section">
            <h3>Newsfeed</h3>
            <p>April 29, 2025: Molecular Universe MU-0 is released to public</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Redeem Code component for team members
const RedeemPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [voucher, setVoucher] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('voucher', voucher);

      const response = await fetch(`${API_URL}/redeem`, {
        method: 'POST',
        body: formData,
      });

      // Rich error handling
      if (!response.ok) {
        let errorMsg = 'Voucher redemption failed';
        try {
          // Most FastAPI errors are JSON { detail: "…" }
          const dataErr = await response.clone().json();
          if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
        } catch {
          try {
            // Fallback: plain‑text body
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch { /* ignore */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuccess(data.message || 'Account created successfully. Check your inbox for a temporary password.');
      
      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setUsername('');
      setEmail('');
      setVoucher('');
    }
    catch (err) {
      console.error('Redemption error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
          <h2>Redeem Team Code</h2>
          <p>Join your team on the Molecular Universe platform</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="voucher">Team Code</label>
            <input
              type="text"
              id="voucher"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Enter your team code"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Redeem Code'}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/login'); window.location.reload(); }}>Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

// Forgot Password component for password reset
const ForgotPasswordPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('email', email);

      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        body: formData,
      });

      // Rich error handling
      if (!response.ok) {
        let errorMsg = 'Password reset request failed';
        try {
          // Most FastAPI errors are JSON { detail: "…" }
          const dataErr = await response.clone().json();
          if (dataErr && dataErr.detail) errorMsg = dataErr.detail;
        } catch {
          try {
            // Fallback: plain‑text body
            const textErr = await response.text();
            if (textErr) errorMsg = textErr;
          } catch { /* ignore */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setSuccess(data.message || 'If your information matches our records, a password reset email will be sent.');
      
      // Clear form after successful submission
      setFirstName('');
      setLastName('');
      setEmail('');
    }
    catch (err) {
      console.error('Password reset request error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
          <h2>Forgot Password</h2>
          <p>Enter your details to reset your password</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>Remembered your password? <a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/login'); window.location.reload(); }}>Sign In</a></p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [graphData, setGraphData] = useState([]);
  const [filteredGraphData, setFilteredGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activePage, setActivePage] = useState('map');
  const [searchResults, setsearchResults] = useState(null);
  const [lastSearch, setLastSearch] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchWarning, setSearchWarning] = useState(null);
  const [searchedMolecules, setsearchedMolecules] = useState(null);
  const [similarMolecules, setSimilarMolecules] = useState(null);
  const [highlightedSimilarMolecules, setHighlightedSimilarMolecules] = useState(null);
  const [similarMoleculeImages, setSimilarMoleculeImages] = useState({}); // Add state for similar molecule images
  const [findClosestFriends, setFindClosestFriends] = useState(false);
  
  // Enterprise search state lifted up
  const [enterprisesearchResults, setEnterprisesearchResults] = useState(null);
  const [enterpriseSearchLoading, setEnterpriseSearchLoading] = useState(false);
  const [enterpriseSearchError, setEnterpriseSearchError] = useState(null);
  const [includeRelatives, setIncludeRelatives] = useState(false);
  
  // Chat state (moved from ChatbotInterface)
  const [chatMessages, setChatMessages] = useState([
    { type: "system-message", text: "Welcome to the Molecular Universe. How can I help you today?" }
  ]);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState('research');
  
  
  // New filter implementation with range values
  const [filterRanges, setFilterRanges] = useState({
    molwt: { min: 0, max: 1000, range: [0, 1000], active: false },
    homo_eV: { min: -10, max: 0, range: [-10, 0], active: false },
    lumo_eV: { min: -5, max: 5, range: [-5, 5], active: false },
    esp_max_eV: { min: -2, max: 2, range: [-2, 2], active: false },
    esp_min_eV: { min: -2, max: 0, range: [-2, 0], active: false },
    predicted_mp: { min: 0, max: 300, range: [0, 300], active: false },
    predicted_bp: { min: 0, max: 300, range: [0, 300], active: false }
  });
  
  // Add state for functional group filter
  const [selectedFunctionalGroup, setSelectedFunctionalGroup] = useState('');
  
  // Labels for filters
  const filterLabels = {
    molwt: "Molecular Weight",
    homo_eV: "HOMO (eV)",
    lumo_eV: "LUMO (eV)",
    esp_max_eV: "Max ESP (eV)",
    esp_min_eV: "Min ESP (eV)",
    predicted_mp: "Predicted Melting Point (°C)",
    predicted_bp: "Predicted Boiling Point (°C)"
  };
  const filterLabelsRef = useRef(filterLabels);
  
  // Add global CSS styles for containers
  useEffect(() => {
    // Add global styles for proper container sizing and scrolling
    const style = document.createElement('style');
    style.textContent = `
      .App {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
      }
      
      .main-container {
        flex: 1;
        overflow: auto;
        display: flex;
        flex-direction: column;
      }
      
      .App-header, .navbar {
        flex-shrink: 0;
      }
      
      .enterprise-page {
        width: 100%;
        height: 100%;
        overflow-y: auto;
      }
      
      .enterprise-container {
        height: auto;
        min-height: 100%;
        padding: 0 20px;
      }
      
      .enterprise-content {
        padding-bottom: 80px;
      }
      
      .search-container, .about-container, .chatbot-container {
        height: 100%;
        overflow: auto;
      }
      
      .graph-container {
        height: 100%;
        min-height: 400px;
      }
      
      .enterprise-molecule img {
        max-width: 100%;
        max-height: 500px;
        object-fit: contain;
      }
      
      .enterprise-results {
        margin-top: 20px;
      }
      
      @media (max-height: 800px) {
        .enterprise-umap-container {
          height: 400px !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Use refs to avoid dependency issues in useEffect
  const filterRangesRef = useRef(filterRanges);
  useEffect(() => {
    filterRangesRef.current = filterRanges;
  }, [filterRanges]);
  
  const MAX_NODES = 35000;

  // Add new state for highlighted molecule
  const [highlightedMolecules, setHighlightedMolecules] = useState(null);
  const [arrowOffset, setArrowOffset] = useState(-40);
  
  // Track Plotly initialization state
  const [searchPlotInitialized, setSearchPlotInitialized] = useState(false);
  const [mainPlotInitialized, setMainPlotInitialized] = useState(false);
  
  // Ref for plots to check if they're initialized
  const plotlyRef = useRef(null);
  const searchPlotlyRef = useRef(null);
  
  // Add bouncing arrow animation when molecule is highlighted
  // useEffect(() => {
  //   if (!highlightedMolecules || !searchPlotInitialized) return;
    
  //   let direction = -1; // Start moving up
  //   let current = -40;
  //   const min = -60;
  //   const max = -30;
    
  //   const interval = setInterval(() => {
  //     current += direction * 2;
      
  //     if (current <= min) {
  //       direction = 1; // Change to moving down
  //     } else if (current >= max) {
  //       direction = -1; // Change to moving up
  //     }
      
  //     setArrowOffset(current);
  //   }, 50);
    
  //   return () => clearInterval(interval);
  // }, [highlightedMolecules, searchPlotInitialized]);
  
  const plotlyLayout = {
    autosize: true,
    height: 600,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
    font: {
      family: 'Arial, sans-serif',
      size: 12,
      color: '#333'
    },
    xaxis: { showgrid: false, zeroline: false, visible: false },
    yaxis: { showgrid: false, zeroline: false, visible: false },
    showlegend: false,
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: '#000',
      bordercolor: '#333',
      font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#fff'
      }
    }
  };
  
  // Create search mode layout with annotations when needed
  const searchLayout = useMemo(() => {
    const layout = {
      ...plotlyLayout,
      autosize: true,
      height: null,
      width: null
    };
  
    let annotations = [];
  

    // Add annotations for highlighted similar molecules (using UMAP_0 and UMAP_1)
    if (highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0) {
      annotations = annotations.concat(
        highlightedSimilarMolecules
          .filter(molecule => 
            molecule.UMAP_0 !== null && 
            molecule.UMAP_0 !== undefined && 
            molecule.UMAP_1 !== null && 
            molecule.UMAP_1 !== undefined
          )
          .map((molecule, idx) => ({
            x: molecule.UMAP_0,
            y: molecule.UMAP_1,
            xref: 'x',
            yref: 'y',
            text: `#${idx + 1}`,
            showarrow: true,
            arrowhead: 2,
            arrowsize: 1.5,
            arrowwidth: 2,
            arrowcolor: '#FFD700',
            ax: 0,
            ay: arrowOffset,
            bgcolor: 'rgba(255, 255, 0, 0.8)',
            bordercolor: '#FFD700',
            borderwidth: 2,
            borderpad: 4,
            font: {
              color: 'black',
              size: 12
            }
          }))
      );
    }

    // Add annotations for standard highlighted molecules (using x & y)
    if (highlightedMolecules && highlightedMolecules.length > 0) {
      annotations = annotations.concat(
        highlightedMolecules.map(molecule => ({
          x: molecule.x,
          y: molecule.y,
          xref: 'x',
          yref: 'y',
          text: 'Searched Molecule',
          showarrow: true,
          arrowhead: 2,
          arrowsize: 1.5,
          arrowwidth: 2,
          arrowcolor: '#FF5722',
          ax: 0,
          ay: arrowOffset,
          bgcolor: 'rgba(255, 87, 34, 0.8)',
          bordercolor: '#FF5722',
          borderwidth: 2,
          borderpad: 4,
          font: {
            color: 'white',
            size: 12
          }
        }))
      );
    }
      
  
    if (annotations.length > 0) {
      layout.annotations = annotations;
    } else if (searchResults) {
      // Remove default annotation since we don't want to show anything for molecules with null coordinates
      layout.annotations = [];
    }
    return layout;
  }, [plotlyLayout, highlightedMolecules, highlightedSimilarMolecules, searchResults, arrowOffset]);

  const plotlyConfig = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'toggleHover']
  };

  // We've removed the dropdown functionality, so we don't need this effect anymore
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setShowDropdown(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, []);

  // Update handleSearch function
  const handleSearchedMolecules = async (response, select_first = false) => {
    let formattedMolecules = null;
    try {
      const data = await response.json();
      if (data.found) {
        if (data.molecule_details && data.molecule_details.length > 0) {
          formattedMolecules = data.molecule_details.map((mol) => {
            return {
              smiles: mol.SMILES,
              x: mol.UMAP_0,
              y: mol.UMAP_1,
              properties: {
                molwt: mol.MOLECULAR_WEIGHT,
                homo_eV: mol.HOMO,
                lumo_eV: mol.LUMO,
                esp_min_eV: mol.ESP_MIN,
                esp_max_eV: mol.ESP_MAX,
                functional_groups: mol.FUNCTIONAL_GROUPS,
                predicted_mp: mol.PREDICTED_MP,
                predicted_bp: mol.PREDICTED_BP,
                chemical_formula: mol.CHEMICAL_FORMULA,
                CLUSTER: mol.CLUSTER
              },
              image: mol.image,
              rawData: mol
            };
          });
          if (select_first) {
            // Only store the first molecule (as a list of one) and its image
            const formattedMolecule = formattedMolecules[0];
            setsearchedMolecules([formattedMolecule]);
            setsearchResults([formattedMolecule.image]);
            if (formattedMolecule.x !== null && formattedMolecule.y !== null && 
                formattedMolecule.x !== undefined && formattedMolecule.y !== undefined) {
              setHighlightedMolecules([formattedMolecule]);
            }
          } else {
            // Store all molecules and their images
            setsearchedMolecules(formattedMolecules);
            setsearchResults(formattedMolecules.map((mol) => mol.image));
            // Filter molecules to only include those with x and y values defined and not null
            const highlighted = formattedMolecules.filter(
              (mol) => mol.x !== null && mol.y !== null && 
                       mol.x !== undefined && mol.y !== undefined
            );
            if (highlighted && highlighted.length > 0) {
              setHighlightedMolecules(highlighted);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing searched molecules:', error);
    }
    return formattedMolecules;
  };

  const handleSearch = async (searchInput) => {
    if (!searchInput.trim()) return;

    // Attach JWT so /search and /find‑friend‑with‑image stay protected
    const token = localStorage.getItem('token');

    setSearchLoading(true);
    setSearchWarning(null);
    setSearchError(null);
    setsearchResults(null);
    setsearchedMolecules(null);
    setHighlightedMolecules(null);
    setSimilarMolecules(null);
    setHighlightedSimilarMolecules(null);
    setSimilarMoleculeImages({}); // Reset similar molecule images

    try {
      // Determine which endpoint to use based on user permissions
      let searchEndpoint = `${API_URL}/search`;
      if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
        searchEndpoint = `${API_URL}/search-35`;
      }

      // Fetch the searched molecule's properties 
      const moleculeResponse = await authFetch(`${searchEndpoint}?query=${encodeURIComponent(searchInput.trim())}`);

      console.log(moleculeResponse);
      const formattedMolecules = await handleSearchedMolecules(moleculeResponse);
      console.log(formattedMolecules);
      console.log(searchedMolecules);
      if (formattedMolecules && findClosestFriends) {
        // check if formattedMolecules has length > 1 - if so display warning
        if (formattedMolecules.length > 1) {
          setSearchWarning('Multiple molecules found matching your search criterion. Find friends disabled.');
        } else {
          const formattedMolecule = formattedMolecules[0];

          // Then fetch similar molecules
          let friendUrl = `${API_URL}/find-friend-with-image?smiles=${encodeURIComponent(formattedMolecule.smiles.trim())}`;
          
          // Add use_35m parameter for users with admin, enterprise, or joint permissions
          if (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') {
            friendUrl += '&use_35m=true';
          }
          
          const response = await authFetch(friendUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch similar molecules: ${response.statusText}`);
          }
          const data = await response.json();
          const molecules = data.similar_molecules;
          setSimilarMolecules(molecules);

          const highlighted = molecules.filter(
            (mol) => mol.UMAP_0 !== undefined && mol.UMAP_1 !== undefined
          );
          if (highlighted.length > 0) {
            setHighlightedSimilarMolecules(highlighted);
          }
          
          
          // Fetch molecule visualizations for all similar molecules
          const imageResults = molecules.map((molecule, index) => {
            const moleculeImageUrl = molecule.image;
            return { index, imageUrl: moleculeImageUrl };
          });
          
          // Create a map of molecule index to image URL
          const imageMap = {};
          imageResults.forEach(result => {
            if (result.imageUrl) {
              imageMap[result.index] = result.imageUrl;
            }
          });
          
          setSimilarMoleculeImages(imageMap);
          // TODO: Update UMAP with friends
        } 
      }
    } catch (apiError) {
      console.error('Error checking Snowflake database:', apiError);
    } finally {
      setSearchLoading(false);
      setLastSearch(searchInput);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('permissions');
    setIsAuthenticated(false);
  };

  // Update useEffect for route handling
  useEffect(() => {
    const handleRouteChange = () => {
      if (authLoading) return;
      const path = window.location.pathname;
      
      // If not authenticated, allow access to About, Map, and Pricing pages
      if (!isAuthenticated) {
        if (path === '/about' || path === '/' || path === '/map' || path === '/pricing' || path === '/terms' || path === '/redeem' || path === '/password-reset') {
          // Set appropriate active page
          if (path === '/about') {
            setActivePage('about');
          } else if (path === '/pricing') {
            setActivePage('pricing');
          } else if (path === '/terms') {
            setActivePage('terms');
          } else if (path === '/redeem') {
            setActivePage('redeem');
          } else if (path === '/password-reset') {
            setActivePage('password-reset');
          } else {
            setActivePage('map');
          }
        } else {
          // Redirect to login for any other route
          redirectToLogin();
          setActivePage('login');
        }
        return;
      }

      // For authenticated users, handle routes based on permissions
      if (path === '/login' || path === '/redeem') {
        // Redirect to root if already authenticated
        window.history.pushState({}, '', '/');
        setActivePage('about');
      } else if (path === '/about') {
        setActivePage('about');
      } else if (path === '/reset-password') {
        // Show password reset page
        setShowPasswordReset(true);
      } else if (path === '/password-reset') {
        // Show forgot password page
        setActivePage('password-reset');
      } else if (path === '/pricing') {
        setActivePage('pricing');
      } else if (path === '/terms') {
        setActivePage('terms');
      } else if (path === '/') {
        // Always set to map when on the root path
        setActivePage('map');
      } else {
        // Redirect any other route to root
        window.history.pushState({}, '', '/');
        // Keep the current active page
      }
    };

    // Initial route check
    handleRouteChange();

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isAuthenticated, userPermissions, authLoading]);

  // Update handleSignIn to use proper navigation
  const handleSignIn = () => {
    redirectToLogin();
    setActivePage('login');
  };

  // Update handleNavigation to check permissions
  const handleNavigation = (page) => {
    if (!checkPageAccess(page)) {
      setActivePage('permissions-error');
      return;
    }
    
    // Set URL based on page
    if (page === 'pricing') {
      window.history.pushState({}, '', '/pricing');
    } else if (page === 'about') {
      window.history.pushState({}, '', '/about');
    } else if (page === 'terms') {
      window.history.pushState({}, '', '/terms');
    } else {
      // Keep the URL as root when navigating between other tabs
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    }
    
    // Reset filters when navigating away from explorer (filter) page
    if (activePage === 'explorer' && page !== 'explorer') {
      resetAllFilters();
      // Also reset functional group filter if it exists
      if (typeof setSelectedFunctionalGroup === 'function') {
        setSelectedFunctionalGroup('');
        const dropdown = document.querySelector('.functional-group-select');
        if (dropdown) dropdown.selectedIndex = 0;
      }
    }
    
    // Clear search results when navigating away from search page
    if (activePage === 'search' && page !== 'search') {
      setsearchResults(null);
      setsearchedMolecules(null);
      setHighlightedMolecules(null);
      setHighlightedSimilarMolecules(null);
      setSimilarMolecules(null);
      setSimilarMoleculeImages({});
      setSearchError(null);
      setLastSearch(null);
    }
    
    // Special case for enterprise (advanced search) tab
    if (page === 'enterprise' && activePage === 'search') {
      // First clear the search tab data
      setsearchResults(null);
      setsearchedMolecules(null);
      setHighlightedMolecules(null);
      setSearchError(null);
      // Then navigate to enterprise tab
      setActivePage(page);
      return;
    }
    
    setActivePage(page);
  };

  // Move checkPageAccess inside App component
  const checkPageAccess = (page) => {
    // Allow all users (including non-authenticated) to access the map page and pricing page
    if (page === 'map' || page === 'pricing' || page === 'terms') {
      return true;
    }
    
    // Research users can access About, Filter, Simple Search, and Chat pages
    if (userPermissions === 'research') {
      return ['about', 'explorer', 'search', 'chatbot'].includes(page);
    }
    
    // Admin users can access everything
    if (userPermissions === 'admin') {
      return true;
    }
    
    // Professional users can also access everything
    if (userPermissions === 'team') {
      return true;
    }

    if (userPermissions === 'explorer') {
      return true;
    }
    
    // Default to no access
    return false;
  };

  // Update PermissionsError component to show different messages based on user type
  const PermissionsError = () => {
    let message = '';
    let buttonText = '';
    let buttonAction = () => {};

    if (userPermissions === 'research') {
      message = 'This feature is only available for admin users. Please contact your administrator for access.';
      buttonText = 'View Pricing';
      buttonAction = () => {
        setActivePage('about');
        // Use setTimeout to ensure the about page has rendered before scrolling
        setTimeout(() => {
          const pricingImage = document.querySelector('.pricing-image');
          if (pricingImage) {
            pricingImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      };
    }

    return (
      <div className="permissions-error-container">
        <div className="permissions-error-content">
          <div className="lock-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Access Restricted</h2>
          <p>{message}</p>
          <button 
            className="upgrade-button"
            onClick={buttonAction}
          >
            {buttonText}
          </button>
        </div>
      </div>
    );
  };

  // Check authentication on load
  useEffect(() => {
    // Skip auth check on public auth/password routes
    const path = window.location.pathname;
    if (
      path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/redeem')
    ) {
      setAuthLoading(false);
      return;
    }
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const permissions = localStorage.getItem('permissions') || 'research';
      setUserPermissions(permissions);
      
      if (!token) {
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUsername(data.username);
          setUserPermissions(data.permissions || 'research');
          
          if (activePage === 'login') {
            setActivePage('map');
          }
          
          // Fetch user creation date and set up reset timer
          if (data.id) {
            try {
              const createdAtResponse = await fetch(`${API_URL}/created_at?id=${data.id}`);
              if (createdAtResponse.ok) {
                const createdAtData = await createdAtResponse.json();
                const createdAt = new Date(createdAtData.created_at);
                
                // Set up timer to reset query limit every 30 seconds after creation time
                const setupResetTimer = () => {
                  const now = new Date();
                  const createdAtTime = createdAt.getTime(); // Creation timestamp in ms
                  const elapsedMillis = now.getTime() - createdAtTime; // Time elapsed since creation
                  const intervalMillis = 30 * 1000; // 30 seconds in ms
                  
                  // Calculate time until next 30-second mark
                  const millisSinceLastInterval = elapsedMillis % intervalMillis;
                  const timeToNextReset = intervalMillis - millisSinceLastInterval;
                  
                  console.log(`Next query limit reset in ${timeToNextReset/1000} seconds`);
                  
                  // Set timeout to reset query limit at next 30-second mark
                  const resetTimeout = setTimeout(async () => {
                    try {
                      // Call reset endpoint
                      const resetResponse = await fetch(`${API_URL}/reset_user_limit?id=${data.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      
                      if (resetResponse.ok) {
                        const resetData = await resetResponse.json();
                        console.log('Query limit reset:', resetData);
                        setRemainingQueries(resetData.query_limit);
                        
                        // Setup next timer
                        setupResetTimer();
                      } else {
                        console.error('Failed to reset query limit');
                        // Try again after 30 seconds
                        setTimeout(setupResetTimer, intervalMillis);
                      }
                    } catch (error) {
                      console.error('Error resetting query limit:', error);
                      // Try again after 30 seconds
                      setTimeout(setupResetTimer, intervalMillis);
                    }
                  }, timeToNextReset);
                  
                  // Store timeout ID to clear on unmount
                  return resetTimeout;
                };
                
                // Initialize the timer
                const initialTimeoutId = setupResetTimer();
                
                // Clear timer on component unmount
                return () => {
                  if (initialTimeoutId) clearTimeout(initialTimeoutId);
                };
              }
            } catch (error) {
              console.error('Error fetching user creation date:', error);
            }
          }
          
          // Removed duplicate login redirect that was overriding the earlier one
          // Removed duplicate redirect to explorer;
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('permissions');
          setIsAuthenticated(false);
          setUserPermissions('research');
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setIsAuthenticated(false);
        setUserPermissions('research');
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, [API_URL, activePage]);

  useEffect(() => {
    async function loadData() {
      // Remove the isAuthenticated check to allow data loading for all users
      try {
        setLoading(true);
        // Replace CSV fetching with Snowflake API endpoint
        const response = await fetch(`${API_URL}/snowflake-query`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        
        // Map the data to our node structure with updated property names
        const nodes = data.data
          .filter(row => row && row.UMAP_0 !== undefined && row.UMAP_1 !== undefined && row.SMILES)
          .slice(0, MAX_NODES)
          .map((row, index) => ({
            id: index.toString(),
            x: Number(row.UMAP_0),
            y: Number(row.UMAP_1),
            smiles: row.SMILES,
            properties: {
              molwt: row.MOLECULAR_WEIGHT,
              homo_eV: row.HOMO_EV,
              lumo_eV: row.LUMO_EV,
              esp_min_eV: row.ESP_MIN_EV,
              esp_max_eV: row.ESP_MAX_EV,
              dipole_x: row.DIPOLE_X,
              dipole_y: row.DIPOLE_Y,
              dipole_z: row.DIPOLE_Z,
              functional_groups: row.FUNCTIONAL_GROUPS,
              predicted_mp: row.PREDICTED_MP,
              predicted_bp: row.PREDICTED_BP,
              chemical_formula: row.CHEMICAL_FORMULA,
              CLUSTER: row.CLUSTER
            },
            rawData: row
          }));
        
        setGraphData(nodes);
        setFilteredGraphData(nodes);
        
        // Log the number of nodes in the UMAP visualization
        console.log(`UMAP visualization loaded with ${nodes.length} nodes`);
        
        // Initialize filter ranges based on actual data
        const currentFilterRanges = filterRangesRef.current;
        const currentFilterLabels = filterLabelsRef.current;
        const newFilterRanges = { ...currentFilterRanges };
        Object.keys(currentFilterLabels).forEach(key => {
          const values = nodes
            .map(node => node.properties[key])
            .filter(v => v !== undefined && v !== null);
          if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            newFilterRanges[key] = {
              min: min,
              max: max,
              range: [min, max], // Initialize range to full data range (filter effectively off)
              active: false
            };
          }
        });
        setFilterRanges(newFilterRanges);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    // Remove the authentication check to load data for all users
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Change the dependency array to only run once on component mount

  // Apply filters based on range slider values and functional group
  useEffect(() => {
    if (graphData.length === 0) return;
    const filtered = graphData.filter(node => {
      // Check range filters
      for (const [property, range] of Object.entries(filterRanges)) {
        if (!range.active) continue;
        const nodeValue = node.properties[property];
        if (nodeValue !== undefined && nodeValue !== null && 
            (nodeValue < range.range[0] || nodeValue > range.range[1])) {
          return false;
        }
      }
      
      // Check functional group filter
      if (selectedFunctionalGroup) {
        if (!node.properties?.functional_groups || 
            !node.properties.functional_groups.includes(selectedFunctionalGroup)) {
          return false;
        }
      }
      
      return true;
    });
    if (JSON.stringify(filtered) !== JSON.stringify(filteredGraphData)) {
      setFilteredGraphData(filtered);
    }
  }, [graphData, filterRanges, selectedFunctionalGroup, filteredGraphData]);

  // Handle filter slider change
  const handleFilterChange = (property, newValue) => {
    setFilterRanges(prev => ({
      ...prev,
      [property]: {
        ...prev[property],
        range: newValue,
        active: true
      }
    }));
  };

  // Reset a specific filter
  const resetFilter = (property) => {
    setFilterRanges(prev => ({
      ...prev,
      [property]: {
        ...prev[property],
        range: [prev[property].min, prev[property].max],
        active: false
      }
    }));
  };

  // Reset all filters
  const resetAllFilters = () => {
    setFilterRanges(prev => {
      const newRanges = {};
      for (const [key, range] of Object.entries(prev)) {
        newRanges[key] = {
          ...range,
          range: [range.min, range.max],
          active: false
        };
      }
      return newRanges;
    });
  };

  // Handle clicks on Plotly points
  const handlePointClick = (data) => {
    if (!data.points || data.points.length === 0) return;
    const pointIndex = data.points[0].pointIndex;
    const node = filteredGraphData[pointIndex];
    if (node) {
      setSelectedNode(node);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Define a color mapping for clusters (23 distinct colors)
  const clusterColorMap = {
    1: '#1f77b4', // blue
    2: '#ff7f0e', // orange
    3: '#2ca02c', // green
    4: '#d62728', // red
    5: '#9467bd', // purple
    6: '#8c564b', // brown
    7: '#e377c2', // pink
    8: '#7f7f7f', // gray
    9: '#bcbd22', // olive
    10: '#17becf', // cyan
    11: '#aec7e8', // light blue
    12: '#ffbb78', // light orange
    13: '#98df8a', // light green
    14: '#ff9896', // light red
    15: '#c5b0d5', // light purple
    16: '#c49c94', // light brown
    17: '#f7b6d2', // light pink
    18: '#c7c7c7', // light gray
    19: '#dbdb8d', // light olive
    20: '#9edae5', // light cyan
    21: '#393b79', // dark blue
    22: '#637939', // dark green
    23: '#8c6d31'  // dark orange
  };
  
  // Default color for clusters not in the map
  const defaultColor = '#000000'; // black

  // Create search mode plotly data
  const searchPlotlyData = [{
    x: filteredGraphData.map(node => node.x),
    y: filteredGraphData.map(node => node.y),
    mode: 'markers',
    type: 'scattergl',
    marker: {
      size: 5,
      color: filteredGraphData.map(node => {
        if (highlightedMolecules && highlightedMolecules.some(molecule => molecule.smiles === node.smiles)) {
          return '#ff0000'; // Red color for highlighted molecule
        }
        // Color by cluster
        const clusterValue = node.properties?.CLUSTER;
        return clusterValue ? (clusterColorMap[clusterValue] || defaultColor) : defaultColor;
      }),
      opacity: filteredGraphData.map(node => {
        if (highlightedMolecules && highlightedMolecules.some(molecule => molecule.smiles === node.smiles)) {
          return 1; // Full opacity for highlighted molecule
        }
        return 0.7; // Default opacity
      })
    },
    hoverinfo: 'text',
    text: filteredGraphData.map(node => 
      `<b>Molecule Information:</b><br>` +
      `SMILES: ${node.smiles}<br>` +
      `${node.properties?.chemical_formula ? `Formula: ${node.properties.chemical_formula}<br>` : ''}` +
      `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(2) : 'N/A'}<br>` +
      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(2) : 'N/A'}<br>` +
      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(2) : 'N/A'}<br>` +
      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(2) : 'N/A'}<br>` +
      `${node.properties?.functional_groups ? `Groups: ${node.properties.functional_groups}<br>` : ''}` +
      `${node.properties?.predicted_mp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') ? `MP: ${node.properties.predicted_mp.toFixed(2)}°C<br>` : ''}` +
      `${node.properties?.predicted_bp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') ? `BP: ${node.properties.predicted_bp.toFixed(2)}°C<br>` : ''}` +
      `${node.properties?.CLUSTER !== undefined ? `Cluster: ${node.properties.CLUSTER}` : ''}`
    )
  }];

  // Add red dots at coordinates where arrows point to for highlighted molecules
  if (highlightedMolecules && highlightedMolecules.length > 0) {
    searchPlotlyData.push({
      x: highlightedMolecules.map(molecule => molecule.x),
      y: highlightedMolecules.map(molecule => molecule.y),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 8,
        color: '#FF0000',
        symbol: 'circle'
      },
      hoverinfo: 'none',
      showlegend: false
    });
  }

  // Add red dots for similar molecules (find friends)
  if (highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0) {
    const validMolecules = highlightedSimilarMolecules.filter(
      molecule => 
        molecule.UMAP_0 !== null && 
        molecule.UMAP_0 !== undefined && 
        molecule.UMAP_1 !== null && 
        molecule.UMAP_1 !== undefined
    );
    
    if (validMolecules.length > 0) {
      searchPlotlyData.push({
        x: validMolecules.map(molecule => molecule.UMAP_0),
        y: validMolecules.map(molecule => molecule.UMAP_1),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: 8,
          color: '#FF0000',
          symbol: 'circle'
        },
        hoverinfo: 'none',
        showlegend: false
      });
    }
  }

  // Create plotly data for explorer view
  const plotlyData = [{
    x: filteredGraphData.map(node => node.x),
    y: filteredGraphData.map(node => node.y),
    mode: 'markers',
    type: 'scattergl',
    marker: {
      size: 5,
      color: filteredGraphData.map(node => {
        // Color by cluster
        const clusterValue = node.properties?.CLUSTER;
        return clusterValue ? (clusterColorMap[clusterValue] || defaultColor) : defaultColor;
      }),
      opacity: 0.7
    },
    hoverinfo: 'text',
    text: filteredGraphData.map(node => 
      `<b>Molecule Information:</b><br>` +
      `SMILES: ${node.smiles}<br>` +
      `${node.properties?.chemical_formula ? `Formula: ${node.properties.chemical_formula}<br>` : ''}` +
      `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(2) : 'N/A'}<br>` +
      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(2) : 'N/A'}<br>` +
      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(2) : 'N/A'}<br>` +
      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(2) : 'N/A'}<br>` +
      `${node.properties?.functional_groups ? `Groups: ${node.properties.functional_groups}<br>` : ''}` +
      `${node.properties?.predicted_mp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') ? `MP: ${node.properties.predicted_mp.toFixed(2)}°C<br>` : ''}` +
      `${node.properties?.predicted_bp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') ? `BP: ${node.properties.predicted_bp.toFixed(2)}°C<br>` : ''}` +
      `${node.properties?.CLUSTER !== undefined ? `Cluster: ${node.properties.CLUSTER}` : ''}`
    )
  }];

  // Add red dots at coordinates where arrows point to for highlighted molecules in explorer view
  if (highlightedMolecules && highlightedMolecules.length > 0) {
    plotlyData.push({
      x: highlightedMolecules.map(molecule => molecule.x),
      y: highlightedMolecules.map(molecule => molecule.y),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: 8,
        color: '#FF0000',
        symbol: 'circle'
      },
      hoverinfo: 'none',
      showlegend: false
    });
  }

  // Add red dots for similar molecules (find friends) in explorer view
  if (highlightedSimilarMolecules && highlightedSimilarMolecules.length > 0) {
    const validMolecules = highlightedSimilarMolecules.filter(
      molecule => 
        molecule.UMAP_0 !== null && 
        molecule.UMAP_0 !== undefined && 
        molecule.UMAP_1 !== null && 
        molecule.UMAP_1 !== undefined
    );
    
    if (validMolecules.length > 0) {
      plotlyData.push({
        x: validMolecules.map(molecule => molecule.UMAP_0),
        y: validMolecules.map(molecule => molecule.UMAP_1),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: 8,
          color: '#FF0000',
          symbol: 'circle'
        },
        hoverinfo: 'none',
        showlegend: false
      });
    }
  }

  // Count how many filters are active
  const activeFilterCount = Object.values(filterRanges).filter(range => range.active).length;

  // Add state for query limits
  const [remainingQueries, setRemainingQueries] = useState(0);

  // Query limits are now managed on the server side

  // Add password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  
  // Add handlePasswordReset function here, before it's used
  const handlePasswordReset = () => {
    setShowPasswordReset(true);
    // Change URL to indicate password reset page
    window.history.pushState({}, '', '/reset-password');
  };
  
  // If authentication is still being checked, show loading spinner
  if (authLoading) {
    return <div className="app-loading">Loading...</div>;
  }
  
  // Modified condition to allow non-authenticated users to access the map page and pricing page
  if (!isAuthenticated && activePage !== 'about' && activePage !== 'map' && activePage !== 'pricing' && activePage !== 'terms' && activePage !== 'redeem' && activePage !== 'password-reset') {
    return <AuthPage />;
  }

  // Show redeem page if active
  if (activePage === 'redeem' && !isAuthenticated) {
    return <RedeemPage />;
  }

  // Show forgot password page if active
  if (activePage === 'password-reset' && !isAuthenticated) {
    return <ForgotPasswordPage />;
  }

  // Show password reset page if active
  if (showPasswordReset && isAuthenticated) {
    return (
      <div className="App" style={{ overflow: 'auto', height: '100vh' }}>
        <Navbar 
          activePage={activePage} 
          isAuthenticated={isAuthenticated} 
          username={username}
          onLogout={handleLogout}
          onSignIn={handleSignIn}
          onPasswordReset={handlePasswordReset}
          onNavigation={handleNavigation}
        />
        <PasswordReset />
      </div>
    );
  }

  return (
    <div className="App">
      {/* Navbar with conditional rendering */}
      <Navbar 
        activePage={activePage} 
        isAuthenticated={isAuthenticated} 
        username={username}
        onLogout={handleLogout}
        onSignIn={handleSignIn}
        onPasswordReset={handlePasswordReset}
        onNavigation={handleNavigation}
      />
      
      <header className="App-header">
        <div className="header-content">
          <div className="header-links">
          <a 
              href="/"
              className={`header-link ${activePage === 'map' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('map'); }}
            >
              Map
            </a>
            <a 
              href="/"
              className={`header-link ${activePage === 'chatbot' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('chatbot'); }}
            >
              Ask
            </a>
            <a 
              href="/"
              className={`header-link ${activePage === 'search' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('search'); }}
            >
              Search
            </a>
            <a 
              href="/"
              className={`header-link ${activePage === 'explorer' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('explorer'); }}
            >
              Filter
            </a>
          </div>
        </div>
        <div className="stats-container">
          {activePage === 'explorer' && (
            <>
              {/* <div>Showing: {filteredGraphData.length} of {graphData.length} nodes</div> */}
              {/* <div>Filters: {activeFilterCount} active</div> */}
              {/* {loading && <div>Loading...</div>} */}
            </>
          )}
        </div>
      </header>
      
      <div className="main-container">
        {activePage === 'permissions-error' ? (
          <PermissionsError />
        ) : activePage === 'explorer' ? (
          <>
            <div className="explorer-container" style={{ display: 'flex', height: '100%', paddingLeft: '0', paddingTop: '20px' }}>
              <div className="about-text-section left-text" style={{ width: '7%', overflowY: 'auto', padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '0 8px 8px 0', marginLeft: '0', marginRight: '20px' }}>
                <h1 
                  style={{ 
                    textDecoration: 'none',
                    color: 'rgb(51, 51, 51)',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontWeight: 'normal'
                  }}
                  onClick={() => {
                    if (activePage === 'about') {
                      // Already on the about page, just scroll to the top
                      const contentWrapper = document.querySelector('.about-content-wrapper');
                      if (contentWrapper) {
                        contentWrapper.scrollTop = 0;
                      }
                    } else {
                      // Navigate to about page first, then scroll
                      handleNavigation('about');
                      setTimeout(() => {
                        const contentWrapper = document.querySelector('.about-content-wrapper');
                        if (contentWrapper) {
                          contentWrapper.scrollTop = 0;
                        }
                      }, 100);
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                >
                  Motivation
                </h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <a 
                    href="#features" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('about');
                      setTimeout(() => {
                        const featuresSection = document.getElementById('features-section');
                        if (featuresSection) {
                          featuresSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('pricing');
                    }}
                  >
                    Pricing
                  </a>
                  <a 
                    href="#news" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('about');
                      setTimeout(() => {
                        const newsfeedSection = document.getElementById('newsfeed');
                        if (newsfeedSection) {
                          newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    News Feed
                  </a>
                </div>
              </div>
              <div className="search-umap-container">
                <div className="search-umap-section">
                  <div className="graph-container search-graph">
                    {filteredGraphData.length > 0 ? (
                      <Plot
                        data={plotlyData}
                        layout={mainPlotInitialized ? plotlyLayout : { ...plotlyLayout, annotations: [] }}
                        config={plotlyConfig}
                        style={{ width: '100%', height: '100%' }}
                        onClick={handlePointClick}
                        onInitialized={(figure) => {
                          plotlyRef.current = figure;
                          setMainPlotInitialized(true);
                        }}
                        onUpdate={(figure) => {
                          plotlyRef.current = figure;
                        }}
                      />
                    ) : (
                      <div className="loading-message">
                        {loading ? 'Loading Map of the Molecular Universe' : error ? 'Error loading data' : 'No data available'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="search-interface-section" style={{ flex: '0.8', padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '20px' }}>
                  <h2>
                    Filters 
                    {activeFilterCount > 0 && (
                      <button 
                        className="reset-button" 
                        onClick={resetAllFilters}
                        title="Reset all filters"
                      >
                        Reset All
                      </button>
                    )}
                  </h2>
                  <div className="sliders-container">
                    {Object.entries(filterRanges).map(([property, range]) => (
                      <div key={property} className="filter-wrapper">
                        <Slider
                          property={property}
                          value={range.range}
                          min={range.min}
                          max={range.max}
                          onChange={handleFilterChange}
                          label={filterLabels[property]}
                          active={range.active}
                        />
                        {range.active && (
                          <button 
                            className="reset-filter-button" 
                            onClick={() => resetFilter(property)}
                            title="Reset this filter"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <div className="functional-group-filter">
                      <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>
                        Functional Group Filter
                        <span
                          className="search-tooltip-marker"
                          title={`Functional Groups: Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.`}
                          style={{ marginLeft: '8px', cursor: 'help', fontWeight: 'bold', fontSize: '1.2em' }}
                        >
                          ?
                        </span>
                      </h3>
                      <div className="functional-group-input-container">
                        <select 
                          className="functional-group-select"
                          value={selectedFunctionalGroup}
                          onChange={(e) => {
                            setSelectedFunctionalGroup(e.target.options[e.target.selectedIndex].text);
                          }}
                        >
                          <option value="">Select a functional group</option>
                          <option value="C(=O)Cl">AcidChloride</option>
                          <option value="C(=O)[O;H,-]">CarboxylicAcid</option>
                          <option value="[$(S-!@[#6])](=O)(=O)(Cl)">SulfonylChloride</option>
                          <option value="[N;$(N-[#6]);!$(N-[!#6;!#1]);!$(N-C=[O,N,S])]">Amine</option>
                          <option value="[$(B-!@[#6])](O)(O)">BoronicAcid</option>
                          <option value="[$(N-!@[#6])](=!@C=!@O)">Isocyanate</option>
                          <option value="[O;H1;$(O-!@[#6;!$(C=!@[O,N,S])])]">Alcohol</option>
                          <option value="[CH;D2;!$(C-[!#6;!#1])]=O">Aldehyde</option>
                          <option value="[$([F,Cl,Br,I]-!@[#6]);!$([F,Cl,Br,I]-!@C-!@[F,Cl,Br,I]);!$([F,Cl,Br,I]-[C,S](=[O,S,N]))]">Halogen</option>
                          <option value="[N;H0;$(N-[#6]);D2]=[N;D2]=[N;D1]">Azide</option>
                          <option value="[N;H0;$(N-[#6]);D3](=[O;D1])~[O;D1]">Nitro</option>
                          <option value="[C;$(C#[CH])]">TerminalAlkyne</option>
                          <option value="[CX3](=O)[Cl,Br,I,F]">Acyl halide</option>
                          <option value="[CX3H](=[OX1])">Aldehyde</option>
                          <option value="[CX3]=[CX3]">Alkene</option>
                          <option value="[CX2]#[CX2]">Alkyne</option>
                          <option value="[N+]#[C-]">Isonitrile (isocyanide)</option>
                          <option value="[NX3][CX3](=O)[#6]">Amide</option>
                          <option value="[#6][NX2]=[#6][N]">Amidine</option>
                          <option value="[NX4]">Ammonium</option>
                          <option value="c1ccccc1">Arene</option>
                          <option value="[#6][N]=[N][#6]">Azo</option>
                          <option value="[NX3][CX3](=O)[OX2H0]">Carbamate</option>
                          <option value="[#6][OX2][CX3](=[OX1])[OX2][#6]">Carbonate</option>
                          <option value="[CX3](=O)[OX2H1]">CarboxylicAcid</option>
                          <option value="[CX3](=O)[OX2][CX3](=O)">CarboxylicAcidAnhydride</option>
                          <option value="[#6][OX2][CX2]#[NX1]">Cyanate</option>
                          <option value="[#6][SX2][SX2][#6]">Disulfide</option>
                          <option value="[CX3][NX3]=[CX3]">Enamine</option>
                          <option value="[CX3](=O)[OX2H0][#6]">Ester</option>
                          <option value="[OD2]([#6])[#6]">Ether</option>
                          <option value="[OX2r3]1[#6][#6]1">Epoxide</option>
                          <option value="[F][CX4]">FluoroAlkyl_SP3</option>
                          <option value="[F][CX3]">FluoroAlkyl_SP2</option>
                          <option value="[F][CX2]">FluoroAlkyl_SP</option>
                          <option value="[F][CX4][OX2]">FluoroEther</option>
                          <option value="[SX4](=O)(=O)([F])[#6]">FluoroSulfonyl</option>
                          <option value="[NX3][CX3](=[NX3])[NX3]">Guanidine</option>
                          <option value="[NX3][NX3]">Hydrazine</option>
                          <option value="[#6][NX3]([#6])[OX2][#6]">Hydroxylamines</option>
                          <option value="[C][Cl,Br,I,F]">Halide</option>
                          <option value="[CX3](=O)[NX3][CX3](=O)">Imide</option>
                          <option value="[CX2]=[NX3]">Imine</option>
                          <option value="[NX2]=[CX2]=[SX2]">Isothiocyanate</option>
                          <option value="[CX3;!$(C(=O)[N,O])](=O)[CX3;!$(C(=O)[N,O])]">Ketone</option>
                          <option value="[#6]([O][#6])([O][#6])">Ketal</option>
                          <option value="[CX2]#[NX1]">Nitrile</option>
                          <option value="[OX2][OX2]">Peroxide</option>
                          <option value="c1ccccc1[OH]">Phenol</option>
                          <option value="[#6][PX3]([#6])[#6]">Phosphino</option>
                          <option value="[#6][PX4](=[OX1])([OX2])[OX2]">Phosphono</option>
                          <option value="[OX2][PX4](=[OX1])([OX2])[OX2]">Phosphate</option>
                          <option value="[O]=[c]1[cH][cH][cH][cH][cH]1">Quinone</option>
                          <option value="[Se][#6]">Selenide</option>
                          <option value="[SeH]">Selenol</option>
                          <option value="[SX4](=O)(=O)([#6])[#6]">Sulfone</option>
                          <option value="[#6][SX4](=[OX1])(=[OX1])[OX2][#6]">Sulfonate ester</option>
                          <option value="[SX4](=O)([#6])[#6]">Sulfoxide</option>
                          <option value="[SX4](=O)(=O)(F)[#7]">NitroSulfonylFluoride</option>
                          <option value="[SX2H]">Thiol</option>
                          <option value="[#6](=[SX])[H]">Thial</option>
                          <option value="[#6](=[SX])[NX3]">Thioamide</option>
                          <option value="[#6](=[SX])[#6]">Thioketone</option>
                          <option value="[CX2]=[SX1]">Thione</option>
                          <option value="[SX2]([#6])[#6]">Thioether</option>
                          <option value="[SX2]=[CX2]=[NX1]">Thiocyanate</option>
                          <option value="[nH]1nccc1">Pyrazole-like Heterocycle</option>
                          <option value="[c]1[c][n][n][c]1">Heterocyclic-P-CN-1</option>
                          <option value="[n]1[c][n][n][c]1">Heterocyclic-P-CN-2</option>
                          <option value="[c]1[c][c][c][s]1">Heterocyclic-P-CS-1</option>
                          <option value="[c]1[c][c][o][c]1">Heterocyclic-P-CO-1</option>
                          <option value="c1ccccc1">Arene (aromatic)</option>
                        </select>
                        <button 
                          className="reset-filter-button functional-group-reset"
                          onClick={() => {
                            setSelectedFunctionalGroup('');
                            const dropdown = document.querySelector('.functional-group-select');
                            if (dropdown) dropdown.selectedIndex = 0;
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>

        ) : activePage === 'map' ? (
          <>
          <div className="map-container" style={{ 
            display: 'flex', 
            height: 'calc(100vh - 170px)', 
            padding: '20px 20px 20px 0',
            overflowY: 'auto',
            marginBottom: '0'
          }}>
            {/* New left text column (20%) */}
            <div className="map-text-section left-text" style={{ width: '7%', overflowY: 'auto', padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '0 8px 8px 0', marginLeft: '0', marginRight: '20px' }}>
              <h1 
                style={{ 
                  textDecoration: 'none',
                  color: 'rgb(51, 51, 51)',
                  fontSize: '9.5px',
                  transition: 'font-size 0.3s',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  fontWeight: 'normal'
                }}
                onClick={() => {
                  if (activePage === 'about') {
                    // Already on the about page, just scroll to the top
                    const contentWrapper = document.querySelector('.about-content-wrapper');
                    if (contentWrapper) {
                      contentWrapper.scrollTop = 0;
                    }
                  } else {
                    // Navigate to about page first, then scroll
                    handleNavigation('about');
                    setTimeout(() => {
                      const contentWrapper = document.querySelector('.about-content-wrapper');
                      if (contentWrapper) {
                        contentWrapper.scrollTop = 0;
                      }
                    }, 100);
                  }
                }}
                onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
              >
                Motivation
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <a 
                  href="/about#features" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('about');
                    setTimeout(() => {
                      const featuresSection = document.getElementById('features-section');
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('pricing');
                  }}
                >
                  Pricing
                </a>
                <a 
                  href="#news" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('about');
                    setTimeout(() => {
                      const newsfeedSection = document.getElementById('newsfeed');
                      if (newsfeedSection) {
                        newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  News Feed
                </a>
              </div>
            </div>
            
            {/* UMAP Visualization in the middle (50%) */}
            <div className="search-umap-container">
              {/* UMAP Visualization in the middle (50%) */}
              <div className="search-umap-section">
                <div className="graph-container search-graph">
                  {filteredGraphData.length > 0 ? (
                    <Plot
                      data={plotlyData}
                      layout={mainPlotInitialized ? plotlyLayout : { ...plotlyLayout, annotations: [] }}
                      config={plotlyConfig}
                      style={{ width: '100%', height: '100%' }}
                      onClick={handlePointClick}
                      onInitialized={(figure) => {
                        plotlyRef.current = figure;
                        setMainPlotInitialized(true);
                      }}
                      onUpdate={(figure) => {
                        plotlyRef.current = figure;
                      }}
                    />
                  ) : (
                    <div className="loading-message">
                      {loading ? 'Loading Map of the Molecular Universe' : error ? 'Error loading data' : 'No data available'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right text content */}
              <div className="search-interface-section" style={{ flex: '0.8', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>About Molecular Universe</h2>
                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                  Molecular Universe MU-0 is a battery material discovery software and service platform. We mapped more battery relevant properties of more battery relevant small molecules than ever before and trained a navigation system powered by a battery-specific llm that's like having world-renowned battery scientists at your fingertips. Now we can offer different levels of joint development services to customers across Li-Metal, silicon Li-ion, LFP, and many others.
                </p>
                
                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                  This 2D map visualizes a 512 dimensional universe of small molecules through a dimension reduction algorithm called UMAP (Uniform Manifold Approximation and Projection). It's the world's largest database of battery relevant molecules and properties that we know of, and constantly growing. Users can interact, filter, search and ask questions in natural language to accelerate their next generation battery development.
                </p>
                
                <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                  In MU-0, the map consists of 23 molecular clusters, they are labeled as below. We will be updating this map as we explore deeper into the Molecular Universe.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', marginTop: '10px' }}>
                  <img 
                    src={`${process.env.PUBLIC_URL}/MU_About_Cluster_Numbered.png`} 
                    alt="Molecular Universe Clusters Map" 
                    style={{ 
                      maxWidth: '100%', 
                      height: 'auto', 
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                </div>
                
                <h3 style={{ fontWeight: 'bold', marginBottom: '15px', marginTop: '25px' }}>Cluster Descriptions</h3>
                <div style={{ marginBottom: '20px', lineHeight: '1.5', fontSize: '14px' }}>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 1:</strong> Outlier cluster, "catch all"</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 2:</strong> Largely populated by molecules with carbonyl functionalities and monocyclic aromatic structure.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 3:</strong> Largely populated by molecules with sulfone functionalities and monocyclic aromatic structure.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 4:</strong> Largely populated by molecules with polycyclic and heteroatom aromatics.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 5:</strong> Largely populated by molecules with polycyclic heteroatom aromatics and carbonyl functionalities.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 6:</strong> Largely populated by molecules with polycyclic heteroatom aromatics and carbonyl functionalities.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 7:</strong> Largely populated by monocyclic molecules containing double-bonded N or O atoms.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 8:</strong> Largely populated by linear molecules containing O and N atoms.</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 9:</strong> Largely populated by non-aromatic monocyclic sulfones</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 10:</strong> Largely populated by linear molecules with sulfone, ethereal and carbonyl functionalities (most linear ethers are here)</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 11:</strong> Largely populated by monocyclic, non-aromatic molecules with carbonyl functionalities (most carbonate esters are here)</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 12:</strong> Largely populated by polycyclic fused ring aromatic molecules</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 13:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules (some cyclic ethers are here)</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 14:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 15:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 16:</strong> Largely populated by polycyclic molecules with a mix of co-occurring aromatic & non-aromatic molecules</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 17:</strong> Largely populated by polycyclic fused aromatic + non-aromatic molecules containing more than 2 rings</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 18:</strong> Largely populated by polycyclic molecules with a mix of co-occurring aromatic & non-aromatic rings</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 19:</strong> Largely populated by polycyclic molecules with a mix of co-occurring aromatic & non-aromatic rings</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 20:</strong> Largely populated by monocyclic non-aromatic molecules with no double bonds and long chain functional groups</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 21:</strong> Largely populated by monocyclic non-aromatic molecules with carbonyl functional groups</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 22:</strong> Largely populated by non-aromatic polycyclic molecules</p>
                  <p style={{ marginBottom: '10px' }}><strong>Cluster 23:</strong> Largely populated by non-aromatic polycyclic molecules</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            fontSize: '14px',
            color: '#333',
            textAlign: 'center',
            padding: '10px 0',
            width: '100%',
            backgroundColor: '#f1f1f1'
          }}>
            By using Molecular Universe, you agree to our <a href="#" onClick={(e) => { e.preventDefault(); handleNavigation('terms'); }} style={{ color: '#0066cc', textDecoration: 'underline' }}>Terms and Privacy Policy.</a>
          </div>
          </>
        ) : activePage === 'chatbot' ? (
          checkPageAccess('chatbot') ? (
            <div className="chat-main-container">
              <div className="about-text-section left-text" style={{ 
                width: '7%', 
                overflowY: 'auto', 
                padding: '20px', 
                backgroundColor: '#f1f1f1', 
                borderRadius: '0 8px 8px 0', 
                marginLeft: '0', 
                marginRight: '20px',
                position: 'sticky',
                left: 0,
                top: 20
              }}>
                <h1 
                  style={{ 
                    textDecoration: 'none',
                    color: 'rgb(51, 51, 51)',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontWeight: 'normal'
                  }}
                  onClick={() => {
                    if (activePage === 'about') {
                      // Already on the about page, just scroll to the top
                      const contentWrapper = document.querySelector('.about-content-wrapper');
                      if (contentWrapper) {
                        contentWrapper.scrollTop = 0;
                      }
                    } else {
                      // Navigate to about page first, then scroll
                      handleNavigation('about');
                      setTimeout(() => {
                        const contentWrapper = document.querySelector('.about-content-wrapper');
                        if (contentWrapper) {
                          contentWrapper.scrollTop = 0;
                        }
                      }, 100);
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                >
                  Motivation
                </h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <a 
                    href="#features" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('about');
                      setTimeout(() => {
                        const featuresSection = document.getElementById('features-section');
                        if (featuresSection) {
                          featuresSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('pricing');
                    }}
                  >
                    Pricing
                  </a>
                  <a 
                    href="#news" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('about');
                      setTimeout(() => {
                        const newsfeedSection = document.getElementById('newsfeed');
                        if (newsfeedSection) {
                          newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    News Feed
                  </a>
                </div>
              </div>
              <ChatbotInterface 
                messages={chatMessages} 
                setMessages={setChatMessages}
                userPermissions={userPermissions}
                remainingQueries={remainingQueries}
                setRemainingQueries={setRemainingQueries}
              />
            </div>
          ) : (
            <PermissionsError />
          )
        ) : activePage === 'pricing' ? (
          <div style={{ display: 'flex', width: '100%', flexDirection: 'row' }}>
            <div className="about-text-section left-text" style={{ width: '7%', overflowY: 'auto', padding: '20px', backgroundColor: '#f1f1f1', borderRadius: '0 8px 8px 0', marginLeft: '0', marginRight: '20px' }}>
              <h1 
                style={{ 
                  textDecoration: 'none',
                  color: 'rgb(51, 51, 51)',
                  fontSize: '9.5px',
                  transition: 'font-size 0.3s',
                  cursor: 'pointer',
                  marginBottom: '12px',
                  fontWeight: 'normal'
                }}
                onClick={() => {
                  if (activePage === 'about') {
                    // Already on the about page, just scroll to the top
                    const contentWrapper = document.querySelector('.about-content-wrapper');
                    if (contentWrapper) {
                      contentWrapper.scrollTop = 0;
                    }
                  } else {
                    // Navigate to about page first, then scroll
                    handleNavigation('about');
                    setTimeout(() => {
                      const contentWrapper = document.querySelector('.about-content-wrapper');
                      if (contentWrapper) {
                        contentWrapper.scrollTop = 0;
                      }
                    }, 100);
                  }
                }}
                onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
              >
                Motivation
              </h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <a 
                  href="#features" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('about');
                    setTimeout(() => {
                      const featuresSection = document.getElementById('features-section');
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('pricing');
                  }}
                >
                  Pricing
                </a>
                <a 
                  href="#news" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('about');
                    setTimeout(() => {
                      const newsfeedSection = document.getElementById('newsfeed');
                      if (newsfeedSection) {
                        newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                >
                  News Feed
                </a>
              </div>
            </div>
            <div style={{ height: 'calc(100vh - 120px)', overflowY: 'auto', width: '93%' }}>
              <PricingPage onSignIn={handleSignIn} handleNavigation={handleNavigation} activePage={activePage} />
            </div>
          </div>
        ) : activePage === 'terms' ? (
          <TermsPage handleNavigation={handleNavigation} activePage={activePage} />
        ) : activePage === 'about' ? (
          <AboutPage handleNavigation={handleNavigation} activePage={activePage} />
        ) : (
          // SEARCH PAGE CONTENT:
          <div className="search-container">
            <div className="search-umap-container" style={{ paddingLeft: '0', marginLeft: '0' }}>
              {/* Left navigation column */}
              <div className="about-text-section left-text" style={{ 
                width: '7%', 
                overflowY: 'auto', 
                padding: '20px', 
                backgroundColor: '#f1f1f1', 
                borderRadius: '0 8px 8px 0', 
                marginLeft: '0', 
                marginRight: '20px',
                position: 'sticky',
                left: 0
              }}>
                <h1 
                  style={{ 
                    textDecoration: 'none',
                    color: 'rgb(51, 51, 51)',
                    fontSize: '9.5px',
                    transition: 'font-size 0.3s',
                    cursor: 'pointer',
                    marginBottom: '12px',
                    fontWeight: 'normal'
                  }}
                  onClick={() => {
                    if (activePage === 'about') {
                      // Already on the about page, just scroll to the top
                      const contentWrapper = document.querySelector('.about-content-wrapper');
                      if (contentWrapper) {
                        contentWrapper.scrollTop = 0;
                      }
                    } else {
                      // Navigate to about page first, then scroll
                      handleNavigation('about');
                      setTimeout(() => {
                        const contentWrapper = document.querySelector('.about-content-wrapper');
                        if (contentWrapper) {
                          contentWrapper.scrollTop = 0;
                        }
                      }, 100);
                    }
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                >
                  Motivation
                </h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <a 
                    href="#features" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('about');
                      setTimeout(() => {
                        const featuresSection = document.getElementById('features-section');
                        if (featuresSection) {
                          featuresSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('pricing');
                    }}
                  >
                    Pricing
                  </a>
                  <a 
                    href="#news" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '9.5px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '12.3px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '9.5px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('about');
                      setTimeout(() => {
                        const newsfeedSection = document.getElementById('newsfeed');
                        if (newsfeedSection) {
                          newsfeedSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    News Feed
                  </a>
                </div>
              </div>

              {/* UMAP Visualization on the left */}
              <div className="search-umap-section">
                <div className="graph-container search-graph">
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {filteredGraphData.length > 0 ? (
                      <Plot
                        data={searchPlotlyData}
                        layout={searchPlotInitialized ? searchLayout : { ...plotlyLayout, autosize: true, height: null, width: null }}
                        config={plotlyConfig}
                        style={{ width: '100%', height: '100%' }}
                        onClick={handlePointClick}
                        useResizeHandler={true}
                        onInitialized={(figure) => {
                          searchPlotlyRef.current = figure;
                          setSearchPlotInitialized(true);
                        }}
                        onUpdate={(figure) => {
                          searchPlotlyRef.current = figure;
                        }}
                      />
                    ) : (
                      <div className="loading-message">
                        {loading ? 'Loading Map of the Molecular Universe' : error ? 'Error loading data' : 'No data available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search interface on the right */}
              <div className="search-interface-section" style={{ width: '25%', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                {/* Search bar container */}
                
                <SearchInput 
                  onSearch={handleSearch}
                  disabled={searchLoading}
                ></SearchInput>
                
                {/* Add "Find closest friends" checkbox */}
                <div className="search-options">
                  <label className="search-option">
                    <input
                      type="checkbox"
                      checked={findClosestFriends}
                      onChange={(e) => setFindClosestFriends(e.target.checked)}
                    />
                    <span>Find "friends" (Molecules with similar physicochemical properties. "Friends" intentionally includes some molecules with similar structures and some molecules with diverse structures. The list is sorted by how similar physicochemical properties are to the query molecule.)</span>
                  </label>
                </div>
                
                <div className="search-results">
                  {searchLoading && (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Searching...</p>
                    </div>
                  )}
                  
                  {searchError && (
                    <div className="error-message">
                      <p>{searchError}</p>
                    </div>
                  )}

                  {searchWarning && (
                    <div className="warning-message">
                      <p>{searchWarning}</p>
                    </div>
                  )}
                  
                  
                  
                  {!searchLoading && !searchError && searchResults && (
                    <div>
                      {searchedMolecules && searchedMolecules.length > 0 && (
                        <div className="molecule-properties">
                          <h3>Searched Molecules</h3>
                          {searchedMolecules.map((molecule, index) => (
                            <div key={index} className="molecule-entry">
                              <table className="property-table">
                                <tbody>
                                  <tr>
                                    <td className="property-name">SMILES</td>
                                    <td className="property-value">{molecule.smiles}</td>
                                  </tr>
                                  {molecule.properties?.chemical_formula && (
                                    <tr>
                                      <td className="property-name">Chemical Formula</td>
                                      <td className="property-value">{molecule.properties.chemical_formula}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td className="property-name">Molecular Weight</td>
                                    <td className="property-value">{molecule.properties?.molwt ? molecule.properties.molwt.toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="property-name">HOMO (eV)</td>
                                    <td className="property-value">{molecule.properties?.homo_eV ? molecule.properties.homo_eV.toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="property-name">LUMO (eV)</td>
                                    <td className="property-value">{molecule.properties?.lumo_eV ? molecule.properties.lumo_eV.toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="property-name">ESP Min (eV)</td>
                                    <td className="property-value">{molecule.properties?.esp_min_eV ? molecule.properties.esp_min_eV.toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="property-name">ESP Max (eV)</td>
                                    <td className="property-value">{molecule.properties?.esp_max_eV ? molecule.properties.esp_max_eV.toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  {molecule.properties?.predicted_mp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                                    <tr>
                                      <td className="property-name">Predicted Melting Point (°C)</td>
                                      <td className="property-value">{molecule.properties.predicted_mp.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {molecule.properties?.predicted_bp && (userPermissions === 'admin' || userPermissions === 'enterprise' || userPermissions === 'joint') && (
                                    <tr>
                                      <td className="property-name">Predicted Boiling Point (°C)</td>
                                      <td className="property-value">{molecule.properties.predicted_bp.toFixed(2)}</td>
                                    </tr>
                                  )}
                                  {molecule.properties?.functional_groups && (
                                    <tr>
                                      <td className="property-name">Functional Groups</td>
                                      <td className="property-value">{molecule.properties.functional_groups}</td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td className="property-name">UMAP_X</td>
                                    <td className="property-value">{molecule.x !== undefined && molecule.x !== null ? molecule.x.toFixed(4) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="property-name">UMAP_Y</td>
                                    <td className="property-value">{molecule.y !== undefined && molecule.y !== null ? molecule.y.toFixed(4) : 'N/A'}</td>
                                  </tr>
                                </tbody>
                              </table>
                              <div className="molecule-image-container">
                                <img 
                                  src={molecule.image} 
                                  alt={`Molecule ${index + 1} visualization`} 
                                  className="molecule-image"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      { findClosestFriends && similarMolecules && similarMolecules.length > 0 && (
                        <div className="similar-molecules">
                          <h3>Similar Molecules</h3>
                          {similarMolecules.map((molecule, index) => (
                            <div key={index} className="similar-molecule">
                              <h4>Similar Molecule #{index + 1}</h4>
                              <div className="similar-molecule-content">
                                <table className="property-table">
                                  <tbody>
                                    <tr>
                                      <td className="property-name">SMILES</td>
                                      <td className="property-value">{molecule.SMILES}</td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">HOMO (eV)</td>
                                      <td className="property-value">
                                        {molecule.HOMO_eV !== null && molecule.HOMO_eV !== undefined 
                                          ? molecule.HOMO_eV.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">LUMO (eV)</td>
                                      <td className="property-value">
                                        {molecule.LUMO_eV !== null && molecule.LUMO_eV !== undefined 
                                          ? molecule.LUMO_eV.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">ESP Min (eV)</td>
                                      <td className="property-value">
                                        {molecule.ESP_min_eV !== null && molecule.ESP_min_eV !== undefined 
                                          ? molecule.ESP_min_eV.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">ESP Max (eV)</td>
                                      <td className="property-value">
                                        {molecule.ESP_max_eV !== null && molecule.ESP_max_eV !== undefined 
                                          ? molecule.ESP_max_eV.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    {(userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise') && 
                                     molecule.predicted_MP_celsius !== null && molecule.predicted_MP_celsius !== undefined && (
                                      <tr>
                                        <td className="property-name">Predicted Melting Point (°C)</td>
                                        <td className="property-value">
                                          {molecule.predicted_MP_celsius.toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                    {(userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise') && 
                                     molecule.predicted_BP_celsius !== null && molecule.predicted_BP_celsius !== undefined && (
                                      <tr>
                                        <td className="property-name">Predicted Boiling Point (°C)</td>
                                        <td className="property-value">
                                          {molecule.predicted_BP_celsius.toFixed(2)}
                                        </td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td className="property-name">Molecular Weight</td>
                                      <td className="property-value">
                                        {molecule.molecular_weight !== null && molecule.molecular_weight !== undefined 
                                          ? molecule.molecular_weight.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">Functional Groups</td>
                                      <td className="property-value">{molecule.functional_groups || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">UMAP_X</td>
                                      <td className="property-value">
                                        {molecule.UMAP_0 !== null && molecule.UMAP_0 !== undefined 
                                          ? molecule.UMAP_0.toFixed(4) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">UMAP_Y</td>
                                      <td className="property-value">
                                        {molecule.UMAP_1 !== null && molecule.UMAP_1 !== undefined 
                                          ? molecule.UMAP_1.toFixed(4) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    {similarMoleculeImages[index] && (
                                      <tr>
                                        <td colSpan="2">
                                          <div className="similar-molecule-image-container">
                                            <img
                                              src={similarMoleculeImages[index]}
                                              alt={`Molecule ${index + 1} visualization`}
                                              className="similar-molecule-image"
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) }
                    </div>
                  )}
                  { (lastSearch && !searchLoading && (searchedMolecules === null || searchedMolecules.length == 0)) && (
                    <div className="molecule-not-found">
                      <p>Your query did not return any molecules. Here are several possibilities:
                        <br />
                        <br />
                        1.      Your query may not be battery relevant or have errors. Please check.
                        <br />
                        2.      Your result molecules are included in premium levels Enterprise and Joint Development. Please upgrade.
                        <br />
                        3.      Your query hit one of our hidden galaxies of treasure molecules. Please contact us.
                        <br />
                        4.      Your query might involve salt or anion molecules, which our current database doesn't yet support. We'll be adding anions in an upcoming update.</p>
                        <br />
                        <button 
                          className="pricing-cta strategic"
                          onClick={() => window.location.href = 'mailto:partnership@ses.ai?subject=Joint Development Inquiry'}
                        >
                          Contact Sales
                        </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Node popup */}
      {/* {showPopup && selectedNode && <NodePopup node={selectedNode} onClose={handleClosePopup} filterLabels={filterLabels} />} */}
    </div>
  );
};

export default App;