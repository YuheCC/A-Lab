import MolViewer2D from "./MolViewer2D";
import { COMMERCIAL_SCORE_MAP } from "@/utils";
import { useTranslation } from 'react-i18next';
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAuthStore } from "@/models/useAuth";
import { filterLabels } from "@/utils";
import { authFetch, getAPIUrl } from "@/utils";

const API_URL = getAPIUrl();

interface NodePopupProps {
  node: any;
}

// NodePopup component for displaying molecule information
const NodePopup = forwardRef(({ node }: NodePopupProps, ref) => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userPermissions = useAuthStore(state => state.userPermissions);
  const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState<any>({});
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    show: () => setShow(true),
    hide: () => setShow(false),
  }));

  useEffect(() => {
    const handleContextMenu = (e: any) => {
      e.preventDefault();
    };

    // 添加右键禁用事件监听器
    document.addEventListener('contextmenu', handleContextMenu);
    
    // 清理事件监听器
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [])
  
  if (!node) return null;

  // Check if user has permission to see predicted properties
  const canSeePredictedProperties = isAuthenticated && (userPermissions === 'admin' || userPermissions === 'enterprise');

  const copyToClipboard = () => {
    const nodeData = JSON.stringify(node.rawData, null, 2);
    navigator.clipboard.writeText(nodeData)
      .then(() => {
        alert(t('molecular.nodePopup.copySuccess'));
      })
      .catch(err => {
        console.error(t('molecular.nodePopup.copyError'), err);
      });
  };

  // Function to handle adding molecule to favorites
  const handleAddToFavorites = async (molecule: any) => {
    // Use SMILES as unique identifier for the molecule
    const smiles = molecule.smiles;

    // Update state for just this specific molecule
    setMoleculeFavoriteStatus((prev: any) => ({
      ...prev,
      [smiles]: { loading: true, success: null, error: null }
    }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error(t('chatbox.errors.loginRequired'));
      }

      // Get the raw commercial score (numeric 0-3)
      const rawCommercialScore = molecule.properties?.commercial_score || molecule.properties?.COMMERCIAL_SCORE;
      
      // Convert commercial score from numeric to descriptive text
      const commercialScoreText = rawCommercialScore !== null && rawCommercialScore !== undefined 
        ? COMMERCIAL_SCORE_MAP[rawCommercialScore as keyof typeof COMMERCIAL_SCORE_MAP] || null
        : null;

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
        predicted_fp_celsius: molecule.properties?.predicted_fp_celsius || molecule.properties?.predicted_fp || null,
        combustion_enthalpy_ev: molecule.properties?.combustion_enthalpy_ev || molecule.properties?.combustion_enthalpy || null,
        commercial_score: commercialScoreText,
        commercial_link: molecule.properties?.commercial_link || molecule.COMMERCIAL_LINK || null,
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
        throw new Error(errorData.detail || t('chatbox.errors.addToFavoritesError'));
      }

      const data = await response.json();

      // Check if the molecule was already in favorites
      if (data.message === "Molecule already in favorites") {
        setMoleculeFavoriteStatus((prev: any) => ({
          ...prev,
          [smiles]: { loading: false, success: t('chatbox.success.alreadyInFavorites'), error: null }
        }));
      } else {
        // Set success for this specific molecule
        setMoleculeFavoriteStatus((prev: any) => ({
          ...prev,
          [smiles]: { loading: false, success: t('chatbox.success.addedToFavorites'), error: null }
        }));
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setMoleculeFavoriteStatus((prev: any) => ({
          ...prev,
          [smiles]: { ...prev[smiles], success: null }
        }));
      }, 3000);

    } catch (error) {
      console.error('Error adding to favorites:', error);

      // Set error for this specific molecule
      setMoleculeFavoriteStatus((prev: any) => ({
        ...prev,
        [smiles]: { loading: false, success: null, error: (error as any)?.message || t('chatbox.errors.addToFavoritesError') }
      }));

      // Hide error message after 3 seconds
      setTimeout(() => {
        setMoleculeFavoriteStatus((prev: any) => ({
          ...prev,
          [smiles]: { ...prev[smiles], error: null }
        }));
      }, 3000);
    }
  };

  return (
    <div className="popup-overlay" onClick={() => setShow(false)} style={{ userSelect: 'none' }}>
      <div className="popup-content black-bg" onClick={e => e.stopPropagation()}>
        <button className="close-button white-text" onClick={() => setShow(false)}>×</button>
        <h2 className="white-text" style={{ textAlign: 'center' }}>{t('molecular.nodePopup.title')}</h2>
        <div className="popup-data">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <MolViewer2D smile={node.smiles} theme="dark"/>
          </div>
          <h3 className="white-text" style={{ textAlign: 'center' }}>{t('molecular.nodePopup.smiles')}</h3>
          <p className="dark-field" style={{ textAlign: 'center' }}>{node.smiles}</p>

          <h3 className="white-text" style={{ textAlign: 'center' }}>{t('molecular.nodePopup.umapCoordinates')}</h3>
          <p className="dark-field" style={{ textAlign: 'center' }}>X: {node.x.toFixed(2)}, Y: {node.y.toFixed(2)}</p>

          <h3 className="white-text" style={{ textAlign: 'center' }}>{t('molecular.nodePopup.properties')}</h3>
          <table className="property-table dark-table" style={{ margin: '0 auto' }}>
            <tbody>
              {Object.entries(node.properties || {})
                .filter(([key, value]) => {
                  // Hide commercial_link row if value is "N/A"
                  if (key === 'commercial_link' && (value === 'N/A' || value === null || value === undefined)) {
                    return false;
                  }
                  
                  // Hide predicted properties for users without proper permissions
                  if (!canSeePredictedProperties && 
                      (key === 'predicted_mp' || key === 'predicted_bp' || key === 'predicted_fp' || key === 'predicted_fp_celsius')) {
                    return false;
                  }
                  
                  return true;
                })
                .map(([key, value]) => (
                <tr key={key}>
                  <td className="property-name white-text">{filterLabels[key as keyof typeof filterLabels] || key}</td>
                  <td className="property-value white-text">
                    {value !== null && value !== undefined
                      ? key === 'commercial_score' && typeof value === 'number'
                        ? COMMERCIAL_SCORE_MAP[value as keyof typeof COMMERCIAL_SCORE_MAP] || 'N/A'
                        : typeof value === 'number'
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
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
              {/* <button
                className="copy-button"
                onClick={copyToClipboard}
                style={{ flex: '1', maxWidth: '140px' }}
              >
                {t('molecular.nodePopup.copyAllData')}
              </button> */}
              <button
                className="favorites-button"
                onClick={() => {
                  // Ensure the properties object has the correct keys for favorites
                  const properties = node.properties || {};
                  
                  // Keep the raw commercial score (numeric 0-3) for the backend
                  // Don't convert to text here - let handleAddToFavorites do the conversion
                  const rawCommercialScore = properties.commercial_score ?? properties.COMMERCIAL_SCORE;
                  
                  const mappedNode = {
                    ...node,
                    properties: {
                      ...properties,
                      predicted_mp: properties.predicted_mp,
                      predicted_bp: properties.predicted_bp,
                      predicted_fp: properties.predicted_fp_celsius || properties.predicted_fp,
                      combustion_enthalpy: properties.combustion_enthalpy_ev || properties.combustion_enthalpy,
                      commercial_score: rawCommercialScore, // Keep the numeric value, don't convert to text
                      commercial_link: properties.commercial_link || properties.COMMERCIAL_LINK || null,
                    }
                  };
                  handleAddToFavorites(mappedNode);
                }}
                style={{ flex: '1', maxWidth: '140px' }}
              >
                {t('molecular.nodePopup.addToFavorites')}
              </button>
            </div>
            {moleculeFavoriteStatus[node.smiles]?.loading && (
              <div style={{ color: '#aaa', fontSize: '14px' }}>{t('molecular.nodePopup.saving')}</div>
            )}
            {moleculeFavoriteStatus[node.smiles]?.success && (
              <div style={{ color: '#4CAF50', fontSize: '14px' }}>{moleculeFavoriteStatus[node.smiles].success}</div>
            )}
            {moleculeFavoriteStatus[node.smiles]?.error && (
              <div style={{ color: '#F44336', fontSize: '14px' }}>{moleculeFavoriteStatus[node.smiles].error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default NodePopup;