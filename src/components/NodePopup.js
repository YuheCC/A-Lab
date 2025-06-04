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
        <h2 className="white-text">Molecule Details</h2>
        <div className="popup-data">
          <MolViewer2D smile={node.smiles} theme="dark"/>
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

export default NodePopup;