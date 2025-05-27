import { lazy, Suspense, useEffect, useState } from 'react';
import Navbar from './components/Navbar.js';
import PasswordReset from './components/PasswordReset.js';
import AboutPage from './pages/AboutPage.js';
import AuthPage from './pages/AuthPage.js';
import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
import PricingPage from './pages/PricingPage.js';
import RedeemPage from './pages/RedeemPage.js';
import TermsPage from './pages/TermsPage.js';

import API_URL from './Constants.js'; // Contains API URL and any other constants
import { authFetch, redirectToLogin } from './utils.js';

import './App.css';
import Header from './components/Header.js';
import Sidebar from './components/Sidebar.js';
import NodePopup from './components/NodePopup.js';
import ExplorerPage, { filterLabels } from './pages/ExplorerPage.js';
import MapPage from './pages/MapPage.js';
import SearchPage from './pages/SearchPage.js';

const FavoritesGrid = lazy(() => import('./FavoritesGrid.js'));
const ChatbotInterface = lazy(() => import('./Chatbox.js'));

const App = () => {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activePage, setActivePage] = useState('map');

  // New state for feedback functionality
  // const [feedbackOpen, setFeedbackOpen] = useState(false);
  // const [feedbackMoleculeIndex, setFeedbackMoleculeIndex] = useState(null);
  // const [feedbackText, setFeedbackText] = useState('');
  // const [feedbackType, setFeedbackType] = useState(null); // 'up' or 'down'

  // Add state for favorites functionality - using molecule-specific tracking
  const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState({});

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

  const MAX_NODES = 23000;

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
        if (path === '/about' || path === '/' || path === '/map' || path === '/pricing' || path === '/terms' || path === '/redeem' || path === '/password-reset' || path === '/ask' || path === '/search' || path === '/filter') {
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
          } else if (path === '/map') {
            setActivePage('map');
          } else if (path === '/ask') {
            setActivePage('chatbot');
          } else if (path === '/search') {
            setActivePage('search');
          } else if (path === '/filter') {
            setActivePage('explorer');
          } else if (path === '/') {
            // Redirect root to map
            window.history.pushState({}, '', '/map');
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
      } else if (path === '/map') {
        setActivePage('map');
      } else if (path === '/ask') {
        setActivePage('chatbot');
      } else if (path === '/search') {
        setActivePage('search');
      } else if (path === '/filter') {
        setActivePage('explorer');
      } else if (path === '/favorites') {
        setActivePage('favorites');
      } else if (path === '/') {
        // Redirect root to map
        window.history.pushState({}, '', '/map');
        setActivePage('map');
      } else {
        // Redirect any other route to map
        window.history.pushState({}, '', '/map');
        setActivePage('map');
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
    } else if (page === 'map') {
      window.history.pushState({}, '', '/map');
    } else if (page === 'chatbot') {
      window.history.pushState({}, '', '/ask');
    } else if (page === 'search') {
      window.history.pushState({}, '', '/search');
    } else if (page === 'explorer') {
      window.history.pushState({}, '', '/filter');
    } else if (page === 'favorites') {
      window.history.pushState({}, '', '/favorites');
    } else {
      // Keep the URL as root for any other pages
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    }

    // Special case for enterprise (advanced search) tab
    if (page === 'enterprise' && activePage === 'search') {
      // Then navigate to enterprise tab
      setActivePage(page);
      return;
    }

    setActivePage(page);
  };

  // Move checkPageAccess inside App component
  const checkPageAccess = (page) => {
    // Allow all users (including non-authenticated) to access the map page and pricing page
    if (page === 'map' || page === 'pricing' || page === 'terms' || page === 'favorites') {
      return true;
    }

    // Research users can access About, Filter, Simple Search, and Chat pages
    if (userPermissions === 'research') {
      return ['about', 'explorer', 'search', 'chatbot', 'favorites'].includes(page);
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

    if (userPermissions === 'enterprise') {
      return true;
    }

    if (userPermissions === 'joint') {
      return true;
    }

    // Default to no access
    return false;
  };

  // Update PermissionsError component to show different messages based on user type
  const PermissionsError = () => {
    let message = '';
    let buttonText = '';
    let buttonAction = () => { };

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
        const response = await authFetch(`${API_URL}/verify-token`);

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUsername(data.username);
          setUserPermissions(data.permissions || 'research');

          if (activePage === 'login') {
            setActivePage('map');
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
  }, [activePage]);

  useEffect(() => {
    async function loadData() {
      // Remove the isAuthenticated check to allow data loading for all users
      try {
        setLoading(true);
        // Replace CSV fetching with Snowflake API endpoint
        const response = await authFetch(`${API_URL}/snowflake-query`);
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
              functional_groups: row.FUNCTIONAL_GROUPS,
              predicted_mp: row.PREDICTED_MP,
              predicted_bp: row.PREDICTED_BP,
              chemical_formula: row.CHEMICAL_FORMULA,
              CLUSTER: row.CLUSTER
            },
            rawData: row
          }));

        setGraphData(nodes);
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

  // Handle clicks on Plotly points
  const handlePointClick = (evt, node) => {
    if (!evt.points || evt.points.length === 0) return;
    if (node) {
      setSelectedNode(node);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


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

  // Function to handle adding molecule to favorites
  const handleAddToFavorites = async (molecule) => {
    // Use SMILES as unique identifier for the molecule
    const smiles = molecule.smiles;

    // Update state for just this specific molecule
    setMoleculeFavoriteStatus(prev => ({
      ...prev,
      [smiles]: { loading: true, success: null, error: null }
    }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to add favorites');
      }

      // Prepare favorite data from molecule properties
      const favoriteData = {
        smiles: molecule.smiles,
        molecular_weight: molecule.properties?.molwt || null,
        homo_ev: molecule.properties?.homo_eV || null,
        lumo_ev: molecule.properties?.lumo_eV || null,
        esp_min_ev: molecule.properties?.esp_min_eV || null,
        esp_max_ev: molecule.properties?.esp_max_eV || null,
        predicted_melting_point: molecule.properties?.predicted_mp || null,
        predicted_boiling_point: molecule.properties?.predicted_bp || null,
        functional_groups: molecule.properties?.functional_groups || null,
        umap_x: molecule.x || null,
        umap_y: molecule.y || null
      };

      const response = await authFetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(favoriteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add to favorites');
      }

      const data = await response.json();
      
      // Check if the molecule was already in favorites
      if (data.message === "Molecule already in favorites") {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { loading: false, success: data.message, error: null }
        }));
      } else {
        // Set success for this specific molecule
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { loading: false, success: 'Molecule added to favorites successfully!', error: null }
        }));
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { ...prev[smiles], success: null }
        }));
      }, 3000);

    } catch (error) {
      console.error('Error adding to favorites:', error);

      // Set error for this specific molecule
      setMoleculeFavoriteStatus(prev => ({
        ...prev,
        [smiles]: { loading: false, success: null, error: error.message || 'Failed to add to favorites' }
      }));

      // Hide error message after 3 seconds
      setTimeout(() => {
        setMoleculeFavoriteStatus(prev => ({
          ...prev,
          [smiles]: { ...prev[smiles], error: null }
        }));
      }, 3000);
    }
  };

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

      <Header
        activePage={activePage}
        handleNavigation={handleNavigation}></Header>

      <div className="main-container">
        {activePage === 'permissions-error' ? (
          <PermissionsError />
        ) : activePage === 'explorer' ? (
          <ExplorerPage 
            userPermissions={userPermissions}
            handlePointClick={handlePointClick}
            loading={loading}
            error={error}
            data={graphData} 
            handleNavigation={handleNavigation} 
            activePage={activePage}/>
        ) : activePage === 'map' ? (
          <MapPage 
            data={graphData} 
            userPermissions={userPermissions} 
            handlePointClick={handlePointClick} 
            activePage={activePage} 
            loading={loading}
            error={error}
            handleNavigation={handleNavigation}></MapPage>
        ) : activePage === 'chatbot' ? (
          checkPageAccess('chatbot') ? (
            <Sidebar activePage={activePage} handleNavigation={handleNavigation}>
              <Suspense fallback={<div className="app-loading">Loading...</div>}>
                <ChatbotInterface
                  messages={chatMessages}
                  setMessages={setChatMessages}
                  userPermissions={userPermissions}
                  remainingQueries={remainingQueries}
                  setRemainingQueries={setRemainingQueries}
                />
              </Suspense>
            </Sidebar>
          ) : (
            <PermissionsError />
          )
        ) : activePage === 'pricing' ? (
          <PricingPage onSignIn={handleSignIn} handleNavigation={handleNavigation} activePage={activePage} />
        ) : activePage === 'terms' ? (
          <TermsPage handleNavigation={handleNavigation} activePage={activePage} />
        ) : activePage === 'about' ? (
          <AboutPage handleNavigation={handleNavigation} activePage={activePage} />
        ) : activePage === 'favorites' ? (
          <Sidebar activePage={activePage} handleNavigation={handleNavigation}>
            {/* Main content area */}
            <div className="favorites-content-wrapper" style={{
              flex: '1',
              padding: '0 20px',
              height: '100%',
              overflowY: 'auto',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <Suspense fallback={<div className="app-loading">Loading...</div>}>
                <FavoritesGrid />
              </Suspense>
            </div>
          </Sidebar>
        ) : (
          <SearchPage
            handleNavigation={handleNavigation}
            activePage={activePage}
            data={graphData}
            userPermissions={userPermissions}
            handlePointClick={handlePointClick}
            loading={loading}
            error={error}
            moleculeFavoriteStatus={moleculeFavoriteStatus}
            handleAddToFavorites={handleAddToFavorites}
            />
        )}
      </div>

      {/* Node popup */}
      {showPopup && selectedNode && <NodePopup
        node={selectedNode}
        onClose={handleClosePopup}
        filterLabels={filterLabels}
        handleAddToFavorites={handleAddToFavorites}
        moleculeFavoriteStatus={moleculeFavoriteStatus}
      />}
    </div>
  );
};

export default App;