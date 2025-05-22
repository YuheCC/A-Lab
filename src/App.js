import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import MoleculeFeedbackBox from './components/MoleculeFeedbackBox';
import Navbar from './components/Navbar.js';
import PasswordReset from './components/PasswordReset.js';
import Slider from './components/Slider.js';
import UMAPClusterPlot from './components/UMAPClusterPlot.js';
import AboutPage from './pages/AboutPage.js';
import AuthPage from './pages/AuthPage.js';
import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
import PricingPage from './pages/PricingPage.js';
import RedeemPage from './pages/RedeemPage.js';
import TermsPage from './pages/TermsPage.js';
import SearchInput from './Search';

import API_URL from './Constants.js'; // Contains API URL and any other constants
import { authFetch, redirectToLogin } from './utils.js';

import './App.css';

const FavoritesGrid = lazy(() => import('./FavoritesGrid.js'));
const ChatbotInterface = lazy(() => import('./Chatbox.js'));


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
  // Add state for find-friend error message
  const [findFriendError, setFindFriendError] = useState(null);
  // New state for temporary filter values during dragging
  const [tempFilterRanges, setTempFilterRanges] = useState({});

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

  const MAX_NODES = 23000;

  // Add new state for highlighted molecule
  const [highlightedMolecules, setHighlightedMolecules] = useState(null);

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
    setFindFriendError(null); // Reset find friend error

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
          // Prepare JSON payload for finding friends (default version, no extra params)
          const isHighTier = ["admin", "enterprise", "joint"].includes(userPermissions);

          const payload = {
            smiles: formattedMolecule.smiles.trim(),
            use_35m: isHighTier
          };

          try {
            const response = await authFetch(`${API_URL}/find-friend-with-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
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
          } catch (friendError) {
            console.error('Error finding similar molecules:', friendError);
            setFindFriendError('Failed to find similar molecules. Please try again.');
          }
        }
      }
    } catch (apiError) {
      console.error('Error checking Snowflake database:', apiError);
      setSearchError('Error searching for molecules. Please try again.');
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
  }, [API_URL, activePage]);

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
    setFilteredGraphData(filtered);
  }, [graphData, filterRanges, selectedFunctionalGroup]);

  // Handle filter slider change
  const handleFilterChange = (property, newValue, isCommitted) => {
    if (isCommitted) {
      // When dragging is complete, update the actual filter
      setFilterRanges(prev => ({
        ...prev,
        [property]: {
          ...prev[property],
          range: newValue,
          active: true
        }
      }));
    } else {
      // During dragging, just update the temporary display
      setTempFilterRanges(prev => ({
        ...prev,
        [property]: newValue
      }));
    }
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
    
    // Also clear any temporary values for this property
    setTempFilterRanges(prev => {
      const newTempRanges = { ...prev };
      delete newTempRanges[property];
      return newTempRanges;
    });
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
    
    // Clear all temporary filter values
    setTempFilterRanges({});
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
        throw new Error('Authentication required to add favorites');
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
      
      // Set success for this specific molecule
      setMoleculeFavoriteStatus(prev => ({
        ...prev,
        [smiles]: { loading: false, success: 'Molecule added to favorites successfully!', error: null }
      }));
      
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

  // NodePopup component for displaying molecule information
  const NodePopup = ({ node, onClose, filterLabels, handleAddToFavorites, moleculeFavoriteStatus }) => {
    if (!node) return null;

    const copyToClipboard = () => {
      const nodeData = JSON.stringify(node.rawData, null, 2);
      navigator.clipboard.writeText(nodeData)
        .then(() => {
          alert('Molecule information copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy molecule data: ', err);
        });
    };

    return (
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content black-bg" onClick={e => e.stopPropagation()}>
          <button className="close-button white-text" onClick={onClose}>×</button>
          <h2 className="white-text">Molecule Details</h2>
          <div className="popup-data">
            <h3 className="white-text">SMILES</h3>
            <p className="dark-field">{node.smiles}</p>

            <h3 className="white-text">UMAP Coordinates</h3>
            <p className="dark-field">X: {node.x.toFixed(2)}, Y: {node.y.toFixed(2)}</p>

            <h3 className="white-text">Properties</h3>
            <table className="property-table dark-table">
              <tbody>
                {Object.entries(node.properties || {}).map(([key, value]) => (
                  <tr key={key}>
                    <td className="property-name white-text">{filterLabels[key] || key}</td>
                    <td className="property-value white-text">
                      {value !== null && value !== undefined 
                        ? typeof value === 'number' 
                          ? key === 'CLUSTER' 
                            ? Math.round(value) 
                            : value.toFixed(2) 
                          : value.toString()
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                className="copy-button" 
                onClick={copyToClipboard}
              >
                Copy All Data
              </button>
              <div style={{ marginTop: '10px' }}></div>
              <button 
                className="favorites-button" 
                onClick={() => handleAddToFavorites(node)}
                style={{
                  backgroundColor: '#0080ff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 15px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0080ff'}
              >
                Add to Favorites ★
              </button>
              {moleculeFavoriteStatus[node.smiles]?.loading && (
                <div style={{ marginTop: '5px', color: '#aaa' }}>Saving...</div>
              )}
              {moleculeFavoriteStatus[node.smiles]?.success && (
                <div style={{ marginTop: '5px', color: '#4CAF50' }}>{moleculeFavoriteStatus[node.smiles].success}</div>
              )}
              {moleculeFavoriteStatus[node.smiles]?.error && (
                <div style={{ marginTop: '5px', color: '#F44336' }}>{moleculeFavoriteStatus[node.smiles].error}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
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

      <header className="App-header">
        <div className="header-content">
          <div className="header-links">
            <a
              href="/map"
              className={`header-link ${activePage === 'map' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('map'); }}
            >
              Map
            </a>
            <a
              href="/ask"
              className={`header-link ${activePage === 'chatbot' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('chatbot'); }}
            >
              Ask
            </a>
            <a
              href="/search"
              className={`header-link ${activePage === 'search' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('search'); }}
            >
              Search
            </a>
            <a
              href="/filter"
              className={`header-link ${activePage === 'explorer' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('explorer'); }}
            >
              Filter
            </a>
            <a
              href="/favorites"
              className={`header-link ${activePage === 'favorites' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavigation('favorites'); }}
            >
              Favorites
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
                      <UMAPClusterPlot
                        data={filteredGraphData}
                        highlightedData={highlightedMolecules}
                        highlightedSimilarData={highlightedSimilarMolecules}
                        userPermissions={userPermissions}
                        onClick={handlePointClick}
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
                    {Object.entries(filterRanges).map(([property, range]) => {
                      // Hide predicted_mp and predicted_bp sliders for users without proper permissions
                      if ((property === 'predicted_mp' || property === 'predicted_bp') &&
                        !(userPermissions === 'admin' || userPermissions === 'joint' || userPermissions === 'enterprise')) {
                        return null;
                      }

                      // Use temporary range value if available during dragging
                      const displayValue = tempFilterRanges[property] || range.range;

                      return (
                        <div key={property} className="filter-wrapper">
                          <Slider
                            property={property}
                            value={displayValue}
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
                      );
                    })}
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
              <div className="map-text-section left-text" style={{ 
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
                      <UMAPClusterPlot
                        data={filteredGraphData}
                        highlightedData={highlightedMolecules}
                        highlightedSimilarData={highlightedSimilarMolecules}
                        userPermissions={userPermissions}
                        onClick={handlePointClick}
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
                  <div style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '14px' }}>
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
              <p style={{ fontSize: '10.5px', marginTop: '8px', marginBottom: '0' }}>
                This interactive UMAP runs best on devices from 2019 or newer with at least 8 GB RAM and a modern processor (e.g. Apple M1+, Intel i5+), as older or lower-end systems may experience lag or loading issues.
              </p>
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
              <Suspense fallback={<div className="app-loading">Loading...</div>}>
                <ChatbotInterface
                  messages={chatMessages}
                  setMessages={setChatMessages}
                  userPermissions={userPermissions}
                  remainingQueries={remainingQueries}
                  setRemainingQueries={setRemainingQueries}
                />
              </Suspense>
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
        ) : activePage === 'favorites' ? (
          <div className="favorites-page-container" style={{ display: 'flex', height: 'calc(100vh - 170px)', paddingLeft: '0', paddingTop: '20px' }}>
            {/* Left navigation column */}
            <div className="map-text-section left-text" style={{ 
              width: '7%', 
              overflowY: 'auto', 
              padding: '20px', 
              backgroundColor: '#f1f1f1', 
              borderRadius: '0 8px 8px 0', 
              marginLeft: '0', 
              marginRight: '0',
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
          </div>
        ) : (
          // SEARCH PAGE CONTENT:
          <div className="search-container">
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
            <div className="search-umap-container" style={{ paddingLeft: '0', marginLeft: '0' }}>

              {/* UMAP Visualization on the left */}
              <div className="search-umap-section">
                <div className="graph-container search-graph">
                  <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {filteredGraphData.length > 0 ? (
                       <UMAPClusterPlot
                        data={filteredGraphData}
                        highlightedData={highlightedMolecules}
                        highlightedSimilarData={highlightedSimilarMolecules}
                        userPermissions={userPermissions}
                        onClick={handlePointClick}
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
              <div className="search-interface-section" style={{ 
                  overflowY: 'auto', 
                  padding: '20px', 
                  backgroundColor: '#f9f9f9', 
                  borderRadius: '8px',
                  flex: '0.8'
                  }}>
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
                              <h4>Molecule #{index + 1}</h4>
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
                                    <td className="property-name"></td>
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
                                    <td className="property-value">{molecule.x !== undefined && molecule.x !== null ? molecule.x.toFixed(2) : 'N/A'}</td>
                                  </tr>
                                  <tr>
                                    <td className="property-name">UMAP_Y</td>
                                    <td className="property-value">{molecule.y !== undefined && molecule.y !== null ? molecule.y.toFixed(2) : 'N/A'}</td>
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
                              
                              {/* Add Favorites button */}
                              <div className="favorites-container" style={{ textAlign: 'center' }}>
                                <button
                                  className="favorites-button"
                                  onClick={() => handleAddToFavorites(molecule)}
                                  disabled={moleculeFavoriteStatus[molecule.smiles]?.loading}
                                  style={{
                                    backgroundColor: '#0080ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 15px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'background-color 0.3s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0080ff'}
                                >
                                  {moleculeFavoriteStatus[molecule.smiles]?.loading ? 'Saving...' : 'Add to Favorites ★'}
                                </button>
                                
                                {moleculeFavoriteStatus[molecule.smiles]?.success && (
                                  <div className="success-message" style={{ 
                                    marginTop: '8px', 
                                    color: 'green', 
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}>
                                    {moleculeFavoriteStatus[molecule.smiles].success}
                                  </div>
                                )}
                                
                                {moleculeFavoriteStatus[molecule.smiles]?.error && (
                                  <div className="error-message" style={{ 
                                    marginTop: '8px', 
                                    color: 'red', 
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}>
                                    {moleculeFavoriteStatus[molecule.smiles].error}
                                  </div>
                                )}
                                
                                {/* Display find-friend error below favorites button if it exists */}
                                {findClosestFriends && findFriendError && (
                                  <div className="error-message" style={{ 
                                    marginTop: '8px', 
                                    color: 'red', 
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                  }}>
                                    {findFriendError}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {findClosestFriends && similarMolecules && similarMolecules.length > 0 && (
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
                                          ? molecule.UMAP_0.toFixed(2)
                                          : 'N/A'}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="property-name">UMAP_Y</td>
                                      <td className="property-value">
                                        {molecule.UMAP_1 !== null && molecule.UMAP_1 !== undefined
                                          ? molecule.UMAP_1.toFixed(2)
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
                                          
                                          {/* Add Favorites button for similar molecules */}
                                          <div className="favorites-container" style={{ textAlign: 'center' }}>
                                            <button
                                              className="favorites-button"
                                              onClick={() => handleAddToFavorites({
                                                smiles: molecule.SMILES,
                                                properties: {
                                                  molwt: molecule.molecular_weight,
                                                  homo_eV: molecule.HOMO_eV,
                                                  lumo_eV: molecule.LUMO_eV,
                                                  esp_min_eV: molecule.ESP_min_eV,
                                                  esp_max_eV: molecule.ESP_max_eV,
                                                  predicted_mp: molecule.predicted_MP_celsius,
                                                  predicted_bp: molecule.predicted_BP_celsius,
                                                  functional_groups: molecule.functional_groups
                                                },
                                                x: molecule.UMAP_0,
                                                y: molecule.UMAP_1
                                              })}
                                              disabled={moleculeFavoriteStatus[molecule.SMILES]?.loading}
                                              style={{
                                                backgroundColor: '#0080ff',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '8px 15px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                transition: 'background-color 0.3s',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                              }}
                                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0066cc'}
                                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0080ff'}
                                            >
                                              {moleculeFavoriteStatus[molecule.SMILES]?.loading ? 'Saving...' : 'Add to Favorites ★'}
                                            </button>
                                            
                                            {moleculeFavoriteStatus[molecule.SMILES]?.success && (
                                              <div className="success-message" style={{ 
                                                marginTop: '8px', 
                                                color: 'green', 
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                              }}>
                                                {moleculeFavoriteStatus[molecule.SMILES].success}
                                              </div>
                                            )}
                                            
                                            {moleculeFavoriteStatus[molecule.SMILES]?.error && (
                                              <div className="error-message" style={{ 
                                                marginTop: '8px', 
                                                color: 'red', 
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                              }}>
                                                {moleculeFavoriteStatus[molecule.SMILES].error}
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td style={{
                                        width: '100%'
                                      }}>
                                        <MoleculeFeedbackBox 
                                          molecule={molecule} 
                                          lastSearch={lastSearch} 
                                          onClose={() => {}} 
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                                {/* Add thumbs up/down buttons here */}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {(lastSearch && !searchLoading && (searchedMolecules === null || searchedMolecules.length == 0)) && (
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