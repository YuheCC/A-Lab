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
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px' }}>
              <button
                className="copy-button"
                onClick={copyToClipboard}
                style={{ flex: '1', maxWidth: '140px' }}
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
                      predicted_mp: properties.predicted_mp,
                      predicted_bp: properties.predicted_bp,
                      predicted_fp: properties.predicted_fp_celsius || properties.predicted_fp,
                      combustion_enthalpy: properties.combustion_enthalpy_ev || properties.combustion_enthalpy,
                      commercial_score: properties.commercial_score ?? properties.COMMERCIAL_SCORE,
                      commercial_link: properties.commercial_link || properties.COMMERCIAL_LINK || null,
                    }
                  };
                  handleAddToFavorites(mappedNode);
                }}
                style={{ flex: '1', maxWidth: '140px' }}
              >
                Add to Favorites
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