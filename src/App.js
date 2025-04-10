import React, { useState, useEffect, useRef, useMemo } from 'react';
import ChatbotInterface from './Chatbox';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import Box from '@mui/material/Box';
import MuiSlider from '@mui/material/Slider';
// import logo from the public folder
import './App.css';

// API URL for backend endpoints
const API_URL = 'http://0.0.0.0:8000';

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
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use logo from public folder
  const logo = process.env.PUBLIC_URL + '/logo-ses-ai.svg';

  // Use explicit URL for authentication endpoint without redeclaring API_URL
  // var API_URL = 'http://0.0.0.0:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email format for account creation
      if (!isLogin) {
        if (!email.endsWith('.edu')) {
          throw new Error('Only .edu email addresses are allowed for registration');
        }
      }

      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      if (!isLogin) {
        formData.append('email', email);
      }

      const response = await fetch(`${API_URL}/${isLogin ? 'login' : 'register'}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Authentication failed');
      }

      const data = await response.json();
      
      // Store token and user info in localStorage
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('permissions', data.permissions);
      
      // Navigate to the map page instead of just reloading
      window.history.pushState({}, '', '/');
      window.location.reload();
      
    } catch (err) {
      console.error('Authentication error:', err);
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
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to access the Molecular Universe' : 'Join the Molecular Universe community'}</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
            <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setIsLogin(true)}>Sign In</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

// Popup component to display node data
const NodePopup = ({ node, onClose, filterLabels }) => {
  if (!node) return null;
  
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content black-bg" onClick={e => e.stopPropagation()}>
        <button className="close-button white-text" onClick={onClose}>×</button>
        <h2 className="white-text">Node Details</h2>
        <div className="popup-data">
          <h3 className="white-text">SMILES</h3>
          <p className="dark-field">{node.smiles}</p>
          
          <h3 className="white-text">UMAP Coordinates</h3>
          <p className="dark-field">X: {node.x.toFixed(6)}, Y: {node.y.toFixed(6)}</p>
          
          <h3 className="white-text">Properties</h3>
          <table className="property-table dark-table">
            <tbody>
              {Object.entries(node.properties || {}).map(([key, value]) => (
                <tr key={key}>
                  <td className="property-name white-text">{filterLabels[key] || key}</td>
                  <td className="property-value white-text">
                    {value !== null && value !== undefined 
                      ? typeof value === 'number' 
                        ? value.toFixed(6) 
                        : value.toString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3 className="white-text">All Data</h3>
          <pre className="raw-data dark-field">
            {JSON.stringify(node.rawData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

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
        <span className="slider-label">{label}</span>
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
      
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Password reset failed');
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
const PricingPage = ({ onSignIn }) => {
  return (
    <div className="pricing-container">
      
      <div className="pricing-cards">
        <div className="pricing-card">
          <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm4-9H8v2h8Z"/>
            </svg>
          </div>
          <h2>Research</h2>
          <p className="pricing-description">
            The Research Edition is the introductory offering providing access to core platform functionality.
          </p>
          <div className="pricing-price">
            <span className="price-amount">$0</span>
            <span className="price-period">/ month</span>
          </div>
          <p className="pricing-region">Limited access</p>
          <button 
            className="pricing-cta research" 
            onClick={onSignIn}
          >
            Sign Up
          </button>
          <div className="pricing-details">
            <p>This edition includes limited access to the Molecular Universe with:</p>
            <ul>
              <li>Access to Map</li>
              <li>Basic molecule search functionality of 1 million database</li>
              <li>Limited number of monthly queries (100)</li>
              <li>Access to the molecular assistant AI</li>
            </ul>
          </div>
        </div>
        
        <div className="pricing-card popular">
          <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM10,17,5,12l1.41-1.41L10,14.17l7.59-7.59L19,8Z"/>
            </svg>
          </div>
          <h2>Professional</h2>
          <p className="pricing-description">
            The Professional Edition is for companies with research initiatives looking for more granular controls.
          </p>
          <div className="pricing-price">
            <span className="price-amount">$100</span>
            <span className="price-period">/ month</span>
          </div>
          <p className="pricing-region">Includes all Research features</p>
          <button 
            className="pricing-cta professional"
            onClick={() => window.open('https://buy.stripe.com/test_8wMbKFgsJ7hU04o5km', '_blank')}
          >
            GET STARTED
          </button>
          <div className="pricing-details">
            <p>This edition includes all Research Edition features plus:</p>
            <ul>
              <li>Unlimited searches</li>
              <li>Advanced filter controls</li>
              <li>Download molecule data</li>
              <li>Customized molecular visualizations</li>
              <li>Priority access to new features</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card popular">
          <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM10,17,5,12l1.41-1.41L10,14.17l7.59-7.59L19,8Z"/>
            </svg>
          </div>
          <h2>Unlimited</h2>
          <p className="pricing-description">
            The Professional Edition is for companies with research initiatives looking for more granular controls.
          </p>
          <div className="pricing-price">
            <span className="price-amount">$10,000</span>
            <span className="price-period">/ month</span>
          </div>
          <p className="pricing-region">Includes all Research features</p>
          <button className="pricing-cta unlimited"
            onClick={() => window.open('https://buy.stripe.com/test_cN25mha4l9q218seUV', '_blank')}
          >
            GET STARTED
          </button>
          <div className="pricing-details">
            <p>This edition includes all Research Edition features plus:</p>
            <ul>
              <li>Unlimited searches</li>
              <li>Advanced filter controls</li>
              <li>Download molecule data</li>
              <li>Customized molecular visualizations</li>
              <li>Priority access to new features</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card popular">
          <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM10,17,5,12l1.41-1.41L10,14.17l7.59-7.59L19,8Z"/>
            </svg>
          </div>
          <h2>Strategic Partner</h2>
          <p className="pricing-description">
            The Professional Edition is for companies with research initiatives looking for more granular controls.
          </p>
          <div className="pricing-price">
            <span className="price-amount">$100,000</span>
            <span className="price-period">/ month</span>
          </div>
          <p className="pricing-region">Includes all Research features</p>
          <button 
            className="pricing-cta strategic"
            onClick={() => window.location.href = 'mailto:Yumin.Zhang@ses.ai?subject=Joint Development Inquiry'}
          >
            GET STARTED
          </button>
          <div className="pricing-details">
            <p>This edition includes all Research Edition features plus:</p>
            <ul>
              <li>Unlimited searches</li>
              <li>Advanced filter controls</li>
              <li>Download molecule data</li>
              <li>Customized molecular visualizations</li>
              <li>Priority access to new features</li>
            </ul>
          </div>
        </div>

        <div className="pricing-card popular">
          <div className="pricing-icon">
            <svg viewBox="0 0 24 24" width="64" height="64" fill="#0080ff">
              <path d="M19,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V5A2,2,0,0,0,19,3ZM10,17,5,12l1.41-1.41L10,14.17l7.59-7.59L19,8Z"/>
            </svg>
          </div>
          <h2>Joint Development</h2>
          <p className="pricing-description">
            The Professional Edition is for companies with research initiatives looking for more granular controls.
          </p>
          <div className="pricing-price">
            <span className="price-amount">$10,000,000</span>
            <span className="price-period">/ year</span>
          </div>
          <p className="pricing-region">Includes all Research features</p>
          <button 
            className="pricing-cta joint"
            onClick={() => window.location.href = 'mailto:Yumin.Zhang@ses.ai?subject=Joint Development Inquiry'}
          >
            GET STARTED
          </button>
          <div className="pricing-details">
            <p>This edition includes all Research Edition features plus:</p>
            <ul>
              <li>Unlimited searches</li>
              <li>Advanced filter controls</li>
              <li>Download molecule data</li>
              <li>Customized molecular visualizations</li>
              <li>Priority access to new features</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

// Enterprise Search component
const EnterpriseSearch = ({ filteredGraphData, loading, error, plotlyLayout, handlePointClick, searchInput, setSearchInput, searchResult, setSearchResult, searchLoading, setSearchLoading, searchError, setSearchError, includeRelatives, setIncludeRelatives }) => {
  const enterprisePlotlyRef = useRef(null);
  
  // Use the same plotlyData, layout, and config from the parent component through props
  const plotlyConfig = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'toggleHover']
  };
  
  // Scroll to results section if there are existing results when returning to this tab
  useEffect(() => {
    if (searchResult) {
      setTimeout(() => {
        const resultsElement = document.querySelector('.enterprise-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 300);
    }
  }, [searchResult]);
  
  // Function to populate search input from clicked node
  const handleNodeClick = (data) => {
    if (!data.points || data.points.length === 0) return;
    const pointIndex = data.points[0].pointIndex;
    const node = filteredGraphData[pointIndex];
    if (node) {
      // Set the node as search input
      setSearchInput(node.smiles);
      // Also show normal node popup
      handlePointClick(data);
    }
  };
  
  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    
    try {
      // Fetch the molecule visualization from Python server
      const response = await fetch(`${API_URL}/molecule?smiles=${encodeURIComponent(searchInput.trim())}&include_relatives=${includeRelatives}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch molecule data: ${response.statusText}`);
      }
      const data = await response.blob();
      const imageUrl = URL.createObjectURL(data);
      setSearchResult(imageUrl);
      
      // Scroll to results after they're loaded
      setTimeout(() => {
        const resultsElement = document.querySelector('.enterprise-results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };
  
  return (
    <div className="enterprise-page">
      <div className="enterprise-container">
        <div className="enterprise-content">
          <h1 className="enterprise-header">Advanced Molecular Search</h1>
          
          {/* UMAP Visualization (full width) */}
          <div className="enterprise-umap-container" style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
            <div className="graph-container" style={{ width: '100%', height: '100%' }}>
              {filteredGraphData && filteredGraphData.length > 0 ? (
                <Plot
                  data={[{
                    x: filteredGraphData.map(node => node.x),
                    y: filteredGraphData.map(node => node.y),
                    mode: 'markers',
                    type: 'scattergl',
                    marker: {
                      size: 5,
                      color: filteredGraphData.map(node => node.properties?.molwt || 0),
                      colorscale: [
                        [0, '#440154'], // darkest purple
                        [0.25, '#3b528b'], // blue-purple
                        [0.5, '#21918c'], // green-blue
                        [0.75, '#5ec962'], // green
                        [1, '#fde725'] // yellow
                      ],
                      colorbar: {
                        title: 'Molecular Weight',
                        thickness: 20,
                        len: 0.6,
                        y: 0.5,
                        titleside: 'right',
                        titlefont: {
                          size: 12,
                          color: '#333'
                        }
                      },
                      opacity: 0.7
                    },
                    hoverinfo: 'text',
                    text: filteredGraphData.map(node => 
                      `<b>Molecule Information:</b><br>` +
                      `SMILES: ${node.smiles}<br>` +
                      `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
                      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(4) : 'N/A'}<br>` +
                      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(4) : 'N/A'}<br>` +
                      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(4) : 'N/A'}<br>` +
                      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(4) : 'N/A'}`
                    )
                  }]}
                  layout={{
                    ...plotlyLayout,
                    autosize: true,
                    height: 500
                  }}
                  config={plotlyConfig}
                  style={{ width: '100%', height: '100%' }}
                  useResizeHandler={true}
                  onClick={handleNodeClick}
                  onInitialized={(figure) => {
                    enterprisePlotlyRef.current = figure;
                  }}
                  onUpdate={(figure) => {
                    enterprisePlotlyRef.current = figure;
                  }}
                />
              ) : (
                <div className="loading-message">
                  {loading ? 'Loading UMAP data...' : error ? 'Error loading data' : 'No data available'}
                </div>
              )}
            </div>
          </div>
          
          <p className="enterprise-description">
            Search our extensive database to find specific molecules and their properties.
            You can also click on any point in the UMAP above to select a molecule.
          </p>
          
          <div className="enterprise-search-wrapper">
            <div className="enterprise-search-container">
              <input 
                type="text" 
                className="enterprise-search-input"
                placeholder="Enter SMILES string (e.g., CC(=O)OC1=CC=CC=C1C(=O)O)" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button 
                className="enterprise-search-button"
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          <div className="search-options">
            <label className="relatives-option">
              <input
                type="checkbox"
                checked={includeRelatives}
                onChange={(e) => setIncludeRelatives(e.target.checked)}
              />
              <span>Include closest 10 relatives</span>
            </label>
          </div>
          
          <div id="enterprise-results" className="enterprise-results" style={{ marginTop: '20px', paddingBottom: '60px' }}>
            {searchLoading && (
              <div className="enterprise-loading">
                <div className="loading-spinner"></div>
                <p>Generating molecule visualization...</p>
              </div>
            )}
            
            {searchError && (
              <div className="enterprise-error">
                <p>Error: {searchError}</p>
                <p>Please check your SMILES string and try again.</p>
              </div>
            )}
            
            {searchResult && (
              <div className="enterprise-molecule">
                <h2>Molecule Visualization</h2>
                <div className="molecule-image-container">
                  <img 
                    src={searchResult} 
                    alt="Molecule visualization" 
                    className="molecule-image"
                    style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
                <div className="molecule-smiles">
                  <h3>SMILES String:</h3>
                  <p>{searchInput}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// About Page component
const AboutPage = ({ handleNavigation }) => {
  return (
    <div className="about-container" style={{ display: 'flex', width: '93%' }}>
      {/* Left navigation column */}
      <div className="about-text-section left-text" style={{ width: '15%', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>Motivation for MU</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a 
            href="#features" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '16px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
            onMouseLeave={(e) => e.target.style.fontSize = '16px'}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Features of MU
          </a>
          <a 
            href="#pricing" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '16px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
            onMouseLeave={(e) => e.target.style.fontSize = '16px'}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('pricing');
            }}
          >
            Pricing Structure
          </a>
          <a 
            href="#news" 
            style={{ 
              textDecoration: 'none', 
              color: '#333',
              fontSize: '16px',
              transition: 'font-size 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
            onMouseLeave={(e) => e.target.style.fontSize = '16px'}
          >
            News Feed
          </a>
        </div>
      </div>

      {/* Main content */}
      <div className="about-content-wrapper" style={{ width: '85%' }}>
        <div className="about-content">
          <h2>Motivation for Molecular Universe</h2>
          <p>
            At SES AI, we know there's not a one-size-fits-all battery, so we have always wanted to develop the perfect electrolyte for different battery chemistries including Li-Metal, high silicon Li-ion, and LFP Li-ion and across various applications from drones to robotics, from electric cars to urban air mobility, and from grid storage to consumer electronics.
          </p>
          
          <p>
            It comes down to small molecules. While the universe of molecules is infinite, there are 10<sup>60</sup> small molecules in the universe, of them 10<sup>11</sup> could be used for batteries, and of them, only less than 1,000 have been studied for batteries in the past 30 years.
          </p>
          
          <p>
            So, we have only mapped one hundred millionth of the possible database. If that's all we need, it seems like an awful waste of molecules. Do we not want to know what's out there that could double LFP Li-ion cycle life, or triple high silicon Li-ion cycle life, or quadruple Li-Metal cycle life, or even more?
          </p>
          
          <p>
            The answer is of course a resounding "Hell Yeah". So we set out to map the physical and chemical properties of our database of 10<sup>11</sup>. This was a computationally intensive project, originally we thought of establishing a non-profit organization to crowdsource public computing resources and eventually open source the database. Then it turned out it was far more efficient to commercially procure GPUs and collaborate with Nvidia on GPU-accelerate computation chemistry software. While we will not open source our proprietary database, we will make Molecular Universe free to academic researchers and open source certain aspects of our models wherever appropriate.
          </p>
          
          <h3>In this current version of Molecular Universe, MU-0:</h3>
          
          <p>
            The Map consists of 10<sup>8</sup> molecular properties, including both actual experimental data and computation prediction based on Density Function Theory and machine learning models. This is the world's largest database of small molecule properties that we know of today. This database will continue to grow to include more organic and inorganic molecules, and more bulk and interphasial properties, suitable for additives, or salts, or solvents.
          </p>
          
          <p>
            These molecules are represented on a map through a dimension reduction data visualization technique called UMAP (Uniform Manifold Approximation and Projection). AI sees each molecule in 512 dimensions, for us mere mortals, UMAP reduces them to just 2 dimensions.
          </p>
          
          <h2 id="features-section">Features of Molecular Universe</h2>
          
          <div className="feature-section">
            <h3>Map the Molecular Universe</h3>
            <p>
              Visualize millions of molecules on an interactive 2D map built using UMAP (Uniform Manifold Approximation and Projection)—a machine learning algorithm that turns high-dimensional chemical structure data into an intuitive, searchable map. Each point is a molecule embedded by its structure, and clusters represent chemical families. It's like Google Maps, but for chemistry: zoom into "neighborhoods" of similar molecules and uncover hidden gems. The MU-0 map features 49 molecular continents, 1 million molecules (in-browser display), and 100 million molecules (searchable database), and counting, and is the world's largest database of small molecules and battery-related properties.
            </p>
          </div>
          
          <div className="feature-section">
            <h3>Filter by Chemical Properties</h3>
            <p>
              Need molecules with specific traits? Our property filters let you zero in on candidates with desirable features. All property values have been either measured in the lab or computed using traditional methods or predicted using AI/ML.
            </p>
            <ul className="feature-list">
              <li><strong>HOMO / LUMO:</strong> These quantum levels indicate how easily a molecule can give up or accept electrons—critical for assessing electrochemical stability.</li>
              <li><strong>ESP Min / Max:</strong> Electrostatic potential extremes help determine if a molecule can act as a good solvent for Li-ion or Li-metal systems.</li>
              <li><strong>Functional Groups:</strong> Target specific chemistries with substructure filters, from fluorinated chains to sulfonyl groups.</li>
              <li><strong>LLM Grade/Reasoning:</strong> Provide a 1 to 10 grade to the molecule and tell you why it's good or bad.</li>
            </ul>
            <p>
              You can even overlay your filtered molecules directly on the UMAP to visually explore chemical regions (molecular continents) that meet your criteria.
            </p>
          </div>
          
          <div className="feature-section">
            <h3>Search & "Find a Friend"</h3>
            <p>
              You can enter a "molecules-of-interest", it finds its location on the map, and recommends its "friends", which are other molecules with similar properties but might be located nearby or faraway on the map. This helps users broaden their horizon for possible molecules with similar properties. Search molecules in two powerful ways:
            </p>
            <ol className="feature-list">
              <li>By SMILES – Input a SMILES string and instantly retrieve all key info.</li>
              <li>By natural language – Ask questions like: "Find 5 molecules with LUMO above -1 eV and HOMO below -7 eV."</li>
            </ol>
            <p>
              Each result comes with a Molecule Info Card that includes a "Find a Friend" tool:
            </p>
            <ul className="feature-list">
              <li>Discover molecules that are structurally similar with similar properties (great for refinement),</li>
              <li>Or find structurally diverse options that still have similar properties (great for exploration).</li>
            </ul>
            <p>
              This balances exploration and exploitation—helping you expand possibilities while staying grounded in what works.
            </p>
          </div>
          
          <div className="feature-section">
            <h3>Ask Our Expert Powered by LLM</h3>
            <p>
              Ask our advanced chemistry-focused language model anything—from high-level strategy to molecule-level details. Trained on millions of scientific papers, patents, and SES's internal molecular data, this chatbot acts as your research co-pilot:
            </p>
            <ul className="feature-examples">
              <li>"What solvents work best with Li-metal anodes?"</li>
              <li>"Recommend additives with HOMO &lt; -8 eV."</li>
              <li>"Which solvents can help reduce volume expansion of silicon anodes?"</li>
            </ul>
            <p>
              Our LLM not only surfaces known insights from the literature, but also mines our proprietary molecular database, using the same "Find a Friend" logic, to suggest new candidates no one's talked about—yet.
            </p>
          </div>
          
          <div className="feature-section">
            <h3>Molecular Universe MU-0 is released to public</h3>
          </div>
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
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchedMolecule, setSearchedMolecule] = useState(null);
  const [similarMolecules, setSimilarMolecules] = useState(null);
  const [similarMoleculeImages, setSimilarMoleculeImages] = useState({}); // Add state for similar molecule images
  const [findClosestFriends, setFindClosestFriends] = useState(false);
  
  // Enterprise search state lifted up
  const [enterpriseSearchInput, setEnterpriseSearchInput] = useState('');
  const [enterpriseSearchResult, setEnterpriseSearchResult] = useState(null);
  const [enterpriseSearchLoading, setEnterpriseSearchLoading] = useState(false);
  const [enterpriseSearchError, setEnterpriseSearchError] = useState(null);
  const [includeRelatives, setIncludeRelatives] = useState(false);
  
  // Chat state (moved from ChatbotInterface)
  const [chatMessages, setChatMessages] = useState([
    { type: "system-message", text: "Welcome to the Molecular Universe AI Assistant. How can I help you today?" }
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
  
  const MAX_NODES = 150000;

  // Add new state for highlighted molecule
  const [highlightedMolecule, setHighlightedMolecule] = useState(null);
  const [arrowOffset, setArrowOffset] = useState(-40);
  
  // Track Plotly initialization state
  const [searchPlotInitialized, setSearchPlotInitialized] = useState(false);
  const [mainPlotInitialized, setMainPlotInitialized] = useState(false);
  
  // Ref for plots to check if they're initialized
  const plotlyRef = useRef(null);
  const searchPlotlyRef = useRef(null);
  
  // Add bouncing arrow animation when molecule is highlighted
  useEffect(() => {
    if (!highlightedMolecule || !searchPlotInitialized) return;
    
    let direction = -1; // Start moving up
    let current = -40;
    const min = -60;
    const max = -30;
    
    const interval = setInterval(() => {
      current += direction * 2;
      
      if (current <= min) {
        direction = 1; // Change to moving down
      } else if (current >= max) {
        direction = -1; // Change to moving up
      }
      
      setArrowOffset(current);
    }, 50);
    
    return () => clearInterval(interval);
  }, [highlightedMolecule, searchPlotInitialized]);
  
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
    
    // Only add annotations if highlightedMolecule is defined
    if (highlightedMolecule) {
      layout.annotations = [{
        x: highlightedMolecule.x,
        y: highlightedMolecule.y,
        xref: 'x',
        yref: 'y',
        text: 'Found Match!',
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
      }];
    } else if (searchResult) {
      layout.annotations = [{
        x: 0,
        y: 0,
        xref: 'paper',
        yref: 'paper',
        text: '',
        showarrow: false,
        bgcolor: 'rgba(255, 87, 34, 0.8)',
        bordercolor: '#FF5722',
        borderwidth: 2,
        borderpad: 4,
        font: {
          color: 'white',
          size: 14
        }
      }];
    }
    
    return layout;
  }, [plotlyLayout, highlightedMolecule, searchResult, arrowOffset]);

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
  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchedMolecule(null);
    setHighlightedMolecule(null);
    setSimilarMolecules(null);
    setSimilarMoleculeImages({}); // Reset similar molecule images

    try {
      if (findClosestFriends) {
        // First fetch the searched molecule's properties from Snowflake
        const moleculeResponse = await fetch(`${API_URL}/snowflake-query?smiles=${encodeURIComponent(searchInput.trim())}`);
        if (moleculeResponse.ok) {
          const moleculeData = await moleculeResponse.json();
          if (moleculeData.data && moleculeData.data.length > 0) {
            const snowflakeMolecule = moleculeData.data[0];
            const formattedMolecule = {
              smiles: snowflakeMolecule.SMILES,
              properties: {
                molwt: snowflakeMolecule.MOLECULAR_WEIGHT,
                homo_eV: snowflakeMolecule.HOMO_EV,
                lumo_eV: snowflakeMolecule.LUMO_EV,
                esp_min_eV: snowflakeMolecule.ESP_MIN_EV,
                esp_max_eV: snowflakeMolecule.ESP_MAX_EV,
                dipole_x: snowflakeMolecule.DIPOLE_X,
                dipole_y: snowflakeMolecule.DIPOLE_Y,
                dipole_z: snowflakeMolecule.DIPOLE_Z,
                functional_groups: snowflakeMolecule.FUNCTIONAL_GROUPS,
                predicted_mp: snowflakeMolecule.PREDICTED_MP,
                predicted_bp: snowflakeMolecule.PREDICTED_BP,
                chemical_formula: snowflakeMolecule.CHEMICAL_FORMULA
              },
              rawData: snowflakeMolecule
            };
            setSearchedMolecule(formattedMolecule);
          }
        }

        // Then fetch similar molecules
        const response = await fetch(`${API_URL}/find-friend?smiles=${encodeURIComponent(searchInput.trim())}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch similar molecules: ${response.statusText}`);
        }
        const data = await response.json();
        const molecules = data.similar_molecules;
        setSimilarMolecules(molecules);
        
        // Fetch the molecule visualization for the input molecule
        const visualizationResponse = await fetch(`${API_URL}/molecule?smiles=${encodeURIComponent(searchInput.trim())}`);
        if (!visualizationResponse.ok) {
          throw new Error(`Failed to fetch molecule visualization: ${visualizationResponse.statusText}`);
        }
        const imageData = await visualizationResponse.blob();
        const imageUrl = URL.createObjectURL(imageData);
        setSearchResult(imageUrl);
        
        // Fetch molecule visualizations for all similar molecules
        const imageRequests = molecules.map(async (molecule, index) => {
          try {
            const moleculeResponse = await fetch(`${API_URL}/molecule?smiles=${encodeURIComponent(molecule.SMILES)}`);
            if (moleculeResponse.ok) {
              const moleculeImageData = await moleculeResponse.blob();
              const moleculeImageUrl = URL.createObjectURL(moleculeImageData);
              return { index, imageUrl: moleculeImageUrl };
            }
            return { index, imageUrl: null };
          } catch (error) {
            console.error(`Error fetching molecule image for ${molecule.SMILES}:`, error);
            return { index, imageUrl: null };
          }
        });
        
        // Wait for all image requests to complete
        const imageResults = await Promise.all(imageRequests);
        
        // Create a map of molecule index to image URL
        const imageMap = {};
        imageResults.forEach(result => {
          if (result.imageUrl) {
            imageMap[result.index] = result.imageUrl;
          }
        });
        
        setSimilarMoleculeImages(imageMap);
      } else {
        // Original search functionality
        // First, find the molecule in our loaded UMAP data
        const matchingMolecule = graphData.find(node => 
          node.smiles.toLowerCase() === searchInput.trim().toLowerCase()
        );
        
        if (matchingMolecule) {
          // Molecule found in UMAP data
          setSearchedMolecule(matchingMolecule);
          setHighlightedMolecule(matchingMolecule);
        } else {
          // If not found in UMAP data, check the Snowflake database
          try {
            const response = await fetch(`${API_URL}/snowflake-query?smiles=${encodeURIComponent(searchInput.trim())}`);
            if (response.ok) {
              const data = await response.json();
              
              // Find the molecule in the Snowflake data
              if (data.data && data.data.length > 0) {
                const snowflakeMolecule = data.data[0];
                
                // Create a formatted molecule object from Snowflake data
                const formattedMolecule = {
                  smiles: snowflakeMolecule.SMILES,
                  properties: {
                    molwt: snowflakeMolecule.MOLECULAR_WEIGHT,
                    homo_eV: snowflakeMolecule.HOMO_EV,
                    lumo_eV: snowflakeMolecule.LUMO_EV,
                    esp_min_eV: snowflakeMolecule.ESP_MIN_EV,
                    esp_max_eV: snowflakeMolecule.ESP_MAX_EV,
                    dipole_x: snowflakeMolecule.DIPOLE_X,
                    dipole_y: snowflakeMolecule.DIPOLE_Y,
                    dipole_z: snowflakeMolecule.DIPOLE_Z,
                    functional_groups: snowflakeMolecule.FUNCTIONAL_GROUPS,
                    predicted_mp: snowflakeMolecule.PREDICTED_MP,
                    predicted_bp: snowflakeMolecule.PREDICTED_BP,
                    chemical_formula: snowflakeMolecule.CHEMICAL_FORMULA
                  },
                  rawData: snowflakeMolecule
                };
                
                setSearchedMolecule(formattedMolecule);
                // Don't highlight on UMAP since it's not in the visualization
              }
            }
          } catch (apiError) {
            console.error('Error checking Snowflake database:', apiError);
          }
        }

        // Then fetch the molecule visualization from Python server
        const response = await fetch(`${API_URL}/molecule?smiles=${encodeURIComponent(searchInput.trim())}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch molecule data: ${response.statusText}`);
        }
        const data = await response.blob();
        const imageUrl = URL.createObjectURL(data);
        setSearchResult(imageUrl);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
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
      const path = window.location.pathname;
      
      // If not authenticated, allow access to About, Map, and Pricing pages
      if (!isAuthenticated) {
        if (path === '/about' || path === '/' || path === '/map' || path === '/pricing') {
          // Set appropriate active page
          if (path === '/about') {
            setActivePage('about');
          } else if (path === '/pricing') {
            setActivePage('pricing');
          } else {
            setActivePage('map');
          }
        } else {
          // Redirect to login for any other route
          window.history.pushState({}, '', '/login');
          setActivePage('login');
        }
        return;
      }

      // For authenticated users, handle routes based on permissions
      if (path === '/login') {
        // Redirect to root if already authenticated
        window.history.pushState({}, '', '/');
        setActivePage('about');
      } else if (path === '/about') {
        setActivePage('about');
      } else if (path === '/reset-password') {
        // Show password reset page
        setShowPasswordReset(true);
      } else if (path === '/pricing') {
        setActivePage('pricing');
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
  }, [isAuthenticated, userPermissions]);

  // Update handleSignIn to use proper navigation
  const handleSignIn = () => {
    window.history.pushState({}, '', '/login');
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
    } else {
      // Keep the URL as root when navigating between other tabs
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    }
    
    // Clear search results when navigating away from search page
    if (activePage === 'search' && page !== 'search') {
      setSearchInput('');
      setSearchResult(null);
      setSearchedMolecule(null);
      setHighlightedMolecule(null);
      setSearchError(null);
    }
    
    // Special case for enterprise (advanced search) tab
    if (page === 'enterprise' && activePage === 'search') {
      // First clear the search tab data
      setSearchInput('');
      setSearchResult(null);
      setSearchedMolecule(null);
      setHighlightedMolecule(null);
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
    if (page === 'map' || page === 'pricing') {
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
    if (userPermissions === 'professional') {
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
              chemical_formula: row.CHEMICAL_FORMULA
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

  // Create separate plotly data for search view
  const searchPlotlyData = [{
    x: filteredGraphData.map(node => node.x),
    y: filteredGraphData.map(node => node.y),
    mode: 'markers',
    type: 'scattergl',
    marker: {
      size: 5,
      color: filteredGraphData.map(node => {
        if (highlightedMolecule && node.smiles === highlightedMolecule.smiles) {
          return '#ff0000'; // Red color for highlighted molecule
        }
        return node.properties?.molwt || 0; // Color by molecular weight
      }),
      colorscale: [
        [0, '#440154'], // darkest purple
        [0.25, '#3b528b'], // blue-purple
        [0.5, '#21918c'], // green-blue
        [0.75, '#5ec962'], // green
        [1, '#fde725'] // yellow
      ],
      colorbar: {
        title: 'Molecular Weight',
        thickness: 20,
        len: 0.6,
        y: 0.5,
        titleside: 'right',
        titlefont: {
          size: 12,
          color: '#333'
        }
      },
      opacity: filteredGraphData.map(node => {
        if (highlightedMolecule && node.smiles === highlightedMolecule.smiles) {
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
      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(4) : 'N/A'}<br>` +
      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(4) : 'N/A'}<br>` +
      `${node.properties?.functional_groups ? `Groups: ${node.properties.functional_groups}<br>` : ''}` +
      `${node.properties?.predicted_mp ? `MP: ${node.properties.predicted_mp.toFixed(2)}°C<br>` : ''}` +
      `${node.properties?.predicted_bp ? `BP: ${node.properties.predicted_bp.toFixed(2)}°C` : ''}`
    )
  }];

  // Create plotly data for explorer view
  const plotlyData = [{
    x: filteredGraphData.map(node => node.x),
    y: filteredGraphData.map(node => node.y),
    mode: 'markers',
    type: 'scattergl',
    marker: {
      size: 5,
      color: filteredGraphData.map(node => node.properties?.molwt || 0),
      colorscale: [
        [0, '#440154'], // darkest purple
        [0.25, '#3b528b'], // blue-purple
        [0.5, '#21918c'], // green-blue
        [0.75, '#5ec962'], // green
        [1, '#fde725'] // yellow
      ],
      colorbar: {
        title: 'Molecular Weight',
        thickness: 20,
        len: 0.6,
        y: 0.5,
        titleside: 'right',
        titlefont: {
          size: 12,
          color: '#333'
        }
      },
      opacity: 0.7
    },
    hoverinfo: 'text',
    text: filteredGraphData.map(node => 
      `<b>Molecule Information:</b><br>` +
      `SMILES: ${node.smiles}<br>` +
      `${node.properties?.chemical_formula ? `Formula: ${node.properties.chemical_formula}<br>` : ''}` +
      `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(4) : 'N/A'}<br>` +
      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(4) : 'N/A'}<br>` +
      `${node.properties?.functional_groups ? `Groups: ${node.properties.functional_groups}<br>` : ''}` +
      `${node.properties?.predicted_mp ? `MP: ${node.properties.predicted_mp.toFixed(2)}°C<br>` : ''}` +
      `${node.properties?.predicted_bp ? `BP: ${node.properties.predicted_bp.toFixed(2)}°C` : ''}`
    )
  }];

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
  if (!isAuthenticated && activePage !== 'about' && activePage !== 'map' && activePage !== 'pricing') {
    return <AuthPage />;
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
              className={`header-link ${activePage === 'explorer' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('explorer'); }}
            >
              Filter
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
              className={`header-link ${activePage === 'chatbot' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('chatbot'); }}
            >
              Ask
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
            <div className="explorer-container" style={{ display: 'flex', height: '100%' }}>
              <div className="about-text-section left-text" style={{ width: '15%', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '20px', marginLeft: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>Motivation for MU</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <a 
                    href="#features" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '16px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Features of MU
                  </a>
                  <a 
                    href="#pricing" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '16px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('pricing');
                    }}
                  >
                    Pricing Structure
                  </a>
                  <a 
                    href="#news" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '16px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                  >
                    News Feed
                  </a>
                </div>
              </div>
              <div className="graph-container" style={{ flex: '1', height: '100%' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                      {loading ? 'Loading UMAP data...' : error ? 'Error loading data' : 'No data available'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="info-panel" style={{ width: '300px', padding: '20px', overflowY: 'auto' }}>
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
                  <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Functional Group Filter</h3>
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
                
                <style jsx>{`
                  .functional-group-filter {
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #e0e0e0;
                  }
                  
                  .functional-group-select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    background-color: white;
                    font-size: 14px;
                    color: #333;
                  }
                  
                  .functional-group-select:focus {
                    outline: none;
                    border-color: #0080ff;
                    box-shadow: 0 0 0 2px rgba(0, 128, 255, 0.2);
                  }
                  
                  .functional-group-input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                  }
                  
                  .functional-group-reset {
                    margin-left: 8px;
                    padding: 4px 8px;
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                  }
                  
                  .functional-group-reset:hover {
                    background-color: #e0e0e0;
                  }
                `}</style>
              </div>
            </div>
          </>

        ) : activePage === 'map' ? (
          <>
          <div className="map-container" style={{ 
            display: 'flex', 
            height: 'calc(100vh - 150px)', 
            padding: '20px',
            overflowY: 'auto',
            marginBottom: '50px'
          }}>
            {/* New left text column (20%) */}
            <div className="map-text-section left-text" style={{ width: '17%', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '20px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>Motivation for MU</h1>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <a 
                  href="/about#features" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '16px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Features of MU
                </a>
                <a 
                  href="#pricing" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '16px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation('pricing');
                  }}
                >
                  Pricing Structure
                </a>
                <a 
                  href="#news" 
                  style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontSize: '16px',
                    transition: 'font-size 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                  onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                >
                  News Feed
                </a>
              </div>
            </div>
            
            {/* UMAP Visualization in the middle (50%) */}
            <div className="graph-container" style={{ width: '50%', height: '100%', backgroundColor: 'white', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px', marginRight: '20px' }}>
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
                  {loading ? 'Loading UMAP data...' : error ? 'Error loading data' : 'No data available'}
                </div>
              )}
            </div>
            
            {/* Right text content (25%) */}
            <div className="map-text-section" style={{ width: '25%', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>About Molecular Universe</h2>
              <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                Molecular Universe is like a telescope that looks for extraterrestrial life in outer space, it maps the universe of molecules suitable for batteries and uses AI and physics to navigate the map. It is intended to help battery researchers discover new materials for their next big idea.
              </p>
              
              <h3 style={{ fontWeight: 'bold', marginTop: '25px', marginBottom: '15px' }}>The unique and fundamental advantages of Molecular Universe include:</h3>
              <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                <li style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  <span style={{ fontWeight: 'bold' }}>The Map:</span> A vast and constantly growing database of small molecules suitable for battery applications and their properties, both experimentally measured and computationally predicted (no joke, but this would have taken thousands of years, but with the right computing hardware and software we can accomplish this in a few months).
                </li>
                <li style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  <span style={{ fontWeight: 'bold' }}>The Navigation System:</span> A battery-specific LLM that is trained on thoroughly curated battery literature and by worldclass battery experts (we literally leave no stones unturned in scouting LLM training data).
                </li>
                <li style={{ marginBottom: '15px', lineHeight: '1.6' }}>
                  <span style={{ fontWeight: 'bold' }}>The Interface:</span> The Map and the Navigation System are linked in an intuitive user interface, making battery material discovery as straightforward as dating (okay that may not be so straightforward, but you get the idea).
                </li>
              </ol>
              
              <p style={{ marginTop: '20px', lineHeight: '1.6' }}>
                Molecular Universe is still a baby, but growing rapidly. The Map will expand to cover more molecules and properties, and the Navigation System will become more accurate at finding the perfect molecules for you. With your help, we can improve Molecular Universe together.
              </p>
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
            By using Molecular Universe, you agree to our Terms and Privacy Policy.
          </div>
          </>
        ) : activePage === 'chatbot' ? (
          checkPageAccess('chatbot') ? (
            <ChatbotInterface 
              messages={chatMessages} 
              setMessages={setChatMessages}
              userPermissions={userPermissions}
              remainingQueries={remainingQueries}
              setRemainingQueries={setRemainingQueries}
            />
          ) : (
            <PermissionsError />
          )
        ) : activePage === 'enterprise' ? (
          checkPageAccess('enterprise') ? 
            <EnterpriseSearch 
              filteredGraphData={filteredGraphData} 
              loading={loading} 
              error={error} 
              plotlyLayout={plotlyLayout} 
              handlePointClick={handlePointClick} 
              searchInput={enterpriseSearchInput}
              setSearchInput={setEnterpriseSearchInput}
              searchResult={enterpriseSearchResult}
              setSearchResult={setEnterpriseSearchResult}
              searchLoading={enterpriseSearchLoading}
              setSearchLoading={setEnterpriseSearchLoading}
              searchError={enterpriseSearchError}
              setSearchError={setEnterpriseSearchError}
              includeRelatives={includeRelatives}
              setIncludeRelatives={setIncludeRelatives}
            /> : <PermissionsError />
        ) : activePage === 'pricing' ? (
          <div style={{ height: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <PricingPage onSignIn={handleSignIn} />
          </div>
        ) : activePage === 'about' ? (
          <AboutPage handleNavigation={handleNavigation} />
        ) : (
          // SEARCH PAGE CONTENT:
          <div className="search-container">
            <div className="search-umap-container">
              {/* Left navigation column */}
              <div className="about-text-section left-text" style={{ width: '17%', overflowY: 'auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginRight: '20px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000', marginBottom: '20px' }}>Motivation for MU</h1>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <a 
                    href="#features" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '16px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Features of MU
                  </a>
                  <a 
                    href="#pricing" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '16px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '16px'}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('pricing');
                    }}
                  >
                    Pricing Structure
                  </a>
                  <a 
                    href="#news" 
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '16px',
                      transition: 'font-size 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.fontSize = '20.8px'}
                    onMouseLeave={(e) => e.target.style.fontSize = '16px'}
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
                        {loading ? 'Loading UMAP data...' : error ? 'Error loading data' : 'No data available'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Search interface on the right */}
              <div className="search-interface-section">
                {/* Search bar container */}
                <div className="search-bar-container">
                  <input 
                    type="text" 
                    className="search-input search-input-full"
                    placeholder="Please input SMILES string..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <button 
                    className="search-button search-button-full"
                    onClick={handleSearch}
                    disabled={searchLoading}
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {/* Add "Find closest friends" checkbox */}
                <div className="search-options">
                  <label className="search-option">
                    <input
                      type="checkbox"
                      checked={findClosestFriends}
                      onChange={(e) => setFindClosestFriends(e.target.checked)}
                    />
                    <span>Find closest friends</span>
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
                  
                  {!searchLoading && !searchError && searchResult && (
                    <div>
                      {searchedMolecule && !findClosestFriends ? (
                        <div className="molecule-properties">
                          <h3>Molecule Properties</h3>
                          <table className="property-table">
                            <tbody>
                              <tr>
                                <td className="property-name">SMILES</td>
                                <td className="property-value">{searchedMolecule.smiles}</td>
                              </tr>
                              {searchedMolecule.properties?.chemical_formula && (
                                <tr>
                                  <td className="property-name">Chemical Formula</td>
                                  <td className="property-value">{searchedMolecule.properties.chemical_formula}</td>
                                </tr>
                              )}
                              <tr>
                                <td className="property-name">Molecular Weight</td>
                                <td className="property-value">
                                  {searchedMolecule.properties?.molwt ? searchedMolecule.properties.molwt.toFixed(2) : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="property-name">HOMO (eV)</td>
                                <td className="property-value">
                                  {searchedMolecule.properties?.homo_eV ? searchedMolecule.properties.homo_eV.toFixed(4) : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="property-name">LUMO (eV)</td>
                                <td className="property-value">
                                  {searchedMolecule.properties?.lumo_eV ? searchedMolecule.properties.lumo_eV.toFixed(4) : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="property-name">ESP Min (eV)</td>
                                <td className="property-value">
                                  {searchedMolecule.properties?.esp_min_eV ? searchedMolecule.properties.esp_min_eV.toFixed(4) : 'N/A'}
                                </td>
                              </tr>
                              <tr>
                                <td className="property-name">ESP Max (eV)</td>
                                <td className="property-value">
                                  {searchedMolecule.properties?.esp_max_eV ? searchedMolecule.properties.esp_max_eV.toFixed(4) : 'N/A'}
                                </td>
                              </tr>
                              {searchedMolecule.properties?.predicted_mp && (
                                <tr>
                                  <td className="property-name">Predicted Melting Point (°C)</td>
                                  <td className="property-value">
                                    {searchedMolecule.properties.predicted_mp.toFixed(2)}
                                  </td>
                                </tr>
                              )}
                              {searchedMolecule.properties?.predicted_bp && (
                                <tr>
                                  <td className="property-name">Predicted Boiling Point (°C)</td>
                                  <td className="property-value">
                                    {searchedMolecule.properties.predicted_bp.toFixed(2)}
                                  </td>
                                </tr>
                              )}
                              {searchedMolecule.properties?.functional_groups && (
                                <tr>
                                  <td className="property-name">Functional Groups</td>
                                  <td className="property-value">
                                    {searchedMolecule.properties.functional_groups}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : findClosestFriends && similarMolecules && similarMolecules.length > 0 ? (
                        <div className="similar-molecules">
                          {/* Add searched molecule section */}
                          <div className="searched-molecule">
                            <h3>Searched Molecule</h3>
                            <div className="searched-molecule-content">
                              <table className="property-table">
                                <tbody>
                                  <tr>
                                    <td className="property-name">SMILES</td>
                                    <td className="property-value">{searchInput}</td>
                                  </tr>
                                  {searchedMolecule && (
                                    <>
                                      {searchedMolecule.properties?.chemical_formula && (
                                        <tr>
                                          <td className="property-name">Chemical Formula</td>
                                          <td className="property-value">{searchedMolecule.properties.chemical_formula}</td>
                                        </tr>
                                      )}
                                      <tr>
                                        <td className="property-name">Molecular Weight</td>
                                        <td className="property-value">
                                          {searchedMolecule.properties?.molwt ? searchedMolecule.properties.molwt.toFixed(2) : 'N/A'}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="property-name">HOMO (eV)</td>
                                        <td className="property-value">
                                          {searchedMolecule.properties?.homo_eV ? searchedMolecule.properties.homo_eV.toFixed(4) : 'N/A'}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="property-name">LUMO (eV)</td>
                                        <td className="property-value">
                                          {searchedMolecule.properties?.lumo_eV ? searchedMolecule.properties.lumo_eV.toFixed(4) : 'N/A'}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="property-name">ESP Min (eV)</td>
                                        <td className="property-value">
                                          {searchedMolecule.properties?.esp_min_eV ? searchedMolecule.properties.esp_min_eV.toFixed(4) : 'N/A'}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="property-name">ESP Max (eV)</td>
                                        <td className="property-value">
                                          {searchedMolecule.properties?.esp_max_eV ? searchedMolecule.properties.esp_max_eV.toFixed(4) : 'N/A'}
                                        </td>
                                      </tr>
                                      {searchedMolecule.properties?.predicted_mp && (
                                        <tr>
                                          <td className="property-name">Predicted Melting Point (°C)</td>
                                          <td className="property-value">
                                            {searchedMolecule.properties.predicted_mp.toFixed(2)}
                                          </td>
                                        </tr>
                                      )}
                                      {searchedMolecule.properties?.predicted_bp && (
                                        <tr>
                                          <td className="property-name">Predicted Boiling Point (°C)</td>
                                          <td className="property-value">
                                            {searchedMolecule.properties.predicted_bp.toFixed(2)}
                                          </td>
                                        </tr>
                                      )}
                                      {searchedMolecule.properties?.functional_groups && (
                                        <tr>
                                          <td className="property-name">Functional Groups</td>
                                          <td className="property-value">
                                            {searchedMolecule.properties.functional_groups}
                                          </td>
                                        </tr>
                                      )}
                                    </>
                                  )}
                                </tbody>
                              </table>
                              {searchResult && (
                                <div className="searched-molecule-image-container">
                                  <img 
                                    src={searchResult} 
                                    alt="Searched molecule visualization" 
                                    className="searched-molecule-image"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          
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
                                          ? molecule.HOMO_eV.toFixed(4) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">LUMO (eV)</td>
                                      <td className="property-value">
                                        {molecule.LUMO_eV !== null && molecule.LUMO_eV !== undefined 
                                          ? molecule.LUMO_eV.toFixed(4) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">ESP Min (eV)</td>
                                      <td className="property-value">
                                        {molecule.ESP_min_eV !== null && molecule.ESP_min_eV !== undefined 
                                          ? molecule.ESP_min_eV.toFixed(4) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">ESP Max (eV)</td>
                                      <td className="property-value">
                                        {molecule.ESP_max_eV !== null && molecule.ESP_max_eV !== undefined 
                                          ? molecule.ESP_max_eV.toFixed(4) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">Predicted Melting Point (°C)</td>
                                      <td className="property-value">
                                        {molecule.predicted_MP_celsius !== null && molecule.predicted_MP_celsius !== undefined 
                                          ? molecule.predicted_MP_celsius.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">Predicted Boiling Point (°C)</td>
                                      <td className="property-value">
                                        {molecule.predicted_BP_celsius !== null && molecule.predicted_BP_celsius !== undefined 
                                          ? molecule.predicted_BP_celsius.toFixed(2) 
                                          : 'N/A'}
                                      </td>
                                    </tr>
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
                                  </tbody>
                                </table>
                                {similarMoleculeImages[index] && (
                                  <div className="similar-molecule-image-container">
                                    <img 
                                      src={similarMoleculeImages[index]} 
                                      alt={`Molecule ${index + 1} visualization`} 
                                      className="similar-molecule-image"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="molecule-not-found">
                          <p>This molecule was not found in our dataset.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Node popup */}
      {showPopup && selectedNode && <NodePopup node={selectedNode} onClose={handleClosePopup} filterLabels={filterLabels} />}
    </div>
  );
};

export default App;