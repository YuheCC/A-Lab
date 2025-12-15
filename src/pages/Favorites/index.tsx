import { useState, useEffect, useRef } from 'react';
import { authFetch, getAPIUrl } from '@/utils.js';
import { useAuthStore } from '@/models/useAuth';
import NodePopup from '@/components/NodePopup';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@umijs/max';
import RadarChart from './components/RadarChart';
import ESPChart from './components/ESPChart';
import MOChart from './components/MOChart';
import './index.less';

const API_URL = getAPIUrl();

// 定义类型
interface Favorite {
  id: string;
  smiles: string;
  molecular_weight: number;
  homo_ev: number;
  lumo_ev: number;
  esp_min_ev: number;
  esp_max_ev: number;
  predicted_melting_point: number;
  predicted_boiling_point: number;
  predicted_fp_celsius: number;
  combustion_enthalpy_ev: number;
  commercial_score: number;
  commercial_link: string;
  functional_groups: string;
  umap_x: number;
  umap_y: number;
  created_at: string;
  solubility?: string;
  abbreviation?: string;
}

interface Node {
  id: string;
  x: number;
  y: number;
  smiles: string;
  properties: {
    molwt: number;
    homo_eV: number;
    lumo_eV: number;
    esp_min_eV: number;
    esp_max_eV: number;
    functional_groups: string;
    predicted_mp: number;
    predicted_bp: number;
    predicted_fp: number;
    chemical_formula: string;
    combustion_enthalpy: number;
    commercial_score: number;
    commercial_link: string;
    CLUSTER: string;
    [key: string]: any;
  };
  rawData: any;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface ColumnWidths {
  checkbox: number;
  image: number;
  smiles: number;
  molecularWeight: number;
  homo: number;
  lumo: number;
  mp: number;
  bp: number;
  fp: number;
  combustion: number;
  commercial: number;
  espMin: number;
  espMax: number;
  functionalGroups: number;
  umap: number;
  addedDate: number;
  commercialLink: number;
  actions: number;
}

interface NodePopupRef {
  show: () => void;
  hide: () => void;
}

const FavoritesGrid = () => {
  const { t } = useTranslation();
  const { isAuthenticated, userPermissions } = useAuthStore();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moleculeImages, setMoleculeImages] = useState<Record<string, string>>({});
  const [selectedMolecules, setSelectedMolecules] = useState<Favorite[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [activeTab, setActiveTab] = useState('radar');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const nodePopupRef = useRef<NodePopupRef>(null);
  const [node, setNode] = useState<Node | null>(null);

  // Column resizing state
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    checkbox: 40,
    image: 60,
    smiles: 300,
    molecularWeight: 120,
    homo: 100,
    lumo: 100,
    mp: 100,
    bp: 100,
    fp: 140,
    combustion: 180,
    commercial: 180,
    espMin: 100,
    espMax: 100,
    functionalGroups: 200,
    umap: 100,
    addedDate: 150,
    commercialLink: 120,
    actions: 80
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);

