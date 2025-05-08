import React, { useState, useEffect } from 'react';
import API_URL from './Constants.js';
import './App.css';

const FavoritesGrid = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moleculeImages, setMoleculeImages] = useState({});

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
    <div className="favorites-grid-container">
      <h2>Your Favorite Molecules</h2>
      <div className="favorites-grid">
        {favorites.map(favorite => (
          <div 
            key={favorite.id} 
            className="favorite-card"
          >
            <div className="favorite-card-header">
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
                    <td className="property-value" style={{ textAlign: 'center' }}>
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
  );
};

export default FavoritesGrid; 