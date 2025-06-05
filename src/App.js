import { lazy, Suspense, useEffect, useState } from 'react';
import PasswordReset from './components/PasswordReset.js';
import AboutPage from './pages/AboutPage.js';
import AuthPage from './pages/AuthPage.js';
import ForgotPasswordPage from './pages/ForgotPasswordPage.js';
import PricingPage from './pages/PricingPage.js';
import RedeemPage from './pages/RedeemPage.js';
import TermsPage from './pages/TermsPage.js';
import { authFetch } from './utils.js';

import './App.css';
import Sidebar from './components/Sidebar.js';
import NodePopup from './components/NodePopup.js';
import ExplorerPage, { filterLabels } from './pages/ExplorerPage.js';
import MapPage from './pages/MapPage.js';
import SearchPage from './pages/SearchPage.js';
import PermissionsErrorPage from './pages/PermissionsErrorPage.js';

import { usePlotDataStore } from './providers/plotData.js';
import { Route, Routes } from 'react-router';
import { ProtectedRoute, useAuthStore } from './providers/auth.js';
import FullNavLayout from './layouts/FullNavLayout.js';

const API_URL = process.env.REACT_APP_API_URL;

const FavoritesGrid = lazy(() => import('./FavoritesGrid.js'));
const ChatbotInterface = lazy(() => import('./Chatbox.js'));

const App = () => {

  const [selectedNode, setSelectedNode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

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

  const fetchData = usePlotDataStore(state => state.fetchData);
  const { verifyAuth } = useAuthStore();

  // Handle onMount events
  // Add global CSS styles for containers
  useEffect(() => {
    // Verify auth tokens if they are present
    verifyAuth();

    // Load graph data
    fetchData();

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyAuth]);

  // Handle clicks on Plotly points
  const handlePointClick = (evt) => {
    setSelectedNode(evt);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Add state for query limits
  // Query limits are now managed on the server side
  const [remainingQueries, setRemainingQueries] = useState(0);

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
      <Routes>
        {/* Full Page Routes */}
        <Route>
          <Route path="/login" element={<AuthPage />}/>
          <Route path="/redeem" element={<RedeemPage />}/>
          <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
        </Route>

        {/* Nav Bar & Header Routes */}
        <Route element={<FullNavLayout />}>
          <Route index element={<MapPage handlePointClick={handlePointClick} />} />
          <Route path="/map" element={<MapPage handlePointClick={handlePointClick} />} />
          <Route path="/pricing" element={<PricingPage />}/>
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/filter" element={
            <ProtectedRoute>
              <ExplorerPage handlePointClick={handlePointClick} />
            </ProtectedRoute>} />
            
          <Route path="/ask" element={
            <ProtectedRoute>
              <Sidebar>
                <Suspense fallback={<div className='loading-screen'>Loading...</div>}>
                  <ChatbotInterface
                    messages={chatMessages}
                    setMessages={setChatMessages}
                    remainingQueries={remainingQueries}
                    setRemainingQueries={setRemainingQueries}
                  />
                </Suspense>
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/favorites" element={
            <ProtectedRoute>
              <Sidebar>
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
                  <Suspense fallback={<div className='loading-screen'>Loading...</div>}>
                    <FavoritesGrid />
                  </Suspense>
                </div>
              </Sidebar>
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <SearchPage
                handlePointClick={handlePointClick}
                moleculeFavoriteStatus={moleculeFavoriteStatus}
                handleAddToFavorites={handleAddToFavorites}
              />
            </ProtectedRoute>
          } />

          <Route path="/reset-password" element={
            <ProtectedRoute>
              <PasswordReset />
            </ProtectedRoute>
          }/>
          <Route path="/unauthorized" element={<PermissionsErrorPage />}/>
        </Route>
      </Routes>      

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