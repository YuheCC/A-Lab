import MolViewer2D from "./MolViewer2D";
import { useTranslation } from 'react-i18next';

// NodePopup component for displaying molecule information
const NodePopup = ({ node, onClose, filterLabels, handleAddToFavorites, moleculeFavoriteStatus }) => {
  const { t } = useTranslation();
  if (!node) return null;

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
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content black-bg" onClick={e => e.stopPropagation()}>
        <button className="close-button white-text" onClick={onClose}>×</button>
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
              {t('molecular.nodePopup.copyAllData')}
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
              {t('molecular.nodePopup.addToFavorites')}
            </button>
            {moleculeFavoriteStatus[node.smiles]?.loading && (
              <div style={{ marginTop: '5px', color: '#aaa' }}>{t('molecular.nodePopup.saving')}</div>
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

export default NodePopup;