  // Helper function to check if user has admin or enterprise permissions
  const canSeePredictedProperties = isAuthenticated && (userPermissions === 'admin' || userPermissions === 'enterprise');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`${API_URL}/favorites-retrieve`);

        if (!response.ok) {
          throw new Error(`${t('favorites.errorLoadingFavorites')}: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setFavorites(data);
        setFilteredFavorites(data);
        // Debug: log the favorites array to inspect its properties
        console.log('Fetched favorites:', data);
        
        // Fetch molecule images for each favorite
        fetchMoleculeImages(data);
      } catch (err: unknown) {
        console.error('Error fetching favorites:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
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
          if (a[sortConfig.key as keyof Favorite] === null || a[sortConfig.key as keyof Favorite] === undefined) return 1;
          if (b[sortConfig.key as keyof Favorite] === null || b[sortConfig.key as keyof Favorite] === undefined) return -1;
          
          let aValue = a[sortConfig.key as keyof Favorite];
          let bValue = b[sortConfig.key as keyof Favorite];
          
          // Special case for dates
          if (sortConfig.key === 'created_at') {
            aValue = new Date(aValue as string).getTime();
            bValue = new Date(bValue as string).getTime();
          }
          
          // String comparison for text fields
          if (typeof aValue === 'string') {
            const comparison = aValue.localeCompare(bValue as string);
            return sortConfig.direction === 'asc' ? comparison : -comparison;
          }
          
          // Number comparison
          const comparison = (aValue as number) - (bValue as number);
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
        return sortableItems;
      });
    }
  }, [sortConfig]);

  // 图表更新现在由组件自己的 props 变化触发，无需手动调用

  // Column resizing handlers
  const handleMouseDown = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizingColumn(columnKey);
    setStartX(e.clientX);
    setStartWidth(columnWidths[columnKey as keyof ColumnWidths]);
    document.body.classList.add('no-select'); // Prevent text selection
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizingColumn) return;
    
    const diff = e.clientX - startX;
    const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizingColumn(null);
    document.body.classList.remove('no-select'); // Re-enable text selection
  };

  // Add global mouse event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizingColumn, startX, startWidth]);

  const fetchMoleculeImages = async (favoritesData: Favorite[]) => {
    const images: Record<string, string> = {};
    
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

  const handleRemoveFavorite = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Ask for confirmation before removing
    if (!window.confirm(t('favorites.confirmRemove'))) {
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
      successToast.textContent = t('favorites.moleculeRemoved');
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
      errorToast.textContent = t('favorites.removeFailed');
      document.body.appendChild(errorToast);
      
      // Remove the toast after 3 seconds
      setTimeout(() => {
        if (errorToast.parentNode) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    }
  };

  const handleBulkDeleteFavorites = async () => {
    if (selectedMolecules.length === 0) return;
    
    // Ask for confirmation before removing
    const confirmMessage = t('favorites.bulkDeleteConfirm', { count: selectedMolecules.length });
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    setBulkDeleteLoading(true);
    
    try {
      const deletePromises = selectedMolecules.map(molecule => 
        authFetch(`${API_URL}/favorites-delete/${molecule.id}`, {
          method: 'DELETE'
        })
      );
      
      // Wait for all delete requests to complete
      const results = await Promise.allSettled(deletePromises);
      
      // Check for any failures
      const failures = results.filter(result => result.status === 'rejected' || 
        (result.status === 'fulfilled' && !result.value.ok));
      
      if (failures.length > 0) {
        console.error('Some deletions failed:', failures);
        
        // Show partial success/error message
        const errorToast = document.createElement('div');
        errorToast.className = 'toast-message error';
        errorToast.textContent = t('favorites.bulkDeletePartialError', { failed: failures.length, total: selectedMolecules.length });
        document.body.appendChild(errorToast);
        
        setTimeout(() => {
          if (errorToast.parentNode) {
            document.body.removeChild(errorToast);
          }
        }, 5000);
      }
      
      // Remove successfully deleted molecules from state
      const successfulDeletions = selectedMolecules.filter((_, index) => 
        results[index].status === 'fulfilled' && results[index].value.ok
      );
      
      const deletedIds = successfulDeletions.map(molecule => molecule.id);
      setFavorites(favorites.filter(favorite => !deletedIds.includes(favorite.id)));
      setSelectedMolecules([]);
      
      // Show success message
      const successToast = document.createElement('div');
      successToast.className = 'toast-message success';
      successToast.textContent = t('favorites.bulkDeleteSuccess', { count: successfulDeletions.length });
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        if (successToast.parentNode) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
    } catch (err) {
      console.error('Error during bulk delete:', err);
      
      // Show error message
      const errorToast = document.createElement('div');
      errorToast.className = 'toast-message error';
      errorToast.textContent = t('favorites.bulkDeleteError');
      document.body.appendChild(errorToast);
      
      setTimeout(() => {
        if (errorToast.parentNode) {
          document.body.removeChild(errorToast);
        }
      }, 3000);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t('favorites.notAvailable');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMoleculeSelection = (favorite: Favorite, checked: boolean) => {
    if (checked) {
      setSelectedMolecules(prev => [...prev, favorite]);
    } else {
      setSelectedMolecules(prev => prev.filter(mol => mol.id !== favorite.id));
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleShowAnalysis = () => {
    setShowAnalysis(true);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle clicks on chart points to show popup
  const handlePointClick = (data: any) => {
    if (data.points && data.points[0]) {
      const point = data.points[0];
      
      // Find the molecule data from the clicked point
      let clickedMolecule: Favorite | null = null;
      
      if (activeTab === 'esp') {
        // For ESP chart, find by ESP coordinates
        clickedMolecule = selectedMolecules.find(mol => 
          Math.abs(mol.esp_min_ev - point.x) < 0.001 && 
          Math.abs(mol.esp_max_ev - point.y) < 0.001
        ) || null;
      } else if (activeTab === 'mo') {
        // For MO chart, check if this is a selected molecule (not reference)
        if (point.data.name === t('favorites.chartLabels.selectedMolecules')) {
          // Find by HOMO/LUMO coordinates
          clickedMolecule = selectedMolecules.find(mol => 
            Math.abs(mol.homo_ev - point.x) < 0.1 && 
            Math.abs(mol.lumo_ev - point.y) < 0.1
          ) || null;
        }
      }
      
      if (clickedMolecule) {
        // Debug: log the clicked molecule to inspect its properties
        console.log('Clicked molecule:', clickedMolecule);
        // Transform favorite data to match NodePopup expected format
        const nodeData: Node = {
          id: clickedMolecule.id,
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
            functional_groups: clickedMolecule.functional_groups,
            commercial_score: clickedMolecule.commercial_score,
            commercial_link: clickedMolecule.commercial_link,
            CLUSTER: '',
            chemical_formula: '',
            combustion_enthalpy: clickedMolecule.combustion_enthalpy_ev,
            predicted_fp: clickedMolecule.predicted_fp_celsius
          },
          rawData: clickedMolecule
        };
        
        setNode(nodeData);
        nodePopupRef.current?.show();
      }
    }
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="loading-spinner"></div>
        <p>{t('favorites.loadingMessage')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-error">
        <h3>{t('favorites.errorLoadingFavorites')}</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{t('favorites.tryAgain')}</button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="no-favorites">
        <h3>{t('favorites.noFavoriteMolecules')}</h3>
        <p>{t('favorites.noFavoritesMessage')}</p>
        <p>{t('favorites.goToSearchPage')}</p>
        <a href="/search" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/search'); window.location.reload(); }}>{t('favorites.search')}</a>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      {!showAnalysis ? (
        <>
          <div className="favorites-header">
            <div className="analysis-tabs" style={{margin: "15px 0"}}>
              <button 
                className={`analysis-tab ${activeTab === 'radar' ? 'active' : ''}`}
                onClick={() => handleTabChange('radar')}
              >
                {t('favorites.radarTab')}
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'esp' ? 'active' : ''}`}
                onClick={() => handleTabChange('esp')}
              >
                {t('favorites.espTab')}
              </button>
              <button 
                className={`analysis-tab ${activeTab === 'mo' ? 'active' : ''}`}
                onClick={() => handleTabChange('mo')}
              >
                {t('favorites.moTab')}
              </button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                className="favorites-search-input"
                placeholder={t('favorites.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="favorites-actions">
              {selectedMolecules.length > 0 && (
                <button
                  className="show-analysis-button"
                  onClick={handleShowAnalysis}
                >
                  {t('favorites.analyzeSelected')} ({selectedMolecules.length})
                </button>
              )}

              {selectedMolecules.length > 1 && (
                <button
                  className="bulk-delete-button"
                  onClick={handleBulkDeleteFavorites}
                  disabled={bulkDeleteLoading}
                  style={{
                    backgroundColor: bulkDeleteLoading ? '#ccc' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: bulkDeleteLoading ? 'not-allowed' : 'pointer',
                    marginLeft: '10px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {bulkDeleteLoading ? t('favorites.bulkDeleting') : `${t('favorites.bulkDelete')} (${selectedMolecules.length})`}
                </button>
              )}

              <button
                className="back-to-search-button"
                onClick={() => navigate('/search')}
                style={{
                  backgroundColor: '#56b26a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {t('favorites.backToSearch')}
              </button>
            </div>
          </div>
          
          <div className="favorites-table-container">
            <table className="favorites-table">
              <thead>
                <tr>
                  <th className="checkbox-column resizable-header" style={{ width: columnWidths.checkbox }}>
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
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'checkbox')}></div>
                  </th>
                  <th className="resizable-header" style={{ width: columnWidths.image }}>
                    {t('favorites.tableHeaders.image')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'image')}></div>
                  </th>
                  <th onClick={() => handleSort('smiles')} className="sortable-header resizable-header" style={{ width: columnWidths.smiles }}>
                    {t('favorites.tableHeaders.smiles')} {getSortIndicator('smiles')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'smiles')}></div>
                  </th>
                  <th onClick={() => handleSort('molecular_weight')} className="sortable-header resizable-header" style={{ width: columnWidths.molecularWeight }}>
                    {t('favorites.tableHeaders.molecularWeight')} {getSortIndicator('molecular_weight')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'molecularWeight')}></div>
                  </th>
                  <th onClick={() => handleSort('homo_ev')} className="sortable-header resizable-header" style={{ width: columnWidths.homo }}>
                    {t('favorites.tableHeaders.homo')} {getSortIndicator('homo_ev')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'homo')}></div>
                  </th>
                  <th onClick={() => handleSort('lumo_ev')} className="sortable-header resizable-header" style={{ width: columnWidths.lumo }}>
                    {t('favorites.tableHeaders.lumo')} {getSortIndicator('lumo_ev')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'lumo')}></div>
                  </th>
                  {canSeePredictedProperties && (
                    <th onClick={() => handleSort('predicted_melting_point')} className="sortable-header resizable-header" style={{ width: columnWidths.mp }}>
                      {t('favorites.tableHeaders.meltingPoint')} {getSortIndicator('predicted_melting_point')}
                      <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'mp')}></div>
                    </th>
                  )}
                  {canSeePredictedProperties && (
                    <th onClick={() => handleSort('predicted_boiling_point')} className="sortable-header resizable-header" style={{ width: columnWidths.bp }}>
                      {t('favorites.tableHeaders.boilingPoint')} {getSortIndicator('predicted_boiling_point')}
                      <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'bp')}></div>
                    </th>
                  )}
                  {canSeePredictedProperties && (
                    <th className="resizable-header" style={{ width: columnWidths.fp }}>
                      {t('favorites.tableHeaders.flashPoint')}
                      <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'fp')}></div>
                    </th>
                  )}
                  <th className="resizable-header" style={{ width: columnWidths.combustion }}>
                    {t('favorites.tableHeaders.combustionEnthalpy')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'combustion')}></div>
                  </th>
                  <th className="resizable-header" style={{ width: columnWidths.commercial }}>
                    {t('favorites.tableHeaders.commercialViability')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'commercial')}></div>
                  </th>
                  <th onClick={() => handleSort('esp_min_ev')} className="sortable-header resizable-header" style={{ width: columnWidths.espMin }}>
                    {t('favorites.tableHeaders.espMin')} {getSortIndicator('esp_min_ev')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'espMin')}></div>
                  </th>
                  <th onClick={() => handleSort('esp_max_ev')} className="sortable-header resizable-header" style={{ width: columnWidths.espMax }}>
                    {t('favorites.tableHeaders.espMax')} {getSortIndicator('esp_max_ev')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'espMax')}></div>
                  </th>
                  <th onClick={() => handleSort('functional_groups')} className="sortable-header resizable-header" style={{ width: columnWidths.functionalGroups }}>
                    {t('favorites.tableHeaders.functionalGroups')} {getSortIndicator('functional_groups')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'functionalGroups')}></div>
                  </th>
                  <th className="resizable-header" style={{ width: columnWidths.umap }}>
                    {t('favorites.tableHeaders.umapCoordinates')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'umap')}></div>
                  </th>
                  <th onClick={() => handleSort('created_at')} className="sortable-header resizable-header" style={{ width: columnWidths.addedDate }}>
                    {t('favorites.tableHeaders.addedDate')} {getSortIndicator('created_at')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'addedDate')}></div>
                  </th>
                  {
                    false && (
                      <th className="resizable-header" style={{ width: columnWidths.commercialLink }}>
                        {t('favorites.tableHeaders.commercialLink')}
                        <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'commercialLink')}></div>
                      </th>
                    )
                  }
                  <th className="resizable-header" style={{ width: columnWidths.actions }}>
                    {t('favorites.tableHeaders.actions')}
                    <div className="resize-handle" onMouseDown={(e) => handleMouseDown(e, 'actions')}></div>
                  </th>
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
                        t('favorites.loadingImage')
                      )}
                    </td>
                    <td>{favorite.smiles}</td>
                    <td>{favorite.molecular_weight ? favorite.molecular_weight.toFixed(4) : t('favorites.notAvailable')}</td>
                    <td>{favorite.homo_ev ? favorite.homo_ev.toFixed(4) : t('favorites.notAvailable')}</td>
                    <td>{favorite.lumo_ev ? favorite.lumo_ev.toFixed(4) : t('favorites.notAvailable')}</td>
                    {canSeePredictedProperties && (
                      <td>{favorite.predicted_melting_point ? favorite.predicted_melting_point.toFixed(4) : t('favorites.notAvailable')}</td>
                    )}
                    {canSeePredictedProperties && (
                      <td>{favorite.predicted_boiling_point ? favorite.predicted_boiling_point.toFixed(4) : t('favorites.notAvailable')}</td>
                    )}
                    {canSeePredictedProperties && (
                      <td>{favorite.predicted_fp_celsius !== undefined && favorite.predicted_fp_celsius !== null ? favorite.predicted_fp_celsius : t('favorites.notAvailable')}</td>
                    )}
                    <td>{favorite.combustion_enthalpy_ev !== undefined && favorite.combustion_enthalpy_ev !== null ? favorite.combustion_enthalpy_ev : '0'}</td>
                    <td>{favorite.commercial_score !== undefined && favorite.commercial_score !== null ? favorite.commercial_score : t('favorites.notAvailable')}</td>
                    <td>{favorite.esp_min_ev ? favorite.esp_min_ev.toFixed(4) : t('favorites.notAvailable')}</td>
                    <td>{favorite.esp_max_ev ? favorite.esp_max_ev.toFixed(4) : t('favorites.notAvailable')}</td>
                    <td>{favorite.functional_groups || t('favorites.notAvailable')}</td>
                    <td>
                      {favorite.umap_x ? favorite.umap_x.toFixed(4) : t('favorites.notAvailable')} / 
                      {favorite.umap_y ? favorite.umap_y.toFixed(4) : t('favorites.notAvailable')}
                    </td>
                    <td>{formatDate(favorite.created_at)}</td>
                    <td>
                      <button 
                        className="remove-favorite-table-button" 
                        onClick={(e) => handleRemoveFavorite(favorite.id, e)}
                        title={t('favorites.tooltips.removeFromFavorites')}
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
              {activeTab === 'radar' ? t('favorites.radarAnalysis') : 
               activeTab === 'esp' ? t('favorites.espAnalysis') : 
               t('favorites.moAnalysis')}
            </h2>
            <div className="selected-molecules-count">
              {selectedMolecules.length} {t('favorites.moleculesSelected')}
            </div>
            <button className="close-analysis-button" onClick={handleCloseAnalysis}>×</button>
          </div>
          
          <div className="analysis-content">
            {activeTab === 'radar' && (
              <RadarChart molecules={selectedMolecules} />
            )}
            {activeTab === 'esp' && (
              <ESPChart
                molecules={selectedMolecules}
                onNodeClick={handlePointClick}
              />
            )}
            {activeTab === 'mo' && (
              <MOChart
                molecules={selectedMolecules}
                onNodeClick={handlePointClick}
              />
            )}
          </div>
        </div>
      )}
      
      <NodePopup
        node={node}
        ref={nodePopupRef}
        molecularType="organic"
      />
    </div>
  );
};

export default FavoritesGrid; 