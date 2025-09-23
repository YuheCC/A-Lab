import MolViewer2D from "./MolViewer2D";
import { COMMERCIAL_SCORE_MAP } from "@/utils";
import { useTranslation } from 'react-i18next';
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { useAuthStore } from "@/models/useAuth";
import { filterLabels } from "@/utils";
import { authFetch, getAPIUrl } from "@/utils";
import { useContext } from "react";
import { FavoriteContext } from "@/layouts";

const API_URL = getAPIUrl();

interface NodePopupProps {
  node: any;
  molecularType?: 'organic' | 'inorganic' | 'anions';
}

// NodePopup component for displaying molecule information
const NodePopup = forwardRef(({ node, molecularType = 'organic'  }: NodePopupProps, ref) => {
  console.log(node);
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userPermissions = useAuthStore(state => state.userPermissions);
  const { moleculeFavoriteStatus, setMoleculeFavoriteStatus, handleAddToFavorites } = useContext(FavoriteContext);
  
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    show: () => setShow(true),
    hide: () => setShow(false),
  }));

  useEffect(() => {
    const handleContextMenu = (e: any) => {
      if(show)e.preventDefault();
    };

    // 添加右键禁用事件监听器
    document.addEventListener('contextmenu', handleContextMenu);
    
    // 清理事件监听器
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [show])
  
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

  return (
    show && <div className="popup-overlay" onClick={() => setShow(false)} style={{ userSelect: 'none' }}>
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
                  console.log(key, value, molecularType);
                  // Hide commercial_link row if value is "N/A"
                  if (key === 'commercial_link' && (value === 'N/A' || value === null || value === undefined)) {
                    return false;
                  }
                  
                  // Hide predicted properties for users without proper permissions
                  if (!canSeePredictedProperties && 
                      (key === 'predicted_mp' || key === 'predicted_bp' || key === 'predicted_fp' || key === 'predicted_fp_celsius')) {
                    return false;
                  }

                  if(molecularType === 'anions' && (key === 'combustion_enthalpy' || key === 'esp_min_eV' || key === 'esp_max_eV')) {
                    return false;
                  }

                  if (molecularType !== 'organic' && (key === 'predicted_mp' || key === 'predicted_bp' || key === 'predicted_fp' || key === 'functional_groups' || key === 'commercial_score')) {
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
                            : value.toFixed(4)
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