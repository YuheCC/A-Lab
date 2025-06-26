import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Plotly from 'plotly.js-dist';
import { authFetch, getAPIUrl } from './utils.js';
import NodePopup from './components/NodePopup.js';

const API_URL = getAPIUrl();

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
  const [showPopup, setShowPopup] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [moleculeFavoriteStatus, setMoleculeFavoriteStatus] = useState({});
  const spiderChartRef = useRef(null);
  const espChartRef = useRef(null);
  const moChartRef = useRef(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`${API_URL}/favorites-retrieve`);

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
    if (sortConfig.key) {
      setFilteredFavorites(prevFilteredFavorites => {
        const sortableItems = [...prevFilteredFavorites];
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
        return sortableItems;
      });
    }
  }, [sortConfig]);

  // Update the chart whenever selected molecules change
  useEffect(() => {
    if (showAnalysis) {
      if (activeTab === 'radar' && spiderChartRef.current && selectedMolecules.length > 0) {
        updateSpiderChart();
      } else if (activeTab === 'esp' && espChartRef.current && selectedMolecules.length > 0) {
        updateESPChart();
      } else if (activeTab === 'mo' && moChartRef.current) {
        // MO chart always updates and shows reference points
        updateMOChart();
      }
    }
  }, [selectedMolecules, showAnalysis, activeTab]);

  // Separate effect to ensure MO chart data is ready when molecules are selected
  useEffect(() => {
    if (moChartRef.current && showAnalysis && activeTab === 'mo') {
      updateMOChart();
    }
  }, [selectedMolecules]);

  const fetchMoleculeImages = async (favoritesData) => {
    const images = {};
    
    for (const favorite of favoritesData) {
      try {
        if (favorite.smiles) {
          const response = await authFetch(`${API_URL}/api/molecule_image?smiles=${encodeURIComponent(favorite.smiles)}`);
          
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
      const response = await authFetch(`${API_URL}/favorites-delete/${id}`, {
        method: 'DELETE'
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

    // Color map for each solubility type (assuming we have this data)
    const colorMap = {
      'high solubility': 'green',
      'medium solubility': 'orange', 
      'low solubility': 'red',
      'diluent': 'blue'
    };

    // Helper function to get rotated ellipse points
    const getEllipsePoints = (center, width, height, angleDeg, nPoints = 100) => {
      const t = Array.from({length: nPoints}, (_, i) => (2 * Math.PI * i) / nPoints);
      const theta = (angleDeg * Math.PI) / 180;
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);
      
      const x = [];
      const y = [];
      
      t.forEach(angle => {
        const ellipseX = (width / 2) * Math.cos(angle);
        const ellipseY = (height / 2) * Math.sin(angle);
        
        // Rotate the ellipse
        const rotatedX = ellipseX * cosTheta - ellipseY * sinTheta;
        const rotatedY = ellipseX * sinTheta + ellipseY * cosTheta;
        
        x.push(rotatedX + center[0]);
        y.push(rotatedY + center[1]);
      });
      
      return { x, y };
    };

    // Custom ellipses configuration
    const customEllipses = [
      {
        center: [-1.5, 1.6],
        width: 1.5,
        height: 0.55,
        angle: 65,
        color: 'green',
        label: 'high solubility'
      },
      {
        center: [-0.75, 0.65],
        width: 0.6,
        height: 0.6,
        angle: 0,
        color: 'red',
        label: 'low solubility'
      },
      {
        center: [-0.55, 1.6],
        width: 0.65,
        height: 1.3,
        angle: 0,
        color: 'blue',
        label: 'diluent'
      }
    ];

    // Prepare data for plotting
    const data = selectedMolecules.map(molecule => ({
      ESP_MIN_EV: molecule.esp_min_ev,
      ESP_MAX_EV: molecule.esp_max_ev,
      HOMO_EV: molecule.homo_ev,
      LUMO_EV: molecule.lumo_ev,
      SOLUBILITY: molecule.solubility || 'Selected Molecules', // Assuming solubility field exists
      ABBREVIATION: molecule.smiles.length > 10 ? molecule.smiles.substring(0, 10) + '...' : molecule.smiles,
      SMILES: molecule.smiles
    }));

    // Filter out molecules with missing ESP data
    const validData = data.filter(d => d.ESP_MIN_EV !== null && d.ESP_MIN_EV !== undefined && 
                                      d.ESP_MAX_EV !== null && d.ESP_MAX_EV !== undefined);

    // Group data by solubility type
    const groupedData = {};
    validData.forEach(d => {
      if (!groupedData[d.SOLUBILITY]) {
        groupedData[d.SOLUBILITY] = [];
      }
      groupedData[d.SOLUBILITY].push(d);
    });

    // Create traces for each solubility type
    const traces = [];
    const legendOrder = ['high solubility', 'medium solubility', 'low solubility', 'diluent', 'Selected Molecules'];
    
    legendOrder.forEach(solubilityType => {
      if (groupedData[solubilityType]) {
        const typeData = groupedData[solubilityType];
        const color = colorMap[solubilityType] || 'gray';
        
        traces.push({
          type: 'scatter',
          mode: 'markers+text',
          x: typeData.map(d => d.ESP_MIN_EV),
          y: typeData.map(d => d.ESP_MAX_EV),
          text: typeData.map(d => d.ABBREVIATION),
          textposition: 'top center',
          name: solubilityType,
          hoverinfo: 'text',
          hovertext: typeData.map(d => 
            `ABBREVIATION: ${d.ABBREVIATION}<br>` +
            `ESP_MIN_EV: ${d.ESP_MIN_EV?.toFixed(3) || 'N/A'}<br>` +
            `ESP_MAX_EV: ${d.ESP_MAX_EV?.toFixed(3) || 'N/A'}<br>` +
            `SMILES: ${d.SMILES}<br>` +
            `HOMO_EV: ${d.HOMO_EV?.toFixed(2) || 'N/A'}<br>` +
            `LUMO_EV: ${d.LUMO_EV?.toFixed(2) || 'N/A'}`
          ),
          marker: {
            size: 8,
            color: color,
            line: {
              color: color,
              width: 1
            }
          }
        });
      }
    });

    // Add custom ellipses
    customEllipses.forEach(ellipse => {
      const ellipsePoints = getEllipsePoints(
        ellipse.center,
        ellipse.width,
        ellipse.height,
        ellipse.angle
      );

      // Convert color to rgba with transparency
      const colorToRgba = (color, alpha = 0.2) => {
        const colors = {
          'green': `rgba(0, 128, 0, ${alpha})`,
          'red': `rgba(255, 0, 0, ${alpha})`,
          'blue': `rgba(0, 0, 255, ${alpha})`,
          'orange': `rgba(255, 165, 0, ${alpha})`
        };
        return colors[color] || `rgba(128, 128, 128, ${alpha})`;
      };

      traces.push({
        type: 'scatter',
        x: ellipsePoints.x,
        y: ellipsePoints.y,
        mode: 'lines',
        fill: 'toself',
        fillcolor: colorToRgba(ellipse.color, 0.2),
        line: {
          color: ellipse.color,
          dash: 'dash',
          width: 2
        },
        name: `${ellipse.label} region`,
        showlegend: true,
        hoverinfo: 'name'
      });
    });

    // Define layout
    const layout = {
      title: 'ESP_MIN_EV vs ESP_MAX_EV with Solubility Regions',
      xaxis: {
        title: {
          text: 'esp_min (eV)',
          font: {
            size: 14,
            color: '#000000'
          }
        },
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      yaxis: {
        title: {
          text: 'esp_max (eV)',
          font: {
            size: 14,
            color: '#000000'
          }
        },
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      legend: {
        title: 'SOLUBILITY',
        x: 0,
        y: 1,
        orientation: 'v'
      },
      margin: {
        l: 80,
        r: 40,
        t: 60,
        b: 80
      },
      paper_bgcolor: 'rgba(255,255,255,0.9)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
      font: {
        family: 'Arial, sans-serif',
        size: 12
      },
      autosize: true,
      hovermode: 'closest',
      width: 1200,
      height: 800
    };
    
    Plotly.newPlot(espChartRef.current, traces, layout, {responsive: true});
    
    // Add click event listener for ESP chart
    espChartRef.current.on('plotly_click', handlePointClick);
  };

  const updateMOChart = () => {
    if (!moChartRef.current) return;

    // Color map for each solubility type (matching Python code)
    const colorMap = {
      'high solubility': 'green',
      'medium solubility': 'orange', 
      'low solubility': 'red',
      'diluent': 'blue'
    };

    // Hardcoded reference data points
    const referenceData = [
      { ABBREVIATION: 'DEC', HOMO_EV: -8.0, LUMO_EV: 1.0, SOLUBILITY: 'medium solubility' },
      { ABBREVIATION: 'DME', HOMO_EV: -7.2, LUMO_EV: 1.15, SOLUBILITY: 'medium solubility' },
      { ABBREVIATION: 'AN', HOMO_EV: -9.1, LUMO_EV: 0.72, SOLUBILITY: 'high solubility' },
      { ABBREVIATION: 'TTE', HOMO_EV: -9.3, LUMO_EV: 0.6, SOLUBILITY: 'diluent' },
      { ABBREVIATION: 'BTFE', HOMO_EV: -8.5, LUMO_EV: 0.68, SOLUBILITY: 'diluent' },
      { ABBREVIATION: 'EC', HOMO_EV: -8.2, LUMO_EV: 0.64, SOLUBILITY: 'high solubility' },
      { ABBREVIATION: 'PC', HOMO_EV: -8.2, LUMO_EV: 0.56, SOLUBILITY: 'high solubility' },
      { ABBREVIATION: 'FDMB', HOMO_EV: -7.6, LUMO_EV: 0.68, SOLUBILITY: 'medium solubility' },
      { ABBREVIATION: 'MA', HOMO_EV: -7.6, LUMO_EV: 0.22, SOLUBILITY: 'medium solubility' },
      { ABBREVIATION: 'DFEC', HOMO_EV: -9.1, LUMO_EV: -0.14, SOLUBILITY: 'high solubility' },
      { ABBREVIATION: 'Benzene', HOMO_EV: -6.9, LUMO_EV: -0.22, SOLUBILITY: 'low solubility' },
      { ABBREVIATION: 'MTFP', HOMO_EV: -8.0, LUMO_EV: -0.52, SOLUBILITY: 'medium solubility' }
    ];

    // Prepare selected molecules data
    const selectedData = selectedMolecules.length > 0 ? selectedMolecules.map(molecule => ({
      HOMO_EV: molecule.homo_ev,
      LUMO_EV: molecule.lumo_ev,
      SOLUBILITY: molecule.solubility || 'Selected Molecules',
      ABBREVIATION: molecule.abbreviation || (molecule.smiles.length > 10 ? molecule.smiles.substring(0, 10) + '...' : molecule.smiles),
      SMILES: molecule.smiles,
      isSelected: true
    })).filter(d => d.HOMO_EV !== null && d.HOMO_EV !== undefined && d.LUMO_EV !== null && d.LUMO_EV !== undefined) : [];

    // Add jitter to prevent overlapping points
    const addJitter = (data, jitterAmount = 0.02) => {
      const positionMap = new Map();
      
      return data.map(d => {
        const key = `${d.HOMO_EV.toFixed(2)}_${d.LUMO_EV.toFixed(2)}`;
        const count = positionMap.get(key) || 0;
        positionMap.set(key, count + 1);
        
        // Add small offset for overlapping points
        const offsetX = count * jitterAmount * (Math.random() - 0.5);
        const offsetY = count * jitterAmount * (Math.random() - 0.5);
        
        return {
          ...d,
          HOMO_EV_DISPLAY: d.HOMO_EV + offsetX,
          LUMO_EV_DISPLAY: d.LUMO_EV + offsetY
        };
      });
    };

    // Apply jitter to selected data to prevent overlap
    const jitteredSelectedData = addJitter(selectedData);

    // Combine reference data with selected data
    const allData = [
      ...referenceData.map(d => ({ ...d, isSelected: false, HOMO_EV_DISPLAY: d.HOMO_EV, LUMO_EV_DISPLAY: d.LUMO_EV })),
      ...jitteredSelectedData
    ];

    // Group data by solubility type and selection status
    const groupedData = {};
    allData.forEach(d => {
      if (d.isSelected) {
        // Group all selected molecules together regardless of solubility
        if (!groupedData['Selected Molecules']) {
          groupedData['Selected Molecules'] = [];
        }
        groupedData['Selected Molecules'].push(d);
      } else {
        // Keep reference data grouped by solubility
        const key = `${d.SOLUBILITY} (Reference)`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(d);
      }
    });

    // Create traces for each group
    const traces = [];
    const legendOrder = ['high solubility', 'medium solubility', 'low solubility', 'diluent'];
    
    // First add reference points (smaller, semi-transparent)
    legendOrder.forEach(solubilityType => {
      const refKey = `${solubilityType} (Reference)`;
      if (groupedData[refKey]) {
        const typeData = groupedData[refKey];
        const color = colorMap[solubilityType] || 'gray';
        
        traces.push({
          type: 'scatter',
          mode: 'markers+text',
          x: typeData.map(d => d.HOMO_EV_DISPLAY),
          y: typeData.map(d => d.LUMO_EV_DISPLAY),
          text: typeData.map(d => d.ABBREVIATION),
          textposition: 'top center',
          name: `${solubilityType} (ref)`,
          hovertemplate: 
            `ABBREVIATION: %{text}<br>` +
            `HOMO_EV: %{x:.3f}<br>` +
            `LUMO_EV: %{y:.3f}<br>` +
            `Type: Reference<br>` +
            `<extra></extra>`,
          marker: {
            size: 6,
            color: color,
            opacity: 0.6,
            line: {
              color: color,
              width: 1
            }
          },
          textfont: {
            size: 10,
            color: color
          }
        });
      }
    });

    // Then add all selected molecules as one group
    if (groupedData['Selected Molecules']) {
      const selectedData = groupedData['Selected Molecules'];
      
      traces.push({
        type: 'scatter',
        mode: 'markers+text',
        x: selectedData.map(d => d.HOMO_EV_DISPLAY),
        y: selectedData.map(d => d.LUMO_EV_DISPLAY),
        text: selectedData.map(d => d.ABBREVIATION),
        textposition: 'top center',
        name: 'Selected Molecules',
        customdata: selectedData.map(d => d.SMILES || 'N/A'),
        hovertemplate: 
          `ABBREVIATION: %{text}<br>` +
          `HOMO_EV: %{x:.3f}<br>` +
          `LUMO_EV: %{y:.3f}<br>` +
          `SMILES: %{customdata}<br>` +
          `Type: Selected<br>` +
          `<extra></extra>`,
        marker: {
          size: 10,
          color: 'purple',
          opacity: 1.0,
          line: {
            color: 'black',
            width: 2
          },
          symbol: 'star'
        },
        textfont: {
          size: 12,
          color: 'black'
        }
      });
    }

    // Calculate dynamic axis ranges to include all data points
    let xMin = Math.min(...allData.map(d => d.HOMO_EV_DISPLAY));
    let xMax = Math.max(...allData.map(d => d.HOMO_EV_DISPLAY));
    let yMin = Math.min(...allData.map(d => d.LUMO_EV_DISPLAY));
    let yMax = Math.max(...allData.map(d => d.LUMO_EV_DISPLAY));
    
    // Add padding (10% of range)
    const xPadding = (xMax - xMin) * 0.1;
    const yPadding = (yMax - yMin) * 0.1;
    
    xMin -= xPadding;
    xMax += xPadding;
    yMin -= yPadding;
    yMax += yPadding;
    
    // Set minimum ranges to ensure chart is readable
    if (xMax - xMin < 2) {
      const center = (xMax + xMin) / 2;
      xMin = center - 1;
      xMax = center + 1;
    }
    if (yMax - yMin < 1) {
      const center = (yMax + yMin) / 2;
      yMin = center - 0.5;
      yMax = center + 0.5;
    }

    // Define layout (matching Python code)
    const layout = {
      title: 'HOMO_EV vs LUMO_EV',
      xaxis: {
        title: {
          text: 'HOMO (eV)',
          font: {
            size: 14,
            color: '#000000'
          }
        },
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)',
        range: [xMin, xMax]
      },
      yaxis: {
        title: {
          text: 'LUMO (eV)',
          font: {
            size: 14,
            color: '#000000'
          }
        },
        zeroline: true,
        gridcolor: 'rgba(0,0,0,0.1)',
        range: [yMin, yMax]
      },
      legend: {
        title: 'SOLUBILITY',
        x: 0,
        y: 1,
        orientation: 'v'
      },
      margin: {
        l: 80,
        r: 40,
        t: 60,
        b: 80
      },
      paper_bgcolor: 'rgba(255,255,255,0.9)',
      plot_bgcolor: 'rgba(255,255,255,0.9)',
      font: {
        family: 'Arial, sans-serif',
        size: 12
      },
      autosize: true,
      hovermode: 'closest',
      width: 1200,
      height: 800
    };
    
    Plotly.newPlot(moChartRef.current, traces, layout, {responsive: true});
    
    // Add click event listener for MO chart
    moChartRef.current.on('plotly_click', handlePointClick);
  };

  const handleShowAnalysis = () => {
    setShowAnalysis(true);
    // Update the chart after state is updated
    setTimeout(() => {
      if (activeTab === 'radar' && spiderChartRef.current && selectedMolecules.length > 0) {
        updateSpiderChart();
      } else if (activeTab === 'esp' && espChartRef.current && selectedMolecules.length > 0) {
        updateESPChart();
      } else if (activeTab === 'mo' && moChartRef.current) {
        updateMOChart();
      }
    }, 100);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (showAnalysis) {
      setTimeout(() => {
        if (tab === 'radar' && spiderChartRef.current && selectedMolecules.length > 0) {
          updateSpiderChart();
        } else if (tab === 'esp' && espChartRef.current && selectedMolecules.length > 0) {
          updateESPChart();
        } else if (tab === 'mo' && moChartRef.current) {
          updateMOChart();
        }
      }, 100);
    }
  };

  // Handle clicks on chart points to show popup
  const handlePointClick = (data) => {
    if (data.points && data.points[0]) {
      const point = data.points[0];
      
      // Find the molecule data from the clicked point
      let clickedMolecule = null;
      
      if (activeTab === 'esp') {
        // For ESP chart, find by ESP coordinates
        clickedMolecule = selectedMolecules.find(mol => 
          Math.abs(mol.esp_min_ev - point.x) < 0.001 && 
          Math.abs(mol.esp_max_ev - point.y) < 0.001
        );
      } else if (activeTab === 'mo') {
        // For MO chart, check if this is a selected molecule (not reference)
        if (point.data.name === 'Selected Molecules') {
          // Find by HOMO/LUMO coordinates
          clickedMolecule = selectedMolecules.find(mol => 
            Math.abs(mol.homo_ev - point.x) < 0.1 && 
            Math.abs(mol.lumo_ev - point.y) < 0.1
          );
        }
      }
      
      if (clickedMolecule) {
        // Transform favorite data to match NodePopup expected format
        const nodeData = {
          smiles: clickedMolecule.smiles,
          x: clickedMolecule.umap_x || 0,
          y: clickedMolecule.umap_y || 0,
          properties: {
            molwt: clickedMolecule.molecular_weight,
            homo_eV: clickedMolecule.homo_ev,
            lumo_eV: clickedMolecule.lumo_ev,
            esp_min_eV: clickedMolecule.esp_min_ev,
            esp_max_eV: clickedMolecule.esp_max_ev,
            predicted_mp: clickedMolecule.predicted_melting_point,
            predicted_bp: clickedMolecule.predicted_boiling_point,
            functional_groups: clickedMolecule.functional_groups
          },
          rawData: clickedMolecule
        };
        
        setSelectedNode(nodeData);
        setShowPopup(true);
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedNode(null);
  };

  // Function to handle adding molecule to favorites (already in favorites, so just show message)
  const handleAddToFavorites = async (molecule) => {
    const smiles = molecule.smiles;
    
    setMoleculeFavoriteStatus(prev => ({
      ...prev,
      [smiles]: { loading: false, success: 'This molecule is already in your favorites!', error: null }
    }));

    // Hide success message after 3 seconds
    setTimeout(() => {
      setMoleculeFavoriteStatus(prev => ({
        ...prev,
        [smiles]: { ...prev[smiles], success: null }
      }));
    }, 3000);
  };

  // Create filter labels for the popup
  const filterLabels = {
    molwt: 'Molecular Weight',
    homo_eV: 'HOMO (eV)',
    lumo_eV: 'LUMO (eV)',
    esp_min_eV: 'ESP Min (eV)',
    esp_max_eV: 'ESP Max (eV)',
    predicted_mp: 'Predicted Melting Point (°C)',
    predicted_bp: 'Predicted Boiling Point (°C)',
    functional_groups: 'Functional Groups'
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
                  <th>
                    Predicted Flash Point
                  </th>
                  <th>
                    Combustion Enthalpy
                  </th>
                  <th>
                    Commercial Score
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
                  <th>Commercial Link</th>
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
                    <td>{favorite.predicted_fp_celsius !== undefined && favorite.predicted_fp_celsius !== null ? favorite.predicted_fp_celsius : 'N/A'}</td>
                    <td>{favorite.combustion_enthalpy_ev !== undefined && favorite.combustion_enthalpy_ev !== null ? favorite.combustion_enthalpy_ev : 'N/A'}</td>
                    <td>{favorite.commercial_score !== undefined && favorite.commercial_score !== null ? favorite.commercial_score : 'N/A'}</td>
                    <td>{favorite.esp_min_ev ? favorite.esp_min_ev.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.esp_max_ev ? favorite.esp_max_ev.toFixed(2) : 'N/A'}</td>
                    <td>{favorite.functional_groups || 'N/A'}</td>
                    <td>
                      {favorite.umap_x ? favorite.umap_x.toFixed(2) : 'N/A'} / 
                      {favorite.umap_y ? favorite.umap_y.toFixed(2) : 'N/A'}
                    </td>
                    <td>{formatDate(favorite.created_at)}</td>
                    <td>
                      {favorite.commercial_link ? (
                        <a href={favorite.commercial_link} target="_blank" rel="noopener noreferrer">View Link</a>
                      ) : 'N/A'}
                    </td>
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

export default FavoritesGrid; 