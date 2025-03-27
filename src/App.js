import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import Box from '@mui/material/Box';
import MuiSlider from '@mui/material/Slider';
import logo from './logo-ses-ai.svg';
import './App.css';

// Create a Plotly Component using the plotly.js factory
const Plot = createPlotlyComponent(Plotly);

// Navigation bar component
const Navbar = ({ activePage }) => {
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <img src={logo} alt="SES AI Logo" className="navbar-logo" />
      </div>
      <div className="navbar-links">
        <a href="#" className="navbar-link">Products</a>
        <a href="#" className="navbar-link">Technology</a>
        <a href="#" className="navbar-link">Company</a>
        <a href="#" className="navbar-link">Media</a>
        <a
          href="#"
          className={`navbar-link ${(activePage === 'explorer' || activePage === 'about' || activePage === 'search') ? 'active' : ''}`}
        >
          Molecular Universe
        </a>
      </div>
    </nav>
  );
};

// Popup component to display node data
const NodePopup = ({ node, onClose }) => {
  if (!node) return null;
  
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content black-bg" onClick={e => e.stopPropagation()}>
        <button className="close-button white-text" onClick={onClose}>×</button>
        <h2 className="white-text">Node Details</h2>
        <div className="popup-data">
          <h3 className="white-text">SMILES</h3>
          <p className="dark-field">{node.smiles}</p>
          
          <h3 className="white-text">UMAP Coordinates</h3>
          <p className="dark-field">X: {node.x.toFixed(6)}, Y: {node.y.toFixed(6)}</p>
          
          <h3 className="white-text">Properties</h3>
          <table className="property-table dark-table">
            <tbody>
              {Object.entries(node.properties || {}).map(([key, value]) => (
                <tr key={key}>
                  <td className="property-name white-text">{key}</td>
                  <td className="property-value white-text">
                    {value !== null && value !== undefined 
                      ? typeof value === 'number' 
                        ? value.toFixed(6) 
                        : value.toString()
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h3 className="white-text">All Data</h3>
          <pre className="raw-data dark-field">
            {JSON.stringify(node.rawData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Material UI Slider component
const Slider = ({ property, value, min, max, onChange, label, active }) => {
  const handleChange = (event, newValue) => {
    onChange(property, newValue);
  };

  const formatValue = (value) => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    return value;
  };

  return (
    <div className={`slider-container ${active ? 'active-filter' : 'inactive-filter'}`}>
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">
          {active 
            ? `${formatValue(value[0])} - ${formatValue(value[1])}` 
            : "Off"}
        </span>
      </div>
      <Box sx={{ width: '100%', padding: '5px 0' }}>
        <MuiSlider
          size="small"
          value={value}
          min={min}
          max={max}
          step={(max - min) / 100}
          onChange={handleChange}
          valueLabelDisplay="auto"
          disableSwap
          sx={{
            color: '#0080ff',
            '& .MuiSlider-thumb': {
              backgroundColor: active ? '#0080ff' : '#a0a0a0',
            },
            '& .MuiSlider-track': {
              backgroundColor: active ? '#0080ff' : '#a0a0a0',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#e0e0e0',
            }
          }}
        />
      </Box>
    </div>
  );
};

// About component
const About = () => {
  return (
    <div className="about-container">
      <div className="about-content-wrapper">
        <div className="about-content">
          <p>
            SES AI scientists have amassed a complete "molecular universe" of over 87 million molecules along with a vast database of their various properties to serve both public and private industry searches for compounds that will propel future technologies. Initially built to serve our internal search for molecules that could build better lithium metal batteries, the molecular universe now serves beyond this initial mission. SES AI has decided to provide both free and subscription tiered access to the world. Read on to learn more about the specifics of the Molecular Universe.
          </p>
        </div>
        <h3>About the Universe Map</h3>
        <div className="blue-line"></div>
        <div className="umap-section">
          <div className="umap-description">
            <p>
              The Molecular Universe Map takes 512 calculated properties and does dimensionality reduction using the UMAP reductionality method to project these relationships down to a 2-dimensional representation of the molecules which can be plotted as a map (right)​
            </p>
          </div>
          <div className="umap-image">
            <img src="/high_res_umap_figure.png" alt="UMAP Visualization" />
          </div>
        </div>
        <h3>Terms and Service</h3>
        <div className="blue-line"></div>
        <div className="terms-section">
          <div className="term-item">
            <h4>UMAP (Uniform Manifold Approximation and Projection):</h4>
            <p>A machine learning technique used to reduce high-dimensional data into 2D or 3D for easy visualization. In chemistry, it helps show patterns and clusters in molecular datasets.​</p>
          </div>

          <div className="term-item">
            <h4>SMILES (Simplified Molecular Input Line Entry System):</h4>
            <p>A way to represent a molecule's structure as a line of text. It uses letters and symbols to describe atoms and bonds, making it easy for computers to process chemical structures.​</p>
          </div>

          <div className="term-item">
            <h4>HOMO (Highest Occupied Molecular Orbital):</h4>
            <p>The highest energy level that contains electrons in a molecule. It plays a key role in determining how a molecule donates electrons during chemical reactions.​</p>
          </div>

          <div className="term-item">
            <h4>LUMO (Lowest Unoccupied Molecular Orbital):</h4>
            <p>The lowest energy level that can accept electrons. It helps predict how a molecule will react, especially when accepting electrons from another molecule.​</p>
          </div>

          <div className="term-item">
            <h4>Min Electrostatic Potential:</h4>
            <p>The most negatively charged area on a molecule's surface. It usually shows where positively charged species (like protons) may be attracted.​</p>
          </div>

          <div className="term-item">
            <h4>Predicted Melting Point:</h4>
            <p>​</p>
          </div>

          <div className="term-item">
            <h4>Predicted Boiling Point:</h4>
            <p>​</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chatbot component
const ChatbotInterface = () => {
  return (
    <div className="chatbot-container">
      <div className="chatbot-content">
        <h2>AI Molecular Assistant</h2>
        <div className="chat-messages">
          <div className="system-message">
            <p>Welcome to the Molecular Universe AI Assistant. How can I help you today?</p>
          </div>
        </div>
        <div className="chat-input-container">
          <textarea 
            className="chat-input" 
            placeholder="Ask a question about molecules, properties, or chemical structures..."
            rows={3}
          />
          <button className="send-button">Send</button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [graphData, setGraphData] = useState([]);
  const [filteredGraphData, setFilteredGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activePage, setActivePage] = useState('explorer');
  const [searchType, setSearchType] = useState('Lookup');
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchedMolecule, setSearchedMolecule] = useState(null);
  
  // New filter implementation with range values
  const [filterRanges, setFilterRanges] = useState({
    molwt: { min: 0, max: 1000, range: [0, 1000], active: false },
    homo_eV: { min: -10, max: 0, range: [-10, 0], active: false },
    lumo_eV: { min: -5, max: 5, range: [-5, 5], active: false },
    esp_max_eV: { min: -2, max: 2, range: [-2, 2], active: false },
    esp_min_eV: { min: -2, max: 0, range: [-2, 0], active: false }
  });
  
  // Use refs to avoid dependency issues in useEffect
  const filterRangesRef = useRef(filterRanges);
  useEffect(() => {
    filterRangesRef.current = filterRanges;
  }, [filterRanges]);
  
  // Labels for filters
  const filterLabels = {
    molwt: "Molecular Weight",
    homo_eV: "HOMO (eV)",
    lumo_eV: "LUMO (eV)",
    esp_max_eV: "Max ESP (eV)",
    esp_min_eV: "Min ESP (eV)"
  };
  const filterLabelsRef = useRef(filterLabels);

  const MAX_NODES = 500000;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.PUBLIC_URL}/umap_product_demo_1M_set.csv`);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("Parse errors:", results.errors);
            }
            const nodes = results.data
              .filter(row => row && row.umap_0 !== undefined && row.umap_1 !== undefined && row.smiles)
              .slice(0, MAX_NODES)
              .map((row, index) => ({
                id: index.toString(),
                x: Number(row.umap_0),
                y: Number(row.umap_1),
                smiles: row.smiles,
                properties: {
                  molwt: row.molwt,
                  homo_eV: row.homo_eV,
                  lumo_eV: row.lumo_eV,
                  esp_min_eV: row.esp_min_eV,
                  esp_max_eV: row.esp_max_eV
                },
                rawData: row
              }));
            
            setGraphData(nodes);
            setFilteredGraphData(nodes);
            
            // Initialize filter ranges based on actual data
            const currentFilterRanges = filterRangesRef.current;
            const currentFilterLabels = filterLabelsRef.current;
            const newFilterRanges = { ...currentFilterRanges };
            Object.keys(currentFilterLabels).forEach(key => {
              const values = nodes
                .map(node => node.properties[key])
                .filter(v => v !== undefined && v !== null);
              if (values.length > 0) {
                const min = Math.min(...values);
                const max = Math.max(...values);
                newFilterRanges[key] = {
                  min: min,
                  max: max,
                  range: [min, max], // Initialize range to full data range (filter effectively off)
                  active: false
                };
              }
            });
            setFilterRanges(newFilterRanges);
            setLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            setError(`Parse error: ${error}`);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters based on range slider values
  useEffect(() => {
    if (graphData.length === 0) return;
    const filtered = graphData.filter(node => {
      for (const [property, range] of Object.entries(filterRanges)) {
        if (!range.active) continue;
        const nodeValue = node.properties[property];
        // If property is outside the range, filter it out
        if (nodeValue !== undefined && nodeValue !== null && 
            (nodeValue < range.range[0] || nodeValue > range.range[1])) {
          return false;
        }
      }
      return true;
    });
    if (JSON.stringify(filtered) !== JSON.stringify(filteredGraphData)) {
      setFilteredGraphData(filtered);
    }
  }, [graphData, filterRanges, filteredGraphData]);

  // Handle filter slider change
  const handleFilterChange = (property, newValue) => {
    setFilterRanges(prev => ({
      ...prev,
      [property]: {
        ...prev[property],
        range: newValue,
        active: true
      }
    }));
  };

  // Reset a specific filter
  const resetFilter = (property) => {
    setFilterRanges(prev => ({
      ...prev,
      [property]: {
        ...prev[property],
        range: [prev[property].min, prev[property].max],
        active: false
      }
    }));
  };

  // Reset all filters
  const resetAllFilters = () => {
    setFilterRanges(prev => {
      const newRanges = {};
      for (const [key, range] of Object.entries(prev)) {
        newRanges[key] = {
          ...range,
          range: [range.min, range.max],
          active: false
        };
      }
      return newRanges;
    });
  };

  // Handle clicks on Plotly points
  const handlePointClick = (data) => {
    if (!data.points || data.points.length === 0) return;
    const pointIndex = data.points[0].pointIndex;
    const node = filteredGraphData[pointIndex];
    if (node) {
      setSelectedNode(node);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  // Prepare Plotly data using the filtered graph data
  const plotlyData = [{
    x: filteredGraphData.map(node => node.x),
    y: filteredGraphData.map(node => node.y),
    mode: 'markers',
    type: 'scattergl',
    marker: {
      size: 5,
      color: filteredGraphData.map(node => node.x),
      colorscale: [
        [0, '#3498db'],
        [0.5, '#2ecc71'],
        [1, '#e74c3c']
      ],
      opacity: 0.7
    },
    hoverinfo: 'text',
    text: filteredGraphData.map(node => 
      `<b>Molecule Information:</b><br>` +
      `SMILES: ${node.smiles}<br>` +
      `MW: ${node.properties?.molwt ? node.properties.molwt.toFixed(2) : 'N/A'}<br>` +
      `HOMO (eV): ${node.properties?.homo_eV ? node.properties.homo_eV.toFixed(4) : 'N/A'}<br>` +
      `LUMO (eV): ${node.properties?.lumo_eV ? node.properties.lumo_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Min: ${node.properties?.esp_min_eV ? node.properties.esp_min_eV.toFixed(4) : 'N/A'}<br>` +
      `ESP Max: ${node.properties?.esp_max_eV ? node.properties.esp_max_eV.toFixed(4) : 'N/A'}`
    )
  }];

  const plotlyLayout = {
    autosize: true,
    height: 600,
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { l: 0, r: 0, b: 0, t: 0, pad: 0 },
    font: {
      family: 'Arial, sans-serif',
      size: 12,
      color: '#333'
    },
    xaxis: { showgrid: false, zeroline: false, visible: false },
    yaxis: { showgrid: false, zeroline: false, visible: false },
    showlegend: false,
    hovermode: 'closest',
    hoverlabel: {
      bgcolor: '#000',
      bordercolor: '#333',
      font: {
        family: 'Arial, sans-serif',
        size: 12,
        color: '#fff'
      }
    }
  };

  const plotlyConfig = {
    displayModeBar: true,
    responsive: true,
    scrollZoom: true,
    modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d', 'toggleHover']
  };

  // Count how many filters are active
  const activeFilterCount = Object.values(filterRanges).filter(range => range.active).length;

  // Add a ref and click-outside handler for the search dropdown
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (searchType !== 'Lookup' || !searchInput.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchedMolecule(null);

    try {
      // First, find the molecule in our CSV data
      const matchingMolecule = graphData.find(node => 
        node.smiles.toLowerCase() === searchInput.trim().toLowerCase()
      );
      
      setSearchedMolecule(matchingMolecule);

      // Then fetch the molecule visualization
      const response = await fetch(`http://localhost:8000/molecule?smiles=${encodeURIComponent(searchInput.trim())}`);
      if (!response.ok) {
        throw new Error('Failed to fetch molecule data');
      }
      const data = await response.blob();
      const imageUrl = URL.createObjectURL(data);
      setSearchResult(imageUrl);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="App">
      {/* Navbar */}
      <Navbar activePage={activePage} />
      
      <header className="App-header">
        <div className="header-content">
          <div className="header-links">
            <a 
              href="#"
              className={`header-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('about'); }}
            >
              About
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'explorer' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('explorer'); }}
            >
              Universe Map
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'search' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('search'); }}
            >
              Search
            </a>
            <a 
              href="#"
              className={`header-link ${activePage === 'chatbot' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActivePage('chatbot'); }}
            >
              Chatbot
            </a>
          </div>
        </div>
        <div className="stats-container">
          {activePage === 'explorer' && (
            <>
              <div>Showing: {filteredGraphData.length} of {graphData.length} nodes</div>
              <div>Filters: {activeFilterCount} active</div>
              {loading && <div>Loading...</div>}
            </>
          )}
        </div>
      </header>
      
      <div className="main-container">
        {activePage === 'explorer' ? (
          <>
            <div className="graph-container">
              <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {filteredGraphData.length > 0 ? (
                  <Plot
                    data={plotlyData}
                    layout={plotlyLayout}
                    config={plotlyConfig}
                    style={{ width: '100%', height: '100%' }}
                    onClick={handlePointClick}
                  />
                ) : (
                  <div className="loading-message">
                    {loading ? 'Loading UMAP data...' : error ? 'Error loading data' : 'No data available'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="info-panel">
              <h2>
                Filters 
                {activeFilterCount > 0 && (
                  <button 
                    className="reset-button" 
                    onClick={resetAllFilters}
                    title="Reset all filters"
                  >
                    Reset All
                  </button>
                )}
              </h2>
              <div className="sliders-container">
                {Object.entries(filterRanges).map(([property, range]) => (
                  <div key={property} className="filter-wrapper">
                    <Slider
                      property={property}
                      value={range.range}
                      min={range.min}
                      max={range.max}
                      onChange={handleFilterChange}
                      label={filterLabels[property]}
                      active={range.active}
                    />
                    {range.active && (
                      <button 
                        className="reset-filter-button" 
                        onClick={() => resetFilter(property)}
                        title="Reset this filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : activePage === 'about' ? (
          <About />
        ) : activePage === 'chatbot' ? (
          <ChatbotInterface />
        ) : (
          // SEARCH PAGE CONTENT:
          <div className="search-container">
            {/* Search bar container */}
            <div className="search-content">
              <div 
                className="search-bar-container" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '550px',
                  margin: '0 auto',
                  position: 'relative'
                }}
                ref={dropdownRef}
              >
                {/* The Lookup button + dropdown */}
                <button
                  className="lookup-button"
                  style={{
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    padding: '0 20px',
                    height: '40px',
                    cursor: 'pointer',
                    borderRadius: '4px 0 0 4px'
                  }}
                  onClick={() => {
                    if (searchType === 'Lookup' && searchInput.trim()) {
                      handleSearch();
                    } else {
                      setShowDropdown(!showDropdown);
                    }
                  }}
                >
                  {searchType} ▼
                </button>
                
                {/* The dropdown menu that appears when showDropdown is true */}
                {showDropdown && (
                  <div
                    className="dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '42px',
                      left: 0,
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      width: '120px',
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div
                      className="dropdown-item"
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                      onClick={() => {
                        setSearchType('Ask A Question');
                        setShowDropdown(false);
                      }}
                    >
                      Ask A Question
                    </div>
                    <div
                      className="dropdown-item"
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fff'}
                      onClick={() => {
                        setSearchType('Lookup');
                        setShowDropdown(false);
                      }}
                    >
                      Lookup
                    </div>
                  </div>
                )}
                
                {/* The text input for searching */}
                <input
                  type="text"
                  placeholder={searchType === 'Lookup' ? "Enter SMILES string..." : "Ask a question..."}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: '1px solid #ccc',
                    borderRadius: '0 4px 4px 0',
                    padding: '0 10px',
                    outline: 'none'
                  }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchType === 'Lookup') {
                      handleSearch();
                    }
                  }}
                />
              </div>

              {/* Search Results */}
              <div className="search-results">
                {searchLoading && (
                  <div className="search-loading">Loading...</div>
                )}
                
                {searchError && (
                  <div className="search-error">
                    Error: {searchError}
                  </div>
                )}
                
                {searchResult && (
                  <div className="search-result">
                    
                    {searchedMolecule ? (
                      <div className="molecule-properties">
                        <h3>Molecule Properties:</h3>
                        <table className="property-table">
                          <tbody>
                            <tr>
                              <td className="property-name">Molecular Weight</td>
                              <td className="property-value">
                                {searchedMolecule.properties?.molwt ? searchedMolecule.properties.molwt.toFixed(4) : 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="property-name">HOMO (eV)</td>
                              <td className="property-value">
                                {searchedMolecule.properties?.homo_eV ? searchedMolecule.properties.homo_eV.toFixed(4) : 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="property-name">LUMO (eV)</td>
                              <td className="property-value">
                                {searchedMolecule.properties?.lumo_eV ? searchedMolecule.properties.lumo_eV.toFixed(4) : 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="property-name">ESP Min (eV)</td>
                              <td className="property-value">
                                {searchedMolecule.properties?.esp_min_eV ? searchedMolecule.properties.esp_min_eV.toFixed(4) : 'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td className="property-name">ESP Max (eV)</td>
                              <td className="property-value">
                                {searchedMolecule.properties?.esp_max_eV ? searchedMolecule.properties.esp_max_eV.toFixed(4) : 'N/A'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="molecule-not-found">
                        <p>This molecule was not found in our database.</p>
                      </div>
                    )}
                    
                    {searchedMolecule && (
                      <img 
                        src={searchResult} 
                        alt="Molecule visualization" 
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          marginTop: '20px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showPopup && selectedNode && (
        <NodePopup node={selectedNode} onClose={handleClosePopup} />
      )}
    </div>
  );
};

export default App;
