import React, { useState, useEffect, useRef } from 'react';
import API_URL from './Constants.js';
import './App.css';
import Plotly from 'plotly.js-dist';

const FavoritesGrid = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moleculeImages, setMoleculeImages] = useState({});
  const [selectedMolecules, setSelectedMolecules] = useState([]);
  const spiderChartRef = useRef(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/favorites-retrieve`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch favorites: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setFavorites(data);
        
        // Fetch molecule images for each favorite
        fetchMoleculeImages(data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Update the spider chart whenever selected molecules change
  useEffect(() => {
    if (selectedMolecules.length > 0 && spiderChartRef.current) {
      updateSpiderChart();
    }
  }, [selectedMolecules]);

  const fetchMoleculeImages = async (favoritesData) => {
    const images = {};
    
    for (const favorite of favoritesData) {
      try {
        if (favorite.smiles) {
          const response = await fetch(`${API_URL}/api/molecule_image?smiles=${encodeURIComponent(favorite.smiles)}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            images[favorite.id] = imageUrl;
          }
        }
      } catch (error) {
        console.error(`Error fetching image for molecule ${favorite.id}:`, error);
      }
    }
    
    setMoleculeImages(images);
  };

  const handleRemoveFavorite = async (id) => {
    // Ask for confirmation before removing
    if (!window.confirm("Are you sure you want to remove this molecule from your favorites?")) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/favorites-delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to remove favorite: ${response.status} ${response.statusText}`);
      }

      // Remove the favorite from the state
      setFavorites(favorites.filter(favorite => favorite.id !== id));
      
      // Also remove from selected molecules if present
      setSelectedMolecules(selectedMolecules.filter(molecule => molecule.id !== id));
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'toast-message success';
      successToast.textContent = 'Molecule removed from favorites';
      document.body.appendChild(successToast);
      
      // Remove the toast after 3 seconds
      setTimeout(() => {
        if (successToast.parentNode) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
    } catch (err) {
      console.error('Error removing favorite:', err);
      
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.className = 'toast-message error';
      errorToast.textContent = 'Failed to remove from favorites. Please try again.';
      document.body.appendChild(errorToast);
      
      // Remove the toast after 3 seconds
      setTimeout(() => {
        if (errorToast.parentNode) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMoleculeSelection = (favorite) => {
    // Toggle selection
    if (selectedMolecules.some(mol => mol.id === favorite.id)) {
      setSelectedMolecules(selectedMolecules.filter(mol => mol.id !== favorite.id));
    } else {
      setSelectedMolecules([...selectedMolecules, favorite]);
    }
  };

  const updateSpiderChart = () => {
    if (!spiderChartRef.current || selectedMolecules.length === 0) return;

    // Define the categories for the radar chart
    const categories = ['HOMO (eV)', 'LUMO (eV)', 'MP (°C)', 'BP (°C)', 'Molecular Weight'];
    
    // Calculate min/max values for scaling
    let minValues = {};
    let maxValues = {};
    
    // Initialize with the first molecule's values
    selectedMolecules.forEach(molecule => {
      categories.forEach(category => {
        let value;
        switch(category) {
          case 'HOMO (eV)':
            value = molecule.homo_ev;
            break;
          case 'LUMO (eV)':
            value = molecule.lumo_ev;
            break;
          case 'MP (°C)':
            value = molecule.predicted_melting_point;
            break;
          case 'BP (°C)':
            value = molecule.predicted_boiling_point;
            break;
          case 'Molecular Weight':
            value = molecule.molecular_weight;
            break;
          default:
            value = null;
        }
        
        if (value !== null && value !== undefined) {
          if (minValues[category] === undefined || value < minValues[category]) {
            minValues[category] = value;
          }
          if (maxValues[category] === undefined || value > maxValues[category]) {
            maxValues[category] = value;
          }
        }
      });
    });
    
    // Create traces for each molecule
    const traces = selectedMolecules.map(molecule => {
      const values = categories.map(category => {
        switch(category) {
          case 'HOMO (eV)':
            return molecule.homo_ev;
          case 'LUMO (eV)':
            return molecule.lumo_ev;
          case 'MP (°C)':
            return molecule.predicted_melting_point;
          case 'BP (°C)':
            return molecule.predicted_boiling_point;
          case 'Molecular Weight':
            return molecule.molecular_weight;
          default:
            return null;
        }
      });
      
      return {
        type: 'scatterpolar',
        r: values,
        theta: categories,
        fill: 'toself',
        name: molecule.smiles.length > 15 ? molecule.smiles.substring(0, 15) + '...' : molecule.smiles,
        line: { width: 2 }
      };
    });
    
    // Define layout
    const layout = {
      polar: {
        radialaxis: {
          visible: true,
          tickfont: { size: 8 }
        },
        angularaxis: {
          tickfont: { size: 8 }
        }
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        font: { size: 8 },
        orientation: 'h',
        yanchor: 'bottom',
        xanchor: 'left'
      },
      margin: {
        l: 30,
        r: 30,
        t: 30,
        b: 30
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'Arial, sans-serif',
        size: 10
      },
      autosize: true
    };
    
    Plotly.newPlot(spiderChartRef.current, traces, layout, {responsive: true});
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner"></div>
        <p>Loading your favorite molecules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-error">
        <h3>Error loading favorites</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="no-favorites">
        <h3>No Favorite Molecules</h3>
        <p>You haven't added any molecules to your favorites yet.</p>
        <p>Go to the <a href="/search" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/search'); window.location.reload(); }}>Search</a> page to find and add molecules.</p>
      </div>
    );
  }

  return (
    <div className="favorites-layout">
      <div className="favorites-grid-container">
        <h2>My Favorites</h2>
        <div className="favorites-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {favorites.map(favorite => (
            <div 
              key={favorite.id} 
              className={`favorite-card ${selectedMolecules.some(mol => mol.id === favorite.id) ? 'selected-molecule' : ''}`}
            >
              <div className="favorite-card-header">
                <div className="molecule-checkbox">
                  <input 
                    type="checkbox"
                    id={`molecule-${favorite.id}`}
                    checked={selectedMolecules.some(mol => mol.id === favorite.id)}
                    onChange={() => handleMoleculeSelection(favorite)}
                  />
                  <label htmlFor={`molecule-${favorite.id}`}>Select for analysis</label>
                </div>
                <button 
                  className="remove-favorite-button" 
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  title="Remove from favorites"
                >
                  ×
                </button>
              </div>
              
              <div className="favorite-card-properties">
                <table className="favorite-property-table">
                  <tbody>
                    <tr>
                      <td className="property-name">SMILES</td>
                      <td className="property-value">{favorite.smiles}</td>
                    </tr>
                    <tr>
                      <td className="property-name">Molecular Weight</td>
                      <td className="property-value">{favorite.molecular_weight ? favorite.molecular_weight.toFixed(2) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="property-name">HOMO (eV)</td>
                      <td className="property-value">{favorite.homo_ev ? favorite.homo_ev.toFixed(2) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="property-name">LUMO (eV)</td>
                      <td className="property-value">{favorite.lumo_ev ? favorite.lumo_ev.toFixed(2) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="property-name">ESP Min (eV)</td>
                      <td className="property-value">{favorite.esp_min_ev ? favorite.esp_min_ev.toFixed(2) : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="property-name">ESP Max (eV)</td>
                      <td className="property-value">{favorite.esp_max_ev ? favorite.esp_max_ev.toFixed(2) : 'N/A'}</td>
                    </tr>
                    {favorite.predicted_melting_point && (
                      <tr>
                        <td className="property-name">MP (°C)</td>
                        <td className="property-value">{favorite.predicted_melting_point.toFixed(2)}</td>
                      </tr>
                    )}
                    {favorite.predicted_boiling_point && (
                      <tr>
                        <td className="property-name">BP (°C)</td>
                        <td className="property-value">{favorite.predicted_boiling_point.toFixed(2)}</td>
                      </tr>
                    )}
                    {favorite.functional_groups && (
                      <tr>
                        <td className="property-name">Functional Groups</td>
                        <td className="property-value">{favorite.functional_groups}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="property-name">UMAP X/Y</td>
                      <td className="property-value">
                        {favorite.umap_x ? favorite.umap_x.toFixed(2) : 'N/A'} / 
                        {favorite.umap_y ? favorite.umap_y.toFixed(2) : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="property-value" colSpan="2" style={{ textAlign: 'center' }}>
                        {moleculeImages[favorite.id] ? (
                          <img 
                            src={moleculeImages[favorite.id]} 
                            alt="Molecule structure" 
                            className="molecule-image"
                            style={{ maxWidth: '100%', maxHeight: '150px' }}
                          />
                        ) : (
                          'Loading image...'
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="favorite-card-footer">
                Added: {formatDate(favorite.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="analysis-section">
        <h2>Analyses</h2>
        
        <div className="analysis-tabs">
          <div className="analysis-tab active">Radar</div>
          <div className="analysis-tab">ESP</div>
          <div className="analysis-tab">MO</div>
        </div>
        
        <div className="selected-info">
          <p>Molecules selected</p>
          <ul className="selected-molecules-list">
            {selectedMolecules.map(molecule => (
              <li key={molecule.id} className="selected-molecule-item">
                <input 
                  type="checkbox"
                  checked={true}
                  onChange={() => handleMoleculeSelection(molecule)}
                  id={`selected-${molecule.id}`}
                />
                <label htmlFor={`selected-${molecule.id}`}>{molecule.smiles}</label>
              </li>
            ))}
            {selectedMolecules.length === 0 && (
              <li className="no-molecules-selected">Select molecules from the left to compare</li>
            )}
          </ul>
        </div>
        
        <div className="spider-chart-container">
          <div ref={spiderChartRef} className="spider-chart"></div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesGrid; 