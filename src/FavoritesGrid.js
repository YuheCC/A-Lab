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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('radar');
  const [showAnalysis, setShowAnalysis] = useState(false);
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
        setFilteredFavorites(data);
        
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

  // Filter favorites when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFavorites(favorites);
    } else {
      const lowercaseSearch = searchTerm.toLowerCase();
      const filtered = favorites.filter(favorite => {
        // Search in all properties of the molecule
        return (
          favorite.smiles?.toLowerCase().includes(lowercaseSearch) ||
          favorite.functional_groups?.toLowerCase().includes(lowercaseSearch) ||
          String(favorite.molecular_weight)?.includes(lowercaseSearch) ||
          String(favorite.homo_ev)?.includes(lowercaseSearch) ||
          String(favorite.lumo_ev)?.includes(lowercaseSearch) ||
          String(favorite.predicted_melting_point)?.includes(lowercaseSearch) ||
          String(favorite.predicted_boiling_point)?.includes(lowercaseSearch)
        );
      });
      setFilteredFavorites(filtered);
    }
  }, [searchTerm, favorites]);

  // Update the spider chart whenever selected molecules change
  useEffect(() => {
    if (selectedMolecules.length > 0 && spiderChartRef.current && showAnalysis) {
      updateSpiderChart();
    }
  }, [selectedMolecules, showAnalysis]);

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

  const handleRemoveFavorite = async (id, event) => {
    event.stopPropagation();
    
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

  const handleMoleculeSelection = (favorite, checked) => {
    if (checked) {
      setSelectedMolecules(prev => [...prev, favorite]);
    } else {
      setSelectedMolecules(prev => prev.filter(mol => mol.id !== favorite.id));
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
          tickfont: { size: 10 }
        },
        angularaxis: {
          tickfont: { size: 10 }
        }
      },
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        font: { size: 10 },
        orientation: 'h',
        yanchor: 'bottom',
        xanchor: 'left'
      },
      margin: {
        l: 50,
        r: 50,
        t: 50,
        b: 50
      },
      paper_bgcolor: 'rgba(255,255,255,0.9)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
      font: {
        family: 'Arial, sans-serif',
        size: 12
      },
      autosize: true,
      hovermode: 'closest'
    };
    
    Plotly.newPlot(spiderChartRef.current, traces, layout, {responsive: true});
  };

  const handleShowAnalysis = () => {
    setShowAnalysis(true);
    // Update the chart after state is updated
    setTimeout(() => {
      if (selectedMolecules.length > 0 && spiderChartRef.current) {
        updateSpiderChart();
      }
    }, 0);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
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
        <p>Go to the Search page to find and add molecules.</p>
        <a href="/search" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/search'); window.location.reload(); }}>Search</a>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      {!showAnalysis ? (
        <>
          <div className="favorites-header">
            <div className="analysis-tabs">
              <button 
                className={`analysis-tab ${activeTab === 'radar' ? 'active' : ''}`}
                onClick={() => setActiveTab('radar')}
              >
                Radar Analysis
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'esp' ? 'active' : ''}`}
                onClick={() => setActiveTab('esp')}
              >
                ESP Analysis
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'mo' ? 'active' : ''}`}
                onClick={() => setActiveTab('mo')}
              >
                MO Analysis
              </button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                className="favorites-search-input"
                placeholder="Search molecules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {selectedMolecules.length > 0 && (
              <button 
                className="show-analysis-button"
                onClick={handleShowAnalysis}
              >
                Analyze Selected ({selectedMolecules.length})
              </button>
            )}
          </div>
          
          <div className="favorites-table-container">
            <table className="favorites-table">
              <thead>
                <tr>
                  <th className="checkbox-column">
                    <input 
                      type="checkbox" 
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMolecules(filteredFavorites);
                        } else {
                          setSelectedMolecules([]);
                        }
                      }}
                      checked={selectedMolecules.length === filteredFavorites.length && filteredFavorites.length > 0}
                    />
                  </th>
                  <th>Image</th>
                  <th>SMILES</th>
                  <th>Molecular Weight</th>
                  <th>HOMO (eV)</th>
                  <th>LUMO (eV)</th>
                  <th>MP (°C)</th>
                  <th>BP (°C)</th>
                  <th>ESP Min (eV)</th>
                  <th>ESP Max (eV)</th>
                  <th>Functional Groups</th>
                  <th>UMAP X/Y</th>
                  <th>Added Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFavorites.map(favorite => (
                  <tr key={favorite.id} className={selectedMolecules.some(mol => mol.id === favorite.id) ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedMolecules.some(mol => mol.id === favorite.id)}
                        onChange={(e) => handleMoleculeSelection(favorite, e.target.checked)}
                      />
                    </td>
                    <td className="molecule-image-cell">
                      {moleculeImages[favorite.id] ? (
                        <img 
                          src={moleculeImages[favorite.id]} 
                          alt="Molecule structure" 
                          className="table-molecule-image"
                        />
                      ) : (
                        'Loading...'
                      )}
                    </td>
                    <td>{favorite.smiles}</td>
                    <td>{favorite.molecular_weight ? favorite.molecular_weight.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.homo_ev ? favorite.homo_ev.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.lumo_ev ? favorite.lumo_ev.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.predicted_melting_point ? favorite.predicted_melting_point.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.predicted_boiling_point ? favorite.predicted_boiling_point.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.esp_min_ev ? favorite.esp_min_ev.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.esp_max_ev ? favorite.esp_max_ev.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.functional_groups || 'N/A'}</td>
                    <td>
                      {favorite.umap_x ? favorite.umap_x.toFixed(2) : 'N/A'} / 
                      {favorite.umap_y ? favorite.umap_y.toFixed(2) : 'N/A'}
                    </td>
                    <td>{formatDate(favorite.created_at)}</td>
                    <td>
                      <button 
                        className="remove-favorite-table-button" 
                        onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                        title="Remove from favorites"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="analysis-view">
          <div className="analysis-header">
            <h2>
              {activeTab === 'radar' ? 'Radar Analysis' : 
               activeTab === 'esp' ? 'ESP Analysis' : 
               'MO Analysis'}
            </h2>
            <div className="selected-molecules-count">
              {selectedMolecules.length} molecules selected
            </div>
            <button className="close-analysis-button" onClick={handleCloseAnalysis}>×</button>
          </div>
          
          <div className="analysis-content">
            {activeTab === 'radar' && (
              <div className="spider-chart-container">
                <div ref={spiderChartRef} className="spider-chart"></div>
              </div>
            )}
            {activeTab === 'esp' && (
              <div className="esp-analysis-placeholder">
                <p>ESP Analysis coming soon</p>
              </div>
            )}
            {activeTab === 'mo' && (
              <div className="mo-analysis-placeholder">
                <p>MO Analysis coming soon</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesGrid; 