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
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const spiderChartRef = useRef(null);
  const espChartRef = useRef(null);
  const moChartRef = useRef(null);

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

  // Sort data when sortConfig changes
  useEffect(() => {
    let sortableItems = [...filteredFavorites];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle null or undefined values
        if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return 1;
        if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return -1;
        
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Special case for dates
        if (sortConfig.key === 'created_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        
        // String comparison for text fields
        if (typeof aValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        }
        
        // Number comparison
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }
    setFilteredFavorites(sortableItems);
  }, [sortConfig, favorites, searchTerm]);

  // Update the chart whenever selected molecules change
  useEffect(() => {
    if (selectedMolecules.length > 0 && showAnalysis) {
      if (activeTab === 'radar' && spiderChartRef.current) {
        updateSpiderChart();
      } else if (activeTab === 'esp' && espChartRef.current) {
        updateESPChart();
      } else if (activeTab === 'mo' && moChartRef.current) {
        updateMOChart();
      }
    }
  }, [selectedMolecules, showAnalysis, activeTab]);

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

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
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

  const updateESPChart = () => {
    if (!espChartRef.current || selectedMolecules.length === 0) return;

    // Create scatter plot data for ESP analysis
    const data = selectedMolecules.map(molecule => ({
      ESP_MIN_EV: molecule.esp_min_ev,
      ESP_MAX_EV: molecule.esp_max_ev,
      HOMO_EV: molecule.homo_ev,
      LUMO_EV: molecule.lumo_ev,
      TYPE: 'User Selection', // All selected molecules are the same type
      ABBREVIATION: molecule.smiles.length > 10 ? molecule.smiles.substring(0, 10) + '...' : molecule.smiles,
      SMILES: molecule.smiles
    }));

    // Create traces for the ESP chart
    const traces = [{
      type: 'scatter',
      mode: 'markers+text',
      x: data.map(d => d.ESP_MIN_EV),
      y: data.map(d => d.ESP_MAX_EV),
      text: data.map(d => d.ABBREVIATION),
      textposition: 'top center',
      marker: {
        color: 'rgba(0, 128, 255, 0.7)',
        size: 10,
        line: {
          color: 'rgba(0, 128, 255, 1.0)',
          width: 1
        }
      },
      hoverinfo: 'text',
      hovertext: data.map(d => 
        `SMILES: ${d.SMILES}<br>` +
        `ESP_MAX_EV: ${d.ESP_MAX_EV?.toFixed(2) || 'N/A'}<br>` +
        `ESP_MIN_EV: ${d.ESP_MIN_EV?.toFixed(2) || 'N/A'}<br>` +
        `HOMO_EV: ${d.HOMO_EV?.toFixed(2) || 'N/A'}<br>` +
        `LUMO_EV: ${d.LUMO_EV?.toFixed(2) || 'N/A'}`
      ),
      name: 'Selected Molecules'
    }];

    // Define layout
    const layout = {
      title: 'ESP Max and Min',
      xaxis: {
        title: 'ESP_MIN_EV',
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      yaxis: {
        title: 'ESP_MAX_EV',
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      },
      paper_bgcolor: 'rgba(255,255,255,0.9)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
      font: {
        family: 'Arial, sans-serif',
        size: 12
      },
      autosize: true,
      hovermode: 'closest',
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        orientation: 'h'
      }
    };
    
    Plotly.newPlot(espChartRef.current, traces, layout, {responsive: true});
  };

  const updateMOChart = () => {
    if (!moChartRef.current || selectedMolecules.length === 0) return;

    // Create scatter plot data for MO analysis
    const data = selectedMolecules.map(molecule => ({
      LUMO_EV: molecule.lumo_ev,
      HOMO_EV: molecule.homo_ev,
      TYPE: 'User Selection', // All selected molecules are the same type
      ABBREVIATION: molecule.smiles.length > 10 ? molecule.smiles.substring(0, 10) + '...' : molecule.smiles,
      SMILES: molecule.smiles
    }));

    // Create traces for the MO chart
    const traces = [{
      type: 'scatter',
      mode: 'markers+text',
      x: data.map(d => d.LUMO_EV),
      y: data.map(d => d.HOMO_EV),
      text: data.map(d => d.ABBREVIATION),
      textposition: 'top center',
      marker: {
        color: 'rgba(0, 128, 255, 0.7)',
        size: 10,
        line: {
          color: 'rgba(0, 128, 255, 1.0)',
          width: 1
        }
      },
      hoverinfo: 'text',
      hovertext: data.map(d => 
        `SMILES: ${d.SMILES}<br>` +
        `HOMO (eV): ${d.HOMO_EV?.toFixed(2) || 'N/A'}<br>` +
        `LUMO (eV): ${d.LUMO_EV?.toFixed(2) || 'N/A'}`
      ),
      name: 'Selected Molecules'
    }];

    // Define layout
    const layout = {
      title: 'HOMO vs LUMO Energy Levels',
      xaxis: {
        title: 'LUMO (eV)',
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      yaxis: {
        title: 'HOMO (eV)',
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      },
      paper_bgcolor: 'rgba(255,255,255,0.9)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
      font: {
        family: 'Arial, sans-serif',
        size: 12
      },
      autosize: true,
      hovermode: 'closest',
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        orientation: 'h'
      }
    };
    
    Plotly.newPlot(moChartRef.current, traces, layout, {responsive: true});
  };

  const handleShowAnalysis = () => {
    setShowAnalysis(true);
    // Update the chart after state is updated
    setTimeout(() => {
      if (selectedMolecules.length > 0) {
        if (activeTab === 'radar' && spiderChartRef.current) {
          updateSpiderChart();
        } else if (activeTab === 'esp' && espChartRef.current) {
          updateESPChart();
        } else if (activeTab === 'mo' && moChartRef.current) {
          updateMOChart();
        }
      }
    }, 0);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (showAnalysis && selectedMolecules.length > 0) {
      setTimeout(() => {
        if (tab === 'radar' && spiderChartRef.current) {
          updateSpiderChart();
        } else if (tab === 'esp' && espChartRef.current) {
          updateESPChart();
        } else if (tab === 'mo' && moChartRef.current) {
          updateMOChart();
        }
      }, 0);
    }
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
                onClick={() => handleTabChange('radar')}
              >
                Radar
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'esp' ? 'active' : ''}`}
                onClick={() => handleTabChange('esp')}
              >
                ESP
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'mo' ? 'active' : ''}`}
                onClick={() => handleTabChange('mo')}
              >
                MO
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
                  <th onClick={() => handleSort('smiles')} className="sortable-header">
                    SMILES {getSortIndicator('smiles')}
                  </th>
                  <th onClick={() => handleSort('molecular_weight')} className="sortable-header">
                    Molecular Weight {getSortIndicator('molecular_weight')}
                  </th>
                  <th onClick={() => handleSort('homo_ev')} className="sortable-header">
                    HOMO (eV) {getSortIndicator('homo_ev')}
                  </th>
                  <th onClick={() => handleSort('lumo_ev')} className="sortable-header">
                    LUMO (eV) {getSortIndicator('lumo_ev')}
                  </th>
                  <th onClick={() => handleSort('predicted_melting_point')} className="sortable-header">
                    MP (°C) {getSortIndicator('predicted_melting_point')}
                  </th>
                  <th onClick={() => handleSort('predicted_boiling_point')} className="sortable-header">
                    BP (°C) {getSortIndicator('predicted_boiling_point')}
                  </th>
                  <th onClick={() => handleSort('esp_min_ev')} className="sortable-header">
                    ESP Min (eV) {getSortIndicator('esp_min_ev')}
                  </th>
                  <th onClick={() => handleSort('esp_max_ev')} className="sortable-header">
                    ESP Max (eV) {getSortIndicator('esp_max_ev')}
                  </th>
                  <th onClick={() => handleSort('functional_groups')} className="sortable-header">
                    Functional Groups {getSortIndicator('functional_groups')}
                  </th>
                  <th>UMAP X/Y</th>
                  <th onClick={() => handleSort('created_at')} className="sortable-header">
                    Added Date {getSortIndicator('created_at')}
                  </th>
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
              <div className="esp-chart-container">
                <div ref={espChartRef} className="esp-chart"></div>
              </div>
            )}
            {activeTab === 'mo' && (
              <div className="mo-chart-container">
                <div ref={moChartRef} className="mo-chart"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesGrid; 