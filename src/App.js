import React, { useState, useEffect, useRef, useMemo } from 'react';
import Papa from 'papaparse';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import Box from '@mui/material/Box';
import MuiSlider from '@mui/material/Slider';
import logo from './logo-ses-ai.svg';
import './App.css';

// Create a Plotly Component using the plotly.js factory
const Plot = createPlotlyComponent(Plotly);

// Navigation bar component
const Navbar = ({ activePage, isAuthenticated, username, onLogout, onSignIn }) => {
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
          href="#"
          className={`navbar-link ${(activePage === 'explorer' || activePage === 'about' || activePage === 'search' || activePage === 'chatbot' || activePage === 'enterprise') ? 'active' : ''}`}
        >
          Molecular Universe
        </a>
      </div>
      {isAuthenticated ? (
        <div className="navbar-user">
          <span className="username">Welcome, {username}</span>
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

  // Use explicit URL for authentication endpoint
  const API_URL = 'http://0.0.0.0:8000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
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
      
      // Reload the app to update authentication state
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
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <img src={logo} alt="SES AI Logo" className="auth-logo" />
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
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? (
            <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => setIsLogin(true)}>Login</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

// Popup component to display node data
const NodePopup = ({ node, onClose }) => {
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
                  <td className="property-name white-text">{key}</td>
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

// About component
const About = () => {
  return (
    <div className="about-container">
      <div className="about-content-wrapper">
        <div className="about-content">
          <p>
            SES AI scientists have amassed a complete "molecular universe" of over 87 million molecules along with a vast database of their various properties to serve both public and private industry searches for compounds that will propel future technologies. Initially built to serve our internal search for molecules that could build better lithium metal batteries, the molecular universe now serves beyond this initial mission. SES AI has decided to provide both free and subscription tiered access to the world. Read on to learn more about the specifics of the Molecular Universe.
          </p>
        </div>
        <h3>About the Universe Map</h3>
        <div className="blue-line"></div>
        <div className="umap-section">
          <div className="umap-description">
            <p>
              The Molecular Universe Map takes 512 calculated properties and does dimensionality reduction using the UMAP reductionality method to project these relationships down to a 2-dimensional representation of the molecules which can be plotted as a map (right)​
            </p>
          </div>
          <div className="umap-image">
            <img src="/high_res_umap_figure.png" alt="UMAP Visualization" />
          </div>
        </div>
        <h3>Terms and Service</h3>
        <div className="blue-line"></div>
        <div className="terms-section">
          <div className="term-item">
            <h4>UMAP (Uniform Manifold Approximation and Projection):</h4>
            <p>A machine learning technique used to reduce high-dimensional data into 2D or 3D for easy visualization. In chemistry, it helps show patterns and clusters in molecular datasets.​</p>
          </div>

          <div className="term-item">
            <h4>SMILES (Simplified Molecular Input Line Entry System):</h4>
            <p>A way to represent a molecule's structure as a line of text. It uses letters and symbols to describe atoms and bonds, making it easy for computers to process chemical structures.​</p>
          </div>

          <div className="term-item">
            <h4>HOMO (Highest Occupied Molecular Orbital):</h4>
            <p>The highest energy level that contains electrons in a molecule. It plays a key role in determining how a molecule donates electrons during chemical reactions.​</p>
          </div>

          <div className="term-item">
            <h4>LUMO (Lowest Unoccupied Molecular Orbital):</h4>
            <p>The lowest energy level that can accept electrons. It helps predict how a molecule will react, especially when accepting electrons from another molecule.​</p>
          </div>

          <div className="term-item">
            <h4>Min Electrostatic Potential:</h4>
            <p>The most negatively charged area on a molecule's surface. It usually shows where positively charged species (like protons) may be attracted.​</p>
          </div>

          <div className="term-item">
            <h4>Predicted Melting Point:</h4>
            <p>​</p>
          </div>

          <div className="term-item">
            <h4>Predicted Boiling Point:</h4>
            <p>​</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chatbot component
const ChatbotInterface = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "system-message", text: "Welcome to the Molecular Universe AI Assistant. How can I help you today?" }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    // Append the user message
    const userMessage = { type: "user-message", text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    const queryText = input.trim();
    setInput("");

    try {
      // Query the backend Pinecone index via the /rag endpoint
      const response = await fetch("http://localhost:8000/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          maxOutputLength: 1024,
          ragEnabled: true,
          webSearchEnabled: false,
          webSearchClient: "Tavily",
          model: "o3-mini"
        })
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // Assuming the response returns an 'outputs' field with the result text
      const llmMessage = { type: "llm-message", text: data.outputs };
      setMessages(prev => [...prev, llmMessage]);
    } catch (error) {
      const errorMessage = { type: "llm-message", text: "Error querying the index: " + error.message };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-content">
        <h2>AI Molecular Assistant</h2>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={msg.type} 
              style={{ whiteSpace: 'pre-wrap' }} 
              dangerouslySetInnerHTML={{ __html: msg.text }}>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            placeholder="Ask a question about molecules, properties, or chemical structures..."
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-button" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
};

// Enterprise Search component
const EnterpriseSearch = () => {
  return (
    <div className="enterprise-container">
      <div className="enterprise-content">
        <h1>Enterprise Search</h1>
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
  const [activePage, setActivePage] = useState('explorer');
  const [searchType, setSearchType] = useState('Lookup');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchedMolecule, setSearchedMolecule] = useState(null);
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState('basic');
  
  // API URL from environment variables
  const API_URL = 'http://0.0.0.0:8000';
  
  // New filter implementation with range values
  const [filterRanges, setFilterRanges] = useState({
    molwt: { min: 0, max: 1000, range: [0, 1000], active: false },
    homo_eV: { min: -10, max: 0, range: [-10, 0], active: false },
    lumo_eV: { min: -5, max: 5, range: [-5, 5], active: false },
    esp_max_eV: { min: -2, max: 2, range: [-2, 2], active: false },
    esp_min_eV: { min: -2, max: 0, range: [-2, 0], active: false }
  });
  
  // Use refs to avoid dependency issues in useEffect
  const filterRangesRef = useRef(filterRanges);
  useEffect(() => {
    filterRangesRef.current = filterRanges;
  }, [filterRanges]);
  
  // Labels for filters
  const filterLabels = {
    molwt: "Molecular Weight",
    homo_eV: "HOMO (eV)",
    lumo_eV: "LUMO (eV)",
    esp_max_eV: "Max ESP (eV)",
    esp_min_eV: "Min ESP (eV)"
  };
  const filterLabelsRef = useRef(filterLabels);

  const MAX_NODES = 70000;

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
    } else if (searchedMolecule && !highlightedMolecule) {
      layout.annotations = [{
        x: 0,
        y: 0,
        xref: 'paper',
        yref: 'paper',
        text: '',
        showarrow: false,
        bgcolor: '#fff3cd',
        bordercolor: '#ffeeba',
        borderwidth: 2,
        borderpad: 4,
        font: {
          color: '#856404',
          size: 14
        }
      }];
    } else if (searchResult && !searchedMolecule) {
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
  }, [plotlyLayout, highlightedMolecule, searchResult, searchedMolecule, arrowOffset]);

  const plotlyConfig = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'toggleHover']
  };

  // Add a ref and click-outside handler for the search dropdown
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update handleSearch function
  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchedMolecule(null);
    setHighlightedMolecule(null);

    try {
      // First, find the molecule in our loaded UMAP data
      const matchingMolecule = graphData.find(node => 
        node.smiles.toLowerCase() === searchInput.trim().toLowerCase()
      );
      
      if (matchingMolecule) {
        // Molecule found in UMAP data
        setSearchedMolecule(matchingMolecule);
        setHighlightedMolecule(matchingMolecule);
      } else {
        // If not found in UMAP data, check the full CSV
        try {
          const response = await fetch(`${process.env.PUBLIC_URL}/umap_product_demo_1M_set.csv`);
          if (response.ok) {
            const text = await response.text();
            
            // Use a Promise to make Papa.parse wait until completion
            await new Promise((resolve) => {
              Papa.parse(text, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                  // Find the molecule in the full CSV data
                  const csvMolecule = results.data.find(row => 
                    row.smiles && row.smiles.toLowerCase() === searchInput.trim().toLowerCase()
                  );
                  
                  if (csvMolecule) {
                    // Create a formatted molecule object from CSV data
                    const formattedMolecule = {
                      smiles: csvMolecule.smiles,
                      properties: {
                        molwt: csvMolecule.molwt,
                        homo_eV: csvMolecule.homo_eV,
                        lumo_eV: csvMolecule.lumo_eV,
                        esp_min_eV: csvMolecule.esp_min_eV,
                        esp_max_eV: csvMolecule.esp_max_eV
                      },
                      rawData: csvMolecule
                    };
                    
                    setSearchedMolecule(formattedMolecule);
                    // Don't highlight on UMAP since it's not in the visualization
                  }
                  resolve();
                },
                error: (error) => {
                  console.error("CSV parse error:", error);
                  resolve();
                }
              });
            });
          }
        } catch (csvError) {
          console.error('Error checking full CSV:', csvError);
        }
      }

      // Then fetch the molecule visualization from Python server
      const response = await fetch(`http://0.0.0.0:8000/molecule?smiles=${encodeURIComponent(searchInput.trim())}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch molecule data: ${response.statusText}`);
      }
      const data = await response.blob();
      const imageUrl = URL.createObjectURL(data);
      setSearchResult(imageUrl);
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
      
      // If not authenticated, only allow access to About page
      if (!isAuthenticated) {
        if (path === '/about') {
          setActivePage('about');
        } else {
          // Redirect to login for any other route
          window.history.pushState({}, '', '/login');
          setActivePage('login');
        }
        return;
      }

      // For authenticated users, handle routes based on permissions
      if (path === '/login') {
        // Redirect to about if already authenticated
        window.history.pushState({}, '', '/about');
        setActivePage('about');
      } else if (path === '/about') {
        setActivePage('about');
      } else if (path === '/') {
        // Redirect root to about
        window.history.pushState({}, '', '/about');
        setActivePage('about');
      } else {
        // Redirect any other route to about
        window.history.pushState({}, '', '/about');
        setActivePage('about');
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
    setActivePage(page);
  };

  // Move checkPageAccess inside App component
  const checkPageAccess = (page) => {
    // Basic users can only access About page
    if (userPermissions === 'basic') {
      return page === 'about';
    }
    
    // Premium users can access About, Filter, Simple Search, and Chat
    if (userPermissions === 'premium') {
      return ['about', 'explorer', 'search', 'chatbot'].includes(page);
    }
    
    // Admin users can access everything
    if (userPermissions === 'admin') {
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

    if (userPermissions === 'basic') {
      message = 'This feature is only available for premium users. Please upgrade your account to access this functionality.';
      buttonText = 'View Pricing';
      buttonAction = () => window.location.href = '/pricing';
    } else if (userPermissions === 'premium') {
      message = 'This feature is only available for admin users. Please contact your administrator for access.';
      buttonText = 'Contact Admin';
      buttonAction = () => window.location.href = '/contact';
    }

    return (
      <div className="permissions-error-container">
        <div className="permissions-error-content">
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
      const permissions = localStorage.getItem('permissions') || 'basic';
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
          setUserPermissions(data.permissions || 'basic');
          if (activePage === 'login') {
            setActivePage('explorer');
          }
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          localStorage.removeItem('permissions');
          setIsAuthenticated(false);
          setUserPermissions('basic');
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        setIsAuthenticated(false);
        setUserPermissions('basic');
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuth();
  }, [API_URL]);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/umap_product_demo_1M_set.csv`);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("Parse errors:", results.errors);
            }
            const nodes = results.data
              .filter(row => row && row.umap_0 !== undefined && row.umap_1 !== undefined && row.smiles)
              .slice(0, MAX_NODES)
              .map((row, index) => ({
                id: index.toString(),
                x: Number(row.umap_0),
                y: Number(row.umap_1),
                smiles: row.smiles,
                properties: {
                  molwt: row.molwt,
                  homo_eV: row.homo_eV,
                  lumo_eV: row.lumo_eV,
                  esp_min_eV: row.esp_min_eV,
                  esp_max_eV: row.esp_max_eV
                },
                rawData: row
              }));
            
            setGraphData(nodes);
            setFilteredGraphData(nodes);
            
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
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setError(`Parse error: ${error}`);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    if (isAuthenticated) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Apply filters based on range slider values
  useEffect(() => {
    if (graphData.length === 0) return;
    const filtered = graphData.filter(node => {
      for (const [property, range] of Object.entries(filterRanges)) {
        if (!range.active) continue;
        const nodeValue = node.properties[property];
        // If property is outside the range, filter it out
        if (nodeValue !== undefined && nodeValue !== null && 
            (nodeValue < range.range[0] || nodeValue > range.range[1])) {
          return false;
        }
      }
      return true;
    });
    if (JSON.stringify(filtered) !== JSON.stringify(filteredGraphData)) {
      setFilteredGraphData(filtered);
    }
  }, [graphData, filterRanges, filteredGraphData]);

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
        return node.x; // Default color based on x coordinate
      }),
      colorscale: [
        [0, '#3498db'],
        [0.5, '#2ecc71'],
        [1, '#e74c3c']
      ],
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
      `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(4) : 'N/A'}<br>` +
      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(4) : 'N/A'}`
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
      color: filteredGraphData.map(node => node.x),
      colorscale: [
        [0, '#3498db'],
        [0.5, '#2ecc71'],
        [1, '#e74c3c']
      ],
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
  }];

  // Count how many filters are active
  const activeFilterCount = Object.values(filterRanges).filter(range => range.active).length;

  // If authentication is still being checked, show loading spinner
  if (authLoading) {
    return <div className="app-loading">Loading...</div>;
  }
  
  // If not authenticated and not on About page, show login page
  if (!isAuthenticated && activePage !== 'about') {
    return <AuthPage />;
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
      />
      
      <header className="App-header">
        <div className="header-content">
          <div className="header-links">
            <a 
              href="#"
              className={`header-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('about'); }}
            >
              About
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'explorer' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('explorer'); }}
            >
              Filter
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'search' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('search'); }}
            >
              Simple Search
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'chatbot' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('chatbot'); }}
            >
              Chat
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'enterprise' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('enterprise'); }}
            >
              Enterprise Search
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
            <div className="graph-container">
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
            
            <div className="info-panel">
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
              </div>
            </div>
          </>
        ) : activePage === 'about' ? (
          <About />
        ) : activePage === 'chatbot' ? (
          checkPageAccess('chatbot') ? <ChatbotInterface /> : <PermissionsError />
        ) : activePage === 'enterprise' ? (
          checkPageAccess('enterprise') ? <EnterpriseSearch /> : <PermissionsError />
        ) : (
          // SEARCH PAGE CONTENT:
          <div className="search-container">
            <div className="search-umap-container">
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
                    placeholder="Enter SMILES string..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <button 
                    className="search-button"
                    onClick={handleSearch}
                    disabled={searchLoading}
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
                
                {/* Search results display */}
                <div className="search-results">
                  {searchLoading && (
                    <div className="search-loading">
                      <div className="loading-spinner"></div>
                      <p>Searching for molecule...</p>
                    </div>
                  )}
                
                  {searchError && (
                    <div className="search-error">
                      <p>{searchError}</p>
                    </div>
                  )}
                  
                  {searchResult && (
                    <div className="molecule-details">
                      <h2>Molecule Visualization</h2>
                      
                      {searchedMolecule ? (
                        <div className="molecule-data">
                          <h3>Properties</h3>
                          {!highlightedMolecule && searchedMolecule && (
                            <div className="molecule-found-in-csv">
                              <p>This molecule was found in the database but is not displayed in the current UMAP view.</p>
                            </div>
                          )}
                          <table className="property-table">
                            <tbody>
                              <tr>
                                <td className="property-name">SMILES</td>
                                <td className="property-value">{searchedMolecule.smiles}</td>
                              </tr>
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
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="molecule-not-found">
                          <p>This molecule was not found in our UMAP dataset.</p>
                        </div>
                      )}
                      
                      <img 
                        src={searchResult} 
                        alt="Molecule visualization" 
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          marginTop: '20px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Node popup */}
      {showPopup && selectedNode && <NodePopup node={selectedNode} onClose={handleClosePopup} />}
    </div>
  );
};

export default App;