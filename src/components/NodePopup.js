import MolViewer2D from "./MolViewer2D";

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
        <h2 className="white-text" style={{ textAlign: 'center' }}>Molecule Details</h2>
        <div className="popup-data">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <MolViewer2D smile={node.smiles} theme="dark"/>
          </div>
          <h3 className="white-text" style={{ textAlign: 'center' }}>SMILES</h3>
          <p className="dark-field" style={{ textAlign: 'center' }}>{node.smiles}</p>

          <h3 className="white-text" style={{ textAlign: 'center' }}>UMAP Coordinates</h3>
          <p className="dark-field" style={{ textAlign: 'center' }}>X: {node.x.toFixed(2)}, Y: {node.y.toFixed(2)}</p>

          <h3 className="white-text" style={{ textAlign: 'center' }}>Properties</h3>
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
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '10px' }}>
              <button
                className="copy-button"
                onClick={copyToClipboard}
              >
                Copy All Data
              </button>
              <button
                className="favorites-button"
                onClick={() => {
                  // Ensure the properties object has the correct keys for favorites
                  const properties = node.properties || {};
                  const mappedNode = {
                    ...node,
                    properties: {
                      ...properties,
                      predicted_fp_celsius: properties.predicted_fp_celsius ?? properties.predicted_fp ?? properties.predicted_FP_celsius,
                      combustion_enthalpy_ev: properties.combustion_enthalpy_ev ?? properties.combustion_enthalpy ?? properties.COMBUSTION_ENTHALPY_EV,
                      commercial_score: properties.commercial_score ?? properties.COMMERCIAL_SCORE,
                      commercial_link: properties.commercial_link ?? (properties.COMMERCIAL_LINK || node.COMMERCIAL_LINK || null)
                    }
                  };
                  handleAddToFavorites(mappedNode);
                }}
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
            </div>
            {moleculeFavoriteStatus[node.smiles]?.loading && (
              <div style={{ color: '#aaa', fontSize: '14px' }}>Saving...</div>
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
};

export default NodePopup